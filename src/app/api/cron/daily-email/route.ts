/**
 * GET /api/cron/daily-email
 *
 * Cron-triggered endpoint that sends the daily intelligence brief by email.
 * Intended to be called at a fixed time each morning (e.g. 06:00 CAT).
 *
 * To schedule this on Vercel, add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/daily-email", "schedule": "0 4 * * *" }] }
 *   (06:00 CAT = 04:00 UTC)
 *
 * When running on Railway / a VPS, hit this URL with curl from a cron job:
 *   curl -X GET "https://your-app.com/api/cron/daily-email" \
 *        -H "Authorization: Bearer <CRON_SECRET>"
 *
 * Security: protected by the CRON_SECRET environment variable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuthorization } from '@/lib/api-auth';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const auth = await verifyApiAuthorization(req, { allowCron: true });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  // ── Delegate to the send route (keeps logic in one place) ──────────────────
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (req.headers.get('x-forwarded-proto') && req.headers.get('x-forwarded-host')
      ? `${req.headers.get('x-forwarded-proto')}://${req.headers.get('x-forwarded-host')}`
      : 'http://localhost:3009');

  const cronSecret = process.env.CRON_SECRET ?? '';

  try {
    const response = await fetch(`${baseUrl}/api/daily-brief/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[cron/daily-email] Send route error:', data);
      return NextResponse.json({ error: data.error ?? 'Send failed' }, { status: response.status });
    }

    return NextResponse.json({ triggered: true, ...data });
  } catch (err: any) {
    console.error('[cron/daily-email] Fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
