reset role;

create temporary table governance_target as
select id as lead_id, organization_id, session_id
from public.leads
where contact_email = 'klient@example.test';
grant select on governance_target to authenticated, service_role;

create temporary table governance_manual_target as
with source_session as (
  select session.*
  from public.widget_sessions session
  where session.id = (select session_id from governance_target)
),
new_session as (
  insert into public.widget_sessions (
    organization_id,
    flow_id,
    flow_version_id,
    public_flow_id,
    token_hash,
    status,
    revision,
    step_history,
    current_step_key,
    expires_at,
    last_seen_at
  )
  select
    organization_id,
    flow_id,
    flow_version_id,
    public_flow_id,
    extensions.digest('manual-erasure-test', 'sha256'),
    status,
    revision,
    step_history,
    current_step_key,
    expires_at,
    last_seen_at
  from source_session
  returning id, organization_id
),
source_lead as (
  select lead.*
  from public.leads lead
  where lead.id = (select lead_id from governance_target)
),
new_lead as (
  insert into public.leads (
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
    contact_phone,
    score,
    score_category_key,
    score_category_label,
    price_min_minor,
    price_max_minor,
    price_currency,
    price_presentation,
    estimation_explanation
  )
  select
    source.organization_id,
    source.flow_id,
    source.flow_version_id,
    source.flow_name,
    source.flow_title,
    session.id,
    gen_random_uuid(),
    source.status,
    'manual-erasure@example.test',
    source.contact_name,
    source.contact_phone,
    source.score,
    source.score_category_key,
    source.score_category_label,
    source.price_min_minor,
    source.price_max_minor,
    source.price_currency,
    source.price_presentation,
    source.estimation_explanation
  from source_lead source
  cross join new_session session
  returning id, organization_id, session_id
)
select id as lead_id, organization_id, session_id
from new_lead;
grant select on governance_manual_target to authenticated;

do $$
begin
  if (select count(*) from governance_target) <> 1 then
    raise exception 'governance test lead is missing';
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  exported jsonb;
  manual_target uuid := (select lead_id from governance_manual_target);
  target uuid := (select lead_id from governance_target);
begin
  exported := public.export_lead_personal_data(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target
  );
  if exported ->> 'exportVersion' is distinct from '2'
    or exported #>> '{lead,contact,email}' is distinct from 'klient@example.test'
    or not (exported #> '{lead,contact}' ? 'preferredChannel')
    or not (exported #> '{lead,contact}' ? 'preferredWindow')
    or jsonb_array_length(exported -> 'answers') = 0
    or jsonb_array_length(exported -> 'consents') <> 2
  then
    raise exception 'personal-data export is incomplete';
  end if;

  perform public.set_organization_retention(
    'aaaaaaaa-0000-4000-8000-000000000001',
    null
  );
  if (
    select lead_retention_days
    from public.organization_data_policies
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) is not null then
    raise exception 'retention was not disabled';
  end if;

  begin
    perform public.set_organization_retention(
      'aaaaaaaa-0000-4000-8000-000000000001',
      29
    );
    raise exception 'retention below the safe bound was accepted';
  exception
    when invalid_parameter_value then
      null;
  end;

  perform public.set_lead_legal_hold(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    'Obowiązek zachowania na potrzeby postępowania.'
  );
  begin
    perform public.get_lead_erasure_storage_paths(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target
    );
    raise exception 'legal hold did not block erasure';
  exception
    when no_data_found then
      null;
  end;
  perform public.release_lead_legal_hold(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target
  );

  perform public.get_lead_erasure_storage_paths(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target
  );
  begin
    perform public.set_lead_legal_hold(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target,
      'Spóźniona próba blokady po rozpoczęciu usunięcia.'
    );
    raise exception 'legal hold raced with prepared erasure';
  exception
    when no_data_found then
      null;
  end;

  perform public.get_lead_erasure_storage_paths(
    'aaaaaaaa-0000-4000-8000-000000000001',
    manual_target
  );
  perform public.erase_lead_personal_data(
    'aaaaaaaa-0000-4000-8000-000000000001',
    manual_target
  );
  if exists (select 1 from public.leads where id = manual_target) then
    raise exception 'manual personal-data erasure left the lead behind';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);

do $$
declare
  target uuid := (select lead_id from governance_target);
begin
  begin
    perform public.export_lead_personal_data(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target
    );
    raise exception 'admin exported personal data';
  exception
    when no_data_found then
      null;
  end;
  begin
    perform public.set_organization_retention(
      'aaaaaaaa-0000-4000-8000-000000000001',
      365
    );
    raise exception 'admin changed retention';
  exception
    when no_data_found then
      null;
  end;
  begin
    perform public.get_retention_candidates(10);
    raise exception 'authenticated user called service retention selector';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
declare
  target uuid := (select lead_id from governance_target);
begin
  begin
    perform public.export_lead_personal_data(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target
    );
    raise exception 'tenant B exported tenant A personal data';
  exception
    when no_data_found then
      null;
  end;
  if (select count(*) from public.organization_data_policies) <> 0
    or (select count(*) from public.lead_legal_holds) <> 0
    or (select count(*) from public.data_erasure_events) <> 0
  then
    raise exception 'tenant B can read tenant A governance records';
  end if;
end;
$$;

reset role;
update public.leads
set
  submitted_at = now() - interval '31 days',
  erasure_pending_at = null,
  erasure_pending_by = null
where id = (select lead_id from governance_target);

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);
select public.set_organization_retention(
  'aaaaaaaa-0000-4000-8000-000000000001',
  30
);
reset role;

do $$
declare
  stored_path text;
begin
  select object_path into stored_path
  from public.lead_files
  where lead_id = (select lead_id from governance_target)
  limit 1;
  delete from storage.objects
  where bucket_id = 'tenant-private' and name = stored_path;
end;
$$;

set role service_role;
do $$
declare
  candidates integer;
  purged integer;
  target uuid := (select lead_id from governance_target);
begin
  select count(*) into candidates
  from public.get_retention_candidates(10)
  where lead_id = target;
  if candidates <> 1 then
    raise exception 'approved expired lead was not selected for retention';
  end if;
  purged := public.purge_retention_candidates(array[target]);
  if purged <> 1 then
    raise exception 'retention did not purge the selected lead';
  end if;
end;
$$;
reset role;

do $$
begin
  if exists (
    select 1 from public.leads
    where id = (select lead_id from governance_target)
  ) or exists (
    select 1 from public.widget_sessions
    where id = (select session_id from governance_target)
  ) or exists (
    select 1 from public.lead_operations
    where lead_id = (select lead_id from governance_target)
  ) or exists (
    select 1 from public.lead_tasks
    where lead_id = (select lead_id from governance_target)
  ) or exists (
    select 1 from public.lead_activity_events
    where lead_id = (select lead_id from governance_target)
  ) then
    raise exception 'retention left lead, operation, task, activity or session data behind';
  end if;
  if exists (
    select 1 from public.widget_sessions
    where id = (select session_id from governance_manual_target)
  ) then
    raise exception 'manual erasure left its session behind';
  end if;
  if (
    select count(*) from public.data_erasure_events
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
      and reason = 'retention'
  ) <> 1 then
    raise exception 'non-identifying erasure evidence is missing';
  end if;
end;
$$;

select 'data governance checks passed' as result;
