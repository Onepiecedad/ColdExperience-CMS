// ═══════════════════════════════════════════════════════════════════════════
// EDITOR SCREEN - Content editing with sticky Context Bar
// Connected to Supabase - drafts saved to cms_drafts, NEVER to cms_content
// Ticket 5: Local drafts with autosync
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Type, Image, Loader2, AlertCircle, FileQuestion, RefreshCw, ExternalLink, Cloud, CloudOff, Edit3, Play, Video, Trash2, Languages, X } from 'lucide-react';
import { deleteMedia } from '../services/supabase';
import { ContextBar } from '../components/ContextBar';
import { DevInspector } from '../components/DevInspector';
import { TranslationStatusIcon } from '../components/TranslationStatusIcon';
import { SideBySideField } from '../components/SideBySideField';
// LivePreview removed — preview is now permanently handled by PreviewEditorScreen
import { useEditorData } from '../hooks/useEditorData';
import { useDraftStore } from '../hooks/useDraftStore';
import { getPageById, getSectionById, getSubsectionById, LANGUAGES } from '../content/contentMap';
import type { Language, CmsContent, CmsMedia } from '../types';

type ContentMode = 'text' | 'media';

export function EditorScreen() {
    const { pageId, sectionId, subsectionId } = useParams<{
        pageId: string;
        sectionId: string;
        subsectionId?: string;
    }>();

    const [contentMode, setContentMode] = useState<ContentMode>('text');

    // Helper function to check if media is a video
    const isVideo = (item: { filename: string; mime_type?: string | null }): boolean => {
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
        const filename = item.filename.toLowerCase();
        const mimeType = item.mime_type?.toLowerCase() || '';
        return videoExtensions.some(ext => filename.endsWith(ext)) || mimeType.startsWith('video/');
    };
    const [language, setLanguage] = useState<Language>('en');
    const [compareLang, setCompareLang] = useState<Language | null>(null);


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

    const [localMedia, setLocalMedia] = useState<CmsMedia[]>([]);

    // Sync localMedia with fetched media
    useEffect(() => {
        setLocalMedia(media);
    }, [media]);

    // Delete a media item
    const handleDeleteMedia = async (item: CmsMedia, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
        try {
            await deleteMedia(item.id, item.storage_path);
            setLocalMedia(prev => prev.filter(m => m.id !== item.id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete media. Check console for details.');
        }
    };

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

    // Get the published value for a specific language (for compare column & status icon)
    const getValueForLang = (item: CmsContent, lang: Language): string => {
        const key = `content_${lang}` as keyof typeof item;
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
        <div className="editor-split-layout">
            {/* Editor Pane — scrolls independently */}
            <div className="editor-pane">
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
                            <div className="flex items-center gap-2">
                                <SyncStatusBadge />
                            </div>
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
                                to="/edit/home/sections/hero"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                Back to home
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
                                    {/* Language Selector + Compare Toggle */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                            {LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLanguage(lang.code as Language);
                                                        // If compare is same as new primary, clear it
                                                        if (compareLang === lang.code) setCompareLang(null);
                                                    }}
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

                                            {/* Compare Toggle */}
                                            <div className="ml-auto flex items-center gap-1.5">
                                                {compareLang ? (
                                                    <button
                                                        onClick={() => setCompareLang(null)}
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                                                    >
                                                        <Languages size={14} />
                                                        <span>Compare: {LANGUAGES.find(l => l.code === compareLang)?.flag}</span>
                                                        <X size={12} className="ml-0.5 opacity-60" />
                                                    </button>
                                                ) : (
                                                    <div className="relative group">
                                                        <button
                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/70 hover:border-white/[0.12] transition-all"
                                                        >
                                                            <Languages size={14} />
                                                            <span>Compare</span>
                                                        </button>
                                                        {/* Dropdown */}
                                                        <div className="absolute top-full right-0 mt-1 py-1 bg-[#0f1d2e] border border-white/[0.1] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 min-w-[140px]">
                                                            {LANGUAGES.filter(l => l.code !== language).map((lang) => (
                                                                <button
                                                                    key={lang.code}
                                                                    onClick={() => setCompareLang(lang.code as Language)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                                                                >
                                                                    <span>{lang.flag}</span>
                                                                    <span>{lang.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Compare mode banner */}
                                        {compareLang && (
                                            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[12px] text-purple-300/80">
                                                <Languages size={12} />
                                                <span>
                                                    Editing <strong>{LANGUAGES.find(l => l.code === language)?.label}</strong> · Comparing with <strong>{LANGUAGES.find(l => l.code === compareLang)?.label}</strong>
                                                </span>
                                            </div>
                                        )}
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
                                                            {/* Translation status dot */}
                                                            {compareLang && (
                                                                <TranslationStatusIcon
                                                                    primaryValue={getDisplayValue(item)}
                                                                    compareValue={getValueForLang(item, compareLang)}
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium text-white">
                                                                {item.field_label || item.field_key}
                                                            </span>
                                                            <span className="text-xs text-white/30 font-mono">
                                                                {item.field_type}
                                                            </span>
                                                            {/* Draft indicator */}
                                                            {fieldHasDraft(item) && !compareLang && (
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
                                                        {/* Side-by-side mode when compare language is active */}
                                                        {compareLang ? (
                                                            <SideBySideField
                                                                fieldType={item.field_type || 'text'}
                                                                primaryLang={language}
                                                                compareLang={compareLang}
                                                                value={getDisplayValue(item)}
                                                                compareValue={getValueForLang(item, compareLang)}
                                                                onChange={(val) => handleContentChange(item, val)}
                                                                hasDraft={fieldHasDraft(item)}
                                                            />
                                                        ) : (
                                                            /* Single-column mode (default) */
                                                            <>
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
                                                                ) : item.field_type === 'url' ? (
                                                                    <div className="space-y-2">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="text"
                                                                                value={getDisplayValue(item)}
                                                                                onChange={(e) => handleContentChange(item, e.target.value)}
                                                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-3 pr-9 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50"
                                                                                placeholder="Enter URL..."
                                                                            />
                                                                            {getDisplayValue(item) && (
                                                                                <a
                                                                                    href={getDisplayValue(item)}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#5a9bc7] transition-colors"
                                                                                    title="Open URL"
                                                                                >
                                                                                    <ExternalLink size={14} />
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                        {/* Inline media preview */}
                                                                        {(() => {
                                                                            const url = getDisplayValue(item);
                                                                            if (!url) return null;
                                                                            const isVideoUrl = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
                                                                            const isYoutube = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/i.test(url);
                                                                            const isImageUrl = /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(url);
                                                                            if (isVideoUrl) {
                                                                                return (
                                                                                    <video
                                                                                        src={url}
                                                                                        className="w-full max-h-40 rounded-lg bg-black/40 object-contain"
                                                                                        controls
                                                                                        muted
                                                                                        preload="metadata"
                                                                                    />
                                                                                );
                                                                            }
                                                                            if (isYoutube) {
                                                                                const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
                                                                                const videoId = match?.[1];
                                                                                if (videoId) {
                                                                                    return (
                                                                                        <iframe
                                                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                                                            className="w-full aspect-video rounded-lg"
                                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                            allowFullScreen
                                                                                            title="YouTube Preview"
                                                                                        />
                                                                                    );
                                                                                }
                                                                            }
                                                                            if (isImageUrl) {
                                                                                return (
                                                                                    <img
                                                                                        src={url}
                                                                                        alt="Preview"
                                                                                        className="w-full max-h-40 rounded-lg object-contain bg-black/20"
                                                                                        loading="lazy"
                                                                                    />
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={getDisplayValue(item)}
                                                                        onChange={(e) => handleContentChange(item, e.target.value)}
                                                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50"
                                                                        placeholder="Enter text..."
                                                                    />
                                                                )}
                                                            </>
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
                                    {localMedia.length === 0 ? (
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
                                            {localMedia.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group relative bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] overflow-hidden hover:border-[#5a9bc7]/30 transition-colors cursor-pointer"
                                                    onClick={() => window.open(item.public_url, '_blank')}
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="aspect-video bg-white/[0.02] relative">
                                                        {isVideo(item) ? (
                                                            <>
                                                                <video
                                                                    src={item.public_url}
                                                                    className="w-full h-full object-cover"
                                                                    muted
                                                                    preload="metadata"
                                                                    playsInline
                                                                    onLoadedMetadata={(e) => {
                                                                        const video = e.target as HTMLVideoElement;
                                                                        video.currentTime = 0.1;
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                                                        <Play size={16} className="text-white ml-0.5" fill="white" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-1.5 left-1.5">
                                                                    <div className="px-1.5 py-0.5 bg-[#3f7ba7]/80 backdrop-blur-sm rounded flex items-center gap-1">
                                                                        <Video size={10} className="text-white" />
                                                                        <span className="text-[10px] text-white font-medium">VIDEO</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : item.mime_type?.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(item.filename) ? (
                                                            <img
                                                                src={item.public_url}
                                                                alt={item.alt_text_en || item.filename}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Image size={32} className="text-white/20" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <ExternalLink size={20} className="text-white" />
                                                        </div>
                                                        {/* Delete button - appears on hover */}
                                                        <button
                                                            onClick={(e) => handleDeleteMedia(item, e)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-sm border border-red-400/30"
                                                            title="Delete media"
                                                        >
                                                            <Trash2 size={14} className="text-white" />
                                                        </button>
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
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>


        </div>
    );
}

export default EditorScreen;
