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
      <body className="h-full flex bg-[#0b1712] text-[#f0f5f0] antialiased font-sans overflow-hidden">
        <AuthProvider>
          <AuthGuard>
            <DrawerProvider>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#0b1712]" />

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
