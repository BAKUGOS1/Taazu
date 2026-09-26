import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { MODULES } from "./schema";
import { moduleSheet, readFile } from "./xlsx";
import { autoMap, detectModule, findHeaderRow, planImport, summarize } from "./engine";
import { SUPPLIERS, BUYERS, TASKS, BUDGET } from "../core";

const toFile = (ws: XLSX.WorkSheet, name: string, type: "xlsx" | "csv" = "xlsx") => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name);
  return new File([XLSX.write(wb, { type: "array", bookType: type })], `test.${type}`);
};

describe("export -> import round trip", () => {
  const data: Record<string, any[]> = { sup: SUPPLIERS(), buy: BUYERS(), tasks: TASKS(), bud: BUDGET(), sales: [], surv: [] };
  for (const m of MODULES.filter((m) => data[m.id].length)) {
    for (const type of ["xlsx", "csv"] as const) {
      it(`${m.label} (${type}) imports back with no changes`, async () => {
        const [sheet] = await readFile(toFile(moduleSheet(m, data[m.id]), m.sheet, type));
        const h = findHeaderRow(sheet.rows);
        const headers = sheet.rows[h];
        if (type === "xlsx") expect(detectModule(headers, sheet.name)?.id).toBe(m.id);
        const plan = planImport(sheet.rows.slice(h + 1), headers, autoMap(headers, m), m, data[m.id], "overwrite");
        const c = summarize(plan);
        expect(c.error).toBe(0);
        expect(c.create).toBe(0);
        expect(plan.filter((p) => p.action === "update").map((p) => [p.record.name || p.record.task, p.patch]).slice(0, 4)).toEqual([]);
      });
    }
  }
});

describe("sample templates", () => {
  for (const m of MODULES) {
    it(`${m.label} template's example rows import cleanly`, () => {
      const headers = m.fields.map((f) => f.label + (f.required ? " *" : ""));
      const n = Math.max(...m.fields.map((f) => f.example?.length || 0));
      const rows = Array.from({ length: n }, (_, i) => m.fields.map((f) => f.example?.[i] ?? ""));
      const plan = planImport(rows, headers, autoMap(headers, m), m, [], "fill");
      expect(plan.map((p) => [...p.errors, ...p.warnings])).toEqual(plan.map(() => []));
      expect(summarize(plan).create).toBe(n);
    });
  }
});
