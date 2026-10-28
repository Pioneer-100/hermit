'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import { Article, AlertLog } from '@/types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Sparkles 
} from 'lucide-react';

import { INITIAL_ARTICLES, INITIAL_ALERTS } from '@/lib/mock-data';

export default function AlertsPage() {
  const [articles, setArticles] = useState<Article[]>(() => INITIAL_ARTICLES.filter(a => a.relevance_level === 'high'));
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>(INITIAL_ALERTS);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const loadData = async () => {
    try {
      const [artRes, alertRes] = await Promise.all([
        fetch('/api/articles?relevance=high'),
        fetch('/api/alerts')
      ]);
      if (artRes.ok) {
        const artData = await artRes.json();
        if (Array.isArray(artData.articles)) setArticles(artData.articles);
      }
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        if (Array.isArray(alertData.alerts)) setAlertLogs(alertData.alerts);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = articles.filter(a => !a.is_reviewed).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Priority Alert Center"
        subtitle="Phase A — Real-Time Alerting Dispatched to Communications Officer & Management"
        onRefresh={loadData}
        alertCount={pendingCount}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* Banner with Green Aesthetic */}
        <div className="bg-gradient-to-r from-[#071932]/98 via-[#081c36]/98 to-[#071932]/98 text-white p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 shadow-2xl shadow-blue-950/40 border border-blue-500/30 backdrop-blur-md">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              Real-Time Push Escalations
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-black">Executive Priority Escalation Queue</h2>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Every energy item scoring &ge; 75% relevance generates an immediate AI impact brief. Communications Officer signs off before automatic dispatch to Management inboxes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            <div className="bg-[#052216]/80 border border-blue-400/30 p-3 sm:p-3.5 px-4 sm:px-5 rounded-xl text-center shadow-inner">
              <div className="font-display tabular text-xl sm:text-3xl font-black text-white">{articles.length}</div>
              <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">High-Relevance</div>
            </div>

            <div className="bg-[#052216]/80 border border-blue-400/30 p-3 sm:p-3.5 px-4 sm:px-5 rounded-xl text-center shadow-inner">
              <div className="font-display tabular text-xl sm:text-3xl font-black text-amber-300">{pendingCount}</div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Pending Sign-off</div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Active Alerts & Email Dispatch Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Left Column (7 cols): Active Priority Alerts */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Active Critical Alerts Requiring Action</span>
              </h3>
              <span className="text-xs text-cyan-300 font-mono font-semibold">{articles.length} Monitored</span>
            </div>

            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 hover:border-blue-400/50 hover:bg-[#083525]/85 rounded-2xl p-4 sm:p-5 shadow-xl transition-all border-l-4 border-l-rose-500 space-y-2.5 sm:space-y-3 text-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] sm:text-xs font-bold text-cyan-200 bg-blue-950/80 px-2 sm:px-2.5 py-0.5 rounded-md border border-blue-500/40">
                        {art.source_name}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-black bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/40">
                        {Math.round(art.relevance_score * 100)}% RELEVANCE
                      </span>
                      <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-blue-900/40 text-cyan-200 rounded-md border border-blue-700/40 uppercase">
                        {art.article_type.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-[10px] sm:text-xs text-cyan-300/60 font-mono">
                      {new Date(art.captured_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {art.headline}
                  </h4>

                  <p className="text-xs text-slate-200/80 line-clamp-2 leading-relaxed">
                    {art.summary || art.headline}
                  </p>

                  <div className="bg-[#0a1e38]/85 p-2.5 rounded-xl border border-blue-500/30 text-xs text-slate-200 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cyan-300">Executive Impact Note: </span>
                      <span className="text-slate-200/90 line-clamp-2 sm:line-clamp-1">{art.relevance_to_hermit}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-900/40 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <div className="text-[11px]">
                      {art.is_reviewed ? (
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Reviewed by Comms
                        </span>
                      ) : (
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Awaiting Management Sign-off
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={art.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-300/70 hover:text-white underline px-2"
                      >
                        Source
                      </a>

                      <button
                        onClick={() => setSelectedArticle(art)}
                        className="bg-blue-600 hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Review & Escalate</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5 cols): Email Dispatch Audit Trail */}
          <div className="lg:col-span-5 bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Email Dispatch Audit Trail
                </h3>
              </div>
              <span className="text-[10px] text-cyan-300/70 font-mono">Live Logs</span>
            </div>

            <p className="text-xs text-cyan-200/75">
              Audit log of formatted intelligence memos pushed to <strong className="text-white">communications@hermitinvestments.com</strong>.
            </p>

            <div className="space-y-2.5 divide-y divide-emerald-900/40">
              {alertLogs.map((log) => (
                <div key={log.id} className="pt-2.5 first:pt-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 bg-blue-950/80 px-2 py-0.5 rounded text-[10px] border border-blue-500/30">
                      {log.source_name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300/60">
                      {new Date(log.dispatched_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-white font-medium line-clamp-1">
                    {log.headline}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-cyan-300/70 pt-0.5">
                    <span className="text-cyan-200/70 truncate max-w-[200px]">{log.recipient_email}</span>
                    <span className="px-2 py-0.5 bg-blue-600/20 text-cyan-300 rounded-full font-bold text-[9px] border border-blue-500/40">
                      DELIVERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onReviewToggle={(id, reviewed) => {
          setArticles(prev => prev.map(a => a.id === id ? { ...a, is_reviewed: reviewed } : a));
        }}
        onDispatchAlert={(id) => {
          setArticles(prev => prev.map(a => a.id === id ? { ...a, is_alert_sent: true } : a));
        }}
      />
    </div>
  );
}
