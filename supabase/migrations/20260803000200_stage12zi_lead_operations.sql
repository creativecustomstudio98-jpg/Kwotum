create type public.lead_priority as enum ('low', 'medium', 'high');
create type public.lead_task_kind as enum ('contact', 'task');
create type public.lead_task_status as enum ('open', 'completed', 'cancelled');
create type public.lead_activity_kind as enum (
  'assignee_changed',
  'priority_changed',
  'task_created',
  'task_completed',
  'task_cancelled'
);

create table public.lead_operations (
  lead_id uuid primary key,
  organization_id uuid not null references public.organizations (id),
  assignee_user_id uuid references auth.users (id) on delete set null,
  priority public.lead_priority not null default 'medium',
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (organization_id, lead_id),
  constraint lead_operations_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id) on delete cascade
);

create index lead_operations_organization_assignee_idx
  on public.lead_operations (organization_id, assignee_user_id, priority);

create table public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null,
  request_id uuid not null,
  kind public.lead_task_kind not null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (
    description is null
    or char_length(trim(description)) between 1 and 2000
  ),
  due_at timestamptz not null,
  assigned_to uuid references auth.users (id) on delete set null,
  created_by uuid not null references auth.users (id),
  status public.lead_task_status not null default 'open',
  closed_at timestamptz,
  closed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, request_id),
  constraint lead_tasks_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id) on delete cascade,
  constraint lead_tasks_state_consistent check (
    (
      status = 'open'
      and closed_at is null
      and closed_by is null
    )
    or (
      status in ('completed', 'cancelled')
      and closed_at is not null
      and closed_by is not null
    )
  )
);

create index lead_tasks_open_due_idx
  on public.lead_tasks (organization_id, lead_id, due_at, id)
  where status = 'open';
create index lead_tasks_assignee_open_idx
  on public.lead_tasks (organization_id, assigned_to, due_at)
  where status = 'open';

create table public.lead_activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null,
  task_id uuid,
  kind public.lead_activity_kind not null,
  actor_user_id uuid references auth.users (id) on delete set null,
  from_value text check (from_value is null or char_length(from_value) <= 64),
  to_value text check (to_value is null or char_length(to_value) <= 64),
  occurred_at timestamptz not null default now(),
  constraint lead_activity_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id) on delete cascade,
  constraint lead_activity_task_tenant_fk foreign key (
    organization_id,
    task_id
  ) references public.lead_tasks (organization_id, id) on delete cascade,
  constraint lead_activity_payload_consistent check (
    (
      kind in ('assignee_changed', 'priority_changed')
      and task_id is null
    )
    or (
      kind in ('task_created', 'task_completed', 'task_cancelled')
      and task_id is not null
      and from_value is null
      and to_value is null
    )
  )
);

create index lead_activity_events_lead_time_idx
  on public.lead_activity_events (organization_id, lead_id, occurred_at desc, id desc);

create trigger lead_operations_set_updated_at
before update on public.lead_operations
for each row execute function app_private.set_updated_at();

create trigger lead_tasks_set_updated_at
before update on public.lead_tasks
for each row execute function app_private.set_updated_at();

create function app_private.create_lead_operation_state()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  insert into public.lead_operations (
    organization_id,
    lead_id
  ) values (
    new.organization_id,
    new.id
  )
  on conflict (lead_id) do nothing;
  return new;
end;
$$;

create trigger leads_create_operation_state
after insert on public.leads
for each row execute function app_private.create_lead_operation_state();

insert into public.lead_operations (organization_id, lead_id)
select lead.organization_id, lead.id
from public.leads lead
on conflict (lead_id) do nothing;

create function public.set_lead_assignee(
  target_organization_id uuid,
  target_lead_id uuid,
  target_assignee_user_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  current_assignee uuid;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  select operation.assignee_user_id
  into current_assignee
  from public.lead_operations operation
  where operation.organization_id = target_organization_id
    and operation.lead_id = target_lead_id
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if target_assignee_user_id is not null and not exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = target_assignee_user_id
      and membership.status = 'active'
  ) then
    raise exception 'lead member not found' using errcode = 'no_data_found';
  end if;
  if current_assignee is not distinct from target_assignee_user_id then
    return;
  end if;
  update public.lead_operations
  set assignee_user_id = target_assignee_user_id, updated_by = actor_id
  where organization_id = target_organization_id
    and lead_id = target_lead_id;
  insert into public.lead_activity_events (
    organization_id,
    lead_id,
    kind,
    actor_user_id,
    from_value,
    to_value
  ) values (
    target_organization_id,
    target_lead_id,
    'assignee_changed',
    actor_id,
    current_assignee::text,
    target_assignee_user_id::text
  );
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    'lead.assignee_changed',
    'lead_operations',
    target_lead_id,
    jsonb_build_object(
      'fromUserId', current_assignee,
      'toUserId', target_assignee_user_id
    )
  );
end;
$$;

create function public.set_lead_priority(
  target_organization_id uuid,
  target_lead_id uuid,
  target_priority public.lead_priority
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  current_priority public.lead_priority;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin', 'sales']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if target_priority is null then
    raise exception 'invalid lead priority' using errcode = 'invalid_parameter_value';
  end if;
  select operation.priority
  into current_priority
  from public.lead_operations operation
  where operation.organization_id = target_organization_id
    and operation.lead_id = target_lead_id
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if current_priority = target_priority then
    return;
  end if;
  update public.lead_operations
  set priority = target_priority, updated_by = actor_id
  where organization_id = target_organization_id
    and lead_id = target_lead_id;
  insert into public.lead_activity_events (
    organization_id,
    lead_id,
    kind,
    actor_user_id,
    from_value,
    to_value
  ) values (
    target_organization_id,
    target_lead_id,
    'priority_changed',
    actor_id,
    current_priority::text,
    target_priority::text
  );
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    'lead.priority_changed',
    'lead_operations',
    target_lead_id,
    jsonb_build_object('from', current_priority, 'to', target_priority)
  );
end;
$$;

create function public.create_lead_task(
  target_organization_id uuid,
  target_lead_id uuid,
  idempotency_key uuid,
  target_kind public.lead_task_kind,
  target_title text,
  target_description text,
  target_due_at timestamptz,
  target_assignee_user_id uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  effective_assignee uuid := coalesce(target_assignee_user_id, auth.uid());
  existing_record public.lead_tasks%rowtype;
  normalized_description text := nullif(trim(target_description), '');
  normalized_title text := trim(target_title);
  result_record public.lead_tasks%rowtype;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin', 'sales']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if idempotency_key is null
    or target_kind is null
    or char_length(normalized_title) not between 2 and 160
    or (normalized_description is not null and char_length(normalized_description) > 2000)
    or target_due_at is null
    or target_due_at <= now() - interval '5 minutes'
  then
    raise exception 'invalid lead task' using errcode = 'invalid_parameter_value';
  end if;
  if not exists (
    select 1
    from public.lead_operations operation
    where operation.organization_id = target_organization_id
      and operation.lead_id = target_lead_id
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  if not exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = effective_assignee
      and membership.status = 'active'
  ) then
    raise exception 'lead member not found' using errcode = 'no_data_found';
  end if;

  insert into public.lead_tasks (
    organization_id,
    lead_id,
    request_id,
    kind,
    title,
    description,
    due_at,
    assigned_to,
    created_by
  ) values (
    target_organization_id,
    target_lead_id,
    idempotency_key,
    target_kind,
    normalized_title,
    normalized_description,
    target_due_at,
    effective_assignee,
    actor_id
  )
  on conflict (organization_id, request_id) do nothing
  returning * into result_record;

  if result_record.id is null then
    select task.*
    into existing_record
    from public.lead_tasks task
    where task.organization_id = target_organization_id
      and task.request_id = idempotency_key;
    if existing_record.lead_id <> target_lead_id
      or existing_record.kind <> target_kind
      or existing_record.title <> normalized_title
      or existing_record.description is distinct from normalized_description
      or existing_record.due_at <> target_due_at
      or existing_record.assigned_to is distinct from effective_assignee
    then
      raise exception 'idempotency key reused with different lead task'
        using errcode = 'unique_violation';
    end if;
    result_record := existing_record;
  else
    insert into public.lead_activity_events (
      organization_id,
      lead_id,
      task_id,
      kind,
      actor_user_id
    ) values (
      target_organization_id,
      target_lead_id,
      result_record.id,
      'task_created',
      actor_id
    );
    insert into public.audit_logs (
      organization_id,
      actor_user_id,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      target_organization_id,
      actor_id,
      'lead.task_created',
      'lead_tasks',
      result_record.id,
      jsonb_build_object(
        'leadId', target_lead_id,
        'kind', target_kind,
        'dueAt', target_due_at,
        'assignedUserId', effective_assignee
      )
    );
  end if;

  return jsonb_build_object(
    'id', result_record.id,
    'status', result_record.status,
    'createdAt', result_record.created_at
  );
end;
$$;

create function public.close_lead_task(
  target_organization_id uuid,
  target_task_id uuid,
  target_status public.lead_task_status
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  task_record public.lead_tasks%rowtype;
begin
  if actor_id is null
    or target_status is null
    or target_status not in ('completed', 'cancelled')
    or not app_private.has_role(
      target_organization_id,
      array['owner', 'admin', 'sales']::public.organization_member_role[]
    )
  then
    raise exception 'lead task not found' using errcode = 'no_data_found';
  end if;
  select task.*
  into task_record
  from public.lead_tasks task
  where task.organization_id = target_organization_id
    and task.id = target_task_id
  for update;
  if not found then
    raise exception 'lead task not found' using errcode = 'no_data_found';
  end if;
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) and actor_id is distinct from task_record.assigned_to
    and actor_id <> task_record.created_by
  then
    raise exception 'lead task not found' using errcode = 'no_data_found';
  end if;
  if task_record.status = target_status then
    return;
  end if;
  if task_record.status <> 'open' then
    raise exception 'lead task is closed' using errcode = 'invalid_parameter_value';
  end if;
  update public.lead_tasks
  set status = target_status, closed_at = now(), closed_by = actor_id
  where organization_id = target_organization_id
    and id = target_task_id;
  insert into public.lead_activity_events (
    organization_id,
    lead_id,
    task_id,
    kind,
    actor_user_id
  ) values (
    target_organization_id,
    task_record.lead_id,
    task_record.id,
    case
      when target_status = 'completed'
        then 'task_completed'::public.lead_activity_kind
      else 'task_cancelled'::public.lead_activity_kind
    end,
    actor_id
  );
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    case
      when target_status = 'completed' then 'lead.task_completed'
      else 'lead.task_cancelled'
    end,
    'lead_tasks',
    target_task_id,
    jsonb_build_object('leadId', task_record.lead_id)
  );
end;
$$;

create or replace function public.change_lead_status(
  target_organization_id uuid,
  target_lead_id uuid,
  target_status public.lead_status
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  assignment_count integer := 0;
  current_status public.lead_status;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin', 'sales']::public.organization_member_role[]
  ) then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;
  select lead.status
  into current_status
  from public.leads lead
  where lead.id = target_lead_id
    and lead.organization_id = target_organization_id
  for update;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;

  if target_status = 'in_progress' then
    update public.lead_operations
    set assignee_user_id = actor_id, updated_by = actor_id
    where organization_id = target_organization_id
      and lead_id = target_lead_id
      and assignee_user_id is null;
    get diagnostics assignment_count = row_count;
    if assignment_count > 0 then
      insert into public.lead_activity_events (
        organization_id,
        lead_id,
        kind,
        actor_user_id,
        to_value
      ) values (
        target_organization_id,
        target_lead_id,
        'assignee_changed',
        actor_id,
        actor_id::text
      );
      insert into public.audit_logs (
        organization_id,
        actor_user_id,
        action,
        target_table,
        target_id,
        metadata
      ) values (
        target_organization_id,
        actor_id,
        'lead.assignee_changed',
        'lead_operations',
        target_lead_id,
        jsonb_build_object('toUserId', actor_id, 'source', 'start_handling')
      );
    end if;
  end if;

  if current_status = target_status then
    return;
  end if;
  update public.leads
  set status = target_status, updated_at = now()
  where id = target_lead_id;
  insert into public.lead_status_history (
    organization_id,
    lead_id,
    from_status,
    to_status,
    changed_by
  ) values (
    target_organization_id,
    target_lead_id,
    current_status,
    target_status,
    actor_id
  );
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    'lead.status_changed',
    'leads',
    target_lead_id,
    jsonb_build_object('from', current_status, 'to', target_status)
  );
end;
$$;

create or replace function public.export_lead_personal_data(
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
    'operations', (
      select jsonb_build_object(
        'priority', operation.priority,
        'updatedAt', operation.updated_at
      )
      from public.lead_operations operation
      where operation.organization_id = target_organization_id
        and operation.lead_id = target_lead_id
    ),
    'tasks', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'kind', task.kind,
        'title', task.title,
        'description', task.description,
        'dueAt', task.due_at,
        'status', task.status,
        'createdAt', task.created_at,
        'closedAt', task.closed_at
      ) order by task.created_at, task.id), '[]'::jsonb)
      from public.lead_tasks task
      where task.organization_id = target_organization_id
        and task.lead_id = target_lead_id
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

alter table public.lead_operations enable row level security;
alter table public.lead_operations force row level security;
alter table public.lead_tasks enable row level security;
alter table public.lead_tasks force row level security;
alter table public.lead_activity_events enable row level security;
alter table public.lead_activity_events force row level security;

create policy lead_operations_select_member
on public.lead_operations for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_tasks_select_member
on public.lead_tasks for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_activity_events_select_member
on public.lead_activity_events for select to authenticated
using (app_private.is_active_member(organization_id));

revoke all on table public.lead_operations from public, anon, authenticated;
revoke all on table public.lead_tasks from public, anon, authenticated;
revoke all on table public.lead_activity_events from public, anon, authenticated;
grant select on public.lead_operations to authenticated;
grant select on public.lead_tasks to authenticated;
grant select on public.lead_activity_events to authenticated;

revoke all on function app_private.create_lead_operation_state()
  from public, anon, authenticated;
revoke all on function public.set_lead_assignee(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.set_lead_priority(uuid, uuid, public.lead_priority)
  from public, anon, authenticated;
revoke all on function public.create_lead_task(
  uuid, uuid, uuid, public.lead_task_kind, text, text, timestamptz, uuid
) from public, anon, authenticated;
revoke all on function public.close_lead_task(uuid, uuid, public.lead_task_status)
  from public, anon, authenticated;

grant execute on function public.set_lead_assignee(uuid, uuid, uuid)
  to authenticated;
grant execute on function public.set_lead_priority(uuid, uuid, public.lead_priority)
  to authenticated;
grant execute on function public.create_lead_task(
  uuid, uuid, uuid, public.lead_task_kind, text, text, timestamptz, uuid
) to authenticated;
grant execute on function public.close_lead_task(uuid, uuid, public.lead_task_status)
  to authenticated;
