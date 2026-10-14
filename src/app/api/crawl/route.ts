import { NextRequest, NextResponse } from 'next/server';
import { crawlSource, CrawlResult } from '@/lib/crawler-service';
import { MONITORED_SOURCES } from '@/lib/sources';

function verifyAuthorization(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // If no CRON_SECRET is configured or placeholder is present, allow in dev/demo mode
  if (!cronSecret || cronSecret.includes('...') || cronSecret === 'hermit_super_secret_cron_token_2026') {
    return true;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') === cronSecret || searchParams.get('token') === cronSecret) {
    return true;
  }

  // Allow same-origin / internal requests
  const host = req.headers.get('host') || '';
  const referer = req.headers.get('referer') || '';
  if (referer.includes(host) && host.length > 0) {
    return true;
  }

  return false;
}

async function handleCrawl(req: NextRequest, isGet: boolean) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET or auth token.' }, { status: 401 });
  }

  try {
    let sourceId: number | undefined;
    let category: string | undefined;

    if (!isGet) {
      try {
        const body = await req.json();
        sourceId = body.sourceId ? Number(body.sourceId) : undefined;
        category = body.category;
      } catch {
        // Body is optional
      }
    }

    const { searchParams } = new URL(req.url);
    if (!sourceId && searchParams.get('sourceId')) {
      sourceId = Number(searchParams.get('sourceId'));
    }
    if (!category && searchParams.get('category')) {
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
      // Category is 'all' or default cron run:
      // Ingest from top priority sources across core sectors (Regulators, Newspapers, DFI, Govt, SAPP)
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

    return NextResponse.json({
      success: true,
      message: `Crawl completed across ${results.length} sources. Captured ${totalNew} items (${totalHigh} high relevance).`,
      results
    });
  } catch (error: any) {
    console.error('Crawl API error:', error);
    return NextResponse.json({ error: error.message || 'Crawl failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleCrawl(req, true);
}

export async function POST(req: NextRequest) {
  return handleCrawl(req, false);
}
