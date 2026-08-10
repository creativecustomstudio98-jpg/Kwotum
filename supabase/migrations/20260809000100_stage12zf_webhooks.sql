create type public.webhook_endpoint_status as enum (
  'enabled',
  'disabled'
);

create type public.webhook_delivery_status as enum (
  'pending',
  'processing',
  'retry',
  'delivered',
  'dead_letter'
);

create type public.webhook_attempt_outcome as enum (
  'delivered',
  'retry',
  'dead_letter'
);

create type public.webhook_error_code as enum (
  'configuration',
  'network',
  'timeout',
  'dns_resolution',
  'unsafe_target',
  'tls',
  'redirect',
  'http_4xx',
  'http_408',
  'http_425',
  'http_429',
  'http_5xx',
  'invalid_response',
  'endpoint_disabled',
  'secret_rotated',
  'worker_timeout'
);

create table public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  url text not null check (
    char_length(url) between 12 and 2048
    and url ~ '^https://[^:/?#[:space:]@]+(:443)?(/[^?#[:space:]]*)?$'
  ),
  request_id uuid not null,
  event_type text not null default 'lead.created' check (event_type = 'lead.created'),
  status public.webhook_endpoint_status not null default 'enabled',
  secret_version smallint not null default 1 check (secret_version between 1 and 32767),
  created_by uuid not null references auth.users (id),
  rotated_at timestamptz,
  rotated_by uuid references auth.users (id) on delete set null,
  last_rotation_request_id uuid,
  disabled_at timestamptz,
  disabled_by uuid references auth.users (id) on delete set null,
  last_tested_at timestamptz,
  last_delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, request_id),
  constraint webhook_endpoint_state_consistent check (
    (
      status = 'enabled'
      and disabled_at is null
      and disabled_by is null
    )
    or (
      status = 'disabled'
      and disabled_at is not null
      and disabled_by is not null
    )
  ),
  constraint webhook_endpoint_rotation_consistent check (
    (rotated_at is null and rotated_by is null and secret_version = 1)
    or (rotated_at is not null and rotated_by is not null and secret_version > 1)
  )
);

create unique index webhook_endpoints_active_url_idx
  on public.webhook_endpoints (organization_id, url)
  where status = 'enabled';
create index webhook_endpoints_organization_created_idx
  on public.webhook_endpoints (organization_id, created_at desc);
create unique index webhook_endpoints_rotation_request_idx
  on public.webhook_endpoints (organization_id, last_rotation_request_id)
  where last_rotation_request_id is not null;

create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  endpoint_id uuid not null references public.webhook_endpoints (id),
  lead_id uuid,
  event_id uuid not null default gen_random_uuid(),
  event_type text not null default 'lead.created' check (event_type = 'lead.created'),
  occurred_at timestamptz not null default now(),
  is_test boolean not null default false,
  status public.webhook_delivery_status not null default 'pending',
  attempt_count smallint not null default 0 check (attempt_count between 0 and 5),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  lock_token uuid,
  delivered_at timestamptz,
  response_status smallint check (response_status between 100 and 599),
  last_error_code public.webhook_error_code,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (endpoint_id, event_id),
  constraint webhook_delivery_endpoint_tenant_fk foreign key (
    organization_id,
    endpoint_id
  ) references public.webhook_endpoints (organization_id, id),
  constraint webhook_delivery_lead_tenant_fk foreign key (
    organization_id,
    lead_id
  ) references public.leads (organization_id, id) on delete cascade,
  constraint webhook_delivery_source_consistent check (
    (is_test and lead_id is null)
    or (not is_test and lead_id is not null)
  ),
  constraint webhook_delivery_state_consistent check (
    (
      status in ('pending', 'retry')
      and locked_at is null
      and lock_token is null
      and delivered_at is null
    )
    or (
      status = 'processing'
      and locked_at is not null
      and lock_token is not null
      and delivered_at is null
    )
    or (
      status = 'delivered'
      and locked_at is null
      and lock_token is null
      and delivered_at is not null
      and response_status between 200 and 299
      and last_error_code is null
    )
    or (
      status = 'dead_letter'
      and locked_at is null
      and lock_token is null
      and delivered_at is null
      and last_error_code is not null
    )
  )
);

create index webhook_deliveries_ready_idx
  on public.webhook_deliveries (status, available_at, created_at)
  where status in ('pending', 'retry');
create index webhook_deliveries_endpoint_created_idx
  on public.webhook_deliveries (organization_id, endpoint_id, created_at desc);
create index webhook_deliveries_lead_idx
  on public.webhook_deliveries (organization_id, lead_id)
  where lead_id is not null;

create table public.webhook_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  delivery_id uuid not null references public.webhook_deliveries (id) on delete cascade,
  attempt_number smallint not null check (attempt_number between 1 and 5),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome public.webhook_attempt_outcome,
  error_code public.webhook_error_code,
  response_status smallint check (response_status between 100 and 599),
  unique (delivery_id, attempt_number),
  constraint webhook_attempt_delivery_tenant_fk foreign key (
    organization_id,
    delivery_id
  ) references public.webhook_deliveries (organization_id, id) on delete cascade,
  constraint webhook_attempt_result_consistent check (
    (
      finished_at is null
      and outcome is null
      and error_code is null
      and response_status is null
    )
    or (
      finished_at is not null
      and outcome = 'delivered'
      and error_code is null
      and response_status between 200 and 299
    )
    or (
      finished_at is not null
      and outcome in ('retry', 'dead_letter')
      and error_code is not null
    )
  )
);

create index webhook_attempts_delivery_idx
  on public.webhook_delivery_attempts (
    organization_id,
    delivery_id,
    attempt_number desc
  );

create trigger webhook_endpoints_set_updated_at
before update on public.webhook_endpoints
for each row execute function app_private.set_updated_at();

create trigger webhook_deliveries_set_updated_at
before update on public.webhook_deliveries
for each row execute function app_private.set_updated_at();

create function public.create_webhook_endpoint(
  target_organization_id uuid,
  target_url text,
  idempotency_key uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  endpoint_record public.webhook_endpoints%rowtype;
  existing_record public.webhook_endpoints%rowtype;
  normalized_url text := trim(target_url);
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'webhook endpoint is forbidden' using errcode = 'insufficient_privilege';
  end if;
  if idempotency_key is null
    or normalized_url is null
    or char_length(normalized_url) not between 12 and 2048
    or normalized_url !~ '^https://[^:/?#[:space:]@]+(:443)?(/[^?#[:space:]]*)?$'
  then
    raise exception 'invalid webhook endpoint' using errcode = 'invalid_parameter_value';
  end if;

  -- Serializujemy tworzenie w obrębie tenanta, aby równoległe requesty nie
  -- ominęły limitu fan-out ani semantyki idempotencji.
  perform 1
  from public.organizations organization
  where organization.id = target_organization_id
  for update;

  select endpoint.*
  into existing_record
  from public.webhook_endpoints endpoint
  where endpoint.organization_id = target_organization_id
    and endpoint.request_id = idempotency_key;

  if existing_record.id is not null then
    if existing_record.url <> normalized_url then
      raise exception 'idempotency key reused with different webhook endpoint'
        using errcode = 'unique_violation';
    end if;
    endpoint_record := existing_record;
  else
    if (
      select count(*)
      from public.webhook_endpoints endpoint
      where endpoint.organization_id = target_organization_id
        and endpoint.status = 'enabled'
    ) >= 10 then
      raise exception 'active webhook endpoint limit reached'
        using errcode = 'program_limit_exceeded';
    end if;

    if (
      select count(*)
      from public.webhook_endpoints endpoint
      where endpoint.organization_id = target_organization_id
    ) >= 100 then
      raise exception 'webhook endpoint history limit reached'
        using errcode = 'program_limit_exceeded';
    end if;

    insert into public.webhook_endpoints (
      organization_id,
      url,
      request_id,
      created_by
    ) values (
      target_organization_id,
      normalized_url,
      idempotency_key,
      actor_id
    )
    returning * into endpoint_record;

    insert into public.audit_logs (
      organization_id,
      actor_user_id,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      target_organization_id,
      actor_id,
      'webhook.endpoint_created',
      'webhook_endpoints',
      endpoint_record.id,
      jsonb_build_object(
        'eventType', endpoint_record.event_type,
        'secretVersion', endpoint_record.secret_version
      )
    );
  end if;

  return jsonb_build_object(
    'id', endpoint_record.id,
    'url', endpoint_record.url,
    'eventType', endpoint_record.event_type,
    'status', endpoint_record.status,
    'secretVersion', endpoint_record.secret_version,
    'createdAt', endpoint_record.created_at
  );
exception
  when unique_violation then
    raise exception 'webhook endpoint already exists' using errcode = 'unique_violation';
end;
$$;

create function public.rotate_webhook_endpoint_secret(
  target_organization_id uuid,
  target_endpoint_id uuid,
  idempotency_key uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  endpoint_record public.webhook_endpoints%rowtype;
begin
  if idempotency_key is null
    or actor_id is null
    or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'webhook endpoint is forbidden' using errcode = 'insufficient_privilege';
  end if;

  select endpoint.*
  into endpoint_record
  from public.webhook_endpoints endpoint
  where endpoint.organization_id = target_organization_id
    and endpoint.id = target_endpoint_id
    and endpoint.status = 'enabled'
  for update;
  if not found then
    raise exception 'webhook endpoint not found' using errcode = 'no_data_found';
  end if;
  if endpoint_record.secret_version >= 32767 then
    raise exception 'webhook secret version exhausted' using errcode = 'program_limit_exceeded';
  end if;
  if endpoint_record.last_rotation_request_id = idempotency_key then
    return jsonb_build_object(
      'id', endpoint_record.id,
      'secretVersion', endpoint_record.secret_version,
      'rotatedAt', endpoint_record.rotated_at
    );
  end if;

  update public.webhook_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = case
      when delivery.attempt_count >= 5 then 'dead_letter'::public.webhook_attempt_outcome
      else 'retry'::public.webhook_attempt_outcome
    end,
    error_code = 'secret_rotated'
  from public.webhook_deliveries delivery
  where delivery.organization_id = target_organization_id
    and delivery.endpoint_id = target_endpoint_id
    and delivery.status = 'processing'
    and attempt.delivery_id = delivery.id
    and attempt.attempt_number = delivery.attempt_count
    and attempt.finished_at is null;

  update public.webhook_deliveries delivery
  set
    status = case
      when delivery.attempt_count >= 5 then 'dead_letter'::public.webhook_delivery_status
      else 'retry'::public.webhook_delivery_status
    end,
    available_at = now(),
    locked_at = null,
    lock_token = null,
    last_error_code = 'secret_rotated'
  where delivery.organization_id = target_organization_id
    and delivery.endpoint_id = target_endpoint_id
    and delivery.status = 'processing';

  update public.webhook_endpoints endpoint
  set
    secret_version = endpoint.secret_version + 1,
    rotated_at = now(),
    rotated_by = actor_id,
    last_rotation_request_id = idempotency_key
  where endpoint.organization_id = target_organization_id
    and endpoint.id = target_endpoint_id
  returning * into endpoint_record;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    'webhook.secret_rotated',
    'webhook_endpoints',
    target_endpoint_id,
    jsonb_build_object('secretVersion', endpoint_record.secret_version)
  );

  return jsonb_build_object(
    'id', endpoint_record.id,
    'secretVersion', endpoint_record.secret_version,
    'rotatedAt', endpoint_record.rotated_at
  );
end;
$$;

create function public.disable_webhook_endpoint(
  target_organization_id uuid,
  target_endpoint_id uuid
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'webhook endpoint is forbidden' using errcode = 'insufficient_privilege';
  end if;

  update public.webhook_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = 'dead_letter',
    error_code = 'endpoint_disabled'
  from public.webhook_deliveries delivery
  where delivery.organization_id = target_organization_id
    and delivery.endpoint_id = target_endpoint_id
    and delivery.status = 'processing'
    and attempt.delivery_id = delivery.id
    and attempt.attempt_number = delivery.attempt_count
    and attempt.finished_at is null;

  update public.webhook_deliveries delivery
  set
    status = 'dead_letter',
    locked_at = null,
    lock_token = null,
    last_error_code = 'endpoint_disabled'
  where delivery.organization_id = target_organization_id
    and delivery.endpoint_id = target_endpoint_id
    and delivery.status in ('pending', 'processing', 'retry');

  update public.webhook_endpoints endpoint
  set
    status = 'disabled',
    disabled_at = now(),
    disabled_by = actor_id
  where endpoint.organization_id = target_organization_id
    and endpoint.id = target_endpoint_id
    and endpoint.status = 'enabled';
  if not found then
    if exists (
      select 1
      from public.webhook_endpoints existing
      where existing.organization_id = target_organization_id
        and existing.id = target_endpoint_id
        and existing.status = 'disabled'
    ) then
      return true;
    end if;
    raise exception 'webhook endpoint not found' using errcode = 'no_data_found';
  end if;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    target_organization_id,
    actor_id,
    'webhook.endpoint_disabled',
    'webhook_endpoints',
    target_endpoint_id,
    jsonb_build_object('eventType', 'lead.created')
  );
  return true;
end;
$$;

create function public.enqueue_webhook_test(
  target_organization_id uuid,
  target_endpoint_id uuid,
  request_id uuid
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  delivery_record public.webhook_deliveries%rowtype;
begin
  if actor_id is null or not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'webhook endpoint is forbidden' using errcode = 'insufficient_privilege';
  end if;
  if request_id is null or not exists (
    select 1
    from public.webhook_endpoints endpoint
    where endpoint.organization_id = target_organization_id
      and endpoint.id = target_endpoint_id
      and endpoint.status = 'enabled'
  ) then
    raise exception 'webhook endpoint not found' using errcode = 'no_data_found';
  end if;

  insert into public.webhook_deliveries (
    organization_id,
    endpoint_id,
    event_id,
    is_test
  ) values (
    target_organization_id,
    target_endpoint_id,
    request_id,
    true
  )
  on conflict (endpoint_id, event_id) do nothing
  returning * into delivery_record;

  if delivery_record.id is null then
    select delivery.*
    into delivery_record
    from public.webhook_deliveries delivery
    where delivery.endpoint_id = target_endpoint_id
      and delivery.event_id = request_id
      and delivery.organization_id = target_organization_id
      and delivery.is_test;
  else
    update public.webhook_endpoints endpoint
    set last_tested_at = now()
    where endpoint.organization_id = target_organization_id
      and endpoint.id = target_endpoint_id;
    insert into public.audit_logs (
      organization_id,
      actor_user_id,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      target_organization_id,
      actor_id,
      'webhook.test_enqueued',
      'webhook_endpoints',
      target_endpoint_id,
      jsonb_build_object('deliveryId', delivery_record.id)
    );
  end if;

  return jsonb_build_object(
    'deliveryId', delivery_record.id,
    'eventId', delivery_record.event_id,
    'status', delivery_record.status,
    'createdAt', delivery_record.created_at
  );
end;
$$;

create function app_private.enqueue_lead_webhooks()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  insert into public.webhook_deliveries (
    organization_id,
    endpoint_id,
    lead_id,
    occurred_at
  )
  select
    new.organization_id,
    endpoint.id,
    new.id,
    new.submitted_at
  from public.webhook_endpoints endpoint
  where endpoint.organization_id = new.organization_id
    and endpoint.status = 'enabled'
    and endpoint.event_type = 'lead.created'
  on conflict (endpoint_id, event_id) do nothing;
  return new;
end;
$$;

create trigger leads_enqueue_webhooks
after insert on public.leads
for each row execute function app_private.enqueue_lead_webhooks();

create function public.claim_webhook_delivery_batch(
  worker_id uuid,
  batch_size integer
)
returns table (
  delivery_id uuid,
  lock_token uuid,
  endpoint_id uuid,
  endpoint_url text,
  secret_version smallint,
  organization_id uuid,
  event_id uuid,
  event_type text,
  occurred_at timestamptz,
  is_test boolean,
  attempt_number smallint,
  lead_public_id uuid,
  flow_title text,
  contact_email text,
  contact_name text,
  contact_phone text,
  price_min_minor bigint,
  price_max_minor bigint,
  price_currency text,
  price_presentation text,
  submitted_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if worker_id is null or batch_size not between 1 and 50 then
    raise exception 'webhook worker is not authorized' using errcode = 'insufficient_privilege';
  end if;

  update public.webhook_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = case
      when delivery.attempt_count >= 5 then 'dead_letter'::public.webhook_attempt_outcome
      else 'retry'::public.webhook_attempt_outcome
    end,
    error_code = 'worker_timeout'
  from public.webhook_deliveries delivery
  where delivery.status = 'processing'
    and delivery.locked_at < now() - interval '15 minutes'
    and attempt.delivery_id = delivery.id
    and attempt.attempt_number = delivery.attempt_count
    and attempt.finished_at is null;

  update public.webhook_deliveries delivery
  set
    status = case
      when delivery.attempt_count >= 5 then 'dead_letter'::public.webhook_delivery_status
      else 'retry'::public.webhook_delivery_status
    end,
    available_at = now(),
    locked_at = null,
    lock_token = null,
    last_error_code = 'worker_timeout'
  where delivery.status = 'processing'
    and delivery.locked_at < now() - interval '15 minutes';

  return query
  with candidates as (
    select delivery.id
    from public.webhook_deliveries delivery
    join public.webhook_endpoints endpoint
      on endpoint.id = delivery.endpoint_id
      and endpoint.organization_id = delivery.organization_id
      and endpoint.status = 'enabled'
    where delivery.status in ('pending', 'retry')
      and delivery.available_at <= now()
      and delivery.attempt_count < 5
    order by delivery.available_at, delivery.created_at, delivery.id
    for update of delivery skip locked
    limit batch_size
  ),
  claimed as (
    update public.webhook_deliveries delivery
    set
      status = 'processing',
      attempt_count = delivery.attempt_count + 1,
      locked_at = now(),
      lock_token = gen_random_uuid(),
      response_status = null,
      last_error_code = null
    from candidates
    where delivery.id = candidates.id
    returning delivery.*
  ),
  attempts as (
    insert into public.webhook_delivery_attempts (
      organization_id,
      delivery_id,
      attempt_number
    )
    select
      claimed.organization_id,
      claimed.id,
      claimed.attempt_count
    from claimed
    returning webhook_delivery_attempts.delivery_id
  )
  select
    claimed.id,
    claimed.lock_token,
    endpoint.id,
    endpoint.url,
    endpoint.secret_version,
    claimed.organization_id,
    claimed.event_id,
    claimed.event_type,
    claimed.occurred_at,
    claimed.is_test,
    claimed.attempt_count,
    lead.public_id,
    lead.flow_title,
    lead.contact_email,
    lead.contact_name,
    lead.contact_phone,
    lead.price_min_minor,
    lead.price_max_minor,
    lead.price_currency,
    lead.price_presentation,
    lead.submitted_at
  from claimed
  join attempts on attempts.delivery_id = claimed.id
  join public.webhook_endpoints endpoint
    on endpoint.id = claimed.endpoint_id
    and endpoint.organization_id = claimed.organization_id
  left join public.leads lead
    on lead.id = claimed.lead_id
    and lead.organization_id = claimed.organization_id;
end;
$$;

create function public.complete_webhook_delivery(
  target_delivery_id uuid,
  target_lock_token uuid,
  target_response_status integer
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_attempt smallint;
  target_endpoint_id uuid;
  target_organization_id uuid;
begin
  if target_response_status not between 200 and 299 then
    raise exception 'invalid webhook response' using errcode = 'invalid_parameter_value';
  end if;

  select delivery.organization_id, delivery.endpoint_id, delivery.attempt_count
  into target_organization_id, target_endpoint_id, current_attempt
  from public.webhook_deliveries delivery
  where delivery.id = target_delivery_id
    and delivery.status = 'processing'
    and delivery.lock_token = target_lock_token
  for update;
  if not found then
    raise exception 'webhook delivery lock not found' using errcode = 'no_data_found';
  end if;

  update public.webhook_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = 'delivered',
    response_status = target_response_status
  where attempt.delivery_id = target_delivery_id
    and attempt.organization_id = target_organization_id
    and attempt.attempt_number = current_attempt
    and attempt.finished_at is null;

  update public.webhook_deliveries delivery
  set
    status = 'delivered',
    delivered_at = now(),
    locked_at = null,
    lock_token = null,
    response_status = target_response_status,
    last_error_code = null
  where delivery.id = target_delivery_id;

  update public.webhook_endpoints endpoint
  set last_delivered_at = now()
  where endpoint.organization_id = target_organization_id
    and endpoint.id = target_endpoint_id;
end;
$$;

create function public.fail_webhook_delivery(
  target_delivery_id uuid,
  target_lock_token uuid,
  target_error_code public.webhook_error_code,
  retryable boolean,
  target_response_status integer default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_attempt smallint;
  next_status public.webhook_delivery_status;
  target_organization_id uuid;
begin
  if target_error_code in ('endpoint_disabled', 'secret_rotated', 'worker_timeout')
    or (target_response_status is not null and target_response_status not between 100 and 599)
  then
    raise exception 'invalid webhook failure' using errcode = 'invalid_parameter_value';
  end if;

  select delivery.organization_id, delivery.attempt_count
  into target_organization_id, current_attempt
  from public.webhook_deliveries delivery
  where delivery.id = target_delivery_id
    and delivery.status = 'processing'
    and delivery.lock_token = target_lock_token
  for update;
  if not found then
    raise exception 'webhook delivery lock not found' using errcode = 'no_data_found';
  end if;

  next_status := case
    when retryable and current_attempt < 5 then 'retry'::public.webhook_delivery_status
    else 'dead_letter'::public.webhook_delivery_status
  end;

  update public.webhook_delivery_attempts attempt
  set
    finished_at = now(),
    outcome = case
      when next_status = 'retry' then 'retry'::public.webhook_attempt_outcome
      else 'dead_letter'::public.webhook_attempt_outcome
    end,
    error_code = target_error_code,
    response_status = target_response_status
  where attempt.delivery_id = target_delivery_id
    and attempt.organization_id = target_organization_id
    and attempt.attempt_number = current_attempt
    and attempt.finished_at is null;

  update public.webhook_deliveries delivery
  set
    status = next_status,
    available_at = case current_attempt
      when 1 then now() + interval '1 minute'
      when 2 then now() + interval '5 minutes'
      when 3 then now() + interval '30 minutes'
      else now() + interval '2 hours'
    end,
    locked_at = null,
    lock_token = null,
    response_status = target_response_status,
    last_error_code = target_error_code
  where delivery.id = target_delivery_id;
end;
$$;

alter table public.webhook_endpoints enable row level security;
alter table public.webhook_endpoints force row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.webhook_deliveries force row level security;
alter table public.webhook_delivery_attempts enable row level security;
alter table public.webhook_delivery_attempts force row level security;

create policy webhook_endpoints_select_manager
on public.webhook_endpoints for select to authenticated
using (app_private.has_role(
  organization_id,
  array['owner', 'admin']::public.organization_member_role[]
));

create policy webhook_deliveries_select_manager
on public.webhook_deliveries for select to authenticated
using (app_private.has_role(
  organization_id,
  array['owner', 'admin']::public.organization_member_role[]
));

create policy webhook_attempts_select_manager
on public.webhook_delivery_attempts for select to authenticated
using (app_private.has_role(
  organization_id,
  array['owner', 'admin']::public.organization_member_role[]
));

revoke all on table public.webhook_endpoints from public, anon, authenticated;
revoke all on table public.webhook_deliveries from public, anon, authenticated;
revoke all on table public.webhook_delivery_attempts from public, anon, authenticated;
grant select on public.webhook_endpoints to authenticated;
grant select on public.webhook_deliveries to authenticated;
grant select on public.webhook_delivery_attempts to authenticated;

revoke all on function public.create_webhook_endpoint(uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.rotate_webhook_endpoint_secret(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.disable_webhook_endpoint(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.enqueue_webhook_test(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function app_private.enqueue_lead_webhooks()
  from public, anon, authenticated;
revoke all on function public.claim_webhook_delivery_batch(uuid, integer)
  from public, anon, authenticated;
revoke all on function public.complete_webhook_delivery(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.fail_webhook_delivery(
  uuid, uuid, public.webhook_error_code, boolean, integer
) from public, anon, authenticated;

grant execute on function public.create_webhook_endpoint(uuid, text, uuid)
  to authenticated;
grant execute on function public.rotate_webhook_endpoint_secret(uuid, uuid, uuid)
  to authenticated;
grant execute on function public.disable_webhook_endpoint(uuid, uuid)
  to authenticated;
grant execute on function public.enqueue_webhook_test(uuid, uuid, uuid)
  to authenticated;
grant execute on function public.claim_webhook_delivery_batch(uuid, integer)
  to service_role;
grant execute on function public.complete_webhook_delivery(uuid, uuid, integer)
  to service_role;
grant execute on function public.fail_webhook_delivery(
  uuid, uuid, public.webhook_error_code, boolean, integer
) to service_role;

comment on table public.webhook_endpoints is
  'Tenant webhook configuration. Signing secrets are derived server-side and never stored.';
comment on table public.webhook_deliveries is
  'Transactional at-least-once webhook outbox for lead.created and synthetic tests.';
comment on table public.webhook_delivery_attempts is
  'PII-free technical webhook delivery history without response bodies.';
