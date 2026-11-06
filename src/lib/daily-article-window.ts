import { Article } from '@/types';

const harareDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Harare',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export function getHarareDateKey(date: Date): string {
  const parts = harareDateFormatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to determine the current date in Africa/Harare');
  }

  return `${year}-${month}-${day}`;
}

/**
 * Filters articles strictly for the current day's crawl window (Africa/Harare time zone).
 * 
 * Requirements:
 * - Only includes articles crawled on THAT SPECIFIC DAY (`captured_at` on today's date in Africa/Harare).
 * - Excludes articles crawled yesterday or earlier.
 * - Falls back to `processed_at` or `publication_date` only if `captured_at` is missing.
 */
export function filterArticlesForDailyWindow(articles: Article[], now = new Date()): Article[] {
  const todayKey = getHarareDateKey(now);

  return articles.filter(article => {
    // Primary criteria: when the article was crawled into HERMIT
    const crawlDate = article.captured_at || article.processed_at || article.publication_date;
    if (!crawlDate) return false;

    const parsedDate = new Date(crawlDate);
    if (Number.isNaN(parsedDate.getTime())) return false;

    // Strict same-day match (Africa/Harare calendar day)
    return getHarareDateKey(parsedDate) === todayKey;
  });
}

/**
 * Returns the exact start of today in Africa/Harare timezone (00:00:00.000).
 */
export function getDailyWindowStart(now = new Date()): Date {
  const todayKey = getHarareDateKey(now);
  return new Date(`${todayKey}T00:00:00+02:00`);
}
