/**
 * Upload Missing Media to Supabase
 * 
 * Uploads files from website that are missing in Supabase Storage
 * and creates their cms_media records with correct section assignments.
 * 
 * Run: node scripts/upload-missing-media.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Files to upload (from compare script)
const WEBSITE_PATH = path.join(__dirname, '../../ColdExperience/frontend/public');

const filesToUpload = [
    {
        filename: 'Skolan-film-2.mp4',
        localPath: path.join(WEBSITE_PATH, 'skolan-bilder/Skolan-film-2.mp4'),
        pageId: 'experiences',
        sectionId: 'experiences',
        mimeType: 'video/mp4'
    },
    {
        filename: 'skolan1-4fe44306.jpg',
        localPath: path.join(WEBSITE_PATH, 'skolan-bilder/skolan1-4fe44306.jpg'),
        pageId: 'experiences',
        sectionId: 'experiences',
        mimeType: 'image/jpeg'
    }
];

async function uploadMissingMedia() {
    console.log('📤 Uploading missing media to Supabase...\n');

    for (const file of filesToUpload) {
        console.log(`📁 Processing: ${file.filename}`);

        // Check if file exists locally
        if (!fs.existsSync(file.localPath)) {
            console.log(`   ❌ Local file not found: ${file.localPath}`);
            continue;
        }

        // Read file
        const fileBuffer = fs.readFileSync(file.localPath);
        const fileSize = fs.statSync(file.localPath).size;
        console.log(`   📦 Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

        // Upload to Supabase Storage
        const storagePath = `uploads/${Date.now()}_${file.filename}`;
        console.log(`   ⬆️  Uploading to storage: ${storagePath}`);

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('media')
            .upload(storagePath, fileBuffer, {
                contentType: file.mimeType,
                upsert: false
            });

        if (uploadError) {
            console.log(`   ❌ Upload failed: ${uploadError.message}`);
            continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('media')
            .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;
        console.log(`   🔗 Public URL: ${publicUrl}`);

        // Create cms_media record
        const { data: insertData, error: insertError } = await supabase
            .from('cms_media')
            .insert({
                filename: file.filename,
                storage_path: storagePath,
                public_url: publicUrl,
                mime_type: file.mimeType,
                size_bytes: fileSize,
                page_id: file.pageId,
                section_id: file.sectionId
            })
            .select()
            .single();

        if (insertError) {
            console.log(`   ❌ Database insert failed: ${insertError.message}`);
            continue;
        }

        console.log(`   ✅ Uploaded and assigned to ${file.pageId}/${file.sectionId}`);
        console.log(`   🆔 ID: ${insertData.id}\n`);
    }

    console.log('✅ Upload complete!');
}

// Run
uploadMissingMedia().catch(console.error);
