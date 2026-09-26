import { Suspense, lazy, useState } from "react";
import { Palette, ListChecks, Check, AlertCircle, X, BookOpen, ExternalLink, Droplets, Type, LayoutGrid, Shapes, Images, MessageSquareQuote, Compass, Wand2, ArrowRight } from "lucide-react";
import { Panel } from "../../components/ui";
import dropIcon from "../../../brand-kit/logos/concept-A-icon-color.svg?url";
import wordLeaf from "../../../brand-kit/logos/wordmark-leaf.svg?url";
import { Lockup } from "../../components/BrandMark";

// The kit tabs pull in fonts, the exporter and the QR code, so they load only when opened.
const LogosPanel = lazy(() => import("./kit/LogosPanel"));
const Creatives = lazy(() => import("./kit/Creatives"));
const Slogans = lazy(() => import("./kit/TextPanels").then((m) => ({ default: m.Slogans })));
const Strategy = lazy(() => import("./kit/TextPanels").then((m) => ({ default: m.Strategy })));
const Prompts = lazy(() => import("./kit/TextPanels").then((m) => ({ default: m.Prompts })));

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "logos", label: "Logos", icon: Shapes },
  { id: "creatives", label: "Creatives", icon: Images },
  { id: "slogans", label: "Slogans", icon: MessageSquareQuote },
  { id: "strategy", label: "Strategy", icon: Compass },
  { id: "prompts", label: "AI prompts", icon: Wand2 },
] as const;
type TabId = (typeof TABS)[number]["id"];
const TAB_KEY = "taazu.brand.tab";

export default function BrandView() {
  const [tab, setTabState] = useState<TabId>(() => { try { const t = localStorage.getItem(TAB_KEY); return (TABS.some((x) => x.id === t) ? t : "overview") as TabId; } catch { return "overview"; } });
  const setTab = (t: TabId) => { setTabState(t); try { localStorage.setItem(TAB_KEY, t); } catch { /* storage blocked */ } };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-stone-200/60 p-1 md:grid-cols-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${tab === id ? "bg-white text-orange-700 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      <Suspense fallback={<div className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500">Brand kit khul raha hai…</div>}>
        {tab === "overview" && <Overview go={setTab} />}
        {tab === "logos" && <LogosPanel />}
        {tab === "creatives" && <Creatives />}
        {tab === "slogans" && <Slogans />}
        {tab === "strategy" && <Strategy />}
        {tab === "prompts" && <Prompts />}
      </Suspense>
    </div>
  );
}

/*
 * Brand: Taazu only. One identity, one product prototype, and the hydration facts we
 * use in marketing — each with a real, checkable source. Keep claims general and
 * non-medical; never call Taazu "ORS" or say it treats anything.
 */

export const TAAZU = {
  name: "Taazu",
  gujarati: "તાજું",
  meaning: "Gujarati for 'fresh'",
  tagline: { en: "More than water.", hi: "Paani se aage." },
  promise: "A still, nimbu-namak electrolyte drink made for Ahmedabad's heat — putting back the salts sweat takes out.",
};

const PALETTE = [
  { name: "Taazu Orange", hex: "#EA580C", use: "Logo, caps, buttons" },
  { name: "Nimbu", hex: "#F5D83B", use: "Lemon accents" },
  { name: "Leaf", hex: "#1F7A3A", use: "Wordmark, fresh cues" },
  { name: "Cream", hex: "#FFF8E7", use: "Label background" },
  { name: "Ink", hex: "#1C1917", use: "Text, nutrition panel" },
];

/* ---------- facts with sources (checked Sep 2026) ---------- */
export const FACTS = [
  { stat: "~1 g", title: "Salt leaves with every litre of sweat",
    body: "Sweat is not just water. Across athletes, sweat sodium averages roughly 40 mmol per litre — close to a gram of sodium — and varies a lot from person to person.",
    src: "Baker LB. Sports Medicine 2017;47:111–128", url: "https://link.springer.com/article/10.1007/s40279-017-0691-5" },
  { stat: "0.5–2 L", title: "Sweat per hour in the heat",
    body: "Hard work or exercise in hot weather can mean half a litre to two litres of sweat an hour. Ahmedabad summers regularly cross 44°C.",
    src: "ACSM Position Stand: Exercise and Fluid Replacement, 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" },
  { stat: "2%", title: "Small loss, real drop",
    body: "Losing more than about 2% of body weight as water is linked to lower endurance and poorer focus.",
    src: "ACSM Position Stand: Exercise and Fluid Replacement, 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" },
  { stat: "Retain", title: "Salted drinks stay in longer than water",
    body: "In a controlled trial, an oral rehydration drink with electrolytes was retained noticeably better in the hours after drinking than the same amount of plain water.",
    src: "Maughan RJ et al. Am J Clin Nutr 2016;103:717–723", url: "https://pubmed.ncbi.nlm.nih.gov/26702122/" },
  { stat: "13%", title: "Too much plain water has a risk too",
    body: "Among Boston Marathon runners studied, 13% finished with low blood sodium — mostly from drinking lots of plain fluid over a long race.",
    src: "Almond CSD et al. N Engl J Med 2005;352:1550–1556", url: "https://pubmed.ncbi.nlm.nih.gov/15829535/" },
  { stat: "1,344", title: "Heat is a real risk in Ahmedabad",
    body: "The May 2010 heat wave caused an estimated 1,344 excess deaths in the city, which led to India's first Heat Action Plan.",
    src: "Azhar GS et al. PLoS ONE 2014;9(3):e91831", url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0091831" },
  { stat: "5.8%", title: "Heat costs working hours",
    body: "The ILO projects India could lose 5.8% of working hours in 2030 to heat stress — mostly outdoor and factory work.",
    src: "ILO, Working on a Warmer Planet, 2019", url: "https://www.ilo.org/resource/news/increase-heat-stress-predicted-bring-productivity-loss-equivalent-80" },
];

/* ---------- bottle prototype ---------- */
const BOTTLE = "M65,40 L95,40 L95,70 C95,86 140,98 140,130 L140,345 C140,362 128,372 112,372 L48,372 C32,372 20,362 20,345 L20,130 C20,98 65,86 65,70 Z";

function Bottle({ id, liquid, accent, flavour, sub }: { id: string; liquid: string; accent: string; flavour: string; sub: string }) {
  return (
    <svg viewBox="0 0 160 390" width="150" height="366" role="img" aria-label={`Taazu ${flavour} bottle`}>
      <defs>
        <clipPath id={"c" + id}><path d={BOTTLE} /></clipPath>
        <linearGradient id={"g" + id} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".28" stopColor="#fff" stopOpacity="0" /><stop offset=".85" stopColor="#000" stopOpacity=".1" /></linearGradient>
      </defs>
      <ellipse cx="80" cy="378" rx="62" ry="7" fill="#000" opacity=".1" />
      <path d={BOTTLE} fill={liquid} opacity=".9" />
      <g clipPath={`url(#c${id})`}>
        {/* wrap label */}
        <rect x="0" y="150" width="160" height="165" fill="#FFF8E7" />
        <rect x="0" y="150" width="160" height="7" fill="#EA580C" />
        <rect x="0" y="308" width="160" height="7" fill="#EA580C" />
        {/* Nimbu Drop + wordmark (same files as the Logos tab) */}
        <image href={dropIcon} x="22" y="163" width="44" height="44" />
        <circle cx="128" cy="176" r="8" fill={accent} stroke="#fff" strokeWidth="2" />
        <image href={wordLeaf} x="26" y="213" width="104" height="27" />
        <text x="28" y="252" fontSize="9" fontWeight="600" fill="#1F7A3A" opacity=".75">તાજું</text>
        <text x="28" y="272" fontSize="9" fontWeight="800" fill="#EA580C" letterSpacing=".5">{flavour.toUpperCase()}</text>
        <text x="28" y="285" fontSize="7" fill="#44403C">{sub}</text>
        <text x="28" y="300" fontSize="7" fill="#44403C">Electrolyte drink · 250 ml</text>
        <rect x="0" y="0" width="160" height="390" fill={`url(#g${id})`} />
      </g>
      <path d={BOTTLE} fill="none" stroke="#0003" strokeWidth="1.2" />
      <rect x="58" y="12" width="44" height="30" rx="5" fill="#EA580C" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={61 + i * 6} y="15" width="2" height="24" fill="#0002" />)}
      <rect x="56" y="40" width="48" height="5" rx="2" fill="#C2410C" />
    </svg>
  );
}

function Stick() {
  return (
    <svg viewBox="0 0 120 300" width="96" height="240" role="img" aria-label="Taazu stick sachet">
      <path d="M22,18 L98,18 L98,282 L22,282 Z" fill="#FFF8E7" stroke="#E7DCC0" />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${22 + i * 9.5},18 l4.75,-6 l4.75,6`} fill="#FFF8E7" stroke="#E7DCC0" />)}
      <rect x="22" y="36" width="76" height="8" fill="#EA580C" />
      <image href={wordLeaf} x="4" y="146" width="112" height="29" transform="rotate(-90 60 160)" />
      <image href={dropIcon} x="48" y="222" width="24" height="24" />
      <text x="60" y="256" textAnchor="middle" fontSize="7" fontWeight="800" fill="#EA580C">STICK · MAKES 500 ml</text>
      <rect x="22" y="266" width="76" height="8" fill="#EA580C" />
    </svg>
  );
}

function BackLabel() {
  const rows = [["Energy", "— kcal"], ["Carbohydrate", "— g"], ["  of which total sugars", "— g"], ["  of which added sugars", "— g"], ["Sodium", "— mg"], ["Potassium", "— mg"]];
  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-stone-300 bg-[#FFF8E7] p-4 text-stone-800 shadow-sm">
      <div className="flex items-baseline justify-between">
        <img src={wordLeaf} alt="taazu" className="h-5 w-auto" />
        <span className="text-[10px] font-bold uppercase text-[#EA580C]">Nimbu-Namak · 250 ml</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug">Non-carbonated water-based flavoured beverage with electrolytes.</p>
      <p className="mt-2 text-[10px] leading-snug"><b>Ingredients:</b> Water, lemon juice, sugar, salt, potassium citrate, cumin extract… <i>(final list from co-packer, in descending order)</i></p>
      <table className="mt-2 w-full border border-stone-800 text-[10px]">
        <thead><tr className="bg-stone-800 text-white"><th className="px-2 py-1 text-left">Nutrition per 100 ml</th><th className="px-2 py-1 text-right">Amount</th></tr></thead>
        <tbody>{rows.map(([k, v]) => <tr key={k} className="border-t border-stone-300"><td className="whitespace-pre px-2 py-0.5">{k}</td><td className="px-2 py-0.5 text-right">{v}</td></tr>)}</tbody>
      </table>
      <div className="mt-2 grid grid-cols-2 gap-x-3 text-[9px] leading-snug">
        <span>FSSAI Lic. (brand owner): —</span><span>FSSAI Lic. (mfr.): —</span>
        <span>Batch · MFD · Best before: —</span><span>MRP ₹__ (incl. all taxes)</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px]">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 border-2 border-green-700 p-[1px]"><span className="block h-full w-full rounded-full bg-green-700" /></span>Veg</span>
        <span>Consumer care: WhatsApp __ · Marketed by Taazu, Ahmedabad</span>
      </div>
      <p className="mt-2 text-[9px] text-stone-500">Values shown as "—" are filled only from the NABL lab report.</p>
    </div>
  );
}

function Overview({ go }: { go: (t: TabId) => void }) {
  const must = [
    "Brand + true name: \"Non-carbonated water-based flavoured beverage with electrolytes\"",
    "Ingredients in descending order; green veg logo",
    "Nutrition per 100 ml (energy, carbs, total & added sugar, sodium, potassium)",
    "FSSAI logo + brand owner's and manufacturer's licence numbers & addresses",
    "Net quantity, MRP (incl. taxes), batch, date of manufacture, best before",
    "Consumer-care contact; allergen & sweetener notes if applicable",
  ];
  const avoid = ["\"ORS\" anywhere on the pack", "\"Health drink\" or any cure / disease claim", "\"Low sugar\" unless the lab report supports it", "Medical words: treats, prevents, cures, doctor-recommended"];
  const tips = ["Use the co-packer's stock bottle and cap — only label + cap colour are ours", "Wrap-around label ~60–70 mm tall (confirm with printer)", "'taazu' readable from 2 metres on a gym counter", "One accent colour per flavour; same layout on the sachet", "QR code to WhatsApp for reorders", "Print one batch + 20% of labels for the pilot"];

  return (
    <div className="space-y-4">
      {/* identity */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 text-white shadow-lg md:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-16 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Lockup tone="cream" className="h-16 w-auto md:h-20" />
            <div className="mt-2 text-sm text-orange-100">{TAAZU.gujarati} · {TAAZU.meaning}</div>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl">{TAAZU.tagline.en}<br /><span className="text-orange-100">{TAAZU.tagline.hi}</span></h2>
            <p className="mt-3 max-w-xl text-sm text-orange-50">{TAAZU.promise}</p>
          </div>
          <div className="hidden md:block rounded-2xl bg-white/95 p-3"><Bottle id="hero" liquid="#F3F0B8" accent="#F5D83B" flavour="Nimbu-Namak" sub="Nimbu · Sendha namak" /></div>
        </div>
      </section>

      {/* brand kit shortcuts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {([
          ["logos", Shapes, "Logos", "4 concepts + seal · SVG, PNG 4096px"],
          ["creatives", Images, "Creatives", "9 posts & posters · edit, Max download"],
          ["slogans", MessageSquareQuote, "Slogans", "Hinglish, Gujarati, English"],
          ["prompts", Wand2, "AI prompts", "24 image & video prompts"],
        ] as const).map(([id, Icon, title, sub]) => (
          <button key={id} type="button" onClick={() => go(id)} className="group flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-300">
            <div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={18} /></div><ArrowRight size={16} className="text-stone-300 transition group-hover:text-orange-600" /></div>
            <div className="font-bold text-stone-900">{title}</div>
            <div className="text-xs text-stone-500">{sub}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Colours" icon={Palette}>
          <div className="grid grid-cols-5 gap-2">
            {PALETTE.map((c) => (
              <div key={c.hex} className="text-center">
                <div className="h-14 rounded-xl border border-black/5" style={{ background: c.hex }} />
                <div className="mt-1.5 text-[11px] font-semibold text-slate-800 leading-tight">{c.name}</div>
                <div className="text-[10px] text-slate-500">{c.hex}</div>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-600">{PALETTE.map((c) => <li key={c.hex}><b>{c.name}:</b> {c.use}</li>)}</ul>
        </Panel>
        <Panel title="Wordmark & type" icon={Type}>
          <div className="flex items-center gap-4 rounded-xl bg-[#FFF8E7] p-4">
            <Lockup className="h-16 w-auto" />
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
            <li>• Always lowercase <b>taazu</b> in the logo; "Taazu" in sentences.</li>
            <li>• Wordmark: Baloo Bhai 2 ExtraBold, already outlined in the logo files. Text: Plus Jakarta Sans. Hindi: Baloo 2.</li>
            <li>• Nimbu Drop sits left of the wordmark; keep one "a"-height of space around the logo. All versions are in the Logos tab.</li>
            <li>• Voice: warm, local, straight — Hinglish OK, no medical talk.</li>
          </ul>
        </Panel>
      </div>

      {/* product prototype */}
      <Panel title="Product prototype · 250 ml stock PET + stick" icon={Droplets}>
        <div className="rounded-xl bg-slate-50 p-4 md:p-6">
          <div className="flex items-end gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-2 md:justify-center md:overflow-visible">
            {[
              { id: "n", flavour: "Nimbu-Namak", sub: "Nimbu · Sendha namak", liquid: "#F3F0B8", accent: "#F5D83B", note: "Hero flavour — launch with this only" },
              { id: "j", flavour: "Jeera", sub: "Jeera · Nimbu · Namak", liquid: "#EADFC2", accent: "#B7791F", note: "Second flavour after the pilot" },
              { id: "k", flavour: "Kokum", sub: "Kokum · Namak", liquid: "#F1C6D3", accent: "#9D174D", note: "Summer special idea" },
            ].map((b) => (
              <div key={b.id} className="shrink-0 snap-center text-center">
                <Bottle id={b.id} liquid={b.liquid} accent={b.accent} flavour={b.flavour} sub={b.sub} />
                <div className="mt-2 text-sm font-semibold text-slate-900">{b.flavour}</div>
                <div className="text-xs text-slate-500">{b.note}</div>
              </div>
            ))}
            <div className="shrink-0 snap-center text-center">
              <Stick />
              <div className="mt-2 text-sm font-semibold text-slate-900">Stick sachet</div>
              <div className="text-xs text-slate-500">Same look for powder, later</div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400 md:hidden">Swipe sideways to see all.</p>
        <p className="mt-3 text-xs text-slate-500">Standard bottle shape: only the label and cap colour change, so there's no mould cost. Pilot = one flavour, one size.</p>
      </Panel>

      <Panel title="Back label prototype" icon={ListChecks}>
        <BackLabel />
      </Panel>

      {/* awareness */}
      <Panel title="Why electrolytes — facts people don't know (with sources)" icon={BookOpen}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-black text-orange-600">{f.stat}</div>
              <div className="mt-1 font-semibold leading-snug text-slate-900">{f.title}</div>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
              <a href={f.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-start gap-1 text-[11px] text-slate-500 hover:text-orange-700">
                <ExternalLink size={12} className="mt-0.5 shrink-0" />{f.src}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Use these for posts, pitch decks and counter standees. They describe hydration in general — never say Taazu treats or prevents anything, and never call it ORS.</p>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Label must include" icon={ListChecks}>
          <ul className="space-y-2">{must.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="mt-0.5 shrink-0 text-green-600" />{m}</li>)}</ul>
        </Panel>
        <Panel title="Never put on the label" icon={AlertCircle}>
          <ul className="space-y-2">{avoid.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><X size={16} className="mt-0.5 shrink-0 text-red-600" />{m}</li>)}</ul>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-slate-600">Before printing: search "Taazu" in class 32 on the IP India trademark portal and file your application (₹4,500 for a proprietor / MSME).</div>
        </Panel>
        <Panel title="Design rules" icon={Palette}>
          <ul className="space-y-2">{tips.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="mt-0.5 shrink-0 text-slate-400" />{m}</li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}
