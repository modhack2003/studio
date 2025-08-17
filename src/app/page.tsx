import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { AchievementsSection } from "@/components/sections/achievements";
import { SkillsSection } from "@/components/sections/skills";
import { ContactSection } from "@/components/sections/contact";
import { Separator } from "@/components/ui/separator";

import { summarizeUrlFlow } from "@/ai/flows/summarize-url-flow";

async function getGithubAchievements(): Promise<{ achievements: string } | null> {
  try {
    const summary = await summarizeUrlFlow({ url: 'https://github.com/modhack2003' });
    return { achievements: summary };
  } catch (error) {
    console.error("Failed to fetch GitHub achievements:", error);
    return null;
  }
}

export default async function Home() {
  const achievementsData = await getGithubAchievements();

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <HeroSection />
        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24">
          <AboutSection />
          <Separator className="my-8 bg-primary/20" />
          <AchievementsSection achievementsData={achievementsData} />
          <Separator className="my-8 bg-primary/20" />
          <ProjectsSection />
          <Separator className="my-8 bg-primary/20" />
          <SkillsSection />
          <Separator className="my-8 bg-primary/20" />
          <ContactSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
