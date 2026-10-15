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
  Users, 
  LogOut, 
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useDrawer } from '@/components/DrawerContext';

const PRIMARY_NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dash' },
  { href: '/feed', icon: Radio, label: 'Feed' },
  { href: '/alerts', icon: Bell, label: 'Alerts', badge: '4' },
  { href: '/reports', icon: FileText, label: 'Reports' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { currentUser, availableUsers, switchUser, logout } = useAuth();
  const { openChat } = useDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);

  if (pathname === '/login') {
    return null;
  }

  const isMoreActive = ['/trends', '/sources', '/settings'].includes(pathname) || isMenuOpen;

  const handleOpenChat = () => {
    setIsMenuOpen(false);
    openChat();
  };

  return (
    <>
      {/* Mobile Drawer / Bottom Sheet Overlay */}
      {isMenuOpen && (
        <div 
          onClick={() => { setIsMenuOpen(false); setIsSwitchingUser(false); }}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-Up Mobile Navigation Sheet */}
      {isMenuOpen && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-50 bg-[#020e08]/95 border-t border-emerald-500/30 rounded-t-3xl shadow-2xl backdrop-blur-2xl p-4 sm:p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-white">
          {/* Header handle & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Hermit Executive Hub
              </span>
            </div>
            <button
              onClick={() => { setIsMenuOpen(false); setIsSwitchingUser(false); }}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="my-3.5 p-3 rounded-2xl bg-[#041d13]/85 border border-emerald-500/25">
            {currentUser ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                      {currentUser.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.full_name}
                      </div>
                      <div className="text-[10px] text-emerald-300/80 font-mono capitalize">
                        {currentUser.title || currentUser.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSwitchingUser(!isSwitchingUser)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 active:scale-95"
                  >
                    <Users className="w-3 h-3" />
                    <span>{isSwitchingUser ? 'Hide' : 'Switch'}</span>
                  </button>
                </div>

                {/* Submenu: Demo Persona Switcher */}
                {isSwitchingUser && (
                  <div className="pt-2 border-t border-emerald-900/50 space-y-1 animate-in fade-in duration-150">
                    <div className="text-[9px] font-mono uppercase text-emerald-400/70 pb-1">
                      Select Persona (RBAC):
                    </div>
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsSwitchingUser(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          u.id === currentUser.id
                            ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                            : 'text-slate-300 hover:bg-emerald-900/40'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">{u.full_name}</div>
                          <div className="text-[10px] text-emerald-400/80">{u.title}</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                <span>Sign In to Hermit</span>
              </Link>
            )}
          </div>

          {/* Quick Hub Navigation Links */}
          <div className="space-y-1.5">
            <Link
              href="/trends"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/trends'
                  ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40'
                  : 'bg-[#03180f]/80 text-slate-200 border-emerald-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Trends & Velocity Signals</div>
                  <div className="text-[10px] text-emerald-300/70">Early-warning statistical indices</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/70" />
            </Link>

            <Link
              href="/sources"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/sources'
                  ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40'
                  : 'bg-[#03180f]/80 text-slate-200 border-emerald-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Source Coverage Directory</div>
                  <div className="text-[10px] text-emerald-300/70">70+ monitored Zimbabwean energy portals</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/70" />
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/settings'
                  ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40'
                  : 'bg-[#03180f]/80 text-slate-200 border-emerald-900/50 hover:bg-[#072418]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Integrations & Architecture</div>
                  <div className="text-[10px] text-emerald-300/70">Supabase, Gemini 2.0, Resend stack</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/70" />
            </Link>

            {/* AI Advisor Shortcut */}
            <button
              onClick={handleOpenChat}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-900/60 to-emerald-800/60 text-emerald-100 border border-emerald-500/40 shadow-md active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Ask Hermit AI Advisor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-emerald-200/80">Contextual IPP & tariff queries</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>

          {/* Footer Actions */}
          {currentUser && (
            <div className="pt-3 mt-3 border-t border-emerald-900/50 flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-400/70 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020e08]/90 border-t border-emerald-500/25 shadow-2xl flex items-center justify-around px-2 py-2 backdrop-blur-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                isActive ? 'text-emerald-300 bg-emerald-900/40 font-bold shadow-inner border border-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-[#020e08]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Button: More / Hub Trigger */}
        <button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsSwitchingUser(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] relative ${
            isMoreActive ? 'text-emerald-300 bg-emerald-900/40 font-bold border border-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'
          }`}
          aria-label="Open More Menu"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-medium tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
}
