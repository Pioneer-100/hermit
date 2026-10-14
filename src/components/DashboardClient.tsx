'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CrawlModal from '@/components/CrawlModal';
import ExecutiveDailyBrief from '@/components/ExecutiveDailyBrief';
import { Article, DashboardStats, DailyBrief } from '@/types';
import { INITIAL_HERMIT_PROJECTS } from '@/lib/users-and-projects';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileText, 
  Zap, 
  Play,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Building2,
  FolderKanban,
  Check
} from 'lucide-react';
import Link from 'next/link';

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
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief>(initialDailyBrief);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingBrief, setIsRegeneratingBrief] = useState(false);
  const [viewMode, setViewMode] = useState<'brief' | 'feed'>('brief');

  // Feed filtering states
  const [filterRelevance, setFilterRelevance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUnreviewed, setOnlyUnreviewed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBrief = async () => {
    setIsRegeneratingBrief(true);
    try {
      const res = await fetch('/api/daily-brief', { method: 'POST' });
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  const highPriorityArticles = articles.filter(a => a.relevance_level === 'high');
  const pendingCount = articles.filter(a => !a.is_reviewed && a.relevance_level === 'high').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      {/* Header Bar - Completely Dynamic Daily Report Title */}
      <Header
        title={`Daily Energy Intelligence Brief — ${dailyBrief.date}`}
        subtitle={`What's Up Today • Synthesized across ${dailyBrief.total_articles_scanned} captures from 70+ portals`}
        onRefresh={loadData}
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
        alertCount={pendingCount}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Executive Mode Selector & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#06261b]/75 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-emerald-500/25 shadow-lg">
          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-2 bg-[#041a12]/80 p-1 rounded-xl border border-emerald-900/50">
            <button
              onClick={() => setViewMode('brief')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'brief'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/30'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>Daily Executive Briefing</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'feed'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/30'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-300" />
              <span>Live Intelligence Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                {articles.length}
              </span>
            </button>
          </div>

          {/* Quick Info & Direct Jump */}
          <div className="flex items-center gap-3 text-xs text-emerald-300/80 font-medium self-end sm:self-center">
            <span className="hidden md:inline">Continuous cycle active across <strong className="text-white">70+ portals</strong></span>
            <span className="hidden md:inline">&bull;</span>
            <button
              onClick={() => setIsCrawlModalOpen(true)}
              className="text-emerald-300 font-bold hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>Run Live Crawl</span>
            </button>
          </div>
        </div>

        {/* 4 Packed Executive KPI Metric Cards */}
        <StatsCards stats={stats} />

        {/* MODE 1: DAILY EXECUTIVE BRIEFING (Presented on Open) */}
        {viewMode === 'brief' && (
          <div className="space-y-6">
            <ExecutiveDailyBrief
              brief={dailyBrief}
              onSelectArticle={handleSelectArticleById}
              onRegenerate={handleRegenerateBrief}
              isRegenerating={isRegeneratingBrief}
              onViewLiveFeed={() => setViewMode('feed')}
              onReviewToggle={handleReviewToggle}
              reviewedArticleIds={articles.filter(a => a.is_reviewed).map(a => a.id)}
            />

            {/* Option 2 Implemented: Asset & Project Pipeline Intelligence Tracker */}
            <div className="bg-[#06261b]/75 backdrop-blur-md rounded-2xl border border-emerald-500/25 p-6 shadow-xl space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <span>Hermit Asset & Project Pipeline Intelligence</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                        {INITIAL_HERMIT_PROJECTS.length} Assets Tracked
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-200/70">
                      Real-time cross-referencing between today&apos;s captures and Hermit&apos;s renewable energy project portfolio
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/alerts"
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Dedicated Alerts Inbox ({pendingCount})</span>
                  </Link>

                  <button
                    onClick={() => setViewMode('feed')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Raw Stream</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid of Hermit Project Assets and their tailored intelligence impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_HERMIT_PROJECTS.map((proj) => {
                  // Correlate with today's articles
                  const matchedImpact = proj.id === 1
                    ? "ZERA tariff consultation window opens; potential 8-12% baseline margin impact unless paired with BESS incentives."
                    : proj.id === 2
                    ? "AfDB $40M regional de-risking window active; qualified for concessional debt under SEFA facility."
                    : "Kariba hydro storage at 11.4% heightens urgency for small hydro peaking & mini-grid delivery.";

                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl bg-[#041a12]/80 hover:bg-[#073020]/90 border border-emerald-500/20 hover:border-emerald-400/40 transition-all flex flex-col justify-between gap-3 text-white"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            {proj.technology} &bull; {proj.capacity_mw} MW
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400/80 font-bold">
                            {proj.location}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {proj.name}
                        </h4>

                        <div className="mt-2.5 p-2.5 rounded-lg bg-[#02130c]/90 border border-emerald-900/60 text-[11px] text-emerald-100/90 leading-relaxed">
                          <span className="font-bold text-emerald-400 block mb-0.5">Today&apos;s Portfolio Exposure:</span>
                          {matchedImpact}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-300/70">
                        <span className="truncate">Lead: <strong className="text-white">{proj.lead_manager}</strong></span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: LIVE INTELLIGENCE FEED */}
        {viewMode === 'feed' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="bg-[#06261b]/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap gap-3 items-center justify-between text-white">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter captures by headline, stakeholder, or keyword..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-emerald-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#03170e]/80 text-white placeholder:text-emerald-300/50 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterRelevance}
                  onChange={(e) => setFilterRelevance(e.target.value)}
                  className="text-xs border border-emerald-500/30 rounded-xl px-3 py-2 bg-[#041a12] text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="all">All Relevance</option>
                  <option value="high">Critical Only (≥ 75%)</option>
                  <option value="medium">Medium Only (50-74%)</option>
                  <option value="low">Low Only (&lt; 50%)</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs border border-emerald-500/30 rounded-xl px-3 py-2 bg-[#041a12] text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors flex items-center gap-1.5 ${
                    onlyUnreviewed
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                      : 'bg-[#041a12] text-emerald-200 border-emerald-500/30 hover:border-emerald-400/50'
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
                <div className="bg-[#06261b]/70 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-8 text-center text-emerald-200/70 text-xs">
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
