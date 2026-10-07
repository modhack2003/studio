'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NOT_FOUND_QUOTES, getQuoteClock, quoteIndexAt, QUOTE_INTERVAL_MS } from '@/lib/not-found-quotes';
import { CrowScatter } from './crow-scatter';

const SharinganEye = dynamic(() => import('./sharingan').then((module) => module.SharinganEye), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center monofont text-[10px] uppercase tracking-[0.3em]">Opening eye…</div>,
});

// In-memory continuity for browsers that block storage.
let fallbackAnchor: number | undefined;

export function NotFoundScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const now = Date.now();
    let anchor: number;
    try {
      anchor = getQuoteClock(window.sessionStorage, now);
    } catch {
      fallbackAnchor ??= now;
      anchor = fallbackAnchor;
    }
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      const current = Date.now();
      setQuoteIndex(quoteIndexAt(anchor, current));
      setReady(true);
      timer = setTimeout(update, QUOTE_INTERVAL_MS - (Math.max(0, current - anchor) % QUOTE_INTERVAL_MS));
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [paused]);

  return (
    <main className="relative overflow-hidden bg-ink text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-cross" />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-signal/40 py-6 monofont text-[10px] uppercase tracking-[0.2em]">
          <Link href="/" className="font-bold text-signal hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">[ Bikram Dey ]</Link>
          <span className="text-bone/60">System response // 404</span>
        </div>
        <div className="grid items-center gap-10 py-12 sm:py-16 lg:min-h-[75vh] lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="monofont text-[10px] uppercase tracking-[0.3em] text-signal">Connection lost / route unknown</p>
            <div aria-hidden className="my-4 font-display text-[clamp(7rem,20vw,17rem)] font-bold leading-[0.85] tracking-tighter text-outline-red">404<span className="text-signal">_</span></div>
            <h1 className="mt-8 font-display text-3xl font-bold uppercase leading-tight sm:text-5xl">Page not found.</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/65">This page may have moved, or the link took a wrong turn. Head back to familiar territory.</p>
            <nav aria-label="Recovery links" className="mt-8 flex flex-wrap gap-3 monofont text-xs font-bold uppercase">
              <Link href="/" className="border border-signal bg-signal px-5 py-4 text-ink transition-colors hover:bg-bone hover:border-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone">[ Return home ↗ ]</Link>
              <Link href="/#projects" className="border border-bone/30 px-5 py-4 transition-colors hover:border-signal hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">[ Explore projects ]</Link>
            </nav>
          </div>
          <div className="min-w-0">
            <div className="on-red clip-notch relative bg-signal text-ink">
              <div aria-hidden className="pointer-events-none absolute inset-0 grid-cross-ink" />
              <div className="relative flex items-center justify-between gap-3 border-b border-ink/40 px-5 py-4 monofont text-[10px] uppercase tracking-[0.2em]">
                <span>写輪眼 // Sharingan</span><span>Signal: lost</span>
              </div>
              <SharinganEye className="relative h-[280px] w-full sm:h-[360px] lg:h-[400px]" />
              <p className="relative border-t border-ink/40 px-5 py-4 monofont text-[10px] uppercase tracking-[0.2em]">Even this eye cannot locate your page.</p>
            </div>
            <div className="relative mt-6 border-l-2 border-signal pl-5">
              <p className="monofont text-[10px] uppercase tracking-[0.2em] text-signal">Intercepted thought // {String(quoteIndex + 1).padStart(2, '0')} / {NOT_FOUND_QUOTES.length}</p>
              <div key={quoteIndex} className={ready ? 'quote-transition relative' : 'relative'}>
                {ready && <CrowScatter />}
                <blockquote className="quote-copy mt-3 min-h-[4.5rem] font-display text-lg leading-relaxed sm:text-xl">“{NOT_FOUND_QUOTES[quoteIndex]}”</blockquote>
              </div>
              <p className="mt-2 monofont text-[9px] uppercase tracking-[0.2em] text-bone/50">Original words // new thought every 10 seconds</p>
              <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="mt-3 border-b border-signal/40 py-1 monofont text-[10px] uppercase tracking-wider text-signal hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
                {paused ? 'Resume quotes' : 'Pause quotes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
