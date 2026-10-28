'use client';

import { useState } from 'react';
import { Article } from '@/types';
import { useAuth } from '@/components/AuthContext';
import { 
  X, 
  CheckCircle, 
  Send, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onReviewToggle: (id: number, reviewed: boolean) => void;
  onDispatchAlert: (id: number) => void;
}

export default function ArticleDetailModal({
  article,
  onClose,
  onReviewToggle,
  onDispatchAlert
}: ArticleDetailModalProps) {
  const { currentUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  if (!article) return null;

  const isReviewed = article.is_reviewed;

  const handleReview = () => {
    onReviewToggle(article.id, !isReviewed);
  };

  const handleEscalate = async () => {
    setIsSending(true);
    await onDispatchAlert(article.id);
    setIsSending(false);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3500);
  };

  const isHigh = article.relevance_level === 'high';

  return (
    <div className="fixed inset-0 left-0 md:left-64 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#08172c]/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-500/25 w-full max-w-4xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-white">
        
        {/* Executive Header Banner */}
        <div className="bg-gradient-to-r from-[#071932]/98 via-[#081c36]/98 to-[#071932]/98 text-white p-4 sm:p-6 border-b border-blue-500/20 shrink-0">
          {/* Top Status Strip */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
              </div>
              <span className="font-extrabold uppercase tracking-wider text-[9px] sm:text-[10px] text-cyan-300">
                HERMIT INVESTMENTS &bull; STRATEGIC INTELLIGENCE BRIEF
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-cyan-300 hover:text-white hover:bg-blue-800/60 transition-colors"
              aria-label="Close memo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Source & Headline */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-[11px] sm:text-xs uppercase px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-950/90 text-cyan-300 border border-blue-500/40">
                {article.source_name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-cyan-300/70 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                {article.publication_date || article.captured_at 
                  ? new Date(article.publication_date || article.captured_at).toLocaleString('en-GB')
                  : 'Today'}
              </span>
              {article.author && (
                <span className="text-[10px] sm:text-[11px] text-cyan-200/70">
                  &bull; Reported by {article.author}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
              {article.headline}
            </h2>

            {/* Relevance & Category Gauge */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 ${
                isHigh
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
                {article.relevance_level.toUpperCase()} ({Math.round(article.relevance_score * 100)}% MATCH)
              </span>

              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-600/20 text-cyan-200 border border-blue-500/40 uppercase tracking-wider">
                {article.article_type.replace('_', ' ')}
              </span>

              {isReviewed && (
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-600/20 text-cyan-300 border border-blue-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  Reviewed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body - 2 Column Packed Intelligence Memo */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 overflow-y-auto flex-1 bg-[#041a11]/90 text-white">
          
          {/* Left Column: Monitored Story & Quoted Stakeholders (6 cols) */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
            
            {/* Executive Summary */}
            <div className="bg-[#06291b]/80 p-3.5 sm:p-4 rounded-xl border border-blue-500/25 shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300/80">
                  Monitored Story Digest
                </h3>
                <span className="text-[10px] text-blue-400/70 font-mono">Raw Capture</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {article.summary || article.headline}
              </p>
            </div>

            {/* Quoted Stakeholders */}
            <div className="bg-[#06291b]/80 p-3.5 sm:p-4 rounded-xl border border-blue-500/25 shadow-md space-y-1.5">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300/80">
                Institutional Stakeholders Quoted
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {article.key_stakeholders && article.key_stakeholders.length > 0 ? (
                  article.key_stakeholders.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#06162a] text-cyan-200 rounded-lg border border-blue-500/30 flex items-center gap-1.5"
                    >
                      <Building2 className="w-3 h-3 text-blue-400" />
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-cyan-300/50 italic">No explicit institutions cited</span>
                )}
              </div>
            </div>

            {/* Hermit Relevance Assessment */}
            <div className="bg-[#040f09]/95 p-3.5 sm:p-4 rounded-xl border border-blue-500/20 space-y-1.5 shadow-md">
              <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Relevance to Hermit Investments</span>
              </div>
              <p className="text-xs text-slate-200/95 leading-relaxed font-medium">
                {article.relevance_to_hermit || 'Assessed for renewable energy IPP portfolio impact and regulatory risk.'}
              </p>
            </div>

            {/* Direct Source Link */}
            <div className="pt-1">
              <a
                href={article.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-cyan-300 hover:underline"
              >
                <span>Read Full Story on {article.source_name} Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Column: AI-Drafted Impact Memo & Management Actions (6 cols) */}
          <div className="lg:col-span-6 bg-[#062a1d]/85 border border-blue-500/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xl space-y-4">
            <div className="space-y-3.5 sm:space-y-4">
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-blue-900/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-blue-950 font-black flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Hermit Impact Analysis
                    </h4>
                    <p className="text-[10px] text-cyan-300 font-medium">Drafted via Gemini 2.0</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isReviewed
                    ? 'bg-blue-600/20 text-cyan-300 border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isReviewed ? 'Signed Off' : 'Awaiting Review'}
                </span>
              </div>

              {/* Implications for Hermit Investments */}
              <div>
                <h5 className="text-[11px] font-bold text-cyan-300/80 uppercase tracking-wider mb-1">
                  Portfolio Implications
                </h5>
                <div className="text-xs text-slate-200 bg-[#06162a]/90 p-3 sm:p-3.5 rounded-xl border border-blue-900/60 leading-relaxed font-normal whitespace-pre-line shadow-inner">
                  {article.ai_impact_note || 'No immediate commercial disruption detected.'}
                </div>
              </div>

              {/* Suggested Action Options */}
              {article.suggested_actions && article.suggested_actions.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-cyan-300/80 uppercase tracking-wider mb-1">
                    Recommended Executive Actions
                  </h5>
                  <div className="space-y-1.5">
                    {article.suggested_actions.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200 bg-[#06162a]/75 p-2.5 rounded-lg border border-blue-500/20 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Attribution Sign-off within Memo Card */}
            <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] text-cyan-200/70 font-medium block truncate">
                  Sign-off by {currentUser?.full_name || 'Hermit Officer'}:
                </span>
                <span className="text-[10px] text-blue-400/80 font-mono">
                  Role: {currentUser?.title || currentUser?.role || 'Analyst'}
                </span>
              </div>

              <button
                onClick={handleReview}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 active:scale-95 ${
                  isReviewed
                    ? 'bg-[#0a1e38] text-cyan-300 border-blue-700/50 hover:bg-[#072418]'
                    : 'bg-blue-600 hover:bg-blue-600 text-white border-blue-400/40 shadow-sm'
                }`}
              >
                {isReviewed ? 'Revoke Review' : 'Sign Off'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="bg-[#040f09] border-t border-blue-900/40 p-3.5 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-cyan-300/70 flex items-center gap-2">
            <span className="truncate">Dispatched via: <strong className="text-slate-200">Email Alerts & Weekly Digest</strong></span>
            {alertSuccess && (
              <span className="text-blue-400 font-bold flex items-center gap-1 animate-pulse shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Alert escalated!
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleReview}
              className="bg-[#06162a] border border-blue-700/50 hover:bg-[#062418] text-cyan-200 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all text-center active:scale-98"
            >
              {isReviewed ? 'Mark Unreviewed' : 'Sign Off (Mark Reviewed)'}
            </button>

            <button
              onClick={handleEscalate}
              disabled={isSending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/40 disabled:opacity-50 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending Dispatch...' : 'Approve & Escalate to Management'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
