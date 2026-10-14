-- Hermit Investments Media Monitoring Platform
-- Migration 003: User Profiles & Roles Schema
-- Creates user profile extensions linked to auth.users, project pipeline registry, and action assignments

-- 1. Create User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst', -- 'executive', 'director', 'analyst', 'engineer'
    title VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Hermit Project Pipeline Assets Table (For Asset-Aware Intelligence)
CREATE TABLE IF NOT EXISTS hermit_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    technology VARCHAR(100) NOT NULL, -- 'Solar PV', 'Solar + BESS', 'Hydro', 'Wind'
    capacity_mw NUMERIC(6, 2) NOT NULL,
    location VARCHAR(255) NOT NULL, -- e.g. 'Mashonaland East', 'Bulawayo', 'Midlands'
    status VARCHAR(50) DEFAULT 'pipeline', -- 'pipeline', 'under_construction', 'operational', 'feasibility'
    target_cod DATE,
    lead_manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    key_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Action Tasks Table (Assigning intelligence directives to actual Hermit staff)
CREATE TABLE IF NOT EXISTS action_tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'immediate', 'medium', 'standard'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES hermit_projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hermit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Standard policies: Authenticated users can view & manage team tasks
CREATE POLICY "Allow authenticated read user_profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read hermit_projects" ON hermit_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated full action_tasks" ON action_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read fallback for local dev / unauthenticated demo
CREATE POLICY "Allow public read user_profiles" ON user_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read hermit_projects" ON hermit_projects FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read action_tasks" ON action_tasks FOR SELECT TO anon USING (true);

-- Service role full access
CREATE POLICY "Allow service_role user_profiles" ON user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role hermit_projects" ON hermit_projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role action_tasks" ON action_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
