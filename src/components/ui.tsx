import { Phone, MessageCircle, MapPin } from "lucide-react";
import { STATUS_COL, telHref, waHref, mapUrl } from "../lib/core";

/* ---------------- UI primitives ---------------- */
export const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white/90 placeholder:text-stone-400 transition focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400";
export const btn = "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition active:scale-[.98]";
export const btnPrimary = `${btn} btn-brand text-white`;
export const btnGhost = `${btn} bg-white border border-stone-200 text-stone-700 shadow-sm hover:bg-stone-50`;

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
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900">{title}</h1>
        {sub && <p className="text-sm text-stone-500 mt-1.5 max-w-2xl">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
export function Panel({ title = null, icon: Icon = null, action = null, children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-stone-200/80 shadow-card ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2.5 text-sm font-bold text-stone-900">{Icon && <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Icon size={15} /></span>}{title}</div>
          {action}
        </div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}
export function Stat({ icon: Icon, label, value, hint = null }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-stone-200/80 shadow-card p-4">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-100/60" />
      <div className="relative flex items-center gap-2 text-xs font-medium text-stone-500"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Icon size={15} /></span>{label}</div>
      <div className="relative text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-stone-900 mt-2">{value}</div>
      {hint && <div className="relative text-xs text-stone-500 mt-1">{hint}</div>}
    </div>
  );
}
export function Bar({ value, max, color = "#EA580C" }) {
  return <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, background: color }} /></div>;
}
export function Empty({ icon: Icon, text }) {
  return <div className="flex flex-col items-center text-center py-6 text-sm text-slate-500"><Icon size={22} className="text-slate-300 mb-2" />{text}</div>;
}
