import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logInfo } from '../services/debugLog';

// Import static content data as fallback
import cmsContentData from '../../cms-content-data.json';

// Types for the comprehensive structure
export type Language = 'en' | 'sv' | 'de' | 'pl';

export interface MultilingualValue {
    en?: string | string[];
    sv?: string | string[];
    de?: string | string[];
    pl?: string | string[];
}

export interface ContentField {
    [key: string]: MultilingualValue;
}

export interface SectionContent {
    [sectionName: string]: ContentField;
}

export interface PageContent {
    [pageName: string]: SectionContent;
}

export interface Package {
    key: string;
    priceSEK: number;
    priceEUR: number;
    featured: boolean;
    displayOrder: number;
    name: MultilingualValue;
    duration: MultilingualValue;
    description: MultilingualValue;
    highlights: MultilingualValue;
    includesDetailed?: MultilingualValue;
}

export interface CmsPage {
    slug: string;
    name: string;
    description: string;
    icon: string;
    display_order: number;
    sections: string[];
}

export interface CmsSettings {
    site_name: string;
    default_language: string;
    available_languages: string[];
    contact_email: string;
    contact_phone: string;
    season_start: string;
    season_end: string;
    location: string;
    currency_primary: string;
    currency_secondary: string;
}

export interface CmsData {
    meta: {
        generated_at: string;
        source: string;
        languages: string[];
        version: string;
        total_fields: number;
    };
    pages: CmsPage[];
    content: PageContent;
    packages: Package[];
    settings: CmsSettings;
}

type SerializedArrayValue = string | unknown[];

interface CmsContentState {
    data: CmsData;
    loading: boolean;
    error: Error | null;
    hasChanges: boolean;
    pendingChanges: Map<string, { page: string; section: string; field: string; language: Language; value: string }>;
    pageIdMap: Map<string, string>; // Map page slug to page UUID
}

// Database record types - matches ACTUAL Supabase schema (supabase-schema.sql)
interface DbContent {
    id?: string;
    page_slug: string;       // TEXT reference to cms_pages.slug
    section_key: string;     // Section name within the page
    field_key: string;       // Format: "section.fieldKey"
    field_type?: string;     // 'text', 'textarea', 'array', 'url'
    content_en?: string;
    content_sv?: string;
    content_de?: string;
    content_pl?: string;
    field_label?: string;
    field_hint?: string;
    display_order?: number;
}

// DbPage interface - structure of cms_pages table
// Note: Using inline type in loadPageIds() instead to avoid unused variable warning

export function useCmsContent() {
    const [state, setState] = useState<CmsContentState>({
        data: cmsContentData as unknown as CmsData,
        loading: false,
        error: null,
        hasChanges: false,
        pendingChanges: new Map(),
        pageIdMap: new Map(),
    });

    // Refs to track latest values for saveChanges (avoids stale closure issue)
    const pendingChangesRef = useRef(state.pendingChanges);
    const dataRef = useRef(state.data);
    const pageIdMapRef = useRef(state.pageIdMap);

    // Keep refs in sync with state
    useEffect(() => {
        pendingChangesRef.current = state.pendingChanges;
        dataRef.current = state.data;
        pageIdMapRef.current = state.pageIdMap;
    }, [state.pendingChanges, state.data, state.pageIdMap]);

    /**
     * Load page slug set from Supabase (validates which pages exist)
     */
    const loadPageIds = useCallback(async (): Promise<Map<string, string>> => {
        const pageIdMap = new Map<string, string>();

        try {
            const { data: pages, error } = await supabase
                .from('cms_pages')
                .select('id, slug');

            if (error) {
                console.warn('Could not load page IDs:', error.message);
                return pageIdMap;
            }

            pages?.forEach((page: { id: string; slug: string }) => {
                pageIdMap.set(page.slug, page.slug); // Map slug -> slug for consistency
            });

            logInfo('useCmsContent', 'Loaded page mappings', { count: pageIdMap.size });
        } catch (error) {
            console.warn('Failed to load page IDs:', error);
        }

        return pageIdMap;
    }, []);

    /**
     * Load all content from Supabase database
     */
    const loadFromSupabase = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            // First load page ID mappings
            const pageIdMap = await loadPageIds();

            // Load content from database
            const { data: dbContent, error: contentError } = await supabase
                .from('cms_content')
                .select('*')
                .order('display_order');

            if (contentError) {
                console.warn('Could not load from Supabase, using local data:', contentError.message);
                setState(prev => ({ ...prev, loading: false, pageIdMap }));
                return;
            }

            // If we have database content, merge it with local data
            if (dbContent && dbContent.length > 0) {
                logInfo('useCmsContent', 'Loaded content items from Supabase', { count: dbContent.length });

                const newData = JSON.parse(JSON.stringify(dataRef.current));

                dbContent.forEach((item: DbContent) => {
                    const { page_slug, section_key, field_key, content_en, content_sv, content_de, content_pl } = item;

                    // Use page_slug directly (no UUID mapping needed)
                    const pageSlug = page_slug;
                    if (!pageSlug) return;

                    // Extract field key from field_key (format: "section.fieldKey")
                    const fieldKey = field_key.includes('.')
                        ? field_key.split('.').slice(1).join('.')
                        : field_key;
                    const sectionKey = section_key || (field_key.includes('.') ? field_key.split('.')[0] : 'default');

                    if (!newData.content[pageSlug]) {
                        newData.content[pageSlug] = {};
                    }
                    if (!newData.content[pageSlug][sectionKey]) {
                        newData.content[pageSlug][sectionKey] = {};
                    }

                    // Helper to parse JSON arrays back from stored strings
                    const parseValue = (val: string | undefined): SerializedArrayValue => {
                        if (!val) return '';
                        // Check if it's a JSON array (starts with [ and ends with ])
                        const trimmed = val.trim();
                        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                            try {
                                const parsed = JSON.parse(trimmed);
                                if (Array.isArray(parsed)) return parsed;
                            } catch {
                                // Not valid JSON, return as string
                            }
                        }
                        return val;
                    };

                    newData.content[pageSlug][sectionKey][fieldKey] = {
                        en: parseValue(content_en),
                        sv: parseValue(content_sv),
                        de: parseValue(content_de),
                        pl: parseValue(content_pl),
                    };
                });

                setState(prev => ({
                    ...prev,
                    data: newData,
                    loading: false,
                    pageIdMap,
                }));
            } else {
                logInfo('useCmsContent', 'No database content found, using local JSON data');
                setState(prev => ({ ...prev, loading: false, pageIdMap }));
            }

            // Also load packages
            const { data: dbPackages } = await supabase
                .from('cms_packages')
                .select('*')
                .order('display_order');

            if (dbPackages && dbPackages.length > 0) {
                logInfo('useCmsContent', 'Loaded packages from Supabase', { count: dbPackages.length });
                const mappedPackages: Package[] = dbPackages.map((p: {
                    package_key: string;
                    price_sek: number;
                    price_eur: number | null;
                    is_featured: boolean;
                    display_order: number;
                    name_en: string | null; name_sv: string | null; name_de: string | null; name_pl: string | null;
                    duration_en: string | null; duration_sv: string | null; duration_de: string | null; duration_pl: string | null;
                    description_en: string | null; description_sv: string | null; description_de: string | null; description_pl: string | null;
                    highlights_en: string[] | null; highlights_sv: string[] | null; highlights_de: string[] | null; highlights_pl: string[] | null;
                }) => ({
                    key: p.package_key,
                    priceSEK: p.price_sek,
                    priceEUR: p.price_eur ?? 0,
                    featured: p.is_featured,
                    displayOrder: p.display_order,
                    name: { en: p.name_en ?? '', sv: p.name_sv ?? '', de: p.name_de ?? '', pl: p.name_pl ?? '' },
                    duration: { en: p.duration_en ?? '', sv: p.duration_sv ?? '', de: p.duration_de ?? '', pl: p.duration_pl ?? '' },
                    description: { en: p.description_en ?? '', sv: p.description_sv ?? '', de: p.description_de ?? '', pl: p.description_pl ?? '' },
                    highlights: { en: p.highlights_en ?? [], sv: p.highlights_sv ?? [], de: p.highlights_de ?? [], pl: p.highlights_pl ?? [] },
                }));
                setState(prev => ({
                    ...prev,
                    data: { ...prev.data, packages: mappedPackages },
                }));
            }

        } catch (error) {
            console.error('Error loading from Supabase:', error);
            setState(prev => ({ ...prev, loading: false, error: error as Error }));
        }
    }, [loadPageIds]);

    // Load content from Supabase on mount
    useEffect(() => {
        void loadFromSupabase();
    }, [loadFromSupabase]);

    /**
     * Get a content value from the nested structure
     */
    const getContentValue = useCallback((
        page: string,
        section: string,
        field: string,
        language: Language
    ): string => {
        const pageContent = state.data.content[page];
        if (!pageContent) return '';

        const sectionContent = pageContent[section];
        if (!sectionContent) return '';

        const fieldData = sectionContent[field];
        if (!fieldData) return '';

        const value = fieldData[language] || fieldData.en;
        if (Array.isArray(value)) return value.join('\n');
        return value || '';
    }, [state.data]);

    /**
     * Get all fields for a specific page and section
     */
    const getSectionFields = useCallback((
        page: string,
        section: string
    ): ContentField | undefined => {
        const pageContent = state.data.content[page];
        if (!pageContent) return undefined;
        return pageContent[section];
    }, [state.data]);

    /**
     * Get all content for a page (all sections)
     */
    const getPageContent = useCallback((page: string): SectionContent | undefined => {
        return state.data.content[page];
    }, [state.data]);

    /**
     * Get packages
     */
    const getPackages = useCallback(() => {
        return state.data.packages;
    }, [state.data]);

    /**
     * Get a specific package by key
     */
    const getPackage = useCallback((key: string) => {
        return state.data.packages.find(p => p.key === key);
    }, [state.data]);

    /**
     * Update content value (local state + queue for save)
     */
    const updateContent = useCallback((
        page: string,
        section: string,
        field: string,
        language: Language,
        value: string
    ) => {
        setState(prev => {
            const newData = JSON.parse(JSON.stringify(prev.data));

            // Ensure nested structure exists
            if (!newData.content[page]) {
                newData.content[page] = {};
            }
            if (!newData.content[page][section]) {
                newData.content[page][section] = {};
            }
            if (!newData.content[page][section][field]) {
                newData.content[page][section][field] = {};
            }

            newData.content[page][section][field][language] = value;

            // Track pending changes
            const changeKey = `${page}:${section}:${field}:${language}`;
            const newPendingChanges = new Map(prev.pendingChanges);
            newPendingChanges.set(changeKey, { page, section, field, language, value });

            return {
                ...prev,
                data: newData,
                hasChanges: true,
                pendingChanges: newPendingChanges,
            };
        });
    }, []);

    /**
     * Update package
     */
    const updatePackage = useCallback((
        packageKey: string,
        field: string,
        value: unknown
    ) => {
        setState(prev => {
            const newData = JSON.parse(JSON.stringify(prev.data));
            const packageIndex = newData.packages.findIndex((p: Package) => p.key === packageKey);

            if (packageIndex !== -1) {
                (newData.packages[packageIndex] as Record<string, unknown>)[field] = value;
            }

            return {
                ...prev,
                data: newData,
                hasChanges: true,
            };
        });
    }, []);

    /**
     * Save all pending changes to Supabase
     */
    const saveChanges = useCallback(async () => {
        logInfo('useCmsContent', 'Saving changes to Supabase');

        setState(prev => ({ ...prev, loading: true }));

        try {
            // Use refs to get the latest values (avoids stale closure issue)
            const pendingChanges = pendingChangesRef.current;
            const data = dataRef.current;
            const pageIdMap = pageIdMapRef.current;

            const changes = Array.from(pendingChanges.values());

            if (changes.length === 0) {
                logInfo('useCmsContent', 'No changes to save');
                setState(prev => ({ ...prev, loading: false, hasChanges: false }));
                return true;
            }

            logInfo('useCmsContent', 'Saving content changes', { count: changes.length });

            // Group changes by unique content item
            const contentUpdates = new Map<string, DbContent>();

            for (const change of changes) {
                const key = `${change.page}:${change.section}:${change.field}`;
                const pageSlug = pageIdMap.get(change.page);

                if (!pageSlug) {
                    console.warn(`No page mapping for ${change.page}, skipping`);
                    continue;
                }

                if (!contentUpdates.has(key)) {
                    // Get existing values from data ref
                    const existing = data.content[change.page]?.[change.section]?.[change.field] || {};

                    contentUpdates.set(key, {
                        page_slug: pageSlug,
                        section_key: change.section,
                        field_key: `${change.section}.${change.field}`,
                        content_en: typeof existing.en === 'string' ? existing.en : '',
                        content_sv: typeof existing.sv === 'string' ? existing.sv : '',
                        content_de: typeof existing.de === 'string' ? existing.de : '',
                        content_pl: typeof existing.pl === 'string' ? existing.pl : '',
                    });
                }

                const update = contentUpdates.get(key)!;
                if (change.language === 'en') update.content_en = change.value;
                else if (change.language === 'sv') update.content_sv = change.value;
                else if (change.language === 'de') update.content_de = change.value;
                else if (change.language === 'pl') update.content_pl = change.value;
            }

            // Upsert all content changes
            const upsertData = Array.from(contentUpdates.values());

            // For each update, do an individual upsert (since we need to find existing by content_key)
            for (const item of upsertData) {
                // Check if exists
                const { data: existing } = await supabase
                    .from('cms_content')
                    .select('id')
                    .eq('page_slug', item.page_slug)
                    .eq('field_key', item.field_key)
                    .single();

                if (existing) {
                    // Update
                    const { error } = await supabase
                        .from('cms_content')
                        .update({
                            content_en: item.content_en,
                            content_sv: item.content_sv,
                            content_de: item.content_de,
                            content_pl: item.content_pl,
                        })
                        .eq('id', existing.id);

                    if (error) {
                        console.warn(`Update failed for ${item.field_key}:`, error.message);
                    }
                } else {
                    // Insert
                    const { error } = await supabase
                        .from('cms_content')
                        .insert(item);

                    if (error) {
                        console.warn(`Insert failed for ${item.field_key}:`, error.message);
                    }
                }
            }

            logInfo('useCmsContent', 'Successfully saved content items to Supabase', { count: upsertData.length });

            setState(prev => ({
                ...prev,
                loading: false,
                hasChanges: false,
                pendingChanges: new Map(),
            }));

            return true;

        } catch (error) {
            console.error('❌ Error saving to Supabase:', error);
            setState(prev => ({ ...prev, loading: false, error: error as Error }));
            return false;
        }
    }, []); // No dependencies needed - we use refs for latest values

    /**
     * Get settings
     */
    const getSettings = useCallback(() => {
        return state.data.settings;
    }, [state.data]);

    /**
     * Get available languages
     */
    const getLanguages = useCallback((): Language[] => {
        return (state.data.settings.available_languages || ['en', 'sv', 'de', 'pl']) as Language[];
    }, [state.data]);

    /**
     * Sync all local JSON data to Supabase (for initial population)
     */
    const syncToSupabase = useCallback(async () => {
        logInfo('useCmsContent', 'Syncing all local content to Supabase');

        setState(prev => ({ ...prev, loading: true }));

        try {
            // First ensure we have page IDs
            let pageIdMap = state.pageIdMap;
            if (pageIdMap.size === 0) {
                pageIdMap = await loadPageIds();
            }

            if (pageIdMap.size === 0) {
                throw new Error('No pages found in database. Please run the schema SQL first.');
            }

            const content = state.data.content;
            const upsertData: DbContent[] = [];
            let displayOrder = 0;

            // Flatten content structure to database records
            for (const pageSlug of Object.keys(content)) {
                const pageContent = content[pageSlug];
                const pageId = pageIdMap.get(pageSlug);

                if (!pageId) {
                    logInfo('useCmsContent', 'Skipping page without mapping during sync', { pageSlug });
                    continue;
                }

                for (const section of Object.keys(pageContent)) {
                    const sectionContent = pageContent[section];
                    for (const field of Object.keys(sectionContent)) {
                        const fieldData = sectionContent[field];

                        upsertData.push({
                            page_slug: pageSlug,
                            section_key: section,
                            field_key: `${section}.${field}`,
                            field_type: Array.isArray(fieldData.en) ? 'array' : 'text',
                            // Serialize arrays as JSON to preserve object structure
                            content_en: typeof fieldData.en === 'string' ? fieldData.en :
                                Array.isArray(fieldData.en) ? JSON.stringify(fieldData.en) : '',
                            content_sv: typeof fieldData.sv === 'string' ? fieldData.sv :
                                Array.isArray(fieldData.sv) ? JSON.stringify(fieldData.sv) : '',
                            content_de: typeof fieldData.de === 'string' ? fieldData.de :
                                Array.isArray(fieldData.de) ? JSON.stringify(fieldData.de) : '',
                            content_pl: typeof fieldData.pl === 'string' ? fieldData.pl :
                                Array.isArray(fieldData.pl) ? JSON.stringify(fieldData.pl) : '',
                            field_label: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
                            display_order: displayOrder++,
                        });
                    }
                }
            }

            logInfo('useCmsContent', 'Syncing content items to Supabase', { count: upsertData.length });

            // First, clear existing content for the pages we're syncing
            for (const pageSlug of Object.keys(content)) {
                await supabase
                    .from('cms_content')
                    .delete()
                    .eq('page_slug', pageSlug);
            }

            // Insert in batches of 50
            const BATCH_SIZE = 50;
            let successCount = 0;

            for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
                const batch = upsertData.slice(i, i + BATCH_SIZE);

                const { error } = await supabase
                    .from('cms_content')
                    .insert(batch);

                if (error) {
                    console.warn(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
                    // Try individual inserts
                    for (const item of batch) {
                        const { error: itemError } = await supabase
                            .from('cms_content')
                            .insert(item);
                        if (!itemError) successCount++;
                    }
                } else {
                    successCount += batch.length;
                    logInfo('useCmsContent', 'Synced content batch', {
                        batch: Math.floor(i / BATCH_SIZE) + 1,
                        count: batch.length,
                    });
                }
            }

            logInfo('useCmsContent', 'Content synced to Supabase', {
                successCount,
                totalCount: upsertData.length,
            });
            setState(prev => ({ ...prev, loading: false }));
            return true;

        } catch (error) {
            console.error('❌ Sync error:', error);
            setState(prev => ({ ...prev, loading: false, error: error as Error }));
            return false;
        }
    }, [loadPageIds, state.data, state.pageIdMap]);

    /**
     * Force resync from the ORIGINAL local JSON file (not state.data which may be corrupted)
     * This bypasses any corrupted data that may have been loaded from Supabase
     */
    const forceResyncFromLocalJson = useCallback(async () => {
        logInfo('useCmsContent', 'Force resync using original local JSON file');

        setState(prev => ({ ...prev, loading: true }));

        try {
            // Use the ORIGINAL imported data, not state.data
            const originalContent = (cmsContentData as unknown as CmsData).content;

            // Ensure we have page IDs
            let pageIdMap = pageIdMapRef.current;
            if (pageIdMap.size === 0) {
                pageIdMap = await loadPageIds();
            }

            if (pageIdMap.size === 0) {
                throw new Error('No pages found in database. Please run the schema SQL first.');
            }

            interface DbContentRecord {
                page_slug: string;
                section_key: string;
                field_key: string;
                field_type: string;
                content_en: string;
                content_sv: string;
                content_de: string;
                content_pl: string;
                field_label: string;
                display_order: number;
            }

            const upsertData: DbContentRecord[] = [];
            let displayOrder = 0;
            let arrayFieldCount = 0;

            // Flatten content structure to database records
            for (const pageSlug of Object.keys(originalContent)) {
                const pageContent = originalContent[pageSlug];
                const pageId = pageIdMap.get(pageSlug);

                if (!pageId) {
                    logInfo('useCmsContent', 'Skipping page without mapping during force resync', { pageSlug });
                    continue;
                }

                for (const section of Object.keys(pageContent)) {
                    const sectionContent = pageContent[section];
                    for (const field of Object.keys(sectionContent)) {
                        const fieldData = sectionContent[field];

                        const isArray = Array.isArray(fieldData.en) ||
                            Array.isArray(fieldData.sv) ||
                            Array.isArray(fieldData.de) ||
                            Array.isArray(fieldData.pl);

                        if (isArray) {
                            arrayFieldCount++;
                            logInfo('useCmsContent', 'Found array field during force resync', {
                                pageSlug,
                                section,
                                field,
                            });
                        }

                        // Serialize arrays as JSON to preserve object structure
                        const serializeValue = (val: unknown): string => {
                            if (typeof val === 'string') return val;
                            if (Array.isArray(val)) return JSON.stringify(val);
                            if (val === null || val === undefined) return '';
                            return String(val);
                        };

                        upsertData.push({
                            page_slug: pageSlug,
                            section_key: section,
                            field_key: `${section}.${field}`,
                            field_type: isArray ? 'array' : 'text',
                            content_en: serializeValue(fieldData.en),
                            content_sv: serializeValue(fieldData.sv),
                            content_de: serializeValue(fieldData.de),
                            content_pl: serializeValue(fieldData.pl),
                            field_label: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
                            display_order: displayOrder++,
                        });
                    }
                }
            }

            logInfo('useCmsContent', 'Prepared content items for force resync', {
                totalCount: upsertData.length,
                arrayFieldCount,
            });

            // First, clear existing content for the pages we're syncing
            logInfo('useCmsContent', 'Clearing existing content before force resync');
            for (const pageSlug of Object.keys(originalContent)) {
                await supabase
                    .from('cms_content')
                    .delete()
                    .eq('page_slug', pageSlug);
            }

            // Insert in batches of 50
            logInfo('useCmsContent', 'Inserting clean data during force resync');
            const BATCH_SIZE = 50;
            let successCount = 0;

            for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
                const batch = upsertData.slice(i, i + BATCH_SIZE);

                const { error } = await supabase
                    .from('cms_content')
                    .insert(batch);

                if (error) {
                    console.warn(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
                    // Try individual inserts
                    for (const item of batch) {
                        const { error: itemError } = await supabase
                            .from('cms_content')
                            .insert(item);
                        if (!itemError) successCount++;
                    }
                } else {
                    successCount += batch.length;
                    logInfo('useCmsContent', 'Inserted force-resync batch', {
                        batch: Math.floor(i / BATCH_SIZE) + 1,
                        count: batch.length,
                    });
                }
            }

            logInfo('useCmsContent', 'Force resync completed', {
                successCount,
                totalCount: upsertData.length,
            });

            // Reload state from Supabase to get the fresh data
            await loadFromSupabase();

            setState(prev => ({ ...prev, loading: false }));
            return true;

        } catch (error) {
            console.error('❌ Force resync error:', error);
            setState(prev => ({ ...prev, loading: false, error: error as Error }));
            return false;
        }
    }, [loadFromSupabase, loadPageIds]);

    return {
        // Raw data access
        data: state.data,
        content: state.data.content,
        packages: state.data.packages,
        settings: state.data.settings,
        pages: state.data.pages,
        meta: state.data.meta,

        // State
        loading: state.loading,
        error: state.error,
        hasChanges: state.hasChanges,
        pendingChangesCount: state.pendingChanges.size,

        // Getters
        getContentValue,
        getSectionFields,
        getPageContent,
        getPackages,
        getPackage,
        getSettings,
        getLanguages,

        // Setters
        updateContent,
        updatePackage,
        saveChanges,

        // Supabase operations
        loadFromSupabase,
        syncToSupabase,
        forceResyncFromLocalJson,
    };
}
