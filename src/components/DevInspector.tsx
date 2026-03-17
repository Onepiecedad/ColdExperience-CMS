// ═══════════════════════════════════════════════════════════════════════════
// DEV INSPECTOR - Debug info panel (only visible in dev mode)
// Shows page IDs, content counts, and fetch timestamps
// ═══════════════════════════════════════════════════════════════════════════

import { Bug } from 'lucide-react';

interface BridgeAuditEntry {
    id: string;
    type: string;
    url?: string;
    lang?: string;
    cmsSectionId?: string;
    mappedPageId?: string;
    mappedSectionId?: string;
    mappedSubsectionId?: string;
    timestamp: number;
}

interface DevInspectorProps {
    pageSlug: string | undefined;
    sectionId: string | undefined;
    subsectionId?: string;
    pageUuid: string | null;
    fieldCount: number;
    mediaCount: number;
    fetchedAt: Date | null;
    bridgeAudit?: BridgeAuditEntry[];
}

export function DevInspector({
    pageSlug,
    sectionId,
    subsectionId,
    pageUuid,
    fieldCount,
    mediaCount,
    fetchedAt,
    bridgeAudit = [],
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

    const formatAuditTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="mx-4 mt-2 space-y-2">
            <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
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

            <div className="px-3 py-2 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-mono uppercase tracking-wide text-sky-300/80">
                        Bridge Audit
                    </div>
                    <div className="text-[10px] font-mono text-sky-400/50">
                        {bridgeAudit.length} events
                    </div>
                </div>
                {bridgeAudit.length === 0 ? (
                    <div className="text-[11px] font-mono text-sky-200/45">
                        No bridge events captured yet.
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {bridgeAudit.map((entry) => (
                            <div key={entry.id} className="rounded-md border border-sky-500/10 bg-[#091420]/70 px-2 py-1.5">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-sky-200/70 flex-wrap">
                                    <span className="text-sky-400/60">{formatAuditTime(entry.timestamp)}</span>
                                    <span className="text-sky-300">{entry.type}</span>
                                    {entry.lang && <span>lang={entry.lang}</span>}
                                    {entry.cmsSectionId && <span>cms={entry.cmsSectionId}</span>}
                                </div>
                                {(entry.url || entry.mappedPageId || entry.mappedSectionId) && (
                                    <div className="mt-1 text-[10px] font-mono text-sky-100/55 break-all">
                                        {entry.url && <span>url={entry.url}</span>}
                                        {(entry.mappedPageId || entry.mappedSectionId) && (
                                            <span>
                                                {entry.url ? ' -> ' : ''}
                                                map={entry.mappedPageId || '—'}/{entry.mappedSectionId || '—'}
                                                {entry.mappedSubsectionId ? `/${entry.mappedSubsectionId}` : ''}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DevInspector;
