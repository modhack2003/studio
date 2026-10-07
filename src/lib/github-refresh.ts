import { randomUUID } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import { syncGitHub } from '@/lib/github-sync';

export const AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const RETRY_INTERVAL_MS = 15 * 60 * 1000;
const LEASE_MS = 10 * 60 * 1000; // Longer than the route's five-minute maximum.

/** Atomic shared lease: one refresh across tabs, cron and server instances. */
export async function refreshGitHub(db: PrismaClient, opts: { username: string; automatic?: boolean; withProfile?: boolean }) {
  const id = 'github';
  const now = new Date();
  const lockToken = randomUUID();
  try {
    await db.gitHubSyncState.upsert({ where: { id }, create: { id, username: null, lastSuccess: null, lastAttempt: null, lockedUntil: null, lockToken: null, lastError: null }, update: {} });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
  }
  const claim = await db.gitHubSyncState.updateMany({
    where: {
      id,
      AND: [
        { OR: [{ lockedUntil: null }, { lockedUntil: { isSet: false } }, { lockedUntil: { lte: now } }] },
        ...(opts.automatic ? [
          { OR: [{ username: { not: opts.username } }, { username: null }, { username: { isSet: false } }, { lastSuccess: null }, { lastSuccess: { isSet: false } }, { lastSuccess: { lte: new Date(now.getTime() - AUTO_SYNC_INTERVAL_MS) } }] },
          { OR: [{ lastAttempt: null }, { lastAttempt: { isSet: false } }, { lastAttempt: { lte: new Date(now.getTime() - RETRY_INTERVAL_MS) } }] },
        ] : []),
      ],
    },
    data: { lockToken, lockedUntil: new Date(now.getTime() + LEASE_MS), lastAttempt: now },
  });
  if (!claim.count) return { skipped: true as const, data: null };
  try {
    const data = await syncGitHub(db, { username: opts.username, withProfile: opts.withProfile ?? !opts.automatic });
    await db.gitHubSyncState.updateMany({
      where: { id, lockToken },
      data: data.errors.length
        ? { lastError: `${data.errors.length} repositories could not be updated. Retry Sync now.` }
        : { username: opts.username, lastSuccess: new Date(), lastError: null },
    });
    return { skipped: false as const, data };
  } catch (error) {
    await db.gitHubSyncState.updateMany({ where: { id, lockToken }, data: { lastError: 'Sync failed. Retry Sync now or check server logs.' } }).catch(() => {});
    throw error;
  } finally {
    await db.gitHubSyncState.updateMany({ where: { id, lockToken }, data: { lockedUntil: null, lockToken: null } });
  }
}
