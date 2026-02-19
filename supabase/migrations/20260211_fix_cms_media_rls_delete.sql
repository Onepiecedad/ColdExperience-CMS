-- ============================================================================
-- FIX CMS_MEDIA RLS POLICIES - Add missing DELETE policy
-- ============================================================================
-- The media library needs DELETE access to remove files.
-- Currently only SELECT, INSERT, UPDATE exist.
-- ============================================================================
-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Allow anonymous delete" ON cms_media;
-- Allow anonymous DELETE
CREATE POLICY "Allow anonymous delete" ON cms_media FOR DELETE USING (true);