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
  it("names the category's need and asks the same 4 questions", () => {
    const msg = SUPPLIER_CFG.waMessage({ id: "x", name: "A", cat: "PET bottles / caps", contact: "Ravi (Owner)" } as any, "hi");
    expect(msg).toContain("Namaste Ravi ji");
    expect(msg).toContain("PET bottle aur cap");
    expect(msg).toContain("4. Aapka FSSAI licence aur GSTIN");
    expect(msg).not.toMatch(/\bORS\b/);
  });
});
