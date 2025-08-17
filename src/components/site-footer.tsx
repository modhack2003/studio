import { personalData, contactLinks } from '@/lib/data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
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
