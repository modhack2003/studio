import { generateSessionToken, validateSessionToken, verifyPin, checkLoginRateLimit, recordFailedLogin, clearLoginAttempts } from '../auth';

describe('Auth Utilities', () => {
  describe('Session Token', () => {
    it('generates a valid session token that passes verification', () => {
      const token = generateSessionToken();
      expect(typeof token).toBe('string');
      expect(validateSessionToken(token)).toBe(true);
    });

    it('rejects invalid or tampered tokens', () => {
      expect(validateSessionToken('')).toBe(false);
      expect(validateSessionToken('invalid:token')).toBe(false);
      expect(validateSessionToken('nonce:timestamp:forgedhmac')).toBe(false);
    });
  });

  describe('PIN Verification', () => {
    it('correctly verifies matching PIN', () => {
      expect(verifyPin('1234', '1234')).toBe(true);
    });

    it('rejects incorrect PIN', () => {
      expect(verifyPin('1234', '5678')).toBe(false);
      expect(verifyPin('123', '1234')).toBe(false);
      expect(verifyPin('', '1234')).toBe(false);
    });
  });

  describe('Rate Limiter for Login', () => {
    const testIp = '192.168.1.99';

    afterEach(() => {
      clearLoginAttempts(testIp);
    });

    it('allows initial login attempts', () => {
      expect(checkLoginRateLimit(testIp).allowed).toBe(true);
    });

    it('locks out after max failed attempts', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedLogin(testIp);
      }
      const check = checkLoginRateLimit(testIp);
      expect(check.allowed).toBe(false);
      expect(check.retryAfterMs).toBeGreaterThan(0);
    });

    it('clears failed attempts on successful login', () => {
      for (let i = 0; i < 4; i++) {
        recordFailedLogin(testIp);
      }
      clearLoginAttempts(testIp);
      expect(checkLoginRateLimit(testIp).allowed).toBe(true);
    });
  });
});
