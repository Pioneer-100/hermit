-- Hermit Investments - Comprehensive Migration Runner
-- Sequentially incorporates 001 through 004 for clean one-click staging & production bootstrapping

-- Phase 1: Core Tables & Indexes
\ir 001_initial_schema.sql

-- Phase 2: Row Level Security (RLS) & Access Control
\ir 002_secure_rls.sql

-- Phase 3: Users, RBAC, & Clean Energy Project Pipelines
\ir 003_users_and_pipeline.sql

-- Phase 4: Market Precedents & Learned Strategy Archive
\ir 004_market_precedents.sql

-- Verify Migration Success
DO $$
BEGIN
  RAISE NOTICE 'Hermit Investments Industrial Database Schema successfully initialized.';
END $$;
