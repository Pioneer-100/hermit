'use client';

import Link from 'next/link';
import { RefreshCw, Play, Bell, Shield, Radio, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onTriggerCrawl?: () => void;
  isCrawling?: boolean;
  alertCount?: number;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  onTriggerCrawl,
  isCrawling = false,
  alertCount = 4
}: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-[#052016]/75 backdrop-blur-md border-b border-emerald-500/25 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-lg shadow-emerald-950/20">
      {/* Title & Context */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </span>
          </div>

          <p className="text-xs text-emerald-300/70 mt-0.5 truncate flex items-center gap-2">
            <span>{subtitle || `${currentDate} · 70+ Portals Tracked`}</span>
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Alerts Shortcut */}
        <Link
          href="/alerts"
          className="relative p-2 text-slate-300 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-800/40"
          title="Review Priority Alerts"
        >
          <Bell className="w-4 h-4 text-emerald-300" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-[#071f16]">
              {alertCount}
            </span>
          )}
        </Link>

        {/* Manual Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-300 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-800/40"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* Live Crawl Source Trigger */}
        {onTriggerCrawl && (
          <button
            onClick={onTriggerCrawl}
            disabled={isCrawling}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30 disabled:opacity-60 active:scale-98"
          >
            <Play className={`w-3 h-3 fill-current ${isCrawling ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCrawling ? 'Crawling...' : 'Live Crawl Source'}</span>
            <span className="sm:hidden">Crawl</span>
          </button>
        )}
      </div>
    </header>
  );
}
