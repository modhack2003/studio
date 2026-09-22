'use client';

import { cn } from '@/lib/utils';

interface PersonalData {
  name: string;
  title: string;
}

const TICKER_ITEMS = [
  'Identity Verified Terminal',
  'Security Through Obscurity Is Not Security',
  'Signals From The Digital Trenches',
];

const KEYWORD_STRIP = [
  'PENTEST',
  'REDACT',
  'FIREWALL',
  'PAYLOAD',
  'ZERO-DAY',
  'FOOTPRINT',
  'HARDEN',
  'ESCAPE',
  'PRIVESC',
  'ROOT',
  'SPECTRE',
  'PATCH',
];

function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('relative inline-block', className)} data-text={text}>
      <span className="glitch-layer absolute inset-0" aria-hidden="true">
        {text}
      </span>
      <span className="glitch-layer glitch-layer-2 absolute inset-0" aria-hidden="true">
        {text}
      </span>
      {text}
    </span>
  );
}

export function HeroSection({ personalData }: { personalData: PersonalData | null }) {
  const name = personalData?.name || 'Bikram Dey';
  const title = personalData?.title || 'Cybersecurity Analyst & Penetration Tester';

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 opacity-25"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--primary) / 0.5), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 sm:px-8">
        {/* Coordinates line — utopiatokyo signature */}
        <div className="mb-10 flex items-center justify-between text-[10px] monofont uppercase tracking-[0.3em] text-muted-foreground/70">
          <span>10.85°N</span>
          <span className="text-primary/80">/</span>
          <span>78.69°E</span>
          <span className="text-primary/80">/</span>
          <span>terminal</span>
        </div>

        {/* Big brand word */}
        <h1 className="mb-4 text-center text-4xl font-semibold tracking-[0.35em] text-foreground sm:text-6xl">
          <GlitchText text={name.toUpperCase()} />
        </h1>

        {/* Tagline block */}
        <div className="mt-10 space-y-2 text-center">
          <p className="text-2xl font-semibold tracking-[0.2em] text-primary text-glow sm:text-4xl">
            CYBERSEC.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            PENTEST.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            DEFEND.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {title}
          </p>
        </div>

        {/* Scrolling keyword strip */}
        <div className="relative mt-14 overflow-hidden border-y border-border/60 py-3">
          <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
            {[...KEYWORD_STRIP, ...KEYWORD_STRIP].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-10 text-xs monofont uppercase tracking-[0.4em] text-muted-foreground/60"
              >
                {item}
                <span className="inline-block h-1 w-1 rounded-full bg-primary/50" />
              </span>
            ))}
          </div>
        </div>

        {/* Terminal ticker under hero */}
        <div className="mt-8 flex items-center gap-3 text-[10px] monofont uppercase tracking-[0.25em] text-muted-foreground/70">
          <span className="inline-block h-px w-10 bg-primary/50" />
          <span className="truncate">{TICKER_ITEMS[0]}</span>
          <span className="inline-block h-px flex-1 bg-border/60" />
          <span className="text-primary">v2.0</span>
        </div>
      </div>
    </section>
  );
}
