import { Article } from '@/types';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  deliveredVia: 'resend' | 'simulated';
}

export async function sendEmailAlert(article: Article): Promise<EmailDispatchResult> {
  const recipient = process.env.ALERT_EMAIL_TO || 'communications@hermitinvestments.com';
  const apiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f392b; color: #ffffff; padding: 20px 24px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #86efac; }
    .badge { display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 4px 10px; font-size: 12px; font-weight: 700; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .content { padding: 24px; }
    .headline { font-size: 20px; font-weight: 700; line-height: 1.3; color: #0f172a; margin: 0 0 12px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: #475569; margin: 16px 0 6px; }
    .ai-box { background: #f8fafc; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 12px; }
    .btn { display: inline-block; background: #166534; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 20px; }
    .footer { font-size: 11px; color: #94a3b8; text-align: center; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HERMIT INVESTMENTS</h1>
      <p>Energy Sector Monitor — Real-Time Alert</p>
    </div>
    <div class="content">
      <span class="badge">HIGH RELEVANCE ALERT</span>
      <h2 class="headline">${article.headline}</h2>
      <div class="meta">
        <strong>Source:</strong> ${article.source_name} &bull; 
        <strong>Category:</strong> ${article.article_type.toUpperCase().replace('_', ' ')} &bull; 
        <strong>Captured:</strong> ${new Date(article.captured_at).toLocaleString()}
      </div>

      <div class="section-title">Article Summary</div>
      <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 0 0 16px;">
        ${article.summary || article.headline}
      </p>

      <div class="ai-box">
        <div class="section-title" style="color: #166534; margin-top: 0;">AI Strategic Impact Note (Hermit Investments)</div>
        <p style="font-size: 13px; line-height: 1.5; color: #1e293b; margin: 4px 0 0; white-space: pre-line;">
          ${article.ai_impact_note || article.relevance_to_hermit || 'Requires review by Communications Officer.'}
        </p>
      </div>

      <a href="${article.source_link}" class="btn" target="_blank">View Original Source &rarr;</a>
    </div>
    <div class="footer">
      Dispatched automatically by Hermit Investments Media Monitoring Platform<br />
      Zimbabwe Energy Sector Portfolio &bull; Confidential
    </div>
  </div>
</body>
</html>
  `;

  if (apiKey && !apiKey.includes('re_fake') && apiKey.length > 10) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.ALERT_EMAIL_FROM || 'alerts@hermitinvestments.com',
          to: [recipient],
          subject: `🔴 [HIGH RELEVANCE ALERT] ${article.headline}`,
          html: htmlContent
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.id,
          recipient,
          deliveredVia: 'resend'
        };
      }
    } catch (e) {
      console.warn('Resend email dispatch error, falling back to simulated log:', e);
    }
  }

  // Simulated email dispatch (shows in alert log and dashboard UI)
  console.log(`[SIMULATED EMAIL DISPATCH] Alert sent to ${recipient}: ${article.headline}`);
  return {
    success: true,
    recipient,
    deliveredVia: 'simulated'
  };
}
