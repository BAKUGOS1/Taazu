import { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, Sparkles, Languages } from "lucide-react";
import { Panel } from "../../components/ui";
import { MODULES, PRESETS } from "../../lib/modules";
import { usePrefs } from "../../lib/prefs";

/* iOS-style switch. A real button so it works with a thumb and a screen reader. */
export function Switch({ on, onChange, label, disabled = false }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-orange-600" : "bg-slate-300"} ${disabled ? "opacity-40" : ""}`}>
      <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

/* Modules (screens) and the features inside each one. Choices are per person. */
export default function SettingsView({ children }: { children?: any }) {
  const { module, on, setModule, setFeature, applyPreset, reset, prefs, lang, setLang } = usePrefs();
  const [openId, setOpenId] = useState<string | null>(null);
  const enabled = MODULES.filter((m) => module(m.id)).map((m) => m.id);
  const activePreset = PRESETS.find((p) => p.modules.length === enabled.length && p.modules.every((id) => enabled.includes(id)))?.id;
  const customised = Object.values(prefs.modules).some((v) => v === false) || Object.values(prefs.features).some((v) => v === false);

  return (
    <div className="max-w-xl space-y-4">
      <Panel title="Script & WhatsApp language" icon={Languages}>
        <p className="mb-3 text-xs text-slate-500">Language for the call script and pre-filled WhatsApp messages. Only yours; your partner picks their own.</p>
        <div className="grid grid-cols-2 gap-2">
          {([["en", "English", "Hello, this is Taazu…"], ["hi", "Hinglish", "Namaste, main Taazu se…"]] as const).map(([id, label, eg]) => (
            <button key={id} onClick={() => setLang(id)} className={`rounded-xl border px-4 py-3 text-left active:bg-slate-50 ${lang === id ? "border-orange-400 bg-orange-50" : "border-slate-200"}`}>
              <div className="text-sm font-semibold text-slate-900">{label}{id === "en" ? " (default)" : ""}</div>
              <div className="text-xs text-slate-500">{eg}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Quick setup" icon={Sparkles}>
        <p className="mb-3 text-xs text-slate-500">Pick what you need today. You can fine-tune every screen below. These choices are only yours; your partner keeps their own.</p>
        <div className="grid gap-2">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p.id)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left active:bg-slate-50 ${activePreset === p.id ? "border-orange-400 bg-orange-50" : "border-slate-200"}`}>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                <div className="text-xs text-slate-500">{p.desc}</div>
              </div>
              {activePreset === p.id && <span className="text-xs font-semibold text-orange-700">Active</span>}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Screens and features" icon={SlidersHorizontal}>
        <div className="-my-2 divide-y divide-slate-100">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isOn = module(m.id);
            const open = openId === m.id && isOn && m.features.length > 0;
            const offCount = m.features.filter((f) => !on(f.key)).length;
            return (
              <div key={m.id} className="py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isOn ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-400"}`}><Icon size={18} /></span>
                  <button onClick={() => m.features.length && isOn && setOpenId(open ? null : m.id)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
                    <div className={`text-sm font-semibold ${isOn ? "text-slate-900" : "text-slate-400"}`}>{m.label}</div>
                    <div className="truncate text-xs text-slate-500">
                      {isOn && m.features.length ? `${m.features.length - offCount} of ${m.features.length} features on` : m.desc}
                    </div>
                  </button>
                  {isOn && m.features.length > 0 && (
                    <button onClick={() => setOpenId(open ? null : m.id)} aria-label={`${open ? "Hide" : "Show"} ${m.label} features`} className="p-1.5 text-slate-400">
                      <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  <Switch on={isOn} onChange={(v) => setModule(m.id, v)} label={`${m.label} screen`} />
                </div>
                {open && (
                  <div className="ml-12 mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
                    {m.features.map((f) => (
                      <div key={f.key} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-800">{f.label}</div>
                          <div className="text-xs text-slate-500">{f.desc}</div>
                        </div>
                        <Switch on={on(f.key)} onChange={(v) => setFeature(f.key, v)} label={f.label} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {customised && (
          <button onClick={reset} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 active:bg-slate-50"><RotateCcw size={14} />Turn everything back on</button>
        )}
        <p className="mt-3 text-xs text-slate-400">Switching a screen off only hides it. Nothing is deleted, and your data stays shared with the team.</p>
      </Panel>

      {children}
    </div>
  );
}
