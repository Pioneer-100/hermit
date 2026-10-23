/**
 * Publication Date Validation & Freshness Engine
 * Prevents obsolete articles (e.g. from 2023 or years ago) from being ingested as current updates.
 */

export interface FreshnessCheckResult {
  isFresh: boolean;
  parsedDate: string;
  ageDays: number;
  reason?: string;
}

/**
 * Validates whether an article's publication date falls within acceptable freshness bounds.
 * Default maximum age: 30 days.
 * Rejects articles published in previous years unless explicitly flagged.
 */
export function validateArticleFreshness(
  rawDateString?: string,
  maxAgeDays: number = 30
): FreshnessCheckResult {
  const now = new Date();
  
  if (!rawDateString) {
    // If no date was supplied, stamp with current time
    return {
      isFresh: true,
      parsedDate: now.toISOString(),
      ageDays: 0
    };
  }

  const parsed = new Date(rawDateString);
  if (isNaN(parsed.getTime())) {
    // Unparseable date format, default to fresh current timestamp
    return {
      isFresh: true,
      parsedDate: now.toISOString(),
      ageDays: 0
    };
  }

  // Calculate age in days
  const ageMs = now.getTime() - parsed.getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  // Reject future dates that are more than 1 day in the future (skew guard)
  if (ageDays < -1) {
    return {
      isFresh: false,
      parsedDate: parsed.toISOString(),
      ageDays,
      reason: `Future publication date detected (${parsed.toISOString()})`
    };
  }

  // Reject outdated articles (older than maxAgeDays, e.g. 2023 articles)
  if (ageDays > maxAgeDays) {
    return {
      isFresh: false,
      parsedDate: parsed.toISOString(),
      ageDays,
      reason: `Article is outdated: published ${ageDays} days ago (${parsed.toISOString().slice(0, 10)}). Maximum threshold is ${maxAgeDays} days.`
    };
  }

  return {
    isFresh: true,
    parsedDate: parsed.toISOString(),
    ageDays
  };
}
