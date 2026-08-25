import type { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Session secret used to sign session tokens
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PIN || 'fallback-secret-change-me';

/**
 * Generate a cryptographically secure session token.
 * The token is an HMAC of a random nonce + timestamp, so it can't be forged
 * without knowing SESSION_SECRET.
 */
export function generateSessionToken(): string {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${nonce}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

/**
 * Validate a session token by recomputing the HMAC.
 */
export function validateSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [nonce, timestamp, providedHmac] = parts;

  // Check token age — expire after 6 hours
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge > 6 * 60 * 60 * 1000 || tokenAge < 0) {
    return false;
  }

  const expectedHmac = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${nonce}:${timestamp}`)
    .digest('hex');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Timing-safe PIN comparison to prevent timing attacks.
 */
export function verifyPin(userPin: string, correctPin: string): boolean {
  if (!userPin || !correctPin) return false;

  // Pad to same length for timing-safe comparison
  const maxLen = Math.max(userPin.length, correctPin.length);
  const paddedUser = userPin.padEnd(maxLen, '\0');
  const paddedCorrect = correctPin.padEnd(maxLen, '\0');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(paddedUser),
      Buffer.from(paddedCorrect)
    ) && userPin.length === correctPin.length;
  } catch {
    return false;
  }
}

/**
 * Check if the current request has a valid admin session.
 * Use this in API route handlers to protect mutating endpoints.
 *
 * Returns null if authenticated, or a 401 NextResponse if not.
 */
export function requireAdminSession(request: NextRequest): NextResponse | null {
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken || !validateSessionToken(sessionToken)) {
    return Response.json(
      { error: 'Unauthorized — admin session required' },
      { status: 401 }
    ) as unknown as NextResponse;
  }

  return null; // Authenticated
}

/**
 * Simple in-memory login rate limiter.
 * Tracks failed attempts per IP to prevent brute-force attacks on the PIN.
 */
interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes lockout

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // Check if locked out
  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.lockedUntil - now };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfterMs: LOCKOUT_MS };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
