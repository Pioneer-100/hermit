export type RelevanceLevel = 'high' | 'medium' | 'low';

export type ArticleType = 
  | 'tariff_change'
  | 'new_regulation'
  | 'funding_announcement'
  | 'project_update'
  | 'policy_change'
  | 'partnership'
  | 'general'
  | 'event'
  | 'nexus'
  | 'waste_to_energy';

export type SourceCategory = 
  | 'newspapers'
  | 'government'
  | 'regulators'
  | 'dfi'
  | 'renewables'
  | 'intl_media'
  | 'social'
  | 'nexus_waste'
  | 'tenders_events';

export interface Source {
  id: number;
  name: string;
  url: string;
  category: SourceCategory | string;
  source_type: 'web' | 'rss' | 'social';
  crawl_config?: Record<string, any>;
  is_active: boolean;
  last_crawled_at: string | null;
  last_crawl_status: 'success' | 'error' | 'idle' | 'running';
  created_at?: string;
}

export interface Article {
  id: number;
  publication_date: string | null;
  headline: string;
  source_id: number | null;
  source_name: string;
  author: string | null;
  summary: string | null;
  key_stakeholders: string[];
  relevance_to_hermit: string | null;
  source_link: string;
  raw_content?: string | null;
  relevance_score: number;
  relevance_level: RelevanceLevel;
  article_type: ArticleType;
  ai_summary: string | null;
  ai_impact_note: string | null;
  suggested_actions?: string[];
  deadline?: string | null;
  sector?: string | null;
  is_reviewed: boolean;
  is_alert_sent: boolean;
  captured_at: string;
  processed_at: string | null;
}

export interface DailyBrief {
  id: string;
  date: string;
  headline: string;
  executive_summary: string;
  market_sentiment: 'bullish' | 'bearish' | 'neutral' | 'cautious';
  risk_index: number; // 0 - 100
  risk_label: string;
  sector_breakdown: {
    category: string;
    percentage: number;
    count: number;
    color: string;
  }[];
  strategic_pillars: {
    title: string;
    category: string;
    badge: string;
    impact: string;
    takeaway: string;
    related_article_id?: number;
    source: string;
    time: string;
  }[];
  key_stakeholders_active: {
    name: string;
    role: string;
    stance: 'favorable' | 'regulatory' | 'financing' | 'warning';
    mentions: number;
  }[];
  management_actions: {
    priority: 'immediate' | 'medium' | 'standard';
    action: string;
    owner: string;
  }[];
  total_articles_scanned: number;
  high_relevance_count: number;
}

export interface Report {
  id: number;
  report_type: 'daily' | 'weekly' | 'monthly' | 'special';
  title: string;
  summary: string | null;
  content: {
    highlights?: string[];
    category_breakdown?: Record<string, number>;
    articles?: Article[];
    executive_takeaway?: string;
  };
  period_start: string | null;
  period_end: string | null;
  article_count: number;
  generated_at: string;
}

export interface AlertLog {
  id: number;
  article_id: number;
  headline: string;
  source_name: string;
  relevance_level: string;
  recipient_email: string;
  status: 'sent' | 'pending' | 'failed';
  dispatched_at: string;
}

export interface DashboardStats {
  capturedToday: number;
  highRelevanceFlags: number;
  pendingReview: number;
  sourcesMonitored: number;
  sourcesActive: number;
}

export interface TrendTopic {
  topic: string;
  count: number;
  trend: string;
  riskLevel: 'HIGH' | 'MED' | 'LOW';
  category: string;
  color: string;
  velocity: string;
}

export interface TrendDataPoint {
  date: string;
  count: number;
  label: string;
}

export interface TrendAnalytics {
  topics: TrendTopic[];
  timeline: TrendDataPoint[];
  totalMentions: number;
  primaryRiskTopic: string;
  averageRiskIndex: number;
  typeBreakdown?: {
    type: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  riskBreakdown?: {
    level: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  sourceBreakdown?: {
    category: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  stakeholderHeatmap?: {
    name: string;
    mentions: number;
    sentiment: 'neutral' | 'critical' | 'constructive';
  }[];
}

export type UserRole = 'executive' | 'director' | 'analyst' | 'engineer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  title?: string;
  avatar_url?: string;
}

export interface HermitProject {
  id: number;
  name: string;
  technology: 'Solar PV' | 'Solar + BESS' | 'Hydro' | 'Wind';
  capacity_mw: number;
  location: string;
  status: 'pipeline' | 'under_construction' | 'operational' | 'feasibility';
  target_cod?: string;
  lead_manager?: string;
  key_tags?: string[];
}

export interface ActionTask {
  id: number;
  title: string;
  priority: 'immediate' | 'medium' | 'standard';
  status: 'pending' | 'in_progress' | 'completed';
  article_id?: number;
  project_id?: number;
  assigned_to_name?: string;
  assigned_to_role?: string;
  due_date?: string;
  notes?: string;
}

export interface MarketPrecedent {
  id: number;
  trigger_category: string;
  trigger_event: string;
  historical_date: string;
  market_reaction: string;
  subsequent_policy_shift?: string;
  strategic_rule: string;
  confidence_score: number;
  source_article_id?: number;
  tags: string[];
}
