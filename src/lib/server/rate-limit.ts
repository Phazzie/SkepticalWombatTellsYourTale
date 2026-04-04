import { AppError } from '@/lib/server/errors';

type Bucket = {
  count: number;
  resetAt: number;
};

// Note: this in-memory limiter is process-local and resets on restart.
// Use a shared store (e.g., Redis) for distributed/production deployments.
const buckets = new Map<string, Bucket>();

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new AppError(429, 'Too many requests');
  }

  bucket.count += 1;
}
