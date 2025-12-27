const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function listHeroMedia() {
    const { data } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id')
        .eq('page_id', 'hero')
        .eq('section_id', 'hero');

    console.log('Files assigned to hero/hero:');
    console.log('='.repeat(60));
    data?.forEach(m => console.log(`- ${m.filename}\n  ID: ${m.id}`));
    console.log('='.repeat(60));
    console.log(`Total: ${data?.length || 0} files`);
}

listHeroMedia();
