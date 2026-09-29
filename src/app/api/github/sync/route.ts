import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { jsonError, readJson, revalidatePublic } from '@/lib/api';
import { GitHubError } from '@/lib/github';
import { resolveGitHubUsername, syncGitHub } from '@/lib/github-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** POST { username? } — pulls profile + repos from GitHub into the database. */
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const body = (await readJson(request)) as { username?: unknown } | undefined;
  try {
    const username = await resolveGitHubUsername(prisma, typeof body?.username === 'string' ? body.username : null);
    const result = await syncGitHub(prisma, { username });
    revalidatePublic();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof GitHubError) return jsonError(error.message, error.status);
    console.error('GitHub sync failed:', error);
    return jsonError('GitHub sync failed. Check the server logs.', 500);
  }
}
