-- Stage 12ZO / PX3: independent server-side quick-form compatibility gate.
--
-- Rollback policy: keep this validator while any v3 quick-form draft or
-- published snapshot exists. An application rollback may stop offering the
-- mode, but must not weaken validation of already stored documents.

create function app_private.quick_form_validation_issues(snapshot jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  expected_next_step_key text;
  issues jsonb := '[]'::jsonb;
  option_record record;
  step_count integer;
  step_record record;
begin
  if jsonb_typeof(snapshot) <> 'object'
    or snapshot ->> 'schemaVersion' <> '3'
    or snapshot ->> 'experienceMode' <> 'quick_form'
  then
    return issues;
  end if;

  if jsonb_typeof(snapshot -> 'steps') <> 'array' then
    return issues;
  end if;

  step_count := jsonb_array_length(snapshot -> 'steps');
  if step_count > 8 then
    issues := app_private.append_flow_issue(
      issues,
      'QUICK_FORM_TOO_LONG',
      'experienceMode',
      'Krótki formularz może zawierać maksymalnie 8 pytań.'
    );
  end if;

  if snapshot ->> 'entryStepKey' is distinct from snapshot -> 'steps' -> 0 ->> 'key' then
    issues := app_private.append_flow_issue(
      issues,
      'QUICK_FORM_NOT_LINEAR',
      'entryStepKey',
      'Krótki formularz musi rozpoczynać się od pierwszego pytania.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'rules') = 'array'
    and jsonb_array_length(snapshot -> 'rules') > 0
  then
    issues := app_private.append_flow_issue(
      issues,
      'QUICK_FORM_NOT_LINEAR',
      'rules',
      'Krótki formularz nie obsługuje rozgałęzień opartych na regułach.'
    );
  end if;

  for step_record in
    select value as step, ordinality - 1 as step_index
    from jsonb_array_elements(snapshot -> 'steps') with ordinality
  loop
    expected_next_step_key := case
      when step_record.step_index + 1 < step_count
        then snapshot -> 'steps' -> ((step_record.step_index + 1)::integer) ->> 'key'
      else null
    end;

    if step_record.step ->> 'nextStepKey' is distinct from expected_next_step_key then
      issues := app_private.append_flow_issue(
        issues,
        'QUICK_FORM_NOT_LINEAR',
        'steps.' || step_record.step_index || '.nextStepKey',
        'Każde pytanie krótkiego formularza musi prowadzić do kolejnego pytania w kolejności.'
      );
    end if;

    if jsonb_typeof(step_record.step -> 'options') = 'array' then
      for option_record in
        select value as option
        from jsonb_array_elements(step_record.step -> 'options')
      loop
        if option_record.option ? 'nextStepKey' then
          issues := app_private.append_flow_issue(
            issues,
            'QUICK_FORM_NOT_LINEAR',
            'steps.' || step_record.step_index || '.options',
            'Opcje krótkiego formularza nie mogą zmieniać trasy procesu.'
          );
          exit;
        end if;
      end loop;
    end if;
  end loop;

  return issues;
end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage12zn_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select app_private.flow_stage12zn_validation_issues(snapshot)
    || app_private.quick_form_validation_issues(snapshot);
$$;

revoke all on function app_private.quick_form_validation_issues(jsonb) from public;
revoke all on function app_private.flow_stage12zn_validation_issues(jsonb) from public;
revoke all on function app_private.flow_validation_issues(jsonb) from public;
