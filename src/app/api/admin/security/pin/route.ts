import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE,
  getLoginThrottle,
  recordLoginAttempt,
  requestMeta,
  requireAdminSession,
  setAdminPin,
  verifyAdminPin,
} from '@/lib/admin-auth';
import { hashToken, validateNewPin } from '@/lib/auth';
import { handleError, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Change the admin PIN (stored as a scrypt hash in MongoDB). Other sessions are signed out. */
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const body = (await readJson(request)) as { currentPin?: unknown; newPin?: unknown } | undefined;
  const currentPin = typeof body?.currentPin === 'string' ? body.currentPin.trim() : '';
  const newPin = typeof body?.newPin === 'string' ? body.newPin.trim() : '';

  const invalid = validateNewPin(newPin);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    const { ip, userAgent } = requestMeta(request);
    const throttle = await getLoginThrottle(ip);
    if (!throttle.allowed) {
      return NextResponse.json({ error: 'Too many failed attempts. Try again later.' }, { status: 429 });
    }
    const ok = await verifyAdminPin(currentPin);
    if (!ok) {
      await recordLoginAttempt(ip, false, userAgent);
      return NextResponse.json({ error: 'Current PIN is incorrect.' }, { status: 403 });
    }
    if (newPin === currentPin) {
      return NextResponse.json({ error: 'New PIN must be different from the current one.' }, { status: 400 });
    }

    await setAdminPin(newPin);
    const currentHash = hashToken(request.cookies.get(SESSION_COOKIE)?.value ?? '');
    const { count } = await prisma.adminSession.deleteMany({ where: { tokenHash: { not: currentHash } } });
    return NextResponse.json({ success: true, signedOutSessions: count });
  } catch (error) {
    return handleError(error, 'PIN');
  }
}
