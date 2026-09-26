import { useMemo, useState } from "react";
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Check, AlertTriangle, Download, Undo2, Wand2 } from "lucide-react";
import Sheet from "../../components/Sheet";
import { btnGhost, btnPrimary, inputCls } from "../../components/ui";
import { uid } from "../../lib/core";
import { MODULES, moduleById, type IoModule } from "../../lib/dataio/schema";
import { NOTES, autoMap, detectModule, findHeaderRow, planImport, applyPlan, summarize, headerScore, ACTION_LABEL, type Mapping, type Policy, type PlanRow } from "../../lib/dataio/engine";
import { readFile, downloadReport, downloadTemplate } from "../../lib/dataio/xlsx";

export type Store = { rows: any[]; set: (rows: any[]) => void; after?: (rows: any[]) => any[] };

type Job = { sheet: string; headers: any[]; rows: any[][]; firstRow: number; mod: IoModule | null; mapping: Mapping; policy: Policy };

const POLICIES: { id: Policy; label: string; sub: string }[] = [
  { id: "fill", label: "Update, fill empty fields", sub: "Matches get the file's values only where they're blank. Nothing you typed is replaced." },
  { id: "overwrite", label: "Update, file wins", sub: "Matches take the file's values. Blank cells never erase anything; notes are added to." },
  { id: "skip", label: "Skip duplicates", sub: "Only brand-new records are added." },
  { id: "create", label: "Add everything as new", sub: "No duplicate check." },
];
const TONE: Record<string, string> = { create: "text-green-700 bg-green-50", update: "text-blue-700 bg-blue-50", unchanged: "text-slate-500 bg-slate-50", duplicate: "text-amber-700 bg-amber-50", error: "text-red-700 bg-red-50" };
const ACCEPT = ".xlsx,.xls,.xlsm,.csv,.tsv,.txt,.ods";

const makeJob = (sheet: string, all: any[][], mod?: IoModule | null): Job => {
  const h = findHeaderRow(all);
  const headers = (all[h] || []).map((c, i) => (String(c ?? "").trim() ? c : `Column ${i + 1}`));
  const m = mod === undefined ? detectModule(headers, sheet) : mod;
  return { sheet, headers, rows: all.slice(h + 1), firstRow: h + 2, mod: m, mapping: m ? autoMap(headers, m) : headers.map(() => null), policy: "fill" };
};
const sample = (job: Job, col: number) => job.rows.map((r) => r[col]).filter((v) => v !== "" && v != null).slice(0, 2).map((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v))).join(" · ");

export default function ImportWizard({ open, onClose, stores, say }: { open: boolean; onClose: () => void; stores: Record<string, Store>; say: (m: string) => void }) {
  const [step, setStep] = useState<"upload" | "sheets" | "map" | "review" | "done">("upload");
  const [fileName, setFileName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cur, setCur] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const [undo, setUndo] = useState<Record<string, any[]> | null>(null);
  const [result, setResult] = useState<{ label: string; c: ReturnType<typeof summarize> }[]>([]);

  const active = jobs.filter((j) => j.mod);
  const job = active[cur];
  const setJob = (patch: Partial<Job>) => setJobs((js) => js.map((j) => (j === job ? { ...j, ...patch } : j)));

  const reset = () => { setStep("upload"); setJobs([]); setCur(0); setErr(""); setFileName(""); setUndo(null); setResult([]); };
  const close = () => { reset(); onClose(); };

  const load = async (file: File) => {
    setBusy(true); setErr("");
    try {
      const sheets = await readFile(file);
      if (!sheets.length) throw new Error("empty");
      const js = sheets.map((s) => makeJob(s.name, s.rows)).filter((j) => j.rows.length);
      if (!js.length) throw new Error("empty");
      // one sheet: always import it, even if we couldn't tell what it is
      if (js.length === 1 && !js[0].mod) { const m = moduleById("buy"); js[0] = { ...js[0], mod: m, mapping: autoMap(js[0].headers, m) }; }
      setFileName(file.name); setJobs(js); setCur(0);
      setStep(js.length > 1 ? "sheets" : "map");
    } catch {
      setErr("Couldn't read that file. Use .xlsx, .xls, .csv or .ods with a header row.");
    }
    setBusy(false);
  };

  const plans = useMemo(() => (step === "review" || step === "done") ? active.map((j) => planImport(j.rows, j.headers, j.mapping, j.mod!, stores[j.mod!.id].rows, j.policy, j.firstRow)) : [], [step, jobs, stores]); // eslint-disable-line

  const doImport = () => {
    const snap: Record<string, any[]> = {};
    const next: Record<string, any[]> = {};
    active.forEach((j, i) => {
      const id = j.mod!.id, s = stores[id];
      if (!snap[id]) snap[id] = s.rows;
      const base = next[id] || s.rows;
      next[id] = applyPlan(base, plans[i], j.mod!, uid);
    });
    Object.entries(next).forEach(([id, rows]) => { const s = stores[id]; s.set(s.after ? s.after(rows) : rows); });
    setUndo(snap);
    setResult(active.map((j, i) => ({ label: `${j.mod!.label}${active.length > 1 ? ` (${j.sheet})` : ""}`, c: summarize(plans[i]) })));
    setStep("done");
  };
  const doUndo = () => { if (!undo) return; Object.entries(undo).forEach(([id, rows]) => stores[id].set(rows)); setUndo(null); say("Import undone"); close(); };

  /* ---------- steps ---------- */
  const title = (t: string, sub?: string) => (<div><div className="text-base font-bold text-slate-900">{t}</div>{sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}</div>);

  let body: any = null, footer: any = null, head: any = null;

  if (step === "upload") {
    head = title("Import data", "Excel or CSV from anywhere: another CRM, Tally, IndiaMART, JustDial, Google Sheets.");
    body = (
      <div className="space-y-4">
        <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; f && load(f); }}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center cursor-pointer transition ${drag ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:bg-slate-50"}`}>
          <Upload size={28} className="text-orange-600" />
          <span className="text-sm font-semibold text-slate-800">{busy ? "Reading…" : "Choose a file or drop it here"}</span>
          <span className="text-xs text-slate-500">.xlsx · .xls · .csv · .ods</span>
          <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; f && load(f); e.target.value = ""; }} />
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Starting from scratch? Fill a sample file:</p>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => <button key={m.id} onClick={() => downloadTemplate(m)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"><FileSpreadsheet size={13} className="text-green-700" />{m.label}</button>)}
          </div>
        </div>
        <ol className="text-xs text-slate-500 space-y-1 list-decimal pl-4">
          <li>Upload the file. Every sheet in it is checked.</li>
          <li>Check how its columns match Taazu's fields.</li>
          <li>See what will be added, updated or skipped, then import. You can undo right after.</li>
        </ol>
      </div>
    );
  }

  if (step === "sheets") {
    head = title("Which sheets to import?", fileName);
    body = (
      <div className="space-y-2">
        {jobs.map((j, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-900 truncate">{j.sheet}</div><div className="text-xs text-slate-500">{j.rows.filter((r) => r.some((c) => c !== "")).length} rows · {j.headers.length} columns</div></div>
            <select className={`${inputCls} !w-40`} value={j.mod?.id || ""} onChange={(e) => {
              const m = e.target.value ? moduleById(e.target.value) : null;
              setJobs((js) => js.map((x, k) => (k === i ? { ...x, mod: m, mapping: m ? autoMap(x.headers, m) : x.headers.map(() => null) } : x)));
            }}>
              <option value="">Don't import</option>
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        ))}
      </div>
    );
    footer = <div className="flex gap-2"><button className={btnGhost} onClick={reset}><ArrowLeft size={16} />Back</button><button className={`${btnPrimary} flex-1`} disabled={!active.length} onClick={() => { setCur(0); setStep("map"); }}>Match columns<ArrowRight size={16} /></button></div>;
  }

  if (step === "map" && job) {
    const mod = job.mod!;
    const used = new Map<string, number>();
    job.mapping.forEach((k) => k && k !== NOTES && used.set(k, (used.get(k) || 0) + 1));
    const missing = mod.fields.filter((f) => f.required && !used.has(f.k));
    const doubled = mod.fields.filter((f) => (used.get(f.k) || 0) > 1);
    const matched = job.mapping.filter(Boolean).length;
    head = title(`Match columns${active.length > 1 ? ` · ${cur + 1} of ${active.length}` : ""}`, `${job.sheet} · ${job.rows.length} rows · ${matched} of ${job.headers.length} columns matched`);
    body = (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 shrink-0">Import into</span>
          <select className={inputCls} value={mod.id} onChange={(e) => { const m = moduleById(e.target.value); setJob({ mod: m, mapping: autoMap(job.headers, m) }); }}>
            {MODULES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <button title="Match again automatically" aria-label="Match again automatically" className={btnGhost} onClick={() => setJob({ mapping: autoMap(job.headers, mod) })}><Wand2 size={16} /></button>
        </div>
        {missing.length > 0 && <p className="text-xs text-red-600 flex gap-1.5"><AlertTriangle size={14} className="shrink-0" />Pick a column for {missing.map((f) => f.label).join(", ")}. It's required.</p>}
        {doubled.length > 0 && <p className="text-xs text-amber-700 flex gap-1.5"><AlertTriangle size={14} className="shrink-0" />{doubled.map((f) => f.label).join(", ")} has more than one column; their values will be joined.</p>}
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {job.headers.map((h, col) => {
            const k = job.mapping[col];
            const auto = k && k !== NOTES && headerScore(h, mod.fields.find((f) => f.k === k)!) >= 45;
            return (
              <div key={col} className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 px-3 py-2.5 items-center">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{String(h)}</div>
                  <div className="text-xs text-slate-500 truncate">{sample(job, col) || "empty"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select className={`${inputCls} ${!k ? "text-slate-400" : ""}`} value={k || ""} onChange={(e) => setJob({ mapping: job.mapping.map((x, i) => (i === col ? e.target.value || null : x)) })}>
                    <option value="">Don't import</option>
                    <option value={NOTES}>Add to notes</option>
                    <optgroup label={`${mod.label} fields`}>
                      {mod.fields.map((f) => <option key={f.k} value={f.k}>{f.label}{f.required ? " *" : ""}{used.has(f.k) && k !== f.k ? " (used)" : ""}</option>)}
                    </optgroup>
                  </select>
                  {k && <span className={`shrink-0 ${auto ? "text-green-600" : "text-slate-300"}`} title={auto ? "Matched automatically" : "Set by you"}><Check size={16} /></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    footer = (
      <div className="flex gap-2">
        <button className={btnGhost} onClick={() => (cur > 0 ? setCur(cur - 1) : jobs.length > 1 ? setStep("sheets") : reset())}><ArrowLeft size={16} />Back</button>
        <button className={`${btnPrimary} flex-1 disabled:opacity-40`} disabled={missing.length > 0} onClick={() => (cur < active.length - 1 ? setCur(cur + 1) : setStep("review"))}>
          {cur < active.length - 1 ? "Next sheet" : "Review"}<ArrowRight size={16} />
        </button>
      </div>
    );
  }

  if (step === "review") {
    const totals = plans.map(summarize);
    const adds = totals.reduce((s, c) => s + c.create, 0), ups = totals.reduce((s, c) => s + c.update, 0);
    head = title("Review before importing", fileName);
    body = (
      <div className="space-y-5">
        {active.map((j, i) => {
          const c = totals[i], plan = plans[i];
          const shown = plan.filter((p) => p.action !== "unchanged").slice(0, 60);
          return (
            <section key={i} className="space-y-3">
              {active.length > 1 && <h3 className="text-sm font-bold text-slate-900">{j.sheet} → {j.mod!.label}</h3>}
              {j.mod!.dedupe.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">When a row matches an existing {j.mod!.noun} (by {j.mod!.dedupe.map((s) => s.map((k) => j.mod!.fields.find((f) => f.k === k)?.label).join(" + ")).join(", ")})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {POLICIES.map((p) => (
                      <button key={p.id} onClick={() => setJobs((js) => js.map((x) => (x === j ? { ...x, policy: p.id } : x)))}
                        className={`rounded-xl border px-3 py-2 text-left ${j.policy === p.id ? "border-orange-400 bg-orange-50" : "border-slate-200"}`}>
                        <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                <span className={`rounded-full px-2.5 py-1 ${TONE.create}`}>{c.create} new</span>
                {c.update > 0 && <span className={`rounded-full px-2.5 py-1 ${TONE.update}`}>{c.update} updated</span>}
                {c.unchanged > 0 && <span className={`rounded-full px-2.5 py-1 ${TONE.unchanged}`}>{c.unchanged} already up to date</span>}
                {c.duplicate > 0 && <span className={`rounded-full px-2.5 py-1 ${TONE.duplicate}`}>{c.duplicate} duplicates skipped</span>}
                {c.error > 0 && <span className={`rounded-full px-2.5 py-1 ${TONE.error}`}>{c.error} can't import</span>}
                {c.warnings > 0 && <span className="rounded-full px-2.5 py-1 text-amber-700 bg-amber-50">{c.warnings} with warnings</span>}
              </div>
              {(c.error > 0 || c.warnings > 0 || c.duplicate > 0) && <button className="text-xs font-semibold text-orange-700 inline-flex items-center gap-1" onClick={() => downloadReport(fileName, j.headers, plan)}><Download size={13} />Download report of these rows</button>}
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[40dvh] overflow-y-auto">
                {shown.length === 0 && <p className="px-3 py-3 text-sm text-slate-500">Nothing new in this sheet.</p>}
                {shown.map((p) => <PreviewRow key={p.row} p={p} mod={j.mod!} />)}
                {plan.filter((p) => p.action !== "unchanged").length > shown.length && <p className="px-3 py-2 text-xs text-slate-500">…and {plan.filter((p) => p.action !== "unchanged").length - shown.length} more</p>}
              </div>
            </section>
          );
        })}
      </div>
    );
    footer = (
      <div className="flex gap-2">
        <button className={btnGhost} onClick={() => { setCur(active.length - 1); setStep("map"); }}><ArrowLeft size={16} />Back</button>
        <button className={`${btnPrimary} flex-1 disabled:opacity-40`} disabled={!adds && !ups} onClick={doImport}>
          {adds || ups ? `Import${adds ? ` ${adds} new` : ""}${adds && ups ? " ·" : ""}${ups ? ` update ${ups}` : ""}` : "Nothing to import"}
        </button>
      </div>
    );
  }

  if (step === "done") {
    head = title("Import finished", fileName);
    body = (
      <div className="space-y-3">
        {result.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 px-3 py-2.5">
            <div className="text-sm font-semibold text-slate-900">{r.label}</div>
            <div className="text-xs text-slate-600">{r.c.create} added · {r.c.update} updated · {r.c.duplicate} skipped as duplicates{r.c.error ? ` · ${r.c.error} not imported` : ""}</div>
            {(r.c.error > 0 || r.c.warnings > 0) && <button className="mt-1 text-xs font-semibold text-orange-700 inline-flex items-center gap-1" onClick={() => downloadReport(fileName, active[i].headers, plans[i])}><Download size={13} />Download error report</button>}
          </div>
        ))}
        <p className="text-xs text-slate-500">Everything is synced to your team. Imported records you didn't expect? Undo puts back exactly what was there before.</p>
      </div>
    );
    footer = <div className="flex gap-2">{undo && <button className={btnGhost} onClick={doUndo}><Undo2 size={16} />Undo import</button>}<button className={`${btnPrimary} flex-1`} onClick={() => { say("Import done"); close(); }}>Done</button></div>;
  }

  return <Sheet open={open} onClose={step === "done" ? () => { say("Import done"); close(); } : close} title={head} footer={footer}>{body}</Sheet>;
}

function PreviewRow({ p, mod }: { p: PlanRow; mod: IoModule }) {
  const name = p.record.name || p.record.task || p.record.bucket || p.record.customer || p.record.venue || p.matchName || "(no name)";
  const changed = p.action === "update" && p.patch ? Object.keys(p.patch).map((k) => mod.fields.find((f) => f.k === k)?.label || k) : [];
  const facts = p.action === "create" ? mod.fields.filter((f) => p.record[f.k] !== undefined && !["name", "task", "bucket"].includes(f.k)).slice(0, 4).map((f) => String(p.record[f.k])) : [];
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400 w-8 shrink-0">#{p.row}</span>
        <span className="min-w-0 flex-1 text-sm font-medium text-slate-900 truncate">{name}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[p.action]}`}>{ACTION_LABEL[p.action]}</span>
      </div>
      <div className="pl-10 text-xs text-slate-500">
        {facts.length > 0 && <div className="truncate">{facts.join(" · ")}</div>}
        {p.matchedBy && p.action !== "duplicate" && <div>Matches <b>{p.matchName}</b> by {p.matchedBy}{changed.length ? `: sets ${changed.join(", ")}` : ""}</div>}
        {p.action === "duplicate" && p.matchName && !p.warnings.some((w) => w.startsWith("Same")) && <div>Already have <b>{p.matchName}</b> (same {p.matchedBy})</div>}
        {p.errors.map((e, i) => <div key={"e" + i} className="text-red-600">{e}</div>)}
        {p.warnings.map((w, i) => <div key={"w" + i} className="text-amber-700">{w}</div>)}
      </div>
    </div>
  );
}
