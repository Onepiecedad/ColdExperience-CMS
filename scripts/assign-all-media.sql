-- =====================================================
-- MEDIA TILLDELNING - Kör i Supabase SQL Editor
-- =====================================================
-- Genererat: 2025-12-20
-- 
-- Detta SQL tilldelar alla mediafiler till rätt sektioner
-- baserat på webbplatsens faktiska mediaanvändning.
-- =====================================================
-- ============================================
-- HERO SECTION (delad bakgrundsvideo)
-- ============================================
UPDATE cms_media
SET page_id = 'hero',
    section_id = 'hero'
WHERE filename IN (
        'coldexperience-top-1.mp4',
        'coldexperience1-opt.mp4',
        'coldexperience1.mp4',
        'coldexperience2-opt.mp4',
        'coldexperience2.mp4',
        'coldexperience3-opt.mp4',
        'coldexperience3.mp4'
    );
-- ============================================
-- EXPERIENCES / ADVENTURES
-- ============================================
UPDATE cms_media
SET page_id = 'experiences',
    section_id = 'experiences'
WHERE filename IN (
        'snoskoter2-opt.mp4',
        'norrsken1-opt.mp4',
        'hundspann2-opt.mp4',
        'IMG_6698.jpg',
        'hundspann1-opt.mp4',
        'hundspann1.mp4',
        'hundspann2.mp4',
        'hundspann3.mp4',
        'norrsken1.mp4',
        'norrsken2-opt.mp4',
        'norrsken2.mp4',
        'snoskoter-opt.mp4',
        'snoskoter.mp4',
        'snoskoter2.mp4'
    );
-- ============================================
-- ABOUT - Owner Section (Gustav & Julia)
-- ============================================
UPDATE cms_media
SET page_id = 'about',
    section_id = 'ownerSection'
WHERE filename = 'owners.jpg';
-- ============================================
-- ABOUT - Our Story (Timeline)
-- ============================================
UPDATE cms_media
SET page_id = 'about',
    section_id = 'story'
WHERE filename IN (
        'om_oss-opt.mp4',
        'gustav_childhood.jpg',
        'julias_matresa.jpg',
        'love_adventure.jpg',
        'family_1.jpg',
        'family_2.jpg',
        'coldexperience_born.jpg',
        'matlagning.mp4',
        'Film-1.mp4',
        'Film-2.mp4',
        'Film-3.mp4',
        'Film-4.mp4'
    );
-- ============================================
-- ABOUT - Values (Värderingskort)
-- ============================================
UPDATE cms_media
SET page_id = 'about',
    section_id = 'values'
WHERE filename IN (
        'IMG_2425.jpg',
        'IMG_7834.jpg',
        'IMG_1547.jpg',
        'IMG_4436.jpg'
    );
-- ============================================
-- ABOUT - Hosts (Action-bilder)
-- ============================================
UPDATE cms_media
SET page_id = 'about',
    section_id = 'hosts'
WHERE filename IN ('IMG_4108.jpg', 'IMG_3493.jpg');
-- ============================================
-- GALLERY - Hero
-- ============================================
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'hero'
WHERE filename IN ('galleri-opt.mp4', 'galleri.mp4');
-- ============================================
-- GALLERY - Image Grid
-- ============================================
UPDATE cms_media
SET page_id = 'gallery',
    section_id = 'grid'
WHERE filename IN (
        'IMG_0542.jpg',
        'IMG_0575.jpg',
        'IMG_4527.jpg',
        'IMG_0451.jpg',
        'IMG_1687.jpg',
        'IMG_6181.jpg',
        'IMG_3700.jpg',
        'IMG_4545.jpg',
        'IMG_5562.jpg',
        'IMG_3838.jpg',
        'IMG_3860.jpg',
        'IMG_2963.jpg',
        'IMG_0554 (1).jpg',
        'IMG_1579.jpg',
        'IMG_1904.jpg',
        'IMG_4082.jpg',
        'IMG_4596 (1).jpg',
        'IMG_6702.jpg',
        'IMG_7476 (1).jpg',
        'IMG_1634.jpg'
    );
-- ============================================
-- NAVIGATION / HEADER
-- ============================================
UPDATE cms_media
SET page_id = 'navigation',
    section_id = 'header'
WHERE filename IN (
        'logo.svg',
        'logo-white.svg',
        'logo.png',
        'favicon.svg',
        'clothes.png'
    );
-- =====================================================
-- VERIFIERA RESULTAT
-- =====================================================
SELECT COALESCE(page_id, 'NULL') || '/' || COALESCE(section_id, 'NULL') as section,
    COUNT(*) as files
FROM cms_media
GROUP BY page_id,
    section_id
ORDER BY page_id,
    section_id;