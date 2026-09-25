import { useState, useEffect, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Home, Users, Factory, Map as MapIcon, ListChecks, ClipboardList, ShoppingCart, Wallet, Palette,
  Download, Upload, Phone, MessageCircle, MapPin, Search, Plus, Trash2, LayoutGrid, Table as TableIcon,
  RotateCcw, Droplets, Settings, MoreHorizontal, Bell, CheckCircle2, Circle, AlertCircle, Star, Check, X, Target, TrendingUp,
  QrCode, Copy, RefreshCw, ExternalLink, Link2, Send,
} from "lucide-react";

/* =========================================================
   HYDRATION HQ — Ahmedabad electrolyte pilot tracker
   Team data syncs through Supabase (see lib/useSync.ts).
   ========================================================= */

/* ---------------- helpers ---------------- */
import {
  uid, mk, inr, today, telHref, waHref, GEO, enrich, mapUrl, SUP_KEYS, SUPPLIERS, BUY_KEYS, BUYERS, TASKS, BUDGET, BRANDS, SUP_STATUS, BUY_STATUS, STATUS_COL, COL, SEGS, FLAVOURS, PAYS, supCols, buyCols, taskCols, budCols, saleCols, survCols,
} from "./lib/core";
import {
  inputCls, btn, btnPrimary, btnGhost, Dot, Tag, StatusSelect, IconLink, ContactIcons, PageHead, Panel, Stat, Bar, Empty, useViewPref, ViewToggle,
} from "./components/ui";
import SuppliersView from "./app/suppliers";
import Dock from "./components/Dock";
import AuthGate, { useAuth } from "./app/auth/AuthGate";
import TeamPanel from "./app/auth/TeamPanel";
import SyncBadge from "./components/SyncBadge";
import { useSync } from "./lib/useSync";
import BuyersView from "./app/buyers";
import { dueList, normalizeStage } from "./app/crm/config";
import { SUPPLIER_CFG, BUYER_CFG } from "./app/crm/configs";

/* ---------------- editable table ---------------- */
function Grid({ rows, setRows, cols, blank = {}, filterKey = null, hideToolbar = false }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const cats = filterKey ? ["All", ...Array.from(new Set<any>(rows.map((r) => r[filterKey])))] : [];
  const shown = hideToolbar ? rows : rows.filter((r) => (f === "All" || r[filterKey] === f) && (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())));
  const up = (id, k, v) => setRows(rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const cell = "border-b border-slate-100 px-1 py-1";
  return (
    <div>
      {!hideToolbar && (
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className={`${inputCls} pl-9 w-56`} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {filterKey && <select className={`${inputCls} w-auto`} value={f} onChange={(e) => setF(e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select>}
          <button className={btnPrimary} onClick={() => setRows([{ id: uid(), ...blank }, ...rows])}><Plus size={16} />Add row</button>
          <span className="text-xs text-slate-500 ml-auto">{shown.length} of {rows.length}</span>
        </div>
      )}
      <div className="overflow-auto border border-slate-200 rounded-xl bg-white" style={{ maxHeight: 620 }}>
        <table className="text-xs border-collapse" style={{ minWidth: cols.reduce((s, c) => s + c.w, 40) }}>
          <thead className="sticky top-0 z-10">
            <tr>{cols.map((c) => <th key={c.k} className="bg-slate-50 text-slate-500 text-left px-2 py-2 font-semibold border-b border-slate-200" style={{ width: c.w }}>{c.l}</th>)}<th className="bg-slate-50 border-b border-slate-200" /></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                {cols.map((c) => (
                  <td key={c.k} className={cell}>
                    {c.t === "link" ? <ContactIcons r={r} />
                      : c.calc ? <span className="font-semibold px-1">{inr(c.calc(r))}</span>
                      : c.k === "status" ? <StatusSelect value={r.status} options={c.o} onChange={(v) => up(r.id, "status", v)} />
                      : c.t === "select" ? (
                        <select className="w-full bg-transparent text-xs py-1" value={r[c.k]} onChange={(e) => up(r.id, c.k, e.target.value)}>{["", ...c.o].map((o) => <option key={o} value={o}>{o}</option>)}</select>
                      ) : (
                        <input className={`w-full bg-transparent text-xs px-1 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-300 ${c.k === "name" ? "font-semibold text-slate-900" : ""}`}
                          type={c.t === "number" ? "number" : c.t === "date" ? "date" : "text"} value={r[c.k] ?? ""} onChange={(e) => up(r.id, c.k, e.target.value)} />
                      )}
                  </td>
                ))}
                <td className={cell}><button className="text-slate-300 hover:text-red-500 px-2" title="Delete row" aria-label="Delete row" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <Empty icon={Search} text="Nothing matches this filter." />}
      </div>
    </div>
  );
}

/* ---------------- Buyers / Suppliers directory ---------------- */
function TaskList({ tasks, setTasks }) {
  const [nt, setNt] = useState({ phase: "Week 1", task: "", due: today() });
  const [hideDone, setHideDone] = useState(false);
  const phases = Array.from(new Set<any>(tasks.map((t) => t.phase)));
  const up = (id, k, v) => setTasks(tasks.map((t) => (t.id === id ? { ...t, [k]: v } : t)));
  const t0 = today();
  const add = () => { if (!nt.task.trim()) return; setTasks([...tasks, { id: uid(), ...nt, status: "To do", notes: "" }]); setNt({ ...nt, task: "" }); };
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap gap-2 items-center">
        <input className={`${inputCls} flex-1 min-w-48`} placeholder="Add a task and press Enter" value={nt.task} onChange={(e) => setNt({ ...nt, task: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} />
        <input className={`${inputCls} w-32`} placeholder="Phase" value={nt.phase} onChange={(e) => setNt({ ...nt, phase: e.target.value })} />
        <input className={`${inputCls} w-40`} type="date" value={nt.due} onChange={(e) => setNt({ ...nt, due: e.target.value })} />
        <button className={btnPrimary} onClick={add}><Plus size={16} />Add</button>
        <label className="flex items-center gap-2 text-xs text-slate-500 ml-auto"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />Hide done</label>
      </div>
      {phases.map((p) => {
        const all = tasks.filter((t) => t.phase === p);
        const items = hideDone ? all.filter((t) => t.status !== "Done") : all;
        const done = all.filter((t) => t.status === "Done").length;
        if (!items.length) return null;
        return (
          <Panel key={p} title={p} action={<span className="text-xs text-slate-500">{done}/{all.length}</span>}>
            <div className="-my-2">
              {items.map((t) => {
                const isDone = t.status === "Done";
                const over = !isDone && t.due && t.due < t0;
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <button onClick={() => up(t.id, "status", isDone ? "To do" : "Done")} aria-label={isDone ? "Mark not done" : "Mark done"} className={isDone ? "text-green-600" : "text-slate-300 hover:text-slate-500"}>
                      {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <input className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${isDone ? "line-through text-slate-400" : "text-slate-800"}`} value={t.task} onChange={(e) => up(t.id, "task", e.target.value)} />
                    {over && <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle size={12} />Overdue</span>}
                    <input type="date" className={`text-xs border rounded-md px-1 py-1 ${over ? "border-red-200 text-red-600" : "border-slate-200 text-slate-500"}`} value={t.due} onChange={(e) => up(t.id, "due", e.target.value)} />
                    <button className="text-slate-300 hover:text-red-500" aria-label="Delete task" onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

/* ---------------- Survey (quick mode) ---------------- */
function SurveyView({ surv, setSurv }) {
  const [f, setF] = useState({ venue: "", segment: "Garba", flavour: "", pay: "" });
  const [showAll, setShowAll] = useState(false);
  const n = surv.length;
  const cnt = (k, v) => surv.filter((r) => r[k] === v).length;
  const pct30 = n ? Math.round(((cnt("pay", "₹30") + cnt("pay", "₹50")) / n) * 100) : 0;
  const ready = f.flavour && f.pay;
  const save = () => { if (!ready) return; setSurv([{ id: uid(), date: today(), venue: f.venue, segment: f.segment, flavour: f.flavour, pay: f.pay, comment: "" }, ...surv]); setF({ ...f, flavour: "", pay: "" }); };
  const Pick = ({ label, k, opts }) => (
    <div className="mb-5">
      <div className="text-xs font-medium text-slate-500 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => setF({ ...f, [k]: o })}
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${f[k] === o ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <Panel className="lg:col-span-3" title="New response" icon={ClipboardList}>
        <input className={`${inputCls} mb-5`} placeholder="Venue (stays filled between responses)" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} />
        <Pick label="Who" k="segment" opts={SEGS} />
        <Pick label="Best flavour" k="flavour" opts={FLAVOURS} />
        <Pick label="Would buy 250 ml at (highest yes)" k="pay" opts={PAYS} />
        <button onClick={save} disabled={!ready} className={`${btn} w-full py-3 text-base ${ready ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-slate-100 text-slate-400"}`}><Check size={18} />Save response</button>
        <p className="text-xs text-slate-500 mt-2">Ask the price high to low: ₹50, then ₹30, then ₹20.</p>
      </Panel>
      <div className="lg:col-span-2 space-y-4 min-w-0">
        <Panel title="Results" icon={TrendingUp}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><div className="text-xs text-slate-500">Responses</div><div className="text-2xl font-bold">{n}</div></div>
            <div><div className="text-xs text-slate-500">Would pay ₹30+</div><div className={`text-2xl font-bold ${n && pct30 >= 60 ? "text-green-600" : "text-slate-900"}`}>{pct30}%</div><div className="text-xs text-slate-400">target 60%</div></div>
          </div>
          <div className="text-xs font-medium text-slate-500 mb-2">Flavour</div>
          {FLAVOURS.map((fl) => { const c = cnt("flavour", fl); return <div key={fl} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{fl}</span><div className="col-span-2"><Bar value={c} max={n} color="#16A34A" /></div><span className="text-right font-medium">{c}</span></div>; })}
          <div className="text-xs font-medium text-slate-500 mb-2 mt-4">Price</div>
          {PAYS.map((p) => { const c = cnt("pay", p); return <div key={p} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{p}</span><div className="col-span-2"><Bar value={c} max={n} /></div><span className="text-right font-medium">{c}</span></div>; })}
        </Panel>
        <button className={`${btnGhost} w-full`} onClick={() => setShowAll(!showAll)}><TableIcon size={16} />{showAll ? "Hide responses" : "View and edit responses"}</button>
      </div>
      {showAll && <div className="lg:col-span-5"><Grid rows={surv} setRows={setSurv} cols={survCols} filterKey="segment" blank={{ date: today(), segment: "Garba" }} /></div>}
    </div>
  );
}

/* ---------------- Sales ---------------- */
function SalesView({ sales, setSales }) {
  const [f, setF] = useState<any>({ customer: "", product: "Cup 200 ml", qty: 1, rate: 20, paid: "Yes" });
  const add = (o) => setSales([{ id: uid(), date: today(), notes: "", ...o }, ...sales]);
  const tot = sales.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
  const paid = sales.filter((r) => r.paid === "Yes").reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
  const units = sales.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={TrendingUp} label="Revenue" value={inr(tot)} />
        <Stat icon={Wallet} label="Collected" value={inr(paid)} hint={tot - paid > 0 ? `${inr(tot - paid)} pending` : "Nothing pending"} />
        <Stat icon={ShoppingCart} label="Units" value={units} />
      </div>
      <Panel title="Add sale" icon={Plus}>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-slate-500 self-center mr-1">Walk-in cup:</span>
          {[10, 15, 20, 30].map((p) => <button key={p} className={btnGhost} onClick={() => add({ customer: "Walk-in", product: "Cup 200 ml", qty: 1, rate: p, paid: "Yes" })}><Plus size={14} />₹{p}</button>)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input className={`${inputCls} col-span-2`} placeholder="Customer" value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })} />
          <input className={inputCls} placeholder="Product" value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Rate" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} />
          <select className={inputCls} value={f.paid} onChange={(e) => setF({ ...f, paid: e.target.value })}><option value="Yes">Paid</option><option value="No">Not paid</option></select>
        </div>
        <button className={`${btnPrimary} mt-3`} onClick={() => { if (!f.customer.trim()) return; add(f); setF({ ...f, customer: "" }); }}><Plus size={16} />Add sale</button>
      </Panel>
      {sales.length ? <Grid rows={sales} setRows={setSales} cols={saleCols} blank={{ date: today(), product: "Cup 200 ml", qty: 1, rate: 20, paid: "Yes" }} /> : <Panel><Empty icon={ShoppingCart} text="No sales yet. Use the buttons above at your stall." /></Panel>}
    </div>
  );
}

/* ---------------- Budget ---------------- */
function BudgetView({ bud, setBud, k }) {
  const left = k.plan - k.spent;
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap justify-between items-end gap-2 mb-3">
          <div><div className="text-xs text-slate-500">Spent</div><div className="text-2xl font-bold">{inr(k.spent)} <span className="text-sm font-normal text-slate-400">of {inr(k.plan)}</span></div></div>
          <div className={`text-sm font-semibold ${left < 0 ? "text-red-600" : "text-green-700"}`}>{inr(left)} left</div>
        </div>
        <Bar value={k.spent} max={k.plan} />
        <div className="mt-5 space-y-3">
          {bud.map((b) => { const p = Number(b.planned) || 0, a = Number(b.actual) || 0; return (
            <div key={b.id}>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{b.bucket}</span><span className={`font-medium ${a > p ? "text-red-600" : "text-slate-600"}`}>{inr(a)} / {inr(p)}</span></div>
              <Bar value={a} max={p} color={a > p ? "#DC2626" : "#16A34A"} />
            </div>); })}
        </div>
      </Panel>
      <Grid rows={bud} setRows={setBud} cols={budCols} blank={{ bucket: "New item", planned: 0, actual: 0 }} />
    </div>
  );
}

/* ---------------- Map ---------------- */
const AREAS = [["Changodar", 22.925, 72.445], ["Bopal", 23.036, 72.462], ["Prahlad Nagar", 23.004, 72.508], ["SG Hwy / Bodakdev", 23.05, 72.505], ["Navrangpura", 23.052, 72.556], ["Motera", 23.112, 72.6], ["Naroda GIDC", 23.1, 72.68], ["Odhav", 23.012, 72.672], ["Vatva GIDC", 22.965, 72.64], ["Chandkheda", 23.125, 72.57], ["Sarkhej", 22.978, 72.49]];
function MapView({ sup, buy }) {
  const [show, setShow] = useState({ s: true, b: true });
  const [sel, setSel] = useState(null);
  const W = 900, H = 560, B = { n: 23.14, s: 22.88, w: 72.4, e: 72.72 };
  const x = (lng) => ((lng - B.w) / (B.e - B.w)) * W;
  const y = (lat) => ((B.n - lat) / (B.n - B.s)) * H;
  const pts = [
    ...(show.s ? sup.filter((r) => r.lat).map((r) => ({ ...r, kind: "Supplier", grp: r.cat })) : []),
    ...(show.b ? buy.filter((r) => r.lat).map((r) => ({ ...r, kind: "Buyer", grp: r.seg })) : []),
  ];
  const river = [[23.14, 72.605], [23.1, 72.59], [23.06, 72.578], [23.03, 72.573], [23.0, 72.576], [22.96, 72.568], [22.88, 72.555]].map(([la, ln]) => `${x(ln)},${y(la)}`).join(" ");
  const grps = Array.from(new Set<any>(pts.map((p) => p.grp)));
  const Toggle = ({ on, onClick, square = false, children }) => (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}`}>
      <span className={`w-2 h-2 ${square ? "rounded-sm" : "rounded-full"} ${on ? "bg-white" : "bg-slate-400"}`} />{children}
    </button>
  );
  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <Toggle on={show.s} square onClick={() => setShow({ ...show, s: !show.s })}>Suppliers</Toggle>
        <Toggle on={show.b} onClick={() => setShow({ ...show, b: !show.b })}>Buyers</Toggle>
        <span className="text-xs text-slate-500 ml-auto">{pts.length} places</span>
      </div>
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-200 bg-white">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <rect width={W} height={H} fill="#F8FAFC" />
            {[...Array(9)].map((_, i) => <line key={"v" + i} x1={(i + 1) * 90} y1="0" x2={(i + 1) * 90} y2={H} stroke="#EEF2F6" />)}
            {[...Array(6)].map((_, i) => <line key={"h" + i} x1="0" y1={(i + 1) * 80} x2={W} y2={(i + 1) * 80} stroke="#EEF2F6" />)}
            <polyline points={river} fill="none" stroke="#BFDBFE" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            {AREAS.map(([n, la, ln]) => <text key={n} x={x(ln)} y={y(la)} fontSize="12" fontWeight="600" fill="#94A3B8" textAnchor="middle">{n}</text>)}
            {pts.map((p) => {
              const cx = x(Number(p.lng)), cy = y(Number(p.lat)), c = COL[p.grp] || "#333", on = sel && sel.id === p.id;
              return p.kind === "Supplier"
                ? <rect key={p.id} x={cx - 7} y={cy - 7} width="14" height="14" rx="3" fill={c} stroke={on ? "#0F172A" : "#fff"} strokeWidth={on ? 3 : 2} style={{ cursor: "pointer" }} onClick={() => setSel(p)}><title>{p.name}</title></rect>
                : <circle key={p.id} cx={cx} cy={cy} r={on ? 10 : 7.5} fill={c} stroke={on ? "#0F172A" : "#fff"} strokeWidth={on ? 3 : 2} style={{ cursor: "pointer" }} onClick={() => setSel(p)}><title>{p.name}</title></circle>;
            })}
          </svg>
        </div>
        <div className="space-y-3">
          <Panel>
            {sel ? (
              <div className="space-y-2">
                <Tag color={COL[sel.grp]}>{sel.kind} · {sel.grp}</Tag>
                <div className="font-semibold text-slate-900">{sel.name}</div>
                <div className="text-sm text-slate-500">{sel.area}{sel.phone ? ` · ${sel.phone}` : ""}</div>
                <div className="text-sm"><span className="text-slate-500">Status </span><span className="font-medium" style={{ color: STATUS_COL[sel.status] }}>{sel.status}</span></div>
                <div className="text-xs text-slate-500">{sel.use || sel.why}</div>
                <div className="pt-1"><ContactIcons r={sel} /></div>
              </div>
            ) : <Empty icon={MapPin} text="Select a pin to see details." />}
          </Panel>
          <Panel title="Legend">{grps.map((g) => <div key={g} className="flex items-center gap-2 py-1 text-xs text-slate-600"><Dot color={COL[g]} />{g}</div>)}</Panel>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Schematic plot from coordinates, not a street map. Use the map-pin icon for directions.</p>
    </div>
  );
}

/* ---------------- Brand & Bottle ---------------- */
const BOTTLE = "M65,40 L95,40 L95,70 C95,86 140,98 140,130 L140,345 C140,362 128,372 112,372 L48,372 C32,372 20,362 20,345 L20,130 C20,98 65,86 65,70 Z";
function Bottle({ id, cap, liquid, children }) {
  return (
    <svg viewBox="0 0 160 390" width="150" height="366">
      <defs>
        <clipPath id={"c" + id}><path d={BOTTLE} /></clipPath>
        <linearGradient id={"g" + id} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".3" stopColor="#fff" stopOpacity="0" /><stop offset=".85" stopColor="#000" stopOpacity=".08" /></linearGradient>
      </defs>
      <ellipse cx="80" cy="378" rx="62" ry="7" fill="#000" opacity=".1" />
      <path d={BOTTLE} fill={liquid} opacity=".85" />
      <g clipPath={`url(#c${id})`}>{children}<rect x="0" y="0" width="160" height="390" fill={`url(#g${id})`} /></g>
      <path d={BOTTLE} fill="none" stroke="#0003" strokeWidth="1.2" />
      <rect x="58" y="12" width="44" height="30" rx="5" fill={cap} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={61 + i * 6} y="15" width="2" height="24" fill="#0002" />)}
      <rect x="56" y="40" width="48" height="5" rx="2" fill={cap} opacity=".8" />
    </svg>
  );
}
function Mockups() {
  const Cap = ({ t, s }) => <div className="mt-2"><div className="text-sm font-semibold text-slate-900">{t}</div><div className="text-xs text-slate-500">{s}</div></div>;
  return (
    <div className="flex flex-wrap gap-8 justify-center items-end">
      <div className="text-center">
        <Bottle id="r" cap="#E4572E" liquid="#F3EFC4">
          <defs><pattern id="hex" width="14" height="12" patternUnits="userSpaceOnUse"><polygon points="7,0 14,3.5 14,8.5 7,12 0,8.5 0,3.5" fill="none" stroke="#E8D3B0" strokeWidth="1" /></pattern></defs>
          <rect x="0" y="158" width="160" height="150" fill="#FFF6E6" /><rect x="0" y="158" width="160" height="150" fill="url(#hex)" />
          <rect x="0" y="158" width="160" height="10" fill="#E4572E" /><rect x="0" y="298" width="160" height="10" fill="#E4572E" />
          <text x="80" y="212" textAnchor="middle" fontSize="36" fontWeight="900" fill="#3B1F0E" letterSpacing="3">RANN</text>
          <text x="80" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E4572E">NIMBU · JEERA · NAMAK</text>
          <text x="80" y="250" textAnchor="middle" fontSize="8" fill="#3B1F0E">Electrolyte Drink</text>
          <circle cx="80" cy="270" r="9" fill="#F7C948" /><circle cx="80" cy="270" r="5.5" fill="none" stroke="#fff" strokeWidth="1.2" />
          <text x="80" y="292" textAnchor="middle" fontSize="7.5" fill="#3B1F0E">250 ml · Salt of Kutch</text>
        </Bottle>
        <Cap t="RANN" s="Salt-flat pattern, saffron cap" />
      </div>
      <div className="text-center">
        <Bottle id="j" cap="#0B6E4F" liquid="#DDF3E8">
          <rect x="0" y="158" width="160" height="150" fill="#0A1630" />
          <path d="M80,176 L100,184 L100,204 C100,218 90,226 80,230 C70,226 60,218 60,204 L60,184 Z" fill="#00B4EE" />
          <path d="M80,190 C86,198 88,204 84,210 C82,214 78,214 76,210 C72,204 74,198 80,190 Z" fill="#fff" />
          <text x="80" y="254" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">JalKavach</text>
          <text x="80" y="270" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7FE3FF">HEAT-SHIFT HYDRATION</text>
          <text x="80" y="292" textAnchor="middle" fontSize="7.5" fill="#B9C8E4">Nimbu · Electrolytes · 250 ml</text>
        </Bottle>
        <Cap t="JalKavach" s="Shield mark, B2B look" />
      </div>
      <div className="text-center">
        <Bottle id="t" cap="#7CC800" liquid="#EEF9C8">
          <rect x="0" y="158" width="160" height="150" fill="#FFFFFF" />
          <circle cx="118" cy="190" r="34" fill="#F7E04A" /><circle cx="118" cy="190" r="27" fill="#FBF3A8" />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={118 - 27 * Math.cos((a * Math.PI) / 180)} y1={190 - 27 * Math.sin((a * Math.PI) / 180)} x2={118 + 27 * Math.cos((a * Math.PI) / 180)} y2={190 + 27 * Math.sin((a * Math.PI) / 180)} stroke="#F7E04A" strokeWidth="2" />)}
          <text x="24" y="246" fontSize="34" fontWeight="900" fill="#1F7A1F">taazu</text>
          <text x="26" y="264" fontSize="8.5" fontWeight="700" fill="#E4572E">nimbu-namak electrolyte</text>
          <text x="26" y="292" fontSize="7.5" fill="#555">Low sugar* · 250 ml</text>
        </Bottle>
        <Cap t="Taazu" s="Lemon slice, playful" />
      </div>
      <div className="text-center">
        <svg viewBox="0 0 120 300" width="100" height="250">
          <path d="M20,20 L100,20 L100,280 L20,280 Z" fill="#FFF6E6" stroke="#E8D3B0" />
          {[...Array(9)].map((_, i) => <path key={i} d={`M${20 + i * 10},20 l5,-6 l5,6`} fill="#FFF6E6" stroke="#E8D3B0" />)}
          <rect x="20" y="40" width="80" height="8" fill="#E4572E" />
          <text x="60" y="100" textAnchor="middle" fontSize="22" fontWeight="900" fill="#3B1F0E" transform="rotate(-90 60 150)">RANN</text>
          <text x="60" y="235" textAnchor="middle" fontSize="7" fontWeight="700" fill="#E4572E">STICK · MAKES 500 ml</text>
          <rect x="20" y="252" width="80" height="8" fill="#E4572E" />
        </svg>
        <Cap t="RANN stick" s="Same look for powder" />
      </div>
    </div>
  );
}
function BrandView() {
  const must = [
    "Brand + true name: \"Non-carbonated water-based flavoured beverage with electrolytes\"",
    "Ingredients in descending order; green veg logo",
    "Nutrition per 100 ml (energy, carbs, total & added sugar, sodium, potassium)",
    "FSSAI logo + brand owner's and manufacturer's licence numbers & addresses",
    "Net quantity, MRP (incl. taxes), batch, date of manufacture, best before",
    "Consumer-care contact; allergen & sweetener notes if applicable",
  ];
  const avoid = ["\"ORS\" anywhere on the pack", "\"Health drink\" or any cure / disease claim", "\"Low sugar\" unless the lab report supports it"];
  const tips = ["Use the co-packer's stock bottle and cap", "Wrap-around label ~60–70 mm tall (confirm with printer)", "Brand readable from 2 metres", "One colour per flavour; same layout on sachet", "QR code to WhatsApp for reorders", "Print one batch + 20% of labels for the pilot"];
  return (
    <div className="space-y-4">
      <Panel title="Name ideas" icon={Star}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRANDS.map((b) => (
            <div key={b.name} className={`rounded-lg p-3 border ${b.top ? "border-orange-300 bg-orange-50" : "border-slate-200"}`}>
              <div className="flex justify-between items-center gap-2">
                <div className="text-lg font-bold text-slate-900">{b.name}</div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${b.top ? "text-orange-700" : "text-slate-500"}`}>{b.top && <Star size={12} />}{b.pick}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{b.meaning}</div>
              <div className="text-sm text-slate-700 mt-2">{b.why}</div>
              <div className="text-xs text-slate-500 mt-2">Trademark risk: {b.risk}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Search your pick on the IP India trademark portal (class 32) before printing anything.</p>
      </Panel>
      <Panel title="Bottle mockups · 250 ml stock PET" icon={Palette}>
        <div className="bg-slate-50 rounded-lg p-6"><Mockups /></div>
        <p className="text-xs text-slate-500 mt-3">Concept designs on a standard bottle shape — only the label and cap colour change, so no mould cost.</p>
      </Panel>
      <div className="grid md:grid-cols-3 gap-4">
        <Panel title="Label must include" icon={ListChecks}>
          <ul className="space-y-2">{must.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="text-green-600 shrink-0 mt-0.5" />{m}</li>)}</ul>
        </Panel>
        <Panel title="Never put on the label" icon={AlertCircle}>
          <ul className="space-y-2">{avoid.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><X size={16} className="text-red-600 shrink-0 mt-0.5" />{m}</li>)}</ul>
          <div className="mt-4 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">Competitors launched in 2026: Reliance RasKik Gluco Energy (electrolytes + lemon, ₹10), AQUON and No Secrets sachets. Win on taste or sell where they aren't — direct B2B.</div>
        </Panel>
        <Panel title="Design tips" icon={Palette}>
          <ul className="space-y-2">{tips.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="text-slate-400 shrink-0 mt-0.5" />{m}</li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */
/* =========================================================
   QR SURVEY — public form (for customers) + manage page (for you)
   Responses go to your Google Sheet via a small Apps Script.
   ========================================================= */
const CFG_KEY = "hq-survey-cfg";
const APPS_SCRIPT = `const KEY = "change-this-secret";   // type the same secret in the app
const SHEET = "Responses";
const HEAD = ["id","time","venue","segment","flavour","pay","phone","comment"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) { s = ss.insertSheet(SHEET); s.appendRow(HEAD); }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
function clean_(v) {
  const s = String(v || "").slice(0, 200);
  return /^[=+\\-@]/.test(s) ? "'" + s : s;
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    sheet_().appendRow([clean_(d.id), new Date(), clean_(d.venue), clean_(d.segment),
      clean_(d.flavour), clean_(d.pay), clean_(d.phone), clean_(d.comment)]);
    return out_({ ok: true });
  } finally { lock.releaseLock(); }
}
function doGet(e) {
  if (!e.parameter.key || e.parameter.key !== KEY) return out_({ ok: false, error: "Wrong key" });
  const v = sheet_().getDataRange().getValues();
  const rows = v.slice(1).map(r => Object.fromEntries(HEAD.map((h, i) => [h, r[i]])));
  return out_({ ok: true, rows });
}`;

const defaultBase = () => (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
const surveyLink = (cfg) => {
  const base = (cfg.base || defaultBase()).trim();
  const p = new URLSearchParams({ s: "1", e: (cfg.endpoint || "").trim() });
  if (cfg.venue) p.set("v", cfg.venue.trim());
  return `${base}${base.includes("?") ? "&" : "?"}${p.toString()}`;
};
const copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch (e) { return false; } };

function useSurveyCfg() {
  const [cfg, setCfg] = useState({ endpoint: "", key: "", base: "", venue: "" });
  useEffect(() => {
    (async () => {
      try { if (window.storage) { const r = await window.storage.get(CFG_KEY, false); if (r && r.value) setCfg((c) => ({ ...c, ...JSON.parse(r.value) })); } } catch (e) { /* not set yet */ }
    })();
  }, []);
  const save = (next) => {
    setCfg(next);
    try { window.storage && Promise.resolve(window.storage.set(CFG_KEY, JSON.stringify(next), false)).catch(() => {}); } catch (e) { /* ignore */ }
  };
  return [cfg, save] as const;
}

/* ---- what customers see after scanning the QR ---- */
function PublicSurvey() {
  const p = new URLSearchParams(window.location.search);
  const endpoint = p.get("e") || "";
  const venue = p.get("v") || "";
  const [f, setF] = useState({ segment: "", flavour: "", pay: "", phone: "", comment: "", consent: false });
  const [state, setState] = useState("form");
  const ready = f.flavour && f.pay && (!f.phone.trim() || f.consent);
  const submit = async () => {
    if (!ready) return;
    setState("sending");
    const payload = { id: uid() + Date.now().toString(36), venue, segment: f.segment || "Other", flavour: f.flavour, pay: f.pay, phone: f.phone.trim(), comment: f.comment.trim() };
    try { await fetch(endpoint, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) }); setState("done"); }
    catch (e) { setState("error"); }
  };
  const Q = ({ n, en, gu, k, opts }) => (
    <div className="mb-6">
      <div className="text-sm font-semibold text-slate-900">{n}. {en}</div>
      <div className="text-xs text-slate-500 mb-3">{gu}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map(([v, label]) => (
          <button key={v} onClick={() => setF({ ...f, [k]: v })}
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${f[k] === v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>{label}</button>
        ))}
      </div>
    </div>
  );
  const shell = (children) => (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white"><Droplets size={18} /></div><span className="font-semibold text-slate-900">Quick taste survey</span></div>
        {children}
      </div>
    </div>
  );
  if (!endpoint) return shell(<div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600">This survey link isn't set up yet.</div>);
  if (state === "done") return shell(
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
      <div className="text-lg font-semibold text-slate-900">Thank you</div>
      <div className="text-sm text-slate-500 mt-1">આભાર! Your answer helps us make a better drink.</div>
    </div>
  );
  return shell(
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-6">3 quick questions · about 20 seconds{venue ? ` · ${venue}` : ""}</p>
      <Q n={1} en="Which flavour did you like most?" gu="તમને કયો સ્વાદ સૌથી વધુ ગમ્યો?" k="flavour" opts={FLAVOURS.map((x) => [x, x])} />
      <Q n={2} en="Would you buy a 250 ml bottle at…" gu="250 ml બોટલ કેટલા રૂપિયામાં લેશો?" k="pay" opts={[["₹50", "₹50"], ["₹30", "₹30"], ["₹20", "₹20"], ["₹10", "₹10"], ["None", "Wouldn't buy"]]} />
      <Q n={3} en="You are mostly…" gu="તમે મુખ્યત્વે…" k="segment" opts={SEGS.map((x) => [x, x])} />
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Want a free sample at launch? <span className="font-normal text-slate-500">(optional)</span></div>
        <input className={`${inputCls} mt-2`} inputMode="tel" placeholder="WhatsApp number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        {f.phone.trim() && (
          <label className="flex items-start gap-2 text-xs text-slate-600 mt-2">
            <input type="checkbox" className="mt-0.5" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            I agree to be contacted on WhatsApp about this drink. My number won't be shared.
          </label>
        )}
      </div>
      <textarea className={`${inputCls} mb-5`} rows={2} placeholder="Anything else? (optional)" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
      <button onClick={submit} disabled={!ready || state === "sending"} className={`${btn} w-full py-3 text-base ${ready ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"}`}>
        <Send size={18} />{state === "sending" ? "Sending…" : "Submit"}
      </button>
      {state === "error" && <p className="text-xs text-red-600 mt-2">Couldn't send. Please check your internet and try again.</p>}
    </div>
  );
}

/* ---- manage page (for you) ---- */
function QrSurveyView({ surv, setSurv }) {
  const [cfg, saveCfg] = useSurveyCfg();
  const [draft, setDraft] = useState(null);
  const d = draft || cfg;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [help, setHelp] = useState(false);
  const flash = (m) => { setNote(m); setTimeout(() => setNote(""), 2200); };
  const connected = !!cfg.endpoint;
  const link = connected ? surveyLink(cfg) : "";
  const qr = (n) => `https://api.qrserver.com/v1/create-qr-code/?size=${n}x${n}&margin=12&data=${encodeURIComponent(link)}`;
  const inPreview = !cfg.base && /claude|anthropic|usercontent/i.test(defaultBase());

  const load = async () => {
    if (!cfg.endpoint || !cfg.key) { setErr("Add the sheet URL and secret key first."); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${cfg.endpoint}?key=${encodeURIComponent(cfg.key)}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Wrong key");
      setRows((j.rows || []).reverse());
    } catch (e) { setErr("Couldn't load responses. Check the sheet URL and secret key. Loading only works on your hosted site, not inside the Claude preview."); }
    setLoading(false);
  };
  const importRows = () => {
    const have = new Set(surv.map((s) => s.id));
    const add = rows.filter((r) => !have.has("qr-" + r.id)).map((r) => ({
      id: "qr-" + r.id, date: String(r.time || "").slice(0, 10), venue: r.venue || "QR", segment: r.segment || "Other",
      flavour: r.flavour, pay: r.pay, comment: [r.comment, r.phone ? "Phone: " + r.phone : ""].filter(Boolean).join(" · "),
    }));
    setSurv([...add, ...surv]);
    flash(add.length ? `${add.length} responses added to Survey` : "Survey is already up to date");
  };

  const n = rows.length;
  const c = (k, v) => rows.filter((r) => r[k] === v).length;
  const pct = n ? Math.round(((c("pay", "₹30") + c("pay", "₹50")) / n) * 100) : 0;
  const phones = rows.filter((r) => r.phone).length;
  const venues = Array.from(new Set<any>(rows.map((r) => r.venue || "—")));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* QR card */}
        <Panel title="Your QR code" icon={QrCode}>
          {connected ? (
            <div className="text-center">
              <img src={qr(260)} alt="Survey QR code" width="220" height="220" className="mx-auto rounded-lg border border-slate-200" />
              {cfg.venue && <div className="text-xs text-slate-500 mt-2">Venue tag: {cfg.venue}</div>}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <a href={qr(1000)} target="_blank" rel="noreferrer" className={`${btnGhost} text-xs px-2`}><Download size={14} />Print file</a>
                <button className={`${btnGhost} text-xs px-2`} onClick={async () => flash((await copyText(link)) ? "Link copied" : "Copy failed — select the link below")}><Copy size={14} />Copy link</button>
                <a href={link} target="_blank" rel="noreferrer" className={`${btnGhost} text-xs px-2`}><ExternalLink size={14} />Test</a>
              </div>
              <div className="text-left text-xs text-slate-400 break-all mt-3 bg-slate-50 rounded-lg p-2">{link}</div>
              {inPreview && <p className="text-left text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">Set "Public app address" to your hosted link (e.g. your Netlify URL). A QR made inside the Claude preview won't open for customers.</p>}
            </div>
          ) : <Empty icon={QrCode} text="Connect your Google Sheet to create the QR." />}
        </Panel>

        {/* setup */}
        <Panel className="lg:col-span-2" title="Setup" icon={Link2} action={<span className={`inline-flex items-center gap-1 text-xs font-medium ${connected ? "text-green-700" : "text-slate-500"}`}>{connected ? <CheckCircle2 size={14} /> : <Circle size={14} />}{connected ? "Connected" : "Not connected"}</span>}>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs text-slate-500 md:col-span-2">Response sheet URL (Apps Script web app, ends with /exec)
              <input className={`${inputCls} mt-1`} placeholder="https://script.google.com/macros/s/…/exec" value={d.endpoint} onChange={(e) => setDraft({ ...d, endpoint: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">Secret key (same as in the script)
              <input className={`${inputCls} mt-1`} type="password" placeholder="your secret word" value={d.key} onChange={(e) => setDraft({ ...d, key: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">Venue tag for this QR (optional)
              <input className={`${inputCls} mt-1`} placeholder="e.g. Garba – Day 3" value={d.venue} onChange={(e) => setDraft({ ...d, venue: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500 md:col-span-2">Public app address
              <input className={`${inputCls} mt-1`} placeholder={defaultBase() || "https://your-site.netlify.app/"} value={d.base} onChange={(e) => setDraft({ ...d, base: e.target.value })} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className={btnPrimary} disabled={!draft} onClick={() => { saveCfg(d); setDraft(null); flash("Settings saved"); }}><Check size={16} />Save</button>
            <button className={btnGhost} onClick={() => setHelp(!help)}><ListChecks size={16} />{help ? "Hide setup steps" : "How to connect Google Sheets"}</button>
            {note && <span className="self-center text-xs text-green-700">{note}</span>}
          </div>
          {help && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <ol className="space-y-2 text-sm text-slate-700 list-decimal ml-5">
                <li>Open <b>sheets.new</b> and name the sheet "Survey responses".</li>
                <li>Go to <b>Extensions → Apps Script</b>. Delete what's there and paste the code below. Change <code className="bg-slate-100 px-1 rounded">change-this-secret</code> to your own secret word.</li>
                <li>Click <b>Deploy → New deployment</b>, choose type <b>Web app</b>. Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>. Deploy and allow access.</li>
                <li>Copy the <b>Web app URL</b> (ends with <code className="bg-slate-100 px-1 rounded">/exec</code>). Paste it above with your secret word, add your hosted link as the public address, and Save.</li>
                <li>Print the QR. Each answer appears as a new row in your sheet.</li>
              </ol>
              <div className="relative mt-3">
                <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto" style={{ maxHeight: 260 }}>{APPS_SCRIPT}</pre>
                <button className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs bg-slate-700 text-white rounded-md px-2 py-1" onClick={async () => flash((await copyText(APPS_SCRIPT)) ? "Code copied" : "Copy failed — select the code manually")}><Copy size={12} />Copy</button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Keep the secret word private. Anyone can submit the form, but only someone with the secret can read answers and phone numbers.</p>
            </div>
          )}
        </Panel>
      </div>

      {/* responses */}
      <Panel title="Responses" icon={ClipboardList} action={
        <div className="flex gap-2">
          <button className={`${btnGhost} text-xs`} onClick={load} disabled={loading}><RefreshCw size={14} className={loading ? "animate-spin" : ""} />{loading ? "Loading" : "Refresh"}</button>
          <button className={`${btnPrimary} text-xs`} onClick={importRows} disabled={!n}><Download size={14} />Add to Survey</button>
        </div>
      }>
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        {n ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div><div className="text-xs text-slate-500">Responses</div><div className="text-2xl font-bold">{n}</div></div>
              <div><div className="text-xs text-slate-500">Would pay ₹30+</div><div className={`text-2xl font-bold ${pct >= 60 ? "text-green-600" : ""}`}>{pct}%</div></div>
              <div><div className="text-xs text-slate-500">Sample requests</div><div className="text-2xl font-bold">{phones}</div></div>
              <div><div className="text-xs text-slate-500">Venues</div><div className="text-2xl font-bold">{venues.length}</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>{FLAVOURS.map((fl) => { const x = c("flavour", fl); return <div key={fl} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{fl}</span><div className="col-span-2"><Bar value={x} max={n} color="#16A34A" /></div><span className="text-right font-medium">{x}</span></div>; })}</div>
              <div>{PAYS.map((p) => { const x = c("pay", p); return <div key={p} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{p === "None" ? "Wouldn't buy" : p}</span><div className="col-span-2"><Bar value={x} max={n} /></div><span className="text-right font-medium">{x}</span></div>; })}</div>
            </div>
            <div className="overflow-auto border border-slate-200 rounded-lg" style={{ maxHeight: 420 }}>
              <table className="text-xs w-full">
                <thead className="sticky top-0"><tr>{["Time", "Venue", "Who", "Flavour", "Would pay", "Phone", "Comment"].map((h) => <th key={h} className="bg-slate-50 text-slate-500 text-left px-3 py-2 font-semibold border-b border-slate-200">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{String(r.time || "").replace("T", " ").slice(0, 16)}</td>
                      <td className="px-3 py-2">{r.venue}</td><td className="px-3 py-2">{r.segment}</td><td className="px-3 py-2">{r.flavour}</td>
                      <td className="px-3 py-2 font-medium">{r.pay === "None" ? "Wouldn't buy" : r.pay}</td>
                      <td className="px-3 py-2">{r.phone ? <span className="inline-flex items-center gap-1">{r.phone}<IconLink href={waHref(r.phone)} icon={MessageCircle} label="WhatsApp" tone="green" external /></span> : "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : !err && <Empty icon={ClipboardList} text={connected ? "Press Refresh to load answers from your sheet." : "Connect your sheet to see answers here."} />}
      </Panel>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */
const NAV_GROUPS = [
  { label: "Work", items: [{ id: "Today", icon: Home }, { id: "Buyers", icon: Users }, { id: "Suppliers", icon: Factory }, { id: "Map", icon: MapIcon }, { id: "Tasks", icon: ListChecks }] },
  { label: "Record", items: [{ id: "Survey", icon: ClipboardList }, { id: "QR Survey", icon: QrCode }, { id: "Sales", icon: ShoppingCart }] },
  { label: "Plan", items: [{ id: "Budget", icon: Wallet }, { id: "Brand", icon: Palette }] },
  { label: "App", items: [{ id: "Settings", icon: Settings }] },
];
const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
const MOBILE_MAIN = ["Today", "Suppliers", "Buyers", "Tasks"];
const SUBS = {
  Buyers: "Real Ahmedabad businesses, priority A first. Public listings — confirm details on the first call.",
  Suppliers: "Call, log what they said, set the next follow-up. Public listings — verify before paying.",
  Map: "Everything with an exact location. Plan visits by area.",
  Tasks: "From now to the February pilot.",
  Survey: "Three taps per person.",
  "QR Survey": "Customers scan and answer on their own phone. Answers land in your Google Sheet.",
  Sales: "Pilot rule: cash or UPI only.",
  Budget: "₹55,000 trial — planned vs actual.",
  Brand: "Names, bottle concepts and label rules.",
  Settings: "Team, login, list view and your data.",
};
const STORE_KEY = "elec-tracker-v1";
const COLLECTIONS = ["sup", "buy", "tasks", "bud", "sales", "surv", "logs"];

/* Customers who scan the QR (link has ?s=1) see only the survey form. */
export default function App() {
  const isSurvey = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("s") === "1";
  return isSurvey ? <PublicSurvey /> : <AuthGate><MainApp /></AuthGate>;
}

function MainApp() {
  const [tab, setTab] = useState(() => { const t = new URLSearchParams(window.location.search).get("tab"); return ALL_NAV.some((n) => n.id === t) ? t : "Today"; });
  const [sup, setSup] = useState(SUPPLIERS);
  const [buy, setBuy] = useState(BUYERS);
  const [tasks, setTasks] = useState(TASKS);
  const [bud, setBud] = useState(BUDGET);
  const [sales, setSales] = useState([]);
  const [surv, setSurv] = useState([]);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState("");
  const [armReset, setArmReset] = useState(false);
  const [more, setMore] = useState(false);

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const go = (id) => { setTab(id); setMore(false); };

  /* cloud sync (Supabase, realtime) */
  const auth = useAuth();
  const me = auth.me?.display_name || auth.session.user.email?.split("@")[0] || "";
  const data = useMemo(() => ({ sup, buy, tasks, bud, sales, surv, logs }), [sup, buy, tasks, bud, sales, surv, logs]);
  const replaceAll = useCallback((d) => {
    d.sup && setSup(enrich(d.sup).map((r) => ({ ...r, status: normalizeStage(SUPPLIER_CFG, r.status, { Called: "Contacted", Selected: "Finalized" }) })));
    d.buy && setBuy(enrich(d.buy)); d.tasks && setTasks(d.tasks); d.bud && setBud(d.bud);
    d.sales && setSales(d.sales); d.surv && setSurv(d.surv); d.logs && setLogs(d.logs);
  }, []);
  const seed = useCallback(() => {
    // First sync of a new team: this device's old local data, else the starter lists.
    let d: any = null;
    try { const raw = localStorage.getItem(STORE_KEY); d = raw ? JSON.parse(raw) : null; if (typeof d === "string") d = JSON.parse(d); } catch { d = null; }
    const base = { sup: SUPPLIERS(), buy: BUYERS(), tasks: TASKS(), bud: BUDGET(), sales: [], surv: [], logs: [] };
    const out = { ...base, ...(d || {}) };
    const ordered = (rows) => rows.map((r, i) => ({ ...r, _o: r._o ?? i }));
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, ordered(v as any[])]));
  }, []);
  const { status: syncStatus } = useSync({ workspaceId: auth.workspace.id, userId: auth.session.user.id, collections: COLLECTIONS, data, replaceAll, seed });

  const k = useMemo(() => {
    const spent = bud.reduce((s, r) => s + (Number(r.actual) || 0), 0);
    const plan = bud.reduce((s, r) => s + (Number(r.planned) || 0), 0);
    const saleAmt = sales.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
    const paid = sales.filter((r) => r.paid === "Yes").reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
    const warm = buy.filter((r) => ["Meeting", "Trial", "Customer"].includes(r.status)).length;
    const cust = buy.filter((r) => r.status === "Customer").length;
    const contacted = buy.filter((r) => r.status && r.status !== "New").length;
    const quotes = sup.filter((r) => ["Quote received", "Sample", "Negotiation", "Finalized"].includes(r.status));
    const okMoq = quotes.filter((r) => Number(r.moq) > 0 && Number(r.moq) <= 2000).length;
    const prices = quotes.map((r) => Number(r.price)).filter((p) => p > 0);
    const minP = prices.length ? Math.min(...prices) : null;
    const n = surv.length;
    const pct = n ? Math.round((surv.filter((r) => r.pay === "₹30" || r.pay === "₹50").length / n) * 100) : 0;
    const done = tasks.filter((t) => t.status === "Done").length;
    const t0 = today();
    const open = tasks.filter((t) => t.status !== "Done").sort((a, b) => (a.due || "").localeCompare(b.due || ""));
    const overdue = open.filter((t) => t.due && t.due < t0);
    const follow = buy.filter((r) => r.follow && r.follow <= t0 && !["Customer", "Lost"].includes(r.status)).sort((a, b) => a.follow.localeCompare(b.follow));
    const nextCalls = buy.filter((r) => r.status === "New" && r.priority === "A").slice(0, 5);
    const supDue = dueList(SUPPLIER_CFG, sup);
    const buyDue = dueList(BUYER_CFG, buy);
    return { supDue, buyDue, spent, plan, saleAmt, paid, warm, cust, contacted, quotes: quotes.length, okMoq, minP, n, pct, done, open, overdue, follow, nextCalls };
  }, [sup, buy, tasks, bud, sales, surv]);

  const gates = [
    { l: "Survey: 60%+ would pay ₹30 (min 30 replies)", ok: k.n >= 30 && k.pct >= 60, v: k.n ? `${k.pct}% of ${k.n}` : "No replies" },
    { l: "10 warm B2B leads", ok: k.warm >= 10, v: `${k.warm} of 10` },
    { l: "Co-packer MOQ 2,000 or less", ok: k.okMoq > 0, v: k.okMoq ? `${k.okMoq} quote(s)` : "No quote" },
    { l: "Landed cost ₹15 or less per 250 ml", ok: k.minP !== null && k.minP <= 15, v: k.minP !== null ? inr(k.minP) : "No price" },
  ];
  const gatesOk = gates.filter((g) => g.ok).length;

  /* ---- Excel export / import ---- */
  const plain = (cols) => cols.filter((c) => c.t !== "link");
  const rowsFor = (cols, rows) => rows.map((r) => { const o = {}; plain(cols).forEach((c) => (o[c.l] = c.calc ? c.calc(r) : r[c.k])); return o; });
  const sheet = (data, cols) => { const ws = XLSX.utils.json_to_sheet(data); ws["!cols"] = plain(cols).map((c) => ({ wch: Math.max(8, Math.round(c.w / 7)) })); return ws; };
  const geoSheet = (cols, rows) => {
    const data = rows.map((r) => ({ ...rowsFor(cols, [r])[0], Latitude: r.lat || "", Longitude: r.lng || "", "Place ID": r.pid || "", "Google Maps link": mapUrl(r) }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [...plain(cols).map((c) => ({ wch: Math.max(8, Math.round(c.w / 7)) })), { wch: 11 }, { wch: 11 }, { wch: 14 }, { wch: 45 }];
    const ci = Object.keys(data[0] || {}).indexOf("Google Maps link");
    data.forEach((d, i) => { const ref = XLSX.utils.encode_cell({ r: i + 1, c: ci }); if (ws[ref] && ws[ref].v) ws[ref].l = { Target: ws[ref].v, Tooltip: "Open in Google Maps" }; });
    return ws;
  };
  const exportXlsx = () => {
    const wb = XLSX.utils.book_new();
    const dash = [
      { Metric: "Budget planned", Value: k.plan }, { Metric: "Budget spent", Value: k.spent }, { Metric: "Budget left", Value: k.plan - k.spent },
      { Metric: "Sales total", Value: k.saleAmt }, { Metric: "Cash collected", Value: k.paid }, { Metric: "Leads contacted", Value: k.contacted },
      { Metric: "Warm leads", Value: k.warm }, { Metric: "Customers", Value: k.cust }, { Metric: "Supplier quotes", Value: k.quotes },
      { Metric: "Survey replies", Value: k.n }, { Metric: "% willing to pay ₹30+", Value: k.pct }, { Metric: "Tasks done", Value: `${k.done}/${tasks.length}` },
      ...gates.map((g) => ({ Metric: "Gate: " + g.l, Value: `${g.v} — ${g.ok ? "Pass" : "Not yet"}` })),
    ];
    const ws0 = XLSX.utils.json_to_sheet(dash); ws0["!cols"] = [{ wch: 44 }, { wch: 26 }];
    XLSX.utils.book_append_sheet(wb, ws0, "Summary");
    XLSX.utils.book_append_sheet(wb, geoSheet(supCols, sup), "Suppliers");
    XLSX.utils.book_append_sheet(wb, geoSheet(buyCols, buy), "Buyers");
    XLSX.utils.book_append_sheet(wb, sheet(rowsFor(taskCols, tasks), taskCols), "Tasks");
    const b = rowsFor(budCols, bud); b.push({ Bucket: "TOTAL", "Planned ₹": k.plan, "Actual ₹": k.spent, "Left ₹": k.plan - k.spent });
    XLSX.utils.book_append_sheet(wb, sheet(b, budCols), "Budget");
    XLSX.utils.book_append_sheet(wb, sheet(rowsFor(saleCols, sales.length ? sales : [{}]), saleCols), "Sales");
    XLSX.utils.book_append_sheet(wb, sheet(rowsFor(survCols, surv.length ? surv : [{}]), survCols), "Survey");
    const bn = XLSX.utils.json_to_sheet(BRANDS.map((x) => ({ Name: x.name, Meaning: x.meaning, "Why it works": x.why, "Trademark risk (guess)": x.risk, Verdict: x.pick })));
    bn["!cols"] = [{ wch: 14 }, { wch: 45 }, { wch: 55 }, { wch: 22 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, bn, "Brand names");
    XLSX.writeFile(wb, `Hydration_HQ_${today()}.xlsx`);
    say("Excel downloaded");
  };
  const importXlsx = async (file) => {
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const back = (name, cols, extra = {}) => {
        const ws = wb.Sheets[name]; if (!ws) return null;
        return XLSX.utils.sheet_to_json(ws, { defval: "" })
          .filter((d) => Object.values(d).some((v) => v !== "") && d["Bucket"] !== "TOTAL")
          .map((d) => { const o = { id: uid() }; plain(cols).forEach((c) => { if (!c.calc) o[c.k] = d[c.l] ?? ""; }); Object.entries(extra).forEach(([lab, key]: [string, any]) => { if (d[lab] !== "" && d[lab] !== undefined) o[key] = d[lab]; }); return o; });
      };
      const geo = { Latitude: "lat", Longitude: "lng", "Place ID": "pid" };
      const s = back("Suppliers", supCols, geo), bu = back("Buyers", buyCols, geo), t = back("Tasks", taskCols), bd = back("Budget", budCols), sa = back("Sales", saleCols), sv = back("Survey", survCols);
      s && setSup(enrich(s)); bu && setBuy(enrich(bu)); t && setTasks(t); bd && setBud(bd); sa && setSales(sa); sv && setSurv(sv);
      say("Data imported");
    } catch (e) { say("Import failed — use a file exported from this app"); }
  };
  const resetAll = () => {
    if (!armReset) { setArmReset(true); setTimeout(() => setArmReset(false), 4000); return; }
    setSup(SUPPLIERS()); setBuy(BUYERS()); setTasks(TASKS()); setBud(BUDGET()); setSales([]); setSurv([]); setArmReset(false); say("Reset to starting data");
  };

  const DataActions = ({ dark = false }) => (
    <div className="space-y-2">
      <button onClick={exportXlsx} className={`${btn} w-full ${dark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-white border border-slate-200 text-slate-700"}`}><Download size={16} />Download Excel</button>
      <label className={`${btn} w-full cursor-pointer ${dark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-white border border-slate-200 text-slate-700"}`}>
        <Upload size={16} />Import Excel<input type="file" accept=".xlsx" className="hidden" onChange={(e) => { e.target.files[0] && importXlsx(e.target.files[0]); e.target.value = ""; }} />
      </label>
      <button onClick={resetAll} className={`${btn} w-full text-xs ${armReset ? "bg-red-600 text-white" : dark ? "text-slate-500 hover:text-slate-300" : "text-slate-500"}`}><RotateCcw size={14} />{armReset ? "Tap again to confirm reset" : "Reset to starting data"}</button>
    </div>
  );

  const badge = (id) => (id === "Suppliers" && k.supDue.length ? k.supDue.length : id === "Buyers" && k.follow.length ? k.follow.length : id === "Tasks" && k.overdue.length ? k.overdue.length : 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex font-sans antialiased">
      {/* ---------- sidebar (desktop) ---------- */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-slate-900 text-slate-300 h-screen sticky top-0 px-3 py-4">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white"><Droplets size={18} /></div>
          <div className="text-white font-semibold">Taazu HQ</div>
          <span className="ml-auto"><SyncBadge status={syncStatus} compact /></span>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="px-3 mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">{g.label}</div>
              {g.items.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => go(id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${tab === id ? "bg-slate-800 text-white font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                  <Icon size={17} />{id}
                  {badge(id) > 0 && <span className="ml-auto text-xs bg-orange-600 text-white rounded-full px-2">{badge(id)}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ---------- main ---------- */}
      <main className="flex-1 min-w-0 pb-32 md:pb-0">
        {/* mobile header */}
        <div className="md:hidden sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-slate-200 pt-safe"><div className="px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white"><Droplets size={16} /></div>
          <span className="font-semibold text-slate-900">{tab}</span>
          <span className="ml-auto"><SyncBadge status={syncStatus} /></span>
          <button onClick={() => go("Settings")} aria-label="Settings" className={`-mr-1 p-1.5 rounded-lg ${tab === "Settings" ? "text-orange-600" : "text-slate-500"}`}><Settings size={20} /></button>
        </div></div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {tab === "Today" && (
            <div>
              <PageHead title="Today" sub={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Stat icon={Users} label="Leads contacted" value={`${k.contacted}/${buy.length}`} hint={`${k.warm} warm · ${k.cust} customers`} />
                <Stat icon={Factory} label="Suppliers contacted" value={`${sup.filter((r) => r.status !== "To call").length}/${sup.length}`} hint={`${k.quotes} with quotes · ${k.supDue.length} due`} />
                <Stat icon={TrendingUp} label="Sales" value={inr(k.saleAmt)} hint={`${inr(k.paid)} collected`} />
                <Stat icon={Wallet} label="Budget left" value={inr(k.plan - k.spent)} hint={`${inr(k.spent)} spent`} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4 min-w-0">
                  <Panel title="Supplier follow-ups" icon={Factory} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Suppliers")}>Open suppliers</button>}>
                    {k.supDue.length ? (
                      <div className="-my-2">
                        {k.supDue.slice(0, 6).map((r) => (
                          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                            <button className="min-w-0 flex-1 text-left" onClick={() => go("Suppliers")}>
                              <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                              <div className="text-xs text-slate-500 truncate">{r.next || r.cat}</div>
                            </button>
                            <span className={`text-xs ${r.follow < today() ? "text-red-600 font-medium" : "text-slate-500"}`}>{r.follow}</span>
                            <ContactIcons r={r} />
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-500">No supplier follow-ups due. {sup.filter((r) => r.status === "To call").length} suppliers still to call.</p>}
                  </Panel>
                  <Panel title="Buyer follow-ups" icon={Bell} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Buyers")}>All buyers</button>}>
                    {k.follow.length ? (
                      <div className="-my-2">
                        {k.follow.slice(0, 6).map((r) => (
                          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                              <div className="text-xs text-slate-500 truncate">{r.next || "No next step written"}</div>
                            </div>
                            <span className={`text-xs ${r.follow < today() ? "text-red-600 font-medium" : "text-slate-500"}`}>{r.follow}</span>
                            <ContactIcons r={r} />
                          </div>
                        ))}
                      </div>
                    ) : k.nextCalls.length ? (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">No follow-ups due. Start with these priority-A leads:</p>
                        <div className="-my-1">
                          {k.nextCalls.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                              <div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-900 truncate">{r.name}</div><div className="text-xs text-slate-500">{r.seg} · {r.area}</div></div>
                              <ContactIcons r={r} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <Empty icon={Bell} text="Nothing to follow up." />}
                  </Panel>
                  <Panel title="Next tasks" icon={ListChecks} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Tasks")}>All tasks</button>}>
                    {k.open.length ? (
                      <div className="-my-2">
                        {k.open.slice(0, 6).map((t) => (
                          <div key={t.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                            <button className="text-slate-300 hover:text-green-600" aria-label="Mark done" onClick={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, status: "Done" } : x)))}><Circle size={18} /></button>
                            <span className="flex-1 min-w-0 text-sm text-slate-800 truncate">{t.task}</span>
                            <span className={`text-xs shrink-0 ${t.due < today() ? "text-red-600 font-medium" : "text-slate-500"}`}>{t.due}</span>
                          </div>
                        ))}
                      </div>
                    ) : <Empty icon={CheckCircle2} text="All tasks done." />}
                  </Panel>
                </div>
                <div className="space-y-4">
                  <Panel title="Pilot gates" icon={Target} action={<span className="text-xs text-slate-500">{gatesOk}/4</span>}>
                    <div className="space-y-3">
                      {gates.map((g) => (
                        <div key={g.l} className="flex items-start gap-2">
                          {g.ok ? <CheckCircle2 size={18} className="text-green-600 shrink-0" /> : <Circle size={18} className="text-slate-300 shrink-0" />}
                          <div className="min-w-0"><div className="text-sm text-slate-800">{g.l}</div><div className="text-xs text-slate-500">{g.v}</div></div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">All four passed means go ahead with the February batch.</p>
                  </Panel>
                  <Panel title="Pipeline" icon={Users}>
                    <div className="space-y-2">
                      {BUY_STATUS.map((s) => { const n = buy.filter((r) => r.status === s).length; return (
                        <div key={s} className="grid grid-cols-5 items-center gap-2 text-sm">
                          <span className="col-span-2 flex items-center gap-2 text-slate-600"><Dot color={STATUS_COL[s]} />{s}</span>
                          <div className="col-span-2"><Bar value={n} max={buy.length} color={STATUS_COL[s]} /></div>
                          <span className="text-right font-medium">{n}</span>
                        </div>); })}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          )}
          {tab !== "Today" && <PageHead title={tab} sub={SUBS[tab]} />}
          {tab === "Buyers" && <BuyersView rows={buy} setRows={setBuy} logs={logs} setLogs={setLogs} me={me} />}
          {tab === "Suppliers" && <SuppliersView rows={sup} setRows={setSup} logs={logs} setLogs={setLogs} me={me} />}
          {tab === "Map" && <MapView sup={sup} buy={buy} />}
          {tab === "Tasks" && <TaskList tasks={tasks} setTasks={setTasks} />}
          {tab === "Survey" && <SurveyView surv={surv} setSurv={setSurv} />}
          {tab === "QR Survey" && <QrSurveyView surv={surv} setSurv={setSurv} />}
          {tab === "Sales" && <SalesView sales={sales} setSales={setSales} />}
          {tab === "Budget" && <BudgetView bud={bud} setBud={setBud} k={k} />}
          {tab === "Brand" && <BrandView />}
          {tab === "Settings" && (
            <div className="max-w-xl space-y-4">
              <Panel title="List view"><ViewToggle /></Panel>
              <Panel><TeamPanel /></Panel>
              <Panel title="Data"><DataActions /></Panel>
            </div>
          )}
        </div>
      </main>

      {/* ---------- mobile dock ---------- */}
      <Dock
        items={[...MOBILE_MAIN.map((id) => ({ id, label: id, icon: ALL_NAV.find((n) => n.id === id).icon, badge: badge(id) })), { id: "__more", label: "More", icon: MoreHorizontal, badge: 0 }]}
        activeIndex={more || !MOBILE_MAIN.includes(tab) ? MOBILE_MAIN.length : MOBILE_MAIN.indexOf(tab)}
        onSelect={(id) => (id === "__more" ? setMore(true) : go(id))}
      />

      {/* ---------- mobile "More" sheet ---------- */}
      {more && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 bg-opacity-40" onClick={() => setMore(false)}>
          <div className="sheet-in absolute bottom-0 inset-x-0 max-h-[88dvh] overflow-y-auto bg-white rounded-t-3xl p-4 pb-safe space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><span className="font-semibold">More</span><button onClick={() => setMore(false)} aria-label="Close" className="text-slate-400"><X size={20} /></button></div>
            {NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((n) => !MOBILE_MAIN.includes(n.id)) })).filter((g) => g.items.length).map((g) => (
              <section key={g.label}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{g.label}</p>
                <div className="grid grid-cols-3 gap-2">
                  {g.items.map(({ id, icon: Icon }) => (
                    <button key={id} onClick={() => go(id)} className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold ${tab === id ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}>
                      <Icon size={20} />{id}{badge(id) > 0 && <span className="text-orange-700 font-medium">{badge(id)} overdue</span>}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm rounded-lg px-4 py-2 shadow-lg z-50">{toast}</div>}
    </div>
  );
}
