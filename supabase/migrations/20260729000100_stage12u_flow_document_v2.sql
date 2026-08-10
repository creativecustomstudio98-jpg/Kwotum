-- Stage 12U: FlowDocument v2.
--
-- Rollback policy: published v2 snapshots are immutable and must remain readable.
-- A rollback may switch writers back to v1, but it must retain the v2 validators,
-- manifest builder and answer validator introduced by this migration.

create function app_private.flow_v2_base_snapshot(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(snapshot) <> 'object' then snapshot
    else (snapshot - 'sections' - 'steps') || jsonb_build_object(
      'schemaVersion',
      1,
      'steps',
      case
        when jsonb_typeof(snapshot -> 'steps') <> 'array'
          then coalesce(snapshot -> 'steps', 'null'::jsonb)
        else (
          select coalesce(
            jsonb_agg(
              step - 'sectionKey' - 'validation'
              order by step_index
            ),
            '[]'::jsonb
          )
          from jsonb_array_elements(snapshot -> 'steps')
            with ordinality as steps(step, step_index)
        )
      end
    )
  end;
$$;

create function app_private.flow_v2_step_validation_is_valid(step_document jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  maximum_date date;
  maximum_number numeric;
  maximum_text_length integer;
  minimum_date date;
  minimum_number numeric;
  minimum_text_length integer;
  step_type text := step_document ->> 'type';
  validation_document jsonb := step_document -> 'validation';
  validation_kind text;
begin
  if not (step_document ? 'validation') then
    return true;
  end if;

  if jsonb_typeof(validation_document) <> 'object'
    or jsonb_typeof(validation_document -> 'kind') <> 'string'
  then
    return false;
  end if;

  validation_kind := validation_document ->> 'kind';

  if validation_kind = 'text_length' then
    if step_type not in ('location', 'long_text', 'short_text')
      or validation_document - array['kind', 'maxLength', 'minLength']::text[]
        <> '{}'::jsonb
      or jsonb_typeof(validation_document -> 'minLength') <> 'number'
      or jsonb_typeof(validation_document -> 'maxLength') <> 'number'
    then
      return false;
    end if;

    minimum_number := (validation_document ->> 'minLength')::numeric;
    maximum_number := (validation_document ->> 'maxLength')::numeric;
    if minimum_number <> trunc(minimum_number)
      or maximum_number <> trunc(maximum_number)
      or minimum_number < 0
      or maximum_number < 1
      or minimum_number > maximum_number
      or maximum_number > (
        case when step_type = 'long_text' then 2000 else 500 end
      )
    then
      return false;
    end if;

    minimum_text_length := minimum_number::integer;
    maximum_text_length := maximum_number::integer;
    return minimum_text_length <= maximum_text_length;
  end if;

  if validation_kind = 'number_range' then
    if step_type not in ('budget', 'number')
      or validation_document - array['kind', 'max', 'min']::text[] <> '{}'::jsonb
      or (
        not (validation_document ? 'min')
        and not (validation_document ? 'max')
      )
      or (
        validation_document ? 'min'
        and jsonb_typeof(validation_document -> 'min') <> 'number'
      )
      or (
        validation_document ? 'max'
        and jsonb_typeof(validation_document -> 'max') <> 'number'
      )
    then
      return false;
    end if;

    minimum_number := case
      when validation_document ? 'min' then (validation_document ->> 'min')::numeric
      else null
    end;
    maximum_number := case
      when validation_document ? 'max' then (validation_document ->> 'max')::numeric
      else null
    end;
    return minimum_number is null
      or maximum_number is null
      or minimum_number <= maximum_number;
  end if;

  if validation_kind = 'date_range' then
    if step_type <> 'date'
      or validation_document - array['kind', 'max', 'min']::text[] <> '{}'::jsonb
      or (
        not (validation_document ? 'min')
        and not (validation_document ? 'max')
      )
      or (
        validation_document ? 'min'
        and (
          jsonb_typeof(validation_document -> 'min') <> 'string'
          or (validation_document ->> 'min') !~ '^\d{4}-\d{2}-\d{2}$'
        )
      )
      or (
        validation_document ? 'max'
        and (
          jsonb_typeof(validation_document -> 'max') <> 'string'
          or (validation_document ->> 'max') !~ '^\d{4}-\d{2}-\d{2}$'
        )
      )
    then
      return false;
    end if;

    minimum_date := case
      when validation_document ? 'min' then (validation_document ->> 'min')::date
      else null
    end;
    maximum_date := case
      when validation_document ? 'max' then (validation_document ->> 'max')::date
      else null
    end;
    if (
      minimum_date is not null
      and to_char(minimum_date, 'YYYY-MM-DD') <> validation_document ->> 'min'
    ) or (
      maximum_date is not null
      and to_char(maximum_date, 'YYYY-MM-DD') <> validation_document ->> 'max'
    ) then
      return false;
    end if;
    return minimum_date is null
      or maximum_date is null
      or minimum_date <= maximum_date;
  end if;

  return false;
exception
  when others then
    return false;
end;
$$;

create function app_private.flow_v2_validation_issues(snapshot jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  duplicate_key text;
  highest_section_index integer := -1;
  issues jsonb := '[]'::jsonb;
  section_count integer;
  section_index integer;
  section_keys text[] := array[]::text[];
  section_record record;
  step_record record;
begin
  if jsonb_typeof(snapshot -> 'sections') <> 'array' then
    return app_private.append_flow_issue(
      issues,
      'INVALID_SECTION',
      'sections',
      'Proces w wersji 2 wymaga tablicy sekcji.'
    );
  end if;

  section_count := jsonb_array_length(snapshot -> 'sections');
  if section_count < 1 or section_count > 20 then
    issues := app_private.append_flow_issue(
      issues,
      'INVALID_SECTION',
      'sections',
      'Proces musi zawierać od 1 do 20 sekcji.'
    );
  end if;

  for section_record in
    select value as section, ordinality - 1 as section_position
    from jsonb_array_elements(snapshot -> 'sections') with ordinality
  loop
    if jsonb_typeof(section_record.section) <> 'object'
      or section_record.section - array['key', 'title']::text[] <> '{}'::jsonb
      or jsonb_typeof(section_record.section -> 'key') <> 'string'
      or coalesce(section_record.section ->> 'key', '') !~ '^[a-z][a-z0-9_]{0,63}$'
      or jsonb_typeof(section_record.section -> 'title') <> 'string'
      or char_length(trim(coalesce(section_record.section ->> 'title', '')))
        not between 1 and 120
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_SECTION',
        'sections.' || section_record.section_position,
        'Sekcja wymaga poprawnego klucza i tytułu.'
      );
    else
      section_keys := array_append(section_keys, section_record.section ->> 'key');
    end if;
  end loop;

  for duplicate_key in
    select key
    from unnest(section_keys) as key
    group by key
    having count(*) > 1
  loop
    issues := app_private.append_flow_issue(
      issues,
      'DUPLICATE_SECTION_KEY',
      'sections',
      'Klucz sekcji „' || duplicate_key || '” występuje więcej niż raz.'
    );
  end loop;

  if jsonb_typeof(snapshot -> 'steps') <> 'array' then
    return issues;
  end if;

  for step_record in
    select value as step, ordinality - 1 as step_index
    from jsonb_array_elements(snapshot -> 'steps') with ordinality
  loop
    if jsonb_typeof(step_record.step) <> 'object'
      or jsonb_typeof(step_record.step -> 'sectionKey') <> 'string'
      or coalesce(step_record.step ->> 'sectionKey', '') !~ '^[a-z][a-z0-9_]{0,63}$'
    then
      issues := app_private.append_flow_issue(
        issues,
        'SECTION_NOT_FOUND',
        'steps.' || step_record.step_index || '.sectionKey',
        'Krok wymaga klucza istniejącej sekcji.'
      );
    else
      section_index := array_position(section_keys, step_record.step ->> 'sectionKey');
      if section_index is null then
        issues := app_private.append_flow_issue(
          issues,
          'SECTION_NOT_FOUND',
          'steps.' || step_record.step_index || '.sectionKey',
          'Sekcja „' || (step_record.step ->> 'sectionKey') || '” nie istnieje.'
        );
      else
        if section_index - 1 < highest_section_index then
          issues := app_private.append_flow_issue(
            issues,
            'SECTION_ORDER_INVALID',
            'steps.' || step_record.step_index || '.sectionKey',
            'Pytania sekcji muszą tworzyć spójną, uporządkowaną grupę.'
          );
        end if;
        highest_section_index := greatest(highest_section_index, section_index - 1);
      end if;
    end if;

    if not app_private.flow_v2_step_validation_is_valid(step_record.step) then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_STEP_VALIDATION',
        'steps.' || step_record.step_index || '.validation',
        'Walidacja kroku nie pasuje do jego typu lub ma błędny zakres.'
      );
    end if;
  end loop;

  for section_record in
    select value as section, ordinality - 1 as section_position
    from jsonb_array_elements(snapshot -> 'sections') with ordinality
  loop
    if jsonb_typeof(section_record.section -> 'key') = 'string'
      and not exists (
        select 1
        from jsonb_array_elements(snapshot -> 'steps') step
        where step ->> 'sectionKey' = section_record.section ->> 'key'
      )
    then
      issues := app_private.append_flow_issue(
        issues,
        'EMPTY_SECTION',
        'sections.' || section_record.section_position,
        'Sekcja „' || (section_record.section ->> 'title')
          || '” nie zawiera żadnego pytania.'
      );
    end if;
  end loop;

  return issues;
end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage7_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(snapshot) = 'object'
      and snapshot ->> 'schemaVersion' = '2'
    then app_private.flow_stage7_validation_issues(
      app_private.flow_v2_base_snapshot(snapshot)
    ) || app_private.flow_v2_validation_issues(snapshot)
    else app_private.flow_stage7_validation_issues(snapshot)
  end;
$$;

alter function app_private.build_widget_manifest(jsonb, uuid, text, timestamptz)
rename to build_widget_manifest_stage7;

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
    select app_private.build_widget_manifest_stage7(
      snapshot,
      public_flow_id,
      snapshot_digest,
      publication_time
    ) as manifest
  )
  select case
    when snapshot ->> 'schemaVersion' <> '2' then base.manifest
    else base.manifest || jsonb_build_object(
      'manifestVersion',
      2,
      'steps',
      (
        select coalesce(
          jsonb_agg(
            public_step || jsonb_build_object(
              'validation',
              case source_step #>> '{validation,kind}'
                when 'text_length' then jsonb_build_object(
                  'kind', 'text_length',
                  'minLength', source_step #> '{validation,minLength}',
                  'maxLength', source_step #> '{validation,maxLength}'
                )
                when 'number_range' then jsonb_strip_nulls(jsonb_build_object(
                  'kind', 'number_range',
                  'min', source_step #> '{validation,min}',
                  'max', source_step #> '{validation,max}'
                ))
                when 'date_range' then jsonb_strip_nulls(jsonb_build_object(
                  'kind', 'date_range',
                  'min', source_step #> '{validation,min}',
                  'max', source_step #> '{validation,max}'
                ))
                else null
              end
            )
            order by public_index
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(base.manifest -> 'steps')
          with ordinality as public_steps(public_step, public_index)
        join jsonb_array_elements(snapshot -> 'steps')
          with ordinality as source_steps(source_step, source_index)
          on source_index = public_index
      )
    )
  end
  from base;
$$;

alter function app_private.widget_answer_is_valid(jsonb, jsonb)
rename to widget_answer_is_valid_stage5;

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
  answer_date date;
  answer_length integer;
  answer_number numeric;
  maximum_date date;
  maximum_number numeric;
  minimum_date date;
  minimum_number numeric;
  validation_document jsonb := step_document -> 'validation';
begin
  if not app_private.widget_answer_is_valid_stage5(step_document, candidate) then
    return false;
  end if;

  if candidate = 'null'::jsonb
    or (
      jsonb_typeof(candidate) = 'string'
      and candidate #>> '{}' = '__unknown__'
    )
    or not (step_document ? 'validation')
  then
    return true;
  end if;

  if validation_document ->> 'kind' = 'text_length' then
    answer_length := char_length(trim(candidate #>> '{}'));
    return answer_length between
      (validation_document ->> 'minLength')::integer
      and (validation_document ->> 'maxLength')::integer;
  end if;

  if validation_document ->> 'kind' = 'number_range' then
    answer_number := (candidate #>> '{}')::numeric;
    minimum_number := case
      when validation_document ? 'min' then (validation_document ->> 'min')::numeric
      else null
    end;
    maximum_number := case
      when validation_document ? 'max' then (validation_document ->> 'max')::numeric
      else null
    end;
    return (minimum_number is null or answer_number >= minimum_number)
      and (maximum_number is null or answer_number <= maximum_number);
  end if;

  if validation_document ->> 'kind' = 'date_range' then
    answer_date := (candidate #>> '{}')::date;
    minimum_date := case
      when validation_document ? 'min' then (validation_document ->> 'min')::date
      else null
    end;
    maximum_date := case
      when validation_document ? 'max' then (validation_document ->> 'max')::date
      else null
    end;
    return (minimum_date is null or answer_date >= minimum_date)
      and (maximum_date is null or answer_date <= maximum_date);
  end if;

  return false;
exception
  when others then
    return false;
end;
$$;

revoke all on function app_private.flow_v2_base_snapshot(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_v2_step_validation_is_valid(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_v2_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_stage7_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.flow_validation_issues(jsonb)
  from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest_stage7(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function app_private.build_widget_manifest(
  jsonb, uuid, text, timestamptz
) from public, anon, authenticated;
revoke all on function app_private.widget_answer_is_valid_stage5(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function app_private.widget_answer_is_valid(jsonb, jsonb)
  from public, anon, authenticated;
