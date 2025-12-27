#!/usr/bin/env node
/**
 * Cold Experience CMS - Sync Storage Files to Database
 * 
 * Creates database records for files that exist in storage but not in cms_media table.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MIME type mapping
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime'
};

// Generate alt text from filename
function generateAltText(filename, lang) {
    const name = path.basename(filename, path.extname(filename));
    const words = name
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/(\d+)/g, ' $1 ')
        .trim();

    if (lang === 'sv') {
        return words
            .replace(/snowmobile|snoskoter/gi, 'Snöskoter')
            .replace(/husky|hundspann/gi, 'Hundspann')
            .replace(/northern lights|norrsken/gi, 'Norrsken')
            .replace(/aurora/gi, 'Norrsken')
            .replace(/owners/gi, 'Ägare')
            .replace(/logo/gi, 'Logotyp')
            .replace(/gallery|galleri/gi, 'Galleri');
    }

    return words
        .replace(/snoskoter/gi, 'Snowmobile')
        .replace(/hundspann/gi, 'Husky sled')
        .replace(/norrsken/gi, 'Northern lights')
        .replace(/galleri/gi, 'Gallery')
        .replace(/om_oss/gi, 'About us');
}

async function syncDbRecords() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     SYNC STORAGE FILES TO DATABASE                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Get all files from storage
    const folders = ['', 'images', 'images/Nya_bilder', 'optimized_videos', 'nya_filmer', 'nya_filmer/Pictures'];
    let allStorageFiles = [];

    for (const folder of folders) {
        const { data: files, error } = await supabase.storage
            .from('media')
            .list(folder, { limit: 1000 });

        if (error) {
            console.log(`⚠️ Could not list folder '${folder}':`, error.message);
            continue;
        }

        if (files) {
            for (const file of files) {
                if (file.name && !file.id) continue; // Skip folders
                if (file.metadata) {
                    const storagePath = folder ? `${folder}/${file.name}` : file.name;
                    allStorageFiles.push({
                        name: file.name,
                        storagePath,
                        folder: folder || null,
                        size: file.metadata?.size || 0,
                        mimeType: file.metadata?.mimetype || MIME_TYPES[path.extname(file.name).toLowerCase()]
                    });
                }
            }
        }
    }

    console.log(`📦 Found ${allStorageFiles.length} files in storage\n`);

    // Get existing database records
    const { data: existingRecords } = await supabase
        .from('cms_media')
        .select('storage_path');

    const existingPaths = new Set((existingRecords || []).map(r => r.storage_path));
    console.log(`📋 Found ${existingPaths.size} existing database records\n`);

    // Find files without database records
    const missingRecords = allStorageFiles.filter(f => !existingPaths.has(f.storagePath));
    console.log(`🔍 Found ${missingRecords.length} files without database records\n`);

    if (missingRecords.length === 0) {
        console.log('✅ All storage files have database records!');
        return;
    }

    // Create missing records
    console.log('Creating database records...\n');
    let created = 0;
    let failed = 0;

    for (const file of missingRecords) {
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(file.storagePath);

        const record = {
            filename: file.name,
            storage_path: file.storagePath,
            public_url: urlData.publicUrl,
            mime_type: file.mimeType,
            size_bytes: file.size,
            folder: file.folder,
            alt_text_en: generateAltText(file.name, 'en'),
            alt_text_sv: generateAltText(file.name, 'sv')
        };

        const { error } = await supabase
            .from('cms_media')
            .insert(record);

        if (error) {
            console.log(`❌ Failed: ${file.storagePath} - ${error.message}`);
            failed++;
        } else {
            console.log(`✓ Created: ${file.storagePath}`);
            created++;
        }
    }

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📊 SYNC COMPLETE\n');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);

    // Verify final count
    const { data: finalCount } = await supabase
        .from('cms_media')
        .select('id', { count: 'exact' });

    console.log(`\n📋 Total records in cms_media: ${finalCount?.length || 0}`);
}

syncDbRecords().catch(console.error);
