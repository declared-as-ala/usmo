import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from '../rate-limit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to the limit then blocks', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter.check('ip:1').allowed).toBe(true);
    expect(limiter.check('ip:1').allowed).toBe(true);
    expect(limiter.check('ip:1').allowed).toBe(true);
    const fourth = limiter.check('ip:1');
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.check('ip:1').allowed).toBe(true);
    expect(limiter.check('ip:2').allowed).toBe(true);
    expect(limiter.check('ip:1').allowed).toBe(false);
  });

  it('resets after the window elapses', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.check('ip:1').allowed).toBe(true);
    expect(limiter.check('ip:1').allowed).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(limiter.check('ip:1').allowed).toBe(true);
  });

  it('evicts oldest keys beyond maxKeys instead of growing unbounded', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    limiter.check('a');
    limiter.check('b');
    limiter.check('c'); // evicts 'a'
    // 'a' was evicted, so it gets a fresh window
    expect(limiter.check('a').allowed).toBe(true);
  });
});
