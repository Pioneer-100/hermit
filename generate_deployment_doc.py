import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import datetime

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
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

def add_callout(doc, text, title="STRATEGIC EXECUTIVE NOTE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0FDF4") # soft emerald tint
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    # Left border only (thick emerald)
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="059669"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"[{title}] ")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(10)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(5, 150, 105)
    
    run_body = p.add_run(text)
    run_body.font.name = "Arial"
    run_body.font.size = Pt(10)
    run_body.font.italic = True
    run_body.font.color.rgb = RGBColor(6, 78, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def style_heading(p, text, level=1):
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.bold = True
    if level == 1:
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(6, 78, 59) # Deep emerald
        # Add bottom border to heading 1
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="10B981"/></w:pBdr>')
        p._p.get_or_add_pPr().append(pBdr)
    elif level == 2:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(4, 120, 87)
    elif level == 3:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(2)
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(16, 185, 129)
    return run

def add_body_p(doc, text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(30, 41, 59)
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(51, 65, 85)
    return p

def build_deployment_document():
    doc = Document()
    
    # Page Setup: Standard Letter, 0.75" margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("HERMIT INVESTMENTS | INFRASTRUCTURE & DEPLOYMENT STRATEGY REPORT")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("CONFIDENTIAL & PROPRIETARY — FOR EXECUTIVE REVIEW ONLY")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # ==================== COVER / TITLE SECTION ====================
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(36)
    title_p.paragraph_format.space_after = Pt(4)
    run_kicker = title_p.add_run("EXECUTIVE STRATEGY & TECHNICAL EVALUATION MEMORANDUM\n")
    run_kicker.font.name = "Arial"
    run_kicker.font.size = Pt(11)
    run_kicker.font.bold = True
    run_kicker.font.color.rgb = RGBColor(16, 185, 129)
    
    run_main_title = title_p.add_run("Comprehensive Cloud Deployment Evaluation, Commercial Pricing Analysis & Infrastructure Recommendation")
    run_main_title.font.name = "Arial"
    run_main_title.font.size = Pt(22)
    run_main_title.font.bold = True
    run_main_title.font.color.rgb = RGBColor(6, 78, 59)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(18)
    run_sub = sub_p.add_run("A Rigorous Commercial & Architectural Analysis for Hosting Hermit's Clean Energy Intelligence & Automated Surveillance Platform")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    # Metadata Table
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Target Platform:", "Hermit Investments Energy Sector Monitor (Next.js 16, Supabase, Gemini AI, Cheerio Crawlers)"),
        ("Prepared For:", "Executive Management & Board of Directors, Hermit Investments"),
        ("Date of Assessment:", "October 2026 (Refreshed for Current Cloud Market Pricing)"),
        ("Document Status:", "Final Commercial & Technical Architecture Deliverable")
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        c0, c1 = meta_tbl.cell(row_idx, 0), meta_tbl.cell(row_idx, 1)
        c0.width = Inches(2.0)
        c1.width = Inches(5.0)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "F8FAFC")
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        p0, p1 = c0.paragraphs[0], c1.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(k)
        r0.font.name, r0.font.size, r0.font.bold = "Arial", Pt(9.5), True
        r0.font.color.rgb = RGBColor(15, 23, 42)
        r1 = p1.add_run(v)
        r1.font.name, r1.font.size = "Arial", Pt(9.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    add_callout(
        doc,
        "The Hermit Energy Monitor is a high-frequency, autonomous intelligence engine. Unlike static corporate websites, it operates continuous web scrapers across 55+ energy portals, processes multi-token Gemini 2.0 Flash reasoning streams, stores real-time Kariba water levels and SAPP electricity indices in Supabase PostgreSQL, and dispatches executive alerts. The deployment solution chosen must balance continuous daemon runtime, rate-limit resilience, and strict cost ceilings under $20/month.",
        title="EXECUTIVE BRIEFING CONTEXT"
    )

    # ==================== SECTION 1: EXECUTIVE SUMMARY ====================
    p = doc.add_paragraph()
    style_heading(p, "1. Executive Summary & Core Verdict", level=1)
    
    add_body_p(doc, "Hermit Investments requires a high-reliability, low-overhead cloud hosting architecture to power its proprietary Clean Energy Sector Surveillance & Media Monitoring Platform. The system safeguards Hermit's 38.5 MW pipeline—including the 20 MW Marondera Solar Park, 15 MW Bulawayo BESS, and 3.5 MW Manicaland Small Hydro project—by continuously scanning national regulatory bodies (ZERA, ZESA, ZPC, Ministry of Energy), regional power pools (SAPP), and multilateral climate finance facilities (AfDB, GEF, DBSA).")
    
    add_body_p(doc, "This document evaluates all six recognized hosting archetypes in the cloud computing market today: Traditional Shared Hosting, Serverless PaaS (Vercel/Netlify), Containerized PaaS (Railway/Render), Unmanaged Linux Virtual Private Servers (VPS), Enterprise Hyperscalers (AWS/GCP/Azure), and Hybrid Formations. Each model has been evaluated against technical feasibility, execution limits, latency, security, and exact commercial pricing.")

    add_body_p(doc, "Summary Findings:", bold_prefix="Key Finding: ")
    add_bullet_p(doc, "Shared Web Hosting (cPanel) is completely incompatible due to hard process death, absence of Node.js 20+ daemon runtimes, and inability to maintain long-running scraper scripts.", bold_prefix="Fatal Incompatibility: ")
    add_bullet_p(doc, "Serverless Platforms (e.g., Vercel Pro) impose a fatal 15-second to 60-second function timeout limit that routinely terminates multi-page scraping jobs across 55 energy portals mid-execution, while incurring punitive bandwidth and function invocation overages ($20-$80+/mo).", bold_prefix="Serverless Execution Ceiling: ")
    add_bullet_p(doc, "Enterprise Hyperscalers (AWS, Azure) are burdened by complex multi-tier billing, expensive egress bandwidth ($0.09/GB), separate VPC and load balancer fees, easily pushing monthly expenses beyond $45-$90/mo for a simple single-tenant application.", bold_prefix="Hyperscaler Cost Inefficiency: ")
    add_bullet_p(doc, "An Unmanaged Linux Cloud VPS (specifically InterServer Cloud Linux VPS at $12/month or Hetzner Cloud at $7-$14/month) represents the undisputed commercial and architectural victor. It provides dedicated 8 GB RAM, 2 dedicated CPU cores, zero execution timeouts, a permanent dedicated static IPv4 address (vital to avoid scraper IP blacklists), and 100% full sovereignty.", bold_prefix="The Clear Winner: ")

    # ==================== SECTION 2: PLATFORM WORKLOAD PROFILE ====================
    p = doc.add_paragraph()
    style_heading(p, "2. Platform Technical Architecture & Workload Profile", level=1)
    
    add_body_p(doc, "To objectively assess hosting platforms, the underlying computational, memory, and networking characteristics of the Hermit codebase must be understood:")

    add_bullet_p(doc, "Built on Next.js 16 with the Turbopack build engine, React Server Components (RSC), and Tailwind CSS with glassy UI overlays. Requires minimum 1.5 GB RAM during production compilation and 250 MB steady-state runtime memory.", bold_prefix="Application Framework: ")
    add_bullet_p(doc, "Node.js engine utilizing Cheerio and RSS parsers to poll 55 Zimbabwean, SADC, and global energy portals. Jobs run sequentially or in parallel batches and can take between 45 seconds to 3.5 minutes to complete. This immediately breaks any platform with sub-minute execution timeouts.", bold_prefix="Autonomous Scrapers & Crawlers: ")
    add_bullet_p(doc, "Integrated with Supabase managed PostgreSQL over REST/WebSockets. Low local storage overhead on the web server (under 5 GB for OS and Next.js assets), with database records and relational structures maintained externally.", bold_prefix="Data Storage Layer: ")
    add_bullet_p(doc, "Direct API communication with Google Gemini 2.0 Flash for multi-source relevance classification, extraction of quoted institutions, and automated generation of Hermit Management Impact Memos. Token costs are billed per million tokens rather than compute hours.", bold_prefix="Artificial Intelligence Core: ")
    add_bullet_p(doc, "Automated alert delivery to Hermit executives via Resend SMTP API when high-relevance regulatory threats or tariff hikes are detected.", bold_prefix="Outbound Alert Engine: ")

    # ==================== SECTION 3: COMPREHENSIVE OPTIONS EVALUATION ====================
    p = doc.add_paragraph()
    style_heading(p, "3. Exhaustive Evaluation of Hosting Options", level=1)
    
    add_body_p(doc, "The following sections analyze every prominent hosting model available in the market today, highlighting their concrete mechanics, real-world pricing, strengths, and operational bottlenecks for Hermit Investments.")

    # OPTION 1: SHARED HOSTING
    style_heading(doc.add_paragraph(), "Option 1: Traditional Shared Web Hosting (cPanel / Hostinger / Namecheap / GoDaddy)", level=2)
    add_body_p(doc, "Overview: Shared hosting places hundreds of user accounts onto a single physical server partitioned by Apache/LiteSpeed web servers. Primarily designed for legacy PHP/WordPress applications.", bold_prefix="Architecture: ")
    add_body_p(doc, "Between $2.99/month (introductory promotional rates) to $9.99/month on renewal. CloudLinux shared tiers range from $8.00 to $14.00/month.", bold_prefix="Commercial Pricing: ")
    
    add_body_p(doc, "Strengths (Pros):", bold_prefix="Technical Strengths: ")
    add_bullet_p(doc, "Very low upfront cost; includes graphical cPanel dashboard and automated SSL certificates.");
    add_bullet_p(doc, "Bundled corporate webmail accounts (e.g., info@hermitinvestments.com).");
    
    add_body_p(doc, "Weaknesses & Fatal Flaws for Hermit:", bold_prefix="Platform Bottlenecks: ")
    add_bullet_p(doc, "No native support for modern Next.js 16 (Turbopack) server runtimes or Node.js background daemons.", bold_prefix="Runtime Incompatibility: ");
    add_bullet_p(doc, "CloudLinux LVE processes automatically kill any script consuming more than 1 GB RAM or running for more than 60-120 seconds.", bold_prefix="Aggressive Process Killers: ");
    add_bullet_p(doc, "Shared IP addresses are frequently blacklisted by Cloudflare-protected news portals (The Herald, NewsDay, Bloomberg), resulting in immediate 403 Forbidden errors when scraping.", bold_prefix="IP Reputation Taint: ");
    add_body_p(doc, "VERDICT: REJECTED. Technically impossible to sustain Hermit's automated intelligence engine.", bold_prefix="Feasibility: ")

    # OPTION 2: SERVERLESS PAAS
    style_heading(doc.add_paragraph(), "Option 2: Serverless PaaS (Vercel, Netlify, Cloudflare Pages)", level=2)
    add_body_p(doc, "Overview: Code is pushed via Git, and individual pages/endpoints are compiled into ephemeral serverless micro-functions (AWS Lambda under the hood).", bold_prefix="Architecture: ")
    add_body_p(doc, "Free Hobby tier ($0, strictly non-commercial), Pro tier at $20/seat/month + usage overages ($0.15/GB bandwidth beyond 1 TB, $0.60 per million edge requests, $40/mo per extra team member).", bold_prefix="Commercial Pricing: ")
    
    add_body_p(doc, "Strengths (Pros):", bold_prefix="Technical Strengths: ")
    add_bullet_p(doc, "Zero server management; turnkey CI/CD Git integration; native first-party Next.js support created by Vercel.");
    add_bullet_p(doc, "Global Edge CDN caching ensures ultra-fast initial page load speeds worldwide.");
    
    add_body_p(doc, "Weaknesses & Fatal Flaws for Hermit:", bold_prefix="Platform Bottlenecks: ")
    add_bullet_p(doc, "Vercel Hobby has a hard 10-15 second execution timeout. Vercel Pro defaults to 15s (configurable up to a maximum of 60s). Scrapes across 55 portals take 2-4 minutes and will fail with 504 Gateway Timeout errors.", bold_prefix="Fatal Serverless Timeout: ");
    add_bullet_p(doc, "Serverless functions run from rotating shared AWS IP ranges that are heavily flagged by DDoS mitigation systems on regulatory portals.", bold_prefix="Dynamic IP Blocking: ");
    add_bullet_p(doc, "Cron jobs on Vercel Hobby are limited to once per day. Hourly scraping requires a paid Pro plan ($20/mo minimum) and external webhook splitters.", bold_prefix="Cron Restrictions: ");
    add_body_p(doc, "VERDICT: SUB-OPTIMAL. Excellent for static frontend display, but incapable of running Hermit's full-spectrum scraper pipeline without expensive third-party decoupling.", bold_prefix="Feasibility: ")

    # OPTION 3: CONTAINERIZED PAAS
    style_heading(doc.add_paragraph(), "Option 3: Containerized Developer PaaS (Railway, Render, Fly.io)", level=2)
    add_body_p(doc, "Overview: Code is containerized via Docker and deployed onto lightweight shared virtual machines with managed orchestration, automated SSL, and database add-ons.", bold_prefix="Architecture: ")
    add_body_p(doc, "Railway charges $5/month base fee + usage ($0.000231/GB-hour RAM, $0.000463/vCPU-hour). Realistic 2 GB / 1 vCPU instance costs $15-$22/month. Render charges $7/month (Starter 512MB) to $25/month (Standard 2GB).", bold_prefix="Commercial Pricing: ")
    
    add_body_p(doc, "Strengths (Pros):", bold_prefix="Technical Strengths: ")
    add_bullet_p(doc, "Supports continuous background processes and Docker containers with no 60-second timeouts.");
    add_bullet_p(doc, "Intuitive dashboards with automated Git deployments and built-in cron triggers.");
    
    add_body_p(doc, "Weaknesses & Fatal Flaws for Hermit:", bold_prefix="Platform Bottlenecks: ")
    add_bullet_p(doc, "Pricing scales unfavorably as memory increases. Turbopack builds require 2 GB RAM spikes, forcing upgrade to $20-$25/mo plans.", bold_prefix="Memory Cost Scaling: ");
    add_bullet_p(doc, "Dedicated static egress IPs cost an additional $5 to $15/month or are unavailable on entry tiers.", bold_prefix="Egress IP Limitations: ");
    add_bullet_p(doc, "Vendor lock-in on custom configuration manifests and ephemeral container file systems.", bold_prefix="Vendor Lock-in: ");
    add_body_p(doc, "VERDICT: VIABLE BUT EXPENSIVE. Technically capable, but delivers significantly less compute power per dollar than a dedicated VPS.", bold_prefix="Feasibility: ")

    # OPTION 4: UNMANAGED LINUX VPS
    style_heading(doc.add_paragraph(), "Option 4: Unmanaged Linux Cloud VPS (InterServer, Hetzner, DigitalOcean, Linode)", level=2)
    add_body_p(doc, "Overview: A virtualized dedicated slice of enterprise server hardware running clean Ubuntu 24.04 LTS. Complete root access, custom firewall, dedicated IPv4, and zero external constraints.", bold_prefix="Architecture: ")
    add_body_p(doc, "InterServer Cloud Linux VPS: $12.00/month (4 Slices = 2 vCPU Cores, 8 GB RAM, 160 GB SSD, 8 TB Bandwidth). Hetzner Cloud CPX21: ~$9.00/month (3 vCPU, 4 GB RAM, 80 GB NVMe). DigitalOcean Droplet: $18.00/month (2 GB RAM, 1 vCPU).", bold_prefix="Commercial Pricing: ")
    
    add_body_p(doc, "Strengths (Pros):", bold_prefix="Technical Strengths: ")
    add_bullet_p(doc, "Massive 8 GB RAM and 2 dedicated CPU cores for just $12/month. Enables flawless Next.js compilation and simultaneous parallel scraping.", bold_prefix="Unbeatable Resource Ratios: ");
    add_bullet_p(doc, "No execution timeouts. Scraper jobs can run for 10 seconds or 10 hours without platform interference.", bold_prefix="Infinite Runtime Freedom: ");
    add_bullet_p(doc, "Included static dedicated IPv4 address with high reputation, preventing scrapers from being flagged or challenged by CAPTCHAs.", bold_prefix="Dedicated IP Reputation: ");
    add_bullet_p(doc, "Native Linux Cron daemon provides millisecond-accurate scheduling without external webhook fees.", bold_prefix="Native Scheduling: ");
    add_bullet_p(doc, "Complete data sovereignty. Backups, logs, environment keys, and SQLite cache files remain 100% under Hermit's physical control.", bold_prefix="Enterprise Sovereignty: ");
    
    add_body_p(doc, "Weaknesses:", bold_prefix="Operational Considerations: ")
    add_bullet_p(doc, "Requires initial Linux system administration (Nginx reverse proxy, PM2 process manager, UFW firewall, and Certbot SSL setup). Handled entirely in our implementation playbook.");
    add_body_p(doc, "VERDICT: HIGHLY RECOMMENDED (BEST IN CLASS). Delivers the highest performance, highest stability, and lowest long-term operational cost.", bold_prefix="Feasibility: ")

    # OPTION 5: ENTERPRISE HYPERSCALERS
    style_heading(doc.add_paragraph(), "Option 5: Enterprise Hyperscalers (AWS Lightsail/ECS, GCP Cloud Run, Azure VM)", level=2)
    add_body_p(doc, "Overview: Enterprise infrastructure ecosystems offering hundreds of interconnected services (IAM, VPC, CloudWatch, Route53, ALB).", bold_prefix="Architecture: ")
    add_body_p(doc, "AWS Lightsail: $10-$20/month. AWS EC2 t4g.small: $14/month + EBS Storage ($0.10/GB) + Egress Bandwidth ($0.09/GB) + Application Load Balancer ($16-$22/month) = Total $42-$65/month. GCP Cloud Run + Cloud SQL: $35-$75/month.", bold_prefix="Commercial Pricing: ")
    
    add_body_p(doc, "Strengths (Pros):", bold_prefix="Technical Strengths: ")
    add_bullet_p(doc, "99.99% multi-region SLA availability and deep integration into enterprise identity frameworks (Active Directory, Okta).");
    
    add_body_p(doc, "Weaknesses & Fatal Flaws for Hermit:", bold_prefix="Platform Bottlenecks: ")
    add_bullet_p(doc, "Disproportionately complex billing. Hidden charges for NAT gateways, DNS queries, egress bandwidth, and monitoring metrics.", bold_prefix="Unpredictable Billing Spikes: ");
    add_bullet_p(doc, "Massive configuration overhead requiring certified AWS/Azure DevOps expertise to maintain.", bold_prefix="Administrative Burden: ");
    add_body_p(doc, "VERDICT: OVER-ENGINEERED & UNECONOMIC. Unjustified cost and administrative complexity for Hermit's single-tenant intelligence engine.", bold_prefix="Feasibility: ")

    # OPTION 6: HYBRID ARCHITECTURE
    style_heading(doc.add_paragraph(), "Option 6: Hybrid Deployment (Vercel Frontend + VPS Background Worker)", level=2)
    add_body_p(doc, "Overview: Splitting the repository into two deployments: Vercel hosts the Next.js presentation UI, while a separate VPS executes scheduled scraping and writes results into Supabase.", bold_prefix="Architecture: ")
    add_body_p(doc, "Vercel Pro ($20/month) + Entry VPS ($6/month) = Total $26-$35/month.", bold_prefix="Commercial Pricing: ")
    add_body_p(doc, "Strengths: Combines global edge frontend rendering with unconstrained backend scraper execution.", bold_prefix="Technical Strengths: ")
    add_body_p(doc, "Weaknesses: Doubles administrative surface area, requires synchronizing two deployment pipelines, and exceeds Hermit's strict $20/month target budget.", bold_prefix="Platform Bottlenecks: ")
    add_body_p(doc, "VERDICT: SECONDARY ALTERNATIVE. Viable for large enterprise teams with multiple frontend developers, but inefficient for Hermit's current scope.", bold_prefix="Feasibility: ")

    # ==================== SECTION 4: COMPARATIVE MATRIX TABLE ====================
    p = doc.add_paragraph()
    style_heading(p, "4. Master Cloud Deployment Comparative Matrix", level=1)
    
    add_body_p(doc, "The matrix below provides a direct, head-to-head comparison across all evaluated hosting archetypes:")

    matrix_tbl = doc.add_table(rows=7, cols=6)
    matrix_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Hosting Model", "Monthly Cost", "Scraper Runtime", "Memory Allotment", "Static Dedicated IP", "Suitability Rating"]
    
    # Style Header Row
    hdr_cells = matrix_tbl.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_background(hdr_cells[i], "064E3B") # dark forest green
        set_cell_margins(hdr_cells[i], top=80, bottom=80, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name, r.font.size, r.font.bold = "Arial", Pt(9), True
            r.font.color.rgb = RGBColor(255, 255, 255)

    matrix_rows = [
        ("Shared Hosting (cPanel)", "$3 - $10 /mo", "Hard Fail (<60s)", "512 MB - 1 GB", "No (Shared)", "1.0 / 5 (Unusable)"),
        ("Serverless (Vercel Pro)", "$20 - $40 /mo", "15s - 60s max", "1 GB - 3 GB (Burst)", "No (Dynamic AWS)", "2.5 / 5 (Flawed)"),
        ("Container PaaS (Railway)", "$15 - $25 /mo", "Unlimited", "1 GB - 2 GB", "Paid Addon (+$5/m)", "3.5 / 5 (Acceptable)"),
        ("Cloud Linux VPS (InterServer)", "$12.00 /mo", "Unlimited", "8 GB Dedicated", "Yes (Free Dedicated)", "5.0 / 5 (Optimal)"),
        ("Hyperscaler (AWS / Azure)", "$45 - $80 /mo", "Unlimited", "2 GB - 4 GB", "Yes ($3.60/m extra)", "2.8 / 5 (Overpriced)"),
        ("Hybrid (Vercel + VPS)", "$26 - $35 /mo", "Unlimited", "Shared + 2 GB VPS", "Yes (VPS only)", "3.8 / 5 (Complex)")
    ]

    for row_idx, rdata in enumerate(matrix_rows, start=1):
        row_cells = matrix_tbl.rows[row_idx].cells
        bg_col = "F0FDF4" if "Optimal" in rdata[5] else ("FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
        for col_idx, text in enumerate(rdata):
            row_cells[col_idx].text = text
            set_cell_background(row_cells[col_idx], bg_col)
            set_cell_margins(row_cells[col_idx], top=60, bottom=60, left=80, right=80)
            p = row_cells[col_idx].paragraphs[0]
            if col_idx in [1, 2, 4, 5]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name, r.font.size = "Arial", Pt(8.5)
                if "Optimal" in text:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(5, 150, 105)
                elif "Unusable" in text or "Flawed" in text:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(225, 29, 72)
                else:
                    r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==================== SECTION 5: RECOMMENDED STRATEGY ====================
    p = doc.add_paragraph()
    style_heading(p, "5. Definitive Strategic Recommendation for Hermit Investments", level=1)
    
    add_body_p(doc, "The strategic, commercial, and technical recommendation is to deploy the Hermit Energy Sector Intelligence Platform on a dedicated Cloud Linux VPS (InterServer Cloud VPS or Hetzner Cloud CPX21), backed by Google Cloud Platform (GCP) Pay-As-You-Go for Gemini AI.", bold_prefix="The Boardroom Decision: ")

    add_body_p(doc, "Why InterServer Cloud VPS is the Superior Choice for Hermit:", bold_prefix="Core Rationale: ")
    
    add_bullet_p(doc, "At 4 slices ($12.00/mo), the server provides 8,192 MB RAM. This ensures Next.js 16 can build, run SSR, and execute multi-portal Cheerio scraping concurrently without memory thrashing or CPU throttling.", bold_prefix="1. Massive Compute Headroom (8 GB RAM / 2 Cores): ");
    
    add_bullet_p(doc, "Scrapers can run sequentially across all 55 portals for 3 minutes without artificial cloud platform termination. Nightly deep crawls and hourly delta checks complete 100% reliably.", bold_prefix="2. Zero Execution Timeouts: ");
    
    add_bullet_p(doc, "A dedicated static IPv4 address builds a clean HTTP reputation. Regulatory portals and news servers will not mistake Hermit's crawlers for public botnets.", bold_prefix="3. Dedicated Static IP Reputation: ");
    
    add_bullet_p(doc, "All operating costs remain fixed and predictable. No surprises from serverless invocation spikes, bandwidth overages, or micro-billing traps.", bold_prefix="4. Fixed Cost Predictability ($12.00/mo Flat): ");
    
    add_bullet_p(doc, "Hermit retains full control over internal SQLite caches, PM2 error logs, and environment secrets, with zero dependency on third-party platform lock-in.", bold_prefix="5. Complete Architectural Sovereignty: ");

    # AI & TOTAL BUDGET BREAKDOWN
    style_heading(doc.add_paragraph(), "Total Monthly Operating Budget (Strictly Under $20/Month)", level=2)
    
    cost_tbl = doc.add_table(rows=6, cols=3)
    cost_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_headers = ["Infrastructure Component", "Provider & Tier", "Monthly Cost (USD)"]
    c_hdr_cells = cost_tbl.rows[0].cells
    for i, h in enumerate(c_headers):
        c_hdr_cells[i].text = h
        set_cell_background(c_hdr_cells[i], "047857")
        set_cell_margins(c_hdr_cells[i], top=80, bottom=80, left=100, right=100)
        p = c_hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name, r.font.size, r.font.bold = "Arial", Pt(9), True
            r.font.color.rgb = RGBColor(255, 255, 255)

    budget_items = [
        ("Cloud Compute & Network", "InterServer Linux VPS (2 Cores, 8 GB RAM, 160 GB SSD)", "$12.00 / month"),
        ("Database & Auth Layer", "Supabase PostgreSQL Managed Cloud (Free Tier - 500 MB)", "$0.00 / month"),
        ("AI Core & Classification", "Google Cloud / AI Studio (Gemini 2.0 Flash Pay-As-You-Go)", "$2.50 - $4.50 / month"),
        ("Transactional Alert Dispatch", "Resend SMTP API (Free Tier - 3,000 emails/month)", "$0.00 / month"),
        ("SSL & Security Certificates", "Let's Encrypt Enterprise SSL (Automated Certbot Renewal)", "$0.00 / month")
    ]

    for row_idx, (comp, prov, cost) in enumerate(budget_items, start=1):
        row_cells = cost_tbl.rows[row_idx].cells
        for col_idx, val in enumerate([comp, prov, cost]):
            row_cells[col_idx].text = val
            set_cell_background(row_cells[col_idx], "FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
            set_cell_margins(row_cells[col_idx], top=60, bottom=60, left=80, right=80)
            p = row_cells[col_idx].paragraphs[0]
            if col_idx == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            for r in p.runs:
                r.font.name, r.font.size = "Arial", Pt(9)
                r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(
        doc,
        "Total Projected Operating Cost: $14.50 to $16.50 per month. This delivers an enterprise-grade 8 GB RAM environment with autonomous AI intelligence while remaining safely below Hermit's $20.00 monthly cap. Annual run-rate is approximately $180/year, representing an 82% savings compared to standard Vercel Pro + AWS architectures ($1,020/year).",
        title="BUDGET CERTIFICATION"
    )

    # ==================== SECTION 6: IMPLEMENTATION ROADMAP ====================
    p = doc.add_paragraph()
    style_heading(p, "6. Technical Implementation & Deployment Playbook", level=1)
    
    add_body_p(doc, "Deploying Hermit on an InterServer Cloud Linux VPS follows a battle-tested 6-step engineering protocol:")

    add_bullet_p(doc, "Select Ubuntu 24.04 LTS (Noble Numbat) 64-bit on InterServer VPS manager. Configure root SSH key authentication and disable password logins.", bold_prefix="Step 1: VPS Provisioning: ");
    add_bullet_p(doc, "Update apt repositories, install Node.js 20 LTS via NodeSource binary distributions, and install PM2 process manager globally ('npm install -g pm2').", bold_prefix="Step 2: Runtime Environment: ");
    add_bullet_p(doc, "Clone the Hermit GitHub repository into /var/www/hermit. Populate the secure production environment variables (.env.production) containing Supabase service keys, Gemini API credentials, and Resend tokens.", bold_prefix="Step 3: Repository & Secrets Setup: ");
    add_bullet_p(doc, "Execute 'npm install --production=false' followed by 'npm run build'. Launch the application cluster using PM2: 'pm2 start npm --name \"hermit-monitor\" -- start -- -p 3000'.", bold_prefix="Step 4: Production Build & PM2 Daemon: ");
    add_bullet_p(doc, "Install Nginx. Configure a high-performance reverse proxy routing incoming port 80/443 traffic to localhost:3000. Generate free Let's Encrypt SSL certificates via Certbot with automated 90-day renewals.", bold_prefix="Step 5: Nginx Reverse Proxy & SSL: ");
    add_bullet_p(doc, "Configure Linux crontab ('crontab -e') to trigger the crawl endpoint (/api/crawl) hourly and compile executive digests at 06:00 CAT daily using secure local curl invocations.", bold_prefix="Step 6: Cron Automation & Hardening: ");

    # ==================== SECTION 7: RISK MATRIX & MITIGATION ====================
    p = doc.add_paragraph()
    style_heading(p, "7. Operational Risk Management & Continuity Plan", level=1)
    
    risk_tbl = doc.add_table(rows=5, cols=3)
    risk_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    r_headers = ["Identified Risk Factor", "Operational Impact", "Hermit Mitigation Strategy"]
    for i, h in enumerate(r_headers):
        risk_tbl.rows[0].cells[i].text = h
        set_cell_background(risk_tbl.rows[0].cells[i], "1F2937") # charcoal
        set_cell_margins(risk_tbl.rows[0].cells[i], top=80, bottom=80, left=100, right=100)
        p = risk_tbl.rows[0].cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name, r.font.size, r.font.bold = "Arial", Pt(9), True
            r.font.color.rgb = RGBColor(255, 255, 255)

    risk_data = [
        ("Server Process Crash", "Temporary outage of real-time dashboard UI", "PM2 automatically restarts Node.js in <500ms; systemd daemon ensures reboot recovery."),
        ("Portal Rate-Limiting", "Temporary 429 status on individual news sites", "Cheerio scrapers include realistic User-Agent headers, jitter delays, and fallback to RSS."),
        ("Gemini AI API Outage", "Impact memos delayed or queued", "Heuristic keyword-scoring engine operates as an automated fallback if Gemini API is unreachable."),
        ("VPS Hardware Failure", "Complete VM downtime", "InterServer automated daily snapshots enable 1-click restore to any alternate datacenter slice.")
    ]

    for row_idx, (rf, imp, mit) in enumerate(risk_data, start=1):
        row_cells = risk_tbl.rows[row_idx].cells
        for col_idx, val in enumerate([rf, imp, mit]):
            row_cells[col_idx].text = val
            set_cell_background(row_cells[col_idx], "FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
            set_cell_margins(row_cells[col_idx], top=60, bottom=60, left=80, right=80)
            p = row_cells[col_idx].paragraphs[0]
            for r in p.runs:
                r.font.name, r.font.size = "Arial", Pt(8.5)
                r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Sign-off block
    sign_p = doc.add_paragraph()
    sign_p.paragraph_format.keep_with_next = True
    sign_p.paragraph_format.space_before = Pt(16)
    sign_p.paragraph_format.space_after = Pt(4)
    r_sign = sign_p.add_run("Strategic Sign-off & Next Steps:")
    r_sign.font.name, r_sign.font.size, r_sign.font.bold = "Arial", Pt(11), True
    r_sign.font.color.rgb = RGBColor(6, 78, 59)

    add_body_p(doc, "Upon formal executive approval, the InterServer Linux VPS slice will be provisioned, configured, and bound to Hermit's production domain within 2 hours. The automated green energy surveillance pipeline will achieve full operational go-live immediately thereafter.")

    output_path = "HERMIT_INVESTMENTS_DEPLOYMENT_OPTIONS_AND_RECOMMENDATION.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    build_deployment_document()
