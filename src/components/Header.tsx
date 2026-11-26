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
    <header className="bg-[#13231b] border-b border-[#34483d] px-3.5 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-20">
      <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-4">
        {/* Compact title and essential context */}
        <div className="min-w-0 lg:flex-1">
          <h1 className="font-display text-sm sm:text-base font-semibold text-[#f0f5f0] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-[#b5c5b9] mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Compact metadata and action controls */}
        <div className="flex items-center justify-between gap-2 w-full lg:w-auto lg:justify-end">
          <div className="text-[10px] sm:text-[11px] text-[#b5c5b9] whitespace-nowrap overflow-hidden text-ellipsis">
            {currentDate} · 55 Portals
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Alerts Shortcut (temporarily commented out for rework) */}
        {/*
        <Link
          href="/alerts"
          className="relative p-2 text-slate-300 hover:text-white hover:bg-blue-900/40 rounded-xl transition-colors border border-blue-800/40 flex items-center justify-center active:scale-95"
          title="Review Priority Alerts"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4 text-cyan-300" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-[#0c2242]">
              {alertCount}
            </span>
          )}
        </Link>
        */}

        {/* Manual Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-[#b5c5b9] hover:text-[#f0f5f0] hover:bg-[#1a2c22] rounded-lg transition-colors border border-[#34483d] flex items-center justify-center"
            title="Refresh Feed"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Live Crawl Source Trigger */}
        {onTriggerCrawl && (
          <button
            onClick={onTriggerCrawl}
            disabled={isCrawling}
            className="flex items-center gap-1.5 bg-[#49b783] hover:bg-[#58c493] text-[#07130e] px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
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
          className="p-2 text-[#b5c5b9] hover:text-[#f0f5f0] hover:bg-[#1a2c22] rounded-lg transition-colors border border-[#34483d] flex items-center justify-center"
          title="Open AI Assistant"
          aria-label="AI Assistant"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Authenticated User Mini Pill (Desktop) */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#34483d]">
            <div className="w-7 h-7 rounded-lg bg-[#49b783] text-[#07130e] font-semibold text-xs flex items-center justify-center">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-[#f0f5f0] leading-tight truncate max-w-[130px]">
                {currentUser.full_name}
              </div>
              <div className="text-[9px] text-[#b5c5b9] capitalize">
                {currentUser.role}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </header>
  );
}
