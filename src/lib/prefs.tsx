import { createContext, useCallback, useContext, useMemo } from "react";
import { MODULES, PRESETS } from "./modules";

/*
 * Per-person switches for modules and features.
 * Stored as one row in the synced "cfg" collection (id "prefs-<userId>"), so a
 * partner's choices follow them across phones but never change what the other
 * partner sees. Missing key = on.
 */

export type Prefs = { modules: Record<string, boolean>; features: Record<string, boolean>; lang?: "en" | "hi" };
type Ctx = {
  prefs: Prefs;
  /** is this module (screen) switched on */
  module: (id: string) => boolean;
  /** is this feature switched on; a feature is off whenever its module is off */
  on: (key: string) => boolean;
  setModule: (id: string, v: boolean) => void;
  setFeature: (key: string, v: boolean) => void;
  applyPreset: (id: string) => void;
  reset: () => void;
  /** language for call scripts and WhatsApp messages: English (default) or Hinglish */
  lang: "en" | "hi";
  setLang: (l: "en" | "hi") => void;
};

const EMPTY: Prefs = { modules: {}, features: {} };
const noop = () => {};
export const PrefsCtx = createContext<Ctx>({ prefs: EMPTY, module: () => true, on: () => true, setModule: noop, setFeature: noop, applyPreset: noop, reset: noop, lang: "en", setLang: noop });
export const usePrefs = () => useContext(PrefsCtx);

const moduleOfFeature = (key: string) => MODULES.find((m) => m.features.some((f) => f.key === key))?.id;

export function usePrefsValue(userId: string, rows: any[], setRows: (fn: (rows: any[]) => any[]) => void): Ctx {
  const rowId = `prefs-${userId}`;
  const row = rows.find((r) => r.id === rowId);
  const prefs: Prefs = useMemo(() => ({ modules: row?.modules || {}, features: row?.features || {}, lang: row?.lang }), [row]);

  /* Read the latest row inside the update, so two quick taps never overwrite each other. */
  const update = useCallback((fn: (p: Prefs) => Prefs) => {
    setRows((rs) => {
      const cur = rs.find((r) => r.id === rowId);
      const next = fn({ modules: cur?.modules || {}, features: cur?.features || {}, lang: cur?.lang });
      return [...rs.filter((r) => r.id !== rowId), { id: rowId, ...next }];
    });
  }, [rowId, setRows]);

  return useMemo<Ctx>(() => {
    const moduleOn = (id: string) => prefs.modules[id] !== false;
    return {
      prefs,
      module: moduleOn,
      on: (key) => {
        const m = moduleOfFeature(key);
        return (m ? moduleOn(m) : true) && prefs.features[key] !== false;
      },
      setModule: (id, v) => update((p) => ({ ...p, modules: { ...p.modules, [id]: v } })),
      setFeature: (key, v) => update((p) => ({ ...p, features: { ...p.features, [key]: v } })),
      applyPreset: (id) => {
        const p = PRESETS.find((x) => x.id === id);
        if (!p) return;
        update((cur) => ({ ...cur, features: cur.features, modules: Object.fromEntries(MODULES.map((m) => [m.id, p.modules.includes(m.id)])) }));
      },
      reset: () => update((cur) => ({ ...EMPTY, lang: cur.lang })),
      lang: prefs.lang === "hi" ? "hi" : "en",
      setLang: (l) => update((p) => ({ ...p, lang: l })),
    };
  }, [prefs, update]);
}
