-- Brand → Docs: a private file store for each Taazu team.
-- Files live in the storage bucket "taazu-docs" under "<workspace_id>/<folders…>/<file>".
-- Only members of that workspace can list, read, upload or delete them.
-- Touches only the taazu-docs bucket and taazu_* policies; nothing of Phere.

insert into storage.buckets (id, name, public, file_size_limit)
values ('taazu-docs', 'taazu-docs', false, 52428800)  -- 50 MB per file
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- First path segment must be a workspace the user belongs to (non-uuid paths never match).
create or replace function public.taazu_doc_ws(path text)
returns uuid language sql immutable set search_path = public as $$
  select nullif(substring((storage.foldername(path))[1] from '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'), '')::uuid;
$$;
comment on function public.taazu_doc_ws(text) is 'TAAZU APP — separate project (repo BAKUGOS1/Taazu). NOT part of Phere. Workspace id from a taazu-docs storage path.';

drop policy if exists taazu_docs_select on storage.objects;
create policy taazu_docs_select on storage.objects for select to authenticated
  using (bucket_id = 'taazu-docs' and public.taazu_is_member(public.taazu_doc_ws(name)));

drop policy if exists taazu_docs_insert on storage.objects;
create policy taazu_docs_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'taazu-docs' and public.taazu_is_member(public.taazu_doc_ws(name)));

drop policy if exists taazu_docs_update on storage.objects;
create policy taazu_docs_update on storage.objects for update to authenticated
  using (bucket_id = 'taazu-docs' and public.taazu_is_member(public.taazu_doc_ws(name)))
  with check (bucket_id = 'taazu-docs' and public.taazu_is_member(public.taazu_doc_ws(name)));

drop policy if exists taazu_docs_delete on storage.objects;
create policy taazu_docs_delete on storage.objects for delete to authenticated
  using (bucket_id = 'taazu-docs' and public.taazu_is_member(public.taazu_doc_ws(name)));
