// Script to assign correct About page media - handles duplicates
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Based on About.js - exact images per section
const SECTIONS = {
    'hero': ['om_oss-opt.mp4', 'IMG_2425.jpg'],
    'values': ['IMG_7834.jpg', 'IMG_1547.jpg', 'IMG_4436.jpg'],  // Note: IMG_2425.jpg used in hero
    'meet-us': ['owners.jpg'],
    'action-images': ['IMG_4108.jpg', 'IMG_3493.jpg', 'IMG_6698.jpg'],
    'timeline': ['gustav_childhood.jpg', 'julias_matresa.jpg', 'love_adventure.jpg', 'family_2.jpg', 'coldexperience_born.jpg'],
    'cta': ['IMG_0451.jpg']
};

async function assignMedia() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('=== ASSIGNING ABOUT MEDIA (FULL UPDATE) ===\n');

    // Get ALL media
    const { data: allMedia, error: fetchError } = await supabase
        .from('cms_media')
        .select('*');

    if (fetchError) {
        console.error('Error:', fetchError);
        return;
    }

    console.log(`Total media in DB: ${allMedia.length}\n`);

    // For each section, find matching images and update them
    for (const [sectionId, filenames] of Object.entries(SECTIONS)) {
        console.log(`\n📁 about/${sectionId}:`);

        for (const filename of filenames) {
            // Find ALL matching media entries
            const matches = allMedia.filter(m => m.filename === filename);

            if (matches.length === 0) {
                console.log(`   ⚠️  ${filename} - NOT FOUND in database`);
                continue;
            }

            // Update the first match to this section
            const targetMedia = matches[0];

            const { error: updateError } = await supabase
                .from('cms_media')
                .update({
                    page_id: 'about',
                    section_id: sectionId
                })
                .eq('id', targetMedia.id);

            if (updateError) {
                console.log(`   ❌ ${filename} - Error: ${updateError.message}`);
            } else {
                console.log(`   ✅ ${filename} (ID: ${targetMedia.id.slice(0, 8)}...) → about/${sectionId}`);
                // Mark as used so we don't reassign
                targetMedia._used = true;
            }
        }
    }

    // Verify
    console.log('\n\n=== FINAL VERIFICATION ===\n');

    for (const sectionId of Object.keys(SECTIONS)) {
        const { data, error } = await supabase
            .from('cms_media')
            .select('filename, id')
            .eq('page_id', 'about')
            .eq('section_id', sectionId);

        console.log(`about/${sectionId}: ${data?.length || 0} files`);
        (data || []).forEach(m => console.log(`  - ${m.filename}`));
    }
}

assignMedia().catch(console.error);
