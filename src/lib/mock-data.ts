import { Article, Report, AlertLog, DashboardStats, DailyBrief } from '@/types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 1,
    publication_date: '2026-09-22T08:14:00Z',
    headline: 'ZERA proposes revised solar feed-in tariff structure',
    source_id: 18,
    source_name: 'ZERA',
    author: 'Tawanda Karombo',
    summary: 'The Zimbabwe Energy Regulatory Authority (ZERA) has published a draft consultation paper proposing updated feed-in tariff bands for grid-tied commercial and utility solar PV producers above 1MW, with a 30-day public comment window.',
    key_stakeholders: ['ZERA Technical Committee', 'Independent Power Producers Association of Zimbabwe (IPPAZ)', 'ZETDC Grid Integration Unit'],
    relevance_to_hermit: 'Directly impacts return-on-investment models for Hermit Investments proposed 25MW solar pipeline in Mashonaland East. Lower proposed off-take tariffs could compress margins by 8-12% unless blended with private C&I PPAs.',
    source_link: 'https://www.zera.co.zw/notices/solar-feed-in-tariff-review-2026',
    relevance_score: 0.94,
    relevance_level: 'high',
    article_type: 'tariff_change',
    ai_summary: 'ZERA is revising feed-in tariffs downward for commercial solar >1MW following falling PV component costs, introducing tiered incentives for battery energy storage (BESS) co-location.',
    ai_impact_note: '1. Fast-track PPA negotiations under existing tariff bands before formal gazetting.\n2. Model hybrid solar + battery storage architecture to qualify for proposed tier-2 premium off-take rate.\n3. Submit formal consultative feedback through IPPAZ before October 21 deadline.',
    suggested_actions: [
      'Download draft consultation paper and cross-check against 2026 financial models',
      'Schedule briefing with Hermit Technical Director and IPPAZ liaison',
      'Model 4-hour battery storage addition to project capital structure'
    ],
    is_reviewed: false,
    is_alert_sent: true,
    captured_at: '2026-09-22T08:16:32Z',
    processed_at: '2026-09-22T08:17:05Z'
  },
  {
    id: 2,
    publication_date: '2026-09-22T07:52:00Z',
    headline: 'AfDB approves $40M renewable energy facility for Southern Africa',
    source_id: 24,
    source_name: 'AfDB',
    author: 'Emeka Uzoho',
    summary: 'The African Development Bank (AfDB) Board has approved a $40 million concessional financing facility under SEFA aimed at de-risking private sector solar and mini-grid installations in Zimbabwe, Zambia, and Malawi.',
    key_stakeholders: ['Dr. Akinwumi Adesina (AfDB)', 'Ministry of Finance and Economic Development', 'Local Commercial Banks Consortium'],
    relevance_to_hermit: 'Opens access to low-interest, long-tenor debt financing (sub-6% interest in USD terms) with blended grant components for local project preparation and grid-interconnection studies.',
    source_link: 'https://www.afdb.org/en/news-and-events/press-releases/sefa-approves-40m-renewable-facility-southern-africa',
    relevance_score: 0.91,
    relevance_level: 'high',
    article_type: 'funding_announcement',
    ai_summary: 'AfDB SEFA releases $40M dedicated to sub-Saharan Southern African private renewable energy developers, providing co-investment, debt guarantees and technical study grants.',
    ai_impact_note: '1. Engage AfDB Harare country office to confirm eligibility criteria for Hermit project special purpose vehicles.\n2. Explore partnership with participating commercial banks (Stanbic/Ecobank) for on-lending allocations.',
    suggested_actions: [
      'Draft Expression of Interest (EOI) for Hermit solar portfolio debt tranche',
      'Request bilateral meeting with AfDB Southern Africa Regional Office'
    ],
    is_reviewed: true,
    is_alert_sent: true,
    captured_at: '2026-09-22T07:55:12Z',
    processed_at: '2026-09-22T07:56:40Z'
  },
  {
    id: 3,
    publication_date: '2026-09-22T09:03:00Z',
    headline: 'Zimbabwe eyes expanded grid interconnection with SAPP',
    source_id: 1,
    source_name: 'The Herald',
    author: 'Golden Sibanda',
    summary: 'Zimbabwe is accelerating upgrades to the 400kV Insukamini-Phokoje and Alaska-Sherwood transmission corridors to enhance regional power wheeling capacity across the Southern African Power Pool (SAPP).',
    key_stakeholders: ['Eng. Lovemore Chinaka (ZETDC)', 'Stephen Dihwa (SAPP Coordination Centre)', 'Eskom Transmission'],
    relevance_to_hermit: 'High wheeling capacity through SAPP creates opportunities for Hermit Investments to export merchant renewable power to regional off-takers in Zambia and South Africa during daylight surplus peaks.',
    source_link: 'https://www.herald.co.zw/business/zimbabwe-eyes-expanded-grid-interconnection-sapp',
    relevance_score: 0.68,
    relevance_level: 'medium',
    article_type: 'project_update',
    ai_summary: 'ZETDC and SAPP are reinforcing regional transmission links, improving export liquidity and wheeling stability for prospective merchant power producers.',
    ai_impact_note: 'Long-term positive for cross-border wheeling agreements, but near-term requires monitoring transmission toll tariffs charged by ZETDC.',
    suggested_actions: [
      'Monitor SAPP Day-Ahead Market (DAM) clearing prices weekly',
      'Inquire with ZETDC on open-access transmission pricing protocols'
    ],
    is_reviewed: false,
    is_alert_sent: false,
    captured_at: '2026-09-22T09:05:44Z',
    processed_at: '2026-09-22T09:07:11Z'
  },
  {
    id: 4,
    publication_date: '2026-09-22T06:40:00Z',
    headline: 'Minister outlines 2027 national energy policy priorities',
    source_id: 12,
    source_name: 'Ministry of Energy',
    author: 'Staff Reporter',
    summary: 'The Minister of Energy and Power Development reiterated the governments commitment to accelerating 1,100MW of independent renewable power capacity by 2027 through streamlined licensing and sovereign risk mitigation frameworks.',
    key_stakeholders: ['Minister of Energy & Power Development', 'ZIDA One-Stop Centre', 'Confederation of Zimbabwe Industries (CZI)'],
    relevance_to_hermit: 'Strong policy tailwind affirming government guarantees for private power purchase agreements (PPAs) signed with industrial and mining heavy off-takers.',
    source_link: 'https://www.energy.gov.zw/speeches/ministerial-policy-address-september-2026',
    relevance_score: 0.72,
    relevance_level: 'medium',
    article_type: 'policy_change',
    ai_summary: 'Government reaffirms sovereign backing for renewable IPPs and emphasizes mandatory rooftop solar on all new commercial complexes.',
    ai_impact_note: 'Confirms macroeconomic policy alignment; consider pitching C&I rooftop portfolio packages to CZI corporate members.',
    suggested_actions: [
      'Obtain full ministerial transcript from Permanent Secretary office',
      'Align upcoming Hermit pitch deck with National Renewable Energy Policy (NREP) targets'
    ],
    is_reviewed: true,
    is_alert_sent: false,
    captured_at: '2026-09-22T06:44:00Z',
    processed_at: '2026-09-22T06:46:18Z'
  },
  {
    id: 5,
    publication_date: '2026-09-22T05:15:00Z',
    headline: 'Solar mini-grid rollout accelerates in rural Zimbabwe',
    source_id: 54,
    source_name: 'ESI Africa',
    author: 'Pamela Sithebe',
    summary: 'The Rural Electrification Fund (REF) partnered with private EPC contractors to commission eight new solar-powered decentralized mini-grids across Manicaland and Masvingo provinces, utilizing smart metering and lithium battery storage.',
    key_stakeholders: ['REF Executive Directorate', 'UNDP Climate Facility', 'Community Energy Committees'],
    relevance_to_hermit: 'Demonstrates proven customer demand for decentralized pay-as-you-go off-grid power; validates Hermit commercial exploration into rural anchor-load mini-grids (hospitals, schools, irrigation hubs).',
    source_link: 'https://www.esi-africa.com/renewable-energy/solar-mini-grid-rollout-rural-zimbabwe',
    relevance_score: 0.38,
    relevance_level: 'low',
    article_type: 'project_update',
    ai_summary: 'REF and international donors commission 8 new mini-grids, showcasing off-grid operational models and PAYG revenue collection performance.',
    ai_impact_note: 'Provides benchmarking data on equipment failure rates and community tariff recovery in rural districts.',
    suggested_actions: ['Archive for quarterly renewable technology & rural electrification survey'],
    is_reviewed: false,
    is_alert_sent: false,
    captured_at: '2026-09-22T05:19:00Z',
    processed_at: '2026-09-22T05:20:30Z'
  },
  {
    id: 6,
    publication_date: '2026-09-21T16:20:00Z',
    headline: 'Treasury gazettes duty waiver extension on solar inverters and lithium storage batteries',
    source_id: 13,
    source_name: 'Ministry of Finance',
    author: 'Kudakwashe Mugari',
    summary: 'Statutory Instrument 184 of 2026 has been gazetted, extending the rebate of duty on imported solar panels, deep-cycle lithium iron phosphate batteries, and grid-tie inverters by an additional 24 months to support private energy transition.',
    key_stakeholders: ['Ministry of Finance', 'ZIMRA Customs Division', 'Renewable Energy Association of Zimbabwe (REAZ)'],
    relevance_to_hermit: 'Immediate capital expenditure saving of 15-20% on all imported balance-of-system electrical hardware for Hermit active procurement tenders.',
    source_link: 'https://www.zimtreasury.gov.zw/si-184-2026-solar-duty-waiver',
    relevance_score: 0.88,
    relevance_level: 'high',
    article_type: 'new_regulation',
    ai_summary: 'ZIMRA duty exemption on clean energy generation and storage equipment extended through December 2028 under SI 184.',
    ai_impact_note: '1. Update procurement budget schedules to reflect zero-duty tariff codes for containerized BESS imports.\n2. Verify customs clearance documentation checklists with logistics clearing partners.',
    suggested_actions: [
      'Distribute SI 184 gazette to engineering and procurement teams',
      'Audit existing equipment purchase orders for customs tax reclamation'
    ],
    is_reviewed: true,
    is_alert_sent: true,
    captured_at: '2026-09-21T16:25:12Z',
    processed_at: '2026-09-21T16:28:40Z'
  },
  {
    id: 7,
    publication_date: '2026-09-21T14:10:00Z',
    headline: 'ZESA signs 100MW cross-border power supply deal with EDM Mozambique',
    source_id: 19,
    source_name: 'ZESA Holdings',
    author: 'Business Desk',
    summary: 'ZESA Holdings has finalized a supplementary power import contract with Electricidade de Moçambique (EDM) for 100MW firm capacity to stabilize industrial supply during ongoing maintenance at Hwange Power Station.',
    key_stakeholders: ['Dr. Sydney Gata (ZESA)', 'Marcelino Alberto (EDM)', 'SAPP Operations Committee'],
    relevance_to_hermit: 'Highlights continued national supply deficit and utility reliance on foreign currency imports ($0.11/kWh+), reinforcing strong business case for domestic private IPPs with local currency indexation.',
    source_link: 'https://www.zesa.co.zw/media/press-releases/edm-mozambique-power-deal-2026',
    relevance_score: 0.76,
    relevance_level: 'high',
    article_type: 'partnership',
    ai_summary: 'ZESA secures 100MW emergency imports from Mozambique to bridge Hwange maintenance deficits at substantial foreign currency cost.',
    ai_impact_note: 'Underscores the urgent grid demand for domestic base-load and solar-peak capacity, strengthening Hermit negotiating leverage with off-takers.',
    suggested_actions: [
      'Cite Mozambique import costs in upcoming PPA off-take discussions with industrial mining clients'
    ],
    is_reviewed: false,
    is_alert_sent: true,
    captured_at: '2026-09-21T14:15:22Z',
    processed_at: '2026-09-21T14:17:15Z'
  },
  {
    id: 8,
    publication_date: '2026-09-21T11:45:00Z',
    headline: 'Kariba live storage drops to 11.4% as Zambezi River inflows recede',
    source_id: 17,
    source_name: 'ZINWA',
    author: 'Munyaradzi Musiiwa',
    summary: 'The Zambezi River Authority (ZRA) and ZINWA have reported that usable storage at Lake Kariba has declined to 11.4% (7.4 billion cubic meters), enforcing tightened water allocations for power generation at Kariba South and North bank stations.',
    key_stakeholders: ['Eng. Munyaradzi Munodawafa (ZRA)', 'ZPC Kariba Power Station Management', 'Zesco Zambia'],
    relevance_to_hermit: 'Severe hydro deficit forces Zimbabwe to seek daytime solar peaking capacity immediately; mining houses are actively seeking private solar-plus-storage solutions to circumvent severe hydro rationing.',
    source_link: 'https://www.zinwa.co.zw/hydrological-updates/kariba-lake-storage-september-2026',
    relevance_score: 0.85,
    relevance_level: 'high',
    article_type: 'project_update',
    ai_summary: 'Kariba water levels fall to critical 11.4%, curtailing hydro output to under 300MW and escalating national load-shedding risks.',
    ai_impact_note: 'High urgency signal for industrial off-takers to execute private IPP agreements before seasonal October-November peak heat demand.',
    suggested_actions: [
      'Prepare emergency solar briefing for Hermit Executive Committee and prospective mining partners'
    ],
    is_reviewed: true,
    is_alert_sent: true,
    captured_at: '2026-09-21T11:50:00Z',
    processed_at: '2026-09-21T11:52:45Z'
  }
];

export const INITIAL_STATS: DashboardStats = {
  capturedToday: 47,
  totalArticles: 106,
  highRelevanceFlags: 6,
  pendingReview: 2,
  sourcesMonitored: 63,
  sourcesActive: 58,
};

export const INITIAL_REPORTS: Report[] = [
  {
    id: 1,
    report_type: 'daily',
    title: 'Daily Energy Intelligence Digest — 22 September 2026',
    summary: 'High-impact regulatory updates from ZERA regarding solar feed-in tariffs, accompanied by AfDB $40M regional funding announcement.',
    period_start: '2026-09-22T00:00:00Z',
    period_end: '2026-09-22T18:00:00Z',
    article_count: 5,
    generated_at: '2026-09-22T18:00:00Z',
    content: {
      highlights: [
        'ZERA draft paper proposes revised solar feed-in tariff brackets for utility PV above 1MW.',
        'AfDB Board approves $40M SEFA facility for Southern Africa clean energy IPPs.',
        'ZETDC accelerates 400kV regional transmission upgrade with SAPP interconnector.',
        'Minister of Energy outlines 1,100MW renewable additions roadmap for 2027.'
      ],
      category_breakdown: {
        newspapers: 1,
        government: 1,
        regulators: 1,
        dfi: 1,
        intl_media: 1
      },
      executive_takeaway: 'Regulatory and financing factors aligned positively today. Hermit should immediately engage with IPPAZ regarding ZERA draft comments and submit an initial debt expression of interest for the AfDB SEFA facility.'
    }
  },
  {
    id: 2,
    report_type: 'weekly',
    title: 'Weekly Energy Sector Briefing — Week 38 (15-22 Sept 2026)',
    summary: 'Consolidated strategic review covering Kariba hydro generation decline, Treasury duty exemptions, Mozambique import contract, and ZERA tariff developments.',
    period_start: '2026-09-15T00:00:00Z',
    period_end: '2026-09-22T23:59:59Z',
    article_count: 24,
    generated_at: '2026-09-22T17:30:00Z',
    content: {
      highlights: [
        'Kariba hydro storage drops to 11.4%, prompting mining houses to seek private solar PPA hedging.',
        'Treasury extends solar equipment and lithium battery duty exemptions under SI 184 of 2026.',
        'ZESA signs 100MW bilateral import deal with EDM Mozambique to offset thermal outages.',
        'ZERA initiates feed-in tariff public consultation with emphasis on battery storage.'
      ],
      category_breakdown: {
        newspapers: 9,
        government: 4,
        regulators: 5,
        dfi: 3,
        renewables: 2,
        intl_media: 1
      },
      executive_takeaway: 'Hydro deficit creates unprecedented market urgency for private solar C&I solutions. Duty rebates safeguard equipment capex. Priority for next week is finalizing bilateral PPA proposals with Mashonaland agricultural and mining clusters.'
    }
  }
];

export const INITIAL_ALERTS: AlertLog[] = [
  {
    id: 1,
    article_id: 1,
    headline: 'ZERA proposes revised solar feed-in tariff structure',
    source_name: 'ZERA',
    relevance_level: 'high',
    recipient_email: 'communications@hermitinvestments.com',
    status: 'sent',
    dispatched_at: '2026-09-22T08:17:30Z'
  },
  {
    id: 2,
    article_id: 2,
    headline: 'AfDB approves $40M renewable energy facility for Southern Africa',
    source_name: 'AfDB',
    relevance_level: 'high',
    recipient_email: 'management@hermitinvestments.com',
    status: 'sent',
    dispatched_at: '2026-09-22T07:57:02Z'
  },
  {
    id: 3,
    article_id: 6,
    headline: 'Treasury gazettes duty waiver extension on solar inverters and lithium storage batteries',
    source_name: 'Ministry of Finance',
    relevance_level: 'high',
    recipient_email: 'management@hermitinvestments.com',
    status: 'sent',
    dispatched_at: '2026-09-21T16:29:10Z'
  }
];

export const INITIAL_DAILY_BRIEF: DailyBrief = {
  id: 'brief-2026-10-06',
  date: 'Tuesday, 6 October 2026',
  headline: 'ZERA Proposes Solar Feed-In Tariff Revision While AfDB Injects $40M Clean Energy Facility',
  executive_summary: "Today's continuous surveillance across 70+ tracked Zimbabwean energy portals captures key regulatory realignments and concessional capital tailwinds. The Zimbabwe Energy Regulatory Authority (ZERA) opened a 30-day consultative window on revised feed-in tariffs for utility solar PV producers >1MW, while the African Development Bank (AfDB) approved a $40M regional de-risking facility. Concurrently, Kariba hydro storage contracted to 11.4%, compounding national peaking deficits and strengthening private solar PPA off-take economics.",
  market_sentiment: 'bullish',
  risk_index: 68,
  risk_label: 'Elevated Regulatory Focus',
  sector_breakdown: [
    { category: 'Tariff & Regulation', percentage: 38, count: 7, color: '#10b981' },
    { category: 'Solar IPP Pipeline', percentage: 28, count: 5, color: '#059669' },
    { category: 'DFI Concessional Debt', percentage: 20, count: 4, color: '#0d9488' },
    { category: 'Grid Access & SAPP', percentage: 14, count: 2, color: '#0284c7' }
  ],
  strategic_pillars: [
    {
      title: 'ZERA Commercial Solar (>1MW) Tariff Revision',
      category: 'Regulatory Policy',
      badge: 'PPA Margin Impact',
      impact: 'Lower proposed baseline off-take tariffs could compress developer return margins unless blended with battery energy storage (BESS) premium incentives.',
      takeaway: 'Fast-track bilateral PPA negotiations under existing tariff bands before the formal October 21 consultative window closes.',
      related_article_id: 1,
      source: 'ZERA Portal',
      time: '08:14 CAT'
    },
    {
      title: 'AfDB Approves $40M Renewable Facility for Southern Africa',
      category: 'DFI Capital Window',
      badge: 'Sub-6% USD Debt',
      impact: 'Unlocks concessional financing and technical preparation grants through local commercial banking consortia (Stanbic & Ecobank).',
      takeaway: 'Submit formal project dossier to AfDB Harare country office to verify Hermit Special Purpose Vehicle eligibility.',
      related_article_id: 2,
      source: 'AfDB Harare',
      time: '07:52 CAT'
    },
    {
      title: 'SI 184 Duty Rebate Extended on Solar Inverters & Lithium Storage',
      category: 'Fiscal Relief',
      badge: '15-20% Capex Relief',
      impact: 'Customs duty zero-rating extended by 24 months, shielding procurement budgets against foreign exchange tariffs.',
      takeaway: 'Update procurement tenders and verify customs clearance exemption checklists with logistics partners.',
      related_article_id: 6,
      source: 'Ministry of Finance',
      time: '16:20 CAT'
    },
    {
      title: 'Kariba Hydro Storage Falls to 11.4% (7.4 BCM Remaining)',
      category: 'Generation Deficit',
      badge: 'Peak Demand Urgency',
      impact: 'Hydro generation capped below 300MW; mining and commercial off-takers are actively seeking private solar-plus-storage hedges.',
      takeaway: 'Circulate emergency daytime solar peaking proposals to industrial and agricultural clusters in Mashonaland.',
      related_article_id: 8,
      source: 'ZINWA / ZRA',
      time: '11:45 CAT'
    }
  ],
  key_stakeholders_active: [
    { name: 'ZERA', role: 'Energy Regulator', stance: 'regulatory', mentions: 5 },
    { name: 'AfDB', role: 'Multilateral DFI', stance: 'financing', mentions: 4 },
    { name: 'Ministry of Energy', role: 'Policy Formulation', stance: 'favorable', mentions: 3 },
    { name: 'ZESA / ZETDC', role: 'National Power Utility', stance: 'warning', mentions: 3 }
  ],
  management_actions: [
    { priority: 'immediate', action: 'Submit consultative feedback through IPPAZ on ZERA draft feed-in tariffs before Oct 21.', owner: 'Technical & Legal' },
    { priority: 'immediate', action: 'Draft Expression of Interest (EOI) for Hermit solar portfolio debt tranche with AfDB SEFA.', owner: 'Structured Finance' },
    { priority: 'medium', action: 'Pitch private solar hedge packages to CZI industrial members impacted by hydro load-shedding.', owner: 'Commercial Origination' }
  ],
  total_articles_scanned: 47,
  high_relevance_count: 6
};

