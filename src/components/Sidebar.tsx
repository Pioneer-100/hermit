'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Radio, 
  Bell, 
  FileText, 
  Calendar,
  Recycle,
  Droplets,
  Target,
  Globe2, 
  Settings, 
  TrendingUp,
  Zap,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Bot,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useDrawer } from '@/components/DrawerContext';

const NAV_ITEMS = [
  { href: '/', label: 'Executive Briefing', icon: LayoutDashboard },
  { href: '/feed', label: 'Intelligence Feed', icon: Radio, subtext: 'Continuous stream' },
  { href: '/nexus', label: 'Nexus & Circular Economy', icon: Droplets, subtext: 'Water-Energy-Waste' },
  { href: '/events', label: 'Events & Funding Calls', icon: Calendar, subtext: 'RFPs, EOIs, Expos' },
  // Temporarily commented out for rework:
  // { href: '/alerts', label: 'Priority Alerts', icon: Bell, badge: '4', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { href: '/reports', label: 'Executive Reports', icon: FileText, subtext: 'Daily & Weekly' },
  // { href: '/trends', label: 'Trends & Signals', icon: TrendingUp, subtext: 'Early warnings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isChatOpen, openChat } = useDrawer();

  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 relative text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-blue-500/25 shadow-2xl z-30 select-none overflow-hidden">
      {/* Lightbulb Eco Background Image */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-75 brightness-105 contrast-105"
        style={{ backgroundImage: "url('/navigation_bg.jpg')" }}
      />
      {/* Dark frosted glass atmospheric overlay ensuring all navigation items remain crisp and legible */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#040d1a]/55 via-[#021326]/40 to-[#020a16]/65" />

      {/* Brand Header */}
      <div className="relative z-10 p-4 border-b border-blue-500/25 bg-[#071933]/75 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white/95 p-0.5 shadow-lg shadow-blue-950/50 shrink-0 border border-blue-300/40 group-hover:scale-105 transition-transform duration-200">
            <Image 
              src="/hermit_sustainability_advisory_logo.jpg" 
              alt="Hermit Sustainability Advisory" 
              width={44}
              height={44}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm tracking-wider text-white group-hover:text-cyan-300 transition-colors">HERMIT</h1>
            <p className="text-[11px] text-blue-200 font-medium truncate">Sustainability Advisory</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-display font-bold uppercase tracking-wider text-cyan-300/80 drop-shadow-sm">
          Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 backdrop-blur-md ${
                isActive
                  ? 'bg-blue-600/95 text-white font-semibold shadow-lg shadow-blue-950/80 border border-blue-400/60'
                  : 'text-slate-100 bg-[#040d1a]/70 border border-white/10 hover:bg-[#081b38]/85 hover:text-white hover:border-blue-400/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-500/30 text-white' : 'text-cyan-300 group-hover:text-cyan-200 bg-blue-950/60'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="truncate block font-medium tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{item.label}</span>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* AI Chatbot Navigation Item */}
        <button
          type="button"
          onClick={openChat}
          className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 backdrop-blur-md ${
            isChatOpen
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg shadow-blue-950/80 border border-cyan-400/60'
              : 'text-slate-100 bg-[#040d1a]/70 border border-cyan-500/25 hover:bg-[#081b38]/85 hover:text-white hover:border-cyan-400/50 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1 rounded-lg transition-colors ${
              isChatOpen ? 'bg-white/20 text-white' : 'text-cyan-300 group-hover:text-cyan-200 bg-cyan-950/60 border border-cyan-500/30'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="truncate block font-semibold tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">AI Chatbot</span>
            </div>
          </div>
        </button>
      </nav>

      {/* User Profile */}
      <div className="relative z-10">
        <UserProfileBar />
      </div>
    </aside>
  );
}

function UserProfileBar() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="px-3 py-2 border-t border-blue-500/25 bg-[#071933]/75 backdrop-blur-md">
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <span>Sign In to Hermit</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-blue-500/25 bg-[#071933]/75 backdrop-blur-md relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-[#06162a]/80 hover:bg-[#0c2445]/90 border border-blue-500/30 backdrop-blur-md transition-all text-left group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-blue-400/40 shadow-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate block">
                {currentUser.full_name}
              </span>
            </div>
            <span className="text-[10px] text-cyan-300/80 font-medium truncate block capitalize">
              {currentUser.title || currentUser.role}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-blue-400/70 group-hover:text-cyan-300 shrink-0" />
      </button>

      {/* Dropdown switch menu */}
      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#03170e]/95 border border-blue-500/35 rounded-xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
          <button
            onClick={async () => {
              setIsOpen(false);
              await logout();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
