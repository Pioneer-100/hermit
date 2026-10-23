/**
 * AI Semantic Relevance Gate & Exclusion Filter
 * Evaluates whether an article has genuine strategic/commercial/sustainability
 * relevance to Hermit Sustainability Advisory, or if it is irrelevance/noise/metaphor/crime
 * that must be purged before database insertion or UI display.
 */

export interface SemanticGateResult {
  isFitToDisplay: boolean;
  rejectionCategory?: 'violent_crime' | 'political_metaphor' | 'celebrity_gossip' | 'sports' | 'general_noise';
  reason?: string;
}

// Obvious noise patterns that should never enter the sustainability & energy intelligence platform
const HARD_EXCLUSION_PATTERNS: Array<{ regex: RegExp; category: SemanticGateResult['rejectionCategory']; reason: string }> = [
  // Domestic violence, assault, murder, court trials unrelated to corporate energy/fraud
  {
    regex: /\b(struck\s+wife|poured\s+boiling\s+water|stabbed|murdered|manslaughter|saucepan|domestic\s+violence|homicide|rape|assaulted\s+his\s+wife|pleaded\s+guilty\s+to\s+attempted\s+murder)\b/i,
    category: 'violent_crime',
    reason: 'Violent crime / domestic incident unrelated to corporate energy or sustainability'
  },
  // Political figures / factional party infighting without power utility/policy implications
  {
    regex: /\b(pours?\s+cold\s+water\s+on|recall\s+of\s+coltart|citizens\s+coalition\s+for\s+change|ccc\s+faction|disowned\s+correspondence|parliament\s+recalls?)\b/i,
    category: 'political_metaphor',
    reason: 'Political metaphor or party factional dispute without energy/sustainability relevance'
  },
  // Sports, football, entertainment
  {
    regex: /\b(premier\s+league|champions\s+league|afcon|fifa|dynamos\s+fc|highlanders\s+fc|match\s+preview|hollywood|music\s+awards)\b/i,
    category: 'sports',
    reason: 'Sports or entertainment news'
  }
];

/**
 * Validates whether an article passes semantic quality control.
 * Checks both rule-based exclusions and AI relevance evaluations.
 */
export function evaluateSemanticFitness(
  headline: string,
  summary: string,
  relevanceToHermit?: string,
  relevanceScore?: number
): SemanticGateResult {
  const combined = `${headline} ${summary}`.toLowerCase();

  // 1. Check hard exclusion rules
  for (const rule of HARD_EXCLUSION_PATTERNS) {
    if (rule.regex.test(combined)) {
      return {
        isFitToDisplay: false,
        rejectionCategory: rule.category,
        reason: rule.reason
      };
    }
  }

  // 2. Evaluate AI analysis verdict: If Gemini explicitly says "no relevance" or "not relevant"
  if (relevanceToHermit) {
    const relLower = relevanceToHermit.toLowerCase();
    if (
      relLower.includes('no direct relevance') ||
      relLower.includes('no relevance') ||
      relLower.includes('not relevant to hermit') ||
      relLower.includes('irrelevant to hermit') ||
      relLower.includes('criminal matter') ||
      relLower.includes('does not impact energy')
    ) {
      return {
        isFitToDisplay: false,
        rejectionCategory: 'general_noise',
        reason: 'AI semantic analysis deduced zero relevance to Hermit Sustainability Advisory'
      };
    }
  }

  // 3. Score-based gating: If relevance score is below 0.35, discard as noise
  if (typeof relevanceScore === 'number' && relevanceScore < 0.35) {
    return {
      isFitToDisplay: false,
      rejectionCategory: 'general_noise',
      reason: `Relevance score (${relevanceScore}) is below minimum display threshold (0.35)`
    };
  }

  return {
    isFitToDisplay: true
  };
}
