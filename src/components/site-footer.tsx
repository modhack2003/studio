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

export function SiteFooter({ className, personalData }: React.HTMLAttributes<HTMLElement> & { personalData: PersonalData | null }) {
  if (!personalData) return null;

  const contactLinks: ContactLink[] = [
    { label: 'GitHub', href: personalData.github, icon: Github },
    { label: 'LinkedIn', href: personalData.linkedin, icon: Linkedin },
    { label: 'Email', href: `mailto:${personalData.email}`, icon: Mail },
    { label: 'Resume', href: personalData.resumeUrl, icon: FileText },
  ];

  return (
    <footer className={cn('border-t border-primary/20', className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left font-code">
            &copy; {new Date().getFullYear()} {personalData.name}. All rights reserved.
            <br className="md:hidden" />
             &lt;/&gt; with <span className="text-primary">&lt;3</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {contactLinks.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label={link.label}
            >
              <link.icon className="h-6 w-6" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}