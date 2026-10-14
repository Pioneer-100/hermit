import { Article, DailyBrief } from '@/types';
import { INITIAL_DAILY_BRIEF } from './mock-data';

/**
 * Builds a rich, dynamic Daily Executive Briefing from actual scanned articles.
 * If Gemini API is available, callers can augment it; otherwise, this computes
 * real sector distributions, key strategic pillars, active stakeholders, and action items.
 */
export function synthesizeDailyBriefFromArticles(articles: Article[]): DailyBrief {
  if (!articles || articles.length === 0) {
    return {
      ...INITIAL_DAILY_BRIEF,
      date: new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  }

  const highArticles = articles.filter(a => a.relevance_level === 'high');
  const mediumArticles = articles.filter(a => a.relevance_level === 'medium');

  // 1. Calculate dynamic sector breakdown
  const categoryCounts: Record<string, number> = {};
  articles.forEach(art => {
    const cat = mapArticleTypeToCategory(art.article_type);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const total = articles.length;
  const sectorColors: Record<string, string> = {
    'Tariff & Regulation': '#10b981',
    'Solar IPP Pipeline': '#059669',
    'DFI Concessional Debt': '#0d9488',
    'Grid Access & SAPP': '#0284c7',
    'Policy & Government': '#6366f1',
    'Commercial Partnerships': '#f59e0b',
    'General Energy': '#14b8a6'
  };

  const sector_breakdown = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
      color: sectorColors[category] || '#10b981'
    }));

  // Ensure percentages sum properly or handle rounding
  if (sector_breakdown.length > 0) {
    const sumP = sector_breakdown.reduce((acc, curr) => acc + curr.percentage, 0);
    if (sumP !== 100 && sector_breakdown[0]) {
      sector_breakdown[0].percentage += (100 - sumP);
    }
  }

  // 2. Derive top lead headline & executive summary
  const topArticle = highArticles[0] || articles[0];
  const secondArticle = highArticles[1] || articles[1];

  let headline = topArticle ? topArticle.headline : "Zimbabwe Energy Sector Daily Intelligence Overview";
  if (topArticle && secondArticle && highArticles.length >= 2) {
    headline = `${topArticle.headline} — Key Developments & Strategic Outlook`;
  }

  // Executive summary synthesis
  const tariffCount = articles.filter(a => a.article_type === 'tariff_change' || a.article_type === 'new_regulation').length;
  const fundingCount = articles.filter(a => a.article_type === 'funding_announcement').length;
  const ppaCount = articles.filter(a => a.article_type === 'partnership' || a.article_type === 'project_update').length;

  const executive_summary = `Across ${total} energy sector captures scanned across Zimbabwe, today is characterized by ${
    tariffCount > 0 ? `${tariffCount} regulatory/tariff adjustments` : 'steady regulatory conditions'
  }${fundingCount > 0 ? `, alongside ${fundingCount} major capital and facility developments` : ''}. ${
    topArticle?.ai_summary || topArticle?.summary || 'Key monitored sources reflect active sector realignments impacting Hermit investments and IPP off-take structures.'
  }`;

  // 3. Compute market sentiment & risk index
  let risk_index = 50;
  if (tariffCount >= 3) risk_index += 22;
  else if (tariffCount >= 1) risk_index += 12;

  if (highArticles.length > 5) risk_index += 15;
  risk_index = Math.min(Math.max(risk_index, 20), 92);

  let risk_label = 'Stable Market Conditions';
  if (risk_index >= 75) risk_label = 'Elevated Regulatory Focus';
  else if (risk_index >= 60) risk_label = 'Moderate Policy Shift';

  let market_sentiment: 'bullish' | 'bearish' | 'neutral' | 'cautious' = 'bullish';
  if (fundingCount > tariffCount) market_sentiment = 'bullish';
  else if (tariffCount > 4) market_sentiment = 'cautious';
  else market_sentiment = 'neutral';

  // 4. Strategic Pillars (Top 4 critical items with takeaways)
  const candidateArticles = [...highArticles, ...mediumArticles, ...articles].slice(0, 4);
  const strategic_pillars = candidateArticles.map((art, idx) => {
    const timeFormatted = art.captured_at
      ? new Date(art.captured_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' CAT'
      : `${8 + idx}:00 CAT`;

    return {
      title: art.headline,
      category: formatCategoryTitle(art.article_type),
      badge: art.relevance_score ? `${Math.round(art.relevance_score * 100)}% Relevance` : 'Sector Priority',
      impact: art.relevance_to_hermit || art.ai_impact_note || art.summary || 'Strategic significance for IPP pipeline and off-take negotiations.',
      takeaway: (art.suggested_actions && art.suggested_actions[0]) || 'Review commercial parameters with engineering and legal teams.',
      related_article_id: art.id,
      source: art.source_name || 'Portal Feed',
      time: timeFormatted
    };
  });

  // 5. Active Stakeholders aggregated from articles
  const stakeholderMap: Record<string, { role: string; count: number }> = {};
  articles.forEach(art => {
    if (art.key_stakeholders && Array.isArray(art.key_stakeholders)) {
      art.key_stakeholders.forEach(stk => {
        const clean = stk.trim();
        if (clean.length > 2) {
          if (!stakeholderMap[clean]) {
            stakeholderMap[clean] = { role: getStakeholderRole(clean), count: 0 };
          }
          stakeholderMap[clean].count += 1;
        }
      });
    }
  });

  const key_stakeholders_active = Object.entries(stakeholderMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([name, data]) => ({
      name,
      role: data.role,
      stance: deriveStance(name, data.role),
      mentions: data.count
    }));

  // Fallback stakeholders if none extracted
  if (key_stakeholders_active.length === 0) {
    key_stakeholders_active.push(
      { name: 'ZERA', role: 'Energy Regulator', stance: 'regulatory', mentions: 5 },
      { name: 'AfDB', role: 'Multilateral DFI', stance: 'financing', mentions: 4 },
      { name: 'Ministry of Energy', role: 'Policy Formulation', stance: 'favorable', mentions: 3 },
      { name: 'ZESA / ZETDC', role: 'National Utility', stance: 'warning', mentions: 3 }
    );
  }

  // 6. Management Actions derived from top articles
  const management_actions = candidateArticles.slice(0, 3).map((art, i) => ({
    priority: (i === 0 ? 'immediate' : (i === 1 ? 'immediate' : 'medium')) as 'immediate' | 'medium' | 'standard',
    action: (art.suggested_actions && art.suggested_actions[0]) || `Evaluate project pipeline risk from ${art.source_name} updates.`,
    owner: i === 0 ? 'Executive Directorate' : (i === 1 ? 'Technical & Legal' : 'Commercial Origination')
  }));

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
    id: `brief-${Date.now()}`,
    date: todayStr,
    headline,
    executive_summary,
    market_sentiment,
    risk_index,
    risk_label,
    sector_breakdown: sector_breakdown.length > 0 ? sector_breakdown : INITIAL_DAILY_BRIEF.sector_breakdown,
    strategic_pillars: strategic_pillars.length > 0 ? strategic_pillars : INITIAL_DAILY_BRIEF.strategic_pillars,
    key_stakeholders_active,
    management_actions: management_actions.length > 0 ? management_actions : INITIAL_DAILY_BRIEF.management_actions,
    total_articles_scanned: total,
    high_relevance_count: highArticles.length
  };
}

function mapArticleTypeToCategory(type: string): string {
  switch (type) {
    case 'tariff_change':
    case 'new_regulation':
      return 'Tariff & Regulation';
    case 'funding_announcement':
      return 'DFI Concessional Debt';
    case 'project_update':
      return 'Solar IPP Pipeline';
    case 'policy_change':
      return 'Policy & Government';
    case 'partnership':
      return 'Commercial Partnerships';
    default:
      return 'General Energy';
  }
}

function formatCategoryTitle(type: string): string {
  switch (type) {
    case 'tariff_change': return 'Tariff Restructuring';
    case 'new_regulation': return 'Regulatory Policy';
    case 'funding_announcement': return 'DFI Capital Window';
    case 'project_update': return 'IPP Pipeline Update';
    case 'policy_change': return 'National Energy Policy';
    case 'partnership': return 'PPA & Corporate Deal';
    default: return 'Sector Development';
  }
}

function getStakeholderRole(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('zera')) return 'Energy Regulator';
  if (lower.includes('afdb') || lower.includes('world bank') || lower.includes('sefa')) return 'Multilateral DFI';
  if (lower.includes('zesa') || lower.includes('zetdc')) return 'National Power Utility';
  if (lower.includes('ministry')) return 'Policy Formulation';
  if (lower.includes('ippaz')) return 'IPPs Association';
  return 'Industry Stakeholder';
}

function deriveStance(name: string, role: string): 'favorable' | 'regulatory' | 'financing' | 'warning' {
  const lower = (name + ' ' + role).toLowerCase();
  if (lower.includes('afdb') || lower.includes('bank') || lower.includes('fund') || lower.includes('sefa')) return 'financing';
  if (lower.includes('zera') || lower.includes('regulat')) return 'regulatory';
  if (lower.includes('zesa') || lower.includes('zetdc') || lower.includes('load-shedding')) return 'warning';
  return 'favorable';
}
