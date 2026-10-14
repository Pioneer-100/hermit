-- Hermit Investments Media Monitoring Platform
-- Migration 002: Secure Row Level Security (RLS) Policies
-- Fixes vulnerability: Replaces overly permissive "FOR ALL USING (true)" policies
-- with restricted SELECT-only access for public/anon clients, reserving write access to service_role.

-- 1. Drop old insecure "FOR ALL" policies
DROP POLICY IF EXISTS "Allow public read sources" ON sources;
DROP POLICY IF EXISTS "Allow public read articles" ON articles;
DROP POLICY IF EXISTS "Allow public read reports" ON reports;
DROP POLICY IF EXISTS "Allow public read alerts" ON alerts;

-- 2. Create restricted SELECT-only policies for public/anon clients
CREATE POLICY "Allow public select sources" ON sources
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public select articles" ON articles
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public select reports" ON reports
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public select alerts" ON alerts
    FOR SELECT
    USING (true);

-- 3. Explicit service_role full access policies (in addition to default bypass)
-- Note: In Supabase, service_role bypasses RLS by default.
-- For environments where service_role connects with RLS enforced:
CREATE POLICY "Allow service_role full sources" ON sources
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service_role full articles" ON articles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service_role full reports" ON reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service_role full alerts" ON alerts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
