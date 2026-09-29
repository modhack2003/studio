import { Briefcase, MapPin } from 'lucide-react';
import { Reveal } from '@/components/cyber/primitives';

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;

function span(start: string | null, end: string | null, current: boolean) {
  if (!start) return null;
  const s = new Date(start);
  const e = current || !end ? new Date() : new Date(end);
  let months = (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
  if (months < 1) months = 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo${m > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ');
}

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  if (!items.length) return null;
  return (
    <section>
      <ol className="relative border-l border-signal/40">
        {items.map((x, i) => {
          const from = fmt(x.startDate);
          const to = x.current ? 'Present' : fmt(x.endDate);
          const duration = span(x.startDate, x.endDate, x.current);
          return (
            <Reveal as="li" key={x.id} delay={i * 0.06} rotateX={24} className="relative pb-12 pl-8 last:pb-0 sm:pl-12">
              <span
                aria-hidden
                className={`absolute -left-[7px] top-2 h-3.5 w-3.5 rotate-45 border ${x.current ? 'border-signal bg-signal' : 'border-signal bg-ink'}`}
              />
              <div className="group grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="monofont text-[11px] uppercase tracking-[0.25em] text-signal">
                  {from && (
                    <p>
                      {from} — {to}
                    </p>
                  )}
                  {duration && <p className="mt-1 text-muted-foreground">{duration}</p>}
                  {x.current && (
                    <p className="mt-3 inline-flex items-center gap-2 bg-signal px-2 py-0.5 text-ink">
                      <span className="h-1.5 w-1.5 animate-blink bg-ink" /> active
                    </p>
                  )}
                </div>
                <div className="clip-notch border border-signal/30 bg-card p-6 transition-colors duration-500 group-hover:border-signal">
                  <h3 className="font-display text-2xl font-bold uppercase leading-tight text-bone sm:text-3xl">{x.role}</h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-bone/90">
                      <Briefcase className="h-3.5 w-3.5 text-signal" /> {x.company}
                    </span>
                    {x.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-signal" /> {x.location}
                      </span>
                    )}
                  </p>
                  {x.description && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{x.description}</p>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
