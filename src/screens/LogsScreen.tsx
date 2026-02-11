// ═══════════════════════════════════════════════════════════════════════════
// LOGS SCREEN - Apple-style "Advanced" debug log viewer
// Shows all debug logs with copy and clear functionality
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    Copy,
    Trash2,
    Check,
    X,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import {
    getLogs,
    subscribe,
    getLogsAsText,
    clearLogs,
    type LogEntry,
    type LogLevel,
} from '../services/debugLog';

export function LogsScreen() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [showCopied, setShowCopied] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Subscribe to log updates
    useEffect(() => {
        // Initial load
        setLogs(getLogs());

        // Subscribe to updates
        const unsubscribe = subscribe((updatedLogs) => {
            setLogs([...updatedLogs].reverse());
        });

        return unsubscribe;
    }, []);

    const handleCopy = async () => {
        const text = getLogsAsText();
        try {
            await navigator.clipboard.writeText(text);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClear = () => {
        clearLogs();
        setShowClearConfirm(false);
    };

    const formatTimestamp = (iso: string): string => {
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;

        return date.toLocaleDateString('sv-SE', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getLevelIcon = (level: LogLevel) => {
        switch (level) {
            case 'info':
                return <Info size={14} className="text-blue-400" />;
            case 'success':
                return <CheckCircle size={14} className="text-emerald-400" />;
            case 'warn':
                return <AlertTriangle size={14} className="text-amber-400" />;
            case 'error':
                return <XCircle size={14} className="text-red-400" />;
        }
    };

    const getSourceColor = (source: string): string => {
        const colors: Record<string, string> = {
            EditorData: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            StructureSync: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return colors[source] || 'bg-white/10 text-white/60 border-white/20';
    };

    return (
        <div className="min-h-screen bg-[#040810]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/pages"
                            className="p-2 -ml-2 text-[#5a9bc7] active:text-[#5a9bc7]/70"
                        >
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-lg font-semibold text-white">Advanced</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                            onClick={handleCopy}
                            disabled={logs.length === 0}
                            className={`
                                p-2 rounded-lg transition-colors
                                ${logs.length === 0
                                    ? 'text-white/20'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                                }
                            `}
                            title="Copy logs"
                        >
                            {showCopied ? (
                                <Check size={20} className="text-emerald-400" />
                            ) : (
                                <Copy size={20} />
                            )}
                        </button>

                        {/* Clear button */}
                        <button
                            onClick={() => logs.length > 0 && setShowClearConfirm(true)}
                            disabled={logs.length === 0}
                            className={`
                                p-2 rounded-lg transition-colors
                                ${logs.length === 0
                                    ? 'text-white/20'
                                    : 'text-white/50 hover:text-red-400 hover:bg-white/[0.05]'
                                }
                            `}
                            title="Clear logs"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-4">
                {logs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                            <Info size={24} className="text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">No logs yet</p>
                        <p className="text-white/20 text-xs mt-1">
                            Navigate around to generate logs
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                        <div className="divide-y divide-white/[0.04]">
                            {logs.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="px-4 py-3 flex items-start gap-3"
                                >
                                    {/* Level icon */}
                                    <div className="pt-0.5">{getLevelIcon(entry.level)}</div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Source badge */}
                                            <span
                                                className={`
                                                    text-[10px] font-medium px-1.5 py-0.5 rounded border
                                                    ${getSourceColor(entry.source)}
                                                `}
                                            >
                                                {entry.source}
                                            </span>
                                            {/* Timestamp */}
                                            <span className="text-[10px] text-white/30 font-mono">
                                                {formatTimestamp(entry.timestamp)}
                                            </span>
                                        </div>
                                        {/* Message */}
                                        <p className="text-sm text-white/70 mt-1 break-words">
                                            {entry.message}
                                        </p>
                                        {/* Details */}
                                        {entry.details && (
                                            <pre className="text-[10px] text-white/30 mt-1 font-mono bg-white/[0.02] px-2 py-1 rounded overflow-x-auto">
                                                {JSON.stringify(entry.details, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-white/20 mt-4">
                    {logs.length} log{logs.length !== 1 ? 's' : ''} • Max 500 stored
                </p>
            </main>

            {/* Copied Toast */}
            {showCopied && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[#1c2836] px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <Check size={16} className="text-emerald-400" />
                        <span className="text-sm text-white">Copied</span>
                    </div>
                </div>
            )}

            {/* Clear Confirmation Dialog */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-[#1c2836] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                        {/* Dialog content */}
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 size={24} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Clear Logs
                            </h3>
                            <p className="text-sm text-white/60">
                                This will permanently delete all {logs.length} log entries.
                            </p>
                        </div>

                        {/* Dialog actions */}
                        <div className="border-t border-white/[0.06]">
                            <button
                                onClick={handleClear}
                                className="w-full py-4 text-[15px] font-semibold text-red-400 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="border-t border-white/[0.06]">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="w-full py-4 text-[15px] text-white/60 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Close on backdrop click */}
                    <button
                        onClick={() => setShowClearConfirm(false)}
                        className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/70 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default LogsScreen;
