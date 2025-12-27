-- ============================================================================
-- ADD SECTION COLUMNS TO CMS_MEDIA
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to add page and section binding
-- ============================================================================

-- Add page_id column to link media to specific pages
ALTER TABLE cms_media 
ADD COLUMN IF NOT EXISTS page_id TEXT;

-- Add section_id column to link media to specific sections
ALTER TABLE cms_media 
ADD COLUMN IF NOT EXISTS section_id TEXT;

-- Create index for faster lookups by page and section
CREATE INDEX IF NOT EXISTS idx_cms_media_page_section 
ON cms_media(page_id, section_id);

-- Optional: Create a view for section media with page info
CREATE OR REPLACE VIEW section_media_view AS
SELECT 
    m.*,
    p.name as page_name,
    p.icon as page_icon
FROM cms_media m
LEFT JOIN cms_pages p ON m.page_id = p.slug;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now cms_media supports:
--   - page_id: Links to cms_pages.slug (e.g., 'hero', 'about', 'packages')
--   - section_id: Section within the page (e.g., 'hero', 'ownerSection')
-- ============================================================================
