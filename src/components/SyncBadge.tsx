import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import type { SyncStatus } from "../lib/useSync";

const LOOK: Record<SyncStatus, [any, string, string]> = {
  loading: [Loader2, "Loading", "text-slate-500"],
  saving: [Loader2, "Saving", "text-slate-500"],
  synced: [Cloud, "Synced", "text-green-600"],
  offline: [CloudOff, "Offline — will sync", "text-amber-600"],
  error: [AlertTriangle, "Sync failed — retrying", "text-red-600"],
};

export default function SyncBadge({ status, compact = false }: { status: SyncStatus; compact?: boolean }) {
  const [Icon, label, tone] = LOOK[status];
  const spin = status === "loading" || status === "saving";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`} title={label} role="status">
      <Icon size={14} className={spin ? "animate-spin" : ""} />{!compact && label}
    </span>
  );
}
