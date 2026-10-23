const test = require('node:test');
const assert = require('node:assert');
const { z } = require('zod');

const AIChatQuerySchema = z.object({
  query: z.string().min(2).max(2000)
});

const AlertDispatchSchema = z.object({
  articleId: z.coerce.number().int().positive()
});

test('Schema Validation: AIChat query limits', () => {
  assert.strictEqual(AIChatQuerySchema.safeParse({ query: 'What is Kariba dam level?' }).success, true);
  assert.strictEqual(AIChatQuerySchema.safeParse({ query: '' }).success, false);
  assert.strictEqual(AIChatQuerySchema.safeParse({ query: 'x'.repeat(2500) }).success, false);
});

test('Schema Validation: Alert dispatch coercion', () => {
  const result = AlertDispatchSchema.safeParse({ articleId: '42' });
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.articleId, 42);
  }
  assert.strictEqual(AlertDispatchSchema.safeParse({ articleId: '-1' }).success, false);
});
