/**
 * Check and fix remaining unassigned media
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRemainingMedia() {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIXING REMAINING UNASSIGNED MEDIA');
    console.log('='.repeat(70) + '\n');

    // Get unassigned media
    const { data: unassigned } = await supabase
        .from('cms_media')
        .select('*')
        .or('page_id.is.null,section_id.is.null');

    console.log(`📦 Unassigned media files: ${unassigned?.length || 0}\n`);

    if (!unassigned || unassigned.length === 0) {
        console.log('✅ All media is already assigned!');
        return;
    }

    // Display them with details
    console.log('Files needing assignment:\n');

    for (const media of unassigned) {
        const type = media.media_type === 'video' ? '🎬' : '📷';
        console.log(`${type} ${media.filename}`);
        console.log(`   URL: ${media.public_url?.substring(0, 60)}...`);
        console.log(`   Current: page_id=${media.page_id || 'NULL'}, section_id=${media.section_id || 'NULL'}`);

        // Determine assignment based on filename and URL patterns
        let assignment = null;
        const filename = media.filename.toLowerCase();
        const url = (media.public_url || '').toLowerCase();

        // Check URL path for hints
        if (url.includes('/gallery/') || url.includes('/galleri/')) {
            assignment = { pageId: 'gallery', sectionId: 'gallery' };
        }
        else if (url.includes('/about/') || url.includes('/om-oss/')) {
            assignment = { pageId: 'about', sectionId: 'story' };
        }
        else if (url.includes('/packages/') || url.includes('/paket/')) {
            assignment = { pageId: 'packages', sectionId: 'packages' };
        }
        else if (url.includes('/experiences/') || url.includes('/upplevelser/')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        // Filename patterns
        else if (filename.includes('norrsken') || filename.includes('aurora')) {
            assignment = { pageId: 'experiences', sectionId: 'northernLights' };
        }
        else if (filename.includes('hundspann') || filename.includes('husky') || filename.includes('dog')) {
            assignment = { pageId: 'experiences', sectionId: 'dogSledding' };
        }
        else if (filename.includes('snoskoter') || filename.includes('snowmobile') || filename.includes('scooter')) {
            assignment = { pageId: 'experiences', sectionId: 'snowmobile' };
        }
        else if (filename.includes('skolan') || filename.includes('school')) {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }
        else if (filename.startsWith('img_')) {
            // Generic IMG_ files go to gallery
            assignment = { pageId: 'gallery', sectionId: 'gallery' };
        }
        else if (filename.includes('coldexperience')) {
            assignment = { pageId: 'hero', sectionId: 'hero' };
        }
        else if (filename.includes('mat') || filename.includes('food')) {
            assignment = { pageId: 'features', sectionId: 'features' };
        }
        else if (filename.includes('galleri') || filename.includes('gallery')) {
            assignment = { pageId: 'gallery', sectionId: 'gallery' };
        }
        // Default: unassigned media could be general content - put in gallery
        else if (media.media_type === 'image') {
            assignment = { pageId: 'gallery', sectionId: 'gallery' };
        }
        else if (media.media_type === 'video') {
            assignment = { pageId: 'experiences', sectionId: 'experiences' };
        }

        if (assignment) {
            console.log(`   → Assigning to: ${assignment.pageId}/${assignment.sectionId}`);

            const { error } = await supabase
                .from('cms_media')
                .update({
                    page_id: assignment.pageId,
                    section_id: assignment.sectionId
                })
                .eq('id', media.id);

            if (error) {
                console.log(`   ❌ Error: ${error.message}`);
            } else {
                console.log(`   ✅ Updated!`);
            }
        } else {
            console.log(`   ⚠️ Could not determine assignment`);
        }
        console.log('');
    }

    // Final count
    const { data: stillUnassigned } = await supabase
        .from('cms_media')
        .select('id')
        .or('page_id.is.null,section_id.is.null');

    console.log('='.repeat(70));
    if (stillUnassigned?.length === 0) {
        console.log('🎉 ALL MEDIA FILES ARE NOW ASSIGNED!');
    } else {
        console.log(`⚠️ Still unassigned: ${stillUnassigned?.length || 0} files`);
    }
    console.log('='.repeat(70) + '\n');
}

fixRemainingMedia().catch(console.error);
