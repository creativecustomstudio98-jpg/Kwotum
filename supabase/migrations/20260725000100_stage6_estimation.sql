create function app_private.estimation_condition_matches(
  condition jsonb,
  answers jsonb
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case condition ->> 'operator'
    when 'answered' then answers ? (condition ->> 'stepKey')
    when 'equals' then answers -> (condition ->> 'stepKey') = condition -> 'value'
    when 'not_equals' then
      answers ? (condition ->> 'stepKey')
      and answers -> (condition ->> 'stepKey') <> condition -> 'value'
    when 'includes' then
      jsonb_typeof(answers -> (condition ->> 'stepKey')) = 'array'
      and answers -> (condition ->> 'stepKey')
        @> jsonb_build_array(condition -> 'value')
    else false
  end;
$$;

create function app_private.estimation_configuration_is_valid(snapshot jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  category jsonb;
  category_index integer := 0;
  category_keys text[] := array[]::text[];
  condition jsonb;
  configuration jsonb := snapshot -> 'estimation';
  current_threshold integer;
  operation jsonb;
  previous_threshold integer := -1;
  rule jsonb;
  rule_ids text[] := array[]::text[];
begin
  if configuration is null then
    return true;
  end if;
  if jsonb_typeof(configuration) <> 'object'
    or not configuration ?& array[
      'estimationSchemaVersion',
      'pricing',
      'scoring'
    ]
    or configuration ->> 'estimationSchemaVersion' <> '1'
    or jsonb_typeof(configuration -> 'pricing') <> 'object'
    or jsonb_typeof(configuration -> 'scoring') <> 'object'
    or not (configuration -> 'pricing') ?& array[
      'baseMaxMinor',
      'baseMinMinor',
      'currency',
      'presentation',
      'roundingIncrementMinor',
      'rules'
    ]
    or not (configuration -> 'scoring') ?& array[
      'categories',
      'initialPoints',
      'rules'
    ]
    or (configuration #>> '{pricing,currency}') not in (
      'BHD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP',
      'JPY', 'NOK', 'PLN', 'SEK', 'USD'
    )
    or (configuration #>> '{pricing,presentation}') not in ('exact', 'from', 'range')
    or (configuration #>> '{pricing,baseMinMinor}') !~ '^\d+$'
    or (configuration #>> '{pricing,baseMaxMinor}') !~ '^\d+$'
    or (configuration #>> '{pricing,roundingIncrementMinor}') !~ '^\d+$'
    or (configuration #>> '{pricing,baseMinMinor}')::numeric
      > (configuration #>> '{pricing,baseMaxMinor}')::numeric
    or (configuration #>> '{pricing,baseMaxMinor}')::numeric > 9000000000000
    or (configuration #>> '{pricing,roundingIncrementMinor}')::numeric not between 1 and 1000000
    or (
      configuration #>> '{pricing,presentation}' = 'exact'
      and configuration #>> '{pricing,baseMinMinor}'
        <> configuration #>> '{pricing,baseMaxMinor}'
    )
    or jsonb_typeof(configuration #> '{pricing,rules}') <> 'array'
    or jsonb_array_length(configuration #> '{pricing,rules}') > 50
    or (configuration #>> '{scoring,initialPoints}') !~ '^\d+$'
    or (configuration #>> '{scoring,initialPoints}')::integer not between 0 and 100
    or jsonb_typeof(configuration #> '{scoring,rules}') <> 'array'
    or jsonb_array_length(configuration #> '{scoring,rules}') > 50
    or jsonb_typeof(configuration #> '{scoring,categories}') <> 'array'
    or jsonb_array_length(configuration #> '{scoring,categories}') not between 1 and 10
  then
    return false;
  end if;

  for rule in
    select value
    from (
      select value from jsonb_array_elements(configuration #> '{pricing,rules}')
      union all
      select value from jsonb_array_elements(configuration #> '{scoring,rules}')
    ) combined
  loop
    condition := rule -> 'when';
    if jsonb_typeof(rule) <> 'object'
      or not rule ?& array['id', 'label', 'when']
      or (rule ->> 'id') !~ '^[a-z][a-z0-9_]{0,63}$'
      or char_length(trim(coalesce(rule ->> 'label', ''))) not between 1 and 160
      or rule_ids @> array[rule ->> 'id']
      or jsonb_typeof(condition) <> 'object'
      or not condition ?& array['operator', 'stepKey']
      or (condition ->> 'stepKey') !~ '^[a-z][a-z0-9_]{0,63}$'
      or (condition ->> 'operator') not in ('answered', 'equals', 'includes', 'not_equals')
      or (
        condition ->> 'operator' <> 'answered'
        and not (condition ? 'value')
      )
      or (
        condition ? 'value'
        and jsonb_typeof(condition -> 'value') not in (
          'boolean', 'number', 'string'
        )
      )
      or (
        jsonb_typeof(condition -> 'value') = 'string'
        and char_length(condition #>> '{value}') > 500
      )
      or not exists (
        select 1
        from jsonb_array_elements(snapshot -> 'steps') step
        where step ->> 'key' = condition ->> 'stepKey'
      )
    then
      return false;
    end if;
    rule_ids := array_append(rule_ids, rule ->> 'id');
  end loop;

  for rule in
    select value from jsonb_array_elements(configuration #> '{pricing,rules}')
  loop
    operation := rule -> 'operation';
    if not (rule ? 'operation')
      or jsonb_typeof(operation) <> 'object'
      or not (operation ? 'type')
      or (operation ->> 'type') not in ('add', 'multiply', 'add_per_unit')
    then
      return false;
    end if;
    if operation ->> 'type' = 'add' and (
      not operation ?& array['minMinor', 'maxMinor']
      or (operation ->> 'minMinor') !~ '^\d+$'
      or (operation ->> 'maxMinor') !~ '^\d+$'
      or (operation ->> 'minMinor')::numeric > (operation ->> 'maxMinor')::numeric
      or (operation ->> 'maxMinor')::numeric > 9000000000000
    ) then
      return false;
    end if;
    if operation ->> 'type' = 'multiply' and (
      not (operation ? 'basisPoints')
      or (operation ->> 'basisPoints') !~ '^\d+$'
      or (operation ->> 'basisPoints')::numeric not between 1 and 1000000
    ) then
      return false;
    end if;
    if operation ->> 'type' = 'add_per_unit' and (
      not operation ?& array[
        'minPerUnitMinor',
        'maxPerUnitMinor',
        'quantityStepKey'
      ]
      or (operation ->> 'minPerUnitMinor') !~ '^\d+$'
      or (operation ->> 'maxPerUnitMinor') !~ '^\d+$'
      or (operation ->> 'minPerUnitMinor')::numeric
        > (operation ->> 'maxPerUnitMinor')::numeric
      or (operation ->> 'maxPerUnitMinor')::numeric > 9000000000000
      or not exists (
        select 1
        from jsonb_array_elements(snapshot -> 'steps') step
        where step ->> 'key' = operation ->> 'quantityStepKey'
          and step ->> 'type' = 'number'
      )
    ) then
      return false;
    end if;
    if configuration #>> '{pricing,presentation}' = 'exact' and (
      (
        operation ->> 'type' = 'add'
        and operation ->> 'minMinor' <> operation ->> 'maxMinor'
      )
      or (
        operation ->> 'type' = 'add_per_unit'
        and operation ->> 'minPerUnitMinor' <> operation ->> 'maxPerUnitMinor'
      )
    ) then
      return false;
    end if;
  end loop;

  for rule in
    select value from jsonb_array_elements(configuration #> '{scoring,rules}')
  loop
    if not (rule ? 'points')
      or (rule ->> 'points') !~ '^-?\d+$'
      or (rule ->> 'points')::integer not between -100 and 100
    then
      return false;
    end if;
  end loop;

  for category in
    select value from jsonb_array_elements(configuration #> '{scoring,categories}')
  loop
    if not category ?& array['key', 'label', 'minPoints']
      or (category ->> 'key') !~ '^[a-z][a-z0-9_]{0,63}$'
      or category_keys @> array[category ->> 'key']
      or char_length(trim(coalesce(category ->> 'label', ''))) not between 1 and 120
      or (category ->> 'minPoints') !~ '^\d+$'
    then
      return false;
    end if;
    current_threshold := (category ->> 'minPoints')::integer;
    if current_threshold not between 0 and 100
      or (category_index = 0 and current_threshold <> 0)
      or current_threshold <= previous_threshold
    then
      return false;
    end if;
    previous_threshold := current_threshold;
    category_keys := array_append(category_keys, category ->> 'key');
    category_index := category_index + 1;
  end loop;
  return true;
exception
  when others then
    return false;
end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_graph_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select app_private.flow_graph_validation_issues(snapshot)
    || case
      when app_private.estimation_configuration_is_valid(snapshot) then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'code', 'INVALID_ESTIMATION_CONFIGURATION',
        'path', 'estimation',
        'message', 'Konfiguracja pricingu lub scoringu jest nieprawidłowa.',
        'severity', 'error'
      ))
    end;
$$;

create function app_private.validate_estimation_snapshot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not app_private.estimation_configuration_is_valid(new.snapshot) then
    raise exception 'invalid estimation configuration'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger flow_versions_validate_estimation
before insert on public.flow_versions
for each row execute function app_private.validate_estimation_snapshot();

create function app_private.calculate_estimation(
  snapshot jsonb,
  answers jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  category jsonb;
  configuration jsonb := snapshot -> 'estimation';
  increment bigint;
  max_minor bigint;
  min_minor bigint;
  operation jsonb;
  pricing_trace jsonb := '[]'::jsonb;
  quantity numeric;
  quantity_milli bigint;
  rule jsonb;
  score integer;
  scoring_trace jsonb := '[]'::jsonb;
begin
  if configuration is null then
    return null;
  end if;
  if not app_private.estimation_configuration_is_valid(snapshot) then
    raise exception 'invalid estimation configuration'
      using errcode = 'check_violation';
  end if;

  min_minor := (configuration #>> '{pricing,baseMinMinor}')::bigint;
  max_minor := (configuration #>> '{pricing,baseMaxMinor}')::bigint;
  for rule in
    select value from jsonb_array_elements(configuration #> '{pricing,rules}')
  loop
    if not app_private.estimation_condition_matches(rule -> 'when', answers) then
      continue;
    end if;
    operation := rule -> 'operation';
    if operation ->> 'type' = 'add' then
      min_minor := min_minor + (operation ->> 'minMinor')::bigint;
      max_minor := max_minor + (operation ->> 'maxMinor')::bigint;
    elsif operation ->> 'type' = 'multiply' then
      min_minor := (
        min_minor * (operation ->> 'basisPoints')::bigint + 5000
      ) / 10000;
      max_minor := (
        max_minor * (operation ->> 'basisPoints')::bigint + 5000
      ) / 10000;
    else
      if not answers ? (operation ->> 'quantityStepKey') then
        raise exception 'invalid unit quantity' using errcode = 'check_violation';
      end if;
      quantity := (answers ->> (operation ->> 'quantityStepKey'))::numeric;
      if quantity < 0
        or quantity > 1000000
        or quantity * 1000 <> trunc(quantity * 1000)
      then
        raise exception 'invalid unit quantity' using errcode = 'check_violation';
      end if;
      quantity_milli := (quantity * 1000)::bigint;
      min_minor := min_minor + (
        (operation ->> 'minPerUnitMinor')::bigint * quantity_milli + 500
      ) / 1000;
      max_minor := max_minor + (
        (operation ->> 'maxPerUnitMinor')::bigint * quantity_milli + 500
      ) / 1000;
    end if;
    if min_minor < 0
      or max_minor < min_minor
      or max_minor > 9007199254740991
    then
      raise exception 'estimation result outside safe range'
        using errcode = 'numeric_value_out_of_range';
    end if;
    pricing_trace := pricing_trace || jsonb_build_array(jsonb_build_object(
      'id', rule ->> 'id',
      'label', rule ->> 'label',
      'minMinorAfter', min_minor,
      'maxMinorAfter', max_minor
    ));
  end loop;
  increment := (configuration #>> '{pricing,roundingIncrementMinor}')::bigint;
  min_minor := ((min_minor + increment / 2) / increment) * increment;
  max_minor := ((max_minor + increment / 2) / increment) * increment;
  if configuration #>> '{pricing,presentation}' = 'exact'
    and min_minor <> max_minor
  then
    raise exception 'exact estimation produced a range'
      using errcode = 'check_violation';
  end if;

  score := (configuration #>> '{scoring,initialPoints}')::integer;
  for rule in
    select value from jsonb_array_elements(configuration #> '{scoring,rules}')
  loop
    if not app_private.estimation_condition_matches(rule -> 'when', answers) then
      continue;
    end if;
    score := greatest(0, least(100, score + (rule ->> 'points')::integer));
    scoring_trace := scoring_trace || jsonb_build_array(jsonb_build_object(
      'id', rule ->> 'id',
      'label', rule ->> 'label',
      'points', (rule ->> 'points')::integer
    ));
  end loop;
  select value
  into category
  from jsonb_array_elements(configuration #> '{scoring,categories}')
  where (value ->> 'minPoints')::integer <= score
  order by (value ->> 'minPoints')::integer desc
  limit 1;

  return jsonb_build_object(
    'pricing', jsonb_build_object(
      'currency', configuration #>> '{pricing,currency}',
      'presentation', configuration #>> '{pricing,presentation}',
      'minMinor', min_minor,
      'maxMinor', max_minor,
      'triggeredRules', pricing_trace
    ),
    'scoring', jsonb_build_object(
      'score', score,
      'category', jsonb_build_object(
        'key', category ->> 'key',
        'label', category ->> 'label'
      ),
      'triggeredRules', scoring_trace
    )
  );
end;
$$;

create function public.calculate_widget_result(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  answer_set jsonb;
  estimation_result jsonb;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
begin
  if session_token !~ '^[a-f0-9]{64}$' then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select session.*
  into session_record
  from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256')
  for update;
  if not found then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  if session_record.status <> 'active'
    or session_record.expires_at <= now()
  then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  if session_record.current_step_key is not null then
    raise exception 'session is incomplete' using errcode = 'check_violation';
  end if;
  select version.snapshot
  into snapshot_document
  from public.flow_versions version
  where version.id = session_record.flow_version_id;

  select coalesce(jsonb_object_agg(answer.step_key, answer.answer), '{}'::jsonb)
  into answer_set
  from public.session_answers answer
  where answer.session_id = session_record.id;
  estimation_result := app_private.calculate_estimation(snapshot_document, answer_set);
  update public.widget_sessions set last_seen_at = now() where id = session_record.id;

  return jsonb_build_object(
    'headline', snapshot_document #>> '{result,headline}',
    'disclaimer', snapshot_document #>> '{result,disclaimer}',
    'nextStepLabel', snapshot_document #>> '{result,nextStepLabel}',
    'pricing', case
      when estimation_result is null then null
      else (estimation_result -> 'pricing') - 'triggeredRules'::text
    end
  );
end;
$$;

revoke all on function app_private.estimation_condition_matches(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function app_private.estimation_configuration_is_valid(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_graph_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.validate_estimation_snapshot()
  from public, anon, authenticated;
revoke all on function app_private.calculate_estimation(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function public.calculate_widget_result(text) from public;
grant execute on function public.calculate_widget_result(text)
  to anon, authenticated;
