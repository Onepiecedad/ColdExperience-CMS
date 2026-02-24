// ═══════════════════════════════════════════════════════════════════════════
// EDITOR SCREEN - Content editing with sticky Context Bar
// Connected to Supabase - drafts saved to cms_drafts, NEVER to cms_content
// Ticket 5: Local drafts with autosync
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Type, Image, Loader2, AlertCircle, FileQuestion, RefreshCw, ExternalLink, Cloud, CloudOff, Edit3, Play, Video, Trash2, Languages, X, Upload } from 'lucide-react';
import { deleteMedia } from '../services/supabase';
import { ContextBar } from '../components/ContextBar';
import { DevInspector } from '../components/DevInspector';
import { TranslationStatusIcon } from '../components/TranslationStatusIcon';
import { SideBySideField } from '../components/SideBySideField';
import { MediaFieldEditor } from '../components/MediaFieldEditor';
import { PublishModal } from '../components/PublishModal';
// LivePreview removed — preview is now permanently handled by PreviewEditorScreen
import { useEditorData } from '../hooks/useEditorData';
import { useDraftStore } from '../hooks/useDraftStore';
import { getPageById, getSectionById, getSubsectionById, LANGUAGES, type Subsection } from '../content/contentMap';
import type { Language, CmsContent, CmsMedia } from '../types';

type ContentMode = 'text' | 'media';

// ── Pretty-printed JSON textarea with local state (no cursor-jumping) ──
function JsonTextarea({ value, onChange, className, placeholder }: {
    value: string;
    onChange: (compactJson: string) => void;
    className?: string;
    placeholder?: string;
}) {
    const prettyPrint = (raw: string): string => {
        try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
    };

    const [local, setLocal] = useState(() => prettyPrint(value));
    const prevValueRef = useRef(value);

    // Re-sync if the upstream value changes (e.g. switching fields)
    useEffect(() => {
        if (value !== prevValueRef.current) {
            setLocal(prettyPrint(value));
            prevValueRef.current = value;
        }
    }, [value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocal(e.target.value);
    }, []);

    const handleBlur = useCallback(() => {
        try {
            const parsed = JSON.parse(local);
            const compact = JSON.stringify(parsed);
            onChange(compact);
            // Re-pretty-print after save
            setLocal(JSON.stringify(parsed, null, 2));
            prevValueRef.current = compact;
        } catch {
            // Invalid JSON — save raw so user doesn't lose work
            onChange(local);
        }
    }, [local, onChange]);

    return (
        <textarea
            value={local}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
        />
    );
}

export function EditorScreen() {
    const { pageId, sectionId, subsectionId } = useParams<{
        pageId: string;
        sectionId: string;
        subsectionId?: string;
    }>();

    const [contentMode, setContentMode] = useState<ContentMode>('text');
    const [showPublishModal, setShowPublishModal] = useState(false);

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
    } = useEditorData(pageId, sectionId, subsectionId);

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

    // ── Subsection content filtering ──────────────────────────────────────
    // When viewing a subsection, show only fields matching its contentKeyPrefix.
    // When viewing the parent section, show ALL fields (no filtering).
    const subsectionPrefix = (subsection as Subsection & { contentKeyPrefix?: string } | undefined)?.contentKeyPrefix;

    const filteredContent = subsectionPrefix
        ? content.filter(item =>
            item.field_key.startsWith(subsectionPrefix) &&
            !item.field_key.includes('.meta.') &&   // Exclude SEO meta fields
            !item.field_key.includes('.media.')      // Exclude media file paths (video src, poster, scale)
        )
        : content;

    // ── Media path fields (videoSrc, poster, etc.) — show in Media tab ───
    // These are .media. fields excluded from filteredContent but should be editable
    const mediaPathFields = subsectionPrefix
        ? content.filter(item =>
            item.field_key.startsWith(subsectionPrefix) &&
            item.field_key.includes('.media.')
        )
        : content.filter(item => item.field_key.includes('.media.'));

    // ── Split content into text fields vs media/url fields ────────────────
    const textContent = filteredContent.filter(item => item.field_type !== 'url');
    const mediaContent = [
        ...filteredContent.filter(item => item.field_type === 'url'),
        ...mediaPathFields,  // Include .media. fields (videoSrc, poster, scale, etc.)
    ];

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

                {/* ═════════════════════════════════════════════════════════════
                    STICKY TOOLBAR — Text/Media toggle + Language selector
                    Floats below the Context Bar so it's always accessible
                ═════════════════════════════════════════════════════════════ */}
                {!isLoading && !error && !pageNotFound && dbPage && (
                    <div className="sticky top-[41px] z-30 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pt-3 pb-2">
                        {/* Segmented Control: Text | Media */}
                        <div className="mb-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className="flex">
                                <button
                                    onClick={() => setContentMode('text')}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-300
                                        ${contentMode === 'text'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                                    `}
                                >
                                    <Type size={15} />
                                    Text ({textContent.length})
                                </button>
                                <button
                                    onClick={() => setContentMode('media')}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-300
                                        ${contentMode === 'media'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                                    `}
                                >
                                    <Image size={15} />
                                    Media ({mediaContent.length + media.length})
                                </button>
                            </div>
                        </div>

                        {/* Language Selector + Compare Toggle — always visible */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as Language);
                                        if (compareLang === lang.code) setCompareLang(null);
                                    }}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap
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
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                                    >
                                        <Languages size={13} />
                                        <span>Compare: {LANGUAGES.find(l => l.code === compareLang)?.flag}</span>
                                        <X size={11} className="ml-0.5 opacity-60" />
                                    </button>
                                ) : (
                                    <div className="relative group">
                                        <button
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/70 hover:border-white/[0.12] transition-all"
                                        >
                                            <Languages size={13} />
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
                            <div className="mt-1 flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[11px] text-purple-300/80">
                                <Languages size={11} />
                                <span>
                                    Editing <strong>{LANGUAGES.find(l => l.code === language)?.label}</strong> · Comparing with <strong>{LANGUAGES.find(l => l.code === compareLang)?.label}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                )}

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
                                <button
                                    onClick={() => setShowPublishModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3f7ba7]/20 text-[#5a9bc7] hover:bg-[#3f7ba7]/30 hover:text-white border border-[#3f7ba7]/30 rounded-lg text-xs font-medium transition-all"
                                >
                                    <Upload size={12} />
                                    <span>Publish</span>
                                </button>
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
                            {/* ═══════════════════════════════════════════════════════════
                            TEXT VIEW - EDITABLE
                        ═══════════════════════════════════════════════════════════ */}
                            {contentMode === 'text' && (
                                <>
                                    {/* Content Fields - EDITABLE */}
                                    {textContent.length === 0 ? (
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
                                            {textContent.map((item) => (
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
                                                                    <JsonTextarea
                                                                        value={getDisplayValue(item)}
                                                                        onChange={(val) => handleContentChange(item, val)}
                                                                        className="w-full min-h-[160px] bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-sm text-white/90 font-mono placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50 resize-y leading-relaxed"
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
                                                                ) : (() => {
                                                                    const val = getDisplayValue(item);
                                                                    const trimmed = val.trim();
                                                                    const isJson = (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
                                                                        (trimmed.startsWith('{') && trimmed.endsWith('}'));
                                                                    if (isJson) {
                                                                        return (
                                                                            <JsonTextarea
                                                                                value={val}
                                                                                onChange={(compactVal) => handleContentChange(item, compactVal)}
                                                                                className="w-full min-h-[160px] bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-sm text-white/90 font-mono placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50 resize-y leading-relaxed"
                                                                                placeholder="[]"
                                                                            />
                                                                        );
                                                                    }
                                                                    return (
                                                                        <input
                                                                            type="text"
                                                                            value={val}
                                                                            onChange={(e) => handleContentChange(item, e.target.value)}
                                                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5a9bc7]/50"
                                                                            placeholder="Enter text..."
                                                                        />
                                                                    );
                                                                })()}
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
                                    {/* ── Media Content Fields (video+poster pairs) ────────────── */}
                                    {mediaContent.length > 0 && (() => {
                                        const SITE_BASE = 'https://coldexperience.se';

                                        // ── Group media fields into logical pairs ──
                                        // Pair definitions: [videoKeyPart, posterKeyPart, label]
                                        const PAIR_DEFS: [string, string, string][] = [
                                            ['media.videoSrc', 'media.poster', 'Bakgrundsvideo'],
                                            ['media.introVideo', 'media.introPoster', 'Introvideo'],
                                        ];

                                        type MediaPair = {
                                            label: string;
                                            video?: typeof mediaContent[0];
                                            poster?: typeof mediaContent[0];
                                        };

                                        const paired: MediaPair[] = [];
                                        const usedIds = new Set<string>();

                                        for (const [videoKey, posterKey, label] of PAIR_DEFS) {
                                            const video = mediaContent.find(i => i.field_key.endsWith(videoKey));
                                            const poster = mediaContent.find(i => i.field_key.endsWith(posterKey));
                                            if (video || poster) {
                                                paired.push({ label, video, poster });
                                                if (video) usedIds.add(video.id);
                                                if (poster) usedIds.add(poster.id);
                                            }
                                        }

                                        // Anything not paired stays as ungrouped
                                        const ungrouped = mediaContent.filter(i => !usedIds.has(i.id));

                                        // Helper: render a single media card (video or image) — editable via MediaFieldEditor
                                        const renderMediaCard = (item: typeof mediaContent[0]) => {
                                            const rawUrl = getDisplayValue(item);
                                            const resolvedUrl = rawUrl && rawUrl.startsWith('/') ? `${SITE_BASE}${rawUrl}` : rawUrl;
                                            const shortLabel = (item.field_label || item.field_key).split('.').pop() || '';

                                            return (
                                                <div key={item.id}>
                                                    <MediaFieldEditor
                                                        value={rawUrl || null}
                                                        previewUrl={resolvedUrl || undefined}
                                                        onChange={(url) => handleContentChange(item, url)}
                                                        label={shortLabel}
                                                    />
                                                    {fieldHasDraft(item) && (
                                                        <div className="mt-1 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-medium w-fit">
                                                            <Edit3 size={10} />
                                                            Draft
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        };

                                        return (
                                            <>
                                                {/* ── Paired media groups (video + poster) ── */}
                                                {paired.map((pair) => (
                                                    <div key={pair.label} className="mb-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Video size={14} className="text-[#5a9bc7]" />
                                                            <span className="text-sm font-medium text-white/80">{pair.label}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {pair.video && renderMediaCard(pair.video)}
                                                            {pair.poster && renderMediaCard(pair.poster)}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* ── Ungrouped media fields ── */}
                                                {ungrouped.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                                        {ungrouped.map(renderMediaCard)}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                    {/* ── Uploaded Media Files (exclude items already shown in content fields) ── */}
                                    {(() => {
                                        // Collect filenames referenced by content fields so we can hide duplicates
                                        const contentFieldFilenames = new Set<string>();
                                        for (const item of mediaContent) {
                                            const val = getDisplayValue(item);
                                            if (val) {
                                                const fname = val.split('/').pop()?.split('?')[0];
                                                if (fname) contentFieldFilenames.add(fname.toLowerCase());
                                            }
                                        }
                                        const filteredLocalMedia = localMedia.filter(
                                            (m) => !contentFieldFilenames.has(m.filename.toLowerCase())
                                        );

                                        if (filteredLocalMedia.length === 0 && mediaContent.length === 0) {
                                            return (
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
                                            );
                                        }

                                        if (filteredLocalMedia.length === 0) return null;

                                        return (
                                            <div className="grid grid-cols-2 gap-3">
                                                {filteredLocalMedia.map((item) => (
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
                                        );
                                    })()}
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Publish Modal */}
            <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                pageId={dbPage?.id}
                pageSlug={pageId}
                pageLabel={pageLabel}
                onPublishSuccess={() => {
                    refetch();
                    setShowPublishModal(false);
                }}
            />
        </div>
    );
}

export default EditorScreen;
