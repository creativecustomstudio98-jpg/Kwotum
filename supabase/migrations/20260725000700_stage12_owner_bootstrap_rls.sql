drop policy if exists organizations_insert_authenticated
on public.organizations;

revoke insert on public.organizations from authenticated;

create function public.create_organization(
  organization_name text,
  organization_slug text
)
returns table (
  id uuid,
  name text,
  slug text
)
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  actor_id uuid := auth.uid();
  created_id uuid;
begin
  if actor_id is null then
    raise exception 'authentication required'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.organizations (
    name,
    slug,
    created_by
  )
  values (
    organization_name,
    organization_slug,
    actor_id
  )
  returning organizations.id into created_id;

  return query
  select
    organization.id,
    organization.name,
    organization.slug
  from public.organizations organization
  where organization.id = created_id;
end;
$$;

revoke all on function public.create_organization(text, text)
from public, anon, authenticated;
grant execute on function public.create_organization(text, text)
to authenticated;
