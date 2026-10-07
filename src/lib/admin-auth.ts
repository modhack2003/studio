// Server-only module (uses Prisma + next/headers).
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { throttleTransaction } from '@/lib/throttle-transaction';
import {
  generateSessionToken,
  getClientIp,
  hashPin,
  hashToken,
  isWeakPin,
  verifyPin,
  verifyPinHash,
} from '@/lib/auth';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // absolute lifetime
export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000; // signed out after 2h without activity
const TOUCH_INTERVAL_MS = 60 * 1000;

// Lockout policy
export const MAX_FAILED_ATTEMPTS = 5; // per IP ...
const FAILURE_WINDOW_MS = 15 * 60 * 1000; // ... within 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;
const GLOBAL_MAX_FAILURES = 40; // across all IPs within the window
const GLOBAL_LOCKOUT_MS = 5 * 60 * 1000;
const ATTEMPT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export class AuthConfigError extends Error {}

/* -------------------------------------------------------------------------- */
/* PIN                                                                         */
/* -------------------------------------------------------------------------- */
export type PinSource = 'database' | 'env' | 'none';

export async function getPinStatus(): Promise<{ source: PinSource; weak: boolean }> {
  const cred = await prisma.adminCredential.findUnique({ where: { key: 'admin' } });
  if (cred) return { source: 'database', weak: false };
  const env = process.env.ADMIN_PIN;
  if (env) return { source: 'env', weak: isWeakPin(env) };
  return { source: 'none', weak: true };
}

/** Checks a PIN against the DB hash (if set from the dashboard) or ADMIN_PIN. */
export async function verifyAdminPin(pin: string, db: Prisma.TransactionClient = prisma): Promise<boolean> {
  const cred = await db.adminCredential.findUnique({ where: { key: 'admin' } });
  if (cred) return verifyPinHash(pin, cred.pinHash);
  const env = process.env.ADMIN_PIN;
  if (!env) throw new AuthConfigError('No admin PIN configured. Set ADMIN_PIN in the environment.');
  return verifyPin(pin, env);
}

export async function setAdminPin(pin: string): Promise<void> {
  const pinHash = hashPin(pin);
  await prisma.adminCredential.upsert({
    where: { key: 'admin' },
    create: { key: 'admin', pinHash },
    update: { pinHash },
  });
}

/* -------------------------------------------------------------------------- */
/* Lockouts                                                                    */
/* -------------------------------------------------------------------------- */
export async function getLoginThrottle(ip: string, db: Prisma.TransactionClient = prisma): Promise<{ allowed: boolean; retryAfterMs: number; remaining: number }> {
  const now = Date.now();
  const windowStart = new Date(now - FAILURE_WINDOW_MS);

  const lastSuccess = await db.loginAttempt.findFirst({
    where: { ip, success: true },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  const since = lastSuccess && lastSuccess.createdAt > windowStart ? lastSuccess.createdAt : windowStart;

  const failures = await db.loginAttempt.findMany({
    where: { ip, success: false, createdAt: { gt: since } },
    orderBy: { createdAt: 'desc' },
    take: MAX_FAILED_ATTEMPTS,
    select: { createdAt: true },
  });

  if (failures.length >= MAX_FAILED_ATTEMPTS) {
    const until = failures[0].createdAt.getTime() + LOCKOUT_MS;
    if (until > now) return { allowed: false, retryAfterMs: until - now, remaining: 0 };
  }

  const globalFailures = await db.loginAttempt.count({
    where: { success: false, createdAt: { gt: windowStart } },
  });
  if (globalFailures >= GLOBAL_MAX_FAILURES) {
    const newest = await db.loginAttempt.findFirst({
      where: { success: false },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const until = (newest?.createdAt.getTime() ?? now) + GLOBAL_LOCKOUT_MS;
    if (until > now) return { allowed: false, retryAfterMs: until - now, remaining: 0 };
  }

  return { allowed: true, retryAfterMs: 0, remaining: Math.max(0, MAX_FAILED_ATTEMPTS - failures.length) };
}

/** Check and record under the same database guard, including the PIN-change path. */
export async function checkAdminPin(pin: string, ip: string, userAgent: string | null, recordSuccess = true) {
  const result = await throttleTransaction('admin-login', async (tx) => {
    const throttle = await getLoginThrottle(ip, tx);
    if (!throttle.allowed) return { throttle, ok: null };
    const ok = await verifyAdminPin(pin, tx);
    if (!ok || recordSuccess) {
      await tx.loginAttempt.create({
        data: { ip, success: ok, userAgent: userAgent?.slice(0, 300) ?? null },
      });
    }
    return { throttle, ok };
  });
  if (result.ok && recordSuccess) {
    // Housekeeping stays outside the retried transaction.
    await prisma.loginAttempt
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - ATTEMPT_RETENTION_MS) } } })
      .catch(() => {});
    await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                    */
/* -------------------------------------------------------------------------- */
export async function createSession(ip: string, userAgent: string | null) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await prisma.adminSession.create({
    data: { tokenHash: hashToken(token), expiresAt, ip, userAgent: userAgent?.slice(0, 300) ?? null },
  });
  return { token, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    expires: expiresAt,
  };
}

export type AdminSessionRecord = Awaited<ReturnType<typeof prisma.adminSession.findUnique>>;

export async function getSessionByToken(token: string | undefined | null) {
  if (!token || token.length < 20 || token.length > 200) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({ where: { tokenHash } });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() <= now || now - session.lastSeenAt.getTime() > SESSION_IDLE_MS) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.adminSession
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date(now) } })
      .catch(() => {});
  }
  return session;
}

/** For server components (e.g. the /bikram page). */
export async function getCurrentAdminSession() {
  try {
    const store = await cookies();
    return await getSessionByToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function destroySessionByToken(token: string | undefined | null) {
  if (!token) return;
  await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

/* -------------------------------------------------------------------------- */
/* Route guard                                                                 */
/* -------------------------------------------------------------------------- */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function originAllowed(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin navigations / non-browser clients; cookie is SameSite=Strict
  try {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Use at the top of every admin API handler:
 *   const denied = await requireAdminSession(request); if (denied) return denied;
 */
export async function requireAdminSession(request: NextRequest): Promise<NextResponse | null> {
  if (!SAFE_METHODS.has(request.method) && !originAllowed(request)) {
    return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
  }
  try {
    const session = await getSessionByToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ error: 'Session expired — please log in again.' }, { status: 401 });
    }
    return null;
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ error: 'Could not verify session (database unavailable).' }, { status: 503 });
  }
}

export function requestMeta(request: NextRequest) {
  return { ip: getClientIp(request.headers), userAgent: request.headers.get('user-agent') };
}
