// Username sign-in for Taazu HQ.
// Looks the username up server-side (taazu_usernames, else the
// <username>@taazu.app account from username sign-up), signs in with the
// real email and hands back the session. The email itself is never returned.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const USERNAME = /^[a-z0-9][a-z0-9._]{2,19}$/;
const USERNAME_DOMAIN = "taazu.app";
const WRONG = "Wrong username or password.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!USERNAME.test(username) || !password) return json({ error: WRONG }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });

  let email = `${username}@${USERNAME_DOMAIN}`;
  const { data: row } = await admin.from("taazu_usernames").select("user_id").eq("username", username).maybeSingle();
  if (row?.user_id) {
    const { data: u } = await admin.auth.admin.getUserById(row.user_id);
    if (u?.user?.email) email = u.user.email;
  }

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    const limited = error && /rate|too many/i.test(error.message);
    return json({ error: limited ? "Too many attempts. Wait a minute and try again." : WRONG }, limited ? 429 : 401);
  }
  return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
});
