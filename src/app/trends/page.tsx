'use client';

import Header from '@/components/Header';
import { Download, TrendingUp, AlertTriangle, ArrowUpRight, ShieldCheck, Zap, Activity } from 'lucide-react';

const TRACKED_TOPICS = [
  {
    topic: 'ZERA tariff dispute & IPP framework',
    trend: '▲ +340%',
    riskLevel: 'HIGH',
    category: 'Regulatory',
    color: 'rose',
    velocity: 'Rapid Acceleration'
  },
  {
    topic: 'AfDB renewable funding pipeline',
    trend: '— Stable',
    riskLevel: 'LOW',
    category: 'DFI Capital',
    color: 'emerald',
    velocity: 'Consistent Flow'
  },
  {
    topic: 'SAPP regional grid interconnection',
    trend: '▲ +65%',
    riskLevel: 'MED',
    category: 'Transmission',
    color: 'amber',
    velocity: 'Moderate Shift'
  },
  {
    topic: 'Kariba water rationing & dam reservoir levels',
    trend: '▲ +120%',
    riskLevel: 'HIGH',
    category: 'Operational',
    color: 'rose',
    velocity: 'Escalating Focus'
  },
  {
    topic: 'SI 184 Solar equipment import duty rebate',
    trend: '▲ +45%',
    riskLevel: 'LOW',
    category: 'Fiscal Policy',
    color: 'emerald',
    velocity: 'Standard Tracking'
  }
];

export default function TrendsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Trend & Risk Signals"
        subtitle="Phase C — Early-Warning Indicators & Statistical Volume Tracking across 70+ Portals (Figure 4)"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Figure 4 Main Chart Container */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-6 shadow-xl space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-extrabold text-white">
                  Media Mention Frequency: &ldquo;ZERA tariff dispute&rdquo; — 30-Day Velocity
                </h2>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">Cross-portal volume spike detection & sentiment anomaly curve across Zimbabwean press</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
              Active Monitoring Cycle
            </span>
          </div>

          {/* SVG Trend Line Graph */}
          <div className="relative w-full h-72 bg-[#041910]/85 rounded-xl border border-emerald-500/20 p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between text-xs text-emerald-300/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mention Frequency Index</span>
              </span>
              <span>70+ Monitored Portals</span>
            </div>

            {/* Custom SVG Curve */}
            <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 160">
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area under curve */}
              <path
                d="M 20,135 C 200,132 350,122 480,90 C 580,60 650,25 780,18 L 780,155 L 20,155 Z"
                fill="url(#curveGradient)"
              />
              {/* Emerald Trend Line */}
              <path
                d="M 20,135 C 200,132 350,122 480,90 C 580,60 650,25 780,18"
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Alert Pinpoint Marker at inflection */}
              <circle cx="580" cy="60" r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
            </svg>

            {/* Risk Signal Callout Box */}
            <div className="absolute right-8 top-16 bg-[#1a0c10]/90 backdrop-blur-md border border-rose-500/40 text-rose-200 p-3.5 rounded-xl shadow-xl max-w-xs text-xs space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Risk Spike: mentions up +340%</span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                Surpassed 7-day baseline average across regional business press and official regulatory publications.
              </p>
            </div>

            <div className="flex justify-between text-xs text-emerald-300/50 border-t border-emerald-900/40 pt-2 font-mono">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4 (Current)</span>
            </div>
          </div>
        </div>

        {/* Tracked Topics Table */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-6 shadow-xl space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white">Priority Tracked Topics</h3>
              <p className="text-xs text-emerald-200/70">Auto-ranked by signal strength and deviation from baseline</p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Monthly Report (PDF)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-900/50 text-emerald-300/60 uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-bold">Topic Name</th>
                  <th className="py-3 px-4 font-bold">7-Day Velocity</th>
                  <th className="py-3 px-4 font-bold">Risk Assessment</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Signal Trajectory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {TRACKED_TOPICS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#093524]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.topic}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                      {item.trend}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.color === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : item.color === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-200 font-semibold">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-200/70 font-normal">
                      {item.velocity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
