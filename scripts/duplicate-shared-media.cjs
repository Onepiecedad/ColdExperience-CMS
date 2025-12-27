/**
 * DUPLICATE SHARED MEDIA FOR SECTIONS
 * Creates duplicate entries in cms_media for files that are used in multiple sections
 * on the website. This ensures each section in CMS shows all its media files.
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

// Use SERVICE_ROLE_KEY to bypass RLS
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

// Files that are used in MULTIPLE sections on the website (from source code analysis)
const SHARED_FILES = {
    // coldexperience1-opt.mp4 is used in Features, Packages, Contact
    'coldexperience1-opt.mp4': [
        { page_id: 'features', section_id: 'features' },
        { page_id: 'packages', section_id: 'packages' },
        { page_id: 'contact', section_id: 'contact' },
    ],
    // IMG_6698.jpg is used in Hero, Gallery, Experiences, Packages
    'IMG_6698.jpg': [
        { page_id: 'hero', section_id: 'hero' },
        { page_id: 'gallery', section_id: 'gallery' },
        { page_id: 'experiences', section_id: 'experiences' },
        { page_id: 'packages', section_id: 'packages' },
    ],
    // IMG_0451.jpg is used in About, Gallery, Contact
    'IMG_0451.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
        { page_id: 'contact', section_id: 'contact' },
    ],
    // coldexperience_born.jpg is used in About story and Gallery
    'coldexperience_born.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // julias_matresa.jpg is used in About story and Gallery
    'julias_matresa.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // family_2.jpg is used in About story and Gallery
    'family_2.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_7834.jpg is used in About story and Gallery
    'IMG_7834.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_1547.jpg is used in About story and Gallery
    'IMG_1547.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_2425.jpg is used in About story and Gallery
    'IMG_2425.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_4436.jpg is used in About story and Gallery
    'IMG_4436.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_4108.jpg is used in About story and Gallery
    'IMG_4108.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
    // IMG_3493.jpg is used in About story and Gallery
    'IMG_3493.jpg': [
        { page_id: 'about', section_id: 'story' },
        { page_id: 'gallery', section_id: 'gallery' },
    ],
};

async function duplicateSharedMedia() {
    console.log('='.repeat(70));
    console.log('DUPLICATING SHARED MEDIA FILES');
    console.log('='.repeat(70));
    console.log('');

    // Get all current media
    const { data: allMedia, error } = await supabase
        .from('cms_media')
        .select('*');

    if (error) {
        console.error('Error fetching media:', error);
        return;
    }

    // Create map of filename -> media record
    const mediaByFilename = {};
    allMedia.forEach(m => {
        if (!mediaByFilename[m.filename]) {
            mediaByFilename[m.filename] = [];
        }
        mediaByFilename[m.filename].push(m);
    });

    let created = 0;
    let skipped = 0;

    for (const [filename, sections] of Object.entries(SHARED_FILES)) {
        console.log(`\n📁 ${filename}:`);

        // Find the source record
        const sourceRecords = mediaByFilename[filename];
        if (!sourceRecords || sourceRecords.length === 0) {
            console.log(`   ⚠️ Not found in Supabase - skipping`);
            continue;
        }

        const source = sourceRecords[0];

        for (const section of sections) {
            // Check if this section assignment already exists
            const exists = sourceRecords.some(
                r => r.page_id === section.page_id && r.section_id === section.section_id
            );

            if (exists) {
                console.log(`   ✓ ${section.page_id}/${section.section_id} (already exists)`);
                skipped++;
            } else {
                // Create duplicate entry
                const newRecord = {
                    filename: source.filename,
                    storage_path: source.storage_path,
                    public_url: source.public_url,
                    type: source.type,
                    width: source.width,
                    height: source.height,
                    page_id: section.page_id,
                    section_id: section.section_id,
                    alt_text: source.alt_text,
                    metadata: source.metadata,
                };

                const { data: inserted, error: insertError } = await supabase
                    .from('cms_media')
                    .insert(newRecord)
                    .select();

                if (insertError) {
                    console.log(`   ❌ ${section.page_id}/${section.section_id} - Error: ${insertError.message}`);
                } else {
                    console.log(`   ✅ ${section.page_id}/${section.section_id} (created duplicate)`);
                    created++;
                    // Add to our tracking
                    mediaByFilename[filename].push(inserted[0]);
                }
            }
        }
    }

    console.log('\n');
    console.log('='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Created: ${created} duplicate entries`);
    console.log(`Skipped: ${skipped} (already existed)`);
    console.log('');
    console.log('Running final audit...');
}

duplicateSharedMedia().then(async () => {
    // Run audit
    const { data } = await supabase
        .from('cms_media')
        .select('page_id, section_id, filename');

    const grouped = {};
    data.forEach(m => {
        if (m.page_id) {
            const key = m.page_id + '/' + m.section_id;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m.filename);
        }
    });

    console.log('\nMedia per section:');
    console.log('-'.repeat(50));
    Object.entries(grouped).sort().forEach(([key, files]) => {
        console.log(`${key}: ${files.length} files`);
    });
    console.log('-'.repeat(50));
    console.log(`Total: ${data.length} entries`);
});
