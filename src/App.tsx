import { useState, useEffect, useCallback, useMemo } from 'react';
import { Snowflake, LogOut, Menu, X, Globe, Sparkles, Type, Image, ChevronRight, Settings, Check, Loader2, Database, RefreshCw, ImageIcon } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import { MediaLibrary } from './components/MediaLibrary';
import { SectionMediaLibrary } from './components/SectionMediaLibrary';
import { signOut, getCurrentUser, isEmailAllowed } from './lib/supabase';
import { useCmsContent } from './hooks/useCmsContent';

// Website page structure - mirrors coldexperience.se visual scroll order exactly
// Each section represents what you SEE when scrolling down the page
// Sections with 'subsections' are expandable in the sidebar
const WEBSITE_PAGES = [
    {
        id: 'home',
        label: 'Home',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'Bakgrundsvideo, titel, knappar, 3 feature-kort' },
            { id: 'featured-video', label: '2. Featured Video', icon: '▶', description: 'YouTube-video "Beyond the ordinary"' },
            { id: 'why-choose-us', label: '3. Why Choose Us', icon: '★', description: '4 USP-kort med bilder' },
            {
                id: 'adventures',
                label: '4. Adventures',
                icon: '❄',
                description: 'Äventyrssektionen med 4 upplevelser',
                // Sub-sections för varje äventyrstyp (egna undersidor på webbsidan)
                subsections: [
                    { id: 'snowmobile', label: 'Snöskoter', icon: '🛷', description: '/snowmobile-safari' },
                    { id: 'northern-lights', label: 'Norrsken', icon: '🌌', description: '/northern-lights' },
                    { id: 'dog-sledding', label: 'Hundspann', icon: '🐕', description: '/husky-ride' },
                    { id: 'lodging', label: 'Boende', icon: '🏠', description: '/accommodation' },
                ]
            },
            { id: 'hosts', label: '5. Meet the Hosts', icon: '👥', description: 'Gustav & Julia presentation' },
            { id: 'testimonials', label: '6. Testimonials', icon: '⭐', description: 'Gästrecensioner och betyg' },
            { id: 'instagram', label: '7. Instagram', icon: '📸', description: 'Instagram-flöde' },
            { id: 'corner', label: '8. Home Corner', icon: '🏔️', description: 'Snabbinfo-sektion' },
        ]
    },
    {
        id: 'about',
        label: 'About us',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'Bakgrundsvideo, titel "About Cold Experience Lapland", intro-text' },
            { id: 'values', label: '2. Our Values', icon: '💎', description: '4 värderingskort: Family, Authentic, Small Groups, Memories' },
            { id: 'meet-us', label: '3. Meet Gustav & Julia', icon: '👥', description: 'Presentation av värdparet med bild och kort' },
            { id: 'action-images', label: '4. Action Images', icon: '📸', description: '3 action-bilder: Snowmobile, Lodge, Landscape' },
            { id: 'timeline', label: '5. Our Journey', icon: '📅', description: 'Tidslinje med 5 milstolpar och bilder' },
            { id: 'cta', label: '6. Call to Action', icon: '🔘', description: 'Avslutande CTA med 3 knappar' },
        ]
    },
    {
        id: 'packages',
        label: 'Packages',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'Bakgrundsvideo och intro för paketsidan' },
            {
                id: 'packages',
                label: '2. Package Content',
                icon: '📦',
                description: 'Alla 4 paket med priser och beskrivningar',
                // Sub-sections för varje individuellt pakets media
                subsections: [
                    { id: 'package-complete', label: 'Complete Package', icon: '⭐', description: '7-dagars fullständiga upplevelsen' },
                    { id: 'package-adventure', label: 'Adventure Package', icon: '🛷', description: '5-dagars äventyrspaket' },
                    { id: 'package-threeday', label: 'Three Day Package', icon: '📅', description: '3-dagars upplevelse' },
                    { id: 'package-taster', label: 'Taster Package', icon: '🌟', description: '1-dags smakprov' },
                ]
            },
        ]
    },
    {
        id: 'gallery',
        label: 'Gallery',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'Galleri-introduktion' },
            { id: 'grid', label: '2. Image Grid', icon: '🖼', description: 'Alla galleribilder' },
        ]
    },
    {
        id: 'faq',
        label: 'FAQ',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'FAQ-introduktion' },
            { id: 'questions', label: '2. Questions', icon: '❓', description: 'Alla frågor och svar' },
        ]
    },
    {
        id: 'contact',
        label: 'Contact',
        sections: [
            { id: 'hero', label: '1. Hero', icon: '🎬', description: 'Kontaktsidans intro' },
            { id: 'form', label: '2. Contact Form', icon: '✉', description: 'Kontaktformulär' },
            { id: 'info', label: '3. Contact Info', icon: '📍', description: 'Adress, telefon, karta' },
        ]
    },
    {
        id: 'booking',
        label: 'Booking',
        sections: [
            { id: 'booking', label: '1. Booking Form', icon: '📅', description: 'Huvudbokningsformulär' },
            { id: 'book', label: '2. Book Section', icon: '📋', description: 'Bokningsruta och CTA' },
            { id: 'form', label: '3. Form Fields', icon: '📝', description: 'Formulärfält och validering' },
        ]
    },
    {
        id: 'navigation',
        label: 'Navigation & UI',
        sections: [
            { id: 'header', label: '1. Header', icon: '🔝', description: 'Navigeringsmeny och logotyp' },
            { id: 'footer', label: '2. Footer', icon: '📑', description: 'Sidfot med länkar och kontakt' },
            { id: 'common', label: '3. Common', icon: '🔧', description: 'Gemensamma UI-texter' },
            { id: 'shared', label: '4. Shared', icon: '🔄', description: 'Delade sektionstexter' },
        ]
    },
    {
        id: 'legal',
        label: 'Legal & Policies',
        sections: [
            { id: 'policies', label: '1. Policies', icon: '📜', description: 'Integritetspolicy, villkor, cookies' },
            { id: 'cookieBanner', label: '2. Cookie Banner', icon: '🍪', description: 'Cookie-banner texter' },
            { id: 'cookieSettings', label: '3. Cookie Settings', icon: '⚙', description: 'Cookie-inställningar' },
        ]
    },
];

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

type ContentMode = 'text' | 'media';

function App() {
    const [user, setUser] = useState<any>(null);
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

    // Using CMS content hook for data with Supabase integration
    const { saveChanges, syncToSupabase, forceResyncFromLocalJson, meta } = useCmsContent();

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
                alert('✅ Force resync klar! Alla fält har uppdaterats från den lokala JSON-filen.');
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
                                onClick={() => { setActivePage(page.id); setShowMediaLibrary(false); }}
                                className={`
                  relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300
                  ${activePage === page.id && !showMediaLibrary
                                        ? 'text-white'
                                        : 'text-white/50 hover:text-white/80'
                                    }
                `}
                            >
                                {page.label}
                                {/* Active indicator */}
                                {activePage === page.id && !showMediaLibrary && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#3f7ba7] to-transparent" />
                                )}
                            </button>
                        ))}
                        {/* Media Library button */}
                        <button
                            onClick={() => setShowMediaLibrary(true)}
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
                            {saving ? 'Sparar...' : showSaved ? 'Sparat!' : 'Spara'}
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
                            <button className="p-2 text-white/40 hover:text-white/70 transition-colors">
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
                            Logga ut
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
                <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-[#0a1622]/50 border-r border-white/[0.04]">
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
                            Sektioner
                        </span>
                        {currentPage.sections.map((section, index) => {
                            const hasSubsections = 'subsections' in section && Array.isArray((section as any).subsections);
                            const subsections = hasSubsections ? (section as any).subsections : [];
                            const isExpanded = activeSection === section.id || subsections.some((s: any) => activeSubsection === s.id);

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
                                            {subsections.map((sub: any) => (
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
                                    Synkar till Supabase...
                                </>
                            ) : syncSuccess ? (
                                <>
                                    <Database size={14} />
                                    {meta.total_fields} fält synkade!
                                </>
                            ) : (
                                <>
                                    <Database size={14} />
                                    Synka allt till Supabase
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-white/30 text-center mt-2">
                            Laddar upp alla {meta.total_fields} fält
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
                                    Återställer...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={12} />
                                    🔧 Force Resync (fixa korrupt data)
                                </>
                            )}
                        </button>
                        <p className="text-[9px] text-white/20 text-center mt-1.5">
                            Återställer ALLA fält från lokal JSON
                        </p>
                    </div>
                </aside>

                {/* ─────────────────────────────────────────────────────────────────────
            MAIN CONTENT AREA
        ───────────────────────────────────────────────────────────────────── */}
                <main className={`flex-1 min-h-[calc(100vh-4rem)] ${showMediaLibrary ? '' : 'lg:ml-64'}`}>
                    {/* Ambient Background */}
                    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${showMediaLibrary ? '' : 'lg:ml-64'}`}>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3f7ba7]/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-[#5a9bc7]/[0.02] rounded-full blur-[120px] translate-y-1/2" />
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 p-8 lg:p-12 max-w-6xl mx-auto">
                        {showMediaLibrary ? (
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
                                                Redigera {contentMode === 'text' ? 'textinnehåll' : 'bilder och media'} för denna sektion
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
                                                    {(currentPage.sections.find(s => s.id === activeSection) as any)?.subsections?.find((sub: any) => sub.id === activeSubsection)?.label}
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
                                                {contentMode === 'text' ? 'Textinnehåll' : 'Media & Bilder'}
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
        // Försök först med exakt nyckel (t.ex. "hero.title1", "meta.description")
        let fieldData = sectionContent[fieldKey];

        // Om inte hittat, prova utan prefix för bakåtkompatibilitet
        if (!fieldData && fieldKey.includes('.')) {
            const lastPart = fieldKey.split('.').pop()!;
            fieldData = sectionContent[lastPart];
        }

        // Om fortfarande inte hittat, prova att hitta nästlat objekt
        if (!fieldData && fieldKey.includes('.')) {
            const parts = fieldKey.split('.');
            let current: any = sectionContent;
            for (const part of parts) {
                if (current && typeof current === 'object') {
                    current = current[part];
                } else {
                    current = undefined;
                    break;
                }
            }
            if (current && typeof current === 'object' && 'en' in current) {
                fieldData = current;
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
                return value.map((item: any, i: number) => {
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
    // Groups related fields together with clear Swedish labels
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
                title: '📝 Huvudinnehåll',
                description: 'Rubriken och undertexten som visas i hero-sektionen',
                fields: [
                    { key: 'title', label: 'Rubrik (rad 1)', type: 'text', hint: 'T.ex. "Experience the"' },
                    { key: 'magic', label: 'Rubrik (rad 2, färgad)', type: 'text', hint: 'T.ex. "Magic of Lapland"' },
                    { key: 'subtitle', label: 'Undertext', type: 'textarea', hint: 'Beskrivande text under rubriken' },
                ]
            },
            {
                title: '🔘 Knappar',
                description: 'Call-to-action knappar i hero-sektionen',
                fields: [
                    { key: 'cta', label: 'Primär knapp', type: 'text', hint: 'T.ex. "Book Your Adventure"' },
                    { key: 'explore', label: 'Sekundär knapp', type: 'text', hint: 'T.ex. "View Packages"' },
                ]
            },
            {
                title: '💎 Feature-kort (desktop)',
                description: 'De tre informationskorten som visas längst ner på hero (endast desktop)',
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
                description: 'YouTube-video som visas under hero-sektionen',
                fields: [
                    { key: 'youtubeUrl', label: 'YouTube-länk', type: 'url', hint: 'Full YouTube embed-URL, t.ex. "https://www.youtube.com/embed/VIDEO_ID"' },
                    { key: 'title', label: 'Videotitel', type: 'text', hint: 'Rubrik som visas ovanför videon' },
                    { key: 'description', label: 'Beskrivning', type: 'textarea', hint: 'Text som visas under rubriken' },
                ]
            }
        ],
        // HOME PAGE - TESTIMONIALS
        'home:testimonials': [
            {
                title: '⭐ Gästrecensioner',
                description: 'Texter för recensionssektionen',
                fields: [
                    { key: 'title', label: 'Sektionsrubrik', type: 'text', hint: 'T.ex. "What Our Guests Say"' },
                    { key: 'subtitle', label: 'Undertext', type: 'textarea' },
                    { key: 'readMore', label: '"Läs mer" knapp', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - WHY CHOOSE US (FEATURES)
        'home:why-choose-us': [
            {
                title: '📝 Sektionsrubrik',
                fields: [
                    { key: 'title', label: 'Huvudrubrik', type: 'text', hint: 'T.ex. "Why our guests choose us"' },
                    { key: 'intro', label: 'Introduktionstext', type: 'textarea' },
                    { key: 'outro', label: 'Avslutande text', type: 'textarea' },
                ]
            },
            {
                title: '💎 Feature-kort',
                description: 'De fyra korten med bakgrundsvideos',
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

        // ABOUT PAGE - 1. HERO (Bakgrundsvideo + titel + intro)
        'about:hero': [
            {
                title: '🔍 SEO & Metadata',
                description: 'Sökmotoroptimering för About-sidan',
                fields: [
                    { key: 'meta.title', label: 'Sidtitel (webbläsarflik)', type: 'text', hint: 'T.ex. "About Us | Cold Experience Lapland"' },
                    { key: 'meta.description', label: 'Meta-beskrivning (Google)', type: 'textarea', hint: 'Max 160 tecken för bästa visning i sökresultat' },
                ]
            },
            {
                title: '🎬 Hero-sektion',
                description: 'Visas högst upp med bakgrundsvideo',
                fields: [
                    { key: 'title', label: 'Huvudrubrik', type: 'text', hint: 'T.ex. "About Cold Experience Lapland"' },
                    { key: 'intro', label: 'Introduktionstext', type: 'textarea', hint: 'Den vita texten under rubriken' },
                ]
            }
        ],

        // ABOUT PAGE - 2. OUR VALUES (4 värderingskort)
        'about:values': [
            {
                title: '💎 Sektionsrubrik',
                description: 'Rubriken ovanför värderingskorten',
                fields: [
                    { key: 'valuesTitle', label: 'Rubrik', type: 'text', hint: 'T.ex. "Our Values"' },
                ]
            },
            {
                title: '❤️ Kort 1: Family Experience',
                description: 'Familjevärdering med bakgrundsbild IMG_2425.jpg',
                fields: [
                    { key: 'values.family.title', label: 'Titel', type: 'text' },
                    { key: 'values.family.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '🏆 Kort 2: Authentic Experiences',
                description: 'Äkthetsvärdering med bakgrundsbild IMG_7834.jpg',
                fields: [
                    { key: 'values.authentic.title', label: 'Titel', type: 'text' },
                    { key: 'values.authentic.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '👥 Kort 3: Small Groups',
                description: 'Gruppstorlek med bakgrundsbild IMG_1547.jpg',
                fields: [
                    { key: 'values.groups.title', label: 'Titel', type: 'text' },
                    { key: 'values.groups.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '📸 Kort 4: Unforgettable Memories',
                description: 'Minnesvärdering med bakgrundsbild IMG_4436.jpg',
                fields: [
                    { key: 'values.memories.title', label: 'Titel', type: 'text' },
                    { key: 'values.memories.description', label: 'Beskrivning', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 3. MEET GUSTAV & JULIA
        'about:meet-us': [
            {
                title: '👋 Rubrik & Introduktion',
                description: 'Presentationsrubrik för värdparet',
                fields: [
                    { key: 'meetUs.title', label: 'Rubrik', type: 'text', hint: 'T.ex. "Meet Gustav & Julia"' },
                    { key: 'meetUs.description', label: 'Kort beskrivning', type: 'textarea' },
                    { key: 'meetUs.experience', label: 'Erfarenhetstext', type: 'textarea' },
                ]
            },
            {
                title: '🧭 Våra Guider (vänster kort)',
                description: 'Det lilla kortet till vänster',
                fields: [
                    { key: 'meetUs.guides', label: 'Korttitel', type: 'text', hint: 'T.ex. "Our Guides"' },
                    { key: 'meetUs.guidesDesc', label: 'Kortbeskrivning', type: 'textarea' },
                ]
            },
            {
                title: '👨‍👩‍👧‍👦 Vår Familj (höger kort)',
                description: 'Det lilla kortet till höger',
                fields: [
                    { key: 'meetUs.family', label: 'Korttitel', type: 'text', hint: 'T.ex. "Our Family"' },
                    { key: 'meetUs.familyDesc', label: 'Kortbeskrivning', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 4. ACTION IMAGES (3 bilder med overlay-text)
        'about:action-images': [
            {
                title: '📸 Action-bilder',
                description: 'De 3 bilderna under "Meet Gustav & Julia" med text-overlay',
                fields: [
                    { key: 'actionImages.snowmobile', label: 'Bild 1: Snöskoter (IMG_4108.jpg)', type: 'text', hint: 'Overlay-text på bilden' },
                    { key: 'actionImages.lodge', label: 'Bild 2: Lodge (IMG_3493.jpg)', type: 'text', hint: 'Overlay-text på bilden' },
                    { key: 'actionImages.landscape', label: 'Bild 3: Landskap (IMG_6698.jpg)', type: 'text', hint: 'Overlay-text på bilden' },
                ]
            }
        ],

        // ABOUT PAGE - 5. OUR JOURNEY (Tidslinje)
        'about:timeline': [
            {
                title: '📅 Tidslinjerubrik',
                description: 'Rubriken för hela tidslinjesektionen',
                fields: [
                    { key: 'journeyTitle', label: 'Rubrik', type: 'text', hint: 'T.ex. "Our Journey"' },
                ]
            },
            {
                title: '👶 1990s: Barndom i Lappland',
                description: 'Första milstolpen med bild gustav_childhood.jpg',
                fields: [
                    { key: 'timeline.childhood.title', label: 'Titel', type: 'text' },
                    { key: 'timeline.childhood.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '🍳 2000s: Kulinariska Upptäckter',
                description: 'Andra milstolpen med bild julias_matresa.jpg',
                fields: [
                    { key: 'timeline.culinary.title', label: 'Titel', type: 'text' },
                    { key: 'timeline.culinary.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '❤️ 2020: Passion för Äventyr',
                description: 'Tredje milstolpen med bild love_adventure.jpg',
                fields: [
                    { key: 'timeline.love.title', label: 'Titel', type: 'text' },
                    { key: 'timeline.love.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '👨‍👩‍👧‍👦 2022-2023: Familjebildning',
                description: 'Fjärde milstolpen med bild family_2.jpg',
                fields: [
                    { key: 'timeline.family.title', label: 'Titel', type: 'text' },
                    { key: 'timeline.family.description', label: 'Beskrivning', type: 'textarea' },
                ]
            },
            {
                title: '❄️ 2024: Cold Experience Föds',
                description: 'Femte milstolpen med bild coldexperience_born.jpg',
                fields: [
                    { key: 'timeline.coldExperience.title', label: 'Titel', type: 'text' },
                    { key: 'timeline.coldExperience.description', label: 'Beskrivning', type: 'textarea' },
                ]
            }
        ],

        // ABOUT PAGE - 6. CALL TO ACTION
        'about:cta': [
            {
                title: '🔘 Call to Action',
                description: 'Avslutande sektion med knappar - bakgrund IMG_0451.jpg',
                fields: [
                    { key: 'cta.title', label: 'Rubrik', type: 'text', hint: 'T.ex. "Ready for your adventure?"' },
                    { key: 'cta.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'cta.packages', label: 'Knapp 1: Paket', type: 'text', hint: 'T.ex. "View Packages"' },
                    { key: 'cta.contact', label: 'Knapp 2: Kontakt', type: 'text', hint: 'T.ex. "Contact"' },
                    { key: 'cta.gallery', label: 'Knapp 3: Galleri', type: 'text', hint: 'T.ex. "Gallery"' },
                ]
            }
        ],
        // HOME & ABOUT PAGE - HOSTS/OWNER SECTION (about.ownerSection - 19 fält)
        'home:hosts': [
            {
                title: '📝 Sektionsrubrik',
                description: 'Rubrik och intro för värdpar-sektionen',
                fields: [
                    { key: 'title1', label: 'Rubrik del 1', type: 'text', hint: 'T.ex. "Meet"' },
                    { key: 'title2', label: 'Rubrik del 2', type: 'text', hint: 'T.ex. "Your Hosts"' },
                    { key: 'intro', label: 'Introduktion', type: 'textarea' },
                    { key: 'names', label: 'Namn', type: 'text', hint: 'T.ex. "Gustav & Julia"' },
                ]
            },
            {
                title: '👤 Gustav',
                description: 'Presentation av Gustav',
                fields: [
                    { key: 'gustavTitle', label: 'Titel/roll', type: 'text' },
                    { key: 'gustavBio', label: 'Biografi', type: 'textarea' },
                ]
            },
            {
                title: '👤 Julia',
                description: 'Presentation av Julia',
                fields: [
                    { key: 'juliaTitle', label: 'Titel/roll', type: 'text' },
                    { key: 'juliaBio', label: 'Biografi', type: 'textarea' },
                ]
            },
            {
                title: '🏔 Livsstil & Filosofi',
                description: 'Citat och livsstilsbeskrivning',
                fields: [
                    { key: 'bio', label: 'Gemensam bio', type: 'textarea' },
                    { key: 'lifestyleTitle', label: 'Livsstil rubrik', type: 'text' },
                    { key: 'lifestyleQuote', label: 'Livsstilscitat', type: 'textarea' },
                ]
            },
            {
                title: '✨ Varför välja oss',
                description: 'Tre USP:er för värdarna',
                fields: [
                    { key: 'whyTitle', label: 'Varför-rubrik', type: 'text' },
                    { key: 'whyText', label: 'Varför-text', type: 'textarea' },
                    { key: 'localExpertiseTitle', label: 'Lokal expertis: Rubrik', type: 'text' },
                    { key: 'localExpertiseText', label: 'Lokal expertis: Text', type: 'textarea' },
                    { key: 'familyBusinessTitle', label: 'Familjeföretag: Rubrik', type: 'text' },
                    { key: 'familyBusinessText', label: 'Familjeföretag: Text', type: 'textarea' },
                    { key: 'authenticExperienceTitle', label: 'Äkta upplevelse: Rubrik', type: 'text' },
                    { key: 'authenticExperienceText', label: 'Äkta upplevelse: Text', type: 'textarea' },
                ]
            }
        ],
        // HOME PAGE - INSTAGRAM SECTION
        'home:instagram': [
            {
                title: '📸 Instagram-sektion',
                description: 'Instagram-integration och texter',
                fields: [
                    { key: 'title', label: 'Rubrik', type: 'text', hint: 'T.ex. "Latest from Instagram"' },
                    { key: 'subtitle', label: 'Underrubrik', type: 'text' },
                    { key: 'viewOnInstagram', label: '"Visa på Instagram"-knapp', type: 'text' },
                    { key: 'follow', label: '"Följ oss"-text', type: 'text' },
                    { key: 'loading', label: 'Laddningstext', type: 'text' },
                    { key: 'error', label: 'Felmeddelande', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - CORNER SECTION
        'home:corner': [
            {
                title: '👋 Vilka vi är',
                description: 'Kort presentation',
                fields: [
                    { key: 'whoTitle', label: 'Rubrik', type: 'text' },
                    { key: 'whoBody', label: 'Text', type: 'textarea' },
                ]
            },
            {
                title: '🎿 Äventyr',
                description: 'Äventyrs-preview',
                fields: [
                    { key: 'adventuresTitle', label: 'Rubrik', type: 'text' },
                    { key: 'huskyTitle', label: 'Husky: Rubrik', type: 'text' },
                    { key: 'huskyBody', label: 'Husky: Text', type: 'textarea' },
                    { key: 'snowmobileTitle', label: 'Snöskoter: Rubrik', type: 'text' },
                    { key: 'snowmobileBody', label: 'Snöskoter: Text', type: 'textarea' },
                    { key: 'nlightsTitle', label: 'Norrsken: Rubrik', type: 'text' },
                    { key: 'nlightsBody', label: 'Norrsken: Text', type: 'textarea' },
                    { key: 'learnMore', label: '"Läs mer"-knapp', type: 'text' },
                ]
            },
            {
                title: '✨ Varför oss',
                description: 'USP:er och CTA',
                fields: [
                    { key: 'whyTitle', label: 'Rubrik', type: 'text' },
                    { key: 'whyLocal', label: 'Lokal expertis', type: 'text' },
                    { key: 'whyHosp', label: 'Gästfrihet', type: 'text' },
                    { key: 'whySmall', label: 'Små grupper', type: 'text' },
                    { key: 'planTitle', label: 'Planera: Rubrik', type: 'text' },
                    { key: 'planBody', label: 'Planera: Text', type: 'textarea' },
                    { key: 'viewPackages', label: '"Se paket"-knapp', type: 'text' },
                    { key: 'bookNow', label: '"Boka nu"-knapp', type: 'text' },
                    { key: 'contactUs', label: '"Kontakta oss"-knapp', type: 'text' },
                ]
            }
        ],
        // About hosts uses same schema as home hosts (same data source)
        // getFieldGroups() will fall back to 'home:hosts' schema since it shares the same data
        // NAVIGATION - FOOTER (navigation.footer - 29 fält)
        'navigation:footer': [
            {
                title: '🏢 Företagsinfo',
                description: 'Grundläggande företagsinformation',
                fields: [
                    { key: 'companyName', label: 'Företagsnamn', type: 'text' },
                    { key: 'companyDescription', label: 'Företagsbeskrivning', type: 'textarea' },
                    { key: 'rights', label: 'Upphovsrättstext', type: 'text' },
                    { key: 'quote', label: 'Citat/motto', type: 'text' },
                ]
            },
            {
                title: '🔗 Snabblänkar',
                description: 'Huvudnavigering i footer',
                fields: [
                    { key: 'quickLinks.title', label: 'Rubrik', type: 'text' },
                    { key: 'quickLinks.home', label: 'Hem', type: 'text' },
                    { key: 'quickLinks.about', label: 'Om oss', type: 'text' },
                    { key: 'quickLinks.packages', label: 'Paket', type: 'text' },
                    { key: 'quickLinks.gallery', label: 'Galleri', type: 'text' },
                    { key: 'quickLinks.contact', label: 'Kontakt', type: 'text' },
                ]
            },
            {
                title: '❄ Upplevelser',
                description: 'Länkar till äventyrsupplevelser',
                fields: [
                    { key: 'experiences.title', label: 'Rubrik', type: 'text' },
                    { key: 'experiences.snowmobile', label: 'Snöskoter', type: 'text' },
                    { key: 'experiences.northernLights', label: 'Norrsken', type: 'text' },
                    { key: 'experiences.dogSledding', label: 'Hundspann', type: 'text' },
                    { key: 'experiences.saunaHotTub', label: 'Bastu & Badtunna', type: 'text' },
                    { key: 'experiences.iceFishing', label: 'Isfiske', type: 'text' },
                    { key: 'experiences.localCuisine', label: 'Lokal mat', type: 'text' },
                ]
            },
            {
                title: '📍 Kontaktinfo',
                description: 'Adress, telefon och e-post',
                fields: [
                    { key: 'contact.title', label: 'Rubrik', type: 'text' },
                    { key: 'contact.addressLine1', label: 'Adressrad 1', type: 'text' },
                    { key: 'contact.addressLine2', label: 'Adressrad 2', type: 'text' },
                    { key: 'contact.phone', label: 'Telefon', type: 'text' },
                    { key: 'contact.email', label: 'E-post', type: 'text' },
                ]
            },
            {
                title: '📅 Säsong',
                description: 'Information om vintersäsongen',
                fields: [
                    { key: 'season.title', label: 'Rubrik', type: 'text' },
                    { key: 'season.dates', label: 'Datum', type: 'text' },
                    { key: 'season.cta', label: 'Call-to-action', type: 'text' },
                ]
            },
            {
                title: '📜 Juridiska länkar',
                description: 'Policylänkar och cookie-inställningar',
                fields: [
                    { key: 'privacyPolicy', label: 'Integritetspolicy', type: 'text' },
                    { key: 'termsOfService', label: 'Användarvillkor', type: 'text' },
                    { key: 'cookiePolicy', label: 'Cookie-policy', type: 'text' },
                    { key: 'cookieSettings', label: 'Cookie-inställningar', type: 'text' },
                ]
            }
        ],
        // LEGAL - POLICIES (legal.policies - 27 fält)
        'legal:policies': [
            {
                title: '📜 Integritetspolicy',
                description: 'GDPR och dataskydd',
                fields: [
                    { key: 'privacy.categoryLabel', label: 'Kategorietikett', type: 'text' },
                    { key: 'privacy.title', label: 'Rubrik', type: 'text' },
                    { key: 'privacy.lastUpdated', label: 'Senast uppdaterad', type: 'text' },
                    { key: 'privacy.intro', label: 'Introduktion', type: 'textarea' },
                    { key: 'privacy.sections', label: 'Sektioner (JSON)', type: 'textarea' },
                    { key: 'privacy.contact.label', label: 'Kontakt etikett', type: 'text' },
                    { key: 'privacy.contact.title', label: 'Kontakt rubrik', type: 'text' },
                    { key: 'privacy.contact.description', label: 'Kontakt beskrivning', type: 'textarea' },
                    { key: 'privacy.contact.email', label: 'Kontakt e-post', type: 'text' },
                ]
            },
            {
                title: '📋 Användarvillkor',
                description: 'Villkor för tjänsten',
                fields: [
                    { key: 'terms.categoryLabel', label: 'Kategorietikett', type: 'text' },
                    { key: 'terms.title', label: 'Rubrik', type: 'text' },
                    { key: 'terms.lastUpdated', label: 'Senast uppdaterad', type: 'text' },
                    { key: 'terms.intro', label: 'Introduktion', type: 'textarea' },
                    { key: 'terms.sections', label: 'Sektioner (JSON)', type: 'textarea' },
                    { key: 'terms.contact.label', label: 'Kontakt etikett', type: 'text' },
                    { key: 'terms.contact.title', label: 'Kontakt rubrik', type: 'text' },
                    { key: 'terms.contact.description', label: 'Kontakt beskrivning', type: 'textarea' },
                    { key: 'terms.contact.email', label: 'Kontakt e-post', type: 'text' },
                ]
            },
            {
                title: '🍪 Cookies',
                description: 'Cookie-policy',
                fields: [
                    { key: 'cookies.categoryLabel', label: 'Kategorietikett', type: 'text' },
                    { key: 'cookies.title', label: 'Rubrik', type: 'text' },
                    { key: 'cookies.lastUpdated', label: 'Senast uppdaterad', type: 'text' },
                    { key: 'cookies.intro', label: 'Introduktion', type: 'textarea' },
                    { key: 'cookies.sections', label: 'Sektioner (JSON)', type: 'textarea' },
                    { key: 'cookies.contact.label', label: 'Kontakt etikett', type: 'text' },
                    { key: 'cookies.contact.title', label: 'Kontakt rubrik', type: 'text' },
                    { key: 'cookies.contact.description', label: 'Kontakt beskrivning', type: 'textarea' },
                    { key: 'cookies.contact.email', label: 'Kontakt e-post', type: 'text' },
                ]
            }
        ],
        // HOME PAGE - ADVENTURES (the section showing all 4 adventure cards)
        'home:adventures': [
            {
                title: '📝 Sektionsrubrik',
                description: 'Rubrik och intro som visas högst upp i äventyrssektionen',
                fields: [
                    { key: 'title', label: 'Rubrik (del 1)', type: 'text', hint: '"Magical"' },
                    { key: 'titleHighlight', label: 'Rubrik (del 2, färgad)', type: 'text', hint: '"Winter Adventures"' },
                    { key: 'intro', label: 'Introduktionstext', type: 'textarea' },
                ]
            },
            {
                title: '🛷 Kort 1: Snöskoter',
                description: 'Första adventure-kortet på startsidan',
                fields: [
                    { key: 'snowmobileTitle', label: 'Rubrik', type: 'text' },
                    { key: 'snowmobileDesc', label: 'Beskrivning', type: 'textarea' },
                    { key: 'snowmobileFeature1', label: 'Punkt 1', type: 'text' },
                    { key: 'snowmobileFeature2', label: 'Punkt 2', type: 'text' },
                    { key: 'snowmobileFeature3', label: 'Punkt 3', type: 'text' },
                    { key: 'snowmobileFeature4', label: 'Punkt 4', type: 'text' },
                ]
            },
            {
                title: '🌌 Kort 2: Norrsken',
                description: 'Andra adventure-kortet på startsidan',
                fields: [
                    { key: 'northernLightsTitle', label: 'Rubrik', type: 'text' },
                    { key: 'northernLightsDesc', label: 'Beskrivning', type: 'textarea' },
                    { key: 'northernLightsFeature1', label: 'Punkt 1', type: 'text' },
                    { key: 'northernLightsFeature2', label: 'Punkt 2', type: 'text' },
                    { key: 'northernLightsFeature3', label: 'Punkt 3', type: 'text' },
                    { key: 'northernLightsFeature4', label: 'Punkt 4', type: 'text' },
                ]
            },
            {
                title: '🐕 Kort 3: Hundspann',
                description: 'Tredje adventure-kortet på startsidan',
                fields: [
                    { key: 'dogSleddingTitle', label: 'Rubrik', type: 'text' },
                    { key: 'dogSleddingDesc', label: 'Beskrivning', type: 'textarea' },
                    { key: 'dogSleddingFeature1', label: 'Punkt 1', type: 'text' },
                    { key: 'dogSleddingFeature2', label: 'Punkt 2', type: 'text' },
                    { key: 'dogSleddingFeature3', label: 'Punkt 3', type: 'text' },
                    { key: 'dogSleddingFeature4', label: 'Punkt 4', type: 'text' },
                ]
            },
            {
                title: '🏠 Kort 4: Boende',
                description: 'Fjärde adventure-kortet på startsidan',
                fields: [
                    { key: 'lodgingTitle', label: 'Rubrik', type: 'text' },
                    { key: 'lodgingDesc', label: 'Beskrivning', type: 'textarea' },
                    { key: 'lodgingFeature1', label: 'Punkt 1', type: 'text' },
                    { key: 'lodgingFeature2', label: 'Punkt 2', type: 'text' },
                    { key: 'lodgingFeature3', label: 'Punkt 3', type: 'text' },
                    { key: 'lodgingFeature4', label: 'Punkt 4', type: 'text' },
                ]
            },
            {
                title: '🔘 Call-to-action',
                description: 'Rutan längst ner i äventyrssektionen',
                fields: [
                    { key: 'learnMore', label: '"Läs mer" knapp', type: 'text' },
                    { key: 'ctaTitle', label: 'CTA Rubrik', type: 'text' },
                    { key: 'ctaDesc', label: 'CTA Beskrivning', type: 'textarea' },
                    { key: 'ctaBook', label: 'Bokningsknapp text', type: 'text' },
                ]
            }
        ],

        // ADVENTURE SUBSECTION - SNOWMOBILE (full subpage content)
        // Keys match database: 'snowmobileSafari.xxx' (NO 'pages.' prefix)
        'home:snowmobile': [
            {
                title: '🎬 Hero-sektion',
                description: 'Toppbild och intro för snöskotersidan',
                fields: [
                    { key: 'snowmobileSafari.hero.title', label: 'Rubrik', type: 'text' },
                    { key: 'snowmobileSafari.hero.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'snowmobileSafari.hero.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'snowmobileSafari.hero.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'snowmobileSafari.intro.heading', label: 'Rubrik', type: 'text' },
                    { key: 'snowmobileSafari.intro.paragraphs', label: 'Stycken', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'snowmobileSafari.features', label: 'Features (lista)', type: 'textarea' },
                    { key: 'snowmobileSafari.sectionsHeading', label: 'Sektion rubrik', type: 'text' },
                ]
            },
            {
                title: '📋 Dagsprogram',
                fields: [
                    { key: 'snowmobileSafari.dayProgram.title', label: 'Rubrik', type: 'text' },
                    { key: 'snowmobileSafari.dayProgram.steps', label: 'Steg (lista)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Avslutning/CTA',
                fields: [
                    { key: 'snowmobileSafari.closing.title', label: 'Rubrik', type: 'text' },
                    { key: 'snowmobileSafari.closing.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'snowmobileSafari.closing.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'snowmobileSafari.closing.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                    { key: 'snowmobileSafari.closing.ratingText', label: 'Betygstext', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'snowmobileSafari.meta.title', label: 'Meta titel', type: 'text' },
                    { key: 'snowmobileSafari.meta.description', label: 'Meta beskrivning', type: 'textarea' },
                    { key: 'snowmobileSafari.meta.keywords', label: 'Nyckelord', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - NORTHERN LIGHTS
        // Keys match database: 'northernLights.xxx' (NO 'pages.' prefix)
        'home:northern-lights': [
            {
                title: '🎬 Hero-sektion',
                fields: [
                    { key: 'northernLights.hero.title', label: 'Rubrik', type: 'text' },
                    { key: 'northernLights.hero.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'northernLights.hero.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'northernLights.hero.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'northernLights.intro.heading', label: 'Rubrik', type: 'text' },
                    { key: 'northernLights.intro.paragraphs', label: 'Stycken', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'northernLights.features', label: 'Features (lista)', type: 'textarea' },
                    { key: 'northernLights.sectionsHeading', label: 'Sektion rubrik', type: 'text' },
                ]
            },
            {
                title: '📋 Kvällsschema',
                fields: [
                    { key: 'northernLights.dayProgram.title', label: 'Rubrik', type: 'text' },
                    { key: 'northernLights.dayProgram.steps', label: 'Steg (lista)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Avslutning/CTA',
                fields: [
                    { key: 'northernLights.closing.title', label: 'Rubrik', type: 'text' },
                    { key: 'northernLights.closing.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'northernLights.closing.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'northernLights.closing.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                    { key: 'northernLights.closing.ratingText', label: 'Betygstext', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'northernLights.meta.title', label: 'Meta titel', type: 'text' },
                    { key: 'northernLights.meta.description', label: 'Meta beskrivning', type: 'textarea' },
                    { key: 'northernLights.meta.keywords', label: 'Nyckelord', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - DOG SLEDDING
        // Keys match database: 'huskyRide.xxx' (NO 'pages.' prefix)
        'home:dog-sledding': [
            {
                title: '🎬 Hero-sektion',
                fields: [
                    { key: 'huskyRide.hero.title', label: 'Rubrik', type: 'text' },
                    { key: 'huskyRide.hero.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'huskyRide.hero.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'huskyRide.hero.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'huskyRide.intro.heading', label: 'Rubrik', type: 'text' },
                    { key: 'huskyRide.intro.paragraphs', label: 'Stycken', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'huskyRide.features', label: 'Features (lista)', type: 'textarea' },
                    { key: 'huskyRide.sectionsHeading', label: 'Sektion rubrik', type: 'text' },
                ]
            },
            {
                title: '📋 Turschema',
                fields: [
                    { key: 'huskyRide.dayProgram.title', label: 'Rubrik', type: 'text' },
                    { key: 'huskyRide.dayProgram.steps', label: 'Steg (lista)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Avslutning/CTA',
                fields: [
                    { key: 'huskyRide.closing.title', label: 'Rubrik', type: 'text' },
                    { key: 'huskyRide.closing.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'huskyRide.closing.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'huskyRide.closing.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                    { key: 'huskyRide.closing.ratingText', label: 'Betygstext', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'huskyRide.meta.title', label: 'Meta titel', type: 'text' },
                    { key: 'huskyRide.meta.description', label: 'Meta beskrivning', type: 'textarea' },
                    { key: 'huskyRide.meta.keywords', label: 'Nyckelord', type: 'text' },
                ]
            }
        ],
        // ADVENTURE SUBSECTION - LODGING
        // Keys match database: 'lodging.xxx' (NO 'pages.' prefix)
        'home:lodging': [
            {
                title: '🎬 Hero-sektion',
                fields: [
                    { key: 'lodging.hero.title', label: 'Rubrik', type: 'text' },
                    { key: 'lodging.hero.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'lodging.hero.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'lodging.hero.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                ]
            },
            {
                title: '📝 Intro',
                fields: [
                    { key: 'lodging.intro.heading', label: 'Rubrik', type: 'text' },
                    { key: 'lodging.intro.paragraphs', label: 'Stycken', type: 'textarea' },
                ]
            },
            {
                title: '✨ Features',
                fields: [
                    { key: 'lodging.features', label: 'Features (lista)', type: 'textarea' },
                    { key: 'lodging.sectionsHeading', label: 'Sektion rubrik', type: 'text' },
                ]
            },
            {
                title: '📋 En dag på gästhuset',
                fields: [
                    { key: 'lodging.dayProgram.title', label: 'Rubrik', type: 'text' },
                    { key: 'lodging.dayProgram.steps', label: 'Steg (lista)', type: 'textarea' },
                ]
            },
            {
                title: '🔘 Avslutning/CTA',
                fields: [
                    { key: 'lodging.closing.title', label: 'Rubrik', type: 'text' },
                    { key: 'lodging.closing.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'lodging.closing.primaryButton.label', label: 'Primär knapp', type: 'text' },
                    { key: 'lodging.closing.secondaryButton.label', label: 'Sekundär knapp', type: 'text' },
                    { key: 'lodging.closing.ratingText', label: 'Betygstext', type: 'text' },
                ]
            },
            {
                title: '🔍 SEO/Meta',
                fields: [
                    { key: 'lodging.meta.title', label: 'Meta titel', type: 'text' },
                    { key: 'lodging.meta.description', label: 'Meta beskrivning', type: 'textarea' },
                    { key: 'lodging.meta.keywords', label: 'Nyckelord', type: 'text' },
                ]
            }
        ],

        // ═══════════════════════════════════════════════════════════════════════
        // CONTACT PAGE SCHEMAS
        // ═══════════════════════════════════════════════════════════════════════

        // CONTACT PAGE - HERO (3 fält)
        'contact:hero': [
            {
                title: '🎬 Hero-sektion',
                description: 'Toppinnehåll på kontaktsidan',
                fields: [
                    { key: 'hero.title1', label: 'Rubrik del 1', type: 'text', hint: 'T.ex. "Get in"' },
                    { key: 'hero.title2', label: 'Rubrik del 2 (färgad)', type: 'text', hint: 'T.ex. "Touch"' },
                    { key: 'hero.subtitle', label: 'Undertext', type: 'textarea' },
                ]
            }
        ],

        // CONTACT PAGE - FORM (~19 fält)
        'contact:form': [
            {
                title: '📝 Formulär - Rubriker',
                description: 'Rubriker och introduktionstext för formuläret',
                fields: [
                    { key: 'form.title', label: 'Formulärrubrik', type: 'text' },
                    { key: 'form.subtitle', label: 'Formulärundertext', type: 'textarea' },
                ]
            },
            {
                title: '📝 Formulär - Fältetiketter',
                description: 'Etiketter och placeholder-texter för formulärfält',
                fields: [
                    { key: 'form.nameLabel', label: 'Namn: Etikett', type: 'text' },
                    { key: 'form.namePlaceholder', label: 'Namn: Placeholder', type: 'text' },
                    { key: 'form.emailLabel', label: 'E-post: Etikett', type: 'text' },
                    { key: 'form.emailPlaceholder', label: 'E-post: Placeholder', type: 'text' },
                    { key: 'form.phoneLabel', label: 'Telefon: Etikett', type: 'text' },
                    { key: 'form.phonePlaceholder', label: 'Telefon: Placeholder', type: 'text' },
                    { key: 'form.subjectLabel', label: 'Ämne: Etikett', type: 'text' },
                    { key: 'form.messageLabel', label: 'Meddelande: Etikett', type: 'text' },
                    { key: 'form.messagePlaceholder', label: 'Meddelande: Placeholder', type: 'text' },
                ]
            },
            {
                title: '📝 Formulär - Ämnesval',
                description: 'Dropdown-alternativ för ämnesväljaren',
                fields: [
                    { key: 'form.subjectOptions.select', label: 'Välj ämne (default)', type: 'text' },
                    { key: 'form.subjectOptions.booking', label: 'Bokning', type: 'text' },
                    { key: 'form.subjectOptions.sevenDay', label: '7-dagars paket', type: 'text' },
                    { key: 'form.subjectOptions.fiveDay', label: '5-dagars paket', type: 'text' },
                    { key: 'form.subjectOptions.oneDay', label: '1-dags upplevelse', type: 'text' },
                    { key: 'form.subjectOptions.custom', label: 'Skräddarsydd upplevelse', type: 'text' },
                    { key: 'form.subjectOptions.general', label: 'Allmän förfrågan', type: 'text' },
                ]
            },
            {
                title: '📝 Formulär - Övrigt',
                fields: [
                    { key: 'form.contactByPhone', label: 'Checkbox: Kontakt via telefon', type: 'text' },
                    { key: 'form.sendButton', label: 'Skicka-knapp text', type: 'text' },
                ]
            },
            {
                title: '✅ Bekräftelsemeddelanden',
                description: 'Toast-meddelanden som visas efter formulärskickning',
                fields: [
                    { key: 'toast.missingTitle', label: 'Saknade fält: Rubrik', type: 'text' },
                    { key: 'toast.missingDesc', label: 'Saknade fält: Beskrivning', type: 'text' },
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
                    { key: 'info.location.title', label: 'Rubrik', type: 'text' },
                    { key: 'info.location.line1', label: 'Adressrad 1', type: 'text' },
                    { key: 'info.location.line2', label: 'Adressrad 2', type: 'text' },
                ]
            },
            {
                title: '📞 Telefon',
                fields: [
                    { key: 'info.phone.title', label: 'Rubrik', type: 'text' },
                    { key: 'info.phone.number', label: 'Telefonnummer', type: 'text' },
                    { key: 'info.phone.note', label: 'Anteckning', type: 'text' },
                ]
            },
            {
                title: '✉️ E-post',
                fields: [
                    { key: 'info.email.title', label: 'Rubrik', type: 'text' },
                    { key: 'info.email.address', label: 'E-postadress', type: 'text' },
                    { key: 'info.email.note', label: 'Anteckning', type: 'text' },
                ]
            },
            {
                title: '📅 Säsong',
                fields: [
                    { key: 'info.season.title', label: 'Rubrik', type: 'text' },
                    { key: 'info.season.dates', label: 'Datum/Period', type: 'text' },
                    { key: 'info.season.cta', label: 'Call-to-action', type: 'text' },
                ]
            },
            {
                title: '🔗 Sociala medier',
                fields: [
                    { key: 'social.title', label: 'Rubrik', type: 'text' },
                    { key: 'social.subtitle', label: 'Undertext', type: 'text' },
                ]
            },
            {
                title: '🔘 Call-to-action',
                fields: [
                    { key: 'ctaTitle', label: 'CTA Rubrik', type: 'text' },
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
                    { key: 'findusTitle', label: 'Rubrik', type: 'text' },
                    { key: 'openMaps', label: 'Öppna karta knapp', type: 'text' },
                ]
            }
        ],

        // ═══════════════════════════════════════════════════════════════════════
        // BOOKING PAGE SCHEMAS (43 fält)
        // ═══════════════════════════════════════════════════════════════════════

        'booking:booking': [
            {
                title: '📝 Formulär - Rubriker & Fält',
                description: 'Huvudrubriker och formulärfältstexter',
                fields: [
                    { key: 'formTitle', label: 'Formulärets rubrik', type: 'text' },
                    { key: 'selectedDateText', label: 'Valt datum text', type: 'text' },
                    { key: 'dateNotSelected', label: 'Datum ej valt text', type: 'text' },
                    { key: 'submitButton', label: 'Skicka-knapp', type: 'text' },
                    { key: 'submitButtonLoading', label: 'Skicka-knapp (laddar)', type: 'text' },
                ]
            },
            {
                title: '📝 Fältetiketter & Placeholders',
                description: 'Etiketter och placeholder-texter för bokningsformulär',
                fields: [
                    { key: 'childrenAgesLabel', label: 'Barn ålder: Etikett', type: 'text' },
                    { key: 'childrenAgesPlaceholder', label: 'Barn ålder: Placeholder', type: 'text' },
                ]
            },
            {
                title: '⚠️ Valideringsfel',
                description: 'Felmeddelanden som visas vid ogiltig inmatning',
                fields: [
                    { key: 'nameErrorRequired', label: 'Namn: Obligatoriskt fel', type: 'text' },
                    { key: 'nameErrorShort', label: 'Namn: För kort fel', type: 'text' },
                    { key: 'emailErrorRequired', label: 'E-post: Obligatoriskt fel', type: 'text' },
                    { key: 'emailErrorInvalid', label: 'E-post: Ogiltigt format fel', type: 'text' },
                    { key: 'phoneErrorRequired', label: 'Telefon: Obligatoriskt fel', type: 'text' },
                    { key: 'phoneErrorInvalid', label: 'Telefon: Ogiltigt format fel', type: 'text' },
                    { key: 'dateErrorRequired', label: 'Datum: Obligatoriskt fel', type: 'text' },
                    { key: 'dateErrorPast', label: 'Datum: Passerat datum fel', type: 'text' },
                    { key: 'packageError', label: 'Paket: Obligatoriskt fel', type: 'text' },
                    { key: 'numAdultsError', label: 'Antal vuxna: Fel', type: 'text' },
                    { key: 'numChildrenError', label: 'Antal barn: Fel', type: 'text' },
                    { key: 'childrenAgesErrorRequired', label: 'Barns åldrar: Obligatoriskt fel', type: 'text' },
                    { key: 'childrenAgesErrorRange', label: 'Barns åldrar: Intervallfel', type: 'text' },
                    { key: 'consentError', label: 'Samtycke: Obligatoriskt fel', type: 'text' },
                    { key: 'messageErrorTooLong', label: 'Meddelande: För långt fel', type: 'text' },
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
                    { key: 'summaryPackage', label: 'Sammanfattning: Paket', type: 'text' },
                    { key: 'summaryDate', label: 'Sammanfattning: Datum', type: 'text' },
                    { key: 'summaryAdults', label: 'Sammanfattning: Vuxna', type: 'text' },
                    { key: 'summaryChildren', label: 'Sammanfattning: Barn', type: 'text' },
                    { key: 'summaryChildrenAges', label: 'Sammanfattning: Barnens åldrar', type: 'text' },
                    { key: 'summaryPrice', label: 'Sammanfattning: Pris', type: 'text' },
                    { key: 'summaryConfirmationEmail', label: 'Bekräftelse: E-post info', type: 'text' },
                    { key: 'summaryConfirmationCall', label: 'Bekräftelse: Telefoninfo', type: 'text' },
                    { key: 'consentLabel', label: 'Samtycke: Etikett', type: 'textarea' },
                ]
            },
            {
                title: '✅ Toast-meddelanden',
                description: 'Popup-meddelanden för feedback',
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
                title: '📝 Sektionsrubrik',
                description: 'Rubrik och introduktion för paketsidan',
                fields: [
                    { key: 'pageTitle', label: 'Sidtitel (SEO)', type: 'text', hint: 'Visas i webbläsarflik' },
                    { key: 'pageDescription', label: 'Sidbeskrivning (SEO)', type: 'textarea', hint: 'Används av sökmotorer' },
                    { key: 'title', label: 'Huvudrubrik', type: 'text', hint: 'T.ex. "Our Packages"' },
                    { key: 'subtitle', label: 'Undertext', type: 'textarea' },
                ]
            }
        ],
        'packages:packages': [
            {
                title: '📝 Gemensamt',
                description: 'Gemensamma texter för alla paket',
                fields: [
                    { key: 'title', label: 'Sektionsrubrik', type: 'text' },
                    { key: 'subtitle', label: 'Underrubrrik', type: 'textarea' },
                    { key: 'mostPopular', label: '"Mest populär" badge', type: 'text', hint: 'Visas på utvalt paket' },
                    { key: 'perPerson', label: '"Per person" text', type: 'text' },
                    { key: 'bookButton', label: 'Bokningsknapp text', type: 'text' },
                ]
            },
            {
                title: '📦 Adventure-paketet',
                description: 'Det längsta paketet (7 dagar)',
                fields: [
                    { key: 'adventure.name', label: 'Paketnamn', type: 'text' },
                    { key: 'adventure.duration', label: 'Längd', type: 'text', hint: 'T.ex. "7 dagar"' },
                    { key: 'adventure.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'adventure.highlights', label: 'Höjdpunkter (en per rad)', type: 'textarea' },
                ]
            },
            {
                title: '📦 Complete-paketet',
                description: 'Mellanpaketet (5 dagar)',
                fields: [
                    { key: 'complete.name', label: 'Paketnamn', type: 'text' },
                    { key: 'complete.duration', label: 'Längd', type: 'text', hint: 'T.ex. "5 dagar"' },
                    { key: 'complete.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'complete.highlights', label: 'Höjdpunkter (en per rad)', type: 'textarea' },
                ]
            },
            {
                title: '📦 3-dagarspaketet',
                description: 'Kortare vinterupplevelse',
                fields: [
                    { key: 'threeDay.name', label: 'Paketnamn', type: 'text' },
                    { key: 'threeDay.duration', label: 'Längd', type: 'text', hint: 'T.ex. "3 dagar"' },
                    { key: 'threeDay.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'threeDay.highlights', label: 'Höjdpunkter (en per rad)', type: 'textarea' },
                ]
            },
            {
                title: '📦 Taster-paketet',
                description: 'Endagsupplevelsen',
                fields: [
                    { key: 'taster.name', label: 'Paketnamn', type: 'text' },
                    { key: 'taster.duration', label: 'Längd', type: 'text', hint: 'T.ex. "1 dag"' },
                    { key: 'taster.description', label: 'Beskrivning', type: 'textarea' },
                    { key: 'taster.highlights', label: 'Höjdpunkter (en per rad)', type: 'textarea' },
                ]
            }
        ],
        // ═══════════════════════════════════════════════════════════════════════
        // GALLERY PAGE
        // ═══════════════════════════════════════════════════════════════════════
        'gallery:hero': [
            {
                title: '📝 SEO & Metadata',
                description: 'Sidinformation för sökmotorer',
                fields: [
                    { key: 'gallery.meta.title', label: 'Meta-titel', type: 'text', hint: 'Visas i webbläsarflik' },
                    { key: 'gallery.meta.description', label: 'Meta-beskrivning', type: 'textarea', hint: 'Visas i sökresultat' },
                ]
            },
            {
                title: '🎬 Hero-sektion',
                description: 'Toppbild med rubrik',
                fields: [
                    { key: 'gallery.hero.title', label: 'Rubrik', type: 'text' },
                    { key: 'gallery.hero.subtitle', label: 'Undertext', type: 'textarea' },
                ]
            }
        ],
        'gallery:grid': [
            {
                title: '📑 Sektionsrubriker',
                description: 'Rubriker för gallerisektioner',
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
                description: 'Texter för filtreringsknappar',
                fields: [
                    { key: 'gallery.categories.all', label: 'Alla', type: 'text' },
                    { key: 'gallery.categories.featured', label: 'Utvalda', type: 'text' },
                    { key: 'gallery.categories.snowmobile', label: 'Snöskoter', type: 'text' },
                    { key: 'gallery.categories.dogSledding', label: 'Hundspann', type: 'text' },
                    { key: 'gallery.categories.landscapes', label: 'Landskap', type: 'text' },
                    { key: 'gallery.categories.activities', label: 'Aktiviteter', type: 'text' },
                ]
            },
            {
                title: '🔘 UI-kontroller',
                description: 'Knappar och meddelanden',
                fields: [
                    { key: 'gallery.noImages', label: '"Inga bilder" meddelande', type: 'text' },
                    { key: 'gallery.closeModal', label: 'Stäng-knapp', type: 'text' },
                    { key: 'gallery.prevImage', label: 'Föregående-knapp', type: 'text' },
                    { key: 'gallery.nextImage', label: 'Nästa-knapp', type: 'text' },
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
                title: '🎬 Hero-sektion',
                description: 'Toppinnehåll på FAQ-sidan',
                fields: [
                    { key: 'hero.title1', label: 'Rubrik (del 1)', type: 'text', hint: 'T.ex. "Frequently Asked"' },
                    { key: 'hero.title2', label: 'Rubrik (del 2, färgad)', type: 'text', hint: 'T.ex. "Questions"' },
                    { key: 'hero.subtitle', label: 'Undertext', type: 'textarea' },
                ]
            }
        ],
        'faq:questions': [
            {
                title: '🚗 Resa & Transport',
                description: 'Frågor om hur man tar sig hit',
                fields: [
                    { key: 'faq.item1.question', label: 'Fråga 1', type: 'text' },
                    { key: 'faq.item1.answer', label: 'Svar 1', type: 'textarea' },
                    { key: 'faq.item2.question', label: 'Fråga 2', type: 'text' },
                    { key: 'faq.item2.answer', label: 'Svar 2', type: 'textarea' },
                    { key: 'faq.item3.question', label: 'Fråga 3', type: 'text' },
                    { key: 'faq.item3.answer', label: 'Svar 3', type: 'textarea' },
                ]
            },
            {
                title: '🧥 Kläder & Utrustning',
                description: 'Vad ska man packa och vad ingår',
                fields: [
                    { key: 'faq.item4.question', label: 'Fråga 4', type: 'text' },
                    { key: 'faq.item4.answer', label: 'Svar 4', type: 'textarea' },
                    { key: 'faq.item5.question', label: 'Fråga 5', type: 'text' },
                    { key: 'faq.item5.answer', label: 'Svar 5', type: 'textarea' },
                    { key: 'faq.item6.question', label: 'Fråga 6', type: 'text' },
                    { key: 'faq.item6.answer', label: 'Svar 6', type: 'textarea' },
                ]
            },
            {
                title: '🍽️ Kost & Praktiskt',
                description: 'Mat, försäkring och praktiska frågor',
                fields: [
                    { key: 'faq.item7.question', label: 'Fråga 7', type: 'text' },
                    { key: 'faq.item7.answer', label: 'Svar 7', type: 'textarea' },
                    { key: 'faq.item8.question', label: 'Fråga 8', type: 'text' },
                    { key: 'faq.item8.answer', label: 'Svar 8', type: 'textarea' },
                    { key: 'faq.item9.question', label: 'Fråga 9', type: 'text' },
                    { key: 'faq.item9.answer', label: 'Svar 9', type: 'textarea' },
                    { key: 'faq.item10.question', label: 'Fråga 10', type: 'text' },
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
            title: '📝 Innehållsfält',
            description: `Alla tillgängliga fält för ${section}`,
            fields
        }];
    };

    const fieldGroups = getFieldGroups();
    const totalFields = fieldGroups.reduce((sum, g) => sum + g.fields.length, 0);

    const handleChange = (key: string, value: string) => {
        // Uppdatera lokalt state
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
