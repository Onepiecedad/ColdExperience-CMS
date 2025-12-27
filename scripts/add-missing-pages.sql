-- ============================================================================
-- COLD EXPERIENCE CMS - ADD MISSING PAGES
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to add the 6 missing pages
-- This will allow syncing all 699 content fields
-- ============================================================================

-- Insert missing pages (only if they don't already exist)
INSERT INTO cms_pages (slug, name, description, icon, display_order) VALUES
    ('features', 'Why Choose Us', 'Key selling points and features', 'star', 2),
    ('booking', 'Booking', 'Booking form fields and messages', 'calendar', 8),
    ('detailPages', 'Detail Pages', 'Snowmobile Safari, Husky Ride, Northern Lights, Lodging pages', 'file-text', 9),
    ('navigation', 'Navigation & UI', 'Header, footer and common UI elements', 'menu', 10),
    ('legal', 'Legal & Policies', 'Privacy policy, terms and cookies', 'shield', 11),
    ('testimonials', 'Testimonials', 'Guest reviews and ratings', 'message-circle', 12)
ON CONFLICT (slug) DO NOTHING;

-- Verify the pages were added
SELECT slug, name, display_order FROM cms_pages ORDER BY display_order;

-- ============================================================================
-- After running this, go back to CMS Dashboard and click
-- "Synka allt till Supabase" again to sync all 699 fields
-- ============================================================================
