import { MODULES, type IoField, type IoModule } from "./schema";

/*
 * The import engine, kept free of React and of the xlsx library so it can be tested on its own.
 * Flow: find the header row -> match columns to fields -> clean each cell -> find duplicates -> plan -> apply.
 */

export const NOTES = "__notes";   // mapping target: keep the column by adding it to the record's notes
export type Mapping = (string | null)[]; // one entry per file column: field key, NOTES, or null (don't import)
export type Policy = "skip" | "fill" | "overwrite" | "create";
export type Action = "create" | "update" | "unchanged" | "duplicate" | "error";

export type PlanRow = {
  row: number;                 // row number in the spreadsheet (1-based, as Excel shows it)
  raw: any[];
  action: Action;
  record: Record<string, any>; // cleaned values from the file (blank cells left out)
  matchId?: string;            // existing record this row matched
  matchName?: string;
  matchedBy?: string;          // "Phone", "GSTIN"…
  patch?: Record<string, any>; // what an update changes
  errors: string[];
  warnings: string[];
};

/* ---------------- headers ---------------- */

export const norm = (s: any) => String(s ?? "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9₹]+/g, "");
const words = (s: string) => String(s).toLowerCase().replace(/&/g, " and ").split(/[^a-z0-9₹]+/).filter(Boolean);

/* How well a column header fits a field: 100 exact label/key, ~90 known alias, 50-60 partial. */
export function headerScore(header: any, f: IoField): number {
  const h = norm(header);
  if (!h) return 0;
  if (h === norm(f.label) || h === norm(f.k)) return 100;
  const aliases = f.aliases || [];
  const i = aliases.findIndex((a) => norm(a) === h);
  if (i >= 0) return 90 - i * 0.1;                     // earlier aliases are the more specific ones
  let best = 0;
  for (const a of [f.label, ...aliases]) {
    const n = norm(a);
    if (n.length >= 4 && h.length >= 4 && (h.includes(n) || n.includes(h))) best = Math.max(best, 60 - Math.abs(h.length - n.length) * 0.5);
    const aw = words(a), hw = words(header);
    const common = aw.filter((w) => w.length > 2 && hw.includes(w)).length;
    if (common) best = Math.max(best, (50 * common) / Math.max(aw.length, hw.length));
  }
  return best;
}

/* Match every file column to a field. Each field takes one column, except fields that join several (First + Last name). */
export function autoMap(headers: any[], mod: IoModule): Mapping {
  const cands: { col: number; k: string; s: number; join: boolean }[] = [];
  headers.forEach((h, col) => mod.fields.forEach((f) => {
    const s = headerScore(h, f);
    if (s >= 45) cands.push({ col, k: f.k, s, join: !!f.joinWith && s >= 85 });
  }));
  cands.sort((a, b) => b.s - a.s);
  const out: Mapping = headers.map(() => null);
  const taken = new Set<string>();
  for (const c of cands) {
    if (out[c.col] !== null) continue;
    if (taken.has(c.k) && !c.join) continue;
    out[c.col] = c.k; taken.add(c.k);
  }
  return out;
}

const strongHits = (headers: any[], mod: IoModule) => autoMap(headers, mod).filter((k, i) => k && mod.fields.some((f) => f.k === k && headerScore(headers[i], f) >= 85)).length;

/* Which module a sheet most likely holds, from its name and headers. null when nothing fits. */
const NOT_DATA = /^(summary|calllog|brandnames|instructions|readme|.*help)$/;   // other sheets in Taazu's own exports and templates

export function detectModule(headers: any[], sheetName = ""): IoModule | null {
  const sn = norm(sheetName);
  if (NOT_DATA.test(sn)) return null;
  let best: IoModule | null = null, bestScore = 0;
  for (const m of MODULES) {
    let s = strongHits(headers, m);
    if (sn && [m.label, m.sheet, m.noun, m.noun + "s"].some((x) => norm(x) === sn || sn.includes(norm(x)))) s += 5;
    if (m.id === "sup" && /supplier|vendor|manufactur|copacker|packer/.test(sn + headers.map(norm).join(" "))) s += 1;
    if (m.id === "buy" && /buyer|customer|lead|client|prospect/.test(sn)) s += 1;
    if (s > bestScore) { best = m; bestScore = s; }
  }
  return bestScore >= 3 ? best : null;
}

/* The header row is the one near the top with the most text cells that look like column names (title rows and blank rows above it are skipped). */
export function findHeaderRow(rows: any[][]): number {
  let best = 0, bestScore = -1;
  rows.slice(0, 15).forEach((r, i) => {
    const text = (r || []).filter((c) => typeof c === "string" && c.trim() && isNaN(Number(c))).length;
    const known = (r || []).filter((c) => MODULES.some((m) => m.fields.some((f) => headerScore(c, f) >= 85))).length;
    const s = text + known * 3;
    if (s > bestScore) { best = i; bestScore = s; }
  });
  return best;
}

/* ---------------- cell cleaning ---------------- */

const blank = (v: any) => v === null || v === undefined || (typeof v === "string" && !v.trim());
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? `${y}-${pad(m)}-${pad(d)}` : null;
};
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/* Dates in any common form -> YYYY-MM-DD. Numbers are Excel serial dates. Slashed dates are read day-first (Indian style) unless that's impossible. */
export function parseDate(v: any): string | null {
  if (v instanceof Date && !isNaN(+v)) return ymd(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === "number" || /^\d{5}(\.\d+)?$/.test(String(v).trim())) {
    const n = Number(v);
    if (n > 20000 && n < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86400000); return ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); }
    return null;
  }
  const s = String(v).trim().replace(/(\d)(st|nd|rd|th)\b/gi, "$1");
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/);
  if (m) {
    let [a, b, y] = [+m[1], +m[2], +m[3]];
    if (y < 100) y += 2000;
    if (b > 12 && a <= 12) [a, b] = [b, a];            // clearly month-first (US export)
    return ymd(y, b, a);
  }
  m = s.match(/^(\d{1,2})[\s-]+([a-z]{3,})[\s,-]+(\d{2,4})/i);             // 5 Oct 2026, 05-Oct-26
  if (m) { const mo = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()); let y = +m[3]; if (y < 100) y += 2000; return mo >= 0 ? ymd(y, mo + 1, +m[1]) : null; }
  m = s.match(/^([a-z]{3,})[\s-]+(\d{1,2}),?[\s-]+(\d{4})/i);               // Oct 5, 2026
  if (m) { const mo = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()); return mo >= 0 ? ymd(+m[3], mo + 1, +m[2]) : null; }
  return null;
}

/* ₹1,20,000.50 / Rs. 13 / 13/- / "2000 units" -> number. */
export function parseNumber(v: any): { n: number | null; loose: boolean } {
  if (typeof v === "number") return { n: isFinite(v) ? v : null, loose: false };
  const s = String(v).trim().replace(/₹|rs\.?|inr|\/-/gi, "").replace(/,/g, "").trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return { n: Number(s), loose: false };
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? { n: Number(m[0]), loose: true } : { n: null, loose: false };
}

export const phoneKey = (p: any) => { const d = String(p ?? "").replace(/\D/g, ""); return d.length >= 8 ? d.slice(-10) : ""; };
/* Only bare numbers are reformatted (Excel often stores them as numbers). Anything typed with spaces,
 * dashes or a +91 is kept as typed: "+91 79 2656 2643" is a landline and must not become a mobile. */
export function tidyPhone(v: any): string {
  const s = typeof v === "number" ? String(Math.round(v)) : String(v).trim();
  const d = /^[\d\s-]+$/.test(s) ? s.replace(/\D/g, "") : "";
  if (/^[6-9]\d{9}$/.test(d)) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (/^91[6-9]\d{9}$/.test(s)) return `+91 ${s.slice(2, 7)} ${s.slice(7)}`;
  return s;
}

const GST_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/* Format + check digit, as the GST portal computes it. */
export function gstinOk(g: string): boolean {
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) { const p = GST_CHARS.indexOf(g[i]) * (i % 2 ? 2 : 1); sum += Math.floor(p / 36) + (p % 36); }
  return GST_CHARS[(36 - (sum % 36)) % 36] === g[14];
}

type Clean = { v?: any; error?: string; warning?: string };

export function cleanCell(f: IoField, raw: any, mod: IoModule): Clean {
  if (blank(raw)) return {};
  const text = raw instanceof Date ? raw.toISOString().slice(0, 10) : String(raw).trim();
  switch (f.type) {
    case "number": {
      const { n, loose } = parseNumber(raw);
      if (n === null) return { warning: `${f.label}: "${text}" is not a number, left blank` };
      return { v: n, warning: loose ? `${f.label}: read "${text}" as ${n}` : undefined };
    }
    case "date": {
      const d = parseDate(raw);
      return d ? { v: d } : { warning: `${f.label}: "${text}" is not a date, left blank` };
    }
    case "phone": return { v: tidyPhone(raw) };
    case "email": {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? { v: text } : { v: text, warning: `${f.label}: "${text}" doesn't look like an email` };
    }
    case "gstin": {
      const g = text.toUpperCase().replace(/[\s-]/g, "");
      return gstinOk(g) ? { v: g } : { v: g, warning: `GSTIN "${g}" fails the GST check — probably a typo` };
    }
    case "select": {
      const opts = f.options || [];
      const hit = opts.find((o) => norm(o) === norm(text));
      if (hit) return { v: hit };
      const legacy = Object.entries(f.legacy || {}).find(([from]) => norm(from) === norm(text));
      if (legacy) return { v: legacy[1] };
      if (!f.strict) return { v: text };
      const fallback = mod.defaults[f.k];
      return { v: fallback || undefined, warning: `${f.label}: "${text}" isn't one of ${opts.join(" / ")}${fallback ? `, set to ${fallback}` : ", left blank"}` };
    }
    default: return { v: text };
  }
}

const notesKey = (mod: IoModule) => (mod.fields.some((f) => f.k === "notes") ? "notes" : mod.fields.some((f) => f.k === "comment") ? "comment" : null);

/* One spreadsheet row -> cleaned record + problems. */
export function buildRecord(raw: any[], headers: any[], mapping: Mapping, mod: IoModule) {
  const rec: Record<string, any> = {}, errors: string[] = [], warnings: string[] = [], extra: string[] = [], spare: string[] = [];
  const byField = new Map<string, any[]>();
  mapping.forEach((k, col) => {
    if (!k || blank(raw[col])) return;
    if (k === NOTES) { extra.push(`${String(headers[col]).trim()}: ${String(raw[col]).trim()}`); return; }
    byField.set(k, [...(byField.get(k) || []), raw[col]]);
  });
  for (const f of mod.fields) {
    const vals = byField.get(f.k);
    if (!vals) continue;
    let value: any = vals.length > 1 && (!f.type || f.type === "text") ? vals.map((v) => String(v).trim()).join(f.joinWith ?? ", ") : vals[0];
    // "98250 12345 / 99099 11223" in Phone: the first stays, the others go to Alt phone (or notes when there is none)
    if (f.k === "phone" && typeof value === "string") {
      const parts = value.split(/\s*[/,;|]\s*|\s+or\s+/i).filter((p) => p.replace(/\D/g, "").length >= 8);
      if (parts.length > 1) { value = parts[0]; spare.push(...parts.slice(1).map(tidyPhone)); }
    }
    const c = cleanCell(f, value, mod);
    if (c.v !== undefined && c.v !== "") rec[f.k] = c.v;
    if (c.error) errors.push(c.error);
    if (c.warning) warnings.push(c.warning);
  }
  if (spare.length) {
    if (mod.fields.some((x) => x.k === "phone2")) rec.phone2 = [rec.phone2, ...spare].filter(Boolean).join(" / ");
    else extra.push(`Other phone: ${spare.join(" / ")}`);
  }
  const nk = notesKey(mod);
  if (extra.length && nk) rec[nk] = [rec[nk], ...extra].filter(Boolean).join("\n");
  for (const f of mod.fields) if (f.required && blank(rec[f.k])) errors.push(`${f.label} is empty`);
  return { rec, errors, warnings };
}

/* ---------------- duplicates ---------------- */

const keyPart = (k: string, v: any) => (k === "phone" || k === "phone2" ? phoneKey(v) : k === "gstin" ? String(v ?? "").toUpperCase().replace(/\s/g, "") : norm(v));
const specLabel = (mod: IoModule, spec: string[]) => spec.map((k) => mod.fields.find((f) => f.k === k)?.label || k).join(" + ");

/* Index of records by every duplicate key. Phones match across Phone and Alt phone. */
class DupIndex {
  maps: Map<string, any>[];
  constructor(private mod: IoModule, rows: any[]) {
    this.maps = mod.dedupe.map(() => new Map());
    rows.forEach((r) => this.add(r));
  }
  private keys(r: any, spec: string[]): string[] {
    if (spec.length === 1 && spec[0] === "phone") return [phoneKey(r.phone), phoneKey(r.phone2)].filter(Boolean);
    const parts = spec.map((k) => keyPart(k, r[k]));
    return parts.some((p) => !p) ? [] : [parts.join("|")];
  }
  add(r: any) { this.mod.dedupe.forEach((spec, i) => this.keys(r, spec).forEach((key) => { if (!this.maps[i].has(key)) this.maps[i].set(key, r); })); }
  find(r: any): { hit: any; by: string } | null {
    for (let i = 0; i < this.mod.dedupe.length; i++) {
      for (const key of this.keys(r, this.mod.dedupe[i])) { const hit = this.maps[i].get(key); if (hit) return { hit, by: specLabel(this.mod, this.mod.dedupe[i]) }; }
    }
    return null;
  }
}

const same = (a: any, b: any) => String(a ?? "").trim() === String(b ?? "").trim();

/* What an update would change on `cur`. fill = only empty fields; overwrite = file wins (notes are added to, not replaced). */
export function patchFor(cur: any, rec: any, policy: Policy, mod: IoModule): Record<string, any> {
  const nk = notesKey(mod), p: Record<string, any> = {};
  for (const [k, v] of Object.entries(rec)) {
    const t = mod.fields.find((f) => f.k === k)?.type;
    if (same(cur[k], v) || (t === "phone" && phoneKey(cur[k]) && phoneKey(cur[k]) === phoneKey(v)) || (t === "email" && norm(cur[k]) === norm(v))) continue;
    if (blank(cur[k])) p[k] = v;
    else if (policy === "overwrite") p[k] = k === nk ? (String(cur[k]).includes(String(v)) ? undefined : `${cur[k]}\n${v}`) : v;
  }
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

let tmp = 0;
/* Decide what happens to every row. Rows repeated inside the file merge into the first one. */
export function planImport(rows: any[][], headers: any[], mapping: Mapping, mod: IoModule, existing: any[], policy: Policy, firstRow = 2): PlanRow[] {
  const idx = new DupIndex(mod, existing.map((r) => ({ ...r })));   // copies: planning never touches app state
  const pending = new Map<string, PlanRow>();   // temp id of a row being created -> its plan row
  const out: PlanRow[] = [];
  rows.forEach((raw, i) => {
    const row = firstRow + i;
    const rawObj = Object.fromEntries(headers.map((h, c) => [h, raw[c]]));
    if (!raw.some((c) => !blank(c)) || mod.skipRow?.(rawObj)) return;
    const { rec, errors, warnings } = buildRecord(raw, headers, mapping, mod);
    if (errors.length) { out.push({ row, raw, action: "error", record: rec, errors, warnings }); return; }
    const m = policy === "create" ? null : idx.find(rec);
    if (!m) {
      const id = `__new${++tmp}`;
      const pr: PlanRow = { row, raw, action: "create", record: rec, errors, warnings };
      out.push(pr); pending.set(id, pr); idx.add({ ...rec, __tmp: id });
      return;
    }
    const inFile = m.hit.__tmp ? pending.get(m.hit.__tmp) : null;
    if (inFile) {
      // same business twice in the file: fold this row into the first one
      const add = patchFor(inFile.record, rec, "fill", mod);   // first row wins; later rows only fill its gaps
      Object.assign(inFile.record, add);
      out.push({ row, raw, action: "duplicate", record: rec, errors, warnings: [...warnings, `Same ${mod.noun} as row ${inFile.row} (${m.by}); merged into it`], matchedBy: m.by, matchName: inFile.record.name });
      return;
    }
    const base = { row, raw, record: rec, errors, warnings, matchId: m.hit.id, matchName: m.hit.name || m.hit.task || m.hit.bucket || m.hit.customer, matchedBy: m.by };
    if (policy === "skip") { out.push({ ...base, action: "duplicate" }); return; }
    const patch = patchFor(m.hit, rec, policy, mod);
    out.push({ ...base, action: Object.keys(patch).length ? "update" : "unchanged", patch });
    if (Object.keys(patch).length) Object.assign(m.hit, patch);      // later rows see the updated values
  });
  return out;
}

export const summarize = (plan: PlanRow[]) => {
  const c = { create: 0, update: 0, unchanged: 0, duplicate: 0, error: 0, warnings: 0 };
  plan.forEach((p) => { c[p.action]++; if (p.warnings.length) c.warnings++; });
  return c;
};

/* Existing rows with updates applied, plus the new records. `makeId` gives new rows their ids. */
export function applyPlan(existing: any[], plan: PlanRow[], mod: IoModule, makeId: () => string, now = Date.now()) {
  const patches = new Map<string, any>();
  plan.forEach((p) => { if (p.action === "update" && p.matchId) patches.set(p.matchId, { ...(patches.get(p.matchId) || {}), ...p.patch }); });
  const updated = existing.map((r) => (patches.has(r.id) ? { ...r, ...patches.get(r.id) } : r));
  const created = plan.filter((p) => p.action === "create").map((p, i) => ({ id: makeId(), ...mod.defaults, ...p.record, _o: now + i }));
  return [...updated, ...created];
}

export const ACTION_LABEL: Record<Action, string> = {
  create: "New", update: "Updated", unchanged: "No change", duplicate: "Skipped (duplicate)", error: "Not imported",
};
