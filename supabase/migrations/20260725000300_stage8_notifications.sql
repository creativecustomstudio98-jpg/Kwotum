create type public.notification_kind as enum (
  'lead_customer_confirmation',
  'lead_company_alert'
);

create type public.notification_status as enum (
  'pending',
  'processing',
  'retry',
  'sent',
  'failed'
);

create type public.notification_attempt_outcome as enum (
  'sent',
  'retry',
  'failed'
);

create type public.notification_error_code as enum (
  'configuration',
  'network',
  'provider_4xx',
  'provider_429',
  'provider_5xx',
  'provider_invalid_response',
  'recipient_unavailable',
  'worker_timeout'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null references public.leads (id),
  kind public.notification_kind not null,
  recipient_email text check (
    recipient_email is null
    or (
      char_length(recipient_email) between 3 and 254
      and recipient_email = lower(recipient_email)
      and recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  ),
  template_version text not null check (
    template_version in ('lead-customer-v1', 'lead-company-v1')
  ),
  status public.notification_status not null default 'pending',
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
  unique (lead_id, kind),
  unique (organization_id, id),
  constraint notifications_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id),
  constraint notifications_template_matches_kind check (
    (kind = 'lead_customer_confirmation' and template_version = 'lead-customer-v1')
    or (kind = 'lead_company_alert' and template_version = 'lead-company-v1')
  ),
  constraint notifications_state_consistent check (
    (
      status in ('pending', 'retry')
      and recipient_email is not null
      and locked_at is null
      and lock_token is null
      and sent_at is null
    )
    or (
      status = 'processing'
      and recipient_email is not null
      and locked_at is not null
      and lock_token is not null
      and sent_at is null
    )
    or (
      status = 'sent'
      and recipient_email is not null
      and locked_at is null
      and lock_token is null
      and sent_at is not null
      and provider is not null
      and provider_message_id is not null
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

create index notifications_ready_idx
  on public.notifications (status, available_at, created_at)
  where status in ('pending', 'retry');
create index notifications_organization_lead_idx
  on public.notifications (organization_id, lead_id, created_at);

create table public.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  notification_id uuid not null references public.notifications (id),
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
  unique (notification_id, attempt_number),
  constraint notification_attempts_notification_tenant_fk foreign key (
    organization_id,
    notification_id
  ) references public.notifications (organization_id, id),
  constraint notification_attempts_result_consistent check (
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

create index notification_attempts_organization_notification_idx
  on public.notification_delivery_attempts (
    organization_id,
    notification_id,
    attempt_number desc
  );

create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function app_private.set_updated_at();

create function app_private.enqueue_lead_notifications(target_lead_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  company_recipient text;
  lead_record public.leads%rowtype;
begin
  select lead.*
  into lead_record
  from public.leads lead
  where lead.id = target_lead_id;
  if not found then
    raise exception 'lead not found' using errcode = 'no_data_found';
  end if;

  select lower(account.email)
  into company_recipient
  from public.organization_members membership
  join auth.users account on account.id = membership.user_id
  where membership.organization_id = lead_record.organization_id
    and membership.role = 'owner'
    and membership.status = 'active'
    and account.email is not null
  order by membership.joined_at, membership.created_at, membership.user_id
  limit 1;

  insert into public.notifications (
    organization_id,
    lead_id,
    kind,
    recipient_email,
    template_version
  )
  values (
    lead_record.organization_id,
    lead_record.id,
    'lead_customer_confirmation',
    lead_record.contact_email,
    'lead-customer-v1'
  )
  on conflict (lead_id, kind) do nothing;

  insert into public.notifications (
    organization_id,
    lead_id,
    kind,
    recipient_email,
    template_version,
    status,
    last_error_code
  )
  values (
    lead_record.organization_id,
    lead_record.id,
    'lead_company_alert',
    company_recipient,
    'lead-company-v1',
    case
      when company_recipient is null then 'failed'::public.notification_status
      else 'pending'::public.notification_status
    end,
    case
      when company_recipient is null
        then 'recipient_unavailable'::public.notification_error_code
      else null
    end
  )
  on conflict (lead_id, kind) do nothing;
end;
$$;

alter function public.submit_widget_lead(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) rename to submit_widget_lead_stage7;

create function public.submit_widget_lead(
  session_token text,
  mutation_id uuid,
  contact jsonb,
  privacy_notice jsonb,
  marketing_email_consent jsonb,
  file_ids uuid[]
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  lead_id uuid;
  result jsonb;
begin
  result := public.submit_widget_lead_stage7(
    session_token,
    mutation_id,
    contact,
    privacy_notice,
    marketing_email_consent,
    file_ids
  );
  select lead.id
  into lead_id
  from public.leads lead
  where lead.public_id = (result ->> 'leadPublicId')::uuid;
  if not found then
    raise exception 'lead not found after submit';
  end if;
  perform app_private.enqueue_lead_notifications(lead_id);
  return result;
end;
$$;

create function public.claim_notification_batch(
  worker_id uuid,
  batch_size integer,
  delivery_provider text
)
returns table (
  notification_id uuid,
  lock_token uuid,
  organization_id uuid,
  lead_id uuid,
  kind public.notification_kind,
  recipient_email text,
  template_version text,
  attempt_number smallint,
  company_name text,
  flow_title text,
  contact_email text,
  contact_name text,
  score smallint,
  price_min_minor bigint,
  price_max_minor bigint,
  price_currency text,
  price_presentation text,
  submitted_at timestamptz
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
    raise exception 'notification worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;

  update public.notification_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = case
      when notification.attempt_count >= 5
        then 'failed'::public.notification_attempt_outcome
      else 'retry'::public.notification_attempt_outcome
    end,
    error_code = 'worker_timeout'
  from public.notifications notification
  where notification.status = 'processing'
    and notification.locked_at < now() - interval '15 minutes'
    and attempt.notification_id = notification.id
    and attempt.attempt_number = notification.attempt_count
    and attempt.finished_at is null;

  update public.notifications notification
  set
    status = case
      when notification.attempt_count >= 5
        then 'failed'::public.notification_status
      else 'retry'::public.notification_status
    end,
    available_at = now(),
    locked_at = null,
    lock_token = null,
    last_error_code = 'worker_timeout'
  where notification.status = 'processing'
    and notification.locked_at < now() - interval '15 minutes';

  return query
  with candidates as (
    select notification.id
    from public.notifications notification
    where notification.status in ('pending', 'retry')
      and notification.available_at <= now()
      and notification.attempt_count < 5
    order by notification.available_at, notification.created_at, notification.id
    for update skip locked
    limit batch_size
  ),
  claimed as (
    update public.notifications notification
    set
      status = 'processing',
      attempt_count = notification.attempt_count + 1,
      locked_at = now(),
      lock_token = gen_random_uuid(),
      provider = delivery_provider,
      last_error_code = null
    from candidates
    where notification.id = candidates.id
    returning notification.*
  ),
  attempts as (
    insert into public.notification_delivery_attempts (
      organization_id,
      notification_id,
      attempt_number,
      provider
    )
    select
      claimed.organization_id,
      claimed.id,
      claimed.attempt_count,
      delivery_provider
    from claimed
    returning notification_delivery_attempts.notification_id
  )
  select
    claimed.id,
    claimed.lock_token,
    claimed.organization_id,
    claimed.lead_id,
    claimed.kind,
    claimed.recipient_email,
    claimed.template_version,
    claimed.attempt_count,
    organization.name,
    lead.flow_title,
    lead.contact_email,
    lead.contact_name,
    lead.score,
    lead.price_min_minor,
    lead.price_max_minor,
    lead.price_currency,
    lead.price_presentation,
    lead.submitted_at
  from claimed
  join attempts on attempts.notification_id = claimed.id
  join public.leads lead on lead.id = claimed.lead_id
  join public.organizations organization on organization.id = claimed.organization_id;
end;
$$;

create function public.complete_notification_delivery(
  target_notification_id uuid,
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
    raise exception 'notification worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;
  select notification.organization_id, notification.attempt_count
  into target_organization_id, current_attempt
  from public.notifications notification
  where notification.id = target_notification_id
    and notification.status = 'processing'
    and notification.lock_token = target_lock_token
    and notification.provider = delivery_provider
  for update;
  if not found then
    raise exception 'notification lock not found' using errcode = 'no_data_found';
  end if;
  update public.notification_delivery_attempts
  set
    finished_at = now(),
    outcome = 'sent',
    provider_message_id = target_provider_message_id
  where notification_id = target_notification_id
    and attempt_number = current_attempt
    and organization_id = target_organization_id
    and finished_at is null;
  update public.notifications
  set
    status = 'sent',
    sent_at = now(),
    locked_at = null,
    lock_token = null,
    provider_message_id = target_provider_message_id,
    last_error_code = null
  where id = target_notification_id;
end;
$$;

create function public.fail_notification_delivery(
  target_notification_id uuid,
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
  next_status public.notification_status;
  target_organization_id uuid;
begin
  if delivery_provider not in ('test', 'resend')
    or target_error_code in ('recipient_unavailable', 'worker_timeout')
  then
    raise exception 'notification worker is not authorized'
      using errcode = 'insufficient_privilege';
  end if;
  select notification.organization_id, notification.attempt_count
  into target_organization_id, current_attempt
  from public.notifications notification
  where notification.id = target_notification_id
    and notification.status = 'processing'
    and notification.lock_token = target_lock_token
    and notification.provider = delivery_provider
  for update;
  if not found then
    raise exception 'notification lock not found' using errcode = 'no_data_found';
  end if;
  next_status := case
    when retryable and current_attempt < 5 then 'retry'::public.notification_status
    else 'failed'::public.notification_status
  end;
  update public.notification_delivery_attempts
  set
    finished_at = now(),
    outcome = case
      when next_status = 'retry' then 'retry'::public.notification_attempt_outcome
      else 'failed'::public.notification_attempt_outcome
    end,
    error_code = target_error_code
  where notification_id = target_notification_id
    and attempt_number = current_attempt
    and organization_id = target_organization_id
    and finished_at is null;
  update public.notifications
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
  where id = target_notification_id;
end;
$$;

alter table public.notifications enable row level security;
alter table public.notifications force row level security;
alter table public.notification_delivery_attempts enable row level security;
alter table public.notification_delivery_attempts force row level security;

create policy notifications_select_member
on public.notifications for select to authenticated
using (app_private.is_active_member(organization_id));

create policy notification_attempts_select_member
on public.notification_delivery_attempts for select to authenticated
using (app_private.is_active_member(organization_id));

revoke all on table public.notifications from public, anon, authenticated;
revoke all on table public.notification_delivery_attempts from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant select on public.notification_delivery_attempts to authenticated;

revoke all on function app_private.enqueue_lead_notifications(uuid)
  from public, anon, authenticated;
revoke all on function public.submit_widget_lead_stage7(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) from public, anon, authenticated;
revoke all on function public.submit_widget_lead(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) from public;
revoke all on function public.claim_notification_batch(uuid, integer, text)
  from public, anon, authenticated;
revoke all on function public.complete_notification_delivery(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.fail_notification_delivery(
  uuid, uuid, text, public.notification_error_code, boolean
) from public, anon, authenticated;

grant execute on function public.submit_widget_lead(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) to anon, authenticated;
grant execute on function public.claim_notification_batch(uuid, integer, text)
  to service_role;
grant execute on function public.complete_notification_delivery(uuid, uuid, text, text)
  to service_role;
grant execute on function public.fail_notification_delivery(
  uuid, uuid, text, public.notification_error_code, boolean
) to service_role;
