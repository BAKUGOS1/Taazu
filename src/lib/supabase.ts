import { createClient } from "@supabase/supabase-js";

/* Public client config. The anon key is meant to ship in the browser bundle;
   data is protected by RLS on the taazu_* tables. Env vars override these. */
const PUBLIC_URL = "https://hrwqsgwnwpteykmigvae.supabase.co";
const PUBLIC_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd3FzZ3dud3B0ZXlrbWlndmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTUzOTIsImV4cCI6MjA5MjU5MTM5Mn0.gW-MhCfW2WosStxM4kv_ItM-plFbM1NCrjelSvEvh0s";

/* An env var only wins if it looks right; a mispasted value falls back to the built-in config. */
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const URL_OK = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/;
const KEY_OK = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;
const url = envUrl && URL_OK.test(envUrl.trim()) ? envUrl.trim() : PUBLIC_URL;
const key = envKey && KEY_OK.test(envKey.trim()) ? envKey.trim() : PUBLIC_ANON_KEY;

/* Shared with Phere's project; Taazu only touches `taazu_*` tables. */
export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "taazu-auth" } })
  : null;
