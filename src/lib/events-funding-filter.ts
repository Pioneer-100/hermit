import type { Article } from '@/types';

const ENERGY_TOPIC_PATTERN = /\b(?:renewable energy|clean energy|solar|photovoltaic|hydropower|hydroelectric|wind energy|wind power|battery storage|bess|independent power producer|ippaz?|power purchase agreement|electricity|power generation|power grid|mini[- ]grids?|waste[- ]to[- ]energy|biogas|anaerobic digestion|circular economy|e-waste|electronic waste|resource recovery|food[- ]water[- ]energy|solar irrigation|energy access|energy transition)\b/i;

const FUNDING_OPPORTUNITY_PATTERN = /\b(?:call for (?:proposals|applications|bids)|request for proposals|rfp|expression of interest|eoi|tender(?:s)?|invitation to bid|procurement (?:notice|opportunit|call)|funding (?:opportunit|call|window) (?:is )?(?:open|available|accepting)|grant (?:opportunit|call|application|window) (?:is )?(?:open|available|accepting)|applications? (?:are )?open|now accepting applications|accepting (?:proposals|applications)|apply now|submit (?:a )?(?:proposal|application|bid)|application deadline|funding deadline|open to applications|financing window (?:is )?(?:open|available))\b/i;

const INDUSTRY_EVENT_PATTERN = /\b(?:conference|summit|workshop|symposium|expo|exhibition|webinar|industry forum|stakeholder forum|energy forum)\b/i;

const UPCOMING_EVENT_PATTERN = /\b(?:upcoming|will be held|to be held|scheduled (?:for|to)|set to take place|takes place|registration (?:is )?open|register now|registration deadline|will host|to host|announced .{0,80}(?:conference|summit|workshop|symposium|expo|forum))\b/i;

function getArticleOpportunityText(article: Article): string {
  return [
    article.headline,
    article.summary,
    article.sector,
    article.project_or_event_name,
    article.article_type
  ].filter(Boolean).join(' ');
}

function hasFutureDeadline(article: Article, today: string): boolean {
  if (!article.deadline) return false;
  const parsedDate = new Date(article.deadline);
  if (Number.isNaN(parsedDate.getTime())) return false;
  return parsedDate.toISOString().slice(0, 10) >= today;
}

function hasExpiredDeadline(article: Article, today: string): boolean {
  if (!article.deadline) return false;
  const parsedDate = new Date(article.deadline);
  if (Number.isNaN(parsedDate.getTime())) return false;
  return parsedDate.toISOString().slice(0, 10) < today;
}

export function isFundingOpportunity(article: Article, now = new Date()): boolean {
  const text = getArticleOpportunityText(article);
  if (!ENERGY_TOPIC_PATTERN.test(text)) return false;

  const today = now.toISOString().slice(0, 10);
  if (hasExpiredDeadline(article, today)) return false;

  return FUNDING_OPPORTUNITY_PATTERN.test(text);
}

export function isActionableEnergyOpportunity(article: Article, now = new Date()): boolean {
  const text = getArticleOpportunityText(article);
  if (!ENERGY_TOPIC_PATTERN.test(text)) return false;

  if (isFundingOpportunity(article, now)) return true;

  const today = now.toISOString().slice(0, 10);
  if (hasExpiredDeadline(article, today)) return false;

  return INDUSTRY_EVENT_PATTERN.test(text) &&
    (hasFutureDeadline(article, today) || UPCOMING_EVENT_PATTERN.test(text));
}
