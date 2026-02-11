-- ============================================================================
-- Migration: Create cms_allowed_users table + seed missing cms_settings
-- Date: 2026-02-11
-- ============================================================================
-- 1. Create cms_allowed_users table
CREATE TABLE IF NOT EXISTS public.cms_allowed_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.cms_allowed_users ENABLE ROW LEVEL SECURITY;
-- RLS policies: authenticated users can read, only service_role can write
CREATE POLICY "Authenticated users can read allowed_users" ON public.cms_allowed_users FOR
SELECT TO authenticated USING (true);
-- 2. Seed with the current allowed email
INSERT INTO public.cms_allowed_users (email, role)
VALUES ('joakim@skylandai.se', 'admin') ON CONFLICT (email) DO NOTHING;
-- 3. Insert missing cms_settings (6 of 9 expected are missing)
-- Existing: site_name, contact_phone, contact_email
-- Missing: primary_color, secondary_color, logo_url, favicon_url, meta_description, social_facebook
INSERT INTO public.cms_settings (
        setting_key,
        setting_value,
        setting_type,
        description
    )
VALUES (
        'primary_color',
        '#0a1622',
        'color',
        'Primary brand color'
    ),
    (
        'secondary_color',
        '#5a9bc7',
        'color',
        'Secondary/accent brand color'
    ),
    ('logo_url', NULL, 'url', 'URL to site logo'),
    (
        'favicon_url',
        NULL,
        'url',
        'URL to site favicon'
    ),
    (
        'meta_description',
        'Premium Lapland cold experience adventures in Swedish Lapland',
        'text',
        'Default meta description for SEO'
    ),
    (
        'social_facebook',
        NULL,
        'url',
        'Facebook page URL'
    ) ON CONFLICT (setting_key) DO NOTHING;