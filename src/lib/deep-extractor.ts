/**
 * Deep Article Extractor
 * Attempts to fetch and extract clean article body text from target URLs,
 * discarding boilerplate, navigation menus, ads, and scripts.
 * Provides Gemini with rich context (1,000+ words) instead of RSS snippets.
 */

import { extractPdfFromUrl } from './pdf-extractor';
import { BROWSER_HEADERS } from './direct-portal-scraper';

export interface ExtractedArticleContent {
  fullText: string;
  wordCount: number;
  extractedSuccess: boolean;
  byline?: string;
  isPdfDocument?: boolean;
  statutoryInstrumentNumber?: string;
  tariffScheduleDetected?: boolean;
}

/**
 * Strips script tags, style tags, comments, and boilerplate HTML
 */
function cleanHtmlToText(html: string): string {
  return html
    // Remove scripts, styles, iframes, SVGs, noscripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Convert paragraph and breaks to newlines
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean redundant spaces
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Fetches an article's web page and extracts the core textual body.
 * Implements a strict 4.5-second timeout and realistic desktop browser headers.
 */
export async function extractDeepArticleText(
  url: string,
  fallbackText: string = ''
): Promise<ExtractedArticleContent> {
  // If invalid or placeholder link, return fallback immediately
  if (!url || !url.startsWith('http') || url.includes('hermitinvestments.com/feed')) {
    return {
      fullText: fallbackText,
      wordCount: fallbackText.split(/\s+/).length,
      extractedSuccess: false
    };
  }

  // If the link directly points to a PDF gazette or document
  if (url.toLowerCase().endsWith('.pdf') || url.includes('/pdf/') || url.includes('type=pdf')) {
    const pdfDoc = await extractPdfFromUrl(url);
    if (pdfDoc.extractedSuccess && pdfDoc.text.length > 50) {
      return {
        fullText: pdfDoc.text,
        wordCount: pdfDoc.wordCount,
        extractedSuccess: true,
        isPdfDocument: true,
        statutoryInstrumentNumber: pdfDoc.statutoryInstrumentNumber,
        tariffScheduleDetected: pdfDoc.tariffScheduleDetected
      };
    }
  }

  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(4500),
      redirect: 'follow'
    });

    if (!res.ok) {
      return {
        fullText: fallbackText,
        wordCount: fallbackText.split(/\s+/).length,
        extractedSuccess: false
      };
    }

    const html = await res.text();
    const text = cleanHtmlToText(html);

    // If extracted text is reasonably long (> 80 words), extract paragraphs
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 80) {
      // Limit to first ~1,200 words to keep Gemini tokens well within optimal cost bounds
      const boundedText = words.slice(0, 1200).join(' ');
      return {
        fullText: boundedText,
        wordCount: Math.min(words.length, 1200),
        extractedSuccess: true
      };
    }
  } catch {
    // Gracefully fallback on timeout or network block
  }

  return {
    fullText: fallbackText,
    wordCount: fallbackText.split(/\s+/).length,
    extractedSuccess: false
  };
}

/**
 * Concurrently extracts deep article text across multiple items with a safety timeout
 */
export async function extractDeepArticlesBatch(
  items: Array<{ link: string; summary: string }>
): Promise<ExtractedArticleContent[]> {
  const promises = items.map(item => extractDeepArticleText(item.link, item.summary));
  const settled = await Promise.allSettled(promises);

  return settled.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      fullText: items[idx].summary,
      wordCount: items[idx].summary.split(/\s+/).length,
      extractedSuccess: false
    };
  });
}
