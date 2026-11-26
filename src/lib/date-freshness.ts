/**
 * Publication Date Validation & Freshness Engine
 * Prevents obsolete articles (e.g. from 2023, 2024, or months ago) from being ingested as current updates.
 *
 * Supports ground-truth timestamp extraction from LinkedIn Snowflake activity IDs,
 * relative search dates ("3 weeks ago", "2 months ago"), snippet dates, and configurable
 * age thresholds for daily news vs. funding calls/tenders.
 */

export interface FreshnessCheckResult {
  isFresh: boolean;
  parsedDate: string;
  ageDays: number;
  reason?: string;
}

/**
 * Decodes the exact publication timestamp embedded in LinkedIn activity IDs.
 * LinkedIn post URLs embed a 64-bit Snowflake ID where the first 41-42 bits
 * represent milliseconds since Unix epoch (id >> 22n).
 *
 * Examples supported:
 *   - https://www.linkedin.com/posts/org_slug-activity-7293719696401420288-J0nF
 *   - https://www.linkedin.com/feed/update/urn:li:activity:7283037816232534016/
 *   - https://www.linkedin.com/feed/update/urn:li:share:7283037816232534016
 */
export function extractDateFromLinkedInUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // Match 18-20 digit Snowflake ID following activity, share, or trailing hyphen
  const match =
    url.match(/(?:activity|urn:li:activity|urn:li:share)[-_:]+(\d{18,20})/i) ||
    url.match(/[-_](\d{18,20})(?:-[a-zA-Z0-9_-]+)?(?:\?|\/|$)/);

  if (match) {
    try {
      const id = BigInt(match[1]);
      const ms = Number(id >> BigInt(22));
      // Guard: timestamp must be between year 2020 (1577836800000) and now + 2 days (clock skew)
      const nowMs = Date.now();
      if (ms > 1577836800000 && ms < nowMs + 86400000 * 2) {
        return new Date(ms).toISOString();
      }
    } catch {
      // Ignore BigInt conversion errors
    }
  }

  return undefined;
}

/**
 * Parses dates returned by Google News and Google Web search engines (e.g. via SerpApi).
 * Handles relative strings like "4 hours ago", "3 days ago", "2 weeks ago", "9 months ago",
 * "a month ago", "yesterday", and standard ISO / UTC strings.
 */
export function parseSearchResultDate(date?: string): string | undefined {
  if (!date) return undefined;

  const trimmed = date.trim();

  // "X minutes/hours/days/weeks/months/years ago"
  const relativeMatch = trimmed.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/i);
  if (relativeMatch) {
    const amount = Number(relativeMatch[1]);
    const unit = relativeMatch[2].toLowerCase();
    const msMap: Record<string, number> = {
      minute: 60_000,
      hour:   3_600_000,
      day:    86_400_000,
      week:   7 * 86_400_000,
      month:  30 * 86_400_000,
      year:   365 * 86_400_000,
    };
    return new Date(Date.now() - amount * (msMap[unit] ?? 86_400_000)).toISOString();
  }

  // "a week ago", "a month ago", "a year ago"
  const singularMatch = trimmed.match(/^a\s+(minute|hour|day|week|month|year)\s+ago$/i);
  if (singularMatch) {
    const unit = singularMatch[1].toLowerCase();
    const msMap: Record<string, number> = {
      minute: 60_000,
      hour:   3_600_000,
      day:    86_400_000,
      week:   7 * 86_400_000,
      month:  30 * 86_400_000,
      year:   365 * 86_400_000,
    };
    return new Date(Date.now() - (msMap[unit] ?? 86_400_000)).toISOString();
  }

  if (/^yesterday$/i.test(trimmed)) {
    return new Date(Date.now() - 86_400_000).toISOString();
  }

  const parsedDate = new Date(trimmed);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
}

/**
 * Extracts a publication date prefix from snippet text if Google prefixed the snippet
 * with a date like "Feb 12, 2026 — ..." or "12 Feb 2026 — ...".
 */
export function extractDateFromSnippetText(snippet?: string): string | undefined {
  if (!snippet) return undefined;

  // "MMM DD, YYYY —" or "DD MMM YYYY —"
  const datePrefixMatch = snippet.match(
    /^([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\s*(?:—|-|\.\.\.)/
  );
  if (datePrefixMatch) {
    const parsed = new Date(datePrefixMatch[1]);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Relative prefix: "3 days ago — ..."
  const relMatch = snippet.match(
    /^(\d+\s+(?:minute|hour|day|week|month|year)s?\s+ago)\s*(?:—|-|\.\.\.)/i
  );
  if (relMatch) {
    return parseSearchResultDate(relMatch[1]);
  }

  return undefined;
}

/**
 * Comprehensive publication date resolver.
 * Evaluates sources in order of reliability:
 *   1. LinkedIn Snowflake ID (exact millisecond ground truth from URL)
 *   2. SerpApi / Google search result date field
 *   3. Snippet text date prefix
 */
export function resolvePublicationDate(options: {
  date?: string;
  link?: string;
  snippet?: string;
  headline?: string;
}): string | undefined {
  // 1. If it's a LinkedIn URL, decode Snowflake ID first
  if (options.link && options.link.toLowerCase().includes('linkedin.com')) {
    const linkedInDate = extractDateFromLinkedInUrl(options.link);
    if (linkedInDate) return linkedInDate;
  }

  // 2. Parse explicit date returned by search engine
  if (options.date) {
    const parsedSearchDate = parseSearchResultDate(options.date);
    if (parsedSearchDate) return parsedSearchDate;
  }

  // 3. Fallback to snippet prefix
  if (options.snippet) {
    const snippetDate = extractDateFromSnippetText(options.snippet);
    if (snippetDate) return snippetDate;
  }

  return undefined;
}

/**
 * Validates whether an article's publication date falls within acceptable freshness bounds.
 *
 * @param rawDateString - The ISO date string or date to evaluate
 * @param maxAgeDays - Maximum allowable age in days (e.g. 2 for daily news, 30 for funding calls)
 * @param requireDate - If true and no date is available, article is rejected as unverified
 */
export function validateArticleFreshness(
  rawDateString?: string,
  maxAgeDays: number = 2,
  requireDate: boolean = false
): FreshnessCheckResult {
  const now = new Date();

  if (!rawDateString) {
    if (requireDate) {
      return {
        isFresh: false,
        parsedDate: now.toISOString(),
        ageDays: 9999,
        reason: 'Publication date could not be verified from LinkedIn post or web source.'
      };
    }

    // For standard RSS feeds crawled live without explicit pubDate, stamp with current time
    return {
      isFresh: true,
      parsedDate: now.toISOString(),
      ageDays: 0
    };
  }

  const parsed = new Date(rawDateString);
  if (isNaN(parsed.getTime())) {
    if (requireDate) {
      return {
        isFresh: false,
        parsedDate: now.toISOString(),
        ageDays: 9999,
        reason: `Unparseable publication date format: "${rawDateString}"`
      };
    }
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

  // Reject outdated articles (older than maxAgeDays, e.g. 2023/2024/2025 articles)
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
