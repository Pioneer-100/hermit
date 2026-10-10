'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Radio, Bell, FileText, Globe2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dash' },
  { href: '/feed', icon: Radio, label: 'Feed' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/reports', icon: FileText, label: 'Reports' },
  { href: '/sources', icon: Globe2, label: 'Sources' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#051810] border-t border-emerald-900/50 shadow-2xl flex items-center justify-around px-2 py-3 backdrop-blur-lg pb-safe">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-300 bg-emerald-900/40' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
