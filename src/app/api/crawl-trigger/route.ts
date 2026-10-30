import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

/**
 * Internal proxy endpoint for the UI "Execute Live Crawl" button.
 *
 * This route is intentionally public (no user session required) because:
 * - The app's core value is always showing fresh data to all users
 * - Crawling should be decoupled from user authentication
 * - The actual /api/crawl endpoint is secured; this proxy authenticates
 *   server-side using CRON_SECRET so the secret is never exposed to the browser
 *
 * Rate-limited to 5 requests per 10 minutes per IP to prevent abuse.
 */
export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate limit: max 5 manual triggers per 10 minutes per IP
  const rateLimit = await checkRateLimit(`crawl_trigger_${clientIp}`, 5, 10);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many crawl requests. Please wait ${rateLimit.resetSeconds}s before trying again.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim().length < 16) {
    logger.error('CRON_SECRET is not configured — cannot trigger crawl from UI');
    return NextResponse.json(
      { error: 'Crawl service is not configured. Set CRON_SECRET in environment variables.' },
      { status: 503 }
    );
  }

  try {
    // Parse the request body to forward crawl options (mode, sourceId, etc.)
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // No body is fine — triggers the default auto-rotating crawl
    }

    // Build the internal URL: call /api/crawl on the same server
    const internalUrl = new URL('/api/crawl', req.url);

    logger.info('UI crawl trigger: proxying to /api/crawl', {
      ip: clientIp,
      body: JSON.stringify(body)
    });

    // Call /api/crawl server-side, authenticated with CRON_SECRET
    const crawlResponse = await fetch(internalUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify(body),
    });

    const data = await crawlResponse.json();

    return NextResponse.json(data, { status: crawlResponse.status });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Crawl trigger failed';
    logger.error('UI crawl trigger error', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
