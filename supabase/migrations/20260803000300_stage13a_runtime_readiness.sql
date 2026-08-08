create or replace function public.runtime_readiness_probe()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select true;
$$;

comment on function public.runtime_readiness_probe() is
  'Narrow readiness probe. Verifies REST-to-PostgreSQL connectivity without reading tenant data.';

revoke all on function public.runtime_readiness_probe() from public;
grant execute on function public.runtime_readiness_probe() to anon, authenticated;
