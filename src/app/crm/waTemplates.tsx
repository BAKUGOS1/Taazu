import { createContext, useCallback, useContext, useMemo } from "react";
import type { CrmConfig, CrmRecord, Lang } from "./config";
import { WA_NEED } from "./configs";

/*
 * Custom WhatsApp messages (Settings → WhatsApp messages).
 *
 * A template is a message body with {placeholders} plus simple rules
 * (category, city, stage, ⭐ starred, verified). When a Call/WhatsApp button
 * is tapped, the first switched-on template whose rules match the record is
 * used; if none matches, the built-in message from the CRM config is used.
 * Templates are team-wide: one row in the synced "cfg" collection (id "wa").
 */

export type Tri = "any" | "yes" | "no";
export type WaTemplate = {
  id: string; name: string; kind: "sup" | "buy"; body: string; on: boolean;
  cats: string[]; cities: string[]; stages: string[]; starred: Tri; verified: Tri;
};

export const blankTemplate = (kind: "sup" | "buy", id: string): WaTemplate => ({
  id, name: "New message", kind, on: true, cats: [], cities: [], stages: [], starred: "any", verified: "any",
  body: kind === "sup"
    ? "Dear {who},\n\nI'm writing from *Taazu*, a new electrolyte drink brand based in Ahmedabad. We are looking for a partner for {need}.\n\nCould you please share your price per unit, minimum order and a copy of your FSSAI licence?\n\nBest regards,\nTaazu, Ahmedabad"
    : "Hello {who},\n\nThis is Taazu from Ahmedabad. We make a local low-sugar electrolyte drink and would love to leave a free sample for {name}.\n\nCould we talk for 10 minutes?",
});

/* Placeholders shown as tap-to-insert chips in Settings. Any other record field also works as {field}. */
export const PLACEHOLDERS: { k: string; label: string }[] = [
  { k: "who", label: "Contact name, or Sir/Madam" },
  { k: "contact", label: "Contact person" },
  { k: "name", label: "Business name" },
  { k: "city", label: "City" },
  { k: "area", label: "Address" },
  { k: "cat", label: "Category" },
  { k: "need", label: "What we need (by category)" },
  { k: "about", label: "Expert in" },
  { k: "price", label: "Rate ₹/unit" },
  { k: "moq", label: "MOQ" },
];

export const isStarred = (r: CrmRecord) => String(r.name || "").includes("⭐") || String(r.about || "").includes("⭐");
const clean = (s: any) => String(s ?? "").replace(/⭐\s*/g, "").trim();

/* Value for one placeholder. */
const value = (k: string, r: CrmRecord, cfg: CrmConfig) => {
  switch (k) {
    case "who": return clean(r.contact).replace(/\s*\(.*?\)/g, "").split(/\s*\/\s*/)[0].trim() || "Sir/Madam";
    case "name": return clean(r.name);
    case "cat": return clean(r[cfg.catKey]);
    case "need": return WA_NEED[r[cfg.catKey]] || "the products and services you offer";
    default: return clean(r[k]);
  }
};

/* "{who}" → value; "{contact|Sir}" → value or the fallback after "|". Unknown or empty fields become "". */
export const fill = (body: string, r: CrmRecord, cfg: CrmConfig) =>
  String(body || "").replace(/\{\s*([a-zA-Z_][\w]*)\s*(?:\|([^}]*))?\}/g, (_, k, fb) => value(k, r, cfg) || (fb ?? "").trim());

const tri = (rule: Tri, v: boolean) => rule === "any" || (rule === "yes") === v;

export const matches = (t: WaTemplate, r: CrmRecord, cfg: CrmConfig) =>
  t.kind === cfg.kind &&
  (!t.cats.length || t.cats.includes(r[cfg.catKey])) &&
  (!t.cities.length || t.cities.includes(r.city)) &&
  (!t.stages.length || t.stages.includes(r.status)) &&
  tri(t.starred, isStarred(r)) &&
  tri(t.verified, !!r.verified);

/* First switched-on template (top to bottom) whose rules match, or null for the built-in message. */
export const pickTemplate = (list: WaTemplate[], r: CrmRecord, cfg: CrmConfig) =>
  list.find((t) => t.on && matches(t, r, cfg)) || null;

export const messageFor = (list: WaTemplate[], cfg: CrmConfig, r: CrmRecord, lang: Lang, forced?: WaTemplate | null) => {
  const t = forced === undefined ? pickTemplate(list, r, cfg) : forced;
  return t ? fill(t.body, r, cfg) : cfg.waMessage(r, lang);
};

/* ---------- team-wide storage ---------- */
type Ctx = { list: WaTemplate[]; setList: (fn: (l: WaTemplate[]) => WaTemplate[]) => void };
export const WaTplCtx = createContext<Ctx>({ list: [], setList: () => {} });
export const useWaTemplates = () => useContext(WaTplCtx);

export function useWaTemplatesValue(rows: any[], setRows: (fn: (rows: any[]) => any[]) => void): Ctx {
  const row = rows.find((r) => r.id === "wa");
  const list: WaTemplate[] = useMemo(() => (Array.isArray(row?.list) ? row.list : []), [row]);
  const setList = useCallback((fn: (l: WaTemplate[]) => WaTemplate[]) => {
    setRows((rs) => {
      const cur = rs.find((r) => r.id === "wa");
      return [...rs.filter((r) => r.id !== "wa"), { ...(cur || {}), id: "wa", list: fn(Array.isArray(cur?.list) ? cur.list : []) }];
    });
  }, [setRows]);
  return useMemo(() => ({ list, setList }), [list, setList]);
}
