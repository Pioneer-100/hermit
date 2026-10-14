import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
export const metadata: Metadata = {
  title: 'Hermit Investments — Energy Sector Intelligence & Media Monitor',
  description: 'AI-assisted web surveillance and executive media monitoring platform covering Zimbabwean renewable energy, IPPs, tariff policies, and infrastructure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-[#03130c] text-emerald-50 antialiased font-sans overflow-hidden">
        {/* Fixed Left Executive Sidebar (Hidden on mobile) */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        
        {/* Mobile Navigation (Visible only on mobile) */}
        <MobileNav />
        
        {/* Main Application Canvas for All Pages */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative bg-[#020e08] pb-16 md:pb-0">
          {/* Kariba Dam Wall with Floating Solar Array Background */}
          <div 
            className="fixed inset-0 md:left-64 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-90"
            style={{ backgroundImage: "url('/kariba_dam_solar.jpg')" }}
          />
          {/* Subtle translucent emerald green atmospheric tint */}
          <div className="fixed inset-0 md:left-64 pointer-events-none z-0 bg-gradient-to-b from-[#031910]/50 via-[#02140c]/65 to-[#010c07]/80" />
          <div className="fixed inset-0 md:left-64 pointer-events-none z-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent_70%)]" />

          {/* Page Content Layer */}
          <div className="relative z-10 flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
