import type { Article } from '@/types';

const NEXUS_SUBJECT_PATTERN = /\b(?:food[- ]water[- ]energy nexus|water[- ]energy nexus|circular economy|e[- ]waste|electronic waste|waste[- ]to[- ]energy|waste[- ]to[- ]power|refuse[- ]derived fuel|landfill gas|biogas|anaerobic digestion|resource recovery|materials recovery|wastewater treatment|water reuse|solar irrigation|solar[- ]powered irrigation|solar[- ]powered water pumping)\b/i;
const SOLAR_IRRIGATION_PATTERN = /\bsolar\b.{0,60}\birrigation\b|\birrigation\b.{0,60}\bsolar\b/i;
const WATER_POWER_PATTERN = /\b(?:kariba|zinwa|dam levels?|reservoir levels?|live storage|water storage)\b.{0,100}\b(?:hydropower|hydro-power|power generation|electricity)\b|\b(?:hydropower|hydro-power|power generation|electricity)\b.{0,100}\b(?:kariba|zinwa|dam levels?|reservoir levels?|live storage|water storage)\b/i;
const KARIBA_WATER_PATTERN = /\bkariba\b.{0,80}\b(?:dam|reservoir|water levels?|live storage|storage levels?)\b|\b(?:dam|reservoir|water levels?|live storage|storage levels?)\b.{0,80}\bkariba\b/i;

export function isRelevantNexusArticle(article: Article): boolean {
  const text = [
    article.headline,
    article.summary,
    article.sector,
    article.project_or_event_name
  ].filter(Boolean).join(' ');

  return NEXUS_SUBJECT_PATTERN.test(text) ||
    SOLAR_IRRIGATION_PATTERN.test(text) ||
    WATER_POWER_PATTERN.test(text) ||
    KARIBA_WATER_PATTERN.test(text);
}
