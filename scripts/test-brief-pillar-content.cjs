/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');

const article = (overrides = {}) => ({
  id: 1,
  publication_date: '2026-10-28',
  headline: 'Solar project update',
  source_id: null,
  source_name: 'Energy News',
  author: null,
  summary: 'A new solar project has been announced.',
  key_stakeholders: [],
  relevance_to_hermit: 'The project could affect Hermit commercial positioning.',
  source_link: 'https://example.com/article',
  relevance_score: 0.85,
  relevance_level: 'high',
  article_type: 'project_update',
  ai_summary: '',
  ai_impact_note: '',
  is_reviewed: false,
  is_alert_sent: false,
  captured_at: '2026-10-28T10:00:00Z',
  processed_at: null,
  ...overrides
});

test('Executive Briefing pillars use a capped article summary and concise commercial impact', async () => {
  const { synthesizeDailyBriefFromArticles } = await import('../src/lib/brief-generator.ts');
  const longSummary = Array.from({ length: 270 }, (_, index) => `fact${index}`).join(' ');
  const longImpact = 'This development may improve Hermit project economics financing access market positioning and expected revenues across regional renewable energy operations and future investment pipeline decisions.';
  const brief = synthesizeDailyBriefFromArticles([article({
    ai_summary: longSummary,
    ai_impact_note: longImpact
  })]);
  const pillar = brief.strategic_pillars[0];

  assert.equal(pillar.impact.split(/\s+/).length, 250);
  assert.equal(pillar.takeaway.split(/\s+/).length, 20);
});

test('brief generator supplies a 15-20 word commercial-impact fallback when the stored impact is too short', async () => {
  const { synthesizeDailyBriefFromArticles } = await import('../src/lib/brief-generator.ts');
  const brief = synthesizeDailyBriefFromArticles([article({
    ai_summary: 'A factual summary.',
    ai_impact_note: 'May improve pipeline.'
  })]);
  const impactWordCount = brief.strategic_pillars[0].takeaway.split(/\s+/).length;

  assert.ok(impactWordCount >= 15 && impactWordCount <= 20);
});
