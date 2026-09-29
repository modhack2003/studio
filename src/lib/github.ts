export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  size: number;
  default_branch: string;
  visibility?: 'public' | 'private' | 'internal';
  private: boolean;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  homepage: string | null;
  license: { key: string; name: string; spdx_id: string | null } | null;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class GitHubAPI {
  private baseURL = 'https://api.github.com';
  constructor(private token?: string | null) {}

  private async request<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-sync',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if ((response.status === 403 || response.status === 429) && remaining === '0') {
        const reset = Number(response.headers.get('x-ratelimit-reset') ?? 0) * 1000;
        const mins = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : 60;
        throw new GitHubError(
          `GitHub rate limit reached — try again in ~${mins} min${this.token ? '' : ' (set GITHUB_TOKEN to raise the limit)'}.`,
          429
        );
      }
      if (response.status === 404) throw new GitHubError('GitHub user not found.', 404);
      if (response.status === 401) throw new GitHubError('GITHUB_TOKEN is invalid or expired.', 401);
      throw new GitHubError(`GitHub API error: ${response.status} ${response.statusText}`, 502);
    }
    return response.json() as Promise<T>;
  }

  getUser(username: string) {
    return this.request<GitHubUser>(`/users/${encodeURIComponent(username)}`);
  }

  /** All public repositories owned by the user (handles pagination). */
  async getAllUserRepositories(username: string): Promise<GitHubRepository[]> {
    const all: GitHubRepository[] = [];
    const perPage = 100;
    for (let page = 1; page <= 20; page++) {
      const batch = await this.request<GitHubRepository[]>(
        `/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=${perPage}&page=${page}`
      );
      all.push(...batch);
      if (batch.length < perPage) break;
    }
    return all;
  }
}

/* -------------------------------------------------------------------------- */
/* README excerpt                                                              */
/* -------------------------------------------------------------------------- */
const README_NAMES = ['README.md', 'readme.md', 'Readme.md', 'README.MD', 'README'];

export async function fetchReadme(fullName: string, branch: string): Promise<string | null> {
  for (const file of README_NAMES) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${fullName}/${encodeURIComponent(branch)}/${file}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return await res.text();
    } catch {
      // try next candidate
    }
  }
  return null;
}

function cleanInline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/<[^>]+>/g, ' ') // html tags
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Framework starter text that says nothing about the project itself. */
const BOILERPLATE = [
  /bootstrapped with/i,
  /^this is a next\.?js (starter|project|template)/i,
  /^this template (provides|should help)/i,
  /^getting started with create react app/i,
  /^welcome to your (new )?(react|vite|next)/i,
  /^currently, two official plugins are available/i,
  /^to get started, take a look at/i,
  /firebase studio/i,
];

/** Extracts the first real sentence-y paragraph of a README. */
export function extractReadmeExcerpt(markdown: string, repoName?: string): string | null {
  const text = markdown
    .replace(/\r/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/~~~[\s\S]*?~~~/g, '\n');

  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const isBreak =
      !line ||
      /^#{1,6}\s/.test(line) ||
      /^(=+|-+|\*+|_+)$/.test(line) ||
      /^\|/.test(line) ||
      /^\[!\[/.test(line) ||
      /^!\[/.test(line) ||
      /^<\/?(p|div|img|h\d|br|a|picture|source|table|center|details|summary)\b/i.test(line) ||
      /^([-*+]|\d+\.)\s/.test(line);
    if (isBreak) {
      if (current.length) paragraphs.push(current.join(' '));
      current = [];
      continue;
    }
    current.push(line.replace(/^>\s?/, ''));
  }
  if (current.length) paragraphs.push(current.join(' '));

  const nameNorm = repoName?.toLowerCase().replace(/[-_]/g, ' ').trim();
  for (const p of paragraphs) {
    const clean = cleanInline(p);
    if (clean.length < 25) continue;
    if (!/[a-zA-Z]{3,}/.test(clean)) continue;
    if (/^https?:\/\//.test(clean)) continue;
    if (nameNorm && clean.toLowerCase().replace(/[-_]/g, ' ') === nameNorm) continue;
    if (BOILERPLATE.some((re) => re.test(clean))) continue;
    if (/^(bash|sh|zsh|\$|npm|npx|yarn|pnpm|git|cd|pip|python3?|node|docker)\s/i.test(clean)) continue; // shell snippet
    if (/your-username|<your[-_ ]/i.test(clean)) continue;
    if (/[├└│┬┼─]{1}/.test(clean)) continue; // directory-tree diagrams
    if (/^(js|jsx|ts|tsx|json|html|css|sql|ya?ml|env)\s/i.test(clean)) continue; // unfenced code
    if (/\b(import|export)\s.+\sfrom\s/.test(clean) || /[;{}]\s*$/.test(clean)) continue;
    if (clean.length <= 240) return clean;
    const cut = clean.slice(0, 240);
    return `${cut.slice(0, cut.lastIndexOf(' ') > 150 ? cut.lastIndexOf(' ') : 240).trim()}…`;
  }
  return null;
}

/** Parses a GitHub username out of a profile URL (or returns the input if it already is one). */
export function parseGitHubUsername(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const m = s.match(/github\.com\/([A-Za-z0-9-]{1,39})(?:[/?#]|$)/i);
  if (m) return m[1];
  if (/^[A-Za-z0-9-]{1,39}$/.test(s)) return s;
  return null;
}
