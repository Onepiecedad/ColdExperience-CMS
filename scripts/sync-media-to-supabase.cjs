#!/usr/bin/env node
/**
 * Cold Experience CMS - Media Sync Script
 * 
 * Syncs all images and videos from the website's public folder to Supabase Storage.
 * Also creates corresponding records in the cms_media table.
 * 
 * Usage: node scripts/sync-media-to-supabase.cjs
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

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Website public folder
const WEBSITE_PUBLIC = path.join(__dirname, '..', '..', 'ColdExperience', 'frontend', 'public');

// Media folders to sync
const MEDIA_FOLDERS = [
    { folder: 'images', type: 'image' },
    { folder: 'optimized_videos', type: 'video' },
    { folder: 'nya_filmer', type: 'video' },
    { folder: '', type: 'mixed', files: ['logo.png', 'favicon.svg'] }  // Root level files
];

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

// Get all media files from a folder
function getMediaFiles(folderPath, baseFolder = '') {
    const files = [];

    if (!fs.existsSync(folderPath)) {
        return files;
    }

    const items = fs.readdirSync(folderPath);

    for (const item of items) {
        const fullPath = path.join(folderPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Recursively get files from subdirectories
            const subFolder = baseFolder ? `${baseFolder}/${item}` : item;
            files.push(...getMediaFiles(fullPath, subFolder));
        } else {
            const ext = path.extname(item).toLowerCase();
            if (MIME_TYPES[ext]) {
                files.push({
                    name: item,
                    path: fullPath,
                    folder: baseFolder,
                    ext: ext,
                    mimeType: MIME_TYPES[ext],
                    size: stat.size,
                    type: ext.match(/\.(jpg|jpeg|png|webp|gif|svg)$/) ? 'image' : 'video'
                });
            }
        }
    }

    return files;
}

// Upload a single file to Supabase Storage
async function uploadFile(file) {
    const storagePath = file.folder ? `${file.folder}/${file.name}` : file.name;
    const fileBuffer = fs.readFileSync(file.path);

    // Check if file already exists
    const { data: existingFile } = await supabase.storage
        .from('media')
        .list(file.folder || '', {
            search: file.name
        });

    if (existingFile && existingFile.some(f => f.name === file.name)) {
        console.log(`   ⏭️  Skip (exists): ${storagePath}`);
        return { skipped: true, storagePath };
    }

    // Upload to storage
    const { data, error } = await supabase.storage
        .from('media')
        .upload(storagePath, fileBuffer, {
            contentType: file.mimeType,
            upsert: true
        });

    if (error) {
        console.error(`   ❌ Upload failed: ${storagePath} - ${error.message}`);
        return { error, storagePath };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

    return {
        success: true,
        storagePath,
        publicUrl: urlData.publicUrl,
        file
    };
}

// Create record in cms_media table
async function createMediaRecord(uploadResult) {
    if (!uploadResult.success) return null;

    const { file, storagePath, publicUrl } = uploadResult;

    // Check if record already exists
    const { data: existing } = await supabase
        .from('cms_media')
        .select('id')
        .eq('storage_path', storagePath)
        .single();

    if (existing) {
        return { skipped: true, id: existing.id };
    }

    // Create new record
    const record = {
        filename: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.mimeType,
        size_bytes: file.size,
        folder: file.folder || null,
        alt_text_en: generateAltText(file.name, 'en'),
        alt_text_sv: generateAltText(file.name, 'sv')
    };

    const { data, error } = await supabase
        .from('cms_media')
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error(`   ❌ DB record failed: ${storagePath} - ${error.message}`);
        return { error };
    }

    return { success: true, id: data.id };
}

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

// Main sync function
async function syncMedia() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     COLD EXPERIENCE CMS - MEDIA SYNC TO SUPABASE              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`📡 Supabase URL: ${supabaseUrl}`);
    console.log(`📂 Website path: ${WEBSITE_PUBLIC}`);
    console.log();

    // Verify bucket exists by trying to list files (doesn't need admin permission)
    console.log('🔍 Verifying storage bucket "media"...');
    const { data: testList, error: testError } = await supabase.storage
        .from('media')
        .list('', { limit: 1 });

    if (testError && testError.message.includes('not found')) {
        console.error('❌ Storage bucket "media" not found!');
        console.log('\n⚠️  Please create the bucket in Supabase Dashboard → Storage.');
        process.exit(1);
    }

    console.log('✓ Storage bucket "media" verified\n');

    // Collect all media files
    let allFiles = [];

    for (const { folder, type, files: specificFiles } of MEDIA_FOLDERS) {
        if (specificFiles) {
            // Specific files from root
            for (const fileName of specificFiles) {
                const filePath = path.join(WEBSITE_PUBLIC, fileName);
                if (fs.existsSync(filePath)) {
                    const stat = fs.statSync(filePath);
                    const ext = path.extname(fileName).toLowerCase();
                    allFiles.push({
                        name: fileName,
                        path: filePath,
                        folder: '',
                        ext: ext,
                        mimeType: MIME_TYPES[ext],
                        size: stat.size,
                        type: type === 'mixed' ? (ext.match(/\.(mp4|webm|mov)$/) ? 'video' : 'image') : type
                    });
                }
            }
        } else {
            // All files from folder
            const folderPath = path.join(WEBSITE_PUBLIC, folder);
            const files = getMediaFiles(folderPath, folder);
            allFiles.push(...files);
        }
    }

    console.log(`📊 Found ${allFiles.length} media files to sync\n`);

    // Group by type for display
    const images = allFiles.filter(f => f.type === 'image');
    const videos = allFiles.filter(f => f.type === 'video');

    console.log(`   🖼️  Images: ${images.length}`);
    console.log(`   🎬 Videos: ${videos.length}`);
    console.log();

    // Calculate total size
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    console.log(`   📦 Total size: ${totalSizeMB} MB\n`);

    // Upload files
    console.log('═'.repeat(60));
    console.log('🚀 Starting upload...\n');

    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        const progress = `[${i + 1}/${allFiles.length}]`;

        console.log(`${progress} Uploading: ${file.folder ? file.folder + '/' : ''}${file.name}`);

        // Upload to storage
        const uploadResult = await uploadFile(file);

        if (uploadResult.skipped) {
            skipped++;
            continue;
        }

        if (uploadResult.error) {
            failed++;
            continue;
        }

        // Create database record
        const dbResult = await createMediaRecord(uploadResult);

        if (dbResult?.success) {
            console.log(`   ✓ Uploaded and recorded`);
            uploaded++;
        } else if (dbResult?.skipped) {
            console.log(`   ✓ Uploaded (record exists)`);
            uploaded++;
        } else {
            uploaded++; // File uploaded even if DB record failed
        }
    }

    // Summary
    console.log();
    console.log('═'.repeat(60));
    console.log('📊 SYNC COMPLETE\n');
    console.log(`   ✅ Uploaded: ${uploaded}`);
    console.log(`   ⏭️  Skipped (existing): ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log();

    // Verify database
    const { data: mediaCount } = await supabase
        .from('cms_media')
        .select('id', { count: 'exact' });

    console.log(`📋 Total records in cms_media: ${mediaCount?.length || 0}`);
    console.log();
    console.log('✨ Media sync completed!');
    console.log('   Open CMS Dashboard → Media Library to view files.');
}

// Run
syncMedia().catch(console.error);
