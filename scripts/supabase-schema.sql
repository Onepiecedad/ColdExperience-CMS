-- ============================================================================
-- COLD EXPERIENCE CMS - DATABASE SCHEMA
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to create all required tables
-- Project: cold-experience-cms
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CMS PAGES - Stores page definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    sections TEXT[], -- Array of section names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CMS CONTENT - Stores all text content with translations
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT NOT NULL REFERENCES cms_pages(slug) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    content_en TEXT,
    content_sv TEXT,
    content_de TEXT,
    content_pl TEXT,
    field_type TEXT DEFAULT 'text', -- 'text', 'textarea', 'richtext', 'array'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, section_key, field_key)
);

-- ============================================================================
-- 3. CMS PACKAGES - Stores adventure package information
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_key TEXT UNIQUE NOT NULL,
    name_en TEXT,
    name_sv TEXT,
    name_de TEXT,
    name_pl TEXT,
    description_en TEXT,
    description_sv TEXT,
    description_de TEXT,
    description_pl TEXT,
    duration_en TEXT,
    duration_sv TEXT,
    duration_de TEXT,
    duration_pl TEXT,
    highlights_en TEXT[], -- Array of highlights
    highlights_sv TEXT[],
    highlights_de TEXT[],
    highlights_pl TEXT[],
    price_sek INTEGER,
    price_eur INTEGER,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. CMS SETTINGS - Stores global settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CMS MEDIA - Stores media file references
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    folder TEXT DEFAULT 'general',
    alt_text_en TEXT,
    alt_text_sv TEXT,
    alt_text_de TEXT,
    alt_text_pl TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES - For better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cms_content_page ON cms_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_cms_content_section ON cms_content(section_key);
CREATE INDEX IF NOT EXISTS idx_cms_content_lookup ON cms_content(page_slug, section_key, field_key);
CREATE INDEX IF NOT EXISTS idx_cms_packages_active ON cms_packages(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_cms_media_folder ON cms_media(folder);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (CMS admins)
-- READ access for all authenticated users
CREATE POLICY "Allow read for authenticated" ON cms_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON cms_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON cms_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON cms_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON cms_media FOR SELECT TO authenticated USING (true);

-- WRITE access for authenticated users
CREATE POLICY "Allow write for authenticated" ON cms_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write for authenticated" ON cms_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write for authenticated" ON cms_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write for authenticated" ON cms_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write for authenticated" ON cms_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PUBLIC read access (for website to fetch content)
CREATE POLICY "Allow public read" ON cms_pages FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow public read" ON cms_content FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON cms_packages FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow public read" ON cms_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON cms_media FOR SELECT TO anon USING (true);

-- ============================================================================
-- TRIGGERS - Auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON cms_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cms_packages_updated_at BEFORE UPDATE ON cms_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cms_settings_updated_at BEFORE UPDATE ON cms_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON cms_media FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================================
INSERT INTO cms_settings (setting_key, setting_value, setting_type, description) VALUES
    ('site_name', 'Cold Experience', 'string', 'Website name'),
    ('default_language', 'en', 'string', 'Default language code'),
    ('contact_email', 'info@coldexperience.se', 'string', 'Primary contact email'),
    ('contact_phone', '+46 73 181 45 68', 'string', 'Primary contact phone'),
    ('season_start', 'December', 'string', 'Season start month'),
    ('season_end', 'April', 'string', 'Season end month'),
    ('location', 'Råstrand, Swedish Lapland', 'string', 'Business location'),
    ('currency_primary', 'SEK', 'string', 'Primary currency'),
    ('currency_secondary', 'EUR', 'string', 'Secondary currency')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT PAGES
-- ============================================================================
INSERT INTO cms_pages (slug, name, description, icon, display_order, sections) VALUES
    ('hero', 'Hero Section', 'Main landing section with video, title and CTAs', 'home', 1, ARRAY['hero', 'featuredVideo']),
    ('features', 'Why Choose Us', 'Key selling points and features', 'star', 2, ARRAY['features']),
    ('experiences', 'Experiences', 'Adventure descriptions', 'compass', 3, ARRAY['experiences']),
    ('about', 'About Us', 'Company story, team info, values and timeline', 'users', 4, ARRAY['about', 'ownerSection', 'why']),
    ('packages', 'Packages', 'Adventure packages and pricing', 'package', 5, ARRAY['packages']),
    ('gallery', 'Gallery', 'Photo gallery and image captions', 'image', 6, ARRAY['gallery']),
    ('contact', 'Contact', 'Contact information, form and FAQs', 'mail', 7, ARRAY['contact', 'faq']),
    ('booking', 'Booking', 'Booking form fields and messages', 'calendar', 8, ARRAY['booking', 'book', 'form']),
    ('detailPages', 'Detail Pages', 'Snowmobile, Husky, Northern Lights pages', 'file-text', 9, ARRAY['pages']),
    ('navigation', 'Navigation & UI', 'Header, footer and common UI elements', 'menu', 10, ARRAY['header', 'footer', 'common', 'shared']),
    ('legal', 'Legal & Policies', 'Privacy policy, terms and cookies', 'shield', 11, ARRAY['policies', 'cookieBanner', 'cookieSettings']),
    ('testimonials', 'Testimonials', 'Guest reviews and ratings', 'message-circle', 12, ARRAY['testimonials'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT PACKAGES
-- ============================================================================
INSERT INTO cms_packages (package_key, name_en, name_sv, name_de, name_pl, price_sek, price_eur, is_featured, display_order) VALUES
    ('complete', '7-Day Complete Experience', '7-dagars komplett upplevelse', '7-Tage Komplettpaket', '7-dniowe pełne doświadczenie', 24500, 2250, true, 0),
    ('adventure', '5-Day Adventure', '5-dagars äventyr', '5-Tage Abenteuer', '5-dniowa przygoda', 19000, 1750, false, 1),
    ('threeDay', '3-Day Lapland Escape', '3-dagars Lapplands-flykt', '3-Tage Lappland-Auszeit', '3-dniowy wypad do Laponii', 13500, 1250, false, 2),
    ('taster', '1-Day Taster', '1-dags smakprov', '1-Tag Schnuppertour', '1-dniowe doświadczenie', 3800, 350, false, 3)
ON CONFLICT (package_key) DO NOTHING;

-- ============================================================================
-- DONE! 
-- ============================================================================
-- Your CMS database is now ready to use.
-- Tables created: cms_pages, cms_content, cms_packages, cms_settings, cms_media
-- Default settings and pages have been inserted.
-- ============================================================================
