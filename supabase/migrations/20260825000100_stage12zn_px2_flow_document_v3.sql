-- Stage 12ZN / PX2: FlowDocument v3 presentation contract.
--
-- Rollback policy: v1/v2/v3 snapshots are immutable and remain readable.
-- An application rollback may stop writing v3, but must retain the v3
-- validator and manifest builder while any v3 draft, version or session exists.

create function app_private.flow_v3_base_snapshot(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(snapshot) <> 'object' then snapshot
    else (snapshot - 'experienceMode' - 'steps') || jsonb_build_object(
      'schemaVersion',
      2,
      'steps',
      case
        when jsonb_typeof(snapshot -> 'steps') <> 'array'
          then coalesce(snapshot -> 'steps', 'null'::jsonb)
        else (
          select coalesce(
            jsonb_agg(
              (step - 'presentation' - 'options') || jsonb_build_object(
                'options',
                case
                  when jsonb_typeof(step -> 'options') <> 'array'
                    then coalesce(step -> 'options', 'null'::jsonb)
                  else (
                    select coalesce(
                      jsonb_agg(option - 'presentation' order by option_index),
                      '[]'::jsonb
                    )
                    from jsonb_array_elements(step -> 'options')
                      with ordinality as options(option, option_index)
                  )
                end
              )
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

create function app_private.flow_v3_option_presentation_is_valid(presentation jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  asset jsonb;
begin
  if jsonb_typeof(presentation) <> 'object'
    or presentation = '{}'::jsonb
    or presentation - array['asset', 'description', 'icon']::text[] <> '{}'::jsonb
  then
    return false;
  end if;

  if presentation ? 'description' and (
    jsonb_typeof(presentation -> 'description') <> 'string'
    or char_length(trim(presentation ->> 'description')) not between 1 and 180
  ) then
    return false;
  end if;

  if presentation ? 'icon' and (
    jsonb_typeof(presentation -> 'icon') <> 'string'
    or presentation ->> 'icon' not in (
      'apartment', 'building', 'calendar', 'camera', 'check', 'clock',
      'document', 'door', 'fence', 'globe', 'home', 'kitchen', 'layers',
      'location', 'palette', 'phone', 'renovation', 'ruler', 'settings',
      'shopping_bag', 'snowflake', 'sparkles', 'store', 'wardrobe'
    )
  ) then
    return false;
  end if;

  if presentation ? 'asset' then
    asset := presentation -> 'asset';
    if jsonb_typeof(asset) <> 'object'
      or asset - array['alt', 'id']::text[] <> '{}'::jsonb
      or jsonb_typeof(asset -> 'alt') <> 'string'
      or char_length(trim(asset ->> 'alt')) not between 1 and 160
      or jsonb_typeof(asset -> 'id') <> 'string'
      or asset ->> 'id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
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

create function app_private.flow_v3_validation_issues(snapshot jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  issues jsonb := '[]'::jsonb;
  option_record record;
  presentation jsonb;
  step_record record;
  variant text;
begin
  if jsonb_typeof(snapshot -> 'experienceMode') <> 'string'
    or snapshot ->> 'experienceMode' not in (
      'quick_form', 'guided_brief', 'visual_configurator'
    )
  then
    issues := app_private.append_flow_issue(
      issues,
      'INVALID_PRESENTATION',
      'experienceMode',
      'Proces v3 wymaga obsługiwanego trybu doświadczenia.'
    );
  end if;

  if jsonb_typeof(snapshot -> 'steps') <> 'array' then
    return issues;
  end if;

  for step_record in
    select value as step, ordinality - 1 as step_index
    from jsonb_array_elements(snapshot -> 'steps') with ordinality
  loop
    presentation := step_record.step -> 'presentation';
    variant := presentation ->> 'variant';
    if jsonb_typeof(presentation) <> 'object'
      or presentation - 'variant' <> '{}'::jsonb
      or jsonb_typeof(presentation -> 'variant') <> 'string'
      or variant not in ('default', 'text_cards', 'icon_cards', 'image_cards')
      or (
        step_record.step ->> 'type' not in ('single_choice', 'multiple_choice')
        and variant <> 'default'
      )
      or (
        snapshot ->> 'experienceMode' <> 'visual_configurator'
        and variant <> 'default'
      )
    then
      issues := app_private.append_flow_issue(
        issues,
        'INVALID_PRESENTATION',
        'steps.' || step_record.step_index || '.presentation',
        'Prezentacja kroku nie pasuje do trybu lub typu pytania.'
      );
      continue;
    end if;

    if jsonb_typeof(step_record.step -> 'options') <> 'array' then
      continue;
    end if;

    for option_record in
      select value as option, ordinality - 1 as option_index
      from jsonb_array_elements(step_record.step -> 'options') with ordinality
    loop
      presentation := option_record.option -> 'presentation';
      if option_record.option ? 'presentation'
        and not app_private.flow_v3_option_presentation_is_valid(presentation)
      then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_PRESENTATION',
          'steps.' || step_record.step_index || '.options.'
            || option_record.option_index || '.presentation',
          'Opcja zawiera nieprawidłową prezentację.'
        );
      elsif variant = 'default' and option_record.option ? 'presentation' then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_PRESENTATION',
          'steps.' || step_record.step_index || '.options.'
            || option_record.option_index || '.presentation',
          'Domyślna lista nie przyjmuje niewykorzystywanej prezentacji opcji.'
        );
      elsif variant = 'text_cards' and not (
        jsonb_typeof(presentation -> 'description') = 'string'
      ) then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_PRESENTATION',
          'steps.' || step_record.step_index || '.options.'
            || option_record.option_index || '.presentation',
          'Karta tekstowa wymaga opisu każdej opcji.'
        );
      elsif variant = 'icon_cards' and not (
        jsonb_typeof(presentation -> 'icon') = 'string'
      ) then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_PRESENTATION',
          'steps.' || step_record.step_index || '.options.'
            || option_record.option_index || '.presentation',
          'Karta ikonowa wymaga allowlistowanej ikony każdej opcji.'
        );
      elsif variant = 'image_cards' and not (
        jsonb_typeof(presentation -> 'asset') = 'object'
      ) then
        issues := app_private.append_flow_issue(
          issues,
          'INVALID_PRESENTATION',
          'steps.' || step_record.step_index || '.options.'
            || option_record.option_index || '.presentation',
          'Karta obrazowa wymaga kontrolowanego assetu każdej opcji.'
        );
      end if;
    end loop;
  end loop;

  return issues;
end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage12u_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(snapshot) = 'object'
      and snapshot ->> 'schemaVersion' = '3'
    then app_private.flow_stage12u_validation_issues(
      app_private.flow_v3_base_snapshot(snapshot)
    ) || app_private.flow_v3_validation_issues(snapshot)
    else app_private.flow_stage12u_validation_issues(snapshot)
  end;
$$;

alter function app_private.build_widget_manifest(jsonb, uuid, text, timestamptz)
rename to build_widget_manifest_stage12zk;

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
    select app_private.build_widget_manifest_stage12zk(
      case
        when snapshot ->> 'schemaVersion' = '3'
          then app_private.flow_v3_base_snapshot(snapshot)
        else snapshot
      end,
      public_flow_id,
      snapshot_digest,
      publication_time
    ) as manifest
  )
  select case
    when snapshot ->> 'schemaVersion' <> '3' then base.manifest
    else base.manifest || jsonb_build_object(
      'manifestVersion',
      3,
      'experienceMode',
      snapshot ->> 'experienceMode',
      'steps',
      (
        select coalesce(
          jsonb_agg(
            public_step || jsonb_build_object(
              'presentation',
              source_step -> 'presentation',
              'options',
              (
                select coalesce(
                  jsonb_agg(
                    public_option || jsonb_build_object(
                      'presentation',
                      coalesce(source_option -> 'presentation', 'null'::jsonb)
                    )
                    order by public_option_index
                  ),
                  '[]'::jsonb
                )
                from jsonb_array_elements(public_step -> 'options')
                  with ordinality as public_options(public_option, public_option_index)
                join jsonb_array_elements(source_step -> 'options')
                  with ordinality as source_options(source_option, source_option_index)
                  on source_option_index = public_option_index
              )
            )
            order by public_step_index
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(base.manifest -> 'steps')
          with ordinality as public_steps(public_step, public_step_index)
        join jsonb_array_elements(snapshot -> 'steps')
          with ordinality as source_steps(source_step, source_step_index)
          on source_step_index = public_step_index
      )
    )
  end
  from base;
$$;

revoke all on function app_private.flow_v3_base_snapshot(jsonb) from public;
revoke all on function app_private.flow_v3_option_presentation_is_valid(jsonb) from public;
revoke all on function app_private.flow_v3_validation_issues(jsonb) from public;
revoke all on function app_private.flow_stage12u_validation_issues(jsonb) from public;
revoke all on function app_private.flow_validation_issues(jsonb) from public;
revoke all on function app_private.build_widget_manifest_stage12zk(
  jsonb,
  uuid,
  text,
  timestamptz
) from public;
revoke all on function app_private.build_widget_manifest(
  jsonb,
  uuid,
  text,
  timestamptz
) from public;
