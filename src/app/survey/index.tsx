import { useState } from "react";
import { Check, ClipboardList, TrendingUp, Trash2, ChevronDown } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Bar, Empty, Panel, inputCls } from "../../components/ui";
import { uid, today, SEGS, FLAVOURS, PAYS } from "../../lib/core";

type Resp = { id: string; date: string; venue: string; segment: string; flavour: string; pay: string; comment: string };

const VENUE_KEY = "taazu-last-venue";
const readVenue = () => { try { return localStorage.getItem(VENUE_KEY) || ""; } catch { return ""; } };
const payLabel = (p: string) => (p === "None" ? "Wouldn't buy" : p);

/* A row of big tap targets; on phones two or three per row so a thumb never misses. */
function Pick({ label, value, opts, onPick, cols = "grid-cols-3", fmt = (x: string) => x }: {
  label: string; value: string; opts: string[]; onPick: (v: string) => void; cols?: string; fmt?: (x: string) => string;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{label}</div>
      <div className={`grid ${cols} gap-2`}>
        {opts.map((o) => (
          <button key={o} type="button" onClick={() => onPick(o)}
            className={`rounded-xl px-2 py-3.5 text-sm font-semibold border transition active:scale-95 ${value === o ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>{fmt(o)}</button>
        ))}
      </div>
    </div>
  );
}

export default function SurveyView({ surv, setSurv }: { surv: Resp[]; setSurv: (r: Resp[]) => void }) {
  const [f, setF] = useState({ venue: readVenue(), segment: "Garba", flavour: "", pay: "" });
  const [flash, setFlash] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const n = surv.length;
  const cnt = (k: string, v: string) => surv.filter((r) => r[k] === v).length;
  const pct30 = n ? Math.round(((cnt("pay", "₹30") + cnt("pay", "₹50")) / n) * 100) : 0;
  const ready = !!(f.flavour && f.pay);
  const cur = surv.find((r) => r.id === openId) || null;

  const setVenue = (venue: string) => { setF({ ...f, venue }); try { localStorage.setItem(VENUE_KEY, venue); } catch { /* ignore */ } };
  const save = () => {
    if (!ready) return;
    setSurv([{ id: uid(), date: today(), venue: f.venue, segment: f.segment, flavour: f.flavour, pay: f.pay, comment: "" }, ...surv]);
    setF({ ...f, flavour: "", pay: "" });
    setFlash(`Saved · response #${n + 1}`);
    try { navigator.vibrate?.(12); } catch { /* no haptics */ }
    setTimeout(() => setFlash(""), 2500);
    document.getElementById("app-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const up = (id: string, p: Partial<Resp>) => setSurv(surv.map((r) => (r.id === id ? { ...r, ...p } : r)));

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 min-w-0">
        <Panel title="New response" icon={ClipboardList}>
          {flash && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-700">✓ {flash}</div>}
          <label className="block mb-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Venue</span>
            <input className={inputCls + " mt-2"} placeholder="e.g. Garba – Day 3 (stays filled)" value={f.venue} onChange={(e) => setVenue(e.target.value)} />
          </label>
          <Pick label="Who" value={f.segment} opts={SEGS} onPick={(v) => setF({ ...f, segment: v })} />
          <Pick label="Best flavour" value={f.flavour} opts={FLAVOURS} onPick={(v) => setF({ ...f, flavour: v })} cols="grid-cols-2" />
          <Pick label="Would buy 250 ml at (highest yes)" value={f.pay} opts={PAYS} onPick={(v) => setF({ ...f, pay: v })} cols="grid-cols-3" fmt={payLabel} />
          <p className="text-xs text-slate-500 -mt-2 mb-4">Ask the price high to low: ₹50, then ₹30, then ₹20.</p>
          <div className="mt-1">
            <button onClick={save} disabled={!ready}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold ${ready ? "bg-orange-600 text-white active:bg-orange-700" : "bg-slate-200 text-slate-400"}`}>
              <Check size={18} />{ready ? "Save response" : "Pick flavour and price"}
            </button>
          </div>
        </Panel>
      </div>

      <div className="lg:col-span-2 space-y-4 min-w-0">
        <Panel title="Results" icon={TrendingUp}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><div className="text-xs text-slate-500">Responses</div><div className="text-2xl font-bold">{n}</div></div>
            <div><div className="text-xs text-slate-500">Would pay ₹30+</div><div className={`text-2xl font-bold ${n && pct30 >= 60 ? "text-green-600" : "text-slate-900"}`}>{pct30}%</div><div className="text-xs text-slate-400">target 60%</div></div>
          </div>
          <div className="text-xs font-medium text-slate-500 mb-2">Flavour</div>
          {FLAVOURS.map((fl) => { const c = cnt("flavour", fl); return <div key={fl} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{fl}</span><div className="col-span-2"><Bar value={c} max={n} color="#16A34A" /></div><span className="text-right font-medium">{c}</span></div>; })}
          <div className="text-xs font-medium text-slate-500 mb-2 mt-4">Price</div>
          {PAYS.map((p) => { const c = cnt("pay", p); return <div key={p} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{payLabel(p)}</span><div className="col-span-2"><Bar value={c} max={n} /></div><span className="text-right font-medium">{c}</span></div>; })}
        </Panel>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Responses <span className="text-slate-400 font-normal">{n}</span></h2>
          {n ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
              {surv.slice(0, limit).map((r) => (
                <button key={r.id} onClick={() => setOpenId(r.id)} className="w-full text-left px-4 py-3 active:bg-slate-50">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900">{r.flavour || "—"}</span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{payLabel(r.pay)}</span>
                    <span className="ml-auto text-xs text-slate-400">{r.segment}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 truncate">{[r.venue, r.date].filter(Boolean).join(" · ")}{r.comment ? ` · ${r.comment}` : ""}</div>
                </button>
              ))}
            </div>
          ) : <Empty icon={ClipboardList} text="No responses yet. Ask three questions, tap, save." />}
          {n > limit && <button onClick={() => setLimit(limit + 30)} className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600"><ChevronDown size={16} />Show more</button>}
        </section>
      </div>

      <RespSheet r={cur} onClose={() => setOpenId(null)} onChange={(p) => cur && up(cur.id, p)} onDelete={() => { if (cur) { setSurv(surv.filter((x) => x.id !== cur.id)); setOpenId(null); } }} />
    </div>
  );
}

function RespSheet({ r, onClose, onChange, onDelete }: { r: Resp | null; onClose: () => void; onChange: (p: Partial<Resp>) => void; onDelete: () => void }) {
  const [arm, setArm] = useState(false);
  if (!r) return null;
  return (
    <Sheet open onClose={onClose} title={<div><div className="text-lg font-bold text-slate-900">Edit response</div><div className="text-xs text-slate-500">{r.date}</div></div>}>
      <Pick label="Who" value={r.segment} opts={SEGS} onPick={(v) => onChange({ segment: v })} />
      <Pick label="Best flavour" value={r.flavour} opts={FLAVOURS} onPick={(v) => onChange({ flavour: v })} cols="grid-cols-2" />
      <Pick label="Would buy at" value={r.pay} opts={PAYS} onPick={(v) => onChange({ pay: v })} fmt={payLabel} />
      <label className="block mb-3"><span className="text-xs text-slate-500">Venue</span><input className={inputCls + " mt-1"} value={r.venue || ""} onChange={(e) => onChange({ venue: e.target.value })} /></label>
      <label className="block"><span className="text-xs text-slate-500">Comment</span><textarea className={inputCls + " mt-1 min-h-[64px]"} value={r.comment || ""} onChange={(e) => onChange({ comment: e.target.value })} /></label>
      <button onClick={() => (arm ? onDelete() : setArm(true))} className={`mt-6 w-full rounded-xl py-2.5 text-xs font-medium ${arm ? "bg-red-600 text-white" : "text-slate-400"}`}>
        <Trash2 size={13} className="inline mr-1" />{arm ? "Tap again to delete response" : "Delete response"}
      </button>
    </Sheet>
  );
}
