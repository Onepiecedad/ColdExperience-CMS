// ============================================================================
// SUPABASE CLIENT
// ============================================================================
// Configure with your Supabase project credentials
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { CmsPage, CmsContent, CmsPackage, CmsMedia, CmsSetting, Language } from '../types';

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

// Allowed emails for Google OAuth
const ALLOWED_EMAILS = ['joakim@skylandai.se'];

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

// ============================================================================
// CONTENT FUNCTIONS
// ============================================================================

export async function getContentByPage(pageSlug: string): Promise<CmsContent[]> {
    const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_slug', pageSlug)
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
