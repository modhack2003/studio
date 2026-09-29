/**
 * Pure (database-free) security helpers.
 * Database-backed session / lockout logic lives in `admin-auth.ts`.
 */
import crypto from 'crypto';

export const PIN_MIN_LENGTH = 6;
export const PIN_MAX_LENGTH = 12;

/** Timing-safe comparison of a submitted PIN with a plain-text PIN (env fallback). */
export function verifyPin(userPin: string, correctPin: string): boolean {
  if (!userPin || !correctPin) return false;
  const a = crypto.createHash('sha256').update(userPin).digest();
  const b = crypto.createHash('sha256').update(correctPin).digest();
  return crypto.timingSafeEqual(a, b) && userPin.length === correctPin.length;
}

/* -------------------------------------------------------------------------- */
/* PIN hashing (scrypt)                                                       */
/* -------------------------------------------------------------------------- */
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pin, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('base64'), hash.toString('base64')].join('$');
}

export function verifyPinHash(pin: string, stored: string): boolean {
  try {
    const [algo, n, r, p, saltB64, hashB64] = stored.split('$');
    if (algo !== 'scrypt') return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = crypto.scryptSync(pin, Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* PIN policy                                                                  */
/* -------------------------------------------------------------------------- */
const COMMON_PINS = new Set([
  '123456', '654321', '111111', '000000', '123123', '121212', '112233', '159753',
  '696969', '666666', '777777', '888888', '999999', '555555', '222222', '333333',
  '444444', '1234567', '12345678', '123456789', '1234567890', '987654321', '147258',
]);

function isSequential(pin: string): boolean {
  let asc = true;
  let desc = true;
  for (let i = 1; i < pin.length; i++) {
    const d = pin.charCodeAt(i) - pin.charCodeAt(i - 1);
    if (d !== 1) asc = false;
    if (d !== -1) desc = false;
  }
  return asc || desc;
}

/** True when a PIN is short or trivially guessable. */
export function isWeakPin(pin: string): boolean {
  if (!pin || pin.length < PIN_MIN_LENGTH) return true;
  if (/^(.)\1+$/.test(pin)) return true; // 000000
  if (isSequential(pin)) return true; // 123456 / 987654
  if (/^(\d\d)\1+$/.test(pin) || /^(\d\d\d)\1+$/.test(pin)) return true; // 121212 / 123123
  return COMMON_PINS.has(pin);
}

/** Validation for a *new* PIN set from the dashboard. Returns an error message or null. */
export function validateNewPin(pin: string): string | null {
  if (!/^\d+$/.test(pin)) return 'PIN must contain digits only.';
  if (pin.length < PIN_MIN_LENGTH || pin.length > PIN_MAX_LENGTH) {
    return `PIN must be ${PIN_MIN_LENGTH}–${PIN_MAX_LENGTH} digits.`;
  }
  if (isWeakPin(pin)) return 'That PIN is too easy to guess (repeated, sequential or common).';
  return null;
}

/* -------------------------------------------------------------------------- */
/* Tokens                                                                      */
/* -------------------------------------------------------------------------- */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Non-reversible identifier for an IP (used for contact-form throttling). */
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`nd-contact:${ip}`).digest('hex').slice(0, 32);
}

/* -------------------------------------------------------------------------- */
/* Request helpers                                                             */
/* -------------------------------------------------------------------------- */
export function getClientIp(headers: Headers): string {
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}
