/**
 * POST /api/daily-brief/send
 *
 * Generates the daily intelligence brief as a Word (.docx) attachment
 * and emails it to the configured recipient list via Resend.
 *
 * Authentication: requires a valid CRON_SECRET Bearer token OR an
 * authenticated Supabase user session (so it can be triggered manually
 * from the UI or by the cron job).
 *
 * Body (optional JSON):
 *   { "recipients": ["someone@example.com"] }  — overrides REPORT_RECIPIENTS env var
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuthorization } from '@/lib/api-auth';
import { generateAndSendDailyBrief } from '@/lib/daily-brief-service';

export const maxDuration = 60; // allow up to 60 s for Gemini + docx generation

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const auth = await verifyApiAuthorization(req, { allowCron: true });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse optional request recipients ────────────────────────────────────
  let recipients: string[] | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.recipients) && body.recipients.length > 0) {
      recipients = body.recipients.filter((r: unknown) => typeof r === 'string' && r.includes('@'));
    }
  } catch {
    // Body was empty or not JSON
  }

  try {
    const result = await generateAndSendDailyBrief({
      recipients,
      forceRegenerate: true
    });

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      recipients: result.recipients,
      filename: result.filename,
      briefDate: result.briefDate,
      headline: result.headline
    });
  } catch (err: any) {
    console.error('[daily-brief/send] Execution error:', err);
    const status = err.message?.includes('No email recipients') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
