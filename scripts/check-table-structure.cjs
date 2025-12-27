/**
 * Check table structure and RLS policies
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
    console.log('\n🔍 CHECKING TABLE STRUCTURE\n');

    // Get one record with all columns
    const { data, error } = await supabase
        .from('cms_media')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in cms_media table:');
        Object.keys(data[0]).forEach(col => {
            console.log(`  - ${col}: ${typeof data[0][col]} = ${JSON.stringify(data[0][col])?.substring(0, 50)}`);
        });
    }

    // Check if page_id column exists
    console.log('\n📋 Checking for page_id and section_id columns...');

    const hasPageId = data[0].hasOwnProperty('page_id');
    const hasSectionId = data[0].hasOwnProperty('section_id');

    console.log(`  page_id exists: ${hasPageId}`);
    console.log(`  section_id exists: ${hasSectionId}`);

    if (!hasPageId || !hasSectionId) {
        console.log('\n⚠️  COLUMNS ARE MISSING! You need to run this SQL in Supabase:');
        console.log(`
-- Add page_id and section_id columns to cms_media
ALTER TABLE cms_media ADD COLUMN IF NOT EXISTS page_id TEXT;
ALTER TABLE cms_media ADD COLUMN IF NOT EXISTS section_id TEXT;

-- Make sure RLS allows updates
CREATE POLICY "Allow public updates" ON cms_media
FOR UPDATE USING (true) WITH CHECK (true);
        `);
    } else {
        console.log('\n✅ Columns exist! Checking RLS...');

        // Try an update
        const testId = data[0].id;
        const { data: updateResult, error: updateError } = await supabase
            .from('cms_media')
            .update({ page_id: 'test' })
            .eq('id', testId)
            .select();

        if (updateError) {
            console.log(`\n❌ Update blocked: ${updateError.message}`);
            console.log('\n⚠️  RLS is blocking updates. Run this SQL in Supabase:');
            console.log(`
-- Allow public updates on cms_media
DROP POLICY IF EXISTS "Allow public updates" ON cms_media;
CREATE POLICY "Allow public updates" ON cms_media
FOR UPDATE USING (true) WITH CHECK (true);
            `);
        } else if (updateResult && updateResult.length === 0) {
            console.log('\n⚠️  Update returned empty - RLS is blocking');
            console.log('\nRun this SQL in Supabase SQL Editor:');
            console.log(`
-- Allow public updates on cms_media  
DROP POLICY IF EXISTS "Allow public updates" ON cms_media;
CREATE POLICY "Allow public updates" ON cms_media
FOR UPDATE USING (true) WITH CHECK (true);
            `);
        } else {
            console.log('\n✅ Updates are working!');
            // Revert test
            await supabase
                .from('cms_media')
                .update({ page_id: data[0].page_id })
                .eq('id', testId);
        }
    }
}

checkStructure().catch(console.error);
