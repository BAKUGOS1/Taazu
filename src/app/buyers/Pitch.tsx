import { Droplets, Thermometer, Brain, Zap, Waves, Timer, ShieldCheck, Leaf } from "lucide-react";
import { usePrefs } from "../../lib/prefs";
import { BUYER_CFG, HOOK } from "../crm/configs";
import type { T } from "../crm/config";
import CallScript from "../tasks/CallScript";

/*
 * Buyers → Pitch. The top half is meant to be shown to a customer on the phone screen;
 * the bottom half is the call script for the team.
 * Keep claims general and non-medical (no "ORS", "cure", "treats"). "Low sugar" only once the lab report backs it.
 */
const FACTS: { icon: any; stat: string; title: T; body: T }[] = [
  { icon: Waves, stat: "Salt", title: { en: "Sweat isn't just water", hi: "Paseena sirf paani nahi" },
    body: { en: "Every litre of sweat carries away sodium and potassium. Plain water puts the water back — not the salts.", hi: "Har litre paseene ke saath sodium aur potassium bhi jaata hai. Sirf paani, paani wapas deta hai — salt nahi." } },
  { icon: Timer, stat: "Late", title: { en: "Thirst comes late", hi: "Pyaas der se lagti hai" },
    body: { en: "By the time you feel thirsty, your body is already running low. In the heat, drink before you're thirsty.", hi: "Jab pyaas lagti hai tab tak body mein paani kam ho chuka hota hai. Garmi mein pyaas se pehle piyo." } },
  { icon: Brain, stat: "2%", title: { en: "Small loss, big drop", hi: "Thoda kam, bada asar" },
    body: { en: "Losing just ~2% of body water is linked to lower stamina, focus and reaction time.", hi: "Body ka sirf ~2% paani kam hone se stamina, focus aur reaction time girte hain." } },
  { icon: Droplets, stat: "Absorb", title: { en: "Salts help water stay in", hi: "Salt paani ko rokta hai" },
    body: { en: "A little sodium with a little sugar helps the body absorb water faster and hold on to it, instead of losing it.", hi: "Thoda sodium aur thodi sugar saath ho to body paani jaldi absorb karti hai aur rok ke rakhti hai." } },
  { icon: Zap, stat: "Cramps", title: { en: "Cramps and the 3 pm crash", hi: "Cramps aur dopahar ki thakaan" },
    body: { en: "Heavy sweating with no salt back is a common reason for muscle cramps, headaches and afternoon fatigue.", hi: "Zyada paseena aur salt wapas na mile — cramps, sar dard aur dopahar ki thakaan ka common kaaran." } },
  { icon: Thermometer, stat: "45°C", title: { en: "Ahmedabad summers are extreme", hi: "Ahmedabad ki garmi extreme hai" },
    body: { en: "Summer highs cross 44°C and the city runs a Heat Action Plan every year. Outdoor workers are named high-risk.", hi: "Garmi mein paara 44°C se upar jaata hai aur AMC har saal Heat Action Plan chalata hai. Outdoor workers high-risk maane jaate hain." } },
];

const WHO: T[] = [
  { en: "Gym & sports", hi: "Gym aur sports" }, { en: "Site & factory workers", hi: "Site aur factory workers" },
  { en: "Runners & cyclists", hi: "Runners aur cyclists" }, { en: "Long days in the sun", hi: "Dhoop mein lamba din" },
];

export default function Pitch() {
  const { lang } = usePrefs();
  return (
    <div className="space-y-5">
      {/* launch hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Droplets size={20} /></div>
            <span className="text-2xl font-black tracking-tight">Taazu</span>
          </div>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight">{lang === "hi" ? "Paani se aage." : "More than water."}</h2>
          <p className="mt-2 max-w-md text-sm text-orange-50">
            {lang === "hi" ? "Ahmedabad ka apna electrolyte drink. Nimbu-namak jaisa taste, chilled, 250 ml — garmi mein jo paseene mein jaata hai, woh wapas." : "Ahmedabad's own electrolyte drink. A familiar nimbu-namak taste, served chilled in 250 ml — putting back what the heat takes out."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {WHO.map((w) => <span key={w.en} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{w[lang]}</span>)}
          </div>
        </div>
      </section>

      {/* what people don't know */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">{lang === "hi" ? "Jo log nahi jaante" : "What most people don't know"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {FACTS.map(({ icon: Icon, stat, title, body }) => (
            <div key={title.en} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={20} /></div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-orange-600">{stat}</div>
                  <div className="font-semibold leading-snug text-slate-900">{title[lang]}</div>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the offer */}
      <section className="rounded-2xl bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold text-orange-300"><ShieldCheck size={16} />{lang === "hi" ? "Taazu offer" : "The Taazu offer"}</div>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            { en: "Free crate of 24 chilled bottles for one week", hi: "Ek hafte ke liye 24 chilled bottle ka free crate" },
            { en: "Weekly delivery on a fixed day — one simple bill", hi: "Fixed din weekly delivery — ek simple bill" },
            { en: "Local brand — we pick up the phone and restock fast", hi: "Local brand — phone uthate hain, jaldi restock karte hain" },
          ].map((o) => <li key={o.en} className="flex gap-2"><Leaf size={16} className="mt-0.5 shrink-0 text-orange-400" />{o[lang]}</li>)}
        </ul>
      </section>

      <p className="text-[11px] leading-relaxed text-slate-400">
        General hydration information, not medical advice — sources for every fact are in Brand → Why electrolytes. Never call Taazu "ORS" or say it treats or cures anything. Say "low sugar" only after the lab report confirms it.
      </p>

      <CallScript
        cfg={BUYER_CFG} lines={HOOK} title={lang === "hi" ? "Buyer call script" : "Buyer call script"}
        lineIntro={{ en: "Open with their problem — pick the line for this buyer type:", hi: "Unki problem se shuru karo — buyer ke type ke hisaab se line chuno:" }}
        after={[
          <>Buyers → tap the buyer's name.</>,
          <>Fill the checklist: decision maker, people/day, what they use now, bottles, price, sample day.</>,
          <>In <b>Log this contact</b>: pick what happened (Meeting fixed / Sample given…), note, follow-up day → Save.</>,
        ]}
      />
    </div>
  );
}
