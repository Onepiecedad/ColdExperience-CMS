/**
 * Sync missing translations from i18n files to Supabase
 * Uses SERVICE_ROLE key to bypass RLS
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
// Using SERVICE_ROLE key to bypass RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM';

const supabase = createClient(supabaseUrl, supabaseKey);

const LOCALES_PATH = '../ColdExperience/frontend/public/locales';

// Map section names to their i18n file names
const SECTION_TO_FILE = {
    'packages': 'packages.json',
    'why': 'why.json',
    'hero': 'hero.json',
    'footer': 'footer.json',
    'gallery': 'gallery.json',
    'header': 'header.json',
    'about': 'about.json',
    'experiences': 'experiences.json',
    'contact': 'contact.json'
};

// Flatten nested object to dot notation keys
function flattenObject(obj, parentKey = '', result = {}) {
    for (const key in obj) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObject(obj[key], newKey, result);
        } else if (Array.isArray(obj[key])) {
            // Join array items with newlines for text fields
            result[newKey] = obj[key].join('\n');
        } else {
            result[newKey] = obj[key];
        }
    }
    return result;
}

// Load translations from i18n files
function loadTranslations(section) {
    const fileName = SECTION_TO_FILE[section];
    if (!fileName) return null;

    const translations = {};
    const languages = ['en', 'sv', 'de', 'pl'];

    for (const lang of languages) {
        const filePath = path.join(__dirname, '..', LOCALES_PATH, lang, fileName);
        if (fs.existsSync(filePath)) {
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                translations[lang] = flattenObject(content);
            } catch (e) {
                console.log(`   ⚠️ Error reading ${lang}/${fileName}: ${e.message}`);
            }
        }
    }

    return translations;
}

async function syncMissingTranslations() {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 SYNCING MISSING TRANSLATIONS FROM I18N FILES');
    console.log('   Using SERVICE_ROLE key to bypass RLS');
    console.log('='.repeat(70) + '\n');

    // Get all content from Supabase
    const { data: allContent, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('section')
        .order('content_key');

    if (error) {
        console.log('❌ Error fetching content:', error.message);
        return;
    }

    let updated = 0;
    let skipped = 0;

    // Group content by section
    const contentBySection = {};
    allContent.forEach(row => {
        if (!contentBySection[row.section]) contentBySection[row.section] = [];
        contentBySection[row.section].push(row);
    });

    // Process each section
    for (const section of Object.keys(SECTION_TO_FILE)) {
        const sectionContent = contentBySection[section];
        if (!sectionContent) continue;

        const translations = loadTranslations(section);
        if (!translations) continue;

        console.log(`\n📁 Processing: ${section}`);

        for (const row of sectionContent) {
            const updates = {};
            let needsUpdate = false;

            // The content_key includes section prefix like "packages.header.nav.home"
            // Strip the section prefix to match i18n keys like "header.nav.home"
            let lookupKey = row.content_key;
            const prefix = section + '.';
            if (lookupKey.startsWith(prefix)) {
                lookupKey = lookupKey.substring(prefix.length);
            }

            // Check each language
            const langMap = {
                'en': 'content_en',
                'sv': 'content_sv',
                'de': 'content_de',
                'pl': 'content_pl'
            };

            for (const [lang, column] of Object.entries(langMap)) {
                if (!row[column] || row[column].trim() === '') {
                    // Missing translation - try to find it
                    if (translations[lang] && translations[lang][lookupKey]) {
                        updates[column] = translations[lang][lookupKey];
                        needsUpdate = true;
                        console.log(`   ✅ Found ${lang.toUpperCase()} for: ${lookupKey}`);
                    }
                }
            }

            if (needsUpdate) {
                const { data, error: updateError } = await supabase
                    .from('cms_content')
                    .update(updates)
                    .eq('id', row.id)
                    .select();

                if (updateError) {
                    console.log(`   ❌ Error updating ${row.content_key}: ${updateError.message}`);
                } else if (data && data.length > 0) {
                    updated++;
                } else {
                    console.log(`   ⚠️ No rows returned for ${row.content_key}`);
                }
            } else {
                skipped++;
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 SYNC COMPLETE`);
    console.log(`   ✅ Updated: ${updated} fields`);
    console.log(`   ⏭️ Skipped (already complete): ${skipped} fields`);
    console.log('='.repeat(70) + '\n');
}

syncMissingTranslations().catch(console.error);
