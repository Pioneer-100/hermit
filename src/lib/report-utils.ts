import { classifyGeographicTier } from './geographic-tiering';

export interface SortableArticleSummary {
  headline?: string;
  relevance_level?: string;
  captured_at?: string;
  publication_date?: string;
  source_link?: string;
  source?: string;
  summary?: string;
  [key: string]: any;
}

/**
 * Sorts report article summaries using the unified multi-factor criteria:
 * 1. Geographic Tier Priority:
 *    - Zimbabwe Domestic: 75% focus (Rank 1)
 *    - Regional (SADC / SAPP): 15% focus (Rank 2)
 *    - Continental / Global: 10% focus (Rank 3)
 * 2. Relevance Level:
 *    - High (Rank 0) > Medium (Rank 1) > Low (Rank 2)
 * 3. Crawl / Captured Recency (Time Crawled):
 *    - Most recently crawled articles placed first (descending timestamp order)
 */
export function sortReportArticleSummaries<T extends SortableArticleSummary>(summaries: T[]): T[] {
  const getTierRank = (item: T): number => {
    const classification = classifyGeographicTier({
      headline: item.headline || '',
      summary: item.summary || '',
      source_name: item.source || '',
      country_market: item.country_market || ''
    });

    switch (classification.tier) {
      case 'zimbabwe':
        return 0; // Highest priority
      case 'regional':
        return 1;
      case 'continental':
      default:
        return 2;
    }
  };

  const getRelevanceRank = (level?: string): number => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 0;
      case 'medium':
        return 1;
      case 'low':
        return 2;
      default:
        return 3;
    }
  };

  const getCrawlTimestamp = (item: T): number => {
    const rawTime = item.captured_at || item.publication_date || item.processed_at;
    if (!rawTime) return 0;
    const time = new Date(rawTime).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  return [...summaries].sort((a, b) => {
    // 1. Geographic Tier (Zimbabwe > SADC Regional > Continental)
    const tierDiff = getTierRank(a) - getTierRank(b);
    if (tierDiff !== 0) return tierDiff;

    // 2. Relevance Level (High > Medium > Low)
    const relDiff = getRelevanceRank(a.relevance_level) - getRelevanceRank(b.relevance_level);
    if (relDiff !== 0) return relDiff;

    // 3. Time Crawled: Newest / most recently crawled first
    const timeA = getCrawlTimestamp(a);
    const timeB = getCrawlTimestamp(b);
    return timeB - timeA;
  });
}
