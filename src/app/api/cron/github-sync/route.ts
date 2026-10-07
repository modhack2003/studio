import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveGitHubUsername } from '@/lib/github-sync';
import { refreshGitHub } from '@/lib/github-refresh';
import { jsonError, revalidatePublic } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return jsonError('Unauthorized', 401);
  try {
    const username = await resolveGitHubUsername(prisma);
    const result = await refreshGitHub(prisma, { username, automatic: true, withProfile: false });
    if (!result.skipped) revalidatePublic();
    if (result.data?.errors.length) return jsonError('Some repositories could not be refreshed.', 503);
    return NextResponse.json({ success: true, skipped: result.skipped });
  } catch (error) {
    console.error('Scheduled GitHub sync failed:', error);
    return jsonError('GitHub sync failed.', 503);
  }
}
