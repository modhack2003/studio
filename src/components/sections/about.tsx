import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, Github, Linkedin } from 'lucide-react';
import TiltedCard from '@/components/profile-card';
import PixelCard from '../pixel-card';

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
  const overlayContent = (
    <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 text-white rounded-[15px]">
      <h3 className="text-xl font-bold">{personalData?.name}</h3>
      <p className="text-sm">{personalData?.bio}</p>
      <div className="flex gap-4 mt-4">
        <a href={personalData?.github} target="_blank" rel="noopener noreferrer">
          <Github />
        </a>
        <a href={personalData?.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin />
        </a>
      </div>
    </div>
  );

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
          <TiltedCard 
            imageSrc="https://github.com/modhack2003.png"
            altText={personalData?.name || ''}
            captionText={personalData?.title || ''}
            containerHeight="400px"
            imageWidth="400px"
            imageHeight="400px"
            mobileImageWidth="300px"
            mobileImageHeight="300px"
            overlayContent={overlayContent}
            displayOverlayContent={true}
          />
        </div>
        <div className="space-y-6">
          <PixelCard>
            <div className="bg-transparent p-6 rounded-sm">
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
            <div className="bg-transparent p-6 rounded-sm">
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