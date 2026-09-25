import { useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Bar, Empty, inputCls } from "../../components/ui";
import { uid, inr } from "../../lib/core";

type Item = { id: string; bucket: string; planned: number | string; actual: number | string; notes?: string };
const num = (v: unknown) => Number(v) || 0;
const chip = "shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 active:bg-slate-50";

export default function BudgetView({ bud, setBud }: { bud: Item[]; setBud: (b: Item[]) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const plan = bud.reduce((s, r) => s + num(r.planned), 0);
  const spent = bud.reduce((s, r) => s + num(r.actual), 0);
  const left = plan - spent;
  const pct = plan ? Math.min(100, Math.round((spent / plan) * 100)) : 0;
  const cur = bud.find((b) => b.id === openId) || null;
  const up = (id: string, p: Partial<Item>) => setBud(bud.map((b) => (b.id === id ? { ...b, ...p } : b)));
  const add = () => { const b: Item = { id: uid(), bucket: "New item", planned: 0, actual: 0, notes: "" }; setBud([...bud, b]); setOpenId(b.id); };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-slate-900 p-4 text-white">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400">Spent</div>
            <div className="text-3xl font-bold">{inr(spent)}</div>
            <div className="text-xs text-slate-400">of {inr(plan)} planned</div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${left < 0 ? "text-red-400" : "text-green-400"}`}>{inr(Math.abs(left))}</div>
            <div className="text-xs text-slate-400">{left < 0 ? "over budget" : "left"}</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full" style={{ width: `${pct}%`, background: left < 0 ? "#F87171" : "#4ADE80" }} /></div>
        <div className="mt-1 text-right text-[11px] text-slate-400">{pct}% used</div>
      </div>

      <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
        {bud.map((b) => {
          const p = num(b.planned), a = num(b.actual), over = a > p && p > 0;
          return (
            <button key={b.id} onClick={() => setOpenId(b.id)} className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-sm font-semibold text-slate-900 leading-snug">{b.bucket}</div>
                <div className={`shrink-0 text-sm font-bold ${over ? "text-red-600" : "text-slate-900"}`}>{inr(a)}<span className="font-normal text-slate-400"> / {inr(p)}</span></div>
              </div>
              <div className="mt-2"><Bar value={a} max={p} color={over ? "#DC2626" : "#16A34A"} /></div>
              <div className="mt-1.5 flex justify-between text-xs">
                <span className={over ? "text-red-600 font-medium" : "text-slate-500"}>{over ? `${inr(a - p)} over` : `${inr(p - a)} left`}</span>
                {b.notes && <span className="ml-3 truncate text-slate-400">{b.notes}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {!bud.length && <Empty icon={Wallet} text="No budget lines yet." />}
      <button onClick={add} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 active:bg-slate-100"><Plus size={16} />Add budget line</button>

      <ItemSheet key={cur?.id || "none"} b={cur} onClose={() => setOpenId(null)} onChange={(p) => cur && up(cur.id, p)} onDelete={() => { if (cur) { setBud(bud.filter((x) => x.id !== cur.id)); setOpenId(null); } }} />
    </div>
  );
}

function ItemSheet({ b, onClose, onChange, onDelete }: { b: Item | null; onClose: () => void; onChange: (p: Partial<Item>) => void; onDelete: () => void }) {
  const [arm, setArm] = useState(false);
  if (!b) return null;
  const a = num(b.actual);
  return (
    <Sheet open onClose={onClose} title={<input className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none" value={b.bucket} onChange={(e) => onChange({ bucket: e.target.value })} aria-label="Budget line" />}>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="text-xs text-slate-500">Planned ₹</span><input className={inputCls + " mt-1"} inputMode="numeric" value={b.planned} onChange={(e) => onChange({ planned: e.target.value === "" ? "" : num(e.target.value) })} /></label>
        <label className="block"><span className="text-xs text-slate-500">Spent so far ₹</span><input className={inputCls + " mt-1"} inputMode="numeric" value={b.actual} onChange={(e) => onChange({ actual: e.target.value === "" ? "" : num(e.target.value) })} /></label>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Add a payment</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[100, 500, 1000, 2000, 5000].map((n) => <button key={n} className={chip} onClick={() => onChange({ actual: a + n })}>+ ₹{n.toLocaleString("en-IN")}</button>)}
          <button className={chip + " text-red-600"} onClick={() => onChange({ actual: 0 })}>Reset</button>
        </div>
      </div>
      <label className="mt-4 block"><span className="text-xs text-slate-500">Notes (vendor, bill no.)</span><textarea className={inputCls + " mt-1 min-h-[72px]"} value={b.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} /></label>
      <button onClick={() => (arm ? onDelete() : setArm(true))} className={`mt-6 w-full rounded-xl py-2.5 text-xs font-medium ${arm ? "bg-red-600 text-white" : "text-slate-400"}`}>
        <Trash2 size={13} className="inline mr-1" />{arm ? "Tap again to delete line" : "Delete line"}
      </button>
    </Sheet>
  );
}
