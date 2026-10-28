'use client';

import { Article } from '@/types';
import { 
  Building2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Send
} from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick?: (article: Article) => void;
  onReviewToggle?: (id: number, reviewed: boolean) => void;
  compact?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  tariff_change: { label: 'Tariff Revision', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  new_regulation: { label: 'Regulation', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  funding_announcement: { label: 'DFI Funding', badgeClass: 'bg-blue-600/20 text-cyan-300 border-blue-500/40' },
  project_update: { label: 'Infrastructure', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  policy_change: { label: 'Govt Policy', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  partnership: { label: 'PPA & Market', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  official_dispatch: { label: 'Official Utility Dispatch', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  general: { label: 'Industry Intel', badgeClass: 'bg-blue-900/40 text-cyan-200 border-blue-700/40' },
};

export default function ArticleCard({ 
  article, 
  onClick, 
  compact = false 
}: ArticleCardProps) {
  const timeFormatted = article.publication_date || article.captured_at
    ? new Date(article.publication_date || article.captured_at).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : '08:00';

  const typeInfo = TYPE_CONFIG[article.article_type] || { label: 'General', badgeClass: 'bg-blue-900/40 text-cyan-200 border-blue-700/40' };

  const isHigh = article.relevance_level === 'high';
  const isMed = article.relevance_level === 'medium';

  const borderLeftClass = isHigh
    ? 'border-l-4 border-l-rose-500 hover:border-l-rose-400'
    : isMed
    ? 'border-l-4 border-l-amber-500 hover:border-l-amber-400'
    : 'border-l-4 border-l-blue-500 hover:border-l-blue-400';

  return (
    <div
      onClick={() => onClick?.(article)}
      className={`group bg-[#0b2144]/45 backdrop-blur-xl rounded-2xl p-3.5 sm:p-5 shadow-lg hover:shadow-xl border border-blue-400/25 hover:border-blue-300/40 hover:bg-[#0d4f34]/60 transition-all duration-150 cursor-pointer ${borderLeftClass} flex flex-col justify-between gap-2.5 sm:gap-3`}
    >
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Source Tag with Hermit Green Accent */}
          <span className="font-bold text-xs sm:text-xs text-cyan-200 bg-blue-950/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-blue-500/40 tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {article.source_name}
          </span>

          {/* Type / Category Pill */}
          <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${typeInfo.badgeClass}`}>
            {typeInfo.label}
          </span>

          {/* Quoted Stakeholder Pill */}
          {article.key_stakeholders && article.key_stakeholders.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-cyan-200/90 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-700/40">
              <Building2 className="w-2.5 h-2.5 text-blue-400" />
              <span>{article.key_stakeholders[0]}</span>
              {article.key_stakeholders.length > 1 && (
                <span className="text-blue-400">+{article.key_stakeholders.length - 1}</span>
              )}
            </span>
          )}
        </div>

        {/* Relevance Score Pill + Time */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isHigh && (
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              CRITICAL ({Math.round(article.relevance_score * 100)}%)
            </span>
          )}
          {isMed && (
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
              MEDIUM ({Math.round(article.relevance_score * 100)}%)
            </span>
          )}
          {!isHigh && !isMed && (
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-cyan-300 border border-blue-500/40 tracking-wider">
              INFO ({Math.round(article.relevance_score * 100)}%)
            </span>
          )}

          <span className="text-[10px] sm:text-xs font-mono text-cyan-300/60 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400/70" />
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div>
        <h3 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
          {article.headline}
        </h3>

        {/* Digestible Summary Snippet */}
        {!compact && (
          <p className="text-xs text-slate-200/75 mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {article.summary || article.headline}
          </p>
        )}
      </div>

      {/* Hermit Commercial Implication & Action Bar - Fully responsive wrapping */}
      <div className="pt-2 sm:pt-2.5 border-t border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Relevance to Hermit Snippet */}
        <div className="flex items-center gap-1.5 text-xs sm:text-xs text-slate-200 bg-[#052618]/55 border border-blue-400/25 px-2.5 py-1 rounded-xl w-full sm:max-w-xl truncate">
          <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
          <span className="font-bold text-cyan-300 shrink-0">Hermit Focus:</span>
          <span className="truncate text-slate-200/90">
            {article.relevance_to_hermit || 'Assessed for renewable energy IPP portfolio impact.'}
          </span>
        </div>

        {/* Status Badges & Action Trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            {article.is_reviewed ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 bg-blue-600/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/40">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                Reviewed
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/40">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Pending
              </span>
            )}

            {article.is_alert_sent && (
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/40">
                <Send className="w-2.5 h-2.5 text-blue-400" />
                Alerted
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-blue-400 group-hover:text-cyan-300 flex items-center gap-0.5 pl-1 transition-colors">
            <span>Review Memo</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
