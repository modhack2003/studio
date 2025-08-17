import { AnimatedTitle } from '@/components/animated-title';
import { personalData } from '@/lib/data';

export function HeroSection() {
  return (
    <section id="hero" className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center">
      <div className="absolute inset-0 bg-grid-primary/10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="container z-10">
        <AnimatedTitle text={`> ${personalData.name}`} className="text-4xl md:text-6xl lg:text-7xl" />
        <p className="mt-4 text-lg md:text-xl text-muted-foreground font-headline">
          {personalData.title}
        </p>
      </div>
    </section>
  );
}
