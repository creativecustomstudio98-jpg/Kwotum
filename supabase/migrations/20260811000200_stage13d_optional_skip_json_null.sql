-- Stage 13D: keep the public API representation of a skipped answer distinct
-- from SQL NULL. PostgREST maps a JSON request value of null to SQL NULL for
-- an RPC jsonb argument, while the session domain uses JSONB null as the
-- explicit "no answer" value for optional steps.

create or replace function public.save_widget_answer(
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
  -- JSON null supplied directly by PostgreSQL is already JSONB null. A null
  -- crossing PostgREST arrives as SQL NULL and must be normalized before
  -- validation, route resolution and persistence decisions.
  answer := coalesce(answer, 'null'::jsonb);

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

revoke all on function public.save_widget_answer(
  text,
  uuid,
  integer,
  text,
  jsonb,
  text
) from public, anon, authenticated;

grant execute on function public.save_widget_answer(
  text,
  uuid,
  integer,
  text,
  jsonb,
  text
) to service_role;
