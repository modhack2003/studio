import { NextRequest, NextResponse } from 'next/server';
import {
  AuthConfigError,
  MAX_FAILED_ATTEMPTS,
  SESSION_COOKIE,
  createSession,
  getLoginThrottle,
  checkAdminPin,
  requestMeta,
  sessionCookieOptions,
} from '@/lib/admin-auth';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

function lockedResponse(retryAfterMs: number) {
  const retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    {
      error: `Too many failed attempts. Try again in ${Math.ceil(retryAfter / 60)} min.`,
      retryAfter,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export async function POST(request: NextRequest) {
  const { ip, userAgent } = requestMeta(request);

  const body = (await readJson(request)) as { pin?: unknown } | undefined;
  const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';
  if (!pin || pin.length > 64) {
    return NextResponse.json({ error: 'PIN is required.' }, { status: 400 });
  }

  try {
    const started = Date.now();
    const { throttle, ok } = await checkAdminPin(pin, ip, userAgent);
    if (!throttle.allowed) return lockedResponse(throttle.retryAfterMs);

    // Keep the response delay outside the transaction; the attempt is already recorded.
    const elapsed = Date.now() - started;
    if (elapsed < 350) await new Promise((r) => setTimeout(r, 350 - elapsed));

    if (!ok) {
      const remaining = Math.max(0, throttle.remaining - 1);
      if (remaining === 0) {
        const after = await getLoginThrottle(ip);
        return lockedResponse(after.retryAfterMs || 15 * 60 * 1000);
      }
      return NextResponse.json(
        {
          error: `Wrong PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} left before a 15 min lockout.`,
          remaining,
          maxAttempts: MAX_FAILED_ATTEMPTS,
        },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createSession(ip, userAgent);
    const res = NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    return res;
  } catch (error) {
    if (error instanceof AuthConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login is temporarily unavailable (database error).' }, { status: 503 });
  }
}
