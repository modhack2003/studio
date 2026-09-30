import { ArrowUpRight } from 'lucide-react';
import { Marquee, Reveal } from '@/components/cyber/primitives';
import { FindingsList, SeverityBar } from '@/components/sections/bounty-client';
import { formatMoney, platformFromUrl, type BountyStats, type PublicFinding } from '@/lib/bounty';

function earnedLabel(stats: BountyStats) {
  if (!stats.earned.length) return null;
  const parts = stats.earned.slice(0, 2).map((e) => formatMoney(e.amount, e.currency));
  return parts.join(' + ') + (stats.earned.length > 2 ? ' +' : '');
}

/** Public Hall of Fame. Private program names/links are already stripped on the server. */
export function BountySection({ findings, stats, profiles }: { findings: PublicFinding[]; stats: BountyStats; profiles: string[] }) {
  if (!findings.length) return null;

  const earned = earnedLabel(stats);
  const cells: [string, string, string][] = [
    ['Findings', String(stats.findings).padStart(2, '0'), '発見'],
    earned
      ? ['Bounties', earned, '賞金']
      : stats.hallOfFame
        ? ['Hall of fame', String(stats.hallOfFame).padStart(2, '0'), '殿堂']
        : ['CVEs', String(stats.cves).padStart(2, '0'), '脆弱'],
    ['Crit / High', String(stats.critHigh).padStart(2, '0'), '重大'],
    ['Programs', String(stats.programs).padStart(2, '0'), '企業'],
  ];

  const names = stats.acknowledgedBy;
  const ticker = names.length ? Array.from({ length: Math.max(1, Math.ceil(8 / names.length)) }).flatMap(() => names) : [];

  return (
    <section className="space-y-14">
      <Reveal className="grid grid-cols-2 border border-signal/40 lg:grid-cols-4">
        {cells.map(([k, v, jp], i) => (
          <div
            key={k}
            className={
              'border-signal/40 p-5 ' +
              (i % 2 === 0 ? 'border-r ' : '') +
              (i < 2 ? 'border-b lg:border-b-0 ' : '') +
              (i === 1 ? 'lg:border-r ' : '')
            }
          >
            <div className="flex items-center justify-between monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {k}
              <span className="font-jp text-signal/70">{jp}</span>
            </div>
            <div className={`mt-3 font-display font-bold text-signal ${v.length > 9 ? 'text-2xl' : 'text-4xl'}`}>{v}</div>
          </div>
        ))}
      </Reveal>

      <SeverityBar bySeverity={stats.bySeverity} total={stats.findings} />

      <FindingsList findings={findings} />

      {ticker.length > 0 && (
        <div className="-mx-6 border-y border-signal/40 py-4 sm:-mx-10">
          <p className="mb-3 px-6 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:px-10">{'// acknowledged_by'}</p>
          <Marquee items={ticker} itemClassName="font-display text-3xl font-bold uppercase text-outline-red sm:text-5xl" separator="×" />
        </div>
      )}

      <Reveal className="flex flex-col gap-6 border border-signal/40 bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="monofont text-[10px] uppercase tracking-[0.3em] text-signal">{'// running a program?'}</p>
          <p className="mt-2 font-display text-2xl font-bold uppercase text-bone sm:text-3xl">Invite me to hunt on it</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {profiles.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bracket inline-flex items-center gap-2 bg-bone/5 px-4 py-2.5 monofont text-[11px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-bone hover:text-ink"
            >
              {platformFromUrl(url)} <ArrowUpRight className="h-3 w-3" />
            </a>
          ))}
          <a
            href="#invite"
            className="bracket inline-flex items-center gap-2 bg-signal px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-bone"
          >
            Send an invite <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
