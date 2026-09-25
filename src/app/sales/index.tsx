import { useState } from "react";
import { Plus, Minus, ShoppingCart, Trash2, Wallet, TrendingUp, Undo2 } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Empty, inputCls } from "../../components/ui";
import { uid, today, inr } from "../../lib/core";
import { usePrefs } from "../../lib/prefs";

type Sale = { id: string; date: string; customer: string; product: string; qty: number | string; rate: number | string; paid: string; notes?: string };

const amt = (r: Sale) => (Number(r.qty) || 0) * (Number(r.rate) || 0);
const isPaid = (r: Sale) => r.paid === "Yes";
const RATES = [10, 15, 20, 30];
const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;
const dayLabel = (d: string) => {
  if (d === today()) return "Today";
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (d === y.toISOString().slice(0, 10)) return "Yesterday";
  return new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

export default function SalesView({ sales, setSales, me = "" }: { sales: Sale[]; setSales: (s: Sale[]) => void; me?: string }) {
  const { on } = usePrefs();
  const quickOn = on("sales.quick"), track = on("sales.unpaid");
  const [chosen, setFilter] = useState<"all" | "unpaid" | "today">("all");
  const filter = !track && chosen === "unpaid" ? "all" : chosen;
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [flash, setFlash] = useState<{ id: string; text: string } | null>(null);

  const up = (id: string, p: Partial<Sale>) => setSales(sales.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const quick = (rate: number) => {
    const s: Sale = { id: uid(), date: today(), customer: "Walk-in", product: "Cup 200 ml", qty: 1, rate, paid: "Yes", notes: me ? `by ${me}` : "" };
    setSales([s, ...sales]);
    setFlash({ id: s.id, text: `Added ₹${rate} cup` });
    setTimeout(() => setFlash((f) => (f && f.id === s.id ? null : f)), 4000);
  };
  const undo = () => { if (flash) { setSales(sales.filter((s) => s.id !== flash.id)); setFlash(null); } };

  const total = sales.reduce((s, r) => s + amt(r), 0);
  const collected = sales.filter(isPaid).reduce((s, r) => s + amt(r), 0);
  const pending = total - collected;
  const units = sales.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const todays = sales.filter((r) => r.date === today());
  const todayAmt = todays.reduce((s, r) => s + amt(r), 0);
  const unpaidN = sales.filter((r) => !isPaid(r)).length;

  const shown = sales.filter((r) => (filter === "unpaid" ? !isPaid(r) : filter === "today" ? r.date === today() : true));
  const days = Array.from(new Set(shown.map((r) => r.date))).sort((a, b) => b.localeCompare(a));
  const cur = sales.find((s) => s.id === openId) || null;

  return (
    <div>
      {/* today banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-4">
        <div className="text-xs text-slate-400">Today</div>
        <div className="mt-0.5 flex items-end gap-3">
          <div className="text-3xl font-bold">{inr(todayAmt)}</div>
          <div className="pb-1 text-xs text-slate-400">{todays.reduce((s, r) => s + (Number(r.qty) || 0), 0)} units · {todays.length} sales</div>
        </div>
        {quickOn && <div className="mt-4 grid grid-cols-4 gap-2">
          {RATES.map((p) => (
            <button key={p} onClick={() => quick(p)} className="rounded-2xl bg-orange-600 py-4 text-lg font-bold active:scale-95 active:bg-orange-700 transition">₹{p}</button>
          ))}
        </div>}
        {quickOn && <div className="mt-2 h-6 text-xs">
          {flash
            ? <span className="inline-flex items-center gap-2 text-green-300">✓ {flash.text} <button onClick={undo} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white"><Undo2 size={11} />Undo</button></span>
            : <span className="text-slate-500">One tap = 1 walk-in cup, paid. Cash or UPI only.</span>}
        </div>}
      </div>

      <div className={`mt-3 grid gap-2 ${track ? "grid-cols-3" : "grid-cols-2"}`}>
        {([[TrendingUp, "Revenue", inr(total), "#0F172A"], ...(track ? [[Wallet, "Collected", inr(collected), "#16A34A"], [Wallet, "Pending", inr(pending), pending > 0 ? "#DC2626" : "#64748B"]] : [[ShoppingCart, "Units sold", String(units), "#16A34A"]])] as any[]).map(([Icon, l, v, c]) => (
          <div key={l} className="rounded-2xl bg-white border border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-500"><Icon size={12} />{l}</div>
            <div className="mt-0.5 text-lg font-bold" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {track && <div className="mt-1 text-center text-[11px] text-slate-400">{units} units sold in total</div>}

      <div className="sticky top-[calc(57px+env(safe-area-inset-top))] md:top-0 z-10 -mx-4 px-4 py-2 mt-2 bg-slate-50/90 backdrop-blur flex items-center gap-2">
        <div className="grid flex-1 rounded-xl bg-slate-200/70 p-1" style={{ gridTemplateColumns: `repeat(${track ? 3 : 2}, minmax(0, 1fr))` }}>
          {([["all", "All"], ["today", "Today"], ...(track ? [["unpaid", `Unpaid${unpaidN ? ` · ${unpaidN}` : ""}`]] : [])] as any[]).map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className={`rounded-lg py-2 text-xs font-semibold ${filter === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => setAdding(true)} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white active:bg-orange-700"><Plus size={16} />Sale</button>
      </div>

      <div className="mt-2 space-y-4">
        {days.map((d) => {
          const rows = shown.filter((r) => r.date === d);
          return (
            <section key={d}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{dayLabel(d)}</span>
                <span className="text-slate-500">{inr(rows.reduce((s, r) => s + amt(r), 0))}</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center">
                    <button onClick={() => setOpenId(r.id)} className="min-w-0 flex-1 text-left px-4 py-3 active:bg-slate-50">
                      <div className="text-sm font-medium text-slate-900 truncate">{r.customer || "Walk-in"}</div>
                      <div className="text-xs text-slate-500 truncate">{r.product} × {r.qty} @ ₹{r.rate}</div>
                    </button>
                    <div className="pr-3 text-right">
                      <div className="text-sm font-bold text-slate-900">{inr(amt(r))}</div>
                      {track && <button onClick={() => up(r.id, { paid: isPaid(r) ? "No" : "Yes" })} className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isPaid(r) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {isPaid(r) ? "Paid" : "Unpaid · tap when paid"}
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {!shown.length && <Empty icon={ShoppingCart} text={filter === "unpaid" ? "Nothing pending. All collected." : "No sales yet. Tap a ₹ button at your stall."} />}
      </div>

      <SaleSheet key={cur?.id || "none"} s={cur} onClose={() => setOpenId(null)} onChange={(p) => cur && up(cur.id, p)} onDelete={() => { if (cur) { setSales(sales.filter((x) => x.id !== cur.id)); setOpenId(null); } }} />
      {adding && <AddSale onClose={() => setAdding(false)} onSave={(s) => { setSales([{ id: uid(), date: today(), notes: me ? `by ${me}` : "", customer: "Walk-in", product: "", qty: 1, rate: 0, paid: "Yes", ...s } as Sale, ...sales]); setAdding(false); }} />}
    </div>
  );
}

function Stepper({ label, value, onChange, step = 1, min = 0 }: { label: string; value: number | string; onChange: (n: number) => void; step?: number; min?: number }) {
  const n = Number(value) || 0;
  return (
    <div>
      <span className="text-xs text-slate-500">{label}</span>
      <div className="mt-1 flex items-center rounded-xl border border-slate-200">
        <button type="button" onClick={() => onChange(Math.max(min, n - step))} className="p-3 text-slate-600 active:bg-slate-50" aria-label={`Less ${label}`}><Minus size={16} /></button>
        <input className="w-full min-w-0 bg-transparent text-center text-base font-semibold focus:outline-none" inputMode="decimal" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
        <button type="button" onClick={() => onChange(n + step)} className="p-3 text-slate-600 active:bg-slate-50" aria-label={`More ${label}`}><Plus size={16} /></button>
      </div>
    </div>
  );
}

function PaidToggle({ paid, onChange }: { paid: boolean; onChange: (p: boolean) => void }) {
  const { on } = usePrefs();
  if (!on("sales.unpaid")) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onChange(true)} className={`rounded-xl border py-2.5 text-sm font-semibold ${paid ? "border-green-600 bg-green-600 text-white" : "border-slate-200 text-green-700"}`}>Paid</button>
      <button type="button" onClick={() => onChange(false)} className={`rounded-xl border py-2.5 text-sm font-semibold ${!paid ? "border-red-600 bg-red-600 text-white" : "border-slate-200 text-red-600"}`}>Not paid yet</button>
    </div>
  );
}

function AddSale({ onClose, onSave }: { onClose: () => void; onSave: (s: Partial<Sale>) => void }) {
  const [f, setF] = useState({ customer: "", product: "Cup 200 ml", qty: 1, rate: 20, paid: "Yes" });
  const total = (Number(f.qty) || 0) * (Number(f.rate) || 0);
  return (
    <Sheet open onClose={onClose} title={<div className="text-lg font-bold text-slate-900">Add sale</div>}
      footer={<button onClick={() => onSave({ ...f, customer: f.customer.trim() || "Walk-in" })} className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white active:bg-orange-700">Save · {inr(total)}</button>}>
      <div className="space-y-4">
        <label className="block"><span className="text-xs text-slate-500">Customer</span><input className={inputCls + " mt-1"} placeholder="Walk-in" value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })} /></label>
        <label className="block"><span className="text-xs text-slate-500">Product</span><input className={inputCls + " mt-1"} value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Quantity" value={f.qty} onChange={(n) => setF({ ...f, qty: n })} />
          <Stepper label="Rate ₹" value={f.rate} step={5} onChange={(n) => setF({ ...f, rate: n })} />
        </div>
        <div className="flex gap-2">{RATES.map((r) => <button key={r} type="button" className={chip(Number(f.rate) === r)} onClick={() => setF({ ...f, rate: r })}>₹{r}</button>)}</div>
        <PaidToggle paid={f.paid === "Yes"} onChange={(p) => setF({ ...f, paid: p ? "Yes" : "No" })} />
      </div>
    </Sheet>
  );
}

function SaleSheet({ s, onClose, onChange, onDelete }: { s: Sale | null; onClose: () => void; onChange: (p: Partial<Sale>) => void; onDelete: () => void }) {
  const [arm, setArm] = useState(false);
  if (!s) return null;
  return (
    <Sheet open onClose={onClose} title={<div><div className="text-lg font-bold text-slate-900">{inr(amt(s))}</div><div className="text-xs text-slate-500">{dayLabel(s.date)}</div></div>}>
      <div className="space-y-4">
        <label className="block"><span className="text-xs text-slate-500">Customer</span><input className={inputCls + " mt-1"} value={s.customer} onChange={(e) => onChange({ customer: e.target.value })} /></label>
        <label className="block"><span className="text-xs text-slate-500">Product</span><input className={inputCls + " mt-1"} value={s.product} onChange={(e) => onChange({ product: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Quantity" value={s.qty} onChange={(n) => onChange({ qty: n })} />
          <Stepper label="Rate ₹" value={s.rate} step={5} onChange={(n) => onChange({ rate: n })} />
        </div>
        <PaidToggle paid={isPaid(s)} onChange={(p) => onChange({ paid: p ? "Yes" : "No" })} />
        <label className="block"><span className="text-xs text-slate-500">Date</span><input type="date" className={inputCls + " mt-1"} value={s.date} onChange={(e) => onChange({ date: e.target.value })} /></label>
        <label className="block"><span className="text-xs text-slate-500">Notes</span><textarea className={inputCls + " mt-1 min-h-[64px]"} value={s.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} /></label>
      </div>
      <button onClick={() => (arm ? onDelete() : setArm(true))} className={`mt-6 w-full rounded-xl py-2.5 text-xs font-medium ${arm ? "bg-red-600 text-white" : "text-slate-400"}`}>
        <Trash2 size={13} className="inline mr-1" />{arm ? "Tap again to delete sale" : "Delete sale"}
      </button>
    </Sheet>
  );
}
