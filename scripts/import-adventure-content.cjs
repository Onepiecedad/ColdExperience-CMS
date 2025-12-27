/**
 * Import Adventure Subpage Content to Supabase CMS
 * 
 * This script imports the extracted adventure subpage content into Supabase
 * cms_content table. Each field becomes a separate row with content_key.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map adventure keys to section names
const ADVENTURE_TO_SECTION = {
    'snowmobileSafari': { section: 'snowmobile', label: 'Snowmobile Safari' },
    'northernLights': { section: 'northernLights', label: 'Northern Lights Tour' },
    'huskyRide': { section: 'dogSledding', label: 'Husky Ride' },
    'accommodation': { section: 'lodging', label: 'Accommodation' },
};

// Get or create page ID for detailPages
async function getOrCreatePageId() {
    // First check if pages table has our page
    const { data: existingPage, error } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', 'detailPages')
        .maybeSingle();

    if (existingPage) {
        return existingPage.id;
    }

    // Create the page if it doesn't exist
    const { data: newPage, error: createError } = await supabase
        .from('cms_pages')
        .insert({
            slug: 'detailPages',
            name: 'Adventure Detail Pages',
            description: 'Individual adventure subpages (Snowmobile, Northern Lights, etc.)',
            icon: 'mountain',
            display_order: 10,
            created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

    if (createError) {
        console.error('❌ Could not create page:', createError.message);
        return null;
    }

    return newPage.id;
}

// Flatten content to array of field objects
function flattenToFields(adventureKey, content) {
    const { section, label } = ADVENTURE_TO_SECTION[adventureKey];
    const fields = [];
    let order = 0;

    // Helper to add field
    const addField = (key, en, fieldLabel, contentType = 'text') => {
        if (en && en.length > 2) {
            fields.push({
                content_key: `${section}.${key}`,
                content_en: en,
                content_sv: '', // Placeholder
                content_de: '',
                content_pl: '',
                field_label: fieldLabel,
                content_type: contentType,
                section: section,
                display_order: order++,
            });
        }
    };

    // Hero section
    if (content.hero) {
        addField('heroTitle', content.hero.title?.en, `${label} - Hero Title`);
        addField('heroDescription', content.hero.description?.en, `${label} - Hero Description`, 'textarea');
        addField('heroPrimaryButton', content.hero.primaryButton?.en, `${label} - Primary Button`);
        addField('heroSecondaryButton', content.hero.secondaryButton?.en, `${label} - Secondary Button`);
    }

    // Intro section
    if (content.intro) {
        addField('introHeading', content.intro.heading?.en, `${label} - Intro Heading`);
        if (content.intro.paragraphs) {
            content.intro.paragraphs.forEach((p, i) => {
                if (p.en && p.en.length > 5) {
                    addField(`introParagraph${i + 1}`, p.en, `${label} - Intro Paragraph ${i + 1}`, 'textarea');
                }
            });
        }
    }

    // Closing section
    if (content.closing) {
        addField('closingTitle', content.closing.title?.en, `${label} - Closing Title`);
        addField('closingDescription', content.closing.description?.en, `${label} - Closing Description`, 'textarea');
    }

    // Features
    if (content.features) {
        content.features.slice(0, 4).forEach((f, i) => {
            addField(`feature${i + 1}Title`, f.title?.en, `${label} - Feature ${i + 1} Title`);
            addField(`feature${i + 1}Description`, f.description?.en, `${label} - Feature ${i + 1} Description`);
        });
    }

    // Day Program
    if (content.dayProgram) {
        addField('dayProgramTitle', content.dayProgram.title?.en, `${label} - Day Program Title`);
        if (content.dayProgram.steps) {
            content.dayProgram.steps.slice(0, 4).forEach((s, i) => {
                addField(`step${i + 1}Title`, s.title?.en, `${label} - Step ${i + 1} Title`);
                addField(`step${i + 1}Description`, s.description?.en, `${label} - Step ${i + 1} Description`);
            });
        }
    }

    return fields;
}

async function importContent() {
    console.log('📥 Importing adventure subpage content to Supabase...\n');

    // Load extracted content
    const contentPath = path.join(__dirname, '..', 'adventure-subpages-content-cms.json');
    const allContent = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    // Get or create page ID
    console.log('🔍 Getting/creating detailPages page ID...');
    const pageId = await getOrCreatePageId();

    if (!pageId) {
        console.error('❌ Could not get page ID');
        return;
    }

    console.log(`   Page ID: ${pageId}`);

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // Process each adventure
    for (const [adventureKey, content] of Object.entries(allContent)) {
        const { section } = ADVENTURE_TO_SECTION[adventureKey];
        console.log(`\n📄 Processing: ${adventureKey} → ${section}`);

        // Flatten content to individual fields
        const fields = flattenToFields(adventureKey, content);
        console.log(`   Fields to import: ${fields.length}`);

        for (const field of fields) {
            // Check if field already exists
            const { data: existing } = await supabase
                .from('cms_content')
                .select('id')
                .eq('page_id', pageId)
                .eq('content_key', field.content_key)
                .maybeSingle();

            if (existing) {
                totalSkipped++;
                continue;
            }

            // Insert new field
            const { error } = await supabase
                .from('cms_content')
                .insert({
                    page_id: pageId,
                    ...field,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error(`   ❌ Error inserting ${field.content_key}: ${error.message}`);
            } else {
                totalCreated++;
            }
        }

        console.log(`   ✅ Processed ${fields.length} fields`);
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`   Created: ${totalCreated}`);
    console.log(`   Skipped (already exist): ${totalSkipped}`);

    // List what we imported
    console.log('\n📋 Content now in Supabase:');
    const { data: imported } = await supabase
        .from('cms_content')
        .select('section, content_key')
        .eq('page_id', pageId)
        .order('section');

    if (imported) {
        const grouped = {};
        imported.forEach(item => {
            if (!grouped[item.section]) grouped[item.section] = [];
            grouped[item.section].push(item.content_key);
        });

        Object.entries(grouped).forEach(([section, keys]) => {
            console.log(`\n   ${section}: ${keys.length} fields`);
        });
    }
}

importContent()
    .then(() => {
        console.log('\n✅ Adventure subpage content import complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Import failed:', err);
        process.exit(1);
    });
