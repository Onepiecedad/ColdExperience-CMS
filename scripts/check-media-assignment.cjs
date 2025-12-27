const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

(async () => {
    const { data } = await supabase
        .from('cms_media')
        .select('page_id, section_id, filename');

    const grouped = {};
    let unassigned = 0;

    data.forEach(m => {
        if (m.page_id) {
            const key = m.page_id + '/' + m.section_id;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m.filename);
        } else {
            unassigned++;
        }
    });

    console.log('Media assigned per section:');
    console.log('--------------------------------------------------');
    Object.entries(grouped).sort().forEach(([key, files]) => {
        console.log(key + ': ' + files.length + ' files');
    });
    console.log('--------------------------------------------------');
    console.log('Unassigned (global): ' + unassigned);
    console.log('Total: ' + data.length);
})();
