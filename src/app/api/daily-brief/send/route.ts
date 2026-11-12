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
import { Resend } from 'resend';
import { fetchArticles } from '@/lib/supabase';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';
import { generateExecutivePillarContent } from '@/lib/gemini';
import { filterArticlesForDailyWindow } from '@/lib/daily-article-window';
import { generateDailyBriefDocxBuffer } from '@/lib/docxGenerator';
import { verifyApiAuthorization } from '@/lib/api-auth';
import { DailyBrief } from '@/types';

export const maxDuration = 60; // allow up to 60 s for Gemini + docx generation

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const auth = await verifyApiAuthorization(req, { allowCron: true });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Resolve recipient list ──────────────────────────────────────────────
  let recipients: string[] = [];
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.recipients) && body.recipients.length > 0) {
      recipients = body.recipients.filter((r: unknown) => typeof r === 'string' && r.includes('@'));
    }
  } catch { /* body was empty / not JSON */ }

  if (recipients.length === 0) {
    // Fall back to env var: comma-separated list e.g. "alice@co.zw,bob@co.zw"
    const envList = process.env.REPORT_RECIPIENTS ?? '';
    recipients = envList
      .split(',')
      .map(s => s.trim())
      .filter(s => s.includes('@'));
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: 'No recipients configured. Set REPORT_RECIPIENTS in .env.local or pass {"recipients":[...]} in the request body.' },
      { status: 400 }
    );
  }

  // ── 3. Check Resend API key ────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  // ── 4. Build the daily brief ───────────────────────────────────────────────
  let brief: DailyBrief;
  try {
    const allArticles = await fetchArticles();
    const recentArticles = filterArticlesForDailyWindow(allArticles);
    const baseBrief = synthesizeDailyBriefFromArticles(recentArticles);
    brief = await generateExecutivePillarContent(baseBrief, recentArticles);
  } catch (err: any) {
    console.error('[daily-brief/send] Brief generation failed:', err);
    return NextResponse.json({ error: `Brief generation failed: ${err.message}` }, { status: 500 });
  }

  // ── 5. Generate Word document ─────────────────────────────────────────────
  let docxBuffer: Buffer;
  try {
    docxBuffer = await generateDailyBriefDocxBuffer(brief);
  } catch (err: any) {
    console.error('[daily-brief/send] DOCX generation failed:', err);
    return NextResponse.json({ error: `DOCX generation failed: ${err.message}` }, { status: 500 });
  }

  // ── 6. Build clean filename ───────────────────────────────────────────────
  const cleanDate = (brief.date || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Hermit_Daily_Brief_${cleanDate}.docx`;

  // ── 7. Send via Resend ────────────────────────────────────────────────────
  const resend = new Resend(resendKey);
  const fromAddress = process.env.REPORT_FROM_EMAIL ?? 'Hermit Intelligence <reports@hermit.co.zw>';
  const dateFormatted = new Date(brief.date ?? Date.now()).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: `[Hermit Intelligence] Daily Brief — ${dateFormatted}`,
      html: buildEmailHtml(brief, dateFormatted),
      attachments: [
        {
          filename,
          content: docxBuffer,
        },
      ],
    });

    if (error) {
      console.error('[daily-brief/send] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.log(`[daily-brief/send] Email sent → ${recipients.join(', ')} (id: ${data?.id})`);

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      recipients,
      filename,
      briefDate: brief.date,
    });
  } catch (err: any) {
    console.error('[daily-brief/send] Unexpected send error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Email HTML template ───────────────────────────────────────────────────────
function buildEmailHtml(brief: DailyBrief, dateFormatted: string): string {
  const sentimentEmoji: Record<string, string> = {
    bullish:  '📈',
    bearish:  '📉',
    cautious: '⚠️',
    neutral:  '➡️',
  };
  const emoji = sentimentEmoji[brief.market_sentiment] ?? '📊';
  const riskColor = brief.risk_index >= 60 ? '#E11D48' : brief.risk_index >= 35 ? '#D97706' : '#0D9488';

  const pillarsHtml = brief.strategic_pillars
    .slice(0, 5)
    .map(
      (p, i) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;vertical-align:top;">
          <span style="color:#0EA5E9;font-weight:700;">${i + 1}.</span>
          <strong style="color:#0F234B;"> ${p.title}</strong>
          <span style="font-size:11px;color:#64748B;margin-left:6px;">[${p.badge}]</span>
          <br><span style="color:#334155;font-size:13px;">${p.takeaway}</span>
          <br><span style="color:#94A3B8;font-size:12px;font-style:italic;">${p.source} · ${p.time}</span>
        </td>
      </tr>`
    )
    .join('');

  const actionsHtml = brief.management_actions
    .map(
      a => `<li style="margin-bottom:6px;">
        <span style="font-weight:700;color:${
          a.priority === 'immediate' ? '#E11D48' : a.priority === 'medium' ? '#D97706' : '#0D9488'
        };">[${a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}]</span>
        ${a.action} <em style="color:#64748B;">→ ${a.owner}</em>
      </li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Calibri,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:24px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,35,75,0.12);">

        <!-- Header -->
        <tr><td style="background:#0F234B;padding:28px 32px;text-align:center;">
          <p style="margin:0;color:#BAE6FD;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Hermit Investments · Energy Intelligence Monitor</p>
          <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:800;">Daily Executive Brief</h1>
          <p style="margin:0;color:#93C5FD;font-size:14px;">${dateFormatted}</p>
        </td></tr>

        <!-- Headline -->
        <tr><td style="padding:28px 32px 0;background:#F0F9FF;border-bottom:3px solid #0EA5E9;">
          <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Today's Headline</p>
          <h2 style="margin:0 0 20px;color:#0F234B;font-size:18px;line-height:1.4;">${brief.headline}</h2>
        </td></tr>

        <!-- Executive Summary -->
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 8px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Executive Summary</p>
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">${brief.executive_summary}</p>
        </td></tr>

        <!-- KPIs -->
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;">
            <tr>
              <td style="padding:16px;text-align:center;border-right:1px solid #E2E8F0;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;">Sentiment</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#0F234B;">${emoji} ${brief.market_sentiment.charAt(0).toUpperCase() + brief.market_sentiment.slice(1)}</p>
              </td>
              <td style="padding:16px;text-align:center;border-right:1px solid #E2E8F0;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;">Risk Index</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:${riskColor};">${brief.risk_index}/100</p>
              </td>
              <td style="padding:16px;text-align:center;border-right:1px solid #E2E8F0;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;">Captures</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#0F234B;">${brief.total_articles_scanned}</p>
              </td>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;">High Flags</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#E11D48;">${brief.high_relevance_count}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Strategic Pillars -->
        <tr><td style="padding:0 32px 8px;">
          <p style="margin:0 0 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Strategic Intelligence Pillars</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
            ${pillarsHtml}
          </table>
        </td></tr>

        <!-- Actions -->
        <tr><td style="padding:20px 32px 24px;">
          <p style="margin:0 0 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Recommended Actions</p>
          <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.6;">${actionsHtml}</ul>
        </td></tr>

        <!-- Attachment note -->
        <tr><td style="padding:0 32px 28px;">
          <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:14px 18px;display:flex;align-items:center;">
            <span style="font-size:22px;margin-right:10px;">📎</span>
            <span style="color:#0F234B;font-size:13px;">The full Word document is attached to this email for offline reading and filing.</span>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0F234B;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#93C5FD;font-size:11px;">Hermit Investments Sustainability Advisory &nbsp;·&nbsp; <strong>CONFIDENTIAL</strong></p>
          <p style="margin:4px 0 0;color:#64748B;font-size:10px;">This report is generated automatically. Do not reply to this email.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
