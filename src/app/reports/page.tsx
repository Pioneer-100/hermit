'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Report } from '@/types';
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
        <div className="bg-[#04130d]/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-display text-sm sm:text-base font-bold text-white">Executive Reporting Cadence</h2>
            </div>
            <p className="text-xs text-emerald-200/70 mt-0.5">Synthesized from Supabase media captures and routed to Communications Officer for Management</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={reportTypeToGen}
              onChange={(e) => setReportTypeToGen(e.target.value as 'daily' | 'weekly' | 'monthly' | 'special')}
              className="text-xs border border-emerald-500/30 rounded-xl px-3 py-2 bg-[#041a12] text-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="daily">Daily Intelligence Digest</option>
              <option value="weekly">Weekly Energy Summary</option>
              <option value="monthly">Monthly Market Review</option>
              <option value="special">Ad-hoc Special Brief</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/30 disabled:opacity-50 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Compiling Report...' : 'Generate New Brief'}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle (Tab Switcher for small screens) */}
        <div className="lg:hidden flex items-center gap-1.5 bg-[#041a12]/80 p-1 rounded-2xl border border-emerald-500/25">
          <button
            onClick={() => setMobileTab('report')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              mobileTab === 'report'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/30'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>Read Report</span>
          </button>
          <button
            onClick={() => setMobileTab('archive')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              mobileTab === 'archive'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/30'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-emerald-300" />
            <span>Archive ({reports.length})</span>
          </button>
        </div>

        {/* 2-Column Report Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Left Column (4 cols): Archive List */}
          <div className={`lg:col-span-4 bg-[#04130d]/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-xl space-y-2.5 text-white ${
            mobileTab === 'report' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300/80">
                Generated Archive
              </h3>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">{reports.length} Reports</span>
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
                        ? 'bg-[#071f16]/95 border-emerald-500/50 shadow-md text-white'
                        : 'bg-[#041a12]/75 border-emerald-900/50 hover:border-emerald-500/40 text-emerald-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        isSelected 
                          ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-black' 
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                      }`}>
                        {rep.report_type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-emerald-300/60 font-mono">
                        {new Date(rep.generated_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {rep.title}
                    </h4>

                    <div className="mt-2 text-[11px] text-emerald-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>{rep.article_count} items captured</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateReportPdf(rep);
                        }}
                        className="p-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-700/60 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
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
          <div className={`lg:col-span-8 bg-[#04130d]/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-5 sm:space-y-6 text-white ${
            mobileTab === 'archive' ? 'hidden lg:block' : 'block'
          }`}>
            {selectedReport ? (
              <>
                {/* Document Header */}
                <div className="border-b border-emerald-900/50 pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                        HERMIT INVESTMENTS &bull; ENERGY SECTOR INTELLIGENCE
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                      {selectedReport.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-emerald-200/70 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        Generated: {new Date(selectedReport.generated_at).toLocaleString()}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-emerald-300">Official Management Briefing</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
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
                      className="bg-emerald-900/50 border border-emerald-600/50 hover:bg-emerald-800/70 text-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors active:scale-95"
                      title="Print directly via browser dialog"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                </div>

                {selectedReport.content?.structured_weekly ? (
                  /* Hermit Sustainability Advisory Weekly Template View */
                  <div className="space-y-6">
                    {/* Header Details Table */}
                    <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                          <tr>
                            <th className="p-2.5 w-1/3">Reporting Field</th>
                            <th className="p-2.5">Weekly Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                          <tr>
                            <td className="p-2.5 font-semibold text-emerald-300">Reporting week</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.reporting_week || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-emerald-300">Report reference & issue date</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.report_reference || 'HSA WC'} | {new Date(selectedReport.generated_at).toLocaleDateString('en-GB')}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-emerald-300">Prepared by & reviewed by</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.prepared_by || 'Intelligence Unit'} | {selectedReport.content.structured_weekly.header?.reviewed_by || 'Sustainability Advisory'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-emerald-300">Submission day & audience</td>
                            <td className="p-2.5">{selectedReport.content.structured_weekly.header?.submission_day || 'Weekly Briefing'} | {selectedReport.content.structured_weekly.header?.audience || 'Investment Committee'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 1. Weekly Executive Update */}
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        1. Weekly Executive Update
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed bg-[#041a12]/80 p-3.5 sm:p-4 rounded-xl border border-emerald-900/50">
                        {selectedReport.content.structured_weekly.executive_update || selectedReport.summary}
                      </p>
                    </div>

                    {/* 2. Priority Findings Table */}
                    {selectedReport.content.structured_weekly.priority_findings && (
                      <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          2. Priority Findings
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                              <tr>
                                <th className="p-2.5">Headline and Theme</th>
                                <th className="p-2.5">Relevance to Hermit</th>
                                <th className="p-2.5 w-16 text-center">Priority</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                              {selectedReport.content.structured_weekly.priority_findings.map((pf, idx) => (
                                <tr key={idx} className="hover:bg-emerald-900/20">
                                  <td className="p-2.5 font-medium">
                                    <div>{pf.headline}</div>
                                    <span className="text-[10px] text-emerald-400 font-mono">[{pf.theme}]</span>
                                  </td>
                                  <td className="p-2.5 text-emerald-200/90">{pf.relevance}</td>
                                  <td className="p-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                      pf.priority === 'H' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                      pf.priority === 'M' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          3. Finding Records
                        </h3>
                        <div className="space-y-3">
                          {selectedReport.content.structured_weekly.finding_records.map((fr, idx) => (
                            <div key={idx} className="rounded-xl border border-emerald-500/20 bg-[#041a12]/80 overflow-hidden text-xs">
                              <div className="bg-emerald-950/60 p-2.5 border-b border-emerald-500/20 flex items-center justify-between">
                                <span className="font-bold text-emerald-300">{fr.finding_id}: {fr.headline}</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded font-mono">{fr.theme} &bull; {fr.priority}</span>
                              </div>
                              <div className="p-3 space-y-2 text-emerald-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-300/80">
                                  <div><span className="font-semibold text-emerald-400">Source:</span> {fr.source} | {fr.author || 'Not stated'}</div>
                                  <div><span className="font-semibold text-emerald-400">Dates:</span> Published {fr.publication_date || 'N/A'} | Event {fr.event_date || 'N/A'}</div>
                                </div>
                                <div className="text-[11px]"><span className="font-semibold text-emerald-400">Factual summary:</span> {fr.factual_summary}</div>
                                {fr.stakeholders && <div className="text-[11px]"><span className="font-semibold text-emerald-400">Stakeholders:</span> {fr.stakeholders}</div>}
                                <div className="text-[11px]"><span className="font-semibold text-emerald-400">Relevance:</span> {fr.relevance_to_hermit}</div>
                                {fr.recommended_response && (
                                  <div className="p-2 bg-emerald-950/40 rounded border border-emerald-500/20 text-[11px]">
                                    <span className="font-semibold text-emerald-300">Recommended response: </span>
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
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-100 hover:underline"
                                    >
                                      <span>Read full finding source on {fr.source}</span>
                                      <ExternalLink className="w-3 h-3 text-emerald-400" />
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
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          4. Monitoring Coverage
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                              <tr>
                                <th className="p-2.5">Sources or topics checked</th>
                                <th className="p-2.5">Result or coverage gap</th>
                                <th className="p-2.5">Follow up</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                              {selectedReport.content.structured_weekly.monitoring_coverage.map((c, idx) => (
                                <tr key={idx} className="hover:bg-emerald-900/20">
                                  <td className="p-2.5 font-medium">{c.source_or_topic}</td>
                                  <td className="p-2.5 text-emerald-200/90">{c.result_or_gap}</td>
                                  <td className="p-2.5 text-emerald-400">{c.follow_up}</td>
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
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          5. Action & Follow Up Tracker
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                              <tr>
                                <th className="p-2.5">Action and expected output</th>
                                <th className="p-2.5">Owner</th>
                                <th className="p-2.5">Due</th>
                                <th className="p-2.5">Status & progress</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                              {selectedReport.content.structured_weekly.action_tracker.map((act, idx) => (
                                <tr key={idx} className="hover:bg-emerald-900/20">
                                  <td className="p-2.5 font-medium">{act.action_deliverable}</td>
                                  <td className="p-2.5 text-emerald-300">{act.owner}</td>
                                  <td className="p-2.5 text-emerald-400 whitespace-nowrap">{act.due_date}</td>
                                  <td className="p-2.5"><span className="text-emerald-300 font-semibold">[{act.status}]</span> {act.progress}</td>
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
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          6. Decisions & Escalations
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                              <tr>
                                <th className="p-2.5">Decision and reason</th>
                                <th className="p-2.5">Decision owner</th>
                                <th className="p-2.5">Needed by</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                              {selectedReport.content.structured_weekly.decisions_escalations.map((d, idx) => (
                                <tr key={idx} className="hover:bg-emerald-900/20">
                                  <td className="p-2.5 font-medium">{d.decision_reason}</td>
                                  <td className="p-2.5 text-emerald-300">{d.decision_owner}</td>
                                  <td className="p-2.5 text-emerald-400 whitespace-nowrap">{d.needed_by}</td>
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
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          7. Priorities for Next Week
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#041a12]/70">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                              <tr>
                                <th className="p-2.5">Priority deliverable or topic</th>
                                <th className="p-2.5">Owner</th>
                                <th className="p-2.5">Target date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                              {selectedReport.content.structured_weekly.next_week_priorities.map((p, idx) => (
                                <tr key={idx} className="hover:bg-emerald-900/20">
                                  <td className="p-2.5 font-medium">{idx + 1}. {p.priority_deliverable}</td>
                                  <td className="p-2.5 text-emerald-300">{p.owner}</td>
                                  <td className="p-2.5 text-emerald-400 whitespace-nowrap">{p.target_date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sign-off footer */}
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-300/80 flex flex-wrap items-center justify-between gap-2 font-mono">
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
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300/80">
                    Executive Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed bg-[#041a12]/80 p-3.5 sm:p-4 rounded-xl border border-emerald-900/50 font-normal">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* Key Highlights */}
                {selectedReport.content?.highlights && (
                  <div className="space-y-2.5 sm:space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300/80">
                      Priority Highlights & Strategic Shifts
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.content.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-emerald-100 leading-relaxed bg-[#041a12]/80 p-3 rounded-xl border border-emerald-500/20">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Article Summaries (Bold Headline + 5-Line Summary) */}
                {selectedReport.content?.article_summaries && selectedReport.content.article_summaries.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Detailed Article Intelligence Summaries ({selectedReport.content.article_summaries.length})
                      </span>
                      <span className="text-[10px] text-emerald-400/70 font-mono normal-case">5-line synthesis per item</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedReport.content.article_summaries.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-emerald-500/25 bg-[#041a12]/80 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-emerald-500/15 pb-2">
                            {/* Article Headline in bold */}
                            <h4 className="text-sm font-bold text-white tracking-wide leading-snug">
                              {item.headline}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                {item.source}
                              </span>
                              {item.category && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/40 text-emerald-200 border border-emerald-500/20 uppercase">
                                  {item.category.replace('_', ' ')}
                                </span>
                              )}
                              {item.relevance_level && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.relevance_level === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                  item.relevance_level === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {item.relevance_level}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Crawled date/time */}
                          {item.captured_at && (
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70 font-mono">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              <span>Crawled: {new Date(item.captured_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}

                          {/* 5-line summary */}
                          <div className="text-xs text-emerald-100/90 leading-relaxed font-normal whitespace-pre-line bg-[#03140e]/60 p-3 rounded-lg border-l-2 border-emerald-400">
                            {item.summary}
                          </div>

                          {/* Link to full story on source */}
                          {item.source_link && item.source_link !== '#' && (
                            <div className="pt-1.5">
                              <a
                                href={item.source_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-100 hover:underline transition-colors"
                              >
                                <span>Read full story on {item.source}</span>
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
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
                  <div className="bg-gradient-to-br from-[#041d13]/90 to-[#02140c]/90 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Recommended Management Action</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                      {selectedReport.content.executive_takeaway}
                    </p>
                  </div>
                )}
                  </>
                )}
              </>
            ) : (
              <div className="py-24 text-center text-emerald-300/50 text-sm">
                Select a report from the archive to view details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
