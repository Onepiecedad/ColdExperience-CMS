/**
 * Seed all getMedia() keys from the frontend into the CMS database.
 * These are media path keys that the frontend resolves via getMedia(key, fallback).
 * Run: node scripts/seed_media_keys.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://hpbeqrwwcmetbjjqvzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug'
);

// All getMedia() keys with page, section, fallback value, and label
const MEDIA_KEYS = [
  // ── Hero (home) ─────────────────────────────────────────────────
  { page: 'hero', section: 'hero', key: 'hero.backgroundVideoUrl', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Hero Background Video' },
  { page: 'hero', section: 'hero', key: 'hero.posterImageUrl', fallback: '/images/Nya_bilder/IMG_6698.webp', label: 'Hero Poster Image' },

  // ── Features (home) ─────────────────────────────────────────────
  { page: 'hero', section: 'features', key: 'features.feature1VideoUrl', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Feature 1 Video' },
  { page: 'hero', section: 'features', key: 'features.feature2VideoUrl', fallback: '/optimized_videos/coldexperience2-opt.mp4', label: 'Feature 2 Video' },
  { page: 'hero', section: 'features', key: 'features.feature3VideoUrl', fallback: '/optimized_videos/coldexperience3-opt.mp4', label: 'Feature 3 Video' },
  { page: 'hero', section: 'features', key: 'features.feature4VideoUrl', fallback: '/nya_filmer/matlagning.mp4', label: 'Feature 4 Video' },

  // ── Featured Video (home) ───────────────────────────────────────
  { page: 'hero', section: 'featuredVideo', key: 'featuredVideo.youtubeUrl', fallback: 'vfOGoiBlOoY', label: 'YouTube Video ID' },
  { page: 'hero', section: 'featuredVideo', key: 'featuredVideo.posterUrl', fallback: '/images/Nya_bilder/featured-poster.webp', label: 'YouTube Poster Image' },

  // ── Owner Section (home) ────────────────────────────────────────
  { page: 'hero', section: 'owner', key: 'ownerSection.ownerImageUrl', fallback: '/images/owners.webp', label: 'Owner Photo' },

  // ── About ───────────────────────────────────────────────────────
  { page: 'about', section: 'hero', key: 'about.hero.video', fallback: '/optimized_videos/om_oss-opt.mp4', label: 'Hero Video' },
  { page: 'about', section: 'hero', key: 'about.hero.poster', fallback: '/images/Nya_bilder/IMG_2425.webp', label: 'Hero Poster' },
  { page: 'about', section: 'about', key: 'about.actionImages.snowmobile', fallback: '/images/Nya_bilder/IMG_4108.webp', label: 'Action Image: Snowmobile' },
  { page: 'about', section: 'about', key: 'about.actionImages.lodge', fallback: '/images/Nya_bilder/IMG_3493.webp', label: 'Action Image: Lodge' },
  { page: 'about', section: 'about', key: 'about.actionImages.landscape', fallback: '/images/Nya_bilder/IMG_6698.webp', label: 'Action Image: Landscape' },
  { page: 'about', section: 'cta', key: 'about.cta.backgroundImage', fallback: '/images/Nya_bilder/IMG_0451.webp', label: 'CTA Background Image' },

  // ── Experiences ─────────────────────────────────────────────────
  { page: 'experiences', section: 'experiences', key: 'experiences.snowmobile.videoSrc', fallback: '/optimized_videos/snoskoter2-opt.mp4', label: 'Snowmobile Video' },
  { page: 'experiences', section: 'experiences', key: 'experiences.snowmobile.poster', fallback: '/images/Nya_bilder/IMG_6698.webp', label: 'Snowmobile Poster' },
  { page: 'experiences', section: 'experiences', key: 'experiences.northernLights.videoSrc', fallback: '/optimized_videos/norrsken1-opt.mp4', label: 'Northern Lights Video' },
  { page: 'experiences', section: 'experiences', key: 'experiences.northernLights.poster', fallback: '/images/Nya_bilder/norrsken1.webp', label: 'Northern Lights Poster' },
  { page: 'experiences', section: 'experiences', key: 'experiences.dogSledding.videoSrc', fallback: '/optimized_videos/hundspann2-opt.mp4', label: 'Dog Sledding Video' },
  { page: 'experiences', section: 'experiences', key: 'experiences.dogSledding.poster', fallback: '/images/Nya_bilder/hundspann1.webp', label: 'Dog Sledding Poster' },
  { page: 'experiences', section: 'experiences', key: 'experiences.lodging.videoSrc', fallback: '/skolan-bilder/Skolan-film-2.mp4', label: 'Lodging Video' },
  { page: 'experiences', section: 'experiences', key: 'experiences.lodging.poster', fallback: '/skolan-bilder/skolan1-4fe44306.jpg', label: 'Lodging Poster' },

  // ── Packages ────────────────────────────────────────────────────
  { page: 'packages', section: 'hero', key: 'packages.hero.videoSrc', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Hero Video' },
  { page: 'packages', section: 'hero', key: 'packages.hero.poster', fallback: '/images/Nya_bilder/IMG_6698.webp', label: 'Hero Poster' },
  { page: 'packages', section: 'cta', key: 'packages.cta.backgroundImage', fallback: '/images/Nya_bilder/IMG_4108.webp', label: 'CTA Background Image' },

  // ── Gallery ─────────────────────────────────────────────────────
  { page: 'gallery', section: 'hero', key: 'gallery.hero.videoSrc', fallback: '/optimized_videos/galleri-opt.mp4', label: 'Hero Background Video' },
  { page: 'gallery', section: 'hero', key: 'gallery.hero.poster', fallback: '/images/Nya_bilder/IMG_6702.webp', label: 'Hero Poster Image' },

  // ── Contact ─────────────────────────────────────────────────────
  { page: 'contact', section: 'hero', key: 'contact.hero.videoSrc', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Hero Video' },
  { page: 'contact', section: 'hero', key: 'contact.hero.poster', fallback: '/images/Nya_bilder/IMG_0451.webp', label: 'Hero Poster' },

  // ── Booking ─────────────────────────────────────────────────────
  { page: 'booking', section: 'hero', key: 'booking.hero.videoSrc', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Hero Video' },
  { page: 'booking', section: 'hero', key: 'booking.hero.poster', fallback: '/images/Nya_bilder/IMG_6698.webp', label: 'Hero Poster' },

  // ── FAQ ─────────────────────────────────────────────────────────
  { page: 'faq', section: 'hero', key: 'faq.hero.videoSrc', fallback: '/optimized_videos/coldexperience1-opt.mp4', label: 'Hero Video' },
  { page: 'faq', section: 'hero', key: 'faq.hero.poster', fallback: '/images/Nya_bilder/IMG_0451.webp', label: 'Hero Poster' },
  { page: 'faq', section: 'faq', key: 'faq.clothesImage', fallback: '/images/Nya_bilder/clothes.webp', label: 'Clothes Packing Image' },
];

(async () => {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const m of MEDIA_KEYS) {
    // Check if key already exists
    const { data: existing } = await sb
      .from('cms_content')
      .select('id')
      .eq('page_slug', m.page)
      .eq('field_key', m.key)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`SKIP  ${m.page}:${m.section} → ${m.key}`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('cms_content').insert({
      page_slug: m.page,
      section_key: m.section,
      field_key: m.key,
      field_type: 'url',
      field_label: m.label,
      content_en: m.fallback,
      content_sv: m.fallback,
      content_de: m.fallback,
      content_pl: m.fallback,
    });

    if (error) {
      console.log(`ERROR ${m.page}:${m.section} → ${m.key}: ${error.message}`);
      errors++;
    } else {
      console.log(`ADD   ${m.page}:${m.section} → ${m.key}`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} added, ${skipped} skipped, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
})();
