\set ON_ERROR_STOP on

set role anon;

do $$
begin
  if public.runtime_readiness_probe() is distinct from true then
    raise exception 'anonymous readiness probe did not return true';
  end if;
end;
$$;

reset role;
set role authenticated;

do $$
begin
  if public.runtime_readiness_probe() is distinct from true then
    raise exception 'authenticated readiness probe did not return true';
  end if;
end;
$$;

reset role;

do $$
begin
  if not has_function_privilege('anon', 'public.runtime_readiness_probe()', 'execute') then
    raise exception 'anon is missing readiness execute grant';
  end if;
  if not has_function_privilege(
    'authenticated',
    'public.runtime_readiness_probe()',
    'execute'
  ) then
    raise exception 'authenticated is missing readiness execute grant';
  end if;
end;
$$;

select 'runtime readiness checks passed' as result;
