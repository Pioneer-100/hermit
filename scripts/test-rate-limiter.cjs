const test = require('node:test');
const assert = require('node:assert');

// In-memory token bucket implementation under test
const buckets = new Map();

function checkRateLimit(identifier, maxCapacity = 30, refillRatePerSec = 0.5) {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: maxCapacity, lastRefill: now };
    buckets.set(identifier, bucket);
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

test('Rate Limiter: Allows initial requests within capacity', () => {
  const res = checkRateLimit('user_allow_test', 5, 1);
  assert.strictEqual(res.allowed, true);
  assert.strictEqual(res.remaining, 4);
});

test('Rate Limiter: Throttles when capacity is exhausted', () => {
  const id = 'user_throttle_test';
  checkRateLimit(id, 2, 0.1);
  checkRateLimit(id, 2, 0.1);
  const third = checkRateLimit(id, 2, 0.1);
  assert.strictEqual(third.allowed, false);
  assert.strictEqual(third.remaining, 0);
  assert.ok(third.resetSeconds > 0);
});
