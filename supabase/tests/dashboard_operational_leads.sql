\set ON_ERROR_STOP on

begin;

insert into auth.users (id, email, raw_user_meta_data)
values (
  '30000000-0000-4000-8000-000000000001',
  'dashboard-owner@example.test',
  '{"display_name":"Dashboard Owner"}'
);

insert into public.organizations (id, name, slug, created_by)
values (
  'cccccccc-0000-4000-8000-000000000001',
  'Dashboard Fixture',
  'dashboard-fixture',
  '30000000-0000-4000-8000-000000000001'
);

insert into public.organization_members (
  organization_id,
  user_id,
  role,
  status,
  invited_by,
  joined_at
)
values
  (
    'cccccccc-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    'sales',
    'active',
    '30000000-0000-4000-8000-000000000001',
    now()
  ),
  (
    'cccccccc-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000004',
    'sales',
    'suspended',
    '30000000-0000-4000-8000-000000000001',
    null
  );

create temporary table dashboard_fixture_flows (
  ordinal integer primary key,
  flow_id uuid not null,
  version_id uuid not null,
  public_id uuid not null,
  title text not null
);

insert into dashboard_fixture_flows (ordinal, flow_id, version_id, public_id, title)
select
  ordinal,
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  'Proces dashboardu ' || ordinal
from generate_series(1, 6) ordinal;

insert into public.flows (
  id,
  organization_id,
  name,
  slug,
  draft,
  created_by,
  updated_by
)
select
  fixture.flow_id,
  'cccccccc-0000-4000-8000-000000000001',
  fixture.title,
  'proces-dashboardu-' || fixture.ordinal,
  source.draft,
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001'
from dashboard_fixture_flows fixture
cross join lateral (
  select flow.draft
  from public.flows flow
  where flow.id = 'f1000000-0000-4000-8000-000000000001'
) source;

insert into public.flow_versions (
  id,
  organization_id,
  flow_id,
  version_number,
  status,
  snapshot,
  snapshot_hash,
  published_by,
  published_at
)
select
  fixture.version_id,
  'cccccccc-0000-4000-8000-000000000001',
  fixture.flow_id,
  1,
  'published',
  source.snapshot,
  source.snapshot_hash,
  '30000000-0000-4000-8000-000000000001',
  '2025-12-01T00:00:00Z'::timestamptz
from dashboard_fixture_flows fixture
cross join lateral (
  select version.snapshot, version.snapshot_hash
  from public.flow_versions version
  where version.flow_id = 'f1000000-0000-4000-8000-000000000001'
  order by version.version_number
  limit 1
) source;

insert into public.published_flows (
  public_id,
  organization_id,
  flow_id,
  flow_version_id,
  published_at
)
select
  fixture.public_id,
  'cccccccc-0000-4000-8000-000000000001',
  fixture.flow_id,
  fixture.version_id,
  '2025-12-01T00:00:00Z'::timestamptz
from dashboard_fixture_flows fixture;

create temporary table dashboard_fixture_rows as
select
  series as ordinal,
  gen_random_uuid() as session_id,
  case
    when series = 1 then '2026-01-01T00:00:00Z'::timestamptz
    when series between 2 and 101 then
      '2026-01-01T12:00:00Z'::timestamptz + ((series - 2) % 30) * interval '1 day'
    when series = 102 then '2026-01-31T00:00:00Z'::timestamptz
    else '2025-12-02T00:00:00Z'::timestamptz + (series - 103) * interval '1 day'
  end as submitted_at,
  case
    when series <= 60 then 'new'::public.lead_status
    when series <= 80 then 'in_progress'::public.lead_status
    when series <= 90 then 'qualified'::public.lead_status
    when series <= 95 then 'won'::public.lead_status
    when series <= 100 then 'lost'::public.lead_status
    when series = 101 then 'spam'::public.lead_status
    else 'won'::public.lead_status
  end as status,
  case
    when series >= 103 then 90
    when series % 2 = 0 then 85
    else 70
  end::smallint as score,
  case
    when series between 1 and 20 then 500000::bigint
    when series between 21 and 40 then 1500000::bigint
    when series between 41 and 55 then 3000000::bigint
    when series between 56 and 70 then 6000000::bigint
    when series between 71 and 80 then 9000000::bigint
    when series = 102 then 4000000::bigint
    when series >= 103 then 2000000::bigint
    else null::bigint
  end as price_min_minor,
  ((series - 1) % 6) + 1 as flow_ordinal
from generate_series(1, 109) series;

insert into public.widget_sessions (
  id,
  organization_id,
  flow_id,
  flow_version_id,
  public_flow_id,
  token_hash,
  status,
  expires_at,
  created_at,
  last_seen_at
)
select
  fixture.session_id,
  'cccccccc-0000-4000-8000-000000000001',
  flow.flow_id,
  flow.version_id,
  flow.public_id,
  decode(md5('dashboard-operational-' || fixture.ordinal), 'hex'),
  'active',
  '2027-01-01T00:00:00Z'::timestamptz,
  fixture.submitted_at,
  fixture.submitted_at
from dashboard_fixture_rows fixture
join dashboard_fixture_flows flow on flow.ordinal = fixture.flow_ordinal;

insert into public.leads (
  id,
  public_id,
  organization_id,
  flow_id,
  flow_version_id,
  flow_name,
  flow_title,
  session_id,
  submit_mutation_id,
  status,
  contact_email,
  contact_name,
  score,
  score_category_key,
  score_category_label,
  price_min_minor,
  price_max_minor,
  price_currency,
  price_presentation,
  submitted_at,
  updated_at
)
select
  gen_random_uuid(),
  gen_random_uuid(),
  'cccccccc-0000-4000-8000-000000000001',
  flow.flow_id,
  flow.version_id,
  flow.title,
  flow.title,
  fixture.session_id,
  gen_random_uuid(),
  fixture.status,
  'dashboard-' || fixture.ordinal || '@example.test',
  'Klient dashboardu ' || fixture.ordinal,
  fixture.score,
  case when fixture.score >= 80 then 'high' else 'good' end,
  case when fixture.score >= 80 then 'Wysokie dopasowanie' else 'Dobre dopasowanie' end,
  fixture.price_min_minor,
  case when fixture.price_min_minor is null then null else fixture.price_min_minor + 100000 end,
  case when fixture.price_min_minor is null then null else 'PLN' end,
  case when fixture.price_min_minor is null then null else 'range' end,
  fixture.submitted_at,
  fixture.submitted_at
from dashboard_fixture_rows fixture
join dashboard_fixture_flows flow on flow.ordinal = fixture.flow_ordinal;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.get_operational_lead_overview(uuid,timestamptz,timestamptz)',
    'execute'
  ) then
    raise exception 'anonymous role can execute the operational lead overview';
  end if;
  if not has_function_privilege(
    'authenticated',
    'public.get_operational_lead_overview(uuid,timestamptz,timestamptz)',
    'execute'
  ) then
    raise exception 'authenticated role cannot execute the operational lead overview';
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', false);

do $$
declare
  overview jsonb;
begin
  overview := public.get_operational_lead_overview(
    'cccccccc-0000-4000-8000-000000000001',
    '2026-01-01T00:00:00Z'::timestamptz,
    '2026-01-31T00:00:00Z'::timestamptz
  );

  if (overview #>> '{totals,leads}')::integer <> 101
    or (overview #>> '{totals,qualityLeads}')::integer <> 50
    or (overview #>> '{totals,pricedLeads}')::integer <> 80
    or (overview #>> '{totals,estimateMinor}')::bigint <> 265000000
    or (overview #>> '{previousTotals,leads}')::integer <> 7
    or (overview #>> '{previousTotals,qualityLeads}')::integer <> 7
    or (overview #>> '{previousTotals,pricedLeads}')::integer <> 7
    or (overview #>> '{previousTotals,estimateMinor}')::bigint <> 14000000
  then
    raise exception 'operational totals are truncated or incorrect: %', overview;
  end if;

  if jsonb_array_length(overview -> 'daily') <> 30
    or (
      select sum((point ->> 'leads')::integer)
      from jsonb_array_elements(overview -> 'daily') point
    ) <> 101
    or (
      select sum((point ->> 'estimateMinor')::bigint)
      from jsonb_array_elements(overview -> 'daily') point
    ) <> 265000000
  then
    raise exception 'daily operational series is incomplete: %', overview -> 'daily';
  end if;

  if not (overview -> 'statuses' @> '[{"key":"new","count":60}]'::jsonb)
    or not (overview -> 'statuses' @> '[{"key":"in_progress","count":20}]'::jsonb)
    or not (overview -> 'statuses' @> '[{"key":"spam","count":1}]'::jsonb)
  then
    raise exception 'status breakdown is incorrect: %', overview -> 'statuses';
  end if;

  if jsonb_array_length(overview -> 'flows') <> 5
    or exists (
      select 1
      from jsonb_array_elements(overview -> 'flows') flow
      where (flow ->> 'count')::integer <> 17
    )
  then
    raise exception 'top-five flow breakdown is incorrect: %', overview -> 'flows';
  end if;

  if not (overview -> 'estimateBuckets' @> '[{"key":"below-10","count":20}]'::jsonb)
    or not (overview -> 'estimateBuckets' @> '[{"key":"10-20","count":20}]'::jsonb)
    or not (overview -> 'estimateBuckets' @> '[{"key":"20-40","count":15}]'::jsonb)
    or not (overview -> 'estimateBuckets' @> '[{"key":"40-80","count":15}]'::jsonb)
    or not (overview -> 'estimateBuckets' @> '[{"key":"above-80","count":10}]'::jsonb)
  then
    raise exception 'estimate buckets are incorrect: %', overview -> 'estimateBuckets';
  end if;

  begin
    perform public.get_operational_lead_overview(
      'cccccccc-0000-4000-8000-000000000001',
      '2025-01-01T00:00:00Z'::timestamptz,
      '2026-01-31T00:00:00Z'::timestamptz
    );
    raise exception 'an oversized operational period was accepted';
  exception
    when invalid_parameter_value then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
declare
  overview jsonb;
begin
  overview := public.get_operational_lead_overview(
    'cccccccc-0000-4000-8000-000000000001',
    '2026-01-01T00:00:00Z'::timestamptz,
    '2026-01-31T00:00:00Z'::timestamptz
  );
  if (overview #>> '{totals,leads}')::integer <> 101 then
    raise exception 'active Sales did not receive the safe tenant aggregate';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  begin
    perform public.get_operational_lead_overview(
      'cccccccc-0000-4000-8000-000000000001',
      '2026-01-01T00:00:00Z'::timestamptz,
      '2026-01-31T00:00:00Z'::timestamptz
    );
    raise exception 'a foreign tenant read the operational lead overview';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);

do $$
begin
  begin
    perform public.get_operational_lead_overview(
      'cccccccc-0000-4000-8000-000000000001',
      '2026-01-01T00:00:00Z'::timestamptz,
      '2026-01-31T00:00:00Z'::timestamptz
    );
    raise exception 'a suspended member read the operational lead overview';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
rollback;

select 'dashboard operational lead overview checks passed' as result;
