/**
 * Final check and assignment of remaining media
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

// Manual assignments for remaining files
const manualAssignments = {
    'Film-1.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-2.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-3.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'Film-4.mp4': { pageId: 'experiences', sectionId: 'experiences' },
    'family_1.jpg': { pageId: 'about', sectionId: 'story' },
    'family_2.jpg': { pageId: 'about', sectionId: 'story' },
};

async function finalFix() {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FINAL MEDIA ASSIGNMENT FIX');
    console.log('='.repeat(70) + '\n');

    // Get current status
    const { data: unassigned } = await supabase
        .from('cms_media')
        .select('*')
        .or('page_id.is.null,section_id.is.null');

    console.log(`📦 Currently unassigned: ${unassigned?.length || 0}\n`);

    if (unassigned && unassigned.length > 0) {
        console.log('Fixing remaining files:\n');

        for (const media of unassigned) {
            const manual = manualAssignments[media.filename];

            if (manual) {
                console.log(`${media.filename} → ${manual.pageId}/${manual.sectionId}`);

                await supabase
                    .from('cms_media')
                    .update({
                        page_id: manual.pageId,
                        section_id: manual.sectionId
                    })
                    .eq('id', media.id);
            } else {
                console.log(`${media.filename} → (no manual assignment, skipping)`);
            }
        }
    }

    // Wait a moment for DB to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Final full audit
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL STATUS');
    console.log('='.repeat(70) + '\n');

    const { data: allMedia } = await supabase
        .from('cms_media')
        .select('*');

    const assigned = allMedia.filter(m => m.page_id && m.section_id);
    const stillUnassigned = allMedia.filter(m => !m.page_id || !m.section_id);

    console.log(`   📦 Total media files:     ${allMedia.length}`);
    console.log(`   ✅ Assigned to sections:  ${assigned.length}`);
    console.log(`   ❌ Still unassigned:      ${stillUnassigned.length}`);

    // Group by section
    const bySection = {};
    assigned.forEach(m => {
        const key = `${m.page_id}/${m.section_id}`;
        bySection[key] = (bySection[key] || 0) + 1;
    });

    const sectionKeys = Object.keys(bySection).sort();
    console.log(`\n   📂 Media distribution across ${sectionKeys.length} sections:\n`);

    // Group by page
    const byPage = {};
    sectionKeys.forEach(key => {
        const page = key.split('/')[0];
        if (!byPage[page]) byPage[page] = [];
        byPage[page].push({ section: key, count: bySection[key] });
    });

    Object.keys(byPage).sort().forEach(page => {
        const pageTotal = byPage[page].reduce((sum, s) => sum + s.count, 0);
        console.log(`   📄 ${page}: ${pageTotal} files`);
        byPage[page].forEach(s => {
            console.log(`      └─ ${s.section.split('/')[1]}: ${s.count}`);
        });
    });

    if (stillUnassigned.length > 0) {
        console.log('\n   ⚠️  Unassigned files:');
        stillUnassigned.forEach(m => console.log(`      - ${m.filename}`));
    }

    console.log('\n' + '='.repeat(70));
    if (stillUnassigned.length === 0) {
        console.log('🎉 ALL 93 MEDIA FILES ARE ASSIGNED TO SECTIONS!');
    } else {
        console.log(`✅ ${assigned.length}/${allMedia.length} media files are assigned`);
    }
    console.log('='.repeat(70) + '\n');
}

finalFix().catch(console.error);
