-- Stage 12ZQ / PX5: closed host context, confirmation and lead snapshot.
--
-- Rollback: stop sending context and keep both session/lead columns readable.
-- Do not remove columns or helpers after traffic; use a corrective migration.

alter table public.widget_sessions
  add column context_snapshot jsonb not null default
    '{"schemaVersion":1,"source":{"kind":"hosted","origin":null},"values":[]}'::jsonb,
  add column context_confirmed_at timestamptz default now(),
  add column context_confirmation_mutation_id uuid,
  add constraint widget_session_context_size check (
    jsonb_typeof(context_snapshot) = 'object'
    and octet_length(context_snapshot::text) <= 8192
  );

alter table public.leads
  add column context_snapshot jsonb not null default
    '{"schemaVersion":1,"source":{"kind":"hosted","origin":null},"values":[]}'::jsonb,
  add constraint lead_context_size check (
    jsonb_typeof(context_snapshot) = 'object'
    and octet_length(context_snapshot::text) <= 8192
  );

update public.widget_sessions
set context_confirmed_at = created_at
where context_confirmed_at is null;

create function app_private.context_value_is_safe(candidate text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select char_length(trim(candidate)) between 1 and 120
    and candidate !~ '[[:cntrl:]]'
    and candidate !~* '(^|[^[:alnum:]])[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+'
    and candidate !~* '(^|[[:space:]])(https?://|www\.)'
    and candidate !~ '^\+?[0-9 ()-]{7,}$';
$$;

create function app_private.flow_context_configuration_is_valid(snapshot jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  field jsonb;
  field_keys text[] := array[]::text[];
  allowed_values text[];
begin
  if not (snapshot ? 'contextSchema') then return true; end if;
  if snapshot ->> 'schemaVersion' <> '3'
    or jsonb_typeof(snapshot -> 'contextSchema') <> 'object'
    or (snapshot -> 'contextSchema') - array['fields', 'schemaVersion']::text[] <> '{}'::jsonb
    or snapshot #>> '{contextSchema,schemaVersion}' <> '1'
    or jsonb_typeof(snapshot #> '{contextSchema,fields}') <> 'array'
    or jsonb_array_length(snapshot #> '{contextSchema,fields}') > 8
  then return false; end if;

  for field in select value from jsonb_array_elements(snapshot #> '{contextSchema,fields}')
  loop
    if jsonb_typeof(field) <> 'object'
      or field - array['allowedValues','key','label','mode','required','systemValue','type']::text[]
        <> '{}'::jsonb
      or jsonb_typeof(field -> 'key') <> 'string'
      or field ->> 'key' !~ '^[a-z][a-z0-9_]{0,63}$'
      or field ->> 'key' ~ '^(consent|organization|price|routing|score|tenant)(_|$)'
      or field ->> 'key' = any(field_keys)
      or jsonb_typeof(field -> 'label') <> 'string'
      or char_length(trim(field ->> 'label')) not between 1 and 80
      or jsonb_typeof(field -> 'mode') <> 'string'
      or field ->> 'mode' not in ('confirm','informational','system')
      or jsonb_typeof(field -> 'required') <> 'boolean'
      or jsonb_typeof(field -> 'type') <> 'string'
      or field ->> 'type' not in ('enum','text')
    then return false; end if;
    field_keys := array_append(field_keys, field ->> 'key');

    if field ->> 'type' = 'enum' then
      if jsonb_typeof(field -> 'allowedValues') <> 'array'
        or jsonb_array_length(field -> 'allowedValues') not between 1 and 30
      then return false; end if;
      select array_agg(value order by value)
      into allowed_values
      from jsonb_array_elements_text(field -> 'allowedValues') candidate(value);
      if cardinality(allowed_values) <> (
          select count(distinct value)
          from jsonb_array_elements_text(field -> 'allowedValues') candidate(value)
        )
        or exists (
          select 1 from unnest(allowed_values) value
          where not app_private.context_value_is_safe(value)
        )
      then return false; end if;
    elsif field ? 'allowedValues' then
      return false;
    end if;

    if field ->> 'mode' = 'system' then
      if jsonb_typeof(field -> 'systemValue') <> 'string'
        or not app_private.context_value_is_safe(field ->> 'systemValue')
        or (field ->> 'type' = 'enum' and not (field -> 'allowedValues' ? (field ->> 'systemValue')))
      then return false; end if;
    elsif field ? 'systemValue' then
      return false;
    end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;

create or replace function app_private.flow_v3_base_snapshot(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(snapshot) <> 'object' then snapshot
    else (snapshot - 'contextSchema' - 'experienceMode' - 'steps') || jsonb_build_object(
      'schemaVersion', 2,
      'steps',
      case
        when jsonb_typeof(snapshot -> 'steps') <> 'array'
          then coalesce(snapshot -> 'steps', 'null'::jsonb)
        else (
          select coalesce(jsonb_agg(
            (step - 'presentation' - 'options') || jsonb_build_object(
              'options', case
                when jsonb_typeof(step -> 'options') <> 'array'
                  then coalesce(step -> 'options', 'null'::jsonb)
                else (
                  select coalesce(jsonb_agg(option - 'presentation' order by option_index), '[]'::jsonb)
                  from jsonb_array_elements(step -> 'options')
                    with ordinality as options(option, option_index)
                ) end
            ) order by step_index
          ), '[]'::jsonb)
          from jsonb_array_elements(snapshot -> 'steps')
            with ordinality as steps(step, step_index)
        ) end
    )
  end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage12zo_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select app_private.flow_stage12zo_validation_issues(snapshot)
    || case when app_private.flow_context_configuration_is_valid(snapshot)
      then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'code', 'INVALID_CONTEXT',
        'path', 'contextSchema',
        'message', 'Konfiguracja kontekstu hosta jest nieprawidłowa.'
      )) end;
$$;

create function app_private.build_session_context(
  snapshot jsonb,
  supplied_context jsonb,
  source_kind text,
  source_origin text
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  field jsonb;
  field_key text;
  field_value text;
  values_result jsonb := '[]'::jsonb;
  configured_keys text[] := array[]::text[];
begin
  if supplied_context is null then supplied_context := '{}'::jsonb; end if;
  if jsonb_typeof(supplied_context) <> 'object'
    or octet_length(supplied_context::text) > 4096
    or source_kind not in ('embedded','hosted')
    or (source_origin is not null and (
      char_length(source_origin) > 255
      or source_origin !~ '^https?://[^/]+$'
    ))
    or not app_private.flow_context_configuration_is_valid(snapshot)
  then raise exception 'invalid widget context' using errcode = 'check_violation'; end if;

  for field in
    select value from jsonb_array_elements(
      coalesce(snapshot #> '{contextSchema,fields}', '[]'::jsonb)
    )
  loop
    field_key := field ->> 'key';
    configured_keys := array_append(configured_keys, field_key);
    if field ->> 'mode' = 'system' then
      if supplied_context ? field_key then
        raise exception 'invalid widget context' using errcode = 'check_violation';
      end if;
      field_value := field ->> 'systemValue';
    elsif supplied_context ? field_key then
      if jsonb_typeof(supplied_context -> field_key) <> 'string' then
        raise exception 'invalid widget context' using errcode = 'check_violation';
      end if;
      field_value := trim(supplied_context ->> field_key);
    elsif (field ->> 'required')::boolean then
      raise exception 'invalid widget context' using errcode = 'check_violation';
    else
      continue;
    end if;

    if not app_private.context_value_is_safe(field_value)
      or (field ->> 'type' = 'enum' and not (field -> 'allowedValues' ? field_value))
    then raise exception 'invalid widget context' using errcode = 'check_violation'; end if;

    values_result := values_result || jsonb_build_array(jsonb_build_object(
      'allowedValues', case when field ->> 'type' = 'enum' then field -> 'allowedValues' else 'null'::jsonb end,
      'key', field_key,
      'label', field ->> 'label',
      'mode', field ->> 'mode',
      'type', field ->> 'type',
      'value', field_value
    ));
  end loop;

  if exists (
    select 1 from jsonb_object_keys(supplied_context) supplied(key)
    where not (supplied.key = any(configured_keys))
  ) then raise exception 'invalid widget context' using errcode = 'check_violation'; end if;

  return jsonb_build_object(
    'schemaVersion', 1,
    'source', jsonb_build_object('kind', source_kind, 'origin', source_origin),
    'values', values_result
  );
end;
$$;

create function app_private.public_session_context(context_snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(value order by position), '[]'::jsonb)
  from jsonb_array_elements(coalesce(context_snapshot -> 'values', '[]'::jsonb))
    with ordinality entry(value, position)
  where value ->> 'mode' in ('confirm','informational');
$$;

create function public.create_widget_session(
  target_public_id uuid,
  supplied_context jsonb,
  source_kind text,
  source_origin text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  context_value jsonb;
  published_record public.published_flows%rowtype;
  raw_token text;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
begin
  select published.*
  into published_record
  from public.published_flows published
  join public.flow_versions version on version.id = published.flow_version_id and version.status = 'published'
  join public.organizations organization on organization.id = published.organization_id and organization.deleted_at is null
  where published.public_id = target_public_id;
  if not found then raise exception 'flow not found' using errcode = 'no_data_found'; end if;
  select version.snapshot into snapshot_document
  from public.flow_versions version
  where version.id = published_record.flow_version_id;
  if (select count(*) from public.widget_sessions recent
      where recent.flow_version_id = published_record.flow_version_id
        and recent.created_at >= now() - interval '1 minute') >= 120
  then raise exception 'session rate limit exceeded' using errcode = 'program_limit_exceeded'; end if;

  context_value := app_private.build_session_context(
    snapshot_document, supplied_context, source_kind, source_origin
  );
  raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.widget_sessions (
    organization_id, flow_id, flow_version_id, public_flow_id, token_hash,
    current_step_key, context_snapshot, context_confirmed_at
  ) values (
    published_record.organization_id, published_record.flow_id,
    published_record.flow_version_id, published_record.public_id,
    extensions.digest(raw_token, 'sha256'), snapshot_document ->> 'entryStepKey',
    context_value,
    case when exists (
      select 1 from jsonb_array_elements(context_value -> 'values') value
      where value ->> 'mode' = 'confirm'
    ) then null else now() end
  ) returning * into session_record;

  return jsonb_build_object(
    'token', raw_token,
    'revision', session_record.revision,
    'currentStepKey', session_record.current_step_key,
    'expiresAt', session_record.expires_at,
    'context', app_private.public_session_context(session_record.context_snapshot),
    'contextConfirmed', session_record.context_confirmed_at is not null,
    'manifest', app_private.widget_manifest_for_version(
      session_record.flow_version_id, session_record.public_flow_id
    )
  );
end;
$$;

create or replace function public.create_widget_session(target_public_id uuid)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select public.create_widget_session(target_public_id, '{}'::jsonb, 'hosted', null);
$$;

create or replace function public.resume_widget_session(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  answer_set jsonb;
  session_record public.widget_sessions%rowtype;
begin
  if session_token !~ '^[a-f0-9]{64}$' then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select session.* into session_record from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');
  if not found then raise exception 'session not found' using errcode = 'no_data_found'; end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  select coalesce(jsonb_object_agg(answer.step_key, answer.answer), '{}'::jsonb)
  into answer_set from public.session_answers answer where answer.session_id = session_record.id;
  update public.widget_sessions set last_seen_at = now() where id = session_record.id;
  return jsonb_build_object(
    'revision', session_record.revision,
    'currentStepKey', session_record.current_step_key,
    'expiresAt', session_record.expires_at,
    'answers', answer_set,
    'context', app_private.public_session_context(session_record.context_snapshot),
    'contextConfirmed', session_record.context_confirmed_at is not null,
    'manifest', app_private.widget_manifest_for_version(
      session_record.flow_version_id, session_record.public_flow_id
    )
  );
end;
$$;

create function public.confirm_widget_context(
  session_token text,
  mutation_id uuid,
  confirmed_values jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  combined_values jsonb := '{}'::jsonb;
  existing_value jsonb;
  next_context jsonb;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
begin
  if session_token !~ '^[a-f0-9]{64}$' or jsonb_typeof(confirmed_values) <> 'object'
    or octet_length(confirmed_values::text) > 4096
  then raise exception 'invalid context confirmation' using errcode = 'check_violation'; end if;
  select session.* into session_record from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256') for update;
  if not found then raise exception 'session not found' using errcode = 'no_data_found'; end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  if session_record.context_confirmed_at is not null then
    if session_record.context_confirmation_mutation_id = mutation_id then
      return jsonb_build_object(
        'confirmedAt', session_record.context_confirmed_at,
        'context', app_private.public_session_context(session_record.context_snapshot)
      );
    end if;
    raise exception 'context already confirmed' using errcode = 'check_violation';
  end if;
  if session_record.revision <> 0 or exists (
    select 1 from public.session_answers answer where answer.session_id = session_record.id
  ) then raise exception 'context confirmation is too late' using errcode = 'check_violation'; end if;

  for existing_value in select value from jsonb_array_elements(session_record.context_snapshot -> 'values')
  loop
    if existing_value ->> 'mode' = 'informational' then
      combined_values := combined_values || jsonb_build_object(
        existing_value ->> 'key', existing_value ->> 'value'
      );
    end if;
  end loop;
  if exists (
    select 1 from jsonb_object_keys(confirmed_values) supplied(key)
    where not exists (
      select 1 from jsonb_array_elements(session_record.context_snapshot -> 'values') entry
      where entry ->> 'key' = supplied.key and entry ->> 'mode' = 'confirm'
    )
  ) then raise exception 'invalid context confirmation' using errcode = 'check_violation'; end if;
  combined_values := combined_values || confirmed_values;
  select version.snapshot into snapshot_document from public.flow_versions version
  where version.id = session_record.flow_version_id;
  next_context := app_private.build_session_context(
    snapshot_document,
    combined_values,
    session_record.context_snapshot #>> '{source,kind}',
    session_record.context_snapshot #>> '{source,origin}'
  );
  update public.widget_sessions set
    context_snapshot = next_context,
    context_confirmed_at = now(),
    context_confirmation_mutation_id = mutation_id,
    last_seen_at = now()
  where id = session_record.id
  returning * into session_record;
  return jsonb_build_object(
    'confirmedAt', session_record.context_confirmed_at,
    'context', app_private.public_session_context(session_record.context_snapshot)
  );
end;
$$;

create function app_private.block_answer_before_context_confirmation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if NEW.revision > OLD.revision and OLD.context_confirmed_at is null then
    raise exception 'widget context requires confirmation' using errcode = 'check_violation';
  end if;
  return NEW;
end;
$$;

create trigger widget_sessions_require_context_confirmation
before update of revision on public.widget_sessions
for each row execute function app_private.block_answer_before_context_confirmation();

create function app_private.copy_session_context_to_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select session.context_snapshot into NEW.context_snapshot
  from public.widget_sessions session
  where session.id = NEW.session_id and session.organization_id = NEW.organization_id
    and session.context_confirmed_at is not null;
  if not found then raise exception 'lead context is unavailable' using errcode = 'check_violation'; end if;
  return NEW;
end;
$$;

create trigger leads_copy_session_context
before insert on public.leads
for each row execute function app_private.copy_session_context_to_lead();

revoke all on function app_private.context_value_is_safe(text) from public;
revoke all on function app_private.flow_context_configuration_is_valid(jsonb) from public;
revoke all on function app_private.flow_stage12zo_validation_issues(jsonb) from public;
revoke all on function app_private.flow_validation_issues(jsonb) from public;
revoke all on function app_private.build_session_context(jsonb, jsonb, text, text) from public;
revoke all on function app_private.public_session_context(jsonb) from public;
revoke all on function app_private.block_answer_before_context_confirmation() from public;
revoke all on function app_private.copy_session_context_to_lead() from public;
revoke all on function public.create_widget_session(uuid, jsonb, text, text) from public, anon, authenticated;
revoke all on function public.confirm_widget_context(text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.create_widget_session(uuid, jsonb, text, text) to service_role;
grant execute on function public.confirm_widget_context(text, uuid, jsonb) to service_role;
