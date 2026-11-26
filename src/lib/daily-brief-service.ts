import { Resend } from 'resend';
import { fetchArticles } from '@/lib/supabase';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';
import { generateExecutivePillarContent } from '@/lib/gemini';
import { filterArticlesForDailyWindow } from '@/lib/daily-article-window';
import { generateDailyBriefDocxBuffer } from '@/lib/docxGenerator';
import { getOrSetCache, invalidateCache } from '@/lib/cache';
import { DailyBrief } from '@/types';

export const DAILY_BRIEF_CACHE_KEY = 'hermit_daily_brief_get_v3';

/**
 * Generates an executive macro brief for today, complete with Gemini AI
 * synthesis for the top headline, executive summary, sentiment, risk index,
 * and strategic pillar summaries.
 */
export async function generateDailyBrief(options: { forceRegenerate?: boolean } = {}): Promise<DailyBrief> {
  const { forceRegenerate = false } = options;

  if (!forceRegenerate) {
    return await getOrSetCache<DailyBrief>(DAILY_BRIEF_CACHE_KEY, 300, async () => {
      return await buildFullDailyBrief();
    });
  }

  const brief = await buildFullDailyBrief();
  await invalidateCache(DAILY_BRIEF_CACHE_KEY);
  return brief;
}

/**
 * Internal generator logic combining article gathering, geographic tiering,
 * pillar synthesis, and multi-model Gemini macro intelligence.
 */
async function buildFullDailyBrief(): Promise<DailyBrief> {
  const allArticles = await fetchArticles();
  const articles = filterArticlesForDailyWindow(allArticles);
  const baseBrief = await generateExecutivePillarContent(
    synthesizeDailyBriefFromArticles(articles),
    articles
  );

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && !apiKey.includes('AIzaSy_fake') && apiKey.length > 10 && articles.length > 0) {
    try {
      const topHeadlines = articles
        .slice(0, 12)
        .map(a => `- [${a.source_name}] (${a.article_type}): ${a.headline} (Relevance: ${a.relevance_level})`)
        .join('\n');

      const candidateModels = [
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-3.5-flash-lite'
      ];

      let parsedAiResult: any = null;

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const prompt = `You are the Chief Intelligence Officer at Hermit Investments (Zimbabwe).
Synthesize monitored energy sector updates published today or yesterday into an executive macro report answering "What's Up Today" for management.
Make the headline dynamic, crisp, and informative (NOT generic, NO static text).

Articles Published Today or Yesterday:
${topHeadlines}

Return ONLY valid JSON matching this exact structure:
{
  "headline": "Dynamic, high-impact 1-line headline summarizing what is happening today across Zimbabwe's energy sector",
  "executive_summary": "Comprehensive 3-4 sentence synthesis explaining today's primary shifts in policy, tariffs, DFI capital, and grid supply, detailing strategic significance for Hermit Investments.",
  "market_sentiment": "bullish" | "bearish" | "neutral" | "cautious",
  "risk_index": number (0-100),
  "risk_label": "High Regulatory Risk" | "Elevated Attention" | "Stable Market Conditions"
}`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.25, responseMimeType: 'application/json' }
            }),
            signal: AbortSignal.timeout(15000)
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = JSON.parse(cleanText);
            if (parsed.headline && parsed.executive_summary) {
              parsedAiResult = parsed;
              break;
            }
          }
        } catch (modelErr) {
          console.warn(`Model ${model} in brief generation failed:`, modelErr);
        }
      }

      if (parsedAiResult) {
        return {
          ...baseBrief,
          headline: parsedAiResult.headline,
          executive_summary: parsedAiResult.executive_summary,
          market_sentiment: parsedAiResult.market_sentiment || baseBrief.market_sentiment,
          risk_index: typeof parsedAiResult.risk_index === 'number' ? parsedAiResult.risk_index : baseBrief.risk_index,
          risk_label: parsedAiResult.risk_label || baseBrief.risk_label
        };
      }
    } catch (geminiErr) {
      console.warn('Gemini daily briefing macro synthesis fallback:', geminiErr);
    }
  }

  return baseBrief;
}

/**
 * Resolves recipient email addresses from explicit input or environment variables.
 * Checks REPORT_RECIPIENTS, ALERT_EMAIL_TO, and USER_EMAIL in order.
 */
export function resolveBriefRecipients(explicitRecipients?: string[]): string[] {
  if (Array.isArray(explicitRecipients) && explicitRecipients.length > 0) {
    const valid = explicitRecipients
      .filter((r): r is string => typeof r === 'string' && r.includes('@'))
      .map(r => r.trim());
    if (valid.length > 0) return valid;
  }

  const rawEnv =
    process.env.REPORT_RECIPIENTS ||
    process.env.ALERT_EMAIL_TO ||
    process.env.USER_EMAIL ||
    '';

  return rawEnv
    .split(',')
    .map(s => s.trim())
    .filter(s => s.includes('@'));
}

export interface SendDailyBriefResult {
  success: boolean;
  emailId?: string;
  recipients: string[];
  filename: string;
  briefDate: string;
  headline: string;
}

/**
 * Sends a DailyBrief object as a branded Word document (.docx) + rich HTML summary
 * via Resend to the configured recipients.
 */
export async function sendDailyBriefEmail(
  brief: DailyBrief,
  options: { recipients?: string[] } = {}
): Promise<SendDailyBriefResult> {
  const recipients = resolveBriefRecipients(options.recipients);

  if (recipients.length === 0) {
    throw new Error(
      'No email recipients configured. Please set REPORT_RECIPIENTS or ALERT_EMAIL_TO in your .env file.'
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables.');
  }

  // 1. Generate DOCX attachment buffer
  const docxBuffer = await generateDailyBriefDocxBuffer(brief);
  const cleanDate = (brief.date || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Hermit_Daily_Brief_${cleanDate}.docx`;

  // 2. Format localized date
  const dateFormatted = new Date(brief.date ?? Date.now()).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fromAddress =
    process.env.REPORT_FROM_EMAIL ||
    process.env.ALERT_EMAIL_FROM ||
    'Hermit Intelligence <onboarding@resend.dev>';

  // 3. Send email via Resend
  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: recipients,
    subject: `[Hermit Intelligence] Daily Brief — ${dateFormatted}`,
    html: buildEmailHtml(brief, dateFormatted),
    attachments: [
      {
        filename,
        content: docxBuffer
      }
    ]
  });

  if (error) {
    throw new Error(`Resend API Error: ${error.message}`);
  }

  console.log(`[daily-brief-service] Brief sent successfully to ${recipients.join(', ')} (id: ${data?.id})`);

  return {
    success: true,
    emailId: data?.id,
    recipients,
    filename,
    briefDate: brief.date,
    headline: brief.headline
  };
}

/**
 * End-to-end action: regenerates a fresh daily brief for today, updates the cache,
 * and forwards the report with Word attachment to the user's email.
 */
export async function generateAndSendDailyBrief(
  options: { recipients?: string[]; forceRegenerate?: boolean } = {}
): Promise<SendDailyBriefResult & { brief: DailyBrief }> {
  // Always regenerate freshly for the scheduled job / on-demand send
  const brief = await generateDailyBrief({ forceRegenerate: options.forceRegenerate ?? true });
  const sendResult = await sendDailyBriefEmail(brief, { recipients: options.recipients });

  return {
    ...sendResult,
    brief
  };
}

/**
 * HTML Executive Email Template
 */
export function buildEmailHtml(brief: DailyBrief, dateFormatted: string): string {
  const sentimentEmoji: Record<string, string> = {
    bullish: '📈',
    bearish: '📉',
    cautious: '⚠️',
    neutral: '➡️'
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

        <!-- Power Generation & Water Resources (ZPC · ZRA · ZINWA) -->
        ${brief.hydrology_and_generation ? `
        <tr><td style="padding:12px 32px 16px;">
          <p style="margin:0 0 10px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">⚡ Power Generation & Water Resources (ZPC · ZRA · ZINWA)</p>
          <div style="background:#F8FAFC;border:1px solid #BAE6FD;border-radius:8px;padding:16px 20px;">
            <div style="margin-bottom:12px;">
              <strong style="color:#0F234B;font-size:13px;">Zimbabwe Power Company (ZPC) — Daily Generation Stats</strong>
              <div style="margin-top:4px;font-size:12px;color:#334155;">
                Total National Output: <strong style="color:#0EA5E9;">${brief.hydrology_and_generation.zpc_generation?.total_output_mw} MW</strong> 
                (Peak Demand: ~${brief.hydrology_and_generation.zpc_generation?.national_grid_demand_mw} MW | Deficit: ${brief.hydrology_and_generation.zpc_generation?.deficit_or_surplus_mw} MW)
              </div>
              <div style="font-size:11px;color:#64748B;margin-top:2px;">
                ${brief.hydrology_and_generation.zpc_generation?.summary}
              </div>
            </div>
            <div style="margin-bottom:12px;padding-top:10px;border-top:1px dashed #CBD5E1;">
              <strong style="color:#0F234B;font-size:13px;">Zambezi River Authority (ZRA) — Kariba Water Levels & Flows</strong>
              <div style="margin-top:4px;font-size:12px;color:#334155;">
                Lake Level: <strong style="color:#0EA5E9;">${brief.hydrology_and_generation.zra_hydrology?.kariba_dam_level_masl}</strong> 
                (Live Usable Storage: ${brief.hydrology_and_generation.zra_hydrology?.live_storage_usable_pct} | Trend: ${brief.hydrology_and_generation.zra_hydrology?.lake_level_trend})
              </div>
              <div style="font-size:11px;color:#64748B;margin-top:2px;">
                Vic Falls Flow: ${brief.hydrology_and_generation.zra_hydrology?.zambezi_river_flows?.victoria_falls_flow_m3s} • Kariba Inflow: ${brief.hydrology_and_generation.zra_hydrology?.zambezi_river_flows?.kariba_inflow_m3s}
              </div>
            </div>
            <div style="padding-top:10px;border-top:1px dashed #CBD5E1;">
              <strong style="color:#0F234B;font-size:13px;">ZINWA — National Dam Levels & River Catchment Report</strong>
              <div style="margin-top:4px;font-size:12px;color:#334155;">
                National Dam Storage: <strong style="color:#0D9488;">${brief.hydrology_and_generation.zinwa_reports?.national_dam_storage_pct}</strong> average across major river basins.
              </div>
              <div style="font-size:11px;color:#64748B;margin-top:2px;">
                ${brief.hydrology_and_generation.zinwa_reports?.summary}
              </div>
            </div>
          </div>
        </td></tr>
        ` : ''}

        <!-- Actions -->
        <tr><td style="padding:20px 32px 24px;">
          <p style="margin:0 0 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Recommended Actions</p>
          <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.6;">${actionsHtml}</ul>
        </td></tr>

        <!-- Attachment note -->
        <tr><td style="padding:0 32px 28px;">
          <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:14px 18px;display:flex;align-items:center;">
            <span style="font-size:22px;margin-right:10px;">📎</span>
            <span style="color:#0F234B;font-size:13px;">The full Word document (.docx) is attached to this email for offline reading, sharing, and archiving.</span>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0F234B;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#93C5FD;font-size:11px;">Hermit Investments Sustainability Advisory &nbsp;·&nbsp; <strong>CONFIDENTIAL</strong></p>
          <p style="margin:4px 0 0;color:#64748B;font-size:10px;">This intelligence report was generated and dispatched automatically by Hermit Media Monitor.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
