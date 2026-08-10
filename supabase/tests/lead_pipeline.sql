\set ON_ERROR_STOP on

create function test_support.attach_test_storage_object(
  target_file_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  file_record public.lead_files%rowtype;
begin
  select * into file_record
  from public.lead_files
  where id = target_file_id;
  if not found then
    raise exception 'test file not found';
  end if;
  insert into storage.objects (bucket_id, name, metadata)
  values (
    'tenant-private',
    file_record.object_path,
    jsonb_build_object(
      'size', file_record.size_bytes,
      'mimetype', file_record.mime_type
    )
  );
end;
$$;

revoke all on function test_support.attach_test_storage_object(uuid) from public;
grant execute on function test_support.attach_test_storage_object(uuid) to anon;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

update public.flows
set draft = draft || jsonb_build_object(
  'leadCapture',
  jsonb_build_object(
    'leadCaptureSchemaVersion', 1,
    'filesEnabled', true,
    'privacyNotice', jsonb_build_object(
      'label', 'Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.',
      'version', 'privacy-v1',
      'textHash', repeat('1', 64),
      'policyUrl', 'https://example.test/polityka-prywatnosci'
    ),
    'marketingEmailConsent', jsonb_build_object(
      'label', 'Chcę otrzymywać wiadomości marketingowe pocztą elektroniczną.',
      'version', 'marketing-v1',
      'textHash', repeat('2', 64)
    )
  )
)
where id = 'f1000000-0000-4000-8000-000000000001';

do $$
declare
  publication jsonb;
  revision integer;
begin
  select draft_revision into revision
  from public.flows
  where id = 'f1000000-0000-4000-8000-000000000001';
  publication := public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    revision
  );
  if publication ->> 'flowVersionId' is null then
    raise exception 'lead capture flow was not published: %', publication;
  end if;
end;
$$;

reset role;
set role anon;

do $$
declare
  created jsonb;
  file_id uuid;
  lead_response jsonb;
  raw_token text;
  retry_response jsonb;
  revision integer := 0;
  saved jsonb;
  submit_mutation constant uuid := '91000000-0000-4000-8000-000000000001';
begin
  created := public.create_widget_session(test_support.widget_public_id());
  raw_token := created ->> 'token';
  if created #>> '{manifest,leadCapture,privacyNotice,version}' <> 'privacy-v1'
    or created #>> '{manifest,leadCapture,filesEnabled}' <> 'true'
    or created #>> '{manifest,leadCapture,privacyNotice,textHash}' <> repeat('1', 64)
    or created #>> '{manifest,leadCapture,organizationId}' is not null
  then
    raise exception 'lead capture manifest is invalid or leaks tenant data: %', created;
  end if;

  saved := public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'service',
    '"premium"'::jsonb,
    'details'
  );
  revision := (saved ->> 'revision')::integer;
  saved := public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'details',
    '"Opis zakresu"'::jsonb,
    'location'
  );
  revision := (saved ->> 'revision')::integer;
  perform public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'location',
    '"Warszawa"'::jsonb,
    null
  );

  file_id := (
    public.reserve_widget_file(
      raw_token,
      'projekt.pdf',
      'application/pdf',
      1200,
      repeat('3', 64),
      'pdf'
    ) ->> 'fileId'
  )::uuid;
  perform test_support.attach_test_storage_object(file_id);
  perform public.complete_widget_file(raw_token, file_id);

  begin
    perform public.submit_widget_lead(
      raw_token,
      submit_mutation,
      '{"email":"klient@example.test"}',
      jsonb_build_object(
        'accepted', true,
        'version', 'privacy-v1',
        'textHash', repeat('1', 64)
      ),
      null,
      array[]::uuid[]
    );
    raise exception 'submit omitted a verified session file';
  exception
    when check_violation then
      null;
  end;

  begin
    perform public.submit_widget_lead(
      raw_token,
      submit_mutation,
      '{"email":"klient@example.test"}',
      jsonb_build_object(
        'accepted', true,
        'version', 'privacy-v1',
        'textHash', repeat('1', 64)
      ),
      jsonb_build_object(
        'accepted', 'yes',
        'version', 'marketing-v1',
        'textHash', repeat('2', 64)
      ),
      array[file_id]
    );
    raise exception 'submit accepted malformed marketing consent';
  exception
    when check_violation then
      null;
  end;

  lead_response := public.submit_widget_lead(
    raw_token,
    submit_mutation,
    '{"email":"KLIENT@EXAMPLE.TEST","name":"Jan Kowalski","phone":"+48 500 600 700"}',
    jsonb_build_object(
      'accepted', true,
      'version', 'privacy-v1',
      'textHash', repeat('1', 64)
    ),
    jsonb_build_object(
      'accepted', true,
      'version', 'marketing-v1',
      'textHash', repeat('2', 64)
    ),
    array[file_id]
  );
  if lead_response ->> 'leadPublicId' is null
    or lead_response ? 'contactEmail'
    or lead_response ? 'score'
  then
    raise exception 'public submit response is invalid or leaks PII: %', lead_response;
  end if;

  retry_response := public.submit_widget_lead(
    raw_token,
    submit_mutation,
    '{"email":"KLIENT@EXAMPLE.TEST","name":"Jan Kowalski","phone":"+48 500 600 700"}',
    jsonb_build_object(
      'accepted', true,
      'version', 'privacy-v1',
      'textHash', repeat('1', 64)
    ),
    null,
    array[file_id]
  );
  if retry_response <> lead_response then
    raise exception 'idempotent submit returned a different response';
  end if;

  retry_response := public.submit_widget_lead(
    raw_token,
    gen_random_uuid(),
    '{"email":"attacker@example.test"}',
    jsonb_build_object(
      'accepted', true,
      'version', 'privacy-v1',
      'textHash', repeat('1', 64)
    ),
    null,
    array[]::uuid[]
  );
  if retry_response <> lead_response then
    raise exception 'session-level idempotency returned a different lead';
  end if;

  begin
    perform public.save_widget_answer(
      raw_token,
      gen_random_uuid(),
      3,
      'location',
      '"Kraków"'::jsonb,
      null
    );
    raise exception 'submitted session answer was changed';
  exception
    when check_violation then
      null;
  end;

  begin
    perform count(*) from public.leads;
    raise exception 'anon can read leads directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
declare
  lead_record public.leads%rowtype;
begin
  select * into lead_record
  from public.leads
  where contact_email = 'klient@example.test';
  if not found
    or lead_record.score <> 100
    or lead_record.price_min_minor <> 15000
    or lead_record.price_max_minor <> 21900
    or lead_record.score_category_key <> 'hot'
  then
    raise exception 'server did not persist recalculated result: %', row_to_json(lead_record);
  end if;

  perform public.change_lead_status(
    'aaaaaaaa-0000-4000-8000-000000000001',
    lead_record.id,
    'qualified'
  );
  insert into public.lead_notes (
    organization_id,
    lead_id,
    body,
    created_by
  )
  values (
    lead_record.organization_id,
    lead_record.id,
    'Klient potwierdził termin rozmowy.',
    '10000000-0000-4000-8000-000000000003'
  );
  if (
    select count(*) from public.lead_status_history
    where lead_id = lead_record.id
  ) <> 2
    or (
      select count(*) from public.consent_records
      where lead_id = lead_record.id
    ) <> 2
    or (
      select count(*) from public.lead_files
      where lead_id = lead_record.id and status = 'verified'
    ) <> 1
  then
    raise exception 'lead history, consents or files are incomplete';
  end if;

  begin
    update public.leads set status = 'won' where id = lead_record.id;
    raise exception 'direct status update bypassed history';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.leads) <> 0 then
    raise exception 'tenant B can read tenant A leads';
  end if;
  begin
    perform public.change_lead_status(
      'aaaaaaaa-0000-4000-8000-000000000001',
      (
        select id from public.leads
        where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
        limit 1
      ),
      'won'
    );
    raise exception 'tenant B changed tenant A lead';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);

do $$
begin
  if (select count(*) from public.leads) <> 0 then
    raise exception 'suspended member can read leads';
  end if;
end;
$$;

reset role;
select 'lead pipeline checks passed' as result;
