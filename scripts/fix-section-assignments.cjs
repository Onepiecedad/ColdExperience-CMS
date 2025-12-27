/**
 * FIX SECTION MEDIA ASSIGNMENTS
 * Based on source code analysis, assign media files to their correct sections
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

// Correct section assignments based on website source code
const SECTION_ASSIGNMENTS = {
    // About page Hero uses om_oss-opt.mp4
    'om_oss-opt.mp4': { page_id: 'about', section_id: 'hero' },

    // Gallery page Hero uses galleri-opt.mp4 (single hero video)
    'galleri-opt.mp4': { page_id: 'gallery', section_id: 'hero' },
};

async function fixSectionAssignments() {
    console.log('='.repeat(60));
    console.log('FIXING SECTION MEDIA ASSIGNMENTS');
    console.log('='.repeat(60));
    console.log('');

    for (const [filename, assignment] of Object.entries(SECTION_ASSIGNMENTS)) {
        console.log(`Updating ${filename} -> ${assignment.page_id}/${assignment.section_id}...`);

        const { data, error } = await supabase
            .from('cms_media')
            .update(assignment)
            .eq('filename', filename)
            .select();

        if (error) {
            console.log(`  ❌ Error: ${error.message}`);
        } else if (data.length === 0) {
            console.log(`  ⚠️ File not found`);
        } else {
            console.log(`  ✅ Updated ${data.length} file(s)`);
        }
    }

    // Also create about/hero entry for the poster image
    console.log('\nCreating duplicate entry for About Hero poster...');
    const { data: posterData } = await supabase
        .from('cms_media')
        .select('*')
        .eq('filename', 'IMG_2425.jpg')
        .limit(1);

    if (posterData && posterData.length > 0) {
        const source = posterData[0];
        // Check if about/hero already has this file
        const { data: existing } = await supabase
            .from('cms_media')
            .select('id')
            .eq('filename', 'IMG_2425.jpg')
            .eq('page_id', 'about')
            .eq('section_id', 'hero');

        if (existing && existing.length > 0) {
            console.log('  ✓ IMG_2425.jpg already in about/hero');
        } else {
            const { error } = await supabase.from('cms_media').insert({
                filename: source.filename,
                storage_path: source.storage_path,
                public_url: source.public_url,
                type: source.type,
                width: source.width,
                height: source.height,
                page_id: 'about',
                section_id: 'hero',
                alt_text: source.alt_text,
                metadata: source.metadata,
            });
            if (error) {
                console.log('  ❌ Error creating duplicate:', error.message);
            } else {
                console.log('  ✅ Created duplicate for about/hero');
            }
        }
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('Running final audit...');
    console.log('='.repeat(60));

    const { data } = await supabase
        .from('cms_media')
        .select('page_id, section_id, filename');

    const grouped = {};
    data.forEach(m => {
        if (m.page_id) {
            const key = m.page_id + '/' + m.section_id;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m.filename);
        }
    });

    Object.entries(grouped).sort().forEach(([key, files]) => {
        console.log(`${key}: ${files.length} files`);
    });
}

fixSectionAssignments();
