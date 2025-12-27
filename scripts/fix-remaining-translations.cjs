/**
 * Fix the 2 remaining empty content rows
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Content for the missing gallery hero titles
const fixes = {
    'gallery.heroTitlePrimary': {
        en: 'Our',
        sv: 'Vårt',
        de: 'Unsere',
        pl: 'Nasza'
    },
    'gallery.heroTitleAccent': {
        en: 'Gallery',
        sv: 'Galleri',
        de: 'Galerie',
        pl: 'Galeria'
    }
};

async function fixRemaining() {
    console.log('\n🔧 Fixing remaining empty content rows...\n');

    for (const [key, translations] of Object.entries(fixes)) {
        console.log(`Updating ${key}...`);

        const { data, error } = await supabase
            .from('cms_content')
            .update({
                content_en: translations.en,
                content_sv: translations.sv,
                content_de: translations.de,
                content_pl: translations.pl
            })
            .eq('content_key', key)
            .select();

        if (error) {
            console.log(`  ❌ Error: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`  ✅ Updated: EN="${translations.en}", SV="${translations.sv}"`);
        } else {
            console.log(`  ⚠️ Not found`);
        }
    }

    // Final verification
    console.log('\n📊 Final translation verification...\n');

    const { data: content } = await supabase
        .from('cms_content')
        .select('*');

    const missingEn = content.filter(c => !c.content_en).length;
    const missingSv = content.filter(c => !c.content_sv).length;
    const missingDe = content.filter(c => !c.content_de).length;
    const missingPl = content.filter(c => !c.content_pl).length;

    console.log(`   EN: ${content.length - missingEn}/${content.length} ✅`);
    console.log(`   SV: ${content.length - missingSv}/${content.length} ✅`);
    console.log(`   DE: ${content.length - missingDe}/${content.length} ✅`);
    console.log(`   PL: ${content.length - missingPl}/${content.length} ✅`);

    if (missingEn === 0 && missingSv === 0 && missingDe === 0 && missingPl === 0) {
        console.log('\n🎉 ALL 730 CONTENT ROWS NOW HAVE ALL 4 TRANSLATIONS!');
    }
}

fixRemaining().catch(console.error);
