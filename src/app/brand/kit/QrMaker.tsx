import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ClipboardCopy, Download, ExternalLink, FileCode2, QrCode, Save, Share2, Trash2 } from "lucide-react";
import { Panel, btnGhost, btnPrimary, inputCls } from "../../../components/ui";
import { appIconUrl } from "../../../components/BrandMark";
import { useBrandLogo } from "../../../lib/brandLogo";
import { BRAND } from "./logos";
import { canShareFiles, saveBlob, shareBlob, slug, svgToPng } from "./export";
import { CHECKER, Chips, CopyButton, Label, readStore, writeStore } from "./bits";
import { KINDS, payload, type Kind } from "./qrPayload";

/*
 * QR maker for anything Taazu needs to hand out: WhatsApp order, UPI payment, Wi-Fi at a
 * stall, Google Maps location, a contact card… Styled in brand colours with the app logo
 * in the middle, and saved locally so the same code can be downloaded again later.
 */

type Style = { color: string; bg: "white" | "cream" | "none"; dots: "square" | "round"; logo: boolean; frame: boolean; caption: string };
const COLORS = [{ v: BRAND.ink, l: "Ink" }, { v: BRAND.orange, l: "Orange" }, { v: BRAND.leaf, l: "Leaf" }, { v: BRAND.deep, l: "Deep orange" }];
const BG = { white: "#FFFFFF", cream: BRAND.cream, none: null } as const;

/** Builds the QR as an SVG string (brand colours, optional logo and caption frame). */
function buildQr(text: string, st: Style, logoData: string): { svg: string; w: number; h: number } {
  const q = QRCode.create(text, { errorCorrectionLevel: st.logo ? "H" : "M" });
  const n = q.modules.size, u = 10, quiet = 4;
  const size = (n + quiet * 2) * u;
  const inFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const logoMods = st.logo ? Math.ceil(n * 0.24) | 1 : 0; // odd, so it sits dead centre
  const l0 = (n - logoMods) / 2;
  const underLogo = (r: number, c: number) => st.logo && r >= l0 - 0.5 && r < l0 + logoMods + 0.5 && c >= l0 - 0.5 && c < l0 + logoMods + 0.5;

  let dots = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!q.modules.get(r, c) || inFinder(r, c) || underLogo(r, c)) continue;
    const x = (c + quiet) * u, y = (r + quiet) * u;
    dots += st.dots === "round" ? `<circle cx="${x + u / 2}" cy="${y + u / 2}" r="${u * 0.46}"/>` : `<rect x="${x}" y="${y}" width="${u}" height="${u}"/>`;
  }
  const rr = st.dots === "round" ? u * 0.9 : 0; // soft corners only: very round finders stop some scanners
  const finder = (r: number, c: number) => {
    const x = (c + quiet) * u, y = (r + quiet) * u;
    return `<rect x="${x + u / 2}" y="${y + u / 2}" width="${u * 6}" height="${u * 6}" rx="${rr}" fill="none" stroke="${st.color}" stroke-width="${u}"/>` +
      `<rect x="${x + u * 2}" y="${y + u * 2}" width="${u * 3}" height="${u * 3}" rx="${rr * 0.6}" fill="${st.color}"/>`;
  };
  let inner = `<g fill="${st.color}" shape-rendering="${st.dots === "round" ? "auto" : "crispEdges"}">${dots}</g>` + finder(0, 0) + finder(0, n - 7) + finder(n - 7, 0);
  if (st.logo && logoData) {
    const box = logoMods * u, lx = (l0 + quiet) * u, pad = u * 0.6;
    inner += `<rect x="${lx - pad}" y="${lx - pad}" width="${box + pad * 2}" height="${box + pad * 2}" rx="${u * 1.6}" fill="${BG[st.bg] || "#FFFFFF"}"/>` +
      `<image href="${logoData}" x="${lx}" y="${lx}" width="${box}" height="${box}"/>`;
  }
  const bg = BG[st.bg];
  if (!st.frame) {
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ""}${inner}</svg>`, w: size, h: size };
  }
  // Frame: coloured card, QR on a light tile, caption underneath.
  const f = u * 3, capH = st.caption.trim() ? u * 9 : u * 2;
  const W = size + f * 2, H = size + f * 2 + capH;
  const cap = st.caption.trim().replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]!));
  const fs = Math.min(u * 4.2, (W - u * 4) / Math.max(8, cap.length * 0.56));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" rx="${u * 4}" fill="${st.color}"/>` +
    `<rect x="${f}" y="${f}" width="${size}" height="${size}" rx="${u * 2.5}" fill="${bg || "#FFFFFF"}"/>` +
    `<g transform="translate(${f} ${f})">${inner}</g>` +
    (cap ? `<text x="${W / 2}" y="${size + f * 2 + capH / 2 - u * 0.6}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fs}" fill="#FFFFFF">${cap}</text>` : "") +
    `</svg>`;
  return { svg, w: W, h: H };
}

type Saved = { id: string; name: string; kind: Kind; data: Record<string, string>; style: Style };
const KEY = "taazu.brandkit.qr.v1";
const DEF_STYLE: Style = { color: BRAND.ink, bg: "white", dots: "square", logo: true, frame: true, caption: KINDS[0].caption };
const DEFAULT = { kind: "whatsapp" as Kind, data: { phone: "91737 36652", msg: "Hi Taazu, mujhe order karna hai" } as Record<string, string>, style: DEF_STYLE, name: "WhatsApp order", saved: [] as Saved[] };

const svgUrl = (svg: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

export default function QrMaker() {
  const [st, setSt] = useState(() => readStore(KEY, DEFAULT));
  const [width, setWidth] = useState(2048);
  const [logoData, setLogoData] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const { concept } = useBrandLogo();
  const share = useMemo(canShareFiles, []);
  useEffect(() => { writeStore(KEY, st); }, [st]);

  // The logo goes into the SVG as data, so the downloaded file carries it.
  useEffect(() => {
    let off = false;
    fetch(appIconUrl(concept)).then((r) => r.text()).then((t) => { if (!off) setLogoData(svgUrl(t)); }).catch(() => setLogoData(""));
    return () => { off = true; };
  }, [concept]);

  const kind = KINDS.find((k) => k.id === st.kind) || KINDS[0];
  const text = payload(st.kind, st.data);
  const qr = useMemo(() => { try { return text ? buildQr(text, st.style, logoData) : null; } catch { return null; } }, [text, st.style, logoData]);
  const tooLong = !!text && !qr;
  const outW = width, outH = qr ? Math.round((width * qr.h) / qr.w) : 0;
  const fname = `taazu-qr-${slug(st.name || kind.label)}`;

  const set = (p: Partial<typeof st>) => setSt((c) => ({ ...c, ...p }));
  const setData = (k: string, v: string) => setSt((c) => ({ ...c, data: { ...c.data, [k]: v } }));
  const setStyle = (p: Partial<Style>) => setSt((c) => ({ ...c, style: { ...c.style, ...p } }));
  const pickKind = (k: Kind) => {
    const next = KINDS.find((x) => x.id === k)!;
    // Swap in the new type's usual caption unless the person wrote their own.
    setSt((c) => ({ ...c, kind: k, name: next.label, style: { ...c.style, caption: KINDS.some((x) => x.caption === c.style.caption) ? next.caption : c.style.caption } }));
  };

  const run = async (what: "png" | "svg" | "share" | "copy") => {
    if (!qr) return;
    setMsg(""); setBusy(what);
    try {
      if (what === "svg") { saveBlob(new Blob([qr.svg], { type: "image/svg+xml" }), fname + ".svg"); return; }
      const png = await svgToPng(qr.svg, outW);
      if (what === "png") saveBlob(png, `${fname}-${outW}px.png`);
      else if (what === "share") { if (!(await shareBlob(png, fname + ".png", st.name))) saveBlob(png, `${fname}-${outW}px.png`); }
      else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
        setMsg("QR copy ho gaya. WhatsApp, Canva ya email mein paste karo.");
      }
    } catch (e: any) { setMsg(what === "copy" ? "Is browser mein image copy nahi hoti. Download ya Share use karo." : e?.message || "Download nahi hua."); }
    finally { setBusy(""); }
  };

  const save = () => {
    const item: Saved = { id: Date.now().toString(36), name: st.name || kind.label, kind: st.kind, data: st.data, style: st.style };
    setSt((c) => ({ ...c, saved: [item, ...c.saved.filter((x) => x.name !== item.name)].slice(0, 30) }));
    setMsg(`"${item.name}" saved.`);
  };
  const load = (x: Saved) => setSt((c) => ({ ...c, kind: x.kind, data: x.data, style: { ...DEF_STYLE, ...x.style }, name: x.name }));
  const remove = (id: string) => setSt((c) => ({ ...c, saved: c.saved.filter((x) => x.id !== id) }));
  const openable = /^(https?:|upi:|tel:|mailto:)/i.test(text);

  return (
    <div className="space-y-4">
      <Panel title="QR kis cheez ka?" icon={QrCode}>
        <Chips value={st.kind} options={KINDS.map((k) => ({ v: k.id, l: k.label }))} onChange={pickKind} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Preview">
          <div className="grid min-h-[280px] place-items-center rounded-2xl border border-stone-200 p-4" style={CHECKER}>
            {qr ? <img src={svgUrl(qr.svg)} alt={`QR code: ${st.name}`} className="w-full max-w-[320px]" />
              : <p className="max-w-xs text-center text-sm text-stone-500">{tooLong ? "Itna lamba text QR mein nahi aayega. Chhota karo." : "Details bharo, QR yahan banega."}</p>}
          </div>
          {text && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-stone-50 p-2.5">
              <code className="min-w-0 flex-1 break-all text-[11px] leading-relaxed text-stone-600">{text}</code>
              <CopyButton text={text} label="Copy" />
              {openable && <a href={text} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:border-orange-300"><ExternalLink size={14} />Test</a>}
            </div>
          )}
          <div className="mt-3">
            <Label hint={qr ? `${outW}×${outH}px` : undefined}>PNG size</Label>
            <Chips value={String(width)} options={[1024, 2048, 4096].map((w) => ({ v: String(w), l: `${w}px${w === 4096 ? " · print" : ""}` }))} onChange={(v) => setWidth(Number(v))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={btnPrimary} disabled={!qr || !!busy} onClick={() => run("png")}><Download size={16} />{busy === "png" ? "Ban raha hai…" : "Download PNG"}</button>
            <button className={btnGhost} disabled={!qr || !!busy} onClick={() => run("svg")}><FileCode2 size={16} />SVG</button>
            {share && <button className={btnGhost} disabled={!qr || !!busy} onClick={() => run("share")}><Share2 size={16} />Share</button>}
            {typeof ClipboardItem !== "undefined" && <button className={btnGhost} disabled={!qr || !!busy} onClick={() => run("copy")}><ClipboardCopy size={16} />Copy image</button>}
            <button className={btnGhost} disabled={!qr} onClick={save}><Save size={16} />Save</button>
          </div>
          {msg && <p className="mt-2 text-sm text-stone-600">{msg}</p>}
          <p className="mt-2 text-xs text-stone-500">Print karne se pehle ek baar phone camera se scan karke check karo. Print mein QR kam se kam 2.5 cm chauda rakho.</p>
        </Panel>

        <Panel title="Details">
          <div className="space-y-3">
            <div><Label hint="file ka naam, saved list mein">QR ka naam</Label><input className={inputCls} value={st.name} onChange={(e) => set({ name: e.target.value })} /></div>
            {kind.fields.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {f.select ? <Chips value={st.data[f.key] || f.select[0]} options={f.select.map((x) => ({ v: x, l: x === "nopass" ? "No password" : x }))} onChange={(x) => setData(f.key, x)} />
                  : f.area ? <textarea className={inputCls} rows={3} placeholder={f.ph} value={st.data[f.key] || ""} onChange={(e) => setData(f.key, e.target.value)} />
                  : <input className={inputCls} inputMode={f.tel ? "tel" : undefined} placeholder={f.ph} value={st.data[f.key] || ""} onChange={(e) => setData(f.key, e.target.value)} />}
              </div>
            ))}
            <div className="border-t border-stone-100 pt-3">
              <Label>Colour</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c.v} type="button" title={c.l} aria-label={c.l} onClick={() => setStyle({ color: c.v })}
                    className={`h-9 w-9 rounded-full border-2 ${st.style.color === c.v ? "border-orange-500 ring-4 ring-orange-100" : "border-stone-200"}`} style={{ background: c.v }} />
                ))}
              </div>
            </div>
            <div><Label>Background</Label><Chips value={st.style.bg} options={[{ v: "white", l: "White" }, { v: "cream", l: "Cream" }, { v: "none", l: "Transparent" }]} onChange={(bg) => setStyle({ bg })} /></div>
            <div><Label>Dots</Label><Chips value={st.style.dots} options={[{ v: "square", l: "Square (sabse safe)" }, { v: "round", l: "Round" }]} onChange={(dots) => setStyle({ dots })} /></div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700"><input type="checkbox" checked={st.style.logo} onChange={(e) => setStyle({ logo: e.target.checked })} className="h-4 w-4 accent-orange-600" />Beech mein app logo</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700"><input type="checkbox" checked={st.style.frame} onChange={(e) => setStyle({ frame: e.target.checked })} className="h-4 w-4 accent-orange-600" />Frame aur caption</label>
            {st.style.frame && <div><Label>Caption</Label><input className={inputCls} value={st.style.caption} maxLength={40} onChange={(e) => setStyle({ caption: e.target.value })} /></div>}
          </div>
        </Panel>
      </div>

      {st.saved.length > 0 && (
        <Panel title={`Saved QR codes · ${st.saved.length}`}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {st.saved.map((x) => (
              <div key={x.id} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-2.5">
                <button type="button" onClick={() => load(x)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-bold text-stone-900">{x.name}</div>
                  <div className="truncate text-[11px] text-stone-500">{KINDS.find((k) => k.id === x.kind)?.label} · {payload(x.kind, x.data).slice(0, 48)}</div>
                </button>
                <button type="button" aria-label={`Delete ${x.name}`} onClick={() => remove(x.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500">Saved list isi phone/browser mein rehti hai. Kisi par tap karo, woh QR wapas khul jayega.</p>
        </Panel>
      )}
    </div>
  );
}
