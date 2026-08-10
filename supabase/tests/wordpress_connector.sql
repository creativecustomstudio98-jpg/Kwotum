\set ON_ERROR_STOP on

create temporary table wordpress_connector_control (
  credential text not null,
  install_token text not null,
  connection_id uuid,
  panel_connection_id uuid
);
grant select, insert, update on wordpress_connector_control to anon, authenticated;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  created jsonb;
begin
  created := public.create_wordpress_install_token(
    'aaaaaaaa-0000-4000-8000-000000000001',
    'https://wordpress-a.test/'
  );
  if created ->> 'siteOrigin' <> 'https://wordpress-a.test'
    or created ->> 'token' !~ '^[a-f0-9]{64}$'
    or (created ->> 'expiresAt')::timestamptz > now() + interval '10 minutes'
  then
    raise exception 'invalid wordpress install token response: %', created;
  end if;
  insert into wordpress_connector_control (credential, install_token)
  values ('', created ->> 'token');
  if exists (
    select 1
    from public.wordpress_install_tokens token
    where encode(token.token_hash, 'hex') = created ->> 'token'
  ) then
    raise exception 'wordpress install token was stored as plaintext';
  end if;
end;
$$;

reset role;
set role anon;

do $$
declare
  exchanged jsonb;
  token_value text;
begin
  select install_token into token_value from wordpress_connector_control;
  exchanged := public.exchange_wordpress_install_token(
    token_value,
    'https://wordpress-a.test',
    '1.0.0',
    '7.0.2',
    '8.5.2'
  );
  if exchanged ->> 'credential' !~ '^[a-f0-9]{64}$'
    or exchanged ->> 'organizationName' is null
  then
    raise exception 'invalid wordpress exchange response: %', exchanged;
  end if;
  update wordpress_connector_control
  set
    connection_id = (exchanged ->> 'connectionId')::uuid,
    credential = exchanged ->> 'credential';

  begin
    perform public.exchange_wordpress_install_token(
      token_value,
      'https://wordpress-a.test',
      '1.0.0',
      '7.0.2',
      '8.5.2'
    );
    raise exception 'one-time wordpress token was replayed';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

do $$
declare
  credential_value text;
  flow_list jsonb;
begin
  select credential into credential_value from wordpress_connector_control;
  flow_list := public.get_wordpress_flows(credential_value);
  if jsonb_array_length(flow_list -> 'flows') < 1
    or not exists (
      select 1
      from jsonb_array_elements(flow_list -> 'flows') flow
      where flow ->> 'publicId' = test_support.widget_public_id()::text
        and flow ? 'name'
        and flow ? 'version'
        and (select count(*) from jsonb_object_keys(flow)) = 3
    )
  then
    raise exception 'wordpress flow allowlist is incomplete: %', flow_list;
  end if;
  begin
    perform * from public.wordpress_connections;
    raise exception 'anon read wordpress connection table';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
begin
  begin
    perform public.create_wordpress_install_token(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'https://sales-cannot-connect.test'
    );
    raise exception 'Sales created wordpress token';
  exception
    when no_data_found then
      null;
  end;
  if (select count(*) from public.wordpress_connections) <> 0 then
    raise exception 'Sales read wordpress connections';
  end if;
  begin
    perform public.revoke_wordpress_connection(
      'aaaaaaaa-0000-4000-8000-000000000001',
      (select connection_id from wordpress_connector_control)
    );
    raise exception 'Sales revoked wordpress connection';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.wordpress_connections) <> 0 then
    raise exception 'Tenant B read Tenant A wordpress connection';
  end if;
end;
$$;

reset role;

do $$
declare
  created_connection_id uuid;
begin
  insert into public.wordpress_connections (
    organization_id,
    site_origin,
    credential_hash,
    plugin_version,
    wordpress_version,
    php_version
  )
  values (
    'aaaaaaaa-0000-4000-8000-000000000001',
    'https://lost-wordpress.test',
    extensions.digest(repeat('c', 64), 'sha256'),
    '1.0.0',
    '7.0.2',
    '8.5.2'
  )
  returning id into created_connection_id;
  update wordpress_connector_control
  set panel_connection_id = created_connection_id;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
begin
  if not public.revoke_wordpress_connection(
    'aaaaaaaa-0000-4000-8000-000000000001',
    (select panel_connection_id from wordpress_connector_control)
  ) then
    raise exception 'Owner panel revocation failed';
  end if;
end;
$$;

reset role;
set role anon;

do $$
declare
  credential_value text;
begin
  select credential into credential_value from wordpress_connector_control;
  if not public.disconnect_wordpress(credential_value) then
    raise exception 'wordpress disconnect failed';
  end if;
  begin
    perform public.get_wordpress_flows(credential_value);
    raise exception 'revoked wordpress credential remained active';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
begin
  if (select count(*) from public.wordpress_connections where revoked_at is not null) <> 2 then
    raise exception 'Owner cannot audit revoked wordpress connection';
  end if;
end;
$$;

reset role;
select 'wordpress connector checks passed' as result;
