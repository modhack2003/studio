import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Github, Linkedin, Mail, FileText, type LucideIcon } from 'lucide-react';
import { PersonalIcon } from '@/components/personal-icon';

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

export function SiteFooter({ className, personalData }: React.HTMLAttributes<HTMLElement> & { personalData: PersonalData | null }) {
  const contactLinks: ContactLink[] = [
    { label: 'GitHub', href: personalData?.github ?? '#', icon: Github },
    { label: 'LinkedIn', href: personalData?.linkedin ?? '#', icon: Linkedin },
    { label: 'Email', href: `mailto:${personalData?.email ?? ''}`, icon: Mail },
    { label: 'Resume', href: personalData?.resumeUrl ?? '#', icon: FileText },
  ];

  return (
    <footer className={cn('border-t border-border/50 bg-background/60', className)}>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        {/* Marquee strip — utopiatokyo signature */}
        <div className="overflow-hidden border-b border-border/40 pb-6">
          <p className="whitespace-nowrap text-[10px] monofont uppercase tracking-[0.35em] text-muted-foreground/50">
            • secured endpoints, hardened defaults, zero trust by design • secured endpoints, hardened defaults, zero trust by design • secured endpoints, hardened defaults, zero trust by design
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <PersonalIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{personalData?.name ?? ''}</span>
          </div>
          <p className="text-xs text-muted-foreground/80">
            &copy; {new Date().getFullYear()} {personalData?.name ?? ''}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {contactLinks.map((link) => (
              <Link
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label={link.label}
              >
                <link.icon className="h-4 w-4" />
                <span className="sr-only">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] monofont uppercase tracking-[0.3em] text-muted-foreground/40">
          END OF TRANSMISSION
        </p>
      </div>
    </footer>
  );
}
