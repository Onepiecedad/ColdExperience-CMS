/**
 * Force Sync Clean Data to Supabase
 * 
 * This script reads the clean local cms-content-data.json and pushes it directly
 * to Supabase, bypassing the browser state which may have corrupted [object Object] values.
 * 
 * Arrays are serialized as JSON strings to preserve their structure.
 * 
 * Usage: node scripts/force-sync-clean-data.cjs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials. Make sure .env.local has:');
    console.error('   VITE_SUPABASE_URL=...');
    console.error('   VITE_SUPABASE_ANON_KEY=...');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Serialize a value for storage in Supabase
 * - Strings are stored as-is
 * - Arrays of objects are serialized as JSON
 * - Arrays of strings are serialized as JSON
 */
function serializeValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        // Always serialize arrays as JSON to preserve structure
        return JSON.stringify(value);
    }
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}

async function main() {
    console.log('🚀 Force Sync Clean Data to Supabase');
    console.log('=====================================\n');

    // 1. Load clean local data
    const jsonPath = path.join(__dirname, '..', 'cms-content-data.json');

    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ File not found: ${jsonPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const cmsData = JSON.parse(rawData);

    console.log(`📖 Loaded clean data from cms-content-data.json`);
    console.log(`   Total fields: ${cmsData.meta?.total_fields || 'unknown'}`);
    console.log(`   Languages: ${cmsData.meta?.languages?.join(', ') || 'en, sv, de, pl'}`);
    console.log('');

    // 2. Load page ID mappings from Supabase
    console.log('📄 Loading page IDs from Supabase...');

    const { data: pages, error: pagesError } = await supabase
        .from('cms_pages')
        .select('id, slug, name');

    if (pagesError) {
        console.error('❌ Failed to load pages:', pagesError.message);
        process.exit(1);
    }

    const pageIdMap = new Map();
    pages.forEach(page => {
        pageIdMap.set(page.slug, page.id);
        console.log(`   📄 ${page.slug} → ${page.id}`);
    });

    console.log(`\n✓ Found ${pageIdMap.size} pages in database\n`);

    // 3. Build content records from clean data
    const content = cmsData.content;
    const upsertData = [];
    let displayOrder = 0;
    let skippedPages = [];

    for (const pageSlug of Object.keys(content)) {
        const pageContent = content[pageSlug];
        const pageId = pageIdMap.get(pageSlug);

        if (!pageId) {
            skippedPages.push(pageSlug);
            continue;
        }

        for (const section of Object.keys(pageContent)) {
            const sectionContent = pageContent[section];

            for (const field of Object.keys(sectionContent)) {
                const fieldData = sectionContent[field];

                // Check if this is an array field to demonstrate the fix
                const isArrayField = Array.isArray(fieldData.en) ||
                    Array.isArray(fieldData.sv) ||
                    Array.isArray(fieldData.de) ||
                    Array.isArray(fieldData.pl);

                if (isArrayField) {
                    console.log(`   🔧 Array field: ${pageSlug}/${section}/${field}`);
                }

                upsertData.push({
                    page_id: pageId,
                    section: section,
                    content_key: `${section}.${field}`,
                    content_type: isArrayField ? 'array' : 'text',
                    content_en: serializeValue(fieldData.en),
                    content_sv: serializeValue(fieldData.sv),
                    content_de: serializeValue(fieldData.de),
                    content_pl: serializeValue(fieldData.pl),
                    field_label: field
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, s => s.toUpperCase())
                        .trim(),
                    display_order: displayOrder++,
                });
            }
        }
    }

    if (skippedPages.length > 0) {
        console.log(`⚠️  Skipped pages (no ID found): ${skippedPages.join(', ')}\n`);
    }

    console.log(`📦 Prepared ${upsertData.length} content items for sync\n`);

    // 4. Delete existing content for all pages we're syncing
    console.log('🗑️  Deleting existing content...');

    for (const pageSlug of Object.keys(content)) {
        const pageId = pageIdMap.get(pageSlug);
        if (pageId) {
            const { error } = await supabase
                .from('cms_content')
                .delete()
                .eq('page_id', pageId);

            if (error) {
                console.warn(`   ⚠️ Failed to delete for ${pageSlug}: ${error.message}`);
            } else {
                console.log(`   ✓ Cleared ${pageSlug}`);
            }
        }
    }

    console.log('');

    // 5. Insert clean data in batches
    console.log('📤 Inserting clean data...');

    const BATCH_SIZE = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
        const batch = upsertData.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(upsertData.length / BATCH_SIZE);

        const { error } = await supabase
            .from('cms_content')
            .insert(batch);

        if (error) {
            console.warn(`   ⚠️ Batch ${batchNum}/${totalBatches} failed: ${error.message}`);

            // Try individual inserts for failed batch
            for (const item of batch) {
                const { error: itemError } = await supabase
                    .from('cms_content')
                    .insert(item);

                if (itemError) {
                    errorCount++;
                } else {
                    successCount++;
                }
            }
        } else {
            successCount += batch.length;
            console.log(`   ✓ Batch ${batchNum}/${totalBatches}: ${batch.length} items`);
        }
    }

    console.log('');
    console.log('=====================================');
    console.log('📊 SYNC COMPLETE!');
    console.log('=====================================');
    console.log(`✅ Successfully synced: ${successCount}/${upsertData.length} items`);

    if (errorCount > 0) {
        console.log(`❌ Failed: ${errorCount} items`);
    }

    // Verify array fields were properly saved
    console.log('\n🔍 Verifying array fields in Supabase...');

    const { data: verifyData } = await supabase
        .from('cms_content')
        .select('content_key, content_en, content_type')
        .eq('content_type', 'array')
        .limit(5);

    if (verifyData && verifyData.length > 0) {
        console.log(`   Found ${verifyData.length} array fields. Sample:`);
        verifyData.forEach(item => {
            const preview = item.content_en?.substring(0, 100) || '(empty)';
            console.log(`   📋 ${item.content_key}: ${preview}...`);
        });
    } else {
        console.log('   No array fields found (this might be expected if none exist)');
    }

    console.log('\n✅ Done! Reload the CMS dashboard to see the fixed data.');
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
