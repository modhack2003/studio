import { Code, Terminal, BrainCircuit } from 'lucide-react';
import { Marquee, Reveal, TiltCard } from '@/components/cyber/primitives';

interface Skills {
  languages: string[];
  tools: string[];
  areas: string[];
}

export function SkillsSection({ skills }: { skills: Skills | null }) {
  if (!skills) return null;

  const skillSections = [
    { title: 'Languages', jp: '言語', code: 'LNG', icon: Code, items: skills.languages },
    { title: 'Tools & Technologies', jp: '道具', code: 'TLS', icon: Terminal, items: skills.tools },
    { title: 'Areas of Expertise', jp: '専門', code: 'EXP', icon: BrainCircuit, items: skills.areas },
  ];

  const all = [...skills.languages, ...skills.tools, ...skills.areas];

  return (
    <section className="space-y-12">
      <div className="grid gap-6 md:grid-cols-3">
        {skillSections.map((section, idx) => (
          <Reveal key={section.title} delay={idx * 0.1}>
            <TiltCard max={10} className="h-full">
              <div className="clip-notch relative h-full border border-signal/50 bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="monofont text-[10px] uppercase tracking-[0.3em] text-signal">
                      slot_{String(idx + 1).padStart(2, '0')} / {section.code}
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-tight text-bone">{section.title}</h3>
                  </div>
                  <span className="font-jp text-3xl font-black text-outline-red">{section.jp}</span>
                </div>

                <div className="my-6 flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-signal" />
                  <span className="h-px flex-1 bg-signal/40" />
                  <span className="font-display text-4xl font-bold text-signal">
                    {String(section.items.length).padStart(2, '0')}
                  </span>
                </div>

                <ul className="space-y-1.5" style={{ transform: 'translateZ(24px)' }}>
                  {section.items.map((skill, i) => (
                    <li
                      key={skill}
                      className="group flex items-center justify-between border-b border-signal/20 py-1.5 text-sm text-bone/90 transition-colors hover:text-signal"
                    >
                      <span className="flex items-center gap-3">
                        <span className="monofont text-[10px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                        {skill}
                      </span>
                      <span aria-hidden className="monofont text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                        [equipped]
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {all.length > 0 && (
        <div className="-mx-6 space-y-2 border-y border-signal/40 py-4 sm:-mx-10">
          <Marquee items={all} itemClassName="font-display text-4xl font-bold uppercase text-outline-red sm:text-6xl" separator="×" />
          <Marquee items={[...all].reverse()} reverse itemClassName="font-display text-4xl font-bold uppercase text-bone/90 sm:text-6xl" separator="/" />
        </div>
      )}
    </section>
  );
}
