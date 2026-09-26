import { describe, expect, it } from "vitest";
import { evaluate, gst, landed, margin, num, order, priceForMargin, trimNumber } from "./math";

describe("margin", () => {
  it("splits profit into margin (of price) and markup (of cost)", () => {
    const m = margin(20, 30, 1000);
    expect(m.profit).toBe(10);
    expect(m.marginPct).toBeCloseTo(33.3333, 4);
    expect(m.markupPct).toBe(50);
    expect(m.total).toBe(10000);
  });

  it("reports a loss as negative profit and margin", () => {
    const m = margin(25, 20, 10);
    expect(m.profit).toBe(-5);
    expect(m.marginPct).toBe(-25);
    expect(m.total).toBe(-50);
  });

  it("does not divide by zero when price or cost is empty", () => {
    expect(margin(10, 0, 1).marginPct).toBe(0);
    expect(margin(0, 10, 1).markupPct).toBe(0);
  });
});

describe("priceForMargin", () => {
  it("gives the price whose margin equals the target", () => {
    expect(priceForMargin(14, 30)).toBeCloseTo(20, 10);
    expect(margin(14, priceForMargin(14, 30), 1).marginPct).toBeCloseTo(30, 10);
  });

  it("returns 0 for impossible targets of 100% or more", () => {
    expect(priceForMargin(10, 100)).toBe(0);
    expect(priceForMargin(10, 120)).toBe(0);
  });
});

describe("gst", () => {
  it("adds tax on top and splits it into CGST and SGST halves", () => {
    const g = gst(100, 18, "add");
    expect(g.base).toBe(100);
    expect(g.tax).toBeCloseTo(18, 10);
    expect(g.total).toBeCloseTo(118, 10);
    expect(g.half).toBeCloseTo(9, 10);
  });

  it("removes tax from an inclusive price", () => {
    const g = gst(118, 18, "remove");
    expect(g.base).toBeCloseTo(100, 10);
    expect(g.tax).toBeCloseTo(18, 10);
    expect(g.total).toBeCloseTo(118, 10);
  });

  it("round-trips add then remove", () => {
    for (const rate of [0, 5, 12, 18, 28, 40]) {
      const inclusive = gst(37.5, rate, "add").total;
      expect(gst(inclusive, rate, "remove").base).toBeCloseTo(37.5, 10);
    }
  });

  it("is a no-op at 0%", () => {
    expect(gst(50, 0, "remove")).toEqual({ base: 50, tax: 0, total: 50, half: 0 });
  });
});

/* The Margin tab treats the selling price as GST-inclusive: profit is taken on the net price
   and the suggested quote puts GST back on top of the target-margin price. */
describe("GST-aware margin", () => {
  const net = (price: number, rate: number) => price / (1 + rate / 100);

  it("takes margin on the price without GST", () => {
    const m = margin(14, net(23.6, 18), 1000);
    expect(m.profit).toBeCloseTo(6, 10);
    expect(m.total).toBeCloseTo(6000, 6);
    expect(net(23.6, 18)).toBeCloseTo(gst(23.6, 18, "remove").base, 10);
  });

  it("quotes a GST-inclusive price that hits the target margin after tax", () => {
    for (const rate of [0, 5, 18, 40]) {
      const quote = priceForMargin(14, 30) * (1 + rate / 100);
      expect(margin(14, net(quote, rate), 1).marginPct).toBeCloseTo(30, 10);
    }
  });

  it("shows a loss when GST eats the whole markup", () => {
    // ₹20 MRP at 18% GST leaves ₹16.95, below a ₹18 cost.
    expect(margin(18, net(20, 18), 1).profit).toBeLessThan(0);
  });
});

describe("order", () => {
  it("applies discount before GST", () => {
    const o = order(100, 20, 10, 18);
    expect(o.subtotal).toBe(2000);
    expect(o.discount).toBe(200);
    expect(o.taxable).toBe(1800);
    expect(o.tax).toBeCloseTo(324, 10);
    expect(o.total).toBeCloseTo(2124, 10);
    expect(o.perUnit).toBeCloseTo(21.24, 10);
  });

  it("has no per-unit price for zero quantity", () => {
    expect(order(0, 20, 0, 18).perUnit).toBe(0);
  });
});

describe("landed", () => {
  it("spreads freight over the batch", () => {
    const r = landed({ items: [8, 2.5, 1.5], freight: 500, qty: 1000 });
    expect(r.perUnit).toBe(12);
    expect(r.freightPerUnit).toBe(0.5);
    expect(r.landedUnit).toBe(12.5);
    expect(r.batch).toBe(12500);
  });

  it("ignores freight when quantity is zero", () => {
    expect(landed({ items: [5], freight: 100, qty: 0 }).landedUnit).toBe(5);
  });
});

describe("num", () => {
  it("parses Indian-grouped numbers and falls back to 0", () => {
    expect(num("1,00,000")).toBe(100000);
    expect(num("12.5")).toBe(12.5);
    expect(num("")).toBe(0);
    expect(num(null)).toBe(0);
    expect(num("abc")).toBe(0);
  });
});

describe("evaluate", () => {
  it("follows operator precedence and brackets", () => {
    expect(evaluate("12+3×4")).toBe(24);
    expect(evaluate("(5+5)÷2")).toBe(5);
    expect(evaluate("2*3/4")).toBe(1.5);
  });

  it("handles percent like a phone calculator", () => {
    expect(evaluate("200+10%")).toBe(220);
    expect(evaluate("200-10%")).toBe(180);
    expect(evaluate("50×10%")).toBe(5);
  });

  it("returns null for unfinished input or division by zero", () => {
    expect(evaluate("")).toBeNull();
    expect(evaluate("12+")).toBeNull();
    expect(evaluate("5÷0")).toBeNull();
  });

  it("trims floating point noise for display", () => {
    expect(trimNumber(evaluate("0.1+0.2")!)).toBe("0.3");
  });
});
