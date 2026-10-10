'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CrawlModal from '@/components/CrawlModal';
import { MONITORED_SOURCES, CATEGORY_LABELS } from '@/lib/sources';
import { Globe2, Rss, Play, CheckCircle2, Search, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function SourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [crawlingId, setCrawlingId] = useState<number | null>(null);
  const [crawlFeedback, setCrawlFeedback] = useState<string | null>(null);

  const filteredSources = MONITORED_SOURCES.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCrawlSingleSource = async (id: number) => {
    setCrawlingId(id);
    setCrawlFeedback(null);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setCrawlFeedback(`Success: ${data.message}`);
      } else {
        setCrawlFeedback(`Notice: ${data.error || 'Crawl attempted'}`);
      }
    } catch (e: any) {
      setCrawlFeedback(`Error: ${e.message}`);
    } finally {
      setCrawlingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Source Coverage Directory"
        subtitle="70+ Energy Sector Portals Organized into 7 ToR Categories (Section 3.4)"
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Feedback Alert if triggered */}
        {crawlFeedback && (
          <div className="bg-[#05261a]/90 backdrop-blur-md border border-emerald-400 text-emerald-100 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{crawlFeedback}</span>
            </div>
            <button
              onClick={() => setCrawlFeedback(null)}
              className="text-emerald-300 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portal by name or description (ZERA, AfDB, Herald, REF, SAPP)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-emerald-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#03170e]/80 text-white placeholder:text-emerald-300/50 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-emerald-500/30 rounded-xl px-3.5 py-2 bg-[#041a12] text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All 7 ToR Categories ({MONITORED_SOURCES.length})</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
              const count = MONITORED_SOURCES.filter(s => s.category === catKey).length;
              return (
                <option key={catKey} value={catKey}>{label} ({count})</option>
              );
            })}
          </select>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            const isRunning = crawlingId === source.id;
            return (
              <div
                key={source.id}
                className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 hover:border-emerald-400/50 hover:bg-[#083525]/85 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-3 transition-all text-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      {source.categoryLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      source.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                    }`}>
                      {source.sourceType.toUpperCase()} &bull; {source.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{source.name}</span>
                  </h3>

                  <p className="text-xs text-emerald-100/75 mt-2 line-clamp-3 leading-relaxed font-normal">
                    {source.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-900/40 flex items-center justify-between gap-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-300/80 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>

                  <button
                    onClick={() => handleCrawlSingleSource(source.id)}
                    disabled={isRunning}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Crawling...' : 'Crawl Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CrawlModal
        isOpen={isCrawlModalOpen}
        onClose={() => setIsCrawlModalOpen(false)}
        onCrawlComplete={() => {
          setIsCrawlModalOpen(false);
          setCrawlFeedback('Crawl pipeline completed successfully.');
        }}
      />
    </div>
  );
}
