-- Stage 12V: optimistic concurrency covers the complete editable flow aggregate.

create or replace function app_private.prepare_flow_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.organization_id <> old.organization_id
    or new.created_by <> old.created_by
  then
    raise exception 'flow ownership is immutable'
      using errcode = 'check_violation';
  end if;

  if new.draft is distinct from old.draft
    or new.name is distinct from old.name
  then
    new.draft_revision := old.draft_revision + 1;
  elsif new.draft_revision <> old.draft_revision then
    raise exception 'draft revision is managed by the database'
      using errcode = 'check_violation';
  end if;

  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function app_private.prepare_flow_update() from public, anon, authenticated;
