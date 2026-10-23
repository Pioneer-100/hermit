'use client';

import { useState } from 'react';
import { 
  HermitProject, 
  Article 
} from '@/types';
import { 
  Sun, 
  BatteryCharging, 
  Droplets, 
  Zap, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  ExternalLink, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Leaf,
  Users
} from 'lucide-react';

interface CleanEnergyPipelineDashboardProps {
  projects: HermitProject[];
  articles: Article[];
  onSelectArticleById: (id: number) => void;
}

export default function CleanEnergyPipelineDashboard({
  projects,
  articles,
  onSelectArticleById,
}: CleanEnergyPipelineDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Live Macro Indicators (Curated for Zimbabwean Clean Energy Context)
  const macroSignals = {
    karibaStoragePercent: 11.4,
    karibaWaterLevelMeters: 476.15,
    karibaStatus: 'Critical Hydro Deficit',
    sappDamPriceMwh: 88.50,
    sappDeficitMw: 3150,
    zeraSolarPpaBenchmark: '9.2¢ - 11.5¢ / kWh',
    wheelingTariffAverage: '1.2¢ / kWh'
  };

  // Detailed Project Intelligence Configs
  const projectDetails: Record<number, {
    annualMwh: string;
    co2Offset: string;
    stageIndex: number; // 0 to 4
    stages: string[];
    offtaker: string;
    financingSource: string;
    gridConnection: string;
    regulatoryMilestone: string;
    todaySignal: string;
    urgency: 'high' | 'normal' | 'ready';
  }> = {
    1: {
      annualMwh: '51,800 MWh / yr',
      co2Offset: '41,200 tonnes / yr',
      stageIndex: 2,
      stages: ['Feasibility', 'EIA & Grid Study', 'PPA & ZERA Tariff', 'Financial Close', 'COD (Jun 2027)'],
      offtaker: 'ZETDC National Grid (20-yr Utility PPA)',
      financingSource: 'AfDB / SEFA Blended Debt Facility ($18.5M)',
      gridConnection: 'Marondera 132/33kV Substation (Bay Allocation Confirmed)',
      regulatoryMilestone: 'ZERA Generation License: Stage 2 Tariff Consultation',
      todaySignal: 'ZETDC wheeling framework review allows Hermit to preserve tariff indexation without currency degradation risk.',
      urgency: 'high'
    },
    2: {
      annualMwh: '24,200 MWh / yr',
      co2Offset: '19,500 tonnes / yr',
      stageIndex: 1,
      stages: ['Offtaker Feasibility', 'BESS Co-location Design', 'Bilateral Private PPA', 'Procurement', 'COD (Nov 2027)'],
      offtaker: 'Bulawayo Industrial Park & Mining Offtakers (Private USD Bilateral)',
      financingSource: 'DBSA Green Fund + Commercial Equity Syndicate',
      gridConnection: 'Dedicated 33kV Peaking Feeder with Islanding Capability',
      regulatoryMilestone: 'Behind-the-Meter Captive Approval & Net Metering Registration',
      todaySignal: 'Surging diesel peaking costs ($0.38/kWh) driving corporate mining demand for Hermit’s 10MW/20MWh battery peaking arbitrage.',
      urgency: 'ready'
    },
    3: {
      annualMwh: '8,500 MWh / yr',
      co2Offset: '7,700 tonnes / yr',
      stageIndex: 3,
      stages: ['Hydrological Concession', 'EMA Approval', 'Civil Works Underway', 'Turbine Commissioning', 'COD (Dec 2026)'],
      offtaker: 'Manicaland Agro-Estates & Rural Mini-Grid Network',
      financingSource: 'AfDB Concessional Grant + Rural Electrification Fund (REF)',
      gridConnection: '33kV Eastern Highlands Rural Concession Line + Local Mini-Grid',
      regulatoryMilestone: 'ZINWA 25-yr Water Abstraction Concession & EMA License',
      todaySignal: 'Kariba generation down to 215MW makes eastern mountain run-of-river baseload vital for regional food processing estates.',
      urgency: 'high'
    }
  };

  const getTechIcon = (tech: string) => {
    switch (tech) {
      case 'Solar PV':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Solar + BESS':
        return <BatteryCharging className="w-4 h-4 text-emerald-400" />;
      case 'Hydro':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getTechBorderColor = (tech: string) => {
    switch (tech) {
      case 'Solar PV':
        return 'border-l-amber-400 hover:border-amber-400/50';
      case 'Solar + BESS':
        return 'border-l-emerald-400 hover:border-emerald-400/50';
      case 'Hydro':
        return 'border-l-cyan-400 hover:border-cyan-400/50';
      default:
        return 'border-l-emerald-400';
    }
  };

  const selectedProj = projects.find(p => p.id === selectedProjectId);
  const selectedDetails = selectedProjectId ? projectDetails[selectedProjectId] : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. TOP BAR: PORTFOLIO SUMMARY & LIVE MARKET MACRO SIGNALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* Card A: Hermit Clean Capacity Aggregate */}
        <div className="bg-[#071f16]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-emerald-500/25 shadow-xl flex flex-col justify-between text-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clean Pipeline Capacity</span>
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              3 Projects Active
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              38.5
            </span>
            <span className="text-sm font-bold text-emerald-300">MW Total</span>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-900/50 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-emerald-300/70 block">Est. Annual Output</span>
              <strong className="text-white font-mono">~84,500 MWh/yr</strong>
            </div>
            <div>
              <span className="text-emerald-300/70 block">CO₂ Abatement</span>
              <strong className="text-emerald-400 font-mono">~68,400 T/yr</strong>
            </div>
          </div>
        </div>

        {/* Card B: Kariba Hydrological Live Deficit Signal (ZRA) */}
        <div className="bg-[#241c08]/45 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-amber-400/35 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Kariba Dam Hydrology (ZRA)</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Peaking Demand High
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-amber-200">
              {macroSignals.karibaStoragePercent}%
            </span>
            <span className="text-xs font-medium text-amber-300/80">Usable Storage ({macroSignals.karibaWaterLevelMeters}m asl)</span>
          </div>

          <div className="mt-2 text-[11px] text-amber-100/90 leading-relaxed bg-[#302105]/50 p-2.5 rounded-xl border border-amber-400/25">
            <strong className="text-amber-300 block mb-0.5">Commercial Implication for Hermit:</strong>
            Severe hydro baseload deficit at Kariba South (~215MW output) drives urgent grid appetite for Hermit&apos;s Marondera solar and Bulawayo BESS peaking hours.
          </div>
        </div>

        {/* Card C: SAPP Regional Market & Wheeling Signals */}
        <div className="bg-[#07302f]/45 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-cyan-400/25 shadow-xl flex flex-col justify-between text-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>SAPP Regional Clean Power</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SADC Trading Desk
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              ${macroSignals.sappDamPriceMwh}
            </span>
            <span className="text-xs font-bold text-cyan-300">/ MWh Day-Ahead</span>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-900/50 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-emerald-300/70 block">ZERA Solar Benchmark</span>
              <strong className="text-white font-mono">{macroSignals.zeraSolarPpaBenchmark}</strong>
            </div>
            <div>
              <span className="text-emerald-300/70 block">Regional SADC Shortfall</span>
              <strong className="text-rose-400 font-mono">-{macroSignals.sappDeficitMw} MW</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 2. PROJECT PIPELINE TRACKERS (3 FLAGSHIP ASSETS) */}
      <div className="bg-[#071f16]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-4 sm:p-6 shadow-xl space-y-4 text-white">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Flagship Clean Assets & Portfolio Exposure</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Status Tracker
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/70">
                Continuous alignment between daily regulatory gazettes, ZETDC grid updates, and Hermit development milestones
              </p>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/80 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Click any project to inspect regulatory & technical dossier</span>
          </div>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {projects.map((proj) => {
            const details = projectDetails[proj.id];
            const isSelected = selectedProjectId === proj.id;
            const techBorder = getTechBorderColor(proj.technology);

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                className={`p-4 rounded-xl bg-[#0a422d]/45 hover:bg-[#0e563a]/65 border-l-4 ${techBorder} border border-emerald-400/20 transition-all flex flex-col justify-between gap-3 text-white cursor-pointer group shadow-lg ${
                  isSelected ? 'ring-2 ring-emerald-400 bg-[#0e563a]/75' : ''
                }`}
              >
                <div>
                  {/* Top Bar: Technology Pill + COD Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-white bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                      {getTechIcon(proj.technology)}
                      <span>{proj.technology} &bull; {proj.capacity_mw} MW</span>
                    </span>

                    <span className="text-[10px] font-mono text-emerald-300 font-bold bg-[#02130b] px-2 py-0.5 rounded border border-emerald-800/40">
                      COD: {proj.target_cod ? new Date(proj.target_cod).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'TBD'}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {proj.name}
                  </h4>

                  <div className="text-[11px] text-emerald-400/80 font-medium mt-0.5">
                    {proj.location} &bull; <span className="capitalize">{proj.status.replace('_', ' ')}</span>
                  </div>

                  {/* Milestone Progress Bar */}
                  {details && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-emerald-300/80 mb-1 font-mono">
                        <span>Milestone: Stage {details.stageIndex + 1}/{details.stages.length}</span>
                        <span className="font-bold text-white">{details.stages[details.stageIndex]}</span>
                      </div>
                      <div className="w-full bg-[#02140d] h-1.5 rounded-full overflow-hidden border border-emerald-900/50">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${((details.stageIndex + 1) / details.stages.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Portfolio Exposure Signal */}
                  {details && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#06281b]/55 border border-emerald-400/25 text-[11px] text-emerald-100/90 leading-relaxed">
                      <span className="font-bold text-emerald-400 block mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Today&apos;s Policy & Market Exposure:</span>
                      </span>
                      {details.todaySignal}
                    </div>
                  )}

                  {/* Key Tags */}
                  {proj.key_tags && proj.key_tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {proj.key_tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-200 border border-emerald-400/25 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Manager + Deep Dive Trigger */}
                <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-300/70">
                  <span className="truncate flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Lead: <strong className="text-white">{proj.lead_manager}</strong></span>
                  </span>

                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>{isSelected ? 'Collapse' : 'Dossier'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. EXPANDED DOSSIER DRAWER (WHEN A PROJECT IS SELECTED) */}
        {selectedProj && selectedDetails && (
          <div className="mt-4 p-4 sm:p-5 rounded-xl bg-[#071f16]/95 border border-emerald-500/30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  {getTechIcon(selectedProj.technology)}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>{selectedProj.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {selectedProj.capacity_mw} MW
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-300/80">
                    Lead Manager: <strong className="text-white">{selectedProj.lead_manager}</strong> &bull; Target COD: <strong>{selectedProj.target_cod}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-xs text-emerald-300 hover:text-white font-bold px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700/50 self-start sm:self-auto"
              >
                Close Dossier
              </button>
            </div>

            {/* Dossier 4-Column Technical Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#040d09]/70 border border-emerald-500/20">
                <span className="text-emerald-400/70 text-[10px] uppercase font-bold block mb-1">Commercial Offtaker</span>
                <span className="text-white font-medium">{selectedDetails.offtaker}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#040d09]/70 border border-emerald-500/20">
                <span className="text-emerald-400/70 text-[10px] uppercase font-bold block mb-1">Blended Capital Facility</span>
                <span className="text-white font-medium">{selectedDetails.financingSource}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#040d09]/70 border border-emerald-500/20">
                <span className="text-emerald-400/70 text-[10px] uppercase font-bold block mb-1">Grid Interconnection</span>
                <span className="text-white font-medium">{selectedDetails.gridConnection}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#040d09]/70 border border-emerald-500/20">
                <span className="text-emerald-400/70 text-[10px] uppercase font-bold block mb-1">Key Regulatory Gateway</span>
                <span className="text-white font-medium">{selectedDetails.regulatoryMilestone}</span>
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="mt-4 pt-3 border-t border-emerald-900/50">
              <span className="text-[11px] font-bold text-emerald-300 block mb-2">Development Lifecycle Stages:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {selectedDetails.stages.map((stg, sIdx) => {
                  const isDone = sIdx < selectedDetails.stageIndex;
                  const isCurrent = sIdx === selectedDetails.stageIndex;
                  return (
                    <div 
                      key={sIdx}
                      className={`p-2 rounded-lg text-center border text-[11px] font-bold ${
                        isCurrent
                          ? 'bg-emerald-600/30 text-white border-emerald-400 shadow-sm'
                          : isDone
                          ? 'bg-emerald-950/40 text-emerald-300/80 border-emerald-800/40'
                          : 'bg-[#042015]/45 text-emerald-300/50 border-emerald-900/40'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider mb-0.5 font-mono">
                        {isDone ? 'Completed' : isCurrent ? 'Active Now' : `Step ${sIdx + 1}`}
                      </div>
                      <span className="truncate block">{stg}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Live News Signals */}
            <div className="mt-4 pt-3 border-t border-emerald-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Related Live Intelligence Feeds:</span>
                </span>
                <span className="text-[10px] text-emerald-400/70 font-mono">
                  Real-time matching
                </span>
              </div>

              <div className="space-y-2">
                {articles.slice(0, 2).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticleById(art.id)}
                    className="p-2.5 rounded-lg bg-[#040d09]/70 hover:bg-[#0a2b1e]/80 border border-emerald-400/25 hover:border-emerald-300/40 cursor-pointer flex items-center justify-between gap-3 text-white transition-all group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400/80 mb-0.5">
                        <span className="font-bold">{art.source_name}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{art.article_type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                        {art.headline}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800/60 shrink-0">
                      View Takeaway &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
