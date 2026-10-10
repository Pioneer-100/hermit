'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Radio, 
  Bell, 
  FileText, 
  Globe2, 
  Settings, 
  TrendingUp,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/feed', label: 'Live Feed', icon: Radio, subtext: 'Continuous stream' },
  { href: '/alerts', label: 'Priority Alerts', icon: Bell, badge: '4', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { href: '/reports', label: 'Executive Reports', icon: FileText, subtext: 'Daily & Weekly' },
  { href: '/trends', label: 'Trends & Signals', icon: TrendingUp, subtext: 'Early warnings' },
  { href: '/sources', label: 'Source Directory', icon: Globe2, badge: '70+', badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { href: '/settings', label: 'Integrations & Stack', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#051810] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-emerald-950/80 shadow-2xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/40 bg-gradient-to-b from-[#072217] to-[#051810]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-0.5 shadow-lg shadow-emerald-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#072418] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/80" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#051810] animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-wider text-white">HERMIT</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/90 font-medium truncate">Energy Sector Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500/60">
          Intelligence Navigation
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
                  ? 'bg-gradient-to-r from-emerald-800/60 to-emerald-900/30 text-white font-semibold shadow-inner border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-[#0c2e20]/60 hover:text-white hover:border hover:border-emerald-800/40'
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

      {/* Bottom Live System Status Box */}
      <div className="p-3 m-3 bg-gradient-to-b from-[#09261b] to-[#061c13] rounded-xl border border-emerald-500/20 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-white tracking-wide">Live Surveillance</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono font-bold">
            GEMINI 2.0
          </span>
        </div>

        <p className="text-[10.5px] text-emerald-200/70 leading-relaxed mb-2.5">
          Autonomous multi-source crawling & commercial impact classification active.
        </p>

        <div className="pt-2 border-t border-emerald-900/50 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>ToR Compliant</span>
          </span>
          <span className="font-mono text-slate-400">70+ Sources</span>
        </div>
      </div>
    </aside>
  );
}
