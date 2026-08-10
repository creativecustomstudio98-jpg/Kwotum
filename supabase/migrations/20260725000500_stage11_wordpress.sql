create table public.wordpress_install_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token_hash bytea not null unique,
  site_origin text not null check (
    site_origin ~ '^https://[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$'
    and char_length(site_origin) between 12 and 255
  ),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  used_at timestamptz,
  constraint wordpress_install_token_lifetime check (
    expires_at > created_at and expires_at <= created_at + interval '10 minutes'
  )
);

create index wordpress_install_tokens_active_idx
  on public.wordpress_install_tokens (organization_id, expires_at)
  where used_at is null;

create table public.wordpress_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  site_origin text not null check (
    site_origin ~ '^https://[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$'
    and char_length(site_origin) between 12 and 255
  ),
  credential_hash bytea not null unique,
  plugin_version text not null check (plugin_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  wordpress_version text not null check (wordpress_version ~ '^[0-9]+\.[0-9]+(?:\.[0-9]+)?$'),
  php_version text not null check (php_version ~ '^[0-9]+\.[0-9]+(?:\.[0-9]+)?$'),
  connected_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (organization_id, site_origin, id)
);

create unique index wordpress_connections_active_site_idx
  on public.wordpress_connections (organization_id, site_origin)
  where revoked_at is null;

create function public.create_wordpress_install_token(
  target_organization_id uuid,
  target_site_origin text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_origin text;
  plain_token text;
  token_record public.wordpress_install_tokens%rowtype;
begin
  normalized_origin := lower(trim(trailing '/' from target_site_origin));
  if normalized_origin !~ '^https://[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$'
    or char_length(normalized_origin) not between 12 and 255
  then
    raise exception 'invalid wordpress site origin'
      using errcode = 'invalid_parameter_value';
  end if;
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'organization not found' using errcode = 'no_data_found';
  end if;
  if (
    select count(*)
    from public.wordpress_install_tokens token
    where token.organization_id = target_organization_id
      and token.created_by = auth.uid()
      and token.used_at is null
      and token.expires_at > now()
  ) >= 5 then
    raise exception 'wordpress token rate limit exceeded'
      using errcode = 'program_limit_exceeded';
  end if;

  plain_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.wordpress_install_tokens (
    organization_id,
    token_hash,
    site_origin,
    created_by
  )
  values (
    target_organization_id,
    extensions.digest(plain_token, 'sha256'),
    normalized_origin,
    auth.uid()
  )
  returning * into token_record;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    target_organization_id,
    auth.uid(),
    'wordpress.install_token.created',
    'wordpress_install_tokens',
    token_record.id,
    jsonb_build_object('site_origin', normalized_origin, 'expires_at', token_record.expires_at)
  );

  return jsonb_build_object(
    'token', plain_token,
    'siteOrigin', normalized_origin,
    'expiresAt', token_record.expires_at
  );
end;
$$;

create function public.exchange_wordpress_install_token(
  install_token text,
  target_site_origin text,
  target_plugin_version text,
  target_wordpress_version text,
  target_php_version text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_origin text;
  plain_credential text;
  token_record public.wordpress_install_tokens%rowtype;
  connection_record public.wordpress_connections%rowtype;
  organization_name text;
begin
  normalized_origin := lower(trim(trailing '/' from target_site_origin));
  if install_token !~ '^[a-f0-9]{64}$'
    or normalized_origin !~ '^https://[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$'
    or target_plugin_version !~ '^[0-9]+\.[0-9]+\.[0-9]+$'
    or target_wordpress_version !~ '^[0-9]+\.[0-9]+(?:\.[0-9]+)?$'
    or target_php_version !~ '^[0-9]+\.[0-9]+(?:\.[0-9]+)?$'
  then
    raise exception 'invalid wordpress connection request'
      using errcode = 'invalid_parameter_value';
  end if;

  select token.*
  into token_record
  from public.wordpress_install_tokens token
  join public.organizations organization on organization.id = token.organization_id
  where token.token_hash = extensions.digest(install_token, 'sha256')
    and token.site_origin = normalized_origin
    and token.used_at is null
    and token.expires_at > now()
    and organization.deleted_at is null
  for update of token;
  if not found then
    raise exception 'wordpress install token not found' using errcode = 'no_data_found';
  end if;

  update public.wordpress_connections
  set revoked_at = now()
  where organization_id = token_record.organization_id
    and site_origin = normalized_origin
    and revoked_at is null;

  plain_credential := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.wordpress_connections (
    organization_id,
    site_origin,
    credential_hash,
    plugin_version,
    wordpress_version,
    php_version
  )
  values (
    token_record.organization_id,
    normalized_origin,
    extensions.digest(plain_credential, 'sha256'),
    target_plugin_version,
    target_wordpress_version,
    target_php_version
  )
  returning * into connection_record;

  update public.wordpress_install_tokens
  set used_at = now()
  where id = token_record.id;

  select organization.name into organization_name
  from public.organizations organization
  where organization.id = token_record.organization_id;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    token_record.organization_id,
    token_record.created_by,
    'wordpress.connection.created',
    'wordpress_connections',
    connection_record.id,
    jsonb_build_object('site_origin', normalized_origin)
  );

  return jsonb_build_object(
    'credential', plain_credential,
    'connectionId', connection_record.id,
    'organizationName', organization_name,
    'siteOrigin', normalized_origin
  );
end;
$$;

create function public.get_wordpress_flows(connector_credential text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  connection_record public.wordpress_connections%rowtype;
  flow_list jsonb;
begin
  if connector_credential !~ '^[a-f0-9]{64}$' then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;
  select connection.*
  into connection_record
  from public.wordpress_connections connection
  join public.organizations organization on organization.id = connection.organization_id
  where connection.credential_hash = extensions.digest(connector_credential, 'sha256')
    and connection.revoked_at is null
    and organization.deleted_at is null
  for update of connection;
  if not found then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;

  update public.wordpress_connections
  set last_seen_at = now()
  where id = connection_record.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'publicId', published.public_id,
        'name', flow.name,
        'version', version.version_number
      )
      order by lower(flow.name), published.public_id
    ),
    '[]'::jsonb
  )
  into flow_list
  from public.published_flows published
  join public.flows flow on flow.id = published.flow_id
  join public.flow_versions version on version.id = published.flow_version_id
  where published.organization_id = connection_record.organization_id
    and version.status = 'published';

  return jsonb_build_object('flows', flow_list);
end;
$$;

create function public.get_wordpress_diagnostics(connector_credential text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  connection_record public.wordpress_connections%rowtype;
  organization_name text;
begin
  if connector_credential !~ '^[a-f0-9]{64}$' then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;
  select connection.*
  into connection_record
  from public.wordpress_connections connection
  join public.organizations organization on organization.id = connection.organization_id
  where connection.credential_hash = extensions.digest(connector_credential, 'sha256')
    and connection.revoked_at is null
    and organization.deleted_at is null
  for update of connection;
  if not found then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;
  select organization.name
  into organization_name
  from public.organizations organization
  where organization.id = connection_record.organization_id;
  update public.wordpress_connections
  set last_seen_at = now()
  where id = connection_record.id;
  return jsonb_build_object(
    'connected', true,
    'organizationName', organization_name,
    'siteOrigin', connection_record.site_origin,
    'serverTime', now()
  );
end;
$$;

create function public.disconnect_wordpress(connector_credential text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  connection_record public.wordpress_connections%rowtype;
begin
  if connector_credential !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  select connection.*
  into connection_record
  from public.wordpress_connections connection
  where connection.credential_hash = extensions.digest(connector_credential, 'sha256')
    and connection.revoked_at is null
  for update;
  if not found then
    return false;
  end if;
  update public.wordpress_connections
  set revoked_at = now(), last_seen_at = now()
  where id = connection_record.id;
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    connection_record.organization_id,
    null,
    'wordpress.connection.disconnected',
    'wordpress_connections',
    connection_record.id,
    jsonb_build_object('site_origin', connection_record.site_origin)
  );
  return true;
end;
$$;

create function public.revoke_wordpress_connection(
  target_organization_id uuid,
  target_connection_id uuid
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  connection_record public.wordpress_connections%rowtype;
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  ) then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;
  select connection.*
  into connection_record
  from public.wordpress_connections connection
  where connection.organization_id = target_organization_id
    and connection.id = target_connection_id
    and connection.revoked_at is null
  for update;
  if not found then
    raise exception 'wordpress connection not found' using errcode = 'no_data_found';
  end if;
  update public.wordpress_connections
  set revoked_at = now()
  where id = connection_record.id;
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    target_table,
    target_id,
    metadata
  )
  values (
    connection_record.organization_id,
    auth.uid(),
    'wordpress.connection.revoked',
    'wordpress_connections',
    connection_record.id,
    jsonb_build_object('site_origin', connection_record.site_origin)
  );
  return true;
end;
$$;

alter table public.wordpress_install_tokens enable row level security;
alter table public.wordpress_install_tokens force row level security;
alter table public.wordpress_connections enable row level security;
alter table public.wordpress_connections force row level security;

create policy wordpress_install_tokens_owner_admin_select
on public.wordpress_install_tokens for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy wordpress_connections_owner_admin_select
on public.wordpress_connections for select to authenticated
using (
  app_private.has_role(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

revoke all on table public.wordpress_install_tokens from public, anon, authenticated;
revoke all on table public.wordpress_connections from public, anon, authenticated;
grant select on public.wordpress_install_tokens to authenticated;
grant select on public.wordpress_connections to authenticated;

revoke all on function public.create_wordpress_install_token(uuid, text) from public;
revoke all on function public.exchange_wordpress_install_token(text, text, text, text, text)
  from public;
revoke all on function public.get_wordpress_flows(text) from public;
revoke all on function public.get_wordpress_diagnostics(text) from public;
revoke all on function public.disconnect_wordpress(text) from public;
revoke all on function public.revoke_wordpress_connection(uuid, uuid) from public;

grant execute on function public.create_wordpress_install_token(uuid, text) to authenticated;
grant execute on function public.exchange_wordpress_install_token(text, text, text, text, text)
  to anon;
grant execute on function public.get_wordpress_flows(text) to anon;
grant execute on function public.get_wordpress_diagnostics(text) to anon;
grant execute on function public.disconnect_wordpress(text) to anon;
grant execute on function public.revoke_wordpress_connection(uuid, uuid) to authenticated;
