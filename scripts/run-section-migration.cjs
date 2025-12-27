/**
 * Run SQL migration to add page_id and section_id columns to cms_media
 * 
 * Usage: node scripts/run-section-migration.cjs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found');
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
        }
    });
    return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Running section-bound media migration...\n');
    console.log('📍 Supabase URL:', supabaseUrl);

    try {
        // Check current schema of cms_media
        console.log('\n📋 Checking current cms_media schema...');

        const { data: existingMedia, error: checkError } = await supabase
            .from('cms_media')
            .select('*')
            .limit(1);

        if (checkError) {
            console.error('❌ Error checking cms_media:', checkError.message);
            return;
        }

        // Check if columns already exist by looking at the data structure
        const sampleMedia = existingMedia?.[0];
        if (sampleMedia) {
            const hasPageId = 'page_id' in sampleMedia;
            const hasSectionId = 'section_id' in sampleMedia;

            if (hasPageId && hasSectionId) {
                console.log('✅ Columns page_id and section_id already exist!');
                console.log('   Migration already complete - no action needed.');

                // Show current stats
                const { count } = await supabase
                    .from('cms_media')
                    .select('*', { count: 'exact', head: true });
                console.log(`\n📊 Total media files: ${count || 0}`);

                const { count: assignedCount } = await supabase
                    .from('cms_media')
                    .select('*', { count: 'exact', head: true })
                    .not('page_id', 'is', null);
                console.log(`📂 Assigned to sections: ${assignedCount || 0}`);
                console.log(`📁 Unassigned (global): ${(count || 0) - (assignedCount || 0)}`);

                return;
            }
        }

        console.log('\n⚠️  Note: SQL ALTER TABLE commands must be run in Supabase SQL Editor.');
        console.log('   The Supabase client API does not support DDL statements.\n');

        console.log('📝 Please run this SQL in Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/hpbeqrwwcmetbjjqvzsv/sql\n');

        console.log('─'.repeat(60));
        console.log(`
-- Add section binding columns to cms_media
ALTER TABLE cms_media ADD COLUMN IF NOT EXISTS page_id TEXT;
ALTER TABLE cms_media ADD COLUMN IF NOT EXISTS section_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cms_media_page_section 
ON cms_media(page_id, section_id);
        `);
        console.log('─'.repeat(60));

        console.log('\n📊 Current cms_media status:');
        const { count } = await supabase
            .from('cms_media')
            .select('*', { count: 'exact', head: true });
        console.log(`   Total media files: ${count || 0}`);

        console.log('\n✅ After running the SQL, section-bound media will be ready!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
}

runMigration();
