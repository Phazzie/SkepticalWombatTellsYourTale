import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '@/lib/server/errors';

function withFakeNow<T>(now: number, fn: () => T): T {
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    return fn();
  } finally {
    Date.now = originalNow;
  }
}

async function loadRateLimitModule(unique: string) {
  return import(`@/lib/server/rate-limit?test=${unique}`);
}

test('enforceRateLimit allows requests up to limit and blocks over limit', async () => {
  const { enforceRateLimit } = await loadRateLimitModule('basic');

  withFakeNow(1000, () => {
    enforceRateLimit('k1', 2, 1000);
    enforceRateLimit('k1', 2, 1000);
    assert.throws(
      () => enforceRateLimit('k1', 2, 1000),
      (error: unknown) => error instanceof AppError && error.status === 429
    );
  });
});

test('enforceRateLimit resets counter after window expires', async () => {
  const { enforceRateLimit } = await loadRateLimitModule('window-reset');

  withFakeNow(1000, () => {
    enforceRateLimit('k2', 1, 1000);
    assert.throws(() => enforceRateLimit('k2', 1, 1000), /Too many requests/);
  });

  withFakeNow(2001, () => {
    assert.doesNotThrow(() => enforceRateLimit('k2', 1, 1000));
  });
});

test('enforceRateLimit evicts oldest bucket when capacity reached', async () => {
  const { enforceRateLimit } = await loadRateLimitModule('evict-oldest');

  withFakeNow(1000, () => {
    for (let index = 0; index < 5000; index += 1) {
      enforceRateLimit(`bucket-${index}`, 1, 100000 + index);
    }

    // This insert should evict bucket-0 (oldest resetAt),
    // making a subsequent call to bucket-0 behave like a fresh bucket.
    enforceRateLimit('bucket-new', 1, 100000);
    assert.doesNotThrow(() => enforceRateLimit('bucket-0', 1, 100000));
  });
});
