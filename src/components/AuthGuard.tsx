'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Zap } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-50">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 p-0.5 shadow-2xl shadow-blue-950/80 flex items-center justify-center animate-pulse mb-4">
          <div className="w-full h-full bg-[#0a1d36] rounded-[14px] flex items-center justify-center">
            <Zap className="w-7 h-7 text-blue-400 fill-blue-400" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-400 rounded-full ring-2 ring-[#03130c] animate-ping" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300/90">
          Hermit Intelligence Security
        </p>
        <p className="text-[11px] text-blue-400/60 mt-1 font-mono">
          Verifying credentials & access level...
        </p>
      </div>
    );
  }

  // Prevent flash of protected dashboard if unauthenticated and redirecting
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
