-- ============================================================================
-- CMS DRAFTS TABLE - Ticket 5
-- ============================================================================
-- Separate table for draft content. NEVER write drafts to cms_content.
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================
-- Create the cms_drafts table
CREATE TABLE IF NOT EXISTS public.cms_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    content_id UUID REFERENCES public.cms_content(id) ON DELETE CASCADE,
    content_key TEXT,
    language TEXT NOT NULL CHECK (language IN ('sv', 'en', 'de', 'pl')),
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
);
-- ============================================================================
-- UNIQUE INDEXES - For upsert logic
-- ============================================================================
-- Primary: One draft per (content_id + language) when editing existing content
CREATE UNIQUE INDEX IF NOT EXISTS cms_drafts_unique_content_lang ON public.cms_drafts(content_id, language)
WHERE content_id IS NOT NULL;
-- Fallback: One draft per (page_id + section + content_key + language) for new fields
CREATE UNIQUE INDEX IF NOT EXISTS cms_drafts_unique_key_lang ON public.cms_drafts(page_id, section, content_key, language)
WHERE content_id IS NULL;
-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Fast lookup by page and section (common query pattern)
CREATE INDEX IF NOT EXISTS cms_drafts_page_section_idx ON public.cms_drafts(page_id, section);
-- For sorting by most recently updated
CREATE INDEX IF NOT EXISTS cms_drafts_updated_at_idx ON public.cms_drafts(updated_at DESC);
-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on the table
ALTER TABLE public.cms_drafts ENABLE ROW LEVEL SECURITY;
-- Policy: Authenticated users can SELECT drafts
CREATE POLICY "read cms_drafts for authenticated" ON public.cms_drafts FOR
SELECT TO authenticated USING (true);
-- Policy: Authenticated users can INSERT drafts
CREATE POLICY "insert cms_drafts for authenticated" ON public.cms_drafts FOR
INSERT TO authenticated WITH CHECK (true);
-- Policy: Authenticated users can UPDATE drafts
CREATE POLICY "update cms_drafts for authenticated" ON public.cms_drafts FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Policy: Authenticated users can DELETE drafts
CREATE POLICY "delete cms_drafts for authenticated" ON public.cms_drafts FOR DELETE TO authenticated USING (true);
-- ============================================================================
-- HELPER COMMENT
-- ============================================================================
COMMENT ON TABLE public.cms_drafts IS 'Draft content storage. Synced from CMS editor, never written to cms_content until publish.';