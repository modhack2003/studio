'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Operator dossier — the "compile my profile" terminal.
 *
 * Replaces the old placeholder op-codename generator with something built from
 * Bikram's real details: title, base, primary languages and live GitHub counts.
 * Pick a discipline, run the compile, and it prints a short readout for that track.
 */

interface Discipline {
  id: string;
  name: string;
  jp: string;
  blurb: string;
  focus: string[];
  stats: { offense: number; defense: number; recon: number; automation: number };
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'offense',
    name: 'Offensive Security',
    jp: '攻撃',
    blurb: 'Web, API and network penetration testing — find the hole before someone else does.',
    focus: ['OWASP Top 10', 'BOLA / IDOR', 'Auth bypass', 'Privilege escalation'],
    stats: { offense: 9, defense: 6, recon: 8, automation: 7 },
  },
  {
    id: 'bounty',
    name: 'Bug Bounty',
    jp: '賞金',
    blurb: 'Responsible disclosure on public and private programs, with reproducible reports.',
    focus: ['Recon at scale', 'Business logic', 'Report writing', 'Coordinated disclosure'],
    stats: { offense: 8, defense: 5, recon: 9, automation: 8 },
  },
  {
    id: 'defense',
    name: 'Defensive Review',
    jp: '防御',
    blurb: 'Secure code review and hardening — close the gaps and verify the fix holds.',
    focus: ['Static analysis', 'Threat modelling', 'Hardening', 'Re-test'],
    stats: { offense: 5, defense: 9, recon: 6, automation: 7 },
  },
  {
    id: 'build',
    name: 'Secure Engineering',
    jp: '開発',
    blurb: 'Ship full-stack apps that are safe by default — this very site is one of them.',
    focus: ['TypeScript / Next.js', 'Node & Python', 'Auth & sessions', 'CI hygiene'],
    stats: { offense: 6, defense: 8, recon: 6, automation: 9 },
  },
];

const STAT_LABELS: { key: keyof Discipline['stats']; label: string; jp: string }[] = [
  { key: 'offense', label: 'Offense', jp: '攻撃' },
  { key: 'defense', label: 'Defense', jp: '防御' },
  { key: 'recon', label: 'Recon', jp: '偵察' },
  { key: 'automation', label: 'Automation', jp: '自動' },
];

interface OperatorProfile {
  name?: string;
  title?: string;
  location?: string | null;
  github?: string;
  languages?: string[];
  repoCount?: number;
  yearsActive?: number;
}

export function MaskedGenerator({ profile }: { profile?: OperatorProfile }) {
  const name = profile?.name || 'Bikram Dey';
  const location = profile?.location?.trim() || 'Kolkata, IN';
  const handle = (profile?.github || 'https://github.com/modhack2003').replace(/\/+$/, '').split('/').pop() || 'modhack2003';
  const languages = profile?.languages?.length ? profile.languages : ['TypeScript', 'JavaScript', 'Python'];
  const repoCount = profile?.repoCount ?? 0;
  const yearsActive = profile?.yearsActive ?? 0;

  const [selected, setSelected] = useState<Discipline>(DISCIPLINES[0]);
  const [compiling, setCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compiled, setCompiled] = useState<Discipline | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const makeRef = useCallback(() => {
    const hex = Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
    return `OP-${hex}`;
  }, []);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const compile = useCallback(() => {
    if (compiling) return;
    setCompiling(true);
    setCompiled(null);
    setRef(null);
    setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return stopTimer();
      p = Math.min(100, p + Math.floor(Math.random() * 13) + 5);
      setProgress(p);
      if (p >= 100) {
        stopTimer();
        setCompiling(false);
        setCompiled(selected);
        setRef(makeRef());
      }
    }, 130);
  }, [compiling, selected, makeRef]);

  const select = useCallback(
    (d: Discipline) => {
      if (compiling) return;
      setSelected(d);
      setCompiled(null);
      setRef(null);
      setProgress(0);
    },
    [compiling]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopTimer();
    };
  }, []);

  const initials = useMemo(
    () =>
      name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [name]
  );

  const readout = compiled ?? selected;
  const status = compiling ? 'Compiling dossier' : compiled ? 'Dossier ready' : 'Standby';

  return (
    <section aria-label="Operator dossier" className="relative">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-signal/40 pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-4 flex items-center gap-3 monofont text-[10px] uppercase tracking-[0.35em] text-signal">
            <span className="inline-block h-2 w-2 bg-signal" /> Operator Dossier Terminal
          </p>
          <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] sm:text-7xl">
            <span className="text-bone">Meet the</span> <span className="text-outline-red">operator</span>
          </h2>
        </div>
        <p className="max-w-xs monofont text-[11px] uppercase leading-relaxed tracking-widest text-muted-foreground">
          Pick a discipline, then compile to read that side of {name.split(' ')[0]}&apos;s profile.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr_1fr]">
        {/* live capability meters for the selected discipline */}
        <div className="order-2 space-y-4 lg:order-1">
          {STAT_LABELS.map(({ key, label, jp }) => {
            const value = readout.stats[key];
            return (
              <div key={key} className="border-b border-signal/30 pb-3">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-jp text-xs text-signal/80">{jp}</div>
                    <div className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
                  </div>
                  <motion.span
                    key={`${readout.id}-${key}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-3xl font-bold text-bone"
                  >
                    {String(value).padStart(2, '0')}
                  </motion.span>
                </div>
                <div className="mt-2 flex gap-[3px]">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn('h-2 flex-1 transition-colors duration-300', i < value ? 'bg-signal' : 'bg-signal/15')}
                      style={{ transitionDelay: `${i * 25}ms` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="border border-signal/30 p-4 monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Base</span>
              <span className="text-bone">{location}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Public repos</span>
              <span className="text-bone">{repoCount ? String(repoCount).padStart(2, '0') : '—'}</span>
            </div>
            {yearsActive > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span>Building since</span>
                <span className="text-bone">{yearsActive}y</span>
              </div>
            )}
          </div>
        </div>

        {/* dossier stage */}
        <div className="order-1 flex flex-col border border-signal/50 bg-card lg:order-2">
          <div className="flex items-center justify-between border-b border-signal/40 px-4 py-3 monofont text-[10px] uppercase tracking-[0.3em]">
            <span className="text-signal">{status}</span>
            <span className="text-muted-foreground">@{handle}</span>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden py-10">
            <div aria-hidden className="grid-cross absolute inset-0 opacity-60" />
            <AnimatePresence mode="wait">
              <motion.div
                key={readout.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex h-56 w-56 items-center justify-center"
              >
                <div className={cn('absolute inset-0 rounded-full border border-dashed border-signal/60', compiling && 'animate-spin-slow')} />
                <div className="absolute inset-6 rounded-full border border-cyan/40" />
                <div className="text-center">
                  <span className={cn('font-display text-[5.5rem] font-bold leading-none text-signal', compiling && 'animate-flicker')}>
                    {initials}
                  </span>
                  <p className="mt-1 font-jp text-2xl font-black text-outline-red">{readout.jp}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-signal/40 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-2xl font-bold uppercase text-bone">{readout.name}</div>
                <div className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{name}</div>
              </div>
              <div className="text-right monofont text-xs">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">ref</div>
                <div className="whitespace-nowrap text-cyan">{ref ?? 'OP-------'}</div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {compiled ? (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 overflow-hidden"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{compiled.blurb}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {compiled.focus.map((f) => (
                      <span key={f} className="border border-signal/40 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider text-bone/85">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <p key="hint" className="mt-4 monofont text-[11px] uppercase leading-relaxed tracking-widest text-muted-foreground/70">
                  {compiling ? `Reading ${selected.name.toLowerCase()} track…` : 'Run compile to print this track.'}
                </p>
              )}
            </AnimatePresence>

            <div className="mt-4 h-1.5 overflow-hidden bg-signal/15">
              <div className="h-full bg-signal transition-all duration-100" style={{ width: `${compiled ? 100 : progress}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={compile}
                disabled={compiling}
                className="bracket bg-signal px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-bone disabled:opacity-60"
              >
                {compiling ? `Compiling ${progress}%` : '>_COMPILE_DOSSIER'}
              </button>
              <a
                href="#vapt"
                className="inline-flex items-center gap-1.5 monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-signal"
              >
                Request this <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* disciplines + languages */}
        <div className="order-3 space-y-8">
          <div>
            <div className="mb-4 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Disciplines</div>
            <ul className="border-t border-signal/30">
              {DISCIPLINES.map((d, i) => {
                const on = readout.id === d.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => select(d)}
                      aria-pressed={on}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 border-b border-signal/30 px-3 py-3 text-left transition-colors',
                        on ? 'bg-signal text-ink' : 'hover:bg-signal/10'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="monofont text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-sm font-bold uppercase">{d.name}</span>
                      </span>
                      <span className={cn('font-jp text-sm', on ? 'text-ink/80' : 'text-signal/70')}>{d.jp}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span>Primary stack</span>
              <span className="font-jp text-signal/70">言語</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-2 border border-signal/40 px-3 py-1.5 monofont text-[11px] uppercase tracking-wider text-bone/85"
                >
                  <span className="h-1.5 w-1.5 bg-cyan" /> {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
