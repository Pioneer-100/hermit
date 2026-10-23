/**
 * Deep Article Extractor
 * Attempts to fetch and extract clean article body text from target URLs,
 * discarding boilerplate, navigation menus, ads, and scripts.
 * Provides Gemini with rich context (1,000+ words) instead of RSS snippets.
 */

export interface ExtractedArticleContent {
  fullText: string;
  wordCount: number;
  extractedSuccess: boolean;
  byline?: string;
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
 * Implements a strict 6-second timeout and polite browser headers.
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

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 HermitEnergyMonitor/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(6000),
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

    // If extracted text is reasonably long (> 100 words), extract paragraphs
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
  } catch (err) {
    // Gracefully fallback on timeout or network block
  }

  return {
    fullText: fallbackText,
    wordCount: fallbackText.split(/\s+/).length,
    extractedSuccess: false
  };
}
