import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import Sheet from "../../components/Sheet";
import type { CrmConfig, CrmRecord } from "./config";

/* Quick stage change from a card: tap the status pill, pick a stage.
   Portalled to <body> so it sits above the mobile dock and calculator button. */
export default function StagePicker({ cfg, r, onPick, onClose }: {
  cfg: CrmConfig; r: CrmRecord | null; onPick: (stage: string) => void; onClose: () => void;
}) {
  return createPortal(
    <Sheet open={!!r} onClose={onClose} z="z-[60]"
      title={<><div className="text-xs font-medium text-slate-500">Change stage</div><div className="font-bold text-stone-900 leading-snug break-words">{r?.name}</div></>}>
      <div className="grid grid-cols-2 gap-2 pb-safe">
        {cfg.stages.map((s) => {
          const on = r?.status === s, col = cfg.stageCol[s] || "#64748B";
          return (
            <button key={s} onClick={() => onPick(s)} aria-pressed={on}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[0.98]"
              style={on ? { background: col, borderColor: col, color: "#fff" } : { borderColor: "#E2E8F0", color: col }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: on ? "#fff" : col }} />
              <span className="min-w-0 flex-1 break-words leading-tight">{s}</span>
              {on && <Check size={16} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </Sheet>,
    document.body,
  );
}
