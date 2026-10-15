'use client';

import Link from 'next/link';
import { RefreshCw, Play, Bell, MessageSquare } from 'lucide-react';
import { useDrawer } from '@/components/DrawerContext';
import { useAuth } from '@/components/AuthContext';

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
  const { currentUser } = useAuth();
  const { openChat } = useDrawer();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-[#072c1e]/75 backdrop-blur-xl border-b border-emerald-400/30 px-3.5 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md shadow-emerald-950/20">
      {/* Title & Context */}
      <div className="flex items-center gap-3 min-w-0 mr-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm sm:text-lg lg:text-xl font-black text-white tracking-tight truncate">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </span>
          </div>

          <p className="text-xs sm:text-xs text-emerald-300/70 mt-0.5 truncate flex items-center gap-2">
            <span>{subtitle || `${currentDate} · 70+ Portals Tracked`}</span>
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Alerts Shortcut */}
        <Link
          href="/alerts"
          className="relative p-2 text-slate-300 hover:text-white hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-800/40 flex items-center justify-center active:scale-95"
          title="Review Priority Alerts"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4 text-emerald-300" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-[#071f16]">
              {alertCount}
            </span>
          )}
        </Link>

        {/* Manual Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-300 hover:text-white hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-800/40 flex items-center justify-center active:scale-95"
            title="Refresh Feed"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* Live Crawl Source Trigger */}
        {onTriggerCrawl && (
          <button
            onClick={onTriggerCrawl}
            disabled={isCrawling}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30 disabled:opacity-60 active:scale-95"
            aria-label="Run Crawl"
          >
            <Play className={`w-3 h-3 fill-current ${isCrawling ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCrawling ? 'Crawling...' : 'Live Crawl Source'}</span>
            <span className="sm:hidden text-xs">{isCrawling ? '...' : 'Crawl'}</span>
          </button>
        )}

        {/* Chat Assistant Trigger */}
        <button
          onClick={openChat}
          className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-800/40 flex items-center justify-center active:scale-95"
          title="Open AI Assistant"
          aria-label="AI Assistant"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Authenticated User Mini Pill (Desktop) */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-emerald-500/25">
            <div className="w-7 h-7 rounded-lg bg-emerald-700/80 text-white font-black text-xs flex items-center justify-center border border-emerald-400/30 shadow-inner">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {currentUser.full_name}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono capitalize">
                {currentUser.role}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
