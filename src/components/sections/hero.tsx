
import { DecryptedText } from '@/components/decrypted-text';

interface PersonalData {
  name: string;
  title: string;
}

export function HeroSection({ personalData }: { personalData: PersonalData | null }) {
  return (
    <section id="hero" className="relative h-[70vh] min-h-[400px] flex items-center justify-center text-center px-4">
      <div className="absolute inset-0 bg-grid-primary/10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="container z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-code text-primary text-glow">
            <DecryptedText text={`> ${personalData?.name}`} />
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground font-headline max-w-2xl mx-auto">
          {personalData?.title}
        </p>
      </div>
    </section>
  );
}