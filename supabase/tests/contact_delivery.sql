\set ON_ERROR_STOP on

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

select public.set_organization_lead_alert_email(
  'aaaaaaaa-0000-4000-8000-000000000001',
  '  ALERTY@EXAMPLE.TEST '
);

do $$
begin
  if (
    select lead_alert_email
    from public.organization_notification_settings
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) <> 'alerty@example.test' then
    raise exception 'owner did not configure a normalized lead alert recipient';
  end if;
  begin
    update public.organization_notification_settings
    set lead_alert_email = 'bypass@example.test'
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001';
    raise exception 'owner bypassed controlled notification settings write';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);
select public.set_organization_lead_alert_email(
  'aaaaaaaa-0000-4000-8000-000000000001',
  'lead-delivery@example.test'
);

do $$
begin
  if (
    select lead_alert_email
    from public.organization_notification_settings
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) <> 'lead-delivery@example.test' then
    raise exception 'admin could not update the lead alert recipient';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  if (select count(*) from public.organization_notification_settings) <> 0 then
    raise exception 'sales can read notification settings';
  end if;
  begin
    perform public.set_organization_lead_alert_email(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'sales@example.test'
    );
    raise exception 'sales changed the lead alert recipient';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (
    select count(*)
    from public.organization_notification_settings
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'tenant B can read tenant A notification settings';
  end if;
  begin
    perform public.set_organization_lead_alert_email(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'tenant-b@example.test'
    );
    raise exception 'tenant B changed tenant A lead alert recipient';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);

do $$
begin
  if (select count(*) from public.organization_notification_settings) <> 0 then
    raise exception 'suspended member can read notification settings';
  end if;
  begin
    perform public.set_organization_lead_alert_email(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'suspended@example.test'
    );
    raise exception 'suspended member changed the lead alert recipient';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
select 'contact delivery settings checks passed' as result;
