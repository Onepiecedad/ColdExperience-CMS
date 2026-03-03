-- ============================================================================
-- ASSIGN PACKAGES PAGE MEDIA TO CORRECT SECTIONS
-- ============================================================================
-- The Packages page is split into 7 sections:
--   packages      → Hero (video + title)
--   packagesIntro → Intro section (northern lights / intro image)
--   package7day   → Complete package (managed by PackageEditor)
--   package5day   → Adventure package (managed by PackageEditor)
--   package3day   → ThreeDay package (managed by PackageEditor)
--   package1day   → Taster package (managed by PackageEditor)
--   packagesCta   → Call to Action
--
-- Individual package images are stored in cms_packages.image_url,
-- not in cms_media, so no media assignment is needed for package7day–1day.
-- ============================================================================

-- ── Hero: background video ────────────────────────────────────────────────
UPDATE cms_media
SET page_id    = 'packages',
    section_id = 'packages'
WHERE filename IN ('coldexperience1-opt.mp4', 'coldexperience1.mp4')
  AND (page_id IS NULL OR page_id = 'packages');

-- ── Intro: intro image (northern lights / winter landscape) ───────────────
-- The intro section shows a large landscape photo on the right side.
-- norrsken1-opt.mp4 is used as an intro video; IMG_2425.jpg as a still.
UPDATE cms_media
SET page_id    = 'packages',
    section_id = 'packagesIntro'
WHERE filename IN ('norrsken1-opt.mp4', 'IMG_2425.jpg')
  AND (page_id IS NULL OR page_id NOT IN ('packages'));

-- ── CTA: reuse existing hero video as background ─────────────────────────
-- No dedicated CTA media yet — assign when a specific image is uploaded.
