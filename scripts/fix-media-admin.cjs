/**
 * Fix all unassigned media using service_role key (bypasses RLS)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
// Using service_role key which bypasses RLS
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// All assignments for unassigned media
const assignments = [
    // Film videos → experiences
    { filename: 'Film-1.mp4', pageId: 'experiences', sectionId: 'experiences' },
    { filename: 'Film-2.mp4', pageId: 'experiences', sectionId: 'experiences' },
    { filename: 'Film-3.mp4', pageId: 'experiences', sectionId: 'experiences' },
    { filename: 'Film-4.mp4', pageId: 'experiences', sectionId: 'experiences' },

    // Family photos → about/story
    { filename: 'family_1.jpg', pageId: 'about', sectionId: 'story' },
    { filename: 'family_2.jpg', pageId: 'about', sectionId: 'story' },

    // coldexperience videos → hero
    { filename: 'coldexperience1.mp4', pageId: 'hero', sectionId: 'hero' },
    { filename: 'coldexperience2.mp4', pageId: 'hero', sectionId: 'hero' },
    { filename: 'coldexperience3.mp4', pageId: 'hero', sectionId: 'hero' },
    { filename: 'coldexperience1-opt.mp4', pageId: 'hero', sectionId: 'hero' },

    // coldexperience story images → about/story
    { filename: 'coldexperience_born.jpg', pageId: 'about', sectionId: 'story' },
    { filename: 'julias_matresa.jpg', pageId: 'about', sectionId: 'story' },

    // IMG_ photos → gallery
    { filename: 'IMG_0451.jpg', pageId: 'gallery', sectionId: 'gallery' },
    { filename: 'IMG_1547.jpg', pageId: 'gallery', sectionId: 'gallery' },
    { filename: 'IMG_2425.jpg', pageId: 'gallery', sectionId: 'gallery' },
    { filename: 'IMG_3493.jpg', pageId: 'gallery', sectionId: 'gallery' },
    { filename: 'IMG_4108.jpg', pageId: 'gallery', sectionId: 'gallery' },
    { filename: 'IMG_4436.jpg', pageId: 'gallery', sectionId: 'gallery' },
];

async function fixAllMedia() {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIXING ALL UNASSIGNED MEDIA (using service_role key)');
    console.log('='.repeat(70) + '\n');

    let fixed = 0;
    let notFound = 0;
    let errors = 0;

    for (const item of assignments) {
        process.stdout.write(`${item.filename} → ${item.pageId}/${item.sectionId}... `);

        const { data, error } = await supabase
            .from('cms_media')
            .update({
                page_id: item.pageId,
                section_id: item.sectionId
            })
            .eq('filename', item.filename)
            .select('id');

        if (error) {
            console.log(`❌ Error: ${error.message}`);
            errors++;
        } else if (data && data.length > 0) {
            console.log('✅');
            fixed++;
        } else {
            console.log('⚠️ not found');
            notFound++;
        }
    }

    console.log(`\n📊 Results: ${fixed} fixed, ${notFound} not found, ${errors} errors\n`);

    // Final verification
    console.log('='.repeat(70));
    console.log('📊 FINAL VERIFICATION');
    console.log('='.repeat(70) + '\n');

    const { data: allMedia } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id');

    const assigned = allMedia.filter(m => m.page_id && m.section_id);
    const unassigned = allMedia.filter(m => !m.page_id || !m.section_id);

    console.log(`   📦 Total media files:     ${allMedia.length}`);
    console.log(`   ✅ Assigned to sections:  ${assigned.length}`);
    console.log(`   ❌ Still unassigned:      ${unassigned.length}`);

    if (unassigned.length > 0) {
        console.log('\n   Still unassigned:');
        unassigned.forEach(m => console.log(`      - ${m.filename}`));
    }

    // Group by page
    const byPage = {};
    assigned.forEach(m => {
        byPage[m.page_id] = (byPage[m.page_id] || 0) + 1;
    });

    console.log('\n   📂 Media by page:');
    Object.keys(byPage).sort().forEach(page => {
        console.log(`      ${page}: ${byPage[page]} files`);
    });

    console.log('\n' + '='.repeat(70));
    if (unassigned.length === 0) {
        console.log('🎉 ALL 93 MEDIA FILES ARE NOW ASSIGNED TO SECTIONS!');
    } else {
        console.log(`✅ ${assigned.length}/${allMedia.length} media files are assigned`);
    }
    console.log('='.repeat(70) + '\n');
}

fixAllMedia().catch(console.error);
