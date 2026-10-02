import { useCallback, useEffect, useRef, useState } from "react";
import { FolderOpen, Folder, FolderPlus, Upload, FileText, FileImage, FileVideo, FileSpreadsheet, File, ChevronRight, Home, Trash2, Download, Share2, RefreshCw, Loader2, Check, X } from "lucide-react";
import { Panel, inputCls, btnGhost, btnPrimary } from "../../../components/ui";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/AuthGate";
import { DOCS_BUCKET, KEEP, MAX_BYTES, fmtSize, keyOf, safeName, uniqueName } from "./docsPath";

/*
 * Brand → Docs: the team's own file cabinet. Make any folders, upload any file
 * (PDF, photo, video, Excel…), open or share it. Files live in the private
 * Supabase Storage bucket "taazu-docs" under "<workspace id>/…"; only members
 * of this workspace can see them (storage policies in the migration).
 */

type Item = { name: string; folder: boolean; size: number; at: string; type: string };

const iconFor = (it: Item) => {
  if (it.folder) return Folder;
  const n = it.name.toLowerCase();
  if (it.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|svg)$/.test(n)) return FileImage;
  if (it.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/.test(n)) return FileVideo;
  if (/\.(xlsx?|csv|ods)$/.test(n)) return FileSpreadsheet;
  if (/\.(pdf|docx?|txt|md|pptx?)$/.test(n)) return FileText;
  return File;
};
const when = (s: string) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

const store = supabase?.storage.from(DOCS_BUCKET);

export default function Docs() {
  const auth = useAuth();
  const ws = auth?.workspace?.id;
  const [path, setPath] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(""); // upload progress text
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null); // name waiting for 2nd delete tap
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!store || !ws) return;
    setLoading(true); setErr("");
    const { data, error } = await store.list(keyOf(ws, path), { limit: 1000, sortBy: { column: "name", order: "asc" } });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    const list: Item[] = (data || [])
      .filter((o) => o.name !== KEEP && o.name !== ".emptyFolderPlaceholder")
      .map((o) => ({ name: o.name, folder: !o.id, size: (o.metadata as any)?.size || 0, at: o.updated_at || o.created_at || "", type: (o.metadata as any)?.mimetype || "" }));
    list.sort((a, b) => (a.folder === b.folder ? a.name.localeCompare(b.name) : a.folder ? -1 : 1));
    setItems(list);
  }, [ws, path.join("/")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); setConfirm(null); }, [load]);

  if (!store || !ws) return <Panel title="Docs" icon={FolderOpen}><p className="text-sm text-stone-500">Docs ke liye internet aur login chahiye.</p></Panel>;

  const taken = () => new Set(items.map((i) => i.name));

  const makeFolder = async () => {
    const name = safeName(newFolder || "");
    if (!newFolder?.trim()) return;
    if (taken().has(name)) { setErr(`"${name}" pehle se hai.`); return; }
    const { error } = await store.upload(keyOf(ws, [...path, name], KEEP), new Blob([""], { type: "text/plain" }), { upsert: true });
    if (error) { setErr(error.message); return; }
    setNewFolder(null); setPath([...path, name]);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const names = taken(); const fails: string[] = [];
    let i = 0;
    for (const f of Array.from(files)) {
      i++;
      if (f.size > MAX_BYTES) { fails.push(`${f.name} (50 MB se bada)`); continue; }
      const name = uniqueName(safeName(f.name), names); names.add(name);
      setBusy(`Upload ${i}/${files.length}: ${name}`);
      const { error } = await store.upload(keyOf(ws, path, name), f, { contentType: f.type || undefined, upsert: false });
      if (error) fails.push(`${f.name}: ${error.message}`);
    }
    setBusy(""); if (fileInput.current) fileInput.current.value = "";
    setErr(fails.length ? `Upload nahi hua: ${fails.join(", ")}` : "");
    load();
  };

  const signed = async (name: string, download = false) => {
    const { data, error } = await store.createSignedUrl(keyOf(ws, path, name), 60 * 60 * 24 * 7, download ? { download: name } : undefined);
    if (error || !data) { setErr(error?.message || "Link nahi bana"); return null; }
    return data.signedUrl;
  };
  const open = async (name: string) => { const u = await signed(name); if (u) window.open(u, "_blank", "noopener"); };
  const download = async (name: string) => { const u = await signed(name, true); if (u) window.open(u, "_blank", "noopener"); };
  const share = async (name: string) => {
    const u = await signed(name); if (!u) return;
    const text = `${name}\n${u}`;
    if (navigator.share) { try { await navigator.share({ title: name, text: name, url: u }); return; } catch { /* cancelled */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  /* Every key under a folder (storage has no real folders, so walk it). */
  const allKeys = async (prefix: string): Promise<string[]> => {
    const { data, error } = await store.list(prefix, { limit: 1000 });
    if (error) throw error;
    const out: string[] = [];
    for (const o of data || []) {
      if (o.id) out.push(`${prefix}/${o.name}`);
      else out.push(...(await allKeys(`${prefix}/${o.name}`)));
    }
    return out;
  };
  const remove = async (it: Item) => {
    if (confirm !== it.name) { setConfirm(it.name); return; }
    setConfirm(null); setBusy(`Delete: ${it.name}`);
    try {
      const keys = it.folder ? await allKeys(keyOf(ws, [...path, it.name])) : [keyOf(ws, path, it.name)];
      for (let i = 0; i < keys.length; i += 100) {
        const { error } = await store.remove(keys.slice(i, i + 100));
        if (error) throw error;
      }
      setErr("");
    } catch (e: any) { setErr(e?.message || "Delete nahi hua"); }
    setBusy(""); load();
  };

  return (
    <Panel title="Docs" icon={FolderOpen} action={
      <button onClick={load} aria-label="Refresh" className="p-1.5 text-stone-400 hover:text-stone-700"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /></button>
    }>
      <p className="mb-3 text-xs text-stone-500">Koi bhi folder banao aur koi bhi file daalo (PDF, photo, video, Excel…), ek file 50 MB tak. Sirf aapki team dekh sakti hai.</p>

      {/* breadcrumb */}
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
        <button onClick={() => setPath([])} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold ${path.length ? "text-orange-700 hover:bg-orange-50" : "text-stone-900"}`}><Home size={14} />Docs</button>
        {path.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <ChevronRight size={14} className="text-stone-300" />
            <button onClick={() => setPath(path.slice(0, i + 1))} className={`rounded-lg px-2 py-1 font-semibold ${i === path.length - 1 ? "text-stone-900" : "text-orange-700 hover:bg-orange-50"}`}>{p}</button>
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setNewFolder(newFolder === null ? "" : null)} className={btnGhost}><FolderPlus size={16} />Naya folder</button>
        <button onClick={() => fileInput.current?.click()} disabled={!!busy} className={btnPrimary + " disabled:opacity-60"}><Upload size={16} />File upload</button>
        <input ref={fileInput} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>

      {newFolder !== null && (
        <form onSubmit={(e) => { e.preventDefault(); makeFolder(); }} className="mt-2 flex gap-2">
          <input autoFocus className={inputCls} value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Folder ka naam, e.g. FSSAI papers" aria-label="Folder name" />
          <button type="submit" className={btnPrimary} aria-label="Create folder"><Check size={16} /></button>
          <button type="button" onClick={() => setNewFolder(null)} className={btnGhost} aria-label="Cancel"><X size={16} /></button>
        </form>
      )}

      {busy && <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800"><Loader2 size={14} className="animate-spin" />{busy}</div>}
      {err && <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{err}</div>}

      <div className="mt-3 divide-y divide-stone-100">
        {items.map((it) => {
          const Icon = iconFor(it);
          return (
            <div key={it.name} className="flex items-center gap-3 py-2.5">
              <button onClick={() => (it.folder ? setPath([...path, it.name]) : open(it.name))} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${it.folder ? "bg-amber-50 text-amber-600" : "bg-stone-100 text-stone-500"}`}><Icon size={18} /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-stone-900">{it.name}</span>
                  <span className="block text-xs text-stone-500">{it.folder ? "Folder" : [fmtSize(it.size), when(it.at)].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
              {!it.folder && <>
                <button onClick={() => share(it.name)} aria-label={`Share ${it.name}`} title="Link share karo (7 din chalega)" className="p-1.5 text-stone-400 hover:text-green-600"><Share2 size={16} /></button>
                <button onClick={() => download(it.name)} aria-label={`Download ${it.name}`} className="p-1.5 text-stone-400 hover:text-stone-700"><Download size={16} /></button>
              </>}
              <button onClick={() => remove(it)} aria-label={`Delete ${it.name}`} className={`rounded-lg p-1.5 text-xs font-semibold ${confirm === it.name ? "bg-red-600 px-2 text-white" : "text-stone-400 hover:text-red-600"}`}>
                {confirm === it.name ? "Pakka delete?" : <Trash2 size={16} />}
              </button>
            </div>
          );
        })}
        {!loading && !items.length && <div className="py-6 text-center text-sm text-stone-400">{path.length ? "Ye folder khali hai. Upar se file upload karo." : "Abhi koi doc nahi. Naya folder banao ya file upload karo."}</div>}
        {loading && !items.length && <div className="py-6 text-center text-sm text-stone-400">Load ho raha hai…</div>}
      </div>
    </Panel>
  );
}
