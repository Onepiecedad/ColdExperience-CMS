/**
 * ANALYZE MEDIA USAGE
 * Shows current media assignments per section in Supabase
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function analyzeMedia() {
    const { data: media, error } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id, mime_type')
        .order('page_id')
        .order('section_id');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('=== MEDIA TILLDELNINGAR ===\n');

    // Gruppera per page_id + section_id
    const bySection = {};
    media.forEach(m => {
        const key = `${m.page_id || 'null'}/${m.section_id || 'null'}`;
        if (!bySection[key]) bySection[key] = [];
        bySection[key].push(m);
    });

    // Sortera nycklarna alfabetiskt
    const sortedKeys = Object.keys(bySection).sort();

    // Enligt uppgiften - förväntad media per sektion
    const EXPECTED = {
        'home/hero': '1 bakgrundsvideo',
        'home/featuredVideo': '1 video',
        'home/features': '4 kort-videos',
        'home/adventures': '4 kort-bilder',
        'about/hero': '1 bakgrundsvideo/bild',
        'about/story': '0 media (endast text)',
        'about/ownerSection': '2 porträttbilder',
        'gallery/hero': '1 bakgrundsbild',
        'gallery/gallery': 'Alla galleri-bilder',
        'contact/hero': '1 bakgrundsbild',
        'packages/hero': '1 bakgrundsbild',
    };

    sortedKeys.forEach(key => {
        const items = bySection[key];
        const expected = EXPECTED[key] || '?';
        const status = expected === '?' ? '❓' : (expected.includes('0 media') && items.length > 0 ? '⚠️ PROBLEM' : '');

        console.log(`📁 ${key}: ${items.length} filer ${status}`);
        console.log(`   Förväntat: ${expected}`);
        items.slice(0, 5).forEach(m => {
            const type = m.mime_type?.startsWith('video/') ? '🎬' : '🖼️';
            console.log(`   ${type} ${m.filename}`);
        });
        if (items.length > 5) console.log(`   ... och ${items.length - 5} till`);
        console.log();
    });

    console.log(`\nTotalt: ${media.length} media-filer`);

    // Specifik rapport för sektioner med problem
    console.log('\n=== PROBLEMSEKTIONER ===\n');

    const problemSections = [
        'about/story', // Ska vara 0 media
    ];

    problemSections.forEach(key => {
        if (bySection[key] && bySection[key].length > 0) {
            console.log(`🔴 ${key}: Har ${bySection[key].length} media men ska ha 0`);
            bySection[key].forEach(m => {
                console.log(`   - ${m.filename}`);
            });
        } else {
            console.log(`🟢 ${key}: OK (${bySection[key]?.length || 0} media)`);
        }
    });
}

analyzeMedia();
