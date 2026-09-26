import { useMemo, useRef, useState } from "react";
import { Check, Copy, FileUp, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import Sheet from "../../components/Sheet";
import { Empty, Tag, btnGhost, btnPrimary, inputCls } from "../../components/ui";
import { uid, today } from "../../lib/core";
import Markdown, { parseMarkdown } from "./markdown";

/*
 * Plans: each plan is its own card, so several plans never mix.
 * A plan is Markdown text (headings, lists, tables, > quoted messages).
 * Import a .md / .txt file (or paste) as a new plan, or to update one card.
 */

export type Plan = { id: string; title: string; period?: string; status: string; body: string; updated?: string; by?: string; _o?: number };
export const PLAN_STATUS = ["Active", "Draft", "Done"];
const STATUS_TONE: Record<string, string> = { Active: "#EA580C", Draft: "#64748B", Done: "#16A34A" };

/* Title = first "# " heading; a "(...)" at its end becomes the period. */
export function readPlan(text: string, fallback = "Untitled plan") {
  const h = (text || "").match(/^#\s+(.+)$/m);
  let title = (h ? h[1] : fallback).trim();
  let period = "";
  const p = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  if (p && p[1]) { title = p[1].trim(); period = p[2].trim(); }
  return { title, period };
}

/* First paragraph under the title, used as the card summary. */
const summary = (body: string) => {
  const b = parseMarkdown(body).find((x) => x.t === "p") as any;
  return b ? b.text.replace(/\*\*|`|_/g, "") : "";
};
const sections = (body: string) => parseMarkdown(body).filter((x) => x.t === "h" && x.level === 2).length;

export default function PlansView({ plans, setPlans, me = "" }: { plans: Plan[]; setPlans: (fn: (p: Plan[]) => Plan[]) => void; me?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [importFor, setImportFor] = useState<string | null>(null); // null = closed, "" = pick target, id = update that plan
  const [filter, setFilter] = useState("All");
  const cur = plans.find((p) => p.id === openId) || null;

  const ordered = useMemo(() => {
    const rank = (s: string) => (PLAN_STATUS.indexOf(s) + 4) % 4; // Active, Draft, Done, then anything else
    return [...plans].sort((a, b) => rank(a.status) - rank(b.status) || (b.updated || "").localeCompare(a.updated || ""));
  }, [plans]);
  const shown = filter === "All" ? ordered : ordered.filter((p) => p.status === filter);
  const number = new Map([...plans].sort((a, b) => (a._o ?? 0) - (b._o ?? 0)).map((p, i) => [p.id, i + 1]));

  const save = (id: string, patch: Partial<Plan>) => setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, updated: today(), by: me } : p)));
  const add = (text: string, fallbackTitle?: string) => {
    const { title, period } = readPlan(text, fallbackTitle);
    const p: Plan = { id: uid(), title, period, status: "Active", body: text, updated: today(), by: me, _o: Date.now() };
    setPlans((ps) => [...ps, p]);
    return p.id;
  };
  const remove = (id: string) => { setPlans((ps) => ps.filter((p) => p.id !== id)); setOpenId(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => setImportFor("")}><FileUp size={16} />Import plan</button>
        <button className={btnGhost} onClick={() => setOpenId(add("# New plan\n\nGoal: \n\n## Steps\n- \n", "New plan"))}><Plus size={16} />New plan</button>
        <div className="ml-auto flex gap-1.5">
          {["All", ...PLAN_STATUS].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === s ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}>{s}</button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <button key={p.id} onClick={() => setOpenId(p.id)} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-200 active:scale-[.99]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-orange-600">Plan {number.get(p.id)}</span>
                <span className="ml-auto"><Tag color={STATUS_TONE[p.status] || "#64748B"}>{p.status}</Tag></span>
              </div>
              <div className="mt-1 font-bold leading-snug text-slate-900">{p.title}</div>
              {p.period && <div className="text-xs text-slate-500">{p.period}</div>}
              {summary(p.body) && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{summary(p.body)}</p>}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                <span>{sections(p.body)} sections</span>
                {p.updated && <span>· updated {p.updated}{p.by ? ` by ${p.by}` : ""}</span>}
                <span className="ml-auto font-semibold text-orange-700">Open</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Empty icon={NotebookPen} text={plans.length ? `No ${filter.toLowerCase()} plans.` : "No plans yet. Import a plan file (.md or .txt) or start a new one."} />
      )}

      {cur && <PlanSheet plan={cur} n={number.get(cur.id)} onClose={() => setOpenId(null)} save={save} remove={remove} onUpdateFromFile={() => setImportFor(cur.id)} />}
      {importFor !== null && (
        <ImportSheet plans={ordered} target={importFor} onClose={() => setImportFor(null)}
          onDone={(text, name, targetId) => {
            if (targetId) { const { title, period } = readPlan(text, plans.find((p) => p.id === targetId)?.title); save(targetId, { body: text, title, period }); setOpenId(targetId); }
            else setOpenId(add(text, name));
            setImportFor(null);
          }} />
      )}
    </div>
  );
}

function PlanSheet({ plan, n, onClose, save, remove, onUpdateFromFile }: { plan: Plan; n?: number; onClose: () => void; save: (id: string, p: Partial<Plan>) => void; remove: (id: string) => void; onUpdateFromFile: () => void }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(plan.body);
  const [arm, setArm] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyAll = async () => { try { await navigator.clipboard.writeText(plan.body); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const saveEdit = () => { const { title, period } = readPlan(draft, plan.title); save(plan.id, { body: draft, title, period }); setEdit(false); };

  return (
    <Sheet open onClose={onClose}
      title={<div><div className="text-[11px] font-bold uppercase tracking-wide text-orange-600">Plan {n}</div><div className="font-bold leading-snug text-slate-900">{plan.title}</div>{plan.period && <div className="text-xs text-slate-500">{plan.period}</div>}</div>}
      footer={edit ? (
        <div className="flex gap-2"><button className={btnGhost} onClick={() => { setDraft(plan.body); setEdit(false); }}>Cancel</button><button className={`${btnPrimary} flex-1`} onClick={saveEdit}><Check size={16} />Save plan</button></div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} onClick={() => { setDraft(plan.body); setEdit(true); }}><Pencil size={16} />Edit</button>
          <button className={btnGhost} onClick={onUpdateFromFile}><FileUp size={16} />Update from file</button>
          <button className={btnGhost} onClick={copyAll}>{copied ? <Check size={16} /> : <Copy size={16} />}Copy</button>
          <button className={`${btnGhost} ml-auto ${arm ? "!border-red-300 !text-red-600" : ""}`} onClick={() => { if (arm) remove(plan.id); else { setArm(true); setTimeout(() => setArm(false), 4000); } }}>
            <Trash2 size={16} />{arm ? "Tap again to delete" : "Delete"}
          </button>
        </div>
      )}>
      <div className="mb-4 flex gap-1.5">
        {PLAN_STATUS.map((s) => (
          <button key={s} onClick={() => save(plan.id, { status: s })} className={`rounded-full border px-3 py-1 text-xs font-semibold ${plan.status === s ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500"}`}>{s}</button>
        ))}
        {plan.updated && <span className="ml-auto self-center text-[11px] text-slate-400">Updated {plan.updated}{plan.by ? ` · ${plan.by}` : ""}</span>}
      </div>
      {edit ? (
        <textarea className={`${inputCls} min-h-[55dvh] font-mono text-xs leading-relaxed`} value={draft} onChange={(e) => setDraft(e.target.value)} />
      ) : (
        <Markdown src={plan.body} hideTitle />
      )}
    </Sheet>
  );
}

function ImportSheet({ plans, target, onClose, onDone }: { plans: Plan[]; target: string; onClose: () => void; onDone: (text: string, name: string, targetId: string) => void }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [into, setInto] = useState(target); // "" = new plan
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const info = text.trim() ? readPlan(text, name || "Untitled plan") : null;
  // Same title as an existing plan: suggest updating that card instead of making a copy.
  const same = info && !target ? plans.find((p) => p.title.trim().toLowerCase() === info.title.toLowerCase()) : null;

  const pick = async (f?: File | null) => {
    if (!f) return;
    setErr("");
    if (f.size > 1_000_000) { setErr("That file is over 1 MB. Plans are text files (.md or .txt)."); return; }
    const t = await f.text();
    const base = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
    setText(t); setName(base);
    if (!target) { const title = readPlan(t, base).title.toLowerCase(); const m = plans.find((p) => p.title.trim().toLowerCase() === title); setInto(m ? m.id : ""); }
  };

  return (
    <Sheet open onClose={onClose} z="z-[60]"
      title={<div className="font-bold text-slate-900">{target ? "Update plan from file" : "Import plan"}</div>}
      footer={<button className={`${btnPrimary} w-full`} disabled={!text.trim()} onClick={() => onDone(text, name, into)}>{into ? "Replace this plan's text" : "Add as a new plan card"}</button>}>
      <div className="space-y-3">
        <input ref={file} type="file" accept=".md,.markdown,.txt,text/plain,text/markdown" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        <button className={`${btnGhost} w-full`} onClick={() => file.current?.click()}><FileUp size={16} />Choose a .md or .txt file</button>
        <div className="text-center text-xs text-slate-400">or paste the plan text</div>
        <textarea className={`${inputCls} min-h-[160px] font-mono text-xs`} placeholder={"# Plan title (dates)\n\nGoal: ...\n\n## Week 1\n- ..."} value={text} onChange={(e) => setText(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        {info && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <div className="text-xs text-slate-500">Title</div>
            <div className="font-semibold text-slate-900">{info.title}</div>
            {info.period && <div className="text-xs text-slate-500">{info.period}</div>}
          </div>
        )}
        {!target && (
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Put it in</span>
            <select className={inputCls} value={into} onChange={(e) => setInto(e.target.value)}>
              <option value="">A new plan card</option>
              {plans.map((p) => <option key={p.id} value={p.id}>Update: {p.title}</option>)}
            </select>
          </label>
        )}
        {same && into !== same.id && <p className="text-xs text-amber-700">A plan called “{same.title}” already exists. Pick it above to update it instead of making a second card.</p>}
        {into && <p className="text-xs text-slate-500">The card keeps its status; only the text, title and dates are replaced.</p>}
      </div>
    </Sheet>
  );
}
