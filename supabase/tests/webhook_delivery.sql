\set ON_ERROR_STOP on

set role anon;

do $$
begin
  begin
    perform count(*) from public.webhook_endpoints;
    raise exception 'anon can read webhook endpoints';
  exception
    when insufficient_privilege then
      null;
  end;
  begin
    perform * from public.claim_webhook_delivery_batch(gen_random_uuid(), 10);
    raise exception 'anon can claim webhook deliveries';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

select public.create_webhook_endpoint(
  'aaaaaaaa-0000-4000-8000-000000000001',
  'https://hooks.partner.pl/kwotum/leads',
  '91000000-0000-4000-8000-000000000001'
);

do $$
declare
  first_result jsonb;
  retry_result jsonb;
begin
  first_result := public.create_webhook_endpoint(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'https://hooks.partner.pl/kwotum/leads',
    '91000000-0000-4000-8000-000000000001'
  );
  retry_result := public.create_webhook_endpoint(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'https://hooks.partner.pl/kwotum/leads',
    '91000000-0000-4000-8000-000000000001'
  );
  if first_result ->> 'id' <> retry_result ->> 'id'
    or (retry_result ->> 'secretVersion')::integer <> 1
  then
    raise exception 'webhook create is not idempotent';
  end if;
  begin
    perform public.create_webhook_endpoint(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'https://other.partner.pl/kwotum',
      '91000000-0000-4000-8000-000000000001'
    );
    raise exception 'idempotency key was reused with another URL';
  exception
    when unique_violation then
      null;
  end;
  begin
    perform public.create_webhook_endpoint(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'http://hooks.partner.pl/unsafe',
      '91000000-0000-4000-8000-000000000002'
    );
    raise exception 'insecure webhook URL was accepted';
  exception
    when invalid_parameter_value then
      null;
  end;
  begin
    insert into public.webhook_endpoints (
      organization_id,
      url,
      request_id,
      created_by
    ) values (
      'aaaaaaaa-0000-4000-8000-000000000001',
      'https://direct.partner.pl',
      gen_random_uuid(),
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'authenticated owner can insert webhook directly';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select public.enqueue_webhook_test(
  'aaaaaaaa-0000-4000-8000-000000000001',
  (
    select id from public.webhook_endpoints
    where request_id = '91000000-0000-4000-8000-000000000001'
  ),
  '92000000-0000-4000-8000-000000000001'
);

do $$
declare
  first_result jsonb;
  retry_result jsonb;
begin
  first_result := public.enqueue_webhook_test(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    ),
    '92000000-0000-4000-8000-000000000001'
  );
  retry_result := public.enqueue_webhook_test(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    ),
    '92000000-0000-4000-8000-000000000001'
  );
  if first_result ->> 'deliveryId' <> retry_result ->> 'deliveryId' then
    raise exception 'webhook test enqueue is not idempotent';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);

do $$
begin
  if (select count(*) from public.webhook_endpoints) <> 1 then
    raise exception 'admin cannot read tenant webhook endpoint';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  if (select count(*) from public.webhook_endpoints) <> 0
    or (select count(*) from public.webhook_deliveries) <> 0
  then
    raise exception 'sales can read webhook configuration or history';
  end if;
  begin
    perform public.create_webhook_endpoint(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'https://sales.partner.pl/kwotum',
      gen_random_uuid()
    );
    raise exception 'sales created a webhook endpoint';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.webhook_endpoints) <> 0
    or (select count(*) from public.webhook_deliveries) <> 0
  then
    raise exception 'tenant B can read tenant A webhook data';
  end if;
end;
$$;

reset role;

insert into public.widget_sessions (
  id,
  organization_id,
  flow_id,
  flow_version_id,
  public_flow_id,
  token_hash,
  status,
  revision,
  step_history,
  current_step_key,
  expires_at
)
select
  '93000000-0000-4000-8000-000000000001',
  session.organization_id,
  session.flow_id,
  session.flow_version_id,
  session.public_flow_id,
  digest('stage12zf-production-session', 'sha256'),
  session.status,
  session.revision,
  session.step_history,
  session.current_step_key,
  now() + interval '1 day'
from public.widget_sessions session
join public.leads lead on lead.session_id = session.id
where session.organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
order by session.created_at
limit 1;

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
  contact_phone,
  score,
  score_category_key,
  score_category_label,
  price_min_minor,
  price_max_minor,
  price_currency,
  price_presentation,
  estimation_explanation,
  submitted_at
)
select
  '94000000-0000-4000-8000-000000000001',
  '94000000-0000-4000-8000-000000000002',
  lead.organization_id,
  lead.flow_id,
  lead.flow_version_id,
  lead.flow_name,
  lead.flow_title,
  '93000000-0000-4000-8000-000000000001',
  '94000000-0000-4000-8000-000000000003',
  lead.status,
  'webhook-client@example.test',
  'Klient Webhook',
  '+48 500 600 701',
  lead.score,
  lead.score_category_key,
  lead.score_category_label,
  lead.price_min_minor,
  lead.price_max_minor,
  lead.price_currency,
  lead.price_presentation,
  lead.estimation_explanation,
  now()
from public.leads lead
where lead.organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
order by lead.submitted_at
limit 1;

do $$
begin
  if (
    select count(*)
    from public.webhook_deliveries delivery
    where delivery.endpoint_id = (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    )
  ) <> 2 then
    raise exception 'lead insert did not atomically enqueue one production webhook';
  end if;
  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'webhook_endpoints'
      and column_name in ('secret', 'secret_hash', 'signing_secret')
  ) <> 0 then
    raise exception 'webhook plaintext or hash secret is stored in the database';
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
begin
  begin
    perform * from public.claim_webhook_delivery_batch(gen_random_uuid(), 10);
    raise exception 'authenticated owner claimed webhook outbox';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role service_role;

create temporary table claimed_webhooks as
select *
from public.claim_webhook_delivery_batch(
  '95000000-0000-4000-8000-000000000001',
  10
);

do $$
declare
  production_claim record;
  test_claim record;
begin
  if (select count(*) from claimed_webhooks) <> 2 then
    raise exception 'worker did not claim test and production deliveries';
  end if;
  select * into production_claim from claimed_webhooks where not is_test;
  select * into test_claim from claimed_webhooks where is_test;
  if production_claim.contact_email <> 'webhook-client@example.test'
    or production_claim.lead_public_id <> '94000000-0000-4000-8000-000000000002'
    or production_claim.secret_version <> 1
    or test_claim.contact_email is not null
  then
    raise exception 'worker projection is incomplete, cross-scoped or test contains PII';
  end if;

  perform public.complete_webhook_delivery(
    test_claim.delivery_id,
    test_claim.lock_token,
    204
  );
  perform public.fail_webhook_delivery(
    production_claim.delivery_id,
    production_claim.lock_token,
    'http_5xx',
    true,
    503
  );
end;
$$;

reset role;
update public.webhook_deliveries
set available_at = now() - interval '1 second'
where status = 'retry';

set role service_role;
create temporary table retried_webhook as
select *
from public.claim_webhook_delivery_batch(
  '95000000-0000-4000-8000-000000000002',
  10
);

do $$
declare
  retried record;
begin
  select * into retried from retried_webhook;
  if not found or retried.attempt_number <> 2 then
    raise exception 'webhook retry did not create a second attempt';
  end if;
  perform public.complete_webhook_delivery(retried.delivery_id, retried.lock_token, 200);
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

select public.rotate_webhook_endpoint_secret(
  'aaaaaaaa-0000-4000-8000-000000000001',
  (
    select id from public.webhook_endpoints
    where request_id = '91000000-0000-4000-8000-000000000001'
  ),
  '96000000-0000-4000-8000-000000000001'
);

do $$
declare
  first_result jsonb;
  retry_result jsonb;
begin
  first_result := public.rotate_webhook_endpoint_secret(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    ),
    '96000000-0000-4000-8000-000000000001'
  );
  retry_result := public.rotate_webhook_endpoint_secret(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    ),
    '96000000-0000-4000-8000-000000000001'
  );
  if (first_result ->> 'secretVersion')::integer <> 2
    or (retry_result ->> 'secretVersion')::integer <> 2
  then
    raise exception 'webhook secret rotation is not idempotent';
  end if;
end;
$$;

select public.enqueue_webhook_test(
  'aaaaaaaa-0000-4000-8000-000000000001',
  (
    select id from public.webhook_endpoints
    where request_id = '91000000-0000-4000-8000-000000000001'
  ),
  '92000000-0000-4000-8000-000000000002'
);

do $$
begin
  if not public.disable_webhook_endpoint(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    )
  ) then
    raise exception 'webhook endpoint was not disabled';
  end if;
  if not public.disable_webhook_endpoint(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (
      select id from public.webhook_endpoints
      where request_id = '91000000-0000-4000-8000-000000000001'
    )
  ) then
    raise exception 'webhook disable retry is not idempotent';
  end if;
end;
$$;

reset role;

do $$
begin
  if (
    select count(*)
    from public.webhook_deliveries
    where status = 'delivered'
  ) <> 2 then
    raise exception 'successful webhook states are incomplete';
  end if;
  if (
    select count(*)
    from public.webhook_deliveries
    where status = 'dead_letter'
      and last_error_code = 'endpoint_disabled'
  ) <> 1 then
    raise exception 'disable did not dead-letter the queued delivery';
  end if;
  if (select count(*) from public.webhook_delivery_attempts) <> 3 then
    raise exception 'webhook attempt history is incomplete';
  end if;
  if exists (
    select 1
    from public.audit_logs log
    where log.action like 'webhook.%'
      and log.metadata::text ~* '(hooks|partner|webhook-client|@)'
  ) then
    raise exception 'webhook audit metadata contains URL or PII';
  end if;
  if (
    select count(*)
    from public.audit_logs log
    where log.action in (
      'webhook.endpoint_created',
      'webhook.test_enqueued',
      'webhook.secret_rotated',
      'webhook.endpoint_disabled'
    )
  ) <> 5 then
    raise exception 'critical webhook operations were not audited exactly once';
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  endpoint_number integer;
  request_key uuid;
begin
  for endpoint_number in 1..10 loop
    request_key := format(
      '97000000-0000-4000-8000-%s',
      lpad(endpoint_number::text, 12, '0')
    )::uuid;
    perform public.create_webhook_endpoint(
      'aaaaaaaa-0000-4000-8000-000000000001',
      format('https://hooks%s.partner.pl/kwotum', endpoint_number),
      request_key
    );
  end loop;

  -- Idempotentny retry musi działać również po osiągnięciu limitu.
  perform public.create_webhook_endpoint(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'https://hooks1.partner.pl/kwotum',
    '97000000-0000-4000-8000-000000000001'
  );

  begin
    perform public.create_webhook_endpoint(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'https://hooks11.partner.pl/kwotum',
      '97000000-0000-4000-8000-000000000011'
    );
    raise exception 'active webhook endpoint limit was bypassed';
  exception
    when program_limit_exceeded then
      null;
  end;
end;
$$;

reset role;

delete from public.webhook_deliveries
where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from public.webhook_endpoints
where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from public.leads where id = '94000000-0000-4000-8000-000000000001';
delete from public.widget_sessions where id = '93000000-0000-4000-8000-000000000001';

select 'webhook delivery checks passed' as result;
