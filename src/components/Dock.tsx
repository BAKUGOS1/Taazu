/* Floating glass bottom dock for phones, modelled on Phere's GlassDockNav
   (without the drag lens). `items` is [{ id, label, icon, badge? }]. */
export default function Dock({ items, activeIndex, onSelect }) {
  const count = items.length;
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-safe-dock pointer-events-none">
      <nav className="taazu-dock pointer-events-auto grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-label="Main">
        {activeIndex >= 0 && (
          <span aria-hidden="true" className="taazu-dock__pill"
            style={{ width: `calc((100% - 12px) / ${count})`, transform: `translateX(${activeIndex * 100}%)` }} />
        )}
        {items.map((it, i) => {
          const Icon = it.icon;
          const on = i === activeIndex;
          return (
            <button key={it.id} type="button" onClick={() => { onSelect(it.id); try { navigator.vibrate?.(6); } catch { /* no haptics */ } }}
              className={`taazu-dock__item ${on ? "is-active" : ""}`} aria-current={on ? "page" : undefined}>
              <span className="relative">
                <Icon size={21} strokeWidth={on ? 2.4 : 1.8} />
                {it.badge > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold leading-4 text-center">{it.badge > 99 ? "99+" : it.badge}</span>}
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
