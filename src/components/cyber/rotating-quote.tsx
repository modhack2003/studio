'use client';

import { useEffect, useState } from 'react';
import { NOT_FOUND_QUOTES, getQuoteClock, quoteIndexAt, QUOTE_INTERVAL_MS } from '@/lib/not-found-quotes';
import { CrowScatter } from './crow-scatter';

// Used only in the browser when storage is unavailable.
let fallbackAnchor: number | undefined;

export function RotatingQuote({ large = false, label = 'Intercepted thought' }: { large?: boolean; label?: string }) {
  const [quote, setQuote] = useState({ index: 0, previous: null as number | null, ready: false });
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
      const index = quoteIndexAt(anchor, current);
      setQuote((old) => old.ready && old.index === index ? old : {
        index,
        previous: old.ready ? old.index : null,
        ready: true,
      });
      timer = setTimeout(update, QUOTE_INTERVAL_MS - (Math.max(0, current - anchor) % QUOTE_INTERVAL_MS));
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [paused]);

  return <section aria-label="Rotating thoughts" className="relative border-l-2 border-signal pl-5 sm:pl-6">
    <p className="monofont text-[10px] uppercase tracking-[0.2em] text-signal">{label}{' // '}{String(quote.index + 1).padStart(2, '0')} / {NOT_FOUND_QUOTES.length}</p>
    <div key={quote.index} className={quote.ready ? 'quote-transition relative' : 'relative'}>
      {quote.ready && <CrowScatter />}
      <blockquote className={`relative mt-4 grid font-display leading-relaxed ${large ? 'min-h-[10rem] text-2xl sm:min-h-[6rem] sm:text-[1.75rem]' : 'min-h-[7.5rem] text-xl sm:text-2xl'}`}>
        {quote.previous !== null && <span aria-hidden className="quote-outgoing col-start-1 row-start-1 self-start">“{NOT_FOUND_QUOTES[quote.previous]}”</span>}
        <span className="quote-copy col-start-1 row-start-1 self-start">“{NOT_FOUND_QUOTES[quote.index]}”</span>
      </blockquote>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <p className="monofont text-[9px] uppercase tracking-[0.2em] text-bone/50">Original words // new thought every 10 seconds</p>
      <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="border-b border-signal/40 py-1 monofont text-[10px] uppercase tracking-wider text-signal hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
        {paused ? 'Resume quotes' : 'Pause quotes'}
      </button>
    </div>
  </section>;
}
