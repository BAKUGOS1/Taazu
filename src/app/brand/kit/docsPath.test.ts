import { describe, expect, it } from "vitest";
import { fmtSize, keyOf, safeName, uniqueName } from "./docsPath";

describe("docs paths", () => {
  it("makes storage-safe names", () => {
    expect(safeName("FSSAI licence (copy).pdf")).toBe("FSSAI licence (copy).pdf");
    expect(safeName("Café ⭐ label#1.png")).toBe("Cafe _ label_1.png");
    expect(safeName("../secret")).toBe("_secret");
    expect(safeName("")).toBe("file");
  });
  it("joins keys and avoids clashes", () => {
    expect(keyOf("ws", ["Labels", "Final"], "a.pdf")).toBe("ws/Labels/Final/a.pdf");
    expect(keyOf("ws", [])).toBe("ws");
    expect(uniqueName("a.pdf", new Set(["a.pdf", "a (2).pdf"]))).toBe("a (3).pdf");
    expect(uniqueName("notes", new Set(["notes"]))).toBe("notes (2)");
  });
  it("formats sizes", () => {
    expect(fmtSize(0)).toBe("");
    expect(fmtSize(2048)).toBe("2 KB");
    expect(fmtSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
