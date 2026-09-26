/*
 * Logo files come straight from brand-kit/logos (pure-path SVGs, text already outlined), so the
 * app and the kit folder never drift apart. This module picks a file and restyles it:
 * background, padding, square canvas and one-colour versions.
 */
const RAW = import.meta.glob("../../../../brand-kit/logos/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const FILES: Record<string, string> = Object.fromEntries(Object.entries(RAW).map(([p, s]) => [p.split("/").pop()!.replace(/\.svg$/, ""), s]));

export const BRAND = { orange: "#EA580C", deep: "#C2410C", nimbu: "#F5D83B", leaf: "#1F7A3A", cream: "#FFF8E7", ink: "#1C1917", white: "#FFFFFF" };

export type ConceptId = "A" | "B" | "C" | "D" | "S";
export type Layout = "icon" | "horizontal" | "stacked" | "wordmark" | "seal";
export type Style = "color" | "reverse" | "ink" | "white";

export const CONCEPTS: { id: ConceptId; name: string; tag: string; idea: string; layouts: Layout[] }[] = [
  { id: "A", name: "Nimbu Drop", tag: "Primary", idea: "Boond ke andar nimbu slice: drink + nimbu ek nazar mein. Label, cap, DP sab par.", layouts: ["icon", "horizontal", "stacked"] },
  { id: "B", name: "Sun Drop", tag: "Campaign", idea: "Suraj ke saamne thandi boond: garmi ka jawab. Summer banners ke liye.", layouts: ["icon", "horizontal", "stacked"] },
  { id: "C", name: "t-wave", tag: "App icon", idea: "\"t\" ki crossbar ek lehar, saath mein nimbu-yellow boond. App icon aur DP.", layouts: ["icon", "horizontal", "stacked"] },
  { id: "D", name: "Anusvara", tag: "Name only", idea: "તાજું ke \"ં\" ka dot boond ban kar \"u\" ke upar. Banners aur lambi labels.", layouts: ["wordmark"] },
  { id: "S", name: "Seal", tag: "Sticker", idea: "Round stamp: cup sleeves, cap-top sticker, delivery bags.", layouts: ["seal"] },
];
export const LAYOUT_LABEL: Record<Layout, string> = { icon: "Icon (bina naam)", horizontal: "Naam ke saath · side", stacked: "Naam ke saath · upar-neeche", wordmark: "Wordmark", seal: "Seal" };
export const STYLE_LABEL: Record<Style, string> = { color: "Colour", reverse: "Reverse", ink: "Ek colour · dark", white: "Ek colour · white" };

export const BACKGROUNDS: { id: string; label: string; hex: string | null }[] = [
  { id: "none", label: "Transparent", hex: null },
  { id: "cream", label: "Cream", hex: BRAND.cream },
  { id: "white", label: "White", hex: BRAND.white },
  { id: "orange", label: "Orange", hex: BRAND.orange },
  { id: "ink", label: "Ink", hex: BRAND.ink },
  { id: "leaf", label: "Leaf", hex: BRAND.leaf },
  { id: "nimbu", label: "Nimbu", hex: BRAND.nimbu },
];

/** Background each style is designed for, used when the person picks a style. */
export const STYLE_BG: Record<Style, string> = { color: "cream", reverse: "orange", ink: "white", white: "ink" };

function fileName(c: ConceptId, layout: Layout, style: "color" | "reverse") {
  if (c === "S") return `seal-${style}`;
  if (c === "D") return `concept-D-wordmark-${style}`;
  return `concept-${c}-${layout}-${style}`;
}

function parse(svg: string) {
  const [, , w, h] = (svg.match(/viewBox="([\d.\s-]+)"/)?.[1] || "0 0 512 512").split(/\s+/).map(Number);
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  // Reverse files carry a full-size background rect; the editor adds its own background.
  inner = inner.replace(new RegExp(`^<rect width="${w}" height="${h}" fill="#[0-9A-Fa-f]{6}"/>`), "");
  return { w, h, inner };
}

const HEX = /#[0-9A-Fa-f]{6}\b/g;

export type LogoOpts = { concept: ConceptId; layout: Layout; style: Style; bg: string; pad: number; square: boolean };

/** Builds the final SVG for the chosen options. */
export function buildLogo(o: LogoOpts): { svg: string; w: number; h: number } {
  const base = FILES[fileName(o.concept, o.layout, o.style === "reverse" ? "reverse" : "color")];
  if (!base) throw new Error("Logo file missing");
  let { w, h, inner } = parse(base);
  const bgHex = BACKGROUNDS.find((b) => b.id === o.bg)?.hex ?? null;

  if (o.style === "ink" || o.style === "white") {
    const main = o.style === "ink" ? BRAND.ink : BRAND.white;
    // Cut-outs (cream parts) take the background colour, so the mark still reads in one colour.
    const knock = bgHex || (o.style === "ink" ? BRAND.white : BRAND.ink);
    const knockouts = new Set([BRAND.cream.toLowerCase(), ...(o.concept === "C" ? [BRAND.nimbu.toLowerCase()] : [])]);
    inner = inner.replace(HEX, (x) => (knockouts.has(x.toLowerCase()) ? knock : main));
  }

  const pad = Math.round(Math.max(w, h) * o.pad);
  let W = w + pad * 2, H = h + pad * 2, x = pad, y = pad;
  if (o.square) { const s = Math.max(W, H); x += (s - W) / 2; y += (s - H) / 2; W = H = s; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bgHex ? `<rect width="${W}" height="${H}" fill="${bgHex}"/>` : ""}<g transform="translate(${x} ${y})">${inner}</g></svg>`;
  return { svg, w: W, h: H };
}

/** Plain logo for use inside creatives (no padding, no background). */
export function logoSvg(concept: ConceptId, layout: Layout, style: Style) {
  return buildLogo({ concept, layout, style, bg: "none", pad: 0, square: false });
}

export const logoFileName = (o: LogoOpts) => {
  const c = CONCEPTS.find((x) => x.id === o.concept)!;
  return `taazu-${c.name.toLowerCase().replace(/[^a-z]+/g, "-")}-${o.layout}-${o.style}${o.bg !== "none" ? "-on-" + o.bg : ""}`;
};
