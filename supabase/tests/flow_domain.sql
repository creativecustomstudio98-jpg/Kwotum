\set ON_ERROR_STOP on

create schema test_support;
revoke all on schema test_support from public;

create function test_support.valid_flow_document()
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select '{
    "schemaVersion": 1,
    "title": "Testowy proces",
    "intro": "Krótki opis procesu testowego.",
    "entryStepKey": "service",
    "steps": [
      {
        "key": "service",
        "type": "single_choice",
        "title": "Jakiej usługi potrzebujesz?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": "location",
        "options": [
          {"key": "standard", "label": "Wariant standardowy"},
          {"key": "premium", "label": "Wariant premium", "nextStepKey": "details"}
        ]
      },
      {
        "key": "details",
        "type": "long_text",
        "title": "Opisz dodatkowe wymagania",
        "required": false,
        "allowUnknown": true,
        "nextStepKey": "location",
        "options": []
      },
      {
        "key": "location",
        "type": "location",
        "title": "Gdzie ma być wykonana usługa?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": null,
        "options": []
      }
    ],
    "rules": [
      {
        "id": "premium_details",
        "when": {"stepKey": "service", "operator": "equals", "value": "premium"},
        "then": {"action": "go_to", "stepKey": "details"}
      }
    ],
    "result": {
      "mode": "consultation",
      "headline": "Dziękujemy za informacje",
      "nextStepLabel": "Przekaż dane do konsultacji",
      "disclaimer": "Wynik jest orientacyjny i nie stanowi oferty."
    }
  }'::jsonb;
$$;

create function test_support.valid_flow_document_v2()
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select '{
    "schemaVersion": 2,
    "title": "Testowy proces v2",
    "intro": "Proces z prawdziwymi sekcjami i ograniczeniami odpowiedzi.",
    "entryStepKey": "service",
    "sections": [
      {"key": "potrzeby", "title": "Potrzeby i cele"},
      {"key": "budzet_i_termin", "title": "Budżet i termin"},
      {"key": "lokalizacja", "title": "Lokalizacja"}
    ],
    "steps": [
      {
        "key": "service",
        "sectionKey": "potrzeby",
        "type": "single_choice",
        "title": "Jakiej usługi potrzebujesz?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": "details",
        "options": [
          {"key": "standard", "label": "Wariant standardowy"},
          {"key": "premium", "label": "Wariant premium"}
        ]
      },
      {
        "key": "details",
        "sectionKey": "potrzeby",
        "type": "long_text",
        "title": "Opisz dodatkowe wymagania",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": "budget",
        "options": [],
        "validation": {
          "kind": "text_length",
          "minLength": 10,
          "maxLength": 200
        }
      },
      {
        "key": "budget",
        "sectionKey": "budzet_i_termin",
        "type": "budget",
        "title": "Jaki jest orientacyjny budżet?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": "deadline",
        "options": [],
        "validation": {
          "kind": "number_range",
          "min": 1000,
          "max": 10000
        }
      },
      {
        "key": "deadline",
        "sectionKey": "budzet_i_termin",
        "type": "date",
        "title": "Jaki jest oczekiwany termin?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": "location",
        "options": [],
        "validation": {
          "kind": "date_range",
          "min": "2026-01-01",
          "max": "2026-12-31"
        }
      },
      {
        "key": "location",
        "sectionKey": "lokalizacja",
        "type": "location",
        "title": "Gdzie ma być wykonana usługa?",
        "required": true,
        "allowUnknown": false,
        "nextStepKey": null,
        "options": [],
        "validation": {
          "kind": "text_length",
          "minLength": 3,
          "maxLength": 120
        }
      }
    ],
    "rules": [],
    "result": {
      "mode": "consultation",
      "headline": "Dziękujemy za informacje",
      "nextStepLabel": "Przekaż dane do konsultacji",
      "disclaimer": "Wynik jest orientacyjny i nie stanowi oferty."
    }
  }'::jsonb;
$$;

grant usage on schema test_support to authenticated;
grant execute on function test_support.valid_flow_document() to authenticated;
grant execute on function test_support.valid_flow_document_v2() to authenticated;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces Ownera A',
  'proces-ownera-a',
  test_support.valid_flow_document(),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

do $$
declare
  validation jsonb;
  publication jsonb;
begin
  validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000001'
  );
  if not (validation ->> 'valid')::boolean
    or jsonb_array_length(validation -> 'issues') <> 0
  then
    raise exception 'valid flow did not pass validation: %', validation;
  end if;

  publication := public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    1
  );
  if (publication ->> 'versionNumber')::integer <> 1
    or char_length(publication ->> 'snapshotHash') <> 64
  then
    raise exception 'first publication returned invalid metadata: %', publication;
  end if;

  perform public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    1
  );
  if (
    select count(*)
    from public.flow_versions
    where flow_id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'publishing an unchanged snapshot created a duplicate version';
  end if;

  if (
    select count(*)
    from public.published_flows
    where flow_id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'published flow alias was not created';
  end if;
end;
$$;

update public.flows
set name = 'Proces Ownera A po zmianie nazwy'
where id = 'f1000000-0000-4000-8000-000000000001';

do $$
begin
  if (
    select draft_revision
    from public.flows
    where id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 2 then
    raise exception 'flow name change did not increment the draft revision';
  end if;
end;
$$;

update public.flows
set draft = jsonb_set(
  draft,
  '{title}',
  to_jsonb('Testowy proces po zmianie'::text)
)
where id = 'f1000000-0000-4000-8000-000000000001';

do $$
declare
  publication jsonb;
begin
  if (
    select draft_revision
    from public.flows
    where id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 3 then
    raise exception 'draft revision was not incremented';
  end if;

  begin
    perform public.publish_flow(
      'f1000000-0000-4000-8000-000000000001',
      2
    );
    raise exception 'stale draft revision was accepted';
  exception
    when serialization_failure then
      null;
  end;

  publication := public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    3
  );
  if (publication ->> 'versionNumber')::integer <> 2 then
    raise exception 'changed draft did not create version 2';
  end if;

  begin
    update public.flow_versions
    set snapshot = '{}'::jsonb
    where id = (publication ->> 'flowVersionId')::uuid;
    raise exception 'authenticated client changed an immutable snapshot';
  exception
    when insufficient_privilege then
      null;
  end;

  perform public.archive_flow_version(
    (publication ->> 'flowVersionId')::uuid
  );
  if exists (
    select 1
    from public.published_flows
    where flow_version_id = (publication ->> 'flowVersionId')::uuid
  ) then
    raise exception 'archived current version retained its public alias';
  end if;

  publication := public.publish_flow(
    'f1000000-0000-4000-8000-000000000001',
    3
  );
  if (
    select status
    from public.flow_versions
    where id = (publication ->> 'flowVersionId')::uuid
  ) <> 'published' then
    raise exception 'republished snapshot remained archived';
  end if;
end;
$$;

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces z pętlą',
  'proces-z-petla',
  jsonb_set(
    test_support.valid_flow_document(),
    '{steps,2,nextStepKey}',
    to_jsonb('service'::text)
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

do $$
declare
  validation jsonb;
begin
  validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000002'
  );
  if (validation ->> 'valid')::boolean
    or not (validation -> 'issues') @> '[{"code":"FLOW_CYCLE"}]'::jsonb
  then
    raise exception 'cycle was not reported: %', validation;
  end if;

  begin
    perform public.publish_flow(
      'f1000000-0000-4000-8000-000000000002',
      1
    );
    raise exception 'cyclic flow was published';
  exception
    when check_violation then
      null;
  end;
end;
$$;

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000004',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces z błędną opcją reguły',
  'proces-z-bledna-opcja',
  jsonb_set(
    test_support.valid_flow_document(),
    '{rules,0,when,value}',
    to_jsonb('missing_option'::text)
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

do $$
declare
  validation jsonb;
begin
  validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000004'
  );
  if (validation ->> 'valid')::boolean
    or not (
      (validation -> 'issues')
      @> '[{"code":"CONDITION_OPTION_NOT_FOUND"}]'::jsonb
    )
  then
    raise exception 'missing condition option was not reported: %', validation;
  end if;
end;
$$;

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000005',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces v2',
  'proces-v2',
  test_support.valid_flow_document_v2(),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

do $$
declare
  publication jsonb;
  validation jsonb;
begin
  validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000005'
  );
  if not (validation ->> 'valid')::boolean
    or jsonb_array_length(validation -> 'issues') <> 0
  then
    raise exception 'valid v2 flow did not pass validation: %', validation;
  end if;

  publication := public.publish_flow(
    'f1000000-0000-4000-8000-000000000005',
    1
  );
  if (publication ->> 'versionNumber')::integer <> 1
    or (
      select snapshot ->> 'schemaVersion'
      from public.flow_versions
      where id = (publication ->> 'flowVersionId')::uuid
    ) <> '2'
  then
    raise exception 'v2 publication did not preserve its immutable snapshot';
  end if;
end;
$$;

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000006',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces v2 z błędną walidacją',
  'proces-v2-bledna-walidacja',
  jsonb_set(
    test_support.valid_flow_document_v2(),
    '{steps,2,validation,min}',
    '20000'::jsonb
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000007',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces v2 z błędną sekcją',
  'proces-v2-bledna-sekcja',
  jsonb_set(
    test_support.valid_flow_document_v2(),
    '{steps,4,sectionKey}',
    to_jsonb('brakujaca_sekcja'::text)
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

do $$
declare
  section_validation jsonb;
  step_validation jsonb;
begin
  step_validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000006'
  );
  if (step_validation ->> 'valid')::boolean
    or not (
      (step_validation -> 'issues')
      @> '[{"code":"INVALID_STEP_VALIDATION"}]'::jsonb
    )
  then
    raise exception 'invalid v2 constraint was not rejected: %', step_validation;
  end if;

  section_validation := public.validate_flow(
    'f1000000-0000-4000-8000-000000000007'
  );
  if (section_validation ->> 'valid')::boolean
    or not (
      (section_validation -> 'issues')
      @> '[{"code":"SECTION_NOT_FOUND"}]'::jsonb
    )
    or not (
      (section_validation -> 'issues')
      @> '[{"code":"EMPTY_SECTION"}]'::jsonb
    )
  then
    raise exception 'invalid v2 section was not rejected: %', section_validation;
  end if;

  begin
    perform public.publish_flow(
      'f1000000-0000-4000-8000-000000000006',
      1
    );
    raise exception 'invalid v2 constraint was published';
  exception
    when check_violation then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  begin
    insert into public.flows (
      organization_id,
      name,
      slug,
      draft,
      created_by,
      updated_by
    )
    values (
      'aaaaaaaa-0000-4000-8000-000000000001',
      'Proces Sales',
      'proces-sales',
      test_support.valid_flow_document(),
      '10000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000003'
    );
    raise exception 'sales member created a flow';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
declare
  changed_rows integer;
begin
  if (
    select count(*)
    from public.flows
    where id = 'f1000000-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'tenant B can read tenant A flow';
  end if;

  update public.flows
  set name = 'Przejęty proces'
  where id = 'f1000000-0000-4000-8000-000000000001';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'tenant B can update tenant A flow';
  end if;

  begin
    perform public.validate_flow(
      'f1000000-0000-4000-8000-000000000001'
    );
    raise exception 'tenant B validated tenant A flow';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
values (
  'f1000000-0000-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces Admina A',
  'proces-admina-a',
  test_support.valid_flow_document(),
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002'
);

do $$
begin
  perform public.publish_flow(
    'f1000000-0000-4000-8000-000000000003',
    1
  );
end;
$$;

reset role;

do $$
declare
  version_id uuid;
begin
  select id
  into version_id
  from public.flow_versions
  where flow_id = 'f1000000-0000-4000-8000-000000000001'
  order by version_number
  limit 1;

  begin
    update public.flow_versions
    set snapshot = '{}'::jsonb
    where id = version_id;
    raise exception 'database owner changed an immutable snapshot';
  exception
    when check_violation then
      null;
  end;
end;
$$;

select 'flow domain checks passed' as result;
