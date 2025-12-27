/**
 * Auto-assign existing media files to sections based on filename patterns
 * 
 * This script analyzes media filenames and assigns them to the most likely
 * page and section based on naming conventions and content patterns.
 * 
 * Usage: node scripts/auto-assign-media.cjs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
    });
    return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Media assignment rules based on filename patterns
const MEDIA_ASSIGNMENT_RULES = [
    // Hero section - main videos and key images
    { pattern: /coldexperience[_-]?(1|top|main|hero)/i, page_id: 'hero', section_id: 'hero' },
    { pattern: /hero/i, page_id: 'hero', section_id: 'hero' },
    { pattern: /logo/i, page_id: 'navigation', section_id: 'header' },
    { pattern: /favicon/i, page_id: 'navigation', section_id: 'header' },

    // Owner/About section
    { pattern: /owner|gustav|julia|family|born|childhood/i, page_id: 'about', section_id: 'ownerSection' },

    // Experiences - specific activities
    { pattern: /hundspann|husky|dog/i, page_id: 'experiences', section_id: 'husky' },
    { pattern: /sn(o|ö)skoter|snowmobile/i, page_id: 'experiences', section_id: 'snowmobile' },
    { pattern: /norrsken|aurora|northern.*light/i, page_id: 'experiences', section_id: 'aurora' },

    // Gallery images
    { pattern: /IMG_\d+|gallery/i, page_id: 'gallery', section_id: 'grid' },

    // General content
    { pattern: /matlagning|cooking|food/i, page_id: 'experiences', section_id: 'experiences' },
    { pattern: /clothes|outfit|wear/i, page_id: 'about', section_id: 'about' },
];

async function autoAssignMedia() {
    console.log('🚀 Auto-assigning media to sections...\n');

    try {
        // Get all unassigned media
        const { data: media, error } = await supabase
            .from('cms_media')
            .select('*')
            .is('page_id', null);

        if (error) {
            console.error('❌ Error fetching media:', error.message);
            return;
        }

        console.log(`📊 Found ${media.length} unassigned media files\n`);

        const assignments = [];
        const unmatched = [];

        for (const item of media) {
            const filename = item.filename.toLowerCase();
            let assigned = false;

            for (const rule of MEDIA_ASSIGNMENT_RULES) {
                if (rule.pattern.test(filename)) {
                    assignments.push({
                        id: item.id,
                        filename: item.filename,
                        page_id: rule.page_id,
                        section_id: rule.section_id
                    });
                    assigned = true;
                    break;
                }
            }

            if (!assigned) {
                unmatched.push(item.filename);
            }
        }

        console.log('📋 Proposed assignments:\n');
        console.log('─'.repeat(70));

        // Group by page/section for display
        const grouped = {};
        for (const a of assignments) {
            const key = `${a.page_id}/${a.section_id}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(a.filename);
        }

        for (const [key, files] of Object.entries(grouped)) {
            console.log(`\n📂 ${key}:`);
            files.forEach(f => console.log(`   ✓ ${f}`));
        }

        if (unmatched.length > 0) {
            console.log(`\n⚠️  Unmatched files (will remain global):`);
            unmatched.forEach(f => console.log(`   ? ${f}`));
        }

        console.log('\n─'.repeat(70));
        console.log(`\n📈 Summary: ${assignments.length} to assign, ${unmatched.length} unmatched\n`);

        // Perform the assignments
        if (assignments.length > 0) {
            console.log('💾 Applying assignments...\n');

            for (const a of assignments) {
                const { error: updateError } = await supabase
                    .from('cms_media')
                    .update({ page_id: a.page_id, section_id: a.section_id })
                    .eq('id', a.id);

                if (updateError) {
                    console.error(`   ❌ Failed to assign ${a.filename}:`, updateError.message);
                } else {
                    console.log(`   ✅ ${a.filename} → ${a.page_id}/${a.section_id}`);
                }
            }

            console.log('\n✅ Auto-assignment complete!');
        }

        // Show final stats
        const { count: totalCount } = await supabase
            .from('cms_media')
            .select('*', { count: 'exact', head: true });

        const { count: assignedCount } = await supabase
            .from('cms_media')
            .select('*', { count: 'exact', head: true })
            .not('page_id', 'is', null);

        console.log('\n📊 Final status:');
        console.log(`   Total media: ${totalCount}`);
        console.log(`   Assigned to sections: ${assignedCount}`);
        console.log(`   Global (unassigned): ${totalCount - assignedCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

autoAssignMedia();
