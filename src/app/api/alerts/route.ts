import { NextRequest, NextResponse } from 'next/server';
import { fetchAlerts, insertAlertLog, fetchArticleById } from '@/lib/supabase';
import { sendEmailAlert } from '@/lib/email-service';

export async function GET() {
  const alerts = await fetchAlerts();
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = Number(body.articleId);

    const article = await fetchArticleById(articleId);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const emailResult = await sendEmailAlert(article);

    const alertLog = await insertAlertLog({
      article_id: article.id,
      headline: article.headline,
      source_name: article.source_name,
      relevance_level: 'high',
      recipient_email: emailResult.recipient,
      status: 'sent',
      dispatched_at: new Date().toISOString()
    });

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
