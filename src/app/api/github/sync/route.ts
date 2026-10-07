import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { jsonError, readJson, revalidatePublic } from '@/lib/api';
import { refreshGitHub } from '@/lib/github-refresh';
import { GitHubError } from '@/lib/github';
import { resolveGitHubUsername } from '@/lib/github-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** POST { username? } — pulls profile + repos from GitHub into the database. */
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const body = (await readJson(request)) as { username?: unknown; automatic?: unknown } | undefined;
  try {
    if (body?.username !== undefined && typeof body.username !== 'string') return jsonError('Invalid GitHub username.', 400);
    if (body?.automatic !== undefined && typeof body.automatic !== 'boolean') return jsonError('Invalid sync mode.', 400);
    const username = await resolveGitHubUsername(prisma, typeof body?.username === 'string' ? body.username : null);
    const result = await refreshGitHub(prisma, { username, automatic: body?.automatic === true });
    if (!result.skipped) revalidatePublic();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof GitHubError) return jsonError(error.message, error.status);
    console.error('GitHub sync failed:', error);
    return jsonError('GitHub sync failed. Check the server logs.', 500);
  }
}
