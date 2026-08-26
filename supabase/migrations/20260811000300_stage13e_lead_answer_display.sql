alter table public.notifications
  drop constraint notifications_template_version_check,
  drop constraint notifications_template_matches_kind,
  add constraint notifications_template_version_check check (
    template_version in (
      'lead-customer-v1',
      'lead-customer-v2',
      'lead-company-v1',
      'lead-company-v2'
    )
  ),
  add constraint notifications_template_matches_kind check (
    (
      kind = 'lead_customer_confirmation'
      and template_version in ('lead-customer-v1', 'lead-customer-v2')
    )
    or (
      kind = 'lead_company_alert'
      and template_version in ('lead-company-v1', 'lead-company-v2')
    )
  );

alter table public.flow_invitations
  alter column template_version set default 'flow-invitation-v2',
  drop constraint flow_invitations_template_version_check,
  add constraint flow_invitations_template_version_check check (
    template_version in ('flow-invitation-v1', 'flow-invitation-v2')
  );

create or replace function app_private.enqueue_lead_notifications(target_lead_id uuid)
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

  select settings.lead_alert_email
  into company_recipient
  from public.organization_notification_settings settings
  where settings.organization_id = lead_record.organization_id;

  if company_recipient is null then
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
  end if;

  if lead_record.contact_email is not null then
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
      'lead-customer-v2'
    )
    on conflict (lead_id, kind) do nothing;
  end if;

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
    'lead-company-v2',
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

alter table public.lead_answers
  add column display_answer jsonb;

comment on column public.lead_answers.display_answer is
  'Human-readable answer derived from the immutable lead flow version; answer retains the raw option key.';

create function app_private.resolve_lead_answer_display(
  snapshot jsonb,
  target_step_key text,
  raw_answer jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  resolved_answer jsonb;
  step_document jsonb;
begin
  select step
  into step_document
  from jsonb_array_elements(coalesce(snapshot -> 'steps', '[]'::jsonb)) step
  where step ->> 'key' = target_step_key
  limit 1;

  if step_document is null then
    return raw_answer;
  end if;

  if jsonb_typeof(raw_answer) = 'string'
    and raw_answer #>> '{}' = '__unknown__'
  then
    return to_jsonb('Do ustalenia'::text);
  end if;

  if step_document ->> 'type' = 'single_choice'
    and jsonb_typeof(raw_answer) = 'string'
  then
    select to_jsonb(option ->> 'label')
    into resolved_answer
    from jsonb_array_elements(
      coalesce(step_document -> 'options', '[]'::jsonb)
    ) option
    where option ->> 'key' = raw_answer #>> '{}'
    limit 1;

    return coalesce(resolved_answer, raw_answer);
  end if;

  if step_document ->> 'type' = 'multiple_choice'
    and jsonb_typeof(raw_answer) = 'array'
  then
    select coalesce(
      jsonb_agg(
        coalesce(to_jsonb(matched_option.label), selected.value)
        order by selected.position
      ),
      '[]'::jsonb
    )
    into resolved_answer
    from jsonb_array_elements(raw_answer)
      with ordinality as selected(value, position)
    left join lateral (
      select option ->> 'label' as label
      from jsonb_array_elements(
        coalesce(step_document -> 'options', '[]'::jsonb)
      ) option
      where option ->> 'key' = selected.value #>> '{}'
      limit 1
    ) matched_option on true;

    return resolved_answer;
  end if;

  return raw_answer;
end;
$$;

create function app_private.set_lead_answer_display()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  immutable_snapshot jsonb;
begin
  select version.snapshot
  into immutable_snapshot
  from public.leads lead
  join public.flow_versions version
    on version.id = lead.flow_version_id
    and version.organization_id = lead.organization_id
    and version.flow_id = lead.flow_id
  where lead.id = new.lead_id
    and lead.organization_id = new.organization_id;

  if not found then
    raise exception 'lead answer tenant or flow version is invalid'
      using errcode = 'foreign_key_violation';
  end if;

  new.display_answer := app_private.resolve_lead_answer_display(
    immutable_snapshot,
    new.step_key,
    new.answer
  );
  return new;
end;
$$;

update public.lead_answers answer
set display_answer = app_private.resolve_lead_answer_display(
  version.snapshot,
  answer.step_key,
  answer.answer
)
from public.leads lead
join public.flow_versions version
  on version.id = lead.flow_version_id
  and version.organization_id = lead.organization_id
  and version.flow_id = lead.flow_id
where lead.id = answer.lead_id
  and lead.organization_id = answer.organization_id;

do $$
begin
  if exists (
    select 1
    from public.lead_answers answer
    where answer.display_answer is null
  ) then
    raise exception 'lead answer display backfill was incomplete';
  end if;
end;
$$;

alter table public.lead_answers
  alter column display_answer set not null,
  add constraint lead_answers_display_answer_size_check check (
    octet_length(display_answer::text) <= 16384
  );

create trigger lead_answers_set_display
before insert or update of organization_id, lead_id, step_key, answer, display_answer
on public.lead_answers
for each row execute function app_private.set_lead_answer_display();

create or replace function public.claim_notification_batch(
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
  contact_phone text,
  answers jsonb,
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
    lead.contact_phone,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'question', answer.question_title,
            'answer', case
              when claimed.template_version in (
                'lead-customer-v2',
                'lead-company-v2'
              ) then answer.display_answer
              else answer.answer
            end
          )
          order by answer.created_at, answer.id
        )
        from public.lead_answers answer
        where answer.lead_id = lead.id
          and answer.organization_id = claimed.organization_id
      ),
      '[]'::jsonb
    ),
    lead.score,
    lead.price_min_minor,
    lead.price_max_minor,
    lead.price_currency,
    lead.price_presentation,
    lead.submitted_at
  from claimed
  join attempts on attempts.notification_id = claimed.id
  join public.leads lead
    on lead.id = claimed.lead_id
    and lead.organization_id = claimed.organization_id
  join public.organizations organization on organization.id = claimed.organization_id;
end;
$$;

revoke all on function app_private.resolve_lead_answer_display(jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function app_private.set_lead_answer_display()
  from public, anon, authenticated, service_role;
revoke all on function public.claim_notification_batch(uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.claim_notification_batch(uuid, integer, text)
  to service_role;
