// ═══════════════════════════════════════════════════════════════════════════
// DEV INSPECTOR - Debug info panel (only visible in dev mode)
// Shows page IDs, content counts, and fetch timestamps
// ═══════════════════════════════════════════════════════════════════════════

import { Bug } from 'lucide-react';

interface DevInspectorProps {
    pageSlug: string | undefined;
    sectionId: string | undefined;
    subsectionId?: string;
    pageUuid: string | null;
    fieldCount: number;
    mediaCount: number;
    fetchedAt: Date | null;
}

export function DevInspector({
    pageSlug,
    sectionId,
    subsectionId,
    pageUuid,
    fieldCount,
    mediaCount,
    fetchedAt,
}: DevInspectorProps) {
    // Only render in development mode
    if (!import.meta.env.DEV) {
        return null;
    }

    const formatTime = (date: Date | null) => {
        if (!date) return '—';
        return date.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="mx-4 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/80 flex-wrap">
                <Bug size={12} className="text-amber-500 flex-shrink-0" />
                <span>
                    <span className="text-amber-500/60">slug:</span> {pageSlug || '—'}
                </span>
                <span className="text-amber-500/40">|</span>
                <span>
                    <span className="text-amber-500/60">sec:</span> {sectionId || '—'}
                </span>
                {subsectionId && (
                    <>
                        <span className="text-amber-500/40">|</span>
                        <span>
                            <span className="text-amber-500/60">sub:</span> {subsectionId}
                        </span>
                    </>
                )}
                <span className="text-amber-500/40">|</span>
                <span>
                    <span className="text-amber-500/60">uuid:</span>{' '}
                    <span className={pageUuid ? 'text-emerald-400' : 'text-red-400'}>
                        {pageUuid ? pageUuid.slice(0, 8) + '…' : 'NOT FOUND'}
                    </span>
                </span>
                <span className="text-amber-500/40">|</span>
                <span>
                    <span className="text-amber-500/60">fields:</span> {fieldCount}
                </span>
                <span className="text-amber-500/40">|</span>
                <span>
                    <span className="text-amber-500/60">media:</span> {mediaCount}
                </span>
                <span className="text-amber-500/40">|</span>
                <span>
                    <span className="text-amber-500/60">@</span> {formatTime(fetchedAt)}
                </span>
            </div>
        </div>
    );
}

export default DevInspector;
