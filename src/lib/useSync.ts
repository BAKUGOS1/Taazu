import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

/*
 * Record-level sync with Supabase.
 *
 * Every app record (a supplier, a call log, a task…) is one row in
 * taazu_records keyed by (workspace, collection, id). Edits are diffed against
 * what the server last confirmed and only the changed rows are upserted, so
 * two partners editing different suppliers never overwrite each other; the
 * same supplier resolves last-write-wins.
 *
 * Deletes are soft (deleted = true) so they travel over realtime like edits.
 * Failed writes are simply not marked as confirmed, so the next diff (or the
 * browser coming back online) retries them. A per-workspace copy in
 * localStorage lets the app open instantly and offline.
 */

export type Collections = Record<string, any[]>;
export type SyncStatus = "loading" | "synced" | "saving" | "offline" | "error";

const cacheKey = (ws: string) => `taazu-cache-${ws}`;
const keyOf = (c: string, id: string) => `${c}\u0000${id}`;

export function useSync(opts: {
  workspaceId: string | null;
  userId: string | null;
  collections: string[];
  data: Collections;
  replaceAll: (next: Collections) => void;
  seed: () => Collections;
}) {
  const { workspaceId, userId, collections, data, replaceAll, seed } = opts;
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [ready, setReady] = useState(false);
  const confirmed = useRef(new Map<string, string>()); // key -> JSON the server holds
  const dataRef = useRef(data);
  dataRef.current = data;
  const replaceRef = useRef(replaceAll);
  replaceRef.current = replaceAll;
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushing = useRef(false);

  /* Push every record whose JSON differs from what the server confirmed. */
  const flush = useCallback(async (given?: Collections) => {
    if (!supabase || !workspaceId || flushing.current) return;
    const snap = given || dataRef.current;
    const rows: any[] = [];
    const seen = new Set<string>();
    for (const c of collections) {
      for (const r of snap[c] || []) {
        if (!r?.id) continue;
        const k = keyOf(c, r.id), j = JSON.stringify(r);
        seen.add(k);
        if (confirmed.current.get(k) !== j) rows.push({ workspace_id: workspaceId, collection: c, id: r.id, data: r, deleted: false, _j: j, _k: k });
      }
    }
    confirmed.current.forEach((j, k) => {
      if (!seen.has(k) && j !== "__deleted") {
        const [c, id] = k.split("\u0000");
        rows.push({ workspace_id: workspaceId, collection: c, id, data: {}, deleted: true, _j: "__deleted", _k: k });
      }
    });
    const saveCache = () => { try { localStorage.setItem(cacheKey(workspaceId), JSON.stringify({ data: snap, confirmed: [...confirmed.current] })); } catch { /* storage full or blocked */ } };
    saveCache();
    if (!rows.length) { setStatus(navigator.onLine ? "synced" : "offline"); return; }
    if (!navigator.onLine) { setStatus("offline"); return; }
    flushing.current = true;
    setStatus("saving");
    try {
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200);
        const { error } = await supabase.from("taazu_records").upsert(batch.map(({ _j, _k, ...r }) => r));
        if (error) throw error;
        batch.forEach((r) => confirmed.current.set(r._k, r._j));
      }
      saveCache();
      setStatus("synced");
    } catch (e) {
      console.warn("[sync] save failed", e);
      setStatus(navigator.onLine ? "error" : "offline");
    } finally {
      flushing.current = false;
    }
  }, [workspaceId, collections]);

  /* Full load from the server. Empty workspace → seed it with local data. */
  const load = useCallback(async () => {
    if (!supabase || !workspaceId) return;
    const all: any[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: rows, error } = await supabase.from("taazu_records")
        .select("collection,id,data,deleted").eq("workspace_id", workspaceId).range(from, from + 999);
      if (error) throw error;
      all.push(...rows);
      if (rows.length < 1000) break;
    }
    confirmed.current.clear();
    const live = all.filter((r) => !r.deleted);
    all.forEach((r) => confirmed.current.set(keyOf(r.collection, r.id), r.deleted ? "__deleted" : JSON.stringify(r.data)));
    if (!live.length) {
      // New workspace: upload what this device has (old local data or starter lists).
      replaceRef.current(seed());
      setReady(true);
      return;
    }
    const next: Collections = Object.fromEntries(collections.map((c) => [c, []]));
    live.forEach((r) => { if (next[r.collection]) next[r.collection].push(r.data); });
    for (const c of collections) next[c].sort((a, b) => (a._o ?? 1e15) - (b._o ?? 1e15));
    replaceRef.current(next);
    setReady(true);
    setStatus("synced");
  }, [workspaceId, collections, seed]);

  /* Boot: cached copy first (instant / offline), then server. */
  useEffect(() => {
    if (!workspaceId || !userId) return;
    setReady(false); setStatus("loading");
    let cached: Collections | null = null;
    try {
      const c = JSON.parse(localStorage.getItem(cacheKey(workspaceId)) || "null");
      if (c?.data) { cached = c.data; confirmed.current = new Map(c.confirmed || []); replaceRef.current(c.data); }
    } catch { /* bad cache */ }
    // Push edits made offline last session before the server copy replaces them.
    (cached ? flush(cached) : Promise.resolve()).then(load).catch((e) => { console.warn("[sync] load failed", e); setStatus(navigator.onLine ? "error" : "offline"); setReady(true); });
  }, [workspaceId, userId, load, flush]);

  /* Debounced save on every local change. */
  useEffect(() => {
    if (!ready) return;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => flush(), 600);
    return () => { if (flushTimer.current) clearTimeout(flushTimer.current); };
  }, [data, ready, flush]);

  /* Realtime: apply partners' edits as they land. */
  useEffect(() => {
    if (!supabase || !workspaceId || !ready) return;
    let dropped = false;
    const ch = supabase.channel(`taazu-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "taazu_records", filter: `workspace_id=eq.${workspaceId}` }, (p: any) => {
        const r = p.new;
        if (!r?.collection || !r.id) return;
        const k = keyOf(r.collection, r.id);
        const j = r.deleted ? "__deleted" : JSON.stringify(r.data);
        if (confirmed.current.get(k) === j) return; // our own echo
        confirmed.current.set(k, j);
        const cur = dataRef.current;
        const list = cur[r.collection] || [];
        const idx = list.findIndex((x) => x.id === r.id);
        let nextList = list;
        if (r.deleted) nextList = list.filter((x) => x.id !== r.id);
        else if (idx >= 0) { nextList = [...list]; nextList[idx] = r.data; }
        else nextList = [...list, r.data];
        replaceRef.current({ ...cur, [r.collection]: nextList });
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED" && dropped) { dropped = false; flush().then(load).catch(() => {}); }
        if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") dropped = true;
      });
    const online = () => { flush().then(load).catch(() => {}); };
    const offline = () => setStatus("offline");
    const visible = () => { if (document.visibilityState === "visible") flush().then(load).catch(() => {}); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visible);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [workspaceId, ready, load, flush]);

  return { status, ready };
}
