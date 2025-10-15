import { NextRequest, NextResponse } from 'next/server';
import { githubAPI } from '@/lib/github';
import { githubRateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = request.ip || 'unknown';
    const rateLimitKey = `github-repos-${clientIP}`;
    
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
    const username = searchParams.get('username');
    const token = searchParams.get('token'); // Optional GitHub token for higher rate limits

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Use environment token if available, otherwise use provided token
    const githubToken = process.env.GITHUB_TOKEN || token;
    
    // Create GitHub API instance with or without token
    const api = githubToken ? githubAPI : githubAPI;

    // Fetch user information
    const user = await api.getUser(username);
    
    // Fetch all repositories
    const allRepos = await api.getAllUserRepositories(username, {
      type: 'owner',
      sort: 'updated',
      direction: 'desc'
    });

    // Filter repositories suitable for portfolio display
    const portfolioRepos = api.filterRepositoriesForPortfolio(allRepos);

    // Get repository statistics
    const stats = api.getRepositoryStats(allRepos);

    return NextResponse.json({
      user,
      repositories: portfolioRepos,
      allRepositories: allRepos,
      stats,
      totalCount: allRepos.length,
      portfolioCount: portfolioRepos.length
    });

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    
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
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
}

// POST endpoint to sync repositories (for admin use)
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = request.ip || 'unknown';
    const rateLimitKey = `github-repos-post-${clientIP}`;
    
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

    const body = await request.json();
    const { username, token } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Use environment token if available, otherwise use provided token
    const githubToken = process.env.GITHUB_TOKEN || token;
    
    // Create GitHub API instance
    const api = githubToken ? githubAPI : githubAPI;

    // Fetch and process repositories
    const allRepos = await api.getAllUserRepositories(username, {
      type: 'owner',
      sort: 'updated',
      direction: 'desc'
    });

    const portfolioRepos = api.filterRepositoriesForPortfolio(allRepos);
    const stats = api.getRepositoryStats(allRepos);

    // Return processed data for database storage
    return NextResponse.json({
      success: true,
      data: {
        user: await api.getUser(username),
        repositories: portfolioRepos,
        allRepositories: allRepos,
        stats,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error syncing GitHub repositories:', error);
    
    return NextResponse.json(
      { error: 'Failed to sync GitHub repositories' },
      { status: 500 }
    );
  }
}
