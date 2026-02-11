-- ============================================================================
-- FIX CMS_META RLS POLICIES
-- ============================================================================
-- The publish flow needs to UPSERT to cms_meta, which requires both INSERT
-- and UPDATE policies. This migration adds the missing policies.
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read" ON cms_meta;
DROP POLICY IF EXISTS "Allow anonymous insert" ON cms_meta;
DROP POLICY IF EXISTS "Allow anonymous update" ON cms_meta;
-- Enable RLS if not already enabled
ALTER TABLE cms_meta ENABLE ROW LEVEL SECURITY;
-- Allow anonymous SELECT (already existed but we recreate it for consistency)
CREATE POLICY "Allow anonymous read" ON cms_meta FOR
SELECT USING (true);
-- Allow anonymous INSERT (needed for upsert when row doesn't exist)
CREATE POLICY "Allow anonymous insert" ON cms_meta FOR
INSERT WITH CHECK (true);
-- Allow anonymous UPDATE (needed for upsert when row exists)
CREATE POLICY "Allow anonymous update" ON cms_meta FOR
UPDATE USING (true);
-- ============================================================================
-- FIX CMS_CONTENT RLS POLICIES (for publishing drafts)
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read" ON cms_content;
DROP POLICY IF EXISTS "Allow anonymous insert" ON cms_content;
DROP POLICY IF EXISTS "Allow anonymous update" ON cms_content;
-- Enable RLS if not already enabled
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
-- Allow anonymous SELECT
CREATE POLICY "Allow anonymous read" ON cms_content FOR
SELECT USING (true);
-- Allow anonymous INSERT (for new content keys)
CREATE POLICY "Allow anonymous insert" ON cms_content FOR
INSERT WITH CHECK (true);
-- Allow anonymous UPDATE (for updating translations)
CREATE POLICY "Allow anonymous update" ON cms_content FOR
UPDATE USING (true);
-- ============================================================================
-- FIX CMS_DRAFTS RLS POLICIES (for cleanup after publish)
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read" ON cms_drafts;
DROP POLICY IF EXISTS "Allow anonymous insert" ON cms_drafts;
DROP POLICY IF EXISTS "Allow anonymous update" ON cms_drafts;
DROP POLICY IF EXISTS "Allow anonymous delete" ON cms_drafts;
-- Enable RLS if not already enabled
ALTER TABLE cms_drafts ENABLE ROW LEVEL SECURITY;
-- Allow anonymous SELECT
CREATE POLICY "Allow anonymous read" ON cms_drafts FOR
SELECT USING (true);
-- Allow anonymous INSERT
CREATE POLICY "Allow anonymous insert" ON cms_drafts FOR
INSERT WITH CHECK (true);
-- Allow anonymous UPDATE
CREATE POLICY "Allow anonymous update" ON cms_drafts FOR
UPDATE USING (true);
-- Allow anonymous DELETE (for cleanup after publish)
CREATE POLICY "Allow anonymous delete" ON cms_drafts FOR DELETE USING (true);