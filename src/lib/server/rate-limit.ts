import { AppError } from '@/lib/server/errors';

type Bucket = {
  count: number;
  resetAt: number;
};

// Note: this in-memory limiter is process-local and resets on restart.
// Use a shared store (e.g., Redis) for distributed/production deployments.
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

export function __resetRateLimitForTests() {
  buckets.clear();
}
