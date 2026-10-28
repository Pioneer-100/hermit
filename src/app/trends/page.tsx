'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ArticleDetailModal from '@/components/ArticleDetailModal';
import CleanEnergyPipelineDashboard from '@/components/CleanEnergyPipelineDashboard';
import { Article, TrendAnalytics } from '@/types';
import { INITIAL_HERMIT_PROJECTS } from '@/lib/users-and-projects';
import { getAuthHeaders } from '@/lib/api-client';
import { 
  Download, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  Building2, 
  TrendingUp,
  Radio,
} from 'lucide-react';

export default function TrendsPage() {
  const [analytics, setAnalytics] = useState<TrendAnalytics | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrends = async () => {
    try {
      const [trendsResponse, articlesResponse] = await Promise.all([
        fetch('/api/trends'),
        fetch('/api/articles')
      ]);

      if (trendsResponse.ok) {
        const data = await trendsResponse.json();
        if (data.analytics) setAnalytics(data.analytics);
      }

      if (articlesResponse.ok) {
        const data = await articlesResponse.json();
        if (Array.isArray(data.articles)) setArticles(data.articles);
      }
    } catch (err) {
      console.warn('Failed to load trends and pipeline intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrends = () => {
    setIsLoading(true);
    void loadTrends();
  };

  const handleSelectArticleById = (articleId: number) => {
    const article = articles.find(item => item.id === articleId);
    if (article) setSelectedArticle(article);
  };

  const handleReviewToggle = async (id: number, reviewed: boolean) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ is_reviewed: reviewed })
      });
      if (!response.ok) throw new Error(`Article review update failed with status ${response.status}`);

      setArticles(previous => previous.map(article =>
        article.id === id ? { ...article, is_reviewed: reviewed } : article
      ));
      setSelectedArticle(previous =>
        previous?.id === id ? { ...previous, is_reviewed: reviewed } : previous
      );
    } catch (error) {
      console.error('Failed to update article review status:', error);
    }
  };

  const handleDispatchAlert = async (id: number) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ articleId: id })
      });
      if (!response.ok) throw new Error(`Alert dispatch failed with status ${response.status}`);

      setArticles(previous => previous.map(article =>
        article.id === id ? { ...article, is_alert_sent: true } : article
      ));
    } catch (error) {
      console.error('Failed to dispatch article alert:', error);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadTrends);
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
        subtitle="Phase C — Early-Warning Indicators, Multi-Source Velocity & Market Intelligence"
        onRefresh={refreshTrends}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        <CleanEnergyPipelineDashboard
          projects={INITIAL_HERMIT_PROJECTS}
          articles={articles}
          onSelectArticleById={handleSelectArticleById}
        />

        {/* Figure 4 Main Chart Container: Media Velocity & Mentions */}
        <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/50 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                <h2 className="font-display text-sm sm:text-base font-bold text-white">
                  Media Mention Frequency & Velocity Curve
                </h2>
              </div>
              <p className="text-xs text-cyan-200/70 mt-0.5">
                Dynamic cross-portal volume spike detection aggregated across monitored captures in Supabase
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-blue-950/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-blue-500/40 tabular">
                {analytics?.totalMentions ?? 0} Evaluated Items
              </span>
              <button
                onClick={loadTrends}
                className="p-1.5 rounded-xl text-cyan-300 hover:text-white hover:bg-blue-900/50 border border-blue-800/40 transition-colors active:scale-95"
                title="Refresh Metrics"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Dynamic SVG Trend Line Graph */}
          <div className="relative w-full min-h-[18rem] sm:h-72 bg-[#041910]/85 rounded-2xl border border-blue-500/20 p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs text-cyan-300/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Active Frequency Index (70+ Portals)</span>
              </span>
              <span className="font-bold text-cyan-300">
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
              <div className="h-36 sm:h-44 flex items-center justify-center text-xs text-cyan-300/60 font-mono">
                Compiling timeline velocity telemetry...
              </div>
            )}

            {/* Dynamic Inflection Alert Callout Box */}
            {peakPoint && (
              <div className="hidden xs:block absolute right-3 sm:right-6 top-10 sm:top-14 bg-[#1a0c10]/95 backdrop-blur-md border border-rose-500/40 text-rose-200 p-2.5 sm:p-3 rounded-xl shadow-xl max-w-[190px] sm:max-w-xs text-xs space-y-1 z-10">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Peak: {peakPoint.count} mentions</span>
                </div>
                <p className="text-[10px] sm:text-xs text-rose-200/80 leading-tight">
                  High concentration of policy notices around {peakPoint.label}.
                </p>
              </div>
            )}

            {/* Dynamic Date Ticks */}
            <div className="flex justify-between text-[10px] sm:text-xs text-cyan-300/60 border-t border-blue-900/40 pt-2 font-mono">
              {points.filter((_, idx) => idx % Math.ceil(points.length / 5) === 0 || idx === points.length - 1).map((p, idx) => (
                <span key={idx}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Executive Signal Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Article Type Distribution */}
          <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-sm font-bold text-white">Signal Classification</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300/70 uppercase">By Category</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {(analytics?.typeBreakdown || []).slice(0, 5).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200/90 truncate max-w-[190px]">{item.label}</span>
                    <span className="font-mono text-cyan-300 font-bold tabular">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-950/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(item.percentage, 4)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
              {(!analytics?.typeBreakdown || analytics.typeBreakdown.length === 0) && (
                <div className="text-xs text-blue-400/60 py-4 text-center font-mono">
                  Awaiting category telemetry...
                </div>
              )}
            </div>
          </div>

          {/* 2. Risk & Impact Exposure Radar */}
          <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-bold text-white">Risk Exposure Tier</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300/70 uppercase">Triage</span>
            </div>

            <div className="space-y-3 pt-1">
              {(analytics?.riskBreakdown || []).map((item, idx) => (
                <div key={idx} className="bg-[#041910]/70 p-2.5 rounded-xl border border-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{item.level}</div>
                      <div className="text-[10px] text-cyan-300/60 font-mono tabular">{item.count} items recorded</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold tabular" style={{ color: item.color }}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Source Category Footprint */}
          <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-sm font-bold text-white">Source Footprint</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300/70 uppercase">Rotated Origin</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {(analytics?.sourceBreakdown || []).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200/90 truncate">{item.category}</span>
                    <span className="font-mono text-cyan-300 font-bold tabular">{item.count} hits</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-950/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(item.percentage, 5)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stakeholder Heatmap & Activity Co-occurrence */}
        <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-white">Active Stakeholder Mentions</h3>
                <p className="text-xs text-cyan-200/70">
                  Key entities, utilities and DFIs driving regulatory and operational disclosures
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-500/30">
              Co-occurrence Matrix
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(analytics?.stakeholderHeatmap || []).map((st, idx) => (
              <div 
                key={idx} 
                className="bg-[#041910]/90 border border-blue-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-blue-500/50 transition-colors"
              >
                <div className="text-xs font-bold text-white truncate" title={st.name}>
                  {st.name}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-900/40">
                  <span className="text-[10px] font-mono text-cyan-300/80 tabular">
                    {st.mentions} mentions
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                    st.sentiment === 'critical' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : st.sentiment === 'constructive'
                      ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                      : 'bg-slate-700/40 text-slate-300'
                  }`}>
                    {st.sentiment}
                  </span>
                </div>
              </div>
            ))}
            {(!analytics?.stakeholderHeatmap || analytics.stakeholderHeatmap.length === 0) && (
              <div className="col-span-full py-4 text-center text-xs text-cyan-300/60 font-mono">
                Scanning entities from parsed intelligence...
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Tracked Topics Table */}
        <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/50 pb-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-white">Priority Tracked Strategic Themes</h3>
                <p className="text-xs text-cyan-200/70">
                  Continuous keyword velocity calculations across verified Zimbabwean gazettes and energy press
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Briefing</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-blue-900/50 text-cyan-300/60 uppercase font-mono tracking-wider text-[10px] sm:text-xs">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Theme / Vector</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Captures</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Velocity Signal</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Risk Tier</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Sub-Sector</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold">Dynamic State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {(analytics?.topics || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#093524]/60 transition-colors">
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-white">
                      {item.topic}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-bold text-cyan-300 tabular">
                      {item.count}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-bold text-cyan-300 tabular">
                      {item.trend}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.riskLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : item.riskLevel === 'MED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-600/20 text-cyan-300 border border-blue-500/40'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-cyan-200 font-semibold">
                      {item.category}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-cyan-200/70 font-normal">
                      {item.velocity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onReviewToggle={handleReviewToggle}
        onDispatchAlert={handleDispatchAlert}
      />
    </div>
  );
}
