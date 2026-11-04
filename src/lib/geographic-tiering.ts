import { Article } from '@/types';

export type GeographicTier = 'zimbabwe' | 'regional' | 'continental';

export interface TierClassification {
  tier: GeographicTier;
  label: string;
  weight: number; // Higher number = higher priority
}

// Zimbabwe core entities, locations, and regulators
const ZIMBABWE_MARKERS = [
  'zimbabwe', 'harare', 'bulawayo', 'zera', 'zesa', 'zetdc', 'zpc', 'kariba',
  'hwange', 'munyati', 'zida', 'herald', 'newsday', 'sunday mail', 'chronicle',
  'mutare', 'gweru', 'kwekwe', 'masvingo', 'chinhoyi', 'bindura', 'crowborough',
  'seke', 'chitungwiza', 'beatrice', 'selous', 'gwanda', 'zinwa', 'reaz'
];

// SADC & Regional Power Pool entities and neighbor states
const REGIONAL_MARKERS = [
  'sadc', 'sapp', 'southern africa', 'southern african', 'zambia', 'zra', 'zambezi river authority',
  'south africa', 'eskom', 'mozambique', 'edm', 'botswana', 'bpc', 'namibia', 'nampower',
  'malawi', 'escom', 'drc', 'snel', 'angola', 'tanzania', 'tanesco', 'cross-border',
  'wheeling', 'transmission corridor', 'interconnector', 'sacreee', 'cabora bassa', 'kavango'
];

// Continental & Pan-African multilateral / Africa-wide markers
const CONTINENTAL_MARKERS = [
  'africa', 'african', 'afdb', 'african development bank', 'sefa', 'au', 'african union',
  'nepad', 'dBSA', 'ecowas', 'eac', 'comesa', 'pan-african', 'sub-saharan'
];

/**
 * Classifies an article into one of three strategic geographic tiers:
 * 1. 'zimbabwe' (Priority Tier 1 — Core Domestic)
 * 2. 'regional' (Priority Tier 2 — SADC / SAPP / Southern Africa Cross-Border)
 * 3. 'continental' (Priority Tier 3 — Pan-African / DFI Continental / Global)
 */
export function classifyGeographicTier(article: Partial<Article>): TierClassification {
  const countryMarket = (article.country_market || '').toLowerCase();
  const sourceName = (article.source_name || '').toLowerCase();
  const text = `${article.headline || ''} ${article.summary || ''} ${article.source_name || ''} ${countryMarket}`.toLowerCase();

  // 1. Zimbabwe check
  if (
    countryMarket.includes('zimbabwe') ||
    ZIMBABWE_MARKERS.some(m => text.includes(m))
  ) {
    return {
      tier: 'zimbabwe',
      label: 'Zimbabwe (Domestic)',
      weight: 3
    };
  }

  // 2. Regional / SADC / SAPP check
  if (
    countryMarket.includes('regional') ||
    countryMarket.includes('sadc') ||
    countryMarket.includes('sapp') ||
    REGIONAL_MARKERS.some(m => text.includes(m))
  ) {
    return {
      tier: 'regional',
      label: 'Regional (SADC / SAPP)',
      weight: 2
    };
  }

  // 3. Continental / Africa check
  if (
    countryMarket.includes('continental') ||
    countryMarket.includes('africa') ||
    CONTINENTAL_MARKERS.some(m => text.includes(m))
  ) {
    return {
      tier: 'continental',
      label: 'Continental (Africa)',
      weight: 1
    };
  }

  // Default to continental/international if not recognized
  return {
    tier: 'continental',
    label: 'Continental & Global',
    weight: 1
  };
}

export interface TierAllocationConfig {
  totalSlots: number;
  zimbabweRatio?: number; // e.g. 0.60 (60% of slots)
  regionalRatio?: number; // e.g. 0.25 (25% of slots)
  continentalRatio?: number; // e.g. 0.15 (15% of slots)
}

/**
 * Prioritizes and allocates article slots for executive briefings and reports.
 * Default allocation:
 * - Zimbabwe: ~60% of slots
 * - Regional (SADC/SAPP): ~25% of slots
 * - Continental (Africa): ~15% of slots
 *
 * If a tier has fewer articles than its quota, slots automatically overflow
 * into the next highest priority tier.
 */
export function prioritizeArticlesByTier(
  articles: Article[],
  config: TierAllocationConfig = { totalSlots: 15, zimbabweRatio: 0.60, regionalRatio: 0.25, continentalRatio: 0.15 }
): {
  prioritizedArticles: Article[];
  tierCounts: { zimbabwe: number; regional: number; continental: number };
  zimbabweArticles: Article[];
  regionalArticles: Article[];
  continentalArticles: Article[];
} {
  const zimbabwePool: Article[] = [];
  const regionalPool: Article[] = [];
  const continentalPool: Article[] = [];

  // Group articles by classified tier
  for (const art of articles) {
    const classification = classifyGeographicTier(art);
    if (classification.tier === 'zimbabwe') {
      zimbabwePool.push(art);
    } else if (classification.tier === 'regional') {
      regionalPool.push(art);
    } else {
      continentalPool.push(art);
    }
  }

  // Sort each pool by relevance score desc and date desc
  const sortPool = (pool: Article[]) => {
    return pool.sort((a, b) => {
      // Relevance level weighting: high > medium > low
      const relScore = (art: Article) => (art.relevance_score || 0) + (art.relevance_level === 'high' ? 30 : art.relevance_level === 'medium' ? 15 : 0);
      const scoreDiff = relScore(b) - relScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      const dateA = new Date(a.publication_date || a.captured_at || 0).getTime();
      const dateB = new Date(b.publication_date || b.captured_at || 0).getTime();
      return dateB - dateA;
    });
  };

  const sortedZim = sortPool(zimbabwePool);
  const sortedReg = sortPool(regionalPool);
  const sortedCont = sortPool(continentalPool);

  const { totalSlots, zimbabweRatio = 0.6, regionalRatio = 0.25, continentalRatio = 0.15 } = config;

  let zimTarget = Math.max(1, Math.round(totalSlots * zimbabweRatio));
  let regTarget = Math.max(1, Math.round(totalSlots * regionalRatio));
  let contTarget = Math.max(1, totalSlots - zimTarget - regTarget);

  // Take up to target for each tier
  const selectedZim = sortedZim.slice(0, zimTarget);
  const selectedReg = sortedReg.slice(0, regTarget);
  const selectedCont = sortedCont.slice(0, contTarget);

  // Calculate overflow slots if any tier had fewer items than its quota
  let remainingSlots = totalSlots - (selectedZim.length + selectedReg.length + selectedCont.length);

  // Fill remaining slots: first from Zimbabwe, then Regional, then Continental
  const unpickedZim = sortedZim.slice(selectedZim.length);
  const unpickedReg = sortedReg.slice(selectedReg.length);
  const unpickedCont = sortedCont.slice(selectedCont.length);

  while (remainingSlots > 0 && (unpickedZim.length > 0 || unpickedReg.length > 0 || unpickedCont.length > 0)) {
    if (unpickedZim.length > 0) {
      selectedZim.push(unpickedZim.shift()!);
      remainingSlots--;
    } else if (unpickedReg.length > 0) {
      selectedReg.push(unpickedReg.shift()!);
      remainingSlots--;
    } else if (unpickedCont.length > 0) {
      selectedCont.push(unpickedCont.shift()!);
      remainingSlots--;
    }
  }

  // Final ordered list: Zimbabwe first, followed by Regional, followed by Continental
  const prioritizedArticles = [...selectedZim, ...selectedReg, ...selectedCont];

  return {
    prioritizedArticles,
    tierCounts: {
      zimbabwe: selectedZim.length,
      regional: selectedReg.length,
      continental: selectedCont.length
    },
    zimbabweArticles: selectedZim,
    regionalArticles: selectedReg,
    continentalArticles: selectedCont
  };
}
