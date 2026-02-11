// ═══════════════════════════════════════════════════════════════════════════
// DEBUG LOG SERVICE - Central logging with localStorage persistence
// Captures events from hooks and screens for debugging
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'coldexperience:debug_logs';
const MAX_ENTRIES = 500;

export type LogLevel = 'info' | 'success' | 'error' | 'warn';

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    source: string;
    message: string;
    details?: Record<string, unknown>;
}

type LogSubscriber = (logs: LogEntry[]) => void;

// In-memory cache + subscribers
let logs: LogEntry[] = [];
const subscribers: Set<LogSubscriber> = new Set();

// ============================================================================
// INITIALIZATION
// ============================================================================

function loadFromStorage(): void {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            logs = JSON.parse(stored);
        }
    } catch (err) {
        console.warn('[DebugLog] Failed to load from storage:', err);
        logs = [];
    }
}

function saveToStorage(): void {
    try {
        // Trim to max entries before saving
        if (logs.length > MAX_ENTRIES) {
            logs = logs.slice(-MAX_ENTRIES);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (err) {
        console.warn('[DebugLog] Failed to save to storage:', err);
    }
}

// Load on module init
loadFromStorage();

// ============================================================================
// CORE API
// ============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function notifySubscribers(): void {
    subscribers.forEach(fn => fn([...logs]));
}

/**
 * Add a log entry
 */
export function log(
    level: LogLevel,
    source: string,
    message: string,
    details?: Record<string, unknown>
): void {
    const entry: LogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        level,
        source,
        message,
        details,
    };

    logs.push(entry);
    saveToStorage();
    notifySubscribers();

    // Also log to console in dev
    if (import.meta.env.DEV) {
        const icon = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' }[level];
        console.log(`${icon} [${source}] ${message}`, details || '');
    }
}

// Convenience methods
export const logInfo = (source: string, message: string, details?: Record<string, unknown>) =>
    log('info', source, message, details);

export const logSuccess = (source: string, message: string, details?: Record<string, unknown>) =>
    log('success', source, message, details);

export const logWarn = (source: string, message: string, details?: Record<string, unknown>) =>
    log('warn', source, message, details);

export const logError = (source: string, message: string, details?: Record<string, unknown>) =>
    log('error', source, message, details);

// ============================================================================
// READ / EXPORT / CLEAR
// ============================================================================

/**
 * Get all logs (newest first)
 */
export function getLogs(): LogEntry[] {
    return [...logs].reverse();
}

/**
 * Subscribe to log updates
 */
export function subscribe(callback: LogSubscriber): () => void {
    subscribers.add(callback);
    // Immediately call with current logs
    callback([...logs]);

    // Return unsubscribe function
    return () => {
        subscribers.delete(callback);
    };
}

/**
 * Export logs as copyable text
 */
export function getLogsAsText(): string {
    const lines = logs.map(entry => {
        const date = new Date(entry.timestamp);
        const time = date.toLocaleTimeString('sv-SE', { hour12: false });
        const level = entry.level.toUpperCase().padEnd(7);
        const details = entry.details ? ` | ${JSON.stringify(entry.details)}` : '';
        return `[${time}] ${level} [${entry.source}] ${entry.message}${details}`;
    });

    return [
        `=== ColdExperience Debug Log ===`,
        `Exported: ${new Date().toISOString()}`,
        `Entries: ${logs.length}`,
        ``,
        ...lines,
    ].join('\n');
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
    logs = [];
    saveToStorage();
    notifySubscribers();
}

/**
 * Get log count
 */
export function getLogCount(): number {
    return logs.length;
}
