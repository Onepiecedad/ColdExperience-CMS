// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MAP - Central definition of website structure for CMS navigation
// Mirrors coldexperience.se visual scroll order exactly
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
    subsections?: Subsection[];
}

export interface PageConfig {
    id: string;
    label: string;
    sections: Section[];
}

// Website page structure - mirrors coldexperience.se visual scroll order exactly
// Each section represents what you SEE when scrolling down the page
// Sections with 'subsections' are expandable in the sidebar
export const WEBSITE_PAGES: PageConfig[] = [
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
