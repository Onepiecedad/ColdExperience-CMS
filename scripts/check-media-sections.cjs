// Script to check what page_id/section_id combinations exist in cms_media
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkMediaSections() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all unique page_id/section_id combinations
    const { data, error } = await supabase
        .from('cms_media')
        .select('page_id, section_id, filename')
        .order('page_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('=== MEDIA SECTION ASSIGNMENTS ===\n');

    // Group by page_id/section_id
    const groups = {};
    for (const item of data) {
        const key = `${item.page_id || 'NULL'}/${item.section_id || 'NULL'}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item.filename);
    }

    // Print results
    for (const [key, files] of Object.entries(groups)) {
        console.log(`\n📁 ${key} (${files.length} files):`);
        files.slice(0, 5).forEach(f => console.log(`   - ${f}`));
        if (files.length > 5) {
            console.log(`   ... and ${files.length - 5} more`);
        }
    }

    // Specifically check for about page
    console.log('\n\n=== ABOUT PAGE MEDIA SPECIFICALLY ===');
    const aboutMedia = data.filter(m => m.page_id && m.page_id.includes('about'));
    if (aboutMedia.length === 0) {
        console.log('No media found with page_id containing "about"');
    } else {
        aboutMedia.forEach(m => console.log(`- ${m.page_id}/${m.section_id}: ${m.filename}`));
    }
}

checkMediaSections();
