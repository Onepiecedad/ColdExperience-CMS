/**
 * CLEANUP HERO SECTION MEDIA
 * Removes incorrectly assigned files from hero/hero section
 * Only keeps the files actually used in Hero.js component
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

// Correct files for hero/hero (from Hero.js source code analysis):
// - coldexperience-top-1.mp4 (main background video)
// - IMG_6698.jpg (fallback/poster image)
const CORRECT_HERO_FILES = [
    'coldexperience-top-1.mp4',
    'IMG_6698.jpg'
];

async function cleanupHeroSection() {
    console.log('='.repeat(60));
    console.log('CLEANUP HERO SECTION');
    console.log('='.repeat(60));
    console.log('');
    console.log('Correct files (from Hero.js):');
    CORRECT_HERO_FILES.forEach(f => console.log('  ✓', f));
    console.log('');

    // Get current files in hero/hero
    const { data: heroFiles, error } = await supabase
        .from('cms_media')
        .select('id, filename, page_id, section_id')
        .eq('page_id', 'hero')
        .eq('section_id', 'hero');

    if (error) {
        console.error('Error fetching hero files:', error);
        return;
    }

    console.log('Current files in hero/hero:', heroFiles.length);
    heroFiles.forEach(f => console.log('  -', f.filename));
    console.log('');

    // Find files that should NOT be in hero/hero
    const wrongFiles = heroFiles.filter(f => !CORRECT_HERO_FILES.includes(f.filename));

    if (wrongFiles.length === 0) {
        console.log('✅ Hero section is already correct!');
        return;
    }

    console.log('Files to REMOVE from hero/hero:');
    wrongFiles.forEach(f => console.log('  ❌', f.filename));
    console.log('');

    // Unassign wrong files (set page_id and section_id to null)
    for (const file of wrongFiles) {
        const { error: updateError } = await supabase
            .from('cms_media')
            .update({ page_id: null, section_id: null })
            .eq('id', file.id);

        if (updateError) {
            console.log('  Error unassigning', file.filename + ':', updateError.message);
        } else {
            console.log('  ✅ Unassigned:', file.filename);
        }
    }

    // Verify
    console.log('');
    console.log('After cleanup - hero/hero files:');
    const { data: cleanedFiles } = await supabase
        .from('cms_media')
        .select('filename')
        .eq('page_id', 'hero')
        .eq('section_id', 'hero');

    cleanedFiles.forEach(f => console.log('  ✓', f.filename));
    console.log('');
    console.log('='.repeat(60));
    console.log(`Hero section now has ${cleanedFiles.length} files (correct!)`);
    console.log('='.repeat(60));
}

cleanupHeroSection();
