import { Phone } from "lucide-react";
import { SUPPLIER_CFG, NEED } from "../crm/configs";
import type { CrmConfig, T } from "../crm/config";
import { usePrefs } from "../../lib/prefs";

/* One call script for the whole team — read it once, then fill answers in the record card.
 * Suppliers by default; Buyers → Pitch passes the buyer config and segment hooks. */
const Step = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{n}</span>
    <div className="min-w-0 flex-1 text-sm text-slate-800">{children}</div>
  </li>
);

const SUP_AFTER = [
  <>Suppliers → tap the supplier's name.</>,
  <>Fill <b>Quote & order</b>: rate, MOQ, delivery, payment, sample, GSTIN, FSSAI.</>,
  <>In <b>Log this contact</b>: pick what happened, add a note, choose a follow-up day → Save.</>,
  <>GSTIN checked on the GST site? Tap <b>Mark verified</b>.</>,
];

export default function CallScript({ cfg = SUPPLIER_CFG, lines = NEED, title = "Supplier call script", lineIntro = { en: "Say what we need — pick the line for this supplier type:", hi: "Batao hamein kya chahiye — supplier ke type ke hisaab se:" }, after = SUP_AFTER }: {
  cfg?: CrmConfig; lines?: Record<string, T>; title?: string; lineIntro?: T; after?: any[];
}) {
  const { lang } = usePrefs();
  const s = cfg.script!;
  const asks = (cfg.checklist || []).filter((f) => f.say);
  let n = 2;
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="mb-2 text-sm font-semibold text-amber-900">Before you dial</div>
        <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900">{s.tips.map((t) => <li key={t.en}>{t[lang]}</li>)}</ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Phone size={15} />{title}</div>
        <ol className="space-y-3">
          <Step n={1}>“{s.open({} as any, lang)}”</Step>
          <Step n={2}>
            <div className="mb-1.5">{lineIntro[lang]}</div>
            <div className="space-y-1.5">
              {Object.entries(lines).map(([cat, line]) => (
                <div key={cat} className="rounded-lg bg-slate-50 px-2.5 py-1.5"><span className="text-xs font-semibold text-slate-500">{cat}: </span>“{line[lang]}”</div>
              ))}
            </div>
          </Step>
          {asks.map((f) => <Step key={f.k} n={++n}>“{f.say![lang]}”</Step>)}
          <Step n={++n}>“{s.close[lang]}”</Step>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-sm font-semibold text-slate-900">After the call (1 minute)</div>
        <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-700">{after.map((a, i) => <li key={i}>{a}</li>)}</ol>
      </section>
    </div>
  );
}
