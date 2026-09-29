import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, destroySessionByToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await destroySessionByToken(request.cookies.get(SESSION_COOKIE)?.value);
  } catch (error) {
    console.error('Logout cleanup failed:', error);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
