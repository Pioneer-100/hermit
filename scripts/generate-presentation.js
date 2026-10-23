const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createDeck() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches

  // Color Palette (Hermit Emerald Theme)
  const C = {
    bgDark: '03120C',
    cardBg: '06261B',
    cardBorder: '10B981',
    accentGreen: '10B981',
    accentMint: '34D399',
    accentRose: 'F43F5E',
    accentAmber: 'F59E0B',
    accentBlue: '3B82F6',
    accentCyan: '06B6D4',
    textWhite: 'FFFFFF',
    textDim: 'A7F3D0',
    textMuted: '6EE7B7',
    grayText: '94A3B8'
  };

  const assetDir = path.resolve(__dirname, '../public/presentation-assets');

  // Helper: Slide Master / Background
  function addBaseSlide(title, subtitle, category = 'HERMIT INVESTMENTS — INDUSTRIAL INTELLIGENCE') {
    const slide = pptx.addSlide();
    slide.background = { color: C.bgDark };

    // Header Category Badge
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.35,
      w: 8.4,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: C.accentMint,
      charSpacing: 2
    });

    // Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.58,
      w: 8.4,
      h: 0.45,
      fontSize: 20,
      fontFace: 'Arial',
      bold: true,
      color: C.textWhite
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8,
        y: 1.0,
        w: 8.4,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.textMuted
      });
    }

    // Bottom Footer
    slide.addText('Hermit Energy Sector Surveillance Platform | Industrial Edition v2.0', {
      x: 0.8,
      y: 5.25,
      w: 6.0,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      color: '047857'
    });

    slide.addText('Confidential — Executive Briefing', {
      x: 7.2,
      y: 5.25,
      w: 2.0,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      align: 'right',
      color: '047857'
    });

    return slide;
  }

  // ==========================================
  // SLIDE 1: TITLE SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.bgDark };

    // Brand Tag
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 1.2,
      w: 2.2,
      h: 0.35,
      rectRadius: 0.1,
      fill: { color: '064E3B' },
      line: { color: C.accentGreen, width: 1 }
    });
    slide.addText('HERMIT INVESTMENTS', {
      x: 1.0,
      y: 1.2,
      w: 2.2,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: C.accentMint,
      align: 'center',
      charSpacing: 2
    });

    // Main Title
    slide.addText('Energy Sector Media\nSurveillance & Intelligence', {
      x: 1.0,
      y: 1.7,
      w: 8.0,
      h: 1.3,
      fontSize: 34,
      fontFace: 'Arial',
      bold: true,
      color: C.textWhite,
      lineSpacing: 38
    });

    // Subtitle / Deck Purpose
    slide.addText('Platform Capabilities, Architectural Hardening & New Feature Walkthrough', {
      x: 1.0,
      y: 3.1,
      w: 8.0,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.accentMint
    });

    // Highlight metrics bar at bottom
    const badges = [
      { num: '70+', lbl: 'Monitored Portals' },
      { num: '6-Tier', lbl: 'Automated Pipeline' },
      { num: '30-Day', lbl: 'Freshness Guard' },
      { num: '100%', lbl: 'Autonomous Rotation' }
    ];

    badges.forEach((b, i) => {
      const bx = 1.0 + i * 2.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx,
        y: 3.8,
        w: 1.85,
        h: 0.95,
        rectRadius: 0.1,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });
      slide.addText(b.num, {
        x: bx,
        y: 3.9,
        w: 1.85,
        h: 0.45,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: C.accentGreen,
        align: 'center'
      });
      slide.addText(b.lbl, {
        x: bx,
        y: 4.35,
        w: 1.85,
        h: 0.3,
        fontSize: 9,
        fontFace: 'Arial',
        color: C.textDim,
        align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 2: EXECUTIVE SUMMARY & ARCHITECTURE
  // ==========================================
  {
    const slide = addBaseSlide(
      'System Architecture: How the Platform Operates',
      'Autonomous 6-tier pipeline transforming unstructured web & gazette noise into structured decision-ready intelligence.'
    );

    const steps = [
      { step: '01', title: 'Source Rotation', desc: 'Cycles across 70+ verified portals (regulators, DFIs, press) using round-robin cursor batches.' },
      { step: '02', title: 'Deep Extraction', desc: 'Parses article HTML & unpdf extracts text from official PDF statutory gazettes and tariff schedules.' },
      { step: '03', title: 'Freshness & Jaccard', desc: 'Strict 30-day freshness filter + 3-tier canonical hash & word-token deduplication.' },
      { step: '04', title: 'Disambiguation', desc: 'Excludes political/sports metaphors (e.g. "election power") while enforcing genuine energy entities.' },
      { step: '05', title: 'Gemini 2.5 Analysis', desc: 'Structured schema extraction: relevance scoring, risk tiers, stakeholder extraction & strategic action note.' },
      { step: '06', title: 'Distribution', desc: 'Feeds live intelligence, triggers high-risk email alerts, updates trend curves & executive briefs.' }
    ];

    steps.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 2.85;
      const y = 1.45 + row * 1.75;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 2.7,
        h: 1.55,
        rectRadius: 0.1,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addText(s.step, {
        x: x + 0.15,
        y: y + 0.15,
        w: 0.5,
        h: 0.3,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: C.accentGreen
      });

      slide.addText(s.title, {
        x: x + 0.7,
        y: y + 0.15,
        w: 1.85,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(s.desc, {
        x: x + 0.15,
        y: y + 0.52,
        w: 2.4,
        h: 0.9,
        fontSize: 9,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 12
      });
    });
  }

  // ==========================================
  // SLIDE 3: LIVE INTELLIGENCE FEED (FEATURE & SCREENSHOT)
  // ==========================================
  {
    const slide = addBaseSlide(
      'Live Intelligence Feed & Real-Time Alert Stream',
      'Unified command dashboard monitoring continuous captures across Zimbabwe energy sector pillars.',
      'FEATURE 01: MONITORING COMMAND'
    );

    // Left screenshot
    const imgPath = path.join(assetDir, 'live-feed.png');
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 0.8,
        y: 1.4,
        w: 5.3,
        h: 3.65
      });
    }

    // Right side callout cards
    const sideCards = [
      {
        title: 'Real-Time Triage Tagger',
        desc: 'Articles tagged instantly as CRITICAL (85%+), MEDIUM, or LOW, with automatic action note generation for investment directors.',
        color: C.accentRose
      },
      {
        title: 'Critical Alert Sidebar',
        desc: 'Dedicated high-priority feed highlighting immediate regulatory hazards, IPP grid licenses, and SAPP power pool shifts.',
        color: C.accentAmber
      },
      {
        title: 'Review Memo & Audit Trail',
        desc: 'Allows analysts to verify captures, dispatch executive alerts via Resend API, and log reviewer identity.',
        color: C.accentMint
      }
    ];

    sideCards.forEach((c, idx) => {
      const y = 1.4 + idx * 1.25;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.3,
        y,
        w: 2.9,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 6.45,
        y: y + 0.18,
        w: 0.12,
        h: 0.12,
        fill: { color: c.color },
        line: { color: c.color }
      });

      slide.addText(c.title, {
        x: 6.65,
        y: y + 0.12,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(c.desc, {
        x: 6.45,
        y: y + 0.42,
        w: 2.6,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 4: TREND & RISK SIGNALS (FEATURE & SCREENSHOT)
  // ==========================================
  {
    const slide = addBaseSlide(
      'Trends & Risk Signals: Phase C Predictive Telemetry',
      'Multi-source statistical velocity, category breakdowns, and active stakeholder co-occurrence.',
      'FEATURE 02: ADVANCED ANALYTICS'
    );

    // Left screenshot
    const imgPath = path.join(assetDir, 'trends-signals.png');
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 0.8,
        y: 1.4,
        w: 5.3,
        h: 3.65
      });
    }

    // Right side callout cards
    const sideCards = [
      {
        title: 'Multi-Stream Signal Classification',
        desc: 'Quantifies market share between Tariff Revisions (22%), Operations & Grid (19%), Bilateral Deals (18%), and Statutory Gazettes (11%).',
        color: C.accentMint
      },
      {
        title: 'Risk Exposure Tiering',
        desc: 'Instant visual breakdown of High Alert (61%), Moderate Action (29%), and Informational captures across rolling 14-day windows.',
        color: C.accentRose
      },
      {
        title: 'Stakeholder Co-occurrence Matrix',
        desc: 'Identifies which entities (ZERA, Ministry of Energy, The Herald, AfDB) drive disclosures, with sentiment classification.',
        color: C.accentCyan
      }
    ];

    sideCards.forEach((c, idx) => {
      const y = 1.4 + idx * 1.25;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.3,
        y,
        w: 2.9,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 6.45,
        y: y + 0.18,
        w: 0.12,
        h: 0.12,
        fill: { color: c.color },
        line: { color: c.color }
      });

      slide.addText(c.title, {
        x: 6.65,
        y: y + 0.12,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(c.desc, {
        x: 6.45,
        y: y + 0.42,
        w: 2.6,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 5: EXECUTIVE REPORTS & BRIEFING CADENCE (FEATURE & SCREENSHOT)
  // ==========================================
  {
    const slide = addBaseSlide(
      'Automated Executive Reports & Briefing Cadence',
      'AI-synthesized Daily, Weekly, and Monthly strategic dossiers with 1-click printable PDF generation.',
      'FEATURE 03: EXECUTIVE REPORTING'
    );

    // Left screenshot
    const imgPath = path.join(assetDir, 'executive-reports.png');
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 0.8,
        y: 1.4,
        w: 5.3,
        h: 3.65
      });
    }

    // Right side callout cards
    const sideCards = [
      {
        title: 'Multi-Cadence Intelligence Synthesis',
        desc: 'Generates Weekly Management Reports, Daily Briefings, and Monthly Board Dossiers aggregated from 119+ vetted captures.',
        color: C.accentMint
      },
      {
        title: 'Executive PDF Briefing Generator',
        desc: 'Serverless PDF export generates board-ready documents with executive summaries, pillar breakdowns, and action matrices.',
        color: C.accentBlue
      },
      {
        title: 'Historical Memory & Precedents',
        desc: 'Cross-references current regulatory disputes against past ZERA tariff precedents to predict subsequent policy shifts.',
        color: C.accentAmber
      }
    ];

    sideCards.forEach((c, idx) => {
      const y = 1.4 + idx * 1.25;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.3,
        y,
        w: 2.9,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 6.45,
        y: y + 0.18,
        w: 0.12,
        h: 0.12,
        fill: { color: c.color },
        line: { color: c.color }
      });

      slide.addText(c.title, {
        x: 6.65,
        y: y + 0.12,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(c.desc, {
        x: 6.45,
        y: y + 0.42,
        w: 2.6,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 6: FOOD-WATER-ENERGY NEXUS (FEATURE & SCREENSHOT)
  // ==========================================
  {
    const slide = addBaseSlide(
      'Food-Water-Energy Nexus & Circular Economy',
      'Dedicated deliverable tracking agricultural irrigation, Kariba dam hydrological releases, and biogas waste-to-energy.',
      'FEATURE 04: NEXUS DELIVERABLE'
    );

    // Left screenshot
    const imgPath = path.join(assetDir, 'nexus.png');
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 0.8,
        y: 1.4,
        w: 5.3,
        h: 3.65
      });
    }

    // Right side callout cards
    const sideCards = [
      {
        title: 'Dedicated Nexus Intelligence Stream',
        desc: 'Monitors ZINWA water allocations, solar-powered agricultural pumping schemes, and municipal wastewater treatment PPAs.',
        color: C.accentMint
      },
      {
        title: 'Priority Offtaker Focus',
        desc: 'Pinpoints off-grid agro-processing plants, commercial farming estates, and mining captive power requirements.',
        color: C.accentGreen
      },
      {
        title: 'Waste-to-Energy & Biogas Tracking',
        desc: 'Monitors municipal solid waste digestion, biomass gasification projects, and circular economy grant funding across SADC.',
        color: C.accentCyan
      }
    ];

    sideCards.forEach((c, idx) => {
      const y = 1.4 + idx * 1.25;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.3,
        y,
        w: 2.9,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 6.45,
        y: y + 0.18,
        w: 0.12,
        h: 0.12,
        fill: { color: c.color },
        line: { color: c.color }
      });

      slide.addText(c.title, {
        x: 6.65,
        y: y + 0.12,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(c.desc, {
        x: 6.45,
        y: y + 0.42,
        w: 2.6,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 7: EVENTS, WORKSHOPS & FUNDING OPPORTUNITIES (FEATURE & SCREENSHOT)
  // ==========================================
  {
    const slide = addBaseSlide(
      'Events, Workshops & Funding Opportunities Tracker',
      'Proactive monitoring of RFPs, EOIs, climate financing facilities, and regional energy forums.',
      'FEATURE 05: CAPITAL & ENGAGEMENT'
    );

    // Left screenshot
    const imgPath = path.join(assetDir, 'events-funding.png');
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 0.8,
        y: 1.4,
        w: 5.3,
        h: 3.65
      });
    }

    // Right side callout cards
    const sideCards = [
      {
        title: 'Active Calls & Tenders (19 Tracked)',
        desc: 'Surveys PRAZ gazettes, SAPP requests for proposals, and multilateral project preparation facilities.',
        color: C.accentAmber
      },
      {
        title: 'Commercial & Advisory Priority',
        desc: 'Flags direct advisory, co-development, and equity investment entry points for Hermit Sustainability Advisory.',
        color: C.accentMint
      },
      {
        title: 'Automated Deadline Tracking',
        desc: 'Extracts submission deadlines, RFP reference numbers, and qualification criteria directly from scanned documents.',
        color: C.accentBlue
      }
    ];

    sideCards.forEach((c, idx) => {
      const y = 1.4 + idx * 1.25;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.3,
        y,
        w: 2.9,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 6.45,
        y: y + 0.18,
        w: 0.12,
        h: 0.12,
        fill: { color: c.color },
        line: { color: c.color }
      });

      slide.addText(c.title, {
        x: 6.65,
        y: y + 0.12,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      slide.addText(c.desc, {
        x: 6.45,
        y: y + 0.42,
        w: 2.6,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textDim,
        lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 8: INGESTION HARDENING & RECENT ENHANCEMENTS
  // ==========================================
  {
    const slide = addBaseSlide(
      'Deep Dive: Ingestion Hardening & Intelligent Rotation',
      'Addressing platform efficiency, eliminating crawl loops, and filtering out-of-date press archives.',
      'TECHNICAL HIGHLIGHT'
    );

    const pillars = [
      {
        num: '01',
        title: 'Automated Round-Robin Rotation',
        points: [
          'Eliminates single-portal stagnation (e.g. repetitive ZERA crawling)',
          'Pairs 1 anchor authority (ZERA/Herald/SAPP) with 3 rotating secondary sources per batch',
          'Autonomous crawl cycling requires zero manual dashboard intervention'
        ]
      },
      {
        num: '02',
        title: '30-Day Freshness Verification',
        points: [
          'Extracts and validates publication dates across 5+ date formats',
          'Rejects legacy archives (e.g. 2023 notices) before AI processing',
          'Protects against future clock skew and unverified republishing'
        ]
      },
      {
        num: '03',
        title: 'Deep Gazette & PDF Scraping',
        points: [
          'Uses serverless unpdf to extract text directly from Statutory Instruments',
          'Regex recognition for SI numbers (e.g. SI 184) and tariff schedules',
          'Strips HTML boilerplate (ads, navigation, footers) to maximize Gemini context'
        ]
      },
      {
        num: '04',
        title: 'Energy Disambiguation Engine',
        points: [
          'Excludes political/sports metaphors ("political powerhouse", "ball of energy")',
          'Validates presence of official entities (ZERA, ZETDC, Kariba, IPPs)',
          'Mandates technical metrics (MW, kWh, cents/kWh, PPA) for general articles'
        ]
      }
    ];

    pillars.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 4.3;
      const y = 1.45 + row * 1.75;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 4.1,
        h: 1.55,
        rectRadius: 0.1,
        fill: { color: C.cardBg },
        line: { color: '064E3B', width: 1 }
      });

      slide.addText(p.num, {
        x: x + 0.2,
        y: y + 0.15,
        w: 0.5,
        h: 0.3,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: C.accentMint
      });

      slide.addText(p.title, {
        x: x + 0.7,
        y: y + 0.15,
        w: 3.2,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });

      p.points.forEach((pt, pIdx) => {
        slide.addText(`•  ${pt}`, {
          x: x + 0.2,
          y: y + 0.5 + pIdx * 0.3,
          w: 3.7,
          h: 0.28,
          fontSize: 8.5,
          fontFace: 'Arial',
          color: C.textDim,
          lineSpacing: 10
        });
      });
    });
  }

  // ==========================================
  // SLIDE 9: INDUSTRIAL READINESS & CONCLUSION
  // ==========================================
  {
    const slide = addBaseSlide(
      'Industrial Readiness & Enterprise Deployment',
      'Hardened for production scaling, zero-downtime operations, and executive leadership reliance.',
      'SUMMARY & ROADMAP'
    );

    // Left Column: Key Achievements
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.45,
      w: 4.1,
      h: 3.4,
      rectRadius: 0.1,
      fill: { color: C.cardBg },
      line: { color: '064E3B', width: 1 }
    });

    slide.addText('HARDENED CAPABILITIES', {
      x: 1.05,
      y: 1.65,
      w: 3.6,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: C.accentGreen
    });

    const items = [
      { t: 'Security & Auth Fail-Closed', d: 'Production routes block unauthenticated crawlers with timing-safe secrets and strict RLS.' },
      { t: 'Distributed Reliability', d: 'Upstash Redis distributed rate-limiting with graceful in-memory fallback.' },
      { t: '3-Tier Deduplication', d: 'Jaccard similarity + headline normalization eliminates wire-syndicated duplicate noise.' },
      { t: 'Full CI/CD Pipeline', d: 'Automated GitHub Actions linting, strict TypeScript checks, and multi-worker builds.' }
    ];

    items.forEach((it, i) => {
      slide.addText(`${i + 1}. ${it.t}`, {
        x: 1.05,
        y: 2.05 + i * 0.68,
        w: 3.6,
        h: 0.25,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });
      slide.addText(it.d, {
        x: 1.05,
        y: 2.3 + i * 0.68,
        w: 3.6,
        h: 0.38,
        fontSize: 8,
        fontFace: 'Arial',
        color: C.textDim
      });
    });

    // Right Column: Value Delivered
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.1,
      y: 1.45,
      w: 4.1,
      h: 3.4,
      rectRadius: 0.1,
      fill: { color: C.cardBg },
      line: { color: '064E3B', width: 1 }
    });

    slide.addText('BUSINESS VALUE DELIVERED', {
      x: 5.35,
      y: 1.65,
      w: 3.6,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: C.accentMint
    });

    const values = [
      { t: 'First-Mover Advantage', d: 'Captures regulatory changes and tariff hearings hours before mainstream business press.' },
      { t: 'Executive Time Savings', d: 'Replaces hours of manual web scanning with AI-synthesized morning briefs and PDF dossiers.' },
      { t: 'Predictive Policy Insight', d: 'Connects current grid decisions to historical precedents, anticipating off-taker behavior.' },
      { t: 'Complete SADC Coverage', d: 'Monitors regional interconnection through SAPP, Eskom imports, and cross-border PPAs.' }
    ];

    values.forEach((v, i) => {
      slide.addText(`✔  ${v.t}`, {
        x: 5.35,
        y: 2.05 + i * 0.68,
        w: 3.6,
        h: 0.25,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: C.textWhite
      });
      slide.addText(v.d, {
        x: 5.35,
        y: 2.3 + i * 0.68,
        w: 3.6,
        h: 0.38,
        fontSize: 8,
        fontFace: 'Arial',
        color: C.textDim
      });
    });
  }

  // Save the presentation
  const outputPath = path.resolve(__dirname, '../Hermit_Platform_Intelligence_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation generated successfully: ${outputPath}`);
}

createDeck().catch(err => {
  console.error('Failed to create presentation:', err);
  process.exit(1);
});
