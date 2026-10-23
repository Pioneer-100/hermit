import { fetchArticles } from '@/lib/supabase';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { Calendar, BellRing, Clock, Award, Sparkles, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Events, Workshops & Funding Calls Tracker | Hermit Sustainability Advisory',
  description: 'Upcoming conferences, RFPs, EOIs, and engagement opportunities for Hermit Sustainability Advisory.'
};

export default async function EventsPage() {
  const articles = await fetchArticles();

  // Filter for events, conferences, workshops, funding calls, RFPs, tenders
  const eventArticles = articles.filter(a => {
    const text = `${a.headline} ${a.summary || ''} ${a.raw_content || ''} ${a.article_type}`.toLowerCase();
    return (
      a.article_type === 'event' ||
      a.article_type === 'funding_announcement' ||
      text.includes('conference') ||
      text.includes('workshop') ||
      text.includes('forum') ||
      text.includes('webinar') ||
      text.includes('expo') ||
      text.includes('rfp') ||
      text.includes('eoi') ||
      text.includes('tender') ||
      text.includes('call for proposals') ||
      text.includes('grant') ||
      text.includes('facility') ||
      Boolean(a.deadline)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header title="Events, Workshops & Funding Calls" subtitle="Upcoming conferences, RFPs, EOIs, and engagement opportunities" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner */}
        <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1c1806]/90 via-[#3a2f0a]/90 to-[#031c12]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>SoW Section 4.4, 4.7 & 5 &bull; Event Opportunity Monitoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Events, Workshops & Funding Opportunities Tracker
            </h1>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              Tracking upcoming regional power forums, climate finance calls for proposals, DFI facilities, and stakeholder workshops to identify networking, sponsorship, and advisory opportunities for HSA.
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Calendar className="w-64 h-64 text-amber-300" />
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-amber-300/70 font-bold uppercase tracking-wider">Active Calls & Events</p>
              <p className="text-xl font-black text-white">{eventArticles.length}</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">Priority Level</p>
              <p className="text-xl font-black text-white">Commercial / Advisory</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Review Cycle</p>
              <p className="text-xl font-black text-white">Daily / Weekly</p>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Monitored Events & Financing Calls</span>
            </h2>
            <span className="text-xs text-amber-300/70">
              Showing {eventArticles.length} filtered entries
            </span>
          </div>

          {eventArticles.length === 0 ? (
            <div className="bg-[#031910]/70 rounded-2xl p-8 border border-emerald-500/20 text-center space-y-2">
              <p className="text-emerald-200 font-bold">No event or funding calls indexed in current cache.</p>
              <p className="text-xs text-emerald-400/60">Poll PRAZ, SAPP, or DFI sources via Live Crawl to ingest new notices.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
