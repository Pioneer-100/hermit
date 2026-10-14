'use client';

import { useState, useEffect } from 'react';
import { DailyBrief, Article } from '@/types';
import { useAuth } from '@/components/AuthContext';
import { 
  Zap, 
  Sparkles, 
  Download, 
  Printer, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Building2, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  Layers,
  ChevronDown,
  ExternalLink,
  Radio,
  FileText,
  Users,
  Check
} from 'lucide-react';

interface ExecutiveDailyBriefProps {
  brief: DailyBrief;
  onSelectArticle: (articleId: number) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating: boolean;
  onViewLiveFeed: () => void;
  onReviewToggle?: (id: number, reviewed: boolean) => void;
  reviewedArticleIds?: number[];
}

export default function ExecutiveDailyBrief({
  brief,
  onSelectArticle,
  onRegenerate,
  isRegenerating,
  onViewLiveFeed,
  onReviewToggle,
  reviewedArticleIds = []
}: ExecutiveDailyBriefProps) {
  const { currentUser } = useAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pillars' | 'telemetry'>('overview');
  const [claimedActions, setClaimedActions] = useState<Record<number, string>>({});

  const handleClaimAction = (idx: number) => {
    setClaimedActions(prev => ({
      ...prev,
      [idx]: prev[idx] ? '' : `${currentUser.full_name} (${currentUser.title || currentUser.role})`
    }));
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const speechText = `Hermit Investments Executive Intelligence Briefing for ${brief.date}. Market sentiment is ${brief.market_sentiment}, with a risk index of ${brief.risk_index} out of 100, classified as ${brief.risk_label}. Today's lead development: ${brief.headline}. Executive summary: ${brief.executive_summary}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha'))) || voices.find(v => v.lang.startsWith('en'));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Executive Intelligence Document Container */}
      <div className="bg-[#052216]/75 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 overflow-hidden text-white">
        
        {/* Document Header Band */}
        <div className="bg-gradient-to-r from-[#072c1e]/90 via-[#0d422f]/90 to-[#072c1e]/90 text-white p-6 border-b border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-800/50">
            {/* Hermit Monogram & Document Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#072418] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[11px] uppercase tracking-widest text-emerald-300">
                    HERMIT INVESTMENTS &bull; EXECUTIVE INTELLIGENCE BRIEFING
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    TODAY&apos;S REPORT
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  {brief.date} &bull; What&apos;s Up Today &bull; Synthesized across {brief.total_articles_scanned} live sources
                </p>
              </div>
            </div>

            {/* Document Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Audio Brief Toggle */}
              <button
                onClick={toggleAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-md'
                    : 'bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border-emerald-600/50'
                }`}
                title="Play Audio Executive Brief"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Briefing</span>
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-emerald-950 animate-pulse" />
                      <span className="w-1 h-4 bg-emerald-950 animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-emerald-950 animate-pulse delay-150" />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Audio Brief</span>
                  </>
                )}
              </button>

              {/* Regenerate with Gemini */}
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-600/50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Regenerate Executive Synthesis via Gemini 2.0"
              >
                <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>

              {/* Print / Export */}
              <button
                onClick={() => window.print()}
                className="bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-600/50 p-2 rounded-xl transition-all"
                title="Print or Export PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lead Headline & Status Metrics */}
          <div className="pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {brief.market_sentiment.toUpperCase()} TAILWINDS
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                RISK INDEX: {brief.risk_index}/100 ({brief.risk_label})
              </span>

              <span className="text-[11px] text-emerald-200/70 font-mono">
                {brief.total_articles_scanned} media captures evaluated &bull; {brief.high_relevance_count} critical flags
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              {brief.headline}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-4xl font-normal">
              {brief.executive_summary}
            </p>
          </div>
        </div>

        {/* Visual Charts & Telemetry Strip (Translucent Green) */}
        <div className="p-6 bg-[#041c12]/60 border-b border-emerald-900/40 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-emerald-200 uppercase tracking-wider">
                Today&apos;s Media Telemetry & Sector Dynamics
              </h3>
            </div>
            <span className="text-[11px] text-emerald-300/70 font-mono">Real-Time Aggregates</span>
          </div>

          {/* 3 Visual Digest Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Chart 1: Sector Concentration Distribution (5 cols) */}
            <div className="lg:col-span-5 bg-[#06281c]/75 backdrop-blur-sm p-4.5 rounded-xl border border-emerald-500/25 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                  Media Topic Allocation
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Normalized</span>
              </div>

              {/* Progress Stack Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-emerald-950/80">
                {brief.sector_breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all hover:opacity-80"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    title={`${item.category}: ${item.percentage}% (${item.count} items)`}
                  />
                ))}
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {brief.sector_breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-[#03180f]/80 border border-emerald-900/50">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-emerald-200 font-medium truncate text-[11px]">{item.category}</span>
                    </div>
                    <span className="font-bold text-white font-mono text-[11px] shrink-0 ml-1">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Risk Gauge & Early Warning Indicators (3 cols) */}
            <div className="lg:col-span-3 bg-[#06281c]/75 backdrop-blur-sm p-4.5 rounded-xl border border-emerald-500/25 shadow-md flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                  Regulatory Risk Index
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  {brief.risk_label}
                </span>
              </div>

              {/* Score Dial Representation */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full bg-[#03180f] flex items-center justify-center shrink-0 border-2 border-emerald-500/40 shadow-inner">
                  <span className="text-xl font-black text-white font-mono">
                    {brief.risk_index}
                  </span>
                  <span className="text-[9px] text-emerald-400 absolute bottom-1.5 font-bold">/100</span>
                </div>
                <div className="text-[11px] text-emerald-100/90 space-y-1">
                  <div className="font-bold text-emerald-300">Moderate Velocity:</div>
                  <div className="text-[10.5px] text-emerald-200/80 leading-snug">
                    Tariff revision mentions up <strong className="text-rose-400">+340%</strong> over baseline.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-900/40 text-[10px] text-emerald-300/70 flex items-center justify-between">
                <span>Confidence: 94%</span>
                <span className="text-emerald-400 font-bold">Active Signal</span>
              </div>
            </div>

            {/* Chart 3: Active Institutional Stakeholders (4 cols) */}
            <div className="lg:col-span-4 bg-[#06281c]/75 backdrop-blur-sm p-4.5 rounded-xl border border-emerald-500/25 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                  Active Stakeholders Today
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">Mention Count</span>
              </div>

              <div className="space-y-1.5">
                {brief.key_stakeholders_active.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-[#03180f]/80 border border-emerald-900/50 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-100 truncate">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        s.stance === 'regulatory'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : s.stance === 'financing'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : s.stance === 'warning'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {s.stance}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-300">
                        {s.mentions}x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* The 4 Strategic Intelligence Pillars of the Day */}
        <div className="p-6 sm:p-8 space-y-4 bg-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                The 4 Strategic Intelligence Pillars of the Day
              </h3>
              <p className="text-xs text-emerald-200/75 mt-0.5">
                Direct commercial implications & recommended response actions for Hermit Investments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brief.strategic_pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-[#06281c]/75 backdrop-blur-sm rounded-xl p-5 border border-emerald-500/25 hover:border-emerald-400/50 hover:bg-[#083525]/85 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-3 border-l-4 border-l-emerald-400 text-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40 uppercase">
                      {pillar.category}
                    </span>
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      {pillar.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {pillar.title}
                  </h4>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-[#03170e]/85 p-2.5 rounded-lg border border-emerald-900/50">
                      <span className="font-bold text-emerald-300">Commercial Impact: </span>
                      <span className="text-emerald-100/90">{pillar.impact}</span>
                    </div>

                    <div className="bg-[#052b1b]/80 p-2.5 rounded-lg border border-emerald-500/30">
                      <span className="font-bold text-emerald-300">Strategic Takeaway: </span>
                      <span className="text-emerald-100 font-medium">{pillar.takeaway}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-300/60 font-mono">
                      {pillar.source} &bull; {pillar.time}
                    </span>
                    {pillar.related_article_id && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        reviewedArticleIds.includes(pillar.related_article_id)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {reviewedArticleIds.includes(pillar.related_article_id) ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Signed Off</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            <span>Pending Sign-off</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {pillar.related_article_id && onReviewToggle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isReviewed = reviewedArticleIds.includes(pillar.related_article_id!);
                          onReviewToggle(pillar.related_article_id!, !isReviewed);
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                          reviewedArticleIds.includes(pillar.related_article_id)
                            ? 'bg-[#03180f] text-emerald-400 border-emerald-700/50 hover:bg-[#062418]'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-sm'
                        }`}
                      >
                        {reviewedArticleIds.includes(pillar.related_article_id) ? 'Revoke' : 'Sign Off'}
                      </button>
                    )}

                    {pillar.related_article_id && (
                      <button
                        onClick={() => onSelectArticle(pillar.related_article_id!)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group py-1"
                      >
                        <span>Full Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Executive Action Plan */}
        <div className="p-6 bg-gradient-to-br from-[#041a10]/90 to-[#02130c]/90 border-t border-emerald-900/50 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-emerald-950 font-black flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Hermit Executive Action Plan (Communications Officer & Management)
              </h4>
              <p className="text-[11px] text-emerald-200/70">Immediate directives derived from today&apos;s surveillance</p>
            </div>
          </div>

          <div className="space-y-2">
            {brief.management_actions.map((act, i) => {
              const isClaimed = Boolean(claimedActions[i]);
              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#06261b]/80 backdrop-blur-sm border border-emerald-500/25 shadow-md text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5 ${
                      act.priority === 'immediate'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {act.priority}
                    </span>
                    <span className="text-emerald-100 font-medium leading-relaxed">{act.action}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                      {isClaimed ? `Assigned: ${claimedActions[i]}` : `Dept: ${act.owner}`}
                    </span>

                    <button
                      onClick={() => handleClaimAction(i)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border ${
                        isClaimed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-sm'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Claimed</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3" />
                          <span>Take Ownership</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Transition Banner to the Full Live Feed */}
        <div className="bg-[#03160e]/90 text-emerald-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-900/50">
          <div className="flex items-center gap-2 text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              Want to inspect individual raw captures, execute custom search, or filter by source?
            </span>
          </div>

          <button
            onClick={onViewLiveFeed}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <span>Explore Full Live Feed Stream ({brief.total_articles_scanned} Captures)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
