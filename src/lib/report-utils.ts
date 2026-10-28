export function sortReportArticleSummaries<T extends { relevance_level?: string }>(summaries: T[]): T[] {
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

  return [...summaries].sort((a, b) => getRelevanceRank(a.relevance_level) - getRelevanceRank(b.relevance_level));
}
