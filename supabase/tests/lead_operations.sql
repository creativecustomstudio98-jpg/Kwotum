\set ON_ERROR_STOP on

create temporary table lead_operations_target as
select id as lead_id, organization_id
from public.leads
where contact_email = 'klient@example.test';
grant select on lead_operations_target to authenticated;

do $$
begin
  if (select count(*) from lead_operations_target) <> 1 then
    raise exception 'lead operations fixture is missing';
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  contact_result jsonb;
  contact_retry jsonb;
  target uuid := (select lead_id from lead_operations_target);
  target_due_at timestamptz := date_trunc('minute', now()) + interval '2 days';
begin
  if not exists (
    select 1
    from public.lead_operations
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
      and lead_id = target
      and priority = 'medium'
  ) then
    raise exception 'lead operation state was not created with the lead';
  end if;

  perform public.set_lead_assignee(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    '10000000-0000-4000-8000-000000000002'
  );
  perform public.set_lead_priority(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    'high'
  );

  contact_result := public.create_lead_task(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    '92000000-0000-4000-8000-000000000001',
    'contact',
    'Kontakt wstępny',
    'Potwierdzenie zakresu i terminu realizacji.',
    target_due_at,
    '10000000-0000-4000-8000-000000000002'
  );
  contact_retry := public.create_lead_task(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    '92000000-0000-4000-8000-000000000001',
    'contact',
    'Kontakt wstępny',
    'Potwierdzenie zakresu i terminu realizacji.',
    target_due_at,
    '10000000-0000-4000-8000-000000000002'
  );
  if contact_result ->> 'id' is null
    or contact_result ->> 'id' is distinct from contact_retry ->> 'id'
    or (
      select count(*)
      from public.lead_tasks
      where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
        and request_id = '92000000-0000-4000-8000-000000000001'
    ) <> 1
  then
    raise exception 'lead task idempotency failed: %, %', contact_result, contact_retry;
  end if;

  perform public.create_lead_task(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    '92000000-0000-4000-8000-000000000002',
    'task',
    'Przygotuj zakres rozmowy',
    null,
    now() + interval '1 day',
    '10000000-0000-4000-8000-000000000002'
  );

  if (
    select count(*)
    from public.lead_activity_events
    where lead_id = target
      and kind = 'task_created'
  ) <> 2 then
    raise exception 'lead task activity was duplicated or omitted';
  end if;

  begin
    insert into public.lead_tasks (
      organization_id,
      lead_id,
      request_id,
      kind,
      title,
      due_at,
      created_by
    ) values (
      'aaaaaaaa-0000-4000-8000-000000000001',
      target,
      gen_random_uuid(),
      'task',
      'Forged task',
      now() + interval '1 day',
      auth.uid()
    );
    raise exception 'authenticated client can insert lead tasks directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
declare
  own_task jsonb;
  target uuid := (select lead_id from lead_operations_target);
  team_task uuid;
begin
  perform public.set_lead_priority(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    'low'
  );

  begin
    perform public.set_lead_assignee(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target,
      auth.uid()
    );
    raise exception 'sales user assigned a lead';
  exception
    when no_data_found then
      null;
  end;

  own_task := public.create_lead_task(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    '92000000-0000-4000-8000-000000000003',
    'task',
    'Uzupełnij kwalifikację',
    null,
    now() + interval '3 days',
    null
  );
  perform public.close_lead_task(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (own_task ->> 'id')::uuid,
    'completed'
  );
  if not exists (
    select 1
    from public.lead_tasks
    where id = (own_task ->> 'id')::uuid
      and assigned_to = auth.uid()
      and status = 'completed'
      and closed_by = auth.uid()
  ) then
    raise exception 'sales user could not complete their own task';
  end if;

  select id into team_task
  from public.lead_tasks
  where request_id = '92000000-0000-4000-8000-000000000002';
  begin
    perform public.close_lead_task(
      'aaaaaaaa-0000-4000-8000-000000000001',
      team_task,
      'cancelled'
    );
    raise exception 'sales user closed another team member task';
  exception
    when no_data_found then
      null;
  end;

  begin
    update public.lead_operations
    set priority = 'high'
    where lead_id = target;
    raise exception 'authenticated client can update lead operations directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  target uuid := (select lead_id from lead_operations_target);
begin
  perform public.set_lead_assignee(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    null
  );
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
declare
  target uuid := (select lead_id from lead_operations_target);
begin
  perform public.change_lead_status(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target,
    'in_progress'
  );
  if (
    select assignee_user_id
    from public.lead_operations
    where lead_id = target
  ) is distinct from auth.uid() then
    raise exception 'starting lead handling did not self-assign the lead';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  exported jsonb;
  target uuid := (select lead_id from lead_operations_target);
begin
  exported := public.export_lead_personal_data(
    'aaaaaaaa-0000-4000-8000-000000000001',
    target
  );
  if exported #>> '{operations,priority}' is distinct from 'low'
    or jsonb_array_length(exported -> 'tasks') <> 3
  then
    raise exception 'lead operations are missing from personal-data export: %', exported;
  end if;

  if exists (
    select 1
    from public.audit_logs
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
      and action like 'lead.%'
      and (
        metadata::text ilike '%kontakt wstępny%'
        or metadata::text ilike '%potwierdzenie zakresu%'
        or metadata::text ilike '%klient@example.test%'
      )
  ) then
    raise exception 'lead operation audit metadata contains task content or customer PII';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
declare
  target uuid := (select lead_id from lead_operations_target);
begin
  if (select count(*) from public.lead_operations) <> 0
    or (select count(*) from public.lead_tasks) <> 0
    or (select count(*) from public.lead_activity_events) <> 0
  then
    raise exception 'tenant B can read tenant A lead operations';
  end if;
  begin
    perform public.set_lead_priority(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target,
      'high'
    );
    raise exception 'tenant B changed tenant A lead operations';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);

do $$
declare
  target uuid := (select lead_id from lead_operations_target);
begin
  if (select count(*) from public.lead_operations) <> 0 then
    raise exception 'suspended user can read lead operations';
  end if;
  begin
    perform public.create_lead_task(
      'aaaaaaaa-0000-4000-8000-000000000001',
      target,
      gen_random_uuid(),
      'task',
      'Suspended task',
      null,
      now() + interval '1 day',
      null
    );
    raise exception 'suspended user created a lead task';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
