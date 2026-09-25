import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Droplets, Loader2, Users, KeyRound } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { inputCls } from "../../components/ui";

export type Workspace = { id: string; name: string; join_code: string; created_by: string };
export type Member = { user_id: string; display_name: string; role: string };
type Ctx = {
  session: Session; workspace: Workspace; members: Member[]; me: Member | null;
  signOut: () => void; leaveWorkspace: () => void; rename: (name: string) => Promise<void>;
};
const AuthCtx = createContext<Ctx | null>(null);
export const useAuth = () => useContext(AuthCtx);

const WS_KEY = "taazu-workspace";
const shell = "min-h-dvh flex items-center justify-center bg-gradient-to-b from-orange-50 to-slate-50 px-4 pt-safe pb-safe";
const card = "w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl p-6";
const primary = "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white active:bg-orange-700 disabled:opacity-50";

function Logo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30"><Droplets size={28} /></div>
      <div className="mt-3 text-xl font-bold text-slate-900">Taazu HQ</div>
      <div className="text-xs text-slate-500">Suppliers · buyers · pilot — shared with your team</div>
    </div>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const google = async () => {
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { setMsg(error.message); setBusy(false); }
  };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const fn = mode === "in"
      ? supabase.auth.signInWithPassword({ email, password: pw })
      : supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    const { data, error } = await fn;
    if (error) setMsg(error.message);
    else if (mode === "up" && !data.session) setMsg("Check your email to confirm, then sign in.");
    setBusy(false);
  };

  return (
    <div className={shell}>
      <div className={card}>
        <Logo />
        <button onClick={google} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 active:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        <form onSubmit={submit} className="space-y-3">
          <input className={inputCls} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inputCls} type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Password (6+ characters)" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required />
          <button className={primary} disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}</button>
        </form>
        {msg && <p className="mt-3 text-center text-xs text-slate-600">{msg}</p>}
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-4 w-full text-center text-xs font-medium text-orange-700">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function PickWorkspace({ session, onPick }: { session: Session; onPick: (w: Workspace) => void }) {
  const guess = (session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "").toString();
  const [name, setName] = useState(guess);
  const [wsName, setWsName] = useState("Taazu");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async (fn: "taazu_create_workspace" | "taazu_join_workspace", args: object) => {
    if (!name.trim()) { setMsg("Enter your name so partners know who logged what."); return; }
    setBusy(true); setMsg("");
    const { data, error } = await supabase.rpc(fn, args);
    setBusy(false);
    if (error) setMsg(error.message.includes("invalid code") ? "That code didn't match any team." : error.message);
    else onPick(data as Workspace);
  };

  return (
    <div className={shell}>
      <div className={card}>
        <Logo />
        <label className="block text-xs text-slate-500">Your name
          <input className={inputCls + " mt-1"} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mohit" />
        </label>
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><KeyRound size={16} />Join your team</div>
          <p className="mt-1 text-xs text-slate-500">Ask your partner for the 8-letter code (More → Team).</p>
          <input className={inputCls + " mt-3 uppercase tracking-[0.3em] text-center font-semibold"} maxLength={8} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD1234" />
          <button className={primary + " mt-3"} disabled={busy || code.length < 8} onClick={() => run("taazu_join_workspace", { code, my_name: name.trim() })}>Join</button>
        </div>
        <div className="mt-3 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users size={16} />Start a new team</div>
          <p className="mt-1 text-xs text-slate-500">Your existing data on this device moves in.</p>
          <input className={inputCls + " mt-3"} value={wsName} onChange={(e) => setWsName(e.target.value)} placeholder="Team name" />
          <button className="mt-3 w-full rounded-xl border border-orange-300 py-3 text-sm font-semibold text-orange-700 active:bg-orange-50 disabled:opacity-50" disabled={busy}
            onClick={() => run("taazu_create_workspace", { ws_name: wsName, my_name: name.trim() })}>Create team</button>
        </div>
        {msg && <p className="mt-3 text-center text-xs text-red-600">{msg}</p>}
        <button onClick={() => supabase.auth.signOut()} className="mt-4 w-full text-center text-xs text-slate-400">Sign out ({session.user.email})</button>
      </div>
    </div>
  );
}

function Splash() {
  return <div className={shell}><Loader2 size={28} className="animate-spin text-orange-600" /></div>;
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [workspace, setWorkspace] = useState<Workspace | null | undefined>(undefined);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Find the user's team: the one remembered on this device, else their first.
  const uid = session?.user.id;
  useEffect(() => {
    if (!uid) { setWorkspace(session === null ? null : undefined); return; }
    let live = true;
    (async () => {
      const { data, error } = await supabase.from("taazu_members").select("workspace_id, taazu_workspaces(*)").eq("user_id", uid);
      if (!live) return;
      if (error) {
        // Offline: fall back to the remembered team so cached data still opens.
        try { const w = JSON.parse(localStorage.getItem(WS_KEY) || "null"); setWorkspace(w); } catch { setWorkspace(null); }
        return;
      }
      const list = (data || []).map((r: any) => r.taazu_workspaces).filter(Boolean) as Workspace[];
      let saved: Workspace | null = null;
      try { saved = JSON.parse(localStorage.getItem(WS_KEY) || "null"); } catch { /* ignore */ }
      setWorkspace(list.find((w) => w.id === saved?.id) || list[0] || null);
    })();
    return () => { live = false; };
  }, [uid, session]);

  useEffect(() => {
    if (workspace) try { localStorage.setItem(WS_KEY, JSON.stringify(workspace)); } catch { /* ignore */ }
  }, [workspace]);

  // Team roster, live.
  const wsId = workspace?.id;
  useEffect(() => {
    if (!wsId) return;
    const loadMembers = () => supabase.from("taazu_members").select("user_id, display_name, role").eq("workspace_id", wsId).then(({ data }) => data && setMembers(data));
    loadMembers();
    const ch = supabase.channel(`taazu-members-${wsId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "taazu_members", filter: `workspace_id=eq.${wsId}` }, loadMembers)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [wsId]);

  if (!supabase) return <div className={shell}><div className={card}><Logo /><p className="text-sm text-center text-slate-600">Supabase keys missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p></div></div>;
  if (session === undefined) return <Splash />;
  if (!session) return <SignIn />;
  if (workspace === undefined) return <Splash />;
  if (!workspace) return <PickWorkspace session={session} onPick={setWorkspace} />;

  const me = members.find((m) => m.user_id === session.user.id) || null;
  const value: Ctx = {
    session, workspace, members, me,
    signOut: () => { localStorage.removeItem(WS_KEY); supabase.auth.signOut(); },
    leaveWorkspace: async () => {
      await supabase.from("taazu_members").delete().eq("workspace_id", workspace.id).eq("user_id", session.user.id);
      localStorage.removeItem(WS_KEY); setWorkspace(null);
    },
    rename: async (display_name) => {
      await supabase.from("taazu_members").update({ display_name }).eq("workspace_id", workspace.id).eq("user_id", session.user.id);
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
