import { HeroSection } from '@/components/sections/hero';
import { AboutSection } from '@/components/sections/about';
import { ExperienceSection } from '@/components/sections/experience';
import { ProjectsSection } from '@/components/sections/projects';
import { SkillsSection } from '@/components/sections/skills';
import { BlogSection } from '@/components/sections/blog';
import { ContactSection } from '@/components/sections/contact';
import { CtfSection } from '@/components/sections/ctf';
import { MaskedGenerator } from '@/components/sections/masked-generator';
import { HeaderNav } from '@/components/header-nav';
import { SectionHeader } from '@/components/cyber/primitives';
import { ScrollCircle } from '@/components/cyber/scroll-circle';
import { getPortfolioData } from '@/lib/portfolio-data';

// Re-render at most once a minute; admin saves trigger an immediate refresh (revalidatePath).
export const revalidate = 60;

export default async function Home() {
  const { personalData, projects, githubRepos, skills, certificates, education, ctfEvents, experience, posts, postCount } =
    await getPortfolioData();

  const hasExperience = experience.length > 0;
  const hasCtf = ctfEvents.length > 0;
  const hasSkills = !!skills && skills.languages.length + skills.tools.length + skills.areas.length > 0;
  const hidden = [!hasExperience && '#experience', !hasCtf && '#ctf', !hasSkills && '#skills'].filter(Boolean) as string[];

  let n = 0;
  const idx = () => String(++n).padStart(2, '0');

  const aboutIdx = idx();
  const expIdx = hasExperience ? idx() : '';
  const projIdx = idx();
  const ctfIdx = hasCtf ? idx() : '';
  const skillIdx = hasSkills ? idx() : '';
  const blogIdx = idx();
  const contactIdx = idx();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav personalData={personalData} hidden={hidden} />
      <main className="flex-1">
        <HeroSection personalData={personalData} />

        <div className="relative">
          <div aria-hidden className="grid-cross pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-[1440px] space-y-32 px-6 py-28 sm:px-10">
            <div className="space-y-14">
              <SectionHeader id="about" index={aboutIdx} jp="自己紹介" eyebrow={`Section ${aboutIdx} / Dossier`} title="About Me" subtitle="A little bit about my journey in the digital trenches." />
              <AboutSection personalData={personalData} certificates={certificates} education={education} experienceCount={experience.length} repoCount={githubRepos.length} />
            </div>

            {hasExperience && (
              <div className="space-y-14">
                <SectionHeader id="experience" index={expIdx} jp="経歴" eyebrow={`Section ${expIdx} / Service record`} title="Work Experience" subtitle="Where I have put the skills to work." />
                <ExperienceSection items={experience} />
              </div>
            )}

            <div className="space-y-14">
              <SectionHeader id="projects" index={projIdx} jp="作品" eyebrow={`Section ${projIdx} / Payloads`} title="My Projects" subtitle="A selection of my work. See what I&apos;ve been building." />
              <ProjectsSection projects={projects} githubRepos={githubRepos} />
            </div>

            <MaskedGenerator />

            {hasCtf && (
            <div className="space-y-14">
              <SectionHeader id="ctf" index={ctfIdx} jp="旗取り" eyebrow={`Section ${ctfIdx} / Operations`} title="CTF Competitions" subtitle="Competitive cybersecurity challenges I have participated in and highlights." />
              <CtfSection events={ctfEvents} />
            </div>
            )}

            {hasSkills && (
            <div className="space-y-14">
              <SectionHeader id="skills" index={skillIdx} jp="武器庫" eyebrow={`Section ${skillIdx} / Loadout`} title="My Arsenal" subtitle="The languages, tools, and technologies I use to build and secure applications." />
              <SkillsSection skills={skills} />
            </div>
            )}

            <div className="space-y-14">
              <SectionHeader id="blog" index={blogIdx} jp="記録" eyebrow={`Section ${blogIdx} / Transmissions`} title="Security Insights" subtitle="My thoughts on cybersecurity trends, methodologies, and best practices." />
              <BlogSection posts={posts} total={postCount} />
            </div>
          </div>
        </div>

        <ScrollCircle>
          <div className="mx-auto max-w-[1440px] space-y-14 px-6 py-28 sm:px-10">
            <SectionHeader id="contact" index={contactIdx} jp="通信" eyebrow={`Section ${contactIdx} / Uplink`} title="Get In Touch" subtitle="Have a question or a project in mind? Let&apos;s connect." />
            <ContactSection personalData={personalData} />
          </div>
        </ScrollCircle>
      </main>
    </div>
  );
}
