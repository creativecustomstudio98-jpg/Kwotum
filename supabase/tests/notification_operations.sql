\set ON_ERROR_STOP on

set role anon;

do $$
begin
  begin
    perform * from public.get_notification_delivery_health();
    raise exception 'anon can read notification operations health';
  exception
    when insufficient_privilege then
      null;
  end;
  begin
    perform public.start_notification_worker_run(gen_random_uuid(), 'cron');
    raise exception 'anon can write notification worker heartbeat';
  exception
    when insufficient_privilege then
      null;
  end;
  begin
    perform count(*) from app_private.worker_heartbeats;
    raise exception 'anon can read private worker heartbeat state';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;

do $$
begin
  begin
    perform * from public.get_notification_delivery_health();
    raise exception 'authenticated user can read notification operations health';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role service_role;

select public.start_notification_worker_run(
  '93000000-0000-4000-8000-000000000001',
  'cron'
);

do $$
declare
  health record;
begin
  select * into health from public.get_notification_delivery_health();
  if health.last_cron_started_at is null
    or health.last_cron_succeeded_at is not null
    or health.last_cron_outcome <> 'running'
    or health.cron_age_seconds not between 0 and 5
  then
    raise exception 'cron heartbeat start was not reported safely';
  end if;
end;
$$;

do $$
begin
  if not public.finish_notification_worker_run(
    '93000000-0000-4000-8000-000000000001',
    'cron',
    true,
    3,
    2,
    1,
    0
  ) then
    raise exception 'cron heartbeat finish did not match active run';
  end if;

  if public.finish_notification_worker_run(
    '93000000-0000-4000-8000-000000000002',
    'cron',
    false,
    null,
    null,
    null,
    null
  ) then
    raise exception 'unknown heartbeat run was accepted';
  end if;
end;
$$;

do $$
declare
  health record;
begin
  select * into health from public.get_notification_delivery_health();
  if health.last_cron_succeeded_at is null
    or health.last_cron_outcome <> 'succeeded'
    or health.notification_waiting is null
    or health.notification_processing is null
    or health.notification_stale_processing is null
    or health.notification_failed is null
    or health.invitation_waiting is null
    or health.invitation_processing is null
    or health.invitation_stale_processing is null
    or health.invitation_failed is null
  then
    raise exception 'delivery health probe omitted aggregate metrics';
  end if;
end;
$$;

reset role;

do $$
begin
  if has_function_privilege('anon', 'public.get_notification_delivery_health()', 'execute')
    or has_function_privilege(
      'authenticated',
      'public.get_notification_delivery_health()',
      'execute'
    )
    or not has_function_privilege(
      'service_role',
      'public.get_notification_delivery_health()',
      'execute'
    )
  then
    raise exception 'notification operations grants are invalid';
  end if;
end;
$$;

select 'notification operations checks passed' as result;
