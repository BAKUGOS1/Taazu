-- Taazu lives inside Phere's Supabase project. This migration touches ONLY taazu_* objects:
--  1. labels every Taazu table / function so anyone (or any AI agent) working on Phere
--     can see they belong to a separate app and must be left alone;
--  2. fixes the Taazu performance-advisor warnings (auth.uid() per row, unindexed FKs);
--  3. brings the collection check in line with what is live ('cfg' was added by hand).

-- ---------- 1. ownership labels ----------
do $$
declare
  note text := 'TAAZU APP — separate project (repo BAKUGOS1/Taazu, taazu.vercel.app). NOT part of Phere. Do not alter, drop, rename or reuse from Phere work. ';
  t record;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'taazu\_%' loop
    execute format('comment on table public.%I is %L', t.relname, note ||
      case t.relname
        when 'taazu_workspaces' then 'Teams (one per business).'
        when 'taazu_members'    then 'Who is in which Taazu team.'
        when 'taazu_records'    then 'All Taazu app data (suppliers, buyers, tasks, logs…) as JSON rows.'
        when 'taazu_usernames'  then 'Taazu sign-in usernames.'
        else '' end);
  end loop;
  for t in select p.oid::regprocedure::text as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'taazu\_%' loop
    execute format('comment on function %s is %L', t.sig, note);
  end loop;
end $$;

-- ---------- 2a. RLS: evaluate auth.uid() once per query, not once per row ----------
drop policy if exists taazu_ws_select on public.taazu_workspaces;
create policy taazu_ws_select on public.taazu_workspaces for select
  using (public.taazu_is_member(id) or created_by = (select auth.uid()));
drop policy if exists taazu_ws_insert on public.taazu_workspaces;
create policy taazu_ws_insert on public.taazu_workspaces for insert
  with check (created_by = (select auth.uid()));

drop policy if exists taazu_members_update_self on public.taazu_members;
create policy taazu_members_update_self on public.taazu_members for update
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists taazu_members_delete on public.taazu_members;
create policy taazu_members_delete on public.taazu_members for delete
  using (user_id = (select auth.uid()) or public.taazu_is_owner(workspace_id));

drop policy if exists taazu_usernames_own on public.taazu_usernames;
create policy taazu_usernames_own on public.taazu_usernames for select
  using (user_id = (select auth.uid()));

-- ---------- 2b. index the foreign keys ----------
create index if not exists taazu_records_updated_by_idx on public.taazu_records(updated_by);
create index if not exists taazu_workspaces_created_by_idx on public.taazu_workspaces(created_by);

-- ---------- 3. collections the app syncs ----------
alter table public.taazu_records drop constraint if exists taazu_records_collection_check;
alter table public.taazu_records add constraint taazu_records_collection_check
  check (collection in ('sup', 'buy', 'tasks', 'bud', 'sales', 'surv', 'logs', 'cfg'));
