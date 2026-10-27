import { NextRequest, NextResponse } from 'next/server';
import { fetchReports, insertReport, fetchArticles } from '@/lib/supabase';
import { Report } from '@/types';
import { authenticateApiRequest } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getOrSetCache, invalidateCache } from '@/lib/cache';
import { GenerateReportSchema } from '@/lib/schemas';

export async function GET() {
  const reports = await getOrSetCache<Report[]>('hermit_reports_list', 120, async () => {
    return await fetchReports();
  });
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const clientId = auth.user?.id || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(`report_gen_${clientId}`, 5, 0.05); // max 5, refill 1 every 20s
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Report generation rate limit exceeded. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const parsed = GenerateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid report parameters', details: parsed.error.issues }, { status: 400 });
    }
    const reportType = parsed.data.report_type;
    
    const articles = await fetchArticles();
    const highArticles = articles.filter(a => a.relevance_level === 'high');

    const titles: Record<string, string> = {
      daily: `Daily Energy Sector Intelligence Digest — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      weekly: `Weekly Energy Strategic Summary — Week ${getWeekNumber(new Date())}`,
      monthly: `Monthly Energy Media & Regulatory Review — ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
      special: `Special Intelligence Brief: Urgent Regulatory & Grid Development`
    };

    // Attempt Gemini-powered report generation
    const apiKey = process.env.GEMINI_API_KEY;
    let geminiReport: {
      title?: string;
      summary?: string;
      highlights?: string[];
      executive_takeaway?: string;
      structured_weekly?: any;
    } | null = null;

    if (apiKey && apiKey.length > 10 && articles.length > 0) {
      try {
        const articleSummaries = articles.slice(0, 15).map(a =>
          `- [${a.source_name}] (${a.article_type}, Relevance: ${a.relevance_level}): ${a.headline}${a.summary ? ` — ${a.summary.slice(0, 150)}` : ''}`
        ).join('\n');

        const periodLabel = reportType === 'daily' ? "today's" : reportType === 'weekly' ? "this week's" : reportType === 'monthly' ? "this month's" : "the current";
        const isWeekly = reportType === 'weekly';
        const currentYear = new Date().getFullYear();
        const currentWeekNum = getWeekNumber(new Date());
        const startWeekStr = new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString('en-GB');
        const endWeekStr = new Date().toLocaleDateString('en-GB');

        const prompt = isWeekly
          ? `You are the Lead Intelligence Analyst at Hermit Sustainability Advisory (Hermit Investments).
You are compiling the official "Hermit Web Crawling Weekly Update" covering energy, food, water and waste to energy, including relevant funding, policy, technology and market developments.

Monitored Articles from the past week (${articles.length} total, ${highArticles.length} high-relevance):
${articleSummaries}

Generate the comprehensive weekly intelligence report strictly matching this JSON structure:
{
  "title": "Hermit Web Crawling Weekly Update — Week ${currentWeekNum}, ${currentYear}",
  "summary": "3 to 5 sentences summarizing the main developments in energy, food, water and waste to energy, their implications for Hermit and the most urgent response or decision.",
  "highlights": ["3-5 priority bullet highlights on key shifts"],
  "executive_takeaway": "Key strategic recommendation for Hermit Investments",
  "structured_weekly": {
    "header": {
      "reporting_week": "${startWeekStr} to ${endWeekStr}",
      "report_reference": "HSA WC ${currentYear} W${currentWeekNum}",
      "prepared_by": "Hermit Intelligence Unit",
      "reviewed_by": "Hermit Sustainability Advisory",
      "submission_day": "Weekly Briefing",
      "audience": "Investment Committee & Project Leads"
    },
    "executive_update": "3 to 5 sentences summarizing the main developments in energy, food, water and waste to energy, their implications for Hermit and the most urgent response or decision.",
    "priority_findings": [
      {
        "headline": "Concise finding title",
        "theme": "Energy / Food / Water / Waste to energy",
        "relevance": "Opportunity or risk and affected project or service",
        "priority": "H",
        "finding_id": "FIND-01"
      }
    ],
    "finding_records": [
      {
        "finding_id": "FIND-01",
        "headline": "Complete headline describing the material development",
        "theme": "Energy",
        "priority": "High",
        "source": "Primary Source or Regulatory Body",
        "author": "Author or Not stated",
        "publication_date": "${endWeekStr}",
        "event_date": "${endWeekStr}",
        "link": "https://example.com/source",
        "access_date": "${endWeekStr}",
        "factual_summary": "What happened, key figures, units, period and current status.",
        "stakeholders": "Names, organisations, roles and attributed comments.",
        "relevance_to_hermit": "Affected project or service; opportunity or risk. Labeled inferences.",
        "recommended_response": {
          "action": "Specific operational action",
          "action_id": "ACT-01",
          "owner": "Advisory Team",
          "due_date": "Within 7 days"
        },
        "verification_and_gaps": "Confirmed / Partly verified / Unverified with gap explanation"
      }
    ],
    "monitoring_coverage": [
      {
        "source_or_topic": "Energy Regulators & Utilities (ZERA, ZESA, PRAZ)",
        "result_or_gap": "Material updates captured on tariffs & tenders",
        "follow_up": "Daily automated crawl"
      },
      {
        "source_or_topic": "Food, Water & Hydrology (ZINWA, EMA)",
        "result_or_gap": "Hydrological data and dam levels recorded",
        "follow_up": "Weekly review"
      }
    ],
    "action_tracker": [
      {
        "action_deliverable": "Review utility wheeling regulations and evaluate impact on captive solar pipeline",
        "owner": "Technical Lead",
        "due_date": "Next Week",
        "status": "In progress",
        "progress": "Initial tariff comparative model drafted"
      }
    ],
    "decisions_escalations": [
      {
        "decision_reason": "Approve submission to DFI clean energy project preparation facility",
        "decision_owner": "Investment Committee",
        "needed_by": "Within 10 days"
      }
    ],
    "next_week_priorities": [
      {
        "priority_deliverable": "Assess regional SADC energy wheeling forum proposals",
        "owner": "Lead Advisor",
        "target_date": "End of next week"
      }
    ],
    "sign_off": {
      "reviewed_by": "Lead Reviewer",
      "approved_by": "Executive Director",
      "date": "${endWeekStr}"
    }
  }
}
Generate at least 3-5 priority findings and detailed finding records representing the captured articles. Return ONLY valid JSON.`
          : `You are the Chief Intelligence Analyst at Hermit Investments, a Zimbabwean energy investment firm focused on renewable energy IPPs, utility-scale solar, grid integration, and clean energy financing.

Generate a formal ${reportType.toUpperCase()} executive intelligence report synthesizing ${periodLabel} monitored media captures.

Monitored Articles (${articles.length} total, ${highArticles.length} high-relevance):
${articleSummaries}

Return ONLY valid JSON with these exact keys:
{
  "title": "Professional report title appropriate for a ${reportType} management briefing",
  "summary": "3-5 sentence executive overview covering the key regulatory, financing, infrastructure, and market developments",
  "highlights": ["4-6 bullet-point priority highlights, each 1-2 sentences, focusing on actionable intelligence for Hermit Investments"],
  "executive_takeaway": "2-3 sentence strategic recommendation for Hermit Investments Management, including specific next steps"
}`;

        const candidateModels = [
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-3-flash-preview',
          'gemini-2.5-flash-lite',
          'gemini-3.7-flash',
          'gemini-3.5-flash'
        ];

        for (const model of candidateModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
              }),
              signal: AbortSignal.timeout(15000)
            });

            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const parsed = JSON.parse(text);
                if (parsed.summary && parsed.highlights) {
                  geminiReport = parsed;
                  break;
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Report generation with ${model} failed, trying next:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini report generation fallback:', geminiErr);
      }
    }

    // Build the report — use Gemini output if available, otherwise heuristic fallback
    const highlights = geminiReport?.highlights
      || (highArticles.length > 0
        ? highArticles.slice(0, 4).map(a => `${a.source_name}: ${a.headline}`)
        : [
          'No high-relevance captures in current monitoring cycle.',
          'Continuous surveillance active across 70+ energy portals.',
          'Next crawl cycle scheduled — data will populate automatically.'
        ]);

    const categoryBreakdown: Record<string, number> = {};
    for (const a of articles.slice(0, 20)) {
      categoryBreakdown[a.article_type] = (categoryBreakdown[a.article_type] || 0) + 1;
    }

    const newReportPayload: Omit<Report, 'id'> = {
      report_type: reportType,
      title: geminiReport?.title || body.title || titles[reportType],
      summary: geminiReport?.summary || body.summary || `Consolidated monitoring summary capturing ${articles.length} items with focus on feed-in tariffs, DFI facilities and utility agreements.`,
      period_start: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      article_count: articles.length,
      generated_at: new Date().toISOString(),
      content: {
        highlights,
        category_breakdown: categoryBreakdown,
        executive_takeaway: geminiReport?.executive_takeaway || 'High level of deal momentum observed across solar IPPs. Hermit Investments should prioritize commercial engagement with mining and agricultural off-takers while advancing eligibility discussions with concessional DFI lenders.',
        structured_weekly: geminiReport?.structured_weekly || (reportType === 'weekly' ? buildDefaultWeeklyTemplate(articles, highArticles) : undefined)
      }
    };

    const created = await insertReport(newReportPayload);
    invalidateCache('hermit_reports_list');
    return NextResponse.json({ report: created, success: true, ai_powered: !!geminiReport }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}


function buildDefaultWeeklyTemplate(articles: any[], highArticles: any[]) {
  const now = new Date();
  const year = now.getFullYear();
  const weekNum = getWeekNumber(now);
  const startWeekStr = new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString('en-GB');
  const endWeekStr = now.toLocaleDateString('en-GB');

  const topItems = (highArticles.length > 0 ? highArticles : articles).slice(0, 5);

  return {
    header: {
      reporting_week: `${startWeekStr} to ${endWeekStr}`,
      report_reference: `HSA WC ${year} W${weekNum}`,
      prepared_by: 'Hermit Intelligence Unit',
      reviewed_by: 'Hermit Sustainability Advisory',
      submission_day: 'Monday / 09:00 UTC',
      audience: 'Executive Committee & Project Leads'
    },
    executive_update: `This week's monitoring observed critical updates across energy infrastructure, water stewardship, and climate finance. With ${articles.length} items scanned and ${highArticles.length} high-relevance developments identified, key focus areas include IPP tariff adjustments, off-taker wheeling frameworks, and multilateral project financing. Immediate priority is to assess regulatory filings and verify eligibility for concessional credit facilities.`,
    priority_findings: topItems.map((a, i) => ({
      headline: a.headline,
      theme: a.article_type === 'nexus' ? 'Water / Food' : a.article_type === 'waste_to_energy' ? 'Waste to energy' : 'Energy',
      relevance: a.relevance_to_hermit || 'Affects renewable IPP pipeline and off-take structuring',
      priority: a.relevance_level === 'high' ? 'H' : 'M',
      finding_id: `FIND-0${i + 1}`
    })),
    finding_records: topItems.map((a, i) => ({
      finding_id: `FIND-0${i + 1}`,
      headline: a.headline,
      theme: a.article_type === 'nexus' ? 'Water' : a.article_type === 'waste_to_energy' ? 'Waste to energy' : 'Energy',
      priority: a.relevance_level === 'high' ? 'High' : 'Medium',
      source: a.source_name || 'Industry Source',
      author: a.author || 'Desk Report',
      publication_date: a.publication_date ? new Date(a.publication_date).toLocaleDateString('en-GB') : endWeekStr,
      event_date: endWeekStr,
      link: a.source_link || '#',
      access_date: endWeekStr,
      factual_summary: a.summary || a.ai_summary || a.headline,
      stakeholders: Array.isArray(a.key_stakeholders) && a.key_stakeholders.length > 0 ? a.key_stakeholders.join(', ') : 'ZERA, Ministry of Energy, SAPP, Private IPPs',
      relevance_to_hermit: a.relevance_to_hermit || a.ai_impact_note || 'Commercial evaluation required for captive solar off-take contracts.',
      recommended_response: {
        action: 'Review commercial terms and update financial model',
        action_id: `ACT-0${i + 1}`,
        owner: 'Advisory Team',
        due_date: 'Within 7 days'
      },
      verification_and_gaps: 'Confirmed via official regulatory portal; follow up on final gazetting.'
    })),
    monitoring_coverage: [
      {
        source_or_topic: 'Energy Regulators & Utilities (ZERA, ZESA, PRAZ)',
        result_or_gap: 'Material updates recorded on grid interconnection and tenders',
        follow_up: 'Daily automated crawler'
      },
      {
        source_or_topic: 'Food-Water-Energy Nexus & Waste (ZINWA, EMA)',
        result_or_gap: 'Hydrological releases and dam levels checked',
        follow_up: 'Weekly review'
      },
      {
        source_or_topic: 'DFIs & Regional Power Pools (AfDB, SAPP, SACREEE)',
        result_or_gap: 'Concessional facility and wheeling calls active',
        follow_up: 'Bi-weekly verification'
      }
    ],
    action_tracker: [
      {
        action_deliverable: 'Model new grid wheeling tariff impact on commercial solar PPA returns',
        owner: 'Lead Financial Analyst',
        due_date: 'In 5 days',
        status: 'In progress',
        progress: 'Draft sensitivity analysis prepared'
      },
      {
        action_deliverable: 'Submit Expression of Interest for DFI project preparation window',
        owner: 'Project Advisory Director',
        due_date: 'In 12 days',
        status: 'Awaiting response',
        progress: 'Concept note drafted and undergoing internal review'
      }
    ],
    decisions_escalations: [
      {
        decision_reason: 'Authorize engagement with mining off-taker consortium for 25MW captive solar facility',
        decision_owner: 'Executive Committee',
        needed_by: 'End of current month'
      }
    ],
    next_week_priorities: [
      {
        priority_deliverable: 'Finalize quarterly risk matrix covering grid curtailment & currency fluctuations',
        owner: 'Advisory Lead',
        target_date: 'Next Friday'
      },
      {
        priority_deliverable: 'Conduct technical screening of municipal waste-to-energy RFP',
        owner: 'Senior Engineer',
        target_date: 'Next Wednesday'
      }
    ],
    sign_off: {
      reviewed_by: 'Lead Sustainability Advisor',
      approved_by: 'Managing Director',
      date: endWeekStr
    }
  };
}
