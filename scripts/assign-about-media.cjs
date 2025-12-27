// Script to correctly assign media to About sections
// Handles shared images by updating only the FIRST occurrence and creating references

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Prioritized assignment - first section wins
// Based on actual images used in About.js
const SECTION_ASSIGNMENTS = [
    // 1. Hero - Video and poster (UNIQUE - these go to hero)
    { filename: 'om_oss-opt.mp4', page_id: 'about', section_id: 'hero' },

    // 2. Values - 4 background images (IMG_2425 already in hero, use others)
    { filename: 'IMG_7834.jpg', page_id: 'about', section_id: 'values' },
    { filename: 'IMG_1547.jpg', page_id: 'about', section_id: 'values' },
    { filename: 'IMG_4436.jpg', page_id: 'about', section_id: 'values' },
    // Note: IMG_2425.jpg is shared with Hero, so it stays in hero

    // 3. Meet Us - Owner photo (UNIQUE)
    { filename: 'owners.jpg', page_id: 'about', section_id: 'meet-us' },

    // 4. Action Images - 3 action photos
    { filename: 'IMG_4108.jpg', page_id: 'about', section_id: 'action-images' },
    { filename: 'IMG_3493.jpg', page_id: 'about', section_id: 'action-images' },
    // Note: IMG_6698.jpg might be shared elsewhere

    // 5. Timeline - 5 timeline photos (UNIQUE to this section)
    { filename: 'gustav_childhood.jpg', page_id: 'about', section_id: 'timeline' },
    { filename: 'julias_matresa.jpg', page_id: 'about', section_id: 'timeline' },
    { filename: 'love_adventure.jpg', page_id: 'about', section_id: 'timeline' },
    { filename: 'family_2.jpg', page_id: 'about', section_id: 'timeline' },
    { filename: 'coldexperience_born.jpg', page_id: 'about', section_id: 'timeline' },

    // 6. CTA - Background image
    { filename: 'IMG_0451.jpg', page_id: 'about', section_id: 'cta' },

    // Hero section gets IMG_2425.jpg (shared with Values background)
    { filename: 'IMG_2425.jpg', page_id: 'about', section_id: 'hero' },

    // IMG_6698.jpg for action-images
    { filename: 'IMG_6698.jpg', page_id: 'about', section_id: 'action-images' },
];

async function assignAboutMedia() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('=== ASSIGNING ABOUT PAGE MEDIA ===\n');

    // First, get all existing media
    const { data: allMedia, error: fetchError } = await supabase
        .from('cms_media')
        .select('*');

    if (fetchError) {
        console.error('Error fetching media:', fetchError);
        return;
    }

    console.log(`Found ${allMedia.length} total media files\n`);

    // Track which files have been assigned
    const assigned = new Set();

    for (const assignment of SECTION_ASSIGNMENTS) {
        // Find the media file
        const media = allMedia.find(m => m.filename === assignment.filename);

        if (!media) {
            console.log(`⚠️  ${assignment.filename} - NOT FOUND`);
            continue;
        }

        if (assigned.has(media.id)) {
            console.log(`⏭️  ${assignment.filename} - Already assigned (skipping)`);
            continue;
        }

        // Update the assignment
        const { error } = await supabase
            .from('cms_media')
            .update({
                page_id: assignment.page_id,
                section_id: assignment.section_id
            })
            .eq('id', media.id);

        if (error) {
            console.log(`❌ ${assignment.filename} - Error: ${error.message}`);
        } else {
            console.log(`✅ ${assignment.filename} → ${assignment.page_id}/${assignment.section_id}`);
            assigned.add(media.id);
        }
    }

    console.log('\n\n=== VERIFICATION: ABOUT SECTIONS ===\n');

    const sections = ['hero', 'values', 'meet-us', 'action-images', 'timeline', 'cta'];

    for (const section of sections) {
        const { data, error } = await supabase
            .from('cms_media')
            .select('filename')
            .eq('page_id', 'about')
            .eq('section_id', section);

        if (error) {
            console.log(`about/${section}: Error`);
        } else {
            console.log(`\n📂 about/${section}: ${data.length} files`);
            data.forEach(m => console.log(`   - ${m.filename}`));
        }
    }
}

assignAboutMedia().catch(console.error);
