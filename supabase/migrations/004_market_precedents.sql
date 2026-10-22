-- Hermit Investments Media Monitoring Platform
-- Migration 004: Market Precedents & Historical Distillation Schema
-- Creates the table for learned cause-and-effect market rules & automated storage lifecycle cleanup

-- 1. Create Market Precedents (Distilled Historical Cause & Effect Memory)
CREATE TABLE IF NOT EXISTS market_precedents (
    id SERIAL PRIMARY KEY,
    trigger_category VARCHAR(100) NOT NULL, -- e.g. 'Tariff Revision', 'Currency Shift', 'Grid Deficit', 'DFI Facility'
    trigger_event TEXT NOT NULL,            -- e.g. 'ZERA announced 19% commercial electricity tariff hike'
    historical_date DATE NOT NULL,          -- When this happened historically
    market_reaction TEXT NOT NULL,         -- e.g. 'Mining & industrial off-takers expedited bilateral solar PPAs by 40%'
    subsequent_policy_shift TEXT,          -- e.g. 'ZERA introduced tiered BESS incentives within 9 months'
    strategic_rule TEXT NOT NULL,          -- The predictive rule: 'When utility tariffs rise >15%, private PPA demand peaks within 90-180 days'
    confidence_score NUMERIC(3, 2) DEFAULT 0.85, -- 0.00 to 1.00
    source_article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexing for High-Speed Semantic & Category Matching
CREATE INDEX IF NOT EXISTS idx_precedents_category ON market_precedents(trigger_category);
CREATE INDEX IF NOT EXISTS idx_precedents_date ON market_precedents(historical_date DESC);

-- 3. Row Level Security Policies
ALTER TABLE market_precedents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read market_precedents" 
    ON market_precedents FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Allow authenticated manage market_precedents" 
    ON market_precedents FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 4. Automated Storage Optimization Function (Cold Data Lifecycle Cleanup)
-- Run periodically to purge heavy raw HTML while preserving structured summaries & metrics.
CREATE OR REPLACE FUNCTION purge_cold_article_raw_content(retention_days INT DEFAULT 180)
RETURNS INT AS $$
DECLARE
    purged_count INT;
BEGIN
    UPDATE articles
    SET raw_content = NULL
    WHERE captured_at < (NOW() - (retention_days || ' days')::INTERVAL)
      AND raw_content IS NOT NULL;
      
    GET DIAGNOSTICS purged_count = ROW_COUNT;
    RETURN purged_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Seed Initial Ground-Truth Zimbabwean Energy Sector Precedents
INSERT INTO market_precedents 
    (trigger_category, trigger_event, historical_date, market_reaction, subsequent_policy_shift, strategic_rule, confidence_score, tags)
VALUES
    (
        'Tariff Revision',
        'ZERA revised commercial and industrial tariffs upward by 19% in response to ZETDC cost-of-service review.',
        '2024-10-15',
        'Intensive energy consumers (Chamber of Mines members) expedited captive rooftop and ground-mounted solar PPA procurement to hedge against utility inflation.',
        'ZERA introduced net-metering cap increases from 100kW to 5MW for commercial producers.',
        'When ZETDC tariffs increase >15%, private C&I solar PPA pipeline velocity accelerates within 60 to 90 days. Hermit should fast-track off-taker proposals immediately.',
        0.92,
        ARRAY['tariff', 'zera', 'c&i', 'ppa', 'inflation']
    ),
    (
        'Hydrological Deficit',
        'Lake Kariba usable live storage dropped below 12%, forcing ZRA to enforce generation capping under 300MW.',
        '2024-09-22',
        'Industrial and agricultural off-takers faced mandatory 12-to-16 hour load curtailment, spiking diesel generator opex to $0.38/kWh.',
        'Cabinet approved emergency fast-tracking for grid-tied solar IPPs with sovereign economic stability guarantees.',
        'Prolonged Kariba hydro deficits create immediate demand for daytime utility-scale solar injection and 4-hour battery storage systems.',
        0.95,
        ARRAY['kariba', 'hydro', 'drought', 'bess', 'load-shedding']
    ),
    (
        'Fiscal Policy',
        'Ministry of Finance gazetted SI 184 extending customs duty exemptions on solar panels, inverters, and lithium-ion batteries.',
        '2025-01-10',
        'Project developers experienced 15-20% capex savings on balance-of-system imports, improving project IRRs by 2.4%.',
        'Treasury established stricter local content compliance certificates for foreign EPC contractors.',
        'Duty rebate windows last 18-24 months before legislative review. Procurement and equipment importation should be concentrated in the first half of the exemption window.',
        0.88,
        ARRAY['si184', 'customs', 'duty_rebate', 'capex', 'inverters']
    ),
    (
        'DFI Capital Window',
        'AfDB SEFA and IFC launched $40M blended concessional finance facilities for Zimbabwean private IPPs.',
        '2025-06-20',
        'Local commercial banks (Stanbic, Ecobank) formed co-lending syndicates to underwrite sub-6% USD-denominated debt.',
        'Central Bank granted offshore debt service priority allocations for DFI-backed renewable projects.',
        'DFI facility deployment requires early SPV environmental and grid-connection approvals (minimum 6 months prior to allocation deadline).',
        0.90,
        ARRAY['dfi', 'afdb', 'sefa', 'debt', 'concessional']
    );
