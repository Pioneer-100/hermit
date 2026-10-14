import { NextRequest, NextResponse } from 'next/server';
import { fetchAlerts, insertAlertLog, fetchArticleById, getSupabaseAdminClient } from '@/lib/supabase';
import { sendEmailAlert } from '@/lib/email-service';

// In-memory rate limiting and deduplication cache (10 minutes cooldown per article)
const recentDispatches = new Map<number, number>();

export async function GET() {
  const alerts = await fetchAlerts();
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = Number(body.articleId);

    if (!articleId || isNaN(articleId) || articleId <= 0) {
      return NextResponse.json({ error: 'Valid articleId is required' }, { status: 400 });
    }

    const lastSent = recentDispatches.get(articleId);
    const now = Date.now();
    if (lastSent && now - lastSent < 10 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        message: 'Alert already dispatched recently for this article (cooldown active)',
        delivery: 'cooldown_suppressed'
      });
    }

    const article = await fetchArticleById(articleId);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const emailResult = await sendEmailAlert(article);
    recentDispatches.set(articleId, now);

    const alertLog = await insertAlertLog({
      article_id: article.id,
      headline: article.headline,
      source_name: article.source_name,
      relevance_level: article.relevance_level || 'high',
      recipient_email: emailResult.recipient,
      status: 'sent',
      dispatched_at: new Date().toISOString()
    });

    // Mark article alert sent in Supabase if connected
    const sb = getSupabaseAdminClient();
    if (sb) {
      try {
        await sb.from('articles').update({ is_alert_sent: true }).eq('id', article.id);
      } catch (e) {
        console.warn('Failed to update article alert status:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Alert dispatched to ${emailResult.recipient}`,
      delivery: emailResult.deliveredVia,
      alert: alertLog
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
