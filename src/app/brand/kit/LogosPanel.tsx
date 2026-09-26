import { useMemo, useState } from "react";
import { Download, FileCode2, Share2, Sparkles } from "lucide-react";
import { Panel, btnGhost, btnPrimary } from "../../../components/ui";
import { BACKGROUNDS, CONCEPTS, LAYOUT_LABEL, STYLE_BG, STYLE_LABEL, buildLogo, logoFileName, type LogoOpts, type Style } from "./logos";
import { MAX_PIXELS, canShareFiles, saveBlob, shareBlob, svgToPng } from "./export";
import { CHECKER, CHECKER_DARK, Chips, Label, readStore, writeStore } from "./bits";

const KEY = "taazu.brandkit.logo.v1";
const DEFAULT: LogoOpts = { concept: "A", layout: "horizontal", style: "color", bg: "none", pad: 0.08, square: false };

const PRESETS: { l: string; hint: string; o: LogoOpts }[] = [
  { l: "WhatsApp / Instagram DP", hint: "Square, orange", o: { concept: "A", layout: "icon", style: "reverse", bg: "orange", pad: 0.2, square: true } },
  { l: "Bottle label", hint: "Stacked, transparent", o: { concept: "A", layout: "stacked", style: "color", bg: "none", pad: 0.04, square: false } },
  { l: "Banner / letterhead", hint: "Side, transparent", o: { concept: "A", layout: "horizontal", style: "color", bg: "none", pad: 0.04, square: false } },
  { l: "Dark photo par", hint: "White, one colour", o: { concept: "A", layout: "horizontal", style: "white", bg: "none", pad: 0.04, square: false } },
  { l: "App icon", hint: "t-wave, square", o: { concept: "C", layout: "icon", style: "color", bg: "none", pad: 0, square: true } },
  { l: "Cup sticker", hint: "Seal", o: { concept: "S", layout: "seal", style: "color", bg: "none", pad: 0.02, square: true } },
];

const svgUrl = (svg: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

export default function LogosPanel() {
  const [o, setO] = useState<LogoOpts>(() => readStore(KEY, DEFAULT));
  const [width, setWidth] = useState(4096);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const share = useMemo(canShareFiles, []);
  const concept = CONCEPTS.find((c) => c.id === o.concept) || CONCEPTS[0];

  const set = (p: Partial<LogoOpts>) => setO((cur) => {
    const next = { ...cur, ...p };
    const c = CONCEPTS.find((x) => x.id === next.concept)!;
    if (!c.layouts.includes(next.layout)) next.layout = c.layouts[c.layouts.length > 1 ? 1 : 0];
    writeStore(KEY, next);
    return next;
  });

  const logo = useMemo(() => { try { return buildLogo(o); } catch { return null; } }, [o]);
  // Keep the PNG under the canvas limit phones allow.
  const maxW = logo ? Math.floor(Math.sqrt(MAX_PIXELS * (logo.w / logo.h))) : 4096;
  const widths = [1024, 2048, 4096, 8192].filter((w) => w <= maxW);
  const outW = Math.min(width, maxW);
  const outH = logo ? Math.round((outW * logo.h) / logo.w) : 0;
  const name = logoFileName(o);

  const run = async (what: "png" | "svg" | "share") => {
    if (!logo) return;
    setErr(""); setBusy(what);
    try {
      if (what === "svg") saveBlob(new Blob([logo.svg], { type: "image/svg+xml" }), name + ".svg");
      else {
        const png = await svgToPng(logo.svg, outW);
        if (what === "share") { if (!(await shareBlob(png, name + ".png"))) saveBlob(png, `${name}-${outW}px.png`); }
        else saveBlob(png, `${name}-${outW}px.png`);
      }
    } catch (e: any) { setErr(e?.message || "Download failed. Try a smaller size."); }
    setBusy("");
  };

  return (
    <div className="space-y-4">
      <Panel title="Logo concepts" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CONCEPTS.map((c) => {
            const prev = buildLogo({ concept: c.id, layout: c.layouts[0], style: "color", bg: "cream", pad: 0.12, square: true });
            return (
              <button key={c.id} type="button" onClick={() => set({ concept: c.id })}
                className={`rounded-2xl border p-2 text-left transition ${o.concept === c.id ? "border-orange-500 ring-4 ring-orange-100" : "border-stone-200 hover:border-stone-300"}`}>
                <img src={svgUrl(prev.svg)} alt={`${c.name} logo`} className="aspect-square w-full rounded-xl" />
                <div className="mt-2 flex items-center justify-between gap-1 px-1">
                  <span className="text-sm font-bold text-stone-900">{c.id === "S" ? c.name : `${c.id} · ${c.name}`}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.id === "A" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>{c.tag}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-stone-600">{concept.idea}</p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Preview">
          <div className="grid min-h-[260px] place-items-center overflow-hidden rounded-2xl border border-stone-200 p-4" style={o.style === "reverse" || o.style === "white" ? CHECKER_DARK : CHECKER}>
            {logo && <img src={svgUrl(logo.svg)} alt="Logo preview" className="max-h-[360px] w-auto max-w-full" style={{ boxShadow: o.bg !== "none" ? "0 1px 3px rgba(0,0,0,.12)" : undefined }} />}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className={btnPrimary} disabled={!!busy} onClick={() => run("png")}><Download size={16} />{busy === "png" ? "Ban raha hai…" : `PNG ${outW}×${outH}`}</button>
            <button className={btnGhost} disabled={!!busy} onClick={() => run("svg")}><FileCode2 size={16} />SVG (print, vector)</button>
            {share && <button className={btnGhost} disabled={!!busy} onClick={() => run("share")}><Share2 size={16} />Share</button>}
          </div>
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
          <p className="mt-2 text-xs text-stone-500">SVG ki koi resolution limit nahi: printer, Canva ya Figma ko yahi do. PNG social media aur WhatsApp ke liye.</p>
        </Panel>

        <Panel title="Edit">
          <div className="space-y-4">
            <div>
              <Label>Quick presets</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.l} type="button" onClick={() => set(p.o)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-left transition hover:border-orange-300">
                    <div className="text-xs font-bold text-stone-800">{p.l}</div><div className="text-[11px] text-stone-500">{p.hint}</div>
                  </button>
                ))}
              </div>
            </div>
            {concept.layouts.length > 1 && (
              <div><Label>Naam</Label><Chips value={o.layout} options={concept.layouts.map((l) => ({ v: l, l: LAYOUT_LABEL[l] }))} onChange={(layout) => set({ layout })} /></div>
            )}
            <div>
              <Label>Colour style</Label>
              <Chips value={o.style} options={(Object.keys(STYLE_LABEL) as Style[]).map((s) => ({ v: s, l: STYLE_LABEL[s] }))}
                onChange={(style) => set({ style, bg: o.bg === STYLE_BG[o.style] ? STYLE_BG[style] : o.bg })} />
            </div>
            <div>
              <Label hint={o.style === "reverse" ? "Reverse orange/dark par" : o.style === "white" ? "White dark par" : undefined}>Background</Label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button key={b.id} type="button" title={b.label} aria-label={b.label} onClick={() => set({ bg: b.id })}
                    className={`h-9 w-9 rounded-full border-2 transition ${o.bg === b.id ? "border-orange-500 ring-4 ring-orange-100" : "border-stone-200"}`}
                    style={b.hex ? { background: b.hex } : CHECKER} />
                ))}
              </div>
            </div>
            <div>
              <Label hint={`${Math.round(o.pad * 100)}%`}>Khali jagah (padding)</Label>
              <input type="range" min={0} max={0.4} step={0.01} value={o.pad} onChange={(e) => set({ pad: Number(e.target.value) })} className="w-full accent-orange-600" />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input type="checkbox" checked={o.square} onChange={(e) => set({ square: e.target.checked })} className="h-4 w-4 accent-orange-600" />Square canvas (DP, app icon)
            </label>
            <div>
              <Label>PNG size</Label>
              <Chips value={String(outW)} options={[...new Set([...widths, maxW])].map((w) => ({ v: String(w), l: w === maxW && !widths.includes(w) ? `Max ${w}px` : `${w}px` }))} onChange={(v) => setWidth(Number(v))} />
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Logo rules">
        <ul className="grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
          <li>• Logo ke charon taraf kam se kam "a" letter ki height jitni khali jagah.</li>
          <li>• Print mein icon 12 mm se chhota nahi.</li>
          <li>• Stretch, shadow, outline ya naye colours nahi.</li>
          <li>• Photo par: reverse ya white one-colour version.</li>
          <li>• Final logo designer se clean karwao aur "Taazu" ka trademark class 32 mein file karo.</li>
          <li>• Primary logo A hai; seal sirf uske saath, uski jagah nahi.</li>
        </ul>
      </Panel>
    </div>
  );
}
