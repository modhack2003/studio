'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Crosshair reticle that trails the pointer and locks onto interactive
 * elements. Desktop / fine pointers only — the native cursor stays visible.
 */
export function CyberCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let hovering = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      hovering = !!t?.closest('a,button,[role="button"],input,textarea,select,label');
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ringRef.current) {
        const s = hovering ? 1.8 : 1;
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s}) rotate(${hovering ? 45 : 0}deg)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] h-8 w-8 transition-[width,height] duration-200"
        style={{ mixBlendMode: 'difference' }}
      >
        <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-bone" />
        <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-bone" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-bone" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-bone" />
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1 w-1 bg-signal"
      />
    </>
  );
}
