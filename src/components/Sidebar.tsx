'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'Executive Briefing', icon: LayoutDashboard },
  { href: '/feed', label: 'Intelligence Feed', icon: Radio, subtext: 'Continuous stream' },
  { href: '/nexus', label: 'Nexus & Circular Economy', icon: Droplets, subtext: 'Water-Energy-Waste', badge: 'SoW', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { href: '/events', label: 'Events & Funding Calls', icon: Calendar, subtext: 'RFPs, EOIs, Expos', badge: 'Active', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { href: '/alerts', label: 'Priority Alerts', icon: Bell, badge: '4', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { href: '/reports', label: 'Executive Reports', icon: FileText, subtext: 'Daily & Weekly' },
  { href: '/trends', label: 'Trends & Signals', icon: TrendingUp, subtext: 'Early warnings' },
  { href: '/sources', label: 'Source Directory', icon: Globe2, badge: '70+', badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 bg-[#03130d]/98 backdrop-blur-xl text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-emerald-500/20 shadow-2xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-500/20 bg-gradient-to-b from-[#051c13] to-[#03130d] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-0.5 shadow-lg shadow-emerald-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#041d12] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/80" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#051810] animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-sm tracking-wider text-white">HERMIT</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-emerald-400/90 font-medium truncate">Energy Sector Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-display font-bold uppercase tracking-wider text-emerald-500/60">
          Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/20 text-white font-semibold shadow-inner border border-emerald-400/40 backdrop-blur-sm'
                  : 'text-slate-300 hover:bg-emerald-950/40 hover:text-white hover:border hover:border-emerald-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="truncate block">{item.label}</span>
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
      </nav>

      {/* User Profile Card & Role Switcher */}
      <UserProfileBar />

      
    </aside>
  );
}

function UserProfileBar() {
  const { currentUser, availableUsers, switchUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="px-3 py-2 border-t border-emerald-500/20">
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <span>Sign In to Hermit</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-emerald-500/20 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-[#03180f]/70 hover:bg-[#062417]/90 border border-emerald-500/25 backdrop-blur-md transition-all text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate block">
                {currentUser.full_name}
              </span>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-medium truncate block capitalize">
              {currentUser.title || currentUser.role}
            </span>
          </div>
        </div>
        <Users className="w-3.5 h-3.5 text-emerald-400/70 group-hover:text-emerald-300 shrink-0" />
      </button>

      {/* Dropdown switch menu */}
      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#03170e]/95 border border-emerald-500/35 rounded-xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-900/50 flex items-center justify-between">
            <span>Switch Role / User</span>
            <span className="text-[9px] text-emerald-300/60 font-mono">RBAC</span>
          </div>
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex flex-col transition-all ${
                u.id === currentUser.id
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <span className="font-bold">{u.full_name}</span>
              <span className="text-[10px] text-emerald-400/70">{u.title}</span>
            </button>
          ))}

          <div className="pt-1.5 mt-1 border-t border-emerald-900/50">
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
        </div>
      )}
    </div>
  );
}
