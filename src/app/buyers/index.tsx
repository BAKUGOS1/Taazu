import { Sparkles } from "lucide-react";
import CrmView from "../crm/CrmView";
import Pitch from "./Pitch";
import { BUYER_CFG as cfg } from "../crm/configs";

export default function BuyersView({ rows, setRows, logs, setLogs, me = "" }) {
  return (
    <CrmView
      cfg={cfg} rows={rows} setRows={setRows} logs={logs} setLogs={setLogs} me={me}
      stats={(rs, due) => [
        ["Due", due, "#EA580C"],
        ["New", rs.filter((r) => r.status === "New").length, cfg.stageCol.New],
        ["Warm", rs.filter((r) => r.status === "Meeting" || r.status === "Trial").length, cfg.stageCol.Trial],
        ["Customers", rs.filter((r) => r.status === "Customer").length, cfg.stageCol.Customer],
      ]}
      extra={{ id: "pitch", label: "Pitch", icon: Sparkles, render: () => <Pitch /> }}
    />
  );
}
