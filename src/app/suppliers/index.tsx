import { Scale } from "lucide-react";
import CrmView from "../crm/CrmView";
import { SUPPLIER_CFG as cfg } from "../crm/configs";
import CompareView from "./CompareView";

export default function SuppliersView({ rows, setRows, logs, setLogs, me = "" }) {
  return (
    <CrmView
      cfg={cfg} rows={rows} setRows={setRows} logs={logs} setLogs={setLogs} me={me}
      stats={(rs, due) => [
        ["Due", due, "#EA580C"],
        ["To call", rs.filter((r) => r.status === "To call").length, cfg.stageCol["To call"]],
        ["Quotes", rs.filter((r) => Number(r.price) > 0).length, cfg.stageCol["Quote received"]],
        ["Final", rs.filter((r) => r.status === "Finalized").length, cfg.stageCol.Finalized],
      ]}
      extra={{ id: "compare", label: "Compare", icon: Scale, render: (open) => <CompareView rows={rows} onOpen={open} /> }}
    />
  );
}
