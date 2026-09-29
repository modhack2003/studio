import { Github, Linkedin, ArrowUpRight } from 'lucide-react';
import { Reveal, ScrambleText, TiltCard } from '@/components/cyber/primitives';

interface PersonalData {
  name: string;
  bio: string;
  github: string;
  linkedin: string;
  title: string;
  avatarUrl?: string | null;
}

interface Education {
  institution: string;
  degree: string;
  duration: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: number;
  url?: string | null;
}

export function AboutSection({
  personalData,
  education,
  certificates,
  experienceCount = 0,
  repoCount = 0,
}: {
  personalData: PersonalData | null;
  education: Education[];
  certificates: Certificate[];
  experienceCount?: number;
  repoCount?: number;
}) {
  const name = personalData?.name || 'Bikram Dey';
  const bio =
    personalData?.bio ||
    'Cybersecurity Analyst and Penetration Tester specializing in network security, vulnerability assessment, and defensive operations.';
  const github = personalData?.github || 'https://github.com/modhack2003';
  const linkedin = personalData?.linkedin || 'https://linkedin.com';
  const title = personalData?.title || 'Cybersecurity Analyst & Penetration Tester';
  const avatar = personalData?.avatarUrl || 'https://github.com/modhack2003.png';

  return (
    <section className="grid gap-12 lg:grid-cols-12">
      {/* portrait */}
      <Reveal className="lg:col-span-5">
        <TiltCard className="mx-auto max-w-md" max={10}>
          <div className="relative aspect-[4/5] overflow-hidden border border-signal/60 bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
              loading="lazy"
            />
            {/* red duotone */}
            <div className="absolute inset-0 bg-signal mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="scanline absolute inset-0 opacity-60" />
            <div className="animate-scan absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-cyan/20 to-transparent" />

            {/* HUD */}
            <div className="absolute left-3 top-3 monofont text-[10px] uppercase tracking-[0.25em] text-bone">
              subject_id: 0x{name.length.toString(16).padStart(2, '0')}A7
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-2 monofont text-[10px] uppercase tracking-[0.25em] text-cyan">
              <span className="h-1.5 w-1.5 animate-blink bg-cyan" /> rec
            </div>
            {['left-2 top-2 border-l-2 border-t-2', 'right-2 top-2 border-r-2 border-t-2', 'left-2 bottom-2 border-l-2 border-b-2', 'right-2 bottom-2 border-r-2 border-b-2'].map((c) => (
              <span key={c} aria-hidden className={`absolute h-6 w-6 border-bone ${c}`} />
            ))}

            <div className="absolute inset-x-0 bottom-0 p-6" style={{ transform: 'translateZ(40px)' }}>
              <p className="monofont text-[10px] uppercase tracking-[0.3em] text-signal">{'// operator'}</p>
              <h3 className="mt-2 font-display text-4xl font-bold uppercase leading-none text-bone">{name}</h3>
              <p className="mt-2 text-xs uppercase tracking-widest text-bone/70">{title}</p>
            </div>
          </div>
        </TiltCard>
      </Reveal>

      {/* dossier */}
      <div className="space-y-10 lg:col-span-7">
        <Reveal>
          <p className="text-xl font-medium leading-relaxed text-bone sm:text-2xl">{bio}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="bracket inline-flex items-center gap-2 bg-signal/10 px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-ink"
              >
                <Github className="h-4 w-4" /> GitHub <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bracket inline-flex items-center gap-2 bg-bone/5 px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:bg-bone hover:text-ink"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </Reveal>

        {/* counters */}
        <Reveal className="grid grid-cols-2 border border-signal/40 sm:grid-cols-3">
          {[
            ['Repos', repoCount, '倉庫'],
            experienceCount > 0
              ? ['Roles', experienceCount, '経歴']
              : certificates.length > 0
                ? ['Certs', certificates.length, '認定']
                : ['Stack', 'LIVE', '技術'],
            ['Status', 'ACTIVE', '状態'],
          ].map(([k, v, jp]) => (
            <div key={String(k)} className="border-b border-r border-signal/40 p-5 last:border-r-0 sm:border-b-0">
              <div className="flex items-center justify-between monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {k}
                <span className="font-jp text-signal/70">{jp}</span>
              </div>
              <div className="mt-3 font-display text-4xl font-bold text-signal">
                {typeof v === 'number' ? String(v).padStart(2, '0') : v}
              </div>
            </div>
          ))}
        </Reveal>

        {(education.length > 0 || certificates.length > 0) && (
        <div className={`grid gap-10 ${education.length > 0 && certificates.length > 0 ? 'md:grid-cols-2' : ''}`}>
          {/* education timeline */}
          {education.length > 0 && (
          <div>
            <h3 className="mb-6 flex items-center justify-between border-b border-signal/40 pb-3 monofont text-xs uppercase tracking-[0.3em] text-signal">
              <span>{'// education.log'}</span>
              <span className="font-jp">教育</span>
            </h3>
            <ol className="relative space-y-6 border-l border-signal/40 pl-6">
              {education.map((edu, i) => (
                <Reveal as="li" key={edu.institution} delay={i * 0.08} className="relative">
                  <span aria-hidden className="absolute -left-[29px] top-1 h-2.5 w-2.5 rotate-45 border border-signal bg-ink" />
                  <p className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{edu.duration}</p>
                  <ScrambleText as="h4" text={edu.institution} className="mt-1 font-display text-lg font-semibold uppercase text-bone" />
                  <p className="text-sm text-muted-foreground">{edu.degree}</p>
                </Reveal>
              ))}
            </ol>
          </div>
          )}

          {/* certificates */}
          {certificates.length > 0 && (
          <div>
            <h3 className="mb-6 flex items-center justify-between border-b border-signal/40 pb-3 monofont text-xs uppercase tracking-[0.3em] text-signal">
              <span>{'// clearances'}</span>
              <span className="font-jp">資格</span>
            </h3>
            <ul className="space-y-3">
              {certificates.map((cert, i) => (
                <Reveal as="li" key={cert.name} delay={i * 0.06}>
                  {(() => {
                    const body = (
                      <>
                        <div>
                          <p className="text-sm font-semibold">{cert.name}</p>
                          <p className="monofont text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-ink/70">
                            {cert.issuer}
                            {cert.url && ' · verify ↗'}
                          </p>
                        </div>
                        <span className="font-display text-xl font-bold text-signal group-hover:text-ink">{cert.year}</span>
                      </>
                    );
                    const cls =
                      'clip-notch-sm group relative flex items-center justify-between gap-4 bg-card px-4 py-3 transition-colors hover:bg-signal hover:text-ink';
                    return cert.url ? (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className={cls}>
                        {body}
                      </a>
                    ) : (
                      <div className={cls}>{body}</div>
                    );
                  })()}
                </Reveal>
              ))}
            </ul>
          </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
