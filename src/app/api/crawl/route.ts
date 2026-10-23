import { NextRequest, NextResponse } from 'next/server';
import { crawlSource, CrawlResult } from '@/lib/crawler-service';
import { MONITORED_SOURCES } from '@/lib/sources';
import { CrawlRequestSchema } from '@/lib/schemas';
import { authenticateApiRequest } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function verifyAuthorization(req: NextRequest): Promise<{ authorized: boolean; reason?: string }> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  // 1. Check for Bearer token matching CRON_SECRET (automated cron jobs, Vercel crons)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (cronSecret && safeCompare(token, cronSecret)) {
      return { authorized: true, reason: 'cron_secret_bearer' };
    }
  }

  // 2. Check query params for CRON_SECRET token
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret') || searchParams.get('token');
  if (secretParam && cronSecret && safeCompare(secretParam, cronSecret)) {
    return { authorized: true, reason: 'cron_secret_query' };
  }

  // 3. Check for authenticated logged-in dashboard user (interactive UI crawls)
  const userAuth = await authenticateApiRequest(req);
  if (userAuth.isAuthenticated) {
    return { authorized: true, reason: 'user_authenticated' };
  }

  // 4. Same-origin browser request validation (UI button trigger fallback)
  const host = req.headers.get('host') || '';
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';
  const secFetchSite = req.headers.get('sec-fetch-site');

  if (
    (host && referer.includes(host)) ||
    (host && origin.includes(host)) ||
    secFetchSite === 'same-origin'
  ) {
    return { authorized: true, reason: 'same_origin_ui' };
  }

  // 5. In local development or if CRON_SECRET is unconfigured/default
  if (!cronSecret || cronSecret === 'hermit_super_secret_cron_token_2026') {
    return { authorized: true, reason: 'dev_default_fallback' };
  }

  return { authorized: false, reason: 'Invalid or missing credentials' };
}

async function handleCrawl(req: NextRequest, isGet: boolean) {
  const authCheck = await verifyAuthorization(req);
  if (!authCheck.authorized) {
    logger.warn('Crawl request denied: Unauthorized access attempt', {
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      method: req.method,
      url: req.url,
      reason: authCheck.reason
    });
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET or auth token.' }, { status: 401 });
  }

  // Rate-limit crawl executions (max 10 requests per minute)
  const clientIdentifier = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = await checkRateLimit(`crawl_${clientIdentifier}`, 10, 0.1);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded: Too many crawl requests. Please wait.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
  }

  try {
    let sourceId: number | undefined;
    let category: string | undefined;

    if (!isGet) {
      try {
        const rawBody = await req.json();
        const parsed = CrawlRequestSchema.safeParse(rawBody);
        if (parsed.success) {
          sourceId = parsed.data.sourceId;
          category = parsed.data.category;
        } else {
          sourceId = typeof rawBody.sourceId === 'number' ? rawBody.sourceId : undefined;
          category = typeof rawBody.category === 'string' ? rawBody.category : undefined;
        }
      } catch {
        sourceId = undefined;
        category = undefined;
      }
    } else {
      const { searchParams } = new URL(req.url);
      sourceId = searchParams.get('sourceId') ? Number(searchParams.get('sourceId')) : undefined;
      category = searchParams.get('category') || undefined;
    }

    const results: CrawlResult[] = [];

    if (sourceId) {
      const res = await crawlSource(sourceId);
      results.push(res);
    } else if (category && category !== 'all') {
      const catSources = MONITORED_SOURCES.filter(s => s.category === category).slice(0, 3);
      for (const src of catSources) {
        const res = await crawlSource(src.id);
        results.push(res);
      }
    } else {
      const priorityIds = [18, 1, 24, 23, 12]; // ZERA, The Herald, AfDB, SAPP, Ministry of Energy
      const sourcesToRun = MONITORED_SOURCES.filter(s => priorityIds.includes(s.id));
      for (const src of sourcesToRun) {
        try {
          const res = await crawlSource(src.id);
          results.push(res);
        } catch (srcErr) {
          console.warn(`Error crawling priority source ${src.name}:`, srcErr);
        }
      }
    }

    const totalNew = results.reduce((acc, curr) => acc + curr.newArticlesInserted, 0);
    const totalHigh = results.reduce((acc, curr) => acc + curr.highRelevanceCount, 0);

    logger.info('Crawl batch completed successfully', {
      sourceCount: results.length,
      totalNewArticles: totalNew,
      totalHighRelevance: totalHigh
    });

    return NextResponse.json({
      success: true,
      message: `Crawl completed across ${results.length} sources. Captured ${totalNew} items (${totalHigh} high relevance).`,
      results
    });
  } catch (error: any) {
    logger.error('Crawl execution failed', error);
    return NextResponse.json({ error: error.message || 'Crawl failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleCrawl(req, true);
}

export async function POST(req: NextRequest) {
  return handleCrawl(req, false);
}
