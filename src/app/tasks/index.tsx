import { useMemo, useState } from "react";
import { Plus, Circle, CheckCircle2, CalendarClock, Trash2, ListChecks, Layers, Check, ScrollText } from "lucide-react";
import CallScript from "./CallScript";
import Sheet from "../../components/Sheet";
import { Empty, inputCls } from "../../components/ui";
import { uid, today } from "../../lib/core";
import { usePrefs } from "../../lib/prefs";

type Task = { id: string; phase: string; task: string; due: string; status: string; notes?: string };

const STATUSES = ["To do", "Doing", "Done"];
const ST_COL: Record<string, string> = { "To do": "#64748B", Doing: "#D97706", Done: "#16A34A" };
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmt = (d: string) => (d ? new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No date");
const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;

const bucketOf = (t: Task) => {
  const t0 = today(), wk = addDays(7);
  if (!t.due) return "Later";
  if (t.due < t0) return "Overdue";
  if (t.due === t0) return "Today";
  if (t.due <= wk) return "This week";
  return "Later";
};
const BUCKETS = ["Overdue", "Today", "This week", "Later"];
const B_COL: Record<string, string> = { Overdue: "#DC2626", Today: "#EA580C", "This week": "#2563EB", Later: "#64748B" };

function TaskRow({ t, onToggle, onOpen }: { t: Task; onToggle: (t: Task) => void; onOpen: (t: Task) => void }) {
  const done = t.status === "Done";
  const late = !done && t.due && t.due < today();
  return (
    <div className="flex items-stretch bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button onClick={() => onToggle(t)} aria-label={done ? "Mark not done" : "Mark done"} className={`shrink-0 w-14 flex items-center justify-center active:bg-slate-50 ${done ? "text-green-600" : "text-slate-300"}`}>
        {done ? <CheckCircle2 size={26} /> : <Circle size={26} />}
      </button>
      <button onClick={() => onOpen(t)} className="min-w-0 flex-1 text-left py-3 pr-4 active:bg-slate-50">
        <div className={`text-sm font-medium leading-snug ${done ? "line-through text-slate-400" : "text-slate-900"}`}>{t.task}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className={`inline-flex items-center gap-1 ${late ? "text-red-600 font-semibold" : "text-slate-500"}`}><CalendarClock size={12} />{fmt(t.due)}</span>
          <span className="text-slate-400">{t.phase}</span>
          {t.status === "Doing" && <span className="font-semibold text-amber-600">In progress</span>}
        </div>
        {t.notes && <div className="mt-1 text-xs text-slate-500 line-clamp-1">{t.notes}</div>}
      </button>
    </div>
  );
}

export default function TasksView({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const { on } = usePrefs();
  // Call script comes first — the team reads it far more than the task list.
  const [chosen, setTab] = useState<"script" | "open" | "phases" | "done">("script");
  const tabList = ([["script", "Script", ScrollText], ["open", "To do", ListChecks], ["phases", "Phases", Layers], ["done", "Done", Check]] as const).filter(([id]) => id === "script" || id === "open" || on("tasks." + id));
  const tab = tabList.some(([id]) => id === chosen) ? chosen : "script";
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(today());
  const [openId, setOpenId] = useState<string | null>(null);

  const up = (id: string, p: Partial<Task>) => setTasks(tasks.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const toggle = (t: Task) => up(t.id, { status: t.status === "Done" ? "To do" : "Done" });
  const phases = useMemo(() => Array.from(new Set(tasks.map((t) => t.phase).filter(Boolean))), [tasks]);
  const open = tasks.filter((t) => t.status !== "Done").sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  const done = tasks.filter((t) => t.status === "Done");
  const overdue = open.filter((t) => bucketOf(t) === "Overdue").length;
  const dueToday = open.filter((t) => bucketOf(t) === "Today").length;
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const cur = tasks.find((t) => t.id === openId) || null;

  const add = () => {
    if (!title.trim()) return;
    const phase = open[0]?.phase || phases[0] || "Week 1";
    setTasks([{ id: uid(), phase, task: title.trim(), due, status: "To do", notes: "" }, ...tasks]);
    setTitle("");
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {([["Overdue", overdue, "#DC2626"], ["Today", dueToday, "#EA580C"], ["Open", open.length, "#2563EB"], ["Done", `${pct}%`, "#16A34A"]] as const).map(([l, n, c]) => (
          <div key={l} className="rounded-2xl bg-white border border-slate-200 px-2 py-2.5 text-center">
            <div className="text-xl font-bold" style={{ color: c }}>{n}</div>
            <div className="text-[11px] text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      <div className="sticky top-[calc(57px+env(safe-area-inset-top))] md:top-0 z-10 -mx-4 px-4 py-2 bg-slate-50/90 backdrop-blur">
        <div className="grid rounded-xl bg-slate-200/70 p-1" style={{ gridTemplateColumns: `repeat(${tabList.length}, minmax(0, 1fr))` }}>
          {tabList.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        {tab !== "script" && <>
        <div className="mt-2 flex gap-2">
          <input className={inputCls} placeholder="Add a task…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} enterKeyHint="done" />
          <button onClick={add} disabled={!title.trim()} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white disabled:opacity-40 active:bg-orange-700"><Plus size={16} />Add</button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {([["Today", 0], ["Tomorrow", 1], ["3 days", 3], ["Next week", 7]] as const).map(([l, n]) => <button key={l} className={chip(due === addDays(n))} onClick={() => setDue(addDays(n))}>{l}</button>)}
          <input type="date" className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        </>}
      </div>

      <div className="mt-3 space-y-5">
        {tab === "script" && <CallScript />}
        {tab === "open" && (open.length ? BUCKETS.map((b) => {
          const list = open.filter((t) => bucketOf(t) === b);
          if (!list.length) return null;
          return (
            <section key={b}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: B_COL[b] }}>{b}<span className="text-slate-400 font-normal">{list.length}</span></h2>
              <div className="grid gap-2 md:grid-cols-2">{list.map((t) => <TaskRow key={t.id} t={t} onToggle={toggle} onOpen={(x) => setOpenId(x.id)} />)}</div>
            </section>
          );
        }) : <Empty icon={ListChecks} text="All tasks done. 🎉" />)}

        {tab === "phases" && phases.map((p) => {
          const all = tasks.filter((t) => t.phase === p);
          const d = all.filter((t) => t.status === "Done").length;
          return (
            <section key={p}>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-900">{p}</h2>
                <div className="h-1.5 flex-1 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-green-500" style={{ width: `${(d / all.length) * 100}%` }} /></div>
                <span className="text-xs text-slate-500">{d}/{all.length}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">{[...all].sort((a, b) => Number(a.status === "Done") - Number(b.status === "Done") || (a.due || "").localeCompare(b.due || "")).map((t) => <TaskRow key={t.id} t={t} onToggle={toggle} onOpen={(x) => setOpenId(x.id)} />)}</div>
            </section>
          );
        })}

        {tab === "done" && (done.length ? <div className="grid gap-2 md:grid-cols-2">{done.map((t) => <TaskRow key={t.id} t={t} onToggle={toggle} onOpen={(x) => setOpenId(x.id)} />)}</div> : <Empty icon={Check} text="Nothing finished yet." />)}
      </div>

      <TaskSheet t={cur} phases={phases} onClose={() => setOpenId(null)} onChange={(p) => cur && up(cur.id, p)} onDelete={() => { if (cur) { setTasks(tasks.filter((x) => x.id !== cur.id)); setOpenId(null); } }} />
    </div>
  );
}

function TaskSheet({ t, phases, onClose, onChange, onDelete }: { t: Task | null; phases: string[]; onClose: () => void; onChange: (p: Partial<Task>) => void; onDelete: () => void }) {
  const [arm, setArm] = useState(false);
  if (!t) return null;
  return (
    <Sheet open onClose={onClose} title={<input className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none" value={t.task} onChange={(e) => onChange({ task: e.target.value })} aria-label="Task" />}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Status</div>
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onChange({ status: s })} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold"
            style={t.status === s ? { background: ST_COL[s], borderColor: ST_COL[s], color: "#fff" } : { borderColor: "#E2E8F0", color: ST_COL[s] }}>{s}</button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block"><span className="text-xs text-slate-500">Due date</span><input type="date" className={inputCls + " mt-1"} value={t.due || ""} onChange={(e) => onChange({ due: e.target.value })} /></label>
        <label className="block"><span className="text-xs text-slate-500">Phase</span><input list="task-phases" className={inputCls + " mt-1"} value={t.phase} onChange={(e) => onChange({ phase: e.target.value })} />
          <datalist id="task-phases">{phases.map((p) => <option key={p} value={p} />)}</datalist></label>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {([["Today", 0], ["Tomorrow", 1], ["Next week", 7]] as const).map(([l, n]) => <button key={l} className={chip(t.due === addDays(n))} onClick={() => onChange({ due: addDays(n) })}>{l}</button>)}
      </div>
      <label className="mt-4 block"><span className="text-xs text-slate-500">Notes</span><textarea className={inputCls + " mt-1 min-h-[88px]"} value={t.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} /></label>
      <button onClick={() => (arm ? onDelete() : setArm(true))} className={`mt-6 w-full rounded-xl py-2.5 text-xs font-medium ${arm ? "bg-red-600 text-white" : "text-slate-400"}`}>
        <Trash2 size={13} className="inline mr-1" />{arm ? "Tap again to delete task" : "Delete task"}
      </button>
    </Sheet>
  );
}
