alter table public.leads
  alter column contact_email drop not null;

alter table public.leads
  add constraint leads_contact_channel_present check (
    contact_email is not null or contact_phone is not null
  );

create table public.organization_notification_settings (
  organization_id uuid primary key references public.organizations (id),
  lead_alert_email text not null check (
    char_length(lead_alert_email) between 3 and 254
    and lead_alert_email = lower(lead_alert_email)
    and lead_alert_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  updated_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organization_notification_settings_set_updated_at
before update on public.organization_notification_settings
for each row execute function app_private.set_updated_at();

alter table public.organization_notification_settings enable row level security;
alter table public.organization_notification_settings force row level security;

create policy organization_notification_settings_select_privileged
on public.organization_notification_settings for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

revoke all on table public.organization_notification_settings
  from public, anon, authenticated;
grant select on public.organization_notification_settings to authenticated;

create function public.set_organization_lead_alert_email(
  target_organization_id uuid,
  target_email text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(target_email));
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'organization not found' using errcode = 'no_data_found';
  end if;
  if normalized_email is null
    or char_length(normalized_email) not between 3 and 254
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'invalid lead alert email' using errcode = 'check_violation';
  end if;

  insert into public.organization_notification_settings (
    organization_id,
    lead_alert_email,
    updated_by
  )
  values (target_organization_id, normalized_email, auth.uid())
  on conflict (organization_id) do update
  set
    lead_alert_email = excluded.lead_alert_email,
    updated_by = auth.uid(),
    updated_at = now();

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
    'notification.lead_recipient_updated',
    'organization_notification_settings',
    target_organization_id,
    jsonb_build_object('configured', true)
  );
end;
$$;

revoke all on function public.set_organization_lead_alert_email(uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_organization_lead_alert_email(uuid, text)
  to authenticated;

create or replace function app_private.lead_capture_configuration_is_valid(snapshot jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  capture jsonb := snapshot -> 'leadCapture';
  capture_version text;
  marketing jsonb;
  privacy jsonb;
begin
  if capture is null then
    return true;
  end if;
  capture_version := capture ->> 'leadCaptureSchemaVersion';
  if jsonb_typeof(capture) <> 'object'
    or capture_version not in ('1', '2')
    or jsonb_typeof(capture -> 'filesEnabled') <> 'boolean'
    or jsonb_typeof(capture -> 'privacyNotice') <> 'object'
    or (
      capture_version = '2'
      and capture ->> 'contactPolicy' not in ('email_required', 'phone_required')
    )
  then
    return false;
  end if;
  privacy := capture -> 'privacyNotice';
  if char_length(trim(coalesce(privacy ->> 'label', ''))) not between 10 and 500
    or char_length(trim(coalesce(privacy ->> 'version', ''))) not between 1 and 80
    or (privacy ->> 'textHash') !~ '^[a-f0-9]{64}$'
    or (
      privacy ? 'policyUrl'
      and (
        jsonb_typeof(privacy -> 'policyUrl') <> 'string'
        or char_length(privacy ->> 'policyUrl') > 500
        or privacy ->> 'policyUrl' !~ '^https://'
      )
    )
  then
    return false;
  end if;
  if capture ? 'marketingEmailConsent' then
    marketing := capture -> 'marketingEmailConsent';
    if jsonb_typeof(marketing) <> 'object'
      or char_length(trim(coalesce(marketing ->> 'label', ''))) not between 10 and 500
      or char_length(trim(coalesce(marketing ->> 'version', ''))) not between 1 and 80
      or (marketing ->> 'textHash') !~ '^[a-f0-9]{64}$'
    then
      return false;
    end if;
  end if;
  return true;
exception
  when others then
    return false;
end;
$$;

alter function app_private.build_widget_manifest(jsonb, uuid, text, timestamptz)
rename to build_widget_manifest_stage12u;

create function app_private.build_widget_manifest(
  snapshot jsonb,
  public_flow_id uuid,
  snapshot_digest text,
  publication_time timestamptz
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with base as (
    select app_private.build_widget_manifest_stage12u(
      snapshot,
      public_flow_id,
      snapshot_digest,
      publication_time
    ) as manifest
  )
  select case
    when snapshot #>> '{leadCapture,leadCaptureSchemaVersion}' <> '2'
      then base.manifest
    else base.manifest || jsonb_build_object(
      'leadCapture',
      jsonb_build_object(
        'leadCaptureSchemaVersion', 2,
        'contactPolicy', snapshot #>> '{leadCapture,contactPolicy}',
        'filesEnabled', snapshot #> '{leadCapture,filesEnabled}',
        'privacyNotice', jsonb_build_object(
          'label', snapshot #>> '{leadCapture,privacyNotice,label}',
          'version', snapshot #>> '{leadCapture,privacyNotice,version}',
          'textHash', snapshot #>> '{leadCapture,privacyNotice,textHash}',
          'policyUrl', coalesce(
            snapshot #> '{leadCapture,privacyNotice,policyUrl}',
            'null'::jsonb
          )
        ),
        'marketingEmailConsent', case
          when snapshot #> '{leadCapture,marketingEmailConsent}' is null
            then null
          else jsonb_build_object(
            'label', snapshot #>> '{leadCapture,marketingEmailConsent,label}',
            'version', snapshot #>> '{leadCapture,marketingEmailConsent,version}',
            'textHash', snapshot #>> '{leadCapture,marketingEmailConsent,textHash}'
          )
        end
      )
    )
  end
  from base;
$$;

create or replace function public.submit_widget_lead_stage7(
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
  file_count integer;
  pending_file_count integer;
  capture jsonb;
  contact_policy text;
  existing_lead public.leads%rowtype;
  estimation_result jsonb;
  new_lead_id uuid := gen_random_uuid();
  lead_public_id uuid := gen_random_uuid();
  normalized_email text;
  normalized_phone text;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
  submission_time timestamptz := now();
begin
  if session_token !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(contact) <> 'object'
    or jsonb_typeof(privacy_notice) <> 'object'
  then
    raise exception 'invalid lead submission' using errcode = 'check_violation';
  end if;
  normalized_email := nullif(lower(trim(coalesce(contact ->> 'email', ''))), '');
  normalized_phone := nullif(trim(coalesce(contact ->> 'phone', '')), '');
  if (
      contact ? 'email'
      and (
        jsonb_typeof(contact -> 'email') <> 'string'
        or char_length(normalized_email) not between 3 and 254
        or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    )
    or (
      contact ? 'name'
      and (
        jsonb_typeof(contact -> 'name') <> 'string'
        or char_length(trim(contact ->> 'name')) not between 2 and 120
      )
    )
    or (
      contact ? 'phone'
      and (
        jsonb_typeof(contact -> 'phone') <> 'string'
        or char_length(normalized_phone) not between 7 and 30
        or normalized_phone !~ '^\+?[0-9 ()-]+$'
      )
    )
    or privacy_notice -> 'accepted' <> 'true'::jsonb
    or jsonb_typeof(privacy_notice -> 'version') <> 'string'
    or jsonb_typeof(privacy_notice -> 'textHash') <> 'string'
    or cardinality(file_ids) > 5
  then
    raise exception 'invalid lead submission' using errcode = 'check_violation';
  end if;
  file_ids := coalesce(file_ids, array[]::uuid[]);
  select session.*
  into session_record
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256')
  for update;
  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select lead.*
  into existing_lead
  from public.leads lead
  where lead.session_id = session_record.id;
  if found then
    return jsonb_build_object(
      'leadPublicId', existing_lead.public_id,
      'submittedAt', existing_lead.submitted_at
    );
  end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  if session_record.current_step_key is not null then
    raise exception 'session is incomplete' using errcode = 'check_violation';
  end if;
  select version.snapshot
  into snapshot_document
  from public.flow_versions version
  where version.id = session_record.flow_version_id;
  capture := snapshot_document -> 'leadCapture';
  contact_policy := case capture ->> 'leadCaptureSchemaVersion'
    when '2' then capture ->> 'contactPolicy'
    else 'email_required'
  end;
  if capture is null
    or not app_private.lead_capture_configuration_is_valid(snapshot_document)
    or (contact_policy = 'email_required' and normalized_email is null)
    or (contact_policy = 'phone_required' and normalized_phone is null)
    or privacy_notice ->> 'version' <> capture #>> '{privacyNotice,version}'
    or privacy_notice ->> 'textHash' <> capture #>> '{privacyNotice,textHash}'
    or (
      marketing_email_consent is not null
      and (
        normalized_email is null
        or jsonb_typeof(marketing_email_consent) <> 'object'
        or capture #> '{marketingEmailConsent}' is null
        or marketing_email_consent -> 'accepted' <> 'true'::jsonb
        or jsonb_typeof(marketing_email_consent -> 'version') <> 'string'
        or jsonb_typeof(marketing_email_consent -> 'textHash') <> 'string'
        or marketing_email_consent ->> 'version'
          <> capture #>> '{marketingEmailConsent,version}'
        or marketing_email_consent ->> 'textHash'
          <> capture #>> '{marketingEmailConsent,textHash}'
      )
    )
  then
    raise exception 'invalid consent proof' using errcode = 'check_violation';
  end if;
  select count(*)
  into file_count
  from public.lead_files stored_file
  where stored_file.session_id = session_record.id
    and stored_file.id = any(file_ids)
    and stored_file.status = 'verified';
  select count(*)
  into pending_file_count
  from public.lead_files stored_file
  where stored_file.session_id = session_record.id
    and stored_file.status = 'pending';
  if pending_file_count <> 0
    or file_count <> cardinality(file_ids)
    or file_count <> (
      select count(*)
      from public.lead_files stored_file
      where stored_file.session_id = session_record.id
        and stored_file.status = 'verified'
    )
    or cardinality(file_ids) <> cardinality(array(select distinct unnest(file_ids)))
  then
    raise exception 'invalid lead files' using errcode = 'check_violation';
  end if;
  estimation_result := app_private.calculate_estimation(
    snapshot_document,
    (
      select coalesce(
        jsonb_object_agg(answer.step_key, answer.answer),
        '{}'::jsonb
      )
      from public.session_answers answer
      where answer.session_id = session_record.id
    )
  );
  insert into public.leads (
    id,
    public_id,
    organization_id,
    flow_id,
    flow_version_id,
    flow_name,
    flow_title,
    session_id,
    submit_mutation_id,
    contact_email,
    contact_name,
    contact_phone,
    score,
    score_category_key,
    score_category_label,
    price_min_minor,
    price_max_minor,
    price_currency,
    price_presentation,
    estimation_explanation,
    submitted_at
  )
  values (
    new_lead_id,
    lead_public_id,
    session_record.organization_id,
    session_record.flow_id,
    session_record.flow_version_id,
    (
      select flow.name
      from public.flows flow
      where flow.id = session_record.flow_id
    ),
    snapshot_document ->> 'title',
    session_record.id,
    mutation_id,
    normalized_email,
    nullif(trim(contact ->> 'name'), ''),
    normalized_phone,
    (estimation_result #>> '{scoring,score}')::smallint,
    estimation_result #>> '{scoring,category,key}',
    estimation_result #>> '{scoring,category,label}',
    (estimation_result #>> '{pricing,minMinor}')::bigint,
    (estimation_result #>> '{pricing,maxMinor}')::bigint,
    estimation_result #>> '{pricing,currency}',
    estimation_result #>> '{pricing,presentation}',
    estimation_result,
    submission_time
  );
  insert into public.lead_answers (
    organization_id,
    lead_id,
    step_key,
    question_title,
    answer
  )
  select
    session_record.organization_id,
    new_lead_id,
    answer.step_key,
    matched_step.step ->> 'title',
    answer.answer
  from public.session_answers answer
  join lateral (
    select step_document as step
    from jsonb_array_elements(snapshot_document -> 'steps') step_document
    where step_document ->> 'key' = answer.step_key
  ) matched_step on true
  where answer.session_id = session_record.id;
  insert into public.consent_records (
    organization_id,
    lead_id,
    type,
    accepted,
    content_version,
    content_hash,
    recorded_at
  )
  values (
    session_record.organization_id,
    new_lead_id,
    'privacy_notice',
    true,
    privacy_notice ->> 'version',
    privacy_notice ->> 'textHash',
    submission_time
  );
  if marketing_email_consent is not null then
    insert into public.consent_records (
      organization_id,
      lead_id,
      type,
      accepted,
      content_version,
      content_hash,
      recorded_at
    )
    values (
      session_record.organization_id,
      new_lead_id,
      'marketing_email',
      true,
      marketing_email_consent ->> 'version',
      marketing_email_consent ->> 'textHash',
      submission_time
    );
  end if;
  update public.lead_files
  set lead_id = new_lead_id
  where session_id = session_record.id
    and id = any(file_ids);
  insert into public.lead_status_history (
    organization_id,
    lead_id,
    from_status,
    to_status,
    changed_by,
    changed_at
  )
  values (
    session_record.organization_id,
    new_lead_id,
    null,
    'new',
    null,
    submission_time
  );
  return jsonb_build_object(
    'leadPublicId', lead_public_id,
    'submittedAt', submission_time
  );
end;
$$;

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
      'lead-customer-v1'
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

drop function public.claim_notification_batch(uuid, integer, text);

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
            'answer', answer.answer
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
  join public.leads lead on lead.id = claimed.lead_id
  join public.organizations organization on organization.id = claimed.organization_id;
end;
$$;

revoke all on function app_private.build_widget_manifest_stage12u(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function public.submit_widget_lead_stage7(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) from public, anon, authenticated;
revoke all on function app_private.enqueue_lead_notifications(uuid)
  from public, anon, authenticated;
revoke all on function public.claim_notification_batch(uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.claim_notification_batch(uuid, integer, text)
  to service_role;
