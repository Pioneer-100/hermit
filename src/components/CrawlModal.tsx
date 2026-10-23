'use client';

import { useState } from 'react';
import { MONITORED_SOURCES, CATEGORY_LABELS } from '@/lib/sources';
import { getSupabaseClient } from '@/lib/supabase';
import { X, Play, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface CrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrawlComplete: () => void;
}

export default function CrawlModal({ isOpen, onClose, onCrawlComplete }: CrawlModalProps) {
  const [crawlMode, setCrawlMode] = useState<'auto_rotating' | 'single_source'>('auto_rotating');
  const [selectedSourceId, setSelectedSourceId] = useState<number>(18); // Default: ZERA
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSources = selectedCategory === 'all'
    ? MONITORED_SOURCES
    : MONITORED_SOURCES.filter(s => s.category === selectedCategory);

  const handleCrawl = async () => {
    setIsLoading(true);
    setResultMessage(null);

    try {
      let token = '';
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb.auth.getSession();
        token = data.session?.access_token || '';
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const bodyPayload = crawlMode === 'auto_rotating'
        ? {} // Empty body triggers automated intelligent rotation across sources
        : { sourceId: selectedSourceId };

      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage(data.message || 'Crawl and AI analysis finished successfully!');
        onCrawlComplete();
      } else {
        setResultMessage(data.error || 'Crawl failed to complete.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error executing crawl';
      setResultMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 left-0 md:left-64 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#06261b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/30 w-full max-w-lg overflow-hidden text-white">
        
        {/* Header with Green Branding */}
        <div className="bg-gradient-to-r from-[#072c1e]/95 via-[#0d422f]/95 to-[#072c1e]/95 text-white p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Trigger Live Web Crawl</h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/70">Poll energy portal & classify through Gemini AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 bg-[#041a11]/90 text-white">
          
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
              Surveillance Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCrawlMode('auto_rotating')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 ${
                  crawlMode === 'auto_rotating'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-inner'
                    : 'bg-[#03180f] text-slate-300 border-emerald-900/50 hover:border-emerald-600/40'
                }`}
              >
                <span>Automated Rotation</span>
                <span className="text-[10px] text-emerald-400/70 font-normal">Cycles across all 70+ portals</span>
              </button>

              <button
                type="button"
                onClick={() => setCrawlMode('single_source')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 ${
                  crawlMode === 'single_source'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-inner'
                    : 'bg-[#03180f] text-slate-300 border-emerald-900/50 hover:border-emerald-600/40'
                }`}
              >
                <span>Specific Portal</span>
                <span className="text-[10px] text-emerald-400/70 font-normal">Target single platform</span>
              </button>
            </div>
          </div>

          {crawlMode === 'single_source' && (
            <>
              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Category Filter
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs border border-emerald-500/30 rounded-xl p-2.5 bg-[#03180f] text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                >
                  <option value="all">All 7 Monitoring Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Target Source Portal ({filteredSources.length} available)
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(Number(e.target.value))}
                  className="w-full text-xs border border-emerald-500/30 rounded-xl p-2.5 bg-[#03180f] text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold"
                >
                  {filteredSources.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.sourceType.toUpperCase()} &bull; {s.priority.toUpperCase()} priority)
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="bg-[#03170e]/90 p-3 sm:p-3.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline Intelligence Active:</span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              {crawlMode === 'auto_rotating'
                ? 'Balanced batch scheduler will automatically pull from rotated regulators, national press, regional grids, and DFIs, rejecting any stale items (>30 days) and political metaphors.'
                : 'Pulls from selected portal with deep-article extraction, freshness verification, and Gemini impact analysis.'}
            </p>
          </div>

          {resultMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              resultMessage.includes('successfully')
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resultMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#051c14] border-t border-emerald-900/50 p-3.5 sm:p-4 px-4 sm:px-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto text-center px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-[#072418] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrawl}
            disabled={isLoading}
            className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2.5 sm:py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Crawling & Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Live Crawl</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
