import type { PrismaClient } from '@prisma/client';
import {
  GitHubAPI,
  extractReadmeExcerpt,
  fetchReadme,
  parseGitHubUsername,
  type GitHubRepository,
} from '@/lib/github';

export const DEFAULT_GITHUB_USERNAME = 'modhack2003';

export interface SyncResult {
  username: string;
  total: number;
  created: number;
  updated: number;
  removed: number;
  visible: number;
  readmeExcerpts: number;
  profileUpdated: string[];
  errors: { repository: string; error: string }[];
}

function titleCase(s: string) {
  return s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function resolveGitHubUsername(prisma: PrismaClient, explicit?: string | null) {
  if (explicit && parseGitHubUsername(explicit)) return parseGitHubUsername(explicit)!;
  const personal = await prisma.personalData.findFirst({ select: { github: true } });
  return (
    parseGitHubUsername(personal?.github) ||
    parseGitHubUsername(process.env.GITHUB_USERNAME) ||
    DEFAULT_GITHUB_USERNAME
  );
}

/**
 * Pulls the GitHub profile + every public repo into MongoDB.
 * - New repos are shown on the site automatically (except forks, archived repos and the profile README repo).
 * - Existing repos keep their display settings (visibility, custom title/description/tags, pin).
 * - Repos that no longer exist on GitHub are removed.
 * - Repos without a description get the first paragraph of their README.
 */
export async function syncGitHub(
  prisma: PrismaClient,
  opts: { username: string; token?: string | null; withProfile?: boolean }
): Promise<SyncResult> {
  const api = new GitHubAPI(opts.token ?? process.env.GITHUB_TOKEN ?? null);
  const username = opts.username;
  const result: SyncResult = {
    username,
    total: 0,
    created: 0,
    updated: 0,
    removed: 0,
    visible: 0,
    readmeExcerpts: 0,
    profileUpdated: [],
    errors: [],
  };

  const [user, repos] = await Promise.all([api.getUser(username), api.getAllUserRepositories(username)]);
  const publicRepos = repos.filter((r) => !r.private);
  result.total = publicRepos.length;

  /* ---- profile ---------------------------------------------------------- */
  if (opts.withProfile !== false) {
    const personal = await prisma.personalData.findFirst();
    if (personal) {
      const data: Record<string, string> = {};
      if (user.avatar_url && personal.avatarUrl !== user.avatar_url) data.avatarUrl = user.avatar_url;
      if (!personal.location && user.location) data.location = titleCase(user.location);
      if (!personal.github) data.github = user.html_url;
      if (!personal.bio && user.bio) data.bio = user.bio.trim();
      if (Object.keys(data).length) {
        await prisma.personalData.update({ where: { id: personal.id }, data });
        result.profileUpdated = Object.keys(data);
      }
    } else {
      await prisma.personalData.create({
        data: {
          name: titleCase(user.name || user.login),
          title: '',
          bio: user.bio?.trim() || '',
          github: user.html_url,
          linkedin: '',
          email: user.email || '',
          resumeUrl: '',
          avatarUrl: user.avatar_url,
          location: user.location ? titleCase(user.location) : null,
        },
      });
      result.profileUpdated = ['created profile'];
    }
  }

  /* ---- repositories ----------------------------------------------------- */
  const existing = await prisma.gitHubRepository.findMany({
    select: { id: true, githubId: true, fullName: true, customDescription: true },
  });
  const byGithubId = new Map(existing.map((r) => [r.githubId, r]));

  await mapLimit(publicRepos, 6, async (repo: GitHubRepository) => {
    try {
      const isProfileRepo = repo.name.toLowerCase() === username.toLowerCase();
      let readmeExcerpt: string | null = null;
      if (!repo.description && !isProfileRepo) {
        const md = await fetchReadme(repo.full_name, repo.default_branch);
        readmeExcerpt = md ? extractReadmeExcerpt(md, repo.name) : null;
        if (readmeExcerpt) result.readmeExcerpts++;
      }

      const data = {
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        language: repo.language,
        topics: repo.topics ?? [],
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at),
        pushedAt: new Date(repo.pushed_at ?? repo.updated_at),
        size: repo.size,
        defaultBranch: repo.default_branch,
        visibility: repo.visibility ?? (repo.private ? 'private' : 'public'),
        archived: repo.archived,
        disabled: repo.disabled,
        homepage: repo.homepage || null,
        license: repo.license?.name ?? null,
        fork: repo.fork,
        readmeExcerpt,
        syncedAt: new Date(),
        lastChecked: new Date(),
      };

      const found = byGithubId.get(repo.id);
      if (found) {
        await prisma.gitHubRepository.update({ where: { id: found.id }, data });
        result.updated++;
      } else {
        // a repo deleted & recreated with the same name keeps its fullName but gets a new id
        await prisma.gitHubRepository.deleteMany({ where: { fullName: repo.full_name } });
        await prisma.gitHubRepository.create({
          data: {
            ...data,
            customTags: [],
            displayInPortfolio: !repo.fork && !repo.archived && !isProfileRepo,
          },
        });
        result.created++;
      }
    } catch (error) {
      result.errors.push({ repository: repo.name, error: error instanceof Error ? error.message : String(error) });
    }
  });

  if (result.errors.length === 0) {
    const liveIds = publicRepos.map((r) => r.id);
    const removed = await prisma.gitHubRepository.deleteMany({ where: { githubId: { notIn: liveIds } } });
    result.removed = removed.count;
  }

  result.visible = await prisma.gitHubRepository.count({ where: { displayInPortfolio: true } });
  return result;
}
