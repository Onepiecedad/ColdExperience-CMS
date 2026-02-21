// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW EDITOR SCREEN — Unified preview-driven CMS editor
// Left pane: always-visible iframe showing coldexperience.se
// Right pane: editor fields for the section visible in the preview
//
// Bridge messages from the production site drive navigation:
//   scroll → section-level sync
//   navigate → page-level sync
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Monitor, Tablet, Smartphone, RefreshCw, ExternalLink,
    Loader2, ChevronRight, Settings, Link2, Link2Off
} from 'lucide-react';
import { EditorScreen } from './EditorScreen';
import {
    WEBSITE_PAGES,
    getPageById,
    reverseLookupUrl,
    lookupBySectionAttribute,
    getSubsectionWebsiteUrl,
} from '../content/contentMap';
import type { PageConfig, Section, Subsection } from '../content/contentMap';

const SITE_BASE = 'https://coldexperience.se';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
};

// ─── Bridge message types ─────────────────────────────────────────────────
interface BridgeMessage {
    source: 'coldexperience-bridge';
    type: 'bridge-ready' | 'scroll' | 'navigate' | 'language-change';
    url?: string;
    pageId?: string;
    sectionId?: string;
    cmsSectionId?: string;
    lang?: string;
}

function isBridgeMessage(data: unknown): data is BridgeMessage {
    return (
        typeof data === 'object' &&
        data !== null &&
        (data as BridgeMessage).source === 'coldexperience-bridge'
    );
}

export function PreviewEditorScreen() {
    const navigate = useNavigate();
    const { pageId: urlPageId, sectionId: urlSectionId, subsectionId: urlSubsectionId } = useParams<{
        pageId?: string;
        sectionId?: string;
        subsectionId?: string;
    }>();

    // Default to home/hero if no URL params
    const [activePageId, setActivePageId] = useState(urlPageId || 'home');
    const [activeSectionId, setActiveSectionId] = useState(urlSectionId || 'hero');
    const [activeSubsectionId, setActiveSubsectionId] = useState<string | undefined>(urlSubsectionId);
    const [syncActive, setSyncActive] = useState(true);
    const [bridgeReady, setBridgeReady] = useState(false);
    const [device, setDevice] = useState<DeviceMode>('desktop');
    const [isLoading, setIsLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const [showSystemMenu, setShowSystemMenu] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const systemMenuRef = useRef<HTMLDivElement>(null);

    // Ref always tracks the latest subsection — immune to useCallback closure staleness
    const subsectionRef = useRef(activeSubsectionId);
    subsectionRef.current = activeSubsectionId;

    // Refs for page/section — used in navigate handler to compare incoming vs current
    const activePageIdRef = useRef(activePageId);
    activePageIdRef.current = activePageId;
    const activeSectionIdRef = useRef(activeSectionId);
    activeSectionIdRef.current = activeSectionId;

    // ── Sync from URL params to state ─────────────────────────────────
    useEffect(() => {

        if (urlPageId && urlSectionId) {
            setActivePageId(urlPageId);
            setActiveSectionId(urlSectionId);
            setActiveSubsectionId(urlSubsectionId);
        }
    }, [urlPageId, urlSectionId, urlSubsectionId]);

    // ── Build preview URL (debounced to avoid iframe jank) ────────────
    const page = getPageById(activePageId);
    const previewUrl = page?.websiteUrl
        ? `${SITE_BASE}/${language}${page.websiteUrl === '/' ? '' : page.websiteUrl}`
        : `${SITE_BASE}/${language}`;

    const [debouncedPreviewUrl, setDebouncedPreviewUrl] = useState(previewUrl);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedPreviewUrl(previewUrl), 300);
        return () => clearTimeout(timer);
    }, [previewUrl]);

    // ── Listen for bridge messages ────────────────────────────────────
    // Uses subsectionRef (not activeSubsectionId from closure) to avoid
    // stale-closure race: handleSectionSelect sets state but the OLD
    // useCallback handler stays attached until React re-renders. A ref
    // always reads the latest value synchronously.
    const handleBridgeMessage = useCallback((event: MessageEvent) => {
        if (!isBridgeMessage(event.data)) return;
        if (!syncActive) return;

        const msg = event.data;

        // Read from ref — always current, never stale
        const isSubsectionActive = !!subsectionRef.current;



        switch (msg.type) {
            case 'bridge-ready':
                setBridgeReady(true);
                break;

            case 'scroll':
                if (isSubsectionActive) {

                    break;
                }
                if (msg.cmsSectionId) {
                    const lookup = lookupBySectionAttribute(msg.cmsSectionId);

                    setActivePageId(lookup.pageId);
                    setActiveSectionId(lookup.sectionId);
                    setActiveSubsectionId(undefined);
                    navigate(`/edit/${lookup.pageId}/sections/${lookup.sectionId}`, { replace: true });
                }
                break;

            case 'navigate':
                if (msg.url) {
                    const lookup = reverseLookupUrl(msg.url);

                    // If a subsection is active and the navigation is within the
                    // same page/section, ignore it (prevents scroll-triggered
                    // overrides while editing a subsection). But if the user
                    // navigates to a DIFFERENT page, follow the navigation and
                    // clear the subsection state.
                    if (isSubsectionActive &&
                        lookup.pageId === activePageIdRef.current &&
                        lookup.sectionId === activeSectionIdRef.current) {
                        if (msg.lang) setLanguage(msg.lang);
                        break;
                    }

                    setActivePageId(lookup.pageId);
                    setActiveSectionId(lookup.sectionId);
                    setActiveSubsectionId(lookup.subsectionId);
                    subsectionRef.current = lookup.subsectionId;
                    const path = lookup.subsectionId
                        ? `/edit/${lookup.pageId}/sections/${lookup.sectionId}/${lookup.subsectionId}`
                        : `/edit/${lookup.pageId}/sections/${lookup.sectionId}`;
                    navigate(path, { replace: true });
                }
                if (msg.lang) {
                    setLanguage(msg.lang);
                }
                break;

            case 'language-change':
                if (msg.lang) {
                    setLanguage(msg.lang);
                }
                break;
        }
    }, [syncActive, navigate]);

    useEffect(() => {
        window.addEventListener('message', handleBridgeMessage);
        return () => window.removeEventListener('message', handleBridgeMessage);
    }, [handleBridgeMessage]);

    // ── Manual section navigation (dropdown) ──────────────────────────
    const handleSectionSelect = (newPageId: string, newSectionId: string, newSubsectionId?: string) => {
        // Update ref SYNCHRONOUSLY before React re-renders — the bridge handler
        // reads subsectionRef.current, so it must be correct before any async
        // postMessage events from the iframe can fire.
        subsectionRef.current = newSubsectionId;

        setActivePageId(newPageId);
        setActiveSectionId(newSectionId);
        setActiveSubsectionId(newSubsectionId);

        const path = newSubsectionId
            ? `/edit/${newPageId}/sections/${newSectionId}/${newSubsectionId}`
            : `/edit/${newPageId}/sections/${newSectionId}`;
        navigate(path, { replace: true });

        // Tell the preview to scroll to this section
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                source: 'coldexperience-cms',
                type: 'scroll-to-section',
                sectionId: newSectionId,
            }, '*');
        }

        // Navigate the iframe to the correct page / detail page
        if (iframeRef.current) {
            let targetPath: string | undefined;

            // Subsection? Navigate to its detail page (e.g. /husky-ride)
            if (newSubsectionId) {
                targetPath = getSubsectionWebsiteUrl(newSubsectionId);
            }

            // Different page? Navigate to the page URL
            if (!targetPath) {
                const newPage = getPageById(newPageId);
                if (newPage?.websiteUrl && newPage.id !== activePageId) {
                    targetPath = newPage.websiteUrl === '/' ? '' : newPage.websiteUrl;
                }
            }

            if (targetPath !== undefined) {
                const newUrl = `${SITE_BASE}/${language}${targetPath}`;
                setIsLoading(true);
                iframeRef.current.src = newUrl;
            }
        }
    };

    // ── Close system menu on outside click ────────────────────────────
    useEffect(() => {
        if (!showSystemMenu) return;
        const handler = (e: MouseEvent) => {
            if (systemMenuRef.current && !systemMenuRef.current.contains(e.target as Node)) {
                setShowSystemMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showSystemMenu]);

    // ── Content pages and system pages ────────────────────────────────
    const contentPages = WEBSITE_PAGES.filter(p => p.group !== 'system');
    const systemPages = WEBSITE_PAGES.filter(p => p.group === 'system');

    return (
        <div className="preview-editor-layout">
            {/* ═══════ LEFT: Preview Pane ═══════ */}
            <div className="preview-pane">
                {/* Preview Toolbar */}
                <div className="preview-toolbar">
                    <div className="preview-toolbar-left">
                        {/* Sync indicator */}
                        <button
                            onClick={() => setSyncActive(prev => !prev)}
                            className={`preview-toolbar-btn ${syncActive ? 'active' : ''}`}
                            title={syncActive ? 'Sync ON – preview drives editor' : 'Sync OFF – browse freely'}
                        >
                            {syncActive ? <Link2 size={14} /> : <Link2Off size={14} />}
                        </button>

                        {/* Bridge status */}
                        <span className={`bridge-status ${bridgeReady ? 'ready' : ''}`}>
                            {bridgeReady ? '● Bridge' : '○ Bridge'}
                        </span>
                    </div>

                    <div className="preview-toolbar-center">
                        {/* Device mode */}
                        {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((d) => (
                            <button
                                key={d}
                                onClick={() => setDevice(d)}
                                className={`preview-toolbar-btn ${device === d ? 'active' : ''}`}
                                title={d.charAt(0).toUpperCase() + d.slice(1)}
                            >
                                {d === 'desktop' ? <Monitor size={14} /> :
                                    d === 'tablet' ? <Tablet size={14} /> :
                                        <Smartphone size={14} />}
                            </button>
                        ))}
                    </div>

                    <div className="preview-toolbar-right">
                        <button
                            onClick={() => {
                                if (iframeRef.current) {
                                    setIsLoading(true);
                                    iframeRef.current.src = iframeRef.current.src;
                                }
                            }}
                            className="preview-toolbar-btn"
                            title="Refresh"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <a
                            href={debouncedPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="preview-toolbar-btn"
                            title="Open in new tab"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

                {/* Preview iframe */}
                <div className="preview-iframe-container">
                    {isLoading && (
                        <div className="preview-loader">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                    )}
                    <div
                        className="preview-iframe-sizer"
                        style={{ width: DEVICE_WIDTHS[device] }}
                    >
                        <iframe
                            ref={iframeRef}
                            src={debouncedPreviewUrl}
                            title="Live Preview"
                            className="preview-iframe"
                            onLoad={() => setIsLoading(false)}
                            allow="autoplay"
                        />
                    </div>
                </div>
            </div>

            {/* ═══════ RIGHT: Editor Pane ═══════ */}
            <div className="editor-main-pane">
                {/* Compact Navigation Bar */}
                <div className="editor-nav-bar">
                    <div className="editor-nav-breadcrumb">
                        {/* Section selector dropdown */}
                        <SectionSelector
                            pages={contentPages}
                            activePageId={activePageId}
                            activeSectionId={activeSectionId}
                            activeSubsectionId={activeSubsectionId}
                            onSelect={handleSectionSelect}
                        />
                    </div>

                    <div className="editor-nav-actions">
                        {/* System pages menu */}
                        <div className="relative" ref={systemMenuRef}>
                            <button
                                onClick={() => setShowSystemMenu(prev => !prev)}
                                className={`preview-toolbar-btn ${showSystemMenu ? 'active' : ''}`}
                                title="System Pages"
                            >
                                <Settings size={14} />
                            </button>

                            {showSystemMenu && (
                                <div className="system-menu">
                                    {systemPages.map((sp) => (
                                        <div key={sp.id} className="system-menu-group">
                                            <div className="system-menu-title">
                                                {sp.icon} {sp.label}
                                            </div>
                                            {sp.sections.map((sec) => (
                                                <button
                                                    key={sec.id}
                                                    className={`system-menu-item ${activePageId === sp.id && activeSectionId === sec.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        handleSectionSelect(sp.id, sec.id);
                                                        setShowSystemMenu(false);
                                                    }}
                                                >
                                                    <span>{sec.icon}</span>
                                                    <span>{sec.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor Screen (reuse existing component) */}
                <EditorScreen />
            </div>
        </div>
    );
}

// ─── Section Selector Component ───────────────────────────────────────────
function SectionSelector({
    pages,
    activePageId,
    activeSectionId,
    activeSubsectionId,
    onSelect,
}: {
    pages: PageConfig[];
    activePageId: string;
    activeSectionId: string;
    activeSubsectionId?: string;
    onSelect: (pageId: string, sectionId: string, subsectionId?: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentPage = pages.find(p => p.id === activePageId);
    const currentSection = currentPage?.sections.find((s: Section) => s.id === activeSectionId);
    const currentSubsection = activeSubsectionId
        ? currentSection?.subsections?.find((sub: Subsection) => sub.id === activeSubsectionId)
        : undefined;

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Build breadcrumb label
    const sectionLabel = currentSubsection
        ? `${currentSection?.icon} ${currentSection?.label} › ${currentSubsection.icon} ${currentSubsection.label}`
        : `${currentSection?.icon} ${currentSection?.label || activeSectionId}`;

    return (
        <div className="section-selector" ref={dropdownRef}>
            <button
                className="section-selector-trigger"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span className="section-selector-page">
                    {currentPage?.icon} {currentPage?.label || activePageId}
                </span>
                <ChevronRight size={12} className="section-selector-arrow" />
                <span className="section-selector-section">
                    {sectionLabel}
                </span>
            </button>

            {isOpen && (
                <div className="section-selector-dropdown">
                    {pages.map((page) => (
                        <div key={page.id} className="section-selector-group">
                            <div className="section-selector-group-title">
                                {page.icon} {page.label}
                            </div>
                            {page.sections.map((section: Section) => (
                                <div key={section.id}>
                                    <button
                                        className={`section-selector-item ${activePageId === page.id && activeSectionId === section.id && !activeSubsectionId ? 'active' : ''}`}
                                        onClick={() => {
                                            onSelect(page.id, section.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span>{section.icon}</span>
                                        <span>{section.label}</span>
                                    </button>
                                    {/* Subsection items */}
                                    {section.subsections?.map((sub: Subsection) => (
                                        <button
                                            key={sub.id}
                                            className={`section-selector-item section-selector-sub ${activePageId === page.id && activeSectionId === section.id && activeSubsectionId === sub.id ? 'active' : ''}`}
                                            onClick={() => {
                                                onSelect(page.id, section.id, sub.id);
                                                setIsOpen(false);
                                            }}
                                        >
                                            <span>{sub.icon}</span>
                                            <span>{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PreviewEditorScreen;
