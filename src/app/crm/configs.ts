import type { CrmConfig, CrmRecord } from "./config";

const COMMON_OUTCOMES = ["No answer", "Talked", "Call back later"];
const END_OUTCOMES = ["Not interested", "Wrong number"];

/* ---------------- suppliers ---------------- */
// Tier 1 already make electrolyte / functional drinks; Tier 2 are local bottlers who might dose our premix.
const TIER1 = new Set(["Parekh Enterprise (Hydr-Aid)", "Saffron Beverages / Saffron Biotech", "Koladiya Industries (Asterin)", "Ayuray Organics", "Foodsure"]);
const TIER2 = new Set(["Gandhi Beverages", "Chill Baby Beverages", "Patel Beverages Pvt Ltd"]);
// Step 2 of the call script, by supplier category.
const NEED: Record<string, string> = {
  "Co-packer / bottler": "Kya aap electrolyte / sports drink banate hain? Hamare Taazu label ke saath 250 ml bottle mein bana sakte hain?",
  "Powder private label": "Kya aap electrolyte powder sachet hamare Taazu brand ke naam se bana sakte hain?",
  "PET bottles / caps": "Hamein 250 ml PET bottle aur cap chahiye — food-grade, chhote order mein de sakte hain?",
  "Labels & packaging": "Hamein 250 ml bottle ke liye printed label / shrink sleeve chahiye — design hamara hoga, printing aapki.",
  "Flavour / premix": "Hamein electrolyte drink ke liye flavour / premix chahiye — nimbu, jeera jaise — de sakte hain?",
  "Testing lab": "Hamein packaged drink ka FSSAI / NABL test karwana hai — nutrition, micro, sodium-potassium — kar sakte hain?",
  "Hydration station": "Hamein events ke liye 20 L water jars / dispensers chahiye — delivery ke saath de sakte hain?",
};
const tierOf = (r: CrmRecord) => (TIER1.has(r.name) ? 0 : TIER2.has(r.name) ? 1 : r.cat === "Co-packer / bottler" ? 2 : 3);
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
  dealFields: [],
  detailFields: [
    { k: "use", label: "What we need from them" },
  ],
  // Ask these on the first call, in this order. Price / MOQ / lead feed the Compare tab.
  // One call script for every supplier type — only the "what we need" line changes with the category.
  // Answers save to the record; price / MOQ / lead feed the Compare tab.
  script: {
    open: (r) => `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu, Ahmedabad se bol raha hoon. Hum apna electrolyte drink brand launch kar rahe hain aur suppliers se baat kar rahe hain. 2 minute baat kar sakte hain?`,
    close: "Thank you! Rate, MOQ aur catalogue WhatsApp pe bhej dijiye. Sample mil sakta hai? Main [din] ko follow-up karta hoon.",
    tips: [
      "Owner ya sales head se baat karo. Receptionist ho to naam aur direct number maang lo.",
      "Rate hamesha all-in poochho: product + packing + delivery; GST alag.",
      "Busy hain? Callback ka time fix karo aur neeche 'Call back later' log karo.",
      "Rate pe haan-na abhi mat karo. Bolo: 3-4 quotes le rahe hain, compare karke batayenge.",
    ],
  },
  checklist: [
    { k: "q_label", label: "Can they do it? (product / details)", say: (r) => NEED[r.cat] || "Hamein aapka product / service chahiye — aap kya kya provide karte hain?", placeholder: "Yes / No + what they offer" },
    { k: "moq", label: "Minimum order", say: "Pehla order minimum kitna hona chahiye?", inputMode: "numeric", placeholder: "e.g. 1000", half: true },
    { k: "price", label: "₹ per unit, all-in", say: "Per unit final rate kya hoga — sab milake, GST alag?", inputMode: "decimal", placeholder: "e.g. 13", half: true },
    { k: "lead", label: "Days to deliver", say: "Order confirm hone ke baad kitne din mein delivery?", placeholder: "e.g. 10 days", half: true },
    { k: "q_lab", label: "Quality proof / report?", say: "Quality ka koi certificate ya test report hai?", placeholder: "Yes / No", half: true },
    { k: "terms", label: "Payment terms", say: "Payment kaise — kitna advance, baaki kab?", placeholder: "e.g. 50% advance", half: true },
    { k: "sampleCost", label: "Sample cost ₹", say: "Sample mil sakta hai? Kitne ka?", inputMode: "decimal", placeholder: "0 = free", half: true },
    { k: "gstin", label: "GSTIN", say: "Aapka GSTIN number bata dijiye, bill ke liye chahiye.", placeholder: "24ABCDE1234F1Z5", half: true },
    { k: "fssai", label: "FSSAI no. (food suppliers)", say: "Food product hai to — aapka FSSAI licence number?", inputMode: "numeric", placeholder: "14-digit, if food", half: true },
  ],
  verify: true,
  tag: (r) => (TIER1.has(r.name) ? "Call first" : null),
  sortFresh: (a, b) => tierOf(a) - tierOf(b),
  waMessage: (r) => {
    const ask: Record<string, string> = {
      "Co-packer / bottler": "kya aap apna electrolyte drink hamare Taazu label ke saath 250 ml PET mein bana sakte hain? MOQ, per-bottle rate aur dispatch time bata dijiye. Apna GSTIN aur FSSAI number bhi share kar dijiye.",
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
