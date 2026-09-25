-- Taazu HQ: team workspace + realtime record sync.
-- Lives in Phere's Supabase project, so every object is prefixed `taazu_`
-- and nothing here reads or alters Phere tables.

create extension if not exists pgcrypto;

-- ---------- workspaces & members ----------
create table if not exists public.taazu_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Taazu',
  join_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.taazu_members (
  workspace_id uuid not null references public.taazu_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists taazu_members_user_idx on public.taazu_members(user_id);

-- Membership check used by every policy. SECURITY DEFINER so the policy on
-- taazu_members can call it without recursing into itself.
create or replace function public.taazu_is_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.taazu_members m where m.workspace_id = ws and m.user_id = auth.uid());
$$;

create or replace function public.taazu_is_owner(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.taazu_members m where m.workspace_id = ws and m.user_id = auth.uid() and m.role = 'owner');
$$;

-- ---------- records: one row per app record, last write wins per row ----------
create table if not exists public.taazu_records (
  workspace_id uuid not null references public.taazu_workspaces(id) on delete cascade,
  collection text not null check (collection in ('sup', 'buy', 'tasks', 'bud', 'sales', 'surv', 'logs')),
  id text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  primary key (workspace_id, collection, id)
);
create index if not exists taazu_records_ws_updated_idx on public.taazu_records(workspace_id, updated_at);

create or replace function public.taazu_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists taazu_records_touch on public.taazu_records;
create trigger taazu_records_touch before insert or update on public.taazu_records
  for each row execute function public.taazu_touch();

-- ---------- RLS ----------
alter table public.taazu_workspaces enable row level security;
alter table public.taazu_members enable row level security;
alter table public.taazu_records enable row level security;

drop policy if exists taazu_ws_select on public.taazu_workspaces;
create policy taazu_ws_select on public.taazu_workspaces for select using (public.taazu_is_member(id) or created_by = auth.uid());
drop policy if exists taazu_ws_insert on public.taazu_workspaces;
create policy taazu_ws_insert on public.taazu_workspaces for insert with check (created_by = auth.uid());
drop policy if exists taazu_ws_update on public.taazu_workspaces;
create policy taazu_ws_update on public.taazu_workspaces for update using (public.taazu_is_owner(id));

drop policy if exists taazu_members_select on public.taazu_members;
create policy taazu_members_select on public.taazu_members for select using (public.taazu_is_member(workspace_id));
drop policy if exists taazu_members_update_self on public.taazu_members;
create policy taazu_members_update_self on public.taazu_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists taazu_members_delete on public.taazu_members;
create policy taazu_members_delete on public.taazu_members for delete using (user_id = auth.uid() or public.taazu_is_owner(workspace_id));

drop policy if exists taazu_records_all on public.taazu_records;
create policy taazu_records_all on public.taazu_records for all
  using (public.taazu_is_member(workspace_id)) with check (public.taazu_is_member(workspace_id));

-- ---------- RPCs ----------
-- Create a workspace and make the caller its owner in one step.
create or replace function public.taazu_create_workspace(ws_name text, my_name text)
returns public.taazu_workspaces language plpgsql security definer set search_path = public as $$
declare w public.taazu_workspaces;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.taazu_workspaces(name, created_by) values (coalesce(nullif(trim(ws_name), ''), 'Taazu'), auth.uid()) returning * into w;
  insert into public.taazu_members(workspace_id, user_id, display_name, role) values (w.id, auth.uid(), coalesce(my_name, ''), 'owner');
  return w;
end $$;

-- Join with the 8-character code the owner shares.
create or replace function public.taazu_join_workspace(code text, my_name text)
returns public.taazu_workspaces language plpgsql security definer set search_path = public as $$
declare w public.taazu_workspaces;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into w from public.taazu_workspaces where join_code = upper(trim(code));
  if w.id is null then raise exception 'invalid code'; end if;
  insert into public.taazu_members(workspace_id, user_id, display_name) values (w.id, auth.uid(), coalesce(my_name, ''))
    on conflict (workspace_id, user_id) do update set display_name = excluded.display_name;
  return w;
end $$;

revoke all on function public.taazu_create_workspace(text, text) from public, anon;
revoke all on function public.taazu_join_workspace(text, text) from public, anon;
grant execute on function public.taazu_create_workspace(text, text) to authenticated;
grant execute on function public.taazu_join_workspace(text, text) to authenticated;

-- ---------- realtime ----------
do $$ begin
  alter publication supabase_realtime add table public.taazu_records;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.taazu_members;
exception when duplicate_object then null; end $$;

-- helpers are only for RLS; signed-out users never need them
revoke all on function public.taazu_is_member(uuid) from public, anon;
revoke all on function public.taazu_is_owner(uuid) from public, anon;
grant execute on function public.taazu_is_member(uuid) to authenticated;
grant execute on function public.taazu_is_owner(uuid) to authenticated;
