import { HeroSection } from './hero';

export function CityHeader({ personalData }: { personalData: { name: string; title: string } | null }) {
  return <HeroSection personalData={personalData} />;
}
