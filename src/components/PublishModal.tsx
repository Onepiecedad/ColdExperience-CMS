// ============================================================================
// PUBLISH MODAL - Ticket 6: Publish per page
// ============================================================================
// Apple-style modal showing publish summary with:
// - Field counts per section
// - Blocked keys warning
// - Translation suggestions with toggles
// - Cancel/Publish buttons
// ============================================================================

import { useState, useEffect } from 'react';
import {
    X,
    Check,
    AlertTriangle,
    Loader2,
    ChevronDown,
    ChevronRight,
    Globe,
    Upload,
    Ban,
    Languages,
} from 'lucide-react';
import { usePublish, type DraftToPublish } from '../hooks/usePublish';
import type { Language } from '../types';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string | undefined;
    pageSlug: string | undefined;
    pageLabel: string;
    onPublishSuccess?: () => void;
}

// Language labels
const LANGUAGE_FLAGS: Record<Language, string> = {
    en: '🇬🇧',
    sv: '🇸🇪',
    de: '🇩🇪',
    pl: '🇵🇱',
};

export function PublishModal({
    isOpen,
    onClose,
    pageId,
    pageSlug,
    pageLabel,
    onPublishSuccess,
}: PublishModalProps) {
    const {
        status,
        error,
        summary,
        meta,
        collectDrafts,
        toggleSuggestion,
        executePublish,
        reset,
        canPublish,
        hasBlockedDrafts,
    } = usePublish(pageId, pageSlug);

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Load drafts when modal opens
    useEffect(() => {
        if (isOpen && pageId) {
            collectDrafts();
        }
    }, [isOpen, pageId, collectDrafts]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setExpandedSections(new Set());
        }
    }, [isOpen, reset]);

    const handlePublish = async () => {
        const success = await executePublish();
        if (success) {
            onPublishSuccess?.();
            setTimeout(() => onClose(), 1500); // Show success state briefly
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    if (!isOpen) return null;

    // Group drafts by section
    const draftsBySection = summary?.draftsToPublish.reduce((acc, d) => {
        const section = d.draft.section;
        if (!acc[section]) acc[section] = [];
        acc[section].push(d);
        return acc;
    }, {} as Record<string, DraftToPublish[]>) || {};

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto">
                <div className="bg-[#0a1622] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3f7ba7]/20 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-[#5a9bc7]" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold">Publicera ändringar</h2>
                                <p className="text-white/40 text-sm">{pageLabel}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            title="Stäng"
                            className="p-2 text-white/40 hover:text-white/70 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {status === 'loading' && !summary ? (
                            // Loading state
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-[#5a9bc7] animate-spin mb-3" />
                                <p className="text-white/60">Samlar ändringar...</p>
                            </div>
                        ) : status === 'success' ? (
                            // Success state
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-white font-medium mb-1">Publicerat!</p>
                                <p className="text-white/40 text-sm">
                                    Version {meta?.content_version ?? '?'}
                                </p>
                            </div>
                        ) : summary ? (
                            <div className="space-y-6">
                                {/* Summary Stats */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl">
                                    <div>
                                        <span className="text-2xl font-semibold text-white">
                                            {summary.totalChanges}
                                        </span>
                                        <span className="text-white/40 ml-2">
                                            {summary.totalChanges === 1 ? 'fält' : 'fält'} att uppdatera
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-white/40" />
                                        <div className="flex gap-1">
                                            {summary.languagesAffected.map(lang => (
                                                <span key={lang} className="text-sm">
                                                    {LANGUAGE_FLAGS[lang]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sections */}
                                {Object.entries(draftsBySection).length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                                            Sektioner
                                        </span>
                                        <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
                                            {Object.entries(draftsBySection).map(([section, drafts]) => (
                                                <div key={section}>
                                                    <button
                                                        onClick={() => toggleSection(section)}
                                                        title={`Visa detaljer för ${section}`}
                                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {expandedSections.has(section) ? (
                                                                <ChevronDown size={16} className="text-white/40" />
                                                            ) : (
                                                                <ChevronRight size={16} className="text-white/40" />
                                                            )}
                                                            <span className="text-white/80 font-medium capitalize">
                                                                {section}
                                                            </span>
                                                        </div>
                                                        <span className="text-[#5a9bc7] text-sm">
                                                            {drafts.length} {drafts.length === 1 ? 'ändring' : 'ändringar'}
                                                        </span>
                                                    </button>
                                                    {expandedSections.has(section) && (
                                                        <div className="px-4 pb-3 pl-10 space-y-1.5">
                                                            {drafts.map((d, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                                    <span className="text-white/50">
                                                                        {LANGUAGE_FLAGS[d.draft.language]}
                                                                    </span>
                                                                    <span className="text-white/70">{d.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Blocked Keys Warning */}
                                {hasBlockedDrafts && (
                                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                        <div className="flex items-start gap-3">
                                            <Ban className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-amber-300 font-medium text-sm mb-1">
                                                    {summary.blockedDrafts.length} blockerade fält
                                                </p>
                                                <p className="text-amber-200/60 text-xs">
                                                    Dessa fält finns inte i schemat och kommer inte att publiceras.
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    {summary.blockedDrafts.slice(0, 3).map((b, i) => (
                                                        <div key={i} className="text-xs text-amber-200/50">
                                                            • {b.contentKey}
                                                        </div>
                                                    ))}
                                                    {summary.blockedDrafts.length > 3 && (
                                                        <div className="text-xs text-amber-200/40">
                                                            ...och {summary.blockedDrafts.length - 3} till
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Translation Suggestions */}
                                {summary.translationSuggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Languages size={16} className="text-white/40" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                                                Översättningar saknas
                                            </span>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3">
                                            <p className="text-white/50 text-sm">
                                                Några fält saknar översättningar. Aktivera för att markera för manuell översättning.
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['sv', 'de', 'pl'] as Language[]).map(lang => {
                                                    const count = summary.translationSuggestions.filter(
                                                        s => s.targetLanguage === lang
                                                    ).length;
                                                    const enabled = summary.translationSuggestions.filter(
                                                        s => s.targetLanguage === lang && s.enabled
                                                    ).length > 0;

                                                    if (count === 0) return null;

                                                    return (
                                                        <button
                                                            key={lang}
                                                            onClick={() => {
                                                                // Toggle all suggestions for this language
                                                                summary.translationSuggestions
                                                                    .filter(s => s.targetLanguage === lang)
                                                                    .forEach(s => toggleSuggestion(s.contentKey, lang));
                                                            }}
                                                            className={`
                                                                flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                                                ${enabled
                                                                    ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/50'
                                                                    : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.05]'
                                                                }
                                                            `}
                                                        >
                                                            <span>{LANGUAGE_FLAGS[lang]}</span>
                                                            <span>{count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* No Changes */}
                                {summary.totalChanges === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <p className="text-white/50">Inga ändringar att publicera</p>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-red-300 font-medium text-sm">Fel</p>
                                                <p className="text-red-200/60 text-xs mt-1">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    {summary && status !== 'success' && (
                        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
                            <div className="text-xs text-white/30">
                                Version: {meta?.content_version ?? 0} → {(meta?.content_version ?? 0) + 1}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={!canPublish}
                                    className={`
                                        flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
                                        ${canPublish
                                            ? 'bg-[#3f7ba7] text-white hover:bg-[#4a8bb7]'
                                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Publicerar...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Publicera
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PublishModal;
