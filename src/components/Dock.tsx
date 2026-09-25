/* Floating liquid-glass bottom dock for phones — a port of Phere's GlassDockNav.

   At rest a plain capsule sits behind the active tab. While a finger is held
   down, a glass lens appears above the icons, refracts them through an SVG
   displacement filter, trails the finger and stretches as it travels.
   Releasing commits whichever tab it rests on.

   The lens is driven from a requestAnimationFrame loop that writes straight to
   the DOM, so a drag only re-renders when the highlighted tab changes.

   `items` is [{ id, label, icon, badge? }]; `onSelect` receives the item id. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import LiquidLensFilter, { LENS_FILTER_ID } from "./LiquidLensFilter";

const NAV_PADDING = 6;  // matches .taazu-dock padding
const ITEM_HEIGHT = 52; // matches .taazu-dock__item min-height
const BULGE_X = 4;
const BULGE_Y = 12;
const FOLLOW = 0.34;
const STRETCH_PER_PX = 1.7;
const MAX_STRETCH_PX = 26;
const STRETCH_FLATTEN = 0.42;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* The lens is a per-frame SVG filter: skip it for reduced motion and on
   budget phones, where it would drop frames. */
function effectsEnabled() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const nav: any = navigator;
  if (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) return false;
  if (nav.deviceMemory > 0 && nav.deviceMemory <= 4) return false;
  return true;
}

function Badge({ n }) {
  if (!(n > 0)) return null;
  return <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold leading-4 text-center">{n > 99 ? "99+" : n}</span>;
}

export default function Dock({ items, activeIndex, onSelect }) {
  const navRef = useRef(null);
  const wrapRef = useRef(null);
  const lensRef = useRef(null);
  const refractRef = useRef(null);

  const dragIndexRef = useRef(null);
  const suppressClickRef = useRef(false);
  const rafRef = useRef(0);
  const pointerXRef = useRef(0);
  const navLeftRef = useRef(0);
  const lensXRef = useRef(0);
  const prevLensXRef = useRef(0);

  const [dragIndex, setDragIndex] = useState(null);
  const [navWidth, setNavWidth] = useState(0);
  const [effects] = useState(effectsEnabled);

  const count = items.length;
  const dragging = dragIndex !== null;
  const shownIndex = dragging ? dragIndex : activeIndex;
  const colWidth = navWidth > 0 && count > 0 ? (navWidth - NAV_PADDING * 2) / count : 0;
  const showLens = effects && dragging && colWidth > 0;

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return undefined;
    const measure = () => setNavWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const indexFromClientX = useCallback((clientX) => {
    const el = navRef.current;
    if (!el || count === 0) return 0;
    const rect = el.getBoundingClientRect();
    const inner = rect.width - NAV_PADDING * 2;
    if (inner <= 0) return 0;
    return clamp(Math.floor(((clientX - rect.left - NAV_PADDING) / inner) * count), 0, count - 1);
  }, [count]);

  const targetLensX = useCallback(() => {
    const inner = navWidth - NAV_PADDING * 2;
    const raw = pointerXRef.current - navLeftRef.current - NAV_PADDING - colWidth / 2;
    return clamp(raw, 0, Math.max(0, inner - colWidth));
  }, [navWidth, colWidth]);

  const drawLens = useCallback((snap) => {
    const wrap = wrapRef.current, lens = lensRef.current, refract = refractRef.current;
    if (!wrap || !lens || !refract || colWidth <= 0) return;

    const target = targetLensX();
    if (snap) { lensXRef.current = target; prevLensXRef.current = target; }
    else lensXRef.current += (target - lensXRef.current) * FOLLOW;

    const travel = lensXRef.current - prevLensXRef.current;
    prevLensXRef.current = lensXRef.current;

    const stretch = Math.min(Math.abs(travel) * STRETCH_PER_PX, MAX_STRETCH_PX);
    const width = colWidth + BULGE_X * 2 + stretch;
    const height = ITEM_HEIGHT + BULGE_Y * 2 - stretch * STRETCH_FLATTEN;
    const lensLeft = -(width - colWidth) / 2;
    const lensTop = -(height - ITEM_HEIGHT) / 2;

    wrap.style.transform = `translate3d(${lensXRef.current}px, 0, 0)`;
    lens.style.width = `${width}px`;
    lens.style.height = `${height}px`;
    lens.style.left = `${lensLeft}px`;
    lens.style.top = `${lensTop}px`;
    // Hold the refracted copy still while the lens moves over it.
    refract.style.left = `${-(NAV_PADDING + lensXRef.current + lensLeft)}px`;
    refract.style.top = `${-lensTop}px`;
  }, [colWidth, targetLensX]);

  useLayoutEffect(() => { if (showLens) drawLens(true); }, [showLens, drawLens]);

  useEffect(() => {
    if (!showLens) return undefined;
    let alive = true;
    const tick = () => { if (!alive) return; drawLens(false); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [showLens, drawLens]);

  const moveDragTo = useCallback((clientX) => {
    const idx = indexFromClientX(clientX);
    if (dragIndexRef.current !== idx) {
      dragIndexRef.current = idx;
      setDragIndex(idx);
      try { navigator.vibrate?.(8); } catch { /* no haptics */ }
    }
  }, [indexFromClientX]);

  const commit = useCallback((idx) => onSelect(items[idx].id), [items, onSelect]);

  const endDrag = useCallback((doCommit) => {
    const idx = dragIndexRef.current;
    dragIndexRef.current = null;
    setDragIndex(null);
    if (doCommit && idx != null) { suppressClickRef.current = true; commit(idx); }
  }, [commit]);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try { navRef.current?.setPointerCapture?.(e.pointerId); } catch { /* not capturable */ }
    const el = navRef.current;
    if (el) { setNavWidth(el.clientWidth); navLeftRef.current = el.getBoundingClientRect().left; }
    pointerXRef.current = e.clientX;
    moveDragTo(e.clientX);
  }, [moveDragTo]);

  const onPointerMove = useCallback((e) => {
    if (dragIndexRef.current === null) return;
    pointerXRef.current = e.clientX;
    moveDragTo(e.clientX);
  }, [moveDragTo]);

  // Pointer taps commit in endDrag; this only serves keyboard activation.
  const onClick = useCallback((idx) => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    commit(idx);
  }, [commit]);

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-safe-dock pointer-events-none">
      <nav
        ref={navRef}
        className="taazu-dock pointer-events-auto grid"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        aria-label="Main"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endDrag(true)}
        onPointerCancel={() => endDrag(false)}
      >
        {effects && <LiquidLensFilter />}

        {shownIndex >= 0 && (
          <span aria-hidden="true" className={`taazu-dock__pill ${showLens ? "is-lensed" : ""}`}
            style={{
              width: colWidth > 0 ? `${colWidth}px` : `calc((100% - ${NAV_PADDING * 2}px) / ${count})`,
              transform: `translateX(${shownIndex * 100}%)`,
            }} />
        )}

        {items.map((it, i) => {
          const Icon = it.icon;
          const on = i === shownIndex;
          return (
            <button key={it.id} type="button" onClick={() => onClick(i)}
              className={`taazu-dock__item ${on ? "is-active" : ""}`} aria-current={i === activeIndex ? "page" : undefined}>
              <span className="relative"><Icon size={20} strokeWidth={on ? 2.4 : 1.8} /><Badge n={it.badge} /></span>
              <span>{it.label}</span>
            </button>
          );
        })}

        {showLens && (
          <span aria-hidden="true" ref={wrapRef} className="taazu-dock__lens-wrap">
            <span ref={lensRef} className="taazu-dock__lens">
              <span ref={refractRef} className="taazu-dock__lens-refract"
                style={{ width: `${navWidth}px`, gridTemplateColumns: `repeat(${count}, ${colWidth}px)`, filter: `url(#${LENS_FILTER_ID})` }}>
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <span key={it.id} className="taazu-dock__lens-item">
                      <span className="relative"><Icon size={20} strokeWidth={1.8} /><Badge n={it.badge} /></span>
                      <span>{it.label}</span>
                    </span>
                  );
                })}
              </span>
              <span className="taazu-dock__lens-glare" />
            </span>
          </span>
        )}
      </nav>
    </div>
  );
}
