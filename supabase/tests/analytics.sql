\set ON_ERROR_STOP on

create temporary table analytics_control_sessions (
  session_number integer primary key,
  token text not null
);
grant select, insert on analytics_control_sessions to anon;

set role anon;

do $$
declare
  created jsonb;
  session_number integer;
  session_token text;
begin
  for session_number in 1..5 loop
    created := public.create_widget_session(test_support.widget_public_id());
    session_token := created ->> 'token';
    insert into analytics_control_sessions values (session_number, session_token);

    perform public.record_analytics_consent(
      session_token,
      ('91000000-0000-4000-8000-' || lpad(session_number::text, 12, '0'))::uuid,
      'analytics-v1',
      true
    );
    perform public.record_widget_event(
      session_token,
      ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 1)::text, 12, '0'))::uuid,
      1::smallint,
      'widget_loaded',
      now(),
      null,
      'direct',
      'mobile'
    );
    perform public.record_widget_event(
      session_token,
      ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 2)::text, 12, '0'))::uuid,
      1::smallint,
      'flow_started',
      now(),
      null,
      'direct',
      'mobile'
    );
    perform public.record_widget_event(
      session_token,
      ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 3)::text, 12, '0'))::uuid,
      1::smallint,
      'step_viewed',
      now(),
      'service',
      'direct',
      'mobile'
    );
    if session_number <= 4 then
      perform public.record_widget_event(
        session_token,
        ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 4)::text, 12, '0'))::uuid,
        1::smallint,
        'step_answered',
        now(),
        'service',
        'direct',
        'mobile'
      );
    end if;
    if session_number <= 3 then
      perform public.record_widget_event(
        session_token,
        ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 5)::text, 12, '0'))::uuid,
        1::smallint,
        'result_viewed',
        now(),
        null,
        'direct',
        'mobile'
      );
    end if;
    if session_number <= 2 then
      perform public.record_widget_event(
        session_token,
        ('92000000-0000-4000-8000-' || lpad((session_number * 10 + 6)::text, 12, '0'))::uuid,
        1::smallint,
        'lead_submitted',
        now(),
        null,
        'direct',
        'mobile'
      );
    end if;
  end loop;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);

do $$
declare
  overview jsonb;
begin
  if (select count(*) from public.session_events) <> 0 then
    raise exception 'Sales can read raw analytics events';
  end if;
  overview := public.get_analytics_overview(
    'aaaaaaaa-0000-4000-8000-000000000001',
    now() - interval '1 day',
    now() + interval '1 minute'
  );
  if (overview ->> 'insufficientData')::boolean
    or (overview #>> '{totals,sessions}')::integer <> 5
    or (overview #>> '{totals,starts}')::integer <> 5
    or (overview #>> '{totals,results}')::integer <> 3
    or (overview #>> '{totals,leads}')::integer <> 2
    or (overview #>> '{totals,startRateBasisPoints}')::integer <> 10000
    or (overview #>> '{totals,completionRateBasisPoints}')::integer <> 6000
    or (overview #>> '{totals,leadRateBasisPoints}')::integer <> 4000
    or (overview #>> '{dropOff,0,viewed}')::integer <> 5
    or (overview #>> '{dropOff,0,answered}')::integer <> 4
    or (overview #>> '{dropOff,0,dropRateBasisPoints}')::integer <> 2000
    or (overview #>> '{sources,0,key}') <> 'direct'
    or (overview #>> '{devices,0,key}') <> 'mobile'
  then
    raise exception 'analytics overview disagrees with controlled sessions: %', overview;
  end if;
  begin
    perform public.purge_expired_analytics(100);
    raise exception 'authenticated user ran analytics retention job';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', false);

do $$
begin
  begin
    perform public.get_analytics_overview(
      'aaaaaaaa-0000-4000-8000-000000000001',
      now() - interval '1 day',
      now()
    );
    raise exception 'Tenant B read Tenant A analytics';
  exception
    when no_data_found then
      null;
  end;
end;
$$;

reset role;
set role anon;

do $$
declare
  first_token text;
  overview jsonb;
begin
  select token into first_token
  from analytics_control_sessions
  where session_number = 1;
  perform public.record_analytics_consent(
    first_token,
    '93000000-0000-4000-8000-000000000001',
    'analytics-v1',
    false
  );
  begin
    perform public.record_widget_event(
      first_token,
      '94000000-0000-4000-8000-000000000001',
      1::smallint,
      'widget_loaded',
      now(),
      null,
      'direct',
      'mobile'
    );
    raise exception 'event accepted after analytics consent withdrawal';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);

do $$
declare
  overview jsonb;
begin
  if (select count(*) from public.session_events) <> 18 then
    raise exception 'consent withdrawal did not remove one session events';
  end if;
  overview := public.get_analytics_overview(
    'aaaaaaaa-0000-4000-8000-000000000001',
    now() - interval '1 day',
    now() + interval '1 minute'
  );
  if not (overview ->> 'insufficientData')::boolean
    or jsonb_array_length(overview -> 'sources') <> 0
    or jsonb_array_length(overview -> 'dropOff') <> 0
  then
    raise exception 'small sample threshold was not enforced: %', overview;
  end if;
end;
$$;

reset role;
set role service_role;

do $$
begin
  if public.purge_expired_analytics(100) <> 0 then
    raise exception 'retention removed non-expired analytics';
  end if;
end;
$$;

reset role;
select 'analytics checks passed' as result;
