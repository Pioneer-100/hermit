'use client';

/**
 * SilentCrawler — DISABLED
 *
 * Client-side crawling has been replaced by server-side Vercel Cron jobs
 * defined in vercel.json. This ensures:
 *
 * - Data stays fresh independent of user logins (no session tokens burned)
 * - Single crawl execution regardless of how many users are online
 * - Predictable schedule aligned to Zimbabwe business hours
 *
 * The cron calls /api/crawl using CRON_SECRET (Authorization: Bearer),
 * which is automatically injected by Vercel when CRON_SECRET is set in
 * the project environment variables.
 *
 * Manual crawl triggering remains available via the CrawlModal (requires login).
 */
export default function SilentCrawler() {
  return null;
}
