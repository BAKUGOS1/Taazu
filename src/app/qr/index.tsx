import { useState } from "react";
import { Send, CheckCircle2, QrCode, Download, Copy, ExternalLink, Link2, Check, ListChecks, ClipboardList, RefreshCw, Circle, MessageCircle } from "lucide-react";
import { AppIcon } from "../../components/BrandMark";
import { inputCls, btn, btnPrimary, btnGhost, Panel, Empty, Bar, IconLink } from "../../components/ui";
import { uid, waHref, SEGS, FLAVOURS, PAYS } from "../../lib/core";

/* Survey settings (sheet URL, secret, venue tag) are shared with the team:
   they live in the synced "cfg" collection, passed in as props. */
/* =========================================================
   QR SURVEY — public form (for customers) + manage page (for you)
   Responses go to your Google Sheet via a small Apps Script.
   ========================================================= */
const APPS_SCRIPT = `const KEY = "change-this-secret";   // type the same secret in the app
const SHEET = "Responses";
const HEAD = ["id","time","venue","segment","flavour","pay","phone","comment"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) { s = ss.insertSheet(SHEET); s.appendRow(HEAD); }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
function clean_(v) {
  const s = String(v || "").slice(0, 200);
  return /^[=+\\-@]/.test(s) ? "'" + s : s;
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    sheet_().appendRow([clean_(d.id), new Date(), clean_(d.venue), clean_(d.segment),
      clean_(d.flavour), clean_(d.pay), clean_(d.phone), clean_(d.comment)]);
    return out_({ ok: true });
  } finally { lock.releaseLock(); }
}
function doGet(e) {
  if (!e.parameter.key || e.parameter.key !== KEY) return out_({ ok: false, error: "Wrong key" });
  const v = sheet_().getDataRange().getValues();
  const rows = v.slice(1).map(r => Object.fromEntries(HEAD.map((h, i) => [h, r[i]])));
  return out_({ ok: true, rows });
}`;

const defaultBase = () => (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
const surveyLink = (cfg) => {
  const base = (cfg.base || defaultBase()).trim();
  const p = new URLSearchParams({ s: "1", e: (cfg.endpoint || "").trim() });
  if (cfg.venue) p.set("v", cfg.venue.trim());
  return `${base}${base.includes("?") ? "&" : "?"}${p.toString()}`;
};
const copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch (e) { return false; } };

/* ---- what customers see after scanning the QR ---- */
export function PublicSurvey() {
  const p = new URLSearchParams(window.location.search);
  const endpoint = p.get("e") || "";
  const venue = p.get("v") || "";
  const [f, setF] = useState({ segment: "", flavour: "", pay: "", phone: "", comment: "", consent: false });
  const [state, setState] = useState("form");
  const ready = f.flavour && f.pay && (!f.phone.trim() || f.consent);
  const submit = async () => {
    if (!ready) return;
    setState("sending");
    const payload = { id: uid() + Date.now().toString(36), venue, segment: f.segment || "Other", flavour: f.flavour, pay: f.pay, phone: f.phone.trim(), comment: f.comment.trim() };
    try { await fetch(endpoint, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) }); setState("done"); }
    catch (e) { setState("error"); }
  };
  const Q = ({ n, en, gu, k, opts }) => (
    <div className="mb-6">
      <div className="text-sm font-semibold text-slate-900">{n}. {en}</div>
      <div className="text-xs text-slate-500 mb-3">{gu}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map(([v, label]) => (
          <button key={v} onClick={() => setF({ ...f, [k]: v })}
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${f[k] === v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>{label}</button>
        ))}
      </div>
    </div>
  );
  const shell = (children) => (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6"><AppIcon className="h-8 w-8" /><span className="font-semibold text-slate-900">Quick taste survey</span></div>
        {children}
      </div>
    </div>
  );
  if (!endpoint) return shell(<div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600">This survey link isn't set up yet.</div>);
  if (state === "done") return shell(
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
      <div className="text-lg font-semibold text-slate-900">Thank you</div>
      <div className="text-sm text-slate-500 mt-1">આભાર! Your answer helps us make a better drink.</div>
    </div>
  );
  return shell(
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-6">3 quick questions · about 20 seconds{venue ? ` · ${venue}` : ""}</p>
      <Q n={1} en="Which flavour did you like most?" gu="તમને કયો સ્વાદ સૌથી વધુ ગમ્યો?" k="flavour" opts={FLAVOURS.map((x) => [x, x])} />
      <Q n={2} en="Would you buy a 250 ml bottle at…" gu="250 ml બોટલ કેટલા રૂપિયામાં લેશો?" k="pay" opts={[["₹50", "₹50"], ["₹30", "₹30"], ["₹20", "₹20"], ["₹10", "₹10"], ["None", "Wouldn't buy"]]} />
      <Q n={3} en="You are mostly…" gu="તમે મુખ્યત્વે…" k="segment" opts={SEGS.map((x) => [x, x])} />
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Want a free sample at launch? <span className="font-normal text-slate-500">(optional)</span></div>
        <input className={`${inputCls} mt-2`} inputMode="tel" placeholder="WhatsApp number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        {f.phone.trim() && (
          <label className="flex items-start gap-2 text-xs text-slate-600 mt-2">
            <input type="checkbox" className="mt-0.5" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            I agree to be contacted on WhatsApp about this drink. My number won't be shared.
          </label>
        )}
      </div>
      <textarea className={`${inputCls} mb-5`} rows={2} placeholder="Anything else? (optional)" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
      <button onClick={submit} disabled={!ready || state === "sending"} className={`${btn} w-full py-3 text-base ${ready ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"}`}>
        <Send size={18} />{state === "sending" ? "Sending…" : "Submit"}
      </button>
      {state === "error" && <p className="text-xs text-red-600 mt-2">Couldn't send. Please check your internet and try again.</p>}
    </div>
  );
}

/* ---- manage page (for you) ---- */
export function QrSurveyView({ surv, setSurv, cfg, saveCfg }: { surv: any[]; setSurv: (s: any[]) => void; cfg: any; saveCfg: (c: any) => void }) {
  const [draft, setDraft] = useState(null);
  const d = draft || cfg;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [help, setHelp] = useState(false);
  const flash = (m) => { setNote(m); setTimeout(() => setNote(""), 2200); };
  const connected = !!cfg.endpoint;
  const link = connected ? surveyLink(cfg) : "";
  const qr = (n) => `https://api.qrserver.com/v1/create-qr-code/?size=${n}x${n}&margin=12&data=${encodeURIComponent(link)}`;
  const inPreview = !cfg.base && /claude|anthropic|usercontent/i.test(defaultBase());

  const load = async () => {
    if (!cfg.endpoint || !cfg.key) { setErr("Add the sheet URL and secret key first."); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${cfg.endpoint}?key=${encodeURIComponent(cfg.key)}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Wrong key");
      setRows((j.rows || []).reverse());
    } catch (e) { setErr("Couldn't load responses. Check the sheet URL and secret key. Loading only works on your hosted site, not inside the Claude preview."); }
    setLoading(false);
  };
  const importRows = () => {
    const have = new Set(surv.map((s) => s.id));
    const add = rows.filter((r) => !have.has("qr-" + r.id)).map((r) => ({
      id: "qr-" + r.id, date: String(r.time || "").slice(0, 10), venue: r.venue || "QR", segment: r.segment || "Other",
      flavour: r.flavour, pay: r.pay, comment: [r.comment, r.phone ? "Phone: " + r.phone : ""].filter(Boolean).join(" · "),
    }));
    setSurv([...add, ...surv]);
    flash(add.length ? `${add.length} responses added to Survey` : "Survey is already up to date");
  };

  const n = rows.length;
  const c = (k, v) => rows.filter((r) => r[k] === v).length;
  const pct = n ? Math.round(((c("pay", "₹30") + c("pay", "₹50")) / n) * 100) : 0;
  const phones = rows.filter((r) => r.phone).length;
  const venues = Array.from(new Set<any>(rows.map((r) => r.venue || "—")));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* QR card */}
        <Panel title="Your QR code" icon={QrCode}>
          {connected ? (
            <div className="text-center">
              <img src={qr(260)} alt="Survey QR code" width="220" height="220" className="mx-auto rounded-lg border border-slate-200" />
              {cfg.venue && <div className="text-xs text-slate-500 mt-2">Venue tag: {cfg.venue}</div>}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <a href={qr(1000)} target="_blank" rel="noreferrer" className={`${btnGhost} text-xs px-2`}><Download size={14} />Print file</a>
                <button className={`${btnGhost} text-xs px-2`} onClick={async () => flash((await copyText(link)) ? "Link copied" : "Copy failed — select the link below")}><Copy size={14} />Copy link</button>
                <a href={link} target="_blank" rel="noreferrer" className={`${btnGhost} text-xs px-2`}><ExternalLink size={14} />Test</a>
              </div>
              <div className="text-left text-xs text-slate-400 break-all mt-3 bg-slate-50 rounded-lg p-2">{link}</div>
              {inPreview && <p className="text-left text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">Set "Public app address" to your hosted link (e.g. your Netlify URL). A QR made inside the Claude preview won't open for customers.</p>}
            </div>
          ) : <Empty icon={QrCode} text="Connect your Google Sheet to create the QR." />}
        </Panel>

        {/* setup */}
        <Panel className="lg:col-span-2" title="Setup" icon={Link2} action={<span className={`inline-flex items-center gap-1 text-xs font-medium ${connected ? "text-green-700" : "text-slate-500"}`}>{connected ? <CheckCircle2 size={14} /> : <Circle size={14} />}{connected ? "Connected" : "Not connected"}</span>}>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs text-slate-500 md:col-span-2">Response sheet URL (Apps Script web app, ends with /exec)
              <input className={`${inputCls} mt-1`} placeholder="https://script.google.com/macros/s/…/exec" value={d.endpoint} onChange={(e) => setDraft({ ...d, endpoint: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">Secret key (same as in the script)
              <input className={`${inputCls} mt-1`} type="password" placeholder="your secret word" value={d.key} onChange={(e) => setDraft({ ...d, key: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">Venue tag for this QR (optional)
              <input className={`${inputCls} mt-1`} placeholder="e.g. Garba – Day 3" value={d.venue} onChange={(e) => setDraft({ ...d, venue: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500 md:col-span-2">Public app address
              <input className={`${inputCls} mt-1`} placeholder={defaultBase() || "https://your-site.netlify.app/"} value={d.base} onChange={(e) => setDraft({ ...d, base: e.target.value })} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className={btnPrimary} disabled={!draft} onClick={() => { saveCfg(d); setDraft(null); flash("Settings saved"); }}><Check size={16} />Save</button>
            <button className={btnGhost} onClick={() => setHelp(!help)}><ListChecks size={16} />{help ? "Hide setup steps" : "How to connect Google Sheets"}</button>
            {note && <span className="self-center text-xs text-green-700">{note}</span>}
          </div>
          {help && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <ol className="space-y-2 text-sm text-slate-700 list-decimal ml-5">
                <li>Open <b>sheets.new</b> and name the sheet "Survey responses".</li>
                <li>Go to <b>Extensions → Apps Script</b>. Delete what's there and paste the code below. Change <code className="bg-slate-100 px-1 rounded">change-this-secret</code> to your own secret word.</li>
                <li>Click <b>Deploy → New deployment</b>, choose type <b>Web app</b>. Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>. Deploy and allow access.</li>
                <li>Copy the <b>Web app URL</b> (ends with <code className="bg-slate-100 px-1 rounded">/exec</code>). Paste it above with your secret word, add your hosted link as the public address, and Save.</li>
                <li>Print the QR. Each answer appears as a new row in your sheet.</li>
              </ol>
              <div className="relative mt-3">
                <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto" style={{ maxHeight: 260 }}>{APPS_SCRIPT}</pre>
                <button className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs bg-slate-700 text-white rounded-md px-2 py-1" onClick={async () => flash((await copyText(APPS_SCRIPT)) ? "Code copied" : "Copy failed — select the code manually")}><Copy size={12} />Copy</button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Keep the secret word private. Anyone can submit the form, but only someone with the secret can read answers and phone numbers.</p>
            </div>
          )}
        </Panel>
      </div>

      {/* responses */}
      <Panel title="Responses" icon={ClipboardList} action={
        <div className="flex gap-2">
          <button className={`${btnGhost} text-xs`} onClick={load} disabled={loading}><RefreshCw size={14} className={loading ? "animate-spin" : ""} />{loading ? "Loading" : "Refresh"}</button>
          <button className={`${btnPrimary} text-xs`} onClick={importRows} disabled={!n}><Download size={14} />Add to Survey</button>
        </div>
      }>
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        {n ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div><div className="text-xs text-slate-500">Responses</div><div className="text-2xl font-bold">{n}</div></div>
              <div><div className="text-xs text-slate-500">Would pay ₹30+</div><div className={`text-2xl font-bold ${pct >= 60 ? "text-green-600" : ""}`}>{pct}%</div></div>
              <div><div className="text-xs text-slate-500">Sample requests</div><div className="text-2xl font-bold">{phones}</div></div>
              <div><div className="text-xs text-slate-500">Venues</div><div className="text-2xl font-bold">{venues.length}</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>{FLAVOURS.map((fl) => { const x = c("flavour", fl); return <div key={fl} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{fl}</span><div className="col-span-2"><Bar value={x} max={n} color="#16A34A" /></div><span className="text-right font-medium">{x}</span></div>; })}</div>
              <div>{PAYS.map((p) => { const x = c("pay", p); return <div key={p} className="grid grid-cols-5 items-center gap-2 text-sm mb-2"><span className="col-span-2 text-slate-600">{p === "None" ? "Wouldn't buy" : p}</span><div className="col-span-2"><Bar value={x} max={n} /></div><span className="text-right font-medium">{x}</span></div>; })}</div>
            </div>
            <div className="md:hidden overflow-hidden rounded-2xl border border-slate-200 divide-y divide-slate-100" style={{ maxHeight: "60dvh", overflowY: "auto" }}>
              {rows.map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900">{r.flavour || "—"}</span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{r.pay === "None" ? "Wouldn't buy" : r.pay}</span>
                    <span className="ml-auto text-xs text-slate-400">{r.segment}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{[r.venue, String(r.time || "").replace("T", " ").slice(0, 16)].filter(Boolean).join(" · ")}</div>
                  {r.comment && <div className="mt-1 text-xs text-slate-600">{r.comment}</div>}
                  {r.phone && <a href={waHref(r.phone) || undefined} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"><MessageCircle size={13} />{r.phone}</a>}
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-auto border border-slate-200 rounded-lg" style={{ maxHeight: 420 }}>
              <table className="text-xs w-full">
                <thead className="sticky top-0"><tr>{["Time", "Venue", "Who", "Flavour", "Would pay", "Phone", "Comment"].map((h) => <th key={h} className="bg-slate-50 text-slate-500 text-left px-3 py-2 font-semibold border-b border-slate-200">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{String(r.time || "").replace("T", " ").slice(0, 16)}</td>
                      <td className="px-3 py-2">{r.venue}</td><td className="px-3 py-2">{r.segment}</td><td className="px-3 py-2">{r.flavour}</td>
                      <td className="px-3 py-2 font-medium">{r.pay === "None" ? "Wouldn't buy" : r.pay}</td>
                      <td className="px-3 py-2">{r.phone ? <span className="inline-flex items-center gap-1">{r.phone}<IconLink href={waHref(r.phone)} icon={MessageCircle} label="WhatsApp" tone="green" external /></span> : "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : !err && <Empty icon={ClipboardList} text={connected ? "Press Refresh to load answers from your sheet." : "Connect your sheet to see answers here."} />}
      </Panel>
    </div>
  );
}

