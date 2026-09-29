import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Github, Linkedin, Mail, FileText, type LucideIcon } from 'lucide-react';

interface PersonalData {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

interface ContactLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const STRIP = 'secured endpoints · hardened defaults · zero trust by design · ';

export function SiteFooter({ className, personalData }: React.HTMLAttributes<HTMLElement> & { personalData: PersonalData | null }) {
  const contactLinks: ContactLink[] = [
    { label: 'GitHub', href: personalData?.github ?? '#', icon: Github },
    { label: 'LinkedIn', href: personalData?.linkedin ?? '#', icon: Linkedin },
    { label: 'Email', href: `mailto:${personalData?.email ?? ''}`, icon: Mail },
    { label: 'Resume', href: personalData?.resumeUrl ?? '#', icon: FileText },
  ];
  const name = personalData?.name ?? '';

  return (
    <footer className={cn('relative overflow-hidden border-t border-signal bg-ink', className)}>
      {/* marquee strip */}
      <div className="overflow-hidden border-b border-signal/40 py-3">
        <div className="flex w-max animate-marquee whitespace-nowrap monofont text-[10px] uppercase tracking-[0.35em] text-bone/60">
          <span>{STRIP.repeat(6)}</span>
          <span>{STRIP.repeat(6)}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="monofont text-[10px] uppercase tracking-[0.3em] text-signal">{'// signing off'}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {name}. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contactLinks.map((link) => (
              <Link
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className="bracket flex h-10 w-10 items-center justify-center text-signal transition-colors hover:bg-signal hover:text-ink"
                aria-label={link.label}
              >
                <link.icon className="h-4 w-4" />
                <span className="sr-only">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {name && (
          <p
            aria-hidden
            className="mt-10 select-none whitespace-nowrap font-display font-bold uppercase leading-[0.8] text-outline-red"
            style={{ fontSize: `min(${(150 / Math.max(name.length, 1)).toFixed(2)}vw, 14rem)` }}
          >
            {name}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-signal/30 pt-4 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>END OF TRANSMISSION</span>
          <span className="font-jp">通信終了</span>
        </div>
      </div>
    </footer>
  );
}
