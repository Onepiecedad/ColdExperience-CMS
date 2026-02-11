// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA COVERAGE SCREEN - Apple-style "Advanced" schema coverage viewer
// Shows allowed vs blocked vs used content keys with copy functionality
// Ticket 8: Schema Coverage Dashboard
// Ticket 9: Website Used Keys integration
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    Copy,
    Check,
    Search,
    Shield,
    ShieldOff,
    Database,
    RefreshCw,
    Globe,
    AlertTriangle,
    Wand2,
    ChevronDown,
} from 'lucide-react';
import { getAllSchemaKeys } from '../content/schema';
import { getDistinctContentKeys } from '../services/supabase';
import { logInfo } from '../services/debugLog';
import websiteUsedKeysData from '../content/websiteUsedKeys.json';

type Tab = 'allowed' | 'blocked' | 'used';

interface KeyInfo {
    key: string;
    status: 'allowed' | 'blocked' | 'used-allowed' | 'used-missing';
}

interface UsedKeysData {
    generatedAt: string;
    repo: string;
    count: number;
    keys: string[];
}

export function SchemaCoverageScreen() {
    const [schemaKeys, setSchemaKeys] = useState<string[]>([]);
    const [dbKeys, setDbKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('allowed');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [showCopied, setShowCopied] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // Batch generation state (Ticket 10)
    const [showBatchPanel, setShowBatchPanel] = useState(false);
    const [batchPrefix, setBatchPrefix] = useState('');
    const [batchSize, setBatchSize] = useState(50);
    const [pendingGenerated, setPendingGenerated] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Website used keys from static import
    const usedKeysData = websiteUsedKeysData as UsedKeysData;
    const usedKeys = usedKeysData.keys || [];

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [schema, db] = await Promise.all([
                Promise.resolve(getAllSchemaKeys()),
                getDistinctContentKeys(),
            ]);
            setSchemaKeys(schema);
            setDbKeys(db);
            setLastRefreshed(new Date());

            // Calculate counts for debug log
            const schemaSet = new Set(schema);
            const blockedCount = db.filter(k => !schemaSet.has(k)).length;
            const usedMissingCount = usedKeys.filter(k => !schemaSet.has(k)).length;

            logInfo('SchemaCoverage', 'SchemaCoverage loaded', {
                allowedCount: schema.length,
                dbKeysCount: db.length,
                blockedCount,
                usedCount: usedKeys.length,
                usedMissingCount,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Compute allowed, blocked, and used lists
    const { allowedKeys, blockedKeys, usedKeysInfo, missingInCmsCount } = useMemo(() => {
        const schemaSet = new Set(schemaKeys);
        const allowed: KeyInfo[] = schemaKeys.map(k => ({ key: k, status: 'allowed' as const }));
        const blocked: KeyInfo[] = dbKeys
            .filter(k => !schemaSet.has(k))
            .map(k => ({ key: k, status: 'blocked' as const }));

        // Used keys with status based on whether they're in schema
        const used: KeyInfo[] = usedKeys.map(k => ({
            key: k,
            status: schemaSet.has(k) ? 'used-allowed' as const : 'used-missing' as const,
        }));

        const missingCount = used.filter(k => k.status === 'used-missing').length;

        return {
            allowedKeys: allowed,
            blockedKeys: blocked,
            usedKeysInfo: used,
            missingInCmsCount: missingCount,
        };
    }, [schemaKeys, dbKeys, usedKeys]);

    // Filter by search query
    const filteredKeys = useMemo(() => {
        let keys: KeyInfo[];
        if (activeTab === 'allowed') {
            keys = allowedKeys;
        } else if (activeTab === 'blocked') {
            keys = blockedKeys;
        } else {
            keys = usedKeysInfo;
        }

        if (!searchQuery.trim()) return keys;
        const query = searchQuery.toLowerCase();
        return keys.filter(k => k.key.toLowerCase().includes(query));
    }, [allowedKeys, blockedKeys, usedKeysInfo, activeTab, searchQuery]);

    // Toggle key selection (blocked and used-missing only)
    const toggleSelection = (key: string) => {
        const newSet = new Set(selectedKeys);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setSelectedKeys(newSet);
    };

    // Select all visible missing keys
    const selectAllVisible = () => {
        const newSet = new Set(selectedKeys);
        filteredKeys
            .filter(k => activeTab === 'blocked' || k.status === 'used-missing')
            .forEach(k => newSet.add(k.key));
        setSelectedKeys(newSet);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedKeys(new Set());
    };

    // Copy selected keys to clipboard
    const handleCopy = async () => {
        if (selectedKeys.size === 0) return;

        // Format as schema-ready snippet
        const snippet = Array.from(selectedKeys)
            .sort()
            .map(key => `        { key: '${key}', type: 'text', translatable: true, label: '${key}' },`)
            .join('\n');

        try {
            await navigator.clipboard.writeText(snippet);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
            logInfo('SchemaCoverage', 'Copied keys to clipboard', {
                count: selectedKeys.size,
                source: activeTab,
            });
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // -------------------------------------------------------------------------
    // BATCH GENERATION LOGIC (Ticket 10)
    // -------------------------------------------------------------------------

    // Guess field type from key name
    const guessType = (key: string): 'text' | 'textarea' | 'url' => {
        const k = key.toLowerCase();
        if (k.includes('url') || k.includes('youtube') || k.includes('video') || k.includes('link')) {
            return 'url';
        }
        if (k.includes('description') || k.includes('paragraph') || k.includes('body') || k.includes('desc')) {
            return 'textarea';
        }
        return 'text';
    };

    // Guess translatable from key and type
    const guessTranslatable = (key: string, type: string): boolean => {
        if (type === 'url') return false;
        const k = key.toLowerCase();
        if (k.includes('email') || k.includes('phone') || k.includes('address')) {
            return false;
        }
        return true;
    };

    // Generate human-readable label from key
    const generateLabel = (key: string): string => {
        // Split by dots, capitalize each part
        const parts = key.split('.');
        const formatted = parts.map(part => {
            // Split camelCase
            const words = part.replace(/([A-Z])/g, ' $1').trim();
            // Capitalize first letter of each word
            return words.charAt(0).toUpperCase() + words.slice(1);
        });
        return formatted.join(': ');
    };

    // Generate batch schema snippet
    const handleGenerateBatch = async () => {
        // Get missing keys
        let missingKeys = usedKeysInfo
            .filter(k => k.status === 'used-missing')
            .map(k => k.key);

        // Filter by prefix if provided
        if (batchPrefix.trim()) {
            const prefix = batchPrefix.trim().toLowerCase();
            missingKeys = missingKeys.filter(k => k.toLowerCase().startsWith(prefix));
        }

        // Sort and take first N
        missingKeys = missingKeys.sort().slice(0, batchSize);

        if (missingKeys.length === 0) {
            setPendingGenerated(false);
            setPendingCount(0);
            setShowCopied(false);
            logInfo('SchemaCoverage', 'No matching keys for batch', {
                prefix: batchPrefix || null,
            });
            return;
        }

        // Generate pending JSON structure
        const entries = missingKeys.map(key => ({
            key,
            type: guessType(key),
            translatable: guessTranslatable(key, guessType(key)),
            label: generateLabel(key),
        }));

        const pendingData = {
            generatedAt: new Date().toISOString(),
            prefix: batchPrefix || null,
            count: entries.length,
            entries,
        };

        // Create downloadable file
        const json = JSON.stringify(pendingData, null, 2);

        // Prefer File System Access API when available (more reliable than <a download>
        // on Safari/locked-down browsers).
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
        const anyWindow = window as any;
        if (anyWindow?.showSaveFilePicker) {
            try {
                const handle = await anyWindow.showSaveFilePicker({
                    suggestedName: 'schema.pending.json',
                    types: [
                        {
                            description: 'JSON',
                            accept: { 'application/json': ['.json'] },
                        },
                    ],
                });
                const writable = await handle.createWritable();
                await writable.write(json);
                await writable.close();
            } catch (e) {
                // User cancelled or browser blocked; fall back to blob download below.
            }
        }

        // Fallback: blob download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'schema.pending.json';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Give the browser a tick before revoking to avoid truncated/corrupt downloads.
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        setPendingGenerated(true);
        setPendingCount(entries.length);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);

        logInfo('SchemaCoverage', 'Generated schema.pending.json', {
            prefix: batchPrefix || null,
            batchSize,
            keysGenerated: entries.length,
        });
    };

    // Format timestamp
    const formatTimestamp = (date: Date): string => {
        return date.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Get badge for key status
    const getBadge = (status: KeyInfo['status']) => {
        switch (status) {
            case 'allowed':
                return { label: 'Schema', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' };
            case 'blocked':
                return { label: 'Blocked', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' };
            case 'used-allowed':
                return { label: 'Allowed', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' };
            case 'used-missing':
                return { label: 'Missing in CMS', bgClass: 'bg-red-500/20', textClass: 'text-red-400' };
        }
    };

    // Check if current tab allows selection
    const canSelect = activeTab === 'blocked' || activeTab === 'used';
    const selectableCount = activeTab === 'used'
        ? filteredKeys.filter(k => k.status === 'used-missing').length
        : filteredKeys.length;

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
                        <h1 className="text-lg font-semibold text-white">Schema Coverage</h1>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${loading
                                ? 'text-white/20'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                            }
                        `}
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="p-4 space-y-4">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-2 text-sm text-white/60 hover:text-white/80"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards - Row 1 */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={16} className="text-emerald-400" />
                                    <span className="text-xs text-white/40 uppercase tracking-wide">Allowed</span>
                                </div>
                                <p className="text-2xl font-semibold text-emerald-400">
                                    {loading ? '...' : schemaKeys.length}
                                </p>
                            </div>

                            <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldOff size={16} className="text-amber-400" />
                                    <span className="text-xs text-white/40 uppercase tracking-wide">Blocked</span>
                                </div>
                                <p className="text-2xl font-semibold text-amber-400">
                                    {loading ? '...' : blockedKeys.length}
                                </p>
                            </div>

                            <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={16} className="text-blue-400" />
                                    <span className="text-xs text-white/40 uppercase tracking-wide">DB Total</span>
                                </div>
                                <p className="text-2xl font-semibold text-blue-400">
                                    {loading ? '...' : dbKeys.length}
                                </p>
                            </div>
                        </div>

                        {/* KPI Cards - Row 2 (Website Used) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe size={16} className="text-purple-400" />
                                    <span className="text-xs text-white/40 uppercase tracking-wide">Used on Website</span>
                                </div>
                                <p className="text-2xl font-semibold text-purple-400">
                                    {usedKeys.length}
                                </p>
                            </div>

                            <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} className="text-red-400" />
                                    <span className="text-xs text-white/40 uppercase tracking-wide">Missing in CMS</span>
                                </div>
                                <p className="text-2xl font-semibold text-red-400">
                                    {loading ? '...' : missingInCmsCount}
                                </p>
                            </div>
                        </div>

                        {/* Last refreshed */}
                        {lastRefreshed && (
                            <p className="text-xs text-white/30 text-center">
                                Last refreshed: {formatTimestamp(lastRefreshed)}
                            </p>
                        )}

                        {/* Segmented Control (Tabs) */}
                        <div className="flex bg-[#0a1622]/60 rounded-xl p-1 border border-white/[0.06]">
                            <button
                                onClick={() => { setActiveTab('allowed'); setSelectedKeys(new Set()); }}
                                className={`
                                    flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === 'allowed'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                    }
                                `}
                            >
                                Allowed ({allowedKeys.length})
                            </button>
                            <button
                                onClick={() => { setActiveTab('blocked'); setSelectedKeys(new Set()); }}
                                className={`
                                    flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === 'blocked'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                    }
                                `}
                            >
                                Blocked ({blockedKeys.length})
                            </button>
                            <button
                                onClick={() => { setActiveTab('used'); setSelectedKeys(new Set()); }}
                                className={`
                                    flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === 'used'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                    }
                                `}
                            >
                                Used ({usedKeys.length})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search keys..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a1622]/60 border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        {/* Selection controls (blocked and used tabs) */}
                        {canSelect && selectableCount > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={selectAllVisible}
                                        className="text-xs text-[#5a9bc7] hover:text-[#5a9bc7]/80"
                                    >
                                        Select {activeTab === 'used' ? 'missing' : 'visible'} ({selectableCount})
                                    </button>
                                    {selectedKeys.size > 0 && (
                                        <button
                                            onClick={clearSelection}
                                            className="text-xs text-white/40 hover:text-white/60"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {selectedKeys.size > 0 && (
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#5a9bc7]/20 text-[#5a9bc7] rounded-lg text-sm font-medium hover:bg-[#5a9bc7]/30 transition-colors"
                                    >
                                        {showCopied ? (
                                            <>
                                                <Check size={14} />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                Copy {selectedKeys.size} keys
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Add Next Batch Panel (Used tab only) */}
                        {activeTab === 'used' && (
                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                                <button
                                    onClick={() => setShowBatchPanel(!showBatchPanel)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Wand2 size={18} className="text-purple-400" />
                                        <span className="text-sm font-medium text-white">Add Next Batch</span>
                                        <span className="text-xs text-white/40">(Admin)</span>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-white/40 transition-transform ${showBatchPanel ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {showBatchPanel && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
                                        {/* Inputs */}
                                        <div className="pt-4 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-white/40 mb-1 block">Prefix (optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. hero."
                                                    value={batchPrefix}
                                                    onChange={(e) => setBatchPrefix(e.target.value)}
                                                    className="w-full bg-[#0a1622]/80 border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/40 mb-1 block">Batch Size</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={500}
                                                    value={batchSize}
                                                    onChange={(e) => setBatchSize(Math.min(500, Math.max(1, parseInt(e.target.value) || 50)))}
                                                    className="w-full bg-[#0a1622]/80 border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Generate button */}
                                        <button
                                            onClick={handleGenerateBatch}
                                            className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Wand2 size={16} />
                                            Generate Batch
                                        </button>

                                        {/* Success message with instructions */}
                                        {pendingGenerated && (
                                            <div className="space-y-3">
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                                        <Check size={16} />
                                                        <span className="font-medium">Downloaded {pendingCount} keys</span>
                                                    </div>
                                                    <div className="text-sm text-white/60 space-y-2">
                                                        <p>File downloaded! Now run:</p>
                                                    </div>
                                                    <div className="mt-3 bg-[#0a1622] rounded-lg p-3 font-mono text-sm text-[#5a9bc7]">
                                                        npm run schema:apply-pending
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Keys List */}
                        <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <RefreshCw size={24} className="animate-spin mx-auto text-white/30 mb-2" />
                                    <p className="text-sm text-white/40">Loading...</p>
                                </div>
                            ) : filteredKeys.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-white/40">
                                        {searchQuery ? 'No matching keys found' : 'No keys in this category'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.04] max-h-[50vh] overflow-y-auto">
                                    {filteredKeys.map(({ key, status }) => {
                                        const badge = getBadge(status);
                                        const isSelectable = activeTab === 'blocked' || status === 'used-missing';

                                        return (
                                            <div
                                                key={key}
                                                onClick={() => isSelectable && toggleSelection(key)}
                                                className={`
                                                    px-4 py-3 flex items-center gap-3
                                                    ${isSelectable ? 'cursor-pointer hover:bg-white/[0.02]' : ''}
                                                    ${selectedKeys.has(key) ? 'bg-[#5a9bc7]/10' : ''}
                                                `}
                                            >
                                                {/* Checkbox (selectable only) */}
                                                {isSelectable && (
                                                    <div className={`
                                                        w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                                                        ${selectedKeys.has(key)
                                                            ? 'bg-[#5a9bc7] border-[#5a9bc7]'
                                                            : 'border-white/20'
                                                        }
                                                    `}>
                                                        {selectedKeys.has(key) && (
                                                            <Check size={12} className="text-white" />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Key name */}
                                                <span className="flex-1 text-sm text-white/80 font-mono truncate">
                                                    {key}
                                                </span>

                                                {/* Status badge */}
                                                <span className={`
                                                    text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap
                                                    ${badge.bgClass} ${badge.textClass}
                                                `}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-white/20">
                            {filteredKeys.length} of {
                                activeTab === 'allowed' ? allowedKeys.length :
                                    activeTab === 'blocked' ? blockedKeys.length :
                                        usedKeysInfo.length
                            } keys shown
                        </p>
                    </>
                )}
            </main>

            {/* Copied Toast */}
            {showCopied && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[#1c2836] px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <Check size={16} className="text-emerald-400" />
                        <span className="text-sm text-white">Copied to clipboard</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchemaCoverageScreen;
