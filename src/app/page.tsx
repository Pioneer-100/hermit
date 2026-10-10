'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CrawlModal from '@/components/CrawlModal';
import ExecutiveDailyBrief from '@/components/ExecutiveDailyBrief';
import { Article, DashboardStats, DailyBrief } from '@/types';
import { INITIAL_ARTICLES, INITIAL_STATS, INITIAL_DAILY_BRIEF } from '@/lib/mock-data';
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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    capturedToday: 0,
    highRelevanceFlags: 0,
    pendingReview: 0,
    sourcesMonitored: 70,
    sourcesActive: 70
  });
  const [dailyBrief, setDailyBrief] = useState<DailyBrief>(INITIAL_DAILY_BRIEF);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      console.warn('API load failed, using local seed state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      {/* Header Bar */}
      <Header
        title="Intelligence Command Center"
        subtitle="Energy Sector Media Surveillance & Executive Daily Briefing"
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
            />

            {/* Quick Glimpse: Urgent Action Queue beneath the Brief */}
            <div className="bg-[#06261b]/75 backdrop-blur-md rounded-2xl border border-emerald-500/25 p-6 shadow-xl space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Priority Alerts Requiring Attention
                    </h3>
                    <p className="text-[11px] text-emerald-200/70">
                      High-relevance captures requiring Communications Officer review & sign-off
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewMode('feed')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Explore All {articles.length} Raw Captures</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {highPriorityArticles.slice(0, 4).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="p-4 rounded-xl bg-[#041a12]/80 hover:bg-[#073020]/90 border border-emerald-500/20 hover:border-emerald-400/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 border-l-4 border-l-rose-500 text-white"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                          {art.source_name}
                        </span>
                        <span className="text-[10px] font-bold text-rose-300 font-mono">
                          {Math.round(art.relevance_score * 100)}% RELEVANCE
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {art.headline}
                      </h4>

                      <p className="text-[11px] text-emerald-100/75 line-clamp-2 mt-1 leading-relaxed">
                        {art.summary || art.headline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px]">
                      <span>
                        {art.is_reviewed ? (
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Reviewed
                          </span>
                        ) : (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> Awaiting Review
                          </span>
                        )}
                      </span>

                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <span>Action Note</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: LIVE INTELLIGENCE FEED STREAM (For deep dive exploration) */}
        {viewMode === 'feed' && (
          <div className="space-y-4">
            {/* Top Switchback Prompt */}
            <div className="bg-[#06261b]/80 border border-emerald-500/30 p-3.5 px-5 rounded-2xl flex items-center justify-between text-xs text-emerald-100 font-semibold shadow-md">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Viewing individual media captures. Need the high-level synthesis?</span>
              </div>
              <button
                onClick={() => setViewMode('brief')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold transition-all text-xs shadow"
              >
                Return to Daily Briefing
              </button>
            </div>

            {/* Cockpit 2-Column Packed Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (8 cols): Packed Curated Feed */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Feed Control Bar (Sticky on Scroll) */}
                <div className="sticky top-[69px] z-20 bg-[#06261b]/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                  {/* Search & Main Controls */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by headline, stakeholder, or keyword (ZERA, Kariba, AfDB)..."
                        className="w-full pl-9 pr-4 py-2 text-xs border border-emerald-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#03170e]/80 text-white placeholder:text-emerald-300/50 font-medium"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-300/70 hover:text-white font-bold"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {/* Category Dropdown */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-xs border border-emerald-500/30 rounded-xl px-3 py-2 bg-[#041a12] text-emerald-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="all">All Article Types</option>
                      <option value="tariff_change">Tariff Changes</option>
                      <option value="new_regulation">Regulations</option>
                      <option value="funding_announcement">Funding & Grants</option>
                      <option value="project_update">Infrastructure</option>
                      <option value="policy_change">Policy & Government</option>
                      <option value="partnership">PPAs & Deals</option>
                    </select>
                  </div>

                  {/* Relevance Filter Pills + Unreviewed Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-900/50 text-xs">
                    {/* Filter Pills */}
                    <div className="flex items-center bg-[#041a12]/80 p-1 rounded-xl text-xs font-semibold text-emerald-200/80 border border-emerald-900/50">
                      <button
                        onClick={() => setFilterRelevance('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          filterRelevance === 'all' 
                            ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                            : 'hover:text-white'
                        }`}
                      >
                        All ({articles.length})
                      </button>
                      <button
                        onClick={() => setFilterRelevance('high')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          filterRelevance === 'high' 
                            ? 'bg-rose-600 text-white font-bold shadow-xs' 
                            : 'text-rose-300 hover:bg-rose-950/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Critical ({articles.filter(a => a.relevance_level === 'high').length})
                      </button>
                      <button
                        onClick={() => setFilterRelevance('medium')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          filterRelevance === 'medium' 
                            ? 'bg-amber-600 text-white font-bold shadow-xs' 
                            : 'text-amber-300 hover:bg-amber-950/40'
                        }`}
                      >
                        Medium ({articles.filter(a => a.relevance_level === 'medium').length})
                      </button>
                      <button
                        onClick={() => setFilterRelevance('low')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          filterRelevance === 'low' 
                            ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                            : 'text-emerald-300 hover:bg-emerald-950/40'
                        }`}
                      >
                        Low ({articles.filter(a => a.relevance_level === 'low').length})
                      </button>
                    </div>

                    {/* Unreviewed Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-emerald-200/90 hover:text-white">
                      <input
                        type="checkbox"
                        checked={onlyUnreviewed}
                        onChange={(e) => setOnlyUnreviewed(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400 border-emerald-700 bg-[#041a12]"
                      />
                      <span>Show Unreviewed Only</span>
                    </label>
                  </div>
                </div>

                {/* Articles List (Digest-Packed Format) */}
                <div className="space-y-3">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onClick={(art) => setSelectedArticle(art)}
                        onReviewToggle={handleReviewToggle}
                      />
                    ))
                  ) : (
                    <div className="bg-[#06261b]/75 backdrop-blur-md rounded-2xl p-12 text-center border border-emerald-500/25 shadow-lg space-y-2 text-white">
                      <p className="text-sm font-semibold text-white">No monitored captures match your filters</p>
                      <p className="text-xs text-emerald-200/70">Try adjusting your keyword search or category filter above.</p>
                      <button
                        onClick={() => {
                          setFilterRelevance('all');
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setOnlyUnreviewed(false);
                        }}
                        className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                      >
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (4 cols): Action Center & Strategic Focus */}
              <div className="lg:col-span-4 space-y-4 sticky top-[69px]">
                
                {/* Widget 1: Priority Attention Queue (Requiring Comms Action) */}
                <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-5 shadow-xl space-y-3.5 text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Priority Attention
                        </h3>
                        <p className="text-[10px] text-emerald-200/70">Items scoring &ge; 75% relevance</p>
                      </div>
                    </div>

                    <Link
                      href="/alerts"
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                    >
                      <span>All ({highPriorityArticles.length})</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {highPriorityArticles.slice(0, 3).map((art) => (
                      <div
                        key={art.id}
                        className="p-3 rounded-xl bg-[#041a12]/80 hover:bg-[#073020]/90 border border-emerald-500/20 transition-all flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                              {art.source_name}
                            </span>
                            <span className="text-[10px] font-bold text-rose-300 font-mono">
                              {Math.round(art.relevance_score * 100)}% Match
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                            {art.headline}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40 text-[11px]">
                          <span className="text-slate-400 text-[10px]">
                            {art.is_reviewed ? (
                              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Reviewed
                              </span>
                            ) : (
                              <span className="text-amber-300 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" /> Pending Review
                              </span>
                            )}
                          </span>

                          <button
                            onClick={() => setSelectedArticle(art)}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Action Note &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widget 2: Energy Sector Intelligence Radar */}
                <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-5 shadow-xl space-y-3.5 text-white">
                  <div className="flex items-center gap-2 pb-3 border-b border-emerald-900/50">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Sector Radar
                      </h3>
                      <p className="text-[10px] text-emerald-200/70">Today&apos;s media concentration</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-emerald-200 mb-1">
                        <span>Regulatory & ZERA Policy</span>
                        <span className="text-emerald-400 font-mono">38%</span>
                      </div>
                      <div className="w-full bg-[#03180f] h-2 rounded-full overflow-hidden border border-emerald-900/40">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-emerald-200 mb-1">
                        <span>Solar IPPs & Projects</span>
                        <span className="text-emerald-400 font-mono">28%</span>
                      </div>
                      <div className="w-full bg-[#03180f] h-2 rounded-full overflow-hidden border border-emerald-900/40">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-emerald-200 mb-1">
                        <span>DFI Funding (AfDB/WB)</span>
                        <span className="text-emerald-400 font-mono">20%</span>
                      </div>
                      <div className="w-full bg-[#03180f] h-2 rounded-full overflow-hidden border border-emerald-900/40">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-emerald-200 mb-1">
                        <span>Grid Access & SAPP</span>
                        <span className="text-emerald-400 font-mono">14%</span>
                      </div>
                      <div className="w-full bg-[#03180f] h-2 rounded-full overflow-hidden border border-emerald-900/40">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: '14%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-900/50">
                    <Link
                      href="/trends"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                    >
                      <span>Explore 30-Day Velocity Charts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Widget 3: Live Surveillance Engine Card */}
                <div className="bg-gradient-to-br from-[#072c1e]/85 to-[#041a12]/90 border border-emerald-500/30 rounded-2xl p-5 text-white shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Continuous Engine
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      AUTO-CRAWL
                    </span>
                  </div>

                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    70+ verified portals scheduled for next poll in <strong>1h 42m</strong>. Alerts automatically dispatch to Communications Officer upon relevance validation.
                  </p>

                  <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-emerald-300/80">
                    <span>Free-tier Zero Cost</span>
                    <Link href="/sources" className="underline hover:text-white font-semibold">
                      Manage 70+ Sources
                    </Link>
                  </div>
                </div>

              </div>
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
