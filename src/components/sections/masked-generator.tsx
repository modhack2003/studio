'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
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

const STAT_LABELS: { key: keyof NonNullable<ProjectOption['stats']>; label: string; short: string }[] = [
  { key: 'impact', label: 'Impact', short: 'IMP' },
  { key: 'reach', label: 'Reach', short: 'RCH' },
  { key: 'precision', label: 'Precision', short: 'PRE' },
  { key: 'speed', label: 'Speed', short: 'SPD' },
  { key: 'depth', label: 'Depth', short: 'DEP' },
  { key: 'coverage', label: 'Coverage', short: 'COV' },
];

export function MaskedGenerator() {
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hash, setHash] = useState<string | null>(null);
  const [completion, setCompletion] = useState(0);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const mountedRef = useRef(true);

  const generateHash = useCallback(() => {
    const hex = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    return `0x${hex}`;
  }, []);

  const runGeneration = useCallback(() => {
    if (!selectedProject) return;
    setGenerating(true);
    setHash(null);
    setProgress(0);
    setCompletion(0);

    let p = 0;
    const interval = setInterval(() => {
      if (!mountedRef.current) {
        clearInterval(interval);
        return;
      }
      p += Math.floor(Math.random() * 12) + 4;
      if (p > 100) p = 100;
      setProgress(p);
      setCompletion((p / 100) * 60);

      if (p >= 100) {
        clearInterval(interval);
        setGenerating(false);
        setHash(generateHash());
      }
    }, 140);
  }, [selectedProject, generateHash]);

  const handleSelect = useCallback((project: ProjectOption) => {
    setSelectedProject(project);
    setActiveTab('grid');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none scanline opacity-40" />
      <div className="relative z-10">
        <div className="flex flex-col items-center gap-3 text-xs monofont uppercase tracking-[0.3em] text-muted-foreground text-center mb-16">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-block h-px w-12 bg-primary/60" />
            <span className="text-primary">Project Generator Terminal</span>
            <span className="inline-block h-px w-12 bg-primary/60" />
          </div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground/70">
            Select a project to initialize analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm monofont uppercase tracking-wider text-muted-foreground">
                Project Catalog
              </span>
              <div className="flex rounded overflow-hidden border border-border bg-background/50">
                <button
                  onClick={() => setActiveTab('grid')}
                  className={cn(
                    'px-4 py-1.5 text-xs monofont transition-colors',
                    activeTab === 'grid'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                  type="button"
                >
                  Grid
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={cn(
                    'px-4 py-1.5 text-xs monofont transition-colors',
                    activeTab === 'list'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                  type="button"
                >
                  List
                </button>
              </div>
            </div>

            {activeTab === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelect(project)}
                    className={cn(
                      'relative group overflow-hidden rounded border text-left transition-all',
                      'bg-card border-border hover:border-primary/60',
                      selectedProject?.id === project.id
                        ? 'ring-2 ring-primary/70 bg-primary/10'
                        : 'hover:bg-card/95'
                    )}
                    type="button"
                    aria-pressed={selectedProject?.id === project.id}
                  >
                    <span className={cn(
                      'absolute top-2 right-2 inline-flex h-2 w-2 rounded-full ring-1 ring-inset ring-border transition-colors',
                      selectedProject?.id === project.id ? 'bg-primary' : 'bg-transparent border border-border'
                    )}
                    />
                    <div className="p-4 monofont text-sm">
                      <div className="relative">
                        <span className="block text-base font-medium">{project.name}</span>
                        {project.subtitle && (
                          <span className="block text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wide">
                            {project.subtitle}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground/80 uppercase">
                        {(project.stats?.impact ?? 0) + (project.stats?.reach ?? 0) + (project.stats?.precision ?? 0) + (project.stats?.speed ?? 0) + (project.stats?.depth ?? 0) + (project.stats?.coverage ?? 0)} pts
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelect(project)}
                    className={cn(
                      'w-full text-left rounded border p-3 transition-all flex items-center justify-between gap-4',
                      'bg-card border-border hover:border-primary/60',
                      selectedProject?.id === project.id
                        ? 'ring-2 ring-primary/70 bg-primary/10'
                        : 'hover:bg-card/95'
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm monofont">{project.name}</span>
                      {project.subtitle && (
                        <span className="text-xs text-muted-foreground/70 monofont">({project.subtitle})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs monofont text-muted-foreground" data-stat-row>
                    {project.stats?.impact == null
                      ? '-'
                      : String(project.stats?.impact ?? 0)}
                    <span aria-hidden="true"> </span>
                    {project.stats?.reach == null
                      ? '-'
                      : String(project.stats?.reach ?? 0)}
                    <span aria-hidden="true"> </span>
                    {project.stats?.precision == null
                      ? '-'
                      : String(project.stats?.precision ?? 0)}
                    <span aria-hidden="true"> </span>
                    {project.stats?.speed == null
                      ? '-'
                      : String(project.stats?.speed ?? 0)}
                    <span aria-hidden="true"> </span>
                    {project.stats?.depth == null
                      ? '-'
                      : String(project.stats?.depth ?? 0)}
                    <span aria-hidden="true"> </span>
                    {project.stats?.coverage == null
                      ? '-'
                      : String(project.stats?.coverage ?? 0)}
                  </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm monofont uppercase tracking-widest text-primary">
                Generate Project Profile
              </h2>
              {selectedProject && (
                <span className="text-xs monofont text-muted-foreground">
                  {selectedProject.name}
                </span>
              )}
            </div>

            {!selectedProject ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select a project above to initialize analysis.
              </p>
            ) : generating ? (
              <div className="space-y-4">
                <div className="text-right monofont text-xs">
                  <span className="text-primary">PROCESSING DATA CHUNKS</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>BLOCK: S-733</span>
                    <span className="monofont text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 rounded bg-background/60 overflow-hidden border border-border">
                    <div
                      className="h-full w-0 rounded bg-primary transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  GENERATING PROJECT
                </div>
              </div>
            ) : completion > 0 && completion < 60 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-widest monofont">Projection Score</span>
                  <span className="monofont text-primary">{Math.round(completion)}</span>
                </div>
                <div className="h-2 rounded bg-background/60 overflow-hidden border border-border">
                  <div
                    className="h-full w-0 rounded bg-primary transition-all duration-150"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <button
                  onClick={runGeneration}
                  className="w-full rounded border border-primary/40 px-3 py-2 text-xs monofont uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  type="button"
                >
                  Generate
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-right monofont text-xs">
                  <span className="text-primary">PROJECT READY</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                  <span className="uppercase tracking-widest monofont">Completion</span>
                  <span className="monofont text-primary">{Math.round(completion)}%</span>
                </div>
                <div className="h-2 rounded bg-background/60 overflow-hidden border border-border">
                  <div
                    className="h-full w-full rounded bg-primary"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                  <span className="uppercase tracking-widest monofont">HASH</span>
                  <span className="monofont text-primary">{hash}</span>
                </div>

                <div className="space-y-2 border-t border-border pt-4 mt-2">
                  {STAT_LABELS.map(({ key, label, short }) => {
                    const value = selectedProject.stats?.[key] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-right text-[10px] uppercase tracking-wider text-muted-foreground">
                            {short}
                          </span>
                        </div>
                        <span className="w-6 text-right monofont text-primary text-xs">{value}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setCompletion(0);
                    setHash(null);
                  }}
                  className="w-full rounded border border-border px-3 py-2 text-xs monofont uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
                  type="button"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
