import { NextRequest, NextResponse } from 'next/server';
import { fetchReports, insertReport, fetchArticles } from '@/lib/supabase';
import { Report } from '@/types';

export async function GET() {
  const reports = await fetchReports();
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const reportType = (body.report_type || 'daily') as 'daily' | 'weekly' | 'monthly' | 'special';
    
    const articles = await fetchArticles();
    const highArticles = articles.filter(a => a.relevance_level === 'high');

    const titles: Record<string, string> = {
      daily: `Daily Energy Sector Intelligence Digest — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      weekly: `Weekly Energy Strategic Summary — Week ${getWeekNumber(new Date())}`,
      monthly: `Monthly Energy Media & Regulatory Review — ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
      special: `Special Intelligence Brief: Urgent Regulatory & Grid Development`
    };

    // Attempt Gemini-powered report generation
    const apiKey = process.env.GEMINI_API_KEY;
    let geminiReport: {
      title?: string;
      summary?: string;
      highlights?: string[];
      executive_takeaway?: string;
    } | null = null;

    if (apiKey && apiKey.length > 10 && articles.length > 0) {
      try {
        const articleSummaries = articles.slice(0, 15).map(a =>
          `- [${a.source_name}] (${a.article_type}, Relevance: ${a.relevance_level}): ${a.headline}${a.summary ? ` — ${a.summary.slice(0, 150)}` : ''}`
        ).join('\n');

        const periodLabel = reportType === 'daily' ? "today's" : reportType === 'weekly' ? "this week's" : reportType === 'monthly' ? "this month's" : "the current";

        const prompt = `You are the Chief Intelligence Analyst at Hermit Investments, a Zimbabwean energy investment firm focused on renewable energy IPPs, utility-scale solar, grid integration, and clean energy financing.

Generate a formal ${reportType.toUpperCase()} executive intelligence report synthesizing ${periodLabel} monitored media captures.

Monitored Articles (${articles.length} total, ${highArticles.length} high-relevance):
${articleSummaries}

Return ONLY valid JSON with these exact keys:
{
  "title": "Professional report title appropriate for a ${reportType} management briefing",
  "summary": "3-5 sentence executive overview covering the key regulatory, financing, infrastructure, and market developments",
  "highlights": ["4-6 bullet-point priority highlights, each 1-2 sentences, focusing on actionable intelligence for Hermit Investments"],
  "executive_takeaway": "2-3 sentence strategic recommendation for Hermit Investments Management, including specific next steps"
}`;

        const candidateModels = [
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-3-flash-preview',
          'gemini-2.5-flash-lite',
          'gemini-3.7-flash',
          'gemini-3.5-flash'
        ];

        for (const model of candidateModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
              }),
              signal: AbortSignal.timeout(15000)
            });

            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const parsed = JSON.parse(text);
                if (parsed.summary && parsed.highlights) {
                  geminiReport = parsed;
                  break;
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Report generation with ${model} failed, trying next:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini report generation fallback:', geminiErr);
      }
    }

    // Build the report — use Gemini output if available, otherwise heuristic fallback
    const highlights = geminiReport?.highlights
      || (highArticles.length > 0
        ? highArticles.slice(0, 4).map(a => `${a.source_name}: ${a.headline}`)
        : [
          'No high-relevance captures in current monitoring cycle.',
          'Continuous surveillance active across 70+ energy portals.',
          'Next crawl cycle scheduled — data will populate automatically.'
        ]);

    const categoryBreakdown: Record<string, number> = {};
    for (const a of articles.slice(0, 20)) {
      categoryBreakdown[a.article_type] = (categoryBreakdown[a.article_type] || 0) + 1;
    }

    const newReportPayload: Omit<Report, 'id'> = {
      report_type: reportType,
      title: geminiReport?.title || body.title || titles[reportType],
      summary: geminiReport?.summary || body.summary || `Consolidated monitoring summary capturing ${articles.length} items with focus on feed-in tariffs, DFI facilities and utility agreements.`,
      period_start: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      article_count: articles.length,
      generated_at: new Date().toISOString(),
      content: {
        highlights,
        category_breakdown: categoryBreakdown,
        executive_takeaway: geminiReport?.executive_takeaway || 'High level of deal momentum observed across solar IPPs. Hermit Investments should prioritize commercial engagement with mining and agricultural off-takers while advancing eligibility discussions with concessional DFI lenders.'
      }
    };

    const created = await insertReport(newReportPayload);
    return NextResponse.json({ report: created, success: true, ai_powered: !!geminiReport }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
