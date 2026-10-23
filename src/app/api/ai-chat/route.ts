import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles, fetchMarketPrecedents } from '@/lib/supabase';
import { Article, MarketPrecedent } from '@/types';
import { authenticateApiRequest } from '@/lib/api-auth';
import { checkDistributedRateLimit } from '@/lib/rate-limiter';
import { AIChatQuerySchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const auth = await authenticateApiRequest(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limit LLM requests (30 queries per min per user/IP)
    const clientIdentifier = auth.user?.id || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = await checkDistributedRateLimit(`chat_${clientIdentifier}`, 30, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded. Please wait a moment before sending another query.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = AIChatQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const query = parsed.data.query;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: 'Gemini API key is not configured on the server. Please check your environment variables.' },
        { status: 200 }
      );
    }

    // Retrieve live industry articles and learned historical precedents
    let articles: Article[] = [];
    let precedents: MarketPrecedent[] = [];
    try {
      [articles, precedents] = await Promise.all([
        fetchArticles(),
        fetchMarketPrecedents()
      ]);
    } catch {
      articles = [];
      precedents = [];
    }

    // Format top 12 relevant articles as numbered context references
    const contextList = articles.slice(0, 12).map((a, idx) => {
      const num = idx + 1;
      const snippet = a.summary || a.ai_summary || a.raw_content?.slice(0, 200) || 'N/A';
      return `[${num}] "${a.headline}" | Source: ${a.source_name} | Type: ${a.article_type} | Relevance: ${a.relevance_level} | Summary: ${snippet}`;
    }).join('\n');

    // Format historical cause-and-effect rules
    const precedentsList = precedents.map((p) => {
      return `- Category: ${p.trigger_category} | When: "${p.trigger_event}" -> Historical Reaction: "${p.market_reaction}" -> Strategic Rule: "${p.strategic_rule}" (Confidence: ${Math.round((p.confidence_score || 0.85) * 100)}%)`;
    }).join('\n');

    const systemPrompt = `You are the Hermit Intelligence Assistant — an elite Zimbabwean energy sector and policy intelligence advisor.
You provide precise, reliable, and corporate-ready answers regarding Zimbabwean renewable energy (solar, hydro, biomass), IPPs, ZERA regulations, SAPP power trading, currency dynamics, and infrastructure developments.

Ground your response in the provided monitored industry articles where applicable.
Whenever you cite facts, quotes, policies, or announcements from the articles below, insert citation markers in the format [1], [2], etc., corresponding to the source number.

If you recognize a historical pattern or precedent from the learned market memory list, explicitly state:
"Based on historical precedent in Zimbabwe's energy sector: [explain cause and effect, and what is likely to happen next]."

Available Monitored Articles:
${contextList}

Learned Historical Precedents & Market Memory:
${precedentsList}

User Inquiry: ${query}

Provide a well-structured, objective, and executive-level answer.`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite'
    ];

    let answer = '';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000
            }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            answer = text;
            break;
          }
        } else {
          lastError = await res.text();
          console.warn(`Model ${model} returned status ${res.status}`);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${model} failed:`, lastError);
      }
    }

    if (!answer) {
      console.error('All Gemini candidate models failed. Last error:', lastError);
      return NextResponse.json(
        { answer: 'An error occurred while communicating with the Gemini intelligence service. Please try again in a moment.' },
        { status: 200 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json(
      { answer: 'Unable to process your inquiry at this moment. Please check your connection and try again.' },
      { status: 200 }
    );
  }
}
