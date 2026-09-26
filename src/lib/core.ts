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
export const SUP_KEYS = ["cat", "name", "area", "phone", "use", "source", "gstin", "contact", "phone2", "email", "city", "fssai"];
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
  /* researched 26 Sep 2026 from IndiaMART / company sites / JustDial — GSTINs still to be checked on the GST portal */
  ["Co-packer / bottler", "Energy Beverages Pvt. Ltd.", "Unit 19, Shubhlaxmi Industrial Estate, Village Moraiya, Sarkhej-Bavla Rd, Changodar", "+91 8048035231", "Packaged/mineral water manufacturer (ISO 22000) offering private branding at Changodar GIDC — ask if they run a PET filling line that can do still electrolyte drink job work, not just water. · ⚠ confirm number/GSTIN on call", "https://www.indiamart.com/energy-beverages/aboutus.html — GSTIN shown GST-verified on IndiaMART; phone from JustDial listing", "24AABCE5372K1ZL", "", "", "", "Sanand (Changodar GIDC)", ""],
  ["Co-packer / bottler", "Pharmaco Healthcare", "Plot No 31, Road No 5/A, Kathwada GIDC, Kathwada", "+91 9429288648", "WHO-GMP/ISO 22000 manufacturer already making a bottled soft drink brand (APOLLO Salty Lemon) plus energy/electrolyte supplement powders at Kathwada GIDC — ask if they can co-pack a still 250ml PET electrolyte drink. · ⚠ confirm number/GSTIN on call", "https://www.exportersindia.com/pharmaco-healthcare/about-us.htm — GSTIN listed on GST lookup site (gst.iadv.io); phone via JustDial/ExportersIndia listing", "24AAVFP3168P1ZC", "", "+91 9106571453", "pharmacohealthcare@gmail.com", "Ahmedabad", ""],
  ["Co-packer / bottler", "Umiya Beverages", "Brinda Estate, 37, Opp BSNL Office, GIDC Chhatral, Kalol - 382729, Gandhinagar dist.", "+91 8047625307", "Carbonated soft drink (Meet brand) manufacturer at Kalol GIDC since 2015 — ask if their line can run a still (non-carbonated) 250ml PET electrolyte SKU as job work.", "https://www.indiamart.com/proddetail/soda-carbonated-soft-drink-set-2851302851148.html — Phone and GSTIN shown directly on IndiaMART product/seller page", "24EOSPP2671N2Z2", "", "4447", "", "Kalol", ""],
  ["Co-packer / bottler", "Zeel Beverages", "Ahmedabad (exact plot not published)", "+91 8043827144", "Manufactures soda, mango juice (200/300ml bottles) and fruit beer under 'I Zeel' brand — juice-drink filling line is closest analog to a still electrolyte drink; ask about PET filling capability and MOQ.", "https://m.indiamart.com/zeelbeverages — GSTIN + phone shown on IndiaMART company page", "24AADFZ4624L1ZX", "Deepak Rajpurohit (CEO)", "1614", "", "Ahmedabad", ""],
  ["Co-packer / bottler", "Shri Gajanand Gruh Udhyog", "Ahmedabad (exact plot not published)", "+91 8048269924", "TrustSEAL-verified small manufacturer of Rockfizz soda/jeera soda — small-batch bottler, ask about non-carbonated electrolyte job work and MOQ. · ⚠ confirm number/GSTIN on call", "https://www.indiamart.com/proddetail/rockfizz-jeera-soda-2851068251462.html — TrustSEAL verified on IndiaMART; phone shown on product page", "", "", "", "", "Ahmedabad", ""],
  ["Co-packer / bottler", "Tauhid Enterprise", "Shop No 2 & 4, Opp Gulistan Masjid, Behind Royal Akbar Tower, Juhapura, Ahmedabad-380055", "+91 7943440077", "TrustSEAL-verified maker of Milda carbonated soft drink and PET-bottled juice (Frooti-type mango drink) — has PET bottling line, ask about still electrolyte job work. · ⚠ confirm number/GSTIN on call", "https://www.indiamart.com/tauhid-enterprise-ahmedabad/carbonated-soft-drink.html — TrustSEAL verified on IndiaMART; phone found on IndiaMART bottled-water directory listing for same company name/city (medium confidence it's the same entity)", "", "", "", "", "Ahmedabad", ""],
  ["Co-packer / bottler", "J T Beverages", "Dhrangdhra, Surendranagar district, Gujarat", "+91 7949371276", "TrustSEAL manufacturer of soft drinks and mango juice in PET bottles — outside Ahmedabad but rest-of-Gujarat option with juice-filling experience relevant to electrolyte drinks.", "https://m.indiamart.com/jtbeverages/profile.html — GSTIN and phone shown directly on IndiaMART company page, TrustSEAL 4.4/5 (100 reviews)", "24ABNPU3895K1ZS", "A. Ughreja (Owner)", "", "", "Surendranagar", ""],
  ["Co-packer / bottler", "Force India Beverages", "402, North Building, Twin Star Complex, Near Nana Mava Circle, 150 Ft Ring Road, Rajkot-360003", "+91 8048266689", "TrustSEAL manufacturer (140 reviews) of carbonated soft drinks, fruit beverages and club soda under 'Power Punch' brand — established bottler outside Ahmedabad, ask about still electrolyte job work and MOQ.", "https://dir.indiamart.com/ahmedabad/carbonated-soft-drink.html — TrustSEAL verified, phone shown on IndiaMART directory listing", "", "", "", "", "Rajkot", ""],
  ["Co-packer / bottler", "Radius Healthcare Private Limited", "4th Floor, 403, Mauryansh Elanza, B/H Parekh Hospital, Shyamal Cross Road, Ahmedabad-380015", "+91 7942713745", "TrustSEAL manufacturer of 'Radiplex Bolt' — a ready electrolyte energy drink with dextrose, zinc, vitamin C and probiotics — closest product-match co-packer found; ask directly about 250ml PET still electrolyte job work and MOQ.", "https://dir.indiamart.com/ahmedabad/energy-drink.html — TrustSEAL verified on IndiaMART; phone shown on IndiaMART directory listing", "", "", "", "", "Ahmedabad", ""],
  ["Co-packer / bottler", "UBM Pharmaceuticals", "Gota, Ahmedabad", "+91 7942963786", "Pharma/nutraceutical manufacturer making 'Truevita Z' energy booster drink — ask if they have a liquid PET filling line (vs. only powder/sachet) for a still electrolyte drink. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/energy-drink.html — GSTIN shown on IndiaMART profile; phone shown on IndiaMART directory listing", "24AVMPR2814C1ZR", "", "", "", "Ahmedabad", ""],
  ["Co-packer / bottler", "Mbitions Foods & Nutrients Pvt. Ltd.", "159 Shivam Industrial Park, Chacharwadi-Vasna, Ta. Sanand, Dist. Ahmedabad-382213 (office: Vastrapur, Ahmedabad)", "+91 9825051502", "Manufactures 'Love Shots' plant-based natural sports/hydration drink at its own Sanand plant — direct functional-beverage bottler in the priority GIDC belt; ask about private-label job work for a still electrolyte SKU. · ⚠ confirm number/GSTIN on call", "https://www.indiamart.com/mbitionsfoods-nutrients/energy-drink.html — Plant address confirmed via foodbevg.com listing; phone from IndiaMART distribution-inquiry line", "", "", "", "", "Sanand", ""],
  ["Co-packer / bottler", "Aquapop Bottlers", "Jhajjar, Haryana (near KMP Expressway, Delhi NCR)", "+91 9910605390", "India-wide (Delhi NCR) contract bottler explicitly offering electrolyte/hydration and sports drinks plus juices and functional drinks on high-speed PET/glass lines — strong India-wide backup if Gujarat GIDC co-packers can't take a small first order.", "https://aquapopbottlers.com/ — Phone numbers and named contacts shown directly on company website", "", "Himanshu Gupta (CEO); Piyush Gupta", "+91 9667788087", "Aquapopbottlers1@gmail.com", "Jhajjar", ""],
  ["Co-packer / bottler", "Biocruz Pharmaceuticals Private Limited", "SCO 133, Sector 14, Panchkula, Haryana-134113", "+91 7626908999", "India-wide third-party/private-label electrolyte POWDER manufacturer (not a liquid bottler) — useful only if Taazu also wants an ORS-powder SKU alongside the bottled drink; confirm they can refer/partner with a liquid co-packer. · ⚠ confirm number/GSTIN on call", "https://www.biocruz.in/blogs/electrolyte-powder-manufacturer-in-india/ — GSTIN and phone shown on IndiaMART/company profile", "06AAICB2537J1ZO", "", "", "", "Panchkula", ""],
  ["Powder private label", "Ahem Lifecare LLP", "Ahmedabad", "+91 8047664868", "Third-party manufacturer of dextrose+electrolyte+vitamin C+zinc sachets already listed as 'third party manufacturing' at ~Rs150/kg; ask for food (FSSAI) route, plain flavour/MOQ, and per-sachet pricing at Taazu's target sachet size.", "https://www.indiamart.com/proddetail/dextrose-with-vitamin-c-zinc-electrolytes-lactobacillus-sachet-23997517591.html — IndiaMART product page shows GST-verified supplier profile with phone and GSTIN.", "24ABTFA5135G1ZF", "", "", "", "Ahmedabad", ""],
  ["Powder private label", "Nexlife Bioscience Private Limited", "Ahmedabad", "+91 8048267163", "Positions itself as a third-party manufacturer dealing in bulk for electrolyte/hydration effervescent tablets; ask if they also do powder sachets and their FSSAI food license status.", "https://www.indiamart.com/proddetail/electrolyte-and-hydration-effervescent-tablets-25723161212.html — IndiaMART product page, GST-verified supplier with phone and GSTIN shown.", "24AAICN2660A1ZX", "", "", "", "Ahmedabad", ""],
  ["Powder private label", "Leo Nutriscience LLP", "Village Vasna Rathod, Nr Power Grid, Dahegam, Gandhinagar", "+91 8046030797", "Nutraceutical manufacturer offering effervescent tablets, energy drink, multivitamin lines incl. dextrose+electrolyte+vitamin C sachets; ask about food-grade electrolyte powder private label and MOQ.", "https://www.indiamart.com/leonutriscience/profile.html — GSTIN cross-checked on piceapp.com GST search; phone found via web search of company profile.", "24AAIFL0403G1ZW", "", "", "", "Ahmedabad (Dahegam, Gandhinagar)", ""],
  ["Powder private label", "Nulite Formulation", "163/F Sahitya Estate, Bakrol Bujrang, Kuha, Daskroi", "+91 79905 67933", "Third-party manufacturer of Electrolyte & Hydration Effervescent Tablets, Electrolyte+Vitamin C Effervescent Tablets and other nutraceutical tablets; ask if they can do powder sachets (not just tablets) and MOQ for own-brand launch.", "https://www.nuliteformulation.com/dietary-supplements.html — Company website + IndiaMART profile confirm GSTIN, CEO name, and multiple phone numbers listed on their own site/directory.", "24AAUFN0557B1ZD", "Akash Virdiya (CEO)", "+91 76007 66108 / 08045814495", "", "Ahmedabad", ""],
  ["Powder private label", "Calibro Nutrasciences", "Ground Floor 36/A Shreenaath Industrial Estate, Near Nana Chiloda RingRoad Rly Crossing, Ranasan", "+91 6354513196", "Manufacturer/trader of effervescent tablets, protein powder, gummies; ask specifically about electrolyte powder sachets private label and FSSAI licensing (food, not pharma). · ⚠ confirm number/GSTIN on call", "https://www.indiamart.com/calibronutrasciences/effervescent-tablets.html — IndiaMART supplier profile (GST badge, 71% response, 6 yrs); phone/email confirmed via calibronutrasciences.com and web search.", "", "R Patel (Owner)", "", "info@calibronutrasciences.com", "Ahmedabad", ""],
  ["Powder private label", "Nutraway Healthcare", "B-89 Kailash Industrial Estate, Near Sardar Patel Ind. Estate, Odhav", "+91 8071931817", "FSSAI-licensed nutraceutical manufacturer explicitly offering electrolyte powder in sachet AND stick-pack formats with custom formulation; strong first call for powder private label.", "https://www.indiamart.com/nutraway-healthcare/nutraceutical-products.html — IndiaMART profile (13 yrs, 85% response, 4.2/5-58 reviews) shows FSSAI/WHO-GMP claims; phone and GSTIN found via web search/GST lookup.", "24BLZPP2233F1ZW", "Kautil Patel (Proprietor)", "", "", "Ahmedabad", "WHO-GMP/ISO 9001:2015 cert, FSSAI licensed (per listing)"],
  ["Powder private label", "RITS Lifesciences Private Limited", "81-84 Jay Maa Kali Estate, Olpad-Sayan Road, Olpad", "+91 8046079425", "Trader/manufacturer of electrolyte effervescent tablets and nutraceuticals, also lists an instant beverage premix product line; a two-in-one call for both categories.", "https://www.indiamart.com/ritshealthcare/profile.html — IndiaMART profile with GSTIN and phone confirmed via web search of listing.", "24AAKCR2154D1ZO", "", "", "", "Surat", ""],
  ["Powder private label", "Nutra Healthcare Private Limited", "Block No 117-120, Om Industrial Estate-2, Kamrej, Mankna", "+91 79 4266 1507", "Manufacturer offering electrolyte effervescent tablet, biotin effervescent tablet and third-party health-supplement manufacturing; ask about powder sachet format and FSSAI food license.", "https://www.nutrahealthcare.com/effervescent-tablets.html — Company website + GST lookup confirm GSTIN and Surat factory address; phone confirmed via web search.", "24AAICN0244J1ZM", "", "", "", "Surat", ""],
  ["Powder private label", "Higer Health Sciences LLP", "Plot No.20, Nandore Village, Palghar Manor Road", "+91 8071791313", "India-wide (non-Gujarat) option: dedicated 'Electrolyte Energy Drink' manufacturer plus stevia/sucralose sweeteners and instant coconut water powder; useful if Gujarat cluster can't meet timeline or MOQ.", "https://www.higerhealth.co.in/contact-us.html — Company contact page lists phone numbers directly; GSTIN confirmed via web search of company listing.", "27AAMFH0675A1ZK", "Sonar Parikh (Director)", "+91 8045804641 (WhatsApp)", "", "Palghar (Maharashtra, near Mumbai)", ""],
  ["Flavour / premix", "Mangalam Enterprise", "Ahmedabad", "+91 7942832190", "Manufacturer of instant drink premix powder, herbal extracts, natural food colors and liquid flavour seasonings since 2014; ask about electrolyte-flavour premix (lemon/orange/tropical) and small-batch trial runs.", "https://www.indiamart.com/mangalamenterprise-ahmedabad/ — IndiaMART supplier profile (12 yrs member, 4.5/5-129 reviews, IEC listed); phone confirmed via web search.", "24BWJPK6909A1ZQ", "Dhaval Kumar (CEO)", "", "", "Ahmedabad", ""],
  ["Flavour / premix", "Pruthvi's Foods Pvt Ltd", "No.1 Pruthvi House, Near Sanjeevani Hospital Rd, Paldi", "+91 79 2665 0175", "Established 1992 manufacturer of maltodextrin, dextrose, starches and liquid flavour concentrates (food grade) — a raw-ingredient/flavour-concentrate supplier rather than finished-product private label; ask about supplying flavour concentrate + carrier (maltodextrin/dextrose) for Taazu's own powder blend.", "https://www.pruthvisfoods.com/liquid-flavors.html — Company website plus IndiaMART profile confirm GSTIN and address; phone/email found via web search of company records.", "24AAACP9364M1ZZ", "Rahul Shah (Marketing Manager)", "+91 98254 14511", "info@pruthvifoods.com", "Ahmedabad", ""],
  ["PET bottles / caps", "Kee Pet Containers (Adeshwar Containers)", "Kalol GIDC", "+91 79 4256 5598", "PET bottles & jars (pharma/cosmetic/F&B), 45+ bottle variants incl. small sizes - ask about 250/500ml beverage PET bottle tooling and MOQ", "https://www.adeshwarcontainers.com/ — Confirmed phone, GSTIN, contact person, and product range on company website", "24AAEFK8509N1ZZ", "Kumar Shah (CEO)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Topcap Industries LLP", "Naroda GIDC", "+91 80 4820 0758", "28mm PCO long neck caps (100ml-1L bottles) ~Rs0.70/pc; also manufactures PET bottles - ask for small-lot 1000-5000 pcs pricing", "https://www.indiamart.com/proddetail/28mm-pco-long-neck-bottle-cap-2852727423997.html — IndiaMART listing shows GSTIN, phone, price/MOQ, GST registration date 2022, exports to multiple countries", "24AATFT2325G1Z4", "", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Veeglow Industries Pvt Ltd (Cap & Closure)", "Changodar (near Sanand)", "+91 80 4547 6034", "Flip top caps, 24/20mm caps Rs0.55-3.55/pc, MOQ 2500-50000 - ask for 28mm PCO/sports cap options for beverage bottles", "https://www.capandclosure.com/contact-us.html — Confirmed phone numbers, GSTIN, contact person and address on company website; cross-checked via IndiaMART listing", "24AAHCV6812F1ZE", "Deepak Mishra (GM Sales & Marketing)", "+91 90234 27553", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Satyam Plastic", "Odhav (Shivam Estate)", "+91 79 4254 8440", "28mm flip top / screw bottle caps, sanitizer/beverage caps ~Rs2.50/pc, MOQ 50000 (ask to negotiate lower for trial order)", "https://www.indiamart.com/satyamplasticahmedabad/profile.html — Confirmed phone, owner name, address, and product line via IndiaMART profile", "", "Pankaj Mangaloria (Owner)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Dhiren Plastic Industries", "Naroda GIDC", "+91 80 4769 4919", "Plastic/flip-top caps, 60mm sports bottle caps, PET jar caps - established 1986, ask about 28mm PCO caps for beverage bottles", "https://www.dhirenplastic.com/ — Confirmed phone, GSTIN, owner name, address (No.12-B Phase 3 Naroda) on company website", "24ACOPS3431R1ZX", "Mitesh Sheth (Owner)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Prutha Packaging Pvt Ltd", "Naroda", "+91 80 4778 4430", "Flip top caps 20-28mm ~Rs2/pc - ask specifically about 28mm PCO beverage caps and small lot pricing", "https://www.pruthapack.com/plastic-cap.html — Confirmed phone, GSTIN, contact person, address on company website", "24AADCP2445A1Z1", "Digant Patel (Director)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "A-One Pet Industries", "Changodar/Sanand (opp. Changodar Bus Stop)", "+91 98256 89711", "Fridge bottles, PET jars, plastic caps - established 2006 - ask if they make 250/500ml beverage PET bottles or only fridge bottles", "https://www.indiamart.com/a-onepetindustries-ahmedabad/profile.html — Confirmed GSTIN and profile on IndiaMART; phone numbers found via Justdial/web listings for same company", "24ACCPP5417C1Z1", "Kiran Patel (Proprietor)", "+91 73832 35151", "", "Ahmedabad", ""],
  ["PET bottles / caps", "S.K. Packaging & Polymers", "Khodiyarnagar", "+91 79 4255 7011", "28mm water bottle seal caps (PET, tamper evident) Rs0.25/pc, MOQ 10,000 - ask for smaller trial MOQ", "https://www.skpacks.in/alaska-beverage-caps.html — Confirmed phone, GSTIN, director name, price/MOQ on company website", "24EGSPB3479J1ZY", "Aditya Rajput (Director)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Sanblue Plastic Industries", "Bakrol-Dhamatvan", "+91 79 4253 5539", "PET preforms (32mm etc.), flip top/ROPP/PCO caps, push-pull sports caps ~Rs2.5/pc - ask about 250/500ml preform+cap combo for beverage line", "https://www.sanblueplastics.com/ — Confirmed phone, GSTIN, contact name via web search of company site and TradeIndia listing", "24AXUPL3990P1ZF", "Chirag Malviya", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Chandan Packplast", "Gota", "+91 79 4933 7022", "PET preforms 25mm neck 9.5g for 200ml water bottles - ask if they stock 500ml preform sizes and small lot MOQ · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/pet-preform.html — Phone number and product spec confirmed via IndiaMART listing/search results; GSTIN not found - verify on call", "", "", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Vton Plastic Industries Pvt Ltd", "Changodar, Sanand", "+91 80 4765 9957", "PET preforms 500ml (12.5g) and 1L (18.7g), Rs111-128/kg, MOQ 25kg - good fit for 500ml PET bottle preforms, ask about 250ml too", "https://www.vtonplastic.com/pet-preform.html — Confirmed phone, GSTIN, price/MOQ, preform specs on company website", "24AAICV4496Q1ZE", "", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Shreeji Plastic", "Vatva GIDC Phase-2 (near Vinzol Crossing)", "+91 97122 11655", "PET preforms and PET bottles (chemical/confectionery/beverage) - established 2015, ask for 250/500ml beverage bottle preform capability", "https://shreejiplasticindia.com/about-us/ — Confirmed phone, email, GSTIN, owner name via company website and IndiaMART profile", "24AFFPC3535G1ZY", "Alish Patel (Owner)", "", "shreejiplastic2015@gmail.com", "Ahmedabad", ""],
  ["PET bottles / caps", "Gopinath Plast", "Odhav GIDC", "+91 79 4281 8106", "PET water bottles (1L Rs162/pc, MOQ 1000 pcs) and preforms - ask about 250/500ml sizes for electrolyte drink bottle", "https://www.gopinathplastic.com/water-bottles.html — Confirmed phone, GSTIN, proprietor name, price/MOQ table on company website", "24AAPFG6495A1ZA", "Dinesh Patel (Proprietor)", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Parmeshwar Engineering", "Ahmedabad", "+91 80 4897 3192", "Preform moulds and caps supplier - clarify if they sell finished preforms/caps directly or only moulds · ⚠ confirm number/GSTIN on call", "https://m.indiamart.com/parmeshwarengineering — Phone number found via IndiaMART search result; GSTIN and exact product scope not verified - confirm on call", "", "", "", "", "Ahmedabad", ""],
  ["PET bottles / caps", "Mahavir Trading Company", "Shahpur (opp. Metro Station, near Jawaharsaw Mill, outside Shahpur Gate)", "+91 80 4766 9113", "PET bottles and plastic bottle caps, established 1980 (long-running trader/supplier) - ask about 250/500ml beverage PET bottle stock and small lot pricing", "https://www.justdial.com/Ahmedabad/Mahavir-Trading-Company-Shahpur/079P3620_BZDET — Confirmed phone, GSTIN, address, and establishment year via Justdial and Know Your GST listings", "24AAWFM7133N1ZL", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Prakash Printers And Coaters Private Limited", "Hariom Industrial Park, Ode Piranha Gam Road, Paldi Kankaj", "+91 8047642920", "Shrink sleeves, BOPP/PVC self-adhesive bottle labels, roll-form labels, corrugated boxes; ask for 250ml PET waterproof label quote at 1,000-2,000 pcs run.", "https://www.prakashprinter.com/bopp-label.html — Company page shows phone, CEO name, address, GSTIN.", "24AAFCP6814R1ZV", "Mayur Shivlani (CEO)", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Marvel Pack Industries", "Ahmedabad, Gujarat", "+91 8047643452", "5-ply corrugated carton boxes; ask for small-batch outer cartons for 250ml PET bottle 24-pack shippers. · ⚠ confirm number/GSTIN on call", "https://www.marvelpackindustries.com/carton-box.html — Company site lists GST no. and phone via IndiaMART search result.", "24ABBFM0322P1ZF", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Dharmananda Offset", "Ahmedabad, Gujarat", "08048600307", "Printed corrugated boxes; ask for printed outer carton quote for launch batch. · ⚠ confirm number/GSTIN on call", "https://www.dharmanandanoffset.com/printed-corrugated-box.html — Company site GST/phone per IndiaMART search result.", "24AABFD3546P1ZA", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Dhanashree Packaging Industry", "Ahmedabad, Gujarat", "+91 7942654909", "Corrugated carton box manufacturer; ask for small-run printed shipper cartons. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/corrugated-boxes.html — IndiaMART directory listing, top-rated supplier with phone shown.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Zenex Packaging", "Ahmedabad, Gujarat", "+91 8047619812", "Corrugated box manufacturer; ask for carton quote for bottle shippers. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/corrugated-boxes.html — IndiaMART directory listing with phone shown.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Navkar Packaging", "Ahmedabad, Gujarat", "+91 8047823017", "Printed laminated pouches / sachet printing (rotogravure); ask about small-run sachet laminate for sample sachets. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/printed-pouches.html — IndiaMART directory top-rated listing with phone, 4.3/5 rating.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Sky Flexi Pack", "Ahmedabad, Gujarat (16 yrs in business)", "+91 8043861427", "Laminated pouch / sachet printing; ask for small-run sachet laminate quotes. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/printed-pouches.html — IndiaMART directory listing, phone shown, 4.2/5 rating 553 reviews.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Balahanuman Plastic Ind Private Limited", "Ahmedabad, Gujarat (14 yrs)", "+91 8048266038", "Laminated pouch/sachet printing; ask for sachet laminate small batch pricing. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/printed-pouches.html — IndiaMART directory listing with phone shown.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Om Print Pack", "Ahmedabad, Gujarat", "+91 8043888494", "Digital label printing at ~Rs4/page; ask for small-run (1,000-2,000) digital bottle labels, no plate charges. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/digital-label-printing.html — IndiaMART directory listing with phone and price shown.", "", "", "", "", "Ahmedabad", ""],
  ["Labels & packaging", "Rajshree Technosource", "Ahmedabad, Gujarat", "+91 8047619487", "Digital/sticker printing; ask about small-run digital labels for bottle launch batch. · ⚠ confirm number/GSTIN on call", "https://dir.indiamart.com/ahmedabad/digital-label-printing.html — IndiaMART directory listing with phone shown.", "", "", "", "", "Ahmedabad", ""],
  ["Testing lab", "Public Health Laboratory, Ahmedabad (Municipal)", "Navrangpura Urban Health Centre, Opp. Devpath Building, B/h Lal Bunglow, C.G. Road", "+91 9725038140", "NABL-accredited govt lab testing Beverages (Alcoholic/Non-Alcoholic) and Packaged Drinking/Natural Mineral Water; ask for FSSAI-compliant test report for electrolyte drink (microbiology + physico-chemical).", "https://fssai.gov.in/upload/uploadfiles/files/Laboratories_Lists_Validity_12_02_2021.pdf — Confirmed on FSSAI-published NABL lab validity list with contact person, mobile and email.", "", "Mr. Atul S. Soni (Food Analyst)", "", "phlab.nabl@gmail.com", "Ahmedabad", "NABL accredited (cert no. not captured on source page)"],
  ["Testing lab", "SWA Environmental Pvt Ltd", "Registered office: 7, Silver Plaza, Opp Vishal Tower, Prahladnagar; Lab: Survey No.645, Miroli, Kamod Circle Dholka Road", "+91 8828186901", "NABL-accredited environmental/water testing lab, packaged drinking water per BIS IS 14543:2016; ask if they test packaged electrolyte beverages or refer a partner NABL food lab.", "https://swaenviro.com/services/environmental-testing/ — Confirmed phone and email on company site.", "", "", "", "swa@swaenviro.com", "Ahmedabad", "NABL accredited, MoEF recognized (cert no. not shown on page)"],
  ["Testing lab", "SGS India Pvt. Ltd. - Ahmedabad", "201, Sumel II, Nr. Gurudwara, Thaltej", "+91 79 6160 3103", "Global testing/inspection company with Ahmedabad food lab; ask for FSSAI-compliant packaged beverage test panel and turnaround/cost for launch batch. · ⚠ confirm number/GSTIN on call", "https://www.sgs.com — Address, contact name, and two phone numbers found via web search result citing SGS India contact listing; recommend confirming number directly before relying on it.", "", "Purvi Shah (Laboratory In-Charge)", "+91 898 000 1575", "", "Ahmedabad", "NABL-accredited multinational lab network (cert no. not captured)"],
  ["Testing lab", "Intertek India - Ahmedabad", "214, 2nd Floor, Flexi Business Hub, Opp. Gwalia Sweets, Nr. Stadium Cross Road, Navrangpura", "+91 95052 22645", "Global testing company with Ahmedabad food-testing office; ask for packaged beverage FSSAI test panel and pricing for a small launch batch. · ⚠ confirm number/GSTIN on call", "https://www.intertek.com/india/food-testing/contact/ — Address and phone numbers found via Intertek contact listing in web search result; confirm directly before relying.", "", "", "+91 40 42015258", "", "Ahmedabad", "NABL-accredited multinational lab network (cert no. not captured)"],
  ["Testing lab", "Eureka Analytical Services Pvt Ltd", "1420, Shilp Epitome, Nr. InfosTech, B/H Rajpath Club, Bodakdev", "+91 7795833308", "Food, water and pharma testing lab in Ahmedabad; ask for FSSAI-compliant test panel and cost/turnaround for a 250ml electrolyte drink batch.", "https://eurekaserv.com/contact-us/ — Confirmed phone, address, email directly on company contact page.", "", "Sanjeev Khatri (CEO)", "", "info@eurekaserv.com", "Ahmedabad", "NABL/FSSAI-recognized food & water testing lab (cert no. not captured)"],
], SUP_KEYS, { status: "To call", moq: "", price: "", notes: "" }).map((r) => ({ ...r, id: seedId(r.name) })));
/* Stable ids so the same starter supplier added on two phones is one record. */
export const seedId = (name) => "sup-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------------- buyers / leads ---------------- */
export const BUY_KEYS = ["seg", "name", "area", "phone", "why", "priority", "source", "contact"];
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
  /* researched 27 Sep 2026 (buyers_b2b.json) — phones from IndiaMART / JustDial / Google listings */
  ["Factory", "Real Techno Forge", "Ahmedabad", "+91 7949344629", "Hot forging process shop floor, industrial workforce exposed to heat", "A", "https://dir.indiamart.com/ahmedabad/steel-forgings.html", ""],
  ["Factory", "Shree Dhwarkadhish Engineering", "Ahmedabad", "+91 8047309413", "Stainless steel forging manufacturer, hot shop floor workers", "A", "https://dir.indiamart.com/ahmedabad/steel-forgings.html", ""],
  ["Factory", "Sulohak Cast", "Ahmedabad", "+91 8048211982", "Steel casting/foundry, high-heat process floor", "A", "https://dir.indiamart.com/ahmedabad/steel-forgings.html", ""],
  ["Factory", "Horizon Metal Components", "Ahmedabad", "+91 7942873681", "Forgings manufacturer, hot metal working environment", "B", "https://www.indiamart.com", ""],
  ["Factory", "Charvi Enterprise", "Vatva GIDC, Ahmedabad", "+91 8046065072", "Chemical manufacturer (SHMP/dispersing agents) in Vatva GIDC, shop-floor + fumes/heat exposure", "A", "https://www.indiamart.com/proddetail/shmp-chemical-16591487762.html", ""],
  ["Factory", "Shrihari Chemicals Trading", "Vatva GIDC, Ahmedabad", "+91 9664870887", "Detergent/industrial chemical manufacturer in Vatva GIDC, plant floor workforce", "B", "https://www.indiamart.com/shriharichemicalstrading/", "Mihir Soni (Owner)"],
  ["Factory", "Parul Textiles", "Ahmedabad", "+91 8043894300", "Textile mill - hot processing floors (dyeing/weaving), large daily workforce", "A", "https://dir.indiamart.com/ahmedabad/textile-mills.html", ""],
  ["Factory", "Sungrow Enterprises", "Ahmedabad", "+91 7949348585", "Textile mill, hot shop floor, blue-collar workforce", "B", "https://dir.indiamart.com/ahmedabad/textile-mills.html", ""],
  ["Factory", "Krishna Engineering Works", "Ahmedabad", "+91 8047636402", "Engineering/textile machinery works, hot floor operations", "B", "https://dir.indiamart.com/ahmedabad/textile-mills.html", ""],
  ["Construction", "Mahadev Design And Construction", "Ahmedabad", "+91 7942828186", "Civil contractor handling residential/commercial live sites", "A", "https://dir.indiamart.com/ahmedabad/civil-contractors.html", ""],
  ["Construction", "Shree Shailaja Developers", "Ahmedabad", "+91 8047817192", "Developer/EPC firm with commercial construction projects, live sites", "A", "https://dir.indiamart.com/ahmedabad/commercial-construction-projects.html", ""],
  ["Construction", "Pan Engineers", "Ahmedabad", "+91 7948217190", "Civil engineering contractor, active project sites", "B", "https://dir.indiamart.com/ahmedabad/civil-contractors.html", ""],
  ["Construction", "Sunlight Infra Energy Private Limited", "Ahmedabad", "+91 7949357759", "EPC contractor (infra/energy), outdoor site crews exposed to heat", "A", "https://dir.indiamart.com/ahmedabad/epc-contractor.html", ""],
  ["Construction", "Gayatri Energy Corporation", "Ahmedabad", "+91 8047312244", "EPC firm, outdoor site workforce", "B", "https://dir.indiamart.com/ahmedabad/epc-contractor.html", ""],
  ["Canteen / facility partner", "Kavintan Enterprises Private Limited", "Ahmedabad", "+91 8047787526", "Industrial canteen service provider, serves factory workforces", "A", "https://dir.indiamart.com/ahmedabad/canteen-service.html", ""],
  ["Canteen / facility partner", "Ronika Caterers", "Ahmedabad", "+91 8043803029", "Canteen/catering contractor for industrial and office clients", "B", "https://dir.indiamart.com/ahmedabad/canteen-service.html", ""],
  ["Canteen / facility partner", "SCS Facility Management", "Thaltej, Ahmedabad", "+91 8045909301", "Facility management + pantry services provider for offices/factories", "A", "https://dir.indiamart.com/ahmedabad/pantry-service.html", ""],
  ["Canteen / facility partner", "Swaraj Men Management Private Limited", "Sabarmati, Ahmedabad", "+91 8047303853", "Manpower/housekeeping facility firm serving factories and offices, large reach (4.2/5, 254 reviews)", "A", "https://dir.indiamart.com/ahmedabad/facility-management-services.html", ""],
  ["Canteen / facility partner", "Keydus Management Service (OPC) Private Limited", "Jivraj Park, Ahmedabad", "+91 7942706135", "Facility/housekeeping management company serving corporate and industrial clients", "B", "https://dir.indiamart.com/ahmedabad/facility-management-services.html", ""],
  ["Events", "Storm Event Setup", "Ahmedabad", "+91 8047636014", "Event setup incl. dhol/garba-type events, 4.3/5 rating with 40 reviews", "A", "https://dir.indiamart.com/ahmedabad/event-management-services.html", ""],
  ["Events", "Imperial Events", "Navrangpura, Ahmedabad", "+91 7942722264", "Exhibition/trade fair organiser, outdoor crews during setup", "A", "https://dir.indiamart.com/ahmedabad/trade-fair-organizer.html", ""],
  ["Events", "Rising Star", "Ahmedabad", "+91 7949224658", "Event management company, corporate/sports event organiser", "B", "https://dir.indiamart.com/ahmedabad/corporate-event-management.html", ""],
  ["Events", "Brahmani Works", "Ahmedabad", "+91 7942831988", "Event management company for corporate/large gatherings", "B", "https://dir.indiamart.com/ahmedabad/corporate-event-management.html", ""],
  ["Events", "Crest Marcom LLP", "Ahmedabad", "+91 8048204094", "Event management services provider", "C", "https://dir.indiamart.com/ahmedabad/event-management-services.html", ""],
  ["Office", "Aainz Cafe", "Ahmedabad", "+91 7942815507", "Tea/coffee vending supplier for offices - pantry vendor entry point for IT parks/offices", "B", "https://dir.indiamart.com/ahmedabad/tea-coffee-vending-machine.html", ""],
  ["Office", "Ultimate Vending Systems", "Ahmedabad", "+91 8048211491", "Vending machine service for large offices, recurring pantry vendor relationship", "B", "https://dir.indiamart.com/ahmedabad/tea-coffee-vending-machine.html", ""],
  ["Office", "Paics India", "Ahmedabad", "+91 8047824387", "Tea/coffee vending supplier serving corporate offices", "C", "https://dir.indiamart.com/ahmedabad/tea-coffee-vending-machine.html", ""],
  ["Office", "MM Enterprise", "Nana Chiloda, Ahmedabad", "+91 7949323352", "Office housekeeping/facility services, admin point of contact for offices", "C", "https://dir.indiamart.com/ahmedabad/facility-management-services.html", ""],
  /* researched 27 Sep 2026 (buyers_sport.json) — phones from IndiaMART / JustDial / Google listings */
  ["Box cricket / turf", "Guts & Glory Box Cricket & Football", "South Bopal", "+91 79474 21853", "5.0 rating, 62 reviews, box cricket + football turf, busy evenings", "A", "https://www.justdial.com/Ahmedabad/Guts-Glory-Box-Cricket-Football-Opposite-Appollo-School-South-Bopal/079PXX79-XX79-231108162434-M5A2_BZDET", ""],
  ["Gym", "World Gym", "Bodakdev", "+91 79471 51251", "4.9 rating, 149 reviews, 8 years in business, aerobics/zumba/crossfit, open till 10pm", "A", "https://www.justdial.com/Ahmedabad/World-Gym-Nr-Pakwan-Cross-Road-Bodakdev/079PXX79-XX79-180714070733-Q9S9_BZDET", ""],
  ["Gym", "Infinity Fitness Gym", "Bodakdev (SG Highway)", "+91 79471 08515", "4.8 rating, 234 reviews, offers gym/zumba/crossfit/tabata classes", "A", "https://www.justdial.com/Ahmedabad/Infinity-Fitness-Gym-Near-Grand-Bhagwati-Bodakdev/079PXX79-XX79-240906200626-H3W8_BZDET", ""],
  ["Gym", "Sneha's Zumba & Fitness Studio", "Bopal", "+91 79471 09080", "5.0 rating, 337 reviews, women-owned studio, Zumba/gym/aerial yoga, open 6:30am-9:30pm", "A", "https://www.justdial.com/Ahmedabad/Snehas-Zumba-Fitness-Studio-Near-Government-Tubewell-Opposite-Hp-Petrol-Pump-Bopal/079PXX79-XX79-211001132123-J6K8_BZDET", ""],
  ["Box cricket / turf", "THE PICKLE KING", "South Bopal", "+91 79471 38343", "5.0 rating, 66 reviews, dedicated pickleball venue, open till 12:30am", "A", "https://www.justdial.com/Ahmedabad/THE-PICKLE-KING-NrKavisha-Panorama-South-Bopal/079PXX79-XX79-240605151915-G6W4_BZDET", ""],
  ["Running", "Cyclone Cycling Club", "Tulsibag Society (near Bodakdev)", "+91 79471 10012", "Established cycling club, active event photos, but only 8 ratings on JD", "C", "https://www.justdial.com/Ahmedabad/Cyclone-Cycling-Club-Behind-Rajpath-Rangoli-Rd-Bodakdev/079PXX79-XX79-181008131635-D5T4_BZDET", "Vinod Purohit"],
  ["Box cricket / turf", "Bang Bang", "Bodakdev", "+91 78788 81199", "566 reviews - extremely high footfall turf/sports venue in Bodakdev", "A", "https://www.justdial.com/Ahmedabad/Sprint-Cricket-Academy-Thaltej/079PXX79-XX79-220610222431-U9S8_BZDET", ""],
  ["Box cricket / turf", "Turf Sports", "Bodakdev", "+91 79471 10597", "538 reviews - very busy turf sports venue", "A", "https://www.justdial.com/Ahmedabad/Sprint-Cricket-Academy-Thaltej/079PXX79-XX79-220610222431-U9S8_BZDET", ""],
  ["Box cricket / turf", "Colosseum", "Bodakdev", "+91 79471 05942", "527 reviews - very busy sports turf venue", "A", "https://www.justdial.com/Ahmedabad/Sprint-Cricket-Academy-Thaltej/079PXX79-XX79-220610222431-U9S8_BZDET", ""],
  ["Box cricket / turf", "Versus The Arena", "Menaka Society, Thaltej", "+91 79426 84862", "160 reviews, busy turf/sports arena in Thaltej", "B", "https://www.justdial.com/Ahmedabad/Sprint-Cricket-Academy-Thaltej/079PXX79-XX79-220610222431-U9S8_BZDET", ""],
  ["Gym", "Gym Lounge Premium Navrangpura", "Navrangpura", "+91 79471 11660", "5.0 rating, 612 reviews, Crossfit+Zumba, 4 years in business, open till 10pm", "A", "https://www.justdial.com/Ahmedabad/Gym-Lounge-Premium-Navrangpura-Navrangpura/079PXX79-XX79-231230180036-Y9G9_BZDET", ""],
  ["Box cricket / turf", "Mishty Box Cricket", "Navrangpura (Memnagar)", "+91 79426 92069", "4.0 rating, 218 reviews, open 24 hours - high volume venue", "A", "https://www.justdial.com/Ahmedabad/Mishty-Box-Cricket-Near-Doctor-Vikram-Sarabhai-BridgeMemnagar/079PXX79-XX79-230331221307-R2G7_BZDET", ""],
  ["Box cricket / turf", "Dk Badminton Academy", "Chandkheda", "+91 79474 15976", "5.0 rating, 93 reviews, 384+ photos uploaded - very active badminton academy", "A", "https://www.justdial.com/Ahmedabad/Dk-Badminton-Academy-Chandkheda/079PXX79-XX79-220520221349-R7L1_BZDET", ""],
  ["Gym", "Body Fuel Gym", "Gota Road", "+91 96649 80728", "5.0 rating, 1439 reviews, 11 years in business, Crossfit+Zumba - one of the busiest gyms in list", "A", "https://www.justdial.com/Ahmedabad/Body-Fuel-Gym-Near-Vande-Matram-Cross-Road-Opposite-Aatam-School-Gota-Road/079PXX79-XX79-150131170103-T3F2_BZDET", ""],
  ["Gym", "Champions Martial Art Academy", "Thaltej", "+91 99806 48565", "5.0 rating, 303 reviews, MMA/boxing/taekwondo classes, 373 photos - very active", "A", "https://www.justdial.com/Ahmedabad/Champions-Martial-Art-Academy-Near-Cambay-Grand-Hotel-Thaltej/079PXX79-XX79-180924225528-F5H6_BZDET", ""],
  ["Gym", "Neel Taekwondo Academy Satellite", "Satellite", "+91 79471 33611", "5.0 rating, 260 reviews, 10 years in business, biggest taekwondo academy in city per reviews", "A", "https://www.justdial.com/Ahmedabad/Neel-Taekwondo-Academy-Satellite-Beside-Riddhi-Tower-Jodhpur-Satellite/079PXX79-XX79-190720090207-H7K3_BZDET", ""],
  ["Box cricket / turf", "Swingzone Box Cricket", "Gota / Jagatpur", "+91 79426 98396", "4.0 rating, 147 reviews, open 24 hours", "B", "https://www.justdial.com/Ahmedabad/Swingzone-Box-Cricket-Near-Chacha-Chaudhary-Tea-And-Snacks-Corner-Opposite-Godrej-Garden-City-Gota-Jagatpur/079PXX79-XX79-230819100041-C8Z1_BZDET", ""],
  ["Cricket academy", "Ahmedabad Sports Academy - Satellite", "Satellite (Visatnagar Talavdi)", "+91 79471 20202", "5.0 rating, 186 reviews, table tennis + yoga/soccer/karate programs, 65+ photos", "B", "https://www.justdial.com/Ahmedabad/Ahmedabad-Sports-Academy-Satellite/079PXX79-XX79-230324000925-Z6P6_BZDET", ""],
  ["Gym", "Anytime Fitness", "Satellite (Iskcon Cross Road)", "+91 99806 44594", "4.8 rating, 860 reviews, open 24hrs, franchise but very high footfall", "A", "https://www.justdial.com/Ahmedabad/Anytime-Fitness-Satellite/079PXX79-XX79-190107163408-G6K2_BZDET", ""],
], BUY_KEYS, { status: "New", next: "", follow: "", notes: "" }).map((r) => ({ ...r, id: "buy-" + r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })));

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
  { name: "Taazu", meaning: "Gujarati for 'fresh' (તાજું)", why: "Chosen brand — friendly, local, works for bottle and powder", risk: "Check class 32 on IP India before printing", pick: "Our brand", top: true },
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
    const fill = Object.fromEntries(["gstin", "contact", "phone2", "email", "city", "fssai"].filter((k) => s[k] && !r[k]).map((k) => [k, s[k]]));
    const moved = name !== r.name ? { name, cat: s.cat, use: s.use, source: s.source } : {};
    return Object.keys(fill).length || moved.name ? { ...r, ...moved, ...fill } : r;
  });
  const have = new Set(out.map((r) => r.name));
  return [...out, ...seed.filter((s) => !have.has(s.name) && !rows.some((r) => r.id === s.id))];
};

/* Same for buyers: add starter buyers the team doesn't have yet (matched by name or id), never touching existing ones. */
export const upgradeBuyers = (rows) => {
  const have = new Set(rows.flatMap((r) => [r.name, r.id]));
  return [...rows, ...BUYERS().filter((b) => !have.has(b.name) && !have.has(b.id))];
};
