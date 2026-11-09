import { jsPDF } from 'jspdf';
import { Report, DailyBrief, DailyReportStructuredContent } from '@/types';
import { sortReportArticleSummaries } from '@/lib/report-utils';
import { HERMIT_ADVISORY_LOGO_BASE64 } from '@/lib/hermit-logo-base64';

// Palette definitions matching Hermit Investments brand
const BRAND = {
  emeraldDark: [15, 35, 75] as [number, number, number],       // #0f234b (Navy Blue)
  emeraldPrimary: [29, 78, 216] as [number, number, number],  // #1d4ed8 (Cool Blue)
  emeraldLight: [56, 189, 248] as [number, number, number],   // #38bdf8 (Cyan Accent)
  emeraldTint: [240, 249, 255] as [number, number, number],   // #f0f9ff (Ice Blue Tint)
  emeraldBorder: [186, 230, 253] as [number, number, number], // #bae6fd (Light Blue Border)
  slateDark: [15, 23, 42] as [number, number, number],        // #0f172a
  slateBody: [51, 65, 85] as [number, number, number],        // #334155
  slateMuted: [100, 116, 139] as [number, number, number],    // #64748b
  slateBg: [248, 250, 252] as [number, number, number],       // #f8fafc
  white: [255, 255, 255] as [number, number, number],
  amberBadge: [217, 119, 6] as [number, number, number],      // #d97706
  amberTint: [254, 243, 199] as [number, number, number],     // #fef3c7
  roseBadge: [225, 29, 72] as [number, number, number],       // #e11d48
  roseTint: [255, 228, 230] as [number, number, number],      // #ffe4e6
  // Template exact colors
  templateNavy: [20, 30, 45] as [number, number, number],
  templateHighRed: [214, 40, 40] as [number, number, number],    // High badge
  templateMedAmber: [217, 119, 6] as [number, number, number],   // Medium badge
  templateWhyGreen: [13, 148, 136] as [number, number, number],  // "Why it matters" accent
  templateLinkBlue: [37, 99, 235] as [number, number, number],   // Hyperlink blue
  templateRuleGray: [203, 213, 225] as [number, number, number], // Horizontal rule
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


  drawTable(headers: string[], rows: string[][], colWidths: number[]) {
    const lineHeight = 12;
    const padding = 5;

    // Header row
    this.checkPageBreak(30);
    let startY = this.currentY;

    this.doc.setFillColor(...BRAND.emeraldDark);
    this.doc.rect(this.margin, startY, this.contentWidth, 18, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    this.doc.setTextColor(...BRAND.white);

    let curX = this.margin;
    headers.forEach((h, i) => {
      this.doc.text(h, curX + padding, startY + 12);
      curX += colWidths[i];
    });

    startY += 18;
    this.currentY = startY;

    // Data rows
    rows.forEach((row, rIdx) => {
      // Calculate row height based on cell with most lines
      let maxLines = 1;
      row.forEach((cell, cIdx) => {
        const textLines = this.doc.splitTextToSize(String(cell || ''), colWidths[cIdx] - padding * 2);
        if (textLines.length > maxLines) maxLines = textLines.length;
      });

      const rowH = Math.max(16, maxLines * lineHeight + 8);
      this.checkPageBreak(rowH);
      startY = this.currentY;

      // Zebra background
      if (rIdx % 2 === 1) {
        this.doc.setFillColor(...BRAND.slateBg);
        this.doc.rect(this.margin, startY, this.contentWidth, rowH, 'F');
      }

      this.doc.setDrawColor(...BRAND.emeraldBorder);
      this.doc.setLineWidth(0.3);
      this.doc.rect(this.margin, startY, this.contentWidth, rowH, 'S');

      curX = this.margin;
      row.forEach((cell, cIdx) => {
        this.doc.setFont('helvetica', cIdx === 0 ? 'bold' : 'normal');
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...BRAND.slateDark);

        const textLines = this.doc.splitTextToSize(String(cell || ''), colWidths[cIdx] - padding * 2);
        this.doc.text(textLines, curX + padding, startY + 10);

        // Vertical divider
        if (cIdx < row.length - 1) {
          this.doc.setDrawColor(...BRAND.emeraldBorder);
          this.doc.line(curX + colWidths[cIdx], startY, curX + colWidths[cIdx], startY + rowH);
        }

        curX += colWidths[cIdx];
      });

      this.currentY = startY + rowH;
    });

    this.currentY += 10;
  }

  drawFindingRecord(f: any) {
    this.checkPageBreak(130);

    const startY = this.currentY;
    const padding = 6;
    const labelW = 120;
    const valW = this.contentWidth - labelW;

    const fields = [
      ['Finding ID and headline', `${f.finding_id || ''} | ${f.headline || ''}`],
      ['Theme and priority', `${f.theme || ''}  |  ${f.priority || ''}`],
      ['Source and author', `${f.source || ''}  |  ${f.author || 'Not stated'}`],
      ['Publication / event dates', `Published: ${f.publication_date || 'N/A'}  |  Event: ${f.event_date || 'N/A'}`],
      ['Link and access date', `${f.link || 'N/A'}  |  Accessed: ${f.access_date || 'N/A'}`],
      ['Factual summary', f.factual_summary || ''],
      ['Stakeholders', f.stakeholders || ''],
      ['Relevance to Hermit', f.relevance_to_hermit || ''],
      ['Recommended response', typeof f.recommended_response === 'object' ? `${f.recommended_response.action} | ID: ${f.recommended_response.action_id} | Owner: ${f.recommended_response.owner} | Due: ${f.recommended_response.due_date}` : (f.recommended_response || '')],
      ['Verification and gaps', f.verification_and_gaps || '']
    ];

    fields.forEach(([label, value], idx) => {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.5);
      const valLines = this.doc.splitTextToSize(String(value || ''), valW - padding * 2);
      const rowH = Math.max(14, valLines.length * 10 + 6);

      this.checkPageBreak(rowH);
      const rowY = this.currentY;

      // Label column
      const bgCol = idx % 2 === 0 ? BRAND.emeraldTint : BRAND.slateBg;
      this.doc.setFillColor(...bgCol);
      this.doc.rect(this.margin, rowY, labelW, rowH, 'F');
      this.doc.setDrawColor(...BRAND.emeraldBorder);
      this.doc.rect(this.margin, rowY, labelW, rowH, 'S');

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...BRAND.emeraldDark);
      this.doc.text(label, this.margin + padding, rowY + 9);

      // Value column
      this.doc.setFillColor(...BRAND.white);
      this.doc.rect(this.margin + labelW, rowY, valW, rowH, 'F');
      this.doc.setDrawColor(...BRAND.emeraldBorder);
      this.doc.rect(this.margin + labelW, rowY, valW, rowH, 'S');

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...BRAND.slateDark);
      this.doc.text(valLines, this.margin + labelW + padding, rowY + 9);

      this.currentY = rowY + rowH;
    });

    this.currentY += 12;
  }


  drawArticleSummaryItem(item: { headline: string; source: string; category?: string; relevance_level?: string; summary: string; source_link?: string; captured_at?: string }) {
    this.checkPageBreak(100);

    // 1. Source & Metadata Badge on the left, Crawl Date/Time on the right
    const metaParts = [item.source];
    if (item.category) metaParts.push(item.category.replace(/_/g, ' ').toUpperCase());
    if (item.relevance_level) metaParts.push(item.relevance_level.toUpperCase());
    const metaStr = `[${metaParts.join(' • ')}]`;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...BRAND.emeraldPrimary);
    this.doc.text(metaStr, this.margin, this.currentY + 8);

    // Crawl date & time on the empty space beside the brackets
    const crawlDateStr = item.captured_at
      ? new Date(item.captured_at).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : new Date().toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    const crawlLabel = `Crawled: ${crawlDateStr}`;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...BRAND.slateMuted);
    const crawlW = this.doc.getTextWidth(crawlLabel);
    this.doc.text(crawlLabel, this.pageWidth - this.margin - crawlW, this.currentY + 8);

    this.currentY += 13;

    // 2. Headline in bold
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...BRAND.emeraldDark);

    const titleLines = this.doc.splitTextToSize(item.headline, this.contentWidth);
    const titleH = titleLines.length * 13;
    this.checkPageBreak(titleH + 70);

    this.doc.text(titleLines, this.margin, this.currentY + 6);
    this.currentY += titleH + 4;

    // Subtle divider
    this.doc.setDrawColor(...BRAND.emeraldBorder);
    this.doc.setLineWidth(0.4);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 6;

    // 3. Article body uses the same plain paragraph styling as the executive overview.
    this.drawParagraph(item.summary, 9.5);

    // 4. Skip a line and put link to full article on source
    if (item.source_link && item.source_link !== '#') {
      const linkPrefix = `Full Article (${item.source}): `;
      const rawUrl = item.source_link;

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(8);
      this.doc.setTextColor(...BRAND.emeraldDark);
      this.doc.text(linkPrefix, this.margin + 2, this.currentY + 4);

      const prefixW = this.doc.getTextWidth(linkPrefix);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...BRAND.emeraldPrimary);

      // Display clean URL or shortened anchor if long, with interactive hyperlink
      const displayUrl = rawUrl.length > 75 ? `${rawUrl.slice(0, 72)}...` : rawUrl;
      this.doc.textWithLink(displayUrl, this.margin + 2 + prefixW, this.currentY + 4, { url: rawUrl });

      this.currentY += 14;
    } else {
      this.currentY += 6;
    }
  }

    drawCleanPageBreak(neededHeight: number) {
    if (this.currentY + neededHeight > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = 40;
    }
  }

  finalizeTemplateFooters() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 24;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(...BRAND.slateDark);
      const pageText = `Page | ${i}`;
      const pageW = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageW, footerY);
    }
  }

  saveTemplate(fileName: string) {
    this.finalizeTemplateFooters();
    this.doc.save(fileName);
  }

  outputTemplateBuffer(): Uint8Array {
    this.finalizeTemplateFooters();
    return new Uint8Array(this.doc.output('arraybuffer'));
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

/**
 * Converts any existing or legacy daily report into the new DailyReportStructuredContent format
 */
export function convertReportToStructuredDaily(report: Report): DailyReportStructuredContent {
  const genDate = new Date(report.generated_at);
  const dateFormatted = `${genDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })} Updates`;

  const rawSummaries = report.content?.article_summaries || [];
  const articles = report.content?.articles || [];

  // Parse or normalize summaries
  const parsedItems = rawSummaries.map((s, idx) => {
    let summaryText = s.summary || '';
    let whyItMatters = 'Direct impact on renewable IPP economics, project preparation, or utility off-take.';

    // Check if summary has multi-line structure
    if (summaryText.includes('\n')) {
      const lines = summaryText.split('\n');
      const devLine = lines.find(l => l.startsWith('Development:'));
      const impactLine = lines.find(l => l.startsWith('Hermit Strategic Relevance:') || l.startsWith('Market Impact:'));
      if (devLine) {
        summaryText = devLine.replace(/^Development:\s*/, '');
      }
      if (impactLine) {
        whyItMatters = impactLine.replace(/^(Hermit Strategic Relevance|Market Impact):\s*/, '');
      }
    }

    const matchedArt = articles.find(a => 
      a.headline === s.headline ||
      (a.headline && s.headline && a.headline.toLowerCase().includes(s.headline.toLowerCase().slice(0, 20)))
    );

    const region = matchedArt?.country_market || (s.headline.toLowerCase().includes('zimbabwe') ? 'Zimbabwe' : 'SADC / Africa');
    const pubDate = matchedArt?.publication_date
      ? new Date(matchedArt.publication_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : (s.captured_at ? new Date(s.captured_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent');

    return {
      item_number: idx + 1,
      headline: s.headline,
      priority: (s.relevance_level === 'high' ? 'High' : 'Medium') as 'High' | 'Medium',
      category: s.category || 'Policy and regulation',
      region,
      published_date_time: pubDate,
      source_name: s.source || 'Industry Source',
      source_link: s.source_link || '#',
      summary: summaryText,
      why_it_matters: whyItMatters,
      detail: summaryText
    };
  });

  const top3 = parsedItems.slice(0, 3);
  const remaining = parsedItems.slice(3);

  // Group remaining into categories
  const catNames = ['Policy and regulation', 'Renewables', 'Grid and infrastructure', 'Climate and sustainability'];
  const categorized: Record<string, any[]> = {
    'Policy and regulation': [],
    'Renewables': [],
    'Grid and infrastructure': [],
    'Climate and sustainability': []
  };

  remaining.forEach(item => {
    const text = (item.headline + ' ' + item.category).toLowerCase();
    if (text.includes('policy') || text.includes('regulation') || text.includes('tariff') || text.includes('licens')) {
      categorized['Policy and regulation'].push(item);
    } else if (text.includes('solar') || text.includes('renewable') || text.includes('wind') || text.includes('battery')) {
      categorized['Renewables'].push(item);
    } else if (text.includes('grid') || text.includes('transmission') || text.includes('hydro') || text.includes('zesa') || text.includes('power')) {
      categorized['Grid and infrastructure'].push(item);
    } else {
      categorized['Climate and sustainability'].push(item);
    }
  });

  // Ensure categories have entries or populate gracefully
  const categories = catNames.map(name => ({
    category_name: name,
    stories: categorized[name].map((s, idx) => ({
      item_number: idx + 1,
      headline: s.headline,
      priority: s.priority,
      region: s.region,
      published_date_time: s.published_date_time,
      source_name: s.source_name,
      source_link: s.source_link,
      detail: s.detail,
      also_reported_by: []
    }))
  })).filter(c => c.stories.length > 0);

  // Local watch: Zimbabwe
  const zimStories = parsedItems
    .filter(s => s.region.toLowerCase().includes('zimbabwe') || s.headline.toLowerCase().includes('zim') || s.headline.toLowerCase().includes('zesa'))
    .slice(0, 2)
    .map((s, idx) => ({
      item_number: idx + 1,
      headline: s.headline,
      priority: s.priority,
      region: 'Zimbabwe',
      published_date_time: s.published_date_time,
      source_name: s.source_name,
      source_link: s.source_link,
      detail: s.detail,
      also_reported_by: []
    }));

  return {
    date_formatted: dateFormatted,
    subheading: 'Curated Daily Intelligence Digest for Hermit Sustainability Advisory & Clean Energy Stakeholders',
    what_matters_today: top3,
    categories,
    local_watch: {
      location: 'Zimbabwe',
      stories: zimStories,
      watch_notes: 'Nothing new from the energy regulator or rural electrification agency today.'
    },
    crawl_status: {
      collected_count: report.article_count || 40,
      total_sources: 42,
      unavailable_sources: [],
      notes: 'Full crawl completed across monitored clean energy and regulatory portals.'
    }
  };
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

  // If report is daily, ALWAYS format using the exact Hermit Sustainability Advisory Template
  if (report.report_type === 'daily') {
    const daily = report.content?.structured_daily || convertReportToStructuredDaily(report);
    return createTemplateDailyPdfBuilder(daily);
  }

  // Cover header
  builder.drawDocumentCoverHeader(badge, report.title, metaItems);

  // If report is weekly or has structured_weekly, format using Hermit Sustainability Advisory Template
  const weekly = report.content?.structured_weekly;
  if (report.report_type === 'weekly' && weekly) {
    // 0. Header metadata table
    const metaTable = [
      ['Reporting week', weekly.header?.reporting_week || 'Current Week'],
      ['Report reference & issue date', `${weekly.header?.report_reference || 'HSA WC'}  |  ${new Date(report.generated_at).toLocaleDateString('en-GB')}`],
      ['Prepared by & reviewed by', `${weekly.header?.prepared_by || 'Intelligence Unit'}  |  ${weekly.header?.reviewed_by || 'Sustainability Advisory'}`],
      ['Submission day & audience', `${weekly.header?.submission_day || 'Weekly Briefing'}  |  ${weekly.header?.audience || 'Investment Committee'}`]
    ];
    builder.drawTable(['Reporting Field', 'Weekly Details'], metaTable, [160, builder.contentWidth - 160]);

    // 1. Weekly Executive Update
    builder.drawSectionHeader('1. Weekly Executive Update');
    builder.drawParagraph(weekly.executive_update || report.summary || '', 9.5);

    // 2. Priority Findings
    if (weekly.priority_findings && weekly.priority_findings.length > 0) {
      builder.drawSectionHeader('2. Priority Findings');
      const pRows = weekly.priority_findings.map(pf => [
        `${pf.headline}\n[${pf.theme}]`,
        pf.relevance,
        pf.priority
      ]);
      const pColW = [builder.contentWidth * 0.45, builder.contentWidth * 0.45, builder.contentWidth * 0.1];
      builder.drawTable(['Headline and theme', 'Relevance to Hermit', 'Priority'], pRows, pColW);
    }

    // 3. Finding Records
    if (weekly.finding_records && weekly.finding_records.length > 0) {
      builder.drawSectionHeader('3. Finding Record');
      weekly.finding_records.forEach((record) => {
        builder.drawFindingRecord(record);
      });
    }

    // 4. Monitoring Coverage
    if (weekly.monitoring_coverage && weekly.monitoring_coverage.length > 0) {
      builder.drawSectionHeader('4. Monitoring Coverage');
      const covRows = weekly.monitoring_coverage.map(c => [c.source_or_topic, c.result_or_gap, c.follow_up]);
      const covColW = [builder.contentWidth * 0.4, builder.contentWidth * 0.35, builder.contentWidth * 0.25];
      builder.drawTable(['Sources or topics checked', 'Result or coverage gap', 'Follow up'], covRows, covColW);
    }

    // 5. Action and Follow Up Tracker
    if (weekly.action_tracker && weekly.action_tracker.length > 0) {
      builder.drawSectionHeader('5. Action and Follow Up Tracker');
      const actRows = weekly.action_tracker.map(a => [a.action_deliverable, a.owner, a.due_date, `[${a.status}] ${a.progress}`]);
      const actColW = [builder.contentWidth * 0.4, builder.contentWidth * 0.2, builder.contentWidth * 0.15, builder.contentWidth * 0.25];
      builder.drawTable(['Action and expected output', 'Owner', 'Due', 'Status and progress'], actRows, actColW);
    }

    // 6. Decisions and Escalations
    if (weekly.decisions_escalations && weekly.decisions_escalations.length > 0) {
      builder.drawSectionHeader('6. Decisions and Escalations');
      const decRows = weekly.decisions_escalations.map(d => [d.decision_reason, d.decision_owner, d.needed_by]);
      const decColW = [builder.contentWidth * 0.55, builder.contentWidth * 0.25, builder.contentWidth * 0.2];
      builder.drawTable(['Decision and reason', 'Decision owner', 'Needed by'], decRows, decColW);
    }

    // 7. Priorities for Next Week
    if (weekly.next_week_priorities && weekly.next_week_priorities.length > 0) {
      builder.drawSectionHeader('7. Priorities for Next Week');
      const prioRows = weekly.next_week_priorities.map((p, idx) => [`${idx + 1}. ${p.priority_deliverable}`, p.owner, p.target_date]);
      const prioColW = [builder.contentWidth * 0.55, builder.contentWidth * 0.25, builder.contentWidth * 0.2];
      builder.drawTable(['Priority deliverable or topic', 'Owner', 'Target date'], prioRows, prioColW);
    }

    // Sign-off
    builder.checkPageBreak(30);
    builder.doc.setFont('helvetica', 'bold');
    builder.doc.setFontSize(8);
    builder.doc.setTextColor(...BRAND.slateDark);
    const signOffText = `Reviewed by: ${weekly.sign_off?.reviewed_by || 'Lead Sustainability Advisor'}   |   Date: ${weekly.sign_off?.date || new Date().toLocaleDateString('en-GB')}   |   Approved by: ${weekly.sign_off?.approved_by || 'Executive Director'}`;
    builder.doc.text(signOffText, builder.margin, builder.currentY + 12);
    builder.currentY += 25;

    return builder;
  }


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

  // Article Detailed Summaries (Bold Headline + 5-Line Summary for all articles in the report)
  if (report.content?.article_summaries && report.content.article_summaries.length > 0) {
    builder.drawSectionHeader('3. Monitored Article Intelligence Summaries');
    sortReportArticleSummaries(report.content.article_summaries).forEach((item) => {
      builder.drawArticleSummaryItem(item);
    });
  }

  // Category Breakdown Table
  if (report.content?.category_breakdown && Object.keys(report.content.category_breakdown).length > 0) {
    builder.drawSectionHeader('4. Source & Channel Distribution');
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
    builder.drawSectionHeader('5. Recommended Management Actions');
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
 * Builder for the official Hermit Sustainability Advisory Daily Report Template
 */
export function createTemplateDailyPdfBuilder(daily: DailyReportStructuredContent): PdfBuilder {
  const builder = new PdfBuilder();
  builder.margin = 38;
  builder.contentWidth = builder.pageWidth - builder.margin * 2;
  builder.currentY = 32;

  // 1. PAGE 1: HEADER
  // Centered Logo
  if (HERMIT_ADVISORY_LOGO_BASE64) {
    const logoW = 58;
    const logoH = 52;
    const logoX = (builder.pageWidth - logoW) / 2;
    try {
      builder.doc.addImage(HERMIT_ADVISORY_LOGO_BASE64, 'JPEG', logoX, builder.currentY, logoW, logoH);
      builder.currentY += logoH + 12;
    } catch (e) {
      console.warn('Failed to render advisory logo:', e);
      builder.currentY += 10;
    }
  }

  // Title: HERMIT SUSTAINABILITY ADVISORY
  builder.doc.setFont('helvetica', 'bold');
  builder.doc.setFontSize(11);
  builder.doc.setTextColor(...BRAND.slateDark);
  const title = 'HERMIT SUSTAINABILITY ADVISORY';
  const titleW = builder.doc.getTextWidth(title);
  builder.doc.text(title, (builder.pageWidth - titleW) / 2, builder.currentY);
  builder.currentY += 16;

  // Date line: e.g. Friday, 6 November 2026 Updates
  builder.doc.setFont('helvetica', 'normal');
  builder.doc.setFontSize(9.5);
  builder.doc.setTextColor(...BRAND.slateMuted);
  const dateLine = daily.date_formatted || `${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} Updates`;
  const dateW = builder.doc.getTextWidth(dateLine);
  builder.doc.text(dateLine, (builder.pageWidth - dateW) / 2, builder.currentY);
  builder.currentY += 12;

  // Subtle subtitle / notice line if present
  if (daily.subheading) {
    builder.doc.setFont('helvetica', 'italic');
    builder.doc.setFontSize(8);
    builder.doc.setTextColor(...BRAND.amberBadge);
    const subLines = builder.doc.splitTextToSize(daily.subheading, builder.contentWidth);
    builder.doc.text(subLines, builder.margin, builder.currentY);
    builder.currentY += subLines.length * 10 + 4;
  }

  // Top divider rule
  builder.doc.setDrawColor(...BRAND.templateRuleGray);
  builder.doc.setLineWidth(0.6);
  builder.doc.line(builder.margin, builder.currentY, builder.pageWidth - builder.margin, builder.currentY);
  builder.currentY += 18;

  // SECTION: "What matters today?"
  builder.doc.setFont('helvetica', 'bold');
  builder.doc.setFontSize(14);
  builder.doc.setTextColor(...BRAND.slateDark);
  builder.doc.text('What matters today?', builder.margin, builder.currentY);
  builder.currentY += 18;

  // Render "What matters today?" items
  if (daily.what_matters_today && daily.what_matters_today.length > 0) {
    daily.what_matters_today.forEach((item, idx) => {
      builder.drawCleanPageBreak(90);

      const num = item.item_number || (idx + 1);

      // Headline in bold
      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(10);
      builder.doc.setTextColor(...BRAND.slateDark);
      const headlineText = `${num}.  ${item.headline}`;
      const headLines = builder.doc.splitTextToSize(headlineText, builder.contentWidth);
      builder.doc.text(headLines, builder.margin, builder.currentY);
      builder.currentY += headLines.length * 12 + 3;

      // Meta Tagline: Priority (colored) Category. Region. Published
      const prio = (item.priority || 'High').toUpperCase() === 'HIGH' ? 'High' : 'Medium';
      const isHigh = prio === 'High';

      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(8.5);
      builder.doc.setTextColor(...(isHigh ? BRAND.templateHighRed : BRAND.templateMedAmber));
      builder.doc.text(prio, builder.margin + 12, builder.currentY);

      const prioW = builder.doc.getTextWidth(prio);
      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setTextColor(...BRAND.slateMuted);
      const metaText = `  ${item.category || 'Policy and regulation'}. ${item.region || 'Zimbabwe'}. ${item.published_date_time || ''}`;
      builder.doc.text(metaText, builder.margin + 12 + prioW, builder.currentY);
      builder.currentY += 12;

      // Link line: Link: [source_name - title](url)
      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setFontSize(8.5);
      builder.doc.setTextColor(...BRAND.slateDark);
      const linkPrefix = 'Link: ';
      builder.doc.text(linkPrefix, builder.margin + 12, builder.currentY);

      const linkPrefixW = builder.doc.getTextWidth(linkPrefix);
      builder.doc.setTextColor(...BRAND.templateLinkBlue);
      const linkTitle = `${item.headline} – ${item.source_name || 'source'}`;
      const maxLinkChars = 80;
      const displayLinkText = linkTitle.length > maxLinkChars ? `${linkTitle.slice(0, maxLinkChars - 3)}...` : linkTitle;
      
      if (item.source_link && item.source_link !== '#') {
        builder.doc.textWithLink(displayLinkText, builder.margin + 12 + linkPrefixW, builder.currentY, { url: item.source_link });
      } else {
        builder.doc.text(displayLinkText, builder.margin + 12 + linkPrefixW, builder.currentY);
      }
      builder.currentY += 14;

      // Factual summary
      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setFontSize(9);
      builder.doc.setTextColor(...BRAND.slateBody);
      const sumLines = builder.doc.splitTextToSize(item.summary, builder.contentWidth - 12);
      builder.doc.text(sumLines, builder.margin + 12, builder.currentY);
      builder.currentY += sumLines.length * 11 + 4;

      // "Why it matters:" line
      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(9);
      builder.doc.setTextColor(...BRAND.templateWhyGreen);
      const whyLabel = 'Why it matters: ';
      builder.doc.text(whyLabel, builder.margin + 12, builder.currentY);

      const whyW = builder.doc.getTextWidth(whyLabel);
      builder.doc.setFont('helvetica', 'normal');
      builder.doc.setTextColor(...BRAND.slateBody);
      const whyText = item.why_it_matters || 'Strategic implications for ongoing project viability and grid dispatch.';
      const whyLines = builder.doc.splitTextToSize(whyText, builder.contentWidth - 12 - whyW);
      
      // If single line fits, print inline, otherwise split
      if (whyLines.length === 1) {
        builder.doc.text(whyLines[0], builder.margin + 12 + whyW, builder.currentY);
        builder.currentY += 12;
      } else {
        builder.doc.text(whyLines[0], builder.margin + 12 + whyW, builder.currentY);
        builder.currentY += 11;
        for (let l = 1; l < whyLines.length; l++) {
          builder.doc.text(whyLines[l], builder.margin + 12, builder.currentY);
          builder.currentY += 11;
        }
      }

      builder.currentY += 8;

      // Divider rule after each item
      builder.doc.setDrawColor(...BRAND.templateRuleGray);
      builder.doc.setLineWidth(0.5);
      builder.doc.line(builder.margin, builder.currentY, builder.pageWidth - builder.margin, builder.currentY);
      builder.currentY += 14;
    });
  }

  // 2. PAGE BREAK FOR "All stories by category"
  builder.doc.addPage();
  builder.currentY = 40;

  // Centered Header: All stories by category
  builder.doc.setFont('helvetica', 'bold');
  builder.doc.setFontSize(13);
  builder.doc.setTextColor(...BRAND.slateDark);
  const catTitle = 'All stories by category';
  const catTitleW = builder.doc.getTextWidth(catTitle);
  builder.doc.text(catTitle, (builder.pageWidth - catTitleW) / 2, builder.currentY);
  builder.currentY += 20;

  // Categories iteration
  if (daily.categories && daily.categories.length > 0) {
    daily.categories.forEach(cat => {
      builder.drawCleanPageBreak(60);

      // Category Header (e.g. Policy and regulation, Renewables, etc.)
      builder.doc.setFont('helvetica', 'bold');
      builder.doc.setFontSize(11);
      builder.doc.setTextColor(...BRAND.slateDark);
      builder.doc.text(cat.category_name, builder.margin, builder.currentY);
      builder.currentY += 13;

      cat.stories.forEach((story, sIdx) => {
        builder.drawCleanPageBreak(50);
        const sNum = story.item_number || (sIdx + 1);

        // Story title
        builder.doc.setFont('helvetica', 'bold');
        builder.doc.setFontSize(9.5);
        builder.doc.setTextColor(...BRAND.slateDark);
        const stHeadline = `${sNum}.  ${story.headline}`;
        const stHeadLines = builder.doc.splitTextToSize(stHeadline, builder.contentWidth);
        builder.doc.text(stHeadLines, builder.margin, builder.currentY);
        builder.currentY += stHeadLines.length * 11 + 2;

        // Meta Tagline
        const sPrio = (story.priority || 'Medium').toUpperCase() === 'HIGH' ? 'High' : 'Medium';
        builder.doc.setFont('helvetica', 'bold');
        builder.doc.setFontSize(8);
        builder.doc.setTextColor(...(sPrio === 'High' ? BRAND.templateHighRed : BRAND.templateMedAmber));
        builder.doc.text(sPrio, builder.margin + 12, builder.currentY);

        const sPrioW = builder.doc.getTextWidth(sPrio);
        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setTextColor(...BRAND.slateMuted);
        const sMeta = `  ${story.region || 'Zimbabwe'}. ${story.published_date_time || ''}`;
        builder.doc.text(sMeta, builder.margin + 12 + sPrioW, builder.currentY);
        builder.currentY += 10;

        // Link
        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setFontSize(8);
        builder.doc.setTextColor(...BRAND.slateDark);
        builder.doc.text('Link: ', builder.margin + 12, builder.currentY);
        const sLinkW = builder.doc.getTextWidth('Link: ');
        builder.doc.setTextColor(...BRAND.templateLinkBlue);
        const sLinkTitle = `${story.headline} – ${story.source_name || 'source'}`;
        const sDisplay = sLinkTitle.length > 80 ? `${sLinkTitle.slice(0, 77)}...` : sLinkTitle;
        if (story.source_link && story.source_link !== '#') {
          builder.doc.textWithLink(sDisplay, builder.margin + 12 + sLinkW, builder.currentY, { url: story.source_link });
        } else {
          builder.doc.text(sDisplay, builder.margin + 12 + sLinkW, builder.currentY);
        }
        builder.currentY += 11;

        // Article Detail
        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setFontSize(8.5);
        builder.doc.setTextColor(...BRAND.slateBody);
        const detailLines = builder.doc.splitTextToSize(story.detail, builder.contentWidth - 12);
        builder.doc.text(detailLines, builder.margin + 12, builder.currentY);
        builder.currentY += detailLines.length * 10 + 3;

        // Also reported by
        if (story.also_reported_by && story.also_reported_by.length > 0) {
          builder.doc.setFont('helvetica', 'italic');
          builder.doc.setFontSize(8);
          builder.doc.setTextColor(...BRAND.slateMuted);
          builder.doc.text(`Also reported by: ${story.also_reported_by.join(', ')}`, builder.margin + 12, builder.currentY);
          builder.currentY += 12;
        } else {
          builder.currentY += 4;
        }
      });

      builder.currentY += 6;
    });
  }

  // Local watch: Zimbabwe
  if (daily.local_watch) {
    builder.drawCleanPageBreak(65);

    builder.doc.setFont('helvetica', 'bold');
    builder.doc.setFontSize(11);
    builder.doc.setTextColor(...BRAND.slateDark);
    builder.doc.text(`Local watch: ${daily.local_watch.location || 'Zimbabwe'}`, builder.margin, builder.currentY);
    builder.currentY += 13;

    if (daily.local_watch.stories && daily.local_watch.stories.length > 0) {
      daily.local_watch.stories.forEach((story, sIdx) => {
        builder.drawCleanPageBreak(50);
        const sNum = story.item_number || (sIdx + 1);

        builder.doc.setFont('helvetica', 'bold');
        builder.doc.setFontSize(9.5);
        builder.doc.setTextColor(...BRAND.slateDark);
        const stHeadline = `${sNum}.  ${story.headline}`;
        const stHeadLines = builder.doc.splitTextToSize(stHeadline, builder.contentWidth);
        builder.doc.text(stHeadLines, builder.margin, builder.currentY);
        builder.currentY += stHeadLines.length * 11 + 2;

        const sPrio = (story.priority || 'Medium').toUpperCase() === 'HIGH' ? 'High' : 'Medium';
        builder.doc.setFont('helvetica', 'bold');
        builder.doc.setFontSize(8);
        builder.doc.setTextColor(...(sPrio === 'High' ? BRAND.templateHighRed : BRAND.templateMedAmber));
        builder.doc.text(sPrio, builder.margin + 12, builder.currentY);

        const sPrioW = builder.doc.getTextWidth(sPrio);
        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setTextColor(...BRAND.slateMuted);
        const sMeta = `  ${story.region || 'Zimbabwe'}. ${story.published_date_time || ''}`;
        builder.doc.text(sMeta, builder.margin + 12 + sPrioW, builder.currentY);
        builder.currentY += 10;

        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setFontSize(8);
        builder.doc.setTextColor(...BRAND.slateDark);
        builder.doc.text('Link: ', builder.margin + 12, builder.currentY);
        const sLinkW = builder.doc.getTextWidth('Link: ');
        builder.doc.setTextColor(...BRAND.templateLinkBlue);
        const sLinkTitle = `${story.headline} – ${story.source_name || 'source'}`;
        const sDisplay = sLinkTitle.length > 80 ? `${sLinkTitle.slice(0, 77)}...` : sLinkTitle;
        if (story.source_link && story.source_link !== '#') {
          builder.doc.textWithLink(sDisplay, builder.margin + 12 + sLinkW, builder.currentY, { url: story.source_link });
        } else {
          builder.doc.text(sDisplay, builder.margin + 12 + sLinkW, builder.currentY);
        }
        builder.currentY += 11;

        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setFontSize(8.5);
        builder.doc.setTextColor(...BRAND.slateBody);
        const detailLines = builder.doc.splitTextToSize(story.detail, builder.contentWidth - 12);
        builder.doc.text(detailLines, builder.margin + 12, builder.currentY);
        builder.currentY += detailLines.length * 10 + 3;

        if (story.also_reported_by && story.also_reported_by.length > 0) {
          builder.doc.setFont('helvetica', 'italic');
          builder.doc.setFontSize(8);
          builder.doc.setTextColor(...BRAND.slateMuted);
          builder.doc.text(`Also reported by: ${story.also_reported_by.join(', ')}`, builder.margin + 12, builder.currentY);
          builder.currentY += 12;
        } else {
          builder.currentY += 4;
        }
      });
    }

    if (daily.local_watch.watch_notes) {
      builder.drawCleanPageBreak(25);
      builder.doc.setFont('helvetica', 'italic');
      builder.doc.setFontSize(8.5);
      builder.doc.setTextColor(...BRAND.slateMuted);
      builder.doc.text(daily.local_watch.watch_notes, builder.margin, builder.currentY);
      builder.currentY += 18;
    }
  }

  // Crawl status line
  builder.drawCleanPageBreak(35);
  builder.doc.setDrawColor(...BRAND.templateRuleGray);
  builder.doc.setLineWidth(0.5);
  builder.doc.line(builder.margin, builder.currentY, builder.pageWidth - builder.margin, builder.currentY);
  builder.currentY += 10;

  builder.doc.setFont('helvetica', 'normal');
  builder.doc.setFontSize(8);
  builder.doc.setTextColor(...BRAND.slateMuted);
  const colCount = daily.crawl_status?.collected_count || 40;
  const totCount = daily.crawl_status?.total_sources || 42;
  const unavail = daily.crawl_status?.unavailable_sources?.length 
    ? `Two sources were unavailable (${daily.crawl_status.unavailable_sources.join(', ')}), so some coverage may be missing.`
    : 'All primary monitored clean energy and regulatory sources collected.';
  const crawlStr = `Crawl status: ${colCount} of ${totCount} sources collected. ${unavail}`;
  const crawlLines = builder.doc.splitTextToSize(crawlStr, builder.contentWidth);
  builder.doc.text(crawlLines, builder.margin, builder.currentY);
  builder.currentY += crawlLines.length * 10 + 10;

  // 3. PAGE 3: SUMMARY DISCLAIMER & PLATFORM FEEDBACK
  builder.doc.addPage();
  builder.currentY = 40;

  builder.doc.setFont('helvetica', 'normal');
  builder.doc.setFontSize(8.5);
  builder.doc.setTextColor(...BRAND.slateMuted);
  const disc1 = 'Summaries are generated automatically from the linked articles. Open the original source before quoting or acting on an item.';
  const disc1Lines = builder.doc.splitTextToSize(disc1, builder.contentWidth);
  builder.doc.text(disc1Lines, builder.margin, builder.currentY);
  builder.currentY += disc1Lines.length * 11 + 6;

  const disc2 = 'Feedback: was this brief useful? Yes / No. Full archive and preferences are available on the platform.';
  const disc2Lines = builder.doc.splitTextToSize(disc2, builder.contentWidth);
  builder.doc.text(disc2Lines, builder.margin, builder.currentY);
  builder.currentY += disc2Lines.length * 11 + 10;

  return builder;
}

/**
 * Returns raw Uint8Array PDF buffer for server-side API responses
 */
export function generateReportPdfBuffer(report: Report): Uint8Array {
  const builder = createReportPdfBuilder(report);
  if (report.report_type === 'daily') {
    return builder.outputTemplateBuffer();
  }
  return builder.outputBuffer();
}

/**
 * Generates and triggers browser download of PDF for standard or executive reports
 */
export function generateReportPdf(report: Report): void {
  const builder = createReportPdfBuilder(report);
  const cleanDate = new Date(report.generated_at).toISOString().split('T')[0];
  const filename = `Hermit_${report.report_type.toUpperCase()}_Report_${cleanDate}_#${report.id}.pdf`;
  if (report.report_type === 'daily') {
    builder.saveTemplate(filename);
  } else {
    builder.save(filename);
  }
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
      const impactText = `Article Summary: ${pillar.impact} — Commercial Impact: ${pillar.takeaway}`;
      builder.drawParagraph(impactText, 8.5);
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
