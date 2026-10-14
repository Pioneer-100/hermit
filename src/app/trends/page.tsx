'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { TrendAnalytics, TrendTopic } from '@/types';
import { Download, TrendingUp, AlertTriangle, ArrowUpRight, ShieldCheck, Zap, Activity, RefreshCw } from 'lucide-react';

export default function TrendsPage() {
  const [analytics, setAnalytics] = useState<TrendAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trends');
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.warn('Failed to load dynamic trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, []);

  // Compute SVG coordinates dynamically based on timeline data points
  const timeline = analytics?.timeline || [];
  const maxCount = Math.max(...timeline.map(t => t.count), 5);
  const svgWidth = 800;
  const svgHeight = 140;
  const paddingX = 40;
  const paddingY = 20;

  const points = timeline.map((item, idx) => {
    const x = paddingX + (idx / Math.max(timeline.length - 1, 1)) * (svgWidth - 2 * paddingX);
    const normalizedY = (item.count / maxCount);
    const y = (svgHeight - paddingY) - normalizedY * (svgHeight - 2 * paddingY);
    return { x: Math.round(x), y: Math.round(y), count: item.count, label: item.label };
  });

  // Generate SVG path command (smooth cubic spline or clean polyline)
  let pathD = '';
  let areaD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = Math.round((prev.x + curr.x) / 2);
      pathD += ` C ${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`;
    }
    const last = points[points.length - 1];
    areaD = `${pathD} L ${last.x},${svgHeight} L ${points[0].x},${svgHeight} Z`;
  }

  // Find peak point
  const peakPoint = points.reduce((max, p) => p.count > max.count ? p : max, points[0] || { x: 400, y: 70, count: 0, label: '' });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Trend & Risk Signals"
        subtitle="Phase C — Early-Warning Indicators & Statistical Volume Tracking across 70+ Portals (Figure 4)"
        onRefresh={loadTrends}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Figure 4 Main Chart Container */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-6 shadow-xl space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-extrabold text-white">
                  Media Mention Frequency & Velocity Curve
                </h2>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Dynamic cross-portal volume spike detection aggregated across monitored captures in Supabase
              </p>
            </div>
            
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                {analytics?.totalMentions ?? 0} Total Evaluated Items
              </span>
              <button
                onClick={loadTrends}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 border border-emerald-800/40 transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Dynamic SVG Trend Line Graph */}
          <div className="relative w-full h-72 bg-[#041910]/85 rounded-xl border border-emerald-500/20 p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between text-xs text-emerald-300/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Frequency Index (70+ Tracked Portals)</span>
              </span>
              <span className="font-bold text-emerald-300">
                Regulatory Risk Index: {analytics?.averageRiskIndex ?? 70}/100
              </span>
            </div>

            {/* Dynamic SVG Curve */}
            {points.length > 0 ? (
              <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Shaded Area */}
                {areaD && <path d={areaD} fill="url(#curveGradient)" />}
                {/* Emerald Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}
                {/* Data point dots */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={p === peakPoint ? 5.5 : 3.5}
                    fill={p === peakPoint ? '#f43f5e' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth={p === peakPoint ? 2 : 1}
                  />
                ))}
              </svg>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-emerald-300/60 font-mono">
                Compiling timeline velocity telemetry...
              </div>
            )}

            {/* Dynamic Inflection Alert Callout Box */}
            {peakPoint && (
              <div className="absolute right-6 top-14 bg-[#1a0c10]/90 backdrop-blur-md border border-rose-500/40 text-rose-200 p-3 rounded-xl shadow-xl max-w-xs text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Inflection Peak: {peakPoint.count} mentions</span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  High concentration of policy notices around {peakPoint.label}.
                </p>
              </div>
            )}

            {/* Dynamic Date Ticks */}
            <div className="flex justify-between text-xs text-emerald-300/60 border-t border-emerald-900/40 pt-2 font-mono">
              {points.filter((_, idx) => idx % Math.ceil(points.length / 5) === 0 || idx === points.length - 1).map((p, idx) => (
                <span key={idx}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Tracked Topics Table */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-6 shadow-xl space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white">Priority Tracked Topics</h3>
              <p className="text-xs text-emerald-200/70">
                Calculated from real article mentions across national press and statutory gazettes
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Briefing (PDF)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-900/50 text-emerald-300/60 uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-bold">Topic Name</th>
                  <th className="py-3 px-4 font-bold">Captures</th>
                  <th className="py-3 px-4 font-bold">Trend Signal</th>
                  <th className="py-3 px-4 font-bold">Risk Assessment</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {(analytics?.topics || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#093524]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.topic}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                      {item.count} items
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                      {item.trend}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.riskLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : item.riskLevel === 'MED'
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
