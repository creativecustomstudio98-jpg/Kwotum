set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

select public.set_organization_branding(
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Studio Forma',
  '#F4D35E',
  null
);

reset role;

do $$
declare
  organization_record public.organizations%rowtype;
  legacy_manifest jsonb;
  upgraded_manifest jsonb;
  snapshot jsonb;
begin
  select * into organization_record from public.organizations
  where id = 'aaaaaaaa-0000-4000-8000-000000000001';
  if organization_record.brand_display_name <> 'Studio Forma'
    or organization_record.brand_accent_color <> '#F4D35E'
    or organization_record.brand_accent_text_color <> '#000000'
  then raise exception 'derived branding contrast was not stored'; end if;

  begin
    update public.organizations set
      brand_accent_color = '#F4D35E', brand_accent_text_color = '#FFFFFF'
    where id = organization_record.id;
    raise exception 'invalid derived contrast was accepted';
  exception when check_violation then null; end;

  select version.snapshot into snapshot from public.flow_versions version
  where version.organization_id = organization_record.id
    and version.snapshot #>> '{leadCapture,leadCaptureSchemaVersion}' in ('1','2')
  order by version.published_at limit 1;
  legacy_manifest := app_private.build_widget_manifest(
    snapshot, gen_random_uuid(), repeat('a', 64), now()
  );
  if legacy_manifest #>> '{leadCapture,completionOrder}' is not null then
    raise exception 'historical manifest changed its completion ordering';
  end if;

  snapshot := jsonb_set(snapshot, '{leadCapture}', jsonb_build_object(
    'leadCaptureSchemaVersion', 3,
    'completionOrder', 'contact_then_result',
    'fields', jsonb_build_object(
      'name','optional','email','required','phone','optional',
      'preferredContactChannel','optional','preferredContactWindow','optional'
    ),
    'filesEnabled', false,
    'privacyNotice', jsonb_build_object(
      'label','Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.',
      'version','privacy-v1','textHash',repeat('b',64)
    )
  ));
  upgraded_manifest := app_private.build_widget_manifest(
    snapshot, gen_random_uuid(), repeat('c', 64), now()
  );
  if upgraded_manifest #>> '{leadCapture,completionOrder}' <> 'contact_then_result'
    or upgraded_manifest #>> '{leadCapture,fields,email}' <> 'required'
  then raise exception 'v3 completion projection is incomplete'; end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', false);
do $$
begin
  begin
    perform public.set_organization_branding(
      'aaaaaaaa-0000-4000-8000-000000000001', 'Próba', '#000000', null
    );
    raise exception 'sales role changed organization branding';
  exception when no_data_found then null; end;
end;
$$;

reset role;
select 'completion and branding checks passed' as result;
