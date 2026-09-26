import { describe, it, expect } from "vitest";
import { autoMap, detectModule, findHeaderRow, parseDate, parseNumber, gstinOk, tidyPhone, planImport, applyPlan, summarize, NOTES } from "./engine";
import { moduleById } from "./schema";

const sup = moduleById("sup"), buy = moduleById("buy"), sales = moduleById("sales");
const field = (m, headers) => autoMap(headers, m);

describe("column matching", () => {
  it("matches HubSpot / Zoho style headers", () => {
    const h = ["Company Name", "First Name", "Last Name", "Mobile Number", "Email Address", "Lead Status", "City", "Description"];
    expect(field(buy, h)).toEqual(["name", "contact", "contact", "phone", "email", "status", "city", "notes"]);
  });
  it("matches Taazu's own export and template headers", () => {
    const h = sup.fields.map((f) => f.label + (f.required ? " *" : ""));
    expect(field(sup, h)).toEqual(sup.fields.map((f) => f.k));
  });
  it("matches IndiaMART / Tally style supplier headers", () => {
    expect(field(sup, ["Party Name", "GSTIN/UIN", "Contact No", "Address", "Remarks"])).toEqual(["name", "gstin", "phone", "area", "notes"]);
  });
  it("guesses the module from the sheet", () => {
    expect(detectModule(["Supplier", "GSTIN", "MOQ"], "Sheet1")?.id).toBe("sup");
    expect(detectModule(["Date", "Customer", "Qty", "Rate ₹", "Paid?"], "Sales")?.id).toBe("sales");
    expect(detectModule(["foo", "bar"], "Sheet1")).toBeNull();
    expect(detectModule(["Date", "With", "Type", "Outcome", "Note", "By"], "Call log")).toBeNull();
    expect(detectModule(["Metric", "Value"], "Summary")).toBeNull();
    expect(detectModule(["Supplier *", "Category"], "Suppliers help")).toBeNull();
  });
  it("skips title rows above the header", () => {
    expect(findHeaderRow([["Vendor list Sept 2026"], [], ["Name", "Phone", "GSTIN"], ["A", "98250 12345", ""]])).toBe(2);
  });
});

describe("cell cleaning", () => {
  it("reads dates in common formats", () => {
    expect(parseDate("2026-10-05")).toBe("2026-10-05");
    expect(parseDate("05/10/2026")).toBe("2026-10-05");       // day first (India)
    expect(parseDate("10/25/2026")).toBe("2026-10-25");       // obviously month first
    expect(parseDate("5 Oct 2026")).toBe("2026-10-05");
    expect(parseDate("Oct 5, 2026")).toBe("2026-10-05");
    expect(parseDate("05-Oct-26")).toBe("2026-10-05");
    expect(parseDate(46300)).toBe("2026-10-05");              // Excel serial
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("soon")).toBeNull();
  });
  it("reads rupee amounts", () => {
    expect(parseNumber("₹1,20,000.50").n).toBe(120000.5);
    expect(parseNumber("Rs. 13/-").n).toBe(13);
    expect(parseNumber("2000 units")).toEqual({ n: 2000, loose: true });
  });
  it("checks GSTINs", () => {
    expect(gstinOk("24AFKPP1131N1ZD")).toBe(true);
    expect(gstinOk("24AFKPP1131N1ZE")).toBe(false);
  });
  it("tidies Indian phone numbers", () => {
    expect(tidyPhone(9825012345)).toBe("+91 98250 12345");
    expect(tidyPhone("919825012345")).toBe("+91 98250 12345");
    expect(tidyPhone("079 2656 2643")).toBe("079 2656 2643");
    expect(tidyPhone("+91 79 2656 2643")).toBe("+91 79 2656 2643"); // landline, kept as typed
  });
});

describe("import plan", () => {
  const existing = [
    { id: "a", name: "Gunatit Label", phone: "+91 99099 14588", gstin: "", notes: "old note", status: "Contacted", cat: "Labels & packaging" },
    { id: "b", name: "Parekh Enterprise", phone: "080716 30391", gstin: "24AFKPP1131N1ZD", status: "To call" },
  ];
  const headers = ["Name", "Phone", "GSTIN", "Status", "Remarks", "Extra"];
  const rows = [
    ["Gunatit Labels Pvt", "9909914588", "", "", "new note", ""],       // same phone as a -> update
    ["Parekh Ent", "", "24AFKPP1131N1ZD", "Quote received", "", ""],   // same GSTIN as b
    ["New Bottler", "98250 12345 / 90990 11223", "", "Hot lead", "", "Met at expo"],
    ["new bottler", "", "", "", "", ""],                                // repeat inside the file
    ["", "12345678", "", "", "", ""],                                    // no name -> error
    ["", "", "", "", "", ""],                                            // blank -> ignored
  ];
  const mapping = [...autoMap(headers, sup).slice(0, 5), NOTES];

  it("fill: updates only blanks, adds new, merges in-file repeats, flags errors", () => {
    const plan = planImport(rows, headers, mapping, sup, existing, "fill");
    expect(plan.map((p) => p.action)).toEqual(["unchanged", "unchanged", "create", "duplicate", "error"]);
    expect(plan[0].matchedBy).toBe("Phone");
    const fillBlank = planImport([["Gunatit", "99099 14588", "", "", "", "Owner: Mehul"]], headers, mapping, sup, [{ ...existing[0], notes: "" }], "fill");
    expect(fillBlank[0]).toMatchObject({ action: "update", patch: { notes: "Extra: Owner: Mehul" } });
  });

  it("works row by row", () => {
    const plan = planImport(rows, headers, mapping, sup, existing, "fill");
    const created = plan[2].record;
    expect(created.phone).toBe("+91 98250 12345");
    expect(created.phone2).toBe("+91 90990 11223");
    expect(created.status).toBe("To call");           // "Hot lead" isn't a stage
    expect(created.notes).toBe("Extra: Met at expo");
    expect(plan[2].warnings.join()).toMatch(/Hot lead/);
    expect(plan[1].matchedBy).toBe("GSTIN");
    expect(plan[4].errors).toEqual(["Supplier is empty"]);
    expect(existing[0].notes).toBe("old note");        // planning never mutates app state
  });

  it("overwrite: file wins, notes are appended", () => {
    const plan = planImport(rows, headers, mapping, sup, existing, "overwrite");
    expect(plan[0].patch).toEqual({ name: "Gunatit Labels Pvt", notes: "old note\nnew note" });
    expect(plan[1].patch).toEqual({ name: "Parekh Ent", status: "Quote received" });
  });

  it("skip and create policies", () => {
    expect(summarize(planImport(rows, headers, mapping, sup, existing, "skip"))).toMatchObject({ create: 1, duplicate: 3, error: 1 });
    expect(summarize(planImport(rows, headers, mapping, sup, existing, "create"))).toMatchObject({ create: 4, error: 1 });
  });

  it("applies the plan with defaults and ids", () => {
    const plan = planImport(rows, headers, mapping, sup, existing, "overwrite");
    let n = 0;
    const out = applyPlan(existing, plan, sup, () => "new" + ++n, 1000);
    expect(out).toHaveLength(3);
    expect(out[1].status).toBe("Quote received");
    expect(out[2]).toMatchObject({ id: "new1", name: "New Bottler", status: "To call", source: "Imported", _o: 1000 });
  });

  it("matches sales on the whole line and skips TOTAL budget rows", () => {
    const h = ["Date", "Customer", "Product", "Qty", "Rate ₹", "Paid?"];
    const cur = [{ id: "s1", date: "2026-10-12", customer: "Stall", product: "Cup", qty: 10, rate: 15, paid: "No" }];
    const plan = planImport([["12/10/2026", "Stall", "Cup", 10, 15, "UPI"], ["12/10/2026", "Stall", "Cup", 12, 15, "no"]], h, autoMap(h, sales), sales, cur, "overwrite");
    expect(plan.map((p) => p.action)).toEqual(["update", "create"]);
    expect(plan[0].patch).toEqual({ paid: "Yes" });
    const bud = moduleById("bud");
    expect(planImport([["TOTAL", 100, 50]], ["Bucket", "Planned ₹", "Actual ₹"], ["bucket", "planned", "actual"], bud, [], "fill")).toEqual([]);
  });
});
