\set ON_ERROR_STOP on

create function test_support.widget_public_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select published.public_id
  from public.published_flows published
  where published.flow_id = 'f1000000-0000-4000-8000-000000000001';
$$;

create function test_support.widget_v2_public_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select published.public_id
  from public.published_flows published
  where published.flow_id = 'f1000000-0000-4000-8000-000000000005';
$$;

create function test_support.expire_widget_session(session_token text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  update public.widget_sessions
  set expires_at = now() - interval '1 minute'
  where token_hash = extensions.digest(session_token, 'sha256');
$$;

create function test_support.raw_widget_token_is_stored(session_token text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.widget_sessions
    where encode(token_hash, 'hex') = session_token
  );
$$;

revoke all on function test_support.widget_public_id() from public;
revoke all on function test_support.widget_v2_public_id() from public;
revoke all on function test_support.expire_widget_session(text) from public;
revoke all on function test_support.raw_widget_token_is_stored(text) from public;
grant usage on schema test_support to anon;
grant execute on function test_support.widget_public_id() to anon;
grant execute on function test_support.widget_v2_public_id() to anon;
grant execute on function test_support.expire_widget_session(text) to anon;
grant execute on function test_support.raw_widget_token_is_stored(text) to anon;

set role anon;

do $$
declare
  manifest jsonb;
begin
  manifest := public.get_widget_manifest(test_support.widget_public_id());

  if manifest ->> 'manifestVersion' <> '1'
    or jsonb_array_length(manifest -> 'steps') <> 3
    or manifest ? 'organizationId'
    or manifest ? 'snapshot'
  then
    raise exception 'public manifest is incomplete or leaks internal data: %', manifest;
  end if;
end;
$$;

do $$
declare
  manifest jsonb;
begin
  manifest := public.get_widget_manifest(test_support.widget_v2_public_id());

  if manifest ->> 'manifestVersion' <> '2'
    or jsonb_array_length(manifest -> 'steps') <> 5
    or manifest ? 'sections'
    or (manifest #> '{steps,0}') ? 'sectionKey'
    or manifest #>> '{steps,1,validation,kind}' <> 'text_length'
    or manifest #>> '{steps,2,validation,kind}' <> 'number_range'
    or manifest #>> '{steps,3,validation,kind}' <> 'date_range'
    or manifest #> '{steps,0,validation}' <> 'null'::jsonb
  then
    raise exception 'v2 manifest is incomplete or leaks editor metadata: %', manifest;
  end if;
end;
$$;

do $$
declare
  created jsonb;
  raw_token text;
  saved jsonb;
begin
  created := public.create_widget_session(test_support.widget_v2_public_id());
  raw_token := created ->> 'token';

  saved := public.save_widget_answer(
    raw_token,
    '92000000-0000-4000-8000-000000000001',
    0,
    'service',
    '"standard"'::jsonb,
    'details'
  );
  if (saved ->> 'currentStepKey') <> 'details' then
    raise exception 'v2 session did not follow the published route';
  end if;

  begin
    perform public.save_widget_answer(
      raw_token,
      '92000000-0000-4000-8000-000000000002',
      1,
      'details',
      '"Za krótko"'::jsonb,
      'budget'
    );
    raise exception 'text shorter than v2 constraint was accepted';
  exception
    when check_violation then
      null;
  end;

  perform public.save_widget_answer(
    raw_token,
    '92000000-0000-4000-8000-000000000003',
    1,
    'details',
    '"Wystarczająco długi opis"'::jsonb,
    'budget'
  );

  begin
    perform public.save_widget_answer(
      raw_token,
      '92000000-0000-4000-8000-000000000004',
      2,
      'budget',
      '999'::jsonb,
      'deadline'
    );
    raise exception 'number below v2 constraint was accepted';
  exception
    when check_violation then
      null;
  end;

  perform public.save_widget_answer(
    raw_token,
    '92000000-0000-4000-8000-000000000005',
    2,
    'budget',
    '1000'::jsonb,
    'deadline'
  );

  begin
    perform public.save_widget_answer(
      raw_token,
      '92000000-0000-4000-8000-000000000006',
      3,
      'deadline',
      '"2027-01-01"'::jsonb,
      'location'
    );
    raise exception 'date outside v2 constraint was accepted';
  exception
    when check_violation then
      null;
  end;

  perform public.save_widget_answer(
    raw_token,
    '92000000-0000-4000-8000-000000000007',
    3,
    'deadline',
    '"2026-07-29"'::jsonb,
    'location'
  );

  begin
    perform public.save_widget_answer(
      raw_token,
      '92000000-0000-4000-8000-000000000008',
      4,
      'location',
      '"A"'::jsonb,
      null
    );
    raise exception 'location shorter than v2 constraint was accepted';
  exception
    when check_violation then
      null;
  end;

  saved := public.save_widget_answer(
    raw_token,
    '92000000-0000-4000-8000-000000000009',
    4,
    'location',
    '"Gdańsk"'::jsonb,
    null
  );
  if (saved ->> 'currentStepKey') is not null
    or (saved ->> 'revision')::integer <> 5
  then
    raise exception 'valid v2 answers did not complete the session: %', saved;
  end if;
end;
$$;

do $$
declare
  created jsonb;
  manifest_public_id uuid;
  raw_token text;
  resumed jsonb;
  saved jsonb;
  retry_result jsonb;
begin
  manifest_public_id := test_support.widget_public_id();

  created := public.create_widget_session(manifest_public_id);
  raw_token := created ->> 'token';

  if raw_token !~ '^[a-f0-9]{64}$'
    or (created ->> 'revision')::integer <> 0
    or created #>> '{manifest,snapshotHash}' is null
  then
    raise exception 'session creation returned invalid metadata: %', created;
  end if;

  if test_support.raw_widget_token_is_stored(raw_token) then
    raise exception 'raw session token was stored in the database';
  end if;

  resumed := public.resume_widget_session(raw_token);
  if resumed -> 'answers' <> '{}'::jsonb
    or (resumed ->> 'revision')::integer <> 0
  then
    raise exception 'new session did not resume cleanly: %', resumed;
  end if;

  saved := public.save_widget_answer(
    raw_token,
    '90000000-0000-4000-8000-000000000001',
    0,
    'service',
    '"premium"'::jsonb,
    'details'
  );
  if (saved ->> 'revision')::integer <> 1 then
    raise exception 'answer did not increment session revision: %', saved;
  end if;

  retry_result := public.save_widget_answer(
    raw_token,
    '90000000-0000-4000-8000-000000000001',
    0,
    'service',
    '"premium"'::jsonb,
    'details'
  );
  if retry_result <> saved then
    raise exception 'idempotent retry changed its result';
  end if;

  begin
    perform public.save_widget_answer(
      raw_token,
      '90000000-0000-4000-8000-000000000002',
      0,
      'details',
      '"Opis"'::jsonb,
      'location'
    );
    raise exception 'stale session revision was accepted';
  exception
    when serialization_failure then
      null;
  end;

  begin
    perform public.save_widget_answer(
      raw_token,
      '90000000-0000-4000-8000-000000000004',
      1,
      'details',
      '"Opis"'::jsonb,
      null
    );
    raise exception 'client-selected route bypass was accepted';
  exception
    when check_violation then
      null;
  end;

  begin
    perform public.save_widget_answer(
      raw_token,
      '90000000-0000-4000-8000-000000000003',
      1,
      'service',
      '"not-an-option"'::jsonb,
      'details'
    );
    raise exception 'invalid choice answer was accepted';
  exception
    when check_violation then
      null;
  end;

  resumed := public.resume_widget_session(raw_token);
  if resumed #>> '{answers,service}' <> 'premium'
    or (resumed ->> 'revision')::integer <> 1
    or resumed ->> 'currentStepKey' <> 'details'
  then
    raise exception 'saved answer did not resume: %', resumed;
  end if;

  perform test_support.expire_widget_session(raw_token);
  begin
    perform public.resume_widget_session(raw_token);
    raise exception 'expired session was resumed';
  exception
    when invalid_parameter_value then
      null;
  end;

  begin
    perform public.resume_widget_session(repeat('0', 64));
    raise exception 'unknown token resumed a session';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

do $$
begin
  begin
    perform count(*) from public.widget_sessions;
    raise exception 'anon can read widget_sessions directly';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform count(*) from public.session_answers;
    raise exception 'anon can read session_answers directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;

insert into public.widget_sessions (
  organization_id,
  flow_id,
  flow_version_id,
  public_flow_id,
  token_hash,
  current_step_key
)
select
  published.organization_id,
  published.flow_id,
  published.flow_version_id,
  published.public_id,
  extensions.digest('rate-limit-test-' || series.value::text, 'sha256'),
  'rate_limit_test'
from public.published_flows published
cross join generate_series(1, 120) as series(value)
where published.public_id = test_support.widget_public_id();

set role anon;
do $$
begin
  begin
    perform public.create_widget_session(test_support.widget_public_id());
    raise exception 'session creation rate limit was bypassed';
  exception
    when program_limit_exceeded then
      null;
  end;
end;
$$;
reset role;

delete from public.widget_sessions
where current_step_key = 'rate_limit_test';

select 'widget session checks passed' as result;
