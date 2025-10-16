import { MainNav } from "@/components/main-nav";

import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { BlogSection } from "@/components/sections/blog";
import { ContactSection } from "@/components/sections/contact";
import { CtfSection } from "@/components/sections/ctf";
import { Separator } from "@/components/ui/separator";
import { prisma } from '@/lib/prisma';
// Removed sample-data fallback per request; database only

async function getPortfolioData() {
  try {
    // Optimize queries with select only needed fields and limit results
    const [dbPersonalData, dbProjects, dbGithubRepos, dbSkills, dbCertificates, dbEducation, dbCtf] = await Promise.all([
      prisma.personalData.findFirst({
        select: { id: true, name: true, title: true, bio: true, github: true, linkedin: true, email: true, resumeUrl: true }
      }),
      prisma.project.findMany({
        select: { id: true, title: true, description: true, tags: true, link: true },
        take: 6 // Limit to 6 projects for faster loading
      }),
      prisma.gitHubRepository.findMany({
        where: { displayInPortfolio: true },
        select: { 
          id: true, 
          name: true, 
          fullName: true, 
          description: true, 
          htmlUrl: true, 
          language: true, 
          topics: true, 
          stargazersCount: true, 
          forksCount: true, 
          homepage: true,
          customTitle: true,
          customDescription: true,
          customTags: true,
          displayOrder: true
        },
        orderBy: [
          { displayOrder: 'asc' },
          { updatedAt: 'desc' }
        ],
        take: 6 // Limit to 6 GitHub repos for faster loading
      }),
      prisma.skill.findFirst({
        select: { id: true, languages: true, tools: true, areas: true }
      }),
      prisma.certificate.findMany({
        select: { id: true, name: true, issuer: true, year: true },
        take: 8 // Limit certificates
      }),
      prisma.education.findMany({
        select: { id: true, institution: true, degree: true, duration: true },
        take: 5 // Limit education entries
      }),
      prisma.ctfEvent.findMany({ 
        select: { id: true, name: true, organizer: true, date: true, categories: true },
        orderBy: { date: 'desc' },
        take: 10 // Limit CTF events
      })
    ]);

    return {
      personalData: JSON.parse(JSON.stringify(dbPersonalData)),
      projects: JSON.parse(JSON.stringify(dbProjects)),
      githubRepos: JSON.parse(JSON.stringify(dbGithubRepos)),
      skills: JSON.parse(JSON.stringify(dbSkills)),
      certificates: JSON.parse(JSON.stringify(dbCertificates)),
      education: JSON.parse(JSON.stringify(dbEducation)),
      ctfEvents: JSON.parse(JSON.stringify(dbCtf)),
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // Return empty data structure to prevent crashes
    return {
      personalData: null,
      projects: [],
      githubRepos: [],
      skills: null,
      certificates: [],
      education: [],
      ctfEvents: [],
    };
  } finally {
    // Prisma client is managed globally, no need to disconnect
  }
}

export default async function Home() {
  // Load only essential data for fast page load - remove AI dependency completely
  const portfolioData = await getPortfolioData();
  const { personalData, projects, githubRepos, skills, certificates, education, ctfEvents } = portfolioData;

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <HeroSection personalData={personalData} />
        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24">
          <AboutSection personalData={personalData} certificates={certificates} education={education} />
          <Separator className="my-8 bg-primary/20" />
          <ProjectsSection projects={projects} githubRepos={githubRepos} />
          <Separator className="my-8 bg-primary/20" />
          <CtfSection events={ctfEvents || []} />
          <Separator className="my-8 bg-primary/20" />
          <SkillsSection skills={skills} />
          <Separator className="my-8 bg-primary/20" />
          <BlogSection />
          <Separator className="my-8 bg-primary/20" />
          <ContactSection personalData={personalData} />
        </div>
      </main>
    </div>
  );
}