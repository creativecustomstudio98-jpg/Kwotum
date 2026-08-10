create type public.flow_version_status as enum ('published', 'archived');

create table public.flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 80
  ),
  draft jsonb not null check (
    jsonb_typeof(draft) = 'object'
    and octet_length(draft::text) <= 262144
  ),
  draft_revision integer not null default 1 check (draft_revision > 0),
  created_by uuid not null references auth.users (id),
  updated_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (organization_id, id)
);

create index flows_organization_updated_at_idx
  on public.flows (organization_id, updated_at desc);

create table public.flow_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  flow_id uuid not null references public.flows (id),
  version_number integer not null check (version_number > 0),
  status public.flow_version_status not null default 'published',
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and octet_length(snapshot::text) <= 262144
  ),
  snapshot_hash text not null check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  published_by uuid not null references auth.users (id),
  published_at timestamptz not null default now(),
  archived_by uuid references auth.users (id),
  archived_at timestamptz,
  unique (flow_id, version_number),
  unique (flow_id, snapshot_hash),
  unique (organization_id, flow_id, id),
  constraint flow_versions_flow_tenant_fk foreign key (
    organization_id,
    flow_id
  ) references public.flows (organization_id, id),
  constraint archived_version_has_metadata check (
    (
      status = 'published'
      and archived_by is null
      and archived_at is null
    )
    or (
      status = 'archived'
      and archived_by is not null
      and archived_at is not null
    )
  )
);

create index flow_versions_organization_flow_idx
  on public.flow_versions (organization_id, flow_id, version_number desc);

create table public.published_flows (
  public_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  flow_id uuid not null unique references public.flows (id),
  flow_version_id uuid not null unique references public.flow_versions (id),
  published_at timestamptz not null default now(),
  constraint published_flows_flow_tenant_fk foreign key (
    organization_id,
    flow_id
  ) references public.flows (organization_id, id),
  constraint published_flows_version_tenant_fk foreign key (
    organization_id,
    flow_id,
    flow_version_id
  ) references public.flow_versions (organization_id, flow_id, id)
);

create index published_flows_organization_idx
  on public.published_flows (organization_id, published_at desc);

create function app_private.append_flow_issue(
  current_issues jsonb,
  issue_code text,
  issue_path text,
  issue_message text
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select current_issues || jsonb_build_array(
    jsonb_build_object(
      'code', issue_code,
      'path', issue_path,
      'message', issue_message,
      'severity', 'error'
    )
  );
$$;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  adjacency_sources text[] := array[]::text[];
  adjacency_targets text[] := array[]::text[];
  cycle_found boolean := false;
  duplicate_key text;
  entry_key text;
  issues jsonb := '[]'::jsonb;
  option_record record;
  option_count integer;
  option_keys text[];
  reachable_keys text[] := array[]::text[];
  remaining_keys text[] := array[]::text[];
  removable_keys text[] := array[]::text[];
  rule_ids text[] := array[]::text[];
  rule_record record;
  step_count integer;
  step_keys text[] := array[]::text[];
  step_record record;
  target_key text;
  terminal_keys text[] := array[]::text[];
  terminal_found boolean := false;
begin
  if snapshot is null or jsonb_typeof(snapshot) <> 'object' then
    return app_private.append_flow_issue(
      issues,
      'INVALID_DOCUMENT',
      '',
      'Dokument procesu musi być obiektem JSON.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'schemaVersion') <> 'number'
    or snapshot ->> 'schemaVersion' <> '1'
  then
    issues := app_private.append_flow_issue(
      issues,
      'INVALID_SCHEMA_VERSION',
      'schemaVersion',
      'Obsługiwana jest wyłącznie wersja schematu 1.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'title') <> 'string'
    or char_length(
      trim(coalesce(snapshot ->> 'title', ''))
    ) not between 2 and 160
  then
    issues := app_private.append_flow_issue(
      issues,
      'TITLE_REQUIRED',
      'title',
      'Proces wymaga tytułu.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'intro') <> 'string'
    or char_length(
      trim(coalesce(snapshot ->> 'intro', ''))
    ) not between 1 and 800
  then
    issues := app_private.append_flow_issue(
      issues,
      'INTRO_REQUIRED',
      'intro',
      'Proces wymaga opisu wprowadzającego.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'result') <> 'object' then
    issues := app_private.append_flow_issue(
      issues,
      'RESULT_REQUIRED',
      'result',
      'Proces wymaga konfiguracji wyniku.'
    );
  else
    if jsonb_typeof(snapshot #> '{result,mode}') <> 'string'
      or (snapshot #>> '{result,mode}') not in ('consultation', 'no_price')
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_RESULT_MODE',
        'result.mode',
        'Wynik ma nieobsługiwany tryb.'
      );
    end if;
    if jsonb_typeof(snapshot #> '{result,headline}') <> 'string'
      or jsonb_typeof(snapshot #> '{result,nextStepLabel}') <> 'string'
      or jsonb_typeof(snapshot #> '{result,disclaimer}') <> 'string'
      or char_length(
      trim(coalesce(snapshot #>> '{result,headline}', ''))
    ) not between 1 and 240
      or char_length(
        trim(coalesce(snapshot #>> '{result,nextStepLabel}', ''))
      ) not between 1 and 120
      or char_length(
        trim(coalesce(snapshot #>> '{result,disclaimer}', ''))
      ) not between 1 and 800
    then
      issues := app_private.append_flow_issue(
        issues,
        'INCOMPLETE_RESULT',
        'result',
        'Wynik wymaga nagłówka, działania i zastrzeżenia.'
      );
    end if;
  end if;

  if jsonb_typeof(snapshot -> 'steps') <> 'array' then
    return app_private.append_flow_issue(
      issues,
      'STEPS_REQUIRED',
      'steps',
      'Proces wymaga tablicy kroków.'
    );
  end if;

  step_count := jsonb_array_length(snapshot -> 'steps');
  if step_count < 1 or step_count > 40 then
    issues := app_private.append_flow_issue(
      issues,
      'INVALID_STEP_COUNT',
      'steps',
      'Proces musi zawierać od 1 do 40 kroków.'
    );
  end if;

  for step_record in
    select value as step, ordinality - 1 as step_index
    from jsonb_array_elements(snapshot -> 'steps') with ordinality
  loop
    if jsonb_typeof(step_record.step) <> 'object' then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP',
        'steps.' || step_record.step_index,
        'Każdy krok musi być obiektem.'
      );
      continue;
    end if;

    if jsonb_typeof(step_record.step -> 'key') <> 'string'
      or coalesce(step_record.step ->> 'key', '') !~ '^[a-z][a-z0-9_]{0,63}$'
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP_KEY',
        'steps.' || step_record.step_index || '.key',
        'Krok ma nieprawidłowy klucz.'
      );
      continue;
    end if;

    step_keys := array_append(step_keys, step_record.step ->> 'key');

    if jsonb_typeof(step_record.step -> 'title') <> 'string'
      or char_length(
      trim(coalesce(step_record.step ->> 'title', ''))
    ) not between 1 and 240 then
      issues := app_private.append_flow_issue(
        issues,
        'STEP_TITLE_REQUIRED',
        'steps.' || step_record.step_index || '.title',
        'Krok wymaga tytułu.'
      );
    end if;

    if step_record.step ? 'description'
      and (
        jsonb_typeof(step_record.step -> 'description') <> 'string'
        or char_length(step_record.step ->> 'description') not between 1 and 500
      )
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP_DESCRIPTION',
        'steps.' || step_record.step_index || '.description',
        'Opis kroku ma nieprawidłową długość.'
      );
    end if;

    if jsonb_typeof(step_record.step -> 'required') <> 'boolean'
      or jsonb_typeof(step_record.step -> 'allowUnknown') <> 'boolean'
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP_FLAGS',
        'steps.' || step_record.step_index,
        'Krok wymaga logicznych pól required i allowUnknown.'
      );
    end if;

    if jsonb_typeof(step_record.step -> 'type') <> 'string'
      or (step_record.step ->> 'type') not in (
      'budget',
      'date',
      'location',
      'long_text',
      'multiple_choice',
      'number',
      'short_text',
      'single_choice',
      'yes_no'
    ) then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP_TYPE',
        'steps.' || step_record.step_index || '.type',
        'Krok ma nieobsługiwany typ.'
      );
    end if;
  end loop;

  for duplicate_key in
    select key
    from unnest(step_keys) as key
    group by key
    having count(*) > 1
  loop
    issues := app_private.append_flow_issue(
      issues,
      'DUPLICATE_STEP_KEY',
      'steps',
      'Klucz kroku „' || duplicate_key || '” występuje więcej niż raz.'
    );
  end loop;

  entry_key := snapshot ->> 'entryStepKey';
  if entry_key is null or not (entry_key = any(step_keys)) then
    issues := app_private.append_flow_issue(
      issues,
      'ENTRY_STEP_NOT_FOUND',
      'entryStepKey',
      'Krok startowy nie istnieje.'
    );
  end if;

  for step_record in
    select value as step, ordinality - 1 as step_index
    from jsonb_array_elements(snapshot -> 'steps') with ordinality
  loop
    if jsonb_typeof(step_record.step -> 'key') <> 'string'
      or coalesce(step_record.step ->> 'key', '') !~ '^[a-z][a-z0-9_]{0,63}$'
    then
      continue;
    end if;

    if not (step_record.step ? 'nextStepKey')
      or jsonb_typeof(step_record.step -> 'nextStepKey') not in ('string', 'null')
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_NEXT_STEP',
        'steps.' || step_record.step_index || '.nextStepKey',
        'Krok wymaga jawnego celu albo wartości null.'
      );
    elsif step_record.step ? 'nextStepKey'
      and jsonb_typeof(step_record.step -> 'nextStepKey') <> 'null'
    then
      target_key := step_record.step ->> 'nextStepKey';
      if not (target_key = any(step_keys)) then
        issues := app_private.append_flow_issue(
          issues,
          'TARGET_STEP_NOT_FOUND',
          'steps.' || step_record.step_index || '.nextStepKey',
          'Cel „' || target_key || '” nie istnieje.'
        );
      else
        adjacency_sources := array_append(
          adjacency_sources,
          step_record.step ->> 'key'
        );
        adjacency_targets := array_append(adjacency_targets, target_key);
      end if;
    else
      terminal_keys := array_append(
        terminal_keys,
        step_record.step ->> 'key'
      );
    end if;

    option_keys := array[]::text[];
    if jsonb_typeof(step_record.step -> 'options') <> 'array' then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_OPTIONS',
        'steps.' || step_record.step_index || '.options',
        'Opcje kroku muszą być tablicą.'
      );
    else
      option_count := jsonb_array_length(step_record.step -> 'options');
      if option_count > 20 then
        issues := app_private.append_flow_issue(
          issues,
          'TOO_MANY_OPTIONS',
          'steps.' || step_record.step_index || '.options',
          'Krok może mieć maksymalnie 20 opcji.'
        );
      end if;

      if (step_record.step ->> 'type') in ('single_choice', 'multiple_choice')
        and option_count < 2
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_OPTIONS',
          'steps.' || step_record.step_index || '.options',
          'Krok wyboru wymaga co najmniej dwóch opcji.'
        );
      elsif (step_record.step ->> 'type') not in ('single_choice', 'multiple_choice')
        and option_count > 0
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_OPTIONS',
          'steps.' || step_record.step_index || '.options',
          'Ten typ kroku nie przyjmuje opcji.'
        );
      end if;

      for option_record in
        select value as option, ordinality - 1 as option_index
        from jsonb_array_elements(step_record.step -> 'options') with ordinality
      loop
        if jsonb_typeof(option_record.option) <> 'object'
          or jsonb_typeof(option_record.option -> 'key') <> 'string'
          or jsonb_typeof(option_record.option -> 'label') <> 'string'
          or coalesce(option_record.option ->> 'key', '') !~ '^[a-z][a-z0-9_]{0,63}$'
          or char_length(
            trim(coalesce(option_record.option ->> 'label', ''))
          ) not between 1 and 160
        then
          issues := app_private.append_flow_issue(
            issues,
            'INVALID_OPTION',
            'steps.' || step_record.step_index || '.options.'
              || option_record.option_index,
            'Opcja wymaga poprawnego klucza i etykiety.'
          );
        else
          option_keys := array_append(
            option_keys,
            option_record.option ->> 'key'
          );
        end if;

        if (step_record.step ->> 'type') = 'multiple_choice'
          and option_record.option ? 'nextStepKey'
        then
          issues := app_private.append_flow_issue(
            issues,
            'INVALID_OPTIONS',
            'steps.' || step_record.step_index || '.options.'
              || option_record.option_index || '.nextStepKey',
            'Opcje wielokrotnego wyboru nie mogą zmieniać trasy bez reguły.'
          );
        end if;

        if option_record.option ? 'nextStepKey'
          and jsonb_typeof(option_record.option -> 'nextStepKey')
            not in ('string', 'null')
        then
          issues := app_private.append_flow_issue(
            issues,
            'INVALID_NEXT_STEP',
            'steps.' || step_record.step_index || '.options.'
              || option_record.option_index || '.nextStepKey',
            'Opcja ma nieprawidłowy cel.'
          );
        end if;

        if option_record.option ? 'nextStepKey'
          and jsonb_typeof(option_record.option -> 'nextStepKey') <> 'null'
        then
          target_key := option_record.option ->> 'nextStepKey';
          if not (target_key = any(step_keys)) then
            issues := app_private.append_flow_issue(
              issues,
              'TARGET_STEP_NOT_FOUND',
              'steps.' || step_record.step_index || '.options.'
                || option_record.option_index || '.nextStepKey',
              'Cel „' || target_key || '” nie istnieje.'
            );
          else
            adjacency_sources := array_append(
              adjacency_sources,
              step_record.step ->> 'key'
            );
            adjacency_targets := array_append(adjacency_targets, target_key);
          end if;
        elsif option_record.option ? 'nextStepKey' then
          terminal_keys := array_append(
            terminal_keys,
            step_record.step ->> 'key'
          );
        end if;
      end loop;

      for duplicate_key in
        select key
        from unnest(option_keys) as key
        group by key
        having count(*) > 1
      loop
        issues := app_private.append_flow_issue(
          issues,
          'DUPLICATE_OPTION_KEY',
          'steps.' || step_record.step_index || '.options',
          'Klucz opcji „' || duplicate_key || '” występuje więcej niż raz.'
        );
      end loop;
    end if;
  end loop;

  if not (snapshot ? 'rules')
    or jsonb_typeof(snapshot -> 'rules') <> 'array'
  then
    issues := app_private.append_flow_issue(
      issues,
      'INVALID_RULES',
      'rules',
      'Reguły muszą być tablicą.'
    );
  elsif jsonb_typeof(snapshot -> 'rules') = 'array' then
    if jsonb_array_length(snapshot -> 'rules') > 50 then
      issues := app_private.append_flow_issue(
        issues,
        'TOO_MANY_RULES',
        'rules',
        'Proces może mieć maksymalnie 50 reguł.'
      );
    end if;

    for rule_record in
      select value as rule, ordinality - 1 as rule_index
      from jsonb_array_elements(snapshot -> 'rules') with ordinality
    loop
      if jsonb_typeof(rule_record.rule) <> 'object'
        or jsonb_typeof(rule_record.rule -> 'id') <> 'string'
        or jsonb_typeof(rule_record.rule -> 'when') <> 'object'
        or coalesce(rule_record.rule ->> 'id', '') !~ '^[a-z][a-z0-9_]{0,63}$'
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_RULE_ID',
          'rules.' || rule_record.rule_index || '.id',
          'Reguła wymaga poprawnego identyfikatora.'
        );
      else
        rule_ids := array_append(rule_ids, rule_record.rule ->> 'id');
      end if;

      if jsonb_typeof(rule_record.rule #> '{when,stepKey}') <> 'string'
        or not (
          coalesce(rule_record.rule #>> '{when,stepKey}', '')
          = any(step_keys)
        )
      then
        issues := app_private.append_flow_issue(
          issues,
          'CONDITION_STEP_NOT_FOUND',
          'rules.' || rule_record.rule_index || '.when.stepKey',
          'Warunek odwołuje się do nieistniejącego kroku.'
        );
      elsif (rule_record.rule #>> '{when,operator}') in (
        'equals',
        'includes',
        'not_equals'
      )
        and jsonb_typeof(rule_record.rule #> '{when,value}') = 'string'
        and exists (
          select 1
          from jsonb_array_elements(snapshot -> 'steps') as condition_step
          where condition_step ->> 'key'
            = rule_record.rule #>> '{when,stepKey}'
            and jsonb_typeof(condition_step -> 'options') = 'array'
            and jsonb_array_length(condition_step -> 'options') > 0
        )
        and not exists (
          select 1
          from jsonb_array_elements(snapshot -> 'steps') as condition_step
          cross join lateral jsonb_array_elements(
            condition_step -> 'options'
          ) as condition_option
          where condition_step ->> 'key'
            = rule_record.rule #>> '{when,stepKey}'
            and condition_option ->> 'key'
              = rule_record.rule #>> '{when,value}'
        )
      then
        issues := app_private.append_flow_issue(
          issues,
          'CONDITION_OPTION_NOT_FOUND',
          'rules.' || rule_record.rule_index || '.when.value',
          'Warunek odwołuje się do nieistniejącej opcji.'
        );
      end if;

      if jsonb_typeof(rule_record.rule #> '{when,operator}') <> 'string'
        or (rule_record.rule #>> '{when,operator}') not in (
        'answered',
        'equals',
        'includes',
        'not_equals'
      ) then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_RULE_OPERATOR',
          'rules.' || rule_record.rule_index || '.when.operator',
          'Warunek ma nieobsługiwany operator.'
        );
      elsif (rule_record.rule #>> '{when,operator}') <> 'answered'
        and not (rule_record.rule #> '{when}' ? 'value')
      then
        issues := app_private.append_flow_issue(
          issues,
          'CONDITION_VALUE_REQUIRED',
          'rules.' || rule_record.rule_index || '.when.value',
          'Operator warunku wymaga wartości.'
        );
      elsif rule_record.rule #> '{when}' ? 'value'
        and jsonb_typeof(rule_record.rule #> '{when,value}')
          not in ('boolean', 'number', 'string')
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_CONDITION_VALUE',
          'rules.' || rule_record.rule_index || '.when.value',
          'Wartość warunku ma nieobsługiwany typ.'
        );
      elsif jsonb_typeof(rule_record.rule #> '{when,value}') = 'string'
        and char_length(rule_record.rule #>> '{when,value}') > 500
      then
        issues := app_private.append_flow_issue(
          issues,
          'CONDITION_VALUE_TOO_LONG',
          'rules.' || rule_record.rule_index || '.when.value',
          'Wartość warunku jest zbyt długa.'
        );
      end if;

      if jsonb_typeof(rule_record.rule #> '{then}') <> 'object'
        or not (rule_record.rule #> '{then}' ? 'stepKey')
        or jsonb_typeof(rule_record.rule #> '{then,stepKey}')
          not in ('string', 'null')
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_RULE_TARGET',
          'rules.' || rule_record.rule_index || '.then.stepKey',
          'Reguła wymaga jawnego celu albo wartości null.'
        );
      elsif rule_record.rule #>> '{then,action}' <> 'go_to' then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_RULE_ACTION',
          'rules.' || rule_record.rule_index || '.then.action',
          'Reguła ma nieobsługiwaną akcję.'
        );
      elsif jsonb_typeof(rule_record.rule #> '{then,stepKey}') <> 'null' then
        target_key := rule_record.rule #>> '{then,stepKey}';
        if not (target_key = any(step_keys)) then
          issues := app_private.append_flow_issue(
            issues,
            'TARGET_STEP_NOT_FOUND',
            'rules.' || rule_record.rule_index || '.then.stepKey',
            'Cel reguły nie istnieje.'
          );
        elsif (rule_record.rule #>> '{when,stepKey}') = any(step_keys) then
          adjacency_sources := array_append(
            adjacency_sources,
            rule_record.rule #>> '{when,stepKey}'
          );
          adjacency_targets := array_append(adjacency_targets, target_key);
        end if;
      else
        terminal_keys := array_append(
          terminal_keys,
          rule_record.rule #>> '{when,stepKey}'
        );
      end if;
    end loop;

    for duplicate_key in
      select id
      from unnest(rule_ids) as id
      group by id
      having count(*) > 1
    loop
      issues := app_private.append_flow_issue(
        issues,
        'DUPLICATE_RULE_ID',
        'rules',
        'Identyfikator reguły „' || duplicate_key || '” występuje więcej niż raz.'
      );
    end loop;
  end if;

  if entry_key = any(step_keys) then
    with recursive
      edges as (
        select
          source_key,
          adjacency_targets[ordinality] as target_key
        from unnest(adjacency_sources) with ordinality as source(source_key, ordinality)
      ),
      walk(node_key) as (
        select entry_key
        union
        select edges.target_key
        from walk
        join edges on edges.source_key = walk.node_key
      )
    select coalesce(array_agg(node_key), array[]::text[])
    into reachable_keys
    from walk;

    for step_record in
      select key, ordinality - 1 as step_index
      from unnest(step_keys) with ordinality as step(key, ordinality)
    loop
      if not (step_record.key = any(reachable_keys)) then
        issues := app_private.append_flow_issue(
          issues,
          'UNREACHABLE_STEP',
          'steps.' || step_record.step_index,
          'Krok „' || step_record.key || '” jest nieosiągalny.'
        );
      end if;
    end loop;

    remaining_keys := reachable_keys;
    while cardinality(remaining_keys) > 0 loop
      select coalesce(array_agg(candidate_key), array[]::text[])
      into removable_keys
      from unnest(remaining_keys) as candidate(candidate_key)
      where not exists (
        select 1
        from unnest(adjacency_sources) with ordinality
          as edge(source_key, edge_index)
        where adjacency_targets[edge.edge_index] = candidate.candidate_key
          and edge.source_key = any(remaining_keys)
      );

      if cardinality(removable_keys) = 0 then
        cycle_found := true;
        exit;
      end if;

      select coalesce(array_agg(key), array[]::text[])
      into remaining_keys
      from unnest(remaining_keys) as current(key)
      where not (current.key = any(removable_keys));
    end loop;

    if cycle_found then
      issues := app_private.append_flow_issue(
        issues,
        'FLOW_CYCLE',
        'steps',
        'Proces zawiera pętlę.'
      );
    end if;

    terminal_found := exists (
      select 1
      from unnest(terminal_keys) as terminal(key)
      where terminal.key = any(reachable_keys)
    );
  end if;

  if not terminal_found then
    issues := app_private.append_flow_issue(
      issues,
      'NO_TERMINAL_PATH',
      'steps',
      'Proces nie ma ścieżki kończącej się wynikiem.'
    );
  end if;

  return issues;
end;
$$;

create function app_private.prepare_flow_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.organization_id <> old.organization_id
    or new.created_by <> old.created_by
  then
    raise exception 'flow ownership is immutable'
      using errcode = 'check_violation';
  end if;

  if new.draft is distinct from old.draft then
    new.draft_revision := old.draft_revision + 1;
  elsif new.draft_revision <> old.draft_revision then
    raise exception 'draft revision is managed by the database'
      using errcode = 'check_violation';
  end if;

  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

create trigger flows_prepare_update
before update on public.flows
for each row execute function app_private.prepare_flow_update();

create function app_private.protect_flow_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'flow versions are immutable'
      using errcode = 'check_violation';
  end if;

  if new.organization_id <> old.organization_id
    or new.flow_id <> old.flow_id
    or new.version_number <> old.version_number
    or new.snapshot <> old.snapshot
    or new.snapshot_hash <> old.snapshot_hash
    or new.published_by <> old.published_by
    or new.published_at <> old.published_at
  then
    raise exception 'published flow snapshot is immutable'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger flow_versions_protect_snapshot
before update or delete on public.flow_versions
for each row execute function app_private.protect_flow_version();

create function app_private.audit_flow_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    new.organization_id,
    auth.uid(),
    lower(tg_op),
    'flows',
    new.id,
    jsonb_build_object('draft_revision', new.draft_revision)
  );
  return new;
end;
$$;

create trigger flows_write_audit_log
after insert or update on public.flows
for each row execute function app_private.audit_flow_change();

create function public.validate_flow(target_flow_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  flow_record public.flows%rowtype;
begin
  select *
  into flow_record
  from public.flows
  where id = target_flow_id;

  if not found
    or not app_private.has_role(
      flow_record.organization_id,
      array['owner', 'admin']::public.organization_member_role[]
    )
    or not app_private.is_active_member(flow_record.organization_id)
  then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  return jsonb_build_object(
    'valid',
    jsonb_array_length(
      app_private.flow_validation_issues(flow_record.draft)
    ) = 0,
    'issues',
    app_private.flow_validation_issues(flow_record.draft),
    'draftRevision',
    flow_record.draft_revision
  );
end;
$$;

create function public.publish_flow(
  target_flow_id uuid,
  expected_draft_revision integer
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  flow_record public.flows%rowtype;
  issues jsonb;
  next_version integer;
  snapshot_digest text;
  version_id uuid;
  public_flow_id uuid;
begin
  select *
  into flow_record
  from public.flows
  where id = target_flow_id
  for update;

  if not found
    or not app_private.has_role(
      flow_record.organization_id,
      array['owner', 'admin']::public.organization_member_role[]
    )
    or not exists (
      select 1
      from public.organizations organization
      where organization.id = flow_record.organization_id
        and organization.deleted_at is null
    )
  then
    raise exception 'flow not found' using errcode = 'no_data_found';
  end if;

  if flow_record.draft_revision <> expected_draft_revision then
    raise exception 'draft revision conflict'
      using errcode = 'serialization_failure';
  end if;

  issues := app_private.flow_validation_issues(flow_record.draft);
  if jsonb_array_length(issues) > 0 then
    raise exception 'flow is not publishable'
      using
        errcode = 'check_violation',
        detail = issues::text;
  end if;

  snapshot_digest := encode(
    extensions.digest(flow_record.draft::text, 'sha256'),
    'hex'
  );

  select version.id, version.version_number
  into version_id, next_version
  from public.flow_versions version
  where version.flow_id = flow_record.id
    and version.snapshot_hash = snapshot_digest;

  if version_id is null then
    select coalesce(max(version.version_number), 0) + 1
    into next_version
    from public.flow_versions version
    where version.flow_id = flow_record.id;

    insert into public.flow_versions (
      organization_id,
      flow_id,
      version_number,
      snapshot,
      snapshot_hash,
      published_by
    )
    values (
      flow_record.organization_id,
      flow_record.id,
      next_version,
      flow_record.draft,
      snapshot_digest,
      auth.uid()
    )
    returning id into version_id;
  else
    update public.flow_versions
    set
      status = 'published',
      archived_by = null,
      archived_at = null
    where id = version_id
      and status = 'archived';
  end if;

  insert into public.published_flows (
    organization_id,
    flow_id,
    flow_version_id,
    published_at
  )
  values (
    flow_record.organization_id,
    flow_record.id,
    version_id,
    now()
  )
  on conflict (flow_id) do update
  set
    flow_version_id = excluded.flow_version_id,
    published_at = excluded.published_at
  returning public_id into public_flow_id;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    flow_record.organization_id,
    auth.uid(),
    'publish',
    'flow_versions',
    version_id,
    jsonb_build_object(
      'flow_id', flow_record.id,
      'version_number', next_version,
      'snapshot_hash', snapshot_digest
    )
  );

  return jsonb_build_object(
    'flowId', flow_record.id,
    'flowVersionId', version_id,
    'versionNumber', next_version,
    'snapshotHash', snapshot_digest,
    'publicId', public_flow_id
  );
end;
$$;

create function public.archive_flow_version(target_version_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  version_record public.flow_versions%rowtype;
begin
  select *
  into version_record
  from public.flow_versions
  where id = target_version_id
  for update;

  if not found
    or not app_private.has_role(
      version_record.organization_id,
      array['owner', 'admin']::public.organization_member_role[]
    )
    or not app_private.is_active_member(version_record.organization_id)
  then
    raise exception 'flow version not found' using errcode = 'no_data_found';
  end if;

  if version_record.status = 'archived' then
    return jsonb_build_object(
      'flowVersionId', version_record.id,
      'status', 'archived'
    );
  end if;

  delete from public.published_flows
  where flow_version_id = version_record.id;

  update public.flow_versions
  set
    status = 'archived',
    archived_by = auth.uid(),
    archived_at = now()
  where id = version_record.id;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    version_record.organization_id,
    auth.uid(),
    'archive',
    'flow_versions',
    version_record.id,
    jsonb_build_object(
      'flow_id', version_record.flow_id,
      'version_number', version_record.version_number
    )
  );

  return jsonb_build_object(
    'flowVersionId', version_record.id,
    'status', 'archived'
  );
end;
$$;

revoke all on function app_private.append_flow_issue(jsonb, text, text, text)
  from public, anon, authenticated;
revoke all on function app_private.flow_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.prepare_flow_update()
  from public, anon, authenticated;
revoke all on function app_private.protect_flow_version()
  from public, anon, authenticated;
revoke all on function app_private.audit_flow_change()
  from public, anon, authenticated;
revoke all on function public.validate_flow(uuid)
  from public, anon;
revoke all on function public.publish_flow(uuid, integer)
  from public, anon;
revoke all on function public.archive_flow_version(uuid)
  from public, anon;
grant execute on function public.validate_flow(uuid) to authenticated;
grant execute on function public.publish_flow(uuid, integer) to authenticated;
grant execute on function public.archive_flow_version(uuid) to authenticated;

alter table public.flows enable row level security;
alter table public.flows force row level security;
alter table public.flow_versions enable row level security;
alter table public.flow_versions force row level security;
alter table public.published_flows enable row level security;
alter table public.published_flows force row level security;

create policy flows_select_editor
on public.flows
for select
to authenticated
using (
  app_private.is_active_member(organization_id)
  and
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flows_insert_editor
on public.flows
for insert
to authenticated
with check (
  created_by = auth.uid()
  and updated_by = auth.uid()
  and app_private.is_active_member(organization_id)
  and app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flows_update_editor
on public.flows
for update
to authenticated
using (
  app_private.is_active_member(organization_id)
  and
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
)
with check (
  app_private.is_active_member(organization_id)
  and
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flow_versions_select_editor
on public.flow_versions
for select
to authenticated
using (
  app_private.is_active_member(organization_id)
  and
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy published_flows_select_editor
on public.published_flows
for select
to authenticated
using (
  app_private.is_active_member(organization_id)
  and
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

grant select, insert, update on public.flows to authenticated;
grant select on public.flow_versions to authenticated;
grant select on public.published_flows to authenticated;
