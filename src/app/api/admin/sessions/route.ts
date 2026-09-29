import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, requireAdminSession } from '@/lib/admin-auth';
import { hashToken } from '@/lib/auth';
import { handleError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** DELETE ?scope=others (default) | all  — sign out other devices or everything. */
export async function DELETE(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const scope = request.nextUrl.searchParams.get('scope') === 'all' ? 'all' : 'others';
  try {
    const currentHash = hashToken(request.cookies.get(SESSION_COOKIE)?.value ?? '');
    const { count } = await prisma.adminSession.deleteMany({
      where: scope === 'all' ? {} : { tokenHash: { not: currentHash } },
    });
    const res = NextResponse.json({ success: true, signedOut: count, scope });
    if (scope === 'all') res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
    return res;
  } catch (error) {
    return handleError(error, 'Sessions');
  }
}
