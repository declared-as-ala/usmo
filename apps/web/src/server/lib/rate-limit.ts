/**
 * Fixed-window in-memory rate limiter (per server instance).
 * Good enough for a single-instance deployment; the `RateLimiter` interface
 * is the seam where a Redis-backed implementation plugs in later.
 * See docs/security.md §5 for the per-endpoint budgets.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

interface Window {
  count: number;
  windowStart: number;
}

export function createRateLimiter(options: {
  /** Max requests per window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
  /** Cap on tracked keys to bound memory; oldest evicted first. */
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs, maxKeys = 10_000 } = options;
  const windows = new Map<string, Window>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      let win = windows.get(key);

      if (!win || now - win.windowStart >= windowMs) {
        win = { count: 0, windowStart: now };
        // refresh insertion order so eviction below is oldest-first
        windows.delete(key);
        windows.set(key, win);
      }

      if (windows.size > maxKeys) {
        const oldest = windows.keys().next().value;
        if (oldest !== undefined && oldest !== key) windows.delete(oldest);
      }

      win.count += 1;
      const resetAt = win.windowStart + windowMs;
      if (win.count > limit) {
        return { allowed: false, remaining: 0, resetAt };
      }
      return { allowed: true, remaining: limit - win.count, resetAt };
    },
  };
}

/**
 * Named limiters shared across the app. Kept on globalThis so Next.js dev-mode
 * module reloads don't reset counters.
 */
const globalStore = globalThis as unknown as { __usmRateLimiters?: Map<string, RateLimiter> };
const limiters = (globalStore.__usmRateLimiters ??= new Map<string, RateLimiter>());

export function getRateLimiter(name: string, options: { limit: number; windowMs: number }): RateLimiter {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = createRateLimiter(options);
    limiters.set(name, limiter);
  }
  return limiter;
}
