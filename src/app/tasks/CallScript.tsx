import { Phone } from "lucide-react";
import { SUPPLIER_CFG as cfg, NEED } from "../crm/configs";

/* One supplier call script for the whole team — read it once, then fill answers in the supplier card. */
const Step = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{n}</span>
    <div className="min-w-0 flex-1 text-sm text-slate-800">{children}</div>
  </li>
);

export default function CallScript() {
  const s = cfg.script!;
  const asks = (cfg.checklist || []).filter((f) => typeof f.say === "string");
  let n = 2;
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="mb-2 text-sm font-semibold text-amber-900">Before you dial</div>
        <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Phone size={15} />Supplier call script</div>
        <ol className="space-y-3">
          <Step n={1}>“{s.open({} as any)}”</Step>
          <Step n={2}>
            <div className="mb-1.5">Batao hamein kya chahiye — supplier ke type ke hisaab se:</div>
            <div className="space-y-1.5">
              {Object.entries(NEED).map(([cat, line]) => (
                <div key={cat} className="rounded-lg bg-slate-50 px-2.5 py-1.5"><span className="text-xs font-semibold text-slate-500">{cat}: </span>“{line}”</div>
              ))}
            </div>
          </Step>
          {asks.map((f) => <Step key={f.k} n={++n}>“{f.say as string}”</Step>)}
          <Step n={++n}>“{s.close}”</Step>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-sm font-semibold text-slate-900">After the call (1 minute)</div>
        <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-700">
          <li>Suppliers → tap the supplier's name.</li>
          <li>Fill <b>Quote & order</b>: rate, MOQ, delivery, payment, sample, GSTIN, FSSAI.</li>
          <li>In <b>Log this contact</b>: pick what happened, add a note, choose a follow-up day → Save.</li>
          <li>GSTIN checked on the GST site? Tap <b>Mark verified</b>.</li>
        </ol>
      </section>
    </div>
  );
}
