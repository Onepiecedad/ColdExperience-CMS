/**
 * Fix Media URLs in Supabase
 * 
 * This script populates the public_url field for all media files
 * based on their storage_path or filename.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

// Base URL for Cold Experience media
const WEBSITE_BASE = 'https://coldexperience.se';
const SUPABASE_STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/media`;

// Known file paths on the website
const MEDIA_PATHS = {
    // Images
    'owners.jpg': '/images/Nya_bilder/owners.jpg',
    'clothes.png': '/images/faq/clothes.png',
    'gustav_childhood.jpg': '/images/about/gustav_childhood.jpg',
    'julia_childhood.jpg': '/images/about/julia_childhood.jpg',
    'gustav_julia_love.jpg': '/images/about/gustav_julia_love.jpg',
    'gustav_julia_love_2.jpg': '/images/about/gustav_julia_love_2.jpg',
    'gustav_julia_family.jpg': '/images/about/gustav_julia_family.jpg',
    'cold_experience.jpg': '/images/about/cold_experience.jpg',
    'cold_experience_born.jpg': '/images/about/cold_experience_born.jpg',

    // Gallery images
    'IMG_6698.jpg': '/images/Nya_bilder/IMG_6698.jpg',
    'IMG_8100.jpg': '/images/Nya_bilder/IMG_8100.jpg',
    'IMG_0024.jpg': '/images/Nya_bilder/IMG_0024.jpg',
    'IMG_0144.jpg': '/images/Nya_bilder/IMG_0144.jpg',

    // Videos
    'coldexperience-top-1.mp4': '/nya_filmer/coldexperience-top-1.mp4',
    'snöskoter-opt.mp4': '/nya_filmer/snöskoter-opt.mp4',
    'norrsken-opt.mp4': '/nya_filmer/norrsken-opt.mp4',
    'hundspann-opt.mp4': '/nya_filmer/hundspann-opt.mp4',
    'boende-opt.mp4': '/nya_filmer/boende-opt.mp4',
    'matlagning.mp4': '/nya_filmer/matlagning.mp4',
    'rast.mp4': '/nya_filmer/rast.mp4',
    'skoterfard.mp4': '/nya_filmer/skoterfard.mp4',
    'eldar.mp4': '/nya_filmer/eldar.mp4',
    'hundspann2.mp4': '/nya_filmer/hundspann2.mp4',
    'norrsken2.mp4': '/nya_filmer/norrsken2.mp4',
    'sauna.mp4': '/nya_filmer/sauna.mp4',
    'aterkomst.mp4': '/nya_filmer/aterkomst.mp4',
};

async function fixMediaUrls() {
    console.log('\n🔧 FIXING MEDIA URLs IN SUPABASE\n');
    console.log('='.repeat(60));

    // Get all media files
    const { data: media, error } = await supabase
        .from('cms_media')
        .select('*');

    if (error) {
        console.log('❌ Error fetching media:', error.message);
        return;
    }

    console.log(`Found ${media.length} media files\n`);

    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const file of media) {
        const filename = file.filename;

        // Try to find URL
        let url = null;

        // 1. Check if we have a known path
        if (MEDIA_PATHS[filename]) {
            url = WEBSITE_BASE + MEDIA_PATHS[filename];
        }
        // 2. Check if it's in Supabase storage
        else if (file.storage_path) {
            url = `${SUPABASE_STORAGE_BASE}/${file.storage_path}`;
        }
        // 3. Try to guess based on file extension
        else {
            const ext = filename.split('.').pop()?.toLowerCase();
            if (['mp4', 'webm', 'mov'].includes(ext)) {
                url = `${WEBSITE_BASE}/nya_filmer/${filename}`;
            } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
                url = `${WEBSITE_BASE}/images/Nya_bilder/${filename}`;
            }
        }

        if (!url) {
            console.log(`⚠️ No URL found for: ${filename}`);
            notFound++;
            continue;
        }

        // Update the record
        const { error: updateError } = await supabase
            .from('cms_media')
            .update({ public_url: url })
            .eq('id', file.id);

        if (updateError) {
            console.log(`❌ Failed to update ${filename}:`, updateError.message);
        } else {
            console.log(`✅ ${filename} → ${url}`);
            updated++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Updated:   ${updated}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Total:     ${media.length}`);
    console.log('');
}

fixMediaUrls().catch(console.error);
