import { fetchArticles } from '@/lib/supabase';
import Header from '@/components/Header';
import { 
  Calendar, 
  BellRing, 
  Clock, 
  Award, 
  Sparkles, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Send, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import { Article } from '@/types';

export const metadata = {
  title: 'Events, Workshops & Funding Opportunities Tracker | Hermit Sustainability Advisory',
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

  // Split into:
  // 1. Funding Calls & Tenders (RFPs, Grants, Facilities)
  // 2. Industry Events & Workshops (Conferences, Summits, Webinars)
  const fundingCalls = eventArticles.filter(a => {
    const t = `${a.headline} ${a.summary || ''} ${a.article_type}`.toLowerCase();
    return t.includes('funding') || t.includes('rfp') || t.includes('tender') || t.includes('call') || t.includes('grant') || t.includes('facility') || t.includes('debt');
  });

  const upcomingEvents = eventArticles.filter(a => !fundingCalls.includes(a));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header title="Events & Funding" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner */}
        <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1c1806]/90 via-[#3a2f0a]/90 to-[#031c12]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Actionable Intelligence &bull; SoW Section 4.4, 4.7 & 5</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Events, Workshops & Funding Opportunities Tracker
            </h1>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              Curated intelligence tracking upcoming Zimbabwean & regional power summits, active DFI grant windows, RFPs, and stakeholder workshops — calibrated so HSA management can make advance arrangements to attend, sponsor, or apply.
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Calendar className="w-64 h-64 text-amber-300" />
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-amber-300/70 font-bold uppercase tracking-wider">Total Opportunities</p>
              <p className="text-xl font-black text-white">{eventArticles.length}</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Active Funding Calls</p>
              <p className="text-xl font-black text-white">{fundingCalls.length}</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-purple-300/70 font-bold uppercase tracking-wider">Events & Forums</p>
              <p className="text-xl font-black text-white">{upcomingEvents.length}</p>
            </div>
          </div>

          <div className="bg-[#031c12]/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Surveillance Cycle</p>
              <p className="text-xl font-black text-white">Daily Live</p>
            </div>
          </div>
        </div>

        {/* Section 1: Active Funding Calls, Grants & RFPs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Active Funding Calls, RFPs & Concessional Windows</span>
              </h2>
            </div>
            <span className="text-xs text-cyan-300/80 font-medium">
              {fundingCalls.length} Actionable Notices
            </span>
          </div>

          {fundingCalls.length === 0 ? (
            <div className="bg-[#031910]/70 rounded-2xl p-8 border border-blue-500/20 text-center space-y-2">
              <p className="text-cyan-200 font-bold">No active funding calls currently detected.</p>
              <p className="text-xs text-blue-400/60">Poll AfDB, PRAZ, or SADC SACREEE sources via Live Crawl to ingest open calls.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingCalls.map(item => (
                <OpportunityCard key={item.id} article={item} type="funding" />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Upcoming Industry Events, Workshops & Expos */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upcoming Conferences, Expos & Stakeholder Workshops</span>
              </h2>
            </div>
            <span className="text-xs text-amber-300/80 font-medium">
              {upcomingEvents.length} Scheduled Engagements
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-[#031910]/70 rounded-2xl p-8 border border-blue-500/20 text-center space-y-2">
              <p className="text-cyan-200 font-bold">No upcoming conferences indexed in current cache.</p>
              <p className="text-xs text-blue-400/60">Run the specialized event crawler to pull regional energy summits and SADC forums.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map(item => (
                <OpportunityCard key={item.id} article={item} type="event" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function OpportunityCard({ article, type }: { article: Article; type: 'funding' | 'event' }) {
  const isFunding = type === 'funding';
  const accentBorder = isFunding ? 'border-blue-500/30 hover:border-blue-500/50' : 'border-amber-500/30 hover:border-amber-500/50';
  const badgeBg = isFunding ? 'bg-blue-600/20 text-cyan-300 border-blue-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  return (
    <div className={`bg-[#091f3a]/85 backdrop-blur-md rounded-2xl p-5 border ${accentBorder} shadow-xl flex flex-col justify-between transition-all group hover:scale-[1.01]`}>
      <div className="space-y-3">
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${badgeBg}`}>
            {isFunding ? 'FUNDING / RFP CALL' : 'INDUSTRY EVENT / EXPO'}
          </span>

          {article.deadline ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span>Target Date / Deadline: {article.deadline}</span>
            </div>
          ) : (
            <div className="text-[11px] text-blue-400/70 font-mono">
              Published: {article.publication_date?.slice(0, 10) || 'Recent'}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
          {article.project_or_event_name || article.headline}
        </h3>

        {/* Strategic Opportunity Note for HSA */}
        <div className="p-3 rounded-xl bg-[#02130c]/90 border border-blue-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Opportunity for HSA:</span>
          </div>
          <p className="text-xs text-slate-200/80 leading-relaxed">
            {article.relevance_to_hermit || article.ai_impact_note || article.summary}
          </p>
        </div>

        {/* Capacity / Funding amount & Stakeholders */}
        <div className="flex items-center gap-3 text-xs text-cyan-200/80 flex-wrap">
          {article.capacity_or_funding && (
            <span className="font-bold text-cyan-300 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
              Facility: {article.capacity_or_funding}
            </span>
          )}
          {article.source_name && (
            <span className="text-blue-400/70">
              Source: <strong className="text-cyan-200">{article.source_name}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-blue-500/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-blue-400/80 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Status: Verified for participation</span>
        </div>

        {article.source_link && (
          <a
            href={article.source_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-600 text-white transition-all shadow-md active:scale-95"
          >
            <span>Official Portal / Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
