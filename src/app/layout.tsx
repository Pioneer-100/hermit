import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { AuthProvider } from '@/components/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { DrawerProvider } from '@/components/DrawerContext';
import AIChatDrawer from '@/components/AIChatDrawer';

// Display / heading font — geometric, techy, distinctive
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
});

// Body / UI font — humanist, highly legible at all sizes
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

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
    <html lang="en" className={`h-full ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="h-full flex bg-[#03130c] text-emerald-50 antialiased font-sans overflow-hidden">
        <AuthProvider>
          <AuthGuard>
            <DrawerProvider>
            {/* Unified Full-Bleed Background: Kariba Dam Wall with Floating Solar Array */}
            <div 
              className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-95 brightness-110 contrast-105"
              style={{ backgroundImage: "url('/kariba_dam_solar.jpg')" }}
            />
            {/* Lighter, translucent, sunlit emerald atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#062c1d]/30 via-[#042015]/45 to-[#02140d]/65 backdrop-contrast-105" />
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,rgba(52,211,153,0.18),transparent_75%)]" />
            
            {/* Left-edge vignette gradient to ensure crisp, legible contrast behind the sidebar navigation (desktop only) */}
            <div className="hidden md:block fixed inset-y-0 left-0 w-80 pointer-events-none z-0 bg-gradient-to-r from-[#020e07]/85 via-[#020e07]/50 to-transparent" />

            {/* Fixed Left Executive Sidebar (Hidden on mobile) */}
            <div className="hidden md:flex relative z-20">
              <Sidebar />
            </div>
            
            {/* Mobile Navigation (Visible only on mobile) */}
            <MobileNav />
            
            {/* Main Application Canvas for All Pages */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 bg-transparent pb-20 md:pb-0">
              {/* Page Content Layer */}
              <div className="relative z-10 flex-1 flex flex-col min-w-0">
                {children}
              </div>
            </div>

            {/* AI Chat Drawer - overlays all content */}
            <AIChatDrawer />
            </DrawerProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
