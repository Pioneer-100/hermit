import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase';
import { INITIAL_DAILY_BRIEF } from '@/lib/mock-data';
import { DailyBrief } from '@/types';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';
import { generateDailyBriefPdfBuffer } from '@/lib/pdfGenerator';
import { getOrSetCache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  try {
    const brief = await getOrSetCache<DailyBrief>('hermit_daily_brief_get', 300, async () => {
      const articles = await fetchArticles();
      if (!articles || articles.length === 0) {
        return INITIAL_DAILY_BRIEF;
      }
      return synthesizeDailyBriefFromArticles(articles);
    });

    const pdfBuffer = generateDailyBriefPdfBuffer(brief || INITIAL_DAILY_BRIEF);
    const cleanDate = (brief?.date || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Hermit_Daily_Briefing_${cleanDate}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error) {
    console.error('Error generating daily brief PDF API:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
