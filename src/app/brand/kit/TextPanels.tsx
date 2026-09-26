import { useEffect, useState } from "react";
import { Compass, Lightbulb, MessageSquareQuote, Wand2 } from "lucide-react";
import { Panel } from "../../../components/ui";
import Markdown from "../../plans/markdown";
import README from "../../../../brand-kit/README.md?raw";
import { NEGATIVE, PROMPTS, SLOGANS, STYLE_LINE, type Prompt } from "./copy";
import { CopyButton, readStore, writeStore } from "./bits";
import { DISPLAY, loadFonts } from "./fonts";

const isGujarati = (t: string) => /[઀-૿]/.test(t);

export function Slogans() {
  useEffect(() => { loadFonts(); }, []);
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-stone-900 p-6 text-[#FFF8E7] md:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#F5D83B]">Main tagline · recommended</div>
        <div className="mt-2 text-5xl font-black tracking-tight md:text-6xl">Paani se <span className="text-[#F5D83B]">aage.</span></div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-base">
          {[["Hindi", "पानी से आगे।"], ["English", "More than water."], ["Gujarati", "ગરમીમાં પણ તાજું."], ["Hashtag", "#TaazuRaho"]].map(([k, t]) => (
            <div key={k} className="flex items-center gap-2"><div><div className="text-[11px] uppercase tracking-wider opacity-60">{k}</div>{t}</div><CopyButton text={t} label="" className="!border-white/20 !bg-white/10 !text-white" /></div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm opacity-80">Category samjhata hai (paani se zyada kuch) bina medical claim ke, aur teeno bhashaon mein chhota rehta hai.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(SLOGANS).map(([group, lines]) => (
          <Panel key={group} title={group} icon={MessageSquareQuote}>
            <div className="divide-y divide-stone-100">
              {lines.map(([t, tr]) => (
                <div key={t} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-lg font-extrabold leading-snug text-stone-900" style={isGujarati(t) ? { fontFamily: DISPLAY } : undefined}>{t}</div>
                    {tr && <div className="text-xs text-stone-500">{tr}</div>}
                  </div>
                  <CopyButton text={t} />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-stone-700"><b className="text-red-700">Kabhi mat likho:</b> "ORS jaisa", "dehydration ka ilaaj", "heatstroke se bachaye", "doctor recommended", "health drink".</div>
    </div>
  );
}

/* Section 1 of brand-kit/README.md, so the app and the repo show the same plan. */
const STRATEGY = (() => {
  const start = README.indexOf("## 1.");
  const end = README.indexOf("\n---", start);
  return start < 0 ? README : README.slice(start, end < 0 ? undefined : end).replace(/^## 1\.[^\n]*\n/, "");
})();

export function Strategy() {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-[#1F7A3A] p-6 text-[#FFF8E7] md:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#F5D83B]">Positioning</div>
        <p className="mt-2 max-w-3xl text-xl font-extrabold leading-snug md:text-2xl">Amdavad mein jo log garmi mein khelte ya kaam karte hain, unke liye Taazu ek desi nimbu-namak electrolyte drink hai jo paseene mein gaya namak wapas deta hai. Cold drink jitna easy, pocket-friendly, ghar ke nimbu-paani jaisa taste.</p>
      </section>
      <Panel title="Brand kaise develop karein · 7 steps" icon={Compass}>
        <Markdown src={STRATEGY} />
      </Panel>
    </div>
  );
}

const KEY = "taazu.brandkit.prompts.v1";
const withStyle = (p: Prompt, on: boolean) => (on && !p.noStyle && !p.ref ? `${p.p}, ${STYLE_LINE}` : p.p) + (!p.ref && /^[\d:]+$/.test(p.ar) ? ` --ar ${p.ar}` : "");

export function Prompts() {
  const [on, setOn] = useState(() => readStore(KEY, { style: true }).style);
  const toggle = (v: boolean) => { setOn(v); writeStore(KEY, { style: v }); };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Pehle yeh padho" icon={Lightbulb}>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-stone-700 marker:font-bold marker:text-orange-600">
            <li>AI se sirf photo banwao. Text aur logo yahin <b>Creatives → Apna post</b> mein photo upload karke lagao.</li>
            <li>AI Hindi aur Gujarati text bigaad deta hai, isliye prompts English mein hain.</li>
            <li>Asli bottle chahiye to ChatGPT / Gemini mein bottle photo upload karke A3 prompt use karo.</li>
            <li>Log asli dikhein: Indian faces, Amdavadi jagah. Workers ko respect ke saath dikhao.</li>
          </ol>
        </Panel>
        <Panel title="Brand style line" icon={Wand2}>
          <pre className="whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700">{STYLE_LINE}</pre>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700"><input type="checkbox" checked={on} onChange={(e) => toggle(e.target.checked)} className="h-4 w-4 accent-orange-600" />Copy mein style line jodo</label>
            <CopyButton text={NEGATIVE} label="Negative prompt" />
          </div>
        </Panel>
      </div>
      {PROMPTS.map((g) => (
        <section key={g.g} className="space-y-3">
          <div><h3 className="text-lg font-extrabold text-stone-900">{g.g}</h3><p className="text-sm text-stone-500">{g.d}</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            {g.items.map((p) => (
              <div key={p.t} className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><div className="font-bold text-stone-900">{p.t}</div><div className="text-xs text-stone-500">{p.u}</div></div>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-500">{p.ar}</span>
                </div>
                <pre className="whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700">{p.p}</pre>
                <div><CopyButton text={() => withStyle(p, on)} label="Copy prompt" /></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
