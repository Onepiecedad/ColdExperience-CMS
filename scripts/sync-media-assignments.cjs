/**
 * SYNC WEBSITE MEDIA TO SUPABASE
 * Takes the website media inventory and ensures cms_media table
 * has correct page_id and section_id assignments.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Website media mapping from source code analysis
const WEBSITE_MEDIA_SECTIONS = {
    'hero': {
        'hero': [
            '/nya_filmer/coldexperience-top-1.mp4',
            '/images/Nya_bilder/IMG_6698.jpg'
        ]
    },
    'features': {
        'features': [
            '/optimized_videos/coldexperience1-opt.mp4',
            '/optimized_videos/coldexperience2-opt.mp4',
            '/optimized_videos/coldexperience3-opt.mp4',
            '/nya_filmer/matlagning.mp4'
        ]
    },
    'experiences': {
        'experiences': [
            '/optimized_videos/snoskoter2-opt.mp4',
            '/optimized_videos/norrsken1-opt.mp4',
            '/optimized_videos/hundspann2-opt.mp4',
            '/skolan-bilder/Skolan-film-2.mp4',
            '/images/Nya_bilder/norrsken1.jpg',
            '/images/Nya_bilder/hundspann1.jpg'
        ]
    },
    'about': {
        'ownerSection': [
            '/images/owners.jpg'
        ],
        'about': [
            '/optimized_videos/om_oss-opt.mp4'
        ],
        'story': [
            '/images/Nya_bilder/IMG_4108.jpg',
            '/images/Nya_bilder/IMG_3493.jpg',
            '/images/Nya_bilder/IMG_5689.jpg',
            '/images/Nya_bilder/IMG_6359.jpg',
            '/images/Nya_bilder/IMG_0451.jpg',
            '/images/Nya_bilder/gustav_childhood.jpg',
            '/images/Nya_bilder/julias_matresa.jpg',
            '/images/Nya_bilder/love_adventure.jpg',
            '/images/Nya_bilder/family_2.jpg',
            '/images/Nya_bilder/coldexperience_born.jpg',
            '/images/Nya_bilder/IMG_2425.jpg',
            '/images/Nya_bilder/IMG_7834.jpg',
            '/images/Nya_bilder/IMG_1547.jpg',
            '/images/Nya_bilder/IMG_4436.jpg'
        ]
    },
    'gallery': {
        'gallery': [
            '/optimized_videos/galleri-opt.mp4',
            '/images/Nya_bilder/IMG_6698.jpg',
            '/images/Nya_bilder/IMG_4108.jpg',
            '/images/Nya_bilder/IMG_3493.jpg',
            '/images/Nya_bilder/IMG_0542.jpg',
            '/images/Nya_bilder/IMG_0575.jpg',
            '/images/Nya_bilder/IMG_4527.jpg',
            '/images/Nya_bilder/IMG_0451.jpg',
            '/images/Nya_bilder/IMG_1687.jpg',
            '/images/Nya_bilder/coldexperience_born.jpg',
            '/images/Nya_bilder/IMG_6181.jpg',
            '/images/Nya_bilder/IMG_1547.jpg',
            '/images/Nya_bilder/IMG_2425.jpg',
            '/images/Nya_bilder/IMG_4436.jpg',
            '/images/Nya_bilder/IMG_7834.jpg',
            '/images/Nya_bilder/IMG_1634.jpg',
            '/images/Nya_bilder/IMG_3700.jpg',
            '/images/Nya_bilder/IMG_4545.jpg',
            '/images/Nya_bilder/IMG_5562.jpg',
            '/images/Nya_bilder/IMG_3838.jpg',
            '/images/Nya_bilder/IMG_3860.jpg',
            '/images/Nya_bilder/IMG_2963.jpg',
            '/images/Nya_bilder/family_1.jpg',
            '/images/Nya_bilder/family_2.jpg',
            '/images/Nya_bilder/IMG_0554 (1).jpg',
            '/images/Nya_bilder/IMG_1579.jpg',
            '/images/Nya_bilder/IMG_1904.jpg',
            '/images/Nya_bilder/IMG_4082.jpg',
            '/images/Nya_bilder/IMG_4596 (1).jpg',
            '/images/Nya_bilder/julias_matresa.jpg',
            '/images/Nya_bilder/IMG_6702.jpg',
            '/images/Nya_bilder/IMG_7476 (1).jpg'
        ]
    },
    'contact': {
        'contact': [
            '/optimized_videos/coldexperience1-opt.mp4',
            '/images/Nya_bilder/IMG_0451.jpg'
        ]
    },
    'faq': {
        'questions': [
            '/images/Nya_bilder/clothes.png'
        ]
    },
    'packages': {
        'packages': [
            '/optimized_videos/coldexperience1-opt.mp4',
            '/images/Nya_bilder/IMG_6698.jpg'
        ]
    }
};

function extractFilename(path) {
    return path.split('/').pop();
}

async function syncMediaAssignments() {
    console.log('='.repeat(70));
    console.log('SYNCING WEBSITE MEDIA TO SUPABASE');
    console.log('='.repeat(70));
    console.log('');

    // Get all media from Supabase
    const { data: allMedia, error } = await supabase
        .from('cms_media')
        .select('*');

    if (error) {
        console.error('Error fetching media:', error);
        return;
    }

    console.log(`Found ${allMedia.length} media files in Supabase`);
    console.log('');

    // Create a map of filename -> media record
    const mediaByFilename = {};
    allMedia.forEach(m => {
        const filename = m.filename;
        if (!mediaByFilename[filename]) {
            mediaByFilename[filename] = [];
        }
        mediaByFilename[filename].push(m);
    });

    let updated = 0;
    let notFound = [];

    // Update each section
    for (const [pageId, sections] of Object.entries(WEBSITE_MEDIA_SECTIONS)) {
        for (const [sectionId, filePaths] of Object.entries(sections)) {
            console.log(`\n📁 ${pageId}/${sectionId} (${filePaths.length} files):`);

            for (const filePath of filePaths) {
                const filename = extractFilename(filePath);
                const matches = mediaByFilename[filename];

                if (matches && matches.length > 0) {
                    // Update the first match
                    const media = matches[0];

                    // Only update if different
                    if (media.page_id !== pageId || media.section_id !== sectionId) {
                        const { error: updateError } = await supabase
                            .from('cms_media')
                            .update({ page_id: pageId, section_id: sectionId })
                            .eq('id', media.id);

                        if (updateError) {
                            console.log(`   ❌ ${filename} - Update failed: ${updateError.message}`);
                        } else {
                            console.log(`   ✅ ${filename} (was: ${media.page_id}/${media.section_id} → now: ${pageId}/${sectionId})`);
                            updated++;
                        }
                    } else {
                        console.log(`   ✓ ${filename} (already correct)`);
                    }
                } else {
                    console.log(`   ⚠️ ${filename} - NOT FOUND in Supabase`);
                    notFound.push({ pageId, sectionId, filename, filePath });
                }
            }
        }
    }

    console.log('\n');
    console.log('='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Updated: ${updated} files`);
    console.log(`Not found: ${notFound.length} files`);

    if (notFound.length > 0) {
        console.log('\nMissing files (need to be uploaded):');
        notFound.forEach(f => console.log(`  - ${f.filePath}`));
    }
}

syncMediaAssignments();
