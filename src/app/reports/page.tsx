'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Report } from '@/types';
import { FileText, Plus, CheckCircle, Calendar, Sparkles, Zap, Printer, BookOpen, Archive } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      <Header
        title="Executive Reports"
        subtitle="Automated Daily, Weekly, Monthly & Special Intelligence Briefs (ToR Section 4)"
        onRefresh={loadReports}
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* Top Control Bar */}
        <div className="bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">Executive Reporting Cadence</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/70 mt-0.5">Synthesized from Supabase media captures and routed to Communications Officer for Management</p>
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
          <div className={`lg:col-span-4 bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 shadow-xl space-y-2.5 text-white ${
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
                        ? 'bg-[#083825]/90 border-emerald-400/60 shadow-md text-white'
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

                    <div className="mt-2 text-[11px] text-emerald-200/70 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>{rep.article_count} monitored items captured</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Executive Document View */}
          <div className={`lg:col-span-8 bg-[#06261b]/75 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-5 sm:space-y-6 text-white ${
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

                  <button
                    onClick={() => window.print()}
                    className="bg-emerald-900/50 border border-emerald-600/50 hover:bg-emerald-800/70 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 self-start shadow-md transition-colors active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Print / PDF</span>
                  </button>
                </div>

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
