// ═══════════════════════════════════════════════════════════════════════════
// SECTIONS SCREEN - List of sections for a selected page
// Shows numbered sections with icons and descriptions
// Ticket 6: Added Publish button for publishing draft changes
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Upload, CloudOff, Loader2 } from 'lucide-react';
import { getPageById } from '../content/contentMap';
import { useDraftStore } from '../hooks/useDraftStore';
import { PublishModal } from '../components/PublishModal';
import { getDraftsForPage, getPageBySlug } from '../services/supabase';
import { logInfo } from '../services/debugLog';

export function SectionsScreen() {
    const { pageId } = useParams<{ pageId: string }>();
    const navigate = useNavigate();

    // Modal state
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [draftCount, setDraftCount] = useState(0);
    const [dbPageId, setDbPageId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Get sync status from draft store
    const { syncStatus } = useDraftStore();

    const page = pageId ? getPageById(pageId) : undefined;

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Fetch database page ID and draft count
    useEffect(() => {
        if (!pageId) return;

        // Fetch the database page by slug
        getPageBySlug(pageId)
            .then(dbPage => {
                if (dbPage) {
                    setDbPageId(dbPage.id);
                    // Now fetch drafts for this page
                    return getDraftsForPage(dbPage.id);
                }
                return [];
            })
            .then(drafts => {
                setDraftCount(drafts.length);
            })
            .catch(err => {
                logInfo('sections', 'Failed to fetch draft count', { error: err.message });
            });
    }, [pageId]);

    // Determine if publish is available
    // 'idle' = no pending syncs, 'synced' = just finished syncing - both are ready states
    const isReadyToPublish = syncStatus === 'idle' || syncStatus === 'synced';
    const canOpenPublish = isOnline && isReadyToPublish && draftCount > 0;
    const publishDisabledReason = !isOnline
        ? 'Offline'
        : syncStatus === 'syncing'
            ? 'Synkar...'
            : syncStatus === 'error'
                ? 'Synkfel'
                : draftCount === 0
                    ? 'Inga ändringar'
                    : null;

    // Handle publish success
    const handlePublishSuccess = () => {
        setDraftCount(0);
        logInfo('sections', 'Publish completed successfully');
    };

    // Fallback if page not found
    if (!page) {
        return (
            <div className="min-h-screen bg-[#040810] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">Sidan hittades inte</p>
                    <Link to="/pages" className="text-[#5a9bc7] underline">
                        Tillbaka till sidlistan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040810]">
            {/* Header with back button and publish button */}
            <header className="sticky top-0 z-40 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/pages')}
                        className="flex items-center gap-1 text-[#5a9bc7] active:opacity-70 transition-opacity -ml-1"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-[15px]">Sidor</span>
                    </button>

                    {/* Publish button */}
                    <button
                        onClick={() => canOpenPublish && setIsPublishModalOpen(true)}
                        disabled={!canOpenPublish}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${canOpenPublish
                                ? 'bg-[#3f7ba7] text-white active:bg-[#2d5e81]'
                                : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
                            }
                        `}
                        title={publishDisabledReason || 'Publicera ändringar'}
                    >
                        {syncStatus === 'syncing' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : !isOnline ? (
                            <CloudOff size={16} />
                        ) : (
                            <Upload size={16} />
                        )}
                        <span>Publicera</span>
                        {draftCount > 0 && (
                            <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                                {draftCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="px-4 pb-3">
                    <h1 className="text-2xl font-semibold text-white">{page.label}</h1>
                    <p className="text-sm text-white/40 mt-0.5">{page.sections.length} sektioner</p>
                </div>
            </header>

            {/* Section List */}
            <main className="p-4">
                <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {page.sections.map((section) => {
                            const hasSubsections = section.subsections && section.subsections.length > 0;

                            return (
                                <div key={section.id}>
                                    {/* Main section row */}
                                    <Link
                                        to={`/pages/${pageId}/sections/${section.id}`}
                                        className="flex items-center justify-between px-4 py-4 active:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-lg flex-shrink-0">{section.icon}</span>
                                            <div className="min-w-0 flex-1">
                                                <span className="block text-[15px] font-medium text-white">
                                                    {section.label}
                                                </span>
                                                <span className="block text-xs text-white/40 truncate">
                                                    {section.description}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {hasSubsections && (
                                                <span className="text-[10px] text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                                                    {section.subsections!.length} under
                                                </span>
                                            )}
                                            <ChevronRight size={20} className="text-white/30" />
                                        </div>
                                    </Link>

                                    {/* Subsections (if any) */}
                                    {hasSubsections && (
                                        <div className="bg-white/[0.01] border-t border-white/[0.04]">
                                            {section.subsections!.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/pages/${pageId}/sections/${section.id}/${sub.id}`}
                                                    className="flex items-center justify-between pl-12 pr-4 py-3 active:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-b-0"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-sm">{sub.icon}</span>
                                                        <div className="min-w-0">
                                                            <span className="block text-[14px] text-white/80">
                                                                {sub.label}
                                                            </span>
                                                            <span className="block text-[11px] text-white/30">
                                                                {sub.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Publish Modal */}
            {dbPageId && (
                <PublishModal
                    isOpen={isPublishModalOpen}
                    onClose={() => setIsPublishModalOpen(false)}
                    pageId={dbPageId}
                    pageSlug={page.id}
                    pageLabel={page.label}
                    onPublishSuccess={handlePublishSuccess}
                />
            )}
        </div>
    );
}

export default SectionsScreen;

