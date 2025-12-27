/**
 * Sync i18n content to CMS for newly converted components
 * This ensures the CMS has all the content that was previously in i18n files
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Load i18n files
const i18nDir = '/Users/onepiecedad/Downloads/Coldexperience CMS/ColdExperience/frontend/public/locales';

function loadI18n(lang) {
    const filePath = path.join(i18nDir, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
}

// Content that needs to be synced to CMS
const sectionsToSync = {
    'featuredVideo': [
        'title', 'description', 'youtubeUrl'
    ],
    'experiences': [
        'title', 'titleHighlight', 'intro',
        'snowmobileTitle', 'snowmobileDesc', 'snowmobileFeature1', 'snowmobileFeature2', 'snowmobileFeature3', 'snowmobileFeature4',
        'northernLightsTitle', 'northernLightsDesc', 'northernLightsFeature1', 'northernLightsFeature2', 'northernLightsFeature3', 'northernLightsFeature4',
        'dogSleddingTitle', 'dogSleddingDesc', 'dogSleddingFeature1', 'dogSleddingFeature2', 'dogSleddingFeature3', 'dogSleddingFeature4',
        'lodgingTitle', 'lodgingDesc', 'lodgingAlt', 'lodgingFeature1', 'lodgingFeature2', 'lodgingFeature3', 'lodgingFeature4',
        'learnMore', 'ctaTitle', 'ctaDesc', 'ctaBook'
    ],
    'ownerSection': [
        'title1', 'title2', 'intro', 'names', 'bio',
        'gustavTitle', 'gustavBio', 'juliaTitle', 'juliaBio',
        'lifestyleTitle', 'lifestyleQuote',
        'whyTitle', 'whyText',
        'localExpertiseTitle', 'localExpertiseText',
        'familyBusinessTitle', 'familyBusinessText',
        'authenticExperienceTitle', 'authenticExperienceText'
    ]
};

async function syncI18nToCms() {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 SYNCING I18N CONTENT TO CMS');
    console.log('='.repeat(70) + '\n');

    // Load all language files
    const translations = {
        en: loadI18n('en'),
        sv: loadI18n('sv'),
        de: loadI18n('de'),
        pl: loadI18n('pl'),
    };

    console.log('📚 Loaded translation files for: EN, SV, DE, PL\n');

    // Get or create pages for these sections
    const pageMapping = {
        'featuredVideo': 'hero',
        'experiences': 'experiences',
        'ownerSection': 'about',
    };

    // Get page IDs
    const { data: pages } = await supabase.from('cms_pages').select('id, slug');
    const pageIds = {};
    pages.forEach(p => { pageIds[p.slug] = p.id; });

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const [section, keys] of Object.entries(sectionsToSync)) {
        const pageSlug = pageMapping[section];
        const pageId = pageIds[pageSlug];

        if (!pageId) {
            console.log(`⚠️ Page '${pageSlug}' not found for section '${section}'`);
            continue;
        }

        console.log(`\n📂 Syncing ${section} → ${pageSlug}...`);

        for (const key of keys) {
            const fullKey = `${section}.${key}`;

            // Get values from each language
            const getValue = (lang) => {
                const sectionData = translations[lang][section];
                return sectionData ? sectionData[key] : null;
            };

            const content_en = getValue('en') || '';
            const content_sv = getValue('sv') || content_en;
            const content_de = getValue('de') || content_en;
            const content_pl = getValue('pl') || content_en;

            // Special case: YouTube URL for featuredVideo
            if (section === 'featuredVideo' && key === 'youtubeUrl') {
                // This is a new field that wasn't in i18n - add the default URL
                const youtubeUrl = 'https://www.youtube.com/embed/lzQ_P2IGBXQ?rel=0&modestbranding=1&playsinline=1&color=white';

                // Check if exists
                const { data: existing } = await supabase
                    .from('cms_content')
                    .select('id')
                    .eq('page_id', pageId)
                    .eq('content_key', fullKey)
                    .single();

                if (!existing) {
                    await supabase.from('cms_content').insert({
                        page_id: pageId,
                        section: section,
                        content_key: fullKey,
                        content_en: youtubeUrl,
                        content_sv: youtubeUrl,
                        content_de: youtubeUrl,
                        content_pl: youtubeUrl,
                        display_order: 0,
                    });
                    console.log(`   ✅ ${key} (YouTube URL)`);
                    inserted++;
                }
                continue;
            }

            if (!content_en) {
                console.log(`   ⏭️ ${key} (no content)`);
                skipped++;
                continue;
            }

            // Check if exists
            const { data: existing } = await supabase
                .from('cms_content')
                .select('id')
                .eq('page_id', pageId)
                .eq('content_key', fullKey)
                .single();

            if (existing) {
                // Update
                await supabase
                    .from('cms_content')
                    .update({ content_en, content_sv, content_de, content_pl })
                    .eq('id', existing.id);
                updated++;
            } else {
                // Insert
                await supabase.from('cms_content').insert({
                    page_id: pageId,
                    section: section,
                    content_key: fullKey,
                    content_en,
                    content_sv,
                    content_de,
                    content_pl,
                    display_order: keys.indexOf(key),
                });
                inserted++;
                console.log(`   ✅ ${key}`);
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SYNC COMPLETE');
    console.log('='.repeat(70));
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log('='.repeat(70) + '\n');
}

syncI18nToCms().catch(console.error);
