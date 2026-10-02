import { useMemo, useRef, useState } from "react";
import { MessageCircle, Plus, ChevronUp, ChevronDown, Trash2, Copy } from "lucide-react";
import { Panel, inputCls } from "../../components/ui";
import { uid } from "../../lib/core";
import { Switch } from ".";
import { SUPPLIER_CFG, BUYER_CFG } from "../crm/configs";
import type { CrmRecord } from "../crm/config";
import { PLACEHOLDERS, blankTemplate, fill, matches, useWaTemplates, type Tri, type WaTemplate } from "../crm/waTemplates";

const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 active:bg-slate-50"}`;
const Label = ({ children }) => <div className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{children}</div>;
const uniq = (xs: any[]) => [...new Set(xs.map((x) => String(x || "").trim()).filter(Boolean))].sort();
const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

/* Pick none = "all". */
function Multi({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className={chip(!value.length)} onClick={() => onChange([])}>All</button>
      {options.map((o) => <button key={o} className={chip(value.includes(o))} onClick={() => onChange(toggle(value, o))}>{o}</button>)}
    </div>
  );
}

function TriPick({ value, onChange, yes, no }: { value: Tri; onChange: (v: Tri) => void; yes: string; no: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {([["any", "Any"], ["yes", yes], ["no", no]] as const).map(([v, l]) => <button key={v} className={chip(value === v)} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

function Editor({ t, rows, onChange }: { t: WaTemplate; rows: CrmRecord[]; onChange: (p: Partial<WaTemplate>) => void }) {
  const cfg = t.kind === "sup" ? SUPPLIER_CFG : BUYER_CFG;
  const box = useRef<HTMLTextAreaElement>(null);
  const hit = rows.filter((r) => matches(t, r, cfg));
  const [pi, setPi] = useState(0);
  const sample = hit[pi % Math.max(hit.length, 1)];
  const insert = (k: string) => {
    const el = box.current, tag = `{${k}}`;
    const at = el ? el.selectionStart : t.body.length;
    onChange({ body: t.body.slice(0, at) + tag + t.body.slice(el ? el.selectionEnd : at) });
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = at + tag.length; } });
  };
  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-3">
      <input className={inputCls} value={t.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Template name" placeholder="Template name" />

      <Label>Message</Label>
      <textarea ref={box} className={inputCls + " min-h-[180px] text-xs"} value={t.body} onChange={(e) => onChange({ body: e.target.value })} aria-label="Message" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLACEHOLDERS.map((p) => (
          <button key={p.k} onClick={() => insert(p.k)} title={p.label} className="rounded-full border border-dashed border-orange-300 bg-white px-2 py-1 text-[11px] font-medium text-orange-700 active:bg-orange-50">{`{${p.k}}`}</button>
        ))}
      </div>
      <div className="mt-1.5 text-[11px] text-slate-500">Tap a field to insert it. <b>{"{contact|Sir}"}</b> means: contact name, or "Sir" if empty. Any card field works, e.g. <b>{"{gstin}"}</b>. *bold* and _italic_ work in WhatsApp.</div>

      <Label>Use this message for</Label>
      <div className="text-xs text-slate-500 mb-1.5">Category</div>
      <Multi options={uniq(rows.map((r) => r[cfg.catKey]))} value={t.cats} onChange={(cats) => onChange({ cats })} />
      <div className="text-xs text-slate-500 mb-1.5 mt-3">City</div>
      <Multi options={uniq(rows.map((r) => r.city))} value={t.cities} onChange={(cities) => onChange({ cities })} />
      <div className="text-xs text-slate-500 mb-1.5 mt-3">Stage</div>
      <Multi options={[...cfg.stages]} value={t.stages} onChange={(stages) => onChange({ stages })} />
      <div className="text-xs text-slate-500 mb-1.5 mt-3">⭐ Starred</div>
      <TriPick value={t.starred} onChange={(starred) => onChange({ starred })} yes="Only ⭐" no="Not ⭐" />
      {t.kind === "sup" && <>
        <div className="text-xs text-slate-500 mb-1.5 mt-3">Verified</div>
        <TriPick value={t.verified} onChange={(verified) => onChange({ verified })} yes="Only verified" no="Not verified" />
      </>}

      <Label>Preview · matches {hit.length} {cfg.noun}{hit.length === 1 ? "" : "s"}</Label>
      {sample ? (
        <>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="min-w-0 flex-1 truncate font-semibold">{sample.name}</span>
            {hit.length > 1 && <button onClick={() => setPi((i) => i + 1)} className="rounded-full border border-slate-200 bg-white px-2 py-1">Next ›</button>}
          </div>
          <div className="mt-1.5 whitespace-pre-wrap rounded-xl border border-green-200 bg-white p-3 text-xs text-slate-800">{fill(t.body, sample, cfg)}</div>
        </>
      ) : <div className="text-xs text-slate-400">No {cfg.noun} matches these rules yet.</div>}
    </div>
  );
}

/* Settings → WhatsApp messages. Team-wide: everyone sees the same templates. */
export default function WaTemplatesPanel({ sup, buy }: { sup: CrmRecord[]; buy: CrmRecord[] }) {
  const { list, setList } = useWaTemplates();
  const [kind, setKind] = useState<"sup" | "buy">("sup");
  const [openId, setOpenId] = useState<string | null>(null);
  const mine = useMemo(() => list.filter((t) => t.kind === kind), [list, kind]);
  const rows = kind === "sup" ? sup : buy;

  const patch = (id: string, p: Partial<WaTemplate>) => setList((l) => l.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const add = (from?: WaTemplate) => {
    const t = from ? { ...from, id: uid(), name: from.name + " (copy)" } : blankTemplate(kind, uid());
    setList((l) => [...l, t]); setOpenId(t.id);
  };
  const remove = (id: string) => setList((l) => l.filter((t) => t.id !== id));
  // Order matters: the first matching template wins. Move within the same kind.
  const move = (id: string, dir: -1 | 1) => setList((l) => {
    const ids = l.filter((t) => t.kind === kind).map((t) => t.id);
    const i = ids.indexOf(id), j = i + dir;
    if (j < 0 || j >= ids.length) return l;
    const a = l.findIndex((t) => t.id === ids[i]), b = l.findIndex((t) => t.id === ids[j]);
    const next = [...l]; [next[a], next[b]] = [next[b], next[a]]; return next;
  });

  return (
    <Panel title="WhatsApp messages" icon={MessageCircle}>
      <p className="mb-3 text-xs text-slate-500">Write your own WhatsApp messages with fields like {"{who}"} and {"{name}"}, and set rules for who gets which one. The WhatsApp button on a card sends the first matching message from the top. If none matches, the built-in message is used. Shared with your team.</p>
      <div className="grid grid-cols-2 gap-2">
        {([["sup", "Suppliers"], ["buy", "Buyers"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => { setKind(k); setOpenId(null); }} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${kind === k ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 text-slate-600"}`}>
            {l} ({list.filter((t) => t.kind === k).length})
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {mine.map((t, i) => {
          const cfg = t.kind === "sup" ? SUPPLIER_CFG : BUYER_CFG;
          const n = rows.filter((r) => matches(t, r, cfg)).length;
          const rules = [t.cats.join(", "), t.cities.join(", "), t.stages.join(", "), t.starred === "yes" ? "only ⭐" : t.starred === "no" ? "not ⭐" : "", t.verified === "yes" ? "verified" : t.verified === "no" ? "not verified" : ""].filter(Boolean).join(" · ") || "Everyone";
          const open = openId === t.id;
          return (
            <div key={t.id} className="py-3">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-semibold text-slate-400">{i + 1}</span>
                <button onClick={() => setOpenId(open ? null : t.id)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
                  <div className={`truncate text-sm font-semibold ${t.on ? "text-slate-900" : "text-slate-400"}`}>{t.name || "Untitled"}</div>
                  <div className="truncate text-xs text-slate-500">{rules} · {n} match</div>
                </button>
                <button onClick={() => move(t.id, -1)} disabled={i === 0} aria-label="Move up" className="p-1 text-slate-400 disabled:opacity-30"><ChevronUp size={16} /></button>
                <button onClick={() => move(t.id, 1)} disabled={i === mine.length - 1} aria-label="Move down" className="p-1 text-slate-400 disabled:opacity-30"><ChevronDown size={16} /></button>
                <Switch on={t.on} onChange={(v) => patch(t.id, { on: v })} label={`Use ${t.name}`} />
              </div>
              {open && (
                <>
                  <Editor t={t} rows={rows} onChange={(p) => patch(t.id, p)} />
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => add(t)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600"><Copy size={13} />Duplicate</button>
                    <button onClick={() => remove(t.id)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600"><Trash2 size={13} />Delete</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {!mine.length && <div className="py-3 text-xs text-slate-400">No custom messages yet. The built-in message is used for every {kind === "sup" ? "supplier" : "buyer"}.</div>}
      </div>

      <button onClick={() => add()} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white active:bg-orange-700"><Plus size={16} />New message</button>
    </Panel>
  );
}
