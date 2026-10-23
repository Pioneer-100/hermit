export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const localBuckets = new Map<string, Bucket>();

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && !url.includes('example') && !token.includes('...')) {
    return { url, token };
  }
  return null;
}

/**
 * Universal rate-limiter:
 * - If Upstash Redis is configured, uses atomic distributed sliding window INCR + EXPIRE.
 * - Otherwise, falls back to in-memory Token Bucket for local dev/demo.
 */
export async function checkDistributedRateLimit(
  identifier: string,
  maxCapacity: number = 30,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const upstash = getUpstashConfig();

  if (upstash) {
    try {
      const key = `ratelimit:${identifier}`;
      // Execute INCR via REST
      const res = await fetch(`${upstash.url}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstash.token}` },
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        const json = await res.json();
        const currentCount = Number(json.result) || 1;

        if (currentCount === 1) {
          // Set TTL on key creation
          await fetch(`${upstash.url}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
            headers: { Authorization: `Bearer ${upstash.token}` },
            signal: AbortSignal.timeout(1500)
          });
        }

        const allowed = currentCount <= maxCapacity;
        return {
          allowed,
          remaining: Math.max(0, maxCapacity - currentCount),
          resetSeconds: windowSeconds
        };
      }
    } catch (err) {
      console.warn('Distributed rate limit check failed, falling back to local bucket:', err);
    }
  }

  // Local in-memory Token Bucket fallback
  return checkRateLimit(identifier, maxCapacity, maxCapacity / windowSeconds);
}

/**
 * Synchronous local Token Bucket rate-limiter for compatibility
 */
export function checkRateLimit(
  identifier: string,
  maxCapacity: number = 30,
  refillRatePerSec: number = 0.5
): RateLimitResult {
  const now = Date.now();
  let bucket = localBuckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: maxCapacity, lastRefill: now };
    localBuckets.set(identifier, bucket);
  }

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
