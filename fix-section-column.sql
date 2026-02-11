-- ============================================================================
-- FIX SECTION COLUMN
-- ============================================================================
-- This SQL updates the `section` column in cms_content table to match
-- the prefix of the `content_key`. For example:
-- content_key = 'hero.title' → section = 'hero'
-- content_key = 'about.mission' → section = 'about'
-- ============================================================================
-- First, let's see what we're working with:
-- SELECT content_key, section FROM cms_content WHERE section IS NULL LIMIT 20;
-- Update all rows where section is NULL or doesn't match the content_key prefix
UPDATE cms_content
SET section = SPLIT_PART(content_key, '.', 1)
WHERE section IS NULL
    OR section != SPLIT_PART(content_key, '.', 1);
-- Verify the fix:
-- SELECT content_key, section FROM cms_content WHERE content_key LIKE 'hero.%' LIMIT 10;