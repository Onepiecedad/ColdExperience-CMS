/**
 * CLEANUP MEDIA ASSIGNMENTS
 * Removes media from sections that should have no media
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

// Definiera vilka sektioner som SKA RENSAS (ha 0 media)
const SECTIONS_TO_CLEAR = [
    'about/story',      // "Our Story" är endast text, ingen media
    'contact/contact',  // Kontaktsektion är endast formulär
];

async function analyzeFirst() {
    console.log('=== ANALYSERAR MEDIA SOM SKULLE RENSAS ===\n');

    let totalToRemove = 0;

    for (const sectionKey of SECTIONS_TO_CLEAR) {
        const [pageId, sectionId] = sectionKey.split('/');

        // Hämta nuvarande media för sektionen
        const { data: currentMedia, error } = await supabase
            .from('cms_media')
            .select('id, filename, mime_type')
            .eq('page_id', pageId)
            .eq('section_id', sectionId);

        if (error) {
            console.log(`❌ ${sectionKey}: Fel vid hämtning - ${error.message}`);
            continue;
        }

        if (!currentMedia || currentMedia.length === 0) {
            console.log(`✅ ${sectionKey}: Redan tom (0 media)`);
            continue;
        }

        console.log(`🗑️  ${sectionKey}: ${currentMedia.length} media att ta bort:`);
        currentMedia.forEach(m => {
            const type = m.mime_type?.startsWith('video/') ? '🎬' : '🖼️';
            console.log(`     ${type} ${m.filename}`);
        });
        totalToRemove += currentMedia.length;
        console.log();
    }

    console.log('='.repeat(50));
    console.log(`Totalt att ta bort: ${totalToRemove} media-filer`);
    console.log('\nKör med --run för att utföra rensningen');
}

async function cleanupMedia() {
    console.log('=== STÄDAR MEDIA-TILLDELNINGAR ===\n');

    let totalRemoved = 0;

    for (const sectionKey of SECTIONS_TO_CLEAR) {
        const [pageId, sectionId] = sectionKey.split('/');

        // Ta bort alla media från denna sektion (sätt page_id och section_id till null)
        const { data, error } = await supabase
            .from('cms_media')
            .update({ page_id: null, section_id: null })
            .eq('page_id', pageId)
            .eq('section_id', sectionId)
            .select();

        if (error) {
            console.log(`❌ ${sectionKey}: Fel - ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`🗑️  ${sectionKey}: ${data.length} media borttagna från sektionen`);
            totalRemoved += data.length;
        } else {
            console.log(`⏭️  ${sectionKey}: Inga media att ta bort`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Städning klar! ${totalRemoved} media-filer har flyttats till "unassigned"`);
    console.log('\nOBS: Filerna är inte borttagna, bara bortkopplade från sektionerna.');
    console.log('De kan återställas manuellt vid behov.');
}

// Main
if (process.argv.includes('--run')) {
    cleanupMedia();
} else if (process.argv.includes('--analyze')) {
    analyzeFirst();
} else {
    console.log('CLEANUP MEDIA ASSIGNMENTS');
    console.log('='.repeat(50));
    console.log('\nDetta script tar bort media-tilldelningar från sektioner');
    console.log('som enligt hemsidan inte ska ha någon media.\n');
    console.log('Sektioner som kommer rensas:');
    SECTIONS_TO_CLEAR.forEach(s => console.log(`  - ${s}`));
    console.log('\nAnvändning:');
    console.log('  node cleanup-media-assignments.cjs --analyze  # Visa vad som skulle rensas');
    console.log('  node cleanup-media-assignments.cjs --run      # Utför rensningen');
}
