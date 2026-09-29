'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Star, GitFork, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal, TiltCard } from '@/components/cyber/primitives';

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string | null;
}

interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  topics: string[];
  stargazersCount: number;
  forksCount: number;
  homepage: string | null;
  customTitle: string | null;
  customDescription: string | null;
  customTags: string[];
  displayOrder: number | null;
  readmeExcerpt?: string | null;
}

type Entry = {
  key: string;
  kind: 'project' | 'repo';
  title: string;
  description: string;
  tags: string[];
  language?: string | null;
  stars?: number;
  forks?: number;
  primaryHref?: string;
  primaryLabel: string;
  demoHref?: string | null;
  meta?: string;
};

const INITIAL_REPOS = 5;

function toEntries(projects: Project[], repos: GitHubRepository[]): Entry[] {
  const a: Entry[] = projects.map((p) => ({
    key: `db-${p.title}`,
    kind: 'project',
    title: p.title,
    description: p.description,
    tags: p.tags,
    primaryHref: p.link ?? undefined,
    primaryLabel: 'View Project',
  }));
  const b: Entry[] = repos.map((repo) => ({
    key: `gh-${repo.id}`,
    kind: 'repo',
    title: repo.customTitle || repo.name,
    description: repo.customDescription || repo.description || repo.readmeExcerpt || 'No description available',
    tags: repo.customTags && repo.customTags.length > 0 ? repo.customTags : repo.topics,
    language: repo.language,
    stars: repo.stargazersCount,
    forks: repo.forksCount,
    primaryHref: repo.htmlUrl,
    primaryLabel: 'View on GitHub',
    demoHref: repo.homepage,
    meta: repo.fullName,
  }));
  return [...a, ...b];
}

function Cube({ label }: { label: string }) {
  const faces = [
    'rotateY(0deg)',
    'rotateY(90deg)',
    'rotateY(180deg)',
    'rotateY(-90deg)',
    'rotateX(90deg)',
    'rotateX(-90deg)',
  ];
  return (
    <div className="perspective flex h-40 items-center justify-center" aria-hidden>
      <div className="preserve-3d relative h-24 w-24 animate-[cube_14s_linear_infinite]">
        {faces.map((f, i) => (
          <div
            key={f}
            className="absolute inset-0 flex items-center justify-center border border-signal bg-signal/10 font-display text-2xl font-bold text-signal"
            style={{ transform: `${f} translateZ(48px)` }}
          >
            {i === 0 ? label : ''}
          </div>
        ))}
      </div>
      <style>{`@keyframes cube{from{transform:rotateX(-20deg) rotateY(0)}to{transform:rotateX(-20deg) rotateY(360deg)}}`}</style>
    </div>
  );
}

export function ProjectsSection({ projects, githubRepos }: { projects: Project[]; githubRepos: GitHubRepository[] }) {
  const all = useMemo(() => toEntries(projects, githubRepos), [projects, githubRepos]);
  const [showAll, setShowAll] = useState(false);
  const repoTotal = githubRepos.length;
  const hiddenRepos = Math.max(0, repoTotal - INITIAL_REPOS);
  // hand-picked projects always show; GitHub repos start with the 5 latest (pinned first)
  const entries = useMemo(() => {
    if (showAll) return all;
    let repos = 0;
    return all.filter((e) => e.kind === 'project' || repos++ < INITIAL_REPOS);
  }, [all, showAll]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [active, setActive] = useState(0);
  const current = entries[active];

  if (entries.length === 0) {
    return (
      <section className="border border-dashed border-signal/40 p-10 text-center monofont text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {'// no payloads deployed yet'}
      </section>
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[340px_1fr]">
      {/* preview panel */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="clip-notch border border-signal/50 bg-card">
          <div className="flex items-center justify-between border-b border-signal/40 px-4 py-3 monofont text-[10px] uppercase tracking-[0.3em] text-signal">
            <span>{'// preview'}</span>
            <span>
              {String(active + 1).padStart(2, '0')}/{String(entries.length).padStart(2, '0')}
            </span>
          </div>
          <Cube label={String(active + 1).padStart(2, '0')} />
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4 border-t border-signal/40 p-5"
              >
                <p className="monofont text-[10px] uppercase tracking-[0.3em] text-cyan">
                  {current.kind === 'repo' ? 'git_repository' : 'field_project'}
                  {current.language ? ` · ${current.language}` : ''}
                </p>
                <h3 className="font-display text-2xl font-bold uppercase leading-tight text-bone">{current.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{current.description}</p>
                {current.kind === 'repo' && (
                  <div className="grid grid-cols-2 border border-signal/30 monofont text-xs">
                    <div className="border-r border-signal/30 p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">stars</div>
                      <div className="mt-1 flex items-center gap-1 text-signal"><Star className="h-3 w-3" />{current.stars}</div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">forks</div>
                      <div className="mt-1 flex items-center gap-1 text-signal"><GitFork className="h-3 w-3" />{current.forks}</div>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  {current.primaryHref && (
                    <a
                      href={current.primaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bracket inline-flex items-center gap-2 bg-signal px-4 py-2 monofont text-[11px] uppercase tracking-[0.15em] text-ink transition-colors hover:bg-bone"
                    >
                      {current.primaryLabel} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                  {current.demoHref && (
                    <a
                      href={current.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bracket inline-flex items-center gap-2 px-4 py-2 monofont text-[11px] uppercase tracking-[0.15em] text-cyan transition-colors hover:bg-cyan hover:text-ink"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* collection */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <span className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            payload_collection [{entries.length}/{all.length}]
          </span>
          <div className="flex border border-signal/40">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 monofont text-[10px] uppercase tracking-[0.25em] transition-colors',
                  view === v ? 'bg-signal text-ink' : 'text-muted-foreground hover:text-signal'
                )}
              >
                {v === 'grid' ? <LayoutGrid className="h-3 w-3" /> : <List className="h-3 w-3" />}
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {entries.map((e, i) => (
              <Reveal key={e.key} delay={(i % 4) * 0.06}>
                <TiltCard max={8}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'bracket group relative flex h-full min-h-[240px] w-full flex-col overflow-hidden border bg-card p-6 text-left transition-colors duration-300',
                      active === i ? 'border-signal text-signal' : 'border-signal/25 text-signal/40 hover:border-signal/70'
                    )}
                  >
                    <span aria-hidden className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] font-bold leading-none text-outline-red opacity-20 transition-opacity group-hover:opacity-50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {e.kind === 'repo' ? 'repo' : 'project'} / {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight text-bone" style={{ transform: 'translateZ(30px)' }}>
                      {e.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {e.tags.map((t) => (
                        <span key={t} className="border border-signal/40 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider text-bone/80">
                          {t}
                        </span>
                      ))}
                      {e.language && (
                        <span className="border border-cyan/50 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider text-cyan">
                          {e.language}
                        </span>
                      )}
                    </div>
                    {e.kind === 'repo' && (
                      <div className="mt-4 flex items-center gap-4 monofont text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" />{e.stars}</span>
                        <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{e.forks}</span>
                      </div>
                    )}
                  </button>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        ) : (
          <ul className="border-t border-signal/40">
            {entries.map((e, i) => (
              <li key={e.key}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-signal/40 px-2 py-5 text-left transition-colors',
                    active === i ? 'bg-signal text-ink' : 'hover:bg-signal/10'
                  )}
                >
                  <span className="monofont text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block font-display text-xl font-bold uppercase">{e.title}</span>
                    <span className={cn('block truncate text-xs', active === i ? 'text-ink/70' : 'text-muted-foreground')}>
                      {e.tags.join(' · ')}
                      {e.language ? ` · ${e.language}` : ''}
                    </span>
                  </span>
                  <span className="monofont text-[10px] uppercase tracking-widest">
                    {e.kind === 'repo' ? `★ ${e.stars}` : 'field'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {hiddenRepos > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAll((v) => !v);
                if (showAll && active >= entries.length - hiddenRepos) setActive(0);
              }}
              aria-expanded={showAll}
              className="bracket bg-signal/10 px-6 py-3 monofont text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-ink"
            >
              {showAll ? 'Show latest only' : `Show all ${repoTotal} repositories (+${hiddenRepos})`}
            </button>
            <span className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {showAll ? `${repoTotal} repos from github` : `latest ${INITIAL_REPOS} of ${repoTotal} repos`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
