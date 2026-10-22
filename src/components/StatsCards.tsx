'use client';

import { DashboardStats } from '@/types';
import { Layers, AlertTriangle, Clock, Globe2 } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Daily Media Captures',
      value: stats.capturedToday,
      subtext: '+28% vs 7-day average',
      icon: Layers,
      accentBorder: 'border-l-4 border-l-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badge: 'Continuous Feed'
    },
    {
      title: 'High-Relevance Flags',
      value: stats.highRelevanceFlags,
      subtext: 'Relevance score ≥ 75%',
      icon: AlertTriangle,
      accentBorder: 'border-l-4 border-l-rose-500',
      iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      badge: 'Action Required'
    },
    {
      title: 'Pending Executive Review',
      value: stats.pendingReview,
      subtext: 'Awaiting Comms sign-off',
      icon: Clock,
      accentBorder: 'border-l-4 border-l-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      badge: 'Queue Active'
    },
    {
      title: 'Monitored Portals',
      value: stats.sourcesMonitored || 55,
      subtext: 'Across 6 Clean Pillars',
      icon: Globe2,
      accentBorder: 'border-l-4 border-l-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badge: '100% Operational'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`bg-[#083825]/45 backdrop-blur-xl rounded-2xl p-3 sm:p-4.5 shadow-lg border border-emerald-400/25 hover:border-emerald-300/40 hover:bg-[#0d4f34]/60 transition-all ${c.accentBorder} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-300/80 uppercase tracking-wider truncate">
                {c.title}
              </span>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 border ${c.iconBg}`}>
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-baseline justify-between gap-1 mt-0.5">
              <div className="font-display tabular text-xl sm:text-3xl font-black text-white tracking-tight">
                {c.value}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shrink-0">
                {c.badge}
              </span>
            </div>

            <div className="text-[10px] sm:text-xs text-emerald-200/70 font-medium mt-2 pt-1.5 sm:pt-2 border-t border-emerald-900/40 flex items-center justify-between">
              <span className="truncate">{c.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
