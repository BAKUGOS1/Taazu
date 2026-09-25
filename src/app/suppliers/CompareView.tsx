import { useMemo, useState } from "react";
import { Trophy, Scale } from "lucide-react";
import { Empty } from "../../components/ui";
import { SUPPLIER_CFG } from "../crm/configs";
import type { CrmRecord as Supplier } from "../crm/config";

const STAGE_COL = SUPPLIER_CFG.stageCol;
const unitPrice = (r: Supplier) => { const p = Number(r.price); return p > 0 ? p : null; };

const MOQ_LIMIT = 2000;
const PRICE_LIMIT = 15;

/* Side-by-side quotes for one category, cheapest first. */
export default function CompareView({ rows, onOpen }: { rows: Supplier[]; onOpen: (r: Supplier) => void }) {
  const quoted = rows.filter((r) => unitPrice(r) !== null || Number(r.moq) > 0);
  const cats = useMemo(() => Array.from(new Set(quoted.map((r) => r.cat))), [quoted]);
  const [cat, setCat] = useState<string>("");
  const active = cats.includes(cat) ? cat : cats[0];
  const list = quoted.filter((r) => r.cat === active).sort((a, b) => (unitPrice(a) ?? 1e9) - (unitPrice(b) ?? 1e9));
  const best = list.find((r) => unitPrice(r) !== null);

  if (!cats.length) return <Empty icon={Scale} text="No quotes yet. Open a supplier and fill ₹/unit and MOQ after the call." />;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${c === active ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"}`}>
            {c} <span className="opacity-60">{quoted.filter((r) => r.cat === c).length}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((r) => {
          const p = unitPrice(r), moq = Number(r.moq) || 0;
          return (
            <button key={r.id} onClick={() => onOpen(r)} className={`w-full text-left rounded-2xl border bg-white p-4 ${r === best ? "border-green-400 ring-1 ring-green-200" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                {r === best && <Trophy size={16} className="text-green-600 shrink-0" />}
                <span className="font-semibold text-slate-900 truncate flex-1">{r.name}</span>
                <span className="text-[11px] font-semibold" style={{ color: STAGE_COL[r.status] }}>{r.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Metric label="₹ / unit" value={p !== null ? `₹${p}` : "—"} ok={p !== null && p <= PRICE_LIMIT} />
                <Metric label="MOQ" value={moq ? moq.toLocaleString("en-IN") : "—"} ok={moq > 0 && moq <= MOQ_LIMIT} />
                <Metric label="Lead time" value={r.lead || "—"} />
              </div>
              {(r.terms || r.sampleCost) && (
                <div className="mt-2 text-xs text-slate-500">{[r.terms, r.sampleCost ? `Sample ₹${r.sampleCost}` : ""].filter(Boolean).join(" · ")}</div>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">Green = meets pilot gate (₹{PRICE_LIMIT} or less per unit, MOQ {MOQ_LIMIT.toLocaleString("en-IN")} or less).</p>
    </div>
  );
}

function Metric({ label, value, ok = undefined }) {
  return (
    <div className={`rounded-xl py-2 ${ok ? "bg-green-50" : "bg-slate-50"}`}>
      <div className={`text-sm font-bold ${ok ? "text-green-700" : "text-slate-900"}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
