export const uid = () => Math.random().toString(36).slice(2, 9);
export const mk = (arr, keys, extra = {}) => arr.map((a) => { const o = { id: uid(), ...extra }; keys.forEach((k, i) => (o[k] = a[i] ?? "")); return o; });
export const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
export const today = () => new Date().toISOString().slice(0, 10);
export const telHref = (p) => { const d = (p || "").replace(/\D/g, ""); if (d.length < 8) return ""; return "tel:" + ((p || "").trim().startsWith("+") ? "+" + d : d); };
export const waHref = (p) => { let d = (p || "").replace(/\D/g, ""); if (d.length === 10 && /^[6-9]/.test(d)) d = "91" + d; return d.length === 12 && d.startsWith("91") && /^[6-9]/.test(d[2]) ? `https://wa.me/${d}` : ""; };

/* ---------------- map locations (lat, lng, Google place id) — Google Maps listings, Sep 2026 ---------------- */
export const GEO = {
  "Freshneer Foods & Services": [23.071129, 72.5284944, "ChIJD5GyOc44UIYR4_V_iZ60PkQ"],
  "Gandhi Beverages": [23.1039869, 72.6814259, "ChIJHYip1CmBXjkRbdNocbZx2jQ"],
  "Chill Baby Beverages": [22.9756902, 72.6022228, "ChIJvakiMx2FXjkRLaRefdTRTvM"],
  "Bhavani Corporation": [23.0253558, 72.6546142, "ChIJJ6GhdJWHXjkRE_xs6Vo35HI"],
  "Nexus Polyplast Pvt Ltd": [23.0994585, 72.4880264, "ChIJR9M9f-KcXjkRuCKRSkH_ZdQ"],
  "Mundal Polyplast Industries": [22.8995405, 72.4260486, "ChIJG70ZuCqEXjkRDvnbHXLUdS4"],
  "Siddhi Vinayak Plastics (Neo Plast)": [23.0929602, 72.6671286, "ChIJ47NAay2BXjkRQYLYugqL1NM"],
  "Shree Sudarshan Plast": [22.9170284, 72.5441205, "ChIJty6-ituPXjkRvPM29nOZsLk"],
  "Gunatit Label": [23.0398889, 72.6282201, "ChIJT7NnbAaHXjkRhcU7-cE7jaw"],
  "Raditap Labels India Pvt Ltd": [23.0387647, 72.700432, "ChIJKRXolm6HXjkRZ5Xf1OQ6wLc"],
  "Hynix Label": [23.0163587, 72.6726218, "ChIJfbP20XiHXjkRzDdqJS1PWLM"],
  "Vimalachal Print & Pack Pvt Ltd": [22.9167083, 72.4358925, "ChIJ_y913R-FXjkRs5ve1nnmdtA"],
  "Diya Packaging Pvt Ltd": [22.91564, 72.4289361, "ChIJ2aOAw0GRXjkRrHh3SljMdFQ"],
  "Bharat Essence": [22.9858323, 72.4918551, "ChIJqXgAk-maXjkRGM6dy0adVB8"],
  "Jalaram Essence Store": [23.0371554, 72.6142675, "ChIJG9j-ni-EXjkRPNN2_BNjJL0"],
  "Real Beverage": [22.9943218, 72.5801783, "ChIJVVVVVZGFXjkRT-Q9brAeq9s"],
  "Accurate Universal Laboratories": [23.0423756, 72.5959688, "ChIJVVVVhT-EXjkRnsNrKVJcSZA"],
  "Gujarat Test Lab Pvt Ltd": [23.0480868, 72.5889523, "ChIJj79D5A2EXjkRe0GbcDZZ20U"],
  "Hitechlab Healthcare & Research": [23.0750334, 72.5127839, "ChIJrQ9JdMicXjkRvQdfymOQB1c"],
  "CIS Laboratory": [23.0013645, 72.6362929, "ChIJc4Gi22qGXjkRQu_upiSDq3k"],
  "JAL Water Jar Supplier": [23.0462476, 72.5136825, "ChIJl2ijP1ebXjkRNlxOOo5aNlc"],
  "A K Marketing & Water Supplier": [23.1178638, 72.562761, "ChIJWz-qMfmCXjkRAAAAMJqx7C0"],
  "KP Water Treatment Pvt Ltd": [22.9751449, 72.6374233, "ChIJ-T3GeJyIXjkRPdVlDj4Pacw"],
  "Indian Ion Exchange & Chemicals": [23.0950668, 72.666424, "ChIJj9X7pNmAXjkRGeHuQGk8Fd4"],
  "Life Fitness Pro": [23.0144062, 72.5174999, "ChIJoYY7sdObXjkRlpMIKhHgx3c"],
  "Plus Fitness 24/7 Bodakdev": [23.0319193, 72.5111322, "ChIJBTvxzTebXjkRcBOLWIL4sfo"],
  "Plus Fitness 24/7 South Bopal": [23.0170296, 72.4767042, "ChIJVVVVlaabXjkRe8ec_smv2a0"],
  "SFW The Gym (South Bopal)": [23.0223172, 72.4719741, "ChIJyXfhLA-bXjkRPt_h1M10cyI"],
  "SFW The Gym (Satellite)": [23.0267782, 72.5092771, "ChIJRb36m3qbXjkRsThKSKvuxQ4"],
  "Zeus Fitness Point": [23.0117883, 72.511549, "ChIJSxHTrCmbXjkRcoAs1ADb0uk"],
  "HR Fitness": [23.0116563, 72.507001, "ChIJ81vB-YabXjkRFDTE-8KYP1o"],
  "Cult Gym Prahlad Nagar": [23.0117086, 72.5075304, "ChIJi9qgXxCbXjkRZ1rMAYIEyUY"],
  "Vala's Gym": [23.0190922, 72.5193049, "ChIJDwrf3iybXjkRatPSO8WuFlc"],
  "Monty's Fitness Studio": [23.0109476, 72.5071117, "ChIJNwQqBkSbXjkRy_5L6YSqd_k"],
  "Your Fitness Gym": [23.0167473, 72.4700258, "ChIJF8bjiXWbXjkRVul5BcYwWFU"],
  "MSD Gym Bopal": [23.031225, 72.4707939, "ChIJb5iGJwSbXjkRML9lXJapIL4"],
  "Be Fit The Gym": [23.0323817, 72.4688223, "ChIJlw7vlJ6bXjkRty3WWzPHlCQ"],
  "Gym Lounge Platinum": [23.0187759, 72.452703, "ChIJRVplKwCbXjkRo3RI2Q6Jqtk"],
  "Skye Box Cricket & Football Turf": [23.0102289, 72.4830506, "ChIJzTAF9EybXjkRZoKa3dPaYj4"],
  "Elite Sports 2.0": [23.1089831, 72.6096033, "ChIJP4EwiyuDXjkR_0r9tMKOIwU"],
  "Cric Bees Box Arena": [23.1113557, 72.502195, "ChIJ7eKstlSdXjkRnrg8S6oWPY8"],
  "7 Star Lords Turf": [23.0576155, 72.52282, "ChIJxXI8Z8ybXjkRGl3GLEs4Ddo"],
  "Box Cricket BCCA": [23.1177604, 72.6019583, "ChIJ_18ZjxeDXjkRUdeK58BhGJA"],
  "Huddle Arena": [23.1019545, 72.6047873, "ChIJ7b3g_QODXjkRGmEpAaXxSb4"],
  "Sunrise Cricket Academy": [23.0407651, 72.5472251, "ChIJ-1MHVvOFXjkRoqLZ9OtBAmA"],
  "Desire Cricket Academy": [23.0076839, 72.5044613, "ChIJwa2Ux3qbXjkRbIsp5qx5iPU"],
  "Ekana Cricket Academy": [22.9412213, 72.6085728, "ChIJbxo3TQCPXjkR2DM20Mdjbgk"],
  "Bhavani Cricket Academy": [23.0007222, 72.5975989, "ChIJn6GLPgCFXjkRMJrxrh_yTfY"],
  "Amdavad Distance Runners": [23.0446218, 72.5549801, "ChIJT88S1_SEXjkRdohG9XG7EN8"],
  "PSP Projects Ltd": [23.0249632, 72.5022384, "ChIJWSdQC9iaXjkRzvJ42rpOxSw"],
  "Safal Group (HN Safal House)": [23.0108129, 72.5027923, "ChIJKfuE0m6EXjkRLB-QrTyvbBI"],
  "A. Shridhar Group": [23.0521971, 72.4792366, "ChIJrYsOsvGdXjkRHR9mw1zVy7Q"],
  "Sun Builders Group": [23.0428625, 72.4836716, "ChIJN1AHQt-aXjkR4AA4ujbnrrs"],
  "Swati Procon": [23.013953, 72.4952576, "ChIJy5A4_EGbXjkR4MLT7QkJdFc"],
  "Satyam Developers Ltd": [23.0373577, 72.5039858, "ChIJ8_qnyIqEXjkRrcyftnum7Z0"],
  "Nishant Construction (Ratnaakar Group)": [23.013696, 72.517108, "ChIJpQPYriubXjkRZm3TRsk7b-0"],
  "HRG Construction Co.": [23.0259521, 72.5570091, "ChIJVbx2QfCEXjkROf7JTLNwbe0"],
  "ARB Buildcon Pvt Ltd": [23.1250734, 72.5390634, "ChIJUXWEowWDXjkR6mkMTuTNZTs"],
  "The Steefo Group": [22.9096387, 72.428949, "ChIJz6rjotWQXjkRZ1F9RIgEdd4"],
  "DeltaT Systems Pvt Ltd": [22.921246, 72.458051, "ChIJsz-BKiuRXjkRQ4BlutVcGG4"],
  "Changodar Industrial Estate (walk-in)": [22.9341875, 72.4523906, "ChIJx_PwKZWQXjkR3vXoU7NvoS8"],
  "Khushboo Foods & Hospitality LLP": [23.0379284, 72.5273317, "ChIJ89TgOLqFXjkRGCMutZfsRDk"],
  "Innovix Facility Management": [23.0274032, 72.5007744, "ChIJ_fSSXOSep40RCleRxio-B0I"],
  "Ariana Food (industrial catering)": [23.0716924, 72.5449159, "ChIJkbI2KzuDXjkRirrK1dEb1lQ"],
  "Canteen Connect": [23.0351947, 72.5622206, "ChIJy-VFIBT0ow8Rt8Xm7WgLRh0"],
  "Purohit Caterers": [23.0728025, 72.5334924, "ChIJL4C2nhGDXjkR9AMbNsBQftc"],
  "Maverick Management": [22.9973256, 72.502944, "ChIJoQOCCs-EXjkRQBBQ8QcS9Dw"],
  "ArtCore Event": [23.0426821, 72.5677288, "ChIJq_mdeIqEXjkRiBL13WCSdcQ"],
  "Pacific Events": [23.0093886, 72.5230268, "ChIJLyWWkcSbXjkRwfsFrZyReyE"],
  "Aum Event and Promotions": [23.0380713, 72.560156, "ChIJiddiM_OEXjkRUjixjZwNAzc"],
};
export const enrich = (rows) => rows.map((r) => { const g = GEO[r.name]; return g && !r.lat ? { ...r, lat: g[0], lng: g[1], pid: g[2] } : r; });
export const mapUrl = (r) => {
  if (r.lat && r.lng) return `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}${r.pid ? `&query_place_id=${r.pid}` : ""}`;
  if (r.name && r.area && r.area !== "India") return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.area} Gujarat`)}`;
  return "";
};

/* ---------------- suppliers (public listings, Sep 2026) ---------------- */
export const SUP_KEYS = ["cat", "name", "area", "phone", "use", "source", "gstin", "contact", "phone2", "email"];
export const SUPPLIERS = () => enrich(mk([
  ["Co-packer / bottler", "Parekh Enterprise (Hydr-Aid)", "Makarba, Ahmedabad", "080716 30391", "Already sells an electrolyte drink (₹30 packs) — ask to put the Taazu label on it", "parekhenterprise.net / IndiaMART", "24AFKPP1131N1ZD", "Hiten N Parekh"],
  ["Co-packer / bottler", "Saffron Beverages / Saffron Biotech", "C.G. Road, Ahmedabad", "+91 98985 32774", "Private-label functional & flavoured drinks; ask MOQ for 250 ml PET", "Research report / saffronbeverages.in"],
  ["Co-packer / bottler", "Clear Pani", "Changodar", "via ExportersIndia", "Packaged water 500 ml ₹8, MOQ 1,000; ask if they can dose your premix", "ExportersIndia"],
  ["Co-packer / bottler", "Patel Beverages Pvt Ltd", "Vadodara", "+91 79425 50890", "Contract water 200 ml–2 L PET; ask about flavour/electrolyte dosing", "IndiaMART"],
  ["Co-packer / bottler", "Skyocean", "Nikol, Ahmedabad", "+91 80445 66912", "Packaged water + empty bottles", "IndiaMART"],
  ["Co-packer / bottler", "Freshneer Foods & Services", "Chanakyapuri, Ahmedabad", "not listed", "Local packaged-water brand; ask about job-work", "Google Maps"],
  ["Co-packer / bottler", "Gandhi Beverages", "Naroda GIDC", "+91 73737 35436", "Beverage manufacturer; ask capabilities & licence categories", "Google Maps"],
  ["Co-packer / bottler", "Chill Baby Beverages", "Isanpur", "+91 76005 51314", "Local soft-drink maker; ask about job-work for still drinks", "Google Maps"],
  ["Co-packer / bottler", "Koladiya Industries (Asterin)", "Mangrol, Surat", "+91 79427 90651", "Functional drinks in cans; MOQ 10k–12.5k — get a benchmark quote", "IndiaMART / asterin.in", "24AAJCK4772F1ZG"],
  ["Co-packer / bottler", "Foodsure", "Noida (serves Gujarat)", "+91 81304 04757", "Formulation + contract manufacturing; 3,000+ units", "foodsure.co.in"],
  ["Co-packer / bottler", "Ayuray Organics", "Chandigarh (ships India)", "+91 70879 61144", "Electrolyte drink private label — RTD bottles, sachets, cans; ask MOQ", "ayurayorganics.com", "", "", "", "ayurayindia@gmail.com"],
  ["Powder private label", "SevenQ Nutrition", "India", "via sevenqnutrition.com", "Private-label electrolyte sachets (GMP, ISO 22000, FSSAI)", "Website"],
  ["Powder private label", "Biocruz Pharmaceuticals", "India", "via biocruz.in", "Third-party electrolyte powders & custom blends", "Website"],
  ["PET bottles / caps", "Bhavani Corporation", "Odhav GIDC", "+91 73596 32622", "PET bottles; semi & fully automatic lines", "Google Maps"],
  ["PET bottles / caps", "Nexus Polyplast Pvt Ltd", "Rakanpur, Kalol", "+91 63588 58262", "PET jars/bottles; reviews say small orders OK", "Google Maps"],
  ["PET bottles / caps", "Mundal Polyplast Industries", "Changodar", "+91 63555 02444", "Food-grade PET jars & containers", "Google Maps"],
  ["PET bottles / caps", "Siddhi Vinayak Plastics (Neo Plast)", "Naroda GIDC", "+91 70166 65283", "PET bottles, preforms, PP caps — mixed reviews: pay on delivery only", "Google Maps"],
  ["PET bottles / caps", "Shree Sudarshan Plast", "Pirana Rd, Ode", "not listed", "PET preforms", "Google Maps"],
  ["Labels & packaging", "Gunatit Label", "Bapunagar", "+91 99099 14588", "Bottle labels; a review mentions water-bottle brand labels", "Google Maps"],
  ["Labels & packaging", "Raditap Labels India Pvt Ltd", "Kathwada", "+91 99097 67405", "Labels + shrink sleeves", "Google Maps"],
  ["Labels & packaging", "Hynix Label", "Odhav", "+91 95129 59990", "Custom stickers & labels", "Google Maps"],
  ["Labels & packaging", "Vimalachal Print & Pack Pvt Ltd", "Changodar", "+91 79 2656 2643", "Printed laminates — for powder sachets later", "Google Maps"],
  ["Labels & packaging", "Diya Packaging Pvt Ltd", "Changodar", "+91 89802 56187", "Packaging; ask about cartons/shrink", "Google Maps"],
  ["Flavour / premix", "Bharat Essence", "Sarkhej", "+91 95373 38565", "Food essences & ingredients", "Google Maps"],
  ["Flavour / premix", "Jalaram Essence Store", "Saraspur", "+91 98986 50480", "Essences (wholesale)", "Google Maps"],
  ["Flavour / premix", "Real Beverage", "Danilimda", "+91 98989 17350", "Soda machines + flavours (if you ever make in-house)", "Google Maps"],
  ["Testing lab", "Accurate Universal Laboratories", "Madhupura", "+91 90330 44571", "Food & water testing; confirm NABL scope for beverages", "Google Maps"],
  ["Testing lab", "Gujarat Test Lab Pvt Ltd", "Madhavpura", "+91 79 2562 4821", "Food testing; mixed reviews on turnaround", "Google Maps"],
  ["Testing lab", "Hitechlab Healthcare & Research", "Sola", "+91 90999 71261", "Food & water tests; reviews mention good rates", "Google Maps"],
  ["Testing lab", "CIS Laboratory", "Amraiwadi", "+91 99788 89488", "New lab, NABL applied — check status first", "Google Maps"],
  ["Hydration station", "JAL Water Jar Supplier", "Thaltej", "+91 70437 51035", "20 L jars for stations", "Google Maps"],
  ["Hydration station", "A K Marketing & Water Supplier", "Chandkheda", "+91 80008 63925", "Event water supply, quick delivery", "Google Maps"],
  ["Future plant", "KP Water Treatment Pvt Ltd", "Vatva GIDC", "+91 98980 71071", "Turnkey bottled-water plants + branding help", "Google Maps"],
  ["Future plant", "Indian Ion Exchange & Chemicals", "Naroda GIDC", "+91 79 6777 0200", "Mineral-water plants & packaging machinery", "Google Maps"],
], SUP_KEYS, { status: "To call", moq: "", price: "", notes: "" }).map((r) => ({ ...r, id: seedId(r.name) })));
/* Stable ids so the same starter supplier added on two phones is one record. */
export const seedId = (name) => "sup-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------------- buyers / leads ---------------- */
export const BUY_KEYS = ["seg", "name", "area", "phone", "why", "priority", "source"];
export const BUYERS = () => enrich(mk([
  ["Gym", "Life Fitness Pro", "Prahladnagar", "not listed", "1,000+ reviews, busy gym", "A", "Google Maps"],
  ["Gym", "Plus Fitness 24/7 Bodakdev", "Bodakdev", "+91 75750 29999", "24/7 gym, 1,100+ reviews", "A", "Google Maps"],
  ["Gym", "Plus Fitness 24/7 South Bopal", "South Bopal", "+91 75750 89999", "Same chain — pitch both together", "A", "Google Maps"],
  ["Gym", "SFW The Gym (South Bopal)", "South Bopal", "+91 88499 46869", "1,100+ reviews; already serves coffee to members", "A", "Google Maps"],
  ["Gym", "SFW The Gym (Satellite)", "Satellite", "not listed", "Same brand as above", "B", "Google Maps"],
  ["Gym", "Zeus Fitness Point", "Prahlad Nagar", "+91 70432 06020", "Open 5am–11pm, long hours = more sales", "A", "Google Maps"],
  ["Gym", "HR Fitness", "Prahlad Nagar", "+91 99984 18413", "Well-rated, mid-size", "B", "Google Maps"],
  ["Gym", "Cult Gym Prahlad Nagar", "Prahlad Nagar", "+91 484 439 5366", "Chain — needs central approval", "C", "Google Maps"],
  ["Gym", "Vala's Gym", "Jodhpur Village", "+91 98790 27779", "Owner-run", "B", "Google Maps"],
  ["Gym", "Monty's Fitness Studio", "Prahladnagar", "+91 90999 12191", "Zumba studio — sweaty classes", "B", "Google Maps"],
  ["Gym", "Your Fitness Gym", "South Bopal", "+91 88664 72928", "Owner is a bodybuilder — trainer influence", "B", "Google Maps"],
  ["Gym", "MSD Gym Bopal", "Central Bopal", "+91 99749 69676", "Large gym with Zumba studio", "A", "Google Maps"],
  ["Gym", "Be Fit The Gym", "Bopal", "+91 96380 95380", "Well-rated", "B", "Google Maps"],
  ["Gym", "Gym Lounge Platinum", "South Bopal", "+91 99099 57154", "Reviews mention AC issues = hot gym", "C", "Google Maps"],
  ["Box cricket / turf", "Skye Box Cricket & Football Turf", "Mumatpura", "+91 91060 06621", "Hosts corporate tournaments — great sampling", "A", "Google Maps"],
  ["Box cricket / turf", "Elite Sports 2.0", "Motera", "+91 90546 68710", "Open 24h, has a café counter", "A", "Google Maps"],
  ["Box cricket / turf", "Cric Bees Box Arena", "Ognaj", "+91 95653 07307", "Friendly owner per reviews", "B", "Google Maps"],
  ["Box cricket / turf", "7 Star Lords Turf", "Thaltej", "+91 81073 99670", "Inside a sports academy", "B", "Google Maps"],
  ["Box cricket / turf", "Box Cricket BCCA", "Chandkheda", "+91 98258 53063", "Reviews: players bring own water", "B", "Google Maps"],
  ["Box cricket / turf", "Huddle Arena", "Motera", "+91 72278 90684", "Booked via Playo", "C", "Google Maps"],
  ["Cricket academy", "Sunrise Cricket Academy", "Gujarat University", "+91 98240 22757", "Morning + evening batches", "B", "Google Maps"],
  ["Cricket academy", "Desire Cricket Academy", "Prahlad Nagar", "+91 74900 39934", "Kids' coaching — parents buy", "B", "Google Maps"],
  ["Cricket academy", "Ekana Cricket Academy", "Vatva", "+91 72020 69855", "Near industrial belt", "B", "Google Maps"],
  ["Cricket academy", "Bhavani Cricket Academy", "Maninagar", "+91 92659 96205", "Match exposure programmes", "C", "Google Maps"],
  ["Running", "Amdavad Distance Runners", "Navrangpura", "not listed", "Described as the city's largest running club", "A", "Google Maps"],
  ["Running", "Adani Ahmedabad Marathon (29 Nov 2026)", "Sabarmati Riverfront", "@AhmdMarathon (X)", "Pitch hydration-partner / stall", "A", "Research report"],
  ["Construction", "PSP Projects Ltd", "Ambli Rd", "+91 79 2693 6200", "Large contractor (Riverfront, Surat Diamond Bourse) — ask for EHS/safety head", "A", "Google Maps"],
  ["Construction", "Safal Group (HN Safal House)", "Prahlad Nagar", "+91 79 4080 0800", "Big developer; building also hosts IT offices", "A", "Google Maps"],
  ["Construction", "A. Shridhar Group", "Shilaj", "+91 83063 33777", "Active residential projects", "B", "Google Maps"],
  ["Construction", "Sun Builders Group", "Bodakdev", "+91 81288 28888", "Many live sites", "B", "Google Maps"],
  ["Construction", "Swati Procon", "Mumatpura", "+91 98988 00400", "Active projects (Shela etc.)", "B", "Google Maps"],
  ["Construction", "Satyam Developers Ltd", "Thaltej", "+91 99099 83100", "Developer", "C", "Google Maps"],
  ["Construction", "Nishant Construction (Ratnaakar Group)", "Satellite", "+91 79 2693 3158", "Developer", "C", "Google Maps"],
  ["Construction", "HRG Construction Co.", "Ellisbridge", "+91 99787 93795", "Luxury developer", "C", "Google Maps"],
  ["Construction", "ARB Buildcon Pvt Ltd", "Near Nirma Univ.", "+91 78383 12548", "EPC / PEB contractor, pan-India sites", "B", "Google Maps"],
  ["Factory", "The Steefo Group", "Changodar", "+91 98240 76873", "Steel rolling mills — very hot shop floors", "A", "Google Maps"],
  ["Factory", "DeltaT Systems Pvt Ltd", "Changodar", "not listed", "HVAC manufacturer", "C", "Google Maps"],
  ["Factory", "Changodar Industrial Estate (walk-in)", "Changodar", "—", "Walk the estate; ask each gate for HR/admin", "A", "Google Maps"],
  ["Canteen / facility partner", "Khushboo Foods & Hospitality LLP", "Vastrapur", "+91 84608 03993", "Runs factory canteens — distribution partner", "A", "Google Maps"],
  ["Canteen / facility partner", "Innovix Facility Management", "Ambli–Bopal", "+91 97259 84004", "Manages canteen/accommodation at Dholera project sites", "A", "Google Maps"],
  ["Canteen / facility partner", "Ariana Food (industrial catering)", "Ghatlodiya", "+91 94278 02040", "Industrial canteen caterer", "B", "Google Maps"],
  ["Canteen / facility partner", "Canteen Connect", "Navrangpura", "+91 91739 00820", "Corporate canteens", "B", "Google Maps"],
  ["Canteen / facility partner", "Purohit Caterers", "Ghatlodiya", "not listed", "Corporate canteen services", "C", "Google Maps"],
  ["Events", "Maverick Management", "Makarba", "+91 98249 96648", "Corporate events & dealer meets", "A", "Google Maps"],
  ["Events", "ArtCore Event", "Usmanpura", "+91 77780 66999", "Events & exhibitions", "B", "Google Maps"],
  ["Events", "Pacific Events", "Prahlad Nagar", "+91 84879 89345", "Event planner", "C", "Google Maps"],
  ["Events", "Aum Event and Promotions", "Navrangpura", "+91 98240 27387", "Weddings & conferences", "C", "Google Maps"],
], BUY_KEYS, { status: "New", next: "", follow: "", notes: "" }));

export const TASKS = () => mk([
  ["Week 1", "Apply FSSAI basic registration on FoSCoS (₹100)", "2026-09-30"],
  ["Week 1", "Udyam registration (free)", "2026-09-30"],
  ["Week 1", "CA call: HSN + GST rate for bottle / nimbu drink / powder", "2026-09-30"],
  ["Week 1", "Call 10 co-packers with the script; fill Suppliers", "2026-09-30"],
  ["Week 1", "Visit 5 gyms + 2 sites — listen only, note answers", "2026-09-30"],
  ["Week 1", "Shortlist 3 brand names; search IP India, class 32", "2026-09-30"],
  ["Week 2", "Buy dispensers, cups, premix for stations", "2026-10-07"],
  ["Week 2", "Book 1–2 garba / running-group spots", "2026-10-07"],
  ["Week 2", "Prepare 2–3 flavours for blind tasting", "2026-10-07"],
  ["Week 2", "Print survey card + QR", "2026-10-07"],
  ["Navratri", "Run stations; sell cups ₹10–20; log in Sales", "2026-10-19"],
  ["Navratri", "Collect 300+ survey replies", "2026-10-19"],
  ["Late Oct", "Check the 4 pilot gates", "2026-10-31"],
  ["Late Oct", "Decide format: bottle / nimbu drink / powder", "2026-10-31"],
  ["Late Oct", "Get 3 written co-packer quotes", "2026-10-31"],
  ["Late Oct", "File trademark (₹4,500)", "2026-10-31"],
  ["November", "Pitch Ahmedabad Marathon hydration stall (29 Nov)", "2026-11-15"],
  ["November", "Label design brief", "2026-11-30"],
  ["Dec–Jan", "GST + Legal Metrology registration", "2027-01-15"],
  ["Dec–Jan", "NABL test of co-packer sample", "2027-01-20"],
  ["Dec–Jan", "Pitch sites & factories for Mar–Jun contracts", "2027-01-31"],
  ["February", "Bottle pilot batch (~15 Feb)", "2027-02-15"],
], ["phase", "task", "due"], { status: "To do", notes: "" });

export const BUDGET = () => mk([
  ["Demand validation (stations, premix, cups)", 10000],
  ["Registrations (Udyam, GST, FSSAI, LM, trademark)", 8000],
  ["Tax certainty (CA opinion)", 4000],
  ["NABL lab test", 7000],
  ["Label design + print", 6000],
  ["Pilot production (~1,300 × 250 ml)", 17000],
  ["Freight & samples", 3000],
], ["bucket", "planned"], { actual: 0, notes: "" });

export const BRANDS = [
  { name: "RANN", meaning: "Rann of Kutch — Gujarat's salt desert; also 'battle' in Hindi", why: "Short, bold, local salt story; works for bottle, nimbu drink and powder", risk: "Low–Med", pick: "Top pick", top: true },
  { name: "JalKavach", meaning: "'Water shield' (Jal + Kavach)", why: "Fits B2B heat-safety kits; easy in Gujarati/Hindi", risk: "Med (Kavach is common)", pick: "Best for B2B", top: true },
  { name: "Taazu", meaning: "Gujarati for 'fresh' (તાજું)", why: "Friendly and local; good for gyms & events", risk: "Low–Med", pick: "Strong local" },
  { name: "Chhaya", meaning: "'Shade' — relief from the sun", why: "Calm, cooling, family-friendly", risk: "Med (common word)", pick: "Soft option" },
  { name: "GarmiGuard", meaning: "'Heat guard'", why: "Clear benefit; good for workers", risk: "Med (descriptive)", pick: "Clear but generic" },
  { name: "Thandak", meaning: "'Coolness'", why: "Emotional, easy to say", risk: "High (widely used)", pick: "Risky" },
  { name: "Parsevo", meaning: "Gujarati for 'sweat' (પરસેવો)", why: "Honest, memorable Amdavadi humour", risk: "Low", pick: "Bold" },
  { name: "Salt & Sun", meaning: "English, gym-friendly", why: "Premium feel for urban gyms", risk: "Med", pick: "Urban premium" },
];

/* ---------------- config ---------------- */
export const SUP_STATUS = ["To call", "Contacted", "Quote received", "Sample", "Negotiation", "Finalized", "Rejected"];
export const BUY_STATUS = ["New", "Contacted", "Meeting", "Trial", "Customer", "Lost"];
export const STATUS_COL = {
  New: "#64748B", Contacted: "#2563EB", Meeting: "#4F46E5", Trial: "#D97706", Customer: "#16A34A", Lost: "#DC2626",
  "To call": "#64748B", Called: "#2563EB", "Quote received": "#4F46E5", Sample: "#D97706", Selected: "#16A34A", Rejected: "#DC2626",
  Negotiation: "#DB2777", Finalized: "#16A34A",
};
export const COL = {
  "Co-packer / bottler": "#E4572E", "Powder private label": "#B45309", "PET bottles / caps": "#7C3AED", "Labels & packaging": "#DB2777",
  "Flavour / premix": "#CA8A04", "Testing lab": "#0891B2", "Hydration station": "#2563EB", "Future plant": "#6B7280",
  Gym: "#16A34A", "Box cricket / turf": "#65A30D", "Cricket academy": "#059669", Running: "#0EA5E9", Construction: "#EA580C",
  Factory: "#DC2626", "Canteen / facility partner": "#9333EA", Events: "#F59E0B",
};
export const SEGS = ["Gym", "Runner", "Cricket", "Worker", "Garba", "Office", "Other"];
export const FLAVOURS = ["Nimbu-namak", "Jeera", "Kokum", "Aam panna", "Other"];
export const PAYS = ["₹50", "₹30", "₹20", "₹10", "None"];

export const supCols = [
  { k: "cat", l: "Category", w: 140 }, { k: "name", l: "Supplier", w: 200 }, { k: "area", l: "Area", w: 120 }, { k: "_act", l: "Contact", w: 84, t: "link" }, { k: "phone", l: "Phone", w: 130 },
  { k: "use", l: "What for", w: 240 }, { k: "status", l: "Status", w: 120, t: "select", o: SUP_STATUS }, { k: "moq", l: "MOQ", w: 70, t: "number" },
  { k: "price", l: "₹/unit", w: 70, t: "number" }, { k: "notes", l: "Notes", w: 180 }, { k: "source", l: "Source", w: 120 },
];
export const buyCols = [
  { k: "seg", l: "Segment", w: 140 }, { k: "name", l: "Business", w: 200 }, { k: "area", l: "Area", w: 110 }, { k: "_act", l: "Contact", w: 84, t: "link" }, { k: "phone", l: "Phone", w: 130 },
  { k: "why", l: "Why / angle", w: 220 }, { k: "priority", l: "Pri", w: 55, t: "select", o: ["A", "B", "C"] }, { k: "status", l: "Status", w: 110, t: "select", o: BUY_STATUS },
  { k: "next", l: "Next step", w: 160 }, { k: "follow", l: "Follow-up", w: 130, t: "date" }, { k: "notes", l: "Notes", w: 170 }, { k: "source", l: "Source", w: 100 },
];
export const taskCols = [
  { k: "phase", l: "Phase", w: 90 }, { k: "task", l: "Task", w: 360 }, { k: "due", l: "Due", w: 130, t: "date" },
  { k: "status", l: "Status", w: 100, t: "select", o: ["To do", "Doing", "Done"] }, { k: "notes", l: "Notes", w: 220 },
];
export const budCols = [
  { k: "bucket", l: "Bucket", w: 300 }, { k: "planned", l: "Planned ₹", w: 100, t: "number" }, { k: "actual", l: "Actual ₹", w: 100, t: "number" },
  { k: "_var", l: "Left ₹", w: 90, calc: (r) => (Number(r.planned) || 0) - (Number(r.actual) || 0) }, { k: "notes", l: "Notes", w: 220 },
];
export const saleCols = [
  { k: "date", l: "Date", w: 130, t: "date" }, { k: "customer", l: "Customer", w: 180 }, { k: "product", l: "Product", w: 140 },
  { k: "qty", l: "Qty", w: 70, t: "number" }, { k: "rate", l: "Rate ₹", w: 80, t: "number" }, { k: "_amt", l: "Amount ₹", w: 90, calc: (r) => (Number(r.qty) || 0) * (Number(r.rate) || 0) },
  { k: "paid", l: "Paid?", w: 80, t: "select", o: ["No", "Yes"] }, { k: "notes", l: "Notes", w: 180 },
];
export const survCols = [
  { k: "date", l: "Date", w: 130, t: "date" }, { k: "venue", l: "Venue", w: 150 },
  { k: "segment", l: "Who", w: 110, t: "select", o: SEGS }, { k: "flavour", l: "Best flavour", w: 120, t: "select", o: FLAVOURS },
  { k: "pay", l: "Would pay (250 ml)", w: 140, t: "select", o: PAYS }, { k: "comment", l: "Comment", w: 260 },
];

/* City for filtering: the record's own city, else read from the area text (most starter rows are Ahmedabad GIDCs). */
const OTHER_CITIES = ["Vadodara", "Surat", "Rajkot", "Anand", "Mehsana", "Gandhinagar", "Noida", "Chandigarh", "Mumbai", "Delhi", "Pune", "Hyderabad", "Bengaluru", "Indore", "Jaipur"];
export const cityOf = (r) => {
  if (r.city) return r.city;
  const a = String(r.area || "");
  const hit = OTHER_CITIES.find((c) => a.toLowerCase().includes(c.toLowerCase()));
  return hit || (a && a !== "India" ? "Ahmedabad" : "India-wide");
};

/* Bring an existing team's supplier list up to the current starter data without touching their notes:
 * fill blank GSTIN / contact / alt-number fields, re-file Parekh as a co-packer, and add new starter suppliers. */
export const upgradeSuppliers = (rows) => {
  const seed = SUPPLIERS();
  const byName = new Map<string, any>(seed.map((s: any) => [s.name, s]));
  const out = rows.map((r) => {
    const name = r.name === "Parekh Enterprise" ? "Parekh Enterprise (Hydr-Aid)" : r.name;
    const s = byName.get(name);
    if (!s) return r;
    const fill = Object.fromEntries(["gstin", "contact", "phone2", "email"].filter((k) => s[k] && !r[k]).map((k) => [k, s[k]]));
    const moved = name !== r.name ? { name, cat: s.cat, use: s.use, source: s.source } : {};
    return Object.keys(fill).length || moved.name ? { ...r, ...moved, ...fill } : r;
  });
  const have = new Set(out.map((r) => r.name));
  return [...out, ...seed.filter((s) => !have.has(s.name) && !rows.some((r) => r.id === s.id))];
};
