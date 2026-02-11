// ============================================================================
// TYPES - Cold Experience CMS Dashboard
// ============================================================================

export enum Tab {
    CONTENT = 'CONTENT',
    PACKAGES = 'PACKAGES',
    MEDIA = 'MEDIA',
    SETTINGS = 'SETTINGS'
}

export type Language = 'en' | 'sv' | 'de' | 'pl';

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

// ============================================================================
// DATABASE TYPES - Matches supabase-schema.sql exactly
// ============================================================================

export interface CmsPage {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    display_order: number;
    sections: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CmsContent {
    id: string;
    page_id: string;
    section: string;
    content_key: string;
    content_type: 'text' | 'richtext' | 'html' | 'array' | 'textarea' | 'url';
    content_en: string | null;
    content_sv: string | null;
    content_de: string | null;
    content_pl: string | null;
    field_label: string | null;
    field_hint: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CmsPackage {
    id: string;
    package_key: string;
    price_sek: number;
    price_eur: number | null;
    image_url: string | null;
    gradient?: string;
    theme?: string;
    featured: boolean;
    active: boolean;
    display_order: number;
    name_en: string | null;
    name_sv: string | null;
    name_de: string | null;
    name_pl: string | null;
    duration_en: string | null;
    duration_sv: string | null;
    duration_de: string | null;
    duration_pl: string | null;
    description_en: string | null;
    description_sv: string | null;
    description_de: string | null;
    description_pl: string | null;
    highlights_en: string[];
    highlights_sv: string[];
    highlights_de: string[];
    highlights_pl: string[];
    created_at: string;
    updated_at: string;
    // Aliases used in some components
    is_featured?: boolean;
    is_active?: boolean;
}

export interface CmsMedia {
    id: string;
    filename: string;
    storage_path: string;
    public_url: string;
    mime_type: string | null;
    size_bytes: number | null;
    width?: number | null;
    height?: number | null;
    alt_text_en: string | null;
    alt_text_sv: string | null;
    alt_text_de: string | null;
    alt_text_pl: string | null;
    folder: string;
    tags: string[];
    uploaded_by: string | null;
    created_at: string;
    // Section-bound media fields
    page_id: string | null;
    section_id: string | null;
}

export interface CmsSetting {
    id: string;
    setting_key: string;
    setting_value: string | null;
    setting_type: string;
    description: string | null;
    updated_at: string;
}

// Draft content - stored in cms_drafts table, never in cms_content
export interface CmsDraft {
    id: string;
    page_id: string;
    section: string;
    content_id: string | null;  // Reference to cms_content.id if editing existing
    content_key: string | null; // Fallback key when content_id is null
    language: Language;
    value: string;
    updated_at: string;
    updated_by: string | null;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
}

export interface EditorState {
    isDirty: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
}

// CMS metadata - content version tracking (Ticket 6)
export interface CmsMeta {
    site_id: string;
    content_version: number;
    last_published_at: string | null;
    last_published_by: string | null;
}

