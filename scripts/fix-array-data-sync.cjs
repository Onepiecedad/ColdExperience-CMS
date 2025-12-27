/**
 * Fix Array Data Sync - Direct Supabase sync from clean local JSON
 * This bypasses the browser state and pushes clean data directly to Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqeggqftfupnzjvbsbcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZWdncWZ0ZnVwbnpqdmJzYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMjQyODMsImV4cCI6MjA0OTgwMDI4M30.q8-vRjL6l4WTrOYR7_s8Ys1xp6zLuC8dNMhMxBmYXD8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔄 Direct Supabase sync from clean local JSON...\n');

    // Load clean data from local JSON file
    const jsonPath = path.join(__dirname, '..', 'cms-content-data.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`📄 Loaded ${data.meta.total_fields} fields from local JSON`);

    // Get page ID mappings from Supabase
    const { data: pages, error: pagesError } = await supabase
        .from('cms_pages')
        .select('id, slug');

    if (pagesError) {
        console.error('❌ Could not load pages:', pagesError.message);
        return;
    }

    const pageIdMap = new Map();
    pages.forEach(p => pageIdMap.set(p.slug, p.id));
    console.log(`📋 Found ${pageIdMap.size} pages in database`);

    // Find fields that have arrays of objects (features, steps, etc.)
    const arrayFields = [];

    for (const pageSlug of Object.keys(data.content)) {
        const pageContent = data.content[pageSlug];
        const pageId = pageIdMap.get(pageSlug);

        if (!pageId) continue;

        for (const section of Object.keys(pageContent)) {
            const sectionContent = pageContent[section];

            for (const field of Object.keys(sectionContent)) {
                const fieldData = sectionContent[field];

                // Check if this field has array values
                for (const lang of ['en', 'sv', 'de', 'pl']) {
                    const val = fieldData[lang];
                    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                        arrayFields.push({
                            pageSlug,
                            pageId,
                            section,
                            field,
                            content_key: `${section}.${field}`,
                            lang,
                            data: val
                        });
                    }
                }
            }
        }
    }

    console.log(`\n🔍 Found ${arrayFields.length} array-of-objects fields to fix:`);

    // Group by content_key
    const groupedByKey = new Map();
    for (const af of arrayFields) {
        const key = `${af.pageSlug}:${af.content_key}`;
        if (!groupedByKey.has(key)) {
            groupedByKey.set(key, af);
        }
    }

    console.log(`   (${groupedByKey.size} unique fields across all languages)\n`);

    // Update each field in Supabase
    let updatedCount = 0;
    let failedCount = 0;

    for (const [key, af] of groupedByKey) {
        const fieldData = data.content[af.pageSlug][af.section][af.field];

        // Serialize arrays as JSON
        const updateData = {
            content_en: Array.isArray(fieldData.en) ? JSON.stringify(fieldData.en) : (fieldData.en || ''),
            content_sv: Array.isArray(fieldData.sv) ? JSON.stringify(fieldData.sv) : (fieldData.sv || ''),
            content_de: Array.isArray(fieldData.de) ? JSON.stringify(fieldData.de) : (fieldData.de || ''),
            content_pl: Array.isArray(fieldData.pl) ? JSON.stringify(fieldData.pl) : (fieldData.pl || ''),
            content_type: 'array'
        };

        // First check if record exists
        const { data: existing, error: fetchError } = await supabase
            .from('cms_content')
            .select('id')
            .eq('page_id', af.pageId)
            .eq('content_key', af.content_key)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.log(`⚠️  Could not check ${key}: ${fetchError.message}`);
            continue;
        }

        if (existing) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('cms_content')
                .update(updateData)
                .eq('id', existing.id);

            if (updateError) {
                console.log(`❌ Failed to update ${key}: ${updateError.message}`);
                failedCount++;
            } else {
                console.log(`✅ Updated: ${key}`);
                updatedCount++;
            }
        } else {
            // Insert new record
            const { error: insertError } = await supabase
                .from('cms_content')
                .insert({
                    page_id: af.pageId,
                    section: af.section,
                    content_key: af.content_key,
                    ...updateData
                });

            if (insertError) {
                console.log(`❌ Failed to insert ${key}: ${insertError.message}`);
                failedCount++;
            } else {
                console.log(`✅ Inserted: ${key}`);
                updatedCount++;
            }
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`${'='.repeat(50)}`);
    console.log('\n🎉 Done! Refresh the CMS dashboard to see the fix.');
}

main().catch(console.error);
