import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase';
import { Article } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: 'Gemini API key is not configured on the server. Please check your environment variables.' },
        { status: 200 }
      );
    }

    // Retrieve industry articles to ground the response with factual Zimbabwean data
    let articles: Article[] = [];
    try {
      articles = await fetchArticles();
    } catch {
      articles = [];
    }

    // Format top 12 relevant articles as numbered context references
    const contextList = articles.slice(0, 12).map((a, idx) => {
      const num = idx + 1;
      const snippet = a.summary || a.ai_summary || a.raw_content?.slice(0, 200) || 'N/A';
      return `[${num}] "${a.headline}" | Source: ${a.source_name} | Type: ${a.article_type} | Relevance: ${a.relevance_level} | Summary: ${snippet}`;
    }).join('\n');

    const systemPrompt = `You are the Hermit Intelligence Assistant — an elite Zimbabwean energy sector and policy intelligence advisor.
You provide precise, reliable, and corporate-ready answers regarding Zimbabwean renewable energy (solar, hydro, biomass), IPPs, ZERA regulations, SAPP power trading, currency dynamics, and infrastructure developments.

Ground your response in the provided monitored industry articles where applicable.
Whenever you cite facts, quotes, policies, or announcements from the articles below, insert citation markers in the format [1], [2], etc., corresponding to the source number.

If the user query cannot be fully answered by the sources, use your general knowledge of Zimbabwe's energy landscape (ZERA, ZESA, ZETDC, Kariba Dam, Hwange, IPP policy, net metering) while maintaining high analytical rigor.

Monitored Industry Context:
${contextList || 'No recent articles retrieved.'}

User Query:
${query.trim()}

Respond in clear, professional markdown. Use bullet points or short paragraphs for readability.`;

    // Resilient model fallback list (prioritizing high-availability, instant-response models)
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash'
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
