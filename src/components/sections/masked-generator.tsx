'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ProjectOption {
  id: string;
  name: string;
  subtitle?: string;
  stats?: {
    impact?: number;
    reach?: number;
    precision?: number;
    speed?: number;
    depth?: number;
    coverage?: number;
  };
}

const PROJECTS: ProjectOption[] = [
  { id: 'alpha', name: 'Alpha', subtitle: 'Discovery', stats: { impact: 9, reach: 6, precision: 7, speed: 8, depth: 7, coverage: 8 } },
  { id: 'beta', name: 'Beta', subtitle: 'Mapping', stats: { impact: 7, reach: 8, precision: 9, speed: 6, depth: 8, coverage: 6 } },
  { id: 'gamma', name: 'Gamma', subtitle: 'Testing', stats: { impact: 10, reach: 5, precision: 6, speed: 6, depth: 7, coverage: 9 } },
  { id: 'delta', name: 'Delta', subtitle: 'Analysis', stats: { impact: 6, reach: 7, precision: 10, speed: 9, depth: 8, coverage: 6 } },
  { id: 'epsilon', name: 'Epsilon', subtitle: 'Scan', stats: { impact: 4, reach: 6, precision: 5, speed: 6, depth: 8, coverage: 9 } },
  { id: 'zeta', name: 'Zeta', subtitle: 'Pipeline', stats: { impact: 6, reach: 7, precision: 8, speed: 8, depth: 5, coverage: 7 } },
  { id: 'eta', name: 'Eta', subtitle: 'Report', stats: { impact: 8, reach: 5, precision: 7, speed: 7, depth: 9, coverage: 8 } },
  { id: 'theta', name: 'Theta', subtitle: 'Review', stats: { impact: 6, reach: 9, precision: 7, speed: 7, depth: 6, coverage: 8 } },
  { id: 'iota', name: 'Iota', subtitle: 'Trace', stats: { impact: 7, reach: 6, precision: 9, speed: 9, depth: 5, coverage: 8 } },
  { id: 'kappa', name: 'Kappa', subtitle: 'Probe', stats: { impact: 8, reach: 7, precision: 6, speed: 9, depth: 8, coverage: 6 } },
  { id: 'lambda', name: 'Lambda', subtitle: 'Audit', stats: { impact: 9, reach: 5, precision: 8, speed: 7, depth: 8, coverage: 7 } },
  { id: 'mu', name: 'Mu', subtitle: 'Signal', stats: { impact: 10, reach: 8, precision: 8, speed: 9, depth: 10, coverage: 9 } },
  { id: 'nu', name: 'Nu', subtitle: 'Filter', stats: { impact: 8, reach: 6, precision: 7, speed: 7, depth: 7, coverage: 7 } },
  { id: 'xi', name: 'Xi', subtitle: 'Mesh', stats: { impact: 4, reach: 7, precision: 8, speed: 8, depth: 6, coverage: 7 } },
];

const GREEK: Record<string, string> = {
  alpha: 'Α', beta: 'Β', gamma: 'Γ', delta: 'Δ', epsilon: 'Ε', zeta: 'Ζ', eta: 'Η',
  theta: 'Θ', iota: 'Ι', kappa: 'Κ', lambda: 'Λ', mu: 'Μ', nu: 'Ν', xi: 'Ξ',
};

const STAT_LABELS: { key: keyof NonNullable<ProjectOption['stats']>; label: string; short: string; jp: string }[] = [
  { key: 'impact', label: 'Impact', short: 'IMP', jp: '衝撃' },
  { key: 'reach', label: 'Reach', short: 'RCH', jp: '到達' },
  { key: 'precision', label: 'Precision', short: 'PRE', jp: '精度' },
  { key: 'speed', label: 'Speed', short: 'SPD', jp: '速度' },
  { key: 'depth', label: 'Depth', short: 'DEP', jp: '深度' },
  { key: 'coverage', label: 'Coverage', short: 'COV', jp: '範囲' },
];

export function MaskedGenerator() {
  const [selectedProject, setSelectedProject] = useState<ProjectOption>(PROJECTS[0]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hash, setHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateHash = useCallback(() => {
    const hex = Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
    return `0x${hex}`;
  }, []);

  const runGeneration = useCallback(() => {
    if (generating) return;
    setGenerating(true);
    setHash(null);
    setProgress(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      p += Math.floor(Math.random() * 12) + 4;
      if (p > 100) p = 100;
      setProgress(p);
      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGenerating(false);
        setHash(generateHash());
      }
    }, 140);
  }, [generating, generateHash]);

  const handleSelect = useCallback(
    (project: ProjectOption) => {
      if (generating) return;
      setSelectedProject(project);
      setHash(null);
      setProgress(0);
    },
    [generating]
  );

  const randomSelect = () => handleSelect(PROJECTS[Math.floor(Math.random() * PROJECTS.length)]);
  const reset = () => handleSelect(PROJECTS[0]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const block = `S-${(selectedProject.id.length * 7331).toString().slice(0, 5)}`;

  return (
    <section aria-label="Operation profile generator" className="relative">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-signal/40 pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-4 flex items-center gap-3 monofont text-[10px] uppercase tracking-[0.35em] text-signal">
            <span className="inline-block h-2 w-2 bg-signal" /> Operation Profile Terminal
          </p>
          <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] sm:text-7xl">
            <span className="text-bone">Discover</span> <span className="text-outline-red">your op</span>
          </h2>
        </div>
        <p className="max-w-xs monofont text-[11px] uppercase leading-relaxed tracking-widest text-muted-foreground">
          Select an operation codename, then execute to compile its profile.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr_1fr]">
        {/* stats */}
        <div className="order-2 space-y-4 lg:order-1">
          {STAT_LABELS.map(({ key, label, jp }) => {
            const value = selectedProject.stats?.[key] ?? 0;
            return (
              <div key={key} className="border-b border-signal/30 pb-3">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-jp text-xs text-signal/80">{jp}</div>
                    <div className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
                  </div>
                  <motion.span
                    key={`${selectedProject.id}-${key}`}
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
        </div>

        {/* stage */}
        <div className="order-1 flex flex-col border border-signal/50 bg-card lg:order-2">
          <div className="flex items-center justify-between border-b border-signal/40 px-4 py-3 monofont text-[10px] uppercase tracking-[0.3em]">
            <span className="text-signal">{generating ? 'Generating profile' : hash ? 'Profile ready' : 'Standby'}</span>
            <span className="text-muted-foreground">BLOCK: {block}</span>
          </div>

          <div className="perspective relative flex flex-1 items-center justify-center overflow-hidden py-10">
            <div aria-hidden className="grid-cross absolute inset-0 opacity-60" />
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject.id}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="preserve-3d relative flex h-56 w-56 items-center justify-center"
              >
                <div className={cn('absolute inset-0 rounded-full border border-dashed border-signal/60', generating && 'animate-spin-slow')} />
                <div className="absolute inset-6 rounded-full border border-cyan/40" />
                <span className={cn('font-display text-[8rem] font-bold leading-none text-signal', generating && 'animate-flicker')}>
                  {GREEK[selectedProject.id]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-signal/40 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold uppercase text-bone">{selectedProject.name}</div>
                <div className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{selectedProject.subtitle}</div>
              </div>
              <div className="text-right monofont text-xs">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">hash</div>
                <div className="text-cyan">{hash ?? '0x——————'}</div>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden bg-signal/15">
              <div className="h-full bg-signal transition-all duration-100" style={{ width: `${hash ? 100 : progress}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={runGeneration}
                disabled={generating}
                className="bracket bg-signal px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-bone disabled:opacity-60"
              >
                {generating ? `Processing ${progress}%` : '>_EXECUTE_CREATION'}
              </button>
              <button type="button" onClick={randomSelect} className="monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-signal">
                Random selection
              </button>
              <button type="button" onClick={reset} className="monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-signal">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* catalog */}
        <div className="order-3">
          <div className="mb-4 flex items-center justify-between">
            <span className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Codenames</span>
            <div className="flex border border-signal/40">
              {(['grid', 'list'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    'px-3 py-1.5 monofont text-[10px] uppercase tracking-[0.25em] transition-colors',
                    activeTab === t ? 'bg-signal text-ink' : 'text-muted-foreground hover:text-signal'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'grid' ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project)}
                  aria-pressed={selectedProject.id === project.id}
                  className={cn(
                    'group relative flex aspect-square flex-col items-center justify-center border transition-all duration-300',
                    selectedProject.id === project.id
                      ? 'border-signal bg-signal text-ink'
                      : 'border-signal/25 text-bone hover:-translate-y-1 hover:border-signal'
                  )}
                >
                  <span className="font-display text-3xl font-bold">{GREEK[project.id]}</span>
                  <span className="monofont text-[9px] uppercase tracking-widest opacity-70">{project.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <ul className="border-t border-signal/30">
              {PROJECTS.map((project) => {
                const total = STAT_LABELS.reduce((s, { key }) => s + (project.stats?.[key] ?? 0), 0);
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(project)}
                      className={cn(
                        'flex w-full items-center justify-between border-b border-signal/30 px-2 py-2.5 monofont text-xs transition-colors',
                        selectedProject.id === project.id ? 'bg-signal text-ink' : 'hover:bg-signal/10'
                      )}
                    >
                      <span>
                        {GREEK[project.id]} · {project.name}
                        <span className="ml-2 opacity-60">({project.subtitle})</span>
                      </span>
                      <span>{total} pts</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
