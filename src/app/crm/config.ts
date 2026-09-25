import { today, uid } from "../../lib/core";

/*
 * One CRM, two pipelines. Suppliers and buyers share the same screens
 * (cards, contact sheet, call log, follow-ups, board); everything that
 * differs lives in a CrmConfig.
 */

export type CrmRecord = {
  id: string; name: string; area: string; phone: string; status: string; source?: string;
  contact?: string; email?: string; follow?: string; next?: string; notes?: string;
  lat?: number; lng?: number; pid?: string; [k: string]: any;
};

export type ContactLog = {
  // `supplierId` is the record id for buyers too (kept for existing synced logs).
  id: string; supplierId: string; date: string; type: string; outcome: string; note: string; by?: string; at?: number;
};

export type Field = { k: string; label: string; type?: string; inputMode?: "decimal" | "numeric"; placeholder?: string; half?: boolean; say?: string | ((r: CrmRecord) => string) };

export type CrmConfig = {
  kind: "sup" | "buy";
  noun: string;                          // "supplier" / "buyer"
  catKey: string;                        // field used for category chips
  defaultCat: string;
  stages: readonly string[];
  stageCol: Record<string, string>;
  closedStages: string[];                // no follow-ups needed
  freshStage: string;                    // "not contacted yet"
  wonStage: string;
  outcomes: string[];
  outcomeStage: Record<string, string>;  // outcome → stage it implies (forward only, except lost)
  lostStage: string;
  dealTitle: string;
  dealFields: Field[];
  detailFields: Field[];
  waMessage: (r: CrmRecord) => string;
  sortFresh?: (a: CrmRecord, b: CrmRecord) => number;
  badge?: (r: CrmRecord) => string | null;
  checklist?: Field[];                   // questions to answer on the call; answers are record fields
  script?: { open: (r: CrmRecord) => string; close: string; tips: string[] }; // call script wrapped around the checklist
  verify?: boolean;                      // show GSTIN / FSSAI verification
  tag?: (r: CrmRecord) => string | null; // small highlight on the card, e.g. "Call first"
};

export const answered = (cfg: CrmConfig, r: CrmRecord) => (cfg.checklist || []).filter((f) => String(r[f.k] ?? "").trim()).length;

export const LOG_TYPES = [
  { id: "call", label: "Call" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "visit", label: "Visit" },
  { id: "email", label: "Email" },
] as const;

export const FOLLOW_CHIPS: [string, number][] = [["Tomorrow", 1], ["3 days", 3], ["1 week", 7], ["2 weeks", 14]];
export const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export const newLog = (recordId: string, p: Partial<ContactLog>): ContactLog =>
  ({ id: uid(), supplierId: recordId, date: today(), type: "call", outcome: "", note: "", at: Date.now(), ...p });

export const isActive = (cfg: CrmConfig, s: string) => !cfg.closedStages.includes(s);

/* Next stage from a call outcome; never moves backwards except to "lost". */
export const stageAfter = (cfg: CrmConfig, cur: string, outcome: string) => {
  const want = cfg.outcomeStage[outcome];
  if (!want) return cur;
  if (want === cfg.lostStage) return want;
  return cfg.stages.indexOf(want) > cfg.stages.indexOf(cur) ? want : cur;
};

export const dueList = (cfg: CrmConfig, rows: CrmRecord[]) => {
  const t = today();
  return rows.filter((r) => isActive(cfg, r.status) && r.follow && r.follow <= t).sort((a, b) => a.follow.localeCompare(b.follow));
};

export const normalizeStage = (cfg: CrmConfig, s: string, legacy: Record<string, string> = {}) =>
  legacy[s] || (cfg.stages.includes(s) ? s : cfg.freshStage);
