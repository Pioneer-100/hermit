import type { Article, DailyBrief } from '@/types';

/**
 * Builds a rich, dynamic Daily Executive Briefing from actual scanned articles.
 * If Gemini API is available, callers can augment it; otherwise, this computes
 * real sector distributions, key strategic pillars, active stakeholders, and action items.
 */
export function synthesizeDailyBriefFromArticles(articles: Article[]): DailyBrief {
  if (!articles || articles.length === 0) {
    return {
      id: `brief-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', {
        timeZone: 'Africa/Harare',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      headline: 'No new energy updates today or yesterday',
      executive_summary: 'No monitored energy updates published today or yesterday are currently available for the executive briefing.',
      market_sentiment: 'neutral',
      risk_index: 0,
      risk_label: 'No recent updates',
      sector_breakdown: [],
      strategic_pillars: [],
      key_stakeholders_active: [],
      management_actions: [],
      total_articles_scanned: 0,
      high_relevance_count: 0
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
  const executive_summary = `Across ${total} energy sector updates published today or yesterday, ${
    tariffCount > 0 ? `${tariffCount} regulatory/tariff adjustments were identified` : 'no regulatory/tariff adjustments were identified'
  }${fundingCount > 0 ? `, alongside ${fundingCount} major capital and facility developments` : ''}. ${
    topArticle?.ai_summary || topArticle?.summary || 'No additional summary is available for the leading update.'
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
      ? new Date(art.captured_at).toLocaleTimeString('en-GB', { timeZone: 'Africa/Harare', hour: '2-digit', minute: '2-digit' }) + ' CAT'
      : `${8 + idx}:00 CAT`;

    return {
      title: art.headline,
      category: formatCategoryTitle(art.article_type),
      badge: art.relevance_score ? `${Math.round(art.relevance_score * 100)}% Relevance` : 'Sector Priority',
      impact: limitWords(art.ai_summary || art.summary || art.raw_content || art.headline, 250),
      takeaway: normalizeCommercialImpact(art.ai_impact_note || art.relevance_to_hermit || ''),
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

  // 6. Management Actions derived from top articles
  const management_actions = candidateArticles.slice(0, 3).map((art, i) => ({
    priority: (i === 0 ? 'immediate' : (i === 1 ? 'immediate' : 'medium')) as 'immediate' | 'medium' | 'standard',
    action: (art.suggested_actions && art.suggested_actions[0]) || `Evaluate project pipeline risk from ${art.source_name} updates.`,
    owner: i === 0 ? 'Executive Directorate' : (i === 1 ? 'Technical & Legal' : 'Commercial Origination')
  }));

  const todayStr = new Date().toLocaleDateString('en-GB', {
    timeZone: 'Africa/Harare',
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
    sector_breakdown,
    strategic_pillars,
    key_stakeholders_active,
    management_actions,
    total_articles_scanned: total,
    high_relevance_count: highArticles.length
  };
}

function limitWords(text: string, limit: number): string {
  return text.trim().split(/\s+/).slice(0, limit).join(' ');
}

function normalizeCommercialImpact(text: string): string {
  const firstLine = text.split(/\r?\n/)[0].replace(/^\s*(?:\d+[.)]\s*[-:]?\s*|[-*]\s*)/, '').trim();
  const words = firstLine.split(/\s+/).filter(Boolean);

  if (words.length < 15) {
    return "This development may affect Hermit's project pipeline, financing assumptions, investment decisions, and commercial market positioning.";
  }

  const trimmedImpact = words.slice(0, 20).join(' ').replace(/[.,;:!?]+$/, '');
  return `${trimmedImpact}.`;
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
