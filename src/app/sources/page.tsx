'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CrawlModal from '@/components/CrawlModal';
import { MONITORED_SOURCES, CATEGORY_LABELS } from '@/lib/sources';
import { Play, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

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
        headers: await getAuthHeaders(),
        body: JSON.stringify({ sourceId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setCrawlFeedback(`Success: ${data.message}`);
      } else {
        setCrawlFeedback(`Notice: ${data.error || 'Crawl attempted'}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error executing crawl';
      setCrawlFeedback(`Error: ${msg}`);
    } finally {
      setCrawlingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Clean Energy Source Directory"
        subtitle="55 Curated Portals Across 6 Clean Energy Intelligence Pillars"
        onTriggerCrawl={() => setIsCrawlModalOpen(true)}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        
        {/* Feedback Alert if triggered */}
        {crawlFeedback && (
          <div className="bg-[#05261a]/90 backdrop-blur-md border border-emerald-400 text-emerald-100 p-3.5 sm:p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{crawlFeedback}</span>
            </div>
            <button
              onClick={() => setCrawlFeedback(null)}
              className="text-emerald-300 hover:text-white font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-[#083825]/45 backdrop-blur-xl border border-emerald-400/25 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between text-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clean energy portal (ZERA, AfDB, SEFA, Mining Weekly, ZRA, SAPP)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-emerald-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#052618]/50 text-white placeholder:text-emerald-300/60 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-emerald-400/30 rounded-xl px-3.5 py-2 bg-[#052618]/60 text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All 6 Clean Pillars ({MONITORED_SOURCES.length} Portals)</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
              const count = MONITORED_SOURCES.filter(s => s.category === catKey).length;
              return (
                <option key={catKey} value={catKey}>{label} ({count})</option>
              );
            })}
          </select>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredSources.map((source) => {
            const isRunning = crawlingId === source.id;
            return (
              <div
                key={source.id}
                className="bg-[#083825]/45 backdrop-blur-xl border border-emerald-400/25 hover:border-emerald-300/40 hover:bg-[#0d4f34]/60 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-3 transition-all text-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      {source.categoryLabel}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      source.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                    }`}>
                      {source.sourceType.toUpperCase()} &bull; {source.priority}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{source.name}</span>
                  </h3>

                  <p className="text-xs text-emerald-100/75 mt-1.5 line-clamp-3 leading-relaxed font-normal">
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 active:scale-95"
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
