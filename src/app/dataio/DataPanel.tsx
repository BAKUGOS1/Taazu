import { useState } from "react";
import { Download, Upload, FileSpreadsheet, RotateCcw, Database } from "lucide-react";
import { btn, btnGhost, btnPrimary, Panel } from "../../components/ui";
import { MODULES } from "../../lib/dataio/schema";
import { exportModule, downloadTemplate, downloadAllTemplates } from "../../lib/dataio/xlsx";
import ImportWizard, { type Store } from "./ImportWizard";

/* Settings -> Data: import from any file, export one module or everything, sample templates. */
export default function DataPanel({ stores, exportEverything, resetAll, armReset, say }: {
  stores: Record<string, Store>; exportEverything: () => void; resetAll: () => void; armReset: boolean; say: (m: string) => void;
}) {
  const [importing, setImporting] = useState(false);
  const small = "rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100";

  return (
    <>
      <Panel title="Import" icon={Upload}>
        <p className="text-xs text-slate-500 mb-3">Bring in suppliers, buyers, sales and more from any Excel or CSV file: another CRM, Tally, IndiaMART, JustDial or a Google Sheet. Columns are matched for you, duplicates are caught by phone, GSTIN, email or name, and you see everything before it's saved.</p>
        <button onClick={() => setImporting(true)} className={`${btnPrimary} w-full`}><Upload size={16} />Import from Excel or CSV</button>
      </Panel>

      <Panel title="Export" icon={Download}>
        <button onClick={() => { exportEverything(); say("Excel downloaded"); }} className={`${btnGhost} w-full mb-3`}><Database size={16} />Everything in one Excel file</button>
        <div className="divide-y divide-slate-100 -mx-1">
          {MODULES.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-1 py-2">
              <span className="flex-1 text-sm text-slate-800">{m.label} <span className="text-xs text-slate-400">{stores[m.id]?.rows.length ?? 0}</span></span>
              <button className={small} onClick={() => { exportModule(m, stores[m.id].rows); say(`${m.label} downloaded`); }}>Excel</button>
              <button className={small} onClick={() => { exportModule(m, stores[m.id].rows, true); say(`${m.label} CSV downloaded`); }}>CSV</button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Exports have every field, so you can edit them in Excel and import them straight back.</p>
      </Panel>

      <Panel title="Sample import files" icon={FileSpreadsheet}>
        <p className="text-xs text-slate-500 mb-3">Blank .xlsx files with the right columns, two example rows and a help sheet listing every column and allowed value.</p>
        <button onClick={downloadAllTemplates} className={`${btnGhost} w-full mb-2`}><FileSpreadsheet size={16} className="text-green-700" />All templates in one file</button>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => <button key={m.id} className={small} onClick={() => downloadTemplate(m)}>{m.label}</button>)}
        </div>
      </Panel>

      <Panel>
        <button onClick={resetAll} className={`${btn} w-full text-xs ${armReset ? "bg-red-600 text-white" : "text-slate-500"}`}><RotateCcw size={14} />{armReset ? "Tap again to confirm reset" : "Reset to starting data"}</button>
      </Panel>

      <ImportWizard open={importing} onClose={() => setImporting(false)} stores={stores} say={say} />
    </>
  );
}
