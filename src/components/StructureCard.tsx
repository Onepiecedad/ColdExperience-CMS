// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURE CARD - Apple-style card showing DB vs contentMap sync status
// Shows counts, last synced, and sync button with confirmation dialog
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
    Database,
    RefreshCw,
    Check,
    AlertCircle,
    Loader2,
    X
} from 'lucide-react';
import { useStructureSync } from '../hooks/useStructureSync';

interface StructureCardProps {
    className?: string;
}

export function StructureCard({ className = '' }: StructureCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        mapPagesCount,
        dbPagesCount,
        missingCount,
        status,
        error,
        lastSyncedAt,
        syncStructure,
    } = useStructureSync();

    const handleSyncClick = () => {
        if (missingCount === 0) {
            // Nothing to sync, just show success
            syncStructure();
        } else {
            setShowConfirm(true);
        }
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        await syncStructure();
    };

    const formatTimestamp = (iso: string | null): string => {
        if (!iso) return 'Never';
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString('sv-SE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getButtonContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Loading…</span>
                    </>
                );
            case 'syncing':
                return (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Syncing…</span>
                    </>
                );
            case 'success':
                return (
                    <>
                        <Check size={16} className="text-emerald-400" />
                        <span>Synced</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <AlertCircle size={16} className="text-red-400" />
                        <span>Retry</span>
                    </>
                );
            default:
                return (
                    <>
                        <RefreshCw size={16} />
                        <span>Sync structure</span>
                    </>
                );
        }
    };

    const isDisabled = status === 'loading' || status === 'syncing';

    return (
        <>
            <div className={`bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden ${className}`}>
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Database size={16} className="text-blue-400" />
                    </div>
                    <span className="font-medium text-white">Structure</span>
                </div>

                {/* Stats */}
                <div className="px-4 py-3 space-y-2">
                    {/* Counts row */}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-white/60">
                            DB pages: <span className="text-white font-medium">{dbPagesCount}</span>
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/60">
                            Map pages: <span className="text-white font-medium">{mapPagesCount}</span>
                        </span>
                        <span className="text-white/30">·</span>
                        <span className={missingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            Missing: <span className="font-medium">{missingCount}</span>
                        </span>
                    </div>

                    {/* Last synced row */}
                    <div className="text-xs text-white/40">
                        Last synced: <span className="text-white/60">{formatTimestamp(lastSyncedAt)}</span>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Sync Button */}
                <div className="px-4 pb-4">
                    <button
                        onClick={handleSyncClick}
                        disabled={isDisabled}
                        className={`
                            w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all
                            ${isDisabled
                                ? 'bg-white/[0.03] text-white/30 cursor-not-allowed'
                                : status === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : status === 'error'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                        : 'bg-[#3f7ba7]/20 text-[#5a9bc7] border border-[#3f7ba7]/30 hover:bg-[#3f7ba7]/30 active:bg-[#3f7ba7]/40'
                            }
                        `}
                    >
                        {getButtonContent()}
                    </button>
                </div>
            </div>

            {/* iOS-style Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-[#1c2836] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                        {/* Dialog content */}
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Database size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Sync Structure
                            </h3>
                            <p className="text-sm text-white/60">
                                This will create {missingCount} missing page{missingCount !== 1 ? 's' : ''} in the database.
                                No content will be overwritten.
                            </p>
                        </div>

                        {/* Dialog actions */}
                        <div className="border-t border-white/[0.06]">
                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 text-[15px] font-semibold text-blue-400 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                            >
                                Sync
                            </button>
                        </div>
                        <div className="border-t border-white/[0.06]">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-4 text-[15px] text-white/60 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Close on backdrop click */}
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/70 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </>
    );
}

export default StructureCard;
