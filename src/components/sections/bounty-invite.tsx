import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/cyber/primitives';
import { BountyInviteForm } from '@/components/sections/bounty-invite-form';
import { platformFromUrl, type BountyStats } from '@/lib/bounty';

const RULES = [
  { title: 'Scope first', text: 'Your policy, scope and safe-harbour terms are followed to the letter.' },
  { title: 'Clear reports', text: 'Reproduction steps, real impact and a suggested fix — ready for triage.' },
  { title: 'Coordinated disclosure', text: 'Nothing is published without your approval.' },
  { title: 'Any format', text: 'Private programs, public programs, VDPs and live hacking events.' },
];

export function BountyInviteSection({ stats, profiles }: { stats: BountyStats | null; profiles: string[] }) {
  return (
    <section className="grid gap-12 lg:grid-cols-12">
      <div className="order-2 lg:order-1 lg:col-span-7">
        <Reveal>
          <BountyInviteForm />
        </Reveal>
      </div>

      <div className="order-1 space-y-10 lg:order-2 lg:col-span-5">
        <Reveal>
          <p className="text-xl font-medium leading-relaxed text-bone sm:text-2xl">
            Running a bug bounty program, a VDP or a live hacking event? Send an invite and I&apos;ll get back to you.
          </p>
        </Reveal>

        <div>
          <h3 className="mb-6 flex items-center justify-between border-b border-signal/40 pb-3 monofont text-xs uppercase tracking-[0.3em] text-signal">
            <span>{'// rules_of_engagement'}</span>
            <span className="font-jp">規則</span>
          </h3>
          <ol className="space-y-5">
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 0.06} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="font-display text-2xl font-bold leading-none text-outline-red">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-display text-lg font-bold uppercase text-bone">{r.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{r.text}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>

        {stats && stats.findings > 0 && (
          <Reveal className="grid grid-cols-3 border border-signal/40">
            {[
              ['Findings', stats.findings],
              ['Crit / High', stats.critHigh],
              ['Programs', stats.programs],
            ].map(([k, v]) => (
              <div key={String(k)} className="border-r border-signal/40 p-4 last:border-r-0">
                <div className="monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{k}</div>
                <div className="mt-2 font-display text-3xl font-bold text-signal">{String(v).padStart(2, '0')}</div>
              </div>
            ))}
          </Reveal>
        )}

        {profiles.length > 0 && (
          <div>
            <p className="mb-3 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{'// find_me_on'}</p>
            <div className="flex flex-wrap gap-3">
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
