/* Path helpers for Brand → Docs (Supabase Storage bucket "taazu-docs"). */

export const DOCS_BUCKET = "taazu-docs";
export const KEEP = ".keep"; // empty placeholder so an empty folder still shows up
export const MAX_BYTES = 50 * 1024 * 1024; // bucket limit

/* Storage keys allow only a safe set of characters; keep names readable. */
export const safeName = (s: string) =>
  String(s || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.\- ()&+,]/g, "_")
    .replace(/_+/g, "_").replace(/\s+/g, " ")
    .trim().replace(/^\.+/, "").slice(0, 120) || "file";

/* Full storage key: "<workspace>/<folders…>/<name>". */
export const keyOf = (ws: string, folders: string[], name = "") => [ws, ...folders, name].filter(Boolean).join("/");

/* Pick a name that isn't taken: "label.pdf" → "label (2).pdf". */
export const uniqueName = (name: string, taken: Set<string>) => {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : "";
  for (let i = 2; ; i++) { const n = `${base} (${i})${ext}`; if (!taken.has(n)) return n; }
};

export const fmtSize = (b: number) =>
  !b ? "" : b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`;
