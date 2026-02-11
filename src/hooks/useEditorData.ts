// ═══════════════════════════════════════════════════════════════════════════
// USE EDITOR DATA - Hook for fetching content + media for EditorScreen
// Handles loading, error, and empty states for the mobile-first editor
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import type { CmsPage, CmsContent, CmsMedia } from '../types';
import {
    getPageBySlug,
    getContentByPageAndSection,
    getMediaBySection
} from '../services/supabase';
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

        logInfo('EditorData', `Fetching: ${pageSlug}/${sectionId}`);

        try {
            // Step 1: Get page by slug
            const foundPage = await getPageBySlug(pageSlug);

            if (!foundPage) {
                logWarn('EditorData', `Page not found: ${pageSlug}`);
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
            const [contentData, mediaData] = await Promise.all([
                getContentByPageAndSection(foundPage.slug, sectionId),
                getMediaBySection(foundPage.id, sectionId)
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
