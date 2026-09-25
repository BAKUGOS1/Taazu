import type { CrmConfig, CrmRecord } from "./config";

const COMMON_OUTCOMES = ["No answer", "Talked", "Call back later"];
const END_OUTCOMES = ["Not interested", "Wrong number"];

/* ---------------- suppliers ---------------- */
export const SUP_STAGES = ["To call", "Contacted", "Quote received", "Sample", "Negotiation", "Finalized", "Rejected"] as const;

export const SUPPLIER_CFG: CrmConfig = {
  kind: "sup",
  noun: "supplier",
  catKey: "cat",
  defaultCat: "Co-packer / bottler",
  stages: SUP_STAGES,
  stageCol: {
    "To call": "#64748B", Contacted: "#2563EB", "Quote received": "#4F46E5", Sample: "#D97706",
    Negotiation: "#DB2777", Finalized: "#16A34A", Rejected: "#DC2626",
  },
  closedStages: ["Finalized", "Rejected"],
  freshStage: "To call",
  wonStage: "Finalized",
  lostStage: "Rejected",
  outcomes: [...COMMON_OUTCOMES, "Quote shared", "Sample promised", ...END_OUTCOMES],
  outcomeStage: {
    Talked: "Contacted", "Call back later": "Contacted", "Quote shared": "Quote received",
    "Sample promised": "Sample", "Not interested": "Rejected",
  },
  dealTitle: "Quote",
  dealFields: [
    { k: "price", label: "₹ per unit", inputMode: "decimal", half: true },
    { k: "moq", label: "MOQ (units)", inputMode: "numeric", half: true },
    { k: "lead", label: "Lead time", placeholder: "e.g. 10 days", half: true },
    { k: "sampleCost", label: "Sample cost ₹", inputMode: "decimal", half: true },
    { k: "terms", label: "Payment terms", placeholder: "e.g. 50% advance, rest on delivery" },
  ],
  detailFields: [
    { k: "use", label: "What we need from them" },
  ],
  waMessage: (r) => {
    const ask: Record<string, string> = {
      "Co-packer / bottler": "250 ml PET mein electrolyte drink ki job-work / contract bottling ke liye MOQ, per-unit rate aur lead time bata sakte hain?",
      "Powder private label": "Electrolyte powder sachet private label ke liye MOQ, rate aur sample ka process bata sakte hain?",
      "PET bottles / caps": "250 ml PET bottle + cap ka rate, MOQ aur delivery time bata sakte hain?",
      "Labels & packaging": "250 ml bottle ke liye label / shrink sleeve ka rate aur MOQ bata sakte hain?",
      "Flavour / premix": "Electrolyte drink ke liye flavour / premix ka rate, MOQ aur sample mil sakta hai?",
      "Testing lab": "Packaged beverage ka FSSAI / NABL test ka charge aur report time bata sakte hain?",
    };
    return `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu (Ahmedabad) se baat kar raha hoon. Hum ek electrolyte drink launch kar rahe hain. ${ask[r.cat] || "Aapki service ke baare mein details bata sakte hain?"}`;
  },
  badge: (r) => (Number(r.price) > 0 ? `₹${r.price}/unit${r.moq ? ` · MOQ ${r.moq}` : ""}` : null),
};

/* ---------------- buyers ---------------- */
export const BUY_STAGES = ["New", "Contacted", "Meeting", "Trial", "Customer", "Lost"] as const;
const PRI_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

export const BUYER_CFG: CrmConfig = {
  kind: "buy",
  noun: "buyer",
  catKey: "seg",
  defaultCat: "Gym",
  stages: BUY_STAGES,
  stageCol: { New: "#64748B", Contacted: "#2563EB", Meeting: "#4F46E5", Trial: "#D97706", Customer: "#16A34A", Lost: "#DC2626" },
  closedStages: ["Customer", "Lost"],
  freshStage: "New",
  wonStage: "Customer",
  lostStage: "Lost",
  outcomes: [...COMMON_OUTCOMES, "Meeting fixed", "Sample given", "Order placed", ...END_OUTCOMES],
  outcomeStage: {
    Talked: "Contacted", "Call back later": "Contacted", "Meeting fixed": "Meeting",
    "Sample given": "Trial", "Order placed": "Customer", "Not interested": "Lost",
  },
  dealTitle: "Deal",
  dealFields: [
    { k: "qty", label: "Bottles / month", inputMode: "numeric", half: true },
    { k: "rate", label: "Our price ₹/unit", inputMode: "decimal", half: true },
    { k: "decision", label: "Decision maker", placeholder: "e.g. owner, HR, EHS head", half: true },
    { k: "start", label: "Can start", type: "date", half: true },
  ],
  detailFields: [
    { k: "why", label: "Why / angle" },
  ],
  waMessage: (r) => {
    const pitch: Record<string, string> = {
      Gym: "gym members ke liye 250 ml electrolyte drink (nimbu-namak / jeera) — counter pe rakhne ke liye free sample dena chahte hain.",
      "Box cricket / turf": "players ke liye thanda electrolyte drink — match ke time counter pe rakhne ke liye free sample dena chahte hain.",
      "Cricket academy": "practice ke baad bachchon ke liye electrolyte drink — ek batch ke liye free sample dena chahte hain.",
      Running: "runs ke liye hydration partner banna chahte hain — electrolyte drink ke free sample ke saath.",
      Construction: "garmi mein site workers ke liye electrolyte drink — heat-safety ke liye ek site pe trial karna chahte hain.",
      Factory: "shop floor workers ke liye electrolyte drink — garmi mein dehydration kam karne ke liye trial karna chahte hain.",
      "Canteen / facility partner": "aapke canteens ke liye electrolyte drink supply karna chahte hain — rate aur sample share kar sakte hain.",
      Events: "aapke events ke liye hydration station / electrolyte drink supply kar sakte hain — rate share kar sakte hain.",
    };
    return `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu (Ahmedabad) se. Hum local electrolyte drink bana rahe hain — ${pitch[r.seg] || "aapke liye electrolyte drink supply karna chahte hain."} 10 minute baat kar sakte hain?`;
  },
  sortFresh: (a: CrmRecord, b: CrmRecord) => (PRI_RANK[a.priority] ?? 3) - (PRI_RANK[b.priority] ?? 3),
  badge: (r) => {
    const q = Number(r.qty) || 0, p = Number(r.rate) || 0;
    const bits = [r.priority ? `Priority ${r.priority}` : "", q && p ? `₹${Math.round(q * p).toLocaleString("en-IN")}/mo` : q ? `${q}/mo` : ""].filter(Boolean);
    return bits.length ? bits.join(" · ") : null;
  },
};
