import { NextRequest, NextResponse } from 'next/server';
import { crawlSource, CrawlResult } from '@/lib/crawler-service';
import { MONITORED_SOURCES } from '@/lib/sources';
import { CrawlRequestSchema } from '@/lib/schemas';
import { verifyApiAuthorization } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getNextRotatingSources } from '@/lib/source-rotator';
import { logger } from '@/lib/logger';

async function handleCrawl(req: NextRequest, isGet: boolean) {
  // Strict authorization: requires valid CRON_SECRET or authenticated user session
  const authCheck = await verifyApiAuthorization(req, { allowCron: true });
  if (!authCheck.authorized) {
    logger.warn('Crawl request denied: Unauthorized access attempt', {
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      method: req.method,
      url: req.url,
      reason: authCheck.reason
    });
    return NextResponse.json(
      { error: 'Unauthorized: Valid authentication token or CRON_SECRET required.' },
      { status: 401 }
    );
  }

  // Rate-limit crawl executions (max 10 requests per minute)
  const clientIdentifier = authCheck.user?.id || req.headers.get('x-forwarded-for') || '127.0.0.1';
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
      // Dynamic Source Rotation: Rotates across all 7 categories and 70+ sources
      // Eliminates manual dashboard selection and prevents clustering on a single source
      const sourcesToRun = await getNextRotatingSources(4);
      logger.info('Executing automated rotating crawl batch', {
        sources: sourcesToRun.map(s => s.name)
      });

      for (const src of sourcesToRun) {
        try {
          const res = await crawlSource(src.id);
          results.push(res);
        } catch (srcErr) {
          logger.warn(`Error crawling rotating source ${src.name}:`, { error: String(srcErr) });
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
