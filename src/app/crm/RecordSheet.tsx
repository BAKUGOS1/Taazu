import { useEffect, useState } from "react";
import { Phone, MessageCircle, MapPin, Trash2, Check, MessageSquare, Footprints, Mail, ShieldCheck, ExternalLink, PhoneForwarded } from "lucide-react";
import Sheet from "../../components/Sheet";
import { usePrefs } from "../../lib/prefs";
import { CalcButton } from "../calculator";
import { Dot, inputCls } from "../../components/ui";
import { COL, mapUrl, telHref, waHref, today } from "../../lib/core";
import { LOG_TYPES, FOLLOW_CHIPS, addDays, newLog, stageAfter, answered, type CrmConfig, type CrmRecord, type ContactLog, type Field } from "./config";

const TYPE_ICON = { call: Phone, whatsapp: MessageSquare, visit: Footprints, email: Mail };
const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;
const Label = ({ children }) => <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{children}</div>;

function Input({ f, value, onChange }: { f: Field; value: any; onChange: (v: string) => void }) {
  return (
    <label className={`block ${f.half ? "" : "col-span-2"}`}>
      <span className="text-xs text-slate-500">{f.label}</span>
      <input className={inputCls + " mt-1"} type={f.type || "text"} inputMode={f.inputMode} value={value ?? ""} placeholder={f.placeholder || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function RecordSheet({ cfg, r, logs, startLog, onClose, onChange, onAddLog, onDeleteLog, onDelete }: {
  cfg: CrmConfig; r: CrmRecord | null; logs: ContactLog[]; startLog: string | null; onClose: () => void;
  onChange: (patch: Partial<CrmRecord>) => void; onAddLog: (l: ContactLog, patch: Partial<CrmRecord>) => void;
  onDeleteLog: (id: string) => void; onDelete: () => void;
}) {
  const [type, setType] = useState("call");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [follow, setFollow] = useState("");
  const [followTime, setFollowTime] = useState("");
  const [next, setNext] = useState("");
  const [armDel, setArmDel] = useState(false);

  // Fresh form each time a different record opens (or a Call/WhatsApp tap pre-selects the type).
  useEffect(() => {
    setType(startLog || "call"); setOutcome(""); setNote(""); setFollow(addDays(3)); setFollowTime(""); setNext(r?.next || ""); setArmDel(false);
  }, [r?.id, startLog]);

  const { on, module: moduleOn, lang } = usePrefs(); // before the early return: hooks must run in the same order every render
  if (!r) return null;
  const tel = telHref(r.phone), wa = waHref(r.phone) || waHref(r.phone2), map = mapUrl(r);
  const alts = String(r.phone2 || "").split(/[,/]/).map((p) => p.trim()).filter((p) => telHref(p));
  const mine = logs.filter((l) => l.supplierId === r.id).sort((a, b) => (b.date + (b.at || 0)).localeCompare(a.date + (a.at || 0)));
  const suggested = stageAfter(cfg, r.status, outcome);
  const noFollow = outcome === "Not interested" || outcome === "Wrong number" || cfg.closedStages.includes(suggested);
  const cat = r[cfg.catKey];

  const save = () => {
    if (!outcome && !note.trim()) return;
    onAddLog(newLog(r.id, { type, outcome, note: note.trim() }), { status: suggested, follow: noFollow ? "" : follow, followTime: noFollow ? "" : followTime, next: next.trim() });
    setOutcome(""); setNote("");
  };

  const title = (
    <div>
      <input className="w-full text-lg font-bold text-slate-900 leading-tight bg-transparent focus:outline-none focus:bg-slate-50 rounded" value={r.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Name" />
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Dot color={COL[cat] || "#64748B"} square />{cat}{r.area ? ` · ${r.area}` : ""}<span className="ml-auto">{moduleOn("Calculator") && <CalcButton />}</span></div>
    </div>
  );

  return (
    <Sheet open onClose={onClose} title={title}>
      {/* contact buttons */}
      <div className="grid grid-cols-3 gap-2">
        <a href={tel || undefined} onClick={() => setType("call")} className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${tel ? "bg-slate-900 text-white active:bg-slate-700" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><Phone size={18} />Call</a>
        <a href={wa ? `${wa}?text=${encodeURIComponent(cfg.waMessage(r, lang))}` : undefined} target="_blank" rel="noreferrer" onClick={() => setType("whatsapp")}
          className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${wa ? "bg-green-600 text-white active:bg-green-700" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><MessageCircle size={18} />WhatsApp</a>
        <a href={map || undefined} target="_blank" rel="noreferrer" className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${map ? "bg-blue-50 text-blue-700 active:bg-blue-100" : "bg-slate-100 text-slate-300 pointer-events-none"}`}><MapPin size={18} />Map</a>
      </div>
      <div className="mt-2 text-center text-xs text-slate-500">{r.phone || "No phone"}{r.contact ? ` · ${r.contact}` : ""}</div>
      {alts.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {alts.map((p) => <a key={p} href={telHref(p)} onClick={() => setType("call")} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 active:bg-slate-50"><PhoneForwarded size={12} />{p}</a>)}
        </div>
      )}
      {r.use && <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-700">Why call: </span>{r.use}</div>}

      {/* quote — one place to keep rate, MOQ etc. up to date (the call script lives in Tasks → Script) */}
      {cfg.checklist && (cfg.kind !== "sup" || on("sup.quote")) && (
        <section className="mt-5 rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold text-slate-900 text-sm">{cfg.dealTitle}</div>
            <span className="text-xs font-medium text-slate-500">{answered(cfg, r)}/{cfg.checklist.length} filled</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cfg.checklist.map((f) => <Input key={f.k} f={f} value={r[f.k]} onChange={(v) => onChange({ [f.k]: v })} />)}
          </div>
          {cfg.verify && (
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => onChange({ verified: !r.verified })} disabled={!r.gstin && !r.verified}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold disabled:opacity-40 ${r.verified ? "bg-green-600 text-white" : "border border-green-600 text-green-700"}`}>
                <ShieldCheck size={15} />{r.verified ? "Verified ✓" : "Mark verified"}
              </button>
              <a href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600">GST<ExternalLink size={12} /></a>
              <a href="https://foscos.fssai.gov.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600">FSSAI<ExternalLink size={12} /></a>
            </div>
          )}
          {cfg.verify && !r.verified && <div className="mt-1.5 text-[11px] text-slate-400">Verify = GSTIN shows Active with the same business name, and FSSAI licence lists beverages.</div>}
        </section>
      )}

      {/* log a contact */}
      <section className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
        <div className="font-semibold text-slate-900 text-sm mb-3">Log this contact</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {LOG_TYPES.map((t) => <button key={t.id} className={chip(type === t.id)} onClick={() => setType(t.id)}>{t.label}</button>)}
        </div>
        <div className="mt-3"><Label>What happened?</Label>
          <div className="flex flex-wrap gap-2">{cfg.outcomes.map((o) => <button key={o} className={chip(outcome === o)} onClick={() => setOutcome(outcome === o ? "" : o)}>{o}</button>)}</div>
        </div>
        <textarea className={inputCls + " mt-3 min-h-[72px]"} placeholder="Notes — what they said, who you spoke to…" value={note} onChange={(e) => setNote(e.target.value)} />
        {!noFollow && (
          <div className="mt-3"><Label>Follow up</Label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              {FOLLOW_CHIPS.map(([l, n]) => <button key={l} className={chip(follow === addDays(n))} onClick={() => setFollow(addDays(n))}>{l}</button>)}
              <input type="date" className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs" value={follow} min={today()} onChange={(e) => setFollow(e.target.value)} />
              <input type="time" aria-label="Time" className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs" value={followTime} onChange={(e) => setFollowTime(e.target.value)} />
            </div>
          </div>
        )}
        <input className={inputCls + " mt-3"} placeholder="Next step" value={next} onChange={(e) => setNext(e.target.value)} />
        {suggested !== r.status && <div className="mt-2 text-xs text-slate-600">Stage will move to <b style={{ color: cfg.stageCol[suggested] }}>{suggested}</b></div>}
        <button onClick={save} disabled={!outcome && !note.trim()} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white disabled:opacity-40 active:bg-orange-700">
          <Check size={16} />Save log
        </button>
      </section>

      {/* stage */}
      <section className="mt-5"><Label>Stage</Label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {cfg.stages.map((s) => (
            <button key={s} onClick={() => onChange({ status: s })} className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={r.status === s ? { background: cfg.stageCol[s], borderColor: cfg.stageCol[s], color: "#fff" } : { borderColor: "#E2E8F0", color: cfg.stageCol[s] }}>{s}</button>
          ))}
        </div>
      </section>

      {cfg.kind === "buy" && (
        <section className="mt-5"><Label>Priority</Label>
          <div className="flex gap-2">
            {["A", "B", "C"].map((p) => <button key={p} onClick={() => onChange({ priority: p })} className={chip(r.priority === p) + " w-12"}>{p}</button>)}
          </div>
        </section>
      )}

      {/* deal / quote */}
      {cfg.dealFields.length > 0 && (cfg.kind === "sup" || on("buy.deal")) && <section className="mt-5"><Label>{cfg.dealTitle}</Label>
        <div className="grid grid-cols-2 gap-3">
          {cfg.dealFields.map((f) => <Input key={f.k} f={f} value={r[f.k]} onChange={(v) => onChange({ [f.k]: v })} />)}
        </div>
      </section>}

      {/* details */}
      <section className="mt-5"><Label>Details</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input f={{ k: "contact", label: "Contact person", half: true }} value={r.contact} onChange={(v) => onChange({ contact: v })} />
          <Input f={{ k: "phone", label: "Phone", type: "tel", half: true }} value={r.phone} onChange={(v) => onChange({ phone: v })} />
          <Input f={{ k: "phone2", label: "Other numbers (comma-separated)", type: "tel", placeholder: "e.g. 98xxxxxx01, 079 xxxx xxxx" }} value={r.phone2} onChange={(v) => onChange({ phone2: v })} />
          <Input f={{ k: "area", label: "Area", half: true }} value={r.area} onChange={(v) => onChange({ area: v })} />
          <Input f={{ k: "city", label: "City", half: true, placeholder: "Ahmedabad" }} value={r.city} onChange={(v) => onChange({ city: v })} />
          <Input f={{ k: cfg.catKey, label: "Category", half: true }} value={cat} onChange={(v) => onChange({ [cfg.catKey]: v })} />
          <Input f={{ k: "email", label: "Email", type: "email" }} value={r.email} onChange={(v) => onChange({ email: v })} />
          {cfg.detailFields.filter((f) => f.k !== "use" || !cfg.checklist).map((f) => <Input key={f.k} f={f} value={r[f.k]} onChange={(v) => onChange({ [f.k]: v })} />)}
          <label className="block col-span-2"><span className="text-xs text-slate-500">Notes</span>
            <textarea className={inputCls + " mt-1 min-h-[64px]"} value={r.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} /></label>
          <div className="col-span-2 text-xs text-slate-400">Source: {r.source || "—"}</div>
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
        <Trash2 size={13} className="inline mr-1" />{armDel ? `Tap again to delete ${cfg.noun}` : `Delete ${cfg.noun}`}
      </button>
    </Sheet>
  );
}
