import { z } from 'zod';

export const CrawlRequestSchema = z.object({
  sourceId: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  googleSearchOnly: z.boolean().optional()
});

export const InsertArticleSchema = z.object({
  headline: z.string().min(3).max(500),
  source_id: z.coerce.number().int().positive(),
  source_name: z.string().min(1).max(150),
  author: z.string().max(150).optional(),
  summary: z.string().min(5),
  publication_date: z.string().datetime().optional().or(z.string()),
  key_stakeholders: z.array(z.string()).default([]),
  relevance_to_hermit: z.string().optional(),
  source_link: z.string().url().or(z.string()),
  raw_content: z.string().optional(),
  relevance_score: z.coerce.number().min(0).max(100).default(50),
  relevance_level: z.enum(['high', 'medium', 'low']).default('medium'),
  article_type: z.enum(['regulatory', 'tariff', 'funding', 'infrastructure', 'market', 'general']).default('general'),
  ai_summary: z.string().optional(),
  ai_impact_note: z.string().optional(),
  suggested_actions: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  risk_rating: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

export const GeminiAnalysisSchema = z.object({
  relevance_score: z.number().min(0).max(100),
  relevance_level: z.enum(['high', 'medium', 'low']),
  article_type: z.enum(['regulatory', 'tariff', 'funding', 'infrastructure', 'market', 'general']),
  ai_summary: z.string(),
  ai_impact_note: z.string(),
  key_stakeholders: z.array(z.string()),
  relevance_to_hermit: z.string(),
  suggested_actions: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  risk_rating: z.enum(['low', 'medium', 'high', 'critical'])
});

export const AlertDispatchSchema = z.object({
  articleId: z.coerce.number().int().positive()
});

export const AIChatQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(2000, 'Query exceeds 2000 characters')
});

export const GenerateReportSchema = z.object({
  report_type: z.enum(['daily', 'weekly', 'monthly', 'special']).default('daily')
});
