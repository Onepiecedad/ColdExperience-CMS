-- ============================================================================
-- SEED PACKAGE IMAGES FROM LIVE WEBSITE FALLBACKS
-- ============================================================================
-- These are the actual Unsplash images currently shown on the live website
-- as defined in packagesConfig.js (imageKey fallbacks).
-- We write them to both:
--   1. cms_packages.image_url   → used by PackageEditor
--   2. cms_content              → used by website's getMedia() lookup
-- ============================================================================

-- ── 1. Set image_url in cms_packages ─────────────────────────────────────

UPDATE cms_packages
SET image_url = 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1260&q=80'
WHERE package_key = 'complete';

UPDATE cms_packages
SET image_url = 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=1260&q=80'
WHERE package_key = 'adventure';

UPDATE cms_packages
SET image_url = 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1260&q=80'
WHERE package_key = 'threeDay';

UPDATE cms_packages
SET image_url = 'https://images.unsplash.com/photo-1705946985442-512875aaa310?auto=format&fit=crop&w=1260&q=80'
WHERE package_key = 'taster';

-- ── 2. Dual-write to cms_content so getMedia() on the website also works ──

INSERT INTO cms_content (page_slug, section_key, field_key, field_type, content_en, content_sv, content_de, content_pl)
VALUES
  ('packages', 'package7day', 'packages.complete.image',  'url',
   'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1260&q=80'),

  ('packages', 'package5day', 'packages.adventure.image', 'url',
   'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=1260&q=80'),

  ('packages', 'package3day', 'packages.threeDay.image',  'url',
   'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1260&q=80'),

  ('packages', 'package1day', 'packages.taster.image',    'url',
   'https://images.unsplash.com/photo-1705946985442-512875aaa310?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1705946985442-512875aaa310?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1705946985442-512875aaa310?auto=format&fit=crop&w=1260&q=80',
   'https://images.unsplash.com/photo-1705946985442-512875aaa310?auto=format&fit=crop&w=1260&q=80')

ON CONFLICT (page_slug, section_key, field_key) DO UPDATE
  SET content_en = EXCLUDED.content_en,
      content_sv = EXCLUDED.content_sv,
      content_de = EXCLUDED.content_de,
      content_pl = EXCLUDED.content_pl;
