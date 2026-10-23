import { ArticleType, RelevanceLevel } from '@/types';
import { z } from 'zod';

const GeminiResponseSchema = z.object({
  article_type: z.enum([
    'tariff_change',
    'new_regulation',
    'funding_announcement',
    'project_update',
    'policy_change',
    'partnership',
    'general'
  ]).default('general'),
  relevance_score: z.coerce.number().min(0).max(1).default(0.7),
  relevance_level: z.enum(['high', 'medium', 'low']).default('medium'),
  relevance_to_hermit: z.string().default('Relevant to Zimbabwe energy sector developments.'),
  key_stakeholders: z.array(z.string()).default([]),
  ai_summary: z.string().default(''),
  ai_impact_note: z.string().default(''),
  suggested_actions: z.array(z.string()).default([])
});

interface GeminiAnalysisResult {
  article_type: ArticleType;
  relevance_score: number;
  relevance_level: RelevanceLevel;
  relevance_to_hermit: string;
  key_stakeholders: string[];
  ai_summary: string;
  ai_impact_note: string;
  suggested_actions: string[];
}

export async function analyzeArticleWithGemini(
  headline: string,
  content: string,
  sourceName: string
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && !apiKey.includes('AIzaSy_fake') && apiKey.length > 10) {
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash'
    ];

    const prompt = `You are the Principal Intelligence Director at Hermit Sustainability Advisory (HSA), a Zimbabwean advisory firm specializing in renewable energy IPPs, climate finance, food-water-energy nexus, waste-to-energy, environmental compliance, and stakeholder mobilisation.

Analyze this new media capture:
SOURCE: ${sourceName}
HEADLINE: ${headline}
CONTENT EXCERPT: ${content}

Analyze the strategic implications and return ONLY a valid JSON object with these exact keys:
{
  "article_type": "tariff_change" | "new_regulation" | "funding_announcement" | "project_update" | "policy_change" | "partnership" | "general",
  "relevance_score": number between 0.0 and 1.0,
  "relevance_level": "high" | "medium" | "low",
  "relevance_to_hermit": "Clear, concise analysis of why this matters for Hermit Investments' commercial and pipeline interests in Zimbabwe",
  "key_stakeholders": ["List of organizations or individuals quoted or involved"],
  "ai_summary": "Factual 2-sentence synopsis of the development",
  "ai_impact_note": "Strategic implications for Hermit Investments and 2-3 concrete recommended options for Management discussion",
  "suggested_actions": ["Action 1", "Action 2", "Action 3"]
}`;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            // Remove markdown code fences if model enclosed JSON
            const cleanText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const rawJson = JSON.parse(cleanText);
            const validated = GeminiResponseSchema.safeParse(rawJson);
            
            if (validated.success) {
              const parsed = validated.data;
              return {
                article_type: parsed.article_type,
                relevance_score: parsed.relevance_score,
                relevance_level: parsed.relevance_level,
                relevance_to_hermit: parsed.relevance_to_hermit,
                key_stakeholders: parsed.key_stakeholders.length > 0 ? parsed.key_stakeholders : [sourceName],
                ai_summary: parsed.ai_summary || headline,
                ai_impact_note: parsed.ai_impact_note || 'Monitor further implementation announcements.',
                suggested_actions: parsed.suggested_actions.length > 0 ? parsed.suggested_actions : ['Review with communications team']
              };
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini analysis with ${model} failed, trying next model:`, err);
      }
    }
  }

  // Intelligent fallback heuristics (for offline demo / zero-setup presentation)
  const lower = (headline + ' ' + content).toLowerCase();
  
  let type: ArticleType = 'general';
  let score = 0.55;
  let level: RelevanceLevel = 'medium';

  if (lower.includes('tariff') || lower.includes('feed-in') || lower.includes('pricing') || lower.includes('rate')) {
    type = 'tariff_change';
    score = 0.92;
    level = 'high';
  } else if (lower.includes('fund') || lower.includes('facility') || lower.includes('grant') || lower.includes('million') || lower.includes('loan')) {
    type = 'funding_announcement';
    score = 0.89;
    level = 'high';
  } else if (lower.includes('regulation') || lower.includes('statutory') || lower.includes('si ') || lower.includes('rebate') || lower.includes('gazette')) {
    type = 'new_regulation';
    score = 0.86;
    level = 'high';
  } else if (lower.includes('policy') || lower.includes('minister') || lower.includes('ndc') || lower.includes('cabinet')) {
    type = 'policy_change';
    score = 0.75;
    level = 'medium';
  } else if (lower.includes('agreement') || lower.includes('mou') || lower.includes('partnership') || lower.includes('signs')) {
    type = 'partnership';
    score = 0.72;
    level = 'medium';
  } else if (lower.includes('grid') || lower.includes('solar') || lower.includes('commission') || lower.includes('megawatt') || lower.includes('mw')) {
    type = 'project_update';
    score = 0.65;
    level = 'medium';
  }

  return {
    article_type: type,
    relevance_score: score,
    relevance_level: level,
    relevance_to_hermit: `Direct relevance to Hermit Investments' energy development portfolio: ${headline.slice(0, 100)}. Potential impacts on project economics and grid connection feasibility.`,
    key_stakeholders: [sourceName, 'Ministry of Energy', 'ZERA'],
    ai_summary: `${sourceName} reports that ${headline.toLowerCase()}. The development signals evolving regulatory and commercial dynamics within the national energy matrix.`,
    ai_impact_note: `1. Re-evaluate project pipeline economics against this announcement.\n2. Engage industry liaisons to clarify off-take and compliance guidelines.\n3. Present review to Hermit Investments Management in upcoming weekly strategy briefing.`,
    suggested_actions: [
      'Document in weekly executive briefing',
      'Verify details with primary institutional source',
      'Assess potential financial model impacts'
    ]
  };
}
