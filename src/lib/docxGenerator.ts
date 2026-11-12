/**
 * Hermit Investments — Daily Brief Word Document Generator
 * Generates a branded .docx from a DailyBrief object using the `docx` package.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  PageOrientation,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import { DailyBrief } from '@/types';

// ── Brand colours (as hex strings) ──────────────────────────────────────────
const NAVY   = '0F234B';
const CYAN   = '0EA5E9';
const WHITE  = 'FFFFFF';
const SLATE  = '334155';
const MUTED  = '64748B';
const ICE    = 'F0F9FF';
const AMBER  = 'D97706';
const ROSE   = 'E11D48';
const GREEN  = '0D9488';

// ── Helpers ──────────────────────────────────────────────────────────────────

function sentiment_color(sentiment: string): string {
  switch (sentiment) {
    case 'bullish':  return GREEN;
    case 'bearish':  return ROSE;
    case 'cautious': return AMBER;
    default:         return SLATE;
  }
}

function priority_color(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'immediate': return ROSE;
    case 'medium':    return AMBER;
    default:          return GREEN;
  }
}

function stance_color(stance: string): string {
  switch (stance) {
    case 'favorable':   return GREEN;
    case 'regulatory':  return AMBER;
    case 'financing':   return CYAN;
    case 'warning':     return ROSE;
    default:            return SLATE;
  }
}

function hr(): Paragraph {
  return new Paragraph({
    border: { bottom: { color: 'BAE6FD', style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 160 },
  });
}

function spacer(after = 120): Paragraph {
  return new Paragraph({ spacing: { after } });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: NAVY,
        size: 20,
        font: 'Calibri',
      }),
    ],
    spacing: { before: 300, after: 100 },
    border: { bottom: { color: CYAN, style: BorderStyle.SINGLE, size: 4 } },
  });
}

function bullet(text: string, color = SLATE): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: '• ', color: CYAN, bold: true, size: 20, font: 'Calibri' }),
      new TextRun({ text, color, size: 20, font: 'Calibri' }),
    ],
    spacing: { after: 80 },
    indent: { left: 240 },
  });
}

function labelValue(label: string, value: string, valueColor = SLATE): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: NAVY, size: 20, font: 'Calibri' }),
      new TextRun({ text: value, color: valueColor, size: 20, font: 'Calibri' }),
    ],
    spacing: { after: 80 },
  });
}

// ── Main generator ───────────────────────────────────────────────────────────

export async function generateDailyBriefDocxBuffer(brief: DailyBrief): Promise<Buffer> {
  const dateFormatted = brief.date
    ? new Date(brief.date).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

  const sentimentLabel =
    brief.market_sentiment.charAt(0).toUpperCase() + brief.market_sentiment.slice(1);

  // ── Cover / Title block ───────────────────────────────────────────────────
  const titleSection: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'HERMIT INVESTMENTS',
          bold: true,
          color: WHITE,
          size: 36,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
      spacing: { before: 200, after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Energy Sector Intelligence Monitor',
          color: 'BAE6FD',
          size: 22,
          font: 'Calibri',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Daily Executive Brief  —  ${dateFormatted}`,
          color: WHITE,
          size: 24,
          font: 'Calibri',
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
      spacing: { after: 200 },
    }),
    spacer(80),
  ];

  // ── Headline ─────────────────────────────────────────────────────────────
  const headlineSection: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: brief.headline,
          bold: true,
          color: NAVY,
          size: 32,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
    }),
    hr(),
  ];

  // ── Executive Summary ─────────────────────────────────────────────────────
  const summarySection: Paragraph[] = [
    sectionHeading('Executive Summary'),
    new Paragraph({
      children: [
        new TextRun({
          text: brief.executive_summary,
          color: SLATE,
          size: 22,
          font: 'Calibri',
        }),
      ],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED,
    }),
    spacer(80),
  ];

  // ── Market Indicators ─────────────────────────────────────────────────────
  const indicatorsSection: Paragraph[] = [
    sectionHeading('Market Indicators'),
    labelValue('Market Sentiment', sentimentLabel, sentiment_color(brief.market_sentiment)),
    labelValue('Risk Index',       `${brief.risk_index}/100`),
    labelValue('Risk Assessment',  brief.risk_label, brief.risk_index >= 60 ? ROSE : brief.risk_index >= 35 ? AMBER : GREEN),
    labelValue('Total Captures',   `${brief.total_articles_scanned} articles scanned`),
    labelValue('High Relevance',   `${brief.high_relevance_count} items flagged`),
    spacer(80),
  ];

  // ── Sector Breakdown ──────────────────────────────────────────────────────
  const sectorSection: Paragraph[] = [
    sectionHeading('Sector Breakdown'),
    ...brief.sector_breakdown.map(s =>
      new Paragraph({
        children: [
          new TextRun({ text: `${s.category}`, bold: true, color: NAVY, size: 20, font: 'Calibri' }),
          new TextRun({ text: `  ${s.percentage}%  `, color: SLATE, size: 20, font: 'Calibri' }),
          new TextRun({ text: `(${s.count} items)`, color: MUTED, size: 18, font: 'Calibri', italics: true }),
        ],
        spacing: { after: 80 },
        indent: { left: 240 },
      })
    ),
    spacer(80),
  ];

  // ── Strategic Intelligence Pillars ────────────────────────────────────────
  const pillarsSection: Paragraph[] = [
    sectionHeading('Strategic Intelligence Pillars'),
    ...brief.strategic_pillars.flatMap((p, i) => [
      new Paragraph({
        children: [
          new TextRun({
            text: `${i + 1}. ${p.title}`,
            bold: true,
            color: NAVY,
            size: 22,
            font: 'Calibri',
          }),
          new TextRun({ text: `  [${p.badge}]`, color: CYAN, size: 18, font: 'Calibri' }),
        ],
        spacing: { before: 180, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Impact: ', bold: true, color: SLATE, size: 20, font: 'Calibri' }),
          new TextRun({ text: p.impact, color: SLATE, size: 20, font: 'Calibri' }),
        ],
        indent: { left: 360 },
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Key Takeaway: ', bold: true, color: SLATE, size: 20, font: 'Calibri' }),
          new TextRun({ text: p.takeaway, color: SLATE, size: 20, font: 'Calibri' }),
        ],
        indent: { left: 360 },
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Source: ${p.source}`, color: MUTED, size: 18, font: 'Calibri', italics: true }),
          new TextRun({ text: `  •  ${p.time}`, color: MUTED, size: 18, font: 'Calibri', italics: true }),
        ],
        indent: { left: 360 },
        spacing: { after: 100 },
      }),
    ]),
    spacer(80),
  ];

  // ── Key Stakeholders ──────────────────────────────────────────────────────
  const stakeholderSection: Paragraph[] = [
    sectionHeading('Key Stakeholders Active'),
    ...brief.key_stakeholders_active.map(s => {
      const stanceLabel = s.stance.charAt(0).toUpperCase() + s.stance.slice(1);
      return new Paragraph({
        children: [
          new TextRun({ text: s.name, bold: true, color: NAVY, size: 20, font: 'Calibri' }),
          new TextRun({ text: `  —  ${s.role}`, color: SLATE, size: 20, font: 'Calibri' }),
          new TextRun({ text: `  [${stanceLabel}]`, color: stance_color(s.stance), size: 18, font: 'Calibri', bold: true }),
          new TextRun({ text: `  (${s.mentions} mention${s.mentions !== 1 ? 's' : ''})`, color: MUTED, size: 18, font: 'Calibri', italics: true }),
        ],
        spacing: { after: 80 },
        indent: { left: 240 },
      });
    }),
    spacer(80),
  ];

  // ── Management Actions ────────────────────────────────────────────────────
  const actionsSection: Paragraph[] = [
    sectionHeading('Recommended Management Actions'),
    ...brief.management_actions.map((a, i) => {
      const pLabel = a.priority.charAt(0).toUpperCase() + a.priority.slice(1);
      return new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, color: NAVY, size: 20, font: 'Calibri' }),
          new TextRun({ text: `[${pLabel}] `, bold: true, color: priority_color(a.priority), size: 20, font: 'Calibri' }),
          new TextRun({ text: a.action, color: SLATE, size: 20, font: 'Calibri' }),
          new TextRun({ text: `  → ${a.owner}`, color: MUTED, size: 18, font: 'Calibri', italics: true }),
        ],
        spacing: { after: 100 },
        indent: { left: 240 },
      });
    }),
    spacer(80),
  ];

  // ── Footer note ───────────────────────────────────────────────────────────
  const footerSection: Paragraph[] = [
    hr(),
    new Paragraph({
      children: [
        new TextRun({
          text: `Hermit Investments Sustainability Advisory  •  CONFIDENTIAL  •  Generated ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Harare' })} CAT`,
          color: MUTED,
          size: 16,
          font: 'Calibri',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
    }),
  ];

  // ── Assemble Document ─────────────────────────────────────────────────────
  const doc = new Document({
    creator: 'Hermit Intelligence Monitor',
    title: `Daily Energy Brief — ${brief.date}`,
    description: 'Hermit Investments daily AI-synthesised energy sector intelligence brief',
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `HERMIT INVESTMENTS  •  Confidential  •  ${dateFormatted}`,
                    color: MUTED,
                    size: 16,
                    font: 'Calibri',
                    italics: true,
                  }),
                ],
                border: { bottom: { color: 'BAE6FD', style: BorderStyle.SINGLE, size: 4 } },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Page ', color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ text: ' of ', color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, size: 16, font: 'Calibri' }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        children: [
          ...titleSection,
          ...headlineSection,
          ...summarySection,
          ...indicatorsSection,
          ...sectorSection,
          ...pillarsSection,
          ...stakeholderSection,
          ...actionsSection,
          ...footerSection,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
