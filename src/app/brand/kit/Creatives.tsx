import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Download, ImagePlus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { Panel, btnGhost, btnPrimary, inputCls } from "../../../components/ui";
import { TEMPLATES, customTemplate, type Shared, type Tpl, type Values } from "./templates";
import { loadFonts } from "./fonts";
import { canShareFiles, maxScale, nodeToPng, saveBlob, shareBlob, slug } from "./export";
import { Chips, Label, readStore, writeStore } from "./bits";

const KEY = "taazu.brandkit.creatives.v1";
type Saved = { shared: Shared; values: Record<string, Values>; active: string };
const DEFAULT: Saved = { shared: { price: "₹25", wa: "91737 36652" }, values: {}, active: TEMPLATES[0].id };

const tplFor = (id: string, v: Values) => (id === "custom" ? customTemplate(v.format || "post") : TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]);

/** Renders a template at its real size, scaled to fit the given width. */
function Scaled({ tpl, v, s, width, nodeRef }: { tpl: Tpl; v: Values; s: Shared; width: number; nodeRef?: React.Ref<HTMLDivElement> }) {
  const k = width / tpl.w;
  return (
    <div style={{ width, height: tpl.h * k, overflow: "hidden", borderRadius: 12 }}>
      <div ref={nodeRef} style={{ width: tpl.w, height: tpl.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>{tpl.render(v, s)}</div>
    </div>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Shrinks big phone photos so the page and the export stay light. */
async function readPhoto(file: File, max = 2600): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.92);
}

export default function Creatives() {
  const [saved, setSaved] = useState<Saved>(() => { const r = readStore(KEY, DEFAULT); return { ...DEFAULT, ...r, shared: { ...DEFAULT.shared, ...r.shared } }; });
  const [photo, setPhoto] = useState(""); // kept in memory only: photos are too big for browser storage
  const [, setFontsReady] = useState(false);
  const [scaleKey, setScaleKey] = useState("max");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const share = useMemo(canShareFiles, []);
  const exportRef = useRef<HTMLDivElement>(null);
  const [previewBox, previewW] = useWidth<HTMLDivElement>();
  const [galleryBox, galleryW] = useWidth<HTMLDivElement>();

  useEffect(() => { loadFonts().then(() => setFontsReady(true)); }, []);
  useEffect(() => { writeStore(KEY, saved); }, [saved]);

  const all = useMemo(() => [...TEMPLATES, customTemplate("post")], []);
  const active = saved.active;
  const stored = saved.values[active] || {};
  const tpl0 = tplFor(active, stored);
  const v: Values = { ...tpl0.defaults, ...stored, ...(active === "custom" ? { photo } : {}) };
  const tpl = tplFor(active, v);
  const s = saved.shared;

  const setField = (key: string, val: string) => {
    if (key === "photo") { setPhoto(val); return; }
    setSaved((cur) => ({ ...cur, values: { ...cur.values, [active]: { ...(cur.values[active] || {}), [key]: val } } }));
  };
  const reset = () => { setSaved((cur) => { const values = { ...cur.values }; delete values[active]; return { ...cur, values }; }); if (active === "custom") setPhoto(""); };

  const top = maxScale(tpl.w, tpl.h, 4);
  const scales = [
    { v: "1", k: 1, l: tpl.print ? "Draft" : "Standard" },
    { v: "2", k: Math.min(2, top), l: tpl.print ? "Print 300 dpi" : "HD" },
    { v: "max", k: top, l: "Max" },
  ];
  const sc = scales.find((x) => x.v === scaleKey) || scales[2];
  const outW = Math.round(tpl.w * sc.k), outH = Math.round(tpl.h * sc.k);
  const dpi = tpl.print ? Math.round((outW / 210) * 25.4) : 0;
  const fileName = `taazu-${slug(tpl.name)}-${outW}x${outH}.png`;

  const run = async (what: "png" | "share") => {
    if (!exportRef.current) return;
    setErr(""); setBusy(what);
    try {
      const blob = await nodeToPng(exportRef.current, tpl.w, tpl.h, sc.k);
      if (what === "share") { if (!(await shareBlob(blob, fileName))) saveBlob(blob, fileName); }
      else saveBlob(blob, fileName);
    } catch (e: any) { setErr(e?.message || "Download failed. Try HD instead of Max."); }
    setBusy("");
  };

  const cols = galleryW >= 700 ? 5 : 3;
  const thumbWide = galleryW ? Math.floor((galleryW - 12 * (cols - 1)) / cols) : 0;
  const previewWidth = Math.min(previewW, tpl.h > tpl.w * 1.5 ? 360 : 460);

  return (
    <div className="space-y-4">
      <Panel title="Price aur WhatsApp · har creative mein">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label hint="{price}">Price</Label><input className={inputCls} value={s.price} onChange={(e) => setSaved((c) => ({ ...c, shared: { ...c.shared, price: e.target.value } }))} /></div>
          <div><Label hint="{wa} · QR bhi isi se banta hai">WhatsApp number</Label><input className={inputCls} inputMode="tel" value={s.wa} onChange={(e) => setSaved((c) => ({ ...c, shared: { ...c.shared, wa: e.target.value } }))} /></div>
        </div>
      </Panel>

      <Panel title="Creative chuno">
        <div ref={galleryBox} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {thumbWide > 0 && all.map((t) => {
            const tv = { ...t.defaults, ...(saved.values[t.id] || {}) };
            const tt = tplFor(t.id, tv);
            return (
              <button key={t.id} type="button" onClick={() => setSaved((c) => ({ ...c, active: t.id }))}
                className={`rounded-2xl border p-1.5 text-left transition ${active === t.id ? "border-orange-500 ring-4 ring-orange-100" : "border-stone-200 hover:border-stone-300"}`}>
                <div className="flex items-start justify-center" style={{ height: Math.round((thumbWide - 12) * 1.25) }}>
                  <Scaled tpl={tt} v={tt.id === "custom" ? { ...tv, photo } : tv} s={s} width={Math.round(Math.min(thumbWide - 12, ((thumbWide - 12) * 1.25 * tt.w) / tt.h))} />
                </div>
                <div className="mt-1.5 truncate px-1 text-xs font-bold text-stone-800">{t.name}</div>
                <div className="truncate px-1 text-[11px] text-stone-500">{t.use}</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title={tpl.name}>
          <div ref={previewBox} className="flex justify-center">
            {previewWidth > 0 && <div className="shadow-lg" style={{ borderRadius: 12 }}><Scaled tpl={tpl} v={v} s={s} width={previewWidth} /></div>}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <Label hint={`${outW}×${outH}px${dpi ? ` · ${dpi} dpi on A4` : ""}`}>Download size</Label>
              <Chips value={sc.v} options={scales.map((x) => ({ v: x.v, l: `${x.l} · ${Math.round(tpl.w * x.k)}px` }))} onChange={setScaleKey} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={btnPrimary} disabled={!!busy} onClick={() => run("png")}><Download size={16} />{busy === "png" ? "Ban raha hai…" : "Download PNG"}</button>
              {share && <button className={btnGhost} disabled={!!busy} onClick={() => run("share")}><Share2 size={16} />{busy === "share" ? "Ban raha hai…" : "Share"}</button>}
              <button className={btnGhost} onClick={reset}><RotateCcw size={16} />Reset</button>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <p className="text-xs text-stone-500">Max = is phone par sabse badi safe size. Instagram 1080px use karta hai; print ke liye A4 poster "Print 300 dpi" ya Max lo.</p>
          </div>
        </Panel>

        <Panel title="Edit text">
          <div className="space-y-3">
            {tpl.fields.map((f) => {
              const val = v[f.key] ?? "";
              if (f.kind === "select") return (
                <div key={f.key}><Label>{f.label}</Label><Chips value={val} options={f.options.map((o) => ({ v: o.v, l: o.l }))} onChange={(x) => setField(f.key, x)} /></div>
              );
              if (f.kind === "range") return (
                <div key={f.key}><Label hint={`${val}${f.unit || ""}`}>{f.label}</Label>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={Number(val) || f.min} onChange={(e) => setField(f.key, e.target.value)} className="w-full accent-orange-600" /></div>
              );
              if (f.kind === "image") return (
                <div key={f.key}>
                  <Label hint="AI prompts se bani photo yahan lagao">{f.label}</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`${btnGhost} cursor-pointer`}><ImagePlus size={16} />{photo ? "Photo badlo" : "Photo lagao"}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) { try { setPhoto(await readPhoto(file)); } catch { setErr("Yeh photo khul nahi saki. JPG ya PNG try karo."); } } }} />
                    </label>
                    {photo && <button className={btnGhost} onClick={() => setPhoto("")}><Trash2 size={16} />Hatao</button>}
                  </div>
                </div>
              );
              return (
                <div key={f.key}>
                  <Label hint={f.hint}>{f.label}</Label>
                  {f.kind === "area"
                    ? <textarea className={inputCls} rows={Math.min(5, Math.max(2, String(val).split("\n").length + 1))} value={val} onChange={(e) => setField(f.key, e.target.value)} />
                    : <input className={inputCls} value={val} onChange={(e) => setField(f.key, e.target.value)} />}
                </div>
              );
            })}
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-stone-600">Text mein <b>*word*</b> se accent colour, <b>**word**</b> se bold. Facts ke saath source likho; "ORS", ilaaj, cure jaise words nahi.</p>
          </div>
        </Panel>
      </div>

      {/* Full-size copy used only for the download, kept off screen. */}
      <div aria-hidden style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: tpl.w, height: tpl.h }}>{tpl.render(v, s)}</div>
      </div>
    </div>
  );
}
