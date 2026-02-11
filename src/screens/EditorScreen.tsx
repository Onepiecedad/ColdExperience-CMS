// ═══════════════════════════════════════════════════════════════════════════
// EDITOR SCREEN - Content editing with sticky Context Bar
// Connected to Supabase - drafts saved to cms_drafts, NEVER to cms_content
// Ticket 5: Local drafts with autosync
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Type, Image, Loader2, AlertCircle, FileQuestion, RefreshCw, ExternalLink, Cloud, CloudOff, Edit3 } from 'lucide-react';
import { ContextBar } from '../components/ContextBar';
import { DevInspector } from '../components/DevInspector';
import { useEditorData } from '../hooks/useEditorData';
import { useDraftStore } from '../hooks/useDraftStore';
import { getPageById, getSectionById, getSubsectionById, LANGUAGES } from '../content/contentMap';
import type { Language, CmsContent } from '../types';

type ContentMode = 'text' | 'media';

export function EditorScreen() {
    const { pageId, sectionId, subsectionId } = useParams<{
        pageId: string;
        sectionId: string;
        subsectionId?: string;
    }>();

    const [contentMode, setContentMode] = useState<ContentMode>('text');
    const [language, setLanguage] = useState<Language>('en');

    // Fetch data from Supabase
    const {
        page: dbPage,
        content,
        media,
        isLoading,
        error,
        pageNotFound,
        fetchedAt,
        refetch
    } = useEditorData(pageId, sectionId);

    // Draft store for local drafts with autosync
    const {
        loadDrafts,
        updateDraft,
        getDraftValue,
        hasDraft,
        syncStatus,
        pendingSyncCount,
    } = useDraftStore();

    // Load drafts when page/section changes
    useEffect(() => {
        if (dbPage?.id && sectionId) {
            loadDrafts(dbPage.id, sectionId);
        }
    }, [dbPage?.id, sectionId, loadDrafts]);

    // Get local config for labels/icons (UI only, not content)
    const localPage = pageId ? getPageById(pageId) : undefined;
    const section = pageId && sectionId ? getSectionById(pageId, sectionId) : undefined;
    const subsection = pageId && sectionId && subsectionId
        ? getSubsectionById(pageId, sectionId, subsectionId)
        : undefined;

    // Determine labels for Context Bar (from local config)
    const pageLabel = localPage?.label || pageId || 'Unknown Page';
    const sectionLabel = section?.label || sectionId || 'Unknown Section';
    const editingLabel = subsection ? subsection.label : sectionLabel;
    const editingIcon = subsection?.icon || section?.icon || '📄';
    const editingDescription = subsection?.description || section?.description || '';

    // Get content value - draft takes priority over published content
    const getDisplayValue = (item: CmsContent): string => {
        // Check for draft first (drafts use page UUID, not slug)
        const draftValue = getDraftValue(
            item.id,
            dbPage?.id || '',
            item.section_key || '',
            item.field_key || '',
            language
        );
        if (draftValue !== null) {
            return draftValue;
        }
        // Fall back to published content
        const key = `content_${language}` as keyof typeof item;
        return (item[key] as string) || '';
    };

    // Check if field has a draft (for indicator)
    const fieldHasDraft = (item: CmsContent): boolean => {
        return hasDraft(
            item.id,
            dbPage?.id || '',
            item.section_key || '',
            item.field_key || '',
            language
        );
    };

    // Handle content change - save to local draft (drafts use page UUID)
    const handleContentChange = (item: CmsContent, value: string) => {
        updateDraft({
            pageId: dbPage?.id || '',
            section: item.section_key || '',
            contentId: item.id,
            contentKey: item.field_key || '',
            language,
            value,
        });
    };

    // Sync status indicator
    const SyncStatusBadge = () => {
        switch (syncStatus) {
            case 'syncing':
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Syncing{pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}...</span>
                    </div>
                );
            case 'synced':
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs">
                        <Cloud size={12} />
                        <span>Synced</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs">
                        <CloudOff size={12} />
                        <span>Sync error</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#040810]">
            {/* Sticky Context Bar */}
            <ContextBar
                pageLabel={pageLabel}
                pageId={pageId || ''}
                sectionLabel={sectionLabel}
                subsectionLabel={subsection?.label}
            />

            {/* Dev Inspector (only in dev mode) */}
            <DevInspector
                pageSlug={pageId}
                sectionId={sectionId}
                subsectionId={subsectionId}
                pageUuid={dbPage?.id || null}
                fieldCount={content.length}
                mediaCount={media.length}
                fetchedAt={fetchedAt}
            />

            {/* Content Area */}
            <main className="p-4 pb-24">
                {/* Section Header with Sync Status */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{editingIcon}</span>
                            <h1 className="text-xl font-semibold text-white">{editingLabel}</h1>
                        </div>
                        <SyncStatusBadge />
                    </div>
                    <p className="text-sm text-white/40">{editingDescription}</p>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════
                    LOADING STATE
                ═══════════════════════════════════════════════════════════════════ */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 size={32} className="text-[#5a9bc7] animate-spin mb-4" />
                        <p className="text-white/60 text-sm">Loading content...</p>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════
                    PAGE NOT FOUND STATE
                ═══════════════════════════════════════════════════════════════════ */}
                {!isLoading && pageNotFound && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                        <FileQuestion size={40} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-red-300 mb-2">
                            Page not found in database
                        </h2>
                        <p className="text-sm text-red-300/70 mb-4">
                            The page "<span className="font-mono">{pageId}</span>" exists in the UI config
                            but has no matching row in <span className="font-mono">cms_pages</span>.
                        </p>
                        <Link
                            to="/pages"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Back to pages
                        </Link>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════
                    ERROR STATE
                ═══════════════════════════════════════════════════════════════════ */}
                {!isLoading && error && !pageNotFound && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-red-300 mb-2">
                            Failed to load content
                        </h2>
                        <p className="text-sm text-red-300/70 mb-4 font-mono">
                            {error}
                        </p>
                        <button
                            onClick={refetch}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Retry
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════
                    SUCCESS STATE - Show content
                ═══════════════════════════════════════════════════════════════════ */}
                {!isLoading && !error && !pageNotFound && dbPage && (
                    <>
                        {/* Segmented Control: Text | Media */}
                        <div className="mb-6 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className="flex">
                                <button
                                    onClick={() => setContentMode('text')}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-medium transition-all duration-300
                                        ${contentMode === 'text'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                                    `}
                                >
                                    <Type size={16} />
                                    Text ({content.length})
                                </button>
                                <button
                                    onClick={() => setContentMode('media')}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-medium transition-all duration-300
                                        ${contentMode === 'media'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                                    `}
                                >
                                    <Image size={16} />
                                    Media ({media.length})
                                </button>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════
                            TEXT VIEW - EDITABLE
                        ═══════════════════════════════════════════════════════════ */}
                        {contentMode === 'text' && (
                            <>
                                {/* Language Selector */}
                                <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code as Language)}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap
                                                ${language === lang.code
                                                    ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/40'
                                                    : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/70'
                                                }
                                            `}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Content Fields - EDITABLE */}
                                {content.length === 0 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                                        <FileQuestion size={32} className="text-amber-400 mx-auto mb-3" />
                                        <h3 className="text-amber-300 font-medium mb-2">
                                            No content found for this section
                                        </h3>
                                        <p className="text-sm text-amber-300/60">
                                            This section exists in the UI config but has no rows in{' '}
                                            <span className="font-mono">cms_content</span> where{' '}
                                            <span className="font-mono">section = "{sectionId}"</span>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {content.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`
                                                    bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border overflow-hidden transition-colors
                                                    ${fieldHasDraft(item)
                                                        ? 'border-amber-500/40'
                                                        : 'border-white/[0.06]'
                                                    }
                                                `}
                                            >
                                                <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-white">
                                                            {item.field_label || item.field_key}
                                                        </span>
                                                        <span className="text-xs text-white/30 font-mono">
                                                            {item.field_type}
                                                        </span>
                                                        {/* Draft indicator */}
                                                        {fieldHasDraft(item) && (
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-medium">
                                                                <Edit3 size={10} />
                                                                Draft
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.field_hint && (
                                                        <span className="text-xs text-white/40">
                                                            {item.field_hint}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    {/* Editable textarea for all content types */}
                                                    {item.field_type === 'html' || item.field_type === 'richtext' || item.field_type === 'textarea' ? (
                                                        <textarea
                                                            value={getDisplayValue(item)}
                                                            onChange={(e) => handleContentChange(item, e.target.value)}
                                                            className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50 resize-y"
                                                            placeholder="Enter content..."
                                                        />
                                                    ) : item.field_type === 'array' ? (
                                                        <textarea
                                                            value={getDisplayValue(item)}
                                                            onChange={(e) => handleContentChange(item, e.target.value)}
                                                            className="w-full min-h-[100px] bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-sm text-white/90 font-mono placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50 resize-y"
                                                            placeholder="[]"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={getDisplayValue(item)}
                                                            onChange={(e) => handleContentChange(item, e.target.value)}
                                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50"
                                                            placeholder="Enter text..."
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ═══════════════════════════════════════════════════════════
                            MEDIA VIEW
                        ═══════════════════════════════════════════════════════════ */}
                        {contentMode === 'media' && (
                            <>
                                {media.length === 0 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                                        <Image size={32} className="text-amber-400 mx-auto mb-3" />
                                        <h3 className="text-amber-300 font-medium mb-2">
                                            No media found for this section
                                        </h3>
                                        <p className="text-sm text-amber-300/60">
                                            This section has no media files assigned in{' '}
                                            <span className="font-mono">cms_media</span>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {media.map((item) => (
                                            <a
                                                key={item.id}
                                                href={item.public_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group block bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] overflow-hidden hover:border-[#5a9bc7]/30 transition-colors"
                                            >
                                                {/* Thumbnail */}
                                                <div className="aspect-video bg-white/[0.02] relative">
                                                    {item.mime_type?.startsWith('image/') ? (
                                                        <img
                                                            src={item.public_url}
                                                            alt={item.alt_text_en || item.filename}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Image size={32} className="text-white/20" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <ExternalLink size={20} className="text-white" />
                                                    </div>
                                                </div>
                                                {/* Filename */}
                                                <div className="p-2 border-t border-white/[0.04]">
                                                    <p className="text-xs text-white/60 truncate">
                                                        {item.filename}
                                                    </p>
                                                    {item.size_bytes && (
                                                        <p className="text-[10px] text-white/30">
                                                            {(item.size_bytes / 1024).toFixed(1)} KB
                                                        </p>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default EditorScreen;
