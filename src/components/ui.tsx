import { useState, useEffect } from "react";
import { Phone, MessageCircle, MapPin, LayoutGrid, Table as TableIcon } from "lucide-react";
import { STATUS_COL, telHref, waHref, mapUrl } from "../lib/core";

/* ---------------- UI primitives ---------------- */
export const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400";
export const btn = "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";
export const btnPrimary = `${btn} bg-orange-600 text-white hover:bg-orange-700`;
export const btnGhost = `${btn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`;

export function Dot({ color, square = false }) {
  return <span className={`inline-block w-2 h-2 shrink-0 ${square ? "rounded-sm" : "rounded-full"}`} style={{ background: color }} />;
}
export function Tag({ children, color = "#64748B" }) {
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"><Dot color={color} />{children}</span>;
}
export function StatusSelect({ value, options, onChange }) {
  const c = STATUS_COL[value] || "#64748B";
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-xs font-semibold rounded-md pl-2 pr-6 py-1 border bg-white" style={{ borderColor: c + "66", color: c }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
export function IconLink({ href, icon: Icon, label, tone = "slate", external = false }) {
  const tones = { slate: "text-slate-600 hover:bg-slate-100", green: "text-green-700 hover:bg-green-50", blue: "text-blue-700 hover:bg-blue-50" };
  if (!href) return <span className="w-8 h-8 inline-flex items-center justify-center text-slate-200" title={`No ${label.toLowerCase()}`}><Icon size={16} /></span>;
  return (
    <a href={href} title={label} aria-label={label} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`w-8 h-8 inline-flex items-center justify-center rounded-md ${tones[tone]}`}><Icon size={16} /></a>
  );
}
export function ContactIcons({ r }) {
  return (
    <span className="inline-flex items-center">
      <IconLink href={telHref(r.phone)} icon={Phone} label="Call" />
      <IconLink href={waHref(r.phone)} icon={MessageCircle} label="WhatsApp" tone="green" external />
      <IconLink href={mapUrl(r)} icon={MapPin} label={r.lat ? "Directions" : "Search on map"} tone="blue" external />
    </span>
  );
}
export function PageHead({ title, sub = null, children = null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h1>
        {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
export function Panel({ title = null, icon: Icon = null, action = null, children, className = "" }) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{Icon && <Icon size={16} className="text-slate-400" />}{title}</div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
export function Stat({ icon: Icon, label, value, hint = null }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500"><Icon size={14} />{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
export function Bar({ value, max, color = "#EA580C" }) {
  return <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, background: color }} /></div>;
}
export function Empty({ icon: Icon, text }) {
  return <div className="flex flex-col items-center text-center py-6 text-sm text-slate-500"><Icon size={22} className="text-slate-300 mb-2" />{text}</div>;
}

/* ---------------- shared List view setting (Table / Cards), remembered ---------------- */
let VIEW_PREF = "table";
let VIEW_LOADED = false;
const VIEW_SUBS = new Set<(x: string) => void>();
export function useViewPref() {
  const [v, setV] = useState(VIEW_PREF);
  useEffect(() => {
    const fn = (x) => setV(x);
    VIEW_SUBS.add(fn);
    if (!VIEW_LOADED && window.storage) {
      VIEW_LOADED = true;
      Promise.resolve(window.storage.get("hq-view", false))
        .then((r) => { if (r && r.value) { VIEW_PREF = r.value; VIEW_SUBS.forEach((f) => f(r.value)); } })
        .catch(() => {});
    }
    return () => { VIEW_SUBS.delete(fn); };
  }, []);
  const set = (x) => {
    VIEW_PREF = x;
    VIEW_SUBS.forEach((f) => f(x));
    try { window.storage && Promise.resolve(window.storage.set("hq-view", x, false)).catch(() => {}); } catch (e) { /* ignore */ }
  };
  return [v, set] as const;
}
export function ViewToggle({ dark = false }) {
  const [v, setV] = useViewPref();
  const opts: [string, string, typeof TableIcon][] = [["table", "Table", TableIcon], ["cards", "Cards", LayoutGrid]];
  return (
    <div className={`inline-flex rounded-lg p-1 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
      {opts.map(([id, l, Icon]) => (
        <button key={id} onClick={() => setV(id)}
          className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${v === id ? (dark ? "bg-slate-600 text-white" : "bg-white text-slate-900 shadow-sm") : dark ? "text-slate-400" : "text-slate-500"}`}>
          <Icon size={14} />{l}
        </button>
      ))}
    </div>
  );
}
