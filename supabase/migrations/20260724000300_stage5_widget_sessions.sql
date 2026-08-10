create type public.widget_session_status as enum ('active', 'expired');

create table public.widget_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  flow_id uuid not null references public.flows (id),
  flow_version_id uuid not null references public.flow_versions (id),
  public_flow_id uuid not null,
  token_hash bytea not null unique,
  status public.widget_session_status not null default 'active',
  revision integer not null default 0 check (revision >= 0),
  step_history text[] not null default array[]::text[] check (
    cardinality(step_history) <= 40
  ),
  current_step_key text check (
    current_step_key is null
    or current_step_key ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (organization_id, id),
  constraint widget_sessions_version_tenant_fk foreign key (
    organization_id,
    flow_id,
    flow_version_id
  ) references public.flow_versions (organization_id, flow_id, id)
);

create index widget_sessions_version_created_idx
  on public.widget_sessions (flow_version_id, created_at desc);
create index widget_sessions_expiry_idx
  on public.widget_sessions (expires_at)
  where status = 'active';

create table public.session_answers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  session_id uuid not null references public.widget_sessions (id),
  step_key text not null check (step_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  answer jsonb not null check (octet_length(answer::text) <= 4096),
  answer_revision integer not null check (answer_revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, step_key),
  constraint session_answers_session_tenant_fk foreign key (
    organization_id,
    session_id
  ) references public.widget_sessions (organization_id, id)
);

create index session_answers_organization_session_idx
  on public.session_answers (organization_id, session_id);

create table public.widget_session_mutations (
  session_id uuid not null references public.widget_sessions (id),
  mutation_id uuid not null,
  resulting_revision integer not null check (resulting_revision > 0),
  resulting_step_key text check (
    resulting_step_key is null
    or resulting_step_key ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  created_at timestamptz not null default now(),
  primary key (session_id, mutation_id)
);

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
  select jsonb_build_object(
    'manifestVersion',
    1,
    'publicId',
    public_flow_id,
    'snapshotHash',
    snapshot_digest,
    'publishedAt',
    publication_time,
    'title',
    snapshot ->> 'title',
    'intro',
    snapshot ->> 'intro',
    'entryStepKey',
    snapshot ->> 'entryStepKey',
    'steps',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'key',
            step ->> 'key',
            'type',
            step ->> 'type',
            'title',
            step ->> 'title',
            'description',
            step -> 'description',
            'required',
            step -> 'required',
            'allowUnknown',
            step -> 'allowUnknown',
            'nextStepKey',
            step -> 'nextStepKey',
            'options',
            (
              select coalesce(
                jsonb_agg(
                  jsonb_build_object(
                    'key',
                    option ->> 'key',
                    'label',
                    option ->> 'label',
                    'overridesNextStep',
                    option ? 'nextStepKey',
                    'nextStepKey',
                    coalesce(option -> 'nextStepKey', 'null'::jsonb)
                  )
                  order by option_index
                ),
                '[]'::jsonb
              )
              from jsonb_array_elements(step -> 'options')
                with ordinality as options(option, option_index)
            )
          )
          order by step_index
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(snapshot -> 'steps')
        with ordinality as steps(step, step_index)
    ),
    'rules',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id',
            rule ->> 'id',
            'when',
            jsonb_build_object(
              'stepKey',
              rule #>> '{when,stepKey}',
              'operator',
              rule #>> '{when,operator}',
              'value',
              coalesce(rule #> '{when,value}', 'null'::jsonb)
            ),
            'then',
            jsonb_build_object(
              'action',
              'go_to',
              'stepKey',
              coalesce(rule #> '{then,stepKey}', 'null'::jsonb)
            )
          )
          order by rule_index
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(snapshot -> 'rules')
        with ordinality as rules(rule, rule_index)
    ),
    'result',
    jsonb_build_object(
      'mode',
      snapshot #>> '{result,mode}',
      'headline',
      snapshot #>> '{result,headline}',
      'nextStepLabel',
      snapshot #>> '{result,nextStepLabel}',
      'disclaimer',
      snapshot #>> '{result,disclaimer}'
    )
  );
$$;

create function app_private.widget_manifest_for_version(
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

create function public.get_widget_manifest(target_public_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  manifest jsonb;
begin
  select app_private.widget_manifest_for_version(
    published.flow_version_id,
    published.public_id
  )
  into manifest
  from public.published_flows published
  join public.flow_versions version
    on version.id = published.flow_version_id
    and version.status = 'published'
  join public.organizations organization
    on organization.id = published.organization_id
    and organization.deleted_at is null
  where published.public_id = target_public_id;

  if manifest is null then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  return manifest;
end;
$$;

create function public.create_widget_session(target_public_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  published_record public.published_flows%rowtype;
  raw_token text;
  session_record public.widget_sessions%rowtype;
begin
  select published.*
  into published_record
  from public.published_flows published
  join public.flow_versions version
    on version.id = published.flow_version_id
    and version.status = 'published'
  join public.organizations organization
    on organization.id = published.organization_id
    and organization.deleted_at is null
  where published.public_id = target_public_id;

  if not found then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  if (
    select count(*)
    from public.widget_sessions recent_session
    where recent_session.flow_version_id = published_record.flow_version_id
      and recent_session.created_at >= now() - interval '1 minute'
  ) >= 120 then
    raise exception 'session rate limit exceeded'
      using errcode = 'program_limit_exceeded';
  end if;

  raw_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.widget_sessions (
    organization_id,
    flow_id,
    flow_version_id,
    public_flow_id,
    token_hash,
    current_step_key
  )
  select
    published_record.organization_id,
    published_record.flow_id,
    published_record.flow_version_id,
    published_record.public_id,
    extensions.digest(raw_token, 'sha256'),
    version.snapshot ->> 'entryStepKey'
  from public.flow_versions version
  where version.id = published_record.flow_version_id
  returning * into session_record;

  return jsonb_build_object(
    'token',
    raw_token,
    'revision',
    session_record.revision,
    'currentStepKey',
    session_record.current_step_key,
    'expiresAt',
    session_record.expires_at,
    'manifest',
    app_private.widget_manifest_for_version(
      session_record.flow_version_id,
      session_record.public_flow_id
    )
  );
end;
$$;

create function public.resume_widget_session(
  session_token text
)
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

  select session.*
  into session_record
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');

  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;

  if session_record.status <> 'active'
    or session_record.expires_at <= now()
  then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;

  select coalesce(
    jsonb_object_agg(answer.step_key, answer.answer),
    '{}'::jsonb
  )
  into answer_set
  from public.session_answers answer
  where answer.session_id = session_record.id;

  update public.widget_sessions
  set last_seen_at = now()
  where id = session_record.id;

  return jsonb_build_object(
    'revision',
    session_record.revision,
    'currentStepKey',
    session_record.current_step_key,
    'expiresAt',
    session_record.expires_at,
    'answers',
    answer_set,
    'manifest',
    app_private.widget_manifest_for_version(
      session_record.flow_version_id,
      session_record.public_flow_id
    )
  );
end;
$$;

create function app_private.widget_answer_is_valid(
  step_document jsonb,
  candidate jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  answer_text text;
  element jsonb;
  option_count integer;
  parsed_date date;
  step_type text := step_document ->> 'type';
begin
  if candidate = 'null'::jsonb then
    return coalesce((step_document ->> 'required')::boolean, true) = false;
  end if;

  if jsonb_typeof(candidate) = 'string'
    and candidate #>> '{}' = '__unknown__'
  then
    return coalesce(
      (step_document ->> 'allowUnknown')::boolean,
      false
    );
  end if;

  if step_type = 'single_choice' then
    return jsonb_typeof(candidate) = 'string'
      and exists (
        select 1
        from jsonb_array_elements(step_document -> 'options') option
        where option ->> 'key' = candidate #>> '{}'
      );
  end if;

  if step_type = 'multiple_choice' then
    if jsonb_typeof(candidate) <> 'array'
      or jsonb_array_length(candidate) < 1
      or jsonb_array_length(candidate) > 20
    then
      return false;
    end if;

    option_count := 0;
    for element in select value from jsonb_array_elements(candidate)
    loop
      if jsonb_typeof(element) <> 'string'
        or not exists (
          select 1
          from jsonb_array_elements(step_document -> 'options') option
          where option ->> 'key' = element #>> '{}'
        )
      then
        return false;
      end if;
      option_count := option_count + 1;
    end loop;

    return (
      select count(distinct value) = option_count
      from jsonb_array_elements_text(candidate) selected(value)
    );
  end if;

  if step_type in ('short_text', 'location') then
    return jsonb_typeof(candidate) = 'string'
      and char_length(trim(candidate #>> '{}')) between 1 and 500;
  end if;

  if step_type = 'long_text' then
    return jsonb_typeof(candidate) = 'string'
      and char_length(trim(candidate #>> '{}')) between 1 and 2000;
  end if;

  if step_type in ('number', 'budget') then
    return jsonb_typeof(candidate) = 'number';
  end if;

  if step_type = 'yes_no' then
    return jsonb_typeof(candidate) = 'boolean';
  end if;

  if step_type = 'date' and jsonb_typeof(candidate) = 'string' then
    answer_text := candidate #>> '{}';
    if answer_text !~ '^\d{4}-\d{2}-\d{2}$' then
      return false;
    end if;
    begin
      parsed_date := answer_text::date;
      return to_char(parsed_date, 'YYYY-MM-DD') = answer_text;
    exception
      when datetime_field_overflow then
        return false;
    end;
  end if;

  return false;
end;
$$;

create function public.save_widget_answer(
  session_token text,
  mutation_id uuid,
  expected_revision integer,
  target_step_key text,
  answer jsonb,
  next_step_key text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  existing_revision integer;
  existing_step_key text;
  history_position integer;
  next_history text[];
  resolved_next_step text;
  route_resolved boolean := false;
  session_record public.widget_sessions%rowtype;
  step_document jsonb;
begin
  if session_token !~ '^[a-f0-9]{64}$'
    or target_step_key !~ '^[a-z][a-z0-9_]{0,63}$'
    or (
      next_step_key is not null
      and next_step_key !~ '^[a-z][a-z0-9_]{0,63}$'
    )
    or expected_revision < 0
  then
    raise exception 'invalid session mutation'
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

  select mutation.resulting_revision, mutation.resulting_step_key
  into existing_revision, existing_step_key
  from public.widget_session_mutations mutation
  where mutation.session_id = session_record.id
    and mutation.mutation_id = save_widget_answer.mutation_id;

  if found then
    return jsonb_build_object(
      'revision',
      existing_revision,
      'currentStepKey',
      existing_step_key
    );
  end if;

  if session_record.status <> 'active'
    or session_record.expires_at <= now()
  then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;

  if session_record.revision <> expected_revision then
    raise exception 'session revision conflict'
      using errcode = 'serialization_failure';
  end if;

  if (
    select count(*)
    from public.widget_session_mutations mutation
    where mutation.session_id = session_record.id
  ) >= 500 then
    raise exception 'session mutation limit exceeded'
      using errcode = 'program_limit_exceeded';
  end if;

  select step
  into step_document
  from public.flow_versions version
  cross join lateral jsonb_array_elements(version.snapshot -> 'steps') step
  where version.id = session_record.flow_version_id
    and step ->> 'key' = target_step_key;

  if step_document is null
    or not app_private.widget_answer_is_valid(step_document, answer)
  then
    raise exception 'invalid answer' using errcode = 'check_violation';
  end if;

  if target_step_key = session_record.current_step_key then
    next_history := array_append(session_record.step_history, target_step_key);
  else
    history_position := array_position(
      session_record.step_history,
      target_step_key
    );
    if history_position is null then
      raise exception 'invalid current step' using errcode = 'check_violation';
    end if;

    delete from public.session_answers stored_answer
    where stored_answer.session_id = session_record.id
      and stored_answer.step_key = any(
        session_record.step_history[
          history_position + 1:cardinality(session_record.step_history)
        ]
      );
    next_history := session_record.step_history[1:history_position];
  end if;

  select rule #>> '{then,stepKey}'
  into resolved_next_step
  from public.flow_versions version
  cross join lateral jsonb_array_elements(version.snapshot -> 'rules')
    with ordinality as rules(rule, rule_index)
  where version.id = session_record.flow_version_id
    and rule #>> '{when,stepKey}' = target_step_key
    and (
      (
        rule #>> '{when,operator}' = 'answered'
        and answer <> 'null'::jsonb
      )
      or (
        rule #>> '{when,operator}' = 'equals'
        and answer = rule #> '{when,value}'
      )
      or (
        rule #>> '{when,operator}' = 'not_equals'
        and answer <> 'null'::jsonb
        and answer <> rule #> '{when,value}'
      )
      or (
        rule #>> '{when,operator}' = 'includes'
        and jsonb_typeof(answer) = 'array'
        and answer @> jsonb_build_array(rule #> '{when,value}')
      )
    )
  order by rule_index
  limit 1;
  route_resolved := found;

  if not route_resolved
    and step_document ->> 'type' = 'single_choice'
    and jsonb_typeof(answer) = 'string'
  then
    select option ->> 'nextStepKey'
    into resolved_next_step
    from jsonb_array_elements(step_document -> 'options') option
    where option ->> 'key' = answer #>> '{}'
      and option ? 'nextStepKey';
    route_resolved := found;
  end if;

  if not route_resolved then
    resolved_next_step := step_document ->> 'nextStepKey';
  end if;

  if resolved_next_step is distinct from next_step_key then
    raise exception 'invalid route' using errcode = 'check_violation';
  end if;

  if answer = 'null'::jsonb then
    delete from public.session_answers stored_answer
    where stored_answer.session_id = session_record.id
      and stored_answer.step_key = target_step_key;
  else
    insert into public.session_answers (
      organization_id,
      session_id,
      step_key,
      answer,
      answer_revision
    )
    values (
      session_record.organization_id,
      session_record.id,
      target_step_key,
      answer,
      session_record.revision + 1
    )
    on conflict (session_id, step_key) do update
    set
      answer = excluded.answer,
      answer_revision = excluded.answer_revision,
      updated_at = now();
  end if;

  update public.widget_sessions
  set
    revision = revision + 1,
    current_step_key = resolved_next_step,
    step_history = next_history,
    last_seen_at = now()
  where id = session_record.id;

  insert into public.widget_session_mutations (
    session_id,
    mutation_id,
    resulting_revision,
    resulting_step_key
  )
  values (
    session_record.id,
    mutation_id,
    session_record.revision + 1,
    resolved_next_step
  );

  return jsonb_build_object(
    'revision',
    session_record.revision + 1,
    'currentStepKey',
    resolved_next_step
  );
end;
$$;

revoke all on table public.widget_sessions
  from public, anon, authenticated;
revoke all on table public.session_answers
  from public, anon, authenticated;
revoke all on table public.widget_session_mutations
  from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest(
  jsonb,
  uuid,
  text,
  timestamptz
) from public, anon, authenticated;
revoke all on function app_private.widget_manifest_for_version(uuid, uuid)
  from public, anon, authenticated;
revoke all on function app_private.widget_answer_is_valid(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function public.get_widget_manifest(uuid)
  from public;
revoke all on function public.create_widget_session(uuid)
  from public;
revoke all on function public.resume_widget_session(text)
  from public;
revoke all on function public.save_widget_answer(
  text,
  uuid,
  integer,
  text,
  jsonb,
  text
) from public;

grant execute on function public.get_widget_manifest(uuid)
  to anon, authenticated;
grant execute on function public.create_widget_session(uuid)
  to anon, authenticated;
grant execute on function public.resume_widget_session(text)
  to anon, authenticated;
grant execute on function public.save_widget_answer(
  text,
  uuid,
  integer,
  text,
  jsonb,
  text
) to anon, authenticated;

alter table public.widget_sessions enable row level security;
alter table public.widget_sessions force row level security;
alter table public.session_answers enable row level security;
alter table public.session_answers force row level security;
alter table public.widget_session_mutations enable row level security;
alter table public.widget_session_mutations force row level security;
