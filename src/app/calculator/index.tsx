import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Calculator as CalcIcon, Delete, Copy, Check } from "lucide-react";
import Sheet from "../../components/Sheet";
import { inputCls } from "../../components/ui";
import { evaluate, trimNumber, isOp, num, money, landed, margin, priceForMargin, gst, order } from "./math";

/* Quick maths for the middle of a call. Opens from the round button, or from
   inside a supplier / buyer sheet, without losing the conversation. */

type CalcApi = { open: () => void };
const CalcCtx = createContext<CalcApi>({ open: () => {} });
export const useCalc = () => useContext(CalcCtx);

const TABS = [["calc", "Calc"], ["cost", "Cost"], ["margin", "Margin"], ["gst", "GST"], ["order", "Order"]] as const;
type Tab = (typeof TABS)[number][0];

/* Like useState, but remembered on this device, so numbers survive closing the calculator or reloading. */
function useStored<T>(key: string, init: T): [T, (v: T) => void] {
  const k = "taazu-calc-" + key;
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(k); return s === null ? init : JSON.parse(s); } catch { return init; } });
  const set = useCallback((x: T) => { setV(x); try { localStorage.setItem(k, JSON.stringify(x)); } catch { /* storage blocked */ } }, [k]);
  return [v, set];
}

const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;

/* ---------- small building blocks ---------- */

function Field({ label, value, onChange, prefix = "", suffix = "", placeholder = "0" }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="relative mt-1">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>}
        <input className={inputCls} style={{ paddingLeft: prefix ? 28 : undefined, paddingRight: suffix ? 32 : undefined }} inputMode="decimal" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function Result({ label, value, tone = "", big = false, hint = "" }: { label: string; value: string; tone?: string; big?: boolean; hint?: string }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${tone || "bg-slate-50"}`}>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`${big ? "text-2xl" : "text-base"} font-bold text-slate-900`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

const Rates = ({ value, onPick, list = [0, 5, 12, 18, 28] }: { value: string; onPick: (v: string) => void; list?: number[] }) => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar">{list.map((r) => <button key={r} className={chip(num(value) === r && value !== "")} onClick={() => onPick(String(r))}>{r}%</button>)}</div>
);

/* ---------- keypad ---------- */

const KEYS = ["C", "⌫", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "00", "0", ".", "="];

function Keypad({ hist, setHist, active }: { hist: string[]; setHist: (h: string[]) => void; active: boolean }) {
  const [expr, setExpr] = useState("");
  const [copied, setCopied] = useState(false);
  const live = useMemo(() => evaluate(expr), [expr]);

  const press = useCallback((k: string) => {
    setCopied(false);
    setExpr((e) => {
      if (k === "C") return "";
      if (k === "⌫") return e.slice(0, -1);
      if (k === "=") {
        const v = evaluate(e);
        if (v === null) return e;
        const t = trimNumber(v);
        setHist([t, ...hist.filter((h) => h !== t)].slice(0, 6));
        return t;
      }
      const last = e.slice(-1);
      if (isOp(k)) {
        if (!e) return k === "-" ? "-" : "";
        if (isOp(last)) return e.slice(0, -1) + k;   // swap operator
        return e + k;
      }
      if (k === "%") return e && !isOp(last) && last !== "%" ? e + "%" : e;
      if (k === ".") {
        const cur = e.split(/[+\-×÷()]/).pop() || "";
        return cur.includes(".") ? e : e + (cur === "" ? "0." : ".");
      }
      if (k === "00" && (!e || isOp(last))) return e + "0";
      return e + k;
    });
  }, [hist, setHist]);

  // Physical keyboard on desktop.
  useEffect(() => {
    if (!active) return;
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const map: Record<string, string> = { "*": "×", "/": "÷", Enter: "=", "=": "=", Backspace: "⌫", Delete: "C", Escape: "" };
      const k = map[ev.key] ?? ev.key;
      if (ev.key === "Escape") return;
      if (/^[0-9.+\-×÷%=]$/.test(k) || k === "⌫" || k === "C") { ev.preventDefault(); press(k); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, active]);

  const copy = async () => { if (live === null) return; try { await navigator.clipboard.writeText(trimNumber(live)); setCopied(true); } catch { /* clipboard blocked */ } };

  return (
    <div>
      <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
        <div className="min-h-[24px] break-all text-sm text-slate-400" aria-label="Expression">{expr || " "}</div>
        <div className="mt-1 flex items-center justify-end gap-2">
          {live !== null && expr && (
            <button onClick={copy} aria-label="Copy result" className="rounded-lg p-1.5 text-slate-400 active:bg-white/10">{copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}</button>
          )}
          <div className="text-3xl font-bold tabular-nums" aria-live="polite">{live !== null ? Number(trimNumber(live)).toLocaleString("en-IN", { maximumFractionDigits: 8 }) : expr ? "…" : "0"}</div>
        </div>
      </div>
      {hist.length > 0 && (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] text-slate-400">Recent</span>
          {hist.map((h) => <button key={h} className={chip(false)} onClick={() => setExpr((e) => (e && !isOp(e.slice(-1)) ? h : e + h))}>{Number(h).toLocaleString("en-IN", { maximumFractionDigits: 8 })}</button>)}
        </div>
      )}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {KEYS.map((k) => {
          const op = isOp(k) || k === "%";
          const eq = k === "=";
          return (
            <button key={k} onClick={() => press(k)} aria-label={k === "⌫" ? "Backspace" : k}
              className={`flex h-14 items-center justify-center rounded-2xl text-xl font-semibold active:scale-95 transition ${eq ? "bg-orange-600 text-white" : k === "C" ? "bg-red-50 text-red-600" : op || k === "⌫" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-900"}`}>
              {k === "⌫" ? <Delete size={20} /> : k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- deal calculators ---------- */

const COST_ITEMS = ["Bottling / job-work", "Bottle + cap", "Label", "Premix / flavour", "Carton / packing", "Other"];

function Cost() {
  const [items, setItems] = useStored<string[]>("cost.items", COST_ITEMS.map(() => ""));
  const [freight, setFreight] = useStored("cost.freight", "");
  const [qty, setQty] = useStored("cost.qty", "1000");
  const r = landed({ items: items.map(num), freight: num(freight), qty: num(qty) });
  const ok = r.landedUnit > 0 && r.landedUnit <= 15;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Add each cost per bottle to see the real cost landed at your door. Pilot gate: ₹15 or less.</p>
      <div className="grid grid-cols-2 gap-3">
        {COST_ITEMS.map((l, i) => <Field key={l} label={l} prefix="₹" value={items[i]} onChange={(v) => setItems(items.map((x, j) => (j === i ? v : x)))} />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Order quantity" value={qty} onChange={setQty} suffix="pcs" />
        <Field label="Freight, whole order" prefix="₹" value={freight} onChange={setFreight} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Result label="Landed per bottle" value={money(r.landedUnit)} big tone={r.landedUnit === 0 ? "" : ok ? "bg-green-50" : "bg-red-50"} hint={r.landedUnit === 0 ? "" : ok ? "Within ₹15 gate" : `${money(r.landedUnit - 15)} over the ₹15 gate`} />
        <Result label="Whole batch" value={money(r.batch, 0)} big />
        <Result label="Before freight" value={money(r.perUnit)} />
        <Result label="Freight per bottle" value={money(r.freightPerUnit)} />
      </div>
    </div>
  );
}

function Margin() {
  const [cost, setCost] = useStored("margin.cost", "");
  const [price, setPrice] = useStored("margin.price", "");
  const [qty, setQty] = useStored("margin.qty", "1000");
  const [target, setTarget] = useStored("margin.target", "30");
  const [gstIn, setGstIn] = useStored("margin.gstIn", "0");
  // Price the customer pays usually includes GST; what you keep is the price without it.
  const net = num(price) / (1 + num(gstIn) / 100);
  const m = margin(num(cost), net, num(qty));
  const quote = priceForMargin(num(cost), num(target)) * (1 + num(gstIn) / 100);
  const neg = num(price) > 0 && m.profit < 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your cost per unit" prefix="₹" value={cost} onChange={setCost} />
        <Field label="Selling price (MRP)" prefix="₹" value={price} onChange={setPrice} />
        <Field label="Quantity" value={qty} onChange={setQty} suffix="pcs" />
        <Field label="Target margin" value={target} onChange={setTarget} suffix="%" />
      </div>
      <Rates value={target} onPick={setTarget} list={[15, 20, 30, 40, 50]} />
      <div>
        <div className="mb-1.5 text-xs text-slate-500">GST included in the selling price</div>
        <Rates value={gstIn} onPick={setGstIn} list={[0, 5, 18, 40]} />
        {num(gstIn) > 0 && num(price) > 0 && <div className="mt-1.5 text-xs text-slate-500">You keep {money(net)} of every {money(num(price))}; {money(num(price) - net)} goes to GST.</div>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Result label="Profit per unit" value={money(m.profit)} big tone={neg ? "bg-red-50" : num(price) > 0 ? "bg-green-50" : ""} />
        <Result label="Total profit" value={money(m.total, 0)} big tone={neg ? "bg-red-50" : ""} />
        <Result label="Margin" value={`${m.marginPct.toFixed(1)}%`} hint="of selling price" />
        <Result label="Markup" value={`${m.markupPct.toFixed(1)}%`} hint="on cost" />
      </div>
      {num(cost) > 0 && <Result label={`Quote this to earn ${num(target)}% margin`} value={money(quote)} big tone="bg-orange-50" hint={`${money(quote - num(cost))} profit per unit`} />}
    </div>
  );
}

function Gst() {
  const [amount, setAmount] = useStored("gst.amount", "");
  const [rate, setRate] = useStored("gst.rate", "18");
  const [mode, setMode] = useStored<"add" | "remove">("gst.mode", "add");
  const g = gst(num(amount), num(rate), mode);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1">
        {([["add", "Add GST"], ["remove", "Remove GST"]] as const).map(([id, l]) => (
          <button key={id} onClick={() => setMode(id)} className={`rounded-lg py-2 text-xs font-semibold ${mode === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{l}</button>
        ))}
      </div>
      <Field label={mode === "add" ? "Amount before GST" : "Amount including GST"} prefix="₹" value={amount} onChange={setAmount} />
      <div>
        <div className="mb-1.5 text-xs text-slate-500">GST rate</div>
        <Rates value={rate} onPick={setRate} />
        <div className="mt-2"><Field label="Custom rate" value={rate} onChange={setRate} suffix="%" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Result label="Before GST" value={money(g.base)} />
        <Result label={`GST ${num(rate)}%`} value={money(g.tax)} hint={`CGST ${money(g.half)} + SGST ${money(g.half)}`} />
      </div>
      <Result label="Total including GST" value={money(g.total)} big tone="bg-orange-50" />
      <p className="text-xs text-slate-400">Ask your CA for the exact rate on bottle, nimbu drink and powder before quoting.</p>
    </div>
  );
}

function Order() {
  const [qty, setQty] = useStored("order.qty", "1000");
  const [rate, setRate] = useStored("order.rate", "");
  const [disc, setDisc] = useStored("order.disc", "");
  const [tax, setTax] = useStored("order.tax", "12");
  const [budget, setBudget] = useStored("order.budget", "");
  const o = order(num(qty), num(rate), num(disc), num(tax));
  const units = o.perUnit > 0 && num(budget) > 0 ? Math.floor(num(budget) / o.perUnit) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity" value={qty} onChange={setQty} suffix="pcs" />
        <Field label="Rate per unit" prefix="₹" value={rate} onChange={setRate} />
        <Field label="Discount" value={disc} onChange={setDisc} suffix="%" />
        <Field label="GST" value={tax} onChange={setTax} suffix="%" />
      </div>
      <Rates value={tax} onPick={setTax} />
      <div className="grid grid-cols-2 gap-2">
        <Result label="Subtotal" value={money(o.subtotal, 0)} />
        <Result label="Discount" value={`− ${money(o.discount, 0)}`} />
        <Result label={`GST ${num(tax)}%`} value={money(o.tax, 0)} />
        <Result label="Per unit, with GST" value={money(o.perUnit)} />
      </div>
      <Result label="Order total" value={money(o.total, 0)} big tone="bg-orange-50" />
      <div className="rounded-2xl border border-slate-200 p-3">
        <Field label="I can spend" prefix="₹" value={budget} onChange={setBudget} />
        {units > 0 && <div className="mt-2 text-sm text-slate-700">That buys about <b>{units.toLocaleString("en-IN")}</b> units at this rate.</div>}
      </div>
    </div>
  );
}

/* ---------- sheet + host ---------- */

export function CalculatorHost({ enabled, children }: { enabled: boolean; children: any }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useStored<Tab>("tab", "calc");
  const [hist, setHist] = useStored<string[]>("hist", []);
  const api = useMemo<CalcApi>(() => ({ open: () => setOpen(true) }), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <CalcCtx.Provider value={api}>
      {children}
      {enabled && !open && (
        <button onClick={() => setOpen(true)} aria-label="Open calculator"
          className="fixed right-4 z-30 flex md:hidden h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 md:bottom-6 md:right-6"
          style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}>
          <CalcIcon size={22} />
        </button>
      )}
      <Sheet open={open} onClose={close} keepMounted z="z-[70]" title={<div className="text-lg font-bold text-slate-900">Calculator</div>}>
        <div className="mb-4 flex gap-1.5 overflow-x-auto no-scrollbar rounded-xl bg-slate-200/70 p-1">
          {TABS.map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex-1 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{l}</button>
          ))}
        </div>
        <div hidden={tab !== "calc"}><Keypad hist={hist} setHist={setHist} active={open && tab === "calc"} /></div>
        <div hidden={tab !== "cost"}><Cost /></div>
        <div hidden={tab !== "margin"}><Margin /></div>
        <div hidden={tab !== "gst"}><Gst /></div>
        <div hidden={tab !== "order"}><Order /></div>
      </Sheet>
    </CalcCtx.Provider>
  );
}

/* Small button for inside a supplier / buyer sheet. */
export function CalcButton({ className = "" }: { className?: string }) {
  const { open } = useCalc();
  return (
    <button type="button" onClick={open} aria-label="Open calculator" className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 active:bg-slate-50 ${className}`}>
      <CalcIcon size={14} />Calculator
    </button>
  );
}

/* Desktop sidebar entry (the round button is phone-only so it never covers cards). */
export function SidebarCalc() {
  const { open } = useCalc();
  return (
    <button type="button" onClick={open} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
      <CalcIcon size={18} />Calculator
    </button>
  );
}
