import { useCallback, useMemo, useState } from "react";
import { Search, Plus, BellRing, Columns3, List } from "lucide-react";
import { Empty, inputCls } from "../../components/ui";
import { uid, cityOf } from "../../lib/core";
import { usePrefs } from "../../lib/prefs";
import RecordCard from "./RecordCard";
import RecordSheet from "./RecordSheet";
import { isActive, dueList, agenda, type CrmConfig, type CrmRecord, type ContactLog } from "./config";

type Extra = { id: string; label: string; icon: any; render: (open: (r: CrmRecord) => void) => any };
type Stat = [string, number, string];

export default function CrmView({ cfg, rows, setRows, logs, setLogs, me = "", stats, extra = null }: {
  cfg: CrmConfig; rows: CrmRecord[]; setRows: (fn: (rows: CrmRecord[]) => CrmRecord[]) => void;
  logs: ContactLog[]; setLogs: (fn: (logs: ContactLog[]) => ContactLog[]) => void; me?: string;
  stats: (rows: CrmRecord[], due: number) => Stat[]; extra?: Extra | null;
}) {
  const { on } = usePrefs();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [city, setCity] = useState("All cities");
  const [openId, setOpenId] = useState<string | null>(null);
  const [startLog, setStartLog] = useState<string | null>(null);

  const dueCount = dueList(cfg, rows).length;
  const tabs = [
    { id: "all", label: "All", icon: List },
    ...(on(cfg.kind + ".due") ? [{ id: "due", label: dueCount ? `Due ${dueCount}` : "Due", icon: BellRing }] : []),
    ...(on(cfg.kind + ".board") ? [{ id: "board", label: "Pipeline", icon: Columns3 }] : []),
    ...(extra ? [{ id: extra.id, label: extra.label, icon: extra.icon }] : []),
  ];
  const active = tabs.some((t) => t.id === tab) ? tab : tabs[0].id; // a tab switched off in Settings falls back
  const cats = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r[cfg.catKey]).filter(Boolean)))], [rows, cfg.catKey]);
  const lastLog = useMemo(() => {
    const m: Record<string, ContactLog> = {};
    logs.forEach((l) => { const c = m[l.supplierId]; if (!c || (l.date + (l.at || 0)) > (c.date + (c.at || 0))) m[l.supplierId] = l; });
    return m;
  }, [logs]);
  const cities = useMemo(() => {
    const n: Record<string, number> = {};
    rows.forEach((r) => { const c = cityOf(r); n[c] = (n[c] || 0) + 1; });
    return Object.entries(n).sort((a, b) => (a[0] === "Ahmedabad" ? -1 : b[0] === "Ahmedabad" ? 1 : b[1] - a[1]));
  }, [rows]);
  const filtered = rows.filter((r) => (cat === "All" || r[cfg.catKey] === cat) && (city === "All cities" || cityOf(r) === city) && (!q || `${r.name} ${r.area} ${r[cfg.catKey]} ${r.contact || ""} ${r.phone}`.toLowerCase().includes(q.toLowerCase())));
  const due = dueList(cfg, filtered);
  const plan = agenda(cfg, filtered);
  // All: open records first, then the config's own order ("Call first" suppliers / priority-A buyers), then the rest.
  const allSorted = [...filtered].sort((a, b) => Number(!isActive(cfg, a.status)) - Number(!isActive(cfg, b.status)) || (cfg.sortFresh ? cfg.sortFresh(a, b) : 0));

  const open = useCallback((r: CrmRecord, via: string | null = null) => { setOpenId(r.id); setStartLog(via); }, []);
  const close = useCallback(() => { setOpenId(null); setStartLog(null); }, []);
  const patch = (id: string, p: Partial<CrmRecord>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const current = rows.find((r) => r.id === openId) || null;

  const add = () => {
    const r: CrmRecord = { id: uid(), [cfg.catKey]: cat === "All" ? cfg.defaultCat : cat, name: `New ${cfg.noun}`, area: "", city: city === "All cities" ? "" : city, phone: "", source: "Added manually", status: cfg.freshStage, _o: Date.now() };
    setRows((rs) => [r, ...rs]);
    open(r);
  };
  const card = (r: CrmRecord) => <RecordCard key={r.id} cfg={cfg} r={r} lastLog={lastLog[r.id]} onOpen={open} onCall={open} />;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats(filtered, due.length).map(([l, n, c]) => (
          <div key={l} className="relative overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-card px-2 py-3 text-center"><span className="absolute inset-x-0 top-0 h-1" style={{ background: c }} />
            <div className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color: c }}>{n}</div>
            <div className="text-[11px] font-medium text-stone-500">{l}</div>
          </div>
        ))}
      </div>

      <div className="sticky top-[calc(57px+env(safe-area-inset-top))] md:top-0 z-10 -mx-4 px-4 py-2 bg-[#FAF8F5]/85 backdrop-blur-xl">
        <div className="grid rounded-2xl bg-stone-200/60 p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${active === id ? "bg-white text-orange-700 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}>
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
              {cities.length > 1 && (
                <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City"
                  className={`shrink-0 max-w-[34vw] rounded-lg border px-2 text-xs font-medium ${city === "All cities" ? "border-slate-200 bg-white text-slate-600" : "border-slate-900 bg-slate-900 text-white"}`}>
                  <option>All cities</option>
                  {cities.map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
                </select>
              )}
              <button onClick={add} className="shrink-0 inline-flex items-center gap-1 rounded-xl btn-brand px-3.5 text-sm font-semibold text-white"><Plus size={16} />Add</button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${c === cat ? "bg-stone-900 text-white border-stone-900 shadow-sm" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"}`}>{c}</button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        {active === "due" && (
          <div className="space-y-6">
            {([
              ["Overdue", plan.overdue, "text-red-600", "Missed — call these first."],
              ["Today", plan.today, "text-orange-700", "Today's calls and appointments."],
              ["Next 7 days", plan.upcoming, "text-slate-700", ""],
            ] as const).map(([title, list, col, sub]) => (
              <section key={title}>
                <h2 className={`mb-1 text-sm font-semibold ${col}`}>{title} <span className="font-normal text-slate-400">{list.length}</span></h2>
                {sub && list.length > 0 && <p className="mb-2 text-xs text-slate-500">{sub}</p>}
                {list.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(card)}</div>
                  : <div className="rounded-2xl border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400">Nothing {title === "Next 7 days" ? "scheduled" : title.toLowerCase()}.</div>}
              </section>
            ))}
            <p className="text-xs text-slate-500">To schedule a call: open a {cfg.noun} → <b>Log this contact</b> → pick a day (and time) under <b>Follow up</b> → Save.</p>
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
            {allSorted.map(card)}
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
