// Simple in-memory rate limiter for GitHub API calls
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private lastCleanup: number = Date.now();
  private cleanupIntervalMs: number = 5 * 60 * 1000; // 5 minutes

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs; // 1 minute
    this.maxRequests = maxRequests; // 60 requests per minute
  }

  isAllowed(key: string): boolean {
    // Lazy cleanup — only run every 5 minutes
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupIntervalMs) {
      this.cleanup();
      this.lastCleanup = now;
    }

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = rateLimitStore.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = rateLimitStore.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const githubRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute

