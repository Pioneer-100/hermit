import crypto from 'crypto';
import { Article } from '@/types';

/**
 * Normalizes a headline or article text to enable deterministic hash generation.
 * Strips punctuation, removes stop-words/whitespace, and lowercases.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an SHA-256 fingerprint for an article's core content.
 */
export function generateArticleFingerprint(headline: string, sourceLink?: string): string {
  const normalized = normalizeText(headline);
  return crypto.createHash('sha256').update(`${normalized}|${sourceLink || ''}`).digest('hex');
}

/**
 * Calculates word-level Jaccard similarity coefficient between two strings (0.0 to 1.0).
 * Used to catch syndicated stories published under slightly modified titles across portals.
 */
export function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(normalizeText(textA).split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normalizeText(textB).split(' ').filter(w => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...wordsA, ...wordsB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedArticleId?: number;
  matchedHeadline?: string;
  similarityScore: number;
}

/**
 * Checks if an incoming article is a duplicate of any existing articles in the database.
 * Matches on exact URL or high semantic Jaccard similarity (> 0.70).
 */
export function checkDuplicateArticle(
  candidateHeadline: string,
  candidateLink: string,
  existingArticles: Article[],
  similarityThreshold = 0.70
): DuplicateCheckResult {
  // 1. Exact canonical URL match
  if (candidateLink) {
    const urlMatch = existingArticles.find(
      a => a.source_link && a.source_link.trim() === candidateLink.trim()
    );
    if (urlMatch) {
      return {
        isDuplicate: true,
        matchedArticleId: urlMatch.id,
        matchedHeadline: urlMatch.headline,
        similarityScore: 1.0
      };
    }
  }

  // 2. Exact normalized headline match
  const candidateNorm = normalizeText(candidateHeadline);
  for (const article of existingArticles) {
    const existingNorm = normalizeText(article.headline);
    if (candidateNorm === existingNorm) {
      return {
        isDuplicate: true,
        matchedArticleId: article.id,
        matchedHeadline: article.headline,
        similarityScore: 1.0
      };
    }
  }

  // 3. Jaccard token similarity for syndicated press releases (e.g. Herald vs Chronicle)
  let highestSim = 0;
  let bestMatch: Article | undefined;

  for (const article of existingArticles) {
    const sim = calculateJaccardSimilarity(candidateHeadline, article.headline);
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = article;
    }
  }

  if (highestSim >= similarityThreshold && bestMatch) {
    return {
      isDuplicate: true,
      matchedArticleId: bestMatch.id,
      matchedHeadline: bestMatch.headline,
      similarityScore: Math.round(highestSim * 100) / 100
    };
  }

  return {
    isDuplicate: false,
    similarityScore: Math.round(highestSim * 100) / 100
  };
}
