\set ON_ERROR_STOP on

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  manifest jsonb;
begin
  perform public.set_public_flow_origins(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000001',
    array['https://formularz.example.test', 'https://www.example.test']
  );

  if (
    select count(*)
    from public.public_flow_origins
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
      and flow_id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 2 then
    raise exception 'Owner did not configure exact public origins';
  end if;

  manifest := public.get_flow_installation_manifest(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000001'
  );
  if manifest ->> 'manifestVersion' is null then
    raise exception 'Privileged installation manifest is unavailable';
  end if;

  begin
    perform public.set_public_flow_origins(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'f1000000-0000-4000-8000-000000000001',
      array['https://www.example.test/path']
    );
    raise exception 'Origin with a path was accepted';
  exception
    when check_violation then
      null;
  end;

  begin
    perform public.get_widget_manifest(test_support.widget_public_id());
    raise exception 'Authenticated caller bypassed the public request guard';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);
do $$
begin
  if (select count(*) from public.public_flow_origins) <> 0 then
    raise exception 'Sales can read privileged origin configuration';
  end if;
  begin
    perform public.set_public_flow_origins(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'f1000000-0000-4000-8000-000000000001',
      array['https://attacker.example.test']
    );
    raise exception 'Sales changed public origins';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
set role anon;

do $$
begin
  begin
    perform count(*) from public.public_flow_origins;
    raise exception 'Anon can read public origin configuration';
  exception
    when insufficient_privilege then
      null;
  end;
  begin
    perform public.create_widget_session(test_support.widget_public_id());
    raise exception 'Anon bypassed the server-side public API boundary';
  exception
    when insufficient_privilege then
      null;
  end;
  begin
    perform public.enforce_public_request_guard(
      'manifest', repeat('a', 64), 'https://www.example.test',
      'http://localhost:3000', test_support.widget_public_id(), null
    );
    raise exception 'Anon can consume the server-only request guard';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role service_role;

do $$
declare
  guard_result jsonb;
  attempt integer;
begin
  guard_result := public.enforce_public_request_guard(
    'manifest', repeat('1', 64), 'https://www.example.test',
    'http://localhost:3000', test_support.widget_public_id(), null
  );
  if guard_result ->> 'allowed' <> 'true' then
    raise exception 'Configured exact origin was rejected: %', guard_result;
  end if;

  guard_result := public.enforce_public_request_guard(
    'manifest', repeat('1', 64), 'https://blocked.example.test',
    'http://localhost:3000', test_support.widget_public_id(), null
  );
  if guard_result ->> 'reason' <> 'origin' then
    raise exception 'Unconfigured origin was not rejected: %', guard_result;
  end if;

  guard_result := public.enforce_public_request_guard(
    'manifest', repeat('1', 64), 'http://localhost:3000',
    'http://localhost:3000', test_support.widget_public_id(), null
  );
  if guard_result ->> 'allowed' <> 'true' then
    raise exception 'Hosted application origin was rejected: %', guard_result;
  end if;

  guard_result := public.enforce_public_request_guard(
    'preflight', repeat('1', 64), 'https://formularz.example.test',
    'http://localhost:3000', null, null
  );
  if guard_result ->> 'allowed' <> 'true' then
    raise exception 'Configured preflight origin was rejected: %', guard_result;
  end if;

  for attempt in 1..21 loop
    guard_result := public.enforce_public_request_guard(
      'session_create', repeat('2', 64), 'https://www.example.test',
      'http://localhost:3000', test_support.widget_public_id(), null
    );
  end loop;
  if guard_result ->> 'reason' <> 'rate'
    or (guard_result ->> 'retryAfter')::integer < 1
  then
    raise exception 'Distributed IP limit was not enforced: %', guard_result;
  end if;

  guard_result := public.enforce_public_request_guard(
    'session_create', repeat('3', 64), 'https://www.example.test',
    'http://localhost:3000', test_support.widget_public_id(), null
  );
  if guard_result ->> 'allowed' <> 'true' then
    raise exception 'Independent client fingerprint shared another IP budget: %', guard_result;
  end if;
end;
$$;

reset role;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'app_private'
      and table_name = 'public_request_buckets'
      and column_name in ('ip', 'origin', 'bucket_material', 'session_token')
  ) then
    raise exception 'Rate limit table stores raw request identifiers';
  end if;
  if (
    select count(*)
    from public.audit_logs
    where action = 'flow.public_origins_updated'
      and organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'Origin configuration audit event is missing';
  end if;
end;
$$;

select 'public request guard checks passed' as result;
