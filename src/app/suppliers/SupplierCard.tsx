import { Phone, MessageCircle, CalendarClock, IndianRupee } from "lucide-react";
import { COL, telHref, waHref, today } from "../../lib/core";
import { Dot } from "../../components/ui";
import { STAGE_COL, waMessage, type Supplier } from "./model";

const fmtDate = (d: string) => new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function SupplierCard({ r, lastLog = null, onOpen, onCall }) {
  const tel = telHref(r.phone);
  const wa = waHref(r.phone);
  const late = r.follow && r.follow < today();
  const due = r.follow && r.follow <= today();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={() => onOpen(r)} className="w-full text-left px-4 pt-3 pb-2 active:bg-slate-50">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 leading-snug">{r.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Dot color={COL[r.cat] || "#64748B"} square /><span className="truncate">{r.cat} · {r.area}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: STAGE_COL[r.status], background: STAGE_COL[r.status] + "18" }}>{r.status}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {r.follow && (
            <span className={`inline-flex items-center gap-1 ${late ? "text-red-600 font-semibold" : due ? "text-orange-700 font-semibold" : "text-slate-500"}`}>
              <CalendarClock size={13} />{due ? (late ? "Overdue · " : "Today · ") : ""}{fmtDate(r.follow)}
            </span>
          )}
          {Number(r.price) > 0 && <span className="inline-flex items-center gap-0.5 text-slate-600"><IndianRupee size={12} />{r.price}/unit{r.moq ? ` · MOQ ${r.moq}` : ""}</span>}
        </div>
        {(r.next || lastLog) && (
          <div className="mt-1.5 text-xs text-slate-600 line-clamp-2">
            {r.next ? <><span className="text-slate-400">Next: </span>{r.next}</> : <><span className="text-slate-400">{lastLog.outcome || lastLog.type}: </span>{lastLog.note}</>}
          </div>
        )}
      </button>
      <div className="grid grid-cols-2 border-t border-slate-100 text-sm font-medium">
        {tel
          ? <a href={tel} onClick={() => onCall(r, "call")} className="flex items-center justify-center gap-2 py-3 text-slate-700 active:bg-slate-50"><Phone size={16} />Call</a>
          : <span className="flex items-center justify-center gap-2 py-3 text-slate-300"><Phone size={16} />No phone</span>}
        {wa
          ? <a href={`${wa}?text=${encodeURIComponent(waMessage(r))}`} target="_blank" rel="noreferrer" onClick={() => onCall(r, "whatsapp")}
              className="flex items-center justify-center gap-2 py-3 border-l border-slate-100 text-green-700 active:bg-green-50"><MessageCircle size={16} />WhatsApp</a>
          : <span className="flex items-center justify-center gap-2 py-3 border-l border-slate-100 text-slate-300"><MessageCircle size={16} />WhatsApp</span>}
      </div>
    </div>
  );
}
