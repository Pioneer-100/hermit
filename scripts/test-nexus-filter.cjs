/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');

const article = (overrides = {}) => ({
  headline: '',
  summary: '',
  sector: '',
  project_or_event_name: '',
  article_type: 'general',
  ...overrides
});

test('Nexus tracker includes direct Nexus and circular-economy coverage only', async (t) => {
  const { isRelevantNexusArticle } = await import('../src/lib/nexus-filter.ts');

  await t.test('rejects generic water stories', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Water shortages affect households',
      summary: 'Authorities plan to improve water access.'
    })), false);
  });

  await t.test('rejects generic hydropower coverage', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Hydropower output rises in the region'
    })), false);
  });

  await t.test('does not trust a nexus category without relevant content', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'New infrastructure investment announced',
      article_type: 'nexus'
    })), false);
  });

  await t.test('rejects incidental matches found only in raw article text', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Company announces new manufacturing site',
      summary: 'The site will create jobs.',
      raw_content: 'Its circular economy initiative was mentioned by a speaker.'
    })), false);
  });

  await t.test('accepts a direct circular-economy report', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Circular economy project expands resource recovery',
      summary: 'The program will recover materials from municipal waste.'
    })), true);
  });

  await t.test('accepts a waste-to-energy project', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Municipal waste-to-energy project begins operations'
    })), true);
  });

  await t.test('accepts a solar-powered irrigation update', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Farmers adopt solar irrigation systems'
    })), true);
  });

  await t.test('accepts a water and hydropower nexus update', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Kariba live storage levels affect hydropower generation'
    })), true);
  });

  await t.test('accepts a Kariba reservoir update without a generic water match', () => {
    assert.equal(isRelevantNexusArticle(article({
      headline: 'Kariba reservoir levels continue to decline'
    })), true);
  });
});
