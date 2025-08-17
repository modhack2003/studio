import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { personalData, education, certificates } from '@/lib/data';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { ProfileCard } from '@/components/profile-card';
import { PixelCard } from '../pixel-card';

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
          <ProfileCard 
            name={personalData.name}
            title={personalData.title}
            bio={personalData.bio}
            avatarUrl="https://github.com/modhack2003.png"
            githubUrl={personalData.github}
            linkedinUrl={personalData.linkedin}
          />
        </div>
        <div className="space-y-6">
          <PixelCard>
            <div className="bg-card p-6 rounded-sm">
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
            </div>
          </PixelCard>
           <PixelCard>
            <div className="bg-card p-6 rounded-sm">
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
            </div>
          </PixelCard>
        </div>
      </div>
    </section>
  );
}
