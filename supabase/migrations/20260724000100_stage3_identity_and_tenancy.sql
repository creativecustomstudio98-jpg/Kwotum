create schema if not exists extensions;
revoke all on schema extensions from public;
create extension if not exists pgcrypto with schema extensions;

create type public.organization_member_role as enum ('owner', 'admin', 'sales');
create type public.organization_member_status as enum ('invited', 'active', 'suspended');

create schema if not exists app_private;
revoke all on schema app_private from public;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  created_by uuid not null references auth.users (id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_member_role not null,
  status public.organization_member_status not null default 'invited',
  invited_by uuid references auth.users (id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id),
  constraint active_member_has_joined_at check (status <> 'active' or joined_at is not null)
);

create index organization_members_user_status_idx
  on public.organization_members (user_id, status, organization_id);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 3 and 120),
  target_table text not null check (char_length(target_table) between 2 and 80),
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_logs_organization_created_at_idx
  on public.audit_logs (organization_id, created_at desc);

create function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function app_private.set_updated_at();

create function app_private.protect_organization_creator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'organization creator is immutable'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger organizations_protect_creator
before update on public.organizations
for each row execute function app_private.protect_organization_creator();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function app_private.set_updated_at();

create function app_private.is_active_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members membership
    join public.organizations organization
      on organization.id = membership.organization_id
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and organization.deleted_at is null
  );
$$;

create function app_private.has_role(
  target_organization_id uuid,
  allowed_roles public.organization_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role = any (allowed_roles)
  );
$$;

create function app_private.shares_active_organization(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members current_membership
    join public.organization_members target_membership
      on target_membership.organization_id = current_membership.organization_id
    join public.organizations organization
      on organization.id = current_membership.organization_id
    where current_membership.user_id = auth.uid()
      and current_membership.status = 'active'
      and target_membership.user_id = target_user_id
      and target_membership.status = 'active'
      and organization.deleted_at is null
  );
$$;

create function app_private.storage_organization_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return nullif(split_part(object_name, '/', 1), '')::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on all functions in schema app_private from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_active_member(uuid) to authenticated;
grant execute on function app_private.has_role(uuid, public.organization_member_role[]) to authenticated;
grant execute on function app_private.shares_active_organization(uuid) to authenticated;
grant execute on function app_private.storage_organization_id(text) to authenticated;

create function app_private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    case
      when char_length(trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''))) between 2 and 120
        then trim(new.raw_user_meta_data ->> 'display_name')
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function app_private.create_profile_for_new_user();

create function app_private.create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
begin
  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at
  )
  values (
    new.id,
    new.created_by,
    'owner',
    'active',
    new.created_by,
    now()
  );
  return new;
end;
$$;

create trigger organization_created_add_owner
after insert on public.organizations
for each row execute function app_private.create_owner_membership();

create function app_private.protect_last_active_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  removes_owner boolean;
  remaining_owners integer;
begin
  removes_owner :=
    old.role = 'owner'
    and old.status = 'active'
    and (
      tg_op = 'DELETE'
      or new.role <> 'owner'
      or new.status <> 'active'
    );

  if removes_owner then
    select count(*)
    into remaining_owners
    from public.organization_members membership
    where membership.organization_id = old.organization_id
      and membership.user_id <> old.user_id
      and membership.role = 'owner'
      and membership.status = 'active';

    if remaining_owners = 0 then
      raise exception 'organization must retain at least one active owner'
        using errcode = 'check_violation';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger organization_members_protect_last_owner
before update or delete on public.organization_members
for each row execute function app_private.protect_last_active_owner();

create function app_private.audit_tenant_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  subject_id uuid;
begin
  if tg_table_name = 'organizations' then
    tenant_id := coalesce(new.id, old.id);
    subject_id := tenant_id;
  else
    tenant_id := coalesce(new.organization_id, old.organization_id);
    subject_id := coalesce(new.user_id, old.user_id);
  end if;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    tenant_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    subject_id,
    jsonb_build_object('operation', tg_op)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger organizations_write_audit_log
after insert or update on public.organizations
for each row execute function app_private.audit_tenant_change();

create trigger organization_members_write_audit_log
after insert or update or delete on public.organization_members
for each row execute function app_private.audit_tenant_change();

revoke all on function app_private.set_updated_at() from public, anon, authenticated;
revoke all on function app_private.protect_organization_creator() from public, anon, authenticated;
revoke all on function app_private.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function app_private.create_owner_membership() from public, anon, authenticated;
revoke all on function app_private.protect_last_active_owner() from public, anon, authenticated;
revoke all on function app_private.audit_tenant_change() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

create policy profiles_select_shared_tenant
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or app_private.shares_active_organization(id)
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy organizations_select_active_member
on public.organizations
for select
to authenticated
using (
  (
    deleted_at is null
    and app_private.is_active_member(id)
  )
  or app_private.has_role(id, array['owner']::public.organization_member_role[])
);

create policy organizations_insert_authenticated
on public.organizations
for insert
to authenticated
with check (created_by = auth.uid());

create policy organizations_update_owner
on public.organizations
for update
to authenticated
using (app_private.has_role(id, array['owner']::public.organization_member_role[]))
with check (
  app_private.has_role(id, array['owner']::public.organization_member_role[])
);

create policy organization_members_select_active_member
on public.organization_members
for select
to authenticated
using (app_private.is_active_member(organization_id));

create policy organization_members_insert_owner
on public.organization_members
for insert
to authenticated
with check (
  app_private.has_role(
    organization_id,
    array['owner']::public.organization_member_role[]
  )
);

create policy organization_members_update_owner
on public.organization_members
for update
to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner']::public.organization_member_role[]
  )
)
with check (
  app_private.has_role(
    organization_id,
    array['owner']::public.organization_member_role[]
  )
);

create policy organization_members_delete_owner
on public.organization_members
for delete
to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner']::public.organization_member_role[]
  )
);

create policy audit_logs_select_privileged_member
on public.audit_logs
for select
to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select on public.audit_logs to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tenant-private',
  'tenant-private',
  false,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Supabase owns storage.objects through its Storage service and enables RLS
-- on that system table. The migration role must only add scoped policies.

create policy tenant_private_objects_select_member
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tenant-private'
  and app_private.is_active_member(
    app_private.storage_organization_id(name)
  )
);

create policy tenant_private_objects_insert_member
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tenant-private'
  and app_private.is_active_member(
    app_private.storage_organization_id(name)
  )
);

create policy tenant_private_objects_update_member
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tenant-private'
  and app_private.is_active_member(
    app_private.storage_organization_id(name)
  )
)
with check (
  bucket_id = 'tenant-private'
  and app_private.is_active_member(
    app_private.storage_organization_id(name)
  )
);

create policy tenant_private_objects_delete_privileged_member
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tenant-private'
  and app_private.has_role(
    app_private.storage_organization_id(name),
    array['owner', 'admin']::public.organization_member_role[]
  )
);
