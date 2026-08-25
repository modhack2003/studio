import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPin,
  generateSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — prevent brute force on PIN
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkLoginRateLimit(clientIP);

    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.retryAfterMs || 0) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        }
      );
    }

    const { pin } = await request.json();
    const correct = process.env.ADMIN_PIN;

    if (!correct) {
      return NextResponse.json(
        { error: 'Admin PIN not configured' },
        { status: 500 }
      );
    }

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Timing-safe comparison to prevent timing attacks
    if (!verifyPin(pin, correct)) {
      recordFailedLogin(clientIP);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Success — clear rate limit and issue cryptographic session token
    clearLoginAttempts(clientIP);
    const sessionToken = generateSessionToken();

    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 6, // 6 hours
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}


