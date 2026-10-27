import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase';
import { INITIAL_DAILY_BRIEF } from '@/lib/mock-data';
import { DailyBrief } from '@/types';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';
import { getOrSetCache, invalidateCache } from '@/lib/cache';
import { checkDistributedRateLimit } from '@/lib/rate-limiter';
import { verifyApiAuthorization } from '@/lib/api-auth';

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

    // Cache the dynamic brief for 300 seconds (5 minutes)
    const brief = await getOrSetCache<DailyBrief>('hermit_daily_brief_get', 300, async () => {
      const allArticles = await fetchArticles();
      if (!allArticles || allArticles.length === 0) {
        return INITIAL_DAILY_BRIEF;
      }
      const recentArticles = filterArticlesRecentWindow(allArticles);
      return synthesizeDailyBriefFromArticles(recentArticles);
    });

    return NextResponse.json({ brief });
  } catch (err: any) {
    return NextResponse.json({ brief: INITIAL_DAILY_BRIEF, error: err.message });
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

    const allArticles = await fetchArticles();
    const articles = filterArticlesRecentWindow(allArticles);
    const baseBrief = synthesizeDailyBriefFromArticles(articles);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('AIzaSy_fake') && apiKey.length > 10 && articles.length > 0) {
      try {
        const topHeadlines = articles.slice(0, 12).map(a => `- [${a.source_name}] (${a.article_type}): ${a.headline} (Relevance: ${a.relevance_level})`).join('\n');
        
        const candidateModels = [
          'gemini-1.5-flash',
          'gemini-2.0-flash',
          'gemini-2.5-flash-lite',
          'gemini-3.5-flash-lite'
        ];

        let parsedAiResult: any = null;

        for (const model of candidateModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const prompt = `You are the Chief Intelligence Officer at Hermit Investments (Zimbabwe).
Synthesize today's monitored energy sector captures into an executive macro report answering "What's Up Today" for management.
Make the headline dynamic, crisp, and informative (NOT generic, NO static text).

Articles Scanned Today:
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
              signal: AbortSignal.timeout(12000)
            });

            if (res.ok) {
              const data = await res.json();
              const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
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
          const dynamicBrief: DailyBrief = {
            ...baseBrief,
            headline: parsedAiResult.headline,
            executive_summary: parsedAiResult.executive_summary,
            market_sentiment: parsedAiResult.market_sentiment || baseBrief.market_sentiment,
            risk_index: typeof parsedAiResult.risk_index === 'number' ? parsedAiResult.risk_index : baseBrief.risk_index,
            risk_label: parsedAiResult.risk_label || baseBrief.risk_label
          };

          // Invalidate GET cache so new brief immediately surfaces to team
          invalidateCache('hermit_daily_brief');
          return NextResponse.json({ brief: dynamicBrief, regenerated: true });
        }
      } catch (geminiErr) {
        console.warn('Gemini briefing generation fallback:', geminiErr);
      }
    }

    invalidateCache('hermit_daily_brief');
    return NextResponse.json({ brief: baseBrief, regenerated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


/**
 * Ensures articles included in the Daily Brief were scraped/captured today
 * or yesterday (within the last 48 hours).
 */
function filterArticlesRecentWindow(articles: any[]) {
  const cutoff = Date.now() - 48 * 3600 * 1000;
  const filtered = articles.filter(a => {
    const time = a.captured_at 
      ? new Date(a.captured_at).getTime() 
      : (a.publication_date ? new Date(a.publication_date).getTime() : 0);
    return time >= cutoff;
  });
  // If no articles fall in last 48 hours (e.g. fresh environment or slow weekend),
  // fall back gracefully to the most recent articles
  return filtered.length > 0 ? filtered : articles.slice(0, 15);
}
