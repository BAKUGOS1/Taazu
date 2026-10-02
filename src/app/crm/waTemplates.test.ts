import { describe, expect, it } from "vitest";
import { SUPPLIER_CFG, BUYER_CFG } from "./configs";
import { blankTemplate, fill, matches, messageFor, pickTemplate, type WaTemplate } from "./waTemplates";

const sup = (p: any = {}) => ({ id: "s1", name: "⭐ Halewood Laboratories", area: "Vatva", phone: "", status: "To call", cat: "Co-packer / bottler", city: "Ahmedabad", contact: "Hardik R. Agrawal (BD) / Dipan", ...p });
const tpl = (p: Partial<WaTemplate> = {}): WaTemplate => ({ ...blankTemplate("sup", "t1"), body: "Hi {who}", ...p });

describe("fill", () => {
  it("fills fields, strips the star and the role in brackets", () => {
    expect(fill("Dear {who}, about {name} in {city}", sup(), SUPPLIER_CFG)).toBe("Dear Hardik R. Agrawal, about Halewood Laboratories in Ahmedabad");
  });
  it("uses the fallback after | and blanks unknown fields", () => {
    expect(fill("{contact|Sir} {gstin|no GST}{nope}", sup({ contact: "" }), SUPPLIER_CFG)).toBe("Sir no GST");
    expect(fill("{who}", sup({ contact: "" }), SUPPLIER_CFG)).toBe("Sir/Madam");
  });
  it("fills {need} from the category", () => {
    expect(fill("{need}", sup(), SUPPLIER_CFG)).toContain("250 ml PET");
  });
});

describe("rules", () => {
  it("matches category, city, stage, star and verified", () => {
    expect(matches(tpl(), sup(), SUPPLIER_CFG)).toBe(true);
    expect(matches(tpl({ cats: ["Testing lab"] }), sup(), SUPPLIER_CFG)).toBe(false);
    expect(matches(tpl({ cities: ["Rajkot"] }), sup(), SUPPLIER_CFG)).toBe(false);
    expect(matches(tpl({ stages: ["Contacted"] }), sup(), SUPPLIER_CFG)).toBe(false);
    expect(matches(tpl({ starred: "yes" }), sup(), SUPPLIER_CFG)).toBe(true);
    expect(matches(tpl({ starred: "yes" }), sup({ name: "Patel" }), SUPPLIER_CFG)).toBe(false);
    expect(matches(tpl({ verified: "yes" }), sup(), SUPPLIER_CFG)).toBe(false);
    expect(matches(tpl(), sup(), BUYER_CFG)).toBe(false); // supplier template never used for buyers
  });
  it("picks the first switched-on match, else the built-in message", () => {
    const list = [tpl({ id: "a", on: false }), tpl({ id: "b", cats: ["Testing lab"] }), tpl({ id: "c", body: "C {name}" })];
    expect(pickTemplate(list, sup(), SUPPLIER_CFG)?.id).toBe("c");
    expect(messageFor(list, SUPPLIER_CFG, sup(), "en")).toBe("C Halewood Laboratories");
    expect(messageFor([], SUPPLIER_CFG, sup(), "en")).toBe(SUPPLIER_CFG.waMessage(sup(), "en"));
    expect(messageFor(list, SUPPLIER_CFG, sup(), "en", null)).toBe(SUPPLIER_CFG.waMessage(sup(), "en"));
  });
});
