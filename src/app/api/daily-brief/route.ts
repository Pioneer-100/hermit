import { NextRequest, NextResponse } from 'next/server';
import { checkDistributedRateLimit } from '@/lib/rate-limiter';
import { verifyApiAuthorization } from '@/lib/api-auth';
import { generateDailyBrief } from '@/lib/daily-brief-service';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = await checkDistributedRateLimit(ip, 60, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Rate limit exceeded.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const brief = await generateDailyBrief({ forceRegenerate: false });
    return NextResponse.json({ brief });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate request (allows either valid CRON_SECRET or authenticated user session)
    const auth = await verifyApiAuthorization(req, { allowCron: true });
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limit regeneration
    const identifier = auth.user?.id || (auth.isCron ? 'cron' : req.headers.get('x-forwarded-for') || '127.0.0.1');
    const rate = await checkDistributedRateLimit(`regen_${identifier}`, 10, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Daily brief regeneration rate limit exceeded. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const brief = await generateDailyBrief({ forceRegenerate: true });
    return NextResponse.json({ brief, regenerated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
