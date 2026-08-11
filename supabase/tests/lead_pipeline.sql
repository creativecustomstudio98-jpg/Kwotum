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
grant execute on function test_support.attach_test_storage_object(uuid) to anon, service_role;

do $$
declare
  display_snapshot constant jsonb := '{
    "steps": [
      {
        "key": "service",
        "type": "single_choice",
        "options": [
          {"key": "standard", "label": "Wariant standardowy"},
          {"key": "premium", "label": "Wariant premium"}
        ]
      },
      {
        "key": "features",
        "type": "multiple_choice",
        "options": [
          {"key": "durability", "label": "Trwałość"},
          {"key": "capacity", "label": "Duża ładowność"}
        ]
      },
      {
        "key": "financing",
        "type": "single_choice",
        "options": [
          {"key": "cash", "label": "Gotówka"},
          {"key": "leasing", "label": "Leasing"}
        ]
      }
    ]
  }'::jsonb;
begin
  if app_private.resolve_lead_answer_display(
    display_snapshot,
    'service',
    '"premium"'::jsonb
  ) <> '"Wariant premium"'::jsonb then
    raise exception 'single-choice display answer was not resolved';
  end if;
  if app_private.resolve_lead_answer_display(
    display_snapshot,
    'features',
    '["capacity", "durability"]'::jsonb
  ) <> '["Duża ładowność", "Trwałość"]'::jsonb then
    raise exception 'multiple-choice display answers lost labels or order';
  end if;
  if app_private.resolve_lead_answer_display(
    display_snapshot,
    'financing',
    '"__unknown__"'::jsonb
  ) <> '"Do ustalenia"'::jsonb then
    raise exception 'unknown answer was not rendered safely';
  end if;
end;
$$;

do $$
begin
  if has_function_privilege(
    'anon',
    'app_private.resolve_lead_answer_display(jsonb,text,jsonb)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'app_private.resolve_lead_answer_display(jsonb,text,jsonb)',
    'EXECUTE'
  ) or has_function_privilege(
    'service_role',
    'app_private.resolve_lead_answer_display(jsonb,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'private display-answer resolver has an excessive grant';
  end if;
end;
$$;

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
set role service_role;

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
  if (
    select answer.answer
    from public.lead_answers answer
    where answer.lead_id = lead_record.id
      and answer.step_key = 'service'
  ) <> '"premium"'::jsonb
    or (
      select answer.display_answer
      from public.lead_answers answer
      where answer.lead_id = lead_record.id
        and answer.step_key = 'service'
    ) <> '"Wariant premium"'::jsonb
  then
    raise exception 'lead answer did not retain its raw key and immutable label';
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
  begin
    update public.lead_answers
    set display_answer = '"Sfałszowana etykieta"'::jsonb
    where lead_id = lead_record.id;
    raise exception 'member overwrote immutable display answers';
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
  if (select count(*) from public.lead_answers) <> 0 then
    raise exception 'tenant B can read tenant A answer labels';
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
  if (select count(*) from public.lead_answers) <> 0 then
    raise exception 'suspended member can read lead answer labels';
  end if;
end;
$$;

reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

update public.flows
set draft = draft || jsonb_build_object(
  'leadCapture',
  jsonb_build_object(
    'leadCaptureSchemaVersion', 2,
    'contactPolicy', 'phone_required',
    'filesEnabled', false,
    'privacyNotice', jsonb_build_object(
      'label', 'Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.',
      'version', 'privacy-phone-v1',
      'textHash', repeat('4', 64),
      'policyUrl', 'https://example.test/polityka-prywatnosci'
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
    raise exception 'phone-first flow was not published: %', publication;
  end if;
end;
$$;

reset role;
set role service_role;

do $$
declare
  created jsonb;
  raw_token text;
  revision integer := 0;
  saved jsonb;
  submitted jsonb;
begin
  created := public.create_widget_session(test_support.widget_public_id());
  raw_token := created ->> 'token';
  if created #>> '{manifest,leadCapture,leadCaptureSchemaVersion}' <> '2'
    or created #>> '{manifest,leadCapture,contactPolicy}' <> 'phone_required'
  then
    raise exception 'phone-first manifest is invalid: %', created;
  end if;

  saved := public.save_widget_answer(
    raw_token, gen_random_uuid(), revision, 'service', '"premium"'::jsonb, 'details'
  );
  revision := (saved ->> 'revision')::integer;
  saved := public.save_widget_answer(
    raw_token, gen_random_uuid(), revision, 'details', '"Opis zakresu"'::jsonb, 'location'
  );
  revision := (saved ->> 'revision')::integer;
  perform public.save_widget_answer(
    raw_token, gen_random_uuid(), revision, 'location', '"Warszawa"'::jsonb, null
  );

  begin
    perform public.submit_widget_lead(
      raw_token,
      gen_random_uuid(),
      '{"email":"only-email@example.test"}',
      jsonb_build_object(
        'accepted', true,
        'version', 'privacy-phone-v1',
        'textHash', repeat('4', 64)
      ),
      null,
      array[]::uuid[]
    );
    raise exception 'phone-first process accepted a lead without phone';
  exception
    when check_violation then
      null;
  end;

  begin
    perform public.submit_widget_lead(
      raw_token,
      gen_random_uuid(),
      '{"phone":"+48 500 600 700"}',
      jsonb_build_object(
        'accepted', true,
        'version', 'privacy-phone-v1',
        'textHash', repeat('4', 64)
      ),
      jsonb_build_object(
        'accepted', true,
        'version', 'marketing-v1',
        'textHash', repeat('2', 64)
      ),
      array[]::uuid[]
    );
    raise exception 'phone-only lead accepted e-mail marketing consent';
  exception
    when check_violation then
      null;
  end;

  submitted := public.submit_widget_lead(
    raw_token,
    '91000000-0000-4000-8000-000000000002',
    '{"name":"Klient Telefoniczny","phone":"+48 500 600 700"}',
    jsonb_build_object(
      'accepted', true,
      'version', 'privacy-phone-v1',
      'textHash', repeat('4', 64)
    ),
    null,
    array[]::uuid[]
  );
  if submitted ->> 'leadPublicId' is null then
    raise exception 'phone-only lead was not submitted';
  end if;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (
    select count(*)
    from public.leads
    where contact_email is null
      and contact_phone = '+48 500 600 700'
  ) <> 1 then
    raise exception 'phone-only lead was not persisted safely';
  end if;
  if (
    select count(*)
    from public.notifications notification
    join public.leads lead on lead.id = notification.lead_id
    where lead.contact_email is null
      and notification.kind = 'lead_customer_confirmation'
  ) <> 0 then
    raise exception 'phone-only lead enqueued a customer e-mail confirmation';
  end if;
end;
$$;

reset role;
select 'lead pipeline checks passed' as result;
