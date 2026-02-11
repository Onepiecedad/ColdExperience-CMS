// ============================================================================
// SUPABASE CLIENT
// ============================================================================
// Configure with your Supabase project credentials
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { CmsPage, CmsContent, CmsPackage, CmsMedia, CmsSetting, CmsDraft, CmsMeta, Language } from '../types';

// Environment variables (set these in .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export async function signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        },
    });
    return { error: error as Error | null };
}

// Allowed emails for Google OAuth — read from env variable
const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    return { error: error as Error | null };
}

export function isEmailAllowed(email: string): boolean {
    return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ============================================================================
// PAGES FUNCTIONS
// ============================================================================

export async function getPages(): Promise<CmsPage[]> {
    const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('display_order');

    if (error) throw error;
    return data || [];
}

/**
 * Get a single page by its URL slug
 * Used by mobile-first flow to resolve pageId → page UUID
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
    const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        // PGRST116 = no rows returned - not an error, just not found
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

/**
 * Get content for a specific page and section
 * Used by mobile-first EditorScreen
 */
export async function getContentByPageAndSection(
    pageId: string,
    sectionId: string
): Promise<CmsContent[]> {
    const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_id', pageId)
        .eq('section', sectionId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}

/**
 * Upsert pages to cms_pages table
 * Used by Structure sync to create missing pages from contentMap
 * Idempotent: uses slug as conflict key, won't duplicate
 */
export interface PageUpsert {
    slug: string;
    name: string;
    description: string | null;
    icon: string;
    display_order: number;
}

export async function upsertPages(pages: PageUpsert[]): Promise<{ inserted: number; updated: number }> {
    if (pages.length === 0) {
        return { inserted: 0, updated: 0 };
    }

    // Get existing slugs to determine insert vs update count
    const existingSlugs = new Set(
        (await getPages()).map(p => p.slug)
    );

    const insertCount = pages.filter(p => !existingSlugs.has(p.slug)).length;
    const updateCount = pages.filter(p => existingSlugs.has(p.slug)).length;

    const { error } = await supabase
        .from('cms_pages')
        .upsert(pages, {
            onConflict: 'slug',
            ignoreDuplicates: false
        });

    if (error) throw error;

    return { inserted: insertCount, updated: updateCount };
}

// ============================================================================
// CONTENT FUNCTIONS
// ============================================================================

export async function getContentByPage(pageId: string): Promise<CmsContent[]> {
    const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_id', pageId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}

export async function updateContent(
    contentId: string,
    language: Language,
    value: string
): Promise<void> {
    const columnName = `content_${language}`;
    const { error } = await supabase
        .from('cms_content')
        .update({ [columnName]: value })
        .eq('id', contentId);

    if (error) throw error;
}

export async function createContent(content: Partial<CmsContent>): Promise<CmsContent> {
    const { data, error } = await supabase
        .from('cms_content')
        .insert(content)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteContent(contentId: string): Promise<void> {
    const { error } = await supabase
        .from('cms_content')
        .delete()
        .eq('id', contentId);

    if (error) throw error;
}

// ============================================================================
// PACKAGES FUNCTIONS
// ============================================================================

export async function getPackages(): Promise<CmsPackage[]> {
    const { data, error } = await supabase
        .from('cms_packages')
        .select('*')
        .order('display_order');

    if (error) throw error;
    return data || [];
}

export async function updatePackage(
    packageId: string,
    updates: Partial<CmsPackage>
): Promise<void> {
    const { error } = await supabase
        .from('cms_packages')
        .update(updates)
        .eq('id', packageId);

    if (error) throw error;
}

export async function updatePackageHighlights(
    packageId: string,
    language: Language,
    highlights: string[]
): Promise<void> {
    const columnName = `highlights_${language}`;
    const { error } = await supabase
        .from('cms_packages')
        .update({ [columnName]: highlights })
        .eq('id', packageId);

    if (error) throw error;
}

export async function createPackage(pkg: Partial<CmsPackage>): Promise<CmsPackage> {
    const { data, error } = await supabase
        .from('cms_packages')
        .insert(pkg)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deletePackage(packageId: string): Promise<void> {
    const { error } = await supabase
        .from('cms_packages')
        .delete()
        .eq('id', packageId);

    if (error) throw error;
}

// ============================================================================
// MEDIA FUNCTIONS
// ============================================================================

export async function getMedia(folder?: string): Promise<CmsMedia[]> {
    let query = supabase
        .from('cms_media')
        .select('*')
        .order('created_at', { ascending: false });

    if (folder) {
        query = query.eq('folder', folder);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function uploadMedia(
    file: File,
    folder: string = 'general'
): Promise<CmsMedia> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

    // Create media record
    const { data, error } = await supabase
        .from('cms_media')
        .insert({
            filename: file.name,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            mime_type: file.type,
            size_bytes: file.size,
            folder,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteMedia(mediaId: string, storagePath: string): Promise<void> {
    // Delete from storage
    await supabase.storage.from('media').remove([storagePath]);

    // Delete record
    const { error } = await supabase
        .from('cms_media')
        .delete()
        .eq('id', mediaId);

    if (error) throw error;
}

// ============================================================================
// SECTION-BOUND MEDIA FUNCTIONS
// ============================================================================

/**
 * Get media for a specific page and section
 */
export async function getMediaBySection(pageId: string, sectionId?: string): Promise<CmsMedia[]> {
    let query = supabase
        .from('cms_media')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

    if (sectionId) {
        query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get all unassigned media (no page_id set)
 */
export async function getUnassignedMedia(): Promise<CmsMedia[]> {
    const { data, error } = await supabase
        .from('cms_media')
        .select('*')
        .is('page_id', null)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Upload media directly to a specific section
 */
export async function uploadMediaToSection(
    file: File,
    pageId: string,
    sectionId: string,
    folder: string = 'sections'
): Promise<CmsMedia> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${folder}/${pageId}/${sectionId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

    // Create media record with section binding
    const { data, error } = await supabase
        .from('cms_media')
        .insert({
            filename: file.name,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            mime_type: file.type,
            size_bytes: file.size,
            folder,
            page_id: pageId,
            section_id: sectionId,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Assign existing media to a section
 */
export async function assignMediaToSection(
    mediaId: string,
    pageId: string,
    sectionId: string
): Promise<void> {
    const { error } = await supabase
        .from('cms_media')
        .update({ page_id: pageId, section_id: sectionId })
        .eq('id', mediaId);

    if (error) throw error;
}

/**
 * Unassign media from a section (makes it available globally again)
 */
export async function unassignMedia(mediaId: string): Promise<void> {
    const { error } = await supabase
        .from('cms_media')
        .update({ page_id: null, section_id: null })
        .eq('id', mediaId);

    if (error) throw error;
}

// ============================================================================
// SETTINGS FUNCTIONS
// ============================================================================

export async function getSettings(): Promise<CmsSetting[]> {
    const { data, error } = await supabase
        .from('cms_settings')
        .select('*');

    if (error) throw error;
    return data || [];
}

export async function updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
        .from('cms_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

    if (error) throw error;
}

// ============================================================================
// DRAFT FUNCTIONS - Ticket 5
// ============================================================================
// Drafts are stored in cms_drafts table, NEVER in cms_content.
// Use content_id + language as primary key, or fallback to page_id + section + content_key + language.

/**
 * Get all drafts for a specific page and section
 */
export async function getDraftsForSection(
    pageId: string,
    section: string
): Promise<CmsDraft[]> {
    const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('page_id', pageId)
        .eq('section', section)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get a draft by content_id and language (for existing content)
 */
export async function getDraftByContentId(
    contentId: string,
    language: Language
): Promise<CmsDraft | null> {
    const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('content_id', contentId)
        .eq('language', language)
        .single();

    if (error) {
        // PGRST116 = no rows returned - not an error, just not found
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

/**
 * Upsert a draft - uses ON CONFLICT with unique indexes
 * @param draft - Draft data (without id and updated_at)
 */
export async function upsertDraft(draft: {
    page_id: string;
    section: string;
    content_id: string | null;
    content_key: string | null;
    language: Language;
    value: string;
    updated_by?: string | null;
}): Promise<CmsDraft> {
    // Determine which unique constraint to match
    if (draft.content_id) {
        // Existing content: upsert by content_id + language
        const { data: existing } = await supabase
            .from('cms_drafts')
            .select('id')
            .eq('content_id', draft.content_id)
            .eq('language', draft.language)
            .single();

        if (existing) {
            // Update existing draft
            const { data, error } = await supabase
                .from('cms_drafts')
                .update({
                    value: draft.value,
                    updated_at: new Date().toISOString(),
                    updated_by: draft.updated_by || null,
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new draft
            const { data, error } = await supabase
                .from('cms_drafts')
                .insert({
                    page_id: draft.page_id,
                    section: draft.section,
                    content_id: draft.content_id,
                    content_key: draft.content_key,
                    language: draft.language,
                    value: draft.value,
                    updated_by: draft.updated_by || null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } else {
        // New content: upsert by page_id + section + content_key + language
        const { data: existing } = await supabase
            .from('cms_drafts')
            .select('id')
            .eq('page_id', draft.page_id)
            .eq('section', draft.section)
            .eq('content_key', draft.content_key)
            .eq('language', draft.language)
            .is('content_id', null)
            .single();

        if (existing) {
            // Update existing draft
            const { data, error } = await supabase
                .from('cms_drafts')
                .update({
                    value: draft.value,
                    updated_at: new Date().toISOString(),
                    updated_by: draft.updated_by || null,
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new draft
            const { data, error } = await supabase
                .from('cms_drafts')
                .insert({
                    page_id: draft.page_id,
                    section: draft.section,
                    content_id: null,
                    content_key: draft.content_key,
                    language: draft.language,
                    value: draft.value,
                    updated_by: draft.updated_by || null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }
}

/**
 * Delete a specific draft by ID
 */
export async function deleteDraft(draftId: string): Promise<void> {
    const { error } = await supabase
        .from('cms_drafts')
        .delete()
        .eq('id', draftId);

    if (error) throw error;
}

/**
 * Delete all drafts for a page (typically after publishing)
 */
export async function deleteDraftsForPage(pageId: string): Promise<void> {
    const { error } = await supabase
        .from('cms_drafts')
        .delete()
        .eq('page_id', pageId);

    if (error) throw error;
}

/**
 * Delete drafts for a specific section (useful for section-level publish)
 */
export async function deleteDraftsForSection(
    pageId: string,
    section: string
): Promise<void> {
    const { error } = await supabase
        .from('cms_drafts')
        .delete()
        .eq('page_id', pageId)
        .eq('section', section);

    if (error) throw error;
}

// ============================================================================
// PUBLISH FUNCTIONS - Ticket 6
// ============================================================================
// Publish flow: drafts → cms_content, bump version, cleanup drafts

/**
 * Get all drafts for a page (all sections)
 */
export async function getDraftsForPage(pageId: string): Promise<CmsDraft[]> {
    const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('page_id', pageId)
        .order('section', { ascending: true })
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get CMS metadata (content version, etc.)
 */
export async function getCmsMeta(siteId: string = 'coldexperience'): Promise<CmsMeta | null> {
    const { data, error } = await supabase
        .from('cms_meta')
        .select('*')
        .eq('site_id', siteId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

/**
 * Bump content version and return the new version
 */
export async function bumpContentVersion(
    siteId: string = 'coldexperience',
    publishedBy?: string
): Promise<number> {
    // Get current version
    const current = await getCmsMeta(siteId);
    const newVersion = (current?.content_version ?? 0) + 1;

    const { error } = await supabase
        .from('cms_meta')
        .upsert({
            site_id: siteId,
            content_version: newVersion,
            last_published_at: new Date().toISOString(),
            last_published_by: publishedBy || null,
        }, { onConflict: 'site_id' });

    if (error) throw error;
    return newVersion;
}

/**
 * Write a draft value to cms_content (publish)
 * Updates the appropriate language column
 */
export async function upsertContentFromDraft(
    contentId: string | null,
    pageId: string,
    section: string,
    contentKey: string,
    language: Language,
    value: string
): Promise<void> {
    const columnName = `content_${language}`;

    if (contentId) {
        // Existing content - just update the language column
        const { error } = await supabase
            .from('cms_content')
            .update({ [columnName]: value })
            .eq('id', contentId);

        if (error) throw error;
    } else {
        // New content - need to upsert by page_id + content_key
        // First check if exists
        const { data: existing } = await supabase
            .from('cms_content')
            .select('id')
            .eq('page_id', pageId)
            .eq('content_key', contentKey)
            .single();

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('cms_content')
                .update({ [columnName]: value })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new - need section info
            const { error } = await supabase
                .from('cms_content')
                .insert({
                    page_id: pageId,
                    content_key: contentKey,
                    section: section,
                    content_type: 'text',
                    [columnName]: value,
                    display_order: 999, // Will be at end, can be reordered later
                });

            if (error) throw error;
        }
    }
}

/**
 * Get content by content_id to retrieve canonical content_key
 */
export async function getContentById(contentId: string): Promise<CmsContent | null> {
    const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('id', contentId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

// ============================================================================
// SCHEMA COVERAGE FUNCTIONS - Ticket 8
// ============================================================================

/**
 * Get all distinct content_key values from cms_content table
 * Used by Schema Coverage dashboard to determine DB keys
 */
export async function getDistinctContentKeys(): Promise<string[]> {
    const { data, error } = await supabase
        .from('cms_content')
        .select('content_key');

    if (error) throw error;
    const keys = new Set(data?.map(r => r.content_key) || []);
    return Array.from(keys).sort();
}


