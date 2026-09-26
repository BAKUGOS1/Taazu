import { useEffect, useState } from "react";
import { Copy, MessageCircle, LogOut, Users, Check, AtSign } from "lucide-react";
import { useAuth } from "./AuthGate";
import { supabase } from "../../lib/supabase";

/* Claim a username so this account can sign in with it instead of the email. */
function UsernameRow({ dark, sub }) {
  const { session } = useAuth();
  const [current, setCurrent] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.from("taazu_usernames").select("username").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setCurrent(data?.username || null));
  }, [session.user.id]);
  const save = async () => {
    setBusy(true); setMsg("");
    const { data, error } = await supabase.rpc("taazu_set_username", { new_username: val });
    setBusy(false);
    if (error) setMsg(/taken/.test(error.message) ? "Ye username le liya gaya hai." : /invalid/.test(error.message) ? "3–20 chhote letters, numbers, . ya _" : error.message);
    else { setCurrent(data as string); setEdit(false); }
  };
  const field = dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200";
  return (
    <div className={`rounded-xl p-3 ${dark ? "bg-slate-800 text-slate-100" : "bg-slate-50 border border-slate-200 text-slate-800"}`}>
      <div className={`flex items-center gap-1 text-[11px] ${sub}`}><AtSign size={12} />Login username</div>
      {edit ? (
        <div className="mt-2 flex gap-2">
          <input autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={20} value={val}
            onChange={(e) => setVal(e.target.value.toLowerCase())} placeholder="e.g. taazu"
            className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm ${field}`} />
          <button onClick={save} disabled={busy || val.length < 3} className="rounded-lg bg-orange-600 px-3 text-xs font-semibold text-white disabled:opacity-50">Save</button>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <span className="flex-1 font-semibold">{current || <span className={sub}>Not set</span>}</span>
          <button onClick={() => { setVal(current || ""); setEdit(true); setMsg(""); }} className="text-xs font-semibold text-orange-600">{current ? "Change" : "Set username"}</button>
        </div>
      )}
      {msg && <div className="mt-1 text-xs text-red-500">{msg}</div>}
      {current && !edit && <div className={`mt-1 text-[11px] ${sub}`}>Login mein email ki jagah "{current}" likh sakte ho.</div>}
    </div>
  );
}

/* Team code to invite partners, who is in, and sign-out. */
export default function TeamPanel({ dark = false }) {
  const { workspace, members, session, me, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const link = window.location.origin;
  const invite = `Taazu join karo: ${link}\nSign in karke ye team code daalna: ${workspace.join_code}`;
  const copy = async () => { try { await navigator.clipboard.writeText(workspace.join_code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const box = dark ? "bg-slate-800 text-slate-100" : "bg-slate-50 border border-slate-200 text-slate-800";

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-xs font-medium ${sub}`}><Users size={13} />Team · {workspace.name}</div>
      <div className={`rounded-xl p-3 ${box}`}>
        <div className={`text-[11px] ${sub}`}>Invite code</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex-1 font-mono text-lg font-bold tracking-[0.25em]">{workspace.join_code}</span>
          <button onClick={copy} aria-label="Copy code" className="p-2 rounded-lg active:opacity-70">{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(invite)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className="p-2 rounded-lg text-green-600 active:opacity-70"><MessageCircle size={16} /></a>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {members.map((m) => (
          <span key={m.user_id} className={`rounded-full px-2.5 py-1 text-xs ${m.user_id === session.user.id ? "bg-orange-600 text-white" : dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
            {m.display_name || "Partner"}{m.role === "owner" ? " ★" : ""}
          </span>
        ))}
      </div>
      <UsernameRow dark={dark} sub={sub} />
      <button onClick={signOut} className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2 text-xs ${sub}`}>
        <LogOut size={14} />Sign out {me?.display_name ? `(${me.display_name})` : session.user.email?.replace("@taazu.app", "")}
      </button>
    </div>
  );
}
