\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'owner-a@example.test', '{"display_name":"Owner A"}'),
  ('10000000-0000-4000-8000-000000000002', 'admin-a@example.test', '{"display_name":"Admin A"}'),
  ('10000000-0000-4000-8000-000000000003', 'sales-a@example.test', '{"display_name":"Sales A"}'),
  ('10000000-0000-4000-8000-000000000004', 'suspended-a@example.test', '{"display_name":"Suspended A"}'),
  ('10000000-0000-4000-8000-000000000005', 'short-name@example.test', '{"display_name":"X"}'),
  ('20000000-0000-4000-8000-000000000001', 'owner-b@example.test', '{"display_name":"Owner B"}');

do $$
begin
  if not exists (
    select 1
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    cross join lateral unnest(coalesce(procedure.proconfig, array[]::text[])) setting
    where namespace.nspname = 'app_private'
      and procedure.proname = 'create_owner_membership'
      and setting = 'row_security=off'
  ) then
    raise exception 'owner bootstrap must explicitly bypass nested membership RLS';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_organization(text,text)',
    'execute'
  ) then
    raise exception 'anonymous role can create an organization';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_organization(text,text)',
    'execute'
  ) then
    raise exception 'authenticated role cannot execute organization onboarding';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.organizations',
    'insert'
  ) then
    raise exception 'authenticated role retained direct organization insert';
  end if;
end;
$$;

do $$
begin
  if (
    select display_name is not null
    from public.profiles
    where id = '10000000-0000-4000-8000-000000000005'
  ) then
    raise exception 'invalid display name should be normalized to null';
  end if;
end;
$$;

insert into public.organizations (id, name, slug, created_by)
values
  (
    'aaaaaaaa-0000-4000-8000-000000000001',
    'Tenant A',
    'tenant-a',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'bbbbbbbb-0000-4000-8000-000000000001',
    'Tenant B',
    'tenant-b',
    '20000000-0000-4000-8000-000000000001'
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
    'aaaaaaaa-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'admin',
    'active',
    '10000000-0000-4000-8000-000000000001',
    now()
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    'sales',
    'active',
    '10000000-0000-4000-8000-000000000001',
    now()
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000004',
    'sales',
    'suspended',
    '10000000-0000-4000-8000-000000000001',
    null
  );

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  visible_organizations integer;
  foreign_organizations integer;
  changed_rows integer;
begin
  select count(*) into visible_organizations from public.organizations;
  if visible_organizations <> 1 then
    raise exception 'owner A should see exactly one organization, saw %', visible_organizations;
  end if;

  select count(*) into foreign_organizations
  from public.organizations
  where id = 'bbbbbbbb-0000-4000-8000-000000000001';
  if foreign_organizations <> 0 then
    raise exception 'owner A can read tenant B';
  end if;

  update public.organizations
  set name = 'Compromised Tenant B'
  where id = 'bbbbbbbb-0000-4000-8000-000000000001';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'owner A can write tenant B';
  end if;

  if (select count(*) from public.audit_logs) = 0 then
    raise exception 'owner A cannot read their tenant audit log';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.audit_logs (
      organization_id,
      action,
      target_table
    )
    values (
      'aaaaaaaa-0000-4000-8000-000000000001',
      'forged',
      'organizations'
    );
    raise exception 'authenticated client can forge audit events';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.organizations (name, slug, created_by)
    values (
      'Forbidden direct organization',
      'forbidden-direct-organization',
      auth.uid()
    );
    raise exception 'authenticated client retained direct organization insert';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select id
from public.create_organization(
  'Tenant C to delete',
  'tenant-c-to-delete'
);

update public.organizations
set deleted_at = now()
where slug = 'tenant-c-to-delete';

do $$
begin
  if (
    select count(*)
    from public.organizations
    where slug = 'tenant-c-to-delete'
      and deleted_at is null
  ) <> 0 then
    raise exception 'soft-deleted organization remains in the active set';
  end if;
end;
$$;

insert into storage.objects (bucket_id, name, owner_id)
values (
  'tenant-private',
  'aaaaaaaa-0000-4000-8000-000000000001/quotes/quote-a.pdf',
  '10000000-0000-4000-8000-000000000001'
);

do $$
begin
  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'tenant-private',
      'bbbbbbbb-0000-4000-8000-000000000001/quotes/stolen.pdf',
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'owner A can write a file into tenant B';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'tenant-private',
      'not-a-tenant/quotes/invalid.pdf',
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'invalid storage path was accepted';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'tenant-private',
      (
        select id::text || '/quotes/deleted.pdf'
        from public.organizations
        where slug = 'tenant-c-to-delete'
      ),
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'soft-deleted tenant retained storage access';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
insert into storage.objects (bucket_id, name, owner_id)
values (
  'tenant-private',
  'bbbbbbbb-0000-4000-8000-000000000001/quotes/quote-b.pdf',
  '20000000-0000-4000-8000-000000000001'
);

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  visible_files integer;
  foreign_files integer;
begin
  select count(*) into visible_files
  from storage.objects
  where bucket_id = 'tenant-private';
  if visible_files <> 1 then
    raise exception 'owner A should see exactly one file, saw %', visible_files;
  end if;

  select count(*) into foreign_files
  from storage.objects
  where name like 'bbbbbbbb-%';
  if foreign_files <> 0 then
    raise exception 'owner A can read tenant B files';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);

do $$
declare
  audit_events integer;
  changed_rows integer;
begin
  select count(*) into audit_events from public.audit_logs;
  if audit_events = 0 then
    raise exception 'admin cannot read tenant audit log';
  end if;

  update public.organization_members
  set role = 'owner'
  where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
    and user_id = '10000000-0000-4000-8000-000000000002';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'admin can promote their own membership';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  if (select count(*) from public.audit_logs) <> 0 then
    raise exception 'sales member can read tenant audit log';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);

do $$
declare
  visible_organizations integer;
  visible_files integer;
begin
  select count(*) into visible_organizations from public.organizations;
  select count(*) into visible_files from storage.objects;
  if visible_organizations <> 0 or visible_files <> 0 then
    raise exception 'suspended member retained tenant access';
  end if;
end;
$$;

reset role;

do $$
begin
  begin
    update public.organization_members
    set status = 'suspended'
    where organization_id = 'bbbbbbbb-0000-4000-8000-000000000001'
      and user_id = '20000000-0000-4000-8000-000000000001';
    raise exception 'last active owner protection did not fire';
  exception
    when check_violation then
      null;
  end;
end;
$$;

select 'tenant isolation checks passed' as result;
