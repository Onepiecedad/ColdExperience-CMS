// ============================================================================
// USE PUBLISH HOOK - Ticket 6: Publish per page
// ============================================================================
// Handles the publish flow: validate against schema, write to cms_content,
// bump version, and cleanup drafts.
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import {
    getDraftsForPage,
    getContentById,
    upsertContentFromDraft,
    bumpContentVersion,
    deleteDraftsForPage,
    getCmsMeta,
} from '../services/supabase';
import {
    isValidKey,
    getFieldSchema,
    type SchemaSection,
    SUPPORTED_LANGUAGES,
} from '../content/schema';
import { logInfo } from '../services/debugLog';
import type { CmsDraft, Language, CmsMeta } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export type PublishStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DraftToPublish {
    draft: CmsDraft;
    contentKey: string;      // Resolved canonical key
    sectionKey: SchemaSection;
    isValid: boolean;        // True if key is in schema
    label: string;           // Human-friendly label from schema
}

export interface BlockedDraft {
    draft: CmsDraft;
    contentKey: string;
    reason: string;
}

export interface TranslationSuggestion {
    contentKey: string;
    sourceLanguage: Language;
    sourceValue: string;
    targetLanguage: Language;
    enabled: boolean;        // Toggle state (default: off)
}

export interface PublishSummary {
    draftsToPublish: DraftToPublish[];
    blockedDrafts: BlockedDraft[];
    translationSuggestions: TranslationSuggestion[];
    languagesAffected: Language[];
    sectionsAffected: string[];
    totalChanges: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePublish(pageId: string | undefined, pageSlug: string | undefined) {
    const [status, setStatus] = useState<PublishStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<PublishSummary | null>(null);
    const [meta, setMeta] = useState<CmsMeta | null>(null);

    // Track suggestion toggles
    const suggestionsRef = useRef<TranslationSuggestion[]>([]);

    /**
     * Collect and validate all drafts for the page
     */
    const collectDrafts = useCallback(async (): Promise<PublishSummary | null> => {
        if (!pageId) return null;

        setStatus('loading');
        setError(null);

        logInfo('publish', 'Collecting drafts for publish', { pageId, pageSlug });

        try {
            // Fetch all drafts for the page
            const drafts = await getDraftsForPage(pageId);
            logInfo('publish', `Found ${drafts.length} drafts`, { count: drafts.length });

            const draftsToPublish: DraftToPublish[] = [];
            const blockedDrafts: BlockedDraft[] = [];
            const languagesSet = new Set<Language>();
            const sectionsSet = new Set<string>();

            // Process each draft
            for (const draft of drafts) {
                let contentKey: string | null = null;

                // Get canonical field_key
                if (draft.content_id) {
                    const content = await getContentById(draft.content_id);
                    contentKey = content?.field_key || null;
                } else {
                    contentKey = draft.content_key;
                }

                if (!contentKey) {
                    blockedDrafts.push({
                        draft,
                        contentKey: 'unknown',
                        reason: 'Could not resolve content key',
                    });
                    continue;
                }

                // Build section key for schema lookup
                const sectionKey = `${pageSlug}:${draft.section}` as SchemaSection;

                // Validate against schema
                const isValid = isValidKey(sectionKey, contentKey);
                const fieldSchema = getFieldSchema(sectionKey, contentKey);

                if (isValid && fieldSchema) {
                    draftsToPublish.push({
                        draft,
                        contentKey,
                        sectionKey,
                        isValid: true,
                        label: fieldSchema.label,
                    });
                    languagesSet.add(draft.language);
                    sectionsSet.add(draft.section);
                } else {
                    blockedDrafts.push({
                        draft,
                        contentKey,
                        reason: `Key "${contentKey}" not in schema for section "${sectionKey}"`,
                    });
                    logInfo('publish', `Blocked key: ${contentKey}`, { sectionKey, reason: 'not in schema' });
                }
            }

            // Generate translation suggestions
            // Group drafts by contentKey to find missing languages
            const translationSuggestions: TranslationSuggestion[] = [];
            const draftsByKey = new Map<string, DraftToPublish[]>();

            for (const d of draftsToPublish) {
                const key = d.contentKey;
                if (!draftsByKey.has(key)) {
                    draftsByKey.set(key, []);
                }
                draftsByKey.get(key)!.push(d);
            }

            // For each key, check for missing languages (only for translatable fields)
            for (const [key, keyDrafts] of draftsByKey) {
                const firstDraft = keyDrafts[0];
                const fieldSchema = getFieldSchema(firstDraft.sectionKey, key);

                if (!fieldSchema?.translatable) continue;

                const existingLanguages = new Set(keyDrafts.map(d => d.draft.language));

                // If we have EN but missing others, suggest translations
                const enDraft = keyDrafts.find(d => d.draft.language === 'en');
                if (enDraft) {
                    for (const lang of SUPPORTED_LANGUAGES) {
                        if (lang !== 'en' && !existingLanguages.has(lang)) {
                            translationSuggestions.push({
                                contentKey: key,
                                sourceLanguage: 'en',
                                sourceValue: enDraft.draft.value,
                                targetLanguage: lang,
                                enabled: false, // Default off - user must opt-in
                            });
                        }
                    }
                }
            }

            const result: PublishSummary = {
                draftsToPublish,
                blockedDrafts,
                translationSuggestions,
                languagesAffected: Array.from(languagesSet),
                sectionsAffected: Array.from(sectionsSet),
                totalChanges: draftsToPublish.length,
            };

            suggestionsRef.current = translationSuggestions;
            setSummary(result);
            setStatus('idle');

            // Also fetch current meta
            const currentMeta = await getCmsMeta();
            setMeta(currentMeta);

            logInfo('publish', 'Collect complete', {
                toPublish: draftsToPublish.length,
                blocked: blockedDrafts.length,
                suggestions: translationSuggestions.length,
            });

            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setStatus('error');
            logInfo('publish', 'Collect failed', { error: message });
            return null;
        }
    }, [pageId, pageSlug]);

    /**
     * Toggle a translation suggestion
     */
    const toggleSuggestion = useCallback((contentKey: string, targetLanguage: Language) => {
        const idx = suggestionsRef.current.findIndex(
            s => s.contentKey === contentKey && s.targetLanguage === targetLanguage
        );
        if (idx >= 0) {
            suggestionsRef.current[idx].enabled = !suggestionsRef.current[idx].enabled;
            setSummary(prev => prev ? {
                ...prev,
                translationSuggestions: [...suggestionsRef.current],
            } : null);
        }
    }, []);

    /**
     * Execute the publish operation
     */
    const executePublish = useCallback(async (): Promise<boolean> => {
        if (!pageId || !pageSlug || !summary) return false;

        setStatus('loading');
        setError(null);

        logInfo('publish', 'Publishing started', {
            drafts: summary.draftsToPublish.length,
            suggestions: suggestionsRef.current.filter(s => s.enabled).length,
        });

        try {
            // 1. Write all drafts to cms_content
            for (const item of summary.draftsToPublish) {
                await upsertContentFromDraft(
                    item.draft.content_id,
                    pageSlug,
                    item.draft.section,
                    item.contentKey,
                    item.draft.language,
                    item.draft.value
                );
            }

            // 2. Write enabled translation suggestions
            // (In MVP, we just note that they should be translated - no API call)
            const enabledSuggestions = suggestionsRef.current.filter(s => s.enabled);
            for (const suggestion of enabledSuggestions) {
                // MVP: Just copy the English value as placeholder
                // In production, this would call a translation API
                logInfo('publish', 'Translation suggestion enabled (MVP: marking for manual translation)', {
                    key: suggestion.contentKey,
                    from: suggestion.sourceLanguage,
                    to: suggestion.targetLanguage,
                });
            }

            // 3. Bump content version
            const newVersion = await bumpContentVersion();
            logInfo('publish', `Content version bumped to ${newVersion}`);

            // 4. Delete all drafts for the page
            await deleteDraftsForPage(pageId);
            logInfo('publish', 'Drafts cleaned up');

            // 5. Update state
            setStatus('success');
            setSummary(null);
            setMeta(prev => prev ? { ...prev, content_version: newVersion } : null);

            logInfo('publish', 'Publish complete', {
                version: newVersion,
                fieldsPublished: summary.draftsToPublish.length,
            });

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setStatus('error');
            logInfo('publish', 'Publish failed', { error: message });
            return false;
        }
    }, [pageId, summary]);

    /**
     * Reset the publish state
     */
    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
        setSummary(null);
        suggestionsRef.current = [];
    }, []);

    return {
        // State
        status,
        error,
        summary,
        meta,

        // Actions
        collectDrafts,
        toggleSuggestion,
        executePublish,
        reset,

        // Computed
        canPublish: summary !== null && summary.draftsToPublish.length > 0 && status !== 'loading',
        hasBlockedDrafts: summary !== null && summary.blockedDrafts.length > 0,
    };
}
