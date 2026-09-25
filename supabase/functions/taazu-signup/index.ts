// Username sign-up for Taazu HQ.
// Supabase Auth needs an email, so `mohit` becomes `mohit@taazu.app`. That
// address can't receive mail, so the account is created already confirmed
// here (service role) instead of through the email-confirmation flow.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { username?: string; password?: string; name?: string };
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!USERNAME.test(username)) return json({ error: "Username: 3–20 letters, numbers, dot or underscore." }, 400);
  if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.createUser({
    email: `${username}@${USERNAME_DOMAIN}`,
    password,
    email_confirm: true,
    user_metadata: { username, full_name: String(body.name || username).slice(0, 60), app: "taazu" },
  });
  if (error) {
    const taken = /already|registered|exists/i.test(error.message);
    return json({ error: taken ? "That username is taken." : "Could not create account." }, taken ? 409 : 500);
  }
  return json({ ok: true });
});
