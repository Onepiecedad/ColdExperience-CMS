// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MAP - Central definition of CMS navigation structure
// Mirrors the actual page/section hierarchy of coldexperience.se
//
// Page IDs = cms_pages.slug (exact match) — OR a logical group
// Section IDs = cms_content.section_key (exact match)
// dataPageId = the actual page_id slug used in DB queries
//              (needed when a section's DB page differs from the CMS group)
// ═══════════════════════════════════════════════════════════════════════════

export interface Subsection {
    id: string;
    label: string;
    icon: string;
    description: string;
}

export interface Section {
    id: string;
    label: string;
    icon: string;
    description: string;
    dataPageId?: string;   // DB page_id slug if different from parent page
    subsections?: Subsection[];
}

export interface PageConfig {
    id: string;
    label: string;
    icon?: string;          // Page-level icon for the list
    websiteUrl?: string;    // Corresponding URL on coldexperience.se
    group?: 'content' | 'system'; // Visual grouping in PagesScreen
    sections: Section[];
}

// ─── WEBSITE PAGES ─────────────────────────────────────────────────────────
// Sections are listed in scroll-order, matching how they appear on the site.
// dataPageId is set when the DB page_id differs from the parent page id.
// ───────────────────────────────────────────────────────────────────────────

export const WEBSITE_PAGES: PageConfig[] = [
    // ═══════ CONTENT PAGES (visible to editors) ═══════

    {
        id: 'home',
        label: 'Home',
        icon: '🏠',
        websiteUrl: '/',
        group: 'content',
        sections: [
            { id: 'hero', label: 'Hero', icon: '🎬', description: 'Bakgrundsvideo, titel, CTAs, feature-kort', dataPageId: 'hero' },
            { id: 'featuredVideo', label: 'Featured Video', icon: '▶', description: '"Beyond the ordinary" — YouTube video', dataPageId: 'hero' },
            { id: 'features', label: 'Features', icon: '★', description: '4 USP-kort med ikoner', dataPageId: 'features' },
            { id: 'experiences', label: 'Experiences', icon: '❄', description: 'Skoter, Norrsken, Hundspann, Logi', dataPageId: 'experiences' },
            { id: 'testimonials', label: 'Testimonials', icon: '⭐', description: 'Gästrecensioner och betyg', dataPageId: 'testimonials' },
            { id: 'ownerSection', label: 'Meet the Hosts', icon: '👥', description: 'Gustav & Julia presentation', dataPageId: 'about' },
            { id: 'instagram', label: 'Instagram', icon: '📸', description: 'Instagram-flöde' },
            { id: 'corner', label: 'Home Corner', icon: '🏔️', description: 'Snabbinfo om äventyr & boende' },
        ]
    },
    {
        id: 'about',
        label: 'About Us',
        icon: '📖',
        websiteUrl: '/about',
        group: 'content',
        sections: [
            { id: 'about', label: 'About', icon: '📖', description: 'Värderingar, bilder, tidslinje, CTA' },
            { id: 'why', label: 'Why Us', icon: '💎', description: 'Varför välja Cold Experience' },
        ]
    },
    {
        id: 'packages',
        label: 'Packages',
        icon: '📦',
        websiteUrl: '/packages',
        group: 'content',
        sections: [
            { id: 'packages', label: 'All Packages', icon: '📦', description: 'Äventyrspaket med priser' },
        ]
    },
    {
        id: 'gallery',
        label: 'Gallery',
        icon: '🖼',
        websiteUrl: '/gallery',
        group: 'content',
        sections: [
            { id: 'gallery', label: 'Gallery', icon: '🖼', description: 'Fotogalleri och bildtexter' },
        ]
    },
    {
        id: 'contact',
        label: 'Contact & FAQ',
        icon: '✉',
        websiteUrl: '/contact',
        group: 'content',
        sections: [
            { id: 'contact', label: 'Contact', icon: '✉', description: 'Kontaktformulär och info' },
            { id: 'faq', label: 'FAQ', icon: '❓', description: 'Vanliga frågor' },
        ]
    },
    {
        id: 'booking',
        label: 'Booking',
        icon: '📅',
        websiteUrl: '/book',
        group: 'content',
        sections: [
            { id: 'booking', label: 'Booking Form', icon: '📅', description: 'Huvudbokningsformulär' },
            { id: 'book', label: 'Book Section', icon: '📋', description: 'Bokningsbox och CTA' },
            { id: 'form', label: 'Form Fields', icon: '📝', description: 'Formulärfält och validering' },
        ]
    },
    {
        id: 'detailPages',
        label: 'Detail Pages',
        icon: '📄',
        group: 'content',
        sections: [
            { id: 'pages', label: 'Detail Pages', icon: '📄', description: 'Skoter, Husky, Norrsken — undersidor' },
        ]
    },

    // ═══════ SYSTEM PAGES (admin/dev only) ═══════

    {
        id: 'navigation',
        label: 'Navigation & UI',
        icon: '🔝',
        group: 'system',
        sections: [
            { id: 'header', label: 'Header', icon: '🔝', description: 'Navigeringsmeny och logotyp' },
            { id: 'footer', label: 'Footer', icon: '📑', description: 'Footer med länkar och kontakt' },
            { id: 'common', label: 'Common', icon: '🔧', description: 'Gemensamma UI-texter' },
            { id: 'shared', label: 'Shared', icon: '🔄', description: 'Delade sektionstexter' },
        ]
    },
    {
        id: 'legal',
        label: 'Legal & Policies',
        icon: '📜',
        group: 'system',
        sections: [
            { id: 'policies', label: 'Policies', icon: '📜', description: 'Integritetspolicy, villkor, cookies' },
            { id: 'cookieBanner', label: 'Cookie Banner', icon: '🍪', description: 'Cookie-banner texter' },
            { id: 'cookieSettings', label: 'Cookie Settings', icon: '⚙', description: 'Cookie-inställningspanel' },
        ]
    },
];

export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Helper functions
export function getPageById(pageId: string): PageConfig | undefined {
    return WEBSITE_PAGES.find(p => p.id === pageId);
}

export function getSectionById(pageId: string, sectionId: string): Section | undefined {
    const page = getPageById(pageId);
    return page?.sections.find(s => s.id === sectionId);
}

export function getSubsectionById(pageId: string, sectionId: string, subsectionId: string): Subsection | undefined {
    const section = getSectionById(pageId, sectionId);
    return section?.subsections?.find(sub => sub.id === subsectionId);
}

/**
 * Get the actual DB page_id for a section's data queries.
 * Falls back to the parent page id if dataPageId is not set.
 */
export function getDataPageId(pageId: string, sectionId: string): string {
    const section = getSectionById(pageId, sectionId);
    return section?.dataPageId ?? pageId;
}
