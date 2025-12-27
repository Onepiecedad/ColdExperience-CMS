/**
 * sync-local-to-supabase.cjs
 * Synkar all lokal CMS-data till Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    'https://gvvrsobdrzggjsevcgqr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnJzb2JkcnpnZ2pzZXZjZ3FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMTg1OCwiZXhwIjoyMDUwMTA3ODU4fQ.FWjpySuNSJEdT0TmR-ZJ1dXiDcRsxfRB0NbGdCqVhpQ'
);

async function syncToSupabase() {
    const dataPath = path.join(__dirname, '..', 'cms-content-data.json');
    const data = require(dataPath);

    console.log('🔄 Synkar lokal CMS-data till Supabase...\n');

    const languages = ['en', 'sv', 'de', 'pl'];
    let totalSynced = 0;
    let errors = 0;

    // Fokusera på contact.faq section (FAQ items)
    const faqSection = data.content?.contact?.faq;

    if (!faqSection) {
        console.log('❌ Ingen FAQ-data hittades i lokala filen');
        return;
    }

    console.log(`📝 Hittat ${Object.keys(faqSection).length} FAQ-fält att synka\n`);

    // Synka varje fält
    for (const [fieldKey, translations] of Object.entries(faqSection)) {
        for (const lang of languages) {
            const content = translations[lang];
            if (!content) continue;

            try {
                const { error } = await supabase
                    .from('cms_content')
                    .upsert({
                        page_id: 'contact',
                        section_id: 'faq',
                        field_key: fieldKey,
                        language: lang,
                        content: content
                    }, {
                        onConflict: 'page_id,section_id,field_key,language'
                    });

                if (error) {
                    console.error(`❌ ${fieldKey} (${lang}): ${error.message}`);
                    errors++;
                } else {
                    totalSynced++;
                }
            } catch (e) {
                console.error(`❌ Nätverksfel för ${fieldKey} (${lang}): ${e.message}`);
                errors++;
            }
        }
        process.stdout.write('.');
    }

    console.log('\n');
    console.log(`✅ Synkade: ${totalSynced} fält`);
    if (errors > 0) {
        console.log(`❌ Fel: ${errors}`);
    }
    console.log('\n🎉 Klar!');
}

syncToSupabase().catch(console.error);
