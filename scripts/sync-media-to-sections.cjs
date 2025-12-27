/**
 * Sync Media to Sections: Links media files to their sections in Supabase
 * Updates page_id and section_id columns directly on cms_media table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMediaToSections() {
    console.log('\n' + '='.repeat(70));
    console.log('🔗 SYNCING MEDIA TO SECTIONS');
    console.log('='.repeat(70) + '\n');

    // 1. Load the mapping file
    const mappingPath = path.join(__dirname, '..', 'media-section-mapping.json');
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    console.log(`📄 Loaded ${mappingData.mappings.length} mappings from mapping file\n`);

    // 2. Get all media from Supabase
    const { data: allMedia, error: mediaError } = await supabase
        .from('cms_media')
        .select('*');

    if (mediaError) {
        console.error('❌ Error fetching media:', mediaError.message);
        return;
    }

    console.log(`📦 Found ${allMedia.length} media files in Supabase\n`);

    // Create a lookup by filename
    const mediaByFilename = {};
    allMedia.forEach(m => {
        mediaByFilename[m.filename] = m;
    });

    // 3. Count how many need updates
    const mediaWithSection = allMedia.filter(m => m.page_id && m.section_id);
    const mediaWithoutSection = allMedia.filter(m => !m.page_id || !m.section_id);

    console.log(`📊 Current status:`);
    console.log(`   ✅ Media with page/section: ${mediaWithSection.length}`);
    console.log(`   ❌ Media without page/section: ${mediaWithoutSection.length}\n`);

    // 4. Process mappings and update media
    let updated = 0;
    let notFound = [];
    let skipped = 0;

    console.log('📤 Processing mappings...\n');

    for (const mapping of mappingData.mappings) {
        const media = mediaByFilename[mapping.filename];

        if (!media) {
            notFound.push(mapping.filename);
            continue;
        }

        // Skip if already has page_id and section_id set
        if (media.page_id === mapping.pageId && media.section_id === mapping.sectionId) {
            skipped++;
            continue;
        }

        // Update the media record
        const { error: updateError } = await supabase
            .from('cms_media')
            .update({
                page_id: mapping.pageId,
                section_id: mapping.sectionId
            })
            .eq('id', media.id);

        if (updateError) {
            console.error(`   ❌ Error updating ${mapping.filename}: ${updateError.message}`);
        } else {
            updated++;
        }
    }

    console.log(`\n📊 Mapping results:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped (already set): ${skipped}`);
    console.log(`   ❌ Not found in db: ${notFound.length}`);

    if (notFound.length > 0) {
        console.log('\n⚠️  Missing media files (not in cms_media):');
        notFound.slice(0, 10).forEach(f => console.log(`   - ${f}`));
        if (notFound.length > 10) {
            console.log(`   ... and ${notFound.length - 10} more`);
        }
    }

    // 5. Now handle media that's NOT in the mapping by trying to auto-assign
    console.log('\n' + '-'.repeat(70));
    console.log('🤖 AUTO-ASSIGNING REMAINING MEDIA');
    console.log('-'.repeat(70) + '\n');

    // Refresh media data
    const { data: refreshedMedia } = await supabase
        .from('cms_media')
        .select('*');

    const mappedFilenames = new Set(mappingData.mappings.map(m => m.filename));
    const unmappedMedia = refreshedMedia.filter(m =>
        !mappedFilenames.has(m.filename) && (!m.page_id || !m.section_id)
    );

    console.log(`📦 Unmapped media files to auto-assign: ${unmappedMedia.length}\n`);

    let autoAssigned = 0;

    for (const media of unmappedMedia) {
        const filename = media.filename.toLowerCase();
        let assignment = null;

        // Northern lights - experiences
        if (filename.includes('norrsken') || filename.includes('aurora')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        // Dog sledding - experiences
        else if (filename.includes('hundspann') || filename.includes('husky')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        // Snowmobile - experiences
        else if (filename.includes('snoskoter') || filename.includes('snowmobile')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        // School/education - experiences
        else if (filename.includes('skolan') || filename.includes('school')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        // Gallery patterns - IMG_ files that are images
        else if (filename.startsWith('img_')) {
            assignment = { pageId: 'gallery', sectionId: 'grid' };
        }
        // Cooking/food - features
        else if (filename.includes('mat') || filename.includes('food') || filename.includes('cooking')) {
            assignment = { pageId: 'features', sectionId: 'why-choose-us' };
        }
        // coldexperience videos
        else if (filename.includes('coldexperience') && media.media_type === 'video') {
            assignment = { pageId: 'hero', sectionId: 'hero' };
        }
        // Gallery related
        else if (filename.includes('galleri')) {
            assignment = { pageId: 'gallery', sectionId: 'grid' };
        }
        // About related
        else if (filename.includes('om_oss') || filename.includes('about')) {
            assignment = { pageId: 'about', sectionId: 'story' };
        }

        if (assignment) {
            const { error } = await supabase
                .from('cms_media')
                .update({
                    page_id: assignment.pageId,
                    section_id: assignment.sectionId
                })
                .eq('id', media.id);

            if (!error) {
                autoAssigned++;
            }
        }
    }

    console.log(`🤖 Auto-assigned: ${autoAssigned} media files\n`);

    // 6. Final verification
    console.log('='.repeat(70));
    console.log('📊 FINAL VERIFICATION');
    console.log('='.repeat(70) + '\n');

    const { data: finalMedia } = await supabase
        .from('cms_media')
        .select('*');

    const finalWithSection = finalMedia.filter(m => m.page_id && m.section_id);
    const finalWithoutSection = finalMedia.filter(m => !m.page_id || !m.section_id);

    console.log(`   📦 Total media files:         ${finalMedia.length}`);
    console.log(`   ✅ With page/section:         ${finalWithSection.length}`);
    console.log(`   ❌ Without page/section:      ${finalWithoutSection.length}`);

    // Group by section
    const bySection = {};
    finalWithSection.forEach(m => {
        const key = `${m.page_id}/${m.section_id}`;
        bySection[key] = (bySection[key] || 0) + 1;
    });

    console.log('\n   📂 Media by section:');
    Object.keys(bySection).sort().forEach(key => {
        console.log(`      ${key}: ${bySection[key]} files`);
    });

    if (finalWithoutSection.length > 0 && finalWithoutSection.length <= 15) {
        console.log('\n   ⚠️  Still unassigned:');
        finalWithoutSection.forEach(m => console.log(`      - ${m.filename}`));
    }

    console.log('\n' + '='.repeat(70));
    if (finalWithoutSection.length === 0) {
        console.log('🎉 ALL MEDIA FILES ARE NOW ASSIGNED TO SECTIONS!');
    } else {
        console.log(`✅ MEDIA SYNC COMPLETE - ${finalWithoutSection.length} files still need manual assignment`);
    }
    console.log('='.repeat(70) + '\n');
}

syncMediaToSections().catch(console.error);
