create type public.data_erasure_reason as enum ('data_subject_request', 'retention');

alter table public.leads
add column erasure_pending_at timestamptz,
add column erasure_pending_by uuid references auth.users (id),
add constraint leads_erasure_pending_complete check (
  (erasure_pending_at is null and erasure_pending_by is null)
  or erasure_pending_at is not null
);

create table public.organization_data_policies (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  lead_retention_days integer check (
    lead_retention_days is null or lead_retention_days between 30 and 3650
  ),
  retention_approved_by uuid references auth.users (id),
  retention_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retention_approval_complete check (
    (
      lead_retention_days is null
      and retention_approved_by is null
      and retention_approved_at is null
    )
    or (
      lead_retention_days is not null
      and retention_approved_by is not null
      and retention_approved_at is not null
    )
  )
);

create table public.lead_legal_holds (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id),
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (organization_id, lead_id),
  constraint lead_legal_holds_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id)
);

create table public.data_erasure_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reason public.data_erasure_reason not null,
  requested_by uuid references auth.users (id) on delete set null,
  summary jsonb not null check (
    jsonb_typeof(summary) = 'object'
    and octet_length(summary::text) <= 4096
  ),
  erased_at timestamptz not null default now()
);

create index data_erasure_events_organization_idx
  on public.data_erasure_events (organization_id, erased_at desc);

create trigger organization_data_policies_set_updated_at
before update on public.organization_data_policies
for each row execute function app_private.set_updated_at();

create function public.set_organization_retention(
  target_organization_id uuid,
  target_lead_retention_days integer
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  policy_record public.organization_data_policies%rowtype;
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then
    raise exception 'organization not found' using errcode = 'no_data_found';
  end if;
  if target_lead_retention_days is not null
    and target_lead_retention_days not between 30 and 3650
  then
    raise exception 'invalid retention period' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.organization_data_policies (
    organization_id,
    lead_retention_days,
    retention_approved_by,
    retention_approved_at
  )
  values (
    target_organization_id,
    target_lead_retention_days,
    case when target_lead_retention_days is null then null else auth.uid() end,
    case when target_lead_retention_days is null then null else now() end
  )
  on conflict (organization_id) do update
  set
    lead_retention_days = excluded.lead_retention_days,
    retention_approved_by = excluded.retention_approved_by,
    retention_approved_at = excluded.retention_approved_at
  returning * into policy_record;
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
    'privacy.retention_updated',
    'organization_data_policies',
    target_organization_id,
    jsonb_build_object('lead_retention_days', target_lead_retention_days)
  );
  return jsonb_build_object(
    'leadRetentionDays', policy_record.lead_retention_days,
    'approvedAt', policy_record.retention_approved_at
  );
end;
$$;

create function public.set_lead_legal_hold(
  target_organization_id uuid,
  target_lead_id uuid,
  target_reason text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) or char_length(trim(coalesce(target_reason, ''))) not between 5 and 500
  then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  perform 1
  from public.leads lead
    where lead.id = target_lead_id
      and lead.organization_id = target_organization_id
      and lead.erasure_pending_at is null
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  insert into public.lead_legal_holds (
    organization_id,
    lead_id,
    reason,
    created_by
  )
  values (
    target_organization_id,
    target_lead_id,
    trim(target_reason),
    auth.uid()
  )
  on conflict (organization_id, lead_id) do update
  set reason = excluded.reason, created_by = excluded.created_by, created_at = now();
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
    'privacy.legal_hold_set',
    'lead_legal_holds',
    target_lead_id,
    '{}'::jsonb
  );
end;
$$;

create function public.release_lead_legal_hold(
  target_organization_id uuid,
  target_lead_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  delete from public.lead_legal_holds hold
  where hold.organization_id = target_organization_id
    and hold.lead_id = target_lead_id;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
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
    'privacy.legal_hold_released',
    'lead_legal_holds',
    target_lead_id,
    '{}'::jsonb
  );
end;
$$;

create function public.export_lead_personal_data(
  target_organization_id uuid,
  target_lead_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  lead_record public.leads%rowtype;
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  select lead.*
  into lead_record
  from public.leads lead
  where lead.id = target_lead_id
    and lead.organization_id = target_organization_id;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  return jsonb_build_object(
    'exportVersion', 1,
    'exportedAt', now(),
    'lead', jsonb_build_object(
      'publicId', lead_record.public_id,
      'submittedAt', lead_record.submitted_at,
      'contact', jsonb_build_object(
        'email', lead_record.contact_email,
        'name', lead_record.contact_name,
        'phone', lead_record.contact_phone
      ),
      'flow', jsonb_build_object(
        'name', lead_record.flow_name,
        'title', lead_record.flow_title,
        'versionId', lead_record.flow_version_id
      ),
      'status', lead_record.status,
      'estimation', jsonb_build_object(
        'currency', lead_record.price_currency,
        'maxMinor', lead_record.price_max_minor,
        'minMinor', lead_record.price_min_minor,
        'presentation', lead_record.price_presentation,
        'score', lead_record.score,
        'scoreCategory', lead_record.score_category_label,
        'explanation', lead_record.estimation_explanation
      )
    ),
    'answers', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'stepKey', answer.step_key,
        'question', answer.question_title,
        'answer', answer.answer,
        'recordedAt', answer.created_at
      ) order by answer.created_at, answer.step_key), '[]'::jsonb)
      from public.lead_answers answer
      where answer.organization_id = target_organization_id
        and answer.lead_id = target_lead_id
    ),
    'consents', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'type', consent.type,
        'accepted', consent.accepted,
        'contentVersion', consent.content_version,
        'contentHash', consent.content_hash,
        'recordedAt', consent.recorded_at,
        'source', consent.source
      ) order by consent.recorded_at, consent.type), '[]'::jsonb)
      from public.consent_records consent
      where consent.organization_id = target_organization_id
        and consent.lead_id = target_lead_id
    ),
    'files', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', stored_file.original_name,
        'mimeType', stored_file.mime_type,
        'sizeBytes', stored_file.size_bytes,
        'sha256', stored_file.sha256,
        'createdAt', stored_file.created_at
      ) order by stored_file.created_at, stored_file.id), '[]'::jsonb)
      from public.lead_files stored_file
      where stored_file.organization_id = target_organization_id
        and stored_file.lead_id = target_lead_id
    ),
    'notes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'body', note.body,
        'createdAt', note.created_at
      ) order by note.created_at, note.id), '[]'::jsonb)
      from public.lead_notes note
      where note.organization_id = target_organization_id
        and note.lead_id = target_lead_id
    ),
    'statusHistory', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'from', history.from_status,
        'to', history.to_status,
        'changedAt', history.changed_at
      ) order by history.changed_at, history.id), '[]'::jsonb)
      from public.lead_status_history history
      where history.organization_id = target_organization_id
        and history.lead_id = target_lead_id
    ),
    'delivery', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'kind', notification.kind,
        'status', notification.status,
        'recipientEmail', notification.recipient_email,
        'createdAt', notification.created_at,
        'sentAt', notification.sent_at
      ) order by notification.created_at, notification.id), '[]'::jsonb)
      from public.notifications notification
      where notification.organization_id = target_organization_id
        and notification.lead_id = target_lead_id
    )
  );
end;
$$;

create function app_private.erase_lead_record(
  target_organization_id uuid,
  target_lead_id uuid,
  target_reason public.data_erasure_reason,
  target_actor uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  deleted_summary jsonb;
  session_identifier uuid;
begin
  select lead.session_id
  into session_identifier
  from public.leads lead
  where lead.id = target_lead_id
    and lead.organization_id = target_organization_id
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if exists (
    select 1 from public.lead_legal_holds hold
    where hold.organization_id = target_organization_id
      and hold.lead_id = target_lead_id
  ) then
    raise exception 'lead is under legal hold' using errcode = 'object_in_use';
  end if;

  deleted_summary := jsonb_build_object(
    'answers', (select count(*) from public.lead_answers where lead_id = target_lead_id),
    'consents', (select count(*) from public.consent_records where lead_id = target_lead_id),
    'files', (select count(*) from public.lead_files where lead_id = target_lead_id),
    'notes', (select count(*) from public.lead_notes where lead_id = target_lead_id),
    'notifications', (select count(*) from public.notifications where lead_id = target_lead_id)
  );

  delete from public.notification_delivery_attempts attempt
  where attempt.notification_id in (
    select notification.id from public.notifications notification
    where notification.lead_id = target_lead_id
  );
  delete from public.notifications where lead_id = target_lead_id;
  delete from public.lead_notes where lead_id = target_lead_id;
  delete from public.lead_status_history where lead_id = target_lead_id;
  delete from public.consent_records where lead_id = target_lead_id;
  delete from public.lead_answers where lead_id = target_lead_id;
  delete from public.lead_files where lead_id = target_lead_id;
  delete from public.session_events where session_id = session_identifier;
  delete from public.analytics_consent_records where session_id = session_identifier;
  delete from public.audit_logs
  where organization_id = target_organization_id
    and target_id = target_lead_id;
  delete from public.leads where id = target_lead_id;
  delete from public.widget_session_mutations where session_id = session_identifier;
  delete from public.session_answers where session_id = session_identifier;
  delete from public.widget_sessions where id = session_identifier;

  insert into public.data_erasure_events (
    organization_id,
    reason,
    requested_by,
    summary
  )
  values (
    target_organization_id,
    target_reason,
    target_actor,
    deleted_summary
  );
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
    target_actor,
    'privacy.lead_erased',
    'data_erasure_events',
    null,
    jsonb_build_object('reason', target_reason, 'summary', deleted_summary)
  );
  return deleted_summary;
end;
$$;

create function public.erase_lead_personal_data(
  target_organization_id uuid,
  target_lead_id uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if not exists (
    select 1 from public.leads lead
    where lead.organization_id = target_organization_id
      and lead.id = target_lead_id
      and lead.erasure_pending_at is not null
  ) then
    raise exception 'erasure was not prepared' using errcode = 'invalid_parameter_value';
  end if;
  return app_private.erase_lead_record(
    target_organization_id,
    target_lead_id,
    'data_subject_request',
    auth.uid()
  );
end;
$$;

create function public.get_lead_erasure_storage_paths(
  target_organization_id uuid,
  target_lead_id uuid
)
returns text[]
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  perform 1
  from public.leads lead
  where lead.organization_id = target_organization_id
    and lead.id = target_lead_id
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if exists (
    select 1 from public.lead_legal_holds hold
    where hold.organization_id = target_organization_id
      and hold.lead_id = target_lead_id
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  update public.leads
  set
    erasure_pending_at = coalesce(erasure_pending_at, now()),
    erasure_pending_by = coalesce(erasure_pending_by, auth.uid())
  where organization_id = target_organization_id
    and id = target_lead_id;
  return array(
    select stored_file.object_path
    from public.lead_files stored_file
    where stored_file.organization_id = target_organization_id
      and stored_file.lead_id = target_lead_id
    order by stored_file.id
  );
end;
$$;

create function public.get_retention_candidates(batch_size integer default 100)
returns table (
  lead_id uuid,
  organization_id uuid,
  object_paths text[]
)
language sql
volatile
security definer
set search_path = ''
as $$
  with candidates as (
    select lead.id
    from public.leads lead
    join public.organization_data_policies policy
      on policy.organization_id = lead.organization_id
    where policy.lead_retention_days is not null
      and policy.retention_approved_at is not null
      and lead.submitted_at <= now() - make_interval(days => policy.lead_retention_days)
      and (lead.erasure_pending_at is null or lead.erasure_pending_by is null)
      and not exists (
        select 1 from public.lead_legal_holds hold
        where hold.organization_id = lead.organization_id
          and hold.lead_id = lead.id
      )
    order by lead.submitted_at, lead.id
    limit case when batch_size between 1 and 500 then batch_size else 0 end
    for update of lead skip locked
  ),
  marked as (
    update public.leads lead
    set
      erasure_pending_at = coalesce(lead.erasure_pending_at, now()),
      erasure_pending_by = null
    from candidates
    where lead.id = candidates.id
    returning lead.id, lead.organization_id
  )
  select
    marked.id,
    marked.organization_id,
    array(
      select stored_file.object_path
      from public.lead_files stored_file
      where stored_file.lead_id = marked.id
      order by stored_file.id
    )
  from marked;
$$;

create function public.purge_retention_candidates(target_lead_ids uuid[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  candidate record;
  purged integer := 0;
begin
  if target_lead_ids is null
    or cardinality(target_lead_ids) not between 1 and 500
    or cardinality(target_lead_ids) <> cardinality(array(select distinct unnest(target_lead_ids)))
  then
    raise exception 'invalid retention batch' using errcode = 'invalid_parameter_value';
  end if;
  for candidate in
    select lead.id, lead.organization_id
    from public.leads lead
    join public.organization_data_policies policy
      on policy.organization_id = lead.organization_id
    where lead.id = any(target_lead_ids)
      and policy.lead_retention_days is not null
      and policy.retention_approved_at is not null
      and lead.erasure_pending_at is not null
      and lead.erasure_pending_by is null
      and lead.submitted_at <= now() - make_interval(days => policy.lead_retention_days)
      and not exists (
        select 1 from public.lead_legal_holds hold
        where hold.organization_id = lead.organization_id
          and hold.lead_id = lead.id
      )
    order by lead.submitted_at, lead.id
  loop
    perform app_private.erase_lead_record(
      candidate.organization_id,
      candidate.id,
      'retention',
      null
    );
    purged := purged + 1;
  end loop;
  return purged;
end;
$$;

create function public.get_expired_session_candidates(batch_size integer default 100)
returns table (
  session_id uuid,
  object_paths text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    session.id,
    array(
      select stored_file.object_path
      from public.lead_files stored_file
      where stored_file.session_id = session.id
      order by stored_file.id
    )
  from public.widget_sessions session
  where session.expires_at <= now() - interval '1 day'
    and not exists (select 1 from public.leads lead where lead.session_id = session.id)
  order by session.expires_at, session.id
  limit case when batch_size between 1 and 500 then batch_size else 0 end;
$$;

create function public.purge_expired_sessions(target_session_ids uuid[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  purged integer;
begin
  if target_session_ids is null
    or cardinality(target_session_ids) not between 1 and 500
    or cardinality(target_session_ids) <> cardinality(array(select distinct unnest(target_session_ids)))
  then
    raise exception 'invalid session retention batch' using errcode = 'invalid_parameter_value';
  end if;
  with candidates as (
    select session.id
    from public.widget_sessions session
    where session.id = any(target_session_ids)
      and session.expires_at <= now() - interval '1 day'
      and not exists (select 1 from public.leads lead where lead.session_id = session.id)
    for update
  ),
  deleted_events as (
    delete from public.session_events event
    using candidates
    where event.session_id = candidates.id
  ),
  deleted_consents as (
    delete from public.analytics_consent_records consent
    using candidates
    where consent.session_id = candidates.id
  ),
  deleted_files as (
    delete from public.lead_files stored_file
    using candidates
    where stored_file.session_id = candidates.id
  ),
  deleted_mutations as (
    delete from public.widget_session_mutations mutation
    using candidates
    where mutation.session_id = candidates.id
  ),
  deleted_answers as (
    delete from public.session_answers answer
    using candidates
    where answer.session_id = candidates.id
  )
  delete from public.widget_sessions session
  using candidates
  where session.id = candidates.id;
  get diagnostics purged = row_count;
  return purged;
end;
$$;

alter table public.organization_data_policies enable row level security;
alter table public.organization_data_policies force row level security;
alter table public.lead_legal_holds enable row level security;
alter table public.lead_legal_holds force row level security;
alter table public.data_erasure_events enable row level security;
alter table public.data_erasure_events force row level security;

create policy organization_data_policies_owner_select
on public.organization_data_policies for select to authenticated
using (app_private.has_role(organization_id, array['owner']::public.organization_member_role[]));

create policy lead_legal_holds_owner_select
on public.lead_legal_holds for select to authenticated
using (app_private.has_role(organization_id, array['owner']::public.organization_member_role[]));

create policy data_erasure_events_owner_select
on public.data_erasure_events for select to authenticated
using (app_private.has_role(organization_id, array['owner']::public.organization_member_role[]));

revoke all on table public.organization_data_policies from public, anon, authenticated;
revoke all on table public.lead_legal_holds from public, anon, authenticated;
revoke all on table public.data_erasure_events from public, anon, authenticated;
grant select on public.organization_data_policies to authenticated;
grant select on public.lead_legal_holds to authenticated;
grant select on public.data_erasure_events to authenticated;

revoke all on function public.set_organization_retention(uuid, integer) from public;
revoke all on function public.set_lead_legal_hold(uuid, uuid, text) from public;
revoke all on function public.release_lead_legal_hold(uuid, uuid) from public;
revoke all on function public.export_lead_personal_data(uuid, uuid) from public;
revoke all on function public.erase_lead_personal_data(uuid, uuid) from public;
revoke all on function public.get_lead_erasure_storage_paths(uuid, uuid) from public;
revoke all on function public.get_retention_candidates(integer)
  from public, anon, authenticated;
revoke all on function public.purge_retention_candidates(uuid[])
  from public, anon, authenticated;
revoke all on function public.get_expired_session_candidates(integer)
  from public, anon, authenticated;
revoke all on function public.purge_expired_sessions(uuid[])
  from public, anon, authenticated;
revoke all on function app_private.erase_lead_record(
  uuid, uuid, public.data_erasure_reason, uuid
) from public, anon, authenticated;

grant execute on function public.set_organization_retention(uuid, integer) to authenticated;
grant execute on function public.set_lead_legal_hold(uuid, uuid, text) to authenticated;
grant execute on function public.release_lead_legal_hold(uuid, uuid) to authenticated;
grant execute on function public.export_lead_personal_data(uuid, uuid) to authenticated;
grant execute on function public.erase_lead_personal_data(uuid, uuid) to authenticated;
grant execute on function public.get_lead_erasure_storage_paths(uuid, uuid) to authenticated;
grant execute on function public.get_retention_candidates(integer) to service_role;
grant execute on function public.purge_retention_candidates(uuid[]) to service_role;
grant execute on function public.get_expired_session_candidates(integer) to service_role;
grant execute on function public.purge_expired_sessions(uuid[]) to service_role;
