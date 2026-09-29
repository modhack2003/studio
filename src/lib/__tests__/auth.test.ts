import {
  generateSessionToken,
  getClientIp,
  hashPin,
  hashToken,
  isWeakPin,
  validateNewPin,
  verifyPin,
  verifyPinHash,
} from '../auth';

describe('Auth Utilities', () => {
  describe('Session token', () => {
    it('generates unique random tokens', () => {
      const a = generateSessionToken();
      const b = generateSessionToken();
      expect(a).not.toBe(b);
      expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it('hashes tokens deterministically', () => {
      const t = generateSessionToken();
      expect(hashToken(t)).toBe(hashToken(t));
      expect(hashToken(t)).toHaveLength(64);
    });
  });

  describe('PIN verification (env fallback)', () => {
    it('correctly verifies matching PIN', () => {
      expect(verifyPin('482915', '482915')).toBe(true);
    });

    it('rejects incorrect PIN', () => {
      expect(verifyPin('482915', '482916')).toBe(false);
      expect(verifyPin('48291', '482915')).toBe(false);
      expect(verifyPin('', '482915')).toBe(false);
    });
  });

  describe('PIN hashing', () => {
    it('verifies a hashed PIN and rejects others', () => {
      const stored = hashPin('730419');
      expect(stored.startsWith('scrypt$')).toBe(true);
      expect(verifyPinHash('730419', stored)).toBe(true);
      expect(verifyPinHash('730418', stored)).toBe(false);
      expect(verifyPinHash('730419', 'garbage')).toBe(false);
    });
  });

  describe('PIN policy', () => {
    it('flags weak PINs', () => {
      expect(isWeakPin('1234')).toBe(true);
      expect(isWeakPin('123456')).toBe(true);
      expect(isWeakPin('987654')).toBe(true);
      expect(isWeakPin('000000')).toBe(true);
      expect(isWeakPin('121212')).toBe(true);
      expect(isWeakPin('730419')).toBe(false);
    });

    it('validates new PINs', () => {
      expect(validateNewPin('abc123')).toMatch(/digits only/);
      expect(validateNewPin('12345')).toMatch(/6–12 digits/);
      expect(validateNewPin('111111')).toMatch(/too easy/);
      expect(validateNewPin('730419')).toBeNull();
    });
  });

  describe('Client IP', () => {
    it('prefers x-real-ip, then the first x-forwarded-for entry', () => {
      expect(getClientIp(new Headers({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1');
      expect(getClientIp(new Headers({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' }))).toBe('3.3.3.3');
      expect(getClientIp(new Headers())).toBe('unknown');
    });
  });
});
