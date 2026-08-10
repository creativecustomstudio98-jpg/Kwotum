create type public.analytics_consent_state as enum ('granted', 'denied');

create type public.analytics_event_name as enum (
  'widget_loaded',
  'widget_opened',
  'flow_started',
  'flow_abandoned',
  'step_viewed',
  'step_answered',
  'step_back',
  'contact_started',
  'lead_submitted',
  'result_viewed',
  'cta_clicked',
  'file_uploaded',
  'validation_error'
);

create type public.analytics_source as enum (
  'direct',
  'organic',
  'paid',
  'social',
  'email',
  'referral',
  'other'
);

create type public.analytics_device as enum (
  'mobile',
  'tablet',
  'desktop',
  'other'
);

create table public.analytics_consent_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  session_id uuid not null references public.widget_sessions (id),
  mutation_id uuid not null,
  consent_version text not null check (consent_version = 'analytics-v1'),
  state public.analytics_consent_state not null,
  recorded_at timestamptz not null default now(),
  unique (session_id, mutation_id),
  unique (organization_id, id),
  constraint analytics_consent_session_tenant_fk foreign key (
    organization_id,
    session_id
  ) references public.widget_sessions (organization_id, id)
);

create index analytics_consent_current_idx
  on public.analytics_consent_records (session_id, recorded_at desc, id desc);

create table public.session_events (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id),
  session_id uuid not null references public.widget_sessions (id),
  flow_id uuid not null references public.flows (id),
  flow_version_id uuid not null references public.flow_versions (id),
  schema_version smallint not null check (schema_version = 1),
  name public.analytics_event_name not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  expires_at timestamptz not null,
  step_key text check (
    step_key is null
    or (
      char_length(step_key) between 1 and 64
      and step_key ~ '^[a-z][a-z0-9_-]*$'
    )
  ),
  source public.analytics_source not null,
  device public.analytics_device not null,
  unique (session_id, id),
  unique (organization_id, id),
  constraint session_events_session_tenant_fk foreign key (
    organization_id,
    session_id
  ) references public.widget_sessions (organization_id, id),
  constraint session_events_flow_tenant_fk foreign key (
    organization_id,
    flow_id
  ) references public.flows (organization_id, id),
  constraint session_events_flow_version_tenant_fk foreign key (
    organization_id,
    flow_id,
    flow_version_id
  ) references public.flow_versions (organization_id, flow_id, id),
  constraint session_events_step_scope check (
    (
      name in ('step_viewed', 'step_answered', 'step_back', 'validation_error')
      and step_key is not null
    )
    or (
      name not in ('step_viewed', 'step_answered', 'step_back', 'validation_error')
      and step_key is null
    )
  ),
  constraint session_events_retention check (
    expires_at = occurred_at + interval '90 days'
  )
);

create index session_events_tenant_period_idx
  on public.session_events (organization_id, occurred_at desc);
create index session_events_tenant_name_period_idx
  on public.session_events (organization_id, name, occurred_at desc);
create index session_events_expiry_idx
  on public.session_events (expires_at);
create index session_events_session_sequence_idx
  on public.session_events (session_id, occurred_at, received_at, id);

create function public.record_analytics_consent(
  session_token text,
  mutation_id uuid,
  consent_version text,
  granted boolean
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  existing_record public.analytics_consent_records%rowtype;
  session_record public.widget_sessions%rowtype;
  target_state public.analytics_consent_state;
begin
  if session_token !~ '^[a-f0-9]{64}$'
    or mutation_id is null
    or consent_version <> 'analytics-v1'
    or granted is null
  then
    raise exception 'invalid analytics consent'
      using errcode = 'invalid_parameter_value';
  end if;

  select session.*
  into session_record
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256')
  for update;

  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;

  target_state := case
    when granted then 'granted'::public.analytics_consent_state
    else 'denied'::public.analytics_consent_state
  end;

  select consent.*
  into existing_record
  from public.analytics_consent_records consent
  where consent.session_id = session_record.id
    and consent.mutation_id = record_analytics_consent.mutation_id;

  if found then
    if existing_record.state <> target_state
      or existing_record.consent_version <> consent_version
    then
      raise exception 'analytics consent mutation conflict'
        using errcode = 'serialization_failure';
    end if;
    return jsonb_build_object(
      'granted',
      existing_record.state = 'granted',
      'consentVersion',
      existing_record.consent_version,
      'recordedAt',
      existing_record.recorded_at
    );
  end if;

  if (
    select count(*)
    from public.analytics_consent_records consent
    where consent.session_id = session_record.id
  ) >= 20 then
    raise exception 'analytics consent rate limit exceeded'
      using errcode = 'program_limit_exceeded';
  end if;

  insert into public.analytics_consent_records (
    organization_id,
    session_id,
    mutation_id,
    consent_version,
    state
  )
  values (
    session_record.organization_id,
    session_record.id,
    mutation_id,
    consent_version,
    target_state
  )
  returning * into existing_record;

  if not granted then
    delete from public.session_events event
    where event.session_id = session_record.id;
  end if;

  return jsonb_build_object(
    'granted',
    granted,
    'consentVersion',
    consent_version,
    'recordedAt',
    existing_record.recorded_at
  );
end;
$$;

create function public.record_widget_event(
  session_token text,
  event_id uuid,
  event_schema_version smallint,
  event_name public.analytics_event_name,
  event_occurred_at timestamptz,
  event_step_key text,
  event_source public.analytics_source,
  event_device public.analytics_device
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_consent public.analytics_consent_state;
  session_record public.widget_sessions%rowtype;
  step_exists boolean;
begin
  if session_token !~ '^[a-f0-9]{64}$'
    or event_id is null
    or event_schema_version <> 1
    or event_occurred_at is null
    or event_occurred_at > now() + interval '5 minutes'
    or event_occurred_at < now() - interval '8 days'
  then
    raise exception 'invalid analytics event'
      using errcode = 'invalid_parameter_value';
  end if;

  select session.*
  into session_record
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');

  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  if event_occurred_at < session_record.created_at - interval '1 minute' then
    raise exception 'invalid analytics event'
      using errcode = 'invalid_parameter_value';
  end if;

  select consent.state
  into current_consent
  from public.analytics_consent_records consent
  where consent.session_id = session_record.id
  order by consent.recorded_at desc, consent.id desc
  limit 1;

  if current_consent is distinct from 'granted'::public.analytics_consent_state then
    raise exception 'analytics consent required'
      using errcode = 'insufficient_privilege';
  end if;

  if (
    select count(*)
    from public.session_events event
    where event.session_id = session_record.id
  ) >= 500
    or (
      select count(*)
      from public.session_events event
      where event.session_id = session_record.id
        and event.received_at >= now() - interval '1 minute'
    ) >= 120
  then
    raise exception 'analytics event rate limit exceeded'
      using errcode = 'program_limit_exceeded';
  end if;

  if event_name in ('step_viewed', 'step_answered', 'step_back', 'validation_error') then
    select exists (
      select 1
      from public.flow_versions version,
      lateral jsonb_array_elements(version.snapshot -> 'steps') step
      where version.id = session_record.flow_version_id
        and step ->> 'key' = event_step_key
    )
    into step_exists;
    if not step_exists then
      raise exception 'invalid analytics step'
        using errcode = 'invalid_parameter_value';
    end if;
  elsif event_step_key is not null then
    raise exception 'invalid analytics step'
      using errcode = 'invalid_parameter_value';
  end if;

  insert into public.session_events (
    id,
    organization_id,
    session_id,
    flow_id,
    flow_version_id,
    schema_version,
    name,
    occurred_at,
    expires_at,
    step_key,
    source,
    device
  )
  values (
    event_id,
    session_record.organization_id,
    session_record.id,
    session_record.flow_id,
    session_record.flow_version_id,
    event_schema_version,
    event_name,
    event_occurred_at,
    event_occurred_at + interval '90 days',
    event_step_key,
    event_source,
    event_device
  )
  on conflict (session_id, id) do nothing;

  return jsonb_build_object('accepted', true, 'eventId', event_id);
end;
$$;

create function public.get_analytics_overview(
  target_organization_id uuid,
  period_start timestamptz,
  period_end timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  devices jsonb;
  drop_off jsonb;
  leads_count integer;
  median_completion_seconds integer;
  results_count integer;
  score_distribution jsonb;
  sessions_count integer;
  sources jsonb;
  starts_count integer;
  versions jsonb;
begin
  if not app_private.is_active_member(target_organization_id) then
    raise exception 'resource not found' using errcode = 'no_data_found';
  end if;
  if period_start is null
    or period_end is null
    or period_end <= period_start
    or period_end - period_start > interval '90 days'
    or period_end > now() + interval '5 minutes'
  then
    raise exception 'invalid analytics period'
      using errcode = 'invalid_parameter_value';
  end if;

  select
    count(distinct event.session_id) filter (where event.name = 'widget_loaded'),
    count(distinct event.session_id) filter (where event.name = 'flow_started'),
    count(distinct event.session_id) filter (where event.name = 'result_viewed'),
    count(distinct event.session_id) filter (where event.name = 'lead_submitted')
  into sessions_count, starts_count, results_count, leads_count
  from public.session_events event
  where event.organization_id = target_organization_id
    and event.occurred_at >= period_start
    and event.occurred_at < period_end;

  with session_times as (
    select
      event.session_id,
      min(event.occurred_at) filter (where event.name = 'widget_loaded') as loaded_at,
      min(event.occurred_at) filter (where event.name = 'result_viewed') as result_at
    from public.session_events event
    where event.organization_id = target_organization_id
      and event.occurred_at >= period_start
      and event.occurred_at < period_end
      and event.name in ('widget_loaded', 'result_viewed')
    group by event.session_id
  )
  select round(
    percentile_cont(0.5) within group (
      order by extract(epoch from (result_at - loaded_at))
    )
  )::integer
  into median_completion_seconds
  from session_times
  where loaded_at is not null and result_at >= loaded_at;

  if sessions_count < 5 then
    return jsonb_build_object(
      'insufficientData', true,
      'minimumSampleSize', 5,
      'period', jsonb_build_object('from', period_start, 'to', period_end),
      'totals', jsonb_build_object(
        'sessions', sessions_count,
        'starts', starts_count,
        'results', results_count,
        'leads', leads_count,
        'startRateBasisPoints', null,
        'completionRateBasisPoints', null,
        'leadRateBasisPoints', null,
        'medianCompletionSeconds', null
      ),
      'dropOff', '[]'::jsonb,
      'sources', '[]'::jsonb,
      'devices', '[]'::jsonb,
      'versions', '[]'::jsonb,
      'scoreDistribution', '[]'::jsonb
    );
  end if;

  select coalesce(jsonb_agg(row_data order by row_data ->> 'stepKey'), '[]'::jsonb)
  into drop_off
  from (
    select jsonb_build_object(
      'stepKey', scoped.step_key,
      'title', coalesce(step_document ->> 'title', scoped.step_key),
      'viewed', scoped.viewed,
      'answered', scoped.answered,
      'dropped', greatest(scoped.viewed - scoped.answered, 0),
      'dropRateBasisPoints',
        round(greatest(scoped.viewed - scoped.answered, 0) * 10000.0 / scoped.viewed)
    ) as row_data
    from (
      select
        event.flow_version_id,
        event.step_key,
        count(distinct event.session_id) filter (where event.name = 'step_viewed') as viewed,
        count(distinct event.session_id) filter (where event.name = 'step_answered') as answered
      from public.session_events event
      where event.organization_id = target_organization_id
        and event.occurred_at >= period_start
        and event.occurred_at < period_end
        and event.name in ('step_viewed', 'step_answered')
      group by event.flow_version_id, event.step_key
    ) scoped
    join public.flow_versions version on version.id = scoped.flow_version_id
    left join lateral jsonb_array_elements(version.snapshot -> 'steps') step_document
      on step_document ->> 'key' = scoped.step_key
    where scoped.viewed >= 5
  ) rows;

  with first_load as (
    select distinct on (event.session_id)
      event.session_id,
      event.source,
      event.device
    from public.session_events event
    where event.organization_id = target_organization_id
      and event.occurred_at >= period_start
      and event.occurred_at < period_end
      and event.name = 'widget_loaded'
    order by event.session_id, event.occurred_at, event.received_at, event.id
  ),
  source_counts as (
    select source::text as key, count(*)::integer as count
    from first_load
    group by source
    having count(*) >= 5
  ),
  device_counts as (
    select device::text as key, count(*)::integer as count
    from first_load
    group by device
    having count(*) >= 5
  )
  select
    coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'key', key,
          'count', count,
          'shareBasisPoints', round(count * 10000.0 / sessions_count)
        )
        order by count desc, key
      ) from source_counts),
      '[]'::jsonb
    ),
    coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'key', key,
          'count', count,
          'shareBasisPoints', round(count * 10000.0 / sessions_count)
        )
        order by count desc, key
      ) from device_counts),
      '[]'::jsonb
    )
  into sources, devices;

  select coalesce(jsonb_agg(row_data order by row_data ->> 'versionNumber'), '[]'::jsonb)
  into versions
  from (
    select jsonb_build_object(
      'flowVersionId', event.flow_version_id,
      'versionNumber', version.version_number,
      'sessions', count(distinct event.session_id) filter (where event.name = 'widget_loaded'),
      'results', count(distinct event.session_id) filter (where event.name = 'result_viewed'),
      'completionRateBasisPoints',
        round(
          count(distinct event.session_id) filter (where event.name = 'result_viewed')
          * 10000.0
          / count(distinct event.session_id) filter (where event.name = 'widget_loaded')
        )
    ) as row_data
    from public.session_events event
    join public.flow_versions version on version.id = event.flow_version_id
    where event.organization_id = target_organization_id
      and event.occurred_at >= period_start
      and event.occurred_at < period_end
    group by event.flow_version_id, version.version_number
    having count(distinct event.session_id) filter (where event.name = 'widget_loaded') >= 5
  ) rows;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', score_category_key,
        'label', score_category_label,
        'count', lead_count
      )
      order by lead_count desc, score_category_key
    ),
    '[]'::jsonb
  )
  into score_distribution
  from (
    select
      lead.score_category_key,
      lead.score_category_label,
      count(*)::integer as lead_count
    from public.leads lead
    where lead.organization_id = target_organization_id
      and lead.submitted_at >= period_start
      and lead.submitted_at < period_end
      and lead.score_category_key is not null
      and exists (
        select 1
        from public.session_events event
        where event.session_id = lead.session_id
          and event.name = 'lead_submitted'
          and event.occurred_at >= period_start
          and event.occurred_at < period_end
      )
    group by lead.score_category_key, lead.score_category_label
    having count(*) >= 5
  ) score_rows;

  return jsonb_build_object(
    'insufficientData', false,
    'minimumSampleSize', 5,
    'period', jsonb_build_object('from', period_start, 'to', period_end),
    'totals', jsonb_build_object(
      'sessions', sessions_count,
      'starts', starts_count,
      'results', results_count,
      'leads', leads_count,
      'startRateBasisPoints', round(starts_count * 10000.0 / sessions_count),
      'completionRateBasisPoints', round(results_count * 10000.0 / sessions_count),
      'leadRateBasisPoints', round(leads_count * 10000.0 / sessions_count),
      'medianCompletionSeconds', median_completion_seconds
    ),
    'dropOff', drop_off,
    'sources', sources,
    'devices', devices,
    'versions', versions,
    'scoreDistribution', score_distribution
  );
end;
$$;

create function public.purge_expired_analytics(batch_size integer default 5000)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if batch_size not between 1 and 10000 then
    raise exception 'invalid purge batch' using errcode = 'invalid_parameter_value';
  end if;
  with expired as (
    select event.id
    from public.session_events event
    where event.expires_at <= now()
    order by event.expires_at, event.id
    for update skip locked
    limit batch_size
  )
  delete from public.session_events event
  using expired
  where event.id = expired.id;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

alter table public.analytics_consent_records enable row level security;
alter table public.analytics_consent_records force row level security;
alter table public.session_events enable row level security;
alter table public.session_events force row level security;

create policy analytics_consent_owner_admin_select
on public.analytics_consent_records for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy session_events_owner_admin_select
on public.session_events for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

revoke all on table public.analytics_consent_records from public, anon, authenticated;
revoke all on table public.session_events from public, anon, authenticated;
grant select on public.analytics_consent_records to authenticated;
grant select on public.session_events to authenticated;

revoke all on function public.record_analytics_consent(text, uuid, text, boolean)
  from public;
revoke all on function public.record_widget_event(
  text,
  uuid,
  smallint,
  public.analytics_event_name,
  timestamptz,
  text,
  public.analytics_source,
  public.analytics_device
) from public;
revoke all on function public.get_analytics_overview(uuid, timestamptz, timestamptz)
  from public;
revoke all on function public.purge_expired_analytics(integer)
  from public, anon, authenticated;

grant execute on function public.record_analytics_consent(text, uuid, text, boolean)
  to anon, authenticated;
grant execute on function public.record_widget_event(
  text,
  uuid,
  smallint,
  public.analytics_event_name,
  timestamptz,
  text,
  public.analytics_source,
  public.analytics_device
) to anon, authenticated;
grant execute on function public.get_analytics_overview(uuid, timestamptz, timestamptz)
  to authenticated;
grant execute on function public.purge_expired_analytics(integer)
  to service_role;
