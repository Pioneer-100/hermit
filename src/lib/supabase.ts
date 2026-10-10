import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, Report, AlertLog, DashboardStats } from '@/types';
import { INITIAL_ARTICLES, INITIAL_STATS, INITIAL_REPORTS, INITIAL_ALERTS } from './mock-data';
import { MONITORED_SOURCES } from './sources';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('xxxxx') || supabaseAnonKey.includes('...')) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

// Global in-memory storage for resilient fallback / local demo mode
let articlesStore: Article[] = [...INITIAL_ARTICLES];
let reportsStore: Report[] = [...INITIAL_REPORTS];
let alertsStore: AlertLog[] = [...INITIAL_ALERTS];

export async function fetchArticles(filters?: {
  category?: string;
  relevance?: string;
  type?: string;
  search?: string;
  sourceId?: number;
}): Promise<Article[]> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      let query = sb.from('articles').select('*').order('captured_at', { ascending: false });
      if (filters?.relevance && filters.relevance !== 'all') {
        query = query.eq('relevance_level', filters.relevance);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('article_type', filters.type);
      }
      if (filters?.sourceId) {
        query = query.eq('source_id', filters.sourceId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Article[];
      }
    } catch (e) {
      console.warn('Supabase query error, falling back to local store:', e);
    }
  }

  // Fallback in-memory
  let result = [...articlesStore];
  if (filters?.relevance && filters.relevance !== 'all') {
    result = result.filter(a => a.relevance_level === filters.relevance);
  }
  if (filters?.type && filters.type !== 'all') {
    result = result.filter(a => a.article_type === filters.type);
  }
  if (filters?.sourceId) {
    result = result.filter(a => a.source_id === filters.sourceId);
  }
  if (filters?.category && filters.category !== 'all') {
    const sourceIdsInCategory = MONITORED_SOURCES.filter(s => s.category === filters.category).map(s => s.id);
    result = result.filter(a => a.source_id && sourceIdsInCategory.includes(a.source_id));
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(a => 
      a.headline.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      a.source_name.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
}

export async function fetchArticleById(id: number): Promise<Article | null> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('articles').select('*').eq('id', id).single();
      if (!error && data) return data as Article;
    } catch (e) {
      console.warn('Supabase fetchById error:', e);
    }
  }
  return articlesStore.find(a => a.id === id) || null;
}

export async function insertArticle(article: Omit<Article, 'id'>): Promise<Article> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('articles').insert([article]).select().single();
      if (!error && data) {
        return data as Article;
      }
    } catch (e) {
      console.warn('Supabase insert error:', e);
    }
  }

  const newArticle: Article = {
    ...article,
    id: articlesStore.length > 0 ? Math.max(...articlesStore.map(a => a.id)) + 1 : 1
  };
  articlesStore.unshift(newArticle);
  return newArticle;
}

export async function updateArticleReview(id: number, reviewed: boolean): Promise<boolean> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from('articles').update({ is_reviewed: reviewed }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update review error:', e);
    }
  }
  const item = articlesStore.find(a => a.id === id);
  if (item) {
    item.is_reviewed = reviewed;
    return true;
  }
  return false;
}

export async function fetchReports(): Promise<Report[]> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('reports').select('*').order('generated_at', { ascending: false });
      if (!error && data) return data as Report[];
    } catch (e) {
      console.warn('Supabase fetchReports error:', e);
    }
  }
  return reportsStore;
}

export async function insertReport(report: Omit<Report, 'id'>): Promise<Report> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('reports').insert([report]).select().single();
      if (!error && data) return data as Report;
    } catch (e) {
      console.warn('Supabase insertReport error:', e);
    }
  }
  const newReport: Report = {
    ...report,
    id: reportsStore.length > 0 ? Math.max(...reportsStore.map(r => r.id)) + 1 : 1
  };
  reportsStore.unshift(newReport);
  return newReport;
}

export async function fetchAlerts(): Promise<AlertLog[]> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('alerts').select('*').order('dispatched_at', { ascending: false });
      if (!error && data) return data as AlertLog[];
    } catch (e) {
      console.warn('Supabase fetchAlerts error:', e);
    }
  }
  return alertsStore;
}

export async function insertAlertLog(alert: Omit<AlertLog, 'id'>): Promise<AlertLog> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('alerts').insert([alert]).select().single();
      if (!error && data) return data as AlertLog;
    } catch (e) {
      console.warn('Supabase insertAlertLog error:', e);
    }
  }
  const newAlert: AlertLog = {
    ...alert,
    id: alertsStore.length > 0 ? Math.max(...alertsStore.map(a => a.id)) + 1 : 1
  };
  alertsStore.unshift(newAlert);
  return newAlert;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const articles = await fetchArticles();
  const highFlags = articles.filter(a => a.relevance_level === 'high').length;
  const pending = articles.filter(a => !a.is_reviewed).length;

  return {
    capturedToday: articles.length,
    highRelevanceFlags: highFlags,
    pendingReview: pending,
    sourcesMonitored: MONITORED_SOURCES.length,
    sourcesActive: MONITORED_SOURCES.length
  };
}
