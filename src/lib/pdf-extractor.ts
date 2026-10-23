import { extractText, getDocumentProxy } from 'unpdf';
import { logger } from './logger';

export interface ExtractedPdfDocument {
  text: string;
  totalPages: number;
  wordCount: number;
  extractedSuccess: boolean;
  statutoryInstrumentNumber?: string;
  tariffScheduleDetected?: boolean;
}

/**
 * Regex to detect Statutory Instrument numbers (e.g. "S.I. 119 of 2024", "SI 44/2023")
 */
const STATUTORY_INSTRUMENT_REGEX = /\b(S\.?I\.?\s*(?:No\.?)?\s*(\d+)\s*(?:of|\/)\s*(\d{4}))\b/i;

/**
 * Downloads a remote PDF document buffer and extracts text using unpdf.
 * Detects statutory instrument notices, gazetted tariffs, and regulatory orders.
 */
export async function extractPdfFromUrl(
  pdfUrl: string,
  maxPages: number = 8
): Promise<ExtractedPdfDocument> {
  if (!pdfUrl || !pdfUrl.startsWith('http')) {
    return {
      text: '',
      totalPages: 0,
      wordCount: 0,
      extractedSuccess: false
    };
  }

  try {
    const res = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HermitEnergyMonitor/2.0 (Regulatory Gazette Ingestion)',
        'Accept': 'application/pdf, */*'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      return {
        text: '',
        totalPages: 0,
        wordCount: 0,
        extractedSuccess: false
      };
    }

    const arrayBuffer = await res.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const totalPages = pdf.numPages;

    const { text } = await extractText(pdf, { mergePages: true });
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);

    // Limit to first 2,000 words for optimal LLM context bounds
    const boundedText = words.slice(0, 2000).join(' ');

    // Detect SI metadata & tariff tables
    const siMatch = cleanText.match(STATUTORY_INSTRUMENT_REGEX);
    const statutoryInstrumentNumber = siMatch ? siMatch[0].toUpperCase() : undefined;
    const tariffScheduleDetected = /\b(tariff\s+schedule|base\s+tariff|c\/kwh|cents\s+per\s+kilowatt|wheeling\s+charge|stepped\s+tariff)\b/i.test(cleanText);

    logger.info('PDF parsed successfully', {
      pdfUrl,
      totalPages,
      wordCount: words.length,
      statutoryInstrumentNumber,
      tariffScheduleDetected
    });

    return {
      text: boundedText,
      totalPages,
      wordCount: words.length,
      extractedSuccess: true,
      statutoryInstrumentNumber,
      tariffScheduleDetected
    };
  } catch (err: any) {
    logger.warn('Failed to extract PDF from URL', {
      pdfUrl,
      error: err?.message || String(err)
    });
    return {
      text: '',
      totalPages: 0,
      wordCount: 0,
      extractedSuccess: false
    };
  }
}
