/**
 * Sync Adventures Media to Supabase
 * 
 * This script ensures all adventure-related media files are properly
 * assigned in Supabase cms_media table.
 * 
 * Adventures section (Home page) uses:
 * - snoskoter2-opt.mp4 (+ poster IMG_6698.jpg)
 * - norrsken1-opt.mp4 (+ poster norrsken1.jpg)
 * - hundspann2-opt.mp4 (+ poster hundspann1.jpg)
 * - Skolan-film-2.mp4 (+ poster skolan1-4fe44306.jpg)
 * 
 * Individual adventure pages use their own hero videos/images.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Media files for Adventures section on Home page
const ADVENTURES_SECTION_MEDIA = [
    // Snowmobile card
    {
        filename: 'snoskoter2-opt.mp4',
        alt_text_en: 'Snowmobile safari in Lapland',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/snoskoter2-opt.mp4',
    },
    {
        filename: 'IMG_6698.jpg',
        alt_text_en: 'Snowmobile poster image',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'image/jpeg',
        storage_path: '/images/Nya_bilder/IMG_6698.jpg',
    },
    // Northern Lights card
    {
        filename: 'norrsken1-opt.mp4',
        alt_text_en: 'Northern Lights dancing in the sky',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/norrsken1-opt.mp4',
    },
    {
        filename: 'norrsken1.jpg',
        alt_text_en: 'Northern Lights poster image',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'image/jpeg',
        storage_path: '/images/Nya_bilder/norrsken1.jpg',
    },
    // Dog Sledding card
    {
        filename: 'hundspann2-opt.mp4',
        alt_text_en: 'Husky dog sledding adventure',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/hundspann2-opt.mp4',
    },
    {
        filename: 'hundspann1.jpg',
        alt_text_en: 'Dog sledding poster image',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'image/jpeg',
        storage_path: '/images/Nya_bilder/hundspann1.jpg',
    },
    // Lodging card
    {
        filename: 'Skolan-film-2.mp4',
        alt_text_en: 'Schoolhouse lodging in Lapland',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'video/mp4',
        storage_path: '/skolan-bilder/Skolan-film-2.mp4',
    },
    {
        filename: 'skolan1-4fe44306.jpg',
        alt_text_en: 'Schoolhouse exterior at night',
        page_id: 'experiences',
        section_id: 'experiences',
        mime_type: 'image/jpeg',
        storage_path: '/skolan-bilder/skolan1-4fe44306.jpg',
    },
];

// Media for individual adventure subpages
const ADVENTURE_SUBPAGE_MEDIA = [
    // Snowmobile Safari page
    {
        filename: 'snoskoter-opt.mp4',
        alt_text_en: 'Snowmobile Safari hero video',
        page_id: 'experiences',
        section_id: 'snowmobile',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/snoskoter-opt.mp4',
    },
    {
        filename: 'IMG_3493.jpg',
        alt_text_en: 'Snowmobile Safari intro image',
        page_id: 'experiences',
        section_id: 'snowmobile',
        mime_type: 'image/jpeg',
        storage_path: '/images/Nya_bilder/IMG_3493.jpg',
    },
    // Northern Lights page
    {
        filename: 'norrsken-opt.mp4',
        alt_text_en: 'Northern Lights Tour hero video',
        page_id: 'experiences',
        section_id: 'northernLights',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/norrsken-opt.mp4',
    },
    // Dog Sledding page
    {
        filename: 'hundspann-opt.mp4',
        alt_text_en: 'Husky Ride hero video',
        page_id: 'experiences',
        section_id: 'dogSledding',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/hundspann-opt.mp4',
    },
    // Accommodation page
    {
        filename: 'skolan-opt.mp4',
        alt_text_en: 'Accommodation hero video',
        page_id: 'experiences',
        section_id: 'lodging',
        mime_type: 'video/mp4',
        storage_path: '/optimized_videos/skolan-opt.mp4',
    },
];

async function syncMedia() {
    console.log('🔄 Starting Adventures media sync...\n');

    const allMedia = [...ADVENTURES_SECTION_MEDIA, ...ADVENTURE_SUBPAGE_MEDIA];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const media of allMedia) {
        // Check if file already exists
        const { data: existing } = await supabase
            .from('cms_media')
            .select('id, page_id, section_id')
            .eq('filename', media.filename)
            .eq('page_id', media.page_id)
            .eq('section_id', media.section_id)
            .maybeSingle();

        if (existing) {
            console.log(`⏭️  Already exists: ${media.filename} (${media.section_id})`);
            skipped++;
            continue;
        }

        // Check if file exists with different section
        const { data: existingFile } = await supabase
            .from('cms_media')
            .select('id, page_id, section_id')
            .eq('filename', media.filename)
            .maybeSingle();

        if (existingFile) {
            // Create a duplicate entry for this section
            const { error } = await supabase
                .from('cms_media')
                .insert({
                    filename: media.filename,
                    alt_text_en: media.alt_text_en,
                    page_id: media.page_id,
                    section_id: media.section_id,
                    mime_type: media.mime_type,
                    storage_path: media.storage_path,
                    public_url: media.storage_path, // Use storage_path as public_url
                    size_bytes: 0,
                    created_at: new Date().toISOString(),
                });

            if (error) {
                console.error(`❌ Error creating duplicate: ${media.filename}`, error.message);
            } else {
                console.log(`✅ Created duplicate: ${media.filename} → ${media.section_id}`);
                created++;
            }
        } else {
            // Create new entry
            const { error } = await supabase
                .from('cms_media')
                .insert({
                    filename: media.filename,
                    alt_text_en: media.alt_text_en,
                    page_id: media.page_id,
                    section_id: media.section_id,
                    mime_type: media.mime_type,
                    storage_path: media.storage_path,
                    public_url: media.storage_path, // Use storage_path as public_url
                    size_bytes: 0,
                    created_at: new Date().toISOString(),
                });

            if (error) {
                console.error(`❌ Error creating: ${media.filename}`, error.message);
            } else {
                console.log(`✅ Created: ${media.filename} → ${media.section_id}`);
                created++;
            }
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${allMedia.length}`);

    // List current adventures media
    console.log('\n📁 Current experiences media in Supabase:');
    const { data: currentMedia } = await supabase
        .from('cms_media')
        .select('filename, section_id, mime_type')
        .eq('page_id', 'experiences')
        .order('section_id');

    if (currentMedia) {
        const grouped = {};
        currentMedia.forEach(m => {
            if (!grouped[m.section_id]) grouped[m.section_id] = [];
            grouped[m.section_id].push(m);
        });

        Object.entries(grouped).forEach(([section, files]) => {
            console.log(`\n   ${section}:`);
            files.forEach(f => {
                const icon = f.mime_type?.includes('video') ? '🎬' : '🖼️';
                console.log(`      ${icon} ${f.filename}`);
            });
        });
    }
}

syncMedia()
    .then(() => {
        console.log('\n✅ Adventures media sync complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    });
