'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Radio, 
  Bell, 
  FileText, 
  Globe2, 
  TrendingUp, 
  Settings, 
  Menu, 
  X, 
  MessageSquare, 
  LogOut, 
  Zap,
  ChevronRight,
  ShieldCheck,
  Droplets,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useDrawer } from '@/components/DrawerContext';

const PRIMARY_NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Briefing' },
  { href: '/feed', icon: Radio, label: 'Feed' },
  { href: '/nexus', icon: Droplets, label: 'Nexus' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/alerts', icon: Bell, label: 'Alerts', badge: '4' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { openChat } = useDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === '/login') {
    return null;
  }

  const isMoreActive = ['/reports', '/trends', '/sources', '/settings'].includes(pathname) || isMenuOpen;

  const handleOpenChat = () => {
    setIsMenuOpen(false);
    openChat();
  };

  return (
    <>
      {/* Mobile Drawer / Bottom Sheet Overlay */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-Up Mobile Navigation Sheet */}
      {isMenuOpen && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-50 bg-[#040d1a]/95 border-t border-blue-500/30 rounded-t-3xl shadow-2xl backdrop-blur-2xl p-4 sm:p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-white">
          {/* Header handle & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-display text-xs font-black uppercase tracking-wider text-cyan-300">
                Hermit Executive Hub
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-lg text-cyan-300 hover:text-white hover:bg-blue-800/40"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="my-3.5 p-3 rounded-2xl bg-[#091f3a]/85 border border-blue-500/25">
            {currentUser ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-blue-400/40">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-mono capitalize">
                    {currentUser.title || currentUser.role}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-600 text-white font-bold text-xs shadow-md"
              >
                <span>Sign In to Hermit</span>
              </Link>
            )}
          </div>

          {/* Quick Hub Navigation Links */}
          <div className="space-y-1.5">
            <Link
              href="/reports"
              prefetch={true}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/reports'
                  ? 'bg-blue-600/30 text-cyan-200 border-blue-500/40'
                  : 'bg-[#06162a]/80 text-slate-200 border-blue-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Executive Reports & Briefs</div>
                  <div className="text-[10px] text-cyan-300/70">Daily briefs & weekly PDF downloads</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400/70" />
            </Link>
            <Link
              href="/trends"
              prefetch={true}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/trends'
                  ? 'bg-blue-600/30 text-cyan-200 border-blue-500/40'
                  : 'bg-[#06162a]/80 text-slate-200 border-blue-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Trends & Velocity Signals</div>
                  <div className="text-[10px] text-cyan-300/70">Early-warning statistical indices</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400/70" />
            </Link>

            {/*<Link
              href="/sources"
              prefetch={true}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/sources'
                  ? 'bg-blue-600/30 text-cyan-200 border-blue-500/40'
                  : 'bg-[#06162a]/80 text-slate-200 border-blue-900/50 hover:bg-[#072418]'
              }`}
            >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold">Source Coverage Directory</div>
                    <div className="text-[10px] text-cyan-300/70">70+ monitored Zimbabwean energy portals</div>
                  </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400/70" />
            </Link>*/}

           {/* <Link
              href="/settings"
              prefetch={true}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/settings'
                  ? 'bg-blue-600/30 text-cyan-200 border-blue-500/40'
                  : 'bg-[#06162a]/80 text-slate-200 border-blue-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Integrations & Architecture</div>
                  <div className="text-[10px] text-cyan-300/70">Supabase, Gemini 2.0, Resend stack</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400/70" />
            </Link>*/}

            {/* AI Advisor Shortcut */}
            <button
              onClick={handleOpenChat}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-900/60 to-blue-800/60 text-slate-200 border border-blue-500/40 shadow-md active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-cyan-300" />
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Ask Hermit AI Advisor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-cyan-200/80">Contextual IPP & tariff queries</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-300" />
            </button>
          </div>

          {/* Footer Actions */}
          {currentUser && (
            <div className="pt-3 mt-3 border-t border-blue-900/50 flex items-center justify-between text-xs">
              <span className="text-[10px] text-blue-400/70 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>ToR Compliant Platform</span>
              </span>

              <button
                onClick={async () => {
                  setIsMenuOpen(false);
                  await logout();
                }}
                className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-950/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary Fixed Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#06162a]/50 border-t border-blue-400/25 shadow-2xl flex items-center justify-around px-2 py-2 backdrop-blur-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                isActive 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 font-bold shadow-md shadow-blue-950/60 border border-blue-300/50' 
                  : 'text-white/80 hover:text-white bg-[#07162c]/50 border border-blue-500/20'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-300'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-[#040d1a] shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Button: More / Hub Trigger */}
        <button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] relative ${
            isMoreActive 
              ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 font-bold shadow-md shadow-blue-950/60 border border-blue-300/50' 
              : 'text-white/80 hover:text-white bg-[#07162c]/50 border border-blue-500/20'
          }`}
          aria-label="Open More Menu"
        >
          <div className="relative">
            <Menu className={`w-5 h-5 ${isMoreActive ? 'text-white' : 'text-cyan-300'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <span className="text-[10px] font-bold tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">More</span>
        </button>
      </nav>
    </>
  );
}
