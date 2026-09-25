import { useMemo, useState } from "react";
import { Map as MapIcon, List, MapPin, Phone, MessageCircle } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Dot, Empty } from "../../components/ui";
import { COL, STATUS_COL, mapUrl, telHref, waHref } from "../../lib/core";
import { usePrefs } from "../../lib/prefs";

const AREAS: [string, number, number][] = [["Changodar", 22.925, 72.445], ["Bopal", 23.036, 72.462], ["Prahlad Nagar", 23.004, 72.508], ["SG Hwy / Bodakdev", 23.05, 72.505], ["Navrangpura", 23.052, 72.556], ["Motera", 23.112, 72.6], ["Naroda GIDC", 23.1, 72.68], ["Odhav", 23.012, 72.672], ["Vatva GIDC", 22.965, 72.64], ["Chandkheda", 23.125, 72.57], ["Sarkhej", 22.978, 72.49]];
const W = 900, H = 560, B = { n: 23.14, s: 22.88, w: 72.4, e: 72.72 };
const px = (lng: number) => ((lng - B.w) / (B.e - B.w)) * W;
const py = (lat: number) => ((B.n - lat) / (B.n - B.s)) * H;
const RIVER = [[23.14, 72.605], [23.1, 72.59], [23.06, 72.578], [23.03, 72.573], [23.0, 72.576], [22.96, 72.568], [22.88, 72.555]].map(([la, ln]) => `${px(ln)},${py(la)}`).join(" ");

type Pt = { id: string; name: string; area: string; phone: string; status: string; kind: "Supplier" | "Buyer"; grp: string; lat?: number; lng?: number; [k: string]: any };

const chip = (on: boolean) => `shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}`;

function ActionRow({ p, big = false }: { p: Pt; big?: boolean }) {
  const tel = telHref(p.phone), wa = waHref(p.phone), map = mapUrl(p);
  const base = `flex ${big ? "flex-col py-3 text-xs" : "flex-row justify-center py-2.5 text-xs"} items-center gap-1 rounded-xl font-semibold`;
  const off = "bg-slate-100 text-slate-300 pointer-events-none";
  return (
    <div className="grid grid-cols-3 gap-2">
      <a href={tel || undefined} className={`${base} ${tel ? "bg-slate-900 text-white" : off}`}><Phone size={big ? 18 : 14} />Call</a>
      <a href={wa || undefined} target="_blank" rel="noreferrer" className={`${base} ${wa ? "bg-green-600 text-white" : off}`}><MessageCircle size={big ? 18 : 14} />WhatsApp</a>
      <a href={map || undefined} target="_blank" rel="noreferrer" className={`${base} ${map ? "bg-blue-50 text-blue-700" : off}`}><MapPin size={big ? 18 : 14} />Directions</a>
    </div>
  );
}

export default function MapView({ sup, buy }: { sup: any[]; buy: any[] }) {
  const { on } = usePrefs();
  const [chosen, setView] = useState<"map" | "list">("map");
  const listOn = on("map.list");
  const view = listOn ? chosen : "map";
  const [show, setShow] = useState({ s: true, b: true });
  const [grp, setGrp] = useState("All");
  const [sel, setSel] = useState<Pt | null>(null);

  const all: Pt[] = useMemo(() => [
    ...sup.map((r) => ({ ...r, kind: "Supplier" as const, grp: r.cat })),
    ...buy.map((r) => ({ ...r, kind: "Buyer" as const, grp: r.seg })),
  ], [sup, buy]);
  const visible = all.filter((p) => (p.kind === "Supplier" ? show.s : show.b) && (grp === "All" || p.grp === grp));
  const pinned = visible.filter((p) => p.lat && p.lng);
  const grps = useMemo(() => ["All", ...Array.from(new Set(all.filter((p) => (p.kind === "Supplier" ? show.s : show.b)).map((p) => p.grp).filter(Boolean)))], [all, show]);
  const byArea = useMemo(() => {
    const m = new Map<string, Pt[]>();
    visible.forEach((p) => { const a = p.area || "Other"; m.set(a, [...(m.get(a) || []), p]); });
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [visible]);

  return (
    <div>
      {listOn && <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 mb-3">
        {([["map", "Map", MapIcon], ["list", "By area", List]] as const).map(([id, l, Icon]) => (
          <button key={id} onClick={() => setView(id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${view === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Icon size={14} />{l}</button>
        ))}
      </div>}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        <button className={chip(show.s)} onClick={() => { setShow({ ...show, s: !show.s }); setGrp("All"); }}><span className="h-2 w-2 rounded-sm bg-current" />Suppliers</button>
        <button className={chip(show.b)} onClick={() => { setShow({ ...show, b: !show.b }); setGrp("All"); }}><span className="h-2 w-2 rounded-full bg-current" />Buyers</button>
        <span className="w-px shrink-0 bg-slate-200" />
        {grps.map((g) => <button key={g} className={chip(g === grp)} onClick={() => setGrp(g)}>{g !== "All" && <Dot color={COL[g] || "#64748B"} />}{g}</button>)}
      </div>
      <div className="mt-1 mb-2 text-xs text-slate-500">{view === "map" ? `${pinned.length} pins${visible.length > pinned.length ? ` · ${visible.length - pinned.length} without location (see By area)` : ""}` : `${visible.length} places in ${byArea.length} areas`}</div>

      {view === "map" ? (
        <div>
          <div className="overflow-auto overscroll-contain rounded-2xl border border-slate-200 bg-white" style={{ maxHeight: "68dvh" }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-[860px] md:w-full max-w-none" role="img" aria-label="Map of suppliers and buyers">
              <rect width={W} height={H} fill="#F8FAFC" />
              {[...Array(9)].map((_, i) => <line key={"v" + i} x1={(i + 1) * 90} y1="0" x2={(i + 1) * 90} y2={H} stroke="#EEF2F6" />)}
              {[...Array(6)].map((_, i) => <line key={"h" + i} x1="0" y1={(i + 1) * 80} x2={W} y2={(i + 1) * 80} stroke="#EEF2F6" />)}
              <polyline points={RIVER} fill="none" stroke="#BFDBFE" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              {AREAS.map(([n, la, ln]) => <text key={n} x={px(ln)} y={py(la)} fontSize="13" fontWeight="600" fill="#94A3B8" textAnchor="middle">{n}</text>)}
              {pinned.map((p) => {
                const cx = px(Number(p.lng)), cy = py(Number(p.lat)), c = COL[p.grp] || "#333", on = sel?.id === p.id;
                return (
                  <g key={p.id} onClick={() => setSel(p)} style={{ cursor: "pointer" }}>
                    <circle cx={cx} cy={cy} r="20" fill="transparent" />
                    {p.kind === "Supplier"
                      ? <rect x={cx - 9} y={cy - 9} width="18" height="18" rx="4" fill={c} stroke={on ? "#0F172A" : "#fff"} strokeWidth={on ? 3.5 : 2.5} />
                      : <circle cx={cx} cy={cy} r={on ? 12 : 9.5} fill={c} stroke={on ? "#0F172A" : "#fff"} strokeWidth={on ? 3.5 : 2.5} />}
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="mt-2 text-xs text-slate-500">Drag to move around, tap a pin for details. Schematic plot from coordinates, not a street map.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {byArea.map(([area, rows]) => (
            <section key={area}>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">{area} <span className="text-slate-400 font-normal">{rows.length}</span></h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
                {rows.map((p) => (
                  <button key={p.id} onClick={() => setSel(p)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50">
                    <Dot color={COL[p.grp] || "#64748B"} square={p.kind === "Supplier"} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">{p.name}</div>
                      <div className="truncate text-xs text-slate-500">{p.grp}</div>
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: STATUS_COL[p.status] }}>{p.status}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          {!byArea.length && <Empty icon={MapPin} text="Nothing to show. Turn Suppliers or Buyers on." />}
        </div>
      )}

      {sel && (
        <Sheet open onClose={() => setSel(null)} title={
          <div>
            <div className="text-lg font-bold text-slate-900 leading-tight">{sel.name}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Dot color={COL[sel.grp] || "#64748B"} square={sel.kind === "Supplier"} />{sel.kind} · {sel.grp}{sel.area ? ` · ${sel.area}` : ""}</div>
          </div>}>
          <ActionRow p={sel} big />
          <div className="mt-4 space-y-1.5 text-sm">
            <div><span className="text-slate-500">Status </span><span className="font-semibold" style={{ color: STATUS_COL[sel.status] }}>{sel.status}</span></div>
            {sel.phone && <div className="text-slate-700">{sel.phone}</div>}
            {(sel.use || sel.why) && <div className="text-slate-600">{sel.use || sel.why}</div>}
            {sel.follow && <div className="text-xs text-slate-500">Follow-up: {sel.follow}</div>}
          </div>
          <p className="mt-4 text-xs text-slate-400">Log calls and change the stage from the {sel.kind === "Supplier" ? "Suppliers" : "Buyers"} tab.</p>
        </Sheet>
      )}
    </div>
  );
}
