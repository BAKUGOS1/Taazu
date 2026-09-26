import { useState } from "react";
import { Phone, MessageCircle, CalendarClock, ShieldCheck, Star, ChevronDown } from "lucide-react";
import { COL, telHref, waHref, today } from "../../lib/core";
import { Dot } from "../../components/ui";
import { usePrefs } from "../../lib/prefs";
import { answered, fmtTime, type CrmConfig, type CrmRecord, type ContactLog } from "./config";

const fmtDate = (d: string) => new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function RecordCard({ cfg, r, lastLog = null, onOpen, onCall }: {
  cfg: CrmConfig; r: CrmRecord; lastLog?: ContactLog | null;
  onOpen: (r: CrmRecord) => void; onCall: (r: CrmRecord, via: string) => void;
}) {
  const { lang } = usePrefs();
  const [open, setOpen] = useState(false); // details start closed; tap "Details" to view
  const tel = telHref(r.phone) || telHref(String(r.phone2 || "").split(/[,/]/)[0]);
  const wa = waHref(r.phone) || waHref(r.phone2);
  const tag = cfg.tag?.(r);
  const qa = cfg.checklist ? answered(cfg, r) : 0;
  const late = r.follow && r.follow < today();
  const due = r.follow && r.follow <= today();
  const col = cfg.stageCol[r.status] || "#64748B";
  const badge = cfg.badge?.(r);
  const cat = r[cfg.catKey];
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <button onClick={() => onOpen(r)} className="w-full text-left px-4 pt-3 pb-2 active:bg-slate-50">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-stone-900 leading-snug">{r.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Dot color={COL[cat] || "#64748B"} square /><span className="truncate">{cat}{r.area ? ` · ${r.area}` : ""}{r.city && !String(r.area || "").includes(r.city) ? `, ${r.city}` : ""}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: col, background: col + "18" }}>{r.status}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {r.follow && (
            <span className={`inline-flex items-center gap-1 ${late ? "text-red-600 font-semibold" : due ? "text-orange-700 font-semibold" : "text-slate-500"}`}>
              <CalendarClock size={13} />{due ? (late ? "Overdue · " : "Today · ") : ""}{fmtDate(r.follow)}{r.followTime ? ` · ${fmtTime(r.followTime)}` : ""}
            </span>
          )}
          {tag && <span className="inline-flex items-center gap-1 font-semibold text-orange-700"><Star size={12} fill="currentColor" />{tag}</span>}
          {r.verified && <span className="inline-flex items-center gap-1 font-semibold text-green-700"><ShieldCheck size={13} />Verified</span>}
          {qa > 0 && <span className="text-slate-500">{qa}/{cfg.checklist.length} answered</span>}
          {badge && <span className="text-slate-600">{badge}</span>}
        </div>
        {(r.next || lastLog) && (
          <div className="mt-1.5 text-xs text-slate-600 line-clamp-2">
            {r.next ? <><span className="text-slate-400">Next: </span>{r.next}</> : <><span className="text-slate-400">{lastLog.outcome || lastLog.type}: </span>{lastLog.note}</>}
          </div>
        )}
      </button>
      {(r.about || r.gstin || r.contact || r.source) && (
        <div className="px-4 pb-2">
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
            Details<ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="mt-1.5 space-y-1 rounded-xl bg-stone-50 px-3 py-2 text-xs text-slate-600">
              {r.about && <div><span className="text-slate-400">Expert in: </span>{r.about}</div>}
              {r.area && <div><span className="text-slate-400">Address: </span>{r.area}</div>}
              {(r.contact || r.phone2) && <div><span className="text-slate-400">Contact: </span>{[r.contact, r.phone2].filter(Boolean).join(" · ")}</div>}
              {r.gstin && <div><span className="text-slate-400">GSTIN: </span>{r.gstin}</div>}
              {r.fssai && <div><span className="text-slate-400">FSSAI: </span>{r.fssai}</div>}
              {r.source && <div className="break-words"><span className="text-slate-400">Checked: </span>{r.source}</div>}
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 border-t border-stone-100 bg-stone-50/60 text-sm font-semibold">
        {tel
          ? <a href={tel} onClick={() => onCall(r, "call")} className="flex items-center justify-center gap-2 py-3 text-slate-700 active:bg-slate-50"><Phone size={16} />Call</a>
          : <span className="flex items-center justify-center gap-2 py-3 text-slate-300"><Phone size={16} />No phone</span>}
        {wa
          ? <a href={`${wa}?text=${encodeURIComponent(cfg.waMessage(r, lang))}`} target="_blank" rel="noreferrer" onClick={() => onCall(r, "whatsapp")}
              className="flex items-center justify-center gap-2 py-3 border-l border-slate-100 text-green-700 active:bg-green-50"><MessageCircle size={16} />WhatsApp</a>
          : <span className="flex items-center justify-center gap-2 py-3 border-l border-slate-100 text-slate-300"><MessageCircle size={16} />WhatsApp</span>}
      </div>
    </div>
  );
}
