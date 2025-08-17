import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { personalData, education, certificates } from '@/lib/data';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="space-y-12">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow">
          [ About Me ]
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          A little bit about my journey in the digital trenches.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
           <Card className="bg-card/50 border-primary/20">
             <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <Avatar className="w-24 h-24 border-2 border-primary">
                    <AvatarImage src="https://github.com/modhack2003.png" alt={personalData.name} />
                    <AvatarFallback>{personalData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground font-body">{personalData.bio}</p>
                </div>
            </CardContent>
           </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-code text-lg">
                <GraduationCap className="text-primary"/>
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {education.map(edu => (
                <div key={edu.institution}>
                  <h3 className="font-semibold">{edu.institution}</h3>
                  <p className="text-sm text-muted-foreground">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground/80">{edu.duration}</p>
                </div>
              ))}
            </CardContent>
          </Card>
           <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-code text-lg">
                <ShieldCheck className="text-primary"/>
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {certificates.map(cert => (
                <div key={cert.name}>
                  <h3 className="font-semibold text-sm">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">{cert.issuer} - {cert.year}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
