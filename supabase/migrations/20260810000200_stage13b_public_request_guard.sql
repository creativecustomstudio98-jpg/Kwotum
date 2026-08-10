create function app_private.normalize_public_origin(candidate text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized text := lower(trim(candidate));
  port_match text[];
begin
  if normalized is null
    or char_length(normalized) not between 8 and 255
    or normalized like '%..%'
    or (
      normalized !~ '^https://[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$'
      and normalized !~ '^http://(?:localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$'
    )
  then
    return null;
  end if;

  port_match := regexp_match(normalized, ':([0-9]{1,5})$');
  if port_match is not null
    and (port_match[1]::integer < 1 or port_match[1]::integer > 65535)
  then
    return null;
  end if;
  return normalized;
exception
  when others then
    return null;
end;
$$;

create table public.public_flow_origins (
  organization_id uuid not null,
  flow_id uuid not null,
  origin text not null check (
    origin = app_private.normalize_public_origin(origin)
  ),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (flow_id, origin),
  foreign key (organization_id, flow_id)
    references public.flows (organization_id, id)
    on delete cascade
);

create index public_flow_origins_origin_idx
  on public.public_flow_origins (origin, flow_id);

alter table public.public_flow_origins enable row level security;
alter table public.public_flow_origins force row level security;

create policy public_flow_origins_select_privileged
on public.public_flow_origins for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

revoke all on table public.public_flow_origins from public, anon, authenticated;
grant select on table public.public_flow_origins to authenticated;

create function public.set_public_flow_origins(
  target_organization_id uuid,
  target_flow_id uuid,
  target_origins text[]
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  candidate text;
  normalized_origin text;
  normalized_origins text[] := array[]::text[];
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  perform 1
  from public.flows flow
  where flow.id = target_flow_id
    and flow.organization_id = target_organization_id
  for update;
  if not found then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  if target_origins is null or cardinality(target_origins) > 10 then
    raise exception 'invalid public origins' using errcode = 'check_violation';
  end if;

  foreach candidate in array target_origins loop
    normalized_origin := app_private.normalize_public_origin(candidate);
    if normalized_origin is null or normalized_origin <> candidate then
      raise exception 'invalid public origin' using errcode = 'check_violation';
    end if;
    if not normalized_origin = any(normalized_origins) then
      normalized_origins := array_append(normalized_origins, normalized_origin);
    end if;
  end loop;

  delete from public.public_flow_origins
  where organization_id = target_organization_id
    and flow_id = target_flow_id;

  insert into public.public_flow_origins (
    organization_id,
    flow_id,
    origin,
    created_by
  )
  select
    target_organization_id,
    target_flow_id,
    configured_origin,
    auth.uid()
  from unnest(normalized_origins) configured_origin;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    target_organization_id,
    auth.uid(),
    'flow.public_origins_updated',
    'public_flow_origins',
    target_flow_id,
    jsonb_build_object('origin_count', cardinality(normalized_origins))
  );
end;
$$;

revoke all on function public.set_public_flow_origins(uuid, uuid, text[])
  from public, anon, authenticated;
grant execute on function public.set_public_flow_origins(uuid, uuid, text[])
  to authenticated;

create function public.get_flow_installation_manifest(
  target_organization_id uuid,
  target_flow_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  flow_public_id uuid;
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;
  select published.public_id
  into flow_public_id
  from public.published_flows published
  where published.organization_id = target_organization_id
    and published.flow_id = target_flow_id;
  if flow_public_id is null then
    return null;
  end if;
  return public.get_widget_manifest(flow_public_id);
end;
$$;

revoke all on function public.get_flow_installation_manifest(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.get_flow_installation_manifest(uuid, uuid)
  to authenticated;

create table app_private.public_request_buckets (
  bucket_hash bytea not null,
  window_started_at timestamptz not null,
  expires_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (bucket_hash, window_started_at)
);

create index public_request_buckets_expiry_idx
  on app_private.public_request_buckets (expires_at);

revoke all on table app_private.public_request_buckets
  from public, anon, authenticated;

create function app_private.consume_public_request_bucket(
  bucket_material text,
  request_limit integer,
  window_seconds integer
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_count integer;
  request_time timestamptz := clock_timestamp();
  window_start timestamptz;
  retry_after integer;
begin
  if request_limit < 1
    or window_seconds < 1
    or char_length(bucket_material) not between 1 and 1000
  then
    raise exception 'invalid rate limit bucket' using errcode = 'check_violation';
  end if;
  window_start := to_timestamp(
    floor(extract(epoch from request_time) / window_seconds) * window_seconds
  );

  with expired as (
    select bucket_hash, window_started_at
    from app_private.public_request_buckets
    where expires_at < request_time
    order by expires_at
    limit 100
  )
  delete from app_private.public_request_buckets bucket
  using expired
  where bucket.bucket_hash = expired.bucket_hash
    and bucket.window_started_at = expired.window_started_at;

  insert into app_private.public_request_buckets (
    bucket_hash,
    window_started_at,
    expires_at,
    request_count
  )
  values (
    extensions.digest(bucket_material, 'sha256'),
    window_start,
    window_start + make_interval(secs => window_seconds * 2),
    1
  )
  on conflict (bucket_hash, window_started_at) do update
  set request_count = app_private.public_request_buckets.request_count + 1
  returning request_count into current_count;

  retry_after := greatest(
    1,
    ceil(extract(epoch from window_start + make_interval(secs => window_seconds) - request_time))::integer
  );
  return jsonb_build_object(
    'allowed', current_count <= request_limit,
    'limit', request_limit,
    'remaining', greatest(0, request_limit - current_count),
    'retryAfter', retry_after
  );
end;
$$;

revoke all on function app_private.consume_public_request_bucket(text, integer, integer)
  from public, anon, authenticated;

create function public.enforce_public_request_guard(
  request_action text,
  client_fingerprint text,
  request_origin text,
  application_origin text,
  target_public_id uuid default null,
  session_token text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  bucket_result jsonb;
  flow_record record;
  normalized_app_origin text := app_private.normalize_public_origin(application_origin);
  normalized_request_origin text;
  window_seconds integer;
  ip_limit integer;
  origin_limit integer;
  flow_limit integer;
  session_limit integer;
  organization_limit integer;
  session_fingerprint text;
begin
  if request_action not in (
    'preflight',
    'manifest',
    'session_create',
    'session_read',
    'answer',
    'result',
    'submit',
    'event',
    'consent',
    'file'
  ) or client_fingerprint !~ '^[a-f0-9]{64}$'
    or normalized_app_origin is null
    or normalized_app_origin <> application_origin
  then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_request');
  end if;

  if request_origin is not null then
    normalized_request_origin := app_private.normalize_public_origin(request_origin);
    if normalized_request_origin is null or normalized_request_origin <> request_origin then
      return jsonb_build_object('allowed', false, 'reason', 'origin');
    end if;
  end if;

  select seconds, ip, origin, flow, session, organization
  into window_seconds, ip_limit, origin_limit, flow_limit, session_limit, organization_limit
  from (
    values
      ('preflight', 60, 120, 300, 600, 0, 1200),
      ('manifest', 60, 120, 240, 600, 0, 1200),
      ('session_create', 60, 20, 60, 120, 0, 300),
      ('session_read', 60, 120, 180, 600, 120, 1200),
      ('answer', 60, 120, 180, 600, 120, 1200),
      ('result', 60, 60, 120, 300, 60, 600),
      ('submit', 600, 12, 30, 120, 6, 240),
      ('event', 60, 300, 600, 1200, 300, 3000),
      ('consent', 60, 30, 60, 240, 30, 600),
      ('file', 600, 10, 30, 100, 10, 200)
  ) limits(action_name, seconds, ip, origin, flow, session, organization)
  where action_name = request_action;

  bucket_result := app_private.consume_public_request_bucket(
    request_action || ':ip:' || client_fingerprint,
    ip_limit,
    window_seconds
  );
  if not (bucket_result ->> 'allowed')::boolean then
    return bucket_result || jsonb_build_object('reason', 'rate');
  end if;

  select
    null::uuid as organization_id,
    null::uuid as flow_id,
    null::uuid as public_id,
    null::bytea as token_hash
  into flow_record;

  if target_public_id is not null then
    select
      published.organization_id,
      published.flow_id,
      published.public_id,
      null::bytea as token_hash
    into flow_record
    from public.published_flows published
    where published.public_id = target_public_id;
  elsif session_token is not null and session_token ~ '^[a-f0-9]{64}$' then
    select
      session.organization_id,
      session.flow_id,
      session.public_flow_id as public_id,
      session.token_hash
    into flow_record
    from public.widget_sessions session
    where session.token_hash = extensions.digest(session_token, 'sha256');
  elsif request_action <> 'preflight' then
    return jsonb_build_object('allowed', false, 'reason', 'resource');
  end if;

  if request_action <> 'preflight' and flow_record.flow_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'resource');
  end if;

  if normalized_request_origin is not null
    and normalized_request_origin <> normalized_app_origin
    and not (
      (flow_record.flow_id is not null and exists (
        select 1
        from public.public_flow_origins configured
        where configured.organization_id = flow_record.organization_id
          and configured.flow_id = flow_record.flow_id
          and configured.origin = normalized_request_origin
      ))
      or (request_action = 'preflight' and flow_record.flow_id is null and exists (
        select 1
        from public.public_flow_origins configured
        join public.published_flows published
          on published.organization_id = configured.organization_id
          and published.flow_id = configured.flow_id
        where configured.origin = normalized_request_origin
      ))
    )
  then
    return jsonb_build_object('allowed', false, 'reason', 'origin');
  end if;

  if normalized_request_origin is not null and origin_limit > 0 then
    bucket_result := app_private.consume_public_request_bucket(
      request_action || ':origin:' || normalized_request_origin,
      origin_limit,
      window_seconds
    );
    if not (bucket_result ->> 'allowed')::boolean then
      return bucket_result || jsonb_build_object('reason', 'rate');
    end if;
  end if;

  if flow_record.flow_id is not null and flow_limit > 0 then
    bucket_result := app_private.consume_public_request_bucket(
      request_action || ':flow:' || flow_record.flow_id::text,
      flow_limit,
      window_seconds
    );
    if not (bucket_result ->> 'allowed')::boolean then
      return bucket_result || jsonb_build_object('reason', 'rate');
    end if;
  end if;

  if flow_record.token_hash is not null and session_limit > 0 then
    session_fingerprint := encode(flow_record.token_hash, 'hex');
    bucket_result := app_private.consume_public_request_bucket(
      request_action || ':session:' || session_fingerprint,
      session_limit,
      window_seconds
    );
    if not (bucket_result ->> 'allowed')::boolean then
      return bucket_result || jsonb_build_object('reason', 'rate');
    end if;
  end if;

  if flow_record.organization_id is not null and organization_limit > 0 then
    bucket_result := app_private.consume_public_request_bucket(
      request_action || ':organization:' || flow_record.organization_id::text,
      organization_limit,
      window_seconds
    );
    if not (bucket_result ->> 'allowed')::boolean then
      return bucket_result || jsonb_build_object('reason', 'rate');
    end if;
  end if;

  return jsonb_build_object('allowed', true);
end;
$$;

revoke all on function public.enforce_public_request_guard(
  text, text, text, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.enforce_public_request_guard(
  text, text, text, text, uuid, text
) to service_role;

revoke all on function public.get_widget_manifest(uuid)
  from public, anon, authenticated;
revoke all on function public.create_widget_session(uuid)
  from public, anon, authenticated;
revoke all on function public.resume_widget_session(text)
  from public, anon, authenticated;
revoke all on function public.save_widget_answer(text, uuid, integer, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.calculate_widget_result(text)
  from public, anon, authenticated;
revoke all on function public.reserve_widget_file(text, text, text, integer, text, text)
  from public, anon, authenticated;
revoke all on function public.complete_widget_file(text, uuid)
  from public, anon, authenticated;
revoke all on function public.reject_widget_file(text, uuid)
  from public, anon, authenticated;
revoke all on function public.submit_widget_lead(text, uuid, jsonb, jsonb, jsonb, uuid[])
  from public, anon, authenticated;
revoke all on function public.record_analytics_consent(text, uuid, text, boolean)
  from public, anon, authenticated;
revoke all on function public.record_widget_event(
  text, uuid, smallint, public.analytics_event_name, timestamptz, text,
  public.analytics_source, public.analytics_device
) from public, anon, authenticated;

grant execute on function public.get_widget_manifest(uuid) to service_role;
grant execute on function public.create_widget_session(uuid) to service_role;
grant execute on function public.resume_widget_session(text) to service_role;
grant execute on function public.save_widget_answer(text, uuid, integer, text, jsonb, text)
  to service_role;
grant execute on function public.calculate_widget_result(text) to service_role;
grant execute on function public.reserve_widget_file(text, text, text, integer, text, text)
  to service_role;
grant execute on function public.complete_widget_file(text, uuid) to service_role;
grant execute on function public.reject_widget_file(text, uuid) to service_role;
grant execute on function public.submit_widget_lead(text, uuid, jsonb, jsonb, jsonb, uuid[])
  to service_role;
grant execute on function public.record_analytics_consent(text, uuid, text, boolean)
  to service_role;
grant execute on function public.record_widget_event(
  text, uuid, smallint, public.analytics_event_name, timestamptz, text,
  public.analytics_source, public.analytics_device
) to service_role;
