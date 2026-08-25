import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { githubAPI } from '@/lib/github';
import { githubRateLimiter } from '@/lib/rate-limiter';
import { requireAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { username, token } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const clientIP = request.ip || 'unknown';
    const rateLimitKey = `github-sync-${clientIP}`;
    
    if (!githubRateLimiter.isAllowed(rateLimitKey)) {
      const resetTime = githubRateLimiter.getResetTime(rateLimitKey);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: new Date(resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Use environment token if available, otherwise use provided token
    const githubToken = process.env.GITHUB_TOKEN || token;
    
    // Create GitHub API instance
    const api = githubToken ? githubAPI : githubAPI;

    // Fetch all repositories from GitHub
    const allRepos = await api.getAllUserRepositories(username, {
      type: 'owner',
      sort: 'updated',
      direction: 'desc'
    });

    const syncedRepos = [];
    const errors = [];

    // Sync each repository to database
    for (const repo of allRepos) {
      try {
        // Check if repository already exists
        const existingRepo = await prisma.gitHubRepository.findUnique({
          where: { githubId: repo.id }
        });

        const repoData = {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          htmlUrl: repo.html_url,
          cloneUrl: repo.clone_url,
          language: repo.language,
          topics: repo.topics || [],
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          createdAt: new Date(repo.created_at),
          updatedAt: new Date(repo.updated_at),
          pushedAt: new Date(repo.pushed_at),
          size: repo.size,
          defaultBranch: repo.default_branch,
          visibility: repo.visibility,
          archived: repo.archived,
          disabled: repo.disabled,
          homepage: repo.homepage,
          license: repo.license?.name || null,
          lastChecked: new Date()
        };

        if (existingRepo) {
          // Update existing repository
          const updatedRepo = await prisma.gitHubRepository.update({
            where: { githubId: repo.id },
            data: repoData
          });
          syncedRepos.push(updatedRepo);
        } else {
          // Create new repository
          const newRepo = await prisma.gitHubRepository.create({
            data: repoData
          });
          syncedRepos.push(newRepo);
        }
      } catch (error) {
        console.error(`Error syncing repository ${repo.name}:`, error);
        errors.push({
          repository: repo.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get statistics
    const totalRepos = await prisma.gitHubRepository.count();
    const portfolioRepos = await prisma.gitHubRepository.count({
      where: { displayInPortfolio: true }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedRepos.length} repositories`,
      data: {
        syncedCount: syncedRepos.length,
        totalRepos,
        portfolioRepos,
        errors: errors.length > 0 ? errors : undefined,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error syncing GitHub repositories:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'GitHub user not found.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to sync GitHub repositories' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve synced repositories
export async function GET(request: NextRequest) {
  try {
    // Check rate limit for GET requests (more lenient)
    const clientIP = request.ip || 'unknown';
    const rateLimitKey = `github-get-${clientIP}`;
    
    if (!githubRateLimiter.isAllowed(rateLimitKey)) {
      const resetTime = githubRateLimiter.getResetTime(rateLimitKey);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: new Date(resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const displayOnly = searchParams.get('displayOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause = displayOnly ? { displayInPortfolio: true } : {};

    const repositories = await prisma.gitHubRepository.findMany({
      where: whereClause,
      orderBy: [
        { displayOrder: 'asc' },
        { updatedAt: 'desc' }
      ],
      take: limit
    });

    const totalCount = await prisma.gitHubRepository.count();
    const portfolioCount = await prisma.gitHubRepository.count({
      where: { displayInPortfolio: true }
    });

    return NextResponse.json({
      repositories,
      stats: {
        totalCount,
        portfolioCount,
        returnedCount: repositories.length
      }
    });

  } catch (error) {
    console.error('Error fetching synced repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
