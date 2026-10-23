/**
 * Direct Portal Scrapers
 * Specialized direct HTML scrapers for Zimbabwean institutional authorities
 * where RSS feeds are frequently broken, absent, or delayed.
 */

import { logger } from './logger';

export interface ScrapedPortalItem {
  headline: string;
  link: string;
  summary: string;
  pubDate?: string;
  sourceName: string;
}

/**
 * Normalizes relative URLs to absolute links
 */
function resolveUrl(baseUrl: string, relativePath: string): string {
  try {
    return new URL(relativePath, baseUrl).href;
  } catch {
    return relativePath;
  }
}

/**
 * Standard realistic browser headers to prevent anti-bot 403 blocks
 */
export const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

/**
 * Scrapes ZERA (Zimbabwe Energy Regulatory Authority) official notices & press releases
 */
export async function scrapeZeraPortal(): Promise<ScrapedPortalItem[]> {
  const zeraUrl = 'https://www.zera.co.zw/notices/';
  const results: ScrapedPortalItem[] = [];

  try {
    const res = await fetch(zeraUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) return results;

    const html = await res.text();

    // Regex to extract anchor titles and links from common WordPress / institutional notice layouts
    // Matches patterns like <a href="https://.../notice-..." ...>Headline</a> or <h3 ...><a href="...">...</a></h3>
    const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    const seenLinks = new Set<string>();

    while ((match = anchorRegex.exec(html)) !== null) {
      const rawHref = match[1];
      const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();

      if (!rawTitle || rawTitle.length < 15 || rawTitle.length > 200) continue;

      const link = resolveUrl(zeraUrl, rawHref);
      if (seenLinks.has(link)) continue;

      const lower = rawTitle.toLowerCase();
      // Only keep notices with regulatory energy significance
      if (
        lower.includes('tariff') ||
        lower.includes('licence') ||
        lower.includes('license') ||
        lower.includes('si ') ||
        lower.includes('statutory') ||
        lower.includes('solar') ||
        lower.includes('ipp') ||
        lower.includes('consultation') ||
        lower.includes('fuel') ||
        lower.includes('petroleum') ||
        lower.includes('electricity') ||
        lower.includes('notice')
      ) {
        seenLinks.add(link);
        results.push({
          headline: rawTitle,
          link,
          summary: `Official regulatory disclosure released directly on the ZERA (Zimbabwe Energy Regulatory Authority) portal: ${rawTitle}.`,
          pubDate: new Date().toISOString(),
          sourceName: 'ZERA (Zimbabwe Energy Regulatory Authority)'
        });
      }

      if (results.length >= 3) break;
    }
  } catch (err) {
    logger.warn('Direct ZERA portal scrape failed, relying on primary RSS/fallback', { err });
  }

  return results;
}

/**
 * Scrapes PRAZ (Procurement Regulatory Authority of Zimbabwe) for energy tenders
 */
export async function scrapePrazPortal(): Promise<ScrapedPortalItem[]> {
  const prazUrl = 'https://portal.praz.org.zw/tenders';
  const results: ScrapedPortalItem[] = [];

  try {
    const res = await fetch(prazUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) return results;

    const html = await res.text();
    const tenderRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = tenderRowRegex.exec(html)) !== null) {
      const rowContent = rowMatch[1];
      const textOnly = rowContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const lower = textOnly.toLowerCase();

      // Check if row mentions energy, solar, ZESA, ZETDC, transmission, or generator
      if (
        lower.includes('solar') ||
        lower.includes('energy') ||
        lower.includes('zetdc') ||
        lower.includes('zesa') ||
        lower.includes('transmission') ||
        lower.includes('power') ||
        lower.includes('substation') ||
        lower.includes('transformer') ||
        lower.includes('battery')
      ) {
        const linkMatch = /href=["']([^"']+)["']/i.exec(rowContent);
        const link = linkMatch ? resolveUrl(prazUrl, linkMatch[1]) : prazUrl;

        // Extract a clean title (first 120 chars)
        const headline = textOnly.length > 120 ? textOnly.slice(0, 117) + '...' : textOnly;

        results.push({
          headline: `[PRAZ Tender] ${headline}`,
          link,
          summary: `National procurement tender published on PRAZ for Zimbabwean energy and power infrastructure: ${textOnly.slice(0, 300)}`,
          pubDate: new Date().toISOString(),
          sourceName: 'PRAZ (Procurement Regulatory Authority of Zimbabwe)'
        });

        if (results.length >= 2) break;
      }
    }
  } catch (err) {
    logger.warn('Direct PRAZ scrape failed', { err });
  }

  return results;
}
