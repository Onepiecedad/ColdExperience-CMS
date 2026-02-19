// ═══════════════════════════════════════════════════════════════════════════
// LIVE PREVIEW - Side-by-side iframe panel showing coldexperience.se
// Synchronized with the editor: auto-navigates to matching page/section
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Loader2, Link2 } from 'lucide-react';

const SITE_BASE = 'https://coldexperience.se';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
};

interface LivePreviewProps {
    websiteUrl: string | undefined;
    language: string;
    isOpen: boolean;
    onClose: () => void;
    activeSection?: string;      // Current section ID from contentMap
    websiteAnchor?: string;      // DOM element ID on the production site
}

export function LivePreview({ websiteUrl, language, isOpen, onClose, activeSection: _activeSection, websiteAnchor }: LivePreviewProps) {
    const [device, setDevice] = useState<DeviceMode>('desktop');
    const [isLoading, setIsLoading] = useState(true);
    const [syncActive, setSyncActive] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Build the base URL (without anchor): https://coldexperience.se/{lang}{websiteUrl}
    const baseUrl = websiteUrl
        ? `${SITE_BASE}/${language}${websiteUrl === '/' ? '' : websiteUrl}`
        : `${SITE_BASE}/${language}`;

    // Full URL including anchor for section scrolling
    const fullUrl = websiteAnchor && syncActive
        ? `${baseUrl}#${websiteAnchor}`
        : baseUrl;

    // When URL changes (page or anchor), update iframe src
    // We track the last loaded URL so we only set src when it actually changes
    const lastLoadedUrl = useRef<string>('');

    useEffect(() => {
        if (!isOpen || !iframeRef.current) return;

        // Only navigate if the URL actually changed
        if (fullUrl !== lastLoadedUrl.current) {
            setIsLoading(true);
            iframeRef.current.src = fullUrl;
            lastLoadedUrl.current = fullUrl;
        }
    }, [fullUrl, isOpen]);

    const handleRefresh = () => {
        setIsLoading(true);
        if (iframeRef.current) {
            iframeRef.current.src = fullUrl;
            lastLoadedUrl.current = fullUrl;
        }
    };

    const handleOpenExternal = () => {
        window.open(fullUrl, '_blank', 'noopener');
    };

    if (!isOpen) return null;

    return (
        <div className="live-preview-panel">
            {/* Compact Toolbar */}
            <div className="live-preview-toolbar">
                <div className="live-preview-toolbar-left">
                    <span className="live-preview-label">Preview</span>
                    <span className="live-preview-url">{fullUrl.replace(SITE_BASE, '')}</span>
                </div>

                <div className="live-preview-toolbar-center">
                    {/* Sync toggle */}
                    <button
                        onClick={() => setSyncActive(prev => !prev)}
                        className={`live-preview-device-btn ${syncActive ? 'active' : ''}`}
                        title={syncActive ? 'Sync active — preview follows editor' : 'Sync paused — preview stays put'}
                    >
                        <Link2 size={14} />
                    </button>

                    {/* Device switcher */}
                    {([
                        { mode: 'desktop' as DeviceMode, icon: Monitor, tip: 'Desktop' },
                        { mode: 'tablet' as DeviceMode, icon: Tablet, tip: 'Tablet' },
                        { mode: 'mobile' as DeviceMode, icon: Smartphone, tip: 'Mobile' },
                    ]).map(({ mode, icon: Icon, tip }) => (
                        <button
                            key={mode}
                            onClick={() => setDevice(mode)}
                            className={`live-preview-device-btn ${device === mode ? 'active' : ''}`}
                            title={tip}
                        >
                            <Icon size={14} />
                        </button>
                    ))}
                </div>

                <div className="live-preview-toolbar-right">
                    <button onClick={handleRefresh} className="live-preview-action-btn" title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={handleOpenExternal} className="live-preview-action-btn" title="Open in new tab">
                        <ExternalLink size={14} />
                    </button>
                    <button onClick={onClose} className="live-preview-close-btn" title="Close preview">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Iframe container */}
            <div className="live-preview-iframe-wrap">
                {isLoading && (
                    <div className="live-preview-loader">
                        <Loader2 size={28} className="animate-spin" />
                        <span>Loading preview…</span>
                    </div>
                )}
                <div
                    className="live-preview-iframe-sizer"
                    style={{ maxWidth: DEVICE_WIDTHS[device] }}
                >
                    <iframe
                        ref={iframeRef}
                        src={fullUrl}
                        title="Live Preview"
                        className="live-preview-iframe"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            </div>
        </div>
    );
}
