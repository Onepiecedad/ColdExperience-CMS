// Script to set up correct media assignments for About page sections
// Based on actual images used in About.js on the website

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Images used in each About section (based on About.js analysis)
const ABOUT_SECTION_MEDIA = {
    // 1. Hero - Video and poster image
    'about:hero': {
        page_id: 'about',
        section_id: 'hero',
        images: [
            { filename: 'om_oss-opt.mp4', path: '/optimized_videos/om_oss-opt.mp4' },
            { filename: 'IMG_2425.jpg', path: '/images/Nya_bilder/IMG_2425.jpg' }
        ]
    },
    // 2. Values - 4 background images for value cards
    'about:values': {
        page_id: 'about',
        section_id: 'values',
        images: [
            { filename: 'IMG_2425.jpg', path: '/images/Nya_bilder/IMG_2425.jpg' },  // Family
            { filename: 'IMG_7834.jpg', path: '/images/Nya_bilder/IMG_7834.jpg' },  // Authentic
            { filename: 'IMG_1547.jpg', path: '/images/Nya_bilder/IMG_1547.jpg' },  // Small Groups
            { filename: 'IMG_4436.jpg', path: '/images/Nya_bilder/IMG_4436.jpg' }   // Memories
        ]
    },
    // 3. Meet Gustav & Julia - Main owner photo only
    'about:meet-us': {
        page_id: 'about',
        section_id: 'meet-us',
        images: [
            { filename: 'owners.jpg', path: '/images/owners.jpg' }
        ]
    },
    // 4. Action Images - 3 action photos with overlay text
    'about:action-images': {
        page_id: 'about',
        section_id: 'action-images',
        images: [
            { filename: 'IMG_4108.jpg', path: '/images/Nya_bilder/IMG_4108.jpg' },  // Snowmobile
            { filename: 'IMG_3493.jpg', path: '/images/Nya_bilder/IMG_3493.jpg' },  // Lodge
            { filename: 'IMG_6698.jpg', path: '/images/Nya_bilder/IMG_6698.jpg' }   // Landscape
        ]
    },
    // 5. Timeline (Our Journey) - 5 timeline photos
    'about:timeline': {
        page_id: 'about',
        section_id: 'timeline',
        images: [
            { filename: 'gustav_childhood.jpg', path: '/images/Nya_bilder/gustav_childhood.jpg' },
            { filename: 'julias_matresa.jpg', path: '/images/Nya_bilder/julias_matresa.jpg' },
            { filename: 'love_adventure.jpg', path: '/images/Nya_bilder/love_adventure.jpg' },
            { filename: 'family_2.jpg', path: '/images/Nya_bilder/family_2.jpg' },
            { filename: 'coldexperience_born.jpg', path: '/images/Nya_bilder/coldexperience_born.jpg' }
        ]
    },
    // 6. CTA - Background image
    'about:cta': {
        page_id: 'about',
        section_id: 'cta',
        images: [
            { filename: 'IMG_0451.jpg', path: '/images/Nya_bilder/IMG_0451.jpg' }
        ]
    }
};

async function setupAboutMedia() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('=== SETTING UP ABOUT PAGE MEDIA ===\n');

    // First, get all existing media to find matching files
    const { data: allMedia, error: fetchError } = await supabase
        .from('cms_media')
        .select('*');

    if (fetchError) {
        console.error('Error fetching media:', fetchError);
        return;
    }

    console.log(`Found ${allMedia.length} total media files in database\n`);

    // Create a map of filename to media record
    const mediaByFilename = {};
    for (const m of allMedia) {
        mediaByFilename[m.filename] = m;
    }

    // Process each section
    for (const [sectionKey, config] of Object.entries(ABOUT_SECTION_MEDIA)) {
        console.log(`\n📂 ${sectionKey} (${config.page_id}/${config.section_id})`);
        console.log('─'.repeat(50));

        for (const img of config.images) {
            const existing = mediaByFilename[img.filename];

            if (existing) {
                // Update the existing media to point to this section
                const { error: updateError } = await supabase
                    .from('cms_media')
                    .update({
                        page_id: config.page_id,
                        section_id: config.section_id
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    console.log(`  ❌ ${img.filename} - Error: ${updateError.message}`);
                } else {
                    console.log(`  ✅ ${img.filename} → ${config.page_id}/${config.section_id}`);
                }
            } else {
                // Try to find by partial filename match
                const partialMatch = allMedia.find(m =>
                    m.filename.includes(img.filename.replace('.jpg', '').replace('.mp4', ''))
                );

                if (partialMatch) {
                    const { error: updateError } = await supabase
                        .from('cms_media')
                        .update({
                            page_id: config.page_id,
                            section_id: config.section_id
                        })
                        .eq('id', partialMatch.id);

                    if (updateError) {
                        console.log(`  ❌ ${img.filename} (found as ${partialMatch.filename}) - Error: ${updateError.message}`);
                    } else {
                        console.log(`  ✅ ${partialMatch.filename} → ${config.page_id}/${config.section_id}`);
                    }
                } else {
                    console.log(`  ⚠️  ${img.filename} - NOT FOUND in database (may need to be uploaded)`);
                }
            }
        }
    }

    console.log('\n\n=== VERIFICATION ===\n');

    // Verify the assignments
    for (const [sectionKey, config] of Object.entries(ABOUT_SECTION_MEDIA)) {
        const { data, error } = await supabase
            .from('cms_media')
            .select('filename')
            .eq('page_id', config.page_id)
            .eq('section_id', config.section_id);

        if (error) {
            console.log(`${sectionKey}: Error fetching`);
        } else {
            console.log(`${sectionKey}: ${data.length} files`);
            data.forEach(m => console.log(`  - ${m.filename}`));
        }
    }
}

setupAboutMedia().catch(console.error);
