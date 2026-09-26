import type { CrmConfig, CrmRecord, T } from "./config";

const COMMON_OUTCOMES = ["No answer", "Talked", "Call back later"];
const END_OUTCOMES = ["Not interested", "Wrong number"];

/* ---------------- suppliers ---------------- */
// Tier 1 already make electrolyte / functional drinks; Tier 2 are local bottlers who might dose our premix.
const TIER1 = new Set(["Parekh Enterprise (Hydr-Aid)", "Saffron Beverages / Saffron Biotech", "Koladiya Industries (Asterin)", "Ayuray Organics", "Foodsure", "Radius Healthcare Private Limited", "Mbitions Foods & Nutrients Pvt. Ltd."]);
const TIER2 = new Set(["Gandhi Beverages", "Chill Baby Beverages", "Patel Beverages Pvt Ltd", "Umiya Beverages", "Pharmaco Healthcare", "Zeel Beverages"]);
// Step 2 of the call script, by supplier category.
export const NEED: Record<string, T> = {
  "Co-packer / bottler": { en: "Do you already make an electrolyte / sports drink? Can you make it in a 250 ml bottle with our Taazu label?", hi: "Kya aap electrolyte / sports drink banate hain? Hamare Taazu label ke saath 250 ml bottle mein bana sakte hain?" },
  "Powder private label": { en: "Can you make electrolyte powder sachets under our Taazu brand?", hi: "Kya aap electrolyte powder sachet hamare Taazu brand ke naam se bana sakte hain?" },
  "PET bottles / caps": { en: "We need food-grade 250 ml PET bottles and caps — can you supply small quantities?", hi: "Hamein 250 ml PET bottle aur cap chahiye — food-grade, chhote order mein de sakte hain?" },
  "Labels & packaging": { en: "We need printed labels / shrink sleeves for a 250 ml bottle — our design, your printing.", hi: "Hamein 250 ml bottle ke liye printed label / shrink sleeve chahiye — design hamara hoga, printing aapki." },
  "Flavour / premix": { en: "We need flavour / premix for an electrolyte drink — lemon, jeera and similar. Can you supply it?", hi: "Hamein electrolyte drink ke liye flavour / premix chahiye — nimbu, jeera jaise — de sakte hain?" },
  "Testing lab": { en: "We need an FSSAI / NABL test for a packaged drink — nutrition, micro, sodium-potassium. Can you do it?", hi: "Hamein packaged drink ka FSSAI / NABL test karwana hai — nutrition, micro, sodium-potassium — kar sakte hain?" },
  "Hydration station": { en: "We need 20 L water jars / dispensers for events, with delivery. Can you supply them?", hi: "Hamein events ke liye 20 L water jars / dispensers chahiye — delivery ke saath de sakte hain?" },
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
  dealTitle: "Quote & order",
  dealFields: [],
  detailFields: [
    { k: "use", label: "What we need from them" },
  ],
  // One call script for every supplier type (Tasks -> Script); only the "what we need" line changes with the category.
  script: {
    open: (r, lang) => lang === "hi"
      ? `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu, Ahmedabad se bol raha hoon. Hum apna electrolyte drink brand launch kar rahe hain aur suppliers se baat kar rahe hain. 2 minute baat kar sakte hain?`
      : `Hello${r.contact ? " " + r.contact : ""}, this is [your name] from Taazu, Ahmedabad. We're launching our own electrolyte drink brand and speaking to suppliers. Do you have 2 minutes?`,
    close: { en: "Thank you! Could you WhatsApp me your rates, MOQ and catalogue? Can we get a sample? I'll follow up on [day].", hi: "Thank you! Rate, MOQ aur catalogue WhatsApp pe bhej dijiye. Sample mil sakta hai? Main [din] ko follow-up karta hoon." },
    tips: [
      { en: "Ask for the owner or sales head. If you get reception, take a name and direct number.", hi: "Owner ya sales head se baat karo. Receptionist ho to naam aur direct number maang lo." },
      { en: "Always ask for the all-in rate: product + packing + delivery; GST separate.", hi: "Rate hamesha all-in poochho: product + packing + delivery; GST alag." },
      { en: "Busy? Fix a callback time and log 'Call back later' on the supplier card.", hi: "Busy hain? Callback ka time fix karo aur supplier card mein 'Call back later' log karo." },
      { en: "Don't agree to a rate on the call. Say: we're comparing 3-4 quotes and will get back.", hi: "Rate pe haan-na abhi mat karo. Bolo: 3-4 quotes le rahe hain, compare karke batayenge." },
    ],
  },
  // Quote & order fields on the supplier card; `say` is the matching line in Tasks → Script.
  checklist: [
    { k: "price", label: "Rate ₹/unit (all-in)", say: { en: "What is the final per-unit rate, all-in? GST separate.", hi: "Per unit final rate kya hoga — sab milake, GST alag?" }, inputMode: "decimal", placeholder: "e.g. 13", half: true },
    { k: "moq", label: "MOQ (units)", say: { en: "What is the minimum quantity for the first order?", hi: "Pehla order minimum kitna hona chahiye?" }, inputMode: "numeric", placeholder: "e.g. 1000", half: true },
    { k: "lead", label: "Delivery time", say: { en: "How many days from order confirmation to delivery?", hi: "Order confirm hone ke baad kitne din mein delivery?" }, placeholder: "e.g. 10 days", half: true },
    { k: "terms", label: "Payment terms", say: { en: "What are the payment terms — how much advance, balance when?", hi: "Payment kaise — kitna advance, baaki kab?" }, placeholder: "e.g. 50% advance", half: true },
    { k: "sampleCost", label: "Sample ₹", say: { en: "Can we get a sample? What does it cost?", hi: "Sample mil sakta hai? Kitne ka?" }, inputMode: "decimal", placeholder: "0 = free", half: true },
    { k: "q_lab", label: "Test report?", say: { en: "Do you have a quality certificate or lab test report?", hi: "Quality ka koi certificate ya test report hai?" }, placeholder: "Yes / No", half: true },
    { k: "orderQty", label: "Our order qty", inputMode: "numeric", placeholder: "when we order", half: true },
    { k: "orderDate", label: "Order date", type: "date", half: true },
    { k: "q_label", label: "What they offer / can they do it?", placeholder: "e.g. Yes – nimbu & orange, 250 ml, our label" },
    { k: "gstin", label: "GSTIN", say: { en: "Could you share your GSTIN for billing?", hi: "Aapka GSTIN number bata dijiye, bill ke liye chahiye." }, placeholder: "24ABCDE1234F1Z5", half: true },
    { k: "fssai", label: "FSSAI no.", say: { en: "If it is a food product — what is your FSSAI licence number?", hi: "Food product hai to — aapka FSSAI licence number?" }, inputMode: "numeric", placeholder: "14-digit, if food", half: true },
  ],
  verify: true,
  tag: (r) => (TIER1.has(r.name) ? "Call first" : null),
  sortFresh: (a, b) => tierOf(a) - tierOf(b),
  waMessage: (r, lang) => {
    const need = NEED[r.cat] ? NEED[r.cat][lang] : { en: "Could you share details of what you supply, with rates?", hi: "Aapki service ke baare mein details aur rate bata sakte hain?" }[lang];
    const ids = { en: "Please also share your GSTIN and FSSAI number.", hi: "Apna GSTIN aur FSSAI number bhi share kar dijiye." }[lang];
    return lang === "hi"
      ? `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu (Ahmedabad) se baat kar raha hoon. Hum apna electrolyte drink brand launch kar rahe hain. ${need} MOQ, rate aur delivery time bata dijiye. ${ids}`
      : `Hello${r.contact ? " " + r.contact : ""}, this is Taazu from Ahmedabad. We are launching our own electrolyte drink brand. ${need} Please share your MOQ, rate and delivery time. ${ids}`;
  },
  badge: (r) => (Number(r.price) > 0 ? `₹${r.price}/unit${r.moq ? ` · MOQ ${r.moq}` : ""}` : null),
};

/* ---------------- buyers ---------------- */
// Line 2 of the buyer call: open with the problem this kind of buyer already feels.
export const HOOK: Record<string, T> = {
  Gym: { en: "Your members lose sodium and potassium in sweat, not just water — that's the cramps and the post-workout crash. A chilled Taazu at your counter fixes that, and you earn on every bottle.", hi: "Members paseene mein sirf paani nahi, sodium aur potassium bhi khote hain — isliye cramps aur workout ke baad thakaan. Counter pe chilled Taazu — aur har bottle pe aapka margin." },
  "Box cricket / turf": { en: "After an hour in the heat, players' energy drops. Keep Taazu chilled at the counter — players buy it themselves, you keep the margin.", hi: "Garmi mein ek ghante ke baad players ki energy girti hai. Counter pe thanda Taazu rakho — player khud khareedenge, margin aapka." },
  "Cricket academy": { en: "Kids practise 2–3 hours in the sun. Parents like seeing that the academy takes hydration seriously.", hi: "Bachche dhoop mein 2–3 ghante practice karte hain. Parents ko achha lagta hai ki academy hydration ka dhyan rakhti hai." },
  Running: { en: "On long runs, water alone can dilute your sodium. We'd like to be your group's hydration partner.", hi: "Long run mein sirf paani se sodium kam ho sakta hai. Hum aapke group ke hydration partner banna chahte hain." },
  Construction: { en: "Ahmedabad's Heat Action Plan names outdoor workers as high-risk. We run a March–June weekly hydration supply with a usage log for your safety file.", hi: "AMC ka Heat Action Plan outdoor workers ko high-risk kehta hai. Hum March–June weekly hydration supply dete hain, safety file ke liye usage log ke saath." },
  Factory: { en: "On a hot shop floor, output and safety both dip in the afternoon. Weekly Taazu delivery, one monthly bill.", hi: "Garam shop floor pe dopahar mein output aur safety dono girte hain. Weekly Taazu delivery, ek monthly bill." },
  "Canteen / facility partner": { en: "A summer hydration add-on for your clients — margin for you, reach for us. Can we trial it in one canteen?", hi: "Aapke clients ke liye summer hydration add-on — aapko margin, humein reach. Ek canteen mein trial karein?" },
  Events: { en: "A Taazu hydration station or chilled bottles at your events — something new for guests, extra revenue for you.", hi: "Aapke events pe Taazu hydration station ya chilled bottles — guests ke liye naya, aapke liye extra revenue." },
  Office: { en: "A healthier pantry option — a low-sugar electrolyte drink instead of soda. One week free trial?", hi: "Pantry ke liye healthy option — soda ki jagah kam-sugar electrolyte drink. Ek hafta free trial?" },
};
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
  dealFields: [],
  // One buyer call script (Buyers → Pitch); line 2 changes with the segment (HOOK).
  script: {
    open: (r, lang) => lang === "hi"
      ? `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu se bol raha hoon — Ahmedabad ka apna electrolyte drink. 2 minute baat kar sakte hain?`
      : `Hello${r.contact ? " " + r.contact : ""}, this is [your name] from Taazu — Ahmedabad's own electrolyte drink. Do you have 2 minutes?`,
    close: {
      en: "We'll drop a free crate of 24 chilled bottles for one week. If it sells, we deliver every Monday — one bill, no credit. Which day suits you for the sample?",
      hi: "Hum ek hafte ke liye 24 chilled bottle ka free crate chhod dete hain. Bike to har Monday delivery — ek bill, no credit. Sample kis din drop karein?",
    },
    tips: [
      { en: "Ask for the owner / HR / admin head — the person who decides. Take their name and direct number.", hi: "Owner / HR / admin head se baat karo — jo decide karta hai. Naam aur direct number le lo." },
      { en: "Call gyms and turfs late morning to afternoon (off-peak). Call sites and factories 10–12 am.", hi: "Gym aur turf ko 11 se 4 ke beech call karo (off-peak). Site aur factory ko 10–12 baje." },
      { en: "Lead with their problem (heat, cramps, tired workers), not with the product.", hi: "Pehle unki problem bolo (garmi, cramps, thake workers), product baad mein." },
      { en: "Never say ORS, cure or medicine. Say: electrolyte drink, low sugar.", hi: "ORS, ilaaj ya dawai kabhi mat bolna. Bolo: electrolyte drink, kam sugar." },
    ],
  },
  checklist: [
    { k: "decision", label: "Decision maker", say: { en: "Who decides on drinks / supplies here?", hi: "Yahan drinks / supplies ka decision kaun leta hai?" }, placeholder: "Owner, HR, EHS head", half: true },
    { k: "people", label: "People / day", say: { en: "Roughly how many people (members / workers / players) a day?", hi: "Roz lagbhag kitne log aate hain — members / workers / players?" }, inputMode: "numeric", placeholder: "e.g. 150", half: true },
    { k: "now", label: "What they use now", say: { en: "What do they drink now — plain water, Glucon-D, ORS, cold drinks?", hi: "Abhi kya peete hain — sirf paani, Glucon-D, ORS, cold drink?" }, placeholder: "Water, Glucon-D, nothing…" },
    { k: "qty", label: "Bottles / month", say: { en: "If they like it, how many bottles a week could you use?", hi: "Pasand aaye to hafte mein kitni bottle lag sakti hain?" }, inputMode: "numeric", half: true },
    { k: "rate", label: "Our price ₹/unit", say: { en: "Our price is ₹__ per bottle; you sell at ₹30. Does that work?", hi: "Hamara rate ₹__ per bottle hai, aap ₹30 mein bechoge. Chalega?" }, inputMode: "decimal", half: true },
    { k: "sampleDay", label: "Sample drop day", placeholder: "e.g. Mon 11 am", half: true },
    { k: "start", label: "Can start", type: "date", half: true },
  ],
  detailFields: [
    { k: "why", label: "Why / angle" },
  ],
  waMessage: (r, lang) => {
    const pitch: Record<string, T> = {
      Gym: { en: "a 250 ml electrolyte drink (lemon-salt / jeera) for your members — we'd like to leave a free sample crate at your counter.", hi: "gym members ke liye 250 ml electrolyte drink (nimbu-namak / jeera) — counter pe rakhne ke liye free sample dena chahte hain." },
      "Box cricket / turf": { en: "a chilled electrolyte drink for players — we'd like to leave free samples at your counter for match time.", hi: "players ke liye thanda electrolyte drink — match ke time counter pe rakhne ke liye free sample dena chahte hain." },
      "Cricket academy": { en: "an electrolyte drink for kids after practice — we'd like to give one batch a free sample.", hi: "practice ke baad bachchon ke liye electrolyte drink — ek batch ke liye free sample dena chahte hain." },
      Running: { en: "we'd like to be your hydration partner for runs, with free samples of our electrolyte drink.", hi: "runs ke liye hydration partner banna chahte hain — electrolyte drink ke free sample ke saath." },
      Construction: { en: "an electrolyte drink for site workers in the heat — we'd like to run a heat-safety trial at one site.", hi: "garmi mein site workers ke liye electrolyte drink — heat-safety ke liye ek site pe trial karna chahte hain." },
      Factory: { en: "an electrolyte drink for shop-floor workers to cut dehydration in summer — we'd like to run a trial.", hi: "shop floor workers ke liye electrolyte drink — garmi mein dehydration kam karne ke liye trial karna chahte hain." },
      "Canteen / facility partner": { en: "we'd like to supply an electrolyte drink to your canteens — happy to share rates and a sample.", hi: "aapke canteens ke liye electrolyte drink supply karna chahte hain — rate aur sample share kar sakte hain." },
      Events: { en: "we can run a hydration station / supply electrolyte drinks for your events — happy to share rates.", hi: "aapke events ke liye hydration station / electrolyte drink supply kar sakte hain — rate share kar sakte hain." },
    };
    const p = pitch[r.seg]?.[lang] || { en: "we'd like to supply our electrolyte drink to you.", hi: "aapke liye electrolyte drink supply karna chahte hain." }[lang];
    return lang === "hi"
      ? `Namaste${r.contact ? " " + r.contact + " ji" : ""}, main Taazu (Ahmedabad) se. Hum local electrolyte drink bana rahe hain — ${p} 10 minute baat kar sakte hain?`
      : `Hello${r.contact ? " " + r.contact : ""}, this is Taazu from Ahmedabad. We make a local electrolyte drink — ${p} Could we talk for 10 minutes?`;
  },
  sortFresh: (a: CrmRecord, b: CrmRecord) => (PRI_RANK[a.priority] ?? 3) - (PRI_RANK[b.priority] ?? 3),
  badge: (r) => {
    const q = Number(r.qty) || 0, p = Number(r.rate) || 0;
    const bits = [r.priority ? `Priority ${r.priority}` : "", q && p ? `₹${Math.round(q * p).toLocaleString("en-IN")}/mo` : q ? `${q}/mo` : ""].filter(Boolean);
    return bits.length ? bits.join(" · ") : null;
  },
};
