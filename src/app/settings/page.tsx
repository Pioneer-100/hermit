'use client';

import Header from '@/components/Header';
import { Database, Sparkles, Mail, Clock, Info, Zap } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Architecture & Integrations"
        subtitle="Zero-Cost Production Stack (Supabase + Google Gemini + Resend + Vercel)"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-5 sm:space-y-6">
        
        {/* Architecture Summary Box */}
        <div className="bg-gradient-to-r from-[#072c1e]/90 via-[#0d422f]/90 to-[#072c1e]/90 text-white p-4 sm:p-6 rounded-2xl space-y-2 shadow-2xl shadow-emerald-950/40 border border-emerald-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span>Hermit Investments Media Surveillance Infrastructure</span>
          </div>
          <h2 className="font-display text-lg sm:text-2xl font-black">100% Free-Tier Production & Demo Deployment</h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
            This system runs without ongoing cloud server costs during pilot review, while delivering high uptime, automated AI classification, and real-time push alerts.
          </p>
        </div>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          
          {/* Supabase Status */}
          <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">Supabase (PostgreSQL)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE / SEEDED
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
              Stores structured fields specified in ToR: headline, source, author, summary, quoted stakeholders, relevance score, AI impact notes, and source URLs.
            </p>
            <div className="text-[11px] text-emerald-300/60 font-mono pt-2 border-t border-emerald-900/40 flex items-center justify-between">
              <span>Schema: 001_initial_schema.sql</span>
              <span className="text-emerald-400 font-bold">500MB Free Tier</span>
            </div>
          </div>

          {/* Gemini AI Status */}
          <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">Google Gemini 2.0 Flash</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
              Performs real-time energy sector classification (tariff change, regulation, funding), relevance scoring (0-100%), and Hermit commercial impact drafting.
            </p>
            <div className="text-[11px] text-emerald-300/60 font-mono pt-2 border-t border-emerald-900/40 flex items-center justify-between">
              <span>Model: gemini-2.0-flash</span>
              <span className="text-emerald-400 font-bold">15 RPM Free Tier</span>
            </div>
          </div>

          {/* Resend Email Status */}
          <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">Email Dispatches (Resend)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                DISPATCH READY
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
              Routes real-time high-relevance alerts directly to the Communications Officer and Management executive inboxes with branded HTML briefs.
            </p>
            <div className="text-[11px] text-emerald-300/60 font-mono pt-2 border-t border-emerald-900/40 flex items-center justify-between">
              <span>Target: communications@hermit...</span>
              <span className="text-emerald-400 font-bold">100 emails/day Free</span>
            </div>
          </div>

          {/* Vercel Cron Status */}
          <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">Automated Polling (Cron)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                CONFIGURED
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
              Scheduled web crawls triggered via <code className="text-[11px] bg-[#041a12] px-1 py-0.5 rounded text-emerald-300 font-mono border border-emerald-900/50">vercel.json</code>. Polling runs every 4 hours for press portals and daily at 18:00 for reports.
            </p>
            <div className="text-[11px] text-emerald-300/60 font-mono pt-2 border-t border-emerald-900/40 flex items-center justify-between">
              <span>Next Run: 18:00 CAT</span>
              <span className="text-emerald-400 font-bold">Vercel Cron API</span>
            </div>
          </div>

        </div>

        {/* Environment File Instruction */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-6 text-xs text-white space-y-3 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-white text-sm font-display">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Connecting Production API Keys (.env.local)</span>
          </div>
          <p className="leading-relaxed font-normal text-emerald-100/80">
            The platform works out-of-the-box in standalone demo mode with pre-seeded data and simulated delivery. When linking live credentials, place your keys in <code className="font-mono bg-[#041a12] px-1.5 py-0.5 rounded border border-emerald-800 text-emerald-300">.env.local</code>:
          </p>
          <pre className="bg-[#03150d] text-emerald-300 p-3 sm:p-4 rounded-xl font-mono text-[10px] sm:text-xs overflow-x-auto border border-emerald-500/30">
{`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Google Gemini
GEMINI_API_KEY=AIzaSy...

# Email (Resend)
RESEND_API_KEY=re_...
ALERT_EMAIL_TO=communications@hermitinvestments.com`}
          </pre>
        </div>
      </main>
    </div>
  );
}
