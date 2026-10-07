import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError } from '@/lib/api';
import { sortRepos } from '@/lib/repo-order';

export const dynamic = 'force-dynamic';

/** Admin list of every synced repository (including hidden ones). */
export async function GET(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  try {
    const [rows, state] = await Promise.all([
      prisma.gitHubRepository.findMany({ orderBy: { pushedAt: 'desc' } }),
      prisma.gitHubSyncState.findUnique({ where: { id: 'github' } }),
    ]);
    const repositories = sortRepos(rows);
    const visible = repositories.filter((r) => r.displayInPortfolio).length;
    const lastSync = repositories.reduce<Date | null>((acc, r) => (!acc || r.syncedAt > acc ? r.syncedAt : acc), null);
    return NextResponse.json({
      repositories,
      stats: { total: repositories.length, visible, lastSync: state?.lastSuccess ?? lastSync, lastError: state?.lastError ?? null, syncing: !!state?.lockedUntil && state.lockedUntil > new Date() },
    });
  } catch (error) {
    return handleError(error, 'Repositories');
  }
}
