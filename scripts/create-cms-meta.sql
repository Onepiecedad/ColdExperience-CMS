-- ============================================================================
-- CMS META TABLE - Content version tracking for publish flow
-- ============================================================================
-- Ticket 6: Publish per page
-- Run this migration in Supabase SQL Editor
-- ============================================================================
-- Create cms_meta table if not exists
CREATE TABLE IF NOT EXISTS cms_meta (
    site_id TEXT PRIMARY KEY,
    content_version INTEGER NOT NULL DEFAULT 0,
    last_published_at TIMESTAMPTZ,
    last_published_by TEXT
);
-- Insert default row for coldexperience
INSERT INTO cms_meta (site_id, content_version)
VALUES ('coldexperience', 0) ON CONFLICT (site_id) DO NOTHING;
-- Enable RLS
ALTER TABLE cms_meta ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to read and update
CREATE POLICY "Allow authenticated read cms_meta" ON cms_meta FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update cms_meta" ON cms_meta FOR
UPDATE TO authenticated USING (true);
-- Comment for documentation
COMMENT ON TABLE cms_meta IS 'Metadata for CMS including content version tracking';
COMMENT ON COLUMN cms_meta.content_version IS 'Incremented on each publish, used by website to detect updates';