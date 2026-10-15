'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { TrendAnalytics } from '@/types';
import { Download, AlertTriangle, Activity, RefreshCw } from 'lucide-react';

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

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        
        {/* Figure 4 Main Chart Container */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Media Mention Frequency & Velocity Curve
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/70 mt-0.5">
                Dynamic cross-portal volume spike detection aggregated across monitored captures in Supabase
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-emerald-500/40">
                {analytics?.totalMentions ?? 0} Evaluated Items
              </span>
              <button
                onClick={loadTrends}
                className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/50 border border-emerald-800/40 transition-colors active:scale-95"
                title="Refresh Metrics"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Dynamic SVG Trend Line Graph */}
          <div className="relative w-full min-h-[18rem] sm:h-72 bg-[#041910]/85 rounded-2xl border border-emerald-500/20 p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs text-emerald-300/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Active Frequency Index (70+ Portals)</span>
              </span>
              <span className="font-bold text-emerald-300">
                Risk Index: {analytics?.averageRiskIndex ?? 70}/100
              </span>
            </div>

            {/* Dynamic SVG Curve */}
            {points.length > 0 ? (
              <div className="w-full my-auto overflow-hidden">
                <svg className="w-full h-36 sm:h-44 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
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
              </div>
            ) : (
              <div className="h-36 sm:h-44 flex items-center justify-center text-xs text-emerald-300/60 font-mono">
                Compiling timeline velocity telemetry...
              </div>
            )}

            {/* Dynamic Inflection Alert Callout Box */}
            {peakPoint && (
              <div className="hidden xs:block absolute right-3 sm:right-6 top-10 sm:top-14 bg-[#1a0c10]/95 backdrop-blur-md border border-rose-500/40 text-rose-200 p-2 sm:p-3 rounded-xl shadow-xl max-w-[190px] sm:max-w-xs text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 z-10">
                <div className="font-extrabold flex items-center gap-1 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Peak: {peakPoint.count} mentions</span>
                </div>
                <p className="text-[9px] sm:text-[11px] text-rose-200/80 leading-tight">
                  High concentration of policy notices around {peakPoint.label}.
                </p>
              </div>
            )}

            {/* Dynamic Date Ticks */}
            <div className="flex justify-between text-[10px] sm:text-xs text-emerald-300/60 border-t border-emerald-900/40 pt-2 font-mono">
              {points.filter((_, idx) => idx % Math.ceil(points.length / 5) === 0 || idx === points.length - 1).map((p, idx) => (
                <span key={idx}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Tracked Topics Table */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Priority Tracked Topics</h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/70">
                Calculated from real article mentions across national press and statutory gazettes
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Briefing</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-emerald-900/50 text-emerald-300/60 uppercase font-mono tracking-wider text-[10px] sm:text-xs">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Topic Name</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Captures</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Signal</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Risk</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Domain</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {(analytics?.topics || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#093524]/60 transition-colors">
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-white">
                      {item.topic}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-bold text-emerald-300">
                      {item.count}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-bold text-emerald-300">
                      {item.trend}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.riskLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : item.riskLevel === 'MED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-emerald-200 font-semibold">
                      {item.category}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-emerald-200/70 font-normal">
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
