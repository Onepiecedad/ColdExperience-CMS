/**
 * Fix Media URLs in Supabase
 * 
 * Updates public_url to use the full domain so images/videos
 * can be displayed in the dashboard.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The website's base URL
const WEBSITE_BASE_URL = 'https://coldexperience.se';

async function fixMediaUrls() {
    console.log('🔧 Fixing media URLs in Supabase...\n');

    // Get all media entries
    const { data: allMedia, error } = await supabase
        .from('cms_media')
        .select('id, filename, public_url, storage_path');

    if (error) {
        console.error('❌ Error fetching media:', error.message);
        return;
    }

    console.log(`📁 Found ${allMedia.length} media entries\n`);

    let updated = 0;
    let skipped = 0;

    for (const item of allMedia) {
        // Skip if already has full URL
        if (item.public_url?.startsWith('http')) {
            skipped++;
            continue;
        }

        // Build new URL
        const newUrl = item.public_url
            ? `${WEBSITE_BASE_URL}${item.public_url.startsWith('/') ? '' : '/'}${item.public_url}`
            : item.storage_path
                ? `${WEBSITE_BASE_URL}${item.storage_path.startsWith('/') ? '' : '/'}${item.storage_path}`
                : null;

        if (!newUrl) {
            console.log(`⚠️  No URL for: ${item.filename}`);
            continue;
        }

        // Update the record
        const { error: updateError } = await supabase
            .from('cms_media')
            .update({ public_url: newUrl })
            .eq('id', item.id);

        if (updateError) {
            console.error(`❌ Update failed for ${item.filename}:`, updateError.message);
        } else {
            console.log(`✅ ${item.filename} → ${newUrl}`);
            updated++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped (already full URL): ${skipped}`);
    console.log(`   Total: ${allMedia.length}`);

    // Verify a sample
    console.log('\n🔍 Sample verification:');
    const { data: sample } = await supabase
        .from('cms_media')
        .select('filename, public_url')
        .limit(5);

    sample?.forEach(s => {
        console.log(`   ${s.filename}: ${s.public_url}`);
    });
}

fixMediaUrls()
    .then(() => {
        console.log('\n✅ Media URL fix complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
