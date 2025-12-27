// Check what section_id values exist under page_id='about'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase
        .from('cms_media')
        .select('page_id, section_id, filename')
        .eq('page_id', 'about');

    if (error) { console.error(error); return; }

    // Group by section
    const bySection = {};
    data.forEach(m => {
        if (!bySection[m.section_id]) bySection[m.section_id] = [];
        bySection[m.section_id].push(m.filename);
    });

    console.log('=== MEDIA UNDER page_id=about ===\n');
    for (const [section, files] of Object.entries(bySection)) {
        console.log(`${section}:`);
        files.forEach(f => console.log(`  - ${f}`));
        console.log();
    }
}
check();
