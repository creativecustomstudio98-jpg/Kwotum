\set ON_ERROR_STOP on

create temporary table flow_invitation_control (
  invitation_id uuid,
  lock_token uuid
);
grant select, insert, update on flow_invitation_control to authenticated, service_role;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  first_result jsonb;
  second_result jsonb;
begin
  first_result := public.create_flow_invitation(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000001',
    'fa000000-0000-4000-8000-000000000001',
    'klient@example.test',
    'Jan Kowalski',
    'Proszę uzupełnić zakres.'
  );
  second_result := public.create_flow_invitation(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000001',
    'fa000000-0000-4000-8000-000000000001',
    'klient@example.test',
    'Jan Kowalski',
    'Proszę uzupełnić zakres.'
  );
  if first_result ->> 'id' <> second_result ->> 'id'
    or (select count(*) from public.flow_invitations) <> 1
  then
    raise exception 'flow invitation idempotency failed';
  end if;
  if exists (
    select 1 from public.audit_logs log
    where log.target_id = (first_result ->> 'id')::uuid
      and log.metadata::text like '%klient@example.test%'
  ) then
    raise exception 'flow invitation PII leaked to audit metadata';
  end if;
  insert into flow_invitation_control (invitation_id)
  values ((first_result ->> 'id')::uuid);
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  if (select count(*) from public.flow_invitations) <> 0 then
    raise exception 'Sales read flow invitations';
  end if;
  begin
    perform public.create_flow_invitation(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'f1000000-0000-4000-8000-000000000001',
      'fa000000-0000-4000-8000-000000000002',
      'sales@example.test',
      null,
      null
    );
    raise exception 'Sales created flow invitation';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.flow_invitations) <> 0 then
    raise exception 'Tenant B read Tenant A flow invitation';
  end if;
end;
$$;

reset role;
set role service_role;

do $$
declare
  claimed record;
begin
  select * into claimed
  from public.claim_flow_invitation_batch(
    'fa000000-0000-4000-8000-000000000003',
    10,
    'test'
  );
  if claimed.invitation_id is null
    or claimed.recipient_email <> 'klient@example.test'
    or claimed.template_version <> 'flow-invitation-v1'
    or claimed.public_flow_id is null
  then
    raise exception 'flow invitation claim failed';
  end if;
  update flow_invitation_control
  set lock_token = claimed.lock_token
  where invitation_id = claimed.invitation_id;
  perform public.complete_flow_invitation_delivery(
    claimed.invitation_id,
    claimed.lock_token,
    'test',
    'test-flow-invitation-message'
  );
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
begin
  if not exists (
    select 1
    from public.flow_invitations invitation
    where invitation.status = 'sent'
      and invitation.sent_at is not null
      and invitation.provider_message_id = 'test-flow-invitation-message'
  ) then
    raise exception 'flow invitation delivery completion was not persisted';
  end if;
  if not exists (
    select 1
    from public.flow_invitation_delivery_attempts attempt
    where attempt.outcome = 'sent'
      and attempt.finished_at is not null
  ) then
    raise exception 'flow invitation delivery attempt was not persisted';
  end if;
end;
$$;

reset role;
