-- Dashboard P1: exact tenant-scoped operational lead aggregates.
--
-- Rollback: deploy the previous dashboard reader first, then revoke EXECUTE.
-- Keep the function in environments that have accepted traffic and replace it
-- only with a forward-compatible corrective migration.

create function public.get_operational_lead_overview(
  target_organization_id uuid,
  period_start timestamptz,
  period_end timestamptz
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  overview jsonb;
  previous_period_start timestamptz;
begin
  if not app_private.is_active_member(target_organization_id) then
    raise exception 'resource not found' using errcode = 'no_data_found';
  end if;

  if period_start is null
    or period_end is null
    or period_end <= period_start
    or period_end - period_start > interval '90 days'
    or period_end > now() + interval '5 minutes'
  then
    raise exception 'invalid operational lead period'
      using errcode = 'invalid_parameter_value';
  end if;

  previous_period_start := period_start - (period_end - period_start);

  with scoped_leads as materialized (
    select
      lead.flow_id,
      lead.flow_title,
      lead.id,
      lead.price_currency,
      lead.price_min_minor,
      lead.score,
      lead.status,
      lead.submitted_at
    from public.leads lead
    where lead.organization_id = target_organization_id
      and lead.submitted_at >= previous_period_start
      and lead.submitted_at < period_end
  ),
  current_leads as materialized (
    select lead.*
    from scoped_leads lead
    where lead.submitted_at >= period_start
  ),
  previous_leads as materialized (
    select lead.*
    from scoped_leads lead
    where lead.submitted_at < period_start
  ),
  current_totals as (
    select
      count(*)::bigint as leads,
      count(*) filter (where lead.score >= 80)::bigint as quality_leads,
      count(*) filter (
        where lead.price_currency = 'PLN' and lead.price_min_minor is not null
      )::bigint as priced_leads,
      coalesce(sum(lead.price_min_minor) filter (
        where lead.price_currency = 'PLN' and lead.price_min_minor is not null
      ), 0)::bigint as estimate_minor
    from current_leads lead
  ),
  previous_totals as (
    select
      count(*)::bigint as leads,
      count(*) filter (where lead.score >= 80)::bigint as quality_leads,
      count(*) filter (
        where lead.price_currency = 'PLN' and lead.price_min_minor is not null
      )::bigint as priced_leads,
      coalesce(sum(lead.price_min_minor) filter (
        where lead.price_currency = 'PLN' and lead.price_min_minor is not null
      ), 0)::bigint as estimate_minor
    from previous_leads lead
  ),
  calendar_days as (
    select generated_day::date as day
    from generate_series(
      ((period_start at time zone 'UTC')::date)::timestamp,
      (((period_end - interval '1 microsecond') at time zone 'UTC')::date)::timestamp,
      interval '1 day'
    ) generated_day
  ),
  daily_rows as (
    select
      calendar.day,
      count(lead.id)::bigint as leads,
      count(lead.id) filter (where lead.score >= 80)::bigint as quality_leads,
      coalesce(sum(lead.price_min_minor) filter (
        where lead.price_currency = 'PLN' and lead.price_min_minor is not null
      ), 0)::bigint as estimate_minor
    from calendar_days calendar
    left join current_leads lead
      on (lead.submitted_at at time zone 'UTC')::date = calendar.day
    group by calendar.day
  ),
  status_rows as (
    select
      lead.status::text as key,
      count(*)::bigint as count,
      case lead.status
        when 'new' then 1
        when 'in_progress' then 2
        when 'qualified' then 3
        when 'won' then 4
        when 'lost' then 5
        when 'spam' then 6
      end as sort_order
    from current_leads lead
    group by lead.status
  ),
  flow_counts as (
    select lead.flow_id, count(*)::bigint as count
    from current_leads lead
    group by lead.flow_id
  ),
  latest_flow_titles as (
    select distinct on (lead.flow_id)
      lead.flow_id,
      lead.flow_title
    from current_leads lead
    order by lead.flow_id, lead.submitted_at desc, lead.id desc
  ),
  flow_rows as (
    select
      count_row.flow_id as key,
      title_row.flow_title as label,
      count_row.count
    from flow_counts count_row
    join latest_flow_titles title_row on title_row.flow_id = count_row.flow_id
    order by count_row.count desc, title_row.flow_title, count_row.flow_id
    limit 5
  ),
  estimate_bucket_definitions as (
    select *
    from (values
      ('below-10'::text, 1, 0::bigint, 1000000::bigint),
      ('10-20'::text, 2, 1000000::bigint, 2000000::bigint),
      ('20-40'::text, 3, 2000000::bigint, 4000000::bigint),
      ('40-80'::text, 4, 4000000::bigint, 8000000::bigint),
      ('above-80'::text, 5, 8000000::bigint, null::bigint)
    ) definition(key, sort_order, minimum_minor, maximum_minor)
  ),
  estimate_rows as (
    select
      definition.key,
      definition.sort_order,
      count(lead.id)::bigint as count
    from estimate_bucket_definitions definition
    cross join current_totals totals
    left join current_leads lead
      on lead.price_currency = 'PLN'
      and lead.price_min_minor is not null
      and lead.price_min_minor >= definition.minimum_minor
      and (
        definition.maximum_minor is null
        or lead.price_min_minor < definition.maximum_minor
      )
    where totals.priced_leads > 0
    group by definition.key, definition.sort_order
  )
  select jsonb_build_object(
    'period', jsonb_build_object('from', period_start, 'to', period_end),
    'previousPeriod', jsonb_build_object(
      'from', previous_period_start,
      'to', period_start
    ),
    'totals', (
      select jsonb_build_object(
        'leads', totals.leads,
        'qualityLeads', totals.quality_leads,
        'pricedLeads', totals.priced_leads,
        'estimateMinor', totals.estimate_minor
      )
      from current_totals totals
    ),
    'previousTotals', (
      select jsonb_build_object(
        'leads', totals.leads,
        'qualityLeads', totals.quality_leads,
        'pricedLeads', totals.priced_leads,
        'estimateMinor', totals.estimate_minor
      )
      from previous_totals totals
    ),
    'daily', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'date', to_char(row.day, 'YYYY-MM-DD'),
          'leads', row.leads,
          'qualityLeads', row.quality_leads,
          'estimateMinor', row.estimate_minor
        )
        order by row.day
      )
      from daily_rows row
    ), '[]'::jsonb),
    'statuses', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', row.key,
          'count', row.count,
          'shareBasisPoints', round(row.count * 10000.0 / totals.leads)::integer
        )
        order by row.sort_order
      )
      from status_rows row
      cross join current_totals totals
      where totals.leads > 0
    ), '[]'::jsonb),
    'flows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', row.key,
          'label', row.label,
          'count', row.count,
          'shareBasisPoints', round(row.count * 10000.0 / totals.leads)::integer
        )
        order by row.count desc, row.label, row.key
      )
      from flow_rows row
      cross join current_totals totals
      where totals.leads > 0
    ), '[]'::jsonb),
    'estimateBuckets', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', row.key,
          'count', row.count,
          'shareBasisPoints', round(row.count * 10000.0 / totals.priced_leads)::integer
        )
        order by row.sort_order
      )
      from estimate_rows row
      cross join current_totals totals
    ), '[]'::jsonb)
  )
  into overview;

  return overview;
end;
$$;

revoke all on function public.get_operational_lead_overview(uuid, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_operational_lead_overview(uuid, timestamptz, timestamptz)
  to authenticated;
