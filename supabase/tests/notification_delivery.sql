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
  if (select count(*) from public.notifications) <> 2 then
    raise exception 'lead submit did not enqueue exactly two notifications';
  end if;
  if (
    select count(*)
    from public.notifications
    where status = 'pending'
      and recipient_email is not null
  ) <> 2 then
    raise exception 'notification recipients or initial state are invalid';
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
begin
  if (select count(*) from claimed_notifications) <> 2 then
    raise exception 'worker did not claim two notifications';
  end if;
  select * into company_claim
  from claimed_notifications
  where kind = 'lead_company_alert';
  select * into customer_claim
  from claimed_notifications
  where kind = 'lead_customer_confirmation';
  if company_claim.recipient_email <> 'owner-a@example.test'
    or customer_claim.recipient_email <> 'klient@example.test'
    or company_claim.contact_email <> 'klient@example.test'
    or company_claim.company_name <> 'Tenant A'
  then
    raise exception 'claimed delivery data is incomplete or incorrectly scoped';
  end if;

  perform public.complete_notification_delivery(
    customer_claim.notification_id,
    customer_claim.lock_token,
    'test',
    concat('test_', customer_claim.notification_id)
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
  ) <> 2 then
    raise exception 'test delivery did not mark both notifications sent';
  end if;
  if (
    select count(*)
    from public.notification_delivery_attempts
  ) <> 3 then
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
