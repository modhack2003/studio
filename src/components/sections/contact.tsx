import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Github, Linkedin, Mail, FileText, type LucideIcon } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { CardShell } from '@/components/card-shell';

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
}

export function ContactSection({ personalData }: { personalData: PersonalData | null }) {
  if (!personalData) return null;

  const contactLinks: ContactLink[] = [
    { label: 'GitHub', href: personalData.github, icon: Github },
    { label: 'LinkedIn', href: personalData.linkedin, icon: Linkedin },
    { label: 'Email', href: `mailto:${personalData.email}`, icon: Mail },
    { label: 'Resume', href: personalData.resumeUrl, icon: FileText },
  ];

  return (
    <section id="contact" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CardShell>
          <div className="p-6">
            <ContactForm />
          </div>
        </CardShell>

        <div className="space-y-6">
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <a href={`mailto:${personalData.email}`}>Send me an Email</a>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Or connect with me on these platforms:
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {contactLinks.map((link) => (
              <Button asChild key={link.label} variant="outline" className="h-auto p-4 flex flex-col items-start gap-3 rounded-none">
                <Link href={link.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center">
                  <link.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}