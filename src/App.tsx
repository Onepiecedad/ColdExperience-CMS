import { useState, useEffect, useCallback, useMemo } from 'react';
import { Snowflake, LogOut, Menu, X, Globe, Sparkles, Type, Image, ChevronRight, Settings, Check, Loader2, Database, RefreshCw, ImageIcon, Package } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import { MediaLibrary } from './components/MediaLibrary';
import { SectionMediaLibrary } from './components/SectionMediaLibrary';
import { ToastContainer } from './components/ui/Toast';
import { PackageEditor } from './components/PackageEditor';
import { SettingsPanel } from './components/SettingsPanel';
import { signOut, getCurrentUser, isEmailAllowed } from './lib/supabase';
import { useCmsContent } from './hooks/useCmsContent';
import { useToast } from './hooks/useToast';
import { WEBSITE_PAGES, LANGUAGES } from './content/contentMap';
import type { Section, Subsection } from './content/contentMap';

type ContentMode = 'text' | 'media';

function App() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState('home');
    const [activeSection, setActiveSection] = useState('hero');
    const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
    const [language, setLanguage] = useState('en');
    const [contentMode, setContentMode] = useState<ContentMode>('text');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPackages, setShowPackages] = useState(false);

    // Using CMS content hook for data with Supabase integration
    const { saveChanges, syncToSupabase, forceResyncFromLocalJson, meta } = useCmsContent();
    const { toasts, addToast: _addToast, removeToast } = useToast();

    const currentPage = WEBSITE_PAGES.find(p => p.id === activePage) || WEBSITE_PAGES[0];

    useEffect(() => {
        checkAuth();
    }, []);

    // Reset to first section when changing pages
    useEffect(() => {
        setActiveSection(currentPage.sections[0]?.id || 'hero');
    }, [activePage, currentPage.sections]);

    const checkAuth = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser && isEmailAllowed(currentUser.email || '')) {
                setUser(currentUser);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
    };

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const success = await saveChanges();
            if (success) {
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 2000);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    }, [saveChanges]);

    // Cmd+S / Ctrl+S keyboard shortcut to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    const handleSync = useCallback(async () => {
        setSyncing(true);
        setSyncSuccess(false);
        try {
            const success = await syncToSupabase();
            if (success) {
                setSyncSuccess(true);
                setTimeout(() => setSyncSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    }, [syncToSupabase]);

    const [forceResyncing, setForceResyncing] = useState(false);

    const handleForceResync = useCallback(async () => {
        if (!confirm('⚠️ FORCE RESYNC: Detta kommer att skriva över ALL data i Supabase med den lokala JSON-filen. Använd detta för att fixa korrupt data som [object Object]. Fortsätta?')) {
            return;
        }

        setForceResyncing(true);
        try {
            const success = await forceResyncFromLocalJson();
            if (success) {
                alert('✅ Force resync complete! All fields have been updated from the local JSON file.');
            } else {
                alert('❌ Force resync misslyckades. Kolla konsolen för detaljer.');
            }
        } catch (error) {
            console.error('Force resync failed:', error);
            alert('❌ Force resync misslyckades: ' + (error as Error).message);
        } finally {
            setForceResyncing(false);
        }
    }, [forceResyncFromLocalJson]);

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#040810] flex items-center justify-center">
                {/* Ambient glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3f7ba7]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#5a9bc7]/8 rounded-full blur-[100px]" />

                <div className="relative flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3f7ba7] to-[#285a82] rounded-2xl blur-xl opacity-50 animate-pulse" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#3f7ba7] to-[#285a82] rounded-2xl flex items-center justify-center">
                            <Snowflake className="text-white" size={32} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white/80 text-sm font-medium tracking-wide">Läser in...</span>
                        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#3f7ba7] to-[#5a9bc7] animate-pulse" style={{ width: '60%' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Auth screen
    if (!user) {
        return <AuthScreen onAuthenticated={() => checkAuth()} />;
    }

    // Main dashboard
    return (
        <div className="min-h-screen bg-[#040810] text-white">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            {/* ═══════════════════════════════════════════════════════════════════════
          HEADER - Fixed top bar with logo, page tabs, and language selector
      ═══════════════════════════════════════════════════════════════════════ */}
            <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="h-full max-w-[1800px] mx-auto px-6 flex items-center justify-between">

                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#3f7ba7] to-[#285a82] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative w-10 h-10 bg-gradient-to-br from-[#3f7ba7]/90 to-[#285a82] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                                <Snowflake className="text-white" size={20} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-[13px] font-semibold text-white leading-none">ColdExperience</span>
                            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#5a9bc7]/80 mt-0.5">CMS-System</span>
                        </div>
                    </div>

                    {/* Page Navigation - Desktop */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {WEBSITE_PAGES.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => { setActivePage(page.id); setShowMediaLibrary(false); setShowSettings(false); setShowPackages(false); }}
                                className={`
                  relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300
                  ${activePage === page.id && !showMediaLibrary && !showSettings && !showPackages
                                        ? 'text-white'
                                        : 'text-white/50 hover:text-white/80'
                                    }
                `}
                            >
                                {page.label}
                                {/* Active indicator */}
                                {activePage === page.id && !showMediaLibrary && !showSettings && !showPackages && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#3f7ba7] to-transparent" />
                                )}
                            </button>
                        ))}
                        {/* Packages button */}
                        <button
                            onClick={() => { setShowPackages(true); setShowMediaLibrary(false); setShowSettings(false); }}
                            className={`
                              relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                              ${showPackages
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/80'
                                }
                            `}
                        >
                            <Package size={14} />
                            Packages
                            {showPackages && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#3f7ba7] to-transparent" />
                            )}
                        </button>
                        {/* Media Library button */}
                        <button
                            onClick={() => { setShowMediaLibrary(true); setShowPackages(false); setShowSettings(false); }}
                            className={`
                              relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                              ${showMediaLibrary
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/80'
                                }
                            `}
                        >
                            <ImageIcon size={14} />
                            Media
                            {showMediaLibrary && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#3f7ba7] to-transparent" />
                            )}
                        </button>
                    </nav>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`
                hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300
                ${showSaved
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-[#3f7ba7]/20 text-[#5a9bc7] border border-[#3f7ba7]/30 hover:bg-[#3f7ba7]/30'
                                }
              `}
                        >
                            {saving ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : showSaved ? (
                                <Check size={14} />
                            ) : (
                                <Sparkles size={14} />
                            )}
                            {saving ? 'Saving...' : showSaved ? 'Saved!' : 'Save'}
                        </button>

                        {/* Language Selector */}
                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-300
                    ${language === lang.code
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/40'
                                            : 'text-white/40 hover:text-white/70'
                                        }
                  `}
                                >
                                    <span>{lang.flag}</span>
                                    <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>

                        {/* Settings & Sign Out */}
                        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.06]">
                            <button
                                onClick={() => { setShowSettings(true); setShowMediaLibrary(false); setShowPackages(false); }}
                                className={`p-2 transition-colors ${showSettings ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-white/60 hover:text-white"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-[#040810]/95 backdrop-blur-xl pt-20"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div className="p-6 space-y-6" onClick={e => e.stopPropagation()}>
                        {/* Page Navigation */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-medium tracking-widest uppercase text-white/30 px-4">Sidor</span>
                            {WEBSITE_PAGES.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => {
                                        setActivePage(page.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                    ${activePage === page.id
                                            ? 'bg-[#3f7ba7]/20 text-white'
                                            : 'text-white/50 hover:bg-white/5'
                                        }
                  `}
                                >
                                    {page.label}
                                </button>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT - Sidebar + Content area
      ═══════════════════════════════════════════════════════════════════════ */}
            <div className="flex pt-16">

                {/* ─────────────────────────────────────────────────────────────────────
            LEFT SIDEBAR - Page sections navigation
        ───────────────────────────────────────────────────────────────────── */}
                <aside className={`${(showMediaLibrary || showSettings || showPackages) ? 'hidden' : 'hidden lg:flex'} flex-col w-64 fixed left-0 top-16 bottom-0 bg-[#0a1622]/50 border-r border-white/[0.04]`}>
                    {/* Current Page Header */}
                    <div className="p-6 border-b border-white/[0.04]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3f7ba7]/30 to-[#285a82]/30 border border-[#3f7ba7]/20 flex items-center justify-center">
                                <Globe size={16} className="text-[#5a9bc7]" />
                            </div>
                            <div>
                                <h2 className="text-white font-medium text-sm">{currentPage.label}</h2>
                                <p className="text-[11px] text-white/40">{currentPage.sections.length} sektioner</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <span className="block text-[10px] font-medium tracking-widest uppercase text-white/30 px-3 py-2">
                            Sections
                        </span>
                        {currentPage.sections.map((section, index) => {
                            const sectionWithSubs = section as Section;
                            const hasSubsections = Array.isArray(sectionWithSubs.subsections);
                            const subsections: Subsection[] = hasSubsections ? sectionWithSubs.subsections! : [];
                            const isExpanded = activeSection === section.id || subsections.some((s: Subsection) => activeSubsection === s.id);

                            return (
                                <div key={section.id}>
                                    <button
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setActiveSubsection(null);
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 group
                                            ${activeSection === section.id && !activeSubsection
                                                ? 'bg-gradient-to-r from-[#3f7ba7]/25 to-transparent border-l-2 border-[#3f7ba7] text-white'
                                                : isExpanded
                                                    ? 'text-white/70 bg-white/[0.02]'
                                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                                            }
                                        `}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <span className={`text-sm transition-transform duration-300 ${activeSection === section.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                                            {section.icon}
                                        </span>
                                        <span className="text-[13px] font-medium flex-1">{section.label}</span>
                                        {hasSubsections ? (
                                            <ChevronRight
                                                size={14}
                                                className={`text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                            />
                                        ) : (
                                            activeSection === section.id && !activeSubsection && (
                                                <ChevronRight size={14} className="text-[#5a9bc7]" />
                                            )
                                        )}
                                    </button>

                                    {/* Subsections (expandable) */}
                                    {hasSubsections && isExpanded && (
                                        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                                            {subsections.map((sub: Subsection) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => {
                                                        setActiveSection(section.id);
                                                        setActiveSubsection(sub.id);
                                                    }}
                                                    className={`
                                                        w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all duration-200
                                                        ${activeSubsection === sub.id
                                                            ? 'bg-[#3f7ba7]/20 text-white border-l-2 border-[#3f7ba7] -ml-3 pl-[0.625rem]'
                                                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                                                        }
                                                    `}
                                                >
                                                    <span className="text-xs">{sub.icon}</span>
                                                    <span className="text-[12px] font-medium">{sub.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Content Mode Toggle */}
                    <div className="p-4 border-t border-white/[0.04]">
                        <div className="p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className="flex">
                                <button
                                    onClick={() => setContentMode('text')}
                                    className={`
                    flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-300
                    ${contentMode === 'text'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                  `}
                                >
                                    <Type size={14} />
                                    Text
                                </button>
                                <button
                                    onClick={() => setContentMode('media')}
                                    className={`
                    flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-300
                    ${contentMode === 'media'
                                            ? 'bg-[#3f7ba7]/30 text-white border border-[#3f7ba7]/30'
                                            : 'text-white/40 hover:text-white/60'
                                        }
                  `}
                                >
                                    <Image size={14} />
                                    Media
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Supabase Sync Button */}
                    <div className="p-4 border-t border-white/[0.04]">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-medium transition-all duration-300
                                ${syncSuccess
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20'
                                }
                            `}
                        >
                            {syncing ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    Syncing to Supabase...
                                </>
                            ) : syncSuccess ? (
                                <>
                                    <Database size={14} />
                                    {meta.total_fields} fält synkade!
                                </>
                            ) : (
                                <>
                                    <Database size={14} />
                                    Sync all to Supabase
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-white/30 text-center mt-2">
                            Uploading all {meta.total_fields} fields
                        </p>

                        {/* Force Resync Button - resets from local JSON file */}
                        <button
                            onClick={handleForceResync}
                            disabled={forceResyncing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl text-[11px] font-medium transition-all duration-300 bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                        >
                            {forceResyncing ? (
                                <>
                                    <RefreshCw size={12} className="animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={12} />
                                    🔧 Force Resync (fixa korrupt data)
                                </>
                            )}
                        </button>
                        <p className="text-[9px] text-white/20 text-center mt-1.5">
                            Resets ALL fields from local JSON
                        </p>
                    </div>
                </aside>

                {/* ─────────────────────────────────────────────────────────────────────
            MAIN CONTENT AREA
        ───────────────────────────────────────────────────────────────────── */}
                <main className={`flex-1 min-h-[calc(100vh-4rem)] ${(showMediaLibrary || showSettings || showPackages) ? '' : 'lg:ml-64'}`}>
                    {/* Ambient Background */}
                    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${(showMediaLibrary || showSettings || showPackages) ? '' : 'lg:ml-64'}`}>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3f7ba7]/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-[#5a9bc7]/[0.02] rounded-full blur-[120px] translate-y-1/2" />
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 p-8 lg:p-12 max-w-6xl mx-auto">
                        {showSettings ? (
                            /* Settings View */
                            <SettingsPanel />
                        ) : showPackages ? (
                            /* Packages View */
                            <PackageEditor />
                        ) : showMediaLibrary ? (
                            /* Media Library View */
                            <MediaLibrary />
                        ) : (
                            <>
                                {/* Section Header */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{currentPage.sections.find(s => s.id === activeSection)?.icon}</span>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-2xl font-semibold text-white">
                                                    {currentPage.sections.find(s => s.id === activeSection)?.label}
                                                </h1>
                                                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase text-[#5a9bc7] bg-[#3f7ba7]/20 rounded-md border border-[#3f7ba7]/30">
                                                    {currentPage.label}
                                                </span>
                                            </div>
                                            <p className="text-white/40 text-sm mt-1">
                                                Editing {contentMode === 'text' ? 'text content' : 'images and media'} for this section
                                            </p>
                                        </div>
                                    </div>

                                    {/* Breadcrumb */}
                                    <div className="flex items-center gap-2 text-[12px] text-white/30 flex-wrap">
                                        <span className="text-[#5a9bc7]">{currentPage.label}</span>
                                        <ChevronRight size={12} />
                                        <span>{currentPage.sections.find(s => s.id === activeSection)?.label}</span>
                                        {activeSubsection && (
                                            <>
                                                <ChevronRight size={12} />
                                                <span className="text-white/50">
                                                    {(currentPage.sections.find(s => s.id === activeSection) as Section | undefined)?.subsections?.find((sub: Subsection) => sub.id === activeSubsection)?.label}
                                                </span>
                                            </>
                                        )}
                                        <ChevronRight size={12} />
                                        <span>{contentMode === 'text' ? 'Text' : 'Media'}</span>
                                        <ChevronRight size={12} />
                                        <span className="flex items-center gap-1">
                                            {LANGUAGES.find(l => l.code === language)?.flag}
                                            {LANGUAGES.find(l => l.code === language)?.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Editor Card */}
                                <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                                    {/* Card Header */}
                                    <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${contentMode === 'text' ? 'bg-emerald-400' : 'bg-[#5a9bc7]'}`} />
                                            <span className="text-sm font-medium text-white/70">
                                                {contentMode === 'text' ? 'Text Content' : 'Media & Images'}
                                            </span>
                                        </div>

                                        {/* Mobile Content Mode Toggle */}
                                        <div className="lg:hidden flex items-center gap-2 p-1 bg-white/[0.03] rounded-lg">
                                            <button
                                                onClick={() => setContentMode('text')}
                                                className={`p-2 rounded-md transition-all ${contentMode === 'text' ? 'bg-[#3f7ba7]/30 text-white' : 'text-white/40'}`}
                                            >
                                                <Type size={16} />
                                            </button>
                                            <button
                                                onClick={() => setContentMode('media')}
                                                className={`p-2 rounded-md transition-all ${contentMode === 'media' ? 'bg-[#3f7ba7]/30 text-white' : 'text-white/40'}`}
                                            >
                                                <Image size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Editor Content */}
                                    <div className="p-6 space-y-6">
                                        {contentMode === 'text' ? (
                                            /* Text Content Editor */
                                            <TextContentEditor
                                                page={activePage}
                                                section={activeSubsection || activeSection}
                                                language={language}
                                            />
                                        ) : (
                                            /* Media Content Editor */
                                            <MediaContentEditor
                                                page={activePage}
                                                section={activeSubsection || activeSection}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Quick Tips */}
                                <div className="mt-8 p-4 bg-[#3f7ba7]/5 rounded-xl border border-[#3f7ba7]/10">
                                    <div className="flex items-start gap-3">
                                        <Sparkles size={16} className="text-[#5a9bc7] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-white/70 mb-1">Tips</h4>
                                            <p className="text-[13px] text-white/40 leading-relaxed">
                                                Ändringar sparas automatiskt. Använd tangentbordet <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[11px] mx-1">⌘ S</kbd> för att spara manuellt.
                                                Byt mellan sektioner i sidomenyn för att redigera olika delar av sidan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT CONTENT EDITOR COMPONENT
// Enhanced to work with nested content structure and all 4 languages
// ═══════════════════════════════════════════════════════════════════════════
interface TextContentEditorProps {
    page: string;
    section: string;
    language: string;
}

// Map UI page/section to CMS content path (matches visual scroll order)
// IMPORTANT: These paths must match what exists in cms-content-data.json
const CONTENT_MAPPING: Record<string, {
    cmsPage: string;
    cmsSection: string;
    fieldPrefix?: string;  // If specified, only show fields starting with this prefix (supports | for multiple)
    fieldFilter?: string[];  // If specified, only show these exact fields
}> = {
    // Home page - follows visual scroll order
    'home:hero': { cmsPage: 'hero', cmsSection: 'hero' },
    'home:featured-video': { cmsPage: 'hero', cmsSection: 'featuredVideo' },
    'home:why-choose-us': { cmsPage: 'features', cmsSection: 'features' },
    'home:adventures': { cmsPage: 'experiences', cmsSection: 'experiences' },
    'home:hosts': { cmsPage: 'about', cmsSection: 'ownerSection' },
    'home:testimonials': { cmsPage: 'testimonials', cmsSection: 'testimonials' },
    'home:instagram': { cmsPage: 'hero', cmsSection: 'instagram' },
    'home:corner': { cmsPage: 'hero', cmsSection: 'corner' },
    // Adventure subsections (nested under Home > Adventures) - point to detailPages/pages
    // NOTE: Database keys are "snowmobileSafari.xxx", NOT "pages.snowmobileSafari.xxx"
    'home:snowmobile': { cmsPage: 'detailPages', cmsSection: 'pages', fieldPrefix: 'snowmobileSafari.' },
    'home:northern-lights': { cmsPage: 'detailPages', cmsSection: 'pages', fieldPrefix: 'northernLights.' },
    'home:dog-sledding': { cmsPage: 'detailPages', cmsSection: 'pages', fieldPrefix: 'huskyRide.' },
    'home:lodging': { cmsPage: 'detailPages', cmsSection: 'pages', fieldPrefix: 'lodging.' },
    // About page - each section maps to about/about in CMS, filtered by fieldPrefix
    'about:hero': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'meta.|title|intro'  // SEO meta + main hero title/intro
    },
    'about:values': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'valuesTitle|values.'  // Values section heading + 4 value cards
    },
    'about:meet-us': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'meetUs.'  // Meet Gustav & Julia section
    },
    'about:action-images': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'actionImages.'  // 3 action image captions
    },
    'about:timeline': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'journeyTitle|timeline.'  // Our Journey section + 5 timeline entries
    },
    'about:cta': {
        cmsPage: 'about',
        cmsSection: 'about',
        fieldPrefix: 'cta.'  // Call to action section
    },
    // About hosts section (for home page) uses ownerSection
    'about:hosts-detail': { cmsPage: 'about', cmsSection: 'ownerSection' },
    // Packages page - separate hero from packages
    'packages:hero': {
        cmsPage: 'packages',
        cmsSection: 'packages',
        fieldFilter: ['title', 'titleHighlight', 'subtitle', 'intro']
    },
    'packages:packages': {
        cmsPage: 'packages',
        cmsSection: 'packages',
        fieldPrefix: 'adventure.|complete.|threeDay.|taster.|mostPopular|perPerson|bookButton'  // Fixed: actual field names from DB
    },
    // Gallery page - all fields have 'gallery.' prefix in database
    'gallery:hero': {
        cmsPage: 'gallery',
        cmsSection: 'gallery',
        fieldPrefix: 'gallery.hero.|gallery.meta.'  // Hero and meta fields
    },
    'gallery:grid': {
        cmsPage: 'gallery',
        cmsSection: 'gallery',
        fieldPrefix: 'gallery.categories.|gallery.cta.|gallery.images.|gallery.sections.|gallery.closeModal|gallery.prevImage|gallery.nextImage|gallery.noImages'
    },
    'faq:hero': {
        cmsPage: 'contact',
        cmsSection: 'faq',
        fieldPrefix: 'hero.|meta.'
    },
    'faq:questions': {
        cmsPage: 'contact',
        cmsSection: 'faq',
        fieldPrefix: 'faq.item'  // FAQ items 1-10
    },
    // Contact page
    'contact:hero': {
        cmsPage: 'contact',
        cmsSection: 'contact',
        fieldPrefix: 'hero.'  // Only hero.title1, hero.title2, hero.subtitle
    },
    'contact:form': {
        cmsPage: 'contact',
        cmsSection: 'contact',
        fieldPrefix: 'form.|toast.'  // Form fields and toast messages
    },
    'contact:info': {
        cmsPage: 'contact',
        cmsSection: 'contact',
        fieldPrefix: 'info.|social.|cta|faq|findus|callNow|sendEmail|openMaps'  // Info, social, and misc fields
    },
    // Booking page - all 3 sections
    'booking:booking': { cmsPage: 'booking', cmsSection: 'booking' },
    'booking:book': { cmsPage: 'booking', cmsSection: 'book' },
    'booking:form': { cmsPage: 'booking', cmsSection: 'form' },
    // Navigation & UI - all 4 sections
    'navigation:header': { cmsPage: 'navigation', cmsSection: 'header' },
    'navigation:footer': { cmsPage: 'navigation', cmsSection: 'footer' },
    'navigation:common': { cmsPage: 'navigation', cmsSection: 'common' },
    'navigation:shared': { cmsPage: 'navigation', cmsSection: 'shared' },
    // Legal & Policies - all 3 sections
    'legal:policies': { cmsPage: 'legal', cmsSection: 'policies' },
    'legal:cookieBanner': { cmsPage: 'legal', cmsSection: 'cookieBanner' },
    'legal:cookieSettings': { cmsPage: 'legal', cmsSection: 'cookieSettings' },
};

function TextContentEditor({ page, section, language }: TextContentEditorProps) {
    const { content, updateContent } = useCmsContent();
    const [localValues, setLocalValues] = useState<Record<string, string>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

    // Toggle group expansion
    const toggleGroup = (groupIndex: number) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupIndex]: !prev[groupIndex]
        }));
    };

    // Check if a group is expanded (default: first group expanded)
    const isGroupExpanded = (groupIndex: number) => {
        return expandedGroups[groupIndex] !== undefined ? expandedGroups[groupIndex] : groupIndex === 0;
    };

    // Get CMS content mapping
    const mappingKey = `${page}:${section}`;
    const mapping = CONTENT_MAPPING[mappingKey] || { cmsPage: 'hero', cmsSection: 'hero' };

    // Get content for this section
    const pageContent = content[mapping.cmsPage];
    const rawSectionContent = pageContent?.[mapping.cmsSection] || {};

    // 🆕 FILTER FIELDS based on mapping config (fieldPrefix or fieldFilter)
    const sectionContent = useMemo(() => {
        let filtered = rawSectionContent;

        // Apply prefix filter if specified
        if (mapping.fieldPrefix) {
            const prefixes = mapping.fieldPrefix.split('|');
            const filteredContent: Record<string, any> = {};
            Object.keys(rawSectionContent).forEach(key => {
                if (prefixes.some(p => key.startsWith(p) || key === p.replace('.', ''))) {
                    filteredContent[key] = rawSectionContent[key];
                }
            });
            filtered = filteredContent;
        }

        // Apply exact field filter if specified
        if (mapping.fieldFilter) {
            const filteredContent: Record<string, any> = {};
            mapping.fieldFilter.forEach(key => {
                if (rawSectionContent[key]) {
                    filteredContent[key] = rawSectionContent[key];
                }
            });
            filtered = filteredContent;
        }

        return filtered;
    }, [rawSectionContent, mapping.fieldPrefix, mapping.fieldFilter]);

    // Helper to get value from nested content
    // Handles both direct keys ('title') and dot-notation ('hero.title1', 'meta.description')
    const getValue = (fieldKey: string): string => {
        // Try exact key first (e.g. "hero.title1", "meta.description")
        let fieldData = sectionContent[fieldKey];

        // Om inte hittat, prova utan prefix för bakåtkompatibilitet
        if (!fieldData && fieldKey.includes('.')) {
            const lastPart = fieldKey.split('.').pop()!;
            fieldData = sectionContent[lastPart];
        }

        // Om fortfarande inte hittat, prova att hitta nästlat objekt
        if (!fieldData && fieldKey.includes('.')) {
            const parts = fieldKey.split('.');
            let current: unknown = sectionContent;
            for (const part of parts) {
                if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
                    current = (current as Record<string, unknown>)[part];
                } else {
                    current = undefined;
                    break;
                }
            }
            if (current && typeof current === 'object' && 'en' in (current as Record<string, unknown>)) {
                fieldData = current as typeof fieldData;
            }
        }

        if (!fieldData) return '';

        const lang = language as 'en' | 'sv' | 'de' | 'pl';
        const value = fieldData[lang] || fieldData.en || '';

        // Handle arrays properly
        if (Array.isArray(value)) {
            // Check if it's an array of objects (like features/steps with {icon, title, description})
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                // Format as readable text: "• Title: Description"
                return (value as unknown as Record<string, string>[]).map((item, i: number) => {
                    if (item.title && item.description) {
                        return `${i + 1}. ${item.title}: ${item.description}`;
                    } else if (item.title) {
                        return `${i + 1}. ${item.title}`;
                    } else if (item.text) {
                        return `${i + 1}. ${item.text}`;
                    } else {
                        // Fallback to JSON for complex objects
                        return JSON.stringify(item);
                    }
                }).join('\n');
            }
            // Simple array of strings
            return value.join('\n');
        }

        // Handle objects that aren't language maps
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    };

    // Helper to check if a field exists in content
    const fieldExists = (fieldKey: string): boolean => {
        // Kolla exakt nyckel först
        if (sectionContent[fieldKey]) return true;

        // Prova utan prefix
        if (fieldKey.includes('.')) {
            const lastPart = fieldKey.split('.').pop()!;
            if (sectionContent[lastPart]) return true;
        }

        return false;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FIELD SCHEMAS - Defines how each section's fields should be displayed
    // Groups related fields together with clear labels
    // ═══════════════════════════════════════════════════════════════════════
    type FieldGroup = {
        title: string;
        description?: string;
        fields: { key: string; label: string; type: 'text' | 'textarea' | 'url'; hint?: string }[];
    };

    const SECTION_SCHEMAS: Record<string, FieldGroup[]> = {
        // HOME PAGE - HERO SECTION
        'home:hero': [
            {
                title: '📝 Main Content',
                description: 'Heading and subtitle displayed in the hero section',
                fields: [
                    { key: 'title', label: 'Heading (line 1)', type: 'text', hint: 'E.g. "Experience the"' },
                    { key: 'magic', label: 'Heading (line 2, colored)', type: 'text', hint: 'E.g. "Magic of Lapland"' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', hint: 'Descriptive text below the heading' },
                ]
            },
            {
                title: '🔘 Buttons',
                description: 'Call-to-action buttons in the hero section',
                fields: [
                    { key: 'cta', label: 'Primary button', type: 'text', hint: 'E.g. "Book Your Adventure"' },
                    { key: 'explore', label: 'Secondary button', type: 'text', hint: 'E.g. "View Packages"' },
                ]
            },
            {
                title: '💎 Feature-kort (desktop)',
                description: 'Three info cards shown at the bottom of hero (desktop only)',
                fields: [
                    { key: 'feature1Title', label: 'Kort 1: Titel', type: 'text' },
                    { key: 'feature1Desc', label: 'Kort 1: Text', type: 'textarea' },
                    { key: 'feature2Title', label: 'Kort 2: Titel', type: 'text' },
                    { key: 'feature2Desc', label: 'Kort 2: Text', type: 'textarea' },
                    { key: 'feature3Title', label: 'Kort 3: Titel', type: 'text' },
                    { key: 'feature3Desc', label: 'Kort 3: Text', type: 'textarea' },
                ]
            }
        ],
        // HOME PAGE - FEATURED VIDEO
        'home:featured-video': [
            {
                title: '▶️ Featured Video',
                description: 'YouTube video shown below the hero section',
                fields: [
                    { key: 'youtubeUrl', label: 'YouTube URL', type: 'url', hint: 'Full YouTube embed URL' },
                    { key: 'title', label: 'Video title', type: 'text', hint: 'Heading shown above the video' },
                    { key: 'description', label: 'Description', type: 'textarea', hint: 'Text shown below the heading' },
                ]
            }
        ],
        // HOME PAGE - TESTIMONIALS
        'home:testimonials': [
            {
                title: '⭐ Guest Reviews',
                description: 'Text for the reviews section',
                fields: [
                    { key: 'title', label: 'Section heading', type: 'text', hint: 'E.g. "What Our Guests Say"' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
                    { key: 'readMore', label: '"Read more" button', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - WHY CHOOSE US (FEATURES)
        'home:why-choose-us': [
            {
                title: '📝 Section Heading',
                fields: [
                    { key: 'title', label: 'Main heading', type: 'text', hint: 'E.g. "Why our guests choose us"' },
                    { key: 'intro', label: 'Intro text', type: 'textarea' },
                    { key: 'outro', label: 'Closing text', type: 'textarea' },
                ]
            },
            {
                title: '💎 Feature-kort',
                description: 'Four cards with background videos',
                fields: [
                    { key: 'feature1Title', label: 'Kort 1: Titel', type: 'text', hint: '"Small Private Groups"' },
                    { key: 'feature1Desc', label: 'Kort 1: Beskrivning', type: 'textarea' },
                    { key: 'feature2Title', label: 'Kort 2: Titel', type: 'text', hint: '"The Cleanest Air"' },
                    { key: 'feature2Desc', label: 'Kort 2: Beskrivning', type: 'textarea' },
                    { key: 'feature3Title', label: 'Kort 3: Titel', type: 'text', hint: '"Pristine Wilderness"' },
                    { key: 'feature3Desc', label: 'Kort 3: Beskrivning', type: 'textarea' },
                    { key: 'feature4Title', label: 'Kort 4: Titel', type: 'text', hint: '"Honest, Local Food"' },
                    { key: 'feature4Desc', label: 'Kort 4: Beskrivning', type: 'textarea' },
                ]
            }
        ],
        // ═══════════════════════════════════════════════════════════════════════
        // ABOUT PAGE SECTIONS - Ordning matchar webbsidan exakt
        // ═══════════════════════════════════════════════════════════════════════

        // ABOUT PAGE - 1. HERO (Background video + title + intro)
        'about:hero': [
            {
                title: '🔍 SEO & Metadata',
                description: 'SEO for the About page',
                fields: [
                    { key: 'meta.title', label: 'Page title (browser tab)', type: 'text', hint: 'E.g. "About Us | Cold Experience Lapland"' },
                    { key: 'meta.description', label: 'Meta description (Google)', type: 'textarea', hint: 'Max 160 chars for best search result display' },
                ]
            },
            {
                title: '🎬 Hero Section',
                description: 'Displayed at the top with background video',
                fields: [
                    { key: 'title', label: 'Main heading', type: 'text', hint: 'E.g. "About Cold Experience Lapland"' },
                    { key: 'intro', label: 'Intro text', type: 'textarea', hint: 'White text below the heading' },
                ]
            }
        ],

        // ABOUT PAGE - 2. OUR VALUES (4 value cards)
        'about:values': [
            {
                title: '💎 Section Heading',
                description: 'Heading above the value cards',
                fields: [
                    { key: 'valuesTitle', label: 'Heading', type: 'text', hint: 'E.g. "Our Values"' },
                ]
            },
            {
                title: '❤️ Kort 1: Family Experience',
                description: 'Family value with background image IMG_2425.jpg',
                fields: [
                    { key: 'values.family.title', label: 'Title', type: 'text' },
                    { key: 'values.family.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '🏆 Kort 2: Authentic Experiences',
                description: 'Authenticity value with background image IMG_7834.jpg',
                fields: [
                    { key: 'values.authentic.title', label: 'Title', type: 'text' },
                    { key: 'values.authentic.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '👥 Kort 3: Small Groups',
                description: 'Group size value with background image IMG_1547.jpg',
                fields: [
                    { key: 'values.groups.title', label: 'Title', type: 'text' },
                    { key: 'values.groups.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '📸 Kort 4: Unforgettable Memories',
                description: 'Memories value with background image IMG_4436.jpg',
                fields: [
                    { key: 'values.memories.title', label: 'Title', type: 'text' },
                    { key: 'values.memories.description', label: 'Description', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 3. MEET GUSTAV & JULIA
        'about:meet-us': [
            {
                title: '👋 Heading & Introduction',
                description: 'Introduction heading for the hosts',
                fields: [
                    { key: 'meetUs.title', label: 'Heading', type: 'text', hint: 'E.g. "Meet Gustav & Julia"' },
                    { key: 'meetUs.description', label: 'Short description', type: 'textarea' },
                    { key: 'meetUs.experience', label: 'Experience text', type: 'textarea' },
                ]
            },
            {
                title: '🧭 Our Guides (left card)',
                description: 'Small card on the left',
                fields: [
                    { key: 'meetUs.guides', label: 'Card title', type: 'text', hint: 'E.g. "Our Guides"' },
                    { key: 'meetUs.guidesDesc', label: 'Card description', type: 'textarea' },
                ]
            },
            {
                title: '👨‍👩‍👧‍👦 Our Family (right card)',
                description: 'Small card on the right',
                fields: [
                    { key: 'meetUs.family', label: 'Card title', type: 'text', hint: 'E.g. "Our Family"' },
                    { key: 'meetUs.familyDesc', label: 'Card description', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 4. ACTION IMAGES (3 bilder med overlay-text)
        'about:action-images': [
            {
                title: '📸 Action Images',
                description: 'The 3 images below Meet Gustav & Julia with text overlay',
                fields: [
                    { key: 'actionImages.snowmobile', label: 'Image 1: Snowmobile (IMG_4108.jpg)', type: 'text', hint: 'Overlay text on the image' },
                    { key: 'actionImages.lodge', label: 'Image 2: Lodge (IMG_3493.jpg)', type: 'text', hint: 'Overlay text on the image' },
                    { key: 'actionImages.landscape', label: 'Image 3: Landscape (IMG_6698.jpg)', type: 'text', hint: 'Overlay text on the image' },
                ]
            }
        ],

        // ABOUT PAGE - 5. OUR JOURNEY (Tidslinje)
        'about:timeline': [
            {
                title: '📅 Timeline Heading',
                description: 'Heading for the timeline section',
                fields: [
                    { key: 'journeyTitle', label: 'Heading', type: 'text', hint: 'E.g. "Our Journey"' },
                ]
            },
            {
                title: '👶 1990s: Childhood in Lapland',
                description: 'First milestone with image gustav_childhood.jpg',
                fields: [
                    { key: 'timeline.childhood.title', label: 'Title', type: 'text' },
                    { key: 'timeline.childhood.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '🍳 2000s: Culinary Discoveries',
                description: 'Second milestone with image julias_matresa.jpg',
                fields: [
                    { key: 'timeline.culinary.title', label: 'Title', type: 'text' },
                    { key: 'timeline.culinary.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '❤️ 2020: Passion for Adventure',
                description: 'Third milestone with image love_adventure.jpg',
                fields: [
                    { key: 'timeline.love.title', label: 'Title', type: 'text' },
                    { key: 'timeline.love.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '👨‍👩‍👧‍👦 2022-2023: Growing Family',
                description: 'Fourth milestone with image family_2.jpg',
                fields: [
                    { key: 'timeline.family.title', label: 'Title', type: 'text' },
                    { key: 'timeline.family.description', label: 'Description', type: 'textarea' },
                ]
            },
            {
                title: '❄️ 2024: Cold Experience is Born',
                description: 'Fifth milestone with image coldexperience_born.jpg',
                fields: [
                    { key: 'timeline.coldExperience.title', label: 'Title', type: 'text' },
                    { key: 'timeline.coldExperience.description', label: 'Description', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 6. CALL TO ACTION
        'about:cta': [
            {
                title: '🔘 Call to Action',
                description: 'Closing section with buttons - background IMG_0451.jpg',
                fields: [
                    { key: 'cta.title', label: 'Heading', type: 'text', hint: 'E.g. "Ready for your adventure?"' },
                    { key: 'cta.description', label: 'Description', type: 'textarea' },
                    { key: 'cta.packages', label: 'Button 1: Packages', type: 'text', hint: 'E.g. "View Packages"' },
                    { key: 'cta.contact', label: 'Button 2: Contact', type: 'text', hint: 'E.g. "Contact"' },
                    { key: 'cta.gallery', label: 'Button 3: Gallery', type: 'text', hint: 'E.g. "Gallery"' },
                ]
            }
        ],
        // HOME & ABOUT PAGE - HOSTS/OWNER SECTION (about.ownerSection - 19 fält)
        'home:hosts': [
            {
                title: '📝 Section Heading',
                description: 'Heading and intro for the hosts section',
                fields: [
                    { key: 'title1', label: 'Heading part 1', type: 'text', hint: 'E.g. "Meet"' },
                    { key: 'title2', label: 'Heading part 2', type: 'text', hint: 'E.g. "Your Hosts"' },
                    { key: 'intro', label: 'Intro', type: 'textarea' },
                    { key: 'names', label: 'Name', type: 'text', hint: 'E.g. "Gustav & Julia"' },
                ]
            },
            {
                title: '👤 Gustav',
                description: 'Introducing Gustav',
                fields: [
                    { key: 'gustavTitle', label: 'Title/role', type: 'text' },
                    { key: 'gustavBio', label: 'Biography', type: 'textarea' },
                ]
            },
            {
                title: '👤 Julia',
                description: 'Introducing Julia',
                fields: [
                    { key: 'juliaTitle', label: 'Title/role', type: 'text' },
                    { key: 'juliaBio', label: 'Biography', type: 'textarea' },
                ]
            },
            {
                title: '🏔 Lifestyle & Philosophy',
                description: 'Quotes and lifestyle description',
                fields: [
                    { key: 'bio', label: 'Shared bio', type: 'textarea' },
                    { key: 'lifestyleTitle', label: 'Lifestyle heading', type: 'text' },
                    { key: 'lifestyleQuote', label: 'Lifestyle quote', type: 'textarea' },
                ]
            },
            {
                title: '✨ Why Choose Us',
                description: 'Three USPs for the hosts',
                fields: [
                    { key: 'whyTitle', label: 'Why heading', type: 'text' },
                    { key: 'whyText', label: 'Why text', type: 'textarea' },
                    { key: 'localExpertiseTitle', label: 'Local Expertise: Heading', type: 'text' },
                    { key: 'localExpertiseText', label: 'Local Expertise: Text', type: 'textarea' },
                    { key: 'familyBusinessTitle', label: 'Family Business: Heading', type: 'text' },
                    { key: 'familyBusinessText', label: 'Family Business: Text', type: 'textarea' },
                    { key: 'authenticExperienceTitle', label: 'Authentic Experience: Heading', type: 'text' },
                    { key: 'authenticExperienceText', label: 'Authentic Experience: Text', type: 'textarea' },
                ]
            }
        ],
        // HOME PAGE - INSTAGRAM SECTION
        'home:instagram': [
            {
                title: '📸 Instagram Section',
                description: 'Instagram integration and text',
                fields: [
                    { key: 'title', label: 'Heading', type: 'text', hint: 'E.g. "Latest from Instagram"' },
                    { key: 'subtitle', label: 'Subtitle', type: 'text' },
                    { key: 'viewOnInstagram', label: '"View on Instagram" button', type: 'text' },
                    { key: 'follow', label: '"Follow us" text', type: 'text' },
                    { key: 'loading', label: 'Loading text', type: 'text' },
                    { key: 'error', label: 'Error message', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - CORNER SECTION
        'home:corner': [
            {
                title: '👋 Who We Are',
                description: 'Short introduction',
                fields: [
                    { key: 'whoTitle', label: 'Heading', type: 'text' },
                    { key: 'whoBody', label: 'Body', type: 'textarea' },
                ]
            },
            {
                title: '🎿 Adventures',
                description: 'Adventure preview',
                fields: [
                    { key: 'adventuresTitle', label: 'Heading', type: 'text' },
                    { key: 'huskyTitle', label: 'Husky: Heading', type: 'text' },
                    { key: 'huskyBody', label: 'Husky: Text', type: 'textarea' },
                    { key: 'snowmobileTitle', label: 'Snowmobile: Heading', type: 'text' },
                    { key: 'snowmobileBody', label: 'Snowmobile: Text', type: 'textarea' },
                    { key: 'nlightsTitle', label: 'Northern Lights: Heading', type: 'text' },
                    { key: 'nlightsBody', label: 'Northern Lights: Text', type: 'textarea' },
                    { key: 'learnMore', label: '"Read more" button', type: 'text' },
                ]
            },
            {
                title: '✨ Why Us',
                description: 'USPs and CTA',
                fields: [
                    { key: 'whyTitle', label: 'Heading', type: 'text' },
                    { key: 'whyLocal', label: 'Local expertise', type: 'text' },
                    { key: 'whyHosp', label: 'Hospitality', type: 'text' },
                    { key: 'whySmall', label: 'Small groups', type: 'text' },
                    { key: 'planTitle', label: 'Plan: Heading', type: 'text' },
                    { key: 'planBody', label: 'Plan: Text', type: 'textarea' },
                    { key: 'viewPackages', label: '"View packages" button', type: 'text' },
                    { key: 'bookNow', label: '"Book now" button', type: 'text' },
                    { key: 'contactUs', label: '"Contact us" button', type: 'text' },
                ]
            }
        ],
        // About hosts uses same schema as home hosts (same data source)
        // getFieldGroups() will fall back to 'home:hosts' schema since it shares the same data
        // NAVIGATION - FOOTER (navigation.footer - 29 fields)
        'navigation:footer': [
            {
                title: '🏢 Company Info',
                description: 'Basic company information',
                fields: [
                    { key: 'companyName', label: 'Company name', type: 'text' },
                    { key: 'companyDescription', label: 'Company description', type: 'textarea' },
                    { key: 'rights', label: 'Copyright text', type: 'text' },
                    { key: 'quote', label: 'Quote/motto', type: 'text' },
                ]
            },
            {
                title: '🔗 Quick Links',
                description: 'Main footer navigation',
                fields: [
                    { key: 'quickLinks.title', label: 'Heading', type: 'text' },
                    { key: 'quickLinks.home', label: 'Home', type: 'text' },
                    { key: 'quickLinks.about', label: 'About us', type: 'text' },
                    { key: 'quickLinks.packages', label: 'Packages', type: 'text' },
                    { key: 'quickLinks.gallery', label: 'Gallery', type: 'text' },
                    { key: 'quickLinks.contact', label: 'Contact', type: 'text' },
                ]
            },
            {
                title: '❄ Experiences',
                description: 'Links to adventure experiences',
                fields: [
                    { key: 'experiences.title', label: 'Heading', type: 'text' },
                    { key: 'experiences.snowmobile', label: 'Snowmobile', type: 'text' },
                    { key: 'experiences.northernLights', label: 'Northern Lights', type: 'text' },
                    { key: 'experiences.dogSledding', label: 'Dog Sledding', type: 'text' },
                    { key: 'experiences.saunaHotTub', label: 'Sauna & Hot Tub', type: 'text' },
                    { key: 'experiences.iceFishing', label: 'Ice Fishing', type: 'text' },
                    { key: 'experiences.localCuisine', label: 'Local Cuisine', type: 'text' },
                ]
            },
            {
                title: '📍 Contact Info',
                description: 'Address, phone and email',
                fields: [
                    { key: 'contact.title', label: 'Heading', type: 'text' },
                    { key: 'contact.addressLine1', label: 'Address line 1', type: 'text' },
                    { key: 'contact.addressLine2', label: 'Address line 2', type: 'text' },
                    { key: 'contact.phone', label: 'Phone', type: 'text' },
                    { key: 'contact.email', label: 'Email', type: 'text' },
                ]
            },
            {
                title: '📅 Season',
                description: 'Winter season information',
                fields: [
                    { key: 'season.title', label: 'Heading', type: 'text' },
                    { key: 'season.dates', label: 'Dates', type: 'text' },
                    { key: 'season.cta', label: 'Call-to-action', type: 'text' },
                ]
            },
            {
                title: '📜 Legal Links',
                description: 'Policy links and cookie settings',
                fields: [
                    { key: 'privacyPolicy', label: 'Privacy policy', type: 'text' },
                    { key: 'termsOfService', label: 'Terms of service', type: 'text' },
                    { key: 'cookiePolicy', label: 'Cookie policy', type: 'text' },
                    { key: 'cookieSettings', label: 'Cookie settings', type: 'text' },
                ]
            }
        ],
        // LEGAL - POLICIES (legal.policies - 27 fields)
        'legal:policies': [
            {
                title: '📜 Privacy Policy',
                description: 'GDPR and data protection',
                fields: [
                    { key: 'privacy.categoryLabel', label: 'Category label', type: 'text' },
                    { key: 'privacy.title', label: 'Heading', type: 'text' },
                    { key: 'privacy.lastUpdated', label: 'Last Updated', type: 'text' },
                    { key: 'privacy.intro', label: 'Intro', type: 'textarea' },
                    { key: 'privacy.sections', label: 'Sections (JSON)', type: 'textarea' },
                    { key: 'privacy.contact.label', label: 'Contact label', type: 'text' },
                    { key: 'privacy.contact.title', label: 'Contact heading', type: 'text' },
                    { key: 'privacy.contact.description', label: 'Contact description', type: 'textarea' },
                    { key: 'privacy.contact.email', label: 'Contact email', type: 'text' },
                ]
            },
            {
                title: '📋 Terms of Service',
                description: 'Service terms and conditions',
                fields: [
                    { key: 'terms.categoryLabel', label: 'Category label', type: 'text' },
                    { key: 'terms.title', label: 'Heading', type: 'text' },
                    { key: 'terms.lastUpdated', label: 'Last Updated', type: 'text' },
                    { key: 'terms.intro', label: 'Intro', type: 'textarea' },
                    { key: 'terms.sections', label: 'Sections (JSON)', type: 'textarea' },
                    { key: 'terms.contact.label', label: 'Contact label', type: 'text' },
                    { key: 'terms.contact.title', label: 'Contact heading', type: 'text' },
                    { key: 'terms.contact.description', label: 'Contact description', type: 'textarea' },
                    { key: 'terms.contact.email', label: 'Contact email', type: 'text' },
                ]
            },
            {
                title: '🍪 Cookies',
                description: 'Cookie policy',
                fields: [
                    { key: 'cookies.categoryLabel', label: 'Category label', type: 'text' },
                    { key: 'cookies.title', label: 'Heading', type: 'text' },
                    { key: 'cookies.lastUpdated', label: 'Last Updated', type: 'text' },
                    { key: 'cookies.intro', label: 'Intro', type: 'textarea' },
                    { key: 'cookies.sections', label: 'Sections (JSON)', type: 'textarea' },
                    { key: 'cookies.contact.label', label: 'Contact label', type: 'text' },
                    { key: 'cookies.contact.title', label: 'Contact heading', type: 'text' },
                    { key: 'cookies.contact.description', label: 'Contact description', type: 'textarea' },
                    { key: 'cookies.contact.email', label: 'Contact email', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - ADVENTURES (the section showing all 4 adventure cards)
        'home:adventures': [
            {
                title: '📝 Section Heading',
                description: 'Heading and intro shown at the top of the adventures section',
                fields: [
                    { key: 'title', label: 'Heading (part 1)', type: 'text', hint: '"Magical"' },
                    { key: 'titleHighlight', label: 'Heading (part 2, colored)', type: 'text', hint: '"Winter Adventures"' },
                    { key: 'intro', label: 'Intro text', type: 'textarea' },
                ]
            },
            {
                title: '🛷 Card 1: Snowmobile',
                description: 'First adventure card on home page',
                fields: [
                    { key: 'snowmobileTitle', label: 'Heading', type: 'text' },
                    { key: 'snowmobileDesc', label: 'Description', type: 'textarea' },
                    { key: 'snowmobileFeature1', label: 'Feature 1', type: 'text' },
                    { key: 'snowmobileFeature2', label: 'Feature 2', type: 'text' },
                    { key: 'snowmobileFeature3', label: 'Feature 3', type: 'text' },
                    { key: 'snowmobileFeature4', label: 'Feature 4', type: 'text' },
                ]
            },
            {
                title: '🌌 Card 2: Northern Lights',
                description: 'Second adventure card on home page',
                fields: [
                    { key: 'northernLightsTitle', label: 'Heading', type: 'text' },
                    { key: 'northernLightsDesc', label: 'Description', type: 'textarea' },
                    { key: 'northernLightsFeature1', label: 'Feature 1', type: 'text' },
                    { key: 'northernLightsFeature2', label: 'Feature 2', type: 'text' },
                    { key: 'northernLightsFeature3', label: 'Feature 3', type: 'text' },
                    { key: 'northernLightsFeature4', label: 'Feature 4', type: 'text' },
                ]
            },
            {
                title: '🐕 Card 3: Dog Sledding',
                description: 'Third adventure card on home page',
                fields: [
                    { key: 'dogSleddingTitle', label: 'Heading', type: 'text' },
                    { key: 'dogSleddingDesc', label: 'Description', type: 'textarea' },
                    { key: 'dogSleddingFeature1', label: 'Feature 1', type: 'text' },
                    { key: 'dogSleddingFeature2', label: 'Feature 2', type: 'text' },
                    { key: 'dogSleddingFeature3', label: 'Feature 3', type: 'text' },
                    { key: 'dogSleddingFeature4', label: 'Feature 4', type: 'text' },
                ]
            },
            {
                title: '🏠 Card 4: Lodging',
                description: 'Fourth adventure card on home page',
                fields: [
                    { key: 'lodgingTitle', label: 'Heading', type: 'text' },
                    { key: 'lodgingDesc', label: 'Description', type: 'textarea' },
                    { key: 'lodgingFeature1', label: 'Feature 1', type: 'text' },
                    { key: 'lodgingFeature2', label: 'Feature 2', type: 'text' },
                    { key: 'lodgingFeature3', label: 'Feature 3', type: 'text' },
                    { key: 'lodgingFeature4', label: 'Feature 4', type: 'text' },
                ]
            },
            {
                title: '🔘 Call-to-action',
                description: 'Box at the bottom of the adventures section',
                fields: [
                    { key: 'learnMore', label: '"Read more" button', type: 'text' },
                    { key: 'ctaTitle', label: 'CTA Heading', type: 'text' },
                    { key: 'ctaDesc', label: 'CTA Description', type: 'textarea' },
                    { key: 'ctaBook', label: 'Book button text', type: 'text' },
                ]
            }
        ],

        // ADVENTURE SUBSECTION - SNOWMOBILE (full subpage content)
        // Keys match database: 'snowmobileSafari.xxx' (NO 'pages.' prefix)
        'home:snowmobile': [
            {
                title: '🎬 Hero Section',
                description: 'Hero image and intro for the snowmobile page',
                fields: [
                    { key: 'snowmobileSafari.hero.title', label: 'Heading', type: 'text' },
                    { key: 'snowmobileSafari.hero.description', label: 'Description', type: 'textarea' },
                    { key: 'snowmobileSafari.hero.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'snowmobileSafari.hero.secondaryButton.label', label: 'Secondary button', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'snowmobileSafari.intro.heading', label: 'Heading', type: 'text' },
                    { key: 'snowmobileSafari.intro.paragraphs', label: 'Paragraphs', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'snowmobileSafari.features', label: 'Features (list)', type: 'textarea' },
                    { key: 'snowmobileSafari.sectionsHeading', label: 'Section heading', type: 'text' },
                ]
            },
            {
                title: '📋 Day Program',
                fields: [
                    { key: 'snowmobileSafari.dayProgram.title', label: 'Heading', type: 'text' },
                    { key: 'snowmobileSafari.dayProgram.steps', label: 'Steps (list)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Closing/CTA',
                fields: [
                    { key: 'snowmobileSafari.closing.title', label: 'Heading', type: 'text' },
                    { key: 'snowmobileSafari.closing.description', label: 'Description', type: 'textarea' },
                    { key: 'snowmobileSafari.closing.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'snowmobileSafari.closing.secondaryButton.label', label: 'Secondary button', type: 'text' },
                    { key: 'snowmobileSafari.closing.ratingText', label: 'Rating text', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'snowmobileSafari.meta.title', label: 'Meta title', type: 'text' },
                    { key: 'snowmobileSafari.meta.description', label: 'Meta description', type: 'textarea' },
                    { key: 'snowmobileSafari.meta.keywords', label: 'Keywords', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - NORTHERN LIGHTS
        // Keys match database: 'northernLights.xxx' (NO 'pages.' prefix)
        'home:northern-lights': [
            {
                title: '🎬 Hero Section',
                fields: [
                    { key: 'northernLights.hero.title', label: 'Heading', type: 'text' },
                    { key: 'northernLights.hero.description', label: 'Description', type: 'textarea' },
                    { key: 'northernLights.hero.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'northernLights.hero.secondaryButton.label', label: 'Secondary button', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'northernLights.intro.heading', label: 'Heading', type: 'text' },
                    { key: 'northernLights.intro.paragraphs', label: 'Paragraphs', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'northernLights.features', label: 'Features (list)', type: 'textarea' },
                    { key: 'northernLights.sectionsHeading', label: 'Section heading', type: 'text' },
                ]
            },
            {
                title: '📋 Evening Schedule',
                fields: [
                    { key: 'northernLights.dayProgram.title', label: 'Heading', type: 'text' },
                    { key: 'northernLights.dayProgram.steps', label: 'Steps (list)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Closing/CTA',
                fields: [
                    { key: 'northernLights.closing.title', label: 'Heading', type: 'text' },
                    { key: 'northernLights.closing.description', label: 'Description', type: 'textarea' },
                    { key: 'northernLights.closing.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'northernLights.closing.secondaryButton.label', label: 'Secondary button', type: 'text' },
                    { key: 'northernLights.closing.ratingText', label: 'Rating text', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'northernLights.meta.title', label: 'Meta title', type: 'text' },
                    { key: 'northernLights.meta.description', label: 'Meta description', type: 'textarea' },
                    { key: 'northernLights.meta.keywords', label: 'Keywords', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - DOG SLEDDING
        // Keys match database: 'huskyRide.xxx' (NO 'pages.' prefix)
        'home:dog-sledding': [
            {
                title: '🎬 Hero Section',
                fields: [
                    { key: 'huskyRide.hero.title', label: 'Heading', type: 'text' },
                    { key: 'huskyRide.hero.description', label: 'Description', type: 'textarea' },
                    { key: 'huskyRide.hero.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'huskyRide.hero.secondaryButton.label', label: 'Secondary button', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'huskyRide.intro.heading', label: 'Heading', type: 'text' },
                    { key: 'huskyRide.intro.paragraphs', label: 'Paragraphs', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'huskyRide.features', label: 'Features (list)', type: 'textarea' },
                    { key: 'huskyRide.sectionsHeading', label: 'Section heading', type: 'text' },
                ]
            },
            {
                title: '📋 Tour Schedule',
                fields: [
                    { key: 'huskyRide.dayProgram.title', label: 'Heading', type: 'text' },
                    { key: 'huskyRide.dayProgram.steps', label: 'Steps (list)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Closing/CTA',
                fields: [
                    { key: 'huskyRide.closing.title', label: 'Heading', type: 'text' },
                    { key: 'huskyRide.closing.description', label: 'Description', type: 'textarea' },
                    { key: 'huskyRide.closing.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'huskyRide.closing.secondaryButton.label', label: 'Secondary button', type: 'text' },
                    { key: 'huskyRide.closing.ratingText', label: 'Rating text', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'huskyRide.meta.title', label: 'Meta title', type: 'text' },
                    { key: 'huskyRide.meta.description', label: 'Meta description', type: 'textarea' },
                    { key: 'huskyRide.meta.keywords', label: 'Keywords', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - LODGING
        // Keys match database: 'lodging.xxx' (NO 'pages.' prefix)
        'home:lodging': [
            {
                title: '🎬 Hero Section',
                fields: [
                    { key: 'lodging.hero.title', label: 'Heading', type: 'text' },
                    { key: 'lodging.hero.description', label: 'Description', type: 'textarea' },
                    { key: 'lodging.hero.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'lodging.hero.secondaryButton.label', label: 'Secondary button', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'lodging.intro.heading', label: 'Heading', type: 'text' },
                    { key: 'lodging.intro.paragraphs', label: 'Paragraphs', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'lodging.features', label: 'Features (list)', type: 'textarea' },
                    { key: 'lodging.sectionsHeading', label: 'Section heading', type: 'text' },
                ]
            },
            {
                title: '📋 A Day at the Guesthouse',
                fields: [
                    { key: 'lodging.dayProgram.title', label: 'Heading', type: 'text' },
                    { key: 'lodging.dayProgram.steps', label: 'Steps (list)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Closing/CTA',
                fields: [
                    { key: 'lodging.closing.title', label: 'Heading', type: 'text' },
                    { key: 'lodging.closing.description', label: 'Description', type: 'textarea' },
                    { key: 'lodging.closing.primaryButton.label', label: 'Primary button', type: 'text' },
                    { key: 'lodging.closing.secondaryButton.label', label: 'Secondary button', type: 'text' },
                    { key: 'lodging.closing.ratingText', label: 'Rating text', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'lodging.meta.title', label: 'Meta title', type: 'text' },
                    { key: 'lodging.meta.description', label: 'Meta description', type: 'textarea' },
                    { key: 'lodging.meta.keywords', label: 'Keywords', type: 'text' },
                ]
            }
        ],

        // ═══════════════════════════════════════════════════════════════════════
        // CONTACT PAGE SCHEMAS
        // ═══════════════════════════════════════════════════════════════════════

        // CONTACT PAGE - HERO (3 fields)
        'contact:hero': [
            {
                title: '🎬 Hero Section',
                description: 'Top content on the contact page',
                fields: [
                    { key: 'hero.title1', label: 'Heading part 1', type: 'text', hint: 'E.g. "Get in"' },
                    { key: 'hero.title2', label: 'Heading part 2 (colored)', type: 'text', hint: 'E.g. "Touch"' },
                    { key: 'hero.subtitle', label: 'Subtitle', type: 'textarea' },
                ]
            }
        ],

        // CONTACT PAGE - FORM (~19 fields)
        'contact:form': [
            {
                title: '📝 Form - Headings',
                description: 'Headings and intro text for the form',
                fields: [
                    { key: 'form.title', label: 'Form heading', type: 'text' },
                    { key: 'form.subtitle', label: 'Form subtitle', type: 'textarea' },
                ]
            },
            {
                title: '📝 Form - Field Labels',
                description: 'Labels and placeholder text for form fields',
                fields: [
                    { key: 'form.nameLabel', label: 'Name: Label', type: 'text' },
                    { key: 'form.namePlaceholder', label: 'Name: Placeholder', type: 'text' },
                    { key: 'form.emailLabel', label: 'Email: Label', type: 'text' },
                    { key: 'form.emailPlaceholder', label: 'Email: Placeholder', type: 'text' },
                    { key: 'form.phoneLabel', label: 'Phone: Label', type: 'text' },
                    { key: 'form.phonePlaceholder', label: 'Phone: Placeholder', type: 'text' },
                    { key: 'form.subjectLabel', label: 'Subject: Label', type: 'text' },
                    { key: 'form.messageLabel', label: 'Message: Label', type: 'text' },
                    { key: 'form.messagePlaceholder', label: 'Message: Placeholder', type: 'text' },
                ]
            },
            {
                title: '📝 Form - Subject Options',
                description: 'Dropdown options for subject selector',
                fields: [
                    { key: 'form.subjectOptions.select', label: 'Select subject (default)', type: 'text' },
                    { key: 'form.subjectOptions.booking', label: 'Booking', type: 'text' },
                    { key: 'form.subjectOptions.sevenDay', label: '7-dagars paket', type: 'text' },
                    { key: 'form.subjectOptions.fiveDay', label: '5-dagars paket', type: 'text' },
                    { key: 'form.subjectOptions.oneDay', label: '1-dags upplevelse', type: 'text' },
                    { key: 'form.subjectOptions.custom', label: 'Custom experience', type: 'text' },
                    { key: 'form.subjectOptions.general', label: 'General inquiry', type: 'text' },
                ]
            },
            {
                title: '📝 Form - Other',
                fields: [
                    { key: 'form.contactByPhone', label: 'Checkbox: Kontakt via telefon', type: 'text' },
                    { key: 'form.sendButton', label: 'Skicka-knapp text', type: 'text' },
                ]
            },
            {
                title: '✅ Confirmation Messages',
                description: 'Toast messages shown after form submission',
                fields: [
                    { key: 'toast.missingTitle', label: 'Missing fields: Heading', type: 'text' },
                    { key: 'toast.missingDesc', label: 'Missing fields: Description', type: 'text' },
                    { key: 'toast.sentTitle', label: 'Skickat: Rubrik', type: 'text' },
                    { key: 'toast.sentDesc', label: 'Skickat: Beskrivning', type: 'text' },
                ]
            }
        ],

        // CONTACT PAGE - INFO (~12 fält)
        'contact:info': [
            {
                title: '📍 Plats',
                description: 'Adressinformation',
                fields: [
                    { key: 'info.location.title', label: 'Heading', type: 'text' },
                    { key: 'info.location.line1', label: 'Address line 1', type: 'text' },
                    { key: 'info.location.line2', label: 'Address line 2', type: 'text' },
                ]
            },
            {
                title: '📞 Telefon',
                fields: [
                    { key: 'info.phone.title', label: 'Heading', type: 'text' },
                    { key: 'info.phone.number', label: 'Telefonnummer', type: 'text' },
                    { key: 'info.phone.note', label: 'Anteckning', type: 'text' },
                ]
            },
            {
                title: '✉️ E-post',
                fields: [
                    { key: 'info.email.title', label: 'Heading', type: 'text' },
                    { key: 'info.email.address', label: 'E-postadress', type: 'text' },
                    { key: 'info.email.note', label: 'Anteckning', type: 'text' },
                ]
            },
            {
                title: '📅 Season',
                fields: [
                    { key: 'info.season.title', label: 'Heading', type: 'text' },
                    { key: 'info.season.dates', label: 'Datum/Period', type: 'text' },
                    { key: 'info.season.cta', label: 'Call-to-action', type: 'text' },
                ]
            },
            {
                title: '🔗 Sociala medier',
                fields: [
                    { key: 'social.title', label: 'Heading', type: 'text' },
                    { key: 'social.subtitle', label: 'Subtitle', type: 'text' },
                ]
            },
            {
                title: '🔘 Call-to-action',
                fields: [
                    { key: 'ctaTitle', label: 'CTA Heading', type: 'text' },
                    { key: 'ctaSubtitle', label: 'CTA Undertext', type: 'text' },
                    { key: 'callNow', label: 'Ring nu knapp', type: 'text' },
                    { key: 'sendEmail', label: 'Skicka e-post knapp', type: 'text' },
                ]
            },
            {
                title: '❓ FAQ-sektion',
                fields: [
                    { key: 'faqTitle1', label: 'FAQ Rubrik del 1', type: 'text' },
                    { key: 'faqTitle2', label: 'FAQ Rubrik del 2', type: 'text' },
                    { key: 'faqSubtitle', label: 'FAQ Undertext', type: 'textarea' },
                    { key: 'faqEmailPrompt', label: 'E-post uppmaning', type: 'text' },
                    { key: 'faqEmailButton', label: 'E-post knapp', type: 'text' },
                ]
            },
            {
                title: '📍 Hitta hit',
                fields: [
                    { key: 'findusTitle', label: 'Heading', type: 'text' },
                    { key: 'openMaps', label: 'Open map button', type: 'text' },
                ]
            }
        ],

        // ═══════════════════════════════════════════════════════════════════════
        // BOOKING PAGE SCHEMAS (43 fält)
        // ═══════════════════════════════════════════════════════════════════════

        'booking:booking': [
            {
                title: '📝 Form - Headings & Fields',
                description: 'Main headings and form field text',
                fields: [
                    { key: 'formTitle', label: 'Form heading', type: 'text' },
                    { key: 'selectedDateText', label: 'Valt datum text', type: 'text' },
                    { key: 'dateNotSelected', label: 'Datum ej valt text', type: 'text' },
                    { key: 'submitButton', label: 'Skicka-knapp', type: 'text' },
                    { key: 'submitButtonLoading', label: 'Skicka-knapp (laddar)', type: 'text' },
                ]
            },
            {
                title: '📝 Field Labels & Placeholders',
                description: 'Labels and placeholder text for booking form',
                fields: [
                    { key: 'childrenAgesLabel', label: 'Children ages: Label', type: 'text' },
                    { key: 'childrenAgesPlaceholder', label: 'Children ages: Placeholder', type: 'text' },
                ]
            },
            {
                title: '⚠️ Valideringsfel',
                description: 'Error messages shown for invalid input',
                fields: [
                    { key: 'nameErrorRequired', label: 'Namn: Obligatoriskt fel', type: 'text' },
                    { key: 'nameErrorShort', label: 'Name: Too short error', type: 'text' },
                    { key: 'emailErrorRequired', label: 'E-post: Obligatoriskt fel', type: 'text' },
                    { key: 'emailErrorInvalid', label: 'E-post: Ogiltigt format fel', type: 'text' },
                    { key: 'phoneErrorRequired', label: 'Telefon: Obligatoriskt fel', type: 'text' },
                    { key: 'phoneErrorInvalid', label: 'Telefon: Ogiltigt format fel', type: 'text' },
                    { key: 'dateErrorRequired', label: 'Datum: Obligatoriskt fel', type: 'text' },
                    { key: 'dateErrorPast', label: 'Datum: Passerat datum fel', type: 'text' },
                    { key: 'packageError', label: 'Package: Required error', type: 'text' },
                    { key: 'numAdultsError', label: 'Antal vuxna: Fel', type: 'text' },
                    { key: 'numChildrenError', label: 'Antal barn: Fel', type: 'text' },
                    { key: 'childrenAgesErrorRequired', label: 'Children ages: Required error', type: 'text' },
                    { key: 'childrenAgesErrorRange', label: 'Children ages: Range error', type: 'text' },
                    { key: 'consentError', label: 'Samtycke: Obligatoriskt fel', type: 'text' },
                    { key: 'messageErrorTooLong', label: 'Message: Too long error', type: 'text' },
                ]
            },
            {
                title: '📋 Bokningssammanfattning',
                description: 'Etiketter i sammanfattningsrutan',
                fields: [
                    { key: 'summaryTitle', label: 'Sammanfattning: Rubrik', type: 'text' },
                    { key: 'summaryName', label: 'Sammanfattning: Namn', type: 'text' },
                    { key: 'summaryEmail', label: 'Sammanfattning: E-post', type: 'text' },
                    { key: 'summaryPhone', label: 'Sammanfattning: Telefon', type: 'text' },
                    { key: 'summaryPackage', label: 'Summary: Package', type: 'text' },
                    { key: 'summaryDate', label: 'Sammanfattning: Datum', type: 'text' },
                    { key: 'summaryAdults', label: 'Sammanfattning: Vuxna', type: 'text' },
                    { key: 'summaryChildren', label: 'Sammanfattning: Barn', type: 'text' },
                    { key: 'summaryChildrenAges', label: 'Summary: Children ages', type: 'text' },
                    { key: 'summaryPrice', label: 'Sammanfattning: Pris', type: 'text' },
                    { key: 'summaryConfirmationEmail', label: 'Confirmation: Email info', type: 'text' },
                    { key: 'summaryConfirmationCall', label: 'Confirmation: Phone info', type: 'text' },
                    { key: 'consentLabel', label: 'Samtycke: Etikett', type: 'textarea' },
                ]
            },
            {
                title: '✅ Toast-meddelanden',
                description: 'Popup messages for feedback',
                fields: [
                    { key: 'toastSuccessTitle', label: 'Lyckad: Rubrik', type: 'text' },
                    { key: 'toastSuccessDesc', label: 'Lyckad: Beskrivning', type: 'text' },
                    { key: 'toastErrorTitle', label: 'Fel: Rubrik', type: 'text' },
                    { key: 'toastErrorDesc', label: 'Fel: Beskrivning', type: 'text' },
                    { key: 'toastProcessingTitle', label: 'Behandlar: Rubrik', type: 'text' },
                    { key: 'toastProcessingDesc', label: 'Behandlar: Beskrivning', type: 'text' },
                    { key: 'toastValidationTitle', label: 'Validering: Rubrik', type: 'text' },
                    { key: 'toastValidationDesc', label: 'Validering: Beskrivning', type: 'text' },
                ]
            }
        ],
        // ═══════════════════════════════════════════════════════════════════════
        // PACKAGES PAGE
        // ═══════════════════════════════════════════════════════════════════════
        'packages:hero': [
            {
                title: '📝 Section Heading',
                description: 'Heading and intro for the packages page',
                fields: [
                    { key: 'pageTitle', label: 'Page Title (SEO)', type: 'text', hint: 'Shown in browser tab' },
                    { key: 'pageDescription', label: 'Page description (SEO)', type: 'textarea', hint: 'Used by search engines' },
                    { key: 'title', label: 'Main heading', type: 'text', hint: 'E.g. "Our Packages"' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
                ]
            }
        ],
        'packages:packages': [
            {
                title: '📝 Gemensamt',
                description: 'Shared text for all packages',
                fields: [
                    { key: 'title', label: 'Section heading', type: 'text' },
                    { key: 'subtitle', label: 'Underrubrrik', type: 'textarea' },
                    { key: 'mostPopular', label: '"Most Popular" badge', type: 'text', hint: 'Shown on featured package' },
                    { key: 'perPerson', label: '"Per person" text', type: 'text' },
                    { key: 'bookButton', label: 'Book button text', type: 'text' },
                ]
            },
            {
                title: '📦 Adventure-paketet',
                description: 'The longest package (7 days)',
                fields: [
                    { key: 'adventure.name', label: 'Package Name', type: 'text' },
                    { key: 'adventure.duration', label: 'Duration', type: 'text', hint: 'E.g. "7 dagar"' },
                    { key: 'adventure.description', label: 'Description', type: 'textarea' },
                    { key: 'adventure.highlights', label: 'Highlights (one per line)', type: 'textarea' },
                ]
            },
            {
                title: '📦 Complete-paketet',
                description: 'Mellanpaketet (5 dagar)',
                fields: [
                    { key: 'complete.name', label: 'Package Name', type: 'text' },
                    { key: 'complete.duration', label: 'Duration', type: 'text', hint: 'E.g. "5 dagar"' },
                    { key: 'complete.description', label: 'Description', type: 'textarea' },
                    { key: 'complete.highlights', label: 'Highlights (one per line)', type: 'textarea' },
                ]
            },
            {
                title: '📦 3-dagarspaketet',
                description: 'Kortare vinterupplevelse',
                fields: [
                    { key: 'threeDay.name', label: 'Package Name', type: 'text' },
                    { key: 'threeDay.duration', label: 'Duration', type: 'text', hint: 'E.g. "3 dagar"' },
                    { key: 'threeDay.description', label: 'Description', type: 'textarea' },
                    { key: 'threeDay.highlights', label: 'Highlights (one per line)', type: 'textarea' },
                ]
            },
            {
                title: '📦 Taster-paketet',
                description: 'Endagsupplevelsen',
                fields: [
                    { key: 'taster.name', label: 'Package Name', type: 'text' },
                    { key: 'taster.duration', label: 'Duration', type: 'text', hint: 'E.g. "1 dag"' },
                    { key: 'taster.description', label: 'Description', type: 'textarea' },
                    { key: 'taster.highlights', label: 'Highlights (one per line)', type: 'textarea' },
                ]
            }
        ],
        // ═══════════════════════════════════════════════════════════════════════
        // GALLERY PAGE
        // ═══════════════════════════════════════════════════════════════════════
        'gallery:hero': [
            {
                title: '📝 SEO & Metadata',
                description: 'Page information for search engines',
                fields: [
                    { key: 'gallery.meta.title', label: 'Meta Title', type: 'text', hint: 'Shown in browser tab' },
                    { key: 'gallery.meta.description', label: 'Meta Description', type: 'textarea', hint: 'Shown in search results' },
                ]
            },
            {
                title: '🎬 Hero Section',
                description: 'Top image with heading',
                fields: [
                    { key: 'gallery.hero.title', label: 'Heading', type: 'text' },
                    { key: 'gallery.hero.subtitle', label: 'Subtitle', type: 'textarea' },
                ]
            }
        ],
        'gallery:grid': [
            {
                title: '📑 Sektionsrubriker',
                description: 'Headings for gallery sections',
                fields: [
                    { key: 'gallery.sections.winter', label: 'Vinter-sektion', type: 'text' },
                    { key: 'gallery.sections.northernLights', label: 'Norrsken-sektion', type: 'text' },
                    { key: 'gallery.sections.husky', label: 'Hundspann-sektion', type: 'text' },
                    { key: 'gallery.sections.nature', label: 'Natur-sektion', type: 'text' },
                    { key: 'gallery.sections.food', label: 'Mat-sektion', type: 'text' },
                ]
            },
            {
                title: '🏷️ Kategori-filter',
                description: 'Text for filter buttons',
                fields: [
                    { key: 'gallery.categories.all', label: 'All', type: 'text' },
                    { key: 'gallery.categories.featured', label: 'Utvalda', type: 'text' },
                    { key: 'gallery.categories.snowmobile', label: 'Snowmobile', type: 'text' },
                    { key: 'gallery.categories.dogSledding', label: 'Dog Sledding', type: 'text' },
                    { key: 'gallery.categories.landscapes', label: 'Landskap', type: 'text' },
                    { key: 'gallery.categories.activities', label: 'Aktiviteter', type: 'text' },
                ]
            },
            {
                title: '🔘 UI-kontroller',
                description: 'Buttons and messages',
                fields: [
                    { key: 'gallery.noImages', label: '"No images" message', type: 'text' },
                    { key: 'gallery.closeModal', label: 'Close button', type: 'text' },
                    { key: 'gallery.prevImage', label: 'Previous button', type: 'text' },
                    { key: 'gallery.nextImage', label: 'Next button', type: 'text' },
                ]
            },
            {
                title: '🔘 Call-to-action',
                description: 'Avslutande CTA-sektion',
                fields: [
                    { key: 'gallery.cta.title', label: 'CTA-rubrik', type: 'text' },
                    { key: 'gallery.cta.button', label: 'CTA-knapptext', type: 'text' },
                ]
            }
        ],
        // ═══════════════════════════════════════════════════════════════════════
        // FAQ PAGE
        // ═══════════════════════════════════════════════════════════════════════
        'faq:hero': [
            {
                title: '🎬 Hero Section',
                description: 'Top content on the FAQ page',
                fields: [
                    { key: 'hero.title1', label: 'Heading (part 1)', type: 'text', hint: 'E.g. "Frequently Asked"' },
                    { key: 'hero.title2', label: 'Heading (part 2, colored)', type: 'text', hint: 'E.g. "Questions"' },
                    { key: 'hero.subtitle', label: 'Subtitle', type: 'textarea' },
                ]
            }
        ],
        'faq:questions': [
            {
                title: '🚗 Resa & Transport',
                description: 'Questions about how to get here',
                fields: [
                    { key: 'faq.item1.question', label: 'Question 1', type: 'text' },
                    { key: 'faq.item1.answer', label: 'Svar 1', type: 'textarea' },
                    { key: 'faq.item2.question', label: 'Question 2', type: 'text' },
                    { key: 'faq.item2.answer', label: 'Svar 2', type: 'textarea' },
                    { key: 'faq.item3.question', label: 'Question 3', type: 'text' },
                    { key: 'faq.item3.answer', label: 'Svar 3', type: 'textarea' },
                ]
            },
            {
                title: '🧥 Clothing & Equipment',
                description: 'What to pack and what is included',
                fields: [
                    { key: 'faq.item4.question', label: 'Question 4', type: 'text' },
                    { key: 'faq.item4.answer', label: 'Svar 4', type: 'textarea' },
                    { key: 'faq.item5.question', label: 'Question 5', type: 'text' },
                    { key: 'faq.item5.answer', label: 'Svar 5', type: 'textarea' },
                    { key: 'faq.item6.question', label: 'Question 6', type: 'text' },
                    { key: 'faq.item6.answer', label: 'Svar 6', type: 'textarea' },
                ]
            },
            {
                title: '🍽️ Kost & Praktiskt',
                description: 'Food, insurance and practical questions',
                fields: [
                    { key: 'faq.item7.question', label: 'Question 7', type: 'text' },
                    { key: 'faq.item7.answer', label: 'Svar 7', type: 'textarea' },
                    { key: 'faq.item8.question', label: 'Question 8', type: 'text' },
                    { key: 'faq.item8.answer', label: 'Svar 8', type: 'textarea' },
                    { key: 'faq.item9.question', label: 'Question 9', type: 'text' },
                    { key: 'faq.item9.answer', label: 'Svar 9', type: 'textarea' },
                    { key: 'faq.item10.question', label: 'Question 10', type: 'text' },
                    { key: 'faq.item10.answer', label: 'Svar 10', type: 'textarea' },
                ]
            }
        ],
    };

    // Get fields for this section - use schema if available, otherwise generate from content
    const getFieldGroups = (): FieldGroup[] => {
        const schemaKey = `${page}:${section}`;

        // Schema aliases - sections that should use another section's schema
        const SCHEMA_ALIASES: Record<string, string> = {
            'about:hosts': 'home:hosts',  // Both hosts sections share the same schema
        };

        // Check for alias first
        const aliasKey = SCHEMA_ALIASES[schemaKey];
        if (aliasKey && SECTION_SCHEMAS[aliasKey]) {
            return SECTION_SCHEMAS[aliasKey];
        }

        // Check for full page:section key first, then section-only (for subsections)
        if (SECTION_SCHEMAS[schemaKey]) {
            return SECTION_SCHEMAS[schemaKey];
        }
        if (SECTION_SCHEMAS[section]) {
            return SECTION_SCHEMAS[section];
        }

        // Fallback: generate from available content
        const fields: { key: string; label: string; type: 'text' | 'textarea'; hint?: string }[] = [];

        Object.keys(sectionContent).forEach(key => {
            const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

            const value = getValue(key);
            const isTextarea =
                value.length > 100 ||
                key.toLowerCase().includes('desc') ||
                key.toLowerCase().includes('intro') ||
                key.toLowerCase().includes('subtitle') ||
                key.toLowerCase().includes('content');

            fields.push({
                label,
                key,
                type: isTextarea ? 'textarea' : 'text',
            });
        });

        // Sort: titles first
        fields.sort((a, b) => {
            const aIsTitle = a.key.toLowerCase().includes('title');
            const bIsTitle = b.key.toLowerCase().includes('title');
            if (aIsTitle && !bIsTitle) return -1;
            if (!aIsTitle && bIsTitle) return 1;
            return a.key.localeCompare(b.key);
        });

        return [{
            title: '📝 Content Fields',
            description: `All available fields for ${section}`,
            fields
        }];
    };

    const fieldGroups = getFieldGroups();
    const totalFields = fieldGroups.reduce((sum, g) => sum + g.fields.length, 0);

    const handleChange = (key: string, value: string) => {
        // Update local state
        setLocalValues(prev => ({ ...prev, [key]: value }));

        // Använd exakt fieldKey för uppdatering (med punkter i namn)
        // Backend förväntar sig t.ex. "hero.title1" som nyckel
        updateContent(mapping.cmsPage, mapping.cmsSection, key, language as 'en' | 'sv' | 'de' | 'pl', value);
    };

    if (totalFields === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-white/40">Inget innehåll tillgängligt för denna sektion.</p>
                <p className="text-white/30 text-sm mt-2">
                    CMS-sökväg: {mapping.cmsPage}.{mapping.cmsSection}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Section info */}
            <div className="flex items-center justify-between text-xs text-white/30">
                <span>{totalFields} fält • {fieldGroups.length} grupper</span>
                <span>CMS: {mapping.cmsPage}/{mapping.cmsSection} • {language.toUpperCase()}</span>
            </div>

            {/* Field groups */}
            {fieldGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
                    {/* Clickable Group header */}
                    <button
                        onClick={() => toggleGroup(groupIndex)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <ChevronRight
                                size={16}
                                className={`text-white/40 transition-transform duration-200 ${isGroupExpanded(groupIndex) ? 'rotate-90' : ''}`}
                            />
                            <div className="text-left">
                                <h4 className="text-sm font-semibold text-white/80">{group.title}</h4>
                                {group.description && (
                                    <p className="text-xs text-white/40 mt-0.5">{group.description}</p>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded">
                            {group.fields.length} fält
                        </span>
                    </button>

                    {/* Collapsible Group fields */}
                    {isGroupExpanded(groupIndex) && (
                        <div className="space-y-4 px-4 pb-4 pt-2 border-t border-white/[0.04]">
                            {group.fields.map((field) => {
                                const currentValue = localValues[field.key] !== undefined
                                    ? localValues[field.key]
                                    : getValue(field.key);

                                // Skip fields that don't exist in content (using fieldExists helper)
                                if (!fieldExists(field.key) && !currentValue) {
                                    return null;
                                }

                                return (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white/60">
                                            {field.label}
                                            {field.hint && (
                                                <span className="text-xs text-white/30 font-normal">
                                                    ({field.hint})
                                                </span>
                                            )}
                                        </label>
                                        {field.type === 'text' ? (
                                            <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                placeholder={field.hint || `Ange ${field.label.toLowerCase()}...`}
                                                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#3f7ba7]/50 focus:ring-1 focus:ring-[#3f7ba7]/30 transition-all"
                                            />
                                        ) : field.type === 'url' ? (
                                            <div className="flex items-stretch">
                                                <div className="flex items-center px-3 bg-[#3f7ba7]/20 border border-white/[0.08] border-r-0 rounded-l-lg text-white/60">
                                                    🔗
                                                </div>
                                                <input
                                                    type="url"
                                                    value={currentValue}
                                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                                    placeholder={field.hint || 'https://...'}
                                                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-r-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#3f7ba7]/50 focus:ring-1 focus:ring-[#3f7ba7]/30 transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                rows={3}
                                                value={currentValue}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                placeholder={field.hint || `Ange ${field.label.toLowerCase()}...`}
                                                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#3f7ba7]/50 focus:ring-1 focus:ring-[#3f7ba7]/30 transition-all resize-none"
                                            />
                                        )}
                                        {currentValue && (
                                            <p className="text-[10px] text-white/25">{currentValue.length} tecken</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA CONTENT EDITOR COMPONENT
// Now uses SectionMediaLibrary for section-bound media management
// ═══════════════════════════════════════════════════════════════════════════
interface MediaContentEditorProps {
    page: string;
    section: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA SECTION MAPPING - Maps UI sections to Supabase cms_media table
// ═══════════════════════════════════════════════════════════════════════════
// SYNCED FROM WEBSITE SOURCE CODE (2024-12-20):
// hero/hero: 2 files | about/hero: 2 files | gallery/hero: 1 file
// features/features: 4 files | experiences/experiences: 15 files
// about/story: 17 files | about/ownerSection: 4 files
// gallery/gallery: 30 files | contact/contact: 2 files
// faq/questions: 1 file | packages/packages: 2 files
// ═══════════════════════════════════════════════════════════════════════════
const MEDIA_SECTION_MAPPING: Record<string, { cmsPage: string; cmsSection: string; pageName: string; sectionName: string }> = {
    // Home page sections - follows visual scroll order
    'home:hero': { cmsPage: 'hero', cmsSection: 'hero', pageName: 'Home', sectionName: '1. Hero' },
    'home:featured-video': { cmsPage: 'hero', cmsSection: 'hero', pageName: 'Home', sectionName: '2. Featured Video' },
    'home:why-choose-us': { cmsPage: 'features', cmsSection: 'features', pageName: 'Home', sectionName: '3. Why Choose Us' },
    'home:adventures': { cmsPage: 'experiences', cmsSection: 'experiences', pageName: 'Home', sectionName: '4. Adventures' },
    'home:hosts': { cmsPage: 'about', cmsSection: 'ownerSection', pageName: 'Home', sectionName: '5. Meet the Hosts' },
    // Adventure subsections (nested under Home > Adventures) - uses 'home:xxx' keys to match CONTENT_MAPPING
    'home:snowmobile': { cmsPage: 'experiences', cmsSection: 'snowmobile', pageName: 'Snöskoter', sectionName: 'Snowmobile Safari' },
    'home:northern-lights': { cmsPage: 'experiences', cmsSection: 'northernLights', pageName: 'Norrsken', sectionName: 'Northern Lights Tour' },
    'home:dog-sledding': { cmsPage: 'experiences', cmsSection: 'dogSledding', pageName: 'Hundspann', sectionName: 'Husky Ride' },
    'home:lodging': { cmsPage: 'experiences', cmsSection: 'lodging', pageName: 'Boende', sectionName: 'Accommodation' },
    // About page sections - Each section now has its own media in Supabase
    // Assigned via scripts/fix-about-media-service-role.cjs using service role key
    'about:hero': { cmsPage: 'about', cmsSection: 'hero', pageName: 'About', sectionName: '1. Hero' },
    'about:values': { cmsPage: 'about', cmsSection: 'values', pageName: 'About', sectionName: '2. Our Values' },
    'about:meet-us': { cmsPage: 'about', cmsSection: 'meet-us', pageName: 'About', sectionName: '3. Meet Gustav & Julia' },
    'about:action-images': { cmsPage: 'about', cmsSection: 'action-images', pageName: 'About', sectionName: '4. Action Images' },
    'about:timeline': { cmsPage: 'about', cmsSection: 'timeline', pageName: 'About', sectionName: '5. Our Journey' },
    'about:cta': { cmsPage: 'about', cmsSection: 'cta', pageName: 'About', sectionName: '6. Call to Action' },
    // Packages page sections - Each package has its own image
    // Assigned via scripts/setup-packages-media.cjs using service role key
    'packages:hero': { cmsPage: 'packages', cmsSection: 'hero', pageName: 'Packages', sectionName: '1. Hero' },
    'packages:package-complete': { cmsPage: 'packages', cmsSection: 'package-complete', pageName: 'Packages', sectionName: '2. Complete Package' },
    'packages:package-adventure': { cmsPage: 'packages', cmsSection: 'package-adventure', pageName: 'Packages', sectionName: '3. Adventure Package' },
    'packages:package-threeday': { cmsPage: 'packages', cmsSection: 'package-threeday', pageName: 'Packages', sectionName: '4. Three Day Package' },
    'packages:package-taster': { cmsPage: 'packages', cmsSection: 'package-taster', pageName: 'Packages', sectionName: '5. Taster Package' },
    // Gallery page sections - Gallery has its own hero video (galleri-opt.mp4)
    'gallery:hero': { cmsPage: 'gallery', cmsSection: 'hero', pageName: 'Gallery', sectionName: '1. Hero' },
    'gallery:grid': { cmsPage: 'gallery', cmsSection: 'gallery', pageName: 'Gallery', sectionName: '2. Image Grid' },
    // FAQ page sections - uses shared hero
    'faq:hero': { cmsPage: 'hero', cmsSection: 'hero', pageName: 'FAQ', sectionName: '1. Hero' },
    'faq:questions': { cmsPage: 'faq', cmsSection: 'questions', pageName: 'FAQ', sectionName: '2. Questions' },
    // Contact page sections - uses shared hero
    'contact:hero': { cmsPage: 'hero', cmsSection: 'hero', pageName: 'Contact', sectionName: '1. Hero' },
    'contact:form': { cmsPage: 'contact', cmsSection: 'contact', pageName: 'Contact', sectionName: '2. Contact Form' },
    'contact:info': { cmsPage: 'contact', cmsSection: 'contact', pageName: 'Contact', sectionName: '3. Contact Info' },
};

function MediaContentEditor({ page, section }: MediaContentEditorProps) {
    // Get CMS mapping for this UI page/section
    const mappingKey = `${page}:${section}`;
    // Check full key first, then section-only (for subsections like 'snowmobile')
    const mapping = MEDIA_SECTION_MAPPING[mappingKey] || MEDIA_SECTION_MAPPING[section] || {
        cmsPage: page,
        cmsSection: section,
        pageName: page.charAt(0).toUpperCase() + page.slice(1),
        sectionName: section.charAt(0).toUpperCase() + section.slice(1)
    };

    return (
        <SectionMediaLibrary
            pageId={mapping.cmsPage}
            sectionId={mapping.cmsSection}
            pageName={mapping.pageName}
            sectionName={mapping.sectionName}
        />
    );
}

export default App;
