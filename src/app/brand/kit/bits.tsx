import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy", className = "" }: { text: string | (() => string); label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    const v = typeof text === "function" ? text() : text;
    try { await navigator.clipboard.writeText(v); } catch {
      const t = document.createElement("textarea"); t.value = v; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch { /* nothing else to try */ } t.remove();
    }
    setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return (
    <button type="button" onClick={copy} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${done ? "border-transparent bg-green-50 text-green-700" : "border-stone-200 bg-white text-stone-700 hover:border-orange-300 hover:text-orange-700"} ${className}`}>
      {done ? <Check size={14} /> : <Copy size={14} />}{done ? "Copied" : label}
    </button>
  );
}

/** A row of choice chips. */
export function Chips<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: ReactNode; disabled?: boolean }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.v} type="button" disabled={o.disabled} onClick={() => onChange(o.v)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${o.v === value ? "border-stone-900 bg-stone-900 text-white shadow-sm" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export const Label = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-bold text-stone-600">
    <span>{children}</span>{hint && <span className="text-[11px] font-medium text-stone-400">{hint}</span>}
  </div>
);

export const CHECKER_DARK = { backgroundColor: "#2A2320", backgroundImage: "conic-gradient(#3A302A 25%, transparent 0 50%, #3A302A 0 75%, transparent 0)", backgroundSize: "18px 18px" };
export const CHECKER = { backgroundColor: "#fff", backgroundImage: "conic-gradient(#EEE7DA 25%, transparent 0 50%, #EEE7DA 0 75%, transparent 0)", backgroundSize: "18px 18px" };

// Browser storage can be blocked (private mode); the kit still works without it.
export function readStore<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? { ...fallback, ...JSON.parse(v) } : fallback; } catch { return fallback; }
}
export function writeStore(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ }
}
