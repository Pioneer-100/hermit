-- Hermit Sustainability Advisory (HSA)
-- Migration 005: SoW Alignment & Comprehensive Sustainability Intelligence
-- Adds missing fields required by the October 2026 Scope of Work:
-- 1. Country/Market affected
-- 2. Granular Sector (Solar, Hydro, Waste-to-Energy, Food-Water-Energy Nexus, DFI Finance)
-- 3. Specific Project Capacity or Funding Amount (e.g., '50MW', '$40M')
-- 4. Funding / Tender / Event Registration Deadline
-- 5. Publicly available contact info
-- 6. 4-Stage Workflow Status: 'new', 'under_review', 'actioned', 'closed'
-- 7. Specific Project or Event name

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS country_market VARCHAR(100) DEFAULT 'Zimbabwe',
  ADD COLUMN IF NOT EXISTS sector VARCHAR(100) DEFAULT 'Renewable Energy',
  ADD COLUMN IF NOT EXISTS capacity_or_funding VARCHAR(150),
  ADD COLUMN IF NOT EXISTS deadline DATE,
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS project_or_event_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'new';

-- Indexes for rapid filtering on dedicated trackers (Funding deadlines, Nexus, Events)
CREATE INDEX IF NOT EXISTS idx_articles_deadline ON articles(deadline);
CREATE INDEX IF NOT EXISTS idx_articles_sector ON articles(sector);
CREATE INDEX IF NOT EXISTS idx_articles_workflow_status ON articles(workflow_status);
CREATE INDEX IF NOT EXISTS idx_articles_country_market ON articles(country_market);
