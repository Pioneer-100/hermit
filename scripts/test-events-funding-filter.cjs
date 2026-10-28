const test = require('node:test');
const assert = require('node:assert/strict');

const article = (overrides = {}) => ({
  headline: '',
  summary: '',
  sector: '',
  project_or_event_name: '',
  article_type: '',
  deadline: null,
  ...overrides
});

test('events and funding filters only include actionable clean-energy opportunities', async (t) => {
  const {
    isActionableEnergyOpportunity,
    isFundingOpportunity
  } = await import('../src/lib/events-funding-filter.ts');
  const now = new Date('2026-03-14T12:00:00Z');

  await t.test('rejects generic finance news mentioning renewable energy', () => {
    assert.equal(isActionableEnergyOpportunity(article({
      headline: 'Bank finances a renewable energy company',
      summary: 'The company received a loan to expand operations.'
    }), now), false);
  });

  await t.test('rejects generic event coverage without upcoming participation', () => {
    assert.equal(isActionableEnergyOpportunity(article({
      headline: 'Solar conference brings industry leaders together',
      summary: 'The conference discussed recent solar energy investments.'
    }), now), false);
  });

  await t.test('accepts an open solar tender with a future deadline', () => {
    const tender = article({
      headline: 'Solar RFP: applications are open',
      summary: 'Submit a proposal for a solar power generation project.',
      deadline: '2026-04-01'
    });

    assert.equal(isFundingOpportunity(tender, now), true);
    assert.equal(isActionableEnergyOpportunity(tender, now), true);
  });

  await t.test('rejects an expired clean-energy tender', () => {
    assert.equal(isActionableEnergyOpportunity(article({
      headline: 'Wind energy tender',
      summary: 'The call for proposals is open.',
      deadline: '2026-03-01'
    }), now), false);
  });

  await t.test('accepts a genuinely upcoming renewable-energy summit', () => {
    assert.equal(isActionableEnergyOpportunity(article({
      headline: 'African renewable energy summit to be held in June',
      summary: 'Registration is open for industry participants.'
    }), now), true);
  });

  await t.test('rejects unrelated upcoming conferences', () => {
    assert.equal(isActionableEnergyOpportunity(article({
      headline: 'Upcoming finance conference registration is open'
    }), now), false);
  });
});
