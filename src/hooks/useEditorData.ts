// ═══════════════════════════════════════════════════════════════════════════
// USE EDITOR DATA - Hook for fetching content + media for EditorScreen
// Handles loading, error, and empty states for the mobile-first editor
//
// Uses getDataPageId() to resolve the actual DB page slug when sections
// have been regrouped under different parent pages in the CMS navigation.
// Example: "Hero" section lives under CMS page "home" but DB page "hero".
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import type { CmsPage, CmsContent, CmsMedia } from '../types';
import {
    getPageBySlug,
    getContentByPageAndSection,
    getMediaBySection
} from '../services/supabase';
import { getDataPageId, getSubsectionById } from '../content/contentMap';
import { logInfo, logSuccess, logWarn, logError } from '../services/debugLog';

export interface EditorDataState {
    // Data
    page: CmsPage | null;
    content: CmsContent[];
    media: CmsMedia[];

    // State flags
    isLoading: boolean;
    error: string | null;
    pageNotFound: boolean;

    // Metadata (for Dev Inspector)
    fetchedAt: Date | null;

    // Actions
    refetch: () => void;
}

export function useEditorData(
    pageSlug: string | undefined,
    sectionId: string | undefined,
    subsectionId?: string
): EditorDataState {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [content, setContent] = useState<CmsContent[]>([]);
    const [media, setMedia] = useState<CmsMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNotFound, setPageNotFound] = useState(false);
    const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        // Guard: need both pageSlug and sectionId
        if (!pageSlug || !sectionId) {
            setIsLoading(false);
            setError('Missing page or section identifier');
            return;
        }

        setIsLoading(true);
        setError(null);
        setPageNotFound(false);

        // Resolve the actual DB page slug for this section
        // (e.g. CMS page "home" + section "hero" → DB slug "hero")
        // Subsections can override with their own dataPageId/dataSectionKey
        const subsectionConfig = pageSlug && sectionId && subsectionId
            ? getSubsectionById(pageSlug, sectionId, subsectionId)
            : undefined;

        const dbPageSlug = subsectionConfig?.dataPageId || getDataPageId(pageSlug, sectionId);
        const dbSectionKey = subsectionConfig?.dataSectionKey || sectionId;

        logInfo('EditorData', `Fetching: ${pageSlug}/${sectionId}${subsectionId ? `/${subsectionId}` : ''} (DB: ${dbPageSlug}/${dbSectionKey})`);

        try {
            // Step 1: Get page by its DB slug
            const foundPage = await getPageBySlug(dbPageSlug);

            if (!foundPage) {
                // Fallback: try the CMS page slug directly (for pages without dataPageId)
                const fallbackPage = dbPageSlug !== pageSlug ? await getPageBySlug(pageSlug) : null;
                if (fallbackPage) {
                    logInfo('EditorData', `Fallback to CMS slug: ${pageSlug}`);
                    setPage(fallbackPage);

                    const mediaSectionId = subsectionId ? `${sectionId}-${subsectionId}` : sectionId;
                    const [contentData, mediaData] = await Promise.all([
                        getContentByPageAndSection(fallbackPage.slug, dbSectionKey),
                        getMediaBySection(fallbackPage.slug, mediaSectionId)
                    ]);

                    setContent(contentData);
                    setMedia(mediaData);
                    setFetchedAt(new Date());

                    logSuccess('EditorData', `Loaded ${contentData.length} content, ${mediaData.length} media (fallback)`, {
                        pageId: fallbackPage.id,
                        section: dbSectionKey,
                    });
                    return;
                }

                logWarn('EditorData', `Page not found: ${dbPageSlug}`);
                setPageNotFound(true);
                setPage(null);
                setContent([]);
                setMedia([]);
                setIsLoading(false);
                setFetchedAt(new Date());
                return;
            }

            setPage(foundPage);

            // Step 2: Fetch content and media in parallel
            // Content uses the subsection's DB override (e.g. detailPages/pages)
            // Media uses the parent section's page (e.g. experiences) since media is stored there
            const mediaSectionId = subsectionId ? `${sectionId}-${subsectionId}` : sectionId;
            const mediaPageSlug = subsectionConfig?.dataPageId
                ? getDataPageId(pageSlug, sectionId) // Use parent section's page for media
                : foundPage.slug;
            const [contentData, mediaData] = await Promise.all([
                getContentByPageAndSection(foundPage.slug, dbSectionKey),
                getMediaBySection(mediaPageSlug, mediaSectionId)
            ]);

            setContent(contentData);
            setMedia(mediaData);
            setFetchedAt(new Date());

            logSuccess('EditorData', `Loaded ${contentData.length} content, ${mediaData.length} media`, {
                pageId: foundPage.id,
                section: sectionId,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load content';
            logError('EditorData', `Error: ${message}`, { pageSlug, sectionId });
            console.error('Error fetching editor data:', err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [pageSlug, sectionId, subsectionId]);

    // Initial fetch and refetch on params change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        page,
        content,
        media,
        isLoading,
        error,
        pageNotFound,
        fetchedAt,
        refetch: fetchData,
    };
}

export default useEditorData;
