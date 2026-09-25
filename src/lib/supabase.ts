import { createClient } from "@supabase/supabase-js";

/* Public client config. The anon key is meant to ship in the browser bundle;
   data is protected by RLS on the taazu_* tables. Env vars override these. */
const PUBLIC_URL = "https://hrwqsgwnwpteykmigvae.supabase.co";
const PUBLIC_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd3FzZ3dud3B0ZXlrbWlndmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTUzOTIsImV4cCI6MjA5MjU5MTM5Mn0.gW-MhCfW2WosStxM4kv_ItM-plFbM1NCrjelSvEvh0s";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || PUBLIC_URL;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || PUBLIC_ANON_KEY;

/* Shared with Phere's project; Taazu only touches `taazu_*` tables. */
export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "taazu-auth" } })
  : null;
