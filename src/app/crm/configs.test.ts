import { describe, it, expect } from "vitest";
import { SUPPLIER_CFG } from "./configs";

describe("supplier order", () => {
  it("puts verified suppliers above the call-first tiers", () => {
    const rows: any[] = [
      { id: "a", name: "Koladiya Industries (Asterin)", cat: "Co-packer / bottler" },
      { id: "b", name: "Some Labels", cat: "Labels & packaging", verified: true },
      { id: "c", name: "Zeel Beverages", cat: "Co-packer / bottler" },
    ];
    expect([...rows].sort(SUPPLIER_CFG.sortFresh).map((r) => r.id)).toEqual(["b", "a", "c"]);
  });
});

describe("supplier WhatsApp message", () => {
  it("is professional English with the category's need and the same 4 questions", () => {
    const msg = SUPPLIER_CFG.waMessage({ id: "x", name: "A", cat: "PET bottles / caps", contact: "Ravi (Owner)" } as any, "hi");
    expect(msg.startsWith("Dear Ravi,")).toBe(true);
    expect(msg).toContain("food-grade 250 ml PET bottles and caps");
    expect(msg).toContain("4. A copy of your FSSAI licence and your GSTIN");
    expect(msg).not.toMatch(/\bORS\b/);
  });
  it("falls back to Sir/Madam and a generic ask", () => {
    const msg = SUPPLIER_CFG.waMessage({ id: "y", name: "B", cat: "Other" } as any, "en");
    expect(msg).toContain("Dear Sir/Madam,");
    expect(msg).toContain("the products and services you offer");
  });
});
