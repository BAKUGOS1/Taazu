import { useEffect } from "react";
import { X } from "lucide-react";

/* Bottom sheet on phones, centred dialog on desktop. */
export default function Sheet({ open, onClose, title, children, footer = null, z = "z-50", keepMounted = false }: { open: boolean; onClose: () => void; title: any; children: any; footer?: any; z?: string; keepMounted?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  // keepMounted: stay in the page while closed so whatever was typed is still there next time.
  if (!open && !keepMounted) return null;
  return (
    <div className={`fixed inset-0 ${z} ${open ? "flex" : "hidden"} items-end md:items-center justify-center bg-slate-900/40`} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}
        className="sheet-in w-full md:max-w-xl max-h-[92dvh] flex flex-col bg-white rounded-t-3xl md:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><span className="h-1.5 w-10 rounded-full bg-slate-200" /></div>
        <div className="flex items-start gap-3 px-5 pt-3 pb-2">
          <div className="min-w-0 flex-1">{title}</div>
          <button onClick={onClose} aria-label="Close" className="-mr-2 p-2 rounded-full text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-slate-100 px-5 py-3 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}
