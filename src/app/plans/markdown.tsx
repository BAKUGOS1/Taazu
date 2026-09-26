import { useState } from "react";
import { Check, Copy } from "lucide-react";

/*
 * Small Markdown reader for plans: headings, paragraphs, lists, tables,
 * quotes, rules, **bold**, *italic*, `code`. Builds React elements (no raw
 * HTML), so an imported file can never inject markup into the app.
 * Quotes get a Copy button: plans keep ready-to-send WhatsApp messages there.
 */

type Block =
  | { t: "h"; level: number; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "quote"; lines: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "hr" };

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

export function parseMarkdown(src: string): Block[] {
  const lines = (src || "").replace(/\r\n?/g, "\n").split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { out.push({ t: "h", level: m[1].length, text: m[2].trim() }); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push({ t: "hr" }); i++; continue; }
    if (/^\s*>/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push({ t: "quote", lines: q });
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
      out.push({ t: "table", head, rows });
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i++].replace(re, "");
        // indented continuation lines belong to the same item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !re.test(lines[i])) item += " " + lines[i++].trim();
        items.push(item);
      }
      out.push(ordered ? { t: "ol", items } : { t: "ul", items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*>|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[i]) && !(lines[i].includes("|") && isTableSep(lines[i + 1] || ""))) para.push(lines[i++].trim());
    out.push({ t: "p", text: para.join(" ") });
  }
  return out;
}

/* **bold**, *italic* / _italic_, `code` */
export function Inline({ text }: { text: string }) {
  const parts: any[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const s = m[0];
    if (s.startsWith("**")) parts.push(<strong key={k++} className="font-semibold text-slate-900">{s.slice(2, -2)}</strong>);
    else if (s.startsWith("`")) parts.push(<code key={k++} className="rounded bg-slate-100 px-1 text-[0.9em]">{s.slice(1, -1)}</code>);
    else parts.push(<em key={k++}>{s.slice(1, -1)}</em>);
    last = m.index + s.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/* Plain text of a quote, ready to paste into WhatsApp (keeps *bold* as WhatsApp bold). */
const plain = (lines: string[]) => lines.join("\n").replace(/\*\*([^*]+)\*\*/g, "*$1*").replace(/`([^`]+)`/g, "$1").trim();

function Quote({ lines }: { lines: string[] }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(plain(lines)); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="relative rounded-2xl border border-orange-100 bg-orange-50/60 p-3 pr-11 text-sm text-slate-700">
      {lines.map((l, i) => (l.trim() ? <p key={i} className="leading-relaxed"><Inline text={l} /></p> : <div key={i} className="h-2" />))}
      <button onClick={copy} aria-label="Copy message" className="absolute right-2 top-2 rounded-lg p-1.5 text-orange-700 hover:bg-orange-100">
        {done ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function Markdown({ src, hideTitle = false }: { src: string; hideTitle?: boolean }) {
  let blocks = parseMarkdown(src);
  // The sheet already shows the plan title, so skip a leading "# Title".
  if (hideTitle && blocks[0]?.t === "h" && blocks[0].level === 1) blocks = blocks.slice(1);
  return (
    <div className="space-y-3 text-sm text-slate-700">
      {blocks.map((b, i) => {
        if (b.t === "h") {
          const cls = b.level <= 1 ? "text-lg font-extrabold text-slate-900" : b.level === 2 ? "pt-2 text-base font-bold text-slate-900" : "pt-1 text-sm font-bold text-slate-800";
          return <div key={i} className={cls}><Inline text={b.text} /></div>;
        }
        if (b.t === "hr") return <hr key={i} className="border-slate-100" />;
        if (b.t === "p") return <p key={i} className="leading-relaxed"><Inline text={b.text} /></p>;
        if (b.t === "quote") return <Quote key={i} lines={b.lines} />;
        if (b.t === "ul" || b.t === "ol") {
          const L = b.t === "ul" ? "ul" : "ol";
          return <L key={i} className={`space-y-1 pl-5 ${b.t === "ul" ? "list-disc" : "list-decimal"} marker:text-slate-400`}>{b.items.map((it, j) => <li key={j} className="leading-relaxed"><Inline text={it} /></li>)}</L>;
        }
        if (b.t !== "table") return null;
        // A leading row-number column ("#", "Priority" 1, 2, 3…) adds nothing when rows are read one by one.
        const numbered = b.head.length > 1 && b.rows.every((r) => /^\d{0,2}$/.test((r[0] || "").trim()));
        const keep = b.head.map((_, j) => j).filter((j) => !(j === 0 && numbered));
        return (
          <div key={i}>
            {/* phones: each row is a small card, so nothing is cut off or scrolls sideways */}
            <div className="space-y-2 md:hidden">
              {b.rows.map((r, j) => (
                <div key={j} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="leading-snug text-slate-900"><Inline text={r[keep[0]] || ""} /></div>
                  {keep.slice(1).filter((x) => r[x]).map((x) => (
                    <div key={x} className="mt-1 text-[13px] leading-snug text-slate-600"><span className="text-slate-400">{b.head[x]}: </span><Inline text={r[x]} /></div>
                  ))}
                </div>
              ))}
            </div>
            <table className="hidden w-full border-collapse text-xs md:table">
              <thead><tr>{b.head.map((h, j) => <th key={j} className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-600"><Inline text={h} /></th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j} className="align-top">{r.map((c, x) => <td key={x} className="border-b border-slate-100 px-2 py-1.5"><Inline text={c} /></td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
