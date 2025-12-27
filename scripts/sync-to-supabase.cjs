/**
 * Sync CMS Content to Supabase
 * 
 * This script reads the cms-content-data.json and uploads ALL content
 * to the Supabase database for persistent storage.
 * 
 * UPDATED: Uses the actual Supabase schema with content_key instead of
 * separate page_slug/section_key/field_key columns.
 * 
 * Usage: node scripts/sync-to-supabase.cjs
 */

const fs = require('fs');
const path = require('path');

// Read .env.local for Supabase credentials
const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
    console.error('❌ Could not read .env.local file. Make sure it exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Parse environment variables
function parseEnv(content) {
    const env = {};
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            env[key] = value;
        }
    });
    return env;
}

const env = parseEnv(envContent);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
// Use service role key for write operations (bypasses RLS)
const SUPABASE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

// Load the CMS content data
const cmsDataPath = path.join(__dirname, '../cms-content-data.json');
let cmsData;
try {
    const content = fs.readFileSync(cmsDataPath, 'utf-8');
    cmsData = JSON.parse(content);
} catch (error) {
    console.error('❌ Could not read cms-content-data.json. Run sync-content-full.cjs first.');
    process.exit(1);
}

// Helper function to make Supabase REST API calls
async function supabaseRequest(table, method, data = null, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=representation' : 'return=representation'
    };

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase request failed: ${response.status} - ${errorText}`);
    }

    // Try to parse JSON response
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
}

// Get page ID by slug
async function getPageId(slug) {
    try {
        const result = await supabaseRequest('cms_pages', 'GET', null, `?slug=eq.${slug}&select=id`);
        if (result && result.length > 0) {
            return result[0].id;
        }
        return null;
    } catch {
        return null;
    }
}

// Create page if it doesn't exist
async function ensurePage(page) {
    const existingId = await getPageId(page.slug);
    if (existingId) {
        return existingId;
    }

    // Create the page
    try {
        const result = await supabaseRequest('cms_pages', 'POST', [{
            slug: page.slug,
            name: page.name,
            description: page.description,
            icon: page.icon,
            display_order: page.display_order
        }]);
        if (result && result.length > 0) {
            return result[0].id;
        }
    } catch (error) {
        console.error(`   ⚠ Could not create page ${page.slug}:`, error.message.substring(0, 50));
    }
    return null;
}

// Main sync function
async function syncToSupabase() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     COLD EXPERIENCE CMS - SYNC TO SUPABASE                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📡 Connecting to Supabase...`);
    console.log(`   URL: ${SUPABASE_URL}\n`);

    // First, ensure all pages exist and get their IDs
    console.log('📄 Ensuring pages exist...');
    const pageIds = {};

    for (const page of cmsData.pages) {
        const pageId = await ensurePage(page);
        if (pageId) {
            pageIds[page.slug] = pageId;
            console.log(`   ✓ ${page.name} (${page.slug}): ${pageId.substring(0, 8)}...`);
        }
    }

    // Prepare content records matching the actual Supabase schema
    // Actual schema: id, page_id, content_key, content_type, content_en, content_sv, content_de, content_pl, 
    //                field_label, field_hint, display_order, section
    console.log('\n📦 Preparing content records...');

    const content = cmsData.content;
    const contentRecords = [];
    let displayOrder = 0;

    for (const pageSlug of Object.keys(content)) {
        const pageContent = content[pageSlug];
        const pageId = pageIds[pageSlug];

        if (!pageId) {
            console.log(`   ⚠ Skipping ${pageSlug} - no page ID`);
            continue;
        }

        for (const sectionKey of Object.keys(pageContent)) {
            const sectionContent = pageContent[sectionKey];

            for (const fieldKey of Object.keys(sectionContent)) {
                const fieldData = sectionContent[fieldKey];

                // Build content_key as "section.fieldKey" for uniqueness
                const contentKey = `${sectionKey}.${fieldKey}`;

                // Handle both string and array values
                const record = {
                    page_id: pageId,
                    section: sectionKey,
                    content_key: contentKey,
                    content_type: Array.isArray(fieldData.en) ? 'array' : 'text',
                    content_en: typeof fieldData.en === 'string' ? fieldData.en :
                        Array.isArray(fieldData.en) ? fieldData.en.join('\n') : '',
                    content_sv: typeof fieldData.sv === 'string' ? fieldData.sv :
                        Array.isArray(fieldData.sv) ? fieldData.sv.join('\n') : '',
                    content_de: typeof fieldData.de === 'string' ? fieldData.de :
                        Array.isArray(fieldData.de) ? fieldData.de.join('\n') : '',
                    content_pl: typeof fieldData.pl === 'string' ? fieldData.pl :
                        Array.isArray(fieldData.pl) ? fieldData.pl.join('\n') : '',
                    field_label: fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
                    field_hint: '',
                    display_order: displayOrder++
                };

                contentRecords.push(record);
            }
        }
    }

    console.log(`   📊 Total content records to sync: ${contentRecords.length}`);

    // Delete existing content to replace with new (since we're doing a full sync)
    console.log('\n🗑️  Clearing existing content for fresh sync...');
    try {
        // We need to delete in a way that works - delete by page_id
        for (const pageSlug of Object.keys(pageIds)) {
            const pageId = pageIds[pageSlug];
            await fetch(`${SUPABASE_URL}/rest/v1/cms_content?page_id=eq.${pageId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                }
            });
        }
        console.log('   ✓ Existing content cleared');
    } catch (error) {
        console.log('   ⚠ Could not clear existing content:', error.message.substring(0, 50));
    }

    // Sync in batches of 50 to avoid timeout
    const BATCH_SIZE = 50;
    const batches = [];

    for (let i = 0; i < contentRecords.length; i += BATCH_SIZE) {
        batches.push(contentRecords.slice(i, i + BATCH_SIZE));
    }

    console.log(`\n📤 Uploading ${contentRecords.length} records in ${batches.length} batches...`);

    let totalUploaded = 0;
    let failedRecords = [];

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
            await supabaseRequest('cms_content', 'POST', batch);
            totalUploaded += batch.length;
            console.log(`   ✓ Batch ${i + 1}/${batches.length}: ${batch.length} records (${totalUploaded}/${contentRecords.length})`);
        } catch (error) {
            console.error(`   ✗ Batch ${i + 1} failed:`, error.message.substring(0, 80));

            // Try records one by one for failed batch
            for (const record of batch) {
                try {
                    await supabaseRequest('cms_content', 'POST', [record]);
                    totalUploaded++;
                } catch (innerError) {
                    failedRecords.push(record.content_key);
                }
            }
        }
    }

    // Update packages (use PATCH to update existing)
    console.log('\n📦 Syncing packages...');

    for (const pkg of cmsData.packages) {
        const updateData = {
            name_en: typeof pkg.name?.en === 'string' ? pkg.name.en : pkg.key,
            name_sv: typeof pkg.name?.sv === 'string' ? pkg.name.sv : '',
            name_de: typeof pkg.name?.de === 'string' ? pkg.name.de : '',
            name_pl: typeof pkg.name?.pl === 'string' ? pkg.name.pl : '',
            description_en: typeof pkg.description?.en === 'string' ? pkg.description.en : '',
            description_sv: typeof pkg.description?.sv === 'string' ? pkg.description.sv : '',
            description_de: typeof pkg.description?.de === 'string' ? pkg.description.de : '',
            description_pl: typeof pkg.description?.pl === 'string' ? pkg.description.pl : '',
            duration_en: typeof pkg.duration?.en === 'string' ? pkg.duration.en : '',
            duration_sv: typeof pkg.duration?.sv === 'string' ? pkg.duration.sv : '',
            duration_de: typeof pkg.duration?.de === 'string' ? pkg.duration.de : '',
            duration_pl: typeof pkg.duration?.pl === 'string' ? pkg.duration.pl : '',
            highlights_en: Array.isArray(pkg.highlights?.en) ? pkg.highlights.en : [],
            highlights_sv: Array.isArray(pkg.highlights?.sv) ? pkg.highlights.sv : [],
            highlights_de: Array.isArray(pkg.highlights?.de) ? pkg.highlights.de : [],
            highlights_pl: Array.isArray(pkg.highlights?.pl) ? pkg.highlights.pl : [],
            price_sek: pkg.priceSEK,
            price_eur: pkg.priceEUR,
            featured: pkg.featured,
            display_order: pkg.displayOrder
        };

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/cms_packages?package_key=eq.${pkg.key}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            console.log(`   ✓ ${pkg.key}`);
        } catch (error) {
            console.error(`   ✗ ${pkg.key}:`, error.message.substring(0, 50));
        }
    }

    // Summary
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('✨ SYNC COMPLETE!');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log(`   📊 Content records: ${totalUploaded}/${contentRecords.length}`);
    console.log(`   📦 Packages: ${cmsData.packages.length}`);
    console.log(`   📄 Pages: ${Object.keys(pageIds).length}`);

    if (failedRecords.length > 0) {
        console.log(`\n   ⚠ ${failedRecords.length} records failed:`);
        failedRecords.slice(0, 10).forEach(r => console.log(`      - ${r}`));
        if (failedRecords.length > 10) {
            console.log(`      ... and ${failedRecords.length - 10} more`);
        }
    }

    console.log('\n🚀 Your CMS is now synced to Supabase!');
    console.log('   Changes made in the dashboard will persist.\n');
}

// Run the sync
syncToSupabase().catch(error => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
});
