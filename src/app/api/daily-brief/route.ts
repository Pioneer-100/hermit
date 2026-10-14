import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase';
import { INITIAL_DAILY_BRIEF } from '@/lib/mock-data';
import { DailyBrief } from '@/types';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';

export async function GET() {
  try {
    const articles = await fetchArticles();
    if (!articles || articles.length === 0) {
      return NextResponse.json({ brief: INITIAL_DAILY_BRIEF });
    }

    const dynamicBrief = synthesizeDailyBriefFromArticles(articles);
    return NextResponse.json({ brief: dynamicBrief });
  } catch (err: any) {
    return NextResponse.json({ brief: INITIAL_DAILY_BRIEF, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const articles = await fetchArticles();
    const baseBrief = synthesizeDailyBriefFromArticles(articles);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('AIzaSy_fake') && apiKey.length > 10 && articles.length > 0) {
      try {
        const topHeadlines = articles.slice(0, 12).map(a => `- [${a.source_name}] (${a.article_type}): ${a.headline} (Relevance: ${a.relevance_level})`).join('\n');
        
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
            const dynamicBrief: DailyBrief = {
              ...baseBrief,
              headline: parsed.headline,
              executive_summary: parsed.executive_summary,
              market_sentiment: parsed.market_sentiment || baseBrief.market_sentiment,
              risk_index: typeof parsed.risk_index === 'number' ? parsed.risk_index : baseBrief.risk_index,
              risk_label: parsed.risk_label || baseBrief.risk_label
            };
            return NextResponse.json({ brief: dynamicBrief, regenerated: true });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini briefing generation fallback:', geminiErr);
      }
    }

    return NextResponse.json({ brief: baseBrief, regenerated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
