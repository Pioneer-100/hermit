'use client';

import { DashboardStats } from '@/types';
import { Layers, AlertTriangle, Clock, Globe2 } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Crawled Today',
      value: stats.capturedToday,
      subtext: stats.totalArticles ? `${stats.totalArticles} active in database` : 'Real-time sync',
      icon: Layers,
      accentBorder: '',
      iconBg: 'bg-[#1a3828] text-[#49b783] border-[#3d6852]',
    },
    {
      title: 'High-Relevance Flags',
      value: stats.highRelevanceFlags,
      subtext: 'Relevance score ≥ 75%',
      icon: AlertTriangle,
      accentBorder: '',
      iconBg: 'bg-[#3a201b] text-[#f09a8d] border-[#70473f]',
    },
    {
      title: 'Pending Executive Review',
      value: stats.pendingReview,
      subtext: 'Awaiting Comms sign-off',
      icon: Clock,
      accentBorder: '',
      iconBg: 'bg-[#392f19] text-[#e1bd68] border-[#67562e]',
    },
    {
      title: 'Monitored Portals',
      value: stats.sourcesMonitored || 55,
      subtext: 'Across 6 Clean Pillars',
      icon: Globe2,
      accentBorder: '',
      iconBg: 'bg-[#1a3828] text-[#49b783] border-[#3d6852]',
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`min-h-[128px] sm:min-h-[144px] bg-[#13231b] rounded-xl p-3 sm:p-5 border border-[#34483d] transition-colors hover:border-[#4d6658] ${c.accentBorder} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[12px] sm:text-xs font-semibold text-[#b5c5b9] leading-tight min-h-8 max-w-[9rem] sm:max-w-none">
                {c.title}
              </span>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 border ${c.iconBg}`}>
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-baseline justify-between gap-1 mt-0.5">
              <div className="font-display tabular text-2xl sm:text-3xl font-semibold text-[#f0f5f0] tracking-tight">
                {c.value}
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-[#b5c5b9] font-medium mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#34483d]">
              <span className="leading-snug">{c.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
