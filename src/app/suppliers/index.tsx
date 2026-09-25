import { useCallback, useMemo, useState } from "react";
import { Search, Plus, BellRing, Columns3, List, Scale, PhoneOutgoing } from "lucide-react";
import { Empty, inputCls } from "../../components/ui";
import { uid } from "../../lib/core";
import SupplierCard from "./SupplierCard";
import SupplierSheet from "./SupplierSheet";
import CompareView from "./CompareView";
import { STAGES, STAGE_COL, ACTIVE, dueList, type Supplier, type ContactLog } from "./model";

const TABS = [
  { id: "due", label: "Due", icon: BellRing },
  { id: "board", label: "Pipeline", icon: Columns3 },
  { id: "all", label: "All", icon: List },
  { id: "compare", label: "Compare", icon: Scale },
];

export default function SuppliersView({ rows, setRows, logs, setLogs, me = "" }: {
  rows: Supplier[]; setRows: (fn: (rows: Supplier[]) => Supplier[]) => void;
  logs: ContactLog[]; setLogs: (fn: (logs: ContactLog[]) => ContactLog[]) => void; me?: string;
}) {
  const [tab, setTab] = useState("due");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [startLog, setStartLog] = useState<string | null>(null);

  const cats = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.cat)))], [rows]);
  const lastLog = useMemo(() => {
    const m: Record<string, ContactLog> = {};
    logs.forEach((l) => { const c = m[l.supplierId]; if (!c || (l.date + (l.at || 0)) > (c.date + (c.at || 0))) m[l.supplierId] = l; });
    return m;
  }, [logs]);
  const filtered = rows.filter((r) => (cat === "All" || r.cat === cat) && (!q || `${r.name} ${r.area} ${r.cat} ${r.contact || ""} ${r.phone}`.toLowerCase().includes(q.toLowerCase())));
  const due = dueList(filtered);
  const fresh = filtered.filter((r) => r.status === "To call" && !r.follow);

  const open = useCallback((r: Supplier, via: string | null = null) => { setOpenId(r.id); setStartLog(via); }, []);
  const close = useCallback(() => { setOpenId(null); setStartLog(null); }, []);
  const patch = (id: string, p: Partial<Supplier>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const current = rows.find((r) => r.id === openId) || null;

  const add = () => {
    const r: Supplier = { id: uid(), cat: cat === "All" ? "Co-packer / bottler" : cat, name: "New supplier", area: "", phone: "", use: "", source: "Added manually", status: "To call" };
    setRows((rs) => [r, ...rs]);
    open(r);
  };

  const stageCounts = STAGES.map((s) => ({ s, n: filtered.filter((r) => r.status === s).length }));

  return (
    <div>
      {/* summary strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[["Due", due.length, "#EA580C"], ["To call", stageCounts[0].n, STAGE_COL["To call"]], ["Quotes", filtered.filter((r) => Number(r.price) > 0).length, STAGE_COL["Quote received"]], ["Final", stageCounts[5].n, STAGE_COL.Finalized]].map(([l, n, c]) => (
          <div key={l as string} className="rounded-2xl bg-white border border-slate-200 px-2 py-2.5 text-center">
            <div className="text-xl font-bold" style={{ color: c as string }}>{n}</div>
            <div className="text-[11px] text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="sticky top-[calc(57px+env(safe-area-inset-top))] md:top-0 z-10 -mx-4 px-4 py-2 bg-slate-50/90 backdrop-blur">
        <div className="grid grid-cols-4 rounded-xl bg-slate-200/70 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        {tab !== "compare" && (
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={inputCls + " pl-9"} placeholder="Search name, area, phone" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button onClick={add} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white active:bg-orange-700"><Plus size={16} />Add</button>
          </div>
        )}
        {tab !== "compare" && (
          <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border ${c === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"}`}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        {tab === "due" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Follow-ups due <span className="text-slate-400 font-normal">{due.length}</span></h2>
              {due.length ? <div className="grid gap-3 md:grid-cols-2">{due.map((r) => <SupplierCard key={r.id} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />)}</div>
                : <Empty icon={BellRing} text="No follow-ups due. Nice." />}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900 flex items-center gap-2"><PhoneOutgoing size={15} />Not called yet <span className="text-slate-400 font-normal">{fresh.length}</span></h2>
              {fresh.length ? <div className="grid gap-3 md:grid-cols-2">{fresh.slice(0, 12).map((r) => <SupplierCard key={r.id} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />)}</div>
                : <Empty icon={PhoneOutgoing} text="Every supplier has been contacted." />}
            </section>
          </div>
        )}

        {tab === "board" && (
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-4 xl:grid-cols-7 md:overflow-visible">
            {STAGES.map((s) => {
              const col = filtered.filter((r) => r.status === s);
              return (
                <div key={s} className="snap-start shrink-0 w-[82vw] sm:w-72 md:w-auto">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: STAGE_COL[s] }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: STAGE_COL[s] }} />{s}<span className="text-slate-400">{col.length}</span>
                  </div>
                  <div className="space-y-3">
                    {col.map((r) => <SupplierCard key={r.id} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />)}
                    {!col.length && <div className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "all" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...filtered].sort((a, b) => Number(!ACTIVE(a.status)) - Number(!ACTIVE(b.status))).map((r) => <SupplierCard key={r.id} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />)}
            {!filtered.length && <Empty icon={Search} text="No supplier matches." />}
          </div>
        )}

        {tab === "compare" && <CompareView rows={rows} onOpen={open} />}
      </div>

      <SupplierSheet
        r={current} logs={logs} startLog={startLog} onClose={close}
        onChange={(p) => patch(current.id, p)}
        onAddLog={(l, p) => { setLogs((ls) => [{ ...l, by: me || undefined }, ...ls]); patch(current.id, p); }}
        onDeleteLog={(id) => setLogs((ls) => ls.filter((l) => l.id !== id))}
        onDelete={() => { const id = current.id; close(); setRows((rs) => rs.filter((r) => r.id !== id)); setLogs((ls) => ls.filter((l) => l.supplierId !== id)); }}
      />
    </div>
  );
}
