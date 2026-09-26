import { toBlob } from "html-to-image";
import { fontEmbedCss, loadFonts } from "./fonts";

/*
 * Download helpers for the brand kit. Everything is drawn on the phone itself: logos are
 * pure-path SVGs rasterised onto a canvas, creatives are DOM nodes captured with html-to-image.
 */

// iOS Safari refuses canvases above ~16.7 million pixels, so every size stays under it.
export const MAX_PIXELS = 16_700_000;
export const maxScale = (w: number, h: number, cap = 4) => Math.max(1, Math.min(cap, Math.floor(Math.sqrt(MAX_PIXELS / (w * h)) * 100) / 100));

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Opens the phone's share sheet (WhatsApp, Instagram…) when the browser can share files. */
export async function shareBlob(blob: Blob, name: string, title = "Taazu"): Promise<boolean> {
  const file = new File([blob], name, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (!nav.share || !nav.canShare?.({ files: [file] })) return false;
  try { await nav.share({ files: [file], title }); return true; } catch { return true; /* user closed the sheet */ }
}
export const canShareFiles = () => {
  try {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    return !!nav.share && !!nav.canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
  } catch { return false; }
};

/** Rasterises an SVG string to a PNG of the given pixel width. */
export async function svgToPng(svg: string, width: number): Promise<Blob> {
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)?.[1].split(/\s+/).map(Number) || [0, 0, 512, 512];
  const height = Math.round((width * vb[3]) / vb[2]);
  const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((ok, fail) => { img.onload = () => ok(); img.onerror = () => fail(new Error("Could not draw the logo")); img.src = src; });
    const c = document.createElement("canvas");
    c.width = width; c.height = height;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error("Image too large for this phone"))), "image/png"));
  } finally {
    URL.revokeObjectURL(src);
  }
}

const isSafari = () => /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

/** Captures a creative's DOM node at its natural size × scale. */
export async function nodeToPng(node: HTMLElement, width: number, height: number, scale: number): Promise<Blob> {
  await loadFonts();
  const fontCss = await fontEmbedCss();
  const opts = { width, height, pixelRatio: scale, fontEmbedCSS: fontCss, cacheBust: false, style: { transform: "none", margin: "0" } };
  // Safari paints fonts inside the capture only on the second pass.
  if (isSafari()) await toBlob(node, { ...opts, pixelRatio: 0.2 }).catch(() => null);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error("Image too large for this phone");
  return blob;
}

export const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "taazu";
