import { Star, Palette, ListChecks, Check, AlertCircle, X } from "lucide-react";
import { Panel } from "../../components/ui";
import { BRANDS } from "../../lib/core";

/* ---------------- Brand & Bottle ---------------- */
const BOTTLE = "M65,40 L95,40 L95,70 C95,86 140,98 140,130 L140,345 C140,362 128,372 112,372 L48,372 C32,372 20,362 20,345 L20,130 C20,98 65,86 65,70 Z";
function Bottle({ id, cap, liquid, children }) {
  return (
    <svg viewBox="0 0 160 390" width="150" height="366">
      <defs>
        <clipPath id={"c" + id}><path d={BOTTLE} /></clipPath>
        <linearGradient id={"g" + id} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".3" stopColor="#fff" stopOpacity="0" /><stop offset=".85" stopColor="#000" stopOpacity=".08" /></linearGradient>
      </defs>
      <ellipse cx="80" cy="378" rx="62" ry="7" fill="#000" opacity=".1" />
      <path d={BOTTLE} fill={liquid} opacity=".85" />
      <g clipPath={`url(#c${id})`}>{children}<rect x="0" y="0" width="160" height="390" fill={`url(#g${id})`} /></g>
      <path d={BOTTLE} fill="none" stroke="#0003" strokeWidth="1.2" />
      <rect x="58" y="12" width="44" height="30" rx="5" fill={cap} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={61 + i * 6} y="15" width="2" height="24" fill="#0002" />)}
      <rect x="56" y="40" width="48" height="5" rx="2" fill={cap} opacity=".8" />
    </svg>
  );
}
function Mockups() {
  const Cap = ({ t, s }) => <div className="mt-2"><div className="text-sm font-semibold text-slate-900">{t}</div><div className="text-xs text-slate-500">{s}</div></div>;
  return (
    <div className="flex items-end gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar px-2 md:flex-wrap md:justify-center md:overflow-visible">
      <div className="text-center shrink-0 snap-center">
        <Bottle id="r" cap="#E4572E" liquid="#F3EFC4">
          <defs><pattern id="hex" width="14" height="12" patternUnits="userSpaceOnUse"><polygon points="7,0 14,3.5 14,8.5 7,12 0,8.5 0,3.5" fill="none" stroke="#E8D3B0" strokeWidth="1" /></pattern></defs>
          <rect x="0" y="158" width="160" height="150" fill="#FFF6E6" /><rect x="0" y="158" width="160" height="150" fill="url(#hex)" />
          <rect x="0" y="158" width="160" height="10" fill="#E4572E" /><rect x="0" y="298" width="160" height="10" fill="#E4572E" />
          <text x="80" y="212" textAnchor="middle" fontSize="36" fontWeight="900" fill="#3B1F0E" letterSpacing="3">RANN</text>
          <text x="80" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E4572E">NIMBU · JEERA · NAMAK</text>
          <text x="80" y="250" textAnchor="middle" fontSize="8" fill="#3B1F0E">Electrolyte Drink</text>
          <circle cx="80" cy="270" r="9" fill="#F7C948" /><circle cx="80" cy="270" r="5.5" fill="none" stroke="#fff" strokeWidth="1.2" />
          <text x="80" y="292" textAnchor="middle" fontSize="7.5" fill="#3B1F0E">250 ml · Salt of Kutch</text>
        </Bottle>
        <Cap t="RANN" s="Salt-flat pattern, saffron cap" />
      </div>
      <div className="text-center shrink-0 snap-center">
        <Bottle id="j" cap="#0B6E4F" liquid="#DDF3E8">
          <rect x="0" y="158" width="160" height="150" fill="#0A1630" />
          <path d="M80,176 L100,184 L100,204 C100,218 90,226 80,230 C70,226 60,218 60,204 L60,184 Z" fill="#00B4EE" />
          <path d="M80,190 C86,198 88,204 84,210 C82,214 78,214 76,210 C72,204 74,198 80,190 Z" fill="#fff" />
          <text x="80" y="254" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">JalKavach</text>
          <text x="80" y="270" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7FE3FF">HEAT-SHIFT HYDRATION</text>
          <text x="80" y="292" textAnchor="middle" fontSize="7.5" fill="#B9C8E4">Nimbu · Electrolytes · 250 ml</text>
        </Bottle>
        <Cap t="JalKavach" s="Shield mark, B2B look" />
      </div>
      <div className="text-center shrink-0 snap-center">
        <Bottle id="t" cap="#7CC800" liquid="#EEF9C8">
          <rect x="0" y="158" width="160" height="150" fill="#FFFFFF" />
          <circle cx="118" cy="190" r="34" fill="#F7E04A" /><circle cx="118" cy="190" r="27" fill="#FBF3A8" />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={118 - 27 * Math.cos((a * Math.PI) / 180)} y1={190 - 27 * Math.sin((a * Math.PI) / 180)} x2={118 + 27 * Math.cos((a * Math.PI) / 180)} y2={190 + 27 * Math.sin((a * Math.PI) / 180)} stroke="#F7E04A" strokeWidth="2" />)}
          <text x="24" y="246" fontSize="34" fontWeight="900" fill="#1F7A1F">taazu</text>
          <text x="26" y="264" fontSize="8.5" fontWeight="700" fill="#E4572E">nimbu-namak electrolyte</text>
          <text x="26" y="292" fontSize="7.5" fill="#555">Low sugar* · 250 ml</text>
        </Bottle>
        <Cap t="Taazu" s="Lemon slice, playful" />
      </div>
      <div className="text-center shrink-0 snap-center">
        <svg viewBox="0 0 120 300" width="100" height="250">
          <path d="M20,20 L100,20 L100,280 L20,280 Z" fill="#FFF6E6" stroke="#E8D3B0" />
          {[...Array(9)].map((_, i) => <path key={i} d={`M${20 + i * 10},20 l5,-6 l5,6`} fill="#FFF6E6" stroke="#E8D3B0" />)}
          <rect x="20" y="40" width="80" height="8" fill="#E4572E" />
          <text x="60" y="100" textAnchor="middle" fontSize="22" fontWeight="900" fill="#3B1F0E" transform="rotate(-90 60 150)">RANN</text>
          <text x="60" y="235" textAnchor="middle" fontSize="7" fontWeight="700" fill="#E4572E">STICK · MAKES 500 ml</text>
          <rect x="20" y="252" width="80" height="8" fill="#E4572E" />
        </svg>
        <Cap t="RANN stick" s="Same look for powder" />
      </div>
    </div>
  );
}
export default function BrandView() {
  const must = [
    "Brand + true name: \"Non-carbonated water-based flavoured beverage with electrolytes\"",
    "Ingredients in descending order; green veg logo",
    "Nutrition per 100 ml (energy, carbs, total & added sugar, sodium, potassium)",
    "FSSAI logo + brand owner's and manufacturer's licence numbers & addresses",
    "Net quantity, MRP (incl. taxes), batch, date of manufacture, best before",
    "Consumer-care contact; allergen & sweetener notes if applicable",
  ];
  const avoid = ["\"ORS\" anywhere on the pack", "\"Health drink\" or any cure / disease claim", "\"Low sugar\" unless the lab report supports it"];
  const tips = ["Use the co-packer's stock bottle and cap", "Wrap-around label ~60–70 mm tall (confirm with printer)", "Brand readable from 2 metres", "One colour per flavour; same layout on sachet", "QR code to WhatsApp for reorders", "Print one batch + 20% of labels for the pilot"];
  return (
    <div className="space-y-4">
      <Panel title="Name ideas" icon={Star}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRANDS.map((b) => (
            <div key={b.name} className={`rounded-lg p-3 border ${b.top ? "border-orange-300 bg-orange-50" : "border-slate-200"}`}>
              <div className="flex justify-between items-center gap-2">
                <div className="text-lg font-bold text-slate-900">{b.name}</div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${b.top ? "text-orange-700" : "text-slate-500"}`}>{b.top && <Star size={12} />}{b.pick}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{b.meaning}</div>
              <div className="text-sm text-slate-700 mt-2">{b.why}</div>
              <div className="text-xs text-slate-500 mt-2">Trademark risk: {b.risk}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Search your pick on the IP India trademark portal (class 32) before printing anything.</p>
      </Panel>
      <Panel title="Bottle mockups · 250 ml stock PET" icon={Palette}>
        <div className="bg-slate-50 rounded-lg p-4 md:p-6"><Mockups /></div>
        <p className="text-xs text-slate-400 mt-2 md:hidden">Swipe sideways to see all four.</p>
        <p className="text-xs text-slate-500 mt-3">Concept designs on a standard bottle shape — only the label and cap colour change, so no mould cost.</p>
      </Panel>
      <div className="grid md:grid-cols-3 gap-4">
        <Panel title="Label must include" icon={ListChecks}>
          <ul className="space-y-2">{must.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="text-green-600 shrink-0 mt-0.5" />{m}</li>)}</ul>
        </Panel>
        <Panel title="Never put on the label" icon={AlertCircle}>
          <ul className="space-y-2">{avoid.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><X size={16} className="text-red-600 shrink-0 mt-0.5" />{m}</li>)}</ul>
          <div className="mt-4 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">Competitors launched in 2026: Reliance RasKik Gluco Energy (electrolytes + lemon, ₹10), AQUON and No Secrets sachets. Win on taste or sell where they aren't — direct B2B.</div>
        </Panel>
        <Panel title="Design tips" icon={Palette}>
          <ul className="space-y-2">{tips.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="text-slate-400 shrink-0 mt-0.5" />{m}</li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}

