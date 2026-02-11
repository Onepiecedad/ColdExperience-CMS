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
import { getDataPageId } from '../content/contentMap';
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
    sectionId: string | undefined
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
        const dbPageSlug = getDataPageId(pageSlug, sectionId);

        logInfo('EditorData', `Fetching: ${pageSlug}/${sectionId} (DB: ${dbPageSlug})`);

        try {
            // Step 1: Get page by its DB slug
            const foundPage = await getPageBySlug(dbPageSlug);

            if (!foundPage) {
                // Fallback: try the CMS page slug directly (for pages without dataPageId)
                const fallbackPage = dbPageSlug !== pageSlug ? await getPageBySlug(pageSlug) : null;
                if (fallbackPage) {
                    logInfo('EditorData', `Fallback to CMS slug: ${pageSlug}`);
                    setPage(fallbackPage);

                    const [contentData, mediaData] = await Promise.all([
                        getContentByPageAndSection(fallbackPage.slug, sectionId),
                        getMediaBySection(fallbackPage.slug, sectionId)
                    ]);

                    setContent(contentData);
                    setMedia(mediaData);
                    setFetchedAt(new Date());

                    logSuccess('EditorData', `Loaded ${contentData.length} content, ${mediaData.length} media (fallback)`, {
                        pageId: fallbackPage.id,
                        section: sectionId,
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
            // Both use the resolved DB slug for correct data retrieval
            const [contentData, mediaData] = await Promise.all([
                getContentByPageAndSection(foundPage.slug, sectionId),
                getMediaBySection(foundPage.slug, sectionId)
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
    }, [pageSlug, sectionId]);

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
