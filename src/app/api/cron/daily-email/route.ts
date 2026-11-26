/**
 * GET /api/cron/daily-email & POST /api/cron/daily-email
 *
 * Cron-triggered endpoint that:
 * 1. Generates a fresh, dynamic daily executive intelligence brief for today
 * 2. Compiles the brief into a branded Word document (.docx)
 * 3. Emails the executive summary + attachment to the recipient configured in .env (REPORT_RECIPIENTS / ALERT_EMAIL_TO)
 * 4. Invalidates the dashboard cache so the team sees the new brief immediately
 *
 * Vercel Cron schedule (07:35 CAT / 05:35 UTC — 5 min after the crawl at 07:30):
 *   Add to vercel.json:
 *   { "path": "/api/cron/daily-email", "schedule": "35 5 * * *" }
 *
 * Security: protected by the CRON_SECRET environment variable (Bearer header or ?secret= query param).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuthorization } from '@/lib/api-auth';
import { generateAndSendDailyBrief } from '@/lib/daily-brief-service';

export const maxDuration = 60; // Allow up to 60 seconds for Gemini + docx + Resend

async function handleDailyEmailCron(req: NextRequest) {
  // ── 1. Authorization ────────────────────────────────────────────────────────
  const auth = await verifyApiAuthorization(req, { allowCron: true });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  try {
    // ── 2. Run generation and dispatch in-process ─────────────────────────────
    const result = await generateAndSendDailyBrief({ forceRegenerate: true });

    return NextResponse.json({
      triggered: true,
      success: true,
      emailId: result.emailId,
      recipients: result.recipients,
      filename: result.filename,
      briefDate: result.briefDate,
      headline: result.headline,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[cron/daily-email] Execution error:', err);
    return NextResponse.json(
      {
        triggered: true,
        success: false,
        error: err.message || 'Daily brief generation or email delivery failed'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleDailyEmailCron(req);
}

export async function POST(req: NextRequest) {
  return handleDailyEmailCron(req);
}
