\set ON_ERROR_STOP on

create function test_support.image_flow_document(first_asset uuid, second_asset uuid)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with base as (
    select test_support.valid_flow_document_v3() as document
  )
  select jsonb_set(
    jsonb_set(
      jsonb_set(document, '{steps,0,presentation}', '{"variant":"image_cards"}'::jsonb),
      '{steps,0,options,0,presentation}',
      jsonb_build_object('asset', jsonb_build_object('id', first_asset, 'alt', 'Jasny materiał'))
    ),
    '{steps,0,options,1,presentation}',
    jsonb_build_object('asset', jsonb_build_object('id', second_asset, 'alt', 'Ciemny materiał'))
  )
  from base;
$$;

insert into public.flow_media_assets (
  id, organization_id, object_path, original_name, mime_type, size_bytes,
  width, height, sha256, status, created_by, ready_at
)
values (
  'b1000000-0000-4000-8000-000000000001',
  'bbbbbbbb-0000-4000-8000-000000000001',
  'bbbbbbbb-0000-4000-8000-000000000001/flow-assets/b1000000-0000-4000-8000-000000000001.webp',
  'obcy.webp', 'image/webp', 14000, 1200, 900, repeat('c', 64), 'ready',
  '20000000-0000-4000-8000-000000000001', now()
);

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

insert into public.flow_media_assets (
  id, organization_id, object_path, original_name, mime_type, size_bytes,
  width, height, sha256, status, created_by
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'aaaaaaaa-0000-4000-8000-000000000001',
    'aaaaaaaa-0000-4000-8000-000000000001/flow-assets/a1000000-0000-4000-8000-000000000001.webp',
    'jasny.webp', 'image/webp', 12000, 1200, 900, repeat('a', 64), 'pending',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'aaaaaaaa-0000-4000-8000-000000000001',
    'aaaaaaaa-0000-4000-8000-000000000001/flow-assets/a1000000-0000-4000-8000-000000000002.webp',
    'ciemny.webp', 'image/webp', 13000, 1200, 900, repeat('b', 64), 'pending',
    '10000000-0000-4000-8000-000000000001'
  );

update public.flow_media_assets
set status = 'ready', ready_at = now()
where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001';

insert into public.flow_media_assets (
  id, organization_id, object_path, original_name, mime_type, size_bytes,
  width, height, sha256, status, created_by
)
values (
  'a1000000-0000-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001/flow-assets/a1000000-0000-4000-8000-000000000003.webp',
  'oczekujacy.webp', 'image/webp', 11000, 1200, 900, repeat('d', 64), 'pending',
  '10000000-0000-4000-8000-000000000001'
);

insert into public.flows (
  id, organization_id, name, slug, draft, created_by, updated_by
)
values (
  'f4000000-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces obrazowy',
  'proces-obrazowy',
  test_support.image_flow_document(
    'a1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000002'
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

select public.publish_flow('f4000000-0000-4000-8000-000000000001', 1);

do $$
begin
  begin
    insert into public.flows (
      id, organization_id, name, slug, draft, created_by, updated_by
    ) values (
      'f4000000-0000-4000-8000-000000000002',
      'aaaaaaaa-0000-4000-8000-000000000001',
      'Proces z obcym assetem',
      'proces-z-obcym-assetem',
      test_support.image_flow_document(
        'b1000000-0000-4000-8000-000000000001',
        'a1000000-0000-4000-8000-000000000002'
      ),
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'flow accepted unavailable media asset';
  exception
    when foreign_key_violation then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.flows (
      id, organization_id, name, slug, draft, created_by, updated_by
    ) values (
      'f4000000-0000-4000-8000-000000000003',
      'aaaaaaaa-0000-4000-8000-000000000001',
      'Proces z niegotowym assetem',
      'proces-z-niegotowym-assetem',
      test_support.image_flow_document(
        'a1000000-0000-4000-8000-000000000003',
        'a1000000-0000-4000-8000-000000000002'
      ),
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'flow accepted pending media asset';
  exception
    when foreign_key_violation then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.flows (
      id, organization_id, name, slug, draft, created_by, updated_by
    ) values (
      'f4000000-0000-4000-8000-000000000004',
      'aaaaaaaa-0000-4000-8000-000000000001',
      'Proces z brakującym assetem',
      'proces-z-brakujacym-assetem',
      test_support.image_flow_document(
        'a1000000-0000-4000-8000-000000000099',
        'a1000000-0000-4000-8000-000000000002'
      ),
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001'
    );
    raise exception 'flow accepted absent media asset';
  exception
    when foreign_key_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if exists (
    select 1 from public.flow_media_assets
    where organization_id = 'aaaaaaaa-0000-4000-8000-000000000001'
  ) then
    raise exception 'tenant B can read tenant A media';
  end if;
end;
$$;

reset role;

do $$
declare
  public_flow_id uuid;
  resolved_count integer;
begin
  if not has_function_privilege(
    'service_role',
    'public.resolve_public_flow_asset(uuid, uuid)',
    'EXECUTE'
  ) then
    raise exception 'service role cannot resolve public flow asset';
  end if;
  select public_id into public_flow_id
  from public.published_flows
  where flow_id = 'f4000000-0000-4000-8000-000000000001';

  select count(*) into resolved_count
  from public.resolve_public_flow_asset(
    public_flow_id,
    'a1000000-0000-4000-8000-000000000001'
  );
  if resolved_count <> 1 then
    raise exception 'published asset did not resolve';
  end if;

  select count(*) into resolved_count
  from public.resolve_public_flow_asset(
    public_flow_id,
    'a1000000-0000-4000-8000-000000000099'
  );
  if resolved_count <> 0 then
    raise exception 'unreferenced asset resolved publicly';
  end if;
end;
$$;
select 'flow media checks passed' as result;
