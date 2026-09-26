import { createContext, useCallback, useContext, useEffect, useMemo } from "react";

/*
 * Which logo the whole app shows (header, sidebar, login, pitch, creatives, browser tab).
 * Picked in Brand → Logos and stored as one team-wide row in the synced "cfg" collection
 * (id "brand"), so every partner's phone switches together. A local copy lets the login
 * screen show it before the team data has loaded.
 */

export type BrandConcept = "A" | "B" | "D" | "S";
export const BRAND_CONCEPTS: BrandConcept[] = ["A", "B", "D", "S"];
const LOCAL = "taazu.brand.logo";

const cached = (): BrandConcept => {
  try { const v = localStorage.getItem(LOCAL) as BrandConcept | null; return v && BRAND_CONCEPTS.includes(v) ? v : "A"; } catch { return "A"; }
};

type Ctx = { concept: BrandConcept; setConcept: (c: BrandConcept) => void };
export const BrandLogoCtx = createContext<Ctx>({ concept: cached(), setConcept: () => {} });
export const useBrandLogo = () => useContext(BrandLogoCtx);

export function useBrandLogoValue(rows: any[], setRows: (fn: (rows: any[]) => any[]) => void): Ctx {
  const row = rows.find((r) => r.id === "brand");
  const concept: BrandConcept = BRAND_CONCEPTS.includes(row?.logo) ? row.logo : cached();
  useEffect(() => { try { localStorage.setItem(LOCAL, concept); } catch { /* storage blocked */ } }, [concept]);
  const setConcept = useCallback((c: BrandConcept) => {
    setRows((rs) => [...rs.filter((r) => r.id !== "brand"), { ...(rs.find((r) => r.id === "brand") || {}), id: "brand", logo: c }]);
  }, [setRows]);
  return useMemo(() => ({ concept, setConcept }), [concept, setConcept]);
}
