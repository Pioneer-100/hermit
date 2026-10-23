import { NextRequest, NextResponse } from 'next/server';
import { fetchReports } from '@/lib/supabase';
import { generateReportPdfBuffer } from '@/lib/pdfGenerator';
import { INITIAL_REPORTS } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    let reports = await fetchReports();
    if (!reports || reports.length === 0) {
      reports = INITIAL_REPORTS;
    }

    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const pdfBuffer = generateReportPdfBuffer(report);
    const cleanDate = new Date(report.generated_at).toISOString().split('T')[0];
    const filename = `Hermit_${report.report_type.toUpperCase()}_Report_${cleanDate}_#${report.id}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating report PDF API:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
