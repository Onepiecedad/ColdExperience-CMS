// ═══════════════════════════════════════════════════════════════════════════
// USE DRAFT STORE - Local draft management with debounced autosync to Supabase
// Ticket 5: Drafts are stored in cms_drafts, NEVER in cms_content
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CmsDraft, Language } from '../types';
import {
    getDraftsForSection,
    upsertDraft,
    deleteDraftsForSection,
} from '../services/supabase';
import { logInfo, logSuccess, logWarn, logError } from '../services/debugLog';

// ============================================================================
// Types
// ============================================================================

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface DraftKey {
    pageId: string;
    section: string;
    contentId: string | null;
    contentKey: string | null;
    language: Language;
}

interface LocalDraft extends DraftKey {
    value: string;
    isDirty: boolean;  // Has local changes not yet synced
}

export interface DraftStoreState {
    drafts: Map<string, LocalDraft>;
    syncStatus: SyncStatus;
    lastSyncedAt: Date | null;
    error: string | null;
    pendingSyncCount: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a unique key for a draft based on content_id or fallback keys
 */
function makeDraftKey(key: DraftKey): string {
    if (key.contentId) {
        return `cid:${key.contentId}:${key.language}`;
    }
    return `key:${key.pageId}:${key.section}:${key.contentKey}:${key.language}`;
}

/**
 * Convert a CmsDraft from DB to LocalDraft
 */
function dbToLocal(dbDraft: CmsDraft): LocalDraft {
    return {
        pageId: dbDraft.page_id,
        section: dbDraft.section,
        contentId: dbDraft.content_id,
        contentKey: dbDraft.content_key,
        language: dbDraft.language,
        value: dbDraft.value,
        isDirty: false,
    };
}

// ============================================================================
// Hook
// ============================================================================

const SYNC_DEBOUNCE_MS = 800;

export function useDraftStore() {
    const [state, setState] = useState<DraftStoreState>({
        drafts: new Map(),
        syncStatus: 'idle',
        lastSyncedAt: null,
        error: null,
        pendingSyncCount: 0,
    });

    // Refs for debounce timer and pending sync queue
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingSyncRef = useRef<Map<string, LocalDraft>>(new Map());
    const isSyncingRef = useRef(false);

    // =========================================================================
    // Load drafts from Supabase
    // =========================================================================

    const loadDrafts = useCallback(async (pageId: string, section: string) => {
        logInfo('DraftStore', `Loading drafts for ${section}...`);

        try {
            const dbDrafts = await getDraftsForSection(pageId, section);

            setState(prev => {
                const newDrafts = new Map(prev.drafts);

                // Add loaded drafts to the map
                dbDrafts.forEach(dbDraft => {
                    const local = dbToLocal(dbDraft);
                    const key = makeDraftKey(local);
                    newDrafts.set(key, local);
                });

                logSuccess('DraftStore', `Loaded ${dbDrafts.length} drafts for ${section}`);

                return {
                    ...prev,
                    drafts: newDrafts,
                    error: null,
                };
            });

            return dbDrafts.length;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load drafts';
            logError('DraftStore', `Load error: ${message}`);
            setState(prev => ({ ...prev, error: message }));
            return 0;
        }
    }, []);

    // =========================================================================
    // Update a draft locally + queue for sync
    // =========================================================================

    const updateDraft = useCallback((params: {
        pageId: string;
        section: string;
        contentId: string | null;
        contentKey: string | null;
        language: Language;
        value: string;
    }) => {
        const key = makeDraftKey(params);

        const localDraft: LocalDraft = {
            ...params,
            isDirty: true,
        };

        // Update local state immediately (optimistic)
        setState(prev => {
            const newDrafts = new Map(prev.drafts);
            newDrafts.set(key, localDraft);
            return {
                ...prev,
                drafts: newDrafts,
                pendingSyncCount: prev.pendingSyncCount + 1,
            };
        });

        // Add to pending sync queue
        pendingSyncRef.current.set(key, localDraft);

        // Debounce the sync
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            flushSync();
        }, SYNC_DEBOUNCE_MS);
    }, []);

    // =========================================================================
    // Get draft value (returns null if no draft exists)
    // =========================================================================

    const getDraftValue = useCallback((
        contentId: string | null,
        pageId: string,
        section: string,
        contentKey: string | null,
        language: Language
    ): string | null => {
        const key = makeDraftKey({ pageId, section, contentId, contentKey, language });
        const draft = state.drafts.get(key);
        return draft?.value ?? null;
    }, [state.drafts]);

    // =========================================================================
    // Check if a field has a draft
    // =========================================================================

    const hasDraft = useCallback((
        contentId: string | null,
        pageId: string,
        section: string,
        contentKey: string | null,
        language: Language
    ): boolean => {
        const key = makeDraftKey({ pageId, section, contentId, contentKey, language });
        return state.drafts.has(key);
    }, [state.drafts]);

    // =========================================================================
    // Flush pending syncs to Supabase
    // =========================================================================

    const flushSync = useCallback(async () => {
        if (isSyncingRef.current || pendingSyncRef.current.size === 0) {
            return;
        }

        isSyncingRef.current = true;
        const toSync = new Map(pendingSyncRef.current);
        pendingSyncRef.current.clear();

        setState(prev => ({ ...prev, syncStatus: 'syncing' }));

        logInfo('DraftStore', `Syncing ${toSync.size} drafts to Supabase...`);

        let successCount = 0;
        let errorCount = 0;

        for (const [key, draft] of toSync) {
            try {
                await upsertDraft({
                    page_id: draft.pageId,
                    section: draft.section,
                    content_id: draft.contentId,
                    content_key: draft.contentKey,
                    language: draft.language,
                    value: draft.value,
                });

                // Mark as synced in local state
                setState(prev => {
                    const newDrafts = new Map(prev.drafts);
                    const existing = newDrafts.get(key);
                    if (existing) {
                        newDrafts.set(key, { ...existing, isDirty: false });
                    }
                    return { ...prev, drafts: newDrafts };
                });

                successCount++;
            } catch (err) {
                logWarn('DraftStore', `Failed to sync draft: ${key}`);
                // Re-queue for retry
                pendingSyncRef.current.set(key, draft);
                errorCount++;
            }
        }

        const now = new Date();
        const status: SyncStatus = errorCount > 0 ? 'error' : 'synced';

        setState(prev => ({
            ...prev,
            syncStatus: status,
            lastSyncedAt: now,
            pendingSyncCount: pendingSyncRef.current.size,
            error: errorCount > 0 ? `Failed to sync ${errorCount} drafts` : null,
        }));

        if (successCount > 0) {
            logSuccess('DraftStore', `Synced ${successCount} drafts`);
        }

        isSyncingRef.current = false;

        // If there are retries queued, schedule another sync
        if (pendingSyncRef.current.size > 0) {
            syncTimeoutRef.current = setTimeout(flushSync, SYNC_DEBOUNCE_MS * 2);
        }
    }, []);

    // =========================================================================
    // Clear drafts for a section (after publish)
    // =========================================================================

    const clearDraftsForSection = useCallback(async (pageId: string, section: string) => {
        logInfo('DraftStore', `Clearing drafts for ${section}...`);

        try {
            // Delete from Supabase
            await deleteDraftsForSection(pageId, section);

            // Clear from local state
            setState(prev => {
                const newDrafts = new Map(prev.drafts);
                for (const [key, draft] of newDrafts) {
                    if (draft.pageId === pageId && draft.section === section) {
                        newDrafts.delete(key);
                    }
                }
                return { ...prev, drafts: newDrafts };
            });

            logSuccess('DraftStore', `Cleared drafts for ${section}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to clear drafts';
            logError('DraftStore', `Clear error: ${message}`);
            setState(prev => ({ ...prev, error: message }));
        }
    }, []);

    // =========================================================================
    // Cleanup on unmount
    // =========================================================================

    useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            // Flush any remaining syncs
            if (pendingSyncRef.current.size > 0) {
                flushSync();
            }
        };
    }, [flushSync]);

    // =========================================================================
    // Return
    // =========================================================================

    return {
        // State
        drafts: state.drafts,
        syncStatus: state.syncStatus,
        lastSyncedAt: state.lastSyncedAt,
        error: state.error,
        pendingSyncCount: state.pendingSyncCount,

        // Actions
        loadDrafts,
        updateDraft,
        getDraftValue,
        hasDraft,
        flushSync,
        clearDraftsForSection,
    };
}

export default useDraftStore;
