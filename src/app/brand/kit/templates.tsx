import type { CSSProperties, ReactNode } from "react";
import { Check, X } from "lucide-react";
import QRCode from "qrcode";
import { BRAND as C, logoSvg, type ConceptId, type Layout, type Style } from "./logos";
import { BODY, DISPLAY, HINDI } from "./fonts";

/*
 * Creative templates. Each one renders at its real pixel size (1080 wide for social, A4 at
 * 150 dpi for print) and the editor scales it down for the preview. Text fields support:
 *   *word*   → accent colour      **word** → bold      new line → line break
 *   {price}  → the price          {wa}     → the WhatsApp number
 * Hydration claims stay general and sourced; never "ORS" or a medical claim.
 */

export type Shared = { price: string; wa: string };
export type Values = Record<string, string>;
export type Field =
  | { key: string; label: string; kind: "text" | "area"; hint?: string }
  | { key: string; label: string; kind: "select"; options: { v: string; l: string }[] }
  | { key: string; label: string; kind: "range"; min: number; max: number; step: number; unit?: string }
  | { key: string; label: string; kind: "image" };

export type ThemeId = "cream" | "orange" | "nimbu" | "ink" | "leaf";
type Theme = { bg: string; fg: string; accent: string; tagBg: string; tagFg: string; logo: Style; soft: string };
export const THEMES: Record<ThemeId, Theme & { label: string }> = {
  cream: { label: "Cream", bg: C.cream, fg: C.ink, accent: C.orange, tagBg: C.orange, tagFg: C.cream, logo: "color", soft: "#E7DCC0" },
  orange: { label: "Orange", bg: C.orange, fg: C.cream, accent: C.nimbu, tagBg: C.cream, tagFg: C.orange, logo: "reverse", soft: "rgba(255,248,231,.25)" },
  nimbu: { label: "Nimbu", bg: C.nimbu, fg: C.ink, accent: C.leaf, tagBg: C.ink, tagFg: C.nimbu, logo: "color", soft: "rgba(28,25,23,.15)" },
  ink: { label: "Ink", bg: C.ink, fg: C.cream, accent: C.nimbu, tagBg: C.orange, tagFg: C.cream, logo: "reverse", soft: "rgba(255,248,231,.2)" },
  leaf: { label: "Leaf", bg: C.leaf, fg: C.cream, accent: C.nimbu, tagBg: C.nimbu, tagFg: C.ink, logo: "reverse", soft: "rgba(255,248,231,.25)" },
};
const themeField: Field = { key: "theme", label: "Background colour", kind: "select", options: (Object.keys(THEMES) as ThemeId[]).map((k) => ({ v: k, l: THEMES[k].label })) };
const sizeField: Field = { key: "size", label: "Headline size", kind: "range", min: 70, max: 130, step: 5, unit: "%" };

export type Tpl = {
  id: string; name: string; use: string; w: number; h: number; print?: boolean;
  fields: Field[]; defaults: Values;
  render: (v: Values, s: Shared) => ReactNode;
};

/* ---------- helpers ---------- */
const fill = (t: string, s: Shared) => (t || "").replace(/\{price\}/g, s.price || "₹__").replace(/\{wa\}/g, s.wa || "__________");

/** *accent*, **bold**, line breaks. Builds React elements, never raw HTML. */
export function Rich({ text, accent, s }: { text: string; accent: string; s: Shared }) {
  const lines = fill(text, s).split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts: ReactNode[] = [];
        const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let last = 0, m: RegExpExecArray | null, k = 0;
        while ((m = re.exec(line))) {
          if (m.index > last) parts.push(line.slice(last, m.index));
          parts.push(m[0].startsWith("**") ? <b key={k++} style={{ fontWeight: 800 }}>{m[0].slice(2, -2)}</b> : <span key={k++} style={{ color: accent }}>{m[0].slice(1, -1)}</span>);
          last = m.index + m[0].length;
        }
        if (last < line.length) parts.push(line.slice(last));
        return <span key={i}>{parts}{i < lines.length - 1 && <br />}</span>;
      })}
    </>
  );
}

function Logo({ concept = "A", layout = "horizontal", style, width }: { concept?: ConceptId; layout?: Layout; style: Style; width: number }) {
  const { svg } = logoSvg(concept, layout, style);
  return <div style={{ width, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ') }} />;
}

const DROP = "M256 44C236 92 112 200 112 316A144 144 0 0 0 400 316C400 200 276 92 256 44Z";
const Drop = ({ color, style }: { color: string; style?: CSSProperties }) => (
  <svg viewBox="100 30 312 440" style={style}><path d={DROP} fill={color} /></svg>
);

export const waLink = (wa: string) => {
  const d = (wa || "").replace(/\D/g, "");
  return "https://wa.me/" + (d.length === 10 ? "91" + d : d) + "?text=Hi%20Taazu";
};
function Qr({ text, size, dark = C.ink }: { text: string; size: number; dark?: string }) {
  let path = "", n = 21;
  try {
    const q = QRCode.create(text, { errorCorrectionLevel: "M" });
    n = q.modules.size;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.modules.get(r, c)) path += `M${c} ${r}h1v1h-1z`;
  } catch { /* empty number */ }
  return <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges" style={{ display: "block" }}><rect width={n} height={n} fill="#fff" /><path d={path} fill={dark} /></svg>;
}

const base = (w: number, h: number, bg: string, fg: string, extra: CSSProperties = {}): CSSProperties => ({
  width: w, height: h, background: bg, color: fg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
  fontFamily: BODY, boxSizing: "border-box", ...extra,
});
const tagStyle = (bg: string, fg: string, font = BODY): CSSProperties => ({ alignSelf: "flex-start", fontFamily: font, fontWeight: 800, fontSize: 24, letterSpacing: font === BODY ? ".14em" : ".04em", textTransform: "uppercase", padding: "12px 22px", borderRadius: 999, background: bg, color: fg, lineHeight: 1.1 });
const disp = (size: number, extra: CSSProperties = {}): CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.98, letterSpacing: "-.02em", margin: 0, ...extra });
const bodyText = (size = 40, extra: CSSProperties = {}): CSSProperties => ({ fontSize: size, lineHeight: 1.4, fontWeight: 500, margin: 0, ...extra });
const hs = (v: Values) => (Number(v.size) || 100) / 100;

function Foot({ t, s, source, logoWidth = 330 }: { t: Theme; s: Shared; source: string; logoWidth?: number }) {
  return (
    <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
      <Logo style={t.logo} width={logoWidth} />
      {source && <div style={{ fontSize: 19, lineHeight: 1.35, opacity: 0.7, maxWidth: 520, textAlign: "right", whiteSpace: "pre-line" }}>{fill(source, s)}</div>}
    </div>
  );
}

/* ---------- templates ---------- */
export const TEMPLATES: Tpl[] = [
  {
    id: "paseena", name: "Paseena sirf paani nahi", use: "Instagram post 4:5", w: 1080, h: 1350,
    fields: [themeField, { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area", hint: "*word* = accent colour" }, sizeField,
      { key: "stat", label: "Boond ke andar number", kind: "text" }, { key: "statLabel", label: "Number ke neeche", kind: "text" },
      { key: "body", label: "Body text", kind: "area", hint: "**bold**, *accent*" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { theme: "cream", size: "100", tag: "Jo log nahi jaante · 1", headline: "Paseena sirf *paani* nahi hota.", stat: "~1 g", statLabel: "SODIUM",
      body: "Har **1 litre** paseene ke saath lagbhag **1 gram sodium** bhi body se nikal jaata hai.\n\nSirf paani, paani wapas deta hai. *Namak nahi.*",
      source: "Average for athletes; varies person to person.\nSource: Baker LB, Sports Medicine 2017;47:111–128" },
    render: (v, s) => { const t = THEMES[v.theme as ThemeId] || THEMES.cream; const dropC = t.bg === C.orange ? C.cream : C.orange; const inC = t.bg === C.orange ? C.orange : C.cream; return (
      <div style={base(1080, 1350, t.bg, t.fg, { padding: "84px 84px 64px" })}>
        <div style={tagStyle(t.tagBg, t.tagFg)}>{fill(v.tag, s)}</div>
        <h1 style={disp(118 * hs(v), { marginTop: 44, maxWidth: 900 })}><Rich text={v.headline} accent={t.accent} s={s} /></h1>
        <div style={{ display: "flex", alignItems: "center", gap: 48, marginTop: 40 }}>
          <div style={{ position: "relative", width: 330, height: 465, flex: "none" }}>
            <Drop color={dropC} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 215, textAlign: "center", color: inC }}>
              <div style={disp(120)}>{fill(v.stat, s)}</div>
              <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: ".08em", marginTop: 6 }}>{fill(v.statLabel, s)}</div>
            </div>
          </div>
          <p style={bodyText(44)}><Rich text={v.body} accent={t.accent} s={s} /></p>
        </div>
        <Foot t={t} s={s} source={v.source} />
      </div>); },
  },
  {
    id: "two-percent", name: "Sirf 2% kam", use: "Instagram post 4:5", w: 1080, h: 1350,
    fields: [themeField, { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area" }, sizeField,
      { key: "level", label: "Battery level (%)", kind: "range", min: 5, max: 100, step: 1, unit: "%" }, { key: "meter", label: "Battery ke neeche", kind: "text" },
      { key: "body", label: "Body text", kind: "area" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { theme: "orange", size: "100", tag: "Jo log nahi jaante · 2", headline: "Sirf 2% kam.", level: "98", meter: "BODY WATER LEVEL",
      body: "Body ka ~2% paani kam hote hi **stamina, focus aur reaction time** girne lagte hain. Aur pata bhi nahi chalta.",
      source: "Loss above ~2% of body weight as water.\nSource: ACSM Position Stand, Exercise & Fluid Replacement, 2007" },
    render: (v, s) => { const t = THEMES[v.theme as ThemeId] || THEMES.orange; const lvl = Math.max(5, Math.min(100, Number(v.level) || 98)); const barC = t.bg === C.nimbu ? C.leaf : C.nimbu; return (
      <div style={base(1080, 1350, t.bg, t.fg, { padding: "84px 84px 64px" })}>
        <div style={tagStyle(t.tagBg, t.tagFg)}>{fill(v.tag, s)}</div>
        <h1 style={disp(150 * hs(v), { marginTop: 44 })}><Rich text={v.headline} accent={t.accent} s={s} /></h1>
        <div style={{ marginTop: 54, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 760, height: 250, border: `16px solid ${t.fg}`, borderRadius: 48, padding: 20, display: "flex", boxSizing: "border-box" }}>
            <div style={{ width: `${lvl}%`, background: barC, borderRadius: 24, display: "flex", alignItems: "center", paddingLeft: 40, boxSizing: "border-box" }}><span style={disp(120, { color: C.ink })}>{lvl}%</span></div>
          </div>
          <div style={{ width: 34, height: 110, background: t.fg, borderRadius: "0 18px 18px 0" }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: ".1em", marginTop: 22, opacity: 0.85 }}>{fill(v.meter, s)}</div>
        <p style={bodyText(42, { marginTop: 44, maxWidth: 860 })}><Rich text={v.body} accent={t.accent} s={s} /></p>
        <Foot t={t} s={s} source={v.source} />
      </div>); },
  },
  {
    id: "pyaas", name: "Pyaas late lagti hai", use: "Instagram post 4:5", w: 1080, h: 1350,
    fields: [themeField, { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area" }, sizeField, { key: "body", label: "Body text", kind: "area" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { theme: "nimbu", size: "100", tag: "Jo log nahi jaante · 3", headline: "Pyaas lagi?\n*Thoda late ho gaye.*",
      body: "Garmi mein jab tak pyaas lagti hai, body mein paani pehle hi kam ho chuka hota hai.\n\n**Pyaas se pehle piyo.** Thoda-thoda, din bhar.",
      source: "Thirst alone may not keep up during heavy sweating.\nSource: ACSM Position Stand, Exercise & Fluid Replacement, 2007" },
    render: (v, s) => { const t = THEMES[v.theme as ThemeId] || THEMES.nimbu; return (
      <div style={base(1080, 1350, t.bg, t.fg, { padding: "84px 84px 64px" })}>
        <div style={tagStyle(t.tagBg, t.tagFg)}>{fill(v.tag, s)}</div>
        <h1 style={disp(112 * hs(v), { marginTop: 44 })}><Rich text={v.headline} accent={t.accent} s={s} /></h1>
        <div style={{ display: "flex", gap: 44, alignItems: "center", marginTop: 56 }}>
          <svg viewBox="0 0 300 300" width={300} style={{ flex: "none" }}>
            <circle cx="150" cy="150" r="136" fill={C.cream} stroke={C.ink} strokeWidth="14" />
            {[...Array(12)].map((_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={150 + Math.cos(a) * 108} y1={150 + Math.sin(a) * 108} x2={150 + Math.cos(a) * 122} y2={150 + Math.sin(a) * 122} stroke={C.ink} strokeWidth="8" strokeLinecap="round" />; })}
            <line x1="150" y1="150" x2="150" y2="62" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
            <line x1="150" y1="150" x2="214" y2="190" stroke={C.orange} strokeWidth="14" strokeLinecap="round" />
            <circle cx="150" cy="150" r="14" fill={C.ink} />
          </svg>
          <p style={bodyText(42)}><Rich text={v.body} accent={t.accent} s={s} /></p>
        </div>
        <Foot t={t} s={s} source={v.source} />
      </div>); },
  },
  {
    id: "heat-gujarati", name: "44°C · Gujarati", use: "Instagram post 4:5", w: 1080, h: 1350,
    fields: [{ key: "tag", label: "Tag", kind: "text" }, { key: "temp", label: "Temperature", kind: "text" }, { key: "line1", label: "Line 1 (Gujarati)", kind: "text" },
      { key: "line2", label: "Line 2 (Gujarati, yellow)", kind: "text" }, { key: "line3", label: "Chhoti line", kind: "text" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { tag: "Amdavad · Unalo", temp: "44°C", line1: "આ અમદાવાદ છે.", line2: "ગરમીમાં પણ તાજું.", line3: "Garmi ma pan taazu · Nimbu, namak ane thandak.", source: "Summer highs in Ahmedabad regularly cross 44°C.\nSource: IMD records; AMC Heat Action Plan" },
    render: (v, s) => (
      <div style={base(1080, 1350, C.orange, C.cream, { padding: "84px 84px 64px", background: `radial-gradient(circle at 78% 18%, ${C.nimbu} 0 150px, #FDBA3B 150px 230px, ${C.orange} 230px 560px, ${C.deep} 900px)` })}>
        <div style={tagStyle(C.ink, C.cream)}>{fill(v.tag, s)}</div>
        <div style={disp(330, { marginTop: 150, letterSpacing: "-.04em" })}>{fill(v.temp, s)}</div>
        <h1 style={disp(112, { marginTop: 10 })}>{fill(v.line1, s)}</h1>
        <p style={disp(78, { marginTop: 40, color: C.nimbu })}>{fill(v.line2, s)}</p>
        <p style={bodyText(34, { marginTop: 14, opacity: 0.9 })}>{fill(v.line3, s)}</p>
        <Foot t={{ ...THEMES.orange, logo: "reverse" }} s={s} source={v.source} />
      </div>),
  },
  {
    id: "story-compare", name: "Story: Paani vs Taazu", use: "Instagram / WhatsApp story 9:16", w: 1080, h: 1920,
    fields: [themeField, { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area" }, sizeField,
      { key: "leftTitle", label: "Left card title", kind: "text" }, { key: "left", label: "Left list", kind: "area", hint: "+ = tick, - = cross, har line ek item" },
      { key: "rightTitle", label: "Right card title", kind: "text" }, { key: "right", label: "Right list", kind: "area", hint: "+ = tick, - = cross" },
      { key: "body", label: "Body text", kind: "area" }, { key: "cta", label: "Button text", kind: "text", hint: "{wa} = WhatsApp number" }],
    defaults: { theme: "cream", size: "100", tag: "Garmi ke din", headline: "Paseene ke baad, kya piyo?", leftTitle: "Sirf paani", left: "+Paani\n-Namak\n-Potassium\n-Taste",
      rightTitle: "Taazu", right: "+Paani\n+Namak\n+Potassium\n+Nimbu taste", body: "Paani zaroori hai. Bas paseene ke saath jo **namak** gaya, woh bhi wapas chahiye.", cta: "Free sample? WhatsApp: {wa}" },
    render: (v, s) => { const t = THEMES[v.theme as ThemeId] || THEMES.cream; const light = t.bg === C.cream || t.bg === C.nimbu;
      const list = (txt: string, on: boolean) => (txt || "").split("\n").filter((x) => x.trim()).map((line, i) => { const ok = !line.trim().startsWith("-"); const label = line.trim().replace(/^[+-]\s*/, ""); return (
        <li key={i} style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 40, fontWeight: 700, padding: "14px 0" }}>
          <span style={{ flex: "none", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: ok ? (on ? C.cream : C.leaf) : "#E7DCC0", color: ok ? (on ? C.orange : C.cream) : "#8A7F66" }}>{ok ? <Check size={34} strokeWidth={3.5} /> : <X size={32} strokeWidth={3.5} />}</span>{fill(label, s)}
        </li>); });
      return (
      <div style={base(1080, 1920, t.bg, t.fg, { padding: "150px 84px 120px" })}>
        <div style={tagStyle(t.tagBg, t.tagFg)}>{fill(v.tag, s)}</div>
        <h1 style={disp(132 * hs(v), { marginTop: 40 })}><Rich text={v.headline} accent={t.accent} s={s} /></h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 70 }}>
          <div style={{ background: light ? "#fff" : "rgba(255,255,255,.08)", borderRadius: 40, padding: "44px 36px", border: `4px solid ${light ? "#E7DCC0" : t.soft}` }}>
            <div style={disp(64)}>{fill(v.leftTitle, s)}</div><ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0 }}>{list(v.left, false)}</ul>
          </div>
          <div style={{ background: C.orange, color: C.cream, borderRadius: 40, padding: "44px 36px", border: t.bg === C.orange ? `4px solid ${C.cream}` : "none" }}>
            <div style={disp(64)}>{fill(v.rightTitle, s)}</div><ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0 }}>{list(v.right, true)}</ul>
          </div>
        </div>
        <p style={bodyText(44, { marginTop: 64 })}><Rich text={v.body} accent={t.accent} s={s} /></p>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          {v.cta && <div style={{ background: t.bg === C.leaf ? C.nimbu : C.leaf, color: t.bg === C.leaf ? C.ink : C.cream, borderRadius: 999, padding: "28px 56px", fontSize: 40, fontWeight: 800 }}>{fill(v.cta, s)}</div>}
          <Logo style={t.logo} width={420} />
        </div>
      </div>); },
  },
  {
    id: "poster-a4", name: "A4 poster · gym aur turf", use: "Print A4 (counter standee)", w: 1240, h: 1754, print: true,
    fields: [{ key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area" }, sizeField, { key: "body", label: "Body text", kind: "area" },
      { key: "tagline", label: "Tagline", kind: "text" }, { key: "sub", label: "Tagline ke neeche", kind: "text" }, { key: "priceLabel", label: "Price box label", kind: "text" },
      { key: "qr", label: "QR code", kind: "select", options: [{ v: "wa", l: "WhatsApp order" }, { v: "none", l: "No QR" }] }, { key: "qrLabel", label: "QR ke neeche", kind: "text" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { size: "100", tag: "Gym · Box cricket · Running", headline: "Match ke baad sirf paani?", body: "Garmi mein 1 ghante khelne se **aadha se 2 litre** tak paseena ja sakta hai. Saath mein namak bhi.",
      tagline: "Paani se aage.", sub: "Nimbu-namak taste · chilled · 250 ml", priceLabel: "CHILLED 250 ML", qr: "wa", qrLabel: "Scan · WhatsApp order",
      source: "Sweat rates 0.5–2 L per hour in hot conditions. Source: ACSM Position Stand, Exercise & Fluid Replacement, 2007" },
    render: (v, s) => (
      <div style={base(1240, 1754, C.cream, C.ink)}>
        <div style={{ background: C.orange, color: C.cream, padding: "110px 100px 0", height: 1060, position: "relative", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <div style={{ ...tagStyle(C.cream, C.orange), fontSize: 28 }}>{fill(v.tag, s)}</div>
          <h1 style={disp(150 * hs(v), { marginTop: 50, maxWidth: 720 })}><Rich text={v.headline} accent={C.nimbu} s={s} /></h1>
          <p style={bodyText(40, { marginTop: 36, maxWidth: 640 })}><Rich text={v.body} accent={C.nimbu} s={s} /></p>
          <div style={{ position: "absolute", right: 90, bottom: -230, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.25))" }}><Bottle width={400} /></div>
        </div>
        <div style={{ padding: "90px 100px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={disp(96, { color: C.leaf })}>{fill(v.tagline, s)}</div>
          <p style={bodyText(36, { marginTop: 14, maxWidth: 640 })}>{fill(v.sub, s)}</p>
          <div style={{ display: "flex", gap: 40, alignItems: "center", marginTop: "auto" }}>
            <div style={{ background: C.ink, color: C.cream, borderRadius: 32, padding: "30px 44px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: ".1em" }}>{fill(v.priceLabel, s)}</div>
              <div style={disp(120, { color: C.nimbu })}>{s.price || "₹__"}</div>
            </div>
            {v.qr !== "none" && (
              <div style={{ width: 270, background: "#fff", border: `4px solid ${C.ink}`, borderRadius: 24, padding: 18, textAlign: "center", boxSizing: "border-box" }}>
                <Qr text={waLink(s.wa)} size={226} />
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 10 }}>{fill(v.qrLabel, s)}</div>
                <div style={{ fontWeight: 700, fontSize: 20, opacity: 0.75 }}>{s.wa}</div>
              </div>
            )}
            <div style={{ marginLeft: "auto" }}><Logo layout="stacked" style="color" width={250} /></div>
          </div>
          <div style={{ fontSize: 19, opacity: 0.7, marginTop: 30 }}>{fill(v.source, s)}</div>
        </div>
      </div>),
  },
  {
    id: "navratri", name: "Navratri · Garba station", use: "Instagram post 4:5 / print", w: 1080, h: 1350,
    fields: [{ key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area", hint: "*word* = yellow" }, sizeField, { key: "body", label: "Body text", kind: "area" },
      { key: "station", label: "Station text", kind: "text" }, { key: "priceText", label: "Price text", kind: "text", hint: "{price} = price" }],
    defaults: { size: "100", tag: "Navratri special", headline: "Garba ki raat\n*lambi hai.*", body: "3 ghante garba = bahut paseena. Round ke beech mein ek chilled Taazu.", station: "Taazu station yahan", priceText: "250 ml {price}" },
    render: (v, s) => (
      <div style={base(1080, 1350, C.ink, C.cream, { padding: "84px 84px 64px" })}>
        <svg viewBox="0 0 1080 1350" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.9 }}>
          {[...Array(26)].map((_, i) => { const a = (i * Math.PI * 2) / 26; return <circle key={"o" + i} cx={540 + Math.cos(a) * 470} cy={520 + Math.sin(a) * 470} r="14" fill={i % 2 ? C.nimbu : C.orange} />; })}
          {[...Array(18)].map((_, i) => { const a = (i * Math.PI * 2) / 18 + 0.17; return <circle key={"i" + i} cx={540 + Math.cos(a) * 400} cy={520 + Math.sin(a) * 400} r="8" fill={C.cream} opacity=".7" />; })}
        </svg>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1 }}>
          <div style={{ ...tagStyle(C.orange, C.cream), alignSelf: "center" }}>{fill(v.tag, s)}</div>
          <h1 style={disp(124 * hs(v), { marginTop: 190 })}><Rich text={v.headline} accent={C.nimbu} s={s} /></h1>
          <p style={bodyText(42, { marginTop: 36, maxWidth: 700 })}><Rich text={v.body} accent={C.nimbu} s={s} /></p>
          <div style={{ marginTop: "auto", marginBottom: 40, background: C.cream, color: C.ink, borderRadius: 36, padding: "28px 50px", display: "flex", alignItems: "center", gap: 30 }}>
            <span style={{ fontWeight: 800, fontSize: 34 }}>{fill(v.station, s)}</span><span style={disp(64, { color: C.orange })}>{fill(v.priceText, s)}</span>
          </div>
          <Logo style="reverse" width={330} />
        </div>
      </div>),
  },
  {
    id: "hindi-workers", name: "धूप में काम? (Hindi)", use: "Post 4:5 · canteen print", w: 1080, h: 1350,
    fields: [themeField, { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "text" }, sizeField, { key: "line2", label: "Line 2", kind: "text" },
      { key: "body", label: "Body text", kind: "area" }, { key: "tagline", label: "Tagline", kind: "text" }, { key: "contact", label: "Contact line", kind: "text", hint: "{wa} = WhatsApp number" }, { key: "source", label: "Source line", kind: "area" }],
    defaults: { theme: "nimbu", size: "100", tag: "साइट · फैक्ट्री · डिलीवरी", headline: "धूप में काम?", line2: "पसीने के साथ नमक भी जाता है।", body: "पानी पियो, और नमक भी वापस लो।\nछाँव में थोड़ा आराम करो।",
      tagline: "Taazu — पानी से आगे।", contact: "सैंपल के लिए WhatsApp: {wa}", source: "Sweat carries sodium: Baker LB, Sports Med 2017.\nHeat & work: ILO, Working on a Warmer Planet, 2019" },
    render: (v, s) => { const t = THEMES[v.theme as ThemeId] || THEMES.nimbu; const warm = t.bg === C.orange ? C.nimbu : t.bg === C.nimbu || t.bg === C.cream ? C.deep : C.nimbu; return (
      <div style={base(1080, 1350, t.bg, t.fg, { padding: "84px 84px 64px" })}>
        <div style={{ ...tagStyle(t.tagBg, t.tagFg, HINDI), fontSize: 30 }}>{fill(v.tag, s)}</div>
        <h1 style={{ fontFamily: HINDI, fontWeight: 800, fontSize: 136 * hs(v), lineHeight: 1.15, marginTop: 40, marginBottom: 0 }}>{fill(v.headline, s)}</h1>
        <p style={{ fontFamily: HINDI, fontWeight: 800, fontSize: 72, lineHeight: 1.15, marginTop: 20, color: warm }}>{fill(v.line2, s)}</p>
        <div style={{ display: "flex", gap: 40, alignItems: "center", marginTop: 50 }}>
          <Drop color={t.bg === C.orange ? C.cream : C.orange} style={{ flex: "none", width: 220 }} />
          <p style={{ fontFamily: HINDI, fontWeight: 500, fontSize: 46, lineHeight: 1.4, margin: 0, whiteSpace: "pre-line" }}>{fill(v.body, s)}</p>
        </div>
        <p style={{ fontFamily: HINDI, fontWeight: 800, fontSize: 64, lineHeight: 1.15, marginTop: 40, color: t.accent }}>{fill(v.tagline, s)}</p>
        {v.contact && <p style={{ fontFamily: HINDI, fontWeight: 800, fontSize: 38, marginTop: 10 }}>{fill(v.contact, s)}</p>}
        <Foot t={t} s={s} source={v.source} />
      </div>); },
  },
];

/* Custom post: any size, optional photo (e.g. one made with the AI prompts). */
const FORMATS: Record<string, { w: number; h: number; l: string }> = {
  post: { w: 1080, h: 1350, l: "Post 4:5 (1080×1350)" }, square: { w: 1080, h: 1080, l: "Square 1:1 (1080×1080)" },
  story: { w: 1080, h: 1920, l: "Story 9:16 (1080×1920)" }, a4: { w: 1240, h: 1754, l: "A4 print" },
};
export const customTemplate = (format: string): Tpl => {
  const f = FORMATS[format] || FORMATS.post;
  return {
    id: "custom", name: "Apna post", use: "Apni photo + apna text", w: f.w, h: f.h, print: format === "a4",
    fields: [{ key: "format", label: "Size", kind: "select", options: Object.entries(FORMATS).map(([v, x]) => ({ v, l: x.l })) }, themeField,
      { key: "photo", label: "Photo (optional)", kind: "image" },
      { key: "photoPart", label: "Photo kitni jagah le", kind: "range", min: 30, max: 100, step: 5, unit: "%" },
      { key: "tag", label: "Tag", kind: "text" }, { key: "headline", label: "Headline", kind: "area", hint: "*word* = accent colour" }, sizeField,
      { key: "body", label: "Body text", kind: "area" }, { key: "cta", label: "Button text (optional)", kind: "text", hint: "{price}, {wa}" }, { key: "source", label: "Source line (optional)", kind: "area" }],
    defaults: { format: "post", theme: "orange", photoPart: "60", size: "100", tag: "Taazu", headline: "Paani se *aage.*", body: "Nimbu-namak electrolyte drink · chilled 250 ml · **{price}**", cta: "WhatsApp: {wa}", source: "" },
    render: (v, s) => {
      const t = THEMES[v.theme as ThemeId] || THEMES.orange;
      const photo = v.photo;
      const part = photo ? Math.max(30, Math.min(100, Number(v.photoPart) || 60)) : 0;
      const pad = Math.round(f.w * 0.078);
      const full = part >= 100;
      return (
        <div style={base(f.w, f.h, t.bg, full ? C.cream : t.fg)}>
          {photo && <img src={photo} alt="" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: full ? "100%" : `${part}%`, objectFit: "cover" }} />}
          {photo && full && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,25,23,.55) 0%, rgba(28,25,23,0) 30%, rgba(28,25,23,.1) 45%, rgba(28,25,23,.85) 100%)" }} />}
          {photo && !full && <div style={{ position: "absolute", left: 0, right: 0, top: `calc(${part}% - 160px)`, height: 160, background: `linear-gradient(180deg, transparent, ${t.bg})` }} />}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, padding: `${pad}px ${pad}px ${Math.round(pad * 0.76)}px` }}>
            <div style={tagStyle(full ? C.orange : t.tagBg, full ? C.cream : t.tagFg)}>{fill(v.tag, s)}</div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
              <h1 style={disp(120 * hs(v))}><Rich text={v.headline} accent={full ? C.nimbu : t.accent} s={s} /></h1>
              {v.body && <p style={bodyText(40, { marginTop: 28, maxWidth: f.w - pad * 2 - 40 })}><Rich text={v.body} accent={full ? C.nimbu : t.accent} s={s} /></p>}
              {v.cta && <div style={{ alignSelf: "flex-start", marginTop: 36, background: full || t.bg !== C.leaf ? C.leaf : C.nimbu, color: full || t.bg !== C.leaf ? C.cream : C.ink, borderRadius: 999, padding: "22px 44px", fontSize: 36, fontWeight: 800 }}>{fill(v.cta, s)}</div>}
            </div>
            <div style={{ marginTop: 48 }}><Foot t={full ? { ...t, logo: "reverse" } : t} s={s} source={v.source} logoWidth={300} /></div>
          </div>
        </div>
      );
    },
  };
};

/* The 250 ml bottle from the product prototype, used on the A4 poster. */
const BOTTLE = "M65,40 L95,40 L95,70 C95,86 140,98 140,130 L140,345 C140,362 128,372 112,372 L48,372 C32,372 20,362 20,345 L20,130 C20,98 65,86 65,70 Z";
function Bottle({ width }: { width: number }) {
  const icon = logoSvg("A", "icon", "color").svg.replace(/^<svg[^>]*>|<\/svg>$/g, "");
  return (
    <svg viewBox="0 0 160 390" width={width} style={{ display: "block" }}>
      <defs>
        <clipPath id="tz-bottle-clip"><path d={BOTTLE} /></clipPath>
        <linearGradient id="tz-bottle-shine" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".28" stopColor="#fff" stopOpacity="0" /><stop offset=".85" stopColor="#000" stopOpacity=".12" /></linearGradient>
      </defs>
      <ellipse cx="80" cy="378" rx="62" ry="7" fill="#000" opacity=".15" />
      <path d={BOTTLE} fill="#F3F0B8" />
      <g clipPath="url(#tz-bottle-clip)">
        <rect x="0" y="150" width="160" height="165" fill={C.cream} /><rect x="0" y="150" width="160" height="7" fill={C.orange} /><rect x="0" y="308" width="160" height="7" fill={C.orange} />
        <g transform="translate(96 164) scale(0.1)" dangerouslySetInnerHTML={{ __html: icon }} />
        <text x="26" y="246" fontSize="36" fontWeight="800" fill={C.leaf} fontFamily={DISPLAY} letterSpacing="-1">taazu</text>
        <text x="28" y="264" fontSize="11" fontWeight="500" fill={C.leaf} fontFamily={DISPLAY} opacity=".8">તાજું</text>
        <text x="28" y="282" fontSize="9" fontWeight="800" fill={C.orange} fontFamily={BODY} letterSpacing=".5">NIMBU-NAMAK</text>
        <text x="28" y="297" fontSize="7" fill="#44403C" fontFamily={BODY}>Electrolyte drink · 250 ml</text>
        <rect width="160" height="390" fill="url(#tz-bottle-shine)" />
      </g>
      <path d={BOTTLE} fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
      <rect x="58" y="12" width="44" height="30" rx="5" fill={C.orange} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={61 + i * 6} y="15" width="2" height="24" fill="rgba(0,0,0,.13)" />)}
      <rect x="56" y="40" width="48" height="5" rx="2" fill={C.deep} />
    </svg>
  );
}
