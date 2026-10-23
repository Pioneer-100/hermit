'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CrawlModal from '@/components/CrawlModal';
import { Article } from '@/types';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { getAuthHeaders } from '@/lib/api-client';

interface FeedClientProps {
  initialArticles: Article[];
}


function formatDayLabel(dateStr: string): string {
  if (!dateStr || dateStr === 'unknown') return 'Earlier / Undated';
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
  if (dateStr === today) return "Today's Dispatches";
  if (dateStr === yesterday) return "Yesterday's Dispatches";

  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function groupArticlesByDay(list: Article[]): Array<{ day: string; label: string; items: Article[] }> {
  const groups: Record<string, Article[]> = {};
  
  list.forEach(item => {
    const rawDate = item.publication_date || item.captured_at;
    const dayKey = rawDate ? rawDate.slice(0, 10) : 'unknown';
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(item);
  });

  return Object.keys(groups)
    .sort((a, b) => (b === 'unknown' ? 1 : a === 'unknown' ? -1 : b.localeCompare(a)))
    .map(day => ({
      day,
      label: formatDayLabel(day),
      items: groups[day]
    }));
}

export default function FeedClient({ initialArticles }: FeedClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelevance, setSelectedRelevance] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false);

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.articles)) setArticles(data.articles);
      }
    } catch (e) {
      console.warn(e);
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
        title="Intelligence Feed"
        subtitle="Continuous clean surveillance across 55 tracked portals in Zimbabwe (6 Pillars)"
        onRefresh={loadArticles}
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
        alertCount={pendingCount}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Top Cockpit 2-Column Packed Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Left Column (8 cols): Packed Curated Feed */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search & Filter Control Bar (Sticky on Scroll) */}
            <div className="sticky top-14 sm:top-[69px] z-20 bg-[#083825]/45 backdrop-blur-xl border border-emerald-400/25 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
              {/* Search Input & Category Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, quoted stakeholders (e.g. ZERA, Kariba, AfDB)..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-emerald-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#052618]/50 text-white placeholder:text-emerald-300/60 font-medium"
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
                  className="text-xs border border-emerald-400/30 rounded-xl px-3 py-2 bg-[#052618]/60 text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="all">All Article Types</option>
                  <option value="tariff_change">Tariff Revision</option>
                  <option value="new_regulation">Regulations</option>
                  <option value="funding_announcement">DFI Funding</option>
                  <option value="project_update">Infrastructure Projects</option>
                  <option value="policy_change">Government Policy</option>
                  <option value="partnership">PPAs & Off-take Deals</option>
                  <option value="general">Industry Intelligence</option>
                </select>
              </div>

              {/* Secondary Filter Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-emerald-900/40 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-300/80 flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3 text-emerald-400" />
                    Relevance:
                  </span>

                  {(['all', 'high', 'medium', 'low'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedRelevance(lvl)}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 ${
                        selectedRelevance === lvl
                          ? lvl === 'high'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : lvl === 'medium'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-emerald-600 text-white'
                          : 'bg-[#041a12] text-emerald-200/80 hover:bg-[#083525] border border-emerald-900/50'
                      }`}
                    >
                      {lvl === 'all' ? 'All' : lvl.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setOnlyUnreviewed(!onlyUnreviewed)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-colors flex items-center gap-1.5 active:scale-95 ${
                      onlyUnreviewed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                        : 'bg-[#041a12] text-emerald-200/80 hover:bg-[#083525] border-emerald-900/50'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Unreviewed ({pendingCount})</span>
                  </button>

                  <span className="text-emerald-300/70 font-mono text-[10px] sm:text-[11px] font-bold">
                    {filtered.length} of {articles.length} items
                  </span>
                </div>
              </div>
            </div>

            {/* Articles Stream with Chronological Day Boundaries */}
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <div className="bg-[#06261b]/70 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-8 sm:p-12 text-center text-emerald-200/70 text-xs space-y-3">
                  <SlidersHorizontal className="w-8 h-8 text-emerald-400/60 mx-auto" />
                  <p className="font-bold text-white text-sm">No media captures match active filters</p>
                  <p>Try broadening your search keywords or resetting relevance filter pills.</p>
                </div>
              ) : (
                groupArticlesByDay(filtered).map((group) => (
                  <div key={group.day} className="space-y-3">
                    {/* Daily Boundary Pill Divider */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-md">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{group.label}</span>
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 font-mono">
                          {group.items.length} {group.items.length === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 via-emerald-800/20 to-transparent" />
                    </div>

                    {/* Articles under this boundary */}
                    <div className="space-y-3">
                      {group.items.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onClick={setSelectedArticle}
                          onReviewToggle={handleReviewToggle}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Cockpit Intelligence Panels */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Widget 1: Priority Escalation Queue */}
            <div className="bg-[#083825]/45 backdrop-blur-xl border border-emerald-400/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Critical Alerts
                    </h3>
                    <p className="text-[10px] text-emerald-200/70">Relevance score &ge; 75%</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                  {highPriorityArticles.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {highPriorityArticles.slice(0, 4).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="p-3 rounded-xl bg-[#052618]/55 hover:bg-[#0a452e]/70 border border-emerald-400/20 hover:border-emerald-300/40 transition-all cursor-pointer space-y-1.5 border-l-4 border-l-rose-500 text-white active:scale-99"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {art.source_name}
                      </span>
                      <span className="font-mono text-rose-300 font-bold">
                        {Math.round(art.relevance_score * 100)}%
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {art.headline}
                    </h4>

                    <div className="flex items-center justify-between pt-1.5 border-t border-emerald-900/40 text-[11px]">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(art);
                        }}
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
            <div className="bg-[#083825]/45 backdrop-blur-xl border border-emerald-400/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 text-white">
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
            <div className="bg-gradient-to-br from-[#093c28]/60 to-[#062a1b]/65 backdrop-blur-xl border border-emerald-400/25 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Continuous Engine
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  ACTIVE
                </span>
              </div>

              <p className="text-xs text-emerald-100/80 leading-relaxed">
                70+ verified portals tracked. Relevance validation and impact analysis automated through Gemini 2.0.
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
