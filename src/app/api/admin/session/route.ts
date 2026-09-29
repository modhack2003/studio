import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_IDLE_MS, getPinStatus, getSessionByToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/** Lightweight "am I still logged in?" check used by the dashboard. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionByToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
    const pin = await getPinStatus();
    return NextResponse.json({
      authenticated: true,
      expiresAt: session.expiresAt.toISOString(),
      idleTimeoutMs: SESSION_IDLE_MS,
      pin,
    });
  } catch (error) {
    console.error('Session status failed:', error);
    return NextResponse.json({ authenticated: false, error: 'Database unavailable' }, { status: 503 });
  }
}
