/**
 * Debug: Show exact filenames of unassigned media
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('\n🔍 DEBUGGING UNASSIGNED MEDIA\n');

    // Get all unassigned
    const { data: unassigned } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id, public_url')
        .or('page_id.is.null,section_id.is.null');

    console.log(`Found ${unassigned.length} unassigned media:\n`);

    for (const m of unassigned) {
        console.log(`ID: ${m.id}`);
        console.log(`Filename: "${m.filename}"`);
        console.log(`URL: ${m.public_url?.substring(0, 80)}...`);
        console.log('---');
    }

    // Try a direct update with ID
    if (unassigned.length > 0) {
        console.log('\n📝 Testing direct update by ID...\n');

        const testMedia = unassigned[0];
        console.log(`Updating: ${testMedia.filename} (ID: ${testMedia.id})`);

        const { data, error } = await supabase
            .from('cms_media')
            .update({ page_id: 'gallery', section_id: 'gallery' })
            .eq('id', testMedia.id)
            .select();

        if (error) {
            console.log(`\n❌ Update error: ${error.message}`);
            console.log(`Error code: ${error.code}`);
            console.log(`Error details: ${JSON.stringify(error.details)}`);
        } else {
            console.log(`\n✅ Update succeeded:`);
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

debug().catch(console.error);
