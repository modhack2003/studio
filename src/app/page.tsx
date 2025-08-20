import { MainNav } from "@/components/main-nav";

import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { AchievementsSection } from "@/components/sections/achievements";
import { SkillsSection } from "@/components/sections/skills";
import { ContactSection } from "@/components/sections/contact";
import { Separator } from "@/components/ui/separator";
import { PrismaClient } from '@prisma/client';
import { summarizeUrlFlow } from "@/ai/flows/summarize-url-flow";

const prisma = new PrismaClient();

async function getGithubAchievements(): Promise<{ achievements: string } | null> {
  try {
    const summary = await summarizeUrlFlow({ url: 'https://github.com/modhack2003' });
    return { achievements: summary };
  } catch (error) {
    console.error("Failed to fetch GitHub achievements:", error);
    return { achievements: "Could not fetch achievements. The AI model may be unavailable or the GitHub page could not be accessed." };
  }
}

export default async function Home() {
  const achievementsData = await getGithubAchievements();
  const personalData = await prisma.personalData.findFirst();
  const projects = await prisma.project.findMany();
  const skills = await prisma.skill.findFirst();
  const certificates = await prisma.certificate.findMany();
  const education = await prisma.education.findMany();

  const plainPersonalData = JSON.parse(JSON.stringify(personalData));
  const plainProjects = JSON.parse(JSON.stringify(projects));
  const plainSkills = JSON.parse(JSON.stringify(skills));
  const plainCertificates = JSON.parse(JSON.stringify(certificates));
  const plainEducation = JSON.parse(JSON.stringify(education));

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <HeroSection personalData={plainPersonalData} />
        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24">
          <AboutSection personalData={plainPersonalData} certificates={plainCertificates} education={plainEducation} />
          <Separator className="my-8 bg-primary/20" />
          <AchievementsSection achievementsData={achievementsData} />
          <Separator className="my-8 bg-primary/20" />
          <ProjectsSection projects={plainProjects} />
          <Separator className="my-8 bg-primary/20" />
          <SkillsSection skills={plainSkills} />
          <Separator className="my-8 bg-primary/20" />
          <ContactSection personalData={plainPersonalData} />
        </div>
      </main>
    </div>
  );
}