'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CrawlModal from '@/components/CrawlModal';
import ExecutiveDailyBrief from '@/components/ExecutiveDailyBrief';
import ExecutiveGreetingBanner from '@/components/ExecutiveGreetingBanner';
import { useAuth } from '@/components/AuthContext';
import { Article, DashboardStats, DailyBrief } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';
import { 
  Search, 
  Radio, 
  Clock, 
  Play,
  BookOpen
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

interface DashboardClientProps {
  initialArticles: Article[];
  initialStats: DashboardStats;
  initialDailyBrief: DailyBrief;
}

export default function DashboardClient({
  initialArticles,
  initialStats,
  initialDailyBrief
}: DashboardClientProps) {
  const { currentUser } = useAuth();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief>(initialDailyBrief);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [isRegeneratingBrief, setIsRegeneratingBrief] = useState(false);
  const [viewMode, setViewMode] = useState<'brief' | 'feed'>('brief');

  // Feed filtering states
  const [filterRelevance, setFilterRelevance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUnreviewed, setOnlyUnreviewed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    void fetch('/api/daily-brief')
      .then(async response => {
        if (!response.ok) throw new Error(`Daily briefing request failed with status ${response.status}`);
        const data = await response.json();
        if (isMounted && data.brief) setDailyBrief(data.brief);
      })
      .catch(error => {
        console.warn('Failed to load the generated daily briefing:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async () => {
    try {
      const [artRes, statsRes, briefRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/stats'),
        fetch('/api/daily-brief')
      ]);
      if (artRes.ok) {
        const artData = await artRes.json();
        if (Array.isArray(artData.articles)) setArticles(artData.articles);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }
      if (briefRes.ok) {
        const briefData = await briefRes.json();
        if (briefData.brief) setDailyBrief(briefData.brief);
      }
    } catch (e) {
      console.warn('API load failed, using current state:', e);
    }
  };

  const handleRegenerateBrief = async () => {
    setIsRegeneratingBrief(true);
    try {
      let token = '';
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb.auth.getSession();
        token = data.session?.access_token || '';
      }
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/daily-brief', { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        if (data.brief) setDailyBrief(data.brief);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingBrief(false);
    }
  };

  const handleReviewToggle = async (id: number, reviewed: boolean) => {
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ is_reviewed: reviewed })
      });
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_reviewed: reviewed } : a));
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(prev => prev ? { ...prev, is_reviewed: reviewed } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchAlert = async (id: number) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ articleId: id })
      });
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_alert_sent: true } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectArticleById = (articleId: number) => {
    const found = articles.find(a => a.id === articleId);
    if (found) {
      setSelectedArticle(found);
    } else if (articles.length > 0) {
      setSelectedArticle(articles[0]);
    }
  };

  // Filtered feed
  const filteredArticles = articles.filter(a => {
    const matchesRelevance = filterRelevance === 'all' || a.relevance_level === filterRelevance;
    const matchesUnreviewed = !onlyUnreviewed || !a.is_reviewed;
    const matchesCategory = selectedCategory === 'all' || a.article_type === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.key_stakeholders && a.key_stakeholders.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesRelevance && matchesUnreviewed && matchesCategory && matchesSearch;
  });

  const pendingCount = articles.filter(a => !a.is_reviewed && a.relevance_level === 'high').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      {/* Header Bar - Completely Dynamic Daily Report Title */}
      <Header
        title={`Daily Energy Intelligence Brief — ${dailyBrief.date}`}
        subtitle={`What's Up Today • Synthesized across ${dailyBrief.total_articles_scanned} captures from 55 Clean Energy Portals (6 Pillars)`}
        onRefresh={loadData}
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
        alertCount={pendingCount}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* Dynamic Catchy Greeting Banner with realistic typewriter effect */}
        <ExecutiveGreetingBanner userName={currentUser?.full_name} />
        
        {/* Executive Mode Selector & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c2242]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-blue-400/25 shadow-lg">
          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#052618]/50 p-1 rounded-xl border border-blue-500/20 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('brief')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                viewMode === 'brief'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-950/40 border border-blue-400/30'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="hidden sm:inline">Daily Executive Briefing</span>
              <span className="sm:hidden">Executive Brief</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            </button>

            <button
              onClick={() => setViewMode('feed')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                viewMode === 'feed'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-950/40 border border-blue-400/30'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="hidden sm:inline">Live Intelligence Feed</span>
              <span className="sm:hidden">Live Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-600/30 text-cyan-300 border border-blue-500/40 shrink-0">
                {articles.length}
              </span>
            </button>
          </div>

          {/* Quick Info & Direct Jump */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-cyan-300/80 font-medium">
            <span className="hidden md:inline">Continuous clean surveillance active across <strong className="text-white">55 portals (6 Pillars)</strong></span>
            <span className="hidden md:inline">&bull;</span>
            <button
              onClick={() => setIsCrawlModalOpen(true)}
              className="text-cyan-300 font-bold hover:text-white flex items-center gap-1.5 transition-colors ml-auto sm:ml-0 active:scale-95"
            >
              <Play className="w-3 h-3 fill-blue-400 text-blue-400" />
              <span>Run Live Crawl</span>
            </button>
          </div>
        </div>

        {/* 4 Packed Executive KPI Metric Cards */}
        <StatsCards stats={stats} />

        {/* MODE 1: DAILY EXECUTIVE BRIEFING (Presented on Open) */}
        {viewMode === 'brief' && (
          <div className="space-y-5 sm:space-y-6">
            <ExecutiveDailyBrief
              brief={dailyBrief}
              onSelectArticle={handleSelectArticleById}
              onRegenerate={handleRegenerateBrief}
              isRegenerating={isRegeneratingBrief}
              onViewLiveFeed={() => setViewMode('feed')}
              onReviewToggle={handleReviewToggle}
              reviewedArticleIds={articles.filter(a => a.is_reviewed).map(a => a.id)}
            />
          </div>
        )}

        {/* MODE 2: LIVE INTELLIGENCE FEED */}
        {viewMode === 'feed' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="bg-[#0c2242]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3 text-white">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-blue-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter captures by headline, stakeholder, or keyword..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-blue-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#052618]/50 text-white placeholder:text-cyan-300/60 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <select
                  value={filterRelevance}
                  onChange={(e) => setFilterRelevance(e.target.value)}
                  className="text-xs border border-blue-500/30 rounded-xl px-2.5 sm:px-3 py-2 bg-[#0a1e38] text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 truncate"
                >
                  <option value="all">All Relevance</option>
                  <option value="high">Critical (≥ 75%)</option>
                  <option value="medium">Medium (50-74%)</option>
                  <option value="low">Low (&lt; 50%)</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs border border-blue-500/30 rounded-xl px-2.5 sm:px-3 py-2 bg-[#0a1e38] text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 truncate"
                >
                  <option value="all">All Article Types</option>
                  <option value="tariff_change">Tariff Changes</option>
                  <option value="new_regulation">New Regulations</option>
                  <option value="funding_announcement">Funding Announcements</option>
                  <option value="project_update">Project Updates</option>
                  <option value="policy_change">Policy Changes</option>
                  <option value="partnership">Partnerships & PPAs</option>
                  <option value="general">General Energy</option>
                </select>

                <button
                  onClick={() => setOnlyUnreviewed(!onlyUnreviewed)}
                  className={`col-span-2 sm:col-span-1 text-xs px-3 py-2 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 active:scale-95 ${
                    onlyUnreviewed
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                      : 'bg-[#0a1e38] text-cyan-200 border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Sign-off</span>
                </button>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              {filteredArticles.length === 0 ? (
                <div className="bg-[#08172c]/90 backdrop-blur-md rounded-2xl border border-blue-500/20 p-8 text-center text-cyan-200/70 text-xs">
                  No articles match your current filter parameters.
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    onClick={setSelectedArticle}
                    onReviewToggle={handleReviewToggle}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* Article Review & Impact Note Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onReviewToggle={handleReviewToggle}
        onDispatchAlert={handleDispatchAlert}
      />

      {/* Live Crawler Trigger Modal */}
      <CrawlModal
        isOpen={isCrawlModalOpen}
        onClose={() => setIsCrawlModalOpen(false)}
        onCrawlComplete={() => {
          setIsCrawlModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
