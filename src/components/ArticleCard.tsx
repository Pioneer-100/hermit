'use client';

import { Article } from '@/types';
import { 
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
  tariff_change: { label: 'Tariff Revision', badgeClass: 'text-[#b5c5b9]' },
  new_regulation: { label: 'Regulation', badgeClass: 'text-[#b5c5b9]' },
  funding_announcement: { label: 'DFI Funding', badgeClass: 'text-[#b5c5b9]' },
  project_update: { label: 'Infrastructure', badgeClass: 'text-[#b5c5b9]' },
  policy_change: { label: 'Govt Policy', badgeClass: 'text-[#b5c5b9]' },
  partnership: { label: 'PPA & Market', badgeClass: 'text-[#b5c5b9]' },
  official_dispatch: { label: 'Official Utility Dispatch', badgeClass: 'text-[#b5c5b9]' },
  general: { label: 'Industry Intel', badgeClass: 'text-[#b5c5b9]' },
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
    : 'border-l-4 border-l-[#49b783]/60 hover:border-l-[#49b783]';

  return (
    <div
      onClick={() => onClick?.(article)}
      className={`group bg-[#13231b] rounded-xl p-4 sm:p-5 border border-[#34483d] hover:border-[#4d6658] transition-colors cursor-pointer ${borderLeftClass} flex flex-col justify-between gap-3`}
    >
      {/* Quiet source/category line and meaningful relevance */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 text-[11px] sm:text-xs text-[#b5c5b9]">
          <span className="font-semibold text-[#dce7df]">{article.source_name}</span>
          <span className="mx-1.5 text-[#66796d]">·</span>
          <span className={typeInfo.badgeClass}>{typeInfo.label}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            <span className="text-[10px] text-[#b5c5b9]">
              {Math.round(article.relevance_score * 100)}%
            </span>
          )}

          <span className="text-[10px] sm:text-xs text-[#91a296] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div>
        <h3 className="font-display text-base sm:text-lg font-semibold text-[#f0f5f0] group-hover:text-[#49b783] transition-colors leading-snug line-clamp-2">
          {article.headline}
        </h3>

        {/* Digestible Summary Snippet */}
        {!compact && (
          <p className="text-sm text-[#b5c5b9] mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {article.summary || article.headline}
          </p>
        )}
      </div>

      {/* Hermit Commercial Implication & Action Bar - Fully responsive wrapping */}
      <div className="pt-2 sm:pt-2.5 border-t border-[#34483d] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Relevance to Hermit Snippet */}
        <div className="flex items-center gap-1.5 text-xs text-[#b5c5b9] w-full sm:max-w-xl">
          <Sparkles className="w-3 h-3 text-[#49b783] shrink-0" />
          <span className="font-semibold text-[#dce7df] shrink-0">Focus:</span>
          <span className="truncate">
            {article.relevance_to_hermit || 'Assessed for renewable energy IPP portfolio impact.'}
          </span>
        </div>

        {/* Status Badges & Action Trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            {article.is_reviewed ? (
              <span className="text-[10px] font-semibold text-[#49b783] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Reviewed
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/40">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Pending
              </span>
            )}

            {article.is_alert_sent && (
              <span className="text-[10px] font-semibold text-[#49b783] flex items-center gap-1">
                <Send className="w-2.5 h-2.5" />
                Alerted
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-[#49b783] group-hover:text-[#71cda2] flex items-center gap-0.5 pl-1 transition-colors">
            <span>Review Memo</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
