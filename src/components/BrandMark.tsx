import { useEffect } from "react";
import { useBrandLogo, type BrandConcept } from "../lib/brandLogo";

/*
 * The Taazu logo everywhere in the app. Files come from brand-kit/logos and follow the logo
 * picked in Brand → Logos ("App logo banao"), so one choice updates the header, login,
 * pitch, Brand tab and browser tab together.
 */
const URLS = import.meta.glob(["../../brand-kit/logos/{app-icon,lockup,wordmark}-*.svg", "../../brand-kit/logos/concept-{A,B}-icon-color.svg", "../../brand-kit/logos/seal-color.svg"], { query: "?url", import: "default", eager: true }) as Record<string, string>;
const file = (name: string) => URLS[`../../brand-kit/logos/${name}.svg`];

export const appIconUrl = (c: BrandConcept) => file(`app-icon-${c === "D" ? "A" : c}`);
/** The bare mark in colour (for labels and mockups). */
export const markUrl = (c: BrandConcept) => file(c === "S" ? "seal-color" : `concept-${c === "B" ? "B" : "A"}-icon-color`);
export const lockupUrl = (c: BrandConcept, tone: "color" | "cream") => file(`lockup-${c}-${tone}`);
export const wordmarkUrl = (c: BrandConcept, tone: "leaf" | "cream") => file(c === "D" ? `wordmark-D-${tone}` : `wordmark-${tone}`);

/** Orange rounded-square app icon. The name-only logo (D) uses the Nimbu Drop here. */
export function AppIcon({ className = "h-9 w-9", alt = "Taazu" }: { className?: string; alt?: string }) {
  const { concept } = useBrandLogo();
  return <img src={appIconUrl(concept)} alt={alt} className={`shrink-0 select-none ${className}`} draggable={false} />;
}

/** "taazu" wordmark only. Use tone="cream" on dark or orange backgrounds. */
export function Wordmark({ tone = "leaf", className = "h-5 w-auto" }: { tone?: "leaf" | "cream"; className?: string }) {
  const { concept } = useBrandLogo();
  return <img src={wordmarkUrl(concept, tone)} alt="taazu" className={`select-none ${className}`} draggable={false} />;
}

/** Full logo with તાજું. Use tone="cream" on dark or orange backgrounds. */
export function Lockup({ tone = "color", className = "h-10 w-auto" }: { tone?: "color" | "cream"; className?: string }) {
  const { concept } = useBrandLogo();
  return <img src={lockupUrl(concept, tone)} alt="Taazu" className={`select-none ${className}`} draggable={false} />;
}

/** Points the browser-tab icon at the chosen logo. Home-screen icons stay as installed. */
export function FaviconSync() {
  const { concept } = useBrandLogo();
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
    if (link) link.href = appIconUrl(concept);
  }, [concept]);
  return null;
}
