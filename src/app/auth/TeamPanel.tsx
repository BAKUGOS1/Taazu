import { useState } from "react";
import { Copy, MessageCircle, LogOut, Users, Check } from "lucide-react";
import { useAuth } from "./AuthGate";

/* Team code to invite partners, who is in, and sign-out. */
export default function TeamPanel({ dark = false }) {
  const { workspace, members, session, me, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const link = window.location.origin;
  const invite = `Taazu HQ join karo: ${link}\nSign in karke ye team code daalna: ${workspace.join_code}`;
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
      <button onClick={signOut} className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2 text-xs ${sub}`}>
        <LogOut size={14} />Sign out {me?.display_name ? `(${me.display_name})` : session.user.email}
      </button>
    </div>
  );
}
