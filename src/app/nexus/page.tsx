import { fetchArticles } from '@/lib/supabase';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { Droplets, Recycle, Sparkles, Sprout, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Food-Water-Energy Nexus & Waste-to-Energy Tracker | Hermit Sustainability Advisory',
  description: 'Dedicated intelligence tracker for circular economy, water-energy systems, solar irrigation, and waste-to-energy.'
};

export default async function NexusPage() {
  const articles = await fetchArticles();

  // Import semantic gate validation
  const { evaluateSemanticFitness } = await import('@/lib/semantic-gate');

  // Filter articles for genuine Food-Water-Energy Nexus & Waste-to-Energy
  const nexusArticles = articles.filter(a => {
    // 1. Must pass semantic fitness (no crime, no metaphors)
    const fitness = evaluateSemanticFitness(a.headline, a.summary || '', a.relevance_to_hermit || '', a.relevance_score);
    if (!fitness.isFitToDisplay) return false;

    // 2. Direct categorization
    if (a.article_type === 'nexus' || a.article_type === 'waste_to_energy') return true;

    // 3. Technical nexus & circular economy keywords (NOT just generic 'water')
    const text = `${a.headline} ${a.summary || ''} ${a.raw_content || ''} ${a.sector || ''}`.toLowerCase();
    const hasNexusSubject = 
      text.includes('dam level') ||
      text.includes('live storage') ||
      text.includes('kariba') ||
      text.includes('zinwa') ||
      text.includes('hydropower') ||
      text.includes('hydro-power') ||
      text.includes('solar-powered irrigation') ||
      text.includes('solar irrigation') ||
      text.includes('water pumping') ||
      text.includes('biogas') ||
      text.includes('anaerobic digestion') ||
      text.includes('landfill gas') ||
      text.includes('waste-to-energy') ||
      text.includes('circular economy') ||
      text.includes('wastewater treatment') ||
      text.includes('food-water-energy') ||
      text.includes('refuse-derived fuel');

    return hasNexusSubject;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header title="Food-Water-Energy Nexus" subtitle="Dedicated intelligence tracker for circular economy, water-energy systems, and waste-to-energy" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner */}
        <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#040f09]/90 via-[#0a422c]/90 to-[#031c12]/95 border border-blue-500/30 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>SoW Section 4.8 & 4.9 &bull; Dedicated Deliverable</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Food-Water-Energy Nexus & Circular Economy Tracker
            </h1>
            <p className="text-sm text-slate-200/80 leading-relaxed">
              Monitoring integrated water-energy projects, solar-powered agricultural irrigation, municipal waste-to-energy, biogas digesters, and industrial resource efficiency across Zimbabwe and SADC.
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Recycle className="w-64 h-64 text-cyan-300" />
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Monitored Nexus Items</p>
              <p className="text-xl font-black text-white">{nexusArticles.length}</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Priority Offtaker Target</p>
              <p className="text-xl font-black text-white">Agric & Municipal</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Recycle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Circular Tech Monitored</p>
              <p className="text-xl font-black text-white">Biogas & Waste-to-Power</p>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Dedicated Nexus & Waste Intelligence Stream</span>
            </h2>
            <span className="text-xs text-cyan-300/70">
              Showing {nexusArticles.length} filtered intelligence captures
            </span>
          </div>

          {nexusArticles.length === 0 ? (
            <div className="bg-[#031910]/70 rounded-2xl p-8 border border-blue-500/20 text-center space-y-2">
              <p className="text-cyan-200 font-bold">No nexus-specific captures found in current cache.</p>
              <p className="text-xs text-blue-400/60">Trigger a live crawl targeting ZINWA or EMA to ingest live nexus stories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nexusArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
