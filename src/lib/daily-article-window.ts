import { Article } from '@/types';

const harareDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Harare',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function getHarareDateKey(date: Date): string {
  const parts = harareDateFormatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to determine the current date in Africa/Harare');
  }

  return `${year}-${month}-${day}`;
}

export function filterArticlesForDailyWindow(articles: Article[], now = new Date()): Article[] {
  const today = getHarareDateKey(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterday = getHarareDateKey(yesterdayDate);
  const acceptedDates = new Set([today, yesterday]);

  return articles.filter(article => {
    const articleDate = article.publication_date || article.captured_at;
    if (!articleDate) return false;

    const parsedDate = new Date(articleDate);
    if (Number.isNaN(parsedDate.getTime())) return false;

    return acceptedDates.has(getHarareDateKey(parsedDate));
  });
}

export function getDailyWindowStart(now = new Date()): Date {
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return new Date(`${getHarareDateKey(yesterdayDate)}T00:00:00+02:00`);
}
