/**
 * Compare Website Media with Supabase
 * 
 * Compares the website media inventory with what's in Supabase
 * and generates a report of missing files and assignment needs.
 * 
 * Run: node scripts/compare-and-sync-media.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load mapping file
const mappingFile = path.join(__dirname, '../media-section-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

async function compareAndSync() {
    console.log('🔍 Comparing website media with Supabase...\n');

    // 1. Fetch all media from Supabase
    const { data: supabaseMedia, error } = await supabase
        .from('cms_media')
        .select('*');

    if (error) {
        console.error('❌ Failed to fetch Supabase media:', error);
        return;
    }

    console.log(`📦 Supabase cms_media: ${supabaseMedia.length} files`);
    console.log(`📋 Mapping file: ${mapping.mappings.length} files to sync\n`);

    // Create lookup by filename
    const supabaseByFilename = {};
    supabaseMedia.forEach(m => {
        supabaseByFilename[m.filename.toLowerCase()] = m;
    });

    // 2. Analyze each mapping
    const results = {
        alreadyCorrect: [],
        needsUpdate: [],
        missingFromSupabase: [],
        sqlUpdates: []
    };

    for (const file of mapping.mappings) {
        const supabaseFile = supabaseByFilename[file.filename.toLowerCase()];

        if (!supabaseFile) {
            results.missingFromSupabase.push(file);
        } else if (supabaseFile.page_id === file.pageId && supabaseFile.section_id === file.sectionId) {
            results.alreadyCorrect.push({
                filename: file.filename,
                section: `${file.pageId}/${file.sectionId}`
            });
        } else {
            results.needsUpdate.push({
                filename: file.filename,
                current: `${supabaseFile.page_id || 'null'}/${supabaseFile.section_id || 'null'}`,
                target: `${file.pageId}/${file.sectionId}`,
                supabaseId: supabaseFile.id
            });

            // Generate SQL
            results.sqlUpdates.push(
                `UPDATE cms_media SET page_id = '${file.pageId}', section_id = '${file.sectionId}' WHERE id = '${supabaseFile.id}';`
            );
        }
    }

    // 3. Print report
    console.log('='.repeat(60));
    console.log('📊 COMPARISON REPORT');
    console.log('='.repeat(60));

    console.log(`\n✅ Already correct: ${results.alreadyCorrect.length}`);
    results.alreadyCorrect.forEach(f => {
        console.log(`   ${f.filename} → ${f.section}`);
    });

    console.log(`\n🔄 Needs update: ${results.needsUpdate.length}`);
    results.needsUpdate.forEach(f => {
        console.log(`   ${f.filename}: ${f.current} → ${f.target}`);
    });

    console.log(`\n❌ Missing from Supabase: ${results.missingFromSupabase.length}`);
    results.missingFromSupabase.forEach(f => {
        console.log(`   ${f.filename} (${f.relativePath})`);
    });

    // 4. Apply updates if there are any
    if (results.needsUpdate.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 APPLYING UPDATES...');
        console.log('='.repeat(60));

        let successCount = 0;
        for (const update of results.needsUpdate) {
            const { error } = await supabase
                .from('cms_media')
                .update({
                    page_id: update.target.split('/')[0],
                    section_id: update.target.split('/')[1]
                })
                .eq('id', update.supabaseId);

            if (error) {
                console.log(`   ❌ Failed: ${update.filename} - ${error.message}`);
            } else {
                console.log(`   ✅ Updated: ${update.filename} → ${update.target}`);
                successCount++;
            }
        }
        console.log(`\n📊 Updated ${successCount}/${results.needsUpdate.length} files`);
    }

    // 5. Save SQL file for reference
    if (results.sqlUpdates.length > 0) {
        const sqlFile = path.join(__dirname, 'media-section-updates.sql');
        const sqlContent = `-- Media Section Assignment Updates
-- Generated: ${new Date().toISOString()}
-- Total updates: ${results.sqlUpdates.length}

${results.sqlUpdates.join('\n')}
`;
        fs.writeFileSync(sqlFile, sqlContent);
        console.log(`\n💾 SQL backup saved to: ${sqlFile}`);
    }

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Total in mapping: ${mapping.mappings.length}`);
    console.log(`   Already correct: ${results.alreadyCorrect.length}`);
    console.log(`   Updated: ${results.needsUpdate.length}`);
    console.log(`   Missing (need upload): ${results.missingFromSupabase.length}`);

    if (results.missingFromSupabase.length > 0) {
        console.log('\n⚠️  Some files are missing from Supabase Storage.');
        console.log('   These need to be uploaded manually or via upload script.');
    }

    return results;
}

// Run
compareAndSync().catch(console.error);
