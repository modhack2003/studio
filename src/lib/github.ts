export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  visibility: 'public' | 'private';
  archived: boolean;
  disabled: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export class GitHubAPI {
  private baseURL = 'https://api.github.com';
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-App',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      if (response.status === 404) {
        throw new Error('GitHub user or repository not found.');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.request<GitHubUser>(`/users/${username}`);
  }

  async getUserRepositories(
    username: string,
    options: {
      type?: 'all' | 'owner' | 'public' | 'private' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();
    
    if (options.type) params.append('type', options.type);
    if (options.sort) params.append('sort', options.sort);
    if (options.direction) params.append('direction', options.direction);
    if (options.per_page) params.append('per_page', options.per_page.toString());
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString();
    const endpoint = `/users/${username}/repos${queryString ? `?${queryString}` : ''}`;
    
    return this.request<GitHubRepository[]>(endpoint);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  // Helper method to get all repositories (handles pagination)
  async getAllUserRepositories(
    username: string,
    options: {
      type?: 'all' | 'owner' | 'public' | 'private' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
    } = {}
  ): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100; // GitHub's max per page

    while (true) {
      const repos = await this.getUserRepositories(username, {
        ...options,
        per_page: perPage,
        page,
      });

      if (repos.length === 0) break;

      allRepos.push(...repos);
      page++;

      // Safety check to prevent infinite loops
      if (page > 50) break; // Max 5000 repos
    }

    return allRepos;
  }

  // Helper method to filter repositories for portfolio display
  filterRepositoriesForPortfolio(repos: GitHubRepository[]): GitHubRepository[] {
    return repos.filter(repo => 
      !repo.archived && 
      !repo.disabled && 
      repo.visibility === 'public' &&
      repo.description && 
      repo.description.length > 0
    );
  }

  // Helper method to get repository statistics
  getRepositoryStats(repos: GitHubRepository[]) {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const languages = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRepos: repos.length,
      totalStars,
      totalForks,
      languages: Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([language, count]) => ({ language, count }))
    };
  }
}

// Default instance (can be used without token for public data)
export const githubAPI = new GitHubAPI();

// Helper function to create GitHub API instance with token
export function createGitHubAPI(token: string): GitHubAPI {
  return new GitHubAPI(token);
}
