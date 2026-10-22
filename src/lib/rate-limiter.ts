export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Token bucket in-memory rate limiter per IP / identifier.
 * Default: 30 requests per minute with burst up to maxCapacity.
 */
export function checkRateLimit(
  identifier: string,
  maxCapacity: number = 30,
  refillRatePerSec: number = 0.5
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: maxCapacity, lastRefill: now };
    buckets.set(identifier, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(maxCapacity, bucket.tokens + elapsedSec * refillRatePerSec);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetSeconds: Math.ceil((maxCapacity - bucket.tokens) / refillRatePerSec)
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetSeconds: Math.ceil((1 - bucket.tokens) / refillRatePerSec)
  };
}
