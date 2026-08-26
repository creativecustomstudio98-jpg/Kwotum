\set ON_ERROR_STOP on

create function test_support.context_public_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select published.public_id from public.published_flows published
  where published.flow_id = 'f5000000-0000-4000-8000-000000000001';
$$;
create function test_support.context_snapshot(session_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select session.context_snapshot from public.widget_sessions session
  where session.token_hash = extensions.digest(session_token, 'sha256');
$$;
revoke all on function test_support.context_public_id() from public;
revoke all on function test_support.context_snapshot(text) from public;
grant execute on function test_support.context_public_id() to service_role;
grant execute on function test_support.context_snapshot(text) to service_role;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

insert into public.flows (id, organization_id, name, slug, draft, created_by, updated_by)
values (
  'f5000000-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Proces z kontekstem',
  'proces-z-kontekstem',
  test_support.valid_flow_document_v3() || jsonb_build_object(
    'contextSchema', jsonb_build_object(
      'schemaVersion', 1,
      'fields', jsonb_build_array(
        jsonb_build_object('key','model','label','Wybrany model','mode','confirm','required',true,'type','enum','allowedValues',jsonb_build_array('M2','M3')),
        jsonb_build_object('key','produkt','label','Produkt','mode','informational','required',true,'type','text'),
        jsonb_build_object('key','kampania','label','Kampania','mode','system','required',false,'type','text','systemValue','partnerzy-2026')
      )
    )
  ),
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
);

select public.publish_flow('f5000000-0000-4000-8000-000000000001', 1);
reset role;
set role service_role;

do $$
declare
  created jsonb;
  confirmed jsonb;
  public_id uuid;
  raw_token text;
  stored jsonb;
begin
  public_id := test_support.context_public_id();

  begin
    perform public.create_widget_session(public_id, '{"model":"M2","produkt":"klient@example.test"}'::jsonb, 'embedded', 'https://partner.test');
    raise exception 'PII-like context was accepted';
  exception when check_violation then null; end;

  begin
    perform public.create_widget_session(public_id, '{"model":"M2","produkt":"Fotel","price":"1"}'::jsonb, 'embedded', 'https://partner.test');
    raise exception 'unknown pricing context was accepted';
  exception when check_violation then null; end;

  begin
    perform public.create_widget_session(public_id, '{"model":2,"produkt":"Fotel"}'::jsonb, 'embedded', 'https://partner.test');
    raise exception 'non-string context was accepted';
  exception when check_violation then null; end;

  created := public.create_widget_session(
    public_id,
    '{"model":"M2","produkt":"Fotel modułowy"}'::jsonb,
    'embedded',
    'https://partner.test'
  );
  raw_token := created ->> 'token';
  if (created ->> 'contextConfirmed')::boolean
    or jsonb_array_length(created -> 'context') <> 2
    or created #> '{context,0,allowedValues}' <> '["M2","M3"]'::jsonb
    or created -> 'context' @> '[{"key":"kampania"}]'::jsonb
  then raise exception 'public pending context is invalid: %', created; end if;

  begin
    perform public.save_widget_answer(raw_token, gen_random_uuid(), 0, 'service', '"standard"'::jsonb, 'details');
    raise exception 'answer was accepted before context confirmation';
  exception when check_violation then null; end;

  confirmed := public.confirm_widget_context(
    raw_token,
    '95000000-0000-4000-8000-000000000001',
    '{"model":"M3"}'::jsonb
  );
  if confirmed #>> '{context,0,value}' <> 'M3' then
    raise exception 'confirmed value was not stored: %', confirmed;
  end if;
  if public.confirm_widget_context(raw_token, '95000000-0000-4000-8000-000000000001', '{"model":"M3"}'::jsonb) <> confirmed then
    raise exception 'same mutation is not idempotent';
  end if;
  begin
    perform public.confirm_widget_context(raw_token, gen_random_uuid(), '{"model":"M2"}'::jsonb);
    raise exception 'confirmed context was mutable';
  exception when check_violation then null; end;

  stored := test_support.context_snapshot(raw_token);
  if stored #>> '{source,origin}' <> 'https://partner.test'
    or not (stored -> 'values' @> '[{"key":"kampania","value":"partnerzy-2026"}]'::jsonb)
  then raise exception 'canonical context snapshot is incomplete: %', stored; end if;

  perform public.save_widget_answer(raw_token, gen_random_uuid(), 0, 'service', '"standard"'::jsonb, 'details');

  created := public.create_widget_session(public_id, '{"model":"M2","produkt":"Fotel"}'::jsonb, 'embedded', 'https://partner.test');
  perform test_support.expire_widget_session(created ->> 'token');
  begin
    perform public.confirm_widget_context(created ->> 'token', gen_random_uuid(), '{"model":"M2"}'::jsonb);
    raise exception 'expired context was confirmed';
  exception when invalid_parameter_value then null; end;
end;
$$;

reset role;
select 'flow context checks passed' as result;
