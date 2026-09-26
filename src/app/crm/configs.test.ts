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
