'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CrawlModal from '@/components/CrawlModal';
import { Article } from '@/types';
import { INITIAL_ARTICLES } from '@/lib/mock-data';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  Radio 
} from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRelevance, setSelectedRelevance] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.articles)) setArticles(data.articles);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

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

  const filtered = articles.filter(a => {
    const matchesSearch = !searchQuery.trim() || 
      a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.key_stakeholders && a.key_stakeholders.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesRelevance = selectedRelevance === 'all' || a.relevance_level === selectedRelevance;
    const matchesType = selectedType === 'all' || a.article_type === selectedType;
    const matchesUnreviewed = !onlyUnreviewed || !a.is_reviewed;

    return matchesSearch && matchesRelevance && matchesType && matchesUnreviewed;
  });

  const highPriorityArticles = articles.filter(a => a.relevance_level === 'high');
  const pendingCount = articles.filter(a => !a.is_reviewed && a.relevance_level === 'high').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      {/* Header Bar */}
      <Header
        title="Live Intelligence Feed"
        subtitle="Continuous multi-source surveillance across 70+ tracked energy portals in Zimbabwe"
        onRefresh={loadArticles}
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
        alertCount={pendingCount}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Top Cockpit 2-Column Packed Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): Packed Curated Feed */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search & Filter Control Bar (Sticky on Scroll) */}
            <div className="sticky top-[69px] z-20 bg-[#06261b]/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
              {/* Search Input & Category Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, quoted stakeholders (e.g. ZERA, Kariba, AfDB, solar, tariff)..."
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs border border-emerald-500/30 rounded-xl px-3 py-2 bg-[#041a12] text-emerald-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="all">All Article Categories</option>
                  <option value="tariff_change">Tariff Changes</option>
                  <option value="new_regulation">Regulations & Directives</option>
                  <option value="funding_announcement">DFI Funding & Grants</option>
                  <option value="project_update">Project Updates</option>
                  <option value="policy_change">Policy & Government</option>
                  <option value="partnership">PPAs & Deals</option>
                </select>
              </div>

              {/* Relevance Filter Pills + Unreviewed Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-900/50 text-xs">
                {/* Filter Pills */}
                <div className="flex items-center bg-[#041a12]/80 p-1 rounded-xl text-xs font-semibold text-emerald-200/80 border border-emerald-900/50">
                  <button
                    onClick={() => setSelectedRelevance('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedRelevance === 'all' 
                        ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                        : 'hover:text-white'
                    }`}
                  >
                    All ({articles.length})
                  </button>
                  <button
                    onClick={() => setSelectedRelevance('high')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      selectedRelevance === 'high' 
                        ? 'bg-rose-600 text-white font-bold shadow-xs' 
                        : 'text-rose-300 hover:bg-rose-950/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Critical ({articles.filter(a => a.relevance_level === 'high').length})
                  </button>
                  <button
                    onClick={() => setSelectedRelevance('medium')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedRelevance === 'medium' 
                        ? 'bg-amber-600 text-white font-bold shadow-xs' 
                        : 'text-amber-300 hover:bg-amber-950/40'
                    }`}
                  >
                    Medium ({articles.filter(a => a.relevance_level === 'medium').length})
                  </button>
                  <button
                    onClick={() => setSelectedRelevance('low')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedRelevance === 'low' 
                        ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                        : 'text-emerald-300 hover:bg-emerald-950/40'
                    }`}
                  >
                    Low ({articles.filter(a => a.relevance_level === 'low').length})
                  </button>
                </div>

                {/* Unreviewed Toggle & Counter */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-emerald-200/90 hover:text-white">
                    <input
                      type="checkbox"
                      checked={onlyUnreviewed}
                      onChange={(e) => setOnlyUnreviewed(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400 border-emerald-700 bg-[#041a12]"
                    />
                    <span>Unreviewed Only</span>
                  </label>
                  <span className="text-emerald-800 hidden sm:inline">&bull;</span>
                  <span className="text-[11px] text-emerald-300/70 font-mono hidden sm:inline">
                    <strong>{filtered.length}</strong> items active
                  </span>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              {filtered.length > 0 ? (
                filtered.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={(art) => setSelectedArticle(art)}
                    onReviewToggle={handleReviewToggle}
                  />
                ))
              ) : (
                <div className="bg-[#06261b]/75 backdrop-blur-md rounded-2xl p-16 text-center border border-emerald-500/25 shadow-lg space-y-2 text-white">
                  <p className="text-sm font-semibold text-white">No monitored captures match your filters</p>
                  <p className="text-xs text-emerald-200/70">Try adjusting your search keywords or category filters above.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRelevance('all');
                      setSelectedType('all');
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

          {/* Right Column (4 cols): Action Center & Telemetry */}
          <div className="lg:col-span-4 space-y-4 sticky top-[69px]">
            
            {/* Widget 1: Priority Attention Queue */}
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
      </main>

      {/* Article Detail Modal */}
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
          loadArticles();
        }}
      />
    </div>
  );
}
