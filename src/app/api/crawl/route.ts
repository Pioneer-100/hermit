import { NextRequest, NextResponse } from 'next/server';
import { crawlSource, CrawlResult } from '@/lib/crawler-service';
import { MONITORED_SOURCES } from '@/lib/sources';
import { CrawlRequestSchema } from '@/lib/schemas';
import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyAuthorization(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, CRON_SECRET must be explicitly set and not use default dev placeholders
  if (!cronSecret || cronSecret.includes('...') || cronSecret === 'hermit_super_secret_cron_token_2026') {
    return !isProduction;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (safeCompare(token, cronSecret)) {
      return true;
    }
  }

  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret') || searchParams.get('token');
  if (secretParam && safeCompare(secretParam, cronSecret)) {
    return true;
  }

  // Internal same-origin check ONLY allowed in non-production environments
  if (!isProduction) {
    const host = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    if (host && referer.includes(host)) {
      return true;
    }
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
        const parsed = CrawlRequestSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Invalid crawl payload', details: parsed.error.issues }, { status: 400 });
        }
        sourceId = parsed.data.sourceId;
        category = parsed.data.category;
      } catch {
        // Body is optional
      }
    }

    const { searchParams } = new URL(req.url);
    const queryParsed = CrawlRequestSchema.safeParse({
      sourceId: searchParams.get('sourceId') || undefined,
      category: searchParams.get('category') || undefined
    });
    if (!queryParsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryParsed.error.issues }, { status: 400 });
    }

    if (!sourceId && queryParsed.data.sourceId) {
      sourceId = queryParsed.data.sourceId;
    }
    if (!category && queryParsed.data.category) {
      category = queryParsed.data.category;
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
