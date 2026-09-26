import * as XLSX from "xlsx";
import { MODULES, type IoModule } from "./schema";
import { ACTION_LABEL, type PlanRow } from "./engine";
import { mapUrl, today } from "../core";

/* Reading and writing spreadsheet files. Everything about what the columns mean lives in schema.ts. */

export type RawSheet = { name: string; rows: any[][] };

/* Any .xlsx / .xls / .csv / .ods / .tsv file -> its sheets as rows of cells. */
export async function readFile(file: File): Promise<RawSheet[]> {
  const buf = await file.arrayBuffer();
  const isText = /\.(csv|tsv|txt)$/i.test(file.name);
  const wb = isText
    ? XLSX.read(new TextDecoder("utf-8").decode(buf).replace(/^﻿/, ""), { type: "string", cellDates: true, raw: false })
    : XLSX.read(buf, { cellDates: true });
  return wb.SheetNames.map((name) => ({
    name: isText ? file.name.replace(/\.[^.]+$/, "") : name,
    rows: (XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", blankrows: false, raw: true }) as any[][]),
  })).filter((s) => s.rows.length);
}

/* ---------------- export ---------------- */

const width = (label: string, vals: any[]) => ({ wch: Math.min(60, Math.max(8, label.length + 2, ...vals.slice(0, 200).map((v) => String(v ?? "").length + 1))) });
const LINKS: Partial<Record<IoModule["id"], boolean>> = { sup: true, buy: true };

/* One module's records as a sheet with every field, so it imports straight back. */
export function moduleSheet(mod: IoModule, rows: any[]): XLSX.WorkSheet {
  const cols = mod.fields.map((f) => f.label);
  const withLink = LINKS[mod.id];
  const header = withLink ? [...cols, "Google Maps link"] : cols;
  const body = rows.map((r) => {
    const vals = mod.fields.map((f) => (f.type === "number" && r[f.k] !== "" && r[f.k] != null && !isNaN(Number(r[f.k])) ? Number(r[f.k]) : r[f.k] ?? ""));
    return withLink ? [...vals, mapUrl(r)] : vals;
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  ws["!cols"] = header.map((h, i) => width(h, body.map((b) => b[i])));
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(body.length, 1), c: header.length - 1 } }) };
  if (withLink) body.forEach((b, i) => {
    const ref = XLSX.utils.encode_cell({ r: i + 1, c: header.length - 1 });
    if (ws[ref]?.v) ws[ref].l = { Target: ws[ref].v, Tooltip: "Open in Google Maps" };
  });
  return ws;
}

const download = (wb: XLSX.WorkBook, name: string, csv = false) => XLSX.writeFile(wb, name, csv ? { bookType: "csv" } : { compression: true });

export function exportModule(mod: IoModule, rows: any[], csv = false) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, moduleSheet(mod, rows), mod.sheet);
  download(wb, `Taazu_${mod.label}_${today()}.${csv ? "csv" : "xlsx"}`, csv);
}

/* Everything in one workbook: a Summary first, then one sheet per module, then extras (call log, brand names…). */
export function exportAll(data: Record<string, any[]>, summary: { Metric: string; Value: any }[], extras: { name: string; rows: Record<string, any>[] }[] = []) {
  const wb = XLSX.utils.book_new();
  const ws0 = XLSX.utils.json_to_sheet(summary); ws0["!cols"] = [{ wch: 44 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws0, "Summary");
  MODULES.forEach((m) => XLSX.utils.book_append_sheet(wb, moduleSheet(m, data[m.id] || []), m.sheet));
  extras.filter((x) => x.rows.length).forEach((x) => {
    const ws = XLSX.utils.json_to_sheet(x.rows);
    const keys = Object.keys(x.rows[0]);
    ws["!cols"] = keys.map((k) => width(k, x.rows.map((r) => r[k])));
    XLSX.utils.book_append_sheet(wb, ws, x.name);
  });
  download(wb, `Taazu_${today()}.xlsx`);
}

/* ---------------- sample templates ---------------- */

const typeText = (f: any) => ({ number: "Number", date: "Date (YYYY-MM-DD or DD/MM/YYYY)", phone: "Phone", email: "Email", gstin: "GSTIN (15 characters)", select: "Pick from list" } as any)[f.type] || "Text";

function templateSheets(wb: XLSX.WorkBook, mod: IoModule, prefix = "") {
  const header = mod.fields.map((f) => f.label + (f.required ? " *" : ""));
  const n = Math.max(...mod.fields.map((f) => f.example?.length || 0));
  const ex = Array.from({ length: n }, (_, i) => mod.fields.map((f) => {
    const v = f.example?.[i] ?? "";
    return f.type === "number" && v !== "" ? Number(v) : v;
  }));
  const ws = XLSX.utils.aoa_to_sheet([header, ...ex]);
  ws["!cols"] = header.map((h, i) => width(h, ex.map((r) => r[i])));
  XLSX.utils.book_append_sheet(wb, ws, (prefix + mod.sheet).slice(0, 31));

  const help = [
    [`${mod.label} import template`],
    ["Fill one row per " + mod.noun + " on the " + mod.sheet + " sheet. Delete the example rows first. Columns marked * are required; every other column is optional and can be left out."],
    ["Column names don't have to match exactly: when you import, Taazu matches your columns and lets you fix the matching before anything is saved. Files from HubSpot, Zoho, Tally, IndiaMART, JustDial or Google Sheets work too."],
    [mod.dedupe.length ? `Duplicates are found by ${mod.dedupe.map((s) => s.map((k) => mod.fields.find((f) => f.k === k)?.label).join(" + ")).join(", then ")}. At import you choose to skip them, fill their empty fields, or overwrite them.` : "Every row is added as a new " + mod.noun + "."],
    [],
    ["Column", "Required", "Type", "Allowed values / format", "Also recognised as"],
    ...mod.fields.map((f) => [f.label, f.required ? "Yes" : "", typeText(f), f.hint || (f.options ? f.options.join(", ") : ""), (f.aliases || []).slice(0, 8).join(", ")]),
  ];
  const hs = XLSX.utils.aoa_to_sheet(help);
  hs["!cols"] = [{ wch: 22 }, { wch: 9 }, { wch: 30 }, { wch: 60 }, { wch: 70 }];
  hs["!merges"] = [1, 2, 3].map((r) => ({ s: { r, c: 0 }, e: { r, c: 4 } }));
  XLSX.utils.book_append_sheet(wb, hs, (prefix + mod.sheet + " help").slice(0, 31));
}

export function downloadTemplate(mod: IoModule) {
  const wb = XLSX.utils.book_new();
  templateSheets(wb, mod);
  download(wb, `Taazu_${mod.label}_import_template.xlsx`);
}

export function downloadAllTemplates() {
  const wb = XLSX.utils.book_new();
  MODULES.forEach((m) => templateSheets(wb, m));
  download(wb, `Taazu_import_templates.xlsx`);
}

/* ---------------- error report ---------------- */

/* The file's own rows, each with what happened to it and why — like Zoho / HubSpot's import error file. */
export function downloadReport(fileName: string, headers: any[], plan: PlanRow[], onlyProblems = true) {
  const rows = plan.filter((p) => !onlyProblems || p.action === "error" || p.warnings.length || p.action === "duplicate");
  const aoa = [["Row", "Result", "Problems", ...headers.map((h) => String(h ?? ""))], ...rows.map((p) => [p.row, ACTION_LABEL[p.action] + (p.matchName ? ` — ${p.matchName}` : ""), [...p.errors, ...p.warnings].join("; "), ...p.raw])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 6 }, { wch: 30 }, { wch: 60 }, ...headers.map((h) => width(String(h ?? ""), []))];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import report");
  download(wb, `${fileName.replace(/\.[^.]+$/, "")}_import_report.xlsx`);
}
