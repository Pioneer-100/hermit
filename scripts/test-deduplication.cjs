const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateArticleFingerprint(headline, sourceLink) {
  const normalized = normalizeText(headline);
  return crypto.createHash('sha256').update(`${normalized}|${sourceLink || ''}`).digest('hex');
}

function calculateJaccardSimilarity(textA, textB) {
  const wordsA = new Set(normalizeText(textA).split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normalizeText(textB).split(' ').filter(w => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersectionCount++;
  }

  const unionSize = new Set([...wordsA, ...wordsB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

test('Deduplication: Text Normalization', () => {
  const raw = '  ZERA Announces 19% Tariff Hike... For IPPs!!  ';
  const normalized = normalizeText(raw);
  assert.strictEqual(normalized, 'zera announces 19 tariff hike for ipps');
});

test('Deduplication: SHA-256 Fingerprinting', () => {
  const fp1 = generateArticleFingerprint('ZERA Approves Solar', 'https://herald.co.zw/news');
  const fp2 = generateArticleFingerprint('ZERA Approves Solar', 'https://herald.co.zw/news');
  assert.strictEqual(fp1, fp2);
  assert.strictEqual(fp1.length, 64);
});

test('Deduplication: Jaccard Word Similarity', () => {
  const titleA = 'ZERA Approves 19% Increase in Commercial Tariffs for Solar';
  const titleB = 'ZERA Approves 19% Increase in Tariffs for Commercial Solar';
  const similarity = calculateJaccardSimilarity(titleA, titleB);
  assert.ok(similarity > 0.7, `Expected similarity > 0.7, got ${similarity}`);
});
