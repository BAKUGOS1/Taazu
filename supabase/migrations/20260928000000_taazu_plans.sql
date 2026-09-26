-- Plans module: plan cards sync as their own collection.
-- Only widens the allowed collection names; no data changes.
alter table public.taazu_records drop constraint if exists taazu_records_collection_check;
alter table public.taazu_records add constraint taazu_records_collection_check
  check (collection in ('sup', 'buy', 'tasks', 'bud', 'sales', 'surv', 'logs', 'cfg', 'plans'));
