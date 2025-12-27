-- ============================================================================
-- FIX ALL UNASSIGNED MEDIA IN SUPABASE
-- Run this SQL in Supabase SQL Editor
-- ============================================================================
-- First, allow updates (if not already done)
DROP POLICY IF EXISTS "Allow public updates" ON cms_media;
CREATE POLICY "Allow public updates" ON cms_media FOR
UPDATE USING (true) WITH CHECK (true);
-- Now update all unassigned media files
-- Film videos → experiences
UPDATE cms_media
SET page_id = 'experiences',
    section_id = 'experiences'
WHERE filename = 'Film-1.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'experiences',
    section_id = 'experiences'
WHERE filename = 'Film-2.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'experiences',
    section_id = 'experiences'
WHERE filename = 'Film-3.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'experiences',
    section_id = 'experiences'
WHERE filename = 'Film-4.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
-- Family photos → about/story
UPDATE cms_media
SET page_id = 'about',
    section_id = 'story'
WHERE filename = 'family_1.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'about',
    section_id = 'story'
WHERE filename = 'family_2.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
-- coldexperience videos → hero
UPDATE cms_media
SET page_id = 'hero',
    section_id = 'hero'
WHERE filename = 'coldexperience1.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'hero',
    section_id = 'hero'
WHERE filename = 'coldexperience2.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'hero',
    section_id = 'hero'
WHERE filename = 'coldexperience3.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'hero',
    section_id = 'hero'
WHERE filename = 'coldexperience1-opt.mp4'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
-- coldexperience story images → about/story
UPDATE cms_media
SET page_id = 'about',
    section_id = 'story'
WHERE filename = 'coldexperience_born.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'about',
    section_id = 'story'
WHERE filename = 'julias_matresa.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
-- IMG_ photos → gallery
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_0451.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_1547.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_2425.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_3493.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_4108.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'gallery'
WHERE filename = 'IMG_4436.jpg'
    AND (
        page_id IS NULL
        OR section_id IS NULL
    );
-- ============================================================================
-- VERIFICATION: Check remaining unassigned
-- ============================================================================
SELECT filename,
    page_id,
    section_id
FROM cms_media
WHERE page_id IS NULL
    OR section_id IS NULL;
-- Should return 0 rows if all media is assigned!