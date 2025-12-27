/**
 * KOMPLETT MEDIA-AUDIT OCH TILLDELNING
 * =====================================
 * Detta skript analyserar webbplatsens faktiska mediaanvändning
 * och tilldelar varje fil till rätt CMS-sektion.
 * 
 * Baserat på analys av:
 * - Hero.js, Gallery.js, About.js, Experiences.js, OwnerSection.js
 * - Features.js, Packages.js, Contact.js, FaqSection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Använd service_role-nyckel för att kringgå RLS (Row Level Security)
// Om service_role inte finns, fall tillbaka till anon (men uppdateringar kan blockeras)
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!serviceRoleKey) {
    console.log('⚠️  VARNING: VITE_SUPABASE_SERVICE_ROLE_KEY saknas i .env.local');
    console.log('   Uppdateringar kan blockeras av RLS. Se instruktioner nedan.\n');
}

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    serviceRoleKey || anonKey
);

// ==========================================
// KOMPLETT MEDIA MAPPNING
// Mappar filnamn till CMS page_id/section_id
// ==========================================
const MEDIA_ASSIGNMENTS = {
    // ============================================
    // HERO SECTION (delad bakgrundsvideo för alla sidor)
    // ============================================
    'coldexperience-top-1.mp4': { page_id: 'hero', section_id: 'hero', description: 'Huvudsaklig hero-video (landningssida)' },

    // ============================================
    // EXPERIENCES / ADVENTURES (Home → Adventures)
    // ============================================
    'snoskoter2-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Snöskoter-video' },
    'norrsken1-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Norrsken-video' },
    'hundspann2-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann-video' },
    'Skolan-film-2.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Boende-video (Skolan)' },

    // Poster-bilder för experiences
    'IMG_6698.jpg': { page_id: 'experiences', section_id: 'experiences', description: 'Snöskoter poster / Aurora' },
    'norrsken1.jpg': { page_id: 'experiences', section_id: 'experiences', description: 'Norrsken poster' },
    'hundspann1.jpg': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann poster' },
    'skolan1-4fe44306.jpg': { page_id: 'experiences', section_id: 'experiences', description: 'Skolan poster' },

    // ============================================
    // ABOUT / OWNER SECTION (Home → Meet the Hosts)
    // ============================================
    'owners.jpg': { page_id: 'about', section_id: 'ownerSection', description: 'Gustav & Julia huvudbild' },
    'om_oss-opt.mp4': { page_id: 'about', section_id: 'story', description: 'About hero-video' },

    // Timeline-bilder för About
    'gustav_childhood.jpg': { page_id: 'about', section_id: 'story', description: 'Gustavs barndom (timeline)' },
    'julias_matresa.jpg': { page_id: 'about', section_id: 'story', description: 'Julias matresa (timeline)' },
    'love_adventure.jpg': { page_id: 'about', section_id: 'story', description: 'Kärleksäventyr (timeline)' },
    'family_2.jpg': { page_id: 'about', section_id: 'story', description: 'Familj 2 (timeline)' },
    'family_1.jpg': { page_id: 'about', section_id: 'story', description: 'Familj 1' },
    'coldexperience_born.jpg': { page_id: 'about', section_id: 'story', description: 'Cold Experience grundades' },

    // Values-bilder för About
    'IMG_2425.jpg': { page_id: 'about', section_id: 'values', description: 'Familj value-bild' },
    'IMG_7834.jpg': { page_id: 'about', section_id: 'values', description: 'Äkthet value-bild' },
    'IMG_1547.jpg': { page_id: 'about', section_id: 'values', description: 'Grupper value-bild' },
    'IMG_4436.jpg': { page_id: 'about', section_id: 'values', description: 'Minnen value-bild' },

    // Action-bilder för About
    'IMG_4108.jpg': { page_id: 'about', section_id: 'hosts', description: 'Snöskoter action' },
    'IMG_3493.jpg': { page_id: 'about', section_id: 'hosts', description: 'Lodge action' },

    // ============================================
    // GALLERY (Gallery → Image Grid)
    // ============================================
    'galleri-opt.mp4': { page_id: 'gallery', section_id: 'hero', description: 'Gallery hero-video' },

    // Gallery grid-bilder
    'IMG_0542.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Forest cabin' },
    'IMG_0575.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Moonlit pines' },
    'IMG_4527.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Aurora base' },
    'IMG_0451.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Winter forest' },
    'IMG_1687.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Team ready' },
    'IMG_6181.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Aurora tub' },
    'IMG_3700.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Lakeside aurora' },
    'IMG_4545.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Campfire hut' },
    'IMG_5562.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Hosts grilling' },
    'IMG_3838.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Winter cabin sunrise' },
    'IMG_3860.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Evening campfire' },
    'IMG_2963.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Family winter sun' },
    'IMG_0554 (1).jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Moonlit cabin' },
    'IMG_1579.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Fireplace feast' },
    'IMG_1904.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Aurora dance' },
    'IMG_4082.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Fireside shelter' },
    'IMG_4596 (1).jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Star camp' },
    'IMG_6702.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Aurora pines' },
    'IMG_7476 (1).jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Fireside lake' },
    'IMG_1634.jpg': { page_id: 'gallery', section_id: 'grid', description: 'Gallery: Outdoor hot tub' },

    // ============================================
    // PACKAGES (Packages → Packages)
    // ============================================
    'paket-opt.mp4': { page_id: 'packages', section_id: 'hero', description: 'Packages hero-video' },

    // ============================================
    // CONTACT / FAQ
    // ============================================
    'kontakt-opt.mp4': { page_id: 'contact', section_id: 'hero', description: 'Contact hero-video' },
    'faq-opt.mp4': { page_id: 'faq', section_id: 'hero', description: 'FAQ hero-video' },

    // ============================================
    // FEATURES / WHY CHOOSE US (Home → Why Choose Us)
    // ============================================
    'IMG_5689.jpg': { page_id: 'features', section_id: 'features', description: 'Why Choose Us bakgrund' },
    'IMG_6359.jpg': { page_id: 'features', section_id: 'features', description: 'Features bakgrund 2' },

    // ============================================
    // NAVIGATION / HEADER
    // ============================================
    'logo.svg': { page_id: 'navigation', section_id: 'header', description: 'Huvudlogotyp' },
    'logo-white.svg': { page_id: 'navigation', section_id: 'header', description: 'Vit logotyp' },
    'logo.png': { page_id: 'navigation', section_id: 'header', description: 'PNG logotyp' },
    'favicon.svg': { page_id: 'navigation', section_id: 'header', description: 'Favicon' },
    'clothes.png': { page_id: 'navigation', section_id: 'header', description: 'Klädikon' },

    // ============================================
    // EXTRA EXPERIENCE-VIDEOR (varianter)
    // ============================================
    'hundspann1-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann 1 (opt)' },
    'hundspann1.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann 1' },
    'hundspann2.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann 2' },
    'hundspann3.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Hundspann 3' },
    'norrsken1.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Norrsken 1' },
    'norrsken2-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Norrsken 2 (opt)' },
    'norrsken2.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Norrsken 2' },
    'snoskoter-opt.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Snöskoter (opt)' },
    'snoskoter.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Snöskoter' },
    'snoskoter2.mp4': { page_id: 'experiences', section_id: 'experiences', description: 'Snöskoter 2' },

    // ============================================
    // HERO / LANDING EXTRA VIDEOR
    // ============================================
    'coldexperience1-opt.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 1 (opt)' },
    'coldexperience1.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 1' },
    'coldexperience2-opt.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 2 (opt)' },
    'coldexperience2.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 2' },
    'coldexperience3-opt.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 3 (opt)' },
    'coldexperience3.mp4': { page_id: 'hero', section_id: 'hero', description: 'ColdExp 3' },

    // ============================================
    // GALLERY EXTRA
    // ============================================
    'galleri.mp4': { page_id: 'gallery', section_id: 'hero', description: 'Galleri (ej opt)' },

    // ============================================
    // ABOUT / ACTIVITIES
    // ============================================
    'matlagning.mp4': { page_id: 'about', section_id: 'story', description: 'Matlagning' },
    'Film-1.mp4': { page_id: 'about', section_id: 'story', description: 'Story film 1' },
    'Film-2.mp4': { page_id: 'about', section_id: 'story', description: 'Story film 2' },
    'Film-3.mp4': { page_id: 'about', section_id: 'story', description: 'Story film 3' },
    'Film-4.mp4': { page_id: 'about', section_id: 'story', description: 'Story film 4' },

    // ============================================
    // FEATURED VIDEO (Home → Featured Video)
    // ============================================
    // YouTube-embed, ingen lokal fil
};

async function auditAndAssignMedia() {
    console.log('===========================================');
    console.log('  MEDIA AUDIT OCH TILLDELNING');
    console.log('===========================================\n');

    // 1. Hämta alla media från Supabase
    const { data: allMedia, error } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id, storage_path, mime_type')
        .order('filename');

    if (error) {
        console.error('❌ Kunde inte hämta media:', error);
        return;
    }

    console.log(`📊 Totalt ${allMedia.length} mediafiler i databasen\n`);

    // 2. Analysera och tilldela
    const updates = [];
    const unmatched = [];
    const alreadyCorrect = [];

    for (const media of allMedia) {
        const assignment = MEDIA_ASSIGNMENTS[media.filename];

        if (assignment) {
            // Kolla om redan tilldelad korrekt
            if (media.page_id === assignment.page_id && media.section_id === assignment.section_id) {
                alreadyCorrect.push({
                    filename: media.filename,
                    page_id: assignment.page_id,
                    section_id: assignment.section_id
                });
            } else {
                updates.push({
                    id: media.id,
                    filename: media.filename,
                    old_page: media.page_id || '(ingen)',
                    old_section: media.section_id || '(ingen)',
                    new_page: assignment.page_id,
                    new_section: assignment.section_id,
                    description: assignment.description
                });
            }
        } else {
            unmatched.push({
                filename: media.filename,
                current_page: media.page_id,
                current_section: media.section_id
            });
        }
    }

    // 3. Visa rapport
    console.log('✅ REDAN KORREKT TILLDELADE:');
    console.log('─'.repeat(50));
    alreadyCorrect.forEach(m => {
        console.log(`  ✓ ${m.filename} → ${m.page_id}/${m.section_id}`);
    });
    console.log(`\n  Totalt: ${alreadyCorrect.length} filer\n`);

    console.log('🔄 BEHÖVER UPPDATERAS:');
    console.log('─'.repeat(50));
    updates.forEach(u => {
        console.log(`  📁 ${u.filename}`);
        console.log(`     Från: ${u.old_page}/${u.old_section}`);
        console.log(`     Till: ${u.new_page}/${u.new_section}`);
        console.log(`     (${u.description})\n`);
    });
    console.log(`  Totalt: ${updates.length} filer\n`);

    console.log('❓ EJ MATCHADE (inga tilldelningsregler):');
    console.log('─'.repeat(50));
    unmatched.forEach(m => {
        const current = m.current_page ? `${m.current_page}/${m.current_section}` : '(oassignerad)';
        console.log(`  ? ${m.filename} → ${current}`);
    });
    console.log(`\n  Totalt: ${unmatched.length} filer\n`);

    // 4. Fråga om vi ska uppdatera
    if (updates.length === 0) {
        console.log('✨ Alla matchade filer är redan korrekt tilldelade!');
        return;
    }

    console.log('─'.repeat(50));
    console.log(`Kör med --apply för att uppdatera ${updates.length} filer i databasen`);
    console.log('─'.repeat(50));

    // 5. Applicera om --apply flagga
    if (process.argv.includes('--apply')) {
        console.log('\n🚀 APPLICERAR UPPDATERINGAR...\n');

        for (const update of updates) {
            const { error: updateError } = await supabase
                .from('cms_media')
                .update({
                    page_id: update.new_page,
                    section_id: update.new_section
                })
                .eq('id', update.id);

            if (updateError) {
                console.log(`  ❌ ${update.filename}: ${updateError.message}`);
            } else {
                console.log(`  ✅ ${update.filename} → ${update.new_page}/${update.new_section}`);
            }
        }

        console.log('\n✨ Klar! Alla uppdateringar applicerade.');
    }
}

// Kör
auditAndAssignMedia().catch(console.error);
