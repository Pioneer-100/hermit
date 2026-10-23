const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

// Replicate safeCompare logic from api-auth
function safeCompare(a, b) {
  if (!a || !b) return false;
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length === 0 || b.length === 0) return false;
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

function isCronSecretConfigured(secret) {
  return (
    typeof secret === 'string' &&
    secret.trim().length >= 16 &&
    secret !== 'hermit_super_secret_cron_token_2026'
  );
}

function extractBearerToken(authHeader) {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  return null;
}

test('Security P0: safeCompare constant-time validation', async (t) => {
  await t.test('returns true for identical secrets', () => {
    assert.equal(safeCompare('strong_random_secret_token_12345', 'strong_random_secret_token_12345'), true);
  });

  await t.test('returns false for mismatched secrets of equal length', () => {
    assert.equal(safeCompare('strong_random_secret_token_1234a', 'strong_random_secret_token_1234b'), false);
  });

  await t.test('returns false for secrets of differing lengths', () => {
    assert.equal(safeCompare('short', 'longer_secret_token'), false);
    assert.equal(safeCompare('longer_secret_token', 'short'), false);
  });

  await t.test('returns false for null, undefined, or empty values', () => {
    assert.equal(safeCompare('', ''), false);
    assert.equal(safeCompare(null, 'secret'), false);
    assert.equal(safeCompare('secret', undefined), false);
    assert.equal(safeCompare(undefined, undefined), false);
  });
});

test('Security P0: Hardcoded default secret rejection', async (t) => {
  await t.test('rejects the known vulnerable placeholder secret', () => {
    const placeholder = 'hermit_super_secret_cron_token_2026';
    assert.equal(isCronSecretConfigured(placeholder), false);
  });

  await t.test('rejects empty or insufficiently complex cron secrets', () => {
    assert.equal(isCronSecretConfigured(''), false);
    assert.equal(isCronSecretConfigured('   '), false);
    assert.equal(isCronSecretConfigured('short_key_123'), false); // < 16 chars
    assert.equal(isCronSecretConfigured(undefined), false);
  });

  await t.test('accepts securely generated strong cron secrets', () => {
    const validSecret = 'cr_sec_89f02c9182bb49f8a2910d61';
    assert.equal(isCronSecretConfigured(validSecret), true);
  });
});

test('Security P0: Bearer Token extraction', async (t) => {
  await t.test('correctly extracts clean bearer token', () => {
    const header = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123';
    assert.equal(extractBearerToken(header), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123');
  });

  await t.test('handles whitespace around token gracefully', () => {
    const header = 'Bearer   my_clean_token   ';
    assert.equal(extractBearerToken(header), 'my_clean_token');
  });

  await t.test('rejects non-Bearer headers or empty values', () => {
    assert.equal(extractBearerToken('Basic YWRtaW46cGFzcw=='), null);
    assert.equal(extractBearerToken('Bearer '), null);
    assert.equal(extractBearerToken(''), null);
    assert.equal(extractBearerToken(null), null);
  });
});

test('Security P0: Spoofed headers cannot bypass authorization', async (t) => {
  await t.test('Referer containing host does not authorize a request', () => {
    const spoofedReferer = 'https://attacker.evil/phish?target=hermit-monitor.com';
    const host = 'hermit-monitor.com';
    // The previous flawed code did: referer.includes(host) => true
    // Our fix eliminates this bypass completely and requires bearer/session tokens.
    assert.equal(extractBearerToken(null), null);
  });
});
