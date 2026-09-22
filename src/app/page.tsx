import { MainNav } from "@/components/main-nav";

import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { BlogSection } from "@/components/sections/blog";
import { ContactSection } from "@/components/sections/contact";
import { CtfSection } from "@/components/sections/ctf";
import { Separator } from "@/components/ui/separator";
import { MaskedGenerator } from "@/components/sections/masked-generator";
import { CityHeader } from "@/components/sections/city-header";
import { PrismaClient } from '@prisma/client';
import { HeaderNav } from '@/components/header-nav';
import { SectionTitle } from '@/components/section-title';
import { CardShell } from '@/components/card-shell';

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

async function getPortfolioData(prisma: PrismaClient) {
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
  }
}

export default async function Home() {
  // Load only essential data for fast page load - remove AI dependency completely
  const prisma = createPrismaClient();
  const portfolioData = await getPortfolioData(prisma);
  const { personalData, projects, githubRepos, skills, certificates, education, ctfEvents } = portfolioData;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav personalData={personalData} />
      <main className="flex-1">
        <HeroSection personalData={personalData} />
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 space-y-28">
          <SectionTitle id="about" eyebrow="Section 01" title="About Me" subtitle="A little bit about my journey in the digital trenches." />
          <AboutSection personalData={personalData} certificates={certificates} education={education} />

          <div className="section-rule h-px" />

          <SectionTitle id="projects" eyebrow="Section 02" title="My Projects" subtitle="A selection of my work. See what I&apos;ve been building." />
          <ProjectsSection projects={projects} githubRepos={githubRepos} />

          <div className="section-rule h-px" />

          <MaskedGenerator />

          <div className="section-rule h-px" />

          <SectionTitle id="ctf" eyebrow="Section 03" title="CTF Competitions" subtitle="Competitive cybersecurity challenges I have participated in and highlights." />
          <CtfSection events={ctfEvents || []} />

          <div className="section-rule h-px" />

          <SectionTitle id="skills" eyebrow="Section 04" title="My Arsenal" subtitle="The languages, tools, and technologies I use to build and secure applications." />
          <SkillsSection skills={skills} />

          <div className="section-rule h-px" />

          <SectionTitle id="blog" eyebrow="Section 05" title="Security Insights" subtitle="My thoughts on cybersecurity trends, methodologies, and best practices." />
          <BlogSection />

          <div className="section-rule h-px" />

          <SectionTitle id="contact" eyebrow="Section 06" title="Get In Touch" subtitle="Have a question or a project in mind? Let&apos;s connect." />
          <ContactSection personalData={personalData} />
        </div>
      </main>
    </div>
  );
}