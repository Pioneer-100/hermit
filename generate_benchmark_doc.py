"""
Updated script to generate HERMIT_COMPETITIVE_BENCHMARKING_AND_STRATEGIC_ANALYSIS.docx
Includes deep comparative benchmarking against:
- Global Incumbents (BloombergNEF, Wood Mackenzie)
- Regional African Portals (African Energy, ESI Africa)
- National Institutional & Academic Systems (NUST Market Intelligence AI & ZimTrade Portals)
- Horizontal Monitoring Tools (AlphaSense, Meltwater)
"""

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import datetime

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=110, bottom=110, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_callout(doc, text, title="STRATEGIC EXECUTIVE TAKEAWAY", color_hex="059669", bg_hex="F0FDF4"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{color_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"■  {title}")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = RGBColor.from_string(color_hex)
    
    p_body = cell.add_paragraph()
    p_body.paragraph_format.space_before = Pt(0)
    p_body.paragraph_format.space_after = Pt(2)
    p_body.paragraph_format.line_spacing = 1.15
    r_body = p_body.add_run(text)
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = RGBColor(51, 65, 85)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def format_row(row, bg_color=None, bold=False, font_size=9.5, text_color=RGBColor(30, 41, 59), alignments=None):
    for i, cell in enumerate(row.cells):
        if bg_color:
            set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=90, bottom=90, left=130, right=130)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            p.paragraph_format.line_spacing = 1.05
            if alignments and i < len(alignments):
                p.alignment = alignments[i]
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(font_size)
                r.font.bold = bold
                r.font.color.rgb = text_color

def create_benchmark_document(filename):
    doc = Document()
    
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
        s.different_first_page_header_footer = True
        
        footer = s.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run("HERMIT Intelligence Platform  |  Competitive Benchmarking & Strategic Analysis (incl. NUST Evaluation)")
        f_run.font.name = "Calibri"
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = RGBColor(148, 163, 184)

    # Color Palette
    c_brand = RGBColor(5, 150, 105)        # Emerald 600
    c_navy = RGBColor(14, 43, 62)          # Deep Navy
    c_accent = RGBColor(2, 132, 199)       # Sky 600
    c_slate = RGBColor(71, 85, 105)        # Slate 600
    c_charcoal = RGBColor(30, 41, 59)      # Slate 800

    # ----------------------------------------------------
    # COVER / TITLE SECTION
    # ----------------------------------------------------
    p_kicker = doc.add_paragraph()
    p_kicker.paragraph_format.space_before = Pt(10)
    p_kicker.paragraph_format.space_after = Pt(4)
    r_kick = p_kicker.add_run("HERMIT SUSTAINABILITY ADVISORY & CLIMATE CAPITAL PLATFORM")
    r_kick.bold = True
    r_kick.font.name = "Calibri"
    r_kick.font.size = Pt(10)
    r_kick.font.color.rgb = c_brand

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("Competitive Benchmarking & Strategic Market Analysis")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.color.rgb = c_navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("Comparative Evaluation of HERMIT Against Global Market Intelligence Platforms, Regional Energy Portals, and Sovereign Academic AI Systems (NUST Market Intelligence AI) | 2026 Strategic Advisory Review")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = c_slate

    # Metadata Strip
    meta_tbl = doc.add_table(rows=1, cols=4)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False
    col_widths = [Inches(1.7), Inches(1.7), Inches(1.7), Inches(1.8)]
    for row in meta_tbl.rows:
        for idx, w in enumerate(col_widths):
            row.cells[idx].width = w

    meta_items = [
        ("DOCUMENT TYPE", "Strategic Benchmark"),
        ("EVALUATION SCOPE", "SADC & Domestic AI/Data"),
        ("SPECIAL FOCUS", "NUST AI vs HERMIT Scope"),
        ("PUBLISHED", datetime.datetime.now().strftime("%B %Y"))
    ]
    for idx, (label, val) in enumerate(meta_items):
        cell = meta_tbl.rows[0].cells[idx]
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        r1 = p.add_run(f"{label}\n")
        r1.font.size = Pt(7.5)
        r1.font.bold = True
        r1.font.color.rgb = RGBColor(148, 163, 184)
        r2 = p.add_run(val)
        r2.font.size = Pt(9.5)
        r2.font.bold = True
        r2.font.color.rgb = c_navy

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Executive Callout
    add_callout(
        doc,
        "Including the newly unveiled NUST (National University of Science and Technology) Market Intelligence AI in this benchmark is essential. Developed with Netonline Media under Education 5.0, the NUST system represents the premier domestic sovereign AI initiative. However, this benchmark establishes that HERMIT and NUST's Market Intelligence AI operate in complementary rather than conflicting spheres: NUST addresses internal enterprise and institutional data silo fragmentation ('Insight Navigator'), whereas HERMIT is an externally focused, market-facing commercial engine tracking the Quad-Nexus (Energy, Water, Food, Waste-to-Energy), regulatory gazettes, and private deal origination.",
        title="EXECUTIVE BENCHMARK & STRATEGIC POSITIONING TAKEAWAY"
    )

    # ----------------------------------------------------
    # SECTION 1: PLATFORM PROFILE & ARCHITECTURE
    # ----------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("1. HERMIT Platform Architecture & Capabilities")
    r_h1.bold = True
    r_h1.font.size = Pt(13)
    r_h1.font.color.rgb = c_navy

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(8)
    p_body.add_run(
        "HERMIT was engineered as an automated intelligence command center specifically designed for the Southern African clean energy transition and green industrialization. Unlike static databases or broad web aggregators, HERMIT tightly integrates data ingestion, generative classification, and deal-level advisory workflows."
    )

    arch_tbl = doc.add_table(rows=6, cols=3)
    arch_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    arch_tbl.autofit = False
    set_table_borders(arch_tbl)
    widths = [Inches(1.8), Inches(2.2), Inches(2.9)]
    for row in arch_tbl.rows:
        for i, w in enumerate(widths):
            row.cells[i].width = w

    headers = ["Architecture Layer", "Technical Stack", "Commercial Capability"]
    for i, h in enumerate(headers):
        arch_tbl.rows[0].cells[i].paragraphs[0].text = h
    format_row(arch_tbl.rows[0], bg_color="0F172A", bold=True, font_size=9.5, text_color=RGBColor(255, 255, 255))

    arch_data = [
        ("Multi-Tier Ingestion", "SerpApi + Targeted RSS + Custom Crawlers (ZERA, ZETDC, SAPP, AfDB)", "24/7 autonomous scanning across 50+ localized SADC regulatory, utility, and tender portals."),
        ("AI Synthesis & Impact Engine", "Gemini 2.5/Flash AI + Extraction Pipelines", "Parses stakeholders, capacity (MW/m³), funding brackets, deadlines, and derives direct commercial impact."),
        ("Quad-Nexus Taxonomy", "Dedicated Multi-Vector Classifier (Energy, Water, Food, Waste)", "Connects cross-sector causality (e.g., Kariba water scarcity driving agro-solar captive demand)."),
        ("Advisory Tooling Suite", "Executive Daily Brief Synthesizer + AI Advisory Copilot + Export Engine", "Transforms raw intelligence into board briefs, investment memos, and DOCX/PDF reports in seconds."),
        ("Cloud-Native UI/Backend", "Next.js 15 (App Router) + Supabase Edge PostgreSQL + TailwindCSS", "Sub-second response, real-time alert triage, and enterprise-grade security.")
    ]

    for idx, data in enumerate(arch_data):
        row = arch_tbl.rows[idx + 1]
        for c_idx, val in enumerate(data):
            row.cells[c_idx].paragraphs[0].text = val
        bg = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        format_row(row, bg_color=bg, bold=(c_idx == 0), font_size=9, text_color=c_charcoal)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ----------------------------------------------------
    # SECTION 2: WHY BENCHMARK AGAINST NUST'S SYSTEM?
    # ----------------------------------------------------
    h_nust = doc.add_paragraph()
    h_nust.paragraph_format.space_before = Pt(14)
    h_nust.paragraph_format.space_after = Pt(6)
    r_nust = h_nust.add_run("2. Special Evaluation: NUST's Market Intelligence AI System")
    r_nust.bold = True
    r_nust.font.size = Pt(13)
    r_nust.font.color.rgb = c_navy

    p_n1 = doc.add_paragraph()
    p_n1.paragraph_format.line_spacing = 1.15
    p_n1.paragraph_format.space_after = Pt(6)
    p_n1.add_run(
        "Yes, including NUST's recently unveiled Market Intelligence AI system in this benchmark is critical. Developed under the aegis of Zimbabwe's Heritage-Based Education 5.0 and in collaboration with Netonline Media Limited (founded by Isaiah Bizabani), the NUST platform has gained significant institutional visibility within Zimbabwean government, academic, and industrial circles."
    )

    p_n2 = doc.add_paragraph()
    p_n2.paragraph_format.line_spacing = 1.15
    p_n2.paragraph_format.space_after = Pt(8)
    p_n2.add_run(
        "Benchmarking against NUST is vital for three strategic reasons:\n"
        "1. Brand & Policy Association: Stakeholders in Zimbabwe (ministries, ZERA, ZESA, local banks) will inevitably ask whether HERMIT duplicates or diverges from NUST's publicly announced AI intelligence efforts.\n"
        "2. Architectural Differentiation: Clarifying the fundamental difference between internal institutional data un-siloing (NUST) vs. external market-facing deal origination (HERMIT).\n"
        "3. Partnership vs. Competition Positioning: NUST represents the country's foremost renewable energy training hub (over 800 ZESA technicians trained, SOLTRAIN regional demonstration hub, and campus 5MW PV farm). A clear benchmark turns a perceived competitor into a primary strategic partner."
    )

    # Comparison Table between HERMIT and NUST
    nust_tbl = doc.add_table(rows=7, cols=3)
    nust_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    nust_tbl.autofit = False
    set_table_borders(nust_tbl)
    n_widths = [Inches(1.8), Inches(2.55), Inches(2.55)]
    for row in nust_tbl.rows:
        for i, w in enumerate(n_widths):
            row.cells[i].width = w

    n_headers = ["Comparison Dimension", "HERMIT Intelligence Platform", "NUST Market Intelligence AI"]
    for i, h in enumerate(n_headers):
        nust_tbl.rows[0].cells[i].paragraphs[0].text = h
    format_row(nust_tbl.rows[0], bg_color="0F172A", bold=True, font_size=9.5, text_color=RGBColor(255, 255, 255))

    nust_comparison_data = [
        ("Primary Objective", "Commercial climate capital origination, IPP tracking, and cross-border SADC investment advisory.", "Internal operational integration; dismantling fragmented data silos across departments."),
        ("Core Data Ingestion", "External web scraping (ZERA, ZETDC, SAPP, DFI tenders, official gazettes, news).", "Internal enterprise databases, academic metrics, ERP/financial records, and administrative logs."),
        ("Key AI Feature", "Gemini-powered Impact Scoring, funding deadline tracking, and Quad-Nexus deal classification.", "'Insight Navigator'—cross-departmental pattern recognition and automated institutional reporting."),
        ("Sector Focus", "Specialized Quad-Nexus: Renewable Energy, Water Security, Agri-Food, and Waste-to-Energy.", "Sector-agnostic institutional infrastructure (Higher education, municipal management, enterprise ERP)."),
        ("Target End-Users", "Project Developers (IPPs), Climate Funds, DFIs (AfDB, IFC), Corporate Offtakers, and Advisors.", "University Vice-Chancellors, registrars, bursars, municipal authorities, and institutional executives."),
        ("Relationship to Market", "External intelligence radar monitoring market opportunities, tariff changes, and regulations.", "Internal operational nervous system aligning institutional data with national Education 5.0 policy.")
    ]

    for idx, data in enumerate(nust_comparison_data):
        row = nust_tbl.rows[idx + 1]
        for c_idx, val in enumerate(data):
            row.cells[c_idx].paragraphs[0].text = val
        bg = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        format_row(row, bg_color=bg, bold=(c_idx == 0), font_size=9, text_color=c_charcoal)
        if c_idx == 1:
            set_cell_background(row.cells[1], "ECFDF5" if idx % 2 == 0 else "D1FAE5")

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Strategic callout on NUST
    add_callout(
        doc,
        "Strategic Verdict on NUST: HERMIT does not compete with NUST's Market Intelligence AI; HERMIT completes the external half of the intelligence equation. NUST solves internal operational inefficiency ('What is happening inside our institution?'), while HERMIT solves commercial market uncertainty ('Where are the capital, regulatory, and deal opportunities outside our institution?'). HERMIT should seek a formal MoU with NUST to ingest campus solar telemetry and collaborate on SADC-wide clean-tech workforce data.",
        title="NUST BENCHMARK TAKEAWAY: COMPLEMENTARY SYNERGY, NOT COMPETITION",
        color_hex="0284C7",
        bg_hex="F0F9FF"
    )

    # ----------------------------------------------------
    # SECTION 3: THE BROADER COMPETITIVE PEER GROUPS
    # ----------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)
    r_h3 = h3.add_run("3. The Extended Competitive Landscape (Global, Regional & Domestic)")
    r_h3.bold = True
    r_h3.font.size = Pt(13)
    r_h3.font.color.rgb = c_navy

    p_p = doc.add_paragraph()
    p_p.paragraph_format.line_spacing = 1.15
    p_p.paragraph_format.space_after = Pt(8)
    p_p.add_run(
        "To provide an exhaustive strategic appraisal, HERMIT is benchmarked across five distinct peer groups:"
    )

    peer_groups = [
        ("Group 1: Global Clean Energy Incumbents (BloombergNEF, Wood Mackenzie)",
         "Strengths: Immense global econometric models, high credibility with Wall Street/European syndicates.\nWeaknesses: Cost-prohibitive (\$25k–\$80k/yr); virtually zero coverage of Zimbabwean or SADC sub-50MW transactions; blind to municipal off-taker risks."),
        
        ("Group 2: Regional African Energy & Infrastructure Press (African Energy, ESI Africa)",
         "Strengths: Decades of African journalistic relationships, strong regional conference footprints.\nWeaknesses: Manual, slow editorial models; lack automated AI impact scoring, tender deadline trackers, or interactive deal copilots."),
        
        ("Group 3: National Institutional & Trade Platforms (NUST Market Intelligence AI & ZimTrade)",
         "Strengths: Strong domestic sovereign standing, backed by national policy (Education 5.0, National Export Strategy), direct government relationships.\nWeaknesses: NUST focuses on internal operational ERP data; ZimTrade focuses on export goods/tariffs without renewable energy project finance or grid-wheeling tracking."),
        
        ("Group 4: Climate Finance & Blended Capital Trackers (Convergence Finance, CPI)",
         "Strengths: High domain depth in concessional capital structures and DFI guarantees.\nWeaknesses: Retrospective case studies (published 6–12 months after financial close); no continuous real-time regulatory or project monitoring."),
        
        ("Group 5: Horizontal AI Enterprise Intelligence (AlphaSense, Meltwater)",
         "Strengths: Massive web crawls, strong keyword alerting.\nWeaknesses: High noise-to-signal ratio; no clean-energy context or Quad-Nexus sector alignment.")
    ]

    for title, desc in peer_groups:
        p_group = doc.add_paragraph()
        p_group.paragraph_format.space_before = Pt(4)
        p_group.paragraph_format.space_after = Pt(2)
        r_gt = p_group.add_run(f"■  {title}")
        r_gt.bold = True
        r_gt.font.size = Pt(10)
        r_gt.font.color.rgb = c_brand

        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_before = Pt(0)
        p_desc.paragraph_format.space_after = Pt(6)
        p_desc.paragraph_format.line_spacing = 1.15
        r_desc = p_desc.add_run(desc)
        r_desc.font.size = Pt(9.5)
        r_desc.font.color.rgb = c_charcoal

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ----------------------------------------------------
    # SECTION 4: MASTER 6-WAY BENCHMARK MATRIX
    # ----------------------------------------------------
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)
    r_h4 = h4.add_run("4. Comprehensive 6-Platform Feature & Capability Matrix")
    r_h4.bold = True
    r_h4.font.size = Pt(13)
    r_h4.font.color.rgb = c_navy

    matrix_tbl = doc.add_table(rows=11, cols=6)
    matrix_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    matrix_tbl.autofit = False
    set_table_borders(matrix_tbl)
    m_widths = [Inches(1.6), Inches(1.1), Inches(1.05), Inches(1.05), Inches(1.05), Inches(1.05)]
    for row in matrix_tbl.rows:
        for i, w in enumerate(m_widths):
            row.cells[i].width = w

    m_headers = ["Evaluation Metric", "HERMIT", "NUST System", "BloombergNEF", "African Energy", "ZimTrade"]
    for i, h in enumerate(m_headers):
        matrix_tbl.rows[0].cells[i].paragraphs[0].text = h
    format_row(matrix_tbl.rows[0], bg_color="0E2B3E", bold=True, font_size=8.5, text_color=RGBColor(255, 255, 255))

    m_rows = [
        ("Zimbabwe / SADC Focus", "Ultra-High (Native)", "Ultra-High (Internal)", "Very Low (Macro only)", "Medium (Regional)", "High (Export trade)"),
        ("Quad-Nexus Taxonomy", "Native (Energy/Water/Food/Waste)", "None (ERP/Education)", "None (Siloed power)", "Partial (News articles)", "None (Commodities)"),
        ("Data Orientation", "External Market Intelligence", "Internal Enterprise Data", "Global Industry Data", "Editorial Articles", "National Export Stats"),
        ("Update Frequency", "Continuous / 24-hr SerpApi", "Event-driven / Database", "Analyst updates", "Weekly / Periodic", "Quarterly / Static"),
        ("AI Commercial Impact", "Automated (Gemini-driven)", "Insight Navigator (ERP)", "Manual Commentary", "Editorial Only", "Manual Market Briefs"),
        ("Funding / Tender Tracker", "Active Deadlines & PPFs", "None", "M&A Deals (Closed)", "General notices", "Export market leads"),
        ("Advisory Export Engine", "Automated (DOCX / PDF)", "Internal Reports", "Data download", "PDF Magazines", "Static PDF Guides"),
        ("AI Conversational Copilot", "Integrated Deal Copilot", "Departmental Search", "None", "None", "None"),
        ("Cost of Access", "Affordable SaaS Tiering", "Institutional / Academic", "Very High ($25k–$80k)", "Medium ($1.5k–$4k)", "Free / Subsidized"),
        ("Target End-User Fit", "100% (Clean Energy IPPs/DFIs)", "Institutional Management", "< 20% (Sub-Saharan IPPs)", "~ 50% (General context)", "< 20% (Energy Investors)")
    ]

    for idx, r_data in enumerate(m_rows):
        row = matrix_tbl.rows[idx + 1]
        for c_idx, val in enumerate(r_data):
            row.cells[c_idx].paragraphs[0].text = val
        bg = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        format_row(row, bg_color=bg, bold=(c_idx == 0 or c_idx == 1), font_size=8, text_color=c_charcoal)
        set_cell_background(row.cells[1], "ECFDF5" if idx % 2 == 0 else "D1FAE5")

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ----------------------------------------------------
    # SECTION 5: STRATEGIC IMPLICATIONS & ACTION PLAN
    # ----------------------------------------------------
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)
    r_h5 = h5.add_run("5. Strategic Positioning & Collaboration Opportunities")
    r_h5.bold = True
    r_h5.font.size = Pt(13)
    r_h5.font.color.rgb = c_navy

    actions = [
        ("Positioning Strategy: The Market-Facing External Edge",
         "When presenting HERMIT to local stakeholders, explicitly contrast HERMIT’s mission with NUST's: HERMIT is designed for cross-border deal-making, private IPP investment, and DFI capital matching. It does not replace internal operational AI systems; it serves as the external market radar."),
        
        ("Potential Institutional Collaboration with NUST",
         "NUST is Zimbabwe's primary solar technical hub (training ZESA staff, SOLTRAIN coordinator, 5MW campus solar farm). HERMIT can establish an academic partnership with NUST to:\n"
         "• Ingest telemetry and performance benchmarks from NUST’s 5MW solar project into HERMIT’s precedent tracker.\n"
         "• Provide NUST energy engineering and finance students with discounted platform research licenses.\n"
         "• Co-publish an annual 'State of the SADC Quad-Nexus' market report."),
        
        ("Commercial Tiering & Market Capture",
         "Capitalize on the vacuum left between \$50,000 global tools (BNEF) and internal academic AI systems (NUST) by rolling out structured B2B subscription licenses: Executive Intelligence Pass (\$450/month) for active project developers, and Institutional DFI Pass (\$2,500/month) with custom tender and regulatory alert dispatches.")
    ]

    for title, act_body in actions:
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(4)
        p_a.paragraph_format.space_after = Pt(2)
        r_at = p_a.add_run(f"✦  {title}")
        r_at.bold = True
        r_at.font.size = Pt(10)
        r_at.font.color.rgb = c_navy

        p_ab = doc.add_paragraph()
        p_ab.paragraph_format.space_before = Pt(0)
        p_ab.paragraph_format.space_after = Pt(6)
        p_ab.paragraph_format.line_spacing = 1.15
        r_ab = p_ab.add_run(act_body)
        r_ab.font.size = Pt(9.5)
        r_ab.font.color.rgb = c_charcoal

    # Final Strategic Callout
    add_callout(
        doc,
        "Conclusion: Incorporating NUST into HERMIT’s benchmarking strengthens HERMIT’s narrative. It proves the platform is intimately attuned to Zimbabwe’s domestic AI landscape while clearly highlighting that HERMIT’s market-facing Quad-Nexus intelligence fills a critical economic gap that no domestic university or global conglomerate currently addresses.",
        title="STRATEGIC BENCHMARK CONCLUSION",
        color_hex="0E2B3E",
        bg_hex="F1F5F9"
    )

    doc.save(filename)
    print(f"Document saved successfully as: {filename}")

if __name__ == "__main__":
    filename = "HERMIT_Platform_Competitive_Benchmarking_and_Strategic_Analysis_v2.docx"
    create_benchmark_document(filename)
