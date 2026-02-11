// ═══════════════════════════════════════════════════════════════════════════
// USE STRUCTURE SYNC - Hook for syncing contentMap to cms_pages
// Computes missing pages and handles sync with localStorage persistence
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { getPages, upsertPages, type PageUpsert } from '../services/supabase';
import { WEBSITE_PAGES } from '../content/contentMap';
import { logInfo, logSuccess, logError } from '../services/debugLog';

const LAST_SYNC_KEY = 'coldexperience:last_structure_sync_at';

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'success' | 'error';

export interface StructureSyncState {
    // Counts
    mapPagesCount: number;
    dbPagesCount: number;
    missingCount: number;
    missingSlugs: string[];

    // Status
    status: SyncStatus;
    error: string | null;

    // Timestamp
    lastSyncedAt: string | null;

    // Actions
    syncStructure: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useStructureSync(): StructureSyncState {
    const [dbPagesCount, setDbPagesCount] = useState(0);
    const [missingSlugs, setMissingSlugs] = useState<string[]>([]);
    const [status, setStatus] = useState<SyncStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

    const mapPagesCount = WEBSITE_PAGES.length;

    // Load last synced timestamp from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(LAST_SYNC_KEY);
        setLastSyncedAt(stored);
    }, []);

    // Fetch DB pages and compute diff
    const refresh = useCallback(async () => {
        setStatus('loading');
        setError(null);

        try {
            const dbPages = await getPages();
            setDbPagesCount(dbPages.length);

            // Find slugs in contentMap but not in DB
            const dbSlugs = new Set(dbPages.map(p => p.slug));
            const missing = WEBSITE_PAGES
                .map(p => p.id) // contentMap uses 'id' as the slug
                .filter(slug => !dbSlugs.has(slug));

            setMissingSlugs(missing);
            setStatus('idle');

            logInfo('StructureSync', `Structure loaded: DB=${dbPages.length}, Map=${mapPagesCount}, Missing=${missing.length}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load structure';
            logError('StructureSync', `Load failed: ${message}`);
            console.error('Error fetching structure:', err);
            setError(message);
            setStatus('error');
        }
    }, []);

    // Initial load
    useEffect(() => {
        refresh();
    }, [refresh]);

    // Sync missing pages to database
    const syncStructure = useCallback(async () => {
        if (missingSlugs.length === 0) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
            return;
        }

        setStatus('syncing');
        setError(null);

        const toSync = missingSlugs.length;
        logInfo('StructureSync', `Syncing ${toSync} pages`, { slugs: missingSlugs });

        try {
            // Build page records from contentMap
            const pagesToUpsert: PageUpsert[] = WEBSITE_PAGES.map((page, index) => ({
                slug: page.id,
                name: page.label,
                description: page.sections[0]?.description || null,
                icon: page.sections[0]?.icon || '📄',
                display_order: index + 1,
            }));

            await upsertPages(pagesToUpsert);

            // Update last synced timestamp
            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSyncedAt(now);

            // Refresh counts
            await refresh();

            setStatus('success');

            logSuccess('StructureSync', `Sync complete`, {
                createdSlugs: missingSlugs,
                lastSyncedAt: now,
            });

            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sync structure';
            logError('StructureSync', `Sync failed: ${message}`);
            console.error('Error syncing structure:', err);
            setError(message);
            setStatus('error');
        }
    }, [missingSlugs, refresh]);

    return {
        mapPagesCount,
        dbPagesCount,
        missingCount: missingSlugs.length,
        missingSlugs,
        status,
        error,
        lastSyncedAt,
        syncStructure,
        refresh,
    };
}

export default useStructureSync;
