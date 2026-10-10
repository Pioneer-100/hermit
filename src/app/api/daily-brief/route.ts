import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase';
import { INITIAL_DAILY_BRIEF } from '@/lib/mock-data';
import { DailyBrief, Article } from '@/types';

export async function GET() {
  try {
    const articles = await fetchArticles();
    if (!articles || articles.length === 0) {
      return NextResponse.json({ brief: INITIAL_DAILY_BRIEF });
    }

    // Build dynamic brief from articles if available
    const highArticles = articles.filter(a => a.relevance_level === 'high');
    const brief: DailyBrief = {
      ...INITIAL_DAILY_BRIEF,
      total_articles_scanned: articles.length,
      high_relevance_count: highArticles.length,
      date: new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };

    return NextResponse.json({ brief });
  } catch (err: any) {
    return NextResponse.json({ brief: INITIAL_DAILY_BRIEF, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const articles = await fetchArticles();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('AIzaSy_fake') && apiKey.length > 10) {
      try {
        const topHeadlines = articles.slice(0, 10).map(a => `- [${a.source_name}] (${a.article_type}): ${a.headline} (Relevance: ${a.relevance_level})`).join('\n');
        
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const prompt = `You are the Lead Energy Strategist at Hermit Investments (Zimbabwe).
Synthesize today's monitored energy articles into an executive Daily Briefing.

Articles:
${topHeadlines}

Return ONLY valid JSON matching this structure:
{
  "headline": "High-impact 1-line headline summarizing the macro energy picture today in Zimbabwe",
  "executive_summary": "3-4 sentence comprehensive executive summary of key regulatory, financing, grid, and market moves",
  "market_sentiment": "bullish" | "bearish" | "neutral" | "cautious",
  "risk_index": number (0-100),
  "risk_label": "High Regulatory Risk" | "Elevated Attention" | "Stable Market Conditions"
}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.headline && parsed.executive_summary) {
            const dynamicBrief: DailyBrief = {
              ...INITIAL_DAILY_BRIEF,
              id: `brief-${Date.now()}`,
              date: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
              headline: parsed.headline,
              executive_summary: parsed.executive_summary,
              market_sentiment: parsed.market_sentiment || 'bullish',
              risk_index: parsed.risk_index || 70,
              risk_label: parsed.risk_label || 'Elevated Regulatory Focus',
              total_articles_scanned: articles.length,
              high_relevance_count: articles.filter(a => a.relevance_level === 'high').length
            };
            return NextResponse.json({ brief: dynamicBrief, regenerated: true });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini briefing generation fallback:', geminiErr);
      }
    }

    // Heuristics fallback
    const fallbackBrief: DailyBrief = {
      ...INITIAL_DAILY_BRIEF,
      id: `brief-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      total_articles_scanned: articles.length,
      high_relevance_count: articles.filter(a => a.relevance_level === 'high').length
    };

    return NextResponse.json({ brief: fallbackBrief, regenerated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
