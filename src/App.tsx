import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, Users, Factory, Map as MapIcon, ListChecks, ClipboardList, ShoppingCart, Wallet, Palette,
  Download, Upload, Phone, MessageCircle, MapPin, Search, Plus, Trash2, LayoutGrid, Table as TableIcon,
  RotateCcw, Droplets, Settings, MoreHorizontal, Bell, CheckCircle2, Circle, AlertCircle, Star, Check, X, Target, TrendingUp,
  QrCode, Copy, RefreshCw, ExternalLink, Link2, Send,
} from "lucide-react";

/* =========================================================
   TAAZU — Ahmedabad electrolyte launch
   Team data syncs through Supabase (see lib/useSync.ts).
   ========================================================= */

/* ---------------- helpers ---------------- */
import {
  uid, mk, inr, today, telHref, waHref, GEO, enrich, mapUrl, SUP_KEYS, SUPPLIERS, upgradeSuppliers, upgradeBuyers, BUY_KEYS, BUYERS, TASKS, BUDGET, BRANDS, SUP_STATUS, BUY_STATUS, STATUS_COL, COL, SEGS, FLAVOURS, PAYS, supCols, buyCols, taskCols, budCols, saleCols, survCols,
} from "./lib/core";
import {
  inputCls, btn, btnPrimary, btnGhost, Dot, Tag, StatusSelect, IconLink, ContactIcons, PageHead, Panel, Stat, Bar, Empty,
} from "./components/ui";
import SuppliersView from "./app/suppliers";
import Dock from "./components/Dock";
import AuthGate, { useAuth } from "./app/auth/AuthGate";
import TeamPanel from "./app/auth/TeamPanel";
import SyncBadge from "./components/SyncBadge";
import { useSync } from "./lib/useSync";
import BuyersView from "./app/buyers";
import TasksView from "./app/tasks";
import SalesView from "./app/sales";
import SurveyView from "./app/survey";
import BudgetView from "./app/budget";
import MapView from "./app/map";
import BrandView from "./app/brand";
import SettingsView from "./app/settings";
import DataPanel from "./app/dataio/DataPanel";
import { exportAll } from "./lib/dataio/xlsx";
import { CalculatorHost, SidebarCalc } from "./app/calculator";
import { PrefsCtx, usePrefsValue } from "./lib/prefs";
import { QrSurveyView, PublicSurvey } from "./app/qr";
import { dueList, normalizeStage } from "./app/crm/config";
import { SUPPLIER_CFG, BUYER_CFG } from "./app/crm/configs";

const NAV_GROUPS = [
  { label: "Work", items: [{ id: "Today", icon: Home }, { id: "Buyers", icon: Users }, { id: "Suppliers", icon: Factory }, { id: "Map", icon: MapIcon }, { id: "Tasks", icon: ListChecks }] },
  { label: "Record", items: [{ id: "Survey", icon: ClipboardList }, { id: "QR Survey", icon: QrCode }, { id: "Sales", icon: ShoppingCart }] },
  { label: "Plan", items: [{ id: "Budget", icon: Wallet }, { id: "Brand", icon: Palette }] },
  { label: "App", items: [{ id: "Settings", icon: Settings }] },
];
const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
const MOBILE_PREF = ["Today", "Suppliers", "Buyers", "Tasks", "Sales", "Survey", "Map", "Budget", "QR Survey", "Brand"]; // dock order; first 4 that are on
const SUBS = {
  Buyers: "Real Ahmedabad businesses, priority A first. Public listings — confirm details on the first call.",
  Suppliers: "Call, log what they said, set the next follow-up. Public listings — verify before paying.",
  Map: "Everything with an exact location. Plan visits by area.",
  Tasks: "Supplier call script, then the to-do list.",
  Survey: "Three taps per person.",
  "QR Survey": "Customers scan and answer on their own phone. Answers land in your Google Sheet.",
  Sales: "Pilot rule: cash or UPI only.",
  Budget: "₹55,000 trial — planned vs actual.",
  Brand: "Taazu identity, product prototype, label rules and hydration facts with sources.",
  Settings: "Choose which screens and features you use, plus team and data.",
};
const STORE_KEY = "elec-tracker-v1";
const COLLECTIONS = ["sup", "buy", "tasks", "bud", "sales", "surv", "logs", "cfg"];
const CFG_LOCAL_KEY = "hq-survey-cfg"; // where the pre-team app kept the QR survey settings

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
  const [cfgRows, setCfgRows] = useState<any[]>([]);
  const surveyCfg = { endpoint: "", key: "", base: "", venue: "", ...(cfgRows.find((r) => r.id === "survey") || {}) };
  const saveSurveyCfg = (next) => setCfgRows((rs) => [...rs.filter((r) => r.id !== "survey"), { ...next, id: "survey" }]);
  const [toast, setToast] = useState("");
  const [armReset, setArmReset] = useState(false);
  const [more, setMore] = useState(false);

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const go = (id) => { setTab(id); setMore(false); };

  /* cloud sync (Supabase, realtime) */
  const auth = useAuth();
  const prefs = usePrefsValue(auth.session.user.id, cfgRows, setCfgRows);
  const navGroups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((n) => n.id === "Settings" || prefs.module(n.id)) })).filter((g) => g.items.length);
  const allNav = navGroups.flatMap((g) => g.items);
  const mobileMain = MOBILE_PREF.filter((id) => allNav.some((n) => n.id === id)).slice(0, 4);
  // A screen switched off while open (or via an old link) falls back to the first one still on.
  useEffect(() => { if (tab !== "Settings" && !prefs.module(tab)) setTab(allNav[0]?.id || "Settings"); }, [tab, prefs, allNav]);
  const me = auth.me?.display_name || auth.session.user.email?.split("@")[0] || "";
  const data = useMemo(() => ({ sup, buy, tasks, bud, sales, surv, logs, cfg: cfgRows }), [sup, buy, tasks, bud, sales, surv, logs, cfgRows]);
  const replaceAll = useCallback((d) => {
    d.sup && setSup(enrich(upgradeSuppliers(d.sup)).map((r) => ({ ...r, status: normalizeStage(SUPPLIER_CFG, r.status, { Called: "Contacted", Selected: "Finalized" }) })));
    d.buy && setBuy(enrich(upgradeBuyers(d.buy))); d.tasks && setTasks(d.tasks); d.bud && setBud(d.bud);
    d.sales && setSales(d.sales); d.surv && setSurv(d.surv); d.logs && setLogs(d.logs); d.cfg && setCfgRows(d.cfg);
  }, []);
  const seed = useCallback(() => {
    // First sync of a new team: this device's old local data, else the starter lists.
    let d: any = null;
    try { const raw = localStorage.getItem(STORE_KEY); d = raw ? JSON.parse(raw) : null; if (typeof d === "string") d = JSON.parse(d); } catch { d = null; }
    let cfg: any[] = [];
    try { let c: any = JSON.parse(localStorage.getItem(CFG_LOCAL_KEY) || "null"); if (typeof c === "string") c = JSON.parse(c); if (c?.endpoint) cfg = [{ ...c, id: "survey" }]; } catch { /* no old settings */ }
    const base = { sup: SUPPLIERS(), buy: BUYERS(), tasks: TASKS(), bud: BUDGET(), sales: [], surv: [], logs: [], cfg };
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

  /* ---- Excel export (import lives in app/dataio) ---- */
  const exportEverything = () => {
    const summary = [
      { Metric: "Budget planned", Value: k.plan }, { Metric: "Budget spent", Value: k.spent }, { Metric: "Budget left", Value: k.plan - k.spent },
      { Metric: "Sales total", Value: k.saleAmt }, { Metric: "Cash collected", Value: k.paid }, { Metric: "Leads contacted", Value: k.contacted },
      { Metric: "Warm leads", Value: k.warm }, { Metric: "Customers", Value: k.cust }, { Metric: "Supplier quotes", Value: k.quotes },
      { Metric: "Survey replies", Value: k.n }, { Metric: "% willing to pay ₹30+", Value: k.pct }, { Metric: "Tasks done", Value: `${k.done}/${tasks.length}` },
      ...gates.map((g) => ({ Metric: "Gate: " + g.l, Value: `${g.v} — ${g.ok ? "Pass" : "Not yet"}` })),
    ];
    const names = new Map([...sup, ...buy].map((r) => [r.id, r.name]));
    const callLog = [...logs].sort((a, b) => (b.at || 0) - (a.at || 0)).map((l) => ({ Date: l.date, With: names.get(l.supplierId) || "", Type: l.type, Outcome: l.outcome, Note: l.note, By: l.by || "" }));
    const brands = BRANDS.map((x) => ({ Name: x.name, Meaning: x.meaning, "Why it works": x.why, "Trademark risk (guess)": x.risk, Verdict: x.pick }));
    exportAll({ sup, buy, tasks, bud, sales, surv }, summary, [{ name: "Call log", rows: callLog }, { name: "Brand names", rows: brands }]);
  };
  const stores = {
    sup: { rows: sup, set: setSup, after: enrich }, buy: { rows: buy, set: setBuy, after: enrich }, tasks: { rows: tasks, set: setTasks },
    bud: { rows: bud, set: setBud }, sales: { rows: sales, set: setSales }, surv: { rows: surv, set: setSurv },
  };
  const resetAll = () => {
    if (!armReset) { setArmReset(true); setTimeout(() => setArmReset(false), 4000); return; }
    setSup(SUPPLIERS()); setBuy(BUYERS()); setTasks(TASKS()); setBud(BUDGET()); setSales([]); setSurv([]); setArmReset(false); say("Reset to starting data");
  };

  const badge = (id) => (id === "Suppliers" && k.supDue.length ? k.supDue.length : id === "Buyers" && k.follow.length ? k.follow.length : id === "Tasks" && k.overdue.length ? k.overdue.length : 0);

  return (
    <PrefsCtx.Provider value={prefs}>
    <CalculatorHost enabled={prefs.module("Calculator")}>
    <div className="min-h-screen text-stone-800 md:flex font-sans antialiased">
      {/* ---------- sidebar (desktop) ---------- */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-400 h-screen sticky top-0 px-3 py-5 border-r border-white/5">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl btn-brand flex items-center justify-center text-white"><Droplets size={19} /></div>
          <div className="leading-tight"><div className="text-white text-lg font-extrabold tracking-tight">taazu</div><div className="text-[11px] text-stone-500">Electrolyte launch</div></div>
          <span className="ml-auto"><SyncBadge status={syncStatus} compact /></span>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-5">
          {navGroups.map((g) => (
            <div key={g.label}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-stone-600">{g.label}</div>
              {g.items.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => go(id)} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${tab === id ? "bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-white" : "hover:bg-white/5 hover:text-white"}`}>
                  {tab === id && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-orange-500" />}
                  <Icon size={17} className={tab === id ? "text-orange-400" : ""} />{id}
                  {badge(id) > 0 && <span className="ml-auto text-[11px] font-bold bg-orange-600 text-white rounded-full px-2 py-0.5">{badge(id)}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {prefs.module("Calculator") && <div className="mt-2 border-t border-white/5 pt-2"><SidebarCalc /></div>}
      </aside>

      {/* ---------- main ---------- */}
      <main className="flex-1 min-w-0 pb-32 md:pb-0">
        {/* mobile header */}
        <div className="md:hidden sticky top-0 z-20 bg-[#FAF8F5]/80 backdrop-blur-xl border-b border-stone-200/70 pt-safe"><div className="px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl btn-brand flex items-center justify-center text-white"><Droplets size={17} /></div>
          <span className="text-base font-extrabold tracking-tight text-stone-900">{tab}</span>
          <span className="ml-auto"><SyncBadge status={syncStatus} /></span>
          <button onClick={() => go("Settings")} aria-label="Settings" className={`-mr-1 p-1.5 rounded-lg ${tab === "Settings" ? "text-orange-600" : "text-slate-500"}`}><Settings size={20} /></button>
        </div></div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {tab === "Today" && (
            <div>
              <PageHead title="Today" sub={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {prefs.module("Buyers") && <Stat icon={Users} label="Leads contacted" value={`${k.contacted}/${buy.length}`} hint={`${k.warm} warm · ${k.cust} customers`} />}
                {prefs.module("Suppliers") && <Stat icon={Factory} label="Suppliers contacted" value={`${sup.filter((r) => r.status !== "To call").length}/${sup.length}`} hint={`${k.quotes} with quotes · ${k.supDue.length} due`} />}
                {prefs.module("Sales") && <Stat icon={TrendingUp} label="Sales" value={inr(k.saleAmt)} hint={`${inr(k.paid)} collected`} />}
                {prefs.module("Budget") && <Stat icon={Wallet} label="Budget left" value={inr(k.plan - k.spent)} hint={`${inr(k.spent)} spent`} />}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4 min-w-0">
                  {prefs.on("today.sup") && <Panel title="Supplier follow-ups" icon={Factory} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Suppliers")}>Open suppliers</button>}>
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
                  </Panel>}
                  {prefs.on("today.buy") && <Panel title="Buyer follow-ups" icon={Bell} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Buyers")}>All buyers</button>}>
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
                  </Panel>}
                  {prefs.on("today.tasks") && <Panel title="Next tasks" icon={ListChecks} action={<button className="text-xs text-orange-700 font-medium" onClick={() => go("Tasks")}>All tasks</button>}>
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
                  </Panel>}
                </div>
                <div className="space-y-4">
                  {prefs.on("today.gates") && <Panel title="Pilot gates" icon={Target} action={<span className="text-xs text-slate-500">{gatesOk}/4</span>}>
                    <div className="space-y-3">
                      {gates.map((g) => (
                        <div key={g.l} className="flex items-start gap-2">
                          {g.ok ? <CheckCircle2 size={18} className="text-green-600 shrink-0" /> : <Circle size={18} className="text-slate-300 shrink-0" />}
                          <div className="min-w-0"><div className="text-sm text-slate-800">{g.l}</div><div className="text-xs text-slate-500">{g.v}</div></div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">All four passed means go ahead with the February batch.</p>
                  </Panel>}
                  {prefs.on("today.pipeline") && <Panel title="Pipeline" icon={Users}>
                    <div className="space-y-2">
                      {BUY_STATUS.map((s) => { const n = buy.filter((r) => r.status === s).length; return (
                        <div key={s} className="grid grid-cols-5 items-center gap-2 text-sm">
                          <span className="col-span-2 flex items-center gap-2 text-slate-600"><Dot color={STATUS_COL[s]} />{s}</span>
                          <div className="col-span-2"><Bar value={n} max={buy.length} color={STATUS_COL[s]} /></div>
                          <span className="text-right font-medium">{n}</span>
                        </div>); })}
                    </div>
                  </Panel>}
                </div>
              </div>
            </div>
          )}
          {tab !== "Today" && <PageHead title={tab} sub={SUBS[tab]} />}
          {tab === "Buyers" && <BuyersView rows={buy} setRows={setBuy} logs={logs} setLogs={setLogs} me={me} />}
          {tab === "Suppliers" && <SuppliersView rows={sup} setRows={setSup} logs={logs} setLogs={setLogs} me={me} />}
          {tab === "Map" && <MapView sup={sup} buy={buy} />}
          {tab === "Tasks" && <TasksView tasks={tasks} setTasks={setTasks} />}
          {tab === "Survey" && <SurveyView surv={surv} setSurv={setSurv} />}
          {tab === "QR Survey" && <QrSurveyView surv={surv} setSurv={setSurv} cfg={surveyCfg} saveCfg={saveSurveyCfg} />}
          {tab === "Sales" && <SalesView sales={sales} setSales={setSales} me={me} />}
          {tab === "Budget" && <BudgetView bud={bud} setBud={setBud} />}
          {tab === "Brand" && <BrandView />}
          {tab === "Settings" && (
            <SettingsView>
              <Panel><TeamPanel /></Panel>
              <DataPanel stores={stores} exportEverything={exportEverything} resetAll={resetAll} armReset={armReset} say={say} />
            </SettingsView>
          )}
        </div>
      </main>

      {/* ---------- mobile dock ---------- */}
      <Dock
        items={[...mobileMain.map((id) => ({ id, label: id, icon: ALL_NAV.find((n) => n.id === id).icon, badge: badge(id) })), { id: "__more", label: "More", icon: MoreHorizontal, badge: 0 }]}
        activeIndex={more || !mobileMain.includes(tab) ? mobileMain.length : mobileMain.indexOf(tab)}
        onSelect={(id) => (id === "__more" ? setMore(true) : go(id))}
      />

      {/* ---------- mobile "More" sheet ---------- */}
      {more && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 bg-opacity-40" onClick={() => setMore(false)}>
          <div className="sheet-in absolute bottom-0 inset-x-0 max-h-[88dvh] overflow-y-auto bg-white rounded-t-3xl p-4 pb-safe space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><span className="font-semibold">More</span><button onClick={() => setMore(false)} aria-label="Close" className="text-slate-400"><X size={20} /></button></div>
            {navGroups.map((g) => ({ ...g, items: g.items.filter((n) => !mobileMain.includes(n.id)) })).filter((g) => g.items.length).map((g) => (
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
    </CalculatorHost>
    </PrefsCtx.Provider>
  );
}
