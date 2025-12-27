-- ============================================
-- Cold Experience CMS - Storage Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media', 
    true,
    52428800,  -- 50MB limit per file
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- 2. Enable public read access to all files in media bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'media');

-- 3. Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'media');

-- 4. Allow service role to upload (for sync scripts)
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;
CREATE POLICY "Service role full access" ON storage.objects
    FOR ALL
    TO service_role
    USING (bucket_id = 'media')
    WITH CHECK (bucket_id = 'media');

-- 5. Allow anon key to upload (for development - remove in production)
DROP POLICY IF EXISTS "Anon upload for dev" ON storage.objects;
CREATE POLICY "Anon upload for dev" ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'media');

-- 6. Allow anon to update (for development)
DROP POLICY IF EXISTS "Anon update for dev" ON storage.objects;
CREATE POLICY "Anon update for dev" ON storage.objects
    FOR UPDATE
    TO anon
    USING (bucket_id = 'media')
    WITH CHECK (bucket_id = 'media');

-- 7. Allow anon to delete (for development)  
DROP POLICY IF EXISTS "Anon delete for dev" ON storage.objects;
CREATE POLICY "Anon delete for dev" ON storage.objects
    FOR DELETE
    TO anon
    USING (bucket_id = 'media');

-- Verify bucket was created
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'media';
