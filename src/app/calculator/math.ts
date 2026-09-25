/* Calculator maths, kept free of UI so it can be checked on its own. */

const OPS = new Set(["+", "-", "×", "÷"]);

type Val = { v: number; pct: boolean };

/* Evaluate "12+3×4", "200-10%", "(5+5)÷2". Returns null while the expression is unfinished.
   Percent works like a phone calculator: 200+10% = 220, 50×10% = 5. */
export function evaluate(src: string): number | null {
  const s = src.replace(/\s+/g, "").replace(/\*/g, "×").replace(/\//g, "÷").replace(/−/g, "-");
  if (!s) return null;
  let i = 0;

  const number = (): number | null => {
    const m = /^\d+\.\d*|^\.\d+|^\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return parseFloat(m[0]);
  };
  const factor = (): Val | null => {
    let neg = false;
    while (s[i] === "-") { neg = !neg; i++; }
    let v: number | null;
    if (s[i] === "(") {
      i++;
      const inner = expr();
      if (inner === null) return null;
      if (s[i] === ")") i++;
      v = inner;
    } else v = number();
    if (v === null) return null;
    let pct = false;
    while (s[i] === "%") { i++; pct = true; }
    return { v: neg ? -v : v, pct };
  };
  const term = (): Val | null => {
    let left = factor();
    if (!left) return null;
    while (s[i] === "×" || s[i] === "÷") {
      const op = s[i++];
      const right = factor();
      if (!right) return null;
      const a = left.pct ? left.v / 100 : left.v;
      const b = right.pct ? right.v / 100 : right.v;
      if (op === "÷" && b === 0) return null;
      left = { v: op === "×" ? a * b : a / b, pct: false };
    }
    return left;
  };
  const expr = (): number | null => {
    let left = term();
    if (!left) return null;
    let acc = left.pct ? left.v / 100 : left.v;
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const right = term();
      if (!right) return null;
      const amount = right.pct ? (acc * right.v) / 100 : right.v;
      acc = op === "+" ? acc + amount : acc - amount;
    }
    return acc;
  };

  const out = expr();
  if (out === null || i < s.length || !Number.isFinite(out)) return null;
  return out;
}

/* 0.1+0.2 shows as 0.3, huge and tiny values stay readable. */
export function trimNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const r = Math.round(n * 1e8) / 1e8;
  return String(r);
}

export const isOp = (c: string) => OPS.has(c);

export const num = (v: unknown): number => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const money = (n: number, dp = 2): string =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : Math.min(2, dp), maximumFractionDigits: dp });

/* ---- deal calculators ---- */

export type LandedInput = { items: number[]; freight: number; qty: number };
export function landed({ items, freight, qty }: LandedInput) {
  const perUnit = items.reduce((s, x) => s + x, 0);
  const freightPerUnit = qty > 0 ? freight / qty : 0;
  const landedUnit = perUnit + freightPerUnit;
  return { perUnit, freightPerUnit, landedUnit, batch: landedUnit * qty };
}

export function margin(cost: number, price: number, qty: number) {
  const profit = price - cost;
  return {
    profit,
    marginPct: price > 0 ? (profit / price) * 100 : 0,
    markupPct: cost > 0 ? (profit / cost) * 100 : 0,
    total: profit * qty,
  };
}
/* Selling price that gives a target margin (of price) on a cost. */
export const priceForMargin = (cost: number, marginPct: number) => (marginPct >= 100 ? 0 : cost / (1 - marginPct / 100));

export function gst(amount: number, rate: number, mode: "add" | "remove") {
  const base = mode === "add" ? amount : amount / (1 + rate / 100);
  const tax = mode === "add" ? (amount * rate) / 100 : amount - base;
  return { base, tax, total: base + tax, half: tax / 2 };
}

export function order(qty: number, rate: number, discountPct: number, gstPct: number) {
  const subtotal = qty * rate;
  const discount = (subtotal * discountPct) / 100;
  const taxable = subtotal - discount;
  const tax = (taxable * gstPct) / 100;
  const total = taxable + tax;
  return { subtotal, discount, taxable, tax, total, perUnit: qty > 0 ? total / qty : 0 };
}
