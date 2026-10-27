import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = Document()

    # Set margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Colors
    c_navy = RGBColor(14, 43, 62)       # Primary #0E2B3E
    c_emerald = RGBColor(16, 124, 65)   # Secondary #107C41
    c_charcoal = RGBColor(40, 40, 40)   # Body text
    c_muted = RGBColor(100, 100, 100)   # Subtitles / meta

    # Set normal style font
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = c_charcoal

    # Helper functions
    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # Document Header / Title
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(0)
    p_pre.paragraph_format.space_after = Pt(2)
    run_pre = p_pre.add_run("HERMIT SUSTAINABILITY ADVISORY")
    run_pre.font.size = Pt(10)
    run_pre.font.bold = True
    run_pre.font.color.rgb = c_emerald

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("Active Funding Opportunities & Project Preparation Facilities")
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = c_navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run("Strategic Capital Matching for the Quad Nexus: Energy, Water, Food & Waste-to-Energy | October 2026")
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = c_muted

    # Callout Box: Context Summary
    table_box = doc.add_table(rows=1, cols=1)
    table_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_box.autofit = False
    table_box.columns[0].width = Inches(6.9)
    cell = table_box.rows[0].cells[0]
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    p_box = cell.paragraphs[0]
    p_box.paragraph_format.space_before = Pt(0)
    p_box.paragraph_format.space_after = Pt(4)
    r_box_title = p_box.add_run("Strategic Alignment & Context")
    r_box_title.bold = True
    r_box_title.font.size = Pt(11)
    r_box_title.font.color.rgb = c_navy

    p_box_body = cell.add_paragraph()
    p_box_body.paragraph_format.space_before = Pt(0)
    p_box_body.paragraph_format.space_after = Pt(0)
    p_box_body.add_run(
        "Hermit Sustainability Advisory is positioned uniquely across Africa at the Quad Nexus of Energy, Water, "
        "Food, and Waste-to-Energy. With core strengths in bankable project preparation (PVsyst hourly yield simulation, "
        "first-principles hydraulic modeling, Class 5 costing, ESIA scoping, and SPV structuring) as well as an active "
        "pipeline (Kariba 250–1,000 MW hydro-solar hybrid, Osborne 100 MW floating solar, Midlands 50 MW, Rufaro 50 MW, "
        "NRZ-CPF rooftop solar, and small hydro Odzani/Nyahode), funding must target Project Preparation Facilities (PPF), "
        "concessional climate capital, and catalytic grant windows. The 10 facilities below represent the highest-conviction active opportunities."
    )
    p_box_body.runs[0].font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # The 10 Opportunities
    opportunities = [
        {
            "num": "1",
            "name": "Sustainable Energy Fund for Africa (SEFA) – AfDB",
            "type": "Project Preparation Grants ($250,000 – $1,000,000+) & Concessional Debt/Equity",
            "thematic": "Green Baseload & Energy Efficiency (floating PV, hydro-solar hybridization, storage)",
            "requirements": [
                "Target project must be located in an African Development Bank (AfDB) regional member country (Zimbabwe is eligible).",
                "Proven technical feasibility and data integrity (Hermit's Class 5 cost accuracy, hourly PVsyst simulations, and hydraulic models directly satisfy this).",
                "Demonstrated developmental impact, GHG emissions abatement, and alignment with national clean energy compacts."
            ],
            "essential": (
                "SEFA has an explicit mandate prioritizing innovative hybridization (floating solar on hydro reservoirs and storage integration). "
                "Hermit's Kariba (250–1,000 MW) and Osborne Dam (100 MW) concepts are ideal candidates. Note: Approval cycles run 6–12 months."
            )
        },
        {
            "num": "2",
            "name": "Energy and Environment Partnership Trust Fund (EEP Africa)",
            "type": "Early-Stage Innovation & Feasibility Grants (€200,000 – €1,000,000)",
            "thematic": "Productive Use of Energy (PUE), Agricultural Nexus, Clean Cooking, and Waste-to-Energy",
            "requirements": [
                "Private sector developer or consortium incorporated/operating in Southern/East Africa (Zimbabwe is an active EEP country).",
                "Co-financing requirement: Applicants must typically provide 20% to 30% matching funds (can include approved in-kind contributions).",
                "Direct commercial viability path with clear social, environmental, and gender inclusion indicators."
            ],
            "essential": (
                "Highly accessible for locally-owned African businesses with competitive, transparent biannual calls. "
                "Highest fit for Hermit’s Water & Food pillars (PAYG solar pumping for farmers, municipal/agricultural waste-to-energy pilots)."
            )
        },
        {
            "num": "3",
            "name": "GET.invest Finance Readiness Support & Catalyst (EU-backed)",
            "type": "Non-Reimbursable Technical Assistance, Financial Modeling Validation & DFI Matchmaking",
            "thematic": "Decentralized Renewables, IPP Structuring, Commercial & Industrial (C&I) Solar",
            "requirements": [
                "Private clean energy project developers operating in Sub-Saharan Africa.",
                "Project at pre-feasibility, feasibility, or structuring stage with identified creditworthy off-takers or viable business model."
            ],
            "essential": (
                "Does not grant cash directly, but pays top-tier international transaction and legal specialists to audit models and SPV structures. "
                "Directly bridges Hermit to 40+ European DFIs and climate lenders without diluting equity."
            )
        },
        {
            "num": "4",
            "name": "Infrastructure Development Bank of Zimbabwe (IDBZ) – PPDF",
            "type": "Local & Foreign Currency Project Preparation Grants & Co-Funding ($50,000 – $500,000)",
            "thematic": "National Renewable Energy (Solar, Small-Hydro, Biomass) and Irrigation Infrastructure",
            "requirements": [
                "Zimbabwean project or SPV with statutory clearances underway (ZERA licensing, ZINWA abstraction rights, EMA ESIA).",
                "Proven promoter technical capacity and clear alignment with Zimbabwe National Energy Compact / Vision 2030."
            ],
            "essential": (
                "Direct Partner Advantage: IDBZ is already an established development partner in Hermit's profile. "
                "Offers the fastest domestic turnaround for permitting and preparing projects like Midlands 50 MW, Bushmead 10 MW, or Odzani/Nyahode small-hydro."
            )
        },
        {
            "num": "5",
            "name": "Water and Energy for Food (WE4F) Grand Challenge – S. Africa Hub",
            "type": "Non-Dilutive Innovation Grants ($50,000 – $500,000) & Acceleration Support",
            "thematic": "Interconnection of Clean Energy Solutions, Sustainable Water Resource Management, and Food Security",
            "requirements": [
                "Operating private enterprise with proven technology or service at the Water-Energy-Food nexus.",
                "Measurable indicators demonstrating water conservation, agricultural yield improvements, or post-harvest loss reduction."
            ],
            "essential": (
                "Perfect 1:1 match for Hermit’s Quad Nexus framework. Ideal vehicle to fund scaled rollouts of solar-powered water pumping, "
                "farmer PAYG irrigation models, and agricultural waste valorization."
            )
        },
        {
            "num": "6",
            "name": "Development Bank of Southern Africa (DBSA) – PPF",
            "type": "Project Preparation Capital & Replayable Grants for Feasibility Studies ($500k – $3M+)",
            "thematic": "SADC Regional Infrastructure, Cross-Border Power Integration, and SAPP-Interconnected IPPs",
            "requirements": [
                "SADC-based project with clear utility-scale grid integration and regional economic benefits.",
                "Sponsors must commit to bankable governance standards and transparent PPA / grid interconnection negotiations."
            ],
            "essential": (
                "Best suited for large multi-megawatt projects (Midlands 50 MW, Rufaro 50 MW, or Kariba phases) intended to feed into the ZETDC national grid "
                "or wheel power across borders via the Southern African Power Pool (SAPP) Day-Ahead Market."
            )
        },
        {
            "num": "7",
            "name": "Global Cleantech Innovation Programme (GCIP) – UNIDO / GEF",
            "type": "Enterprise Grants ($20,000 – $100,000), Incubation, and Global Investor Showcases",
            "thematic": "Cleantech Innovations in Renewable Energy, Energy Efficiency, and Waste-to-Energy Circular Economy",
            "requirements": [
                "Locally incorporated SME in an active GEF/UNIDO partner country (Zimbabwe is eligible).",
                "Demonstration of innovative clean technology applications with scalable commercial models."
            ],
            "essential": (
                "Hermit explicitly lists UNIDO as a development partner. Leveraging this relationship provides an immediate head start and high credibility "
                "during competitive GCIP national and regional cohorts."
            )
        },
        {
            "num": "8",
            "name": "Africa Enterprise Challenge Fund (AECF) – REACT Clean Energy",
            "type": "Catalytic Challenge Grants & Concessional Financing ($100,000 – $1,500,000)",
            "thematic": "Off-Grid & Distributed Clean Energy Access, Solar Agro-Processing, and Productive Use",
            "requirements": [
                "For-profit business operating in eligible African markets (including Zimbabwe and SADC).",
                "Proven positive impact on rural livelihoods, low-income communities, and smallholder farming clusters."
            ],
            "essential": (
                "Matches Hermit's distributed solutions—combining institutional/household NSF-certified water purification (eSpring rollout) "
                "with rural mini-grids and PAYG agricultural productive energy systems."
            )
        },
        {
            "num": "9",
            "name": "Climate Technology Centre and Network (CTCN) – Technical Assistance",
            "type": "Fully Funded Technical Assistance (up to $250,000 per intervention, Non-Reimbursable)",
            "thematic": "Climate Adaptation and Mitigation Technology Transfer, Grid Integration, and Clean Policy",
            "requirements": [
                "Requests must be submitted and endorsed via Zimbabwe's National Designated Entity (NDE)—the Climate Change Management Department.",
                "Demonstrated alignment with Zimbabwe’s Nationally Determined Contributions (NDC) under the Paris Agreement."
            ],
            "essential": (
                "Given Hermit’s role advising the Ministry of Energy on the Zimbabwe National Energy Compact and AU/SADC frameworks, "
                "Hermit can co-design national-level feasibility or floating solar master-plan studies with zero capital expenditure."
            )
        },
        {
            "num": "10",
            "name": "InfraCo Africa (Part of PIDG – Private Infrastructure Development Group)",
            "type": "Early-Stage Co-Development Risk Capital & Minority Equity ($500,000 – $5,000,000+)",
            "thematic": "Pioneering & High-Impact Renewable Infrastructure in Frontier African Markets",
            "requirements": [
                "Structured Special Purpose Vehicle (SPV) with long-term commercial operational intent.",
                "Strict compliance with international ESG standards (IFC Performance Standards).",
                "Pioneering asset class where commercial financiers require development risk to be absorbed first."
            ],
            "essential": (
                "The premier strategic partner for Hermit's flagship mega-projects: Kariba Floating Solar (250–1,000 MW) and Osborne Dam (100 MW). "
                "InfraCo acts as an active co-developer, unlocking subsequent senior debt from IFC, AfDB, and global climate funds."
            )
        }
    ]

    for opp in opportunities:
        p_h = doc.add_paragraph()
        p_h.paragraph_format.space_before = Pt(14)
        p_h.paragraph_format.space_after = Pt(2)
        r_num = p_h.add_run(f"{opp['num']}. ")
        r_num.font.bold = True
        r_num.font.size = Pt(13)
        r_num.font.color.rgb = c_emerald
        
        r_name = p_h.add_run(opp['name'])
        r_name.font.bold = True
        r_name.font.size = Pt(13)
        r_name.font.color.rgb = c_navy

        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_before = Pt(0)
        p_meta.paragraph_format.space_after = Pt(4)
        r_t_lbl = p_meta.add_run("Funding Type: ")
        r_t_lbl.font.bold = True
        r_t_lbl.font.size = Pt(9.5)
        r_t_val = p_meta.add_run(f"{opp['type']}\n")
        r_t_val.font.size = Pt(9.5)
        
        r_w_lbl = p_meta.add_run("Thematic Focus: ")
        r_w_lbl.font.bold = True
        r_w_lbl.font.size = Pt(9.5)
        r_w_val = p_meta.add_run(opp['thematic'])
        r_w_val.font.size = Pt(9.5)

        # Requirements bullets
        p_rq_title = doc.add_paragraph()
        p_rq_title.paragraph_format.space_before = Pt(4)
        p_rq_title.paragraph_format.space_after = Pt(2)
        r_rq_t = p_rq_title.add_run("Key Eligibility & Requirements:")
        r_rq_t.font.bold = True
        r_rq_t.font.size = Pt(10)
        r_rq_t.font.color.rgb = c_navy

        for rq in opp['requirements']:
            p_bullet = doc.add_paragraph(style='List Bullet')
            p_bullet.paragraph_format.space_before = Pt(0)
            p_bullet.paragraph_format.space_after = Pt(2)
            r_b = p_bullet.add_run(rq)
            r_b.font.size = Pt(9.5)

        # Essential Deciding Factors
        p_dec = doc.add_paragraph()
        p_dec.paragraph_format.space_before = Pt(4)
        p_dec.paragraph_format.space_after = Pt(10)
        r_d_lbl = p_dec.add_run("Strategic Fit & Decision Factors: ")
        r_d_lbl.font.bold = True
        r_d_lbl.font.size = Pt(9.5)
        r_d_lbl.font.color.rgb = c_emerald
        r_d_val = p_dec.add_run(opp['essential'])
        r_d_val.font.size = Pt(9.5)

    # Section 3: Summary Decision Matrix Table
    doc.add_page_break()

    p_tbl_h = doc.add_paragraph()
    p_tbl_h.paragraph_format.space_before = Pt(10)
    p_tbl_h.paragraph_format.space_after = Pt(4)
    r_th = p_tbl_h.add_run("Strategic Prioritization Matrix")
    r_th.font.size = Pt(16)
    r_th.font.bold = True
    r_th.font.color.rgb = c_navy

    p_tbl_desc = doc.add_paragraph()
    p_tbl_desc.paragraph_format.space_before = Pt(0)
    p_tbl_desc.paragraph_format.space_after = Pt(12)
    p_tbl_desc.add_run("Recommended deployment sequence matching Hermit’s portfolio assets to facility speed and mandate:")
    p_tbl_desc.runs[0].font.size = Pt(10)

    # Table creation
    headers = ["Facility", "Best Hermit Pipeline Asset", "Instrument", "Expected Turnaround", "Priority"]
    data = [
        ["IDBZ PPDF", "Midlands 50MW / Bushmead 10MW / Odzani", "Preparation Grant", "2 – 4 months", "Immediate"],
        ["GET.invest", "NRZ-CPF Portfolio / Midlands 50MW", "TA & DFI Access", "1 – 3 months", "Immediate"],
        ["EEP Africa", "Ag-Solar PUE / PAYG & Biogas Pilots", "Grant (€200k–€1M)", "4 – 6 months", "High"],
        ["WE4F Challenge", "Water Pumping / Irrigation & Ag Nexus", "Grant ($50k–$500k)", "3 – 6 months", "High"],
        ["AfDB SEFA", "Kariba / Osborne Floating Hydro-Hybrid", "PPF ($250k–$1M+)", "6 – 12 months", "Strategic"],
        ["InfraCo Africa", "Kariba 250–1000MW Floating Solar SPV", "Co-Dev Equity", "6 – 12 months", "Strategic"],
        ["UNIDO GCIP", "Waste-to-Energy Valorization Models", "Grant / Accelerator", "3 – 5 months", "Medium"],
        ["AECF REACT", "eSpring & Distributed Community PUE", "Challenge Grant", "4 – 6 months", "Medium"],
        ["DBSA PPF", "Rufaro / Midlands 50MW Grid Tied", "PPF Subsidized", "6 – 9 months", "Strategic"],
        ["CTCN (UNFCCC)", "National Floating Solar Master Plan", "TA Services ($250k)", "4 – 8 months", "Policy Co-Op"]
    ]

    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.4), Inches(2.1), Inches(1.3), Inches(1.1), Inches(1.0)]

    # Format header
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "0E2B3E")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(title)
        run.font.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(255, 255, 255)

    # Format rows
    for r_idx, row_data in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F9FBFD" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].width = col_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)
            p = row_cells[c_idx].paragraphs[0]
            if c_idx in [2, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(val)
            run.font.size = Pt(8.5)
            if c_idx == 4 and val in ["Immediate", "High"]:
                run.font.bold = True
                run.font.color.rgb = c_emerald

    # Actionable Next Steps
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    p_act = doc.add_paragraph()
    p_act.paragraph_format.space_before = Pt(8)
    p_act.paragraph_format.space_after = Pt(4)
    r_act = p_act.add_run("Recommended Immediate Action Plan")
    r_act.font.bold = True
    r_act.font.size = Pt(12)
    r_act.font.color.rgb = c_navy

    steps = [
        "Phase 1 (Month 1): Package Hermit’s existing PVsyst models, Class 5 CapEx estimates, and grid-connection studies into a standardized Project Information Memorandum (PIM) for the Midlands 50 MW and NRZ-CPF portfolio.",
        "Phase 2 (Month 1–2): Submit a formal application to GET.invest for financial model review and investor matchmaking; simultaneously engage IDBZ under the existing development partnership for PPDF feasibility co-funding.",
        "Phase 3 (Month 2–4): Prepare an SPV co-development concept note for the Kariba Floating Solar project and engage AfDB SEFA / InfraCo Africa as anchor project preparation financiers."
    ]

    for s in steps:
        p_s = doc.add_paragraph(style='List Bullet')
        p_s.paragraph_format.space_before = Pt(2)
        p_s.paragraph_format.space_after = Pt(2)
        r_s = p_s.add_run(s)
        r_s.font.size = Pt(9.5)

    # Save document
    output_path = r"C:\Users\Admin\OneDrive\Documents\PROJECTS\HERMIT\HERMIT_Active_Funding_Opportunities_Report.docx"
    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    create_document()
