import { Flag, Users, Trophy, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/cyber/primitives';

export interface CtfEvent {
  id: string;
  name: string;
  organizer: string;
  date: string; // ISO date
  placement?: string; // e.g., "Top 5%", "Rank #42"
  team?: string;
  writeupUrl?: string;
  categories: string[]; // e.g., ["Web", "Crypto", "Forensics"]
  points?: number;
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '--', month: '---', year: '----', full: iso };
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
    year: String(d.getUTCFullYear()),
    full: d.toLocaleDateString(),
  };
}

export function CtfSection({ events }: { events: CtfEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <section className="relative">
      <ol className="border-t border-signal/40">
        {events.map((event, i) => {
          const d = fmt(event.date);
          return (
            <Reveal as="li" key={`${event.name}-${event.date}`} delay={i * 0.05} rotateX={30}>
              <article className="group relative grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 overflow-hidden border-b border-signal/40 py-8 transition-colors duration-500 hover:bg-signal md:grid-cols-[140px_1fr_auto] md:items-center">
                {/* hover sweep text */}
                <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 font-jp text-8xl font-black text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-10 md:block">
                  旗
                </span>

                <div className="pl-2 text-signal transition-colors group-hover:text-ink">
                  <div className="font-display text-5xl font-bold leading-none">{d.day}</div>
                  <div className="mt-1 monofont text-[10px] uppercase tracking-[0.3em]">
                    {d.month} · {d.year}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-3 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-ink/70">
                    <Flag className="h-3 w-3" /> OP-{String(events.length - i).padStart(3, '0')} · {event.organizer}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-tight text-bone transition-colors group-hover:text-ink sm:text-4xl">
                    {event.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.categories.map((cat) => (
                      <span
                        key={cat}
                        className="border border-signal/40 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider text-bone/80 group-hover:border-ink/50 group-hover:text-ink"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex flex-wrap items-center gap-4 pl-2 monofont text-xs uppercase tracking-widest text-muted-foreground group-hover:text-ink md:col-span-1 md:flex-col md:items-end md:pr-4">
                  {event.placement && (
                    <span className="bg-signal px-3 py-1 font-bold text-ink group-hover:bg-ink group-hover:text-signal">
                      {event.placement}
                    </span>
                  )}
                  {event.team && (
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> {event.team}
                    </span>
                  )}
                  {typeof event.points === 'number' && (
                    <span className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5" /> {event.points} pts
                    </span>
                  )}
                  {event.writeupUrl && (
                    <a
                      href={event.writeupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 underline underline-offset-4"
                    >
                      Read write-up <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
