/**
 * Seed gallery.image.* keys into the CMS database.
 * These are the editable image source paths for each gallery image.
 * Run: node scripts/seed_gallery_image_keys.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://hpbeqrwwcmetbjjqvzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug'
);

const GALLERY_IMAGES = [
  { id: 'aurora-lapland', src: '/images/Nya_bilder/IMG_6698.webp', label: 'Northern lights over Lapland' },
  { id: 'snowmobile-guide', src: '/images/Nya_bilder/IMG_4108.webp', label: 'Snowmobile guide on frozen lake' },
  { id: 'cabin-night', src: '/images/Nya_bilder/IMG_3493.webp', label: 'Cabins glowing in winter night' },
  { id: 'forest-cabin', src: '/images/Nya_bilder/IMG_0542.webp', label: 'Log cabin in winter forest' },
  { id: 'moonlit-pines', src: '/images/Nya_bilder/IMG_0575.webp', label: 'Moonlit pines under clear sky' },
  { id: 'aurora-base', src: '/images/Nya_bilder/IMG_4527.webp', label: 'Aurora above snowmobile base' },
  { id: 'winter-forest', src: '/images/Nya_bilder/IMG_0451.webp', label: 'Lapland winter forest' },
  { id: 'team-ready', src: '/images/Nya_bilder/IMG_1687.webp', label: 'Snowmobile team ready' },
  { id: 'trail-selfie', src: '/images/Nya_bilder/coldexperience_born.webp', label: 'Sunset selfie on trail' },
  { id: 'aurora-tub', src: '/images/Nya_bilder/IMG_6181.webp', label: 'Hot tub beneath northern lights' },
  { id: 'frozen-lake-stop', src: '/images/Nya_bilder/IMG_1547.webp', label: 'Snowmobile at frozen lake' },
  { id: 'handlebar-view', src: '/images/Nya_bilder/IMG_2425.webp', label: 'Trail view from handlebars' },
  { id: 'sunrise-homestead', src: '/images/Nya_bilder/IMG_4436.webp', label: 'Sunrise over homestead' },
  { id: 'summit-celebration', src: '/images/Nya_bilder/IMG_7834.webp', label: 'Guests celebrating on summit' },
  { id: 'outdoor-hot-tub', src: '/images/Nya_bilder/IMG_1634.webp', label: 'Outdoor hot tub' },
  { id: 'lakeside-aurora', src: '/images/Nya_bilder/IMG_3700.webp', label: 'Aurora above lakeside cabin' },
  { id: 'campfire-hut', src: '/images/Nya_bilder/IMG_4545.webp', label: 'Campfire outside timber hut' },
  { id: 'hosts-grilling', src: '/images/Nya_bilder/IMG_5562.webp', label: 'Hosts grilling inside kota' },
  { id: 'winter-cabin-sunrise', src: '/images/Nya_bilder/IMG_3838.webp', label: 'Winter sunrise over cabin' },
  { id: 'evening-campfire', src: '/images/Nya_bilder/IMG_3860.webp', label: 'Evening campfire' },
  { id: 'family-winter-sun', src: '/images/Nya_bilder/IMG_2963.webp', label: 'Family in winter sun' },
  { id: 'family-trail-moment', src: '/images/Nya_bilder/family_1.webp', label: 'Family joy on winter trail' },
  { id: 'family-snow-laughter', src: '/images/Nya_bilder/family_2.webp', label: 'Laughter in Lapland snow' },
  { id: 'moonlit-cabin', src: '/images/Nya_bilder/IMG_0554 (1).webp', label: 'Moonlit cabin in deep winter' },
  { id: 'fireplace-feast', src: '/images/Nya_bilder/IMG_1579.webp', label: 'Lapland flavours grilled' },
  { id: 'aurora-dance', src: '/images/Nya_bilder/IMG_1904.webp', label: 'Aurora dancing across sky' },
  { id: 'fireside-shelter', src: '/images/Nya_bilder/IMG_4082.webp', label: 'Firelit cabin in forest' },
  { id: 'star-camp', src: '/images/Nya_bilder/IMG_4596 (1).webp', label: 'Starlit mountain shelter' },
  { id: 'campfire-cooking', src: '/images/Nya_bilder/julias_matresa.webp', label: 'Campfire cooking' },
  { id: 'aurora-pines', src: '/images/Nya_bilder/IMG_6702.webp', label: 'Northern lights above pines' },
  { id: 'fireside-lake', src: '/images/Nya_bilder/IMG_7476 (1).webp', label: 'Snowmobile camp at lake' },
];

(async () => {
  let inserted = 0, skipped = 0, errors = 0;

  for (const img of GALLERY_IMAGES) {
    const fieldKey = `gallery.image.${img.id}`;

    const { data: existing } = await sb
      .from('cms_content')
      .select('id')
      .eq('page_slug', 'gallery')
      .eq('field_key', fieldKey)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`SKIP  ${fieldKey}`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('cms_content').insert({
      page_slug: 'gallery',
      section_key: 'images',
      field_key: fieldKey,
      field_type: 'url',
      field_label: `Image: ${img.label}`,
      content_en: img.src,
      content_sv: img.src,
      content_de: img.src,
      content_pl: img.src,
    });

    if (error) {
      console.log(`ERROR ${fieldKey}: ${error.message}`);
      errors++;
    } else {
      console.log(`ADD   ${fieldKey}`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} added, ${skipped} skipped, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
})();
