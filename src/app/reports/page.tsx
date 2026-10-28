'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Report } from '@/types';
import { sortReportArticleSummaries } from '@/lib/report-utils';
import { FileText, Plus, CheckCircle, Calendar, Sparkles, Zap, Printer, BookOpen, Archive, Download, Loader2, ExternalLink, Clock } from 'lucide-react';
import { generateReportPdf } from '@/lib/pdfGenerator';
import { INITIAL_REPORTS } from '@/lib/mock-data';
import { getSupabaseClient } from '@/lib/supabase';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(INITIAL_REPORTS[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [reportTypeToGen, setReportTypeToGen] = useState<'daily' | 'weekly' | 'monthly' | 'special'>('daily');
  const [mobileTab, setMobileTab] = useState<'report' | 'archive'>('report');

  const loadReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reports)) {
          setReports(data.reports);
          if (data.reports.length > 0) {
            setSelectedReport(data.reports[0]);
          } else {
            setSelectedReport(null);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let token = '';
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb.auth.getSession();
        token = data.session?.access_token || '';
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify({ report_type: reportTypeToGen })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReports(prev => [data.report, ...prev]);
          setSelectedReport(data.report);
          setMobileTab('report');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedReport) return;
    setIsDownloadingPdf(true);
    try {
      generateReportPdf(selectedReport);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 600);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Executive Reports"
        subtitle="Automated Daily, Weekly, Monthly & Special Intelligence Briefs (ToR Section 4)"
        onRefresh={loadReports}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* Top Control Bar */}
        <div className="bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="font-display text-sm sm:text-base font-bold text-white">Executive Reporting Cadence</h2>
            </div>
            <p className="text-xs text-cyan-200/70 mt-0.5">Synthesized from Supabase media captures and routed to Communications Officer for Management</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={reportTypeToGen}
              onChange={(e) => setReportTypeToGen(e.target.value as 'daily' | 'weekly' | 'monthly' | 'special')}
              className="text-xs border border-blue-500/30 rounded-xl px-3 py-2 bg-[#0a1e38] text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="daily">Daily Intelligence Digest</option>
              <option value="weekly">Weekly Energy Summary</option>
              <option value="monthly">Monthly Market Review</option>
              <option value="special">Ad-hoc Special Brief</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/30 disabled:opacity-50 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Compiling Report...' : 'Generate New Brief'}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle (Tab Switcher for small screens) */}
        <div className="lg:hidden flex items-center gap-1.5 bg-[#0a1e38]/80 p-1 rounded-2xl border border-blue-500/25">
          <button
            onClick={() => setMobileTab('report')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              mobileTab === 'report'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md border border-blue-400/30'
                : 'text-cyan-200/80 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>Read Report</span>
          </button>
          <button
            onClick={() => setMobileTab('archive')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              mobileTab === 'archive'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md border border-blue-400/30'
                : 'text-cyan-200/80 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-cyan-300" />
            <span>Archive ({reports.length})</span>
          </button>
        </div>

        {/* 2-Column Report Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Left Column (4 cols): Archive List */}
          <div className={`lg:col-span-4 bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl space-y-2.5 text-white ${
            mobileTab === 'report' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300/80">
                Generated Archive
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">{reports.length} Reports</span>
            </div>

            <div className="space-y-2">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => {
                      setSelectedReport(rep);
                      setMobileTab('report');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all active:scale-99 ${
                      isSelected
                        ? 'bg-[#0c2242]/95 border-blue-500/50 shadow-md text-white'
                        : 'bg-[#0a1e38]/75 border-blue-900/50 hover:border-blue-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        isSelected 
                          ? 'bg-blue-600 text-blue-950 border-blue-400 font-black' 
                          : 'bg-blue-950/80 text-cyan-300 border-blue-600/40'
                      }`}>
                        {rep.report_type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-cyan-300/60 font-mono">
                        {new Date(rep.generated_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {rep.title}
                    </h4>

                    <div className="mt-2 text-[11px] text-cyan-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span>{rep.article_count} items captured</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateReportPdf(rep);
                        }}
                        className="p-1 rounded-lg bg-blue-900/40 hover:bg-blue-700/60 text-cyan-300 hover:text-white border border-blue-500/30 transition-colors"
                        title="Download PDF"
                        aria-label="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Executive Document View */}
          <div className={`lg:col-span-8 bg-[#08172c]/90 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-5 sm:space-y-6 text-white ${
            mobileTab === 'archive' ? 'hidden lg:block' : 'block'
          }`}>
            {selectedReport ? (
              <>
                {/* Document Header */}
                <div className="border-b border-blue-900/50 pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
                        HERMIT INVESTMENTS &bull; ENERGY SECTOR INTELLIGENCE
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                      {selectedReport.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-cyan-200/70 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        Generated: {new Date(selectedReport.generated_at).toLocaleString()}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-cyan-300">Official Management Briefing</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="bg-blue-600 hover:bg-blue-600 text-white border border-blue-400/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all active:scale-95 disabled:opacity-50"
                      title="Download Executive PDF Document"
                    >
                      {isDownloadingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="bg-blue-900/50 border border-blue-600/50 hover:bg-blue-800/70 text-cyan-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors active:scale-95"
                      title="Print directly via browser dialog"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                </div>

                {selectedReport.content?.structured_weekly ? (
                  /* Hermit Sustainability Advisory Weekly Template View */
                  <div className="space-y-6">
                    {/* Header Details Table */}
                    <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                          <tr>
                            <th className="p-2.5 w-1/3">Reporting Field</th>
                            <th className="p-2.5">Weekly Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                          <tr>
                            <td className="p-2.5 font-semibold text-cyan-300">Reporting week</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.reporting_week || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-cyan-300">Report reference & issue date</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.report_reference || 'HSA WC'} | {new Date(selectedReport.generated_at).toLocaleDateString('en-GB')}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-cyan-300">Prepared by & reviewed by</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.prepared_by || 'Intelligence Unit'} | {selectedReport.content.structured_weekly.header?.reviewed_by || 'Sustainability Advisory'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-cyan-300">Submission day & audience</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.submission_day || 'Weekly Briefing'} | {selectedReport.content.structured_weekly.header?.audience || 'Investment Committee'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 1. Weekly Executive Update */}
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        1. Weekly Executive Update
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#0a1e38]/80 p-3.5 sm:p-4 rounded-xl border border-blue-900/50">
                        {selectedReport.content.structured_weekly.executive_update || selectedReport.summary}
                      </p>
                    </div>

                    {/* 2. Priority Findings Table */}
                    {selectedReport.content.structured_weekly.priority_findings && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          2. Priority Findings
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                              <tr>
                                <th className="p-2.5">Headline and Theme</th>
                                <th className="p-2.5">Relevance to Hermit</th>
                                <th className="p-2.5 w-16 text-center">Priority</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                              {selectedReport.content.structured_weekly.priority_findings.map((pf, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/20">
                                  <td className="p-2.5 font-medium">
                                    <div>{pf.headline}</div>
                                    <span className="text-[10px] text-blue-400 font-mono">[{pf.theme}]</span>
                                  </td>
                                  <td className="p-2.5 text-cyan-200/90">{pf.relevance}</td>
                                  <td className="p-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                      pf.priority === 'H' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                      pf.priority === 'M' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                      'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                                    }`}>
                                      {pf.priority}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 3. Finding Records */}
                    {selectedReport.content.structured_weekly.finding_records && (
                      <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          3. Finding Records
                        </h3>
                        <div className="space-y-3">
                          {selectedReport.content.structured_weekly.finding_records.map((fr, idx) => (
                            <div key={idx} className="rounded-xl border border-blue-500/20 bg-[#0a1e38]/80 overflow-hidden text-xs">
                              <div className="bg-blue-950/60 p-2.5 border-b border-blue-500/20 flex items-center justify-between">
                                <span className="font-bold text-cyan-300">{fr.finding_id}: {fr.headline}</span>
                                <span className="text-[10px] bg-blue-600/20 text-cyan-200 px-2 py-0.5 rounded font-mono">{fr.theme} &bull; {fr.priority}</span>
                              </div>
                              <div className="p-3 space-y-2 text-slate-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-cyan-300/80">
                                  <div><span className="font-semibold text-blue-400">Source:</span> {fr.source} | {fr.author || 'Not stated'}</div>
                                  <div><span className="font-semibold text-blue-400">Dates:</span> Published {fr.publication_date || 'N/A'} | Event {fr.event_date || 'N/A'}</div>
                                </div>
                                <div className="text-[11px]"><span className="font-semibold text-blue-400">Factual summary:</span> {fr.factual_summary}</div>
                                {fr.stakeholders && <div className="text-[11px]"><span className="font-semibold text-blue-400">Stakeholders:</span> {fr.stakeholders}</div>}
                                <div className="text-[11px]"><span className="font-semibold text-blue-400">Relevance:</span> {fr.relevance_to_hermit}</div>
                                {fr.recommended_response && (
                                  <div className="p-2 bg-blue-950/40 rounded border border-blue-500/20 text-[11px]">
                                    <span className="font-semibold text-cyan-300">Recommended response: </span>
                                    {typeof fr.recommended_response === 'object' 
                                      ? `${fr.recommended_response.action} (ID: ${fr.recommended_response.action_id}, Owner: ${fr.recommended_response.owner}, Due: ${fr.recommended_response.due_date})`
                                      : fr.recommended_response}
                                  </div>
                                )}
                                {fr.link && fr.link !== '#' && (
                                  <div className="pt-1">
                                    <a
                                      href={fr.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-slate-200 hover:underline"
                                    >
                                      <span>Read full finding source on {fr.source}</span>
                                      <ExternalLink className="w-3 h-3 text-blue-400" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Monitoring Coverage */}
                    {selectedReport.content.structured_weekly.monitoring_coverage && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          4. Monitoring Coverage
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                              <tr>
                                <th className="p-2.5">Sources or topics checked</th>
                                <th className="p-2.5">Result or coverage gap</th>
                                <th className="p-2.5">Follow up</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                              {selectedReport.content.structured_weekly.monitoring_coverage.map((c, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/20">
                                  <td className="p-2.5 font-medium">{c.source_or_topic}</td>
                                  <td className="p-2.5 text-cyan-200/90">{c.result_or_gap}</td>
                                  <td className="p-2.5 text-blue-400">{c.follow_up}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 5. Action and Follow Up Tracker */}
                    {selectedReport.content.structured_weekly.action_tracker && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          5. Action & Follow Up Tracker
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                              <tr>
                                <th className="p-2.5">Action and expected output</th>
                                <th className="p-2.5">Owner</th>
                                <th className="p-2.5">Due</th>
                                <th className="p-2.5">Status & progress</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                              {selectedReport.content.structured_weekly.action_tracker.map((act, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/20">
                                  <td className="p-2.5 font-medium">{act.action_deliverable}</td>
                                  <td className="p-2.5 text-cyan-300">{act.owner}</td>
                                  <td className="p-2.5 text-blue-400 whitespace-nowrap">{act.due_date}</td>
                                  <td className="p-2.5"><span className="text-cyan-300 font-semibold">[{act.status}]</span> {act.progress}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 6. Decisions and Escalations */}
                    {selectedReport.content.structured_weekly.decisions_escalations && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          6. Decisions & Escalations
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                              <tr>
                                <th className="p-2.5">Decision and reason</th>
                                <th className="p-2.5">Decision owner</th>
                                <th className="p-2.5">Needed by</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                              {selectedReport.content.structured_weekly.decisions_escalations.map((d, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/20">
                                  <td className="p-2.5 font-medium">{d.decision_reason}</td>
                                  <td className="p-2.5 text-cyan-300">{d.decision_owner}</td>
                                  <td className="p-2.5 text-blue-400 whitespace-nowrap">{d.needed_by}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 7. Priorities for Next Week */}
                    {selectedReport.content.structured_weekly.next_week_priorities && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          7. Priorities for Next Week
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#0a1e38]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-blue-950/80 text-cyan-300 font-bold border-b border-blue-500/20">
                              <tr>
                                <th className="p-2.5">Priority deliverable or topic</th>
                                <th className="p-2.5">Owner</th>
                                <th className="p-2.5">Target date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
                              {selectedReport.content.structured_weekly.next_week_priorities.map((p, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/20">
                                  <td className="p-2.5 font-medium">{idx + 1}. {p.priority_deliverable}</td>
                                  <td className="p-2.5 text-cyan-300">{p.owner}</td>
                                  <td className="p-2.5 text-blue-400 whitespace-nowrap">{p.target_date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sign-off footer */}
                    <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/20 text-xs text-cyan-300/80 flex flex-wrap items-center justify-between gap-2 font-mono">
                      <span>Reviewed by: {selectedReport.content.structured_weekly.sign_off?.reviewed_by || 'Lead Sustainability Advisor'}</span>
                      <span>Date: {selectedReport.content.structured_weekly.sign_off?.date || new Date().toLocaleDateString('en-GB')}</span>
                      <span>Approved by: {selectedReport.content.structured_weekly.sign_off?.approved_by || 'Managing Director'}</span>
                    </div>
                  </div>
                ) : (
                  /* Standard / Daily View */
                  <>
                    {/* Executive Overview */}
                    <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300/80">
                    Executive Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#0a1e38]/80 p-3.5 sm:p-4 rounded-xl border border-blue-900/50 font-normal">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* Key Highlights */}
                {selectedReport.content?.highlights && (
                  <div className="space-y-2.5 sm:space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300/80">
                      Priority Highlights & Strategic Shifts
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.content.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#0a1e38]/80 p-3 rounded-xl border border-blue-500/20">
                          <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Article Summaries (Bold Headline + 5-Line Summary) */}
                {selectedReport.content?.article_summaries && selectedReport.content.article_summaries.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Detailed Article Intelligence Summaries ({selectedReport.content.article_summaries.length})
                      </span>
                      <span className="text-[10px] text-blue-400/70 font-mono normal-case">5-line synthesis per item</span>
                    </h3>
                    <div className="space-y-3">
                      {sortReportArticleSummaries(selectedReport.content.article_summaries).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-blue-500/25 bg-[#0a1e38]/80 space-y-2.5">
                          <div className="flex flex-col gap-1.5 border-b border-blue-500/15 pb-2">
                            {/* Article Headline in bold */}
                            <h4 className="w-full whitespace-normal break-words [overflow-wrap:anywhere] text-sm font-bold text-white tracking-wide leading-snug">
                              {item.headline}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-cyan-300 border border-blue-500/30">
                                {item.source}
                              </span>
                              {item.category && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/40 text-cyan-200 border border-blue-500/20 uppercase">
                                  {item.category.replace('_', ' ')}
                                </span>
                              )}
                              {item.relevance_level && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.relevance_level === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                  item.relevance_level === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                                }`}>
                                  {item.relevance_level}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Crawled date/time */}
                          {item.captured_at && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-400/70 font-mono">
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>Crawled: {new Date(item.captured_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}

                          {/* 5-line summary */}
                          <div className="text-xs text-slate-200/90 leading-relaxed font-normal whitespace-pre-line bg-[#061528]/60 p-3 rounded-lg border-l-2 border-blue-400">
                            {item.summary}
                          </div>

                          {/* Link to full story on source */}
                          {item.source_link && item.source_link !== '#' && (
                            <div className="pt-1.5">
                              <a
                                href={item.source_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-slate-200 hover:underline transition-colors"
                              >
                                <span>Read full story on {item.source}</span>
                                <ExternalLink className="w-3 h-3 text-blue-400" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Management Recommendation */}
                {selectedReport.content?.executive_takeaway && (
                  <div className="bg-gradient-to-br from-[#091f3a]/90 to-[#051224]/90 border border-blue-500/30 p-4 sm:p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Recommended Management Action</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal">
                      {selectedReport.content.executive_takeaway}
                    </p>
                  </div>
                )}
                  </>
                )}
              </>
            ) : (
              <div className="py-24 text-center text-cyan-300/50 text-sm">
                Select a report from the archive to view details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
