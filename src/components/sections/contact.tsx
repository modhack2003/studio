import { Button } from '@/components/ui/button';
import { contactLinks, personalData } from '@/lib/data';
import Link from 'next/link';

export function ContactSection() {
  return (
    <section id="contact" className="space-y-12">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow">
          [ Get In Touch ]
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Have a question or a project in mind? Let's connect.
        </p>
      </div>
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-glow">
          <a href={`mailto:${personalData.email}`}>Send me an Email</a>
        </Button>
        <p className="text-xs text-muted-foreground">
          You can also find me on these platforms:
        </p>
        <div className="flex items-center justify-center space-x-4">
          {contactLinks.map((link) => (
            <Button asChild key={link.label} variant="outline" size="icon" className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary">
              <Link href={link.href} target="_blank" rel="noopener noreferrer">
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
