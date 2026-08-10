create type public.lead_status as enum (
  'new',
  'in_progress',
  'qualified',
  'won',
  'lost',
  'spam'
);

create type public.consent_record_type as enum (
  'privacy_notice',
  'marketing_email'
);

create type public.lead_file_status as enum (
  'pending',
  'verified',
  'rejected'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  public_id uuid not null unique default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  flow_id uuid not null references public.flows (id),
  flow_version_id uuid not null references public.flow_versions (id),
  flow_name text not null check (char_length(flow_name) between 2 and 160),
  flow_title text not null check (char_length(flow_title) between 2 and 160),
  session_id uuid not null unique references public.widget_sessions (id),
  submit_mutation_id uuid not null,
  status public.lead_status not null default 'new',
  contact_email text not null check (
    char_length(contact_email) between 3 and 254
    and contact_email = lower(contact_email)
    and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  contact_name text check (
    contact_name is null
    or char_length(contact_name) between 2 and 120
  ),
  contact_phone text check (
    contact_phone is null
    or (
      char_length(contact_phone) between 7 and 30
      and contact_phone ~ '^\+?[0-9 ()-]+$'
    )
  ),
  score smallint check (score between 0 and 100),
  score_category_key text check (
    score_category_key is null
    or score_category_key ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  score_category_label text check (
    score_category_label is null
    or char_length(score_category_label) between 1 and 120
  ),
  price_min_minor bigint check (price_min_minor >= 0),
  price_max_minor bigint check (
    price_max_minor >= 0
    and price_max_minor >= price_min_minor
  ),
  price_currency text check (
    price_currency is null
    or price_currency in (
      'BHD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP',
      'JPY', 'NOK', 'PLN', 'SEK', 'USD'
    )
  ),
  price_presentation text check (
    price_presentation is null
    or price_presentation in ('exact', 'from', 'range')
  ),
  estimation_explanation jsonb check (
    estimation_explanation is null
    or (
      jsonb_typeof(estimation_explanation) = 'object'
      and octet_length(estimation_explanation::text) <= 65536
    )
  ),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (session_id, submit_mutation_id),
  constraint leads_version_tenant_fk foreign key (
    organization_id,
    flow_id,
    flow_version_id
  ) references public.flow_versions (organization_id, flow_id, id),
  constraint leads_session_tenant_fk foreign key (
    organization_id,
    session_id
  ) references public.widget_sessions (organization_id, id),
  constraint leads_price_complete check (
    (
      price_min_minor is null
      and price_max_minor is null
      and price_currency is null
      and price_presentation is null
    )
    or (
      price_min_minor is not null
      and price_max_minor is not null
      and price_currency is not null
      and price_presentation is not null
    )
  ),
  constraint leads_score_complete check (
    (
      score is null
      and score_category_key is null
      and score_category_label is null
    )
    or (
      score is not null
      and score_category_key is not null
      and score_category_label is not null
    )
  )
);

create index leads_organization_created_idx
  on public.leads (organization_id, submitted_at desc);
create index leads_organization_status_score_idx
  on public.leads (organization_id, status, score desc nulls last);

create table public.lead_answers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null references public.leads (id),
  step_key text not null check (step_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  question_title text not null check (char_length(question_title) between 1 and 240),
  answer jsonb not null check (octet_length(answer::text) <= 4096),
  created_at timestamptz not null default now(),
  unique (lead_id, step_key),
  constraint lead_answers_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id)
);

create index lead_answers_organization_lead_idx
  on public.lead_answers (organization_id, lead_id);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null references public.leads (id),
  type public.consent_record_type not null,
  accepted boolean not null check (accepted),
  content_version text not null check (
    char_length(content_version) between 1 and 80
  ),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  source text not null default 'widget' check (source = 'widget'),
  recorded_at timestamptz not null default now(),
  unique (lead_id, type),
  constraint consent_records_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id)
);

create index consent_records_organization_lead_idx
  on public.consent_records (organization_id, lead_id);

create table public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null references public.leads (id),
  from_status public.lead_status,
  to_status public.lead_status not null,
  changed_by uuid references auth.users (id),
  changed_at timestamptz not null default now(),
  constraint lead_status_history_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id)
);

create index lead_status_history_lead_created_idx
  on public.lead_status_history (organization_id, lead_id, changed_at desc);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid not null references public.leads (id),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint lead_notes_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id)
);

create index lead_notes_lead_created_idx
  on public.lead_notes (organization_id, lead_id, created_at desc);

create table public.lead_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  session_id uuid not null references public.widget_sessions (id),
  lead_id uuid references public.leads (id),
  object_path text not null unique check (
    char_length(object_path) between 10 and 500
  ),
  original_name text not null check (
    char_length(original_name) between 1 and 255
  ),
  mime_type text not null check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  size_bytes integer not null check (size_bytes between 1 and 26214400),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  status public.lead_file_status not null default 'pending',
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  unique (organization_id, id),
  constraint lead_files_session_tenant_fk foreign key (
    organization_id,
    session_id
  ) references public.widget_sessions (organization_id, id),
  constraint lead_files_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id),
  constraint lead_files_verification_consistent check (
    (status = 'verified' and verified_at is not null)
    or (status <> 'verified' and verified_at is null)
  )
);

create index lead_files_organization_lead_idx
  on public.lead_files (organization_id, lead_id);
create index lead_files_session_idx
  on public.lead_files (session_id, created_at);

create function app_private.lead_capture_configuration_is_valid(snapshot jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  capture jsonb := snapshot -> 'leadCapture';
  marketing jsonb;
  privacy jsonb;
begin
  if capture is null then
    return true;
  end if;
  if jsonb_typeof(capture) <> 'object'
    or capture ->> 'leadCaptureSchemaVersion' <> '1'
    or jsonb_typeof(capture -> 'filesEnabled') <> 'boolean'
    or jsonb_typeof(capture -> 'privacyNotice') <> 'object'
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

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage6_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select app_private.flow_stage6_validation_issues(snapshot)
    || case
      when app_private.lead_capture_configuration_is_valid(snapshot) then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'code', 'INVALID_LEAD_CAPTURE_CONFIGURATION',
        'path', 'leadCapture',
        'message', 'Konfiguracja kontaktu lub zgód jest nieprawidłowa.',
        'severity', 'error'
      ))
    end;
$$;

alter function app_private.build_widget_manifest(jsonb, uuid, text, timestamptz)
rename to build_widget_manifest_stage5;

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
  select app_private.build_widget_manifest_stage5(
    snapshot,
    public_flow_id,
    snapshot_digest,
    publication_time
  ) || jsonb_build_object(
    'leadCapture',
    case
      when snapshot -> 'leadCapture' is null then null
      else jsonb_build_object(
        'leadCaptureSchemaVersion', 1,
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
    end
  );
$$;

create or replace function app_private.widget_manifest_for_version(
  target_version_id uuid,
  target_public_id uuid
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select app_private.build_widget_manifest(
    version.snapshot,
    target_public_id,
    version.snapshot_hash,
    version.published_at
  )
  from public.flow_versions version
  where version.id = target_version_id;
$$;

create function app_private.prevent_submitted_session_answer_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_session_id uuid;
begin
  target_session_id := case when tg_op = 'DELETE' then old.session_id else new.session_id end;
  if exists (
    select 1 from public.leads lead where lead.session_id = target_session_id
  ) then
    raise exception 'submitted session answers are immutable'
      using errcode = 'check_violation';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger session_answers_protect_submitted
before insert or update or delete on public.session_answers
for each row execute function app_private.prevent_submitted_session_answer_change();

create function public.reserve_widget_file(
  session_token text,
  original_name text,
  mime_type text,
  size_bytes integer,
  file_sha256 text,
  file_extension text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  file_id uuid := gen_random_uuid();
  file_path text;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
begin
  if session_token !~ '^[a-f0-9]{64}$'
    or char_length(original_name) not between 1 and 255
    or mime_type not in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
    or size_bytes not between 1 and 26214400
    or file_sha256 !~ '^[a-f0-9]{64}$'
    or file_extension not in ('jpg', 'png', 'webp', 'pdf')
    or (
      (mime_type = 'image/jpeg' and file_extension <> 'jpg')
      or (mime_type = 'image/png' and file_extension <> 'png')
      or (mime_type = 'image/webp' and file_extension <> 'webp')
      or (mime_type = 'application/pdf' and file_extension <> 'pdf')
    )
  then
    raise exception 'invalid file metadata' using errcode = 'check_violation';
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
  if session_record.current_step_key is not null then
    raise exception 'session is incomplete' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.leads lead where lead.session_id = session_record.id) then
    raise exception 'session already submitted' using errcode = 'unique_violation';
  end if;
  select version.snapshot
  into snapshot_document
  from public.flow_versions version
  where version.id = session_record.flow_version_id;
  if coalesce((snapshot_document #>> '{leadCapture,filesEnabled}')::boolean, false) = false then
    raise exception 'files are disabled' using errcode = 'check_violation';
  end if;
  if (
    select count(*)
    from public.lead_files stored_file
    where stored_file.session_id = session_record.id
      and stored_file.status in ('pending', 'verified')
  ) >= 5 then
    raise exception 'file limit exceeded' using errcode = 'program_limit_exceeded';
  end if;
  file_path := concat(
    session_record.organization_id,
    '/leads/pending/',
    session_record.id,
    '/',
    file_id,
    '.',
    file_extension
  );
  insert into public.lead_files (
    id,
    organization_id,
    session_id,
    object_path,
    original_name,
    mime_type,
    size_bytes,
    sha256
  )
  values (
    file_id,
    session_record.organization_id,
    session_record.id,
    file_path,
    original_name,
    mime_type,
    size_bytes,
    file_sha256
  );
  return jsonb_build_object('fileId', file_id);
end;
$$;

create function public.complete_widget_file(
  session_token text,
  target_file_id uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  file_record public.lead_files%rowtype;
  object_record storage.objects%rowtype;
  target_session_id uuid;
begin
  if session_token !~ '^[a-f0-9]{64}$' then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select session.id
  into target_session_id
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');
  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select stored_file.*
  into file_record
  from public.lead_files stored_file
  where stored_file.id = target_file_id
    and stored_file.session_id = target_session_id
  for update;
  if not found then
    raise exception 'file not found' using errcode = 'no_data_found';
  end if;
  if file_record.status = 'verified' then
    return jsonb_build_object(
      'fileId', file_record.id,
      'name', file_record.original_name,
      'mimeType', file_record.mime_type,
      'sizeBytes', file_record.size_bytes
    );
  end if;
  select object.*
  into object_record
  from storage.objects object
  where object.bucket_id = 'tenant-private'
    and object.name = file_record.object_path;
  if not found
    or coalesce((object_record.metadata ->> 'size')::bigint, -1) <> file_record.size_bytes
    or coalesce(object_record.metadata ->> 'mimetype', '') <> file_record.mime_type
  then
    raise exception 'uploaded object metadata mismatch'
      using errcode = 'check_violation';
  end if;
  update public.lead_files
  set status = 'verified', verified_at = now()
  where id = file_record.id;
  return jsonb_build_object(
    'fileId', file_record.id,
    'name', file_record.original_name,
    'mimeType', file_record.mime_type,
    'sizeBytes', file_record.size_bytes
  );
end;
$$;

create function public.reject_widget_file(
  session_token text,
  target_file_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_session_id uuid;
begin
  select session.id into target_session_id
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');
  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  update public.lead_files
  set status = 'rejected', verified_at = null
  where id = target_file_id
    and lead_files.session_id = target_session_id
    and status = 'pending';
end;
$$;

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
  file_count integer;
  pending_file_count integer;
  capture jsonb;
  existing_lead public.leads%rowtype;
  estimation_result jsonb;
  new_lead_id uuid := gen_random_uuid();
  lead_public_id uuid := gen_random_uuid();
  normalized_email text;
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
  normalized_email := lower(trim(coalesce(contact ->> 'email', '')));
  if jsonb_typeof(contact -> 'email') <> 'string'
    or char_length(normalized_email) not between 3 and 254
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
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
        or char_length(trim(contact ->> 'phone')) not between 7 and 30
        or trim(contact ->> 'phone') !~ '^\+?[0-9 ()-]+$'
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
  if capture is null
    or not app_private.lead_capture_configuration_is_valid(snapshot_document)
    or privacy_notice ->> 'version' <> capture #>> '{privacyNotice,version}'
    or privacy_notice ->> 'textHash' <> capture #>> '{privacyNotice,textHash}'
    or (
      marketing_email_consent is not null
      and (
        jsonb_typeof(marketing_email_consent) <> 'object'
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
    nullif(trim(contact ->> 'phone'), ''),
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

create function public.change_lead_status(
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
  current_status public.lead_status;
begin
  if not app_private.has_role(
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
  )
  values (
    target_organization_id,
    target_lead_id,
    current_status,
    target_status,
    auth.uid()
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
    auth.uid(),
    'lead.status_changed',
    'leads',
    target_lead_id,
    jsonb_build_object('from', current_status, 'to', target_status)
  );
end;
$$;

create function app_private.set_lead_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_set_updated_at
before update on public.leads
for each row execute function app_private.set_lead_updated_at();

alter table public.leads enable row level security;
alter table public.leads force row level security;
alter table public.lead_answers enable row level security;
alter table public.lead_answers force row level security;
alter table public.consent_records enable row level security;
alter table public.consent_records force row level security;
alter table public.lead_status_history enable row level security;
alter table public.lead_status_history force row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_notes force row level security;
alter table public.lead_files enable row level security;
alter table public.lead_files force row level security;

create policy leads_select_member
on public.leads for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_answers_select_member
on public.lead_answers for select to authenticated
using (app_private.is_active_member(organization_id));

create policy consent_records_select_member
on public.consent_records for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_status_history_select_member
on public.lead_status_history for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_notes_select_member
on public.lead_notes for select to authenticated
using (app_private.is_active_member(organization_id));

create policy lead_notes_insert_member
on public.lead_notes for insert to authenticated
with check (
  app_private.is_active_member(organization_id)
  and created_by = auth.uid()
  and exists (
    select 1
    from public.leads lead
    where lead.id = lead_id
      and lead.organization_id = organization_id
  )
);

create policy lead_files_select_member
on public.lead_files for select to authenticated
using (app_private.is_active_member(organization_id));

revoke all on table public.leads from public, anon, authenticated;
revoke all on table public.lead_answers from public, anon, authenticated;
revoke all on table public.consent_records from public, anon, authenticated;
revoke all on table public.lead_status_history from public, anon, authenticated;
revoke all on table public.lead_notes from public, anon, authenticated;
revoke all on table public.lead_files from public, anon, authenticated;
grant select on public.leads to authenticated;
grant select on public.lead_answers to authenticated;
grant select on public.consent_records to authenticated;
grant select on public.lead_status_history to authenticated;
grant select, insert on public.lead_notes to authenticated;
grant select on public.lead_files to authenticated;

revoke all on function app_private.lead_capture_configuration_is_valid(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_stage6_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest_stage5(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function app_private.prevent_submitted_session_answer_change()
  from public, anon, authenticated;
revoke all on function app_private.set_lead_updated_at()
  from public, anon, authenticated;
revoke all on function public.reserve_widget_file(
  text, text, text, integer, text, text
) from public;
revoke all on function public.complete_widget_file(text, uuid) from public;
revoke all on function public.reject_widget_file(text, uuid) from public;
revoke all on function public.submit_widget_lead(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) from public;
revoke all on function public.change_lead_status(
  uuid, uuid, public.lead_status
) from public;
grant execute on function public.reserve_widget_file(
  text, text, text, integer, text, text
) to anon, authenticated;
grant execute on function public.complete_widget_file(text, uuid)
  to anon, authenticated;
grant execute on function public.reject_widget_file(text, uuid)
  to anon, authenticated;
grant execute on function public.submit_widget_lead(
  text, uuid, jsonb, jsonb, jsonb, uuid[]
) to anon, authenticated;
grant execute on function public.change_lead_status(
  uuid, uuid, public.lead_status
) to authenticated;
