/**
 * Complete fix for ALL remaining unassigned media
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

// Complete assignments for ALL known files
const assignments = {
    // Film videos → experiences
    'Film-1.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-2.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-3.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-4.mp4': { pageId: 'experiences', sectionId: 'experiences' },

    // Family photos → about/story
    'family_1.jpg': { pageId: 'about', sectionId: 'story' },
    'family_2.jpg': { pageId: 'about', sectionId: 'story' },

    // coldexperience videos → hero
    'coldexperience1.mp4': { pageId: 'hero', sectionId: 'hero' },
    'coldexperience2.mp4': { pageId: 'hero', sectionId: 'hero' },
    'coldexperience3.mp4': { pageId: 'hero', sectionId: 'hero' },
    'coldexperience1-opt.mp4': { pageId: 'hero', sectionId: 'hero' },
    'coldexperience_born.jpg': { pageId: 'about', sectionId: 'story' },

    // IMG_ photos → gallery
    'IMG_0451.jpg': { pageId: 'gallery', sectionId: 'gallery' },
    'IMG_1547.jpg': { pageId: 'gallery', sectionId: 'gallery' },
    'IMG_2425.jpg': { pageId: 'gallery', sectionId: 'gallery' },
    'IMG_3493.jpg': { pageId: 'gallery', sectionId: 'gallery' },
    'IMG_4108.jpg': { pageId: 'gallery', sectionId: 'gallery' },
    'IMG_4436.jpg': { pageId: 'gallery', sectionId: 'gallery' },

    // Julia's food journey → about/story
    'julias_matresa.jpg': { pageId: 'about', sectionId: 'story' },
};

async function fixAll() {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 COMPLETE MEDIA ASSIGNMENT FIX');
    console.log('='.repeat(70) + '\n');

    // Fix each file by filename
    let fixed = 0;
    let errors = 0;

    for (const [filename, assignment] of Object.entries(assignments)) {
        process.stdout.write(`Fixing ${filename}... `);

        const { data, error } = await supabase
            .from('cms_media')
            .update({
                page_id: assignment.pageId,
                section_id: assignment.sectionId
            })
            .eq('filename', filename)
            .select();

        if (error) {
            console.log(`❌ ${error.message}`);
            errors++;
        } else if (data && data.length > 0) {
            console.log(`✅ → ${assignment.pageId}/${assignment.sectionId}`);
            fixed++;
        } else {
            console.log(`⚠️ not found in database`);
        }
    }

    console.log(`\n📊 Fixed: ${fixed}, Errors: ${errors}\n`);

    // Wait for DB
    await new Promise(r => setTimeout(r, 500));

    // Final verification
    console.log('='.repeat(70));
    console.log('📊 FINAL VERIFICATION');
    console.log('='.repeat(70) + '\n');

    const { data: allMedia } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id');

    const assigned = allMedia.filter(m => m.page_id && m.section_id);
    const unassigned = allMedia.filter(m => !m.page_id || !m.section_id);

    console.log(`   📦 Total media:       ${allMedia.length}`);
    console.log(`   ✅ Assigned:          ${assigned.length}`);
    console.log(`   ❌ Unassigned:        ${unassigned.length}`);

    if (unassigned.length > 0) {
        console.log('\n   Still unassigned:');
        unassigned.forEach(m => {
            console.log(`   - ${m.filename} (page_id: ${m.page_id}, section_id: ${m.section_id})`);
        });
    }

    // Summary by page
    const byPage = {};
    assigned.forEach(m => {
        byPage[m.page_id] = (byPage[m.page_id] || 0) + 1;
    });

    console.log('\n   📂 Distribution by page:');
    Object.keys(byPage).sort().forEach(page => {
        console.log(`      ${page}: ${byPage[page]} files`);
    });

    console.log('\n' + '='.repeat(70));
    if (unassigned.length === 0) {
        console.log('🎉 ALL MEDIA FILES ARE NOW ASSIGNED!');
    } else {
        console.log(`⚠️ ${unassigned.length} files still need assignment`);
    }
    console.log('='.repeat(70) + '\n');
}

fixAll().catch(console.error);
