import { Github, Linkedin, Mail, FileText, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { Reveal, ScrambleText } from '@/components/cyber/primitives';

interface PersonalData {
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

interface ContactLink {
  label: string;
  href: string;
  icon: LucideIcon;
  jp: string;
}

const ROW_A = ['OPEN', 'A', 'SECURE', 'CHANNEL'];
const ROW_B = ['ENCRYPTED', 'END', 'TO', 'END', 'TRANSMISSION'];

export function ContactSection({ personalData }: { personalData: PersonalData | null }) {
  if (!personalData) return null;

  const contactLinks: ContactLink[] = [
    { label: 'GitHub', href: personalData.github, icon: Github, jp: 'ギット' },
    { label: 'LinkedIn', href: personalData.linkedin, icon: Linkedin, jp: 'リンク' },
    { label: 'Email', href: `mailto:${personalData.email}`, icon: Mail, jp: 'メール' },
    { label: 'Resume', href: personalData.resumeUrl, icon: FileText, jp: '履歴書' },
  ];

  return (
    <section className="space-y-16">
      {/* spread words — utopiatokyo signature */}
      <div aria-hidden className="space-y-6 font-display text-sm font-semibold uppercase tracking-[0.2em] sm:text-base">
        <div className="flex justify-between">
          {ROW_A.map((w, i) => (
            <span key={i} className={i === 0 || i === ROW_A.length - 1 ? 'text-cyan' : 'text-bone'}>
              {w}
            </span>
          ))}
        </div>
        <div className="flex justify-between">
          {ROW_B.map((w, i) => (
            <span key={i} className={i === 0 || i === ROW_B.length - 1 ? 'text-cyan' : 'text-bone'}>
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <ContactForm />
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal>
            <a
              href={`mailto:${personalData.email}`}
              className="group block border border-signal bg-signal p-8 text-ink transition-colors hover:bg-bone"
            >
              <span className="monofont text-[10px] uppercase tracking-[0.3em]">{'// direct line'}</span>
              <span className="mt-3 flex items-center justify-between font-display text-3xl font-bold uppercase sm:text-4xl">
                Send me an Email
                <ArrowUpRight className="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </span>
              <ScrambleText text={personalData.email} className="mt-3 block break-all monofont text-sm" />
            </a>
          </Reveal>

          <p className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Or connect with me on these platforms:
          </p>

          <div className="grid grid-cols-2 gap-px border border-signal/40 bg-signal/40">
            {contactLinks.map((link, i) => (
              <Reveal key={link.label} delay={i * 0.06} className="bg-ink">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col justify-between gap-8 p-5 transition-colors hover:bg-signal hover:text-ink"
                >
                  <span className="flex items-center justify-between">
                    <link.icon className="h-5 w-5 text-signal group-hover:text-ink" />
                    <span className="font-jp text-xs text-muted-foreground group-hover:text-ink/70">{link.jp}</span>
                  </span>
                  <span className="flex items-center justify-between font-display text-xl font-bold uppercase">
                    {link.label}
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
