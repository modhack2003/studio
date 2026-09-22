import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { CardShell } from '@/components/card-shell';

interface PersonalData {
  name: string;
  bio: string;
  github: string;
  linkedin: string;
  title: string;
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
}

export function AboutSection({ personalData, education, certificates }: { personalData: PersonalData | null, education: Education[], certificates: Certificate[] }) {
  const name = personalData?.name || 'Bikram Dey';
  const bio = personalData?.bio || 'Cybersecurity Analyst and Penetration Tester specializing in network security, vulnerability assessment, and defensive operations.';
  const github = personalData?.github || 'https://github.com/modhack2003';
  const linkedin = personalData?.linkedin || 'https://linkedin.com';

  return (
    <section id="about" className="space-y-10">
      <div className="grid gap-10 items-start lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardShell className="overflow-hidden rounded-none border-0 p-0">
            <div className="relative h-full min-h-[360px] bg-muted/40">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://github.com/modhack2003.png")' }} />
              <div className="absolute inset-0 bg-black/65 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-semibold">{name}</h3>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{bio}</p>
                <div className="mt-5 flex gap-5">
                  {github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardShell>
        </div>

        <div className="space-y-6">
          <CardShell>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map(edu => (
                <div key={edu.institution}>
                  <h3 className="font-semibold">{edu.institution}</h3>
                  <p className="text-sm text-muted-foreground">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground/70">{edu.duration}</p>
                </div>
              ))}
            </CardContent>
          </CardShell>

          <CardShell>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map(cert => (
                <div key={cert.name}>
                  <h3 className="font-semibold text-sm">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">{cert.issuer} - {cert.year}</p>
                </div>
              ))}
            </CardContent>
          </CardShell>
        </div>
      </div>
    </section>
  );
}