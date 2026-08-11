\set ON_ERROR_STOP on

set role anon;

do $$
begin
  begin
    perform count(*) from public.notifications;
    raise exception 'anon can read notifications directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  if (select count(*) from public.notifications) <> 3 then
    raise exception 'lead submits did not enqueue exactly three notifications';
  end if;
  if (
    select count(*)
    from public.notifications
    where status = 'pending'
      and recipient_email is not null
  ) <> 3 then
    raise exception 'notification recipients or initial state are invalid';
  end if;
  if exists (
    select 1
    from public.notifications
    where template_version not in ('lead-customer-v2', 'lead-company-v2')
      or (
        kind = 'lead_customer_confirmation'
        and template_version <> 'lead-customer-v2'
      )
      or (
        kind = 'lead_company_alert'
        and template_version <> 'lead-company-v2'
      )
  ) then
    raise exception 'new lead notifications did not use matching v2 templates';
  end if;
  begin
    perform * from public.claim_notification_batch(gen_random_uuid(), 10, 'test');
    raise exception 'authenticated member claimed the outbox';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.notifications) <> 0 then
    raise exception 'tenant B can read tenant A notifications';
  end if;
end;
$$;

reset role;

do $$
begin
  update public.notifications
  set template_version = case kind
    when 'lead_customer_confirmation' then 'lead-customer-v1'
    when 'lead_company_alert' then 'lead-company-v1'
  end;

  if exists (
    select 1
    from public.notifications
    where template_version not in ('lead-customer-v1', 'lead-company-v1')
  ) then
    raise exception 'legacy v1 notification templates are no longer legal';
  end if;

  update public.notifications
  set template_version = case kind
    when 'lead_customer_confirmation' then 'lead-customer-v2'
    when 'lead_company_alert' then 'lead-company-v2'
  end;

  begin
    update public.notifications
    set template_version = 'lead-company-v2'
    where kind = 'lead_customer_confirmation';
    raise exception 'notification accepted a template for the wrong kind';
  exception
    when check_violation then
      null;
  end;

  update public.notifications
  set template_version = 'lead-customer-v1'
  where kind = 'lead_customer_confirmation';
end;
$$;

set role service_role;

create temporary table claimed_notifications as
select *
from public.claim_notification_batch(
  '92000000-0000-4000-8000-000000000001',
  10,
  'test'
);

do $$
declare
  company_claim record;
  customer_claim record;
  phone_claim record;
begin
  if (select count(*) from claimed_notifications) <> 3 then
    raise exception 'worker did not claim three notifications';
  end if;
  select * into company_claim
  from claimed_notifications
  where kind = 'lead_company_alert'
    and contact_email = 'klient@example.test';
  select * into customer_claim
  from claimed_notifications
  where kind = 'lead_customer_confirmation';
  select * into phone_claim
  from claimed_notifications
  where kind = 'lead_company_alert'
    and contact_email is null;
  if company_claim.recipient_email <> 'lead-delivery@example.test'
    or customer_claim.recipient_email <> 'klient@example.test'
    or company_claim.contact_email <> 'klient@example.test'
    or company_claim.template_version <> 'lead-company-v2'
    or customer_claim.template_version <> 'lead-customer-v1'
    or phone_claim.template_version <> 'lead-company-v2'
    or phone_claim.recipient_email <> 'lead-delivery@example.test'
    or phone_claim.contact_phone <> '+48 500 600 700'
    or jsonb_array_length(phone_claim.answers) <> 3
    or company_claim.company_name <> 'Tenant A'
  then
    raise exception 'claimed delivery data is incomplete or incorrectly scoped';
  end if;
  if not exists (
    select 1
    from jsonb_array_elements(company_claim.answers) answer
    where answer ->> 'question' = 'Jakiej usługi potrzebujesz?'
      and answer -> 'answer' = '"Wariant premium"'::jsonb
  ) or exists (
    select 1
    from jsonb_array_elements(company_claim.answers) answer
    where answer ->> 'question' = 'Jakiej usługi potrzebujesz?'
      and answer -> 'answer' = '"premium"'::jsonb
  ) then
    raise exception 'notification claim exposed a raw option key instead of its label';
  end if;
  if not exists (
    select 1
    from jsonb_array_elements(customer_claim.answers) answer
    where answer ->> 'question' = 'Jakiej usługi potrzebujesz?'
      and answer -> 'answer' = '"premium"'::jsonb
  ) or exists (
    select 1
    from jsonb_array_elements(customer_claim.answers) answer
    where answer ->> 'question' = 'Jakiej usługi potrzebujesz?'
      and answer -> 'answer' = '"Wariant premium"'::jsonb
  ) then
    raise exception 'legacy v1 notification retry did not retain its raw answer';
  end if;

  perform public.complete_notification_delivery(
    customer_claim.notification_id,
    customer_claim.lock_token,
    'test',
    concat('test_', customer_claim.notification_id)
  );
  perform public.complete_notification_delivery(
    phone_claim.notification_id,
    phone_claim.lock_token,
    'test',
    concat('test_', phone_claim.notification_id)
  );
  perform public.fail_notification_delivery(
    company_claim.notification_id,
    company_claim.lock_token,
    'test',
    'network',
    true
  );
end;
$$;

reset role;
update public.notifications
set available_at = now() - interval '1 second'
where status = 'retry';

set role service_role;
create temporary table retried_notification as
select *
from public.claim_notification_batch(
  '92000000-0000-4000-8000-000000000002',
  10,
  'test'
);

do $$
declare
  retried record;
begin
  select * into retried from retried_notification;
  if not found or retried.attempt_number <> 2 then
    raise exception 'retry did not create the second attempt';
  end if;
  perform public.complete_notification_delivery(
    retried.notification_id,
    retried.lock_token,
    'test',
    concat('test_', retried.notification_id)
  );
end;
$$;

reset role;

do $$
begin
  if (
    select count(*)
    from public.notifications
    where status = 'sent'
      and provider = 'test'
      and sent_at is not null
  ) <> 3 then
    raise exception 'test delivery did not mark all notifications sent';
  end if;
  if (
    select count(*)
    from public.notification_delivery_attempts
  ) <> 4 then
    raise exception 'delivery attempt history is incomplete';
  end if;
  if (
    select count(*)
    from public.notification_delivery_attempts
    where outcome = 'retry' and error_code = 'network'
  ) <> 1 then
    raise exception 'retry outcome was not recorded safely';
  end if;
end;
$$;

select 'notification delivery checks passed' as result;
