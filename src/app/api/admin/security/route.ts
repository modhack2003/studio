import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, getPinStatus, requireAdminSession } from '@/lib/admin-auth';
import { hashToken } from '@/lib/auth';
import { handleError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Security overview: PIN status, active sessions and recent login attempts. */
export async function GET(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  try {
    const currentHash = hashToken(request.cookies.get(SESSION_COOKIE)?.value ?? '');
    const [pin, sessions, attempts, failures24h] = await Promise.all([
      getPinStatus(),
      prisma.adminSession.findMany({ where: { expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: 'desc' } }),
      prisma.loginAttempt.findMany({ orderBy: { createdAt: 'desc' }, take: 25 }),
      prisma.loginAttempt.count({ where: { success: false, createdAt: { gt: new Date(Date.now() - 86_400_000) } } }),
    ]);
    return NextResponse.json({
      pin,
      failures24h,
      sessions: sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        lastSeenAt: s.lastSeenAt,
        expiresAt: s.expiresAt,
        ip: s.ip,
        userAgent: s.userAgent,
        current: s.tokenHash === currentHash,
      })),
      attempts: attempts.map((a) => ({ id: a.id, ip: a.ip, success: a.success, userAgent: a.userAgent, createdAt: a.createdAt })),
    });
  } catch (error) {
    return handleError(error, 'Security overview');
  }
}
