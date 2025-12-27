#!/usr/bin/env node
/**
 * Create media bucket in Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim();
    }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function createBucket() {
    console.log('🔍 Checking storage buckets...\n');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.log('❌ Error listing buckets:', error.message);
        console.log('\n⚠️  The anon key may not have permission to list/create buckets.');
        console.log('   You need to create the bucket manually in Supabase Dashboard:');
        console.log('   1. Go to Storage in Supabase Dashboard');
        console.log('   2. Click "New bucket"');
        console.log('   3. Name: media');
        console.log('   4. Check "Public bucket"');
        console.log('   5. Save');
        return;
    }

    console.log('📦 Found buckets:', buckets?.length || 0);
    if (buckets) {
        buckets.forEach(b => console.log('  -', b.name, '(public:', b.public, ')'));
    }

    const mediaBucket = buckets?.find(b => b.name === 'media');

    if (mediaBucket) {
        console.log('\n✅ Media bucket already exists!');
        return true;
    }

    console.log('\n🔧 Creating media bucket...');
    const { data, error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 52428800
    });

    if (createError) {
        console.log('❌ Create error:', createError.message);
        console.log('\n⚠️  Please create the bucket manually in Supabase Dashboard → Storage');
        return false;
    }

    console.log('✅ Bucket created successfully!');
    return true;
}

createBucket().catch(console.error);
