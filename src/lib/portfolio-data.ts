import { prisma } from '@/lib/prisma';
import { sortRepos } from '@/lib/repo-order';

/** During `next build` the database may be unreachable — render empty and let ISR refresh it. */
export const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build';

/** Type of a value after JSON round-tripping (Dates become ISO strings). */
export type Jsonify<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonify<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonify<T[K]> }
      : T;

const plain = <T,>(v: T): Jsonify<T> => JSON.parse(JSON.stringify(v));

async function load() {
  const [personalData, projects, githubRepos, skills, certificates, education, ctfEvents, experience, posts, postCount] =
    await Promise.all([
      prisma.personalData.findFirst({
        select: {
          id: true,
          name: true,
          title: true,
          bio: true,
          github: true,
          linkedin: true,
          email: true,
          resumeUrl: true,
          avatarUrl: true,
          location: true,
        },
      }),
      prisma.project.findMany({ select: { id: true, title: true, description: true, tags: true, link: true } }),
      prisma.gitHubRepository.findMany({
        where: { displayInPortfolio: true },
        orderBy: { pushedAt: 'desc' },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          readmeExcerpt: true,
          htmlUrl: true,
          language: true,
          topics: true,
          stargazersCount: true,
          forksCount: true,
          homepage: true,
          customTitle: true,
          customDescription: true,
          customTags: true,
          displayOrder: true,
          pushedAt: true,
        },
      }),
      prisma.skill.findFirst({ select: { id: true, languages: true, tools: true, areas: true } }),
      prisma.certificate.findMany({ select: { id: true, name: true, issuer: true, year: true, url: true }, orderBy: { year: 'desc' } }),
      prisma.education.findMany({ select: { id: true, institution: true, degree: true, duration: true } }),
      prisma.ctfEvent.findMany({
        select: {
          id: true,
          name: true,
          organizer: true,
          date: true,
          categories: true,
          placement: true,
          team: true,
          writeupUrl: true,
          points: true,
        },
        orderBy: { date: 'desc' },
      }),
      prisma.experience.findMany({ orderBy: { startDate: 'desc' } }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, excerpt: true, content: true, tags: true, publishedAt: true },
      }),
      prisma.blogPost.count({ where: { published: true } }),
    ]);

  const sortedExperience = [...experience].sort(
    (a, b) =>
      Number(b.current) - Number(a.current) ||
      (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0)
  );

  return plain({
    personalData,
    projects,
    githubRepos: sortRepos(githubRepos),
    skills,
    certificates,
    education,
    ctfEvents,
    experience: sortedExperience,
    posts,
    postCount,
  });
}

export type PortfolioData = Awaited<ReturnType<typeof load>>;

const EMPTY: PortfolioData = {
  personalData: null,
  projects: [],
  githubRepos: [],
  skills: null,
  certificates: [],
  education: [],
  ctfEvents: [],
  experience: [],
  posts: [],
  postCount: 0,
};

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    return await load();
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // At build time fall back to an empty page (ISR refreshes it after deploy).
    // At runtime re-throw so Next keeps serving the last good version instead of caching an empty page.
    if (isBuildPhase()) return EMPTY;
    throw error;
  }
}

export async function getFooterData() {
  try {
    return plain(
      await prisma.personalData.findFirst({
        select: { name: true, email: true, github: true, linkedin: true, resumeUrl: true },
      })
    );
  } catch (error) {
    console.error('Database connection failed in layout:', error);
    return null;
  }
}

/** Reading time estimate for blog posts. */
export function readTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/** Home-page anchors that currently have no content (used by the nav on inner pages). */
export async function getHiddenSections(): Promise<string[]> {
  try {
    const [exp, ctf, skills] = await Promise.all([
      prisma.experience.count(),
      prisma.ctfEvent.count(),
      prisma.skill.findFirst({ select: { languages: true, tools: true, areas: true } }),
    ]);
    const hidden: string[] = [];
    if (!exp) hidden.push('#experience');
    if (!ctf) hidden.push('#ctf');
    if (!skills || skills.languages.length + skills.tools.length + skills.areas.length === 0) hidden.push('#skills');
    return hidden;
  } catch {
    return [];
  }
}
