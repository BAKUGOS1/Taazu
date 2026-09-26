/*
 * The pure half of useSync: what to upload, how to rebuild from the server and
 * how to fold in a partner's realtime edit. No React or Supabase here so it can
 * be unit tested.
 *
 * `confirmed` maps keyOf(collection, id) to the JSON the server holds for that
 * record, or DELETED once the server holds a soft delete.
 */

export type Collections = Record<string, any[]>;
export type Confirmed = Map<string, string>;
export type ServerRow = { collection: string; id: string; data: any; deleted: boolean };
export type PendingRow = ServerRow & { workspace_id: string; _j: string; _k: string };

export const DELETED = "__deleted";
export const keyOf = (c: string, id: string) => `${c}\u0000${id}`;

/* Every record whose JSON differs from what the server confirmed, plus soft deletes for
   confirmed records that are gone locally. */
export function pendingRows(workspaceId: string, collections: string[], snap: Collections, confirmed: Confirmed): PendingRow[] {
  const rows: PendingRow[] = [];
  const seen = new Set<string>();
  for (const c of collections) {
    for (const r of snap[c] || []) {
      if (!r?.id) continue;
      const k = keyOf(c, r.id), j = JSON.stringify(r);
      seen.add(k);
      if (confirmed.get(k) !== j) rows.push({ workspace_id: workspaceId, collection: c, id: r.id, data: r, deleted: false, _j: j, _k: k });
    }
  }
  confirmed.forEach((j, k) => {
    const [c, id] = k.split("\u0000");
    // Only delete what this version of the app manages; never touch collections it doesn't know
    // (an older app on another phone must not wipe data a newer app added, e.g. settings in "cfg").
    if (!seen.has(k) && j !== DELETED && collections.includes(c)) {
      rows.push({ workspace_id: workspaceId, collection: c, id, data: {}, deleted: true, _j: DELETED, _k: k });
    }
  });
  return rows;
}

/* Rebuild local state from a full server load. `data` is null when the workspace has no live
   records yet (the caller seeds it). */
export function fromServer(all: ServerRow[], collections: string[]): { confirmed: Confirmed; data: Collections | null } {
  const confirmed: Confirmed = new Map();
  all.filter((r) => collections.includes(r.collection)).forEach((r) => confirmed.set(keyOf(r.collection, r.id), r.deleted ? DELETED : JSON.stringify(r.data)));
  const live = all.filter((r) => !r.deleted);
  if (!live.length) return { confirmed, data: null };
  const data: Collections = Object.fromEntries(collections.map((c) => [c, []]));
  live.forEach((r) => { if (data[r.collection]) data[r.collection].push(r.data); });
  for (const c of collections) data[c].sort((a, b) => (a._o ?? 1e15) - (b._o ?? 1e15));
  return { confirmed, data };
}

/* Fold one realtime row into local state. Returns null for our own echo or a malformed row;
   otherwise marks it confirmed and returns the next state. */
export function applyRemote(cur: Collections, r: ServerRow | null | undefined, confirmed: Confirmed): Collections | null {
  if (!r?.collection || !r.id) return null;
  const k = keyOf(r.collection, r.id);
  const j = r.deleted ? DELETED : JSON.stringify(r.data);
  if (confirmed.get(k) === j) return null;
  confirmed.set(k, j);
  const list = cur[r.collection] || [];
  const idx = list.findIndex((x) => x.id === r.id);
  let nextList = list;
  if (r.deleted) nextList = list.filter((x) => x.id !== r.id);
  else if (idx >= 0) { nextList = [...list]; nextList[idx] = r.data; }
  else nextList = [...list, r.data];
  return { ...cur, [r.collection]: nextList };
}
