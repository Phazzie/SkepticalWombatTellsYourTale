import { AppError } from '@/lib/server/errors';
import { log } from '@/lib/server/logger';

// In a real Vercel production app, you would use @upstash/redis or Vercel KV here.
// For the sake of this codebase audit, we simulate a robust interface and
// log a warning that it's an in-memory fallback.
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  log('warn', 'Using in-memory rate limiter in production. This will not work across serverless edge nodes. Swap to Redis/KV.');
}

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function evictExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function evictOldestBucket() {
  let oldestKey: string | null = null;
  let oldestResetAt = Number.POSITIVE_INFINITY;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < oldestResetAt) {
      oldestResetAt = bucket.resetAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    buckets.delete(oldestKey);
  }
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  evictExpiredBuckets(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      evictOldestBucket();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new AppError(429, 'Too many requests');
  }

  bucket.count += 1;
}

export function resetRateLimitForTests() {
  buckets.clear();
}
