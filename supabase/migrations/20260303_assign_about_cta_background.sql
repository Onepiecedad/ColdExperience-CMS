-- ============================================================================
-- ASSIGN ABOUT CTA BACKGROUND IMAGE
-- ============================================================================
-- IMG_0451 was previously only assigned to gallery:grid.
-- The About CTA section needs it assigned as its background image.
-- We update the .webp version (preferred) to about:cta.
-- If only .jpg exists, that is updated instead.
-- ============================================================================

-- Update webp version if it exists
UPDATE cms_media
SET page_id   = 'about',
    section_id = 'cta'
WHERE filename = 'IMG_0451.webp';

-- Fallback: update jpg version only if no webp row was assigned above
UPDATE cms_media
SET page_id   = 'about',
    section_id = 'cta'
WHERE filename = 'IMG_0451.jpg'
  AND NOT EXISTS (
      SELECT 1 FROM cms_media
      WHERE filename = 'IMG_0451.webp'
        AND page_id = 'about'
        AND section_id = 'cta'
  );
