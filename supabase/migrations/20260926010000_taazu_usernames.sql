-- Usernames for Taazu HQ: any account (email, Google or username sign-up)
-- can claim one and then sign in with it. Resolution to the real email
-- happens server-side in the taazu-login function, so emails never leak.

create table if not exists public.taazu_usernames (
  username text primary key check (username ~ '^[a-z0-9][a-z0-9._]{2,19}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.taazu_usernames enable row level security;

drop policy if exists taazu_usernames_own on public.taazu_usernames;
create policy taazu_usernames_own on public.taazu_usernames for select using (user_id = auth.uid());

-- Claim or change your username. Also blocks names already used by
-- username sign-ups (<name>@taazu.app accounts).
create or replace function public.taazu_set_username(new_username text)
returns text language plpgsql security definer set search_path = public as $$
declare v text := lower(trim(new_username));
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if v !~ '^[a-z0-9][a-z0-9._]{2,19}$' then raise exception 'invalid username'; end if;
  if exists (select 1 from public.taazu_usernames where username = v and user_id <> auth.uid())
     or exists (select 1 from auth.users where lower(email) = v || '@taazu.app' and id <> auth.uid()) then
    raise exception 'username taken';
  end if;
  insert into public.taazu_usernames(username, user_id) values (v, auth.uid())
    on conflict (user_id) do update set username = excluded.username;
  return v;
end $$;

revoke all on function public.taazu_set_username(text) from public, anon;
grant execute on function public.taazu_set_username(text) to authenticated;
