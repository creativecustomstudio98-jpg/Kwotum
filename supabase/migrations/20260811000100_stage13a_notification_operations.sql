create table app_private.worker_heartbeats (
  worker_name text not null check (worker_name = 'notifications'),
  source text not null check (source in ('cron', 'manual')),
  run_id uuid not null,
  last_started_at timestamptz not null,
  last_finished_at timestamptz,
  last_succeeded_at timestamptz,
  last_failed_at timestamptz,
  last_outcome text not null check (last_outcome in ('running', 'succeeded', 'failed')),
  last_claimed integer check (last_claimed is null or last_claimed between 0 and 50),
  last_sent integer check (last_sent is null or last_sent between 0 and 50),
  last_retrying integer check (last_retrying is null or last_retrying between 0 and 50),
  last_failed integer check (last_failed is null or last_failed between 0 and 50),
  primary key (worker_name, source),
  constraint worker_heartbeat_result_consistent check (
    (
      last_outcome = 'running'
      and last_finished_at is null
      and last_claimed is null
      and last_sent is null
      and last_retrying is null
      and last_failed is null
    )
    or (
      last_outcome = 'succeeded'
      and last_finished_at is not null
      and last_succeeded_at = last_finished_at
      and last_claimed is not null
      and last_sent is not null
      and last_retrying is not null
      and last_failed is not null
      and last_claimed = last_sent + last_retrying + last_failed
    )
    or (
      last_outcome = 'failed'
      and last_finished_at is not null
      and last_failed_at = last_finished_at
      and last_claimed is null
      and last_sent is null
      and last_retrying is null
      and last_failed is null
    )
  )
);

revoke all on table app_private.worker_heartbeats from public, anon, authenticated;

create function public.start_notification_worker_run(
  target_run_id uuid,
  target_source text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if target_run_id is null or target_source not in ('cron', 'manual') then
    raise exception 'notification worker heartbeat is not authorized'
      using errcode = 'insufficient_privilege';
  end if;

  insert into app_private.worker_heartbeats (
    worker_name,
    source,
    run_id,
    last_started_at,
    last_outcome
  ) values (
    'notifications',
    target_source,
    target_run_id,
    now(),
    'running'
  )
  on conflict (worker_name, source) do update
  set
    run_id = excluded.run_id,
    last_started_at = excluded.last_started_at,
    last_finished_at = null,
    last_outcome = 'running',
    last_claimed = null,
    last_sent = null,
    last_retrying = null,
    last_failed = null;
end;
$$;

create function public.finish_notification_worker_run(
  target_run_id uuid,
  target_source text,
  target_succeeded boolean,
  target_claimed integer,
  target_sent integer,
  target_retrying integer,
  target_failed integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  finished_at timestamptz := now();
begin
  if target_run_id is null
    or target_source not in ('cron', 'manual')
    or target_succeeded is null
    or (
      target_succeeded
      and (
        target_claimed is null
        or target_sent is null
        or target_retrying is null
        or target_failed is null
        or target_claimed not between 0 and 50
        or target_sent not between 0 and 50
        or target_retrying not between 0 and 50
        or target_failed not between 0 and 50
        or target_claimed <> target_sent + target_retrying + target_failed
      )
    )
    or (
      not target_succeeded
      and (
        target_claimed is not null
        or target_sent is not null
        or target_retrying is not null
        or target_failed is not null
      )
    )
  then
    raise exception 'notification worker heartbeat is not authorized'
      using errcode = 'insufficient_privilege';
  end if;

  update app_private.worker_heartbeats heartbeat
  set
    last_finished_at = finished_at,
    last_succeeded_at = case
      when target_succeeded then finished_at
      else heartbeat.last_succeeded_at
    end,
    last_failed_at = case
      when target_succeeded then heartbeat.last_failed_at
      else finished_at
    end,
    last_outcome = case when target_succeeded then 'succeeded' else 'failed' end,
    last_claimed = target_claimed,
    last_sent = target_sent,
    last_retrying = target_retrying,
    last_failed = target_failed
  where heartbeat.worker_name = 'notifications'
    and heartbeat.source = target_source
    and heartbeat.run_id = target_run_id;

  return found;
end;
$$;

create function public.get_notification_delivery_health()
returns table (
  observed_at timestamptz,
  last_cron_started_at timestamptz,
  last_cron_succeeded_at timestamptz,
  last_cron_failed_at timestamptz,
  last_cron_outcome text,
  cron_age_seconds bigint,
  notification_waiting bigint,
  notification_processing bigint,
  notification_stale_processing bigint,
  notification_failed bigint,
  notification_oldest_waiting_age_seconds bigint,
  invitation_waiting bigint,
  invitation_processing bigint,
  invitation_stale_processing bigint,
  invitation_failed bigint,
  invitation_oldest_waiting_age_seconds bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with heartbeat as (
    select
      worker.last_started_at,
      worker.last_succeeded_at,
      worker.last_failed_at,
      worker.last_outcome
    from app_private.worker_heartbeats worker
    where worker.worker_name = 'notifications'
      and worker.source = 'cron'
  ),
  notification_queue as (
    select
      count(*) filter (where status in ('pending', 'retry')) as waiting,
      count(*) filter (where status = 'processing') as processing,
      count(*) filter (
        where status = 'processing'
          and locked_at < now() - interval '15 minutes'
      ) as stale_processing,
      count(*) filter (where status = 'failed') as failed,
      floor(extract(epoch from now() - min(created_at) filter (
        where status in ('pending', 'retry')
      )))::bigint as oldest_waiting_age_seconds
    from public.notifications
  ),
  invitation_queue as (
    select
      count(*) filter (where status in ('pending', 'retry')) as waiting,
      count(*) filter (where status = 'processing') as processing,
      count(*) filter (
        where status = 'processing'
          and locked_at < now() - interval '15 minutes'
      ) as stale_processing,
      count(*) filter (where status = 'failed') as failed,
      floor(extract(epoch from now() - min(created_at) filter (
        where status in ('pending', 'retry')
      )))::bigint as oldest_waiting_age_seconds
    from public.flow_invitations
  )
  select
    now(),
    heartbeat.last_started_at,
    heartbeat.last_succeeded_at,
    heartbeat.last_failed_at,
    heartbeat.last_outcome,
    floor(extract(epoch from now() - heartbeat.last_started_at))::bigint,
    notification_queue.waiting,
    notification_queue.processing,
    notification_queue.stale_processing,
    notification_queue.failed,
    notification_queue.oldest_waiting_age_seconds,
    invitation_queue.waiting,
    invitation_queue.processing,
    invitation_queue.stale_processing,
    invitation_queue.failed,
    invitation_queue.oldest_waiting_age_seconds
  from notification_queue
  cross join invitation_queue
  left join heartbeat on true;
$$;

revoke all on function public.start_notification_worker_run(uuid, text)
  from public, anon, authenticated;
revoke all on function public.finish_notification_worker_run(
  uuid, text, boolean, integer, integer, integer, integer
) from public, anon, authenticated;
revoke all on function public.get_notification_delivery_health()
  from public, anon, authenticated;

grant execute on function public.start_notification_worker_run(uuid, text)
  to service_role;
grant execute on function public.finish_notification_worker_run(
  uuid, text, boolean, integer, integer, integer, integer
) to service_role;
grant execute on function public.get_notification_delivery_health()
  to service_role;
