import { today, uid } from "../../lib/core";

/* Supplier pipeline. Order matters: it is the left-to-right flow on the board. */
export const STAGES = ["To call", "Contacted", "Quote received", "Sample", "Negotiation", "Finalized", "Rejected"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_COL: Record<string, string> = {
  "To call": "#64748B", Contacted: "#2563EB", "Quote received": "#4F46E5", Sample: "#D97706",
  Negotiation: "#DB2777", Finalized: "#16A34A", Rejected: "#DC2626",
};

/* Stages where the supplier is still in play and should get follow-ups. */
export const ACTIVE = (s: string) => s !== "Finalized" && s !== "Rejected";

/* Old status names from v1 of the app. */
const LEGACY: Record<string, Stage> = { Called: "Contacted", Selected: "Finalized" };
export const normalizeStage = (s: string): Stage => (LEGACY[s] || (STAGES.includes(s as Stage) ? s : "To call")) as Stage;

export const LOG_TYPES = [
  { id: "call", label: "Call" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "visit", label: "Visit" },
  { id: "email", label: "Email" },
] as const;

export const OUTCOMES = ["No answer", "Talked", "Call back later", "Quote shared", "Sample promised", "Not interested", "Wrong number"];

/* Quick follow-up offsets, in days. */
export const FOLLOW_CHIPS: [string, number][] = [["Tomorrow", 1], ["3 days", 3], ["1 week", 7], ["2 weeks", 14]];
export const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export type Supplier = {
  id: string; cat: string; name: string; area: string; phone: string; use: string; source: string;
  status: string; contact?: string; email?: string;
  follow?: string; next?: string;
  moq?: string | number; price?: string | number; lead?: string; terms?: string; sampleCost?: string | number;
  notes?: string; lat?: number; lng?: number; pid?: string;
};

export type ContactLog = {
  id: string; supplierId: string; date: string; type: string; outcome: string; note: string; by?: string; at?: number;
};

export const newLog = (supplierId: string, p: Partial<ContactLog>): ContactLog =>
  ({ id: uid(), supplierId, date: today(), type: "call", outcome: "", note: "", at: Date.now(), ...p });

/* Suggest the next stage from a call outcome, never moving backwards. */
export const stageAfter = (cur: string, outcome: string): string => {
  const want: Record<string, Stage> = {
    "Talked": "Contacted", "Call back later": "Contacted", "Quote shared": "Quote received",
    "Sample promised": "Sample", "Not interested": "Rejected",
  };
  const w = want[outcome];
  if (!w) return cur;
  if (w === "Rejected") return w;
  return STAGES.indexOf(w) > STAGES.indexOf(cur as Stage) ? w : cur;
};

/* Every supplier whose follow-up is due today or earlier, plus fresh ones never contacted. */
export const dueList = (rows: Supplier[]) => {
  const t = today();
  return rows
    .filter((r) => ACTIVE(r.status) && r.follow && r.follow <= t)
    .sort((a, b) => a.follow.localeCompare(b.follow));
};

/* WhatsApp opener. Short, polite, Hinglish — what a supplier in Ahmedabad actually replies to. */
export const waMessage = (r: Supplier) => {
  const ask: Record<string, string> = {
    "Co-packer / bottler": "250 ml PET mein electrolyte drink ki job-work / contract bottling ke liye MOQ, per-unit rate aur lead time bata sakte hain?",
    "Powder private label": "Electrolyte powder sachet private label ke liye MOQ, rate aur sample ka process bata sakte hain?",
    "PET bottles / caps": "250 ml PET bottle + cap ka rate, MOQ aur delivery time bata sakte hain?",
    "Labels & packaging": "250 ml bottle ke liye label / shrink sleeve ka rate aur MOQ bata sakte hain?",
    "Flavour / premix": "Electrolyte drink ke liye flavour / premix ka rate, MOQ aur sample mil sakta hai?",
    "Testing lab": "Packaged beverage ka FSSAI / NABL test ka charge aur report time bata sakte hain?",
  };
  return `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu (Ahmedabad) se baat kar raha hoon. Hum ek electrolyte drink launch kar rahe hain. ${ask[r.cat] || "Aapki service ke baare mein details bata sakte hain?"}`;
};

/* Landed per-unit number used by the pilot gate and the compare view. */
export const unitPrice = (r: Supplier) => { const p = Number(r.price); return p > 0 ? p : null; };
