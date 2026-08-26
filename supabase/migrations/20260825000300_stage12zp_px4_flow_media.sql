-- Stage 12ZP / PX4: tenant-owned media for immutable image cards.
--
-- Rollback policy: hide upload/image_cards in the application first. Keep the
-- table, resolver and stored objects while any draft or immutable version
-- references an asset. Destructive cleanup requires a separate retention plan.

create table public.flow_media_assets (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id),
  object_path text not null unique,
  original_name text not null check (
    char_length(original_name) between 1 and 255
    and original_name !~ '[[:cntrl:]]'
  ),
  mime_type text not null check (mime_type = 'image/webp'),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  width integer not null check (width between 320 and 1600),
  height integer not null check (height between 180 and 1200),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'ready', 'rejected')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  unique (organization_id, id),
  constraint flow_media_asset_path_is_tenant_scoped check (
    object_path = organization_id::text || '/flow-assets/' || id::text || '.webp'
  ),
  constraint flow_media_asset_status_is_consistent check (
    (status = 'ready' and ready_at is not null)
    or (status <> 'ready' and ready_at is null)
  )
);

create index flow_media_assets_organization_created_idx
  on public.flow_media_assets (organization_id, created_at desc);

alter table public.flow_media_assets enable row level security;
alter table public.flow_media_assets force row level security;

create policy flow_media_assets_select_editor
on public.flow_media_assets for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flow_media_assets_insert_editor
on public.flow_media_assets for insert to authenticated
with check (
  created_by = auth.uid()
  and app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy flow_media_assets_update_editor
on public.flow_media_assets for update to authenticated
using (
  created_by = auth.uid()
  and status = 'pending'
  and app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
)
with check (
  created_by = auth.uid()
  and app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

grant select, insert, update on public.flow_media_assets to authenticated;

create function app_private.protect_flow_media_asset()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if OLD.status <> 'pending'
    or NEW.id <> OLD.id
    or NEW.organization_id <> OLD.organization_id
    or NEW.object_path <> OLD.object_path
    or NEW.original_name <> OLD.original_name
    or NEW.mime_type <> OLD.mime_type
    or NEW.size_bytes <> OLD.size_bytes
    or NEW.width <> OLD.width
    or NEW.height <> OLD.height
    or NEW.sha256 <> OLD.sha256
    or NEW.created_by <> OLD.created_by
    or NEW.created_at <> OLD.created_at
    or NEW.status not in ('ready', 'rejected')
  then
    raise exception 'flow media asset is immutable'
      using errcode = 'check_violation';
  end if;
  return NEW;
end;
$$;

create trigger flow_media_assets_protect
before update on public.flow_media_assets
for each row execute function app_private.protect_flow_media_asset();

create function app_private.flow_asset_ids(snapshot jsonb)
returns setof uuid
language sql
immutable
set search_path = ''
as $$
  select distinct (option_value #>> '{presentation,asset,id}')::uuid
  from jsonb_array_elements(
    case when jsonb_typeof(snapshot -> 'steps') = 'array'
      then snapshot -> 'steps' else '[]'::jsonb end
  ) as step_value
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(step_value -> 'options') = 'array'
      then step_value -> 'options' else '[]'::jsonb end
  ) as option_value
  where option_value #>> '{presentation,asset,id}'
    ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
$$;

create function app_private.flow_asset_references_are_valid(
  target_organization_id uuid,
  snapshot jsonb
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from app_private.flow_asset_ids(snapshot) referenced(id)
    left join public.flow_media_assets asset
      on asset.id = referenced.id
      and asset.organization_id = target_organization_id
      and asset.status = 'ready'
    where asset.id is null
  );
$$;

create function app_private.enforce_flow_asset_references()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.flow_asset_references_are_valid(NEW.organization_id, NEW.draft) then
    raise exception 'flow references unavailable media asset'
      using errcode = 'foreign_key_violation';
  end if;
  return NEW;
end;
$$;

create trigger flows_validate_media_assets
before insert or update of draft, organization_id on public.flows
for each row execute function app_private.enforce_flow_asset_references();

create function app_private.enforce_flow_version_asset_references()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.flow_asset_references_are_valid(NEW.organization_id, NEW.snapshot) then
    raise exception 'flow version references unavailable media asset'
      using errcode = 'foreign_key_violation';
  end if;
  return NEW;
end;
$$;

create trigger flow_versions_validate_media_assets
before insert on public.flow_versions
for each row execute function app_private.enforce_flow_version_asset_references();

create function public.resolve_public_flow_asset(
  target_public_flow_id uuid,
  target_asset_id uuid
)
returns table (
  object_path text,
  mime_type text,
  sha256 text,
  width integer,
  height integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select asset.object_path, asset.mime_type, asset.sha256, asset.width, asset.height
  from public.published_flows published
  join public.flow_media_assets asset
    on asset.organization_id = published.organization_id
    and asset.id = target_asset_id
    and asset.status = 'ready'
  where published.public_id = target_public_flow_id
    and exists (
      select 1
      from public.flow_versions version
      where version.flow_id = published.flow_id
        and version.organization_id = published.organization_id
        and target_asset_id in (
          select referenced.id
          from app_private.flow_asset_ids(version.snapshot) referenced(id)
        )
    )
  limit 1;
$$;

revoke all on table public.flow_media_assets from public, anon;
revoke all on function app_private.flow_asset_ids(jsonb) from public;
revoke all on function app_private.protect_flow_media_asset() from public;
revoke all on function app_private.flow_asset_references_are_valid(uuid, jsonb) from public;
revoke all on function app_private.enforce_flow_asset_references() from public;
revoke all on function app_private.enforce_flow_version_asset_references() from public;
revoke all on function public.resolve_public_flow_asset(uuid, uuid) from public, anon, authenticated;
grant execute on function public.resolve_public_flow_asset(uuid, uuid) to service_role;
