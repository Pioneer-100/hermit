import { jsPDF } from 'jspdf';
import { Report, DailyBrief } from '@/types';

// Palette definitions matching Hermit Investments brand
const BRAND = {
  emeraldDark: [6, 78, 59] as [number, number, number],       // #064e3b
  emeraldPrimary: [5, 150, 105] as [number, number, number],  // #059669
  emeraldLight: [16, 185, 129] as [number, number, number],   // #10b981
  emeraldTint: [240, 253, 244] as [number, number, number],   // #f0fdf4
  emeraldBorder: [167, 243, 208] as [number, number, number], // #a7f3d0
  slateDark: [15, 23, 42] as [number, number, number],        // #0f172a
  slateBody: [51, 65, 85] as [number, number, number],        // #334155
  slateMuted: [100, 116, 139] as [number, number, number],    // #64748b
  slateBg: [248, 250, 252] as [number, number, number],       // #f8fafc
  white: [255, 255, 255] as [number, number, number],
  amberBadge: [217, 119, 6] as [number, number, number],      // #d97706
  amberTint: [254, 243, 199] as [number, number, number],     // #fef3c7
  roseBadge: [225, 29, 72] as [number, number, number],       // #e11d48
  roseTint: [255, 228, 230] as [number, number, number],      // #ffe4e6
};

class PdfBuilder {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  currentY: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 40;
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.currentY = this.margin;
  }

  checkPageBreak(neededHeight: number) {
    if (this.currentY + neededHeight > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 45;
      this.drawRunningHeader();
    }
  }

  drawRunningHeader() {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    this.doc.setTextColor(...BRAND.slateMuted);
    this.doc.text('HERMIT INVESTMENTS  |  ENERGY SECTOR INTELLIGENCE MEMO', this.margin, 30);
    this.doc.setDrawColor(...BRAND.emeraldBorder);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 34, this.pageWidth - this.margin, 34);
  }

  drawDocumentCoverHeader(badgeText: string, titleText: string, metaItems: string[]) {
    // Top primary emerald accent strip
    this.doc.setFillColor(...BRAND.emeraldDark);
    this.doc.rect(0, 0, this.pageWidth, 10, 'F');

    this.currentY = 28;

    // Hermit brand header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(...BRAND.emeraldDark);
    this.doc.text('HERMIT INVESTMENTS', this.margin, this.currentY);

    // Kicker / Tagline
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...BRAND.emeraldPrimary);
    this.doc.text('CLEAN ENERGY SECTOR SURVEILLANCE & STRATEGIC MONITOR', this.margin + 190, this.currentY - 1);

    // Classification pill on top right
    const classText = 'STRICTLY CONFIDENTIAL';
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    const pillW = this.doc.getTextWidth(classText) + 14;
    const pillH = 15;
    const pillX = this.pageWidth - this.margin - pillW;
    const pillY = this.currentY - 11;
    this.doc.setFillColor(...BRAND.emeraldTint);
    this.doc.setDrawColor(...BRAND.emeraldPrimary);
    this.doc.setLineWidth(0.75);
    this.doc.roundedRect(pillX, pillY, pillW, pillH, 3, 3, 'FD');
    this.doc.setTextColor(...BRAND.emeraldDark);
    this.doc.text(classText, pillX + 7, pillY + 10.5);

    this.currentY += 10;
    this.doc.setDrawColor(...BRAND.emeraldBorder);
    this.doc.setLineWidth(0.75);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);

    this.currentY += 18;

    // Report Type Badge
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    const bW = this.doc.getTextWidth(badgeText.toUpperCase()) + 14;
    const bH = 16;
    this.doc.setFillColor(...BRAND.emeraldPrimary);
    this.doc.roundedRect(this.margin, this.currentY, bW, bH, 3, 3, 'F');
    this.doc.setTextColor(...BRAND.white);
    this.doc.text(badgeText.toUpperCase(), this.margin + 7, this.currentY + 11.5);

    this.currentY += bH + 12;

    // Main Report Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(15);
    this.doc.setTextColor(...BRAND.slateDark);
    const titleLines = this.doc.splitTextToSize(titleText, this.contentWidth);
    this.doc.text(titleLines, this.margin, this.currentY);
    this.currentY += titleLines.length * 19 + 6;

    // Metadata bar container
    const metaBoxY = this.currentY;
    const metaBoxH = 22;
    this.doc.setFillColor(...BRAND.slateBg);
    this.doc.setDrawColor(...BRAND.emeraldBorder);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, metaBoxY, this.contentWidth, metaBoxH, 4, 4, 'FD');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...BRAND.slateBody);

    let curMetaX = this.margin + 10;
    metaItems.forEach((item, idx) => {
      this.doc.text(item, curMetaX, metaBoxY + 14);
      curMetaX += this.doc.getTextWidth(item);
      if (idx < metaItems.length - 1) {
        this.doc.setTextColor(...BRAND.slateMuted);
        this.doc.text('  |  ', curMetaX, metaBoxY + 14);
        curMetaX += this.doc.getTextWidth('  |  ');
        this.doc.setTextColor(...BRAND.slateBody);
      }
    });

    this.currentY = metaBoxY + metaBoxH + 20;
  }

  drawSectionHeader(title: string) {
    this.checkPageBreak(35);
    // Left decorative bar
    this.doc.setFillColor(...BRAND.emeraldPrimary);
    this.doc.rect(this.margin, this.currentY, 4, 14, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(...BRAND.emeraldDark);
    this.doc.text(title.toUpperCase(), this.margin + 10, this.currentY + 11);

    this.currentY += 18;
    this.doc.setDrawColor(...BRAND.emeraldBorder);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 12;
  }

  drawParagraph(text: string, fontSize = 9.5, isItalic = false) {
    this.doc.setFont('helvetica', isItalic ? 'italic' : 'normal');
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...BRAND.slateBody);

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const lineHeight = fontSize * 1.45;
    this.checkPageBreak(lines.length * lineHeight + 8);

    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * lineHeight + 10;
  }

  drawCalloutBox(title: string, text: string, type: 'action' | 'note' = 'note') {
    const isAction = type === 'action';
    const bgCol = isAction ? BRAND.emeraldTint : BRAND.slateBg;
    const borderCol = isAction ? BRAND.emeraldPrimary : BRAND.emeraldBorder;
    const titleCol = isAction ? BRAND.emeraldDark : BRAND.slateDark;

    const pad = 12;
    const innerW = this.contentWidth - pad * 2;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    const bodyLines = this.doc.splitTextToSize(text, innerW);
    const boxH = 26 + bodyLines.length * 13.5 + pad;

    this.checkPageBreak(boxH + 10);

    const boxY = this.currentY;

    // Card background & soft border
    this.doc.setFillColor(...bgCol);
    this.doc.setDrawColor(...borderCol);
    this.doc.setLineWidth(0.75);
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxH, 4, 4, 'FD');

    // Left thick accent stripe
    this.doc.setFillColor(...(isAction ? BRAND.emeraldPrimary : BRAND.emeraldDark));
    this.doc.roundedRect(this.margin, boxY, 4.5, boxH, 2, 2, 'F');

    // Box Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...titleCol);
    this.doc.text(title.toUpperCase(), this.margin + pad + 2, boxY + 16);

    // Box Body
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...BRAND.slateDark);
    this.doc.text(bodyLines, this.margin + pad + 2, boxY + 30);

    this.currentY = boxY + boxH + 14;
  }

  drawBulletItem(text: string) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...BRAND.slateBody);

    const bulletIndent = 16;
    const lines = this.doc.splitTextToSize(text, this.contentWidth - bulletIndent);
    const blockHeight = lines.length * 13.5 + 4;
    this.checkPageBreak(blockHeight);

    // Bullet square icon
    this.doc.setFillColor(...BRAND.emeraldPrimary);
    this.doc.rect(this.margin + 4, this.currentY + 2.5, 5, 5, 'F');

    this.doc.text(lines, this.margin + bulletIndent, this.currentY + 7);
    this.currentY += blockHeight + 3;
  }

  finalizeFooters() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 24;

      this.doc.setDrawColor(...BRAND.emeraldBorder);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, footerY - 8, this.pageWidth - this.margin, footerY - 8);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(...BRAND.slateMuted);
      this.doc.text(
        'Hermit Investments (Pvt) Ltd  •  Confidential Strategic Report  •  ToR Section 4 Compliant',
        this.margin,
        footerY + 4
      );

      const pageText = `Page ${i} of ${totalPages}`;
      const pageW = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageW, footerY + 4);
    }
  }

  save(fileName: string) {
    this.finalizeFooters();
    this.doc.save(fileName);
  }

  outputBuffer(): Uint8Array {
    this.finalizeFooters();
    return new Uint8Array(this.doc.output('arraybuffer'));
  }
}

export function createReportPdfBuilder(report: Report): PdfBuilder {
  const builder = new PdfBuilder();

  const reportTypeLabels: Record<string, string> = {
    daily: 'Daily Intelligence Digest',
    weekly: 'Weekly Strategic Energy Briefing',
    monthly: 'Monthly Market & Policy Review',
    special: 'Special Executive Memorandum',
  };

  const badge = reportTypeLabels[report.report_type] || 'Executive Briefing';
  const genDate = new Date(report.generated_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const metaItems = [
    `Generated: ${genDate}`,
    `Captures: ${report.article_count} items evaluated`,
    `Ref ID: #HR-${report.id.toString().padStart(4, '0')}`,
  ];

  if (report.period_start && report.period_end) {
    const pStart = new Date(report.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const pEnd = new Date(report.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    metaItems.push(`Coverage: ${pStart} - ${pEnd}`);
  }

  // Cover header
  builder.drawDocumentCoverHeader(badge, report.title, metaItems);

  // Executive Overview
  if (report.summary) {
    builder.drawSectionHeader('1. Executive Overview & Sector Synthesis');
    builder.drawParagraph(report.summary, 9.5);
  }

  // Priority Highlights
  if (report.content?.highlights && report.content.highlights.length > 0) {
    builder.drawSectionHeader('2. Priority Highlights & Regulatory Shifts');
    report.content.highlights.forEach((highlight) => {
      builder.drawBulletItem(highlight);
    });
    builder.currentY += 8;
  }

  // Category Breakdown Table
  if (report.content?.category_breakdown && Object.keys(report.content.category_breakdown).length > 0) {
    builder.drawSectionHeader('3. Source & Channel Distribution');
    const categories = Object.entries(report.content.category_breakdown);
    const colW = builder.contentWidth / Math.min(categories.length, 5);
    const boxH = 34;

    builder.checkPageBreak(boxH + 15);
    const startY = builder.currentY;

    categories.forEach(([cat, count], idx) => {
      const colX = builder.margin + idx * colW;
      builder.doc.setFillColor(...BRAND.slateBg);
      builder.doc.setDrawColor(...BRAND.emeraldBorder);
      builder.doc.setLineWidth(0.5);
      builder.doc.roundedRect(colX, startY, colW - 6, boxH, 3, 3, 'FD');

      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(12);
      builder.doc.setTextColor(...BRAND.emeraldDark);
      builder.doc.text(String(count), colX + 8, startY + 16);

      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setFontSize(7.5);
      builder.doc.setTextColor(...BRAND.slateBody);
      const label = cat.replace('_', ' ').toUpperCase();
      builder.doc.text(label, colX + 8, startY + 27);
    });

    builder.currentY = startY + boxH + 18;
  }

  // Strategic Executive Action
  if (report.content?.executive_takeaway) {
    builder.drawSectionHeader('4. Recommended Management Actions');
    builder.drawCalloutBox(
      'Strategic Directive for Hermit Leadership',
      report.content.executive_takeaway,
      'action'
    );
  }

  // Document Sign-Off Box
  builder.checkPageBreak(40);
  builder.doc.setFont('helvetica', 'italic');
  builder.doc.setFontSize(8);
  builder.doc.setTextColor(...BRAND.slateMuted);
  builder.doc.text(
    'This executive briefing is compiled autonomously via Hermit Investments Energy Intelligence Suite and verified for distribution to Executive Committee members.',
    builder.margin,
    builder.currentY
  );

  return builder;
}

/**
 * Generates and triggers browser download of PDF for any Executive Report
 */
export function generateReportPdf(report: Report): void {
  const builder = createReportPdfBuilder(report);
  const cleanDate = new Date(report.generated_at).toISOString().split('T')[0];
  const filename = `Hermit_${report.report_type.toUpperCase()}_Report_${cleanDate}_#${report.id}.pdf`;
  builder.save(filename);
}

/**
 * Returns raw Uint8Array PDF buffer for server-side API responses
 */
export function generateReportPdfBuffer(report: Report): Uint8Array {
  const builder = createReportPdfBuilder(report);
  return builder.outputBuffer();
}

export function createDailyBriefPdfBuilder(brief: DailyBrief): PdfBuilder {
  const builder = new PdfBuilder();

  const metaItems = [
    `Date: ${brief.date}`,
    `Sentiment: ${brief.market_sentiment.toUpperCase()}`,
    `Risk Index: ${brief.risk_index}/100 (${brief.risk_label})`,
    `Sources Scanned: ${brief.total_articles_scanned}`,
  ];

  builder.drawDocumentCoverHeader(
    "Today's Executive Intelligence Brief",
    brief.headline,
    metaItems
  );

  // Executive Overview
  builder.drawSectionHeader('1. Executive Situation Assessment');
  builder.drawParagraph(brief.executive_summary, 9.5);

  // Strategic Pillars
  if (brief.strategic_pillars && brief.strategic_pillars.length > 0) {
    builder.drawSectionHeader('2. Strategic Intelligence Pillars');
    brief.strategic_pillars.forEach((pillar) => {
      builder.checkPageBreak(50);
      const pTitle = `${pillar.title}  [${pillar.badge}]`;
      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(9.5);
      builder.doc.setTextColor(...BRAND.emeraldDark);
      builder.doc.text(pTitle, builder.margin, builder.currentY);
      builder.currentY += 12;

      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setFontSize(8.5);
      builder.doc.setTextColor(...BRAND.slateBody);
      const impactText = `Impact: ${pillar.impact} — Takeaway: ${pillar.takeaway}`;
      const lines = builder.doc.splitTextToSize(impactText, builder.contentWidth);
      builder.doc.text(lines, builder.margin, builder.currentY);
      builder.currentY += lines.length * 12 + 8;
    });
  }

  // Management Action Items
  if (brief.management_actions && brief.management_actions.length > 0) {
    builder.drawSectionHeader('3. Executive Directives & Action Owners');
    brief.management_actions.forEach((act) => {
      const priorityLabel = act.priority.toUpperCase();
      const text = `[${priorityLabel} - Owner: ${act.owner}] ${act.action}`;
      builder.drawBulletItem(text);
    });
    builder.currentY += 8;
  }

  // Active Stakeholders
  if (brief.key_stakeholders_active && brief.key_stakeholders_active.length > 0) {
    builder.drawSectionHeader('4. Monitored Key Stakeholders');
    const stakeText = brief.key_stakeholders_active
      .map((s) => `${s.name} (${s.role} • Stance: ${s.stance.toUpperCase()} • ${s.mentions} quotes)`)
      .join('  |  ');
    builder.drawParagraph(stakeText, 8.5, true);
  }

  return builder;
}

/**
 * Generates and triggers browser download of PDF for the Daily Executive Brief
 */
export function generateDailyBriefPdf(brief: DailyBrief): void {
  const builder = createDailyBriefPdfBuilder(brief);
  const cleanDate = brief.date.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Hermit_Daily_Briefing_${cleanDate}.pdf`;
  builder.save(filename);
}

/**
 * Returns raw Uint8Array PDF buffer of DailyBrief for server-side responses
 */
export function generateDailyBriefPdfBuffer(brief: DailyBrief): Uint8Array {
  const builder = createDailyBriefPdfBuilder(brief);
  return builder.outputBuffer();
}
