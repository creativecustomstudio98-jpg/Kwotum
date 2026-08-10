\set ON_ERROR_STOP on

do $$
declare
  calculated jsonb;
  fixture jsonb := jsonb_set(
    test_support.valid_flow_document(),
    '{steps}',
    test_support.valid_flow_document() -> 'steps'
      || '[{
        "key": "meters",
        "type": "number",
        "title": "Ile metrów?",
        "required": false,
        "allowUnknown": false,
        "nextStepKey": null,
        "options": []
      }]'::jsonb
  ) || jsonb_build_object(
    'estimation',
    '{
      "estimationSchemaVersion": 1,
      "pricing": {
        "currency": "PLN",
        "presentation": "range",
        "baseMinMinor": 10000,
        "baseMaxMinor": 15000,
        "roundingIncrementMinor": 100,
        "rules": [
          {
            "id": "premium_addition",
            "label": "Wariant premium",
            "when": {"stepKey": "service", "operator": "equals", "value": "premium"},
            "operation": {"type": "add", "minMinor": 2000, "maxMinor": 2500}
          },
          {
            "id": "premium_multiplier",
            "label": "Złożony wariant premium",
            "when": {"stepKey": "service", "operator": "equals", "value": "premium"},
            "operation": {"type": "multiply", "basisPoints": 12500}
          },
          {
            "id": "meter_rate",
            "label": "Stawka jednostkowa",
            "when": {"stepKey": "meters", "operator": "answered"},
            "operation": {
              "type": "add_per_unit",
              "quantityStepKey": "meters",
              "minPerUnitMinor": 150,
              "maxPerUnitMinor": 250
            }
          }
        ]
      },
      "scoring": {
        "initialPoints": 30,
        "rules": [
          {
            "id": "premium_score",
            "label": "Wariant premium",
            "points": 35,
            "when": {"stepKey": "service", "operator": "equals", "value": "premium"}
          },
          {
            "id": "second_premium_score",
            "label": "Kompletność wariantu",
            "points": 50,
            "when": {"stepKey": "service", "operator": "equals", "value": "premium"}
          }
        ],
        "categories": [
          {"key": "cold", "label": "Niski priorytet", "minPoints": 0},
          {"key": "warm", "label": "Dobry lead", "minPoints": 40},
          {"key": "hot", "label": "Wysoki priorytet", "minPoints": 75}
        ]
      }
    }'::jsonb
  );
begin
  if not app_private.estimation_configuration_is_valid(fixture) then
    raise exception 'valid estimation fixture was rejected';
  end if;
  calculated := app_private.calculate_estimation(
    fixture,
    '{"service":"premium","meters":2.5}'::jsonb
  );
  if calculated #>> '{pricing,minMinor}' <> '15400'
    or calculated #>> '{pricing,maxMinor}' <> '22500'
    or calculated #>> '{scoring,score}' <> '100'
    or calculated #>> '{scoring,category,key}' <> 'hot'
    or calculated #>> '{pricing,triggeredRules,0,id}' <> 'premium_addition'
    or calculated #>> '{pricing,triggeredRules,1,id}' <> 'premium_multiplier'
    or calculated #>> '{pricing,triggeredRules,2,id}' <> 'meter_rate'
    or jsonb_array_length(calculated #> '{scoring,triggeredRules}') <> 2
  then
    raise exception 'estimation result or explanation differs: %', calculated;
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

update public.flows
set draft = draft || jsonb_build_object(
  'estimation',
  '{"estimationSchemaVersion":1}'::jsonb
)
where id = 'f1000000-0000-4000-8000-000000000001';

do $$
declare
  revision integer;
  validation jsonb;
begin
  validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000001'
  );
  if (validation ->> 'valid')::boolean
    or not exists (
      select 1
      from jsonb_array_elements(validation -> 'issues') issue
      where issue ->> 'code' = 'INVALID_ESTIMATION_CONFIGURATION'
    )
  then
    raise exception 'validate_flow accepted invalid estimation: %', validation;
  end if;
  select draft_revision into revision
  from public.flows
  where id = 'f1000000-0000-4000-8000-000000000001';
  begin
    perform public.publish_flow(
      'f1000000-0000-4000-8000-000000000001',
      revision
    );
    raise exception 'invalid estimation configuration was published';
  exception
    when check_violation then
      null;
  end;
end;
$$;

update public.flows
set draft = draft || jsonb_build_object(
  'estimation',
  '{
    "estimationSchemaVersion": 1,
    "pricing": {
      "currency": "PLN",
      "presentation": "range",
      "baseMinMinor": 10000,
      "baseMaxMinor": 15000,
      "roundingIncrementMinor": 100,
      "rules": [
        {
          "id": "premium_addition",
          "label": "Wariant premium",
          "when": {"stepKey": "service", "operator": "equals", "value": "premium"},
          "operation": {"type": "add", "minMinor": 2000, "maxMinor": 2500}
        },
        {
          "id": "premium_multiplier",
          "label": "Złożony wariant premium",
          "when": {"stepKey": "service", "operator": "equals", "value": "premium"},
          "operation": {"type": "multiply", "basisPoints": 12500}
        }
      ]
    },
    "scoring": {
      "initialPoints": 30,
      "rules": [
        {
          "id": "premium_score",
          "label": "Wariant premium",
          "points": 35,
          "when": {"stepKey": "service", "operator": "equals", "value": "premium"}
        },
        {
          "id": "second_premium_score",
          "label": "Kompletność wariantu",
          "points": 50,
          "when": {"stepKey": "service", "operator": "equals", "value": "premium"}
        }
      ],
      "categories": [
        {"key": "cold", "label": "Niski priorytet", "minPoints": 0},
        {"key": "warm", "label": "Dobry lead", "minPoints": 40},
        {"key": "hot", "label": "Wysoki priorytet", "minPoints": 75}
      ]
    }
  }'::jsonb
)
where id = 'f1000000-0000-4000-8000-000000000001';

do $$
declare
  revision integer;
begin
  select draft_revision into revision
  from public.flows
  where id = 'f1000000-0000-4000-8000-000000000001';
  perform public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    revision
  );
end;
$$;

reset role;
set role anon;

do $$
declare
  created jsonb;
  public_result jsonb;
  raw_token text;
  revision integer := 0;
  saved jsonb;
begin
  created := public.create_widget_session(test_support.widget_public_id());
  raw_token := created ->> 'token';
  if created #> '{manifest,estimation}' is not null then
    raise exception 'public manifest leaked estimation configuration';
  end if;

  saved := public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'service',
    '"premium"'::jsonb,
    'details'
  );
  revision := (saved ->> 'revision')::integer;
  saved := public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'details',
    '"Opis zakresu"'::jsonb,
    'location'
  );
  revision := (saved ->> 'revision')::integer;

  begin
    perform public.calculate_widget_result(raw_token);
    raise exception 'incomplete session received a result';
  exception
    when check_violation then
      null;
  end;

  perform public.save_widget_answer(
    raw_token,
    gen_random_uuid(),
    revision,
    'location',
    '"Warszawa"'::jsonb,
    null
  );
  public_result := public.calculate_widget_result(raw_token);
  if public_result #>> '{pricing,minMinor}' <> '15000'
    or public_result #>> '{pricing,maxMinor}' <> '21900'
    or public_result ? 'scoring'
    or public_result #> '{pricing,triggeredRules}' is not null
  then
    raise exception 'public result is wrong or leaks scoring: %', public_result;
  end if;

  begin
    perform app_private.calculate_estimation('{}'::jsonb, '{}'::jsonb);
    raise exception 'anon executed private estimation function';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
select 'estimation checks passed' as result;
