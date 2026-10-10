-- Hermit Investments Media Monitoring Platform Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Sources table
CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512),
    category VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'web',  -- 'web', 'rss', 'social'
    crawl_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_crawled_at TIMESTAMPTZ,
    last_crawl_status VARCHAR(50) DEFAULT 'idle',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Articles table (ToR specified fields + system fields)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    publication_date TIMESTAMPTZ,
    headline VARCHAR(512) NOT NULL,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    source_name VARCHAR(255),
    author VARCHAR(255),
    summary TEXT,
    key_stakeholders TEXT[],
    relevance_to_hermit TEXT,
    source_link VARCHAR(1024) UNIQUE,
    raw_content TEXT,
    relevance_score FLOAT DEFAULT 0.0,
    relevance_level VARCHAR(10) DEFAULT 'low',  -- 'high', 'medium', 'low'
    article_type VARCHAR(50) DEFAULT 'general', -- 'tariff_change', 'new_regulation', 'funding_announcement', 'project_update', 'policy_change', 'partnership', 'general'
    ai_summary TEXT,
    ai_impact_note TEXT,
    suggested_actions TEXT[],
    is_reviewed BOOLEAN DEFAULT false,
    is_alert_sent BOOLEAN DEFAULT false,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 3. Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL,  -- 'daily', 'weekly', 'monthly', 'special'
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content JSONB DEFAULT '{}',
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    article_count INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Alerts log table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    headline VARCHAR(512),
    source_name VARCHAR(255),
    relevance_level VARCHAR(20) DEFAULT 'high',
    recipient_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent',
    dispatched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for fast dashboard querying
CREATE INDEX IF NOT EXISTS idx_articles_captured_at ON articles(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_relevance ON articles(relevance_level, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type);
CREATE INDEX IF NOT EXISTS idx_articles_processed ON articles(processed_at);

-- 6. Row Level Security policies (Public read/write for internal dashboard)
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read sources') THEN
        CREATE POLICY "Allow public read sources" ON sources FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read articles') THEN
        CREATE POLICY "Allow public read articles" ON articles FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read reports') THEN
        CREATE POLICY "Allow public read reports" ON reports FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read alerts') THEN
        CREATE POLICY "Allow public read alerts" ON alerts FOR ALL USING (true);
    END IF;
END $$;
