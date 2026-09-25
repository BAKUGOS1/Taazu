import { useCallback, useMemo, useState } from "react";
import { Search, Plus, BellRing, Columns3, List, PhoneOutgoing } from "lucide-react";
import { Empty, inputCls } from "../../components/ui";
import { uid } from "../../lib/core";
import { usePrefs } from "../../lib/prefs";
import RecordCard from "./RecordCard";
import RecordSheet from "./RecordSheet";
import { isActive, dueList, type CrmConfig, type CrmRecord, type ContactLog } from "./config";

type Extra = { id: string; label: string; icon: any; render: (open: (r: CrmRecord) => void) => any };
type Stat = [string, number, string];

export default function CrmView({ cfg, rows, setRows, logs, setLogs, me = "", stats, extra = null }: {
  cfg: CrmConfig; rows: CrmRecord[]; setRows: (fn: (rows: CrmRecord[]) => CrmRecord[]) => void;
  logs: ContactLog[]; setLogs: (fn: (logs: ContactLog[]) => ContactLog[]) => void; me?: string;
  stats: (rows: CrmRecord[], due: number) => Stat[]; extra?: Extra | null;
}) {
  const { on } = usePrefs();
  const [tab, setTab] = useState("due");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [startLog, setStartLog] = useState<string | null>(null);

  const tabs = [
    ...(on(cfg.kind + ".due") ? [{ id: "due", label: "Due", icon: BellRing }] : []),
    ...(on(cfg.kind + ".board") ? [{ id: "board", label: "Pipeline", icon: Columns3 }] : []),
    { id: "all", label: "All", icon: List },
    ...(extra ? [{ id: extra.id, label: extra.label, icon: extra.icon }] : []),
  ];
  const active = tabs.some((t) => t.id === tab) ? tab : tabs[0].id; // a tab switched off in Settings falls back
  const cats = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r[cfg.catKey]).filter(Boolean)))], [rows, cfg.catKey]);
  const lastLog = useMemo(() => {
    const m: Record<string, ContactLog> = {};
    logs.forEach((l) => { const c = m[l.supplierId]; if (!c || (l.date + (l.at || 0)) > (c.date + (c.at || 0))) m[l.supplierId] = l; });
    return m;
  }, [logs]);
  const filtered = rows.filter((r) => (cat === "All" || r[cfg.catKey] === cat) && (!q || `${r.name} ${r.area} ${r[cfg.catKey]} ${r.contact || ""} ${r.phone}`.toLowerCase().includes(q.toLowerCase())));
  const due = dueList(cfg, filtered);
  const fresh = filtered.filter((r) => r.status === cfg.freshStage && !r.follow).sort(cfg.sortFresh || (() => 0));

  const open = useCallback((r: CrmRecord, via: string | null = null) => { setOpenId(r.id); setStartLog(via); }, []);
  const close = useCallback(() => { setOpenId(null); setStartLog(null); }, []);
  const patch = (id: string, p: Partial<CrmRecord>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const current = rows.find((r) => r.id === openId) || null;

  const add = () => {
    const r: CrmRecord = { id: uid(), [cfg.catKey]: cat === "All" ? cfg.defaultCat : cat, name: `New ${cfg.noun}`, area: "", phone: "", source: "Added manually", status: cfg.freshStage, _o: Date.now() };
    setRows((rs) => [r, ...rs]);
    open(r);
  };
  const card = (r: CrmRecord) => <RecordCard key={r.id} cfg={cfg} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats(filtered, due.length).map(([l, n, c]) => (
          <div key={l} className="rounded-2xl bg-white border border-slate-200 px-2 py-2.5 text-center">
            <div className="text-xl font-bold" style={{ color: c }}>{n}</div>
            <div className="text-[11px] text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      <div className="sticky top-[calc(57px+env(safe-area-inset-top))] md:top-0 z-10 -mx-4 px-4 py-2 bg-slate-50/90 backdrop-blur">
        <div className="grid rounded-xl bg-slate-200/70 p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${active === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        {active !== extra?.id && (
          <>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={inputCls + " pl-9"} placeholder="Search name, area, phone" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <button onClick={add} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white active:bg-orange-700"><Plus size={16} />Add</button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border ${c === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"}`}>{c}</button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        {active === "due" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Follow-ups due <span className="text-slate-400 font-normal">{due.length}</span></h2>
              {due.length ? <div className="grid gap-3 md:grid-cols-2">{due.map(card)}</div> : <Empty icon={BellRing} text="No follow-ups due. Nice." />}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900 flex items-center gap-2"><PhoneOutgoing size={15} />Not contacted yet <span className="text-slate-400 font-normal">{fresh.length}</span></h2>
              {fresh.length ? <div className="grid gap-3 md:grid-cols-2">{fresh.slice(0, 12).map(card)}</div> : <Empty icon={PhoneOutgoing} text={`Every ${cfg.noun} has been contacted.`} />}
            </section>
          </div>
        )}

        {active === "board" && (
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-4 xl:grid-cols-7 md:overflow-visible">
            {cfg.stages.map((s) => {
              const col = filtered.filter((r) => r.status === s);
              return (
                <div key={s} className="snap-start shrink-0 w-[82vw] sm:w-72 md:w-auto">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: cfg.stageCol[s] }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: cfg.stageCol[s] }} />{s}<span className="text-slate-400">{col.length}</span>
                  </div>
                  <div className="space-y-3">
                    {col.map(card)}
                    {!col.length && <div className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {active === "all" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...filtered].sort((a, b) => Number(!isActive(cfg, a.status)) - Number(!isActive(cfg, b.status))).map(card)}
            {!filtered.length && <Empty icon={Search} text={`No ${cfg.noun} matches.`} />}
          </div>
        )}

        {extra && active === extra.id && extra.render(open)}
      </div>

      <RecordSheet
        cfg={cfg} r={current} logs={logs} startLog={startLog} onClose={close}
        onChange={(p) => patch(current.id, p)}
        onAddLog={(l, p) => { setLogs((ls) => [{ ...l, by: me || undefined }, ...ls]); patch(current.id, p); }}
        onDeleteLog={(id) => setLogs((ls) => ls.filter((l) => l.id !== id))}
        onDelete={() => { const id = current.id; close(); setRows((rs) => rs.filter((r) => r.id !== id)); setLogs((ls) => ls.filter((l) => l.supplierId !== id)); }}
      />
    </div>
  );
}
