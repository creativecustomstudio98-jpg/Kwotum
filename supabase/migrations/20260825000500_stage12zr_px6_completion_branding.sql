-- Stage 12ZR / PX6: versioned completion, typed contact preferences and safe branding.
--
-- Rollback: stop producing v3 leadCapture and hide branding controls. Keep the
-- columns and readers for immutable published versions and already stored leads.

alter table public.leads
  add column preferred_contact_channel text check (
    preferred_contact_channel is null or preferred_contact_channel in ('email', 'phone')
  ),
  add column preferred_contact_window text check (
    preferred_contact_window is null or preferred_contact_window in ('morning', 'afternoon', 'evening')
  );

alter table public.organizations
  add column brand_display_name text check (
    brand_display_name is null or char_length(trim(brand_display_name)) between 2 and 120
  ),
  add column brand_accent_color text check (
    brand_accent_color is null or brand_accent_color ~ '^#[0-9A-F]{6}$'
  ),
  add column brand_accent_text_color text check (
    brand_accent_text_color is null or brand_accent_text_color in ('#000000', '#FFFFFF')
  ),
  add column brand_logo_asset_id uuid,
  add constraint organization_brand_logo_tenant_fk foreign key (id, brand_logo_asset_id)
    references public.flow_media_assets (organization_id, id),
  add constraint organization_brand_pair_complete check (
    (brand_accent_color is null and brand_accent_text_color is null)
    or (brand_accent_color is not null and brand_accent_text_color is not null)
  );

create function app_private.brand_contrast_color(accent text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when (
      get_byte(decode(substr(accent, 2), 'hex'), 0) * 299
      + get_byte(decode(substr(accent, 2), 'hex'), 1) * 587
      + get_byte(decode(substr(accent, 2), 'hex'), 2) * 114
    ) >= 150000 then '#000000' else '#FFFFFF' end;
$$;

alter table public.organizations
  add constraint organization_brand_contrast_is_derived check (
    brand_accent_color is null
    or brand_accent_text_color = app_private.brand_contrast_color(brand_accent_color)
  );

create function public.set_organization_branding(
  target_organization_id uuid,
  target_display_name text,
  target_accent_color text,
  target_logo_asset_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_color text := upper(trim(target_accent_color));
  normalized_name text := nullif(trim(target_display_name), '');
begin
  if not app_private.has_role(
    target_organization_id,
    array['owner']::public.organization_member_role[]
  ) then raise exception 'organization not found' using errcode = 'no_data_found'; end if;
  if normalized_name is not null and char_length(normalized_name) not between 2 and 120 then
    raise exception 'invalid branding' using errcode = 'check_violation';
  end if;
  if normalized_color = '' then normalized_color := null; end if;
  if normalized_color is not null and normalized_color !~ '^#[0-9A-F]{6}$' then
    raise exception 'invalid branding' using errcode = 'check_violation';
  end if;
  if target_logo_asset_id is not null and not exists (
    select 1 from public.flow_media_assets asset
    where asset.organization_id = target_organization_id
      and asset.id = target_logo_asset_id and asset.status = 'ready'
  ) then raise exception 'branding asset not found' using errcode = 'no_data_found'; end if;

  update public.organizations organization set
    brand_display_name = normalized_name,
    brand_accent_color = normalized_color,
    brand_accent_text_color = case when normalized_color is null then null
      else app_private.brand_contrast_color(normalized_color) end,
    brand_logo_asset_id = target_logo_asset_id
  where organization.id = target_organization_id;

  insert into public.audit_logs (
    organization_id, actor_user_id, action, target_table, target_id, metadata
  ) values (
    target_organization_id, auth.uid(), 'organization.branding_updated',
    'organizations', target_organization_id,
    jsonb_build_object('accentConfigured', normalized_color is not null,
      'logoConfigured', target_logo_asset_id is not null)
  );
end;
$$;

alter function app_private.flow_validation_issues(jsonb)
rename to flow_stage12zq_validation_issues;

create function app_private.flow_validation_issues(snapshot jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select app_private.flow_stage12zq_validation_issues(snapshot)
    || case when app_private.lead_capture_configuration_is_valid(snapshot) then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'code','INVALID_LEAD_CAPTURE','path','leadCapture',
        'message','Konfiguracja pól kontaktowych jest nieprawidłowa.')) end
    || case when snapshot #>> '{result,resultSchemaVersion}' is null then '[]'::jsonb
      when snapshot #>> '{result,resultSchemaVersion}' = '2'
        and snapshot #>> '{result,action}' in ('capture_lead','no_lead')
        and not (
          snapshot #>> '{leadCapture,completionOrder}' = 'contact_then_result'
          and snapshot #>> '{result,action}' = 'no_lead'
        )
        and ((snapshot #> '{result,fallbackContactLabel}' is null
          and snapshot #> '{result,fallbackContactUrl}' is null)
          or (snapshot #>> '{result,action}' = 'no_lead'
            and char_length(trim(snapshot #>> '{result,fallbackContactLabel}')) between 1 and 120
            and snapshot #>> '{result,fallbackContactUrl}' ~ '^https://'))
      then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'code','INVALID_COMPLETION','path','result',
        'message','Konfiguracja zakończenia jest nieprawidłowa.')) end;
$$;

create or replace function app_private.lead_capture_configuration_is_valid(snapshot jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  capture jsonb := snapshot -> 'leadCapture';
  capture_version text;
  fields jsonb;
  marketing jsonb;
  privacy jsonb;
begin
  if capture is null then return true; end if;
  capture_version := capture ->> 'leadCaptureSchemaVersion';
  if jsonb_typeof(capture) <> 'object'
    or capture_version not in ('1', '2', '3')
    or jsonb_typeof(capture -> 'filesEnabled') <> 'boolean'
    or jsonb_typeof(capture -> 'privacyNotice') <> 'object'
    or (capture_version = '2' and capture ->> 'contactPolicy' not in ('email_required','phone_required'))
  then return false; end if;
  if capture_version = '3' then
    fields := capture -> 'fields';
    if capture ->> 'completionOrder' not in ('result_then_contact','contact_then_result')
      or jsonb_typeof(fields) <> 'object'
      or fields - array['email','name','phone','preferredContactChannel','preferredContactWindow']::text[] <> '{}'::jsonb
      or fields ->> 'email' <> 'required'
      or fields ->> 'name' not in ('hidden','optional','required')
      or fields ->> 'phone' not in ('hidden','optional','required')
      or fields ->> 'preferredContactChannel' not in ('hidden','optional','required')
      or fields ->> 'preferredContactWindow' not in ('hidden','optional','required')
      or (fields ->> 'preferredContactChannel' <> 'hidden' and fields ->> 'phone' = 'hidden')
    then return false; end if;
  end if;
  privacy := capture -> 'privacyNotice';
  if char_length(trim(coalesce(privacy ->> 'label',''))) not between 10 and 500
    or char_length(trim(coalesce(privacy ->> 'version',''))) not between 1 and 80
    or (privacy ->> 'textHash') !~ '^[a-f0-9]{64}$'
    or (privacy ? 'policyUrl' and (
      jsonb_typeof(privacy -> 'policyUrl') <> 'string'
      or char_length(privacy ->> 'policyUrl') > 500
      or privacy ->> 'policyUrl' !~ '^https://'))
  then return false; end if;
  if capture ? 'marketingEmailConsent' then
    marketing := capture -> 'marketingEmailConsent';
    if jsonb_typeof(marketing) <> 'object'
      or char_length(trim(coalesce(marketing ->> 'label',''))) not between 10 and 500
      or char_length(trim(coalesce(marketing ->> 'version',''))) not between 1 and 80
      or (marketing ->> 'textHash') !~ '^[a-f0-9]{64}$'
    then return false; end if;
  end if;
  return true;
exception when others then return false;
end;
$$;

alter function app_private.build_widget_manifest(jsonb, uuid, text, timestamptz)
rename to build_widget_manifest_stage12zq;

create function app_private.build_widget_manifest(
  snapshot jsonb, public_flow_id uuid, snapshot_digest text, publication_time timestamptz
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with base as (
    select app_private.build_widget_manifest_stage12zq(
      snapshot, public_flow_id, snapshot_digest, publication_time
    ) as manifest
  )
  select case when snapshot #>> '{leadCapture,leadCaptureSchemaVersion}' <> '3'
    then base.manifest
    else base.manifest || jsonb_build_object(
      'leadCapture', jsonb_build_object(
        'leadCaptureSchemaVersion', 3,
        'completionOrder', snapshot #>> '{leadCapture,completionOrder}',
        'fields', snapshot #> '{leadCapture,fields}',
        'filesEnabled', snapshot #> '{leadCapture,filesEnabled}',
        'privacyNotice', jsonb_build_object(
          'label', snapshot #>> '{leadCapture,privacyNotice,label}',
          'version', snapshot #>> '{leadCapture,privacyNotice,version}',
          'textHash', snapshot #>> '{leadCapture,privacyNotice,textHash}',
          'policyUrl', coalesce(snapshot #> '{leadCapture,privacyNotice,policyUrl}', 'null'::jsonb)
        ),
        'marketingEmailConsent', coalesce(snapshot #> '{leadCapture,marketingEmailConsent}', 'null'::jsonb)
      )
    ) end
    || case when snapshot #>> '{result,resultSchemaVersion}' = '2' then jsonb_build_object(
      'result', base.manifest -> 'result' || jsonb_strip_nulls(jsonb_build_object(
        'resultSchemaVersion', 2,
        'action', snapshot #>> '{result,action}',
        'fallbackContactLabel', snapshot #>> '{result,fallbackContactLabel}',
        'fallbackContactUrl', snapshot #>> '{result,fallbackContactUrl}'
      ))) else '{}'::jsonb end
  from base;
$$;

alter function app_private.widget_manifest_for_version(uuid, uuid)
rename to widget_manifest_for_version_stage12zq;

create function app_private.widget_manifest_for_version(target_version_id uuid, target_public_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select app_private.widget_manifest_for_version_stage12zq(target_version_id, target_public_id)
    || jsonb_build_object('branding', jsonb_build_object(
      'companyName', coalesce(organization.brand_display_name, organization.name),
      'accentColor', coalesce(organization.brand_accent_color, '#0B6048'),
      'accentTextColor', coalesce(organization.brand_accent_text_color, '#FFFFFF'),
      'logoUrl', case when organization.brand_logo_asset_id is null then null
        else '/api/v1/public/flows/' || target_public_id::text || '/brand-logo' end
    ))
  from public.flow_versions version
  join public.organizations organization on organization.id = version.organization_id
  where version.id = target_version_id;
$$;

create function public.resolve_public_brand_logo(target_public_flow_id uuid)
returns table (object_path text, mime_type text, size_bytes integer, sha256 text)
language sql
stable
security definer
set search_path = ''
as $$
  select asset.object_path, asset.mime_type, asset.size_bytes, asset.sha256
  from public.published_flows published
  join public.organizations organization
    on organization.id = published.organization_id and organization.deleted_at is null
  join public.flow_media_assets asset
    on asset.organization_id = organization.id
    and asset.id = organization.brand_logo_asset_id
    and asset.status = 'ready'
  join public.flow_versions version
    on version.id = published.flow_version_id and version.status = 'published'
  where published.public_id = target_public_flow_id;
$$;

create or replace function public.calculate_widget_result(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  answer_set jsonb;
  estimation_result jsonb;
  session_record public.widget_sessions%rowtype;
  snapshot_document jsonb;
  public_action text;
begin
  if session_token !~ '^[a-f0-9]{64}$' then
    raise exception 'session not found' using errcode = 'no_data_found';
  end if;
  select session.* into session_record from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256') for update;
  if not found then raise exception 'session not found' using errcode = 'no_data_found'; end if;
  if session_record.status <> 'active' or session_record.expires_at <= now() then
    raise exception 'session expired' using errcode = 'invalid_parameter_value';
  end if;
  if session_record.current_step_key is not null then
    raise exception 'session is incomplete' using errcode = 'check_violation';
  end if;
  select version.snapshot into snapshot_document from public.flow_versions version
  where version.id = session_record.flow_version_id;
  select coalesce(jsonb_object_agg(answer.step_key, answer.answer), '{}'::jsonb)
  into answer_set from public.session_answers answer where answer.session_id = session_record.id;
  estimation_result := app_private.calculate_estimation(snapshot_document, answer_set);
  public_action := case when snapshot_document #>> '{result,resultSchemaVersion}' = '2'
    then snapshot_document #>> '{result,action}' else 'capture_lead' end;
  update public.widget_sessions set last_seen_at = now() where id = session_record.id;
  return jsonb_build_object(
    'action', public_action,
    'headline', snapshot_document #>> '{result,headline}',
    'disclaimer', snapshot_document #>> '{result,disclaimer}',
    'nextStepLabel', snapshot_document #>> '{result,nextStepLabel}',
    'fallbackContactLabel', snapshot_document #>> '{result,fallbackContactLabel}',
    'fallbackContactUrl', snapshot_document #>> '{result,fallbackContactUrl}',
    'pricing', case when estimation_result is null or snapshot_document #>> '{result,mode}' = 'no_price'
      then null else (estimation_result -> 'pricing') - 'triggeredRules'::text end
  );
end;
$$;

alter function public.submit_widget_lead(text, uuid, jsonb, jsonb, jsonb, uuid[])
rename to submit_widget_lead_stage12zq;

create function public.submit_widget_lead(
  session_token text, mutation_id uuid, contact jsonb, privacy_notice jsonb,
  marketing_email_consent jsonb, file_ids uuid[]
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  capture jsonb;
  result jsonb;
  selected_channel text := contact ->> 'preferredContactChannel';
  selected_window text := contact ->> 'preferredContactWindow';
begin
  select version.snapshot -> 'leadCapture'
  into capture
  from public.widget_sessions session
  join public.flow_versions version on version.id = session.flow_version_id
  where session.token_hash = extensions.digest(session_token, 'sha256');
  if capture ->> 'leadCaptureSchemaVersion' = '3' and (
    (capture #>> '{fields,name}' = 'required' and nullif(trim(contact ->> 'name'),'') is null)
    or (capture #>> '{fields,phone}' = 'required' and nullif(trim(contact ->> 'phone'),'') is null)
    or (capture #>> '{fields,preferredContactChannel}' = 'required' and selected_channel is null)
    or (capture #>> '{fields,preferredContactWindow}' = 'required' and selected_window is null)
  ) then raise exception 'required contact field is missing' using errcode = 'check_violation'; end if;
  if exists (
    select 1
    from public.widget_sessions session
    join public.flow_versions version on version.id = session.flow_version_id
    where session.token_hash = extensions.digest(session_token, 'sha256')
      and version.snapshot #>> '{result,resultSchemaVersion}' = '2'
      and version.snapshot #>> '{result,action}' = 'no_lead'
  ) then raise exception 'lead capture disabled for outcome' using errcode = 'check_violation'; end if;
  if selected_channel is not null and selected_channel not in ('email','phone')
    or selected_window is not null and selected_window not in ('morning','afternoon','evening')
    or (selected_channel = 'email' and nullif(trim(contact ->> 'email'),'') is null)
    or (selected_channel = 'phone' and nullif(trim(contact ->> 'phone'),'') is null)
  then raise exception 'invalid contact preference' using errcode = 'check_violation'; end if;
  result := public.submit_widget_lead_stage12zq(
    session_token, mutation_id,
    contact - 'preferredContactChannel' - 'preferredContactWindow',
    privacy_notice, marketing_email_consent, file_ids
  );
  update public.leads lead set
    preferred_contact_channel = selected_channel,
    preferred_contact_window = selected_window
  where lead.public_id = (result ->> 'leadPublicId')::uuid;
  return result;
end;
$$;

alter function public.export_lead_personal_data(uuid, uuid)
rename to export_lead_personal_data_stage12zq;

create function public.export_lead_personal_data(target_organization_id uuid, target_lead_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select app_private_result.payload
    || jsonb_build_object('exportVersion', 2, 'lead',
      app_private_result.payload -> 'lead' || jsonb_build_object('contact',
        app_private_result.payload #> '{lead,contact}' || jsonb_build_object(
          'preferredChannel', lead.preferred_contact_channel,
          'preferredWindow', lead.preferred_contact_window
        )))
  from public.leads lead
  cross join lateral (
    select public.export_lead_personal_data_stage12zq(
      target_organization_id, target_lead_id
    ) as payload
  ) app_private_result
  where lead.organization_id = target_organization_id and lead.id = target_lead_id;
$$;

revoke all on function app_private.brand_contrast_color(text) from public;
grant execute on function app_private.brand_contrast_color(text) to authenticated, service_role;
revoke all on function app_private.flow_stage12zq_validation_issues(jsonb) from public;
revoke all on function app_private.flow_validation_issues(jsonb) from public;
revoke all on function app_private.build_widget_manifest_stage12zq(jsonb, uuid, text, timestamptz) from public;
revoke all on function app_private.widget_manifest_for_version_stage12zq(uuid, uuid) from public;
revoke all on function public.set_organization_branding(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.calculate_widget_result(text) from public, anon, authenticated;
revoke all on function public.resolve_public_brand_logo(uuid) from public, anon, authenticated;
revoke all on function public.submit_widget_lead_stage12zq(text, uuid, jsonb, jsonb, jsonb, uuid[]) from public, anon, authenticated;
revoke all on function public.submit_widget_lead(text, uuid, jsonb, jsonb, jsonb, uuid[]) from public, anon, authenticated;
revoke all on function public.export_lead_personal_data_stage12zq(uuid, uuid) from public, anon, authenticated;
revoke all on function public.export_lead_personal_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.set_organization_branding(uuid, text, text, uuid) to authenticated;
grant execute on function public.resolve_public_brand_logo(uuid) to service_role;
grant execute on function public.calculate_widget_result(text) to service_role;
grant execute on function public.submit_widget_lead(text, uuid, jsonb, jsonb, jsonb, uuid[]) to service_role;
grant execute on function public.export_lead_personal_data(uuid, uuid) to authenticated;
