import { NextRequest, NextResponse } from 'next/server';
import { crawlSource, CrawlResult } from '@/lib/crawler-service';
import { MONITORED_SOURCES } from '@/lib/sources';

export async function POST(req: NextRequest) {
  try {
    let sourceId: number | undefined;
    let category: string | undefined;

    try {
      const body = await req.json();
      sourceId = body.sourceId ? Number(body.sourceId) : undefined;
      category = body.category;
    } catch {
      // Empty body is acceptable
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
      const catSources = MONITORED_SOURCES.filter(s => s.category === category).slice(0, 2);
      for (const src of catSources) {
        const res = await crawlSource(src.id);
        results.push(res);
      }
    } else {
      // Default: crawl ZERA (ID 18) or The Herald (ID 1)
      const targetSource = MONITORED_SOURCES.find(s => s.id === 18) || MONITORED_SOURCES[0];
      const res = await crawlSource(targetSource.id);
      results.push(res);
    }

    const totalNew = results.reduce((acc, curr) => acc + curr.newArticlesInserted, 0);
    const totalHigh = results.reduce((acc, curr) => acc + curr.highRelevanceCount, 0);

    return NextResponse.json({
      success: true,
      message: `Crawl completed successfully. Captured ${totalNew} items (${totalHigh} high relevance).`,
      results
    });
  } catch (error: any) {
    console.error('Crawl API error:', error);
    return NextResponse.json({ error: error.message || 'Crawl failed' }, { status: 500 });
  }
}
