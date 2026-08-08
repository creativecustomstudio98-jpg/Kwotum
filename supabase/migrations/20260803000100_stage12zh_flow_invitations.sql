create type public.flow_invitation_status as enum (
  'pending',
  'processing',
  'retry',
  'sent',
  'failed'
);

alter table public.published_flows
  add constraint published_flows_tenant_public_unique
  unique (organization_id, flow_id, public_id);

create table public.flow_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  flow_id uuid not null references public.flows (id),
  flow_version_id uuid not null references public.flow_versions (id),
  public_flow_id uuid not null,
  request_id uuid not null,
  recipient_email text not null check (
    char_length(recipient_email) between 3 and 254
    and recipient_email = lower(recipient_email)
    and recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  recipient_name text check (
    recipient_name is null
    or char_length(recipient_name) between 2 and 120
  ),
  personal_message text check (
    personal_message is null
    or char_length(personal_message) between 1 and 1000
  ),
  created_by uuid not null references auth.users (id),
  template_version text not null default 'flow-invitation-v1'
    check (template_version = 'flow-invitation-v1'),
  status public.flow_invitation_status not null default 'pending',
  attempt_count smallint not null default 0 check (attempt_count between 0 and 5),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  lock_token uuid,
  sent_at timestamptz,
  provider text check (provider is null or provider in ('test', 'resend')),
  provider_message_id text check (
    provider_message_id is null
    or char_length(provider_message_id) between 1 and 256
  ),
  last_error_code public.notification_error_code,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, request_id),
  constraint flow_invitations_flow_tenant_fk foreign key (
    organization_id,
    flow_id
  ) references public.flows (organization_id, id),
  constraint flow_invitations_version_tenant_fk foreign key (
    organization_id,
    flow_id,
    flow_version_id
  ) references public.flow_versions (organization_id, flow_id, id),
  constraint flow_invitations_publication_fk foreign key (
    organization_id,
    flow_id,
    public_flow_id
  ) references public.published_flows (organization_id, flow_id, public_id),
  constraint flow_invitations_state_consistent check (
    (
      status in ('pending', 'retry')
      and locked_at is null
      and lock_token is null
      and sent_at is null
    )
    or (
      status = 'processing'
      and locked_at is not null
      and lock_token is not null
      and sent_at is null
      and provider is not null
    )
    or (
      status = 'sent'
      and locked_at is null
      and lock_token is null
      and sent_at is not null
      and provider is not null
      and provider_message_id is not null
      and last_error_code is null
    )
    or (
      status = 'failed'
      and locked_at is null
      and lock_token is null
      and sent_at is null
      and last_error_code is not null
    )
  )
);

create index flow_invitations_ready_idx
  on public.flow_invitations (status, available_at, created_at)
  where status in ('pending', 'retry');
create index flow_invitations_organization_flow_idx
  on public.flow_invitations (organization_id, flow_id, created_at desc);
create index flow_invitations_recipient_idx
  on public.flow_invitations (organization_id, recipient_email, created_at desc);

create table public.flow_invitation_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  invitation_id uuid not null references public.flow_invitations (id),
  attempt_number smallint not null check (attempt_number between 1 and 5),
  provider text not null check (provider in ('test', 'resend')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome public.notification_attempt_outcome,
  error_code public.notification_error_code,
  provider_message_id text check (
    provider_message_id is null
    or char_length(provider_message_id) between 1 and 256
  ),
  unique (invitation_id, attempt_number),
  constraint invitation_attempt_invitation_tenant_fk foreign key (
    organization_id,
    invitation_id
  ) references public.flow_invitations (organization_id, id),
  constraint invitation_attempt_result_consistent check (
    (
      finished_at is null
      and outcome is null
      and error_code is null
      and provider_message_id is null
    )
    or (
      finished_at is not null
      and outcome = 'sent'
      and error_code is null
      and provider_message_id is not null
    )
    or (
      finished_at is not null
      and outcome in ('retry', 'failed')
      and error_code is not null
      and provider_message_id is null
    )
  )
);

create index invitation_attempts_organization_invitation_idx
  on public.flow_invitation_delivery_attempts (
    organization_id,
    invitation_id,
    attempt_number desc
  );

create trigger flow_invitations_set_updated_at
before update on public.flow_invitations
for each row execute function app_private.set_updated_at();

create function public.create_flow_invitation(
  target_organization_id uuid,
  target_flow_id uuid,
  idempotency_key uuid,
  target_recipient_email text,
  target_recipient_name text default null,
  target_personal_message text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  existing_record public.flow_invitations%rowtype;
  normalized_email text := lower(trim(target_recipient_email));
  normalized_name text := nullif(trim(target_recipient_name), '');
  normalized_message text := nullif(trim(target_personal_message), '');
  publication_record public.published_flows%rowtype;
  result_record public.flow_invitations%rowtype;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'flow invitation is forbidden' using errcode = 'insufficient_privilege';
  end if;
  if idempotency_key is null
    or normalized_email is null
    or char_length(normalized_email) not between 3 and 254
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or (normalized_name is not null and char_length(normalized_name) not between 2 and 120)
    or (normalized_message is not null and char_length(normalized_message) > 1000)
  then
    raise exception 'invalid flow invitation' using errcode = 'invalid_parameter_value';
  end if;

  select published.*
  into publication_record
  from public.published_flows published
  join public.flow_versions version
    on version.id = published.flow_version_id
    and version.organization_id = published.organization_id
    and version.flow_id = published.flow_id
    and version.status = 'published'
  where published.organization_id = target_organization_id
    and published.flow_id = target_flow_id;
  if not found then
    raise exception 'published flow not found' using errcode = 'no_data_found';
  end if;

  insert into public.flow_invitations (
    organization_id,
    flow_id,
    flow_version_id,
    public_flow_id,
    request_id,
    recipient_email,
    recipient_name,
    personal_message,
    created_by
  ) values (
    target_organization_id,
    target_flow_id,
    publication_record.flow_version_id,
    publication_record.public_id,
    idempotency_key,
    normalized_email,
    normalized_name,
    normalized_message,
    actor_id
  )
  on conflict (organization_id, request_id) do nothing
  returning * into result_record;

  if result_record.id is null then
    select invitation.*
    into existing_record
    from public.flow_invitations invitation
    where invitation.organization_id = target_organization_id
      and invitation.request_id = idempotency_key;
    if existing_record.flow_id <> target_flow_id
      or existing_record.recipient_email <> normalized_email
      or existing_record.recipient_name is distinct from normalized_name
      or existing_record.personal_message is distinct from normalized_message
    then
      raise exception 'idempotency key reused with different invitation'
        using errcode = 'unique_violation';
    end if;
    result_record := existing_record;
  else
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
      'flow.invitation_created',
      'flow_invitations',
      result_record.id,
      jsonb_build_object(
        'flowId', target_flow_id,
        'flowVersionId', publication_record.flow_version_id
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

create function public.claim_flow_invitation_batch(
  worker_id uuid,
  batch_size integer,
  delivery_provider text
)
returns table (
  invitation_id uuid,
  lock_token uuid,
  organization_id uuid,
  flow_id uuid,
  public_flow_id uuid,
  recipient_email text,
  recipient_name text,
  personal_message text,
  template_version text,
  attempt_number smallint,
  company_name text,
  flow_title text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if worker_id is null
    or batch_size not between 1 and 50
    or delivery_provider not in ('test', 'resend')
  then
    raise exception 'invitation worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;

  update public.flow_invitation_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = case
      when invitation.attempt_count >= 5
        then 'failed'::public.notification_attempt_outcome
      else 'retry'::public.notification_attempt_outcome
    end,
    error_code = 'worker_timeout'
  from public.flow_invitations invitation
  where invitation.status = 'processing'
    and invitation.locked_at < now() - interval '15 minutes'
    and attempt.invitation_id = invitation.id
    and attempt.attempt_number = invitation.attempt_count
    and attempt.finished_at is null;

  update public.flow_invitations invitation
  set
    status = case
      when invitation.attempt_count >= 5
        then 'failed'::public.flow_invitation_status
      else 'retry'::public.flow_invitation_status
    end,
    available_at = now(),
    locked_at = null,
    lock_token = null,
    last_error_code = 'worker_timeout'
  where invitation.status = 'processing'
    and invitation.locked_at < now() - interval '15 minutes';

  return query
  with candidates as (
    select invitation.id
    from public.flow_invitations invitation
    where invitation.status in ('pending', 'retry')
      and invitation.available_at <= now()
      and invitation.attempt_count < 5
    order by invitation.available_at, invitation.created_at, invitation.id
    for update skip locked
    limit batch_size
  ),
  claimed as (
    update public.flow_invitations invitation
    set
      status = 'processing',
      attempt_count = invitation.attempt_count + 1,
      locked_at = now(),
      lock_token = gen_random_uuid(),
      provider = delivery_provider,
      last_error_code = null
    from candidates
    where invitation.id = candidates.id
    returning invitation.*
  ),
  attempts as (
    insert into public.flow_invitation_delivery_attempts (
      organization_id,
      invitation_id,
      attempt_number,
      provider
    )
    select
      claimed.organization_id,
      claimed.id,
      claimed.attempt_count,
      delivery_provider
    from claimed
    returning flow_invitation_delivery_attempts.invitation_id
  )
  select
    claimed.id,
    claimed.lock_token,
    claimed.organization_id,
    claimed.flow_id,
    claimed.public_flow_id,
    claimed.recipient_email,
    claimed.recipient_name,
    claimed.personal_message,
    claimed.template_version,
    claimed.attempt_count,
    organization.name,
    flow.name
  from claimed
  join attempts on attempts.invitation_id = claimed.id
  join public.organizations organization on organization.id = claimed.organization_id
  join public.flows flow on flow.id = claimed.flow_id;
end;
$$;

create function public.complete_flow_invitation_delivery(
  target_invitation_id uuid,
  target_lock_token uuid,
  delivery_provider text,
  target_provider_message_id text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_attempt smallint;
  target_organization_id uuid;
begin
  if delivery_provider not in ('test', 'resend')
    or char_length(target_provider_message_id) not between 1 and 256
  then
    raise exception 'invitation worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;
  select invitation.organization_id, invitation.attempt_count
  into target_organization_id, current_attempt
  from public.flow_invitations invitation
  where invitation.id = target_invitation_id
    and invitation.status = 'processing'
    and invitation.lock_token = target_lock_token
    and invitation.provider = delivery_provider
  for update;
  if not found then
    raise exception 'invitation lock not found' using errcode = 'no_data_found';
  end if;
  update public.flow_invitation_delivery_attempts
  set
    finished_at = now(),
    outcome = 'sent',
    provider_message_id = target_provider_message_id
  where invitation_id = target_invitation_id
    and attempt_number = current_attempt
    and organization_id = target_organization_id
    and finished_at is null;
  update public.flow_invitations
  set
    status = 'sent',
    sent_at = now(),
    locked_at = null,
    lock_token = null,
    provider_message_id = target_provider_message_id,
    last_error_code = null
  where id = target_invitation_id;
end;
$$;

create function public.fail_flow_invitation_delivery(
  target_invitation_id uuid,
  target_lock_token uuid,
  delivery_provider text,
  target_error_code public.notification_error_code,
  retryable boolean
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_attempt smallint;
  next_status public.flow_invitation_status;
  target_organization_id uuid;
begin
  if delivery_provider not in ('test', 'resend')
    or target_error_code in ('recipient_unavailable', 'worker_timeout')
  then
    raise exception 'invitation worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;
  select invitation.organization_id, invitation.attempt_count
  into target_organization_id, current_attempt
  from public.flow_invitations invitation
  where invitation.id = target_invitation_id
    and invitation.status = 'processing'
    and invitation.lock_token = target_lock_token
    and invitation.provider = delivery_provider
  for update;
  if not found then
    raise exception 'invitation lock not found' using errcode = 'no_data_found';
  end if;
  next_status := case
    when retryable and current_attempt < 5 then 'retry'::public.flow_invitation_status
    else 'failed'::public.flow_invitation_status
  end;
  update public.flow_invitation_delivery_attempts
  set
    finished_at = now(),
    outcome = case
      when next_status = 'retry' then 'retry'::public.notification_attempt_outcome
      else 'failed'::public.notification_attempt_outcome
    end,
    error_code = target_error_code
  where invitation_id = target_invitation_id
    and attempt_number = current_attempt
    and organization_id = target_organization_id
    and finished_at is null;
  update public.flow_invitations
  set
    status = next_status,
    available_at = case current_attempt
      when 1 then now() + interval '1 minute'
      when 2 then now() + interval '5 minutes'
      when 3 then now() + interval '30 minutes'
      else now() + interval '2 hours'
    end,
    locked_at = null,
    lock_token = null,
    last_error_code = target_error_code
  where id = target_invitation_id;
end;
$$;

alter table public.flow_invitations enable row level security;
alter table public.flow_invitations force row level security;
alter table public.flow_invitation_delivery_attempts enable row level security;
alter table public.flow_invitation_delivery_attempts force row level security;

create policy flow_invitations_select_privileged_member
on public.flow_invitations for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flow_invitation_attempts_select_privileged_member
on public.flow_invitation_delivery_attempts for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

revoke all on table public.flow_invitations from public, anon, authenticated;
revoke all on table public.flow_invitation_delivery_attempts from public, anon, authenticated;
grant select on public.flow_invitations to authenticated;
grant select on public.flow_invitation_delivery_attempts to authenticated;

revoke all on function public.create_flow_invitation(
  uuid, uuid, uuid, text, text, text
) from public, anon, authenticated;
revoke all on function public.claim_flow_invitation_batch(uuid, integer, text)
  from public, anon, authenticated;
revoke all on function public.complete_flow_invitation_delivery(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.fail_flow_invitation_delivery(
  uuid, uuid, text, public.notification_error_code, boolean
) from public, anon, authenticated;

grant execute on function public.create_flow_invitation(
  uuid, uuid, uuid, text, text, text
) to authenticated;
grant execute on function public.claim_flow_invitation_batch(uuid, integer, text)
  to service_role;
grant execute on function public.complete_flow_invitation_delivery(uuid, uuid, text, text)
  to service_role;
grant execute on function public.fail_flow_invitation_delivery(
  uuid, uuid, text, public.notification_error_code, boolean
) to service_role;
