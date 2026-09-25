import { useEffect, useState } from "react";
import { Phone, MessageCircle, MapPin, Trash2, Check, MessageSquare, Footprints, Mail } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Dot, inputCls } from "../../components/ui";
import { COL, mapUrl, telHref, waHref, today } from "../../lib/core";
import {
  STAGES, STAGE_COL, LOG_TYPES, OUTCOMES, FOLLOW_CHIPS, addDays, newLog, stageAfter, waMessage,
  type Supplier, type ContactLog,
} from "./model";

const TYPE_ICON = { call: Phone, whatsapp: MessageSquare, visit: Footprints, email: Mail };
const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;
const Label = ({ children }) => <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{children}</div>;

function Field({ label, value, onChange, type = "text", placeholder = "", inputMode = undefined }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <input className={inputCls + " mt-1"} type={type} inputMode={inputMode} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function SupplierSheet({ r, logs, startLog, onClose, onChange, onAddLog, onDeleteLog, onDelete }: {
  r: Supplier | null; logs: ContactLog[]; startLog: string | null; onClose: () => void;
  onChange: (patch: Partial<Supplier>) => void; onAddLog: (l: ContactLog, patch: Partial<Supplier>) => void;
  onDeleteLog: (id: string) => void; onDelete: () => void;
}) {
  const [type, setType] = useState("call");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [follow, setFollow] = useState("");
  const [next, setNext] = useState("");
  const [armDel, setArmDel] = useState(false);

  // Fresh form each time a different supplier opens (or a Call/WhatsApp tap pre-selects the type).
  useEffect(() => {
    setType(startLog || "call"); setOutcome(""); setNote(""); setFollow(addDays(3)); setNext(r?.next || ""); setArmDel(false);
  }, [r?.id, startLog]);

  if (!r) return null;
  const tel = telHref(r.phone), wa = waHref(r.phone), map = mapUrl(r);
  const mine = logs.filter((l) => l.supplierId === r.id).sort((a, b) => (b.date + (b.at || 0)).localeCompare(a.date + (a.at || 0)));
  const suggested = stageAfter(r.status, outcome);
  const noFollow = outcome === "Not interested" || outcome === "Wrong number";

  const save = () => {
    if (!outcome && !note.trim()) return;
    onAddLog(newLog(r.id, { type, outcome, note: note.trim() }), { status: suggested, follow: noFollow ? "" : follow, next: next.trim() });
    setOutcome(""); setNote("");
  };

  const title = (
    <div>
      <div className="text-lg font-bold text-slate-900 leading-tight">{r.name}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Dot color={COL[r.cat] || "#64748B"} square />{r.cat} · {r.area}</div>
    </div>
  );

  return (
    <Sheet open onClose={onClose} title={title}>
      {/* contact buttons */}
      <div className="grid grid-cols-3 gap-2">
        <a href={tel || undefined} onClick={() => setType("call")} className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${tel ? "bg-slate-900 text-white active:bg-slate-700" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><Phone size={18} />Call</a>
        <a href={wa ? `${wa}?text=${encodeURIComponent(waMessage(r))}` : undefined} target="_blank" rel="noreferrer" onClick={() => setType("whatsapp")}
          className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${wa ? "bg-green-600 text-white active:bg-green-700" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><MessageCircle size={18} />WhatsApp</a>
        <a href={map || undefined} target="_blank" rel="noreferrer" className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${map ? "bg-blue-50 text-blue-700 active:bg-blue-100" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><MapPin size={18} />Map</a>
      </div>
      <div className="mt-2 text-center text-xs text-slate-500">{r.phone || "No phone"}{r.contact ? ` · ${r.contact}` : ""}</div>

      {/* log a contact */}
      <section className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
        <div className="font-semibold text-slate-900 text-sm mb-3">Log this contact</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {LOG_TYPES.map((t) => <button key={t.id} className={chip(type === t.id)} onClick={() => setType(t.id)}>{t.label}</button>)}
        </div>
        <div className="mt-3"><Label>What happened?</Label>
          <div className="flex flex-wrap gap-2">{OUTCOMES.map((o) => <button key={o} className={chip(outcome === o)} onClick={() => setOutcome(outcome === o ? "" : o)}>{o}</button>)}</div>
        </div>
        <textarea className={inputCls + " mt-3 min-h-[72px]"} placeholder="Notes — rate, MOQ, who you spoke to…" value={note} onChange={(e) => setNote(e.target.value)} />
        {!noFollow && (
          <div className="mt-3"><Label>Follow up</Label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              {FOLLOW_CHIPS.map(([l, n]) => <button key={l} className={chip(follow === addDays(n))} onClick={() => setFollow(addDays(n))}>{l}</button>)}
              <input type="date" className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs" value={follow} min={today()} onChange={(e) => setFollow(e.target.value)} />
            </div>
          </div>
        )}
        <input className={inputCls + " mt-3"} placeholder="Next step (e.g. send label size, visit factory)" value={next} onChange={(e) => setNext(e.target.value)} />
        {suggested !== r.status && <div className="mt-2 text-xs text-slate-600">Stage will move to <b style={{ color: STAGE_COL[suggested] }}>{suggested}</b></div>}
        <button onClick={save} disabled={!outcome && !note.trim()} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white disabled:opacity-40 active:bg-orange-700">
          <Check size={16} />Save log
        </button>
      </section>

      {/* stage */}
      <section className="mt-5"><Label>Stage</Label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {STAGES.map((s) => (
            <button key={s} onClick={() => onChange({ status: s })} className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={r.status === s ? { background: STAGE_COL[s], borderColor: STAGE_COL[s], color: "#fff" } : { borderColor: "#E2E8F0", color: STAGE_COL[s] }}>{s}</button>
          ))}
        </div>
      </section>

      {/* quote */}
      <section className="mt-5"><Label>Quote</Label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="₹ per unit" value={r.price} inputMode="decimal" onChange={(v) => onChange({ price: v })} />
          <Field label="MOQ (units)" value={r.moq} inputMode="numeric" onChange={(v) => onChange({ moq: v })} />
          <Field label="Lead time" value={r.lead} placeholder="e.g. 10 days" onChange={(v) => onChange({ lead: v })} />
          <Field label="Sample cost ₹" value={r.sampleCost} inputMode="decimal" onChange={(v) => onChange({ sampleCost: v })} />
        </div>
        <div className="mt-3"><Field label="Payment terms" value={r.terms} placeholder="e.g. 50% advance, rest on delivery" onChange={(v) => onChange({ terms: v })} /></div>
      </section>

      {/* details */}
      <section className="mt-5"><Label>Details</Label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact person" value={r.contact} onChange={(v) => onChange({ contact: v })} />
          <Field label="Phone" value={r.phone} type="tel" onChange={(v) => onChange({ phone: v })} />
        </div>
        <div className="mt-3 space-y-3">
          <Field label="Email" value={r.email} type="email" onChange={(v) => onChange({ email: v })} />
          <Field label="What we need from them" value={r.use} onChange={(v) => onChange({ use: v })} />
          <label className="block"><span className="text-xs text-slate-500">Notes</span>
            <textarea className={inputCls + " mt-1 min-h-[64px]"} value={r.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} /></label>
          <div className="text-xs text-slate-400">Source: {r.source || "—"}</div>
        </div>
      </section>

      {/* timeline */}
      <section className="mt-5"><Label>History ({mine.length})</Label>
        {mine.length ? (
          <ol className="relative border-l border-slate-200 ml-2 space-y-4">
            {mine.map((l) => { const Icon = TYPE_ICON[l.type] || Phone; return (
              <li key={l.id} className="ml-4">
                <span className="absolute -left-[9px] mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white ring-1 ring-slate-200"><Icon size={10} className="text-slate-500" /></span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{new Date(l.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  {l.outcome && <span className="font-semibold text-slate-700">{l.outcome}</span>}
                  {l.by && <span>· {l.by}</span>}
                  <button onClick={() => onDeleteLog(l.id)} aria-label="Delete log" className="ml-auto p-1 text-slate-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
                {l.note && <div className="mt-0.5 text-sm text-slate-800 whitespace-pre-wrap">{l.note}</div>}
              </li>); })}
          </ol>
        ) : <div className="text-sm text-slate-400">No calls logged yet.</div>}
      </section>

      <button onClick={() => (armDel ? onDelete() : setArmDel(true))} className={`mt-6 w-full rounded-xl py-2.5 text-xs font-medium ${armDel ? "bg-red-600 text-white" : "text-slate-400"}`}>
        <Trash2 size={13} className="inline mr-1" />{armDel ? "Tap again to delete supplier" : "Delete supplier"}
      </button>
    </Sheet>
  );
}
