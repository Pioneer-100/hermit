const test = require('node:test');
const assert = require('node:assert');

// Direct schema contract validation without external dependency
function validateAIChatQuery(query) {
  if (typeof query !== 'string') return false;
  const trimmed = query.trim();
  return trimmed.length >= 2 && trimmed.length <= 2000;
}

function validateAlertDispatch(payload) {
  const num = Number(payload?.articleId);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

test('Schema Validation: AIChat query limits', () => {
  assert.strictEqual(validateAIChatQuery('What is Kariba dam level?'), true);
  assert.strictEqual(validateAIChatQuery(''), false);
  assert.strictEqual(validateAIChatQuery('x'.repeat(2500)), false);
});

test('Schema Validation: Alert dispatch coercion', () => {
  assert.strictEqual(validateAlertDispatch({ articleId: '42' }), true);
  assert.strictEqual(validateAlertDispatch({ articleId: 42 }), true);
  assert.strictEqual(validateAlertDispatch({ articleId: '-1' }), false);
  assert.strictEqual(validateAlertDispatch({ articleId: 'invalid' }), false);
});
