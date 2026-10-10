'use client';

import { useState } from 'react';
import { MONITORED_SOURCES, CATEGORY_LABELS } from '@/lib/sources';
import { X, Play, Loader2, CheckCircle2, Sparkles, Zap, Radio } from 'lucide-react';

interface CrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrawlComplete: () => void;
}

export default function CrawlModal({ isOpen, onClose, onCrawlComplete }: CrawlModalProps) {
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
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: selectedSourceId })
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage(data.message || 'Crawl and AI analysis finished successfully!');
        onCrawlComplete();
      } else {
        setResultMessage(data.error || 'Crawl failed to complete.');
      }
    } catch (e: any) {
      setResultMessage(e.message || 'Network error executing crawl');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 left-0 md:left-64 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#06261b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/30 w-full max-w-lg overflow-hidden text-white">
        
        {/* Header with Green Branding */}
        <div className="bg-gradient-to-r from-[#072c1e]/95 via-[#0d422f]/95 to-[#072c1e]/95 text-white p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Trigger Live Web Crawl</h3>
              <p className="text-xs text-emerald-200/70">Poll energy portal & classify through Gemini AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-[#041a11]/90 text-white">
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

          <div className="bg-[#03170e]/90 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline Stages:</span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              1. Fetch live RSS/web markup &rarr; 2. Extract metadata &rarr; 3. Gemini calculates relevance &rarr; 4. Drafts Hermit impact brief &rarr; 5. Dispatches email if score &ge; 75%.
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
        <div className="bg-[#051c14] border-t border-emerald-900/50 p-4 px-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-[#072418] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrawl}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
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
