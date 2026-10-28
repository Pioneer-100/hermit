/**
 * Disambiguation Engine for Zimbabwe Energy Surveillance
 * Distinguishes true commercial, technical, and regulatory energy developments
 * from political metaphors (e.g. "political power", "struggle for power")
 * or non-energy industrial items.
 */

// Core Zimbabwe energy entities and regulatory bodies
const ENERGY_STRONG_ENTITIES = [
  'zesa', 'zetdc', 'zpc', 'zera', 'sapp', 'reaz', 'southern african power pool',
  'kariba', 'hwange', 'munyati', 'bulawayo power station', 'harare power station',
  'batoka', 'zambezi river authority', 'zra', 'ministry of energy', 'power purchase agreement',
  'ppa', 'independent power producer', 'ipp', 'ippaz', 'wheeling', 'bess', 'net metering',
  'feed-in tariff', 'refit', 'photovoltaic', 'solar park', 'solar plant', 'mini-grid',
  'concession', 'transmission line', 'step-up transformer', 'substation', 'inverter'
];

// Commercial / energy generation metric units
const ENERGY_TECHNICAL_METRICS = [
  /\b\d+(\.\d+)?\s*(mw|megawatt|gigawatt|gw|kwh|mwh|kv|kilovolt)\b/i,
  /\b(cents\/kwh|tariff|tariffs|off-take|offtaker)\b/i,
  /\b(load-shedding|loadshedding|blackout|grid stability|peaking power)\b/i
];

// Contextual keywords related to renewable energy and sector financing

// Section 4.4, 4.7 & 5 of SoW: Events, Workshops, RFPs, EOIs and Funding Calls
const EVENT_AND_FUNDING_TERMS = [
  'call for proposals', 'request for proposals', 'rfp', 'expression of interest', 'eoi',
  'tender', 'procurement', 'funding window', 'grant application', 'concessional finance',
  'blended finance', 'conference', 'workshop', 'symposium', 'expo', 'forum', 'webinar',
  'stakeholder consultation', 'energy summit', 'power forum', 'climate finance',
  'project preparation facility', 'technical assistance'
];

const ENERGY_CONTEXTUAL_TERMS = [
  'solar', 'hydropower', 'hydroelectric', 'hydro-power', 'wind energy', 'biomass',
  'renewable energy', 'clean energy', 'battery storage', 'lithium battery',
  'electricity supply', 'power deficit', 'generation capacity', 'energy transition',
  'power crisis', 'power utility', 'energy fund', 'power generation',
  'circular economy', 'waste-to-energy', 'waste to energy', 'biogas',
  'anaerobic digestion', 'food-water-energy', 'solar irrigation',
  'food-water-energy nexus', 'water-energy nexus', 'e-waste',
  'electronic waste', 'resource recovery', 'climate finance',
  'clean energy finance', 'renewable energy funding'
];

// High-frequency political metaphor phrases that cause false positives
const POLITICAL_METAPHOR_EXCLUSIONS = [
  /powers+struggle/i,
  /powers+tussle/i,
  /politicals+power/i,
  /grabs+power/i,
  /clingings+tos+power/i,
  /ins+power/i,
  /powers+sharing/i,
  /balances+ofs+power/i,
  /powers+play/i,
  /corridorss+ofs+power/i,
  /elections+power/i,
  /presidentials+power/i,
  /pours?s+colds+waters+on/i,
  /holds+water/i,
  /troubleds+waters/i,
  /breads+ands+water/i,
  /waters+unders+thes+bridge/i,
  /ins+hots+water/i,
  /poureds+boilings+water/i,
  /domestics+violence/i,
  /attempteds+murder/i,
  /saucepan/i,
  /stabbed/i
];

export interface EnergyValidationResult {
  isRelevant: boolean;
  confidence: number;
  matchedEntities: string[];
  matchedMetrics: string[];
  isPoliticalMetaphor: boolean;
  rejectionReason?: string;
}

/**
 * Validates whether text is genuinely related to the energy sector
 * and not a false positive or political metaphor.
 */
export function validateEnergyRelevance(headline: string, summary?: string): EnergyValidationResult {
  const combined = `${headline} ${summary || ''}`.toLowerCase();

  // 1. Check for political false-positive phrases
  for (const regex of POLITICAL_METAPHOR_EXCLUSIONS) {
    if (regex.test(combined)) {
      // If a strong entity is also explicitly present (e.g. ZESA or MW), it may still be valid
      const hasStrongEntity = ENERGY_STRONG_ENTITIES.some(entity => combined.includes(entity));
      const hasMetric = ENERGY_TECHNICAL_METRICS.some(rx => rx.test(combined));
      
      if (!hasStrongEntity && !hasMetric) {
        return {
          isRelevant: false,
          confidence: 0.1,
          matchedEntities: [],
          matchedMetrics: [],
          isPoliticalMetaphor: true,
          rejectionReason: `Rejected as political metaphor: matched ${regex.source}`
        };
      }
    }
  }

  const matchedEntities: string[] = [];
  const matchedMetrics: string[] = [];

  // 2. Match strong sector entities
  for (const entity of ENERGY_STRONG_ENTITIES) {
    const isMatch = entity === 'ipp'
      ? /\bipp\b/i.test(combined)
      : combined.includes(entity);
    if (isMatch) {
      matchedEntities.push(entity.toUpperCase());
    }
  }

  // 3. Match technical metric patterns (e.g. 50MW, 11kV)
  for (const rx of ENERGY_TECHNICAL_METRICS) {
    const match = combined.match(rx);
    if (match) {
      matchedMetrics.push(match[0]);
    }
  }

  // 4. Match general contextual terms
  const matchedContext = ENERGY_CONTEXTUAL_TERMS.filter(term => combined.includes(term));

  // Decision logic
  // Case A: Contains a definitive energy entity or technical metric (e.g. "ZERA", "50MW")
  if (matchedEntities.length > 0 || matchedMetrics.length > 0) {
    const confidence = Math.min(1.0, 0.7 + (matchedEntities.length * 0.1) + (matchedMetrics.length * 0.1));
    return {
      isRelevant: true,
      confidence: Math.round(confidence * 100) / 100,
      matchedEntities,
      matchedMetrics,
      isPoliticalMetaphor: false
    };
  }

  // Case B: Contains multiple contextual terms (e.g. "solar" + "clean energy")
  if (matchedContext.length >= 2) {
    return {
      isRelevant: true,
      confidence: 0.75,
      matchedEntities: matchedContext,
      matchedMetrics: [],
      isPoliticalMetaphor: false
    };
  }

  // Case C: Single contextual term in headline (e.g. "solar" or "electricity supply")
  const headlineLower = headline.toLowerCase();
  const headlineMatch = ENERGY_CONTEXTUAL_TERMS.some(term => headlineLower.includes(term));
  if (headlineMatch) {
    return {
      isRelevant: true,
      confidence: 0.65,
      matchedEntities: matchedContext,
      matchedMetrics: [],
      isPoliticalMetaphor: false
    };
  }

  return {
    isRelevant: false,
    confidence: 0.2,
    matchedEntities: [],
    matchedMetrics: [],
    isPoliticalMetaphor: false,
    rejectionReason: 'Does not contain sufficient energy sector entities or commercial indicators.'
  };
}
