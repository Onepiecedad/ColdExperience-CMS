import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data, error } = await supabase.from('cms_content').select('field_key, field_type, section_key').in('field_key', ['featuredVideo.youtubeUrl', 'ownerSection.ownerImageUrl']);
    console.log('DATA:', data);
    if (error) console.error('ERROR:', error);
}
run();
