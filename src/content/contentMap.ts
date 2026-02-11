// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MAP - Central definition of CMS navigation structure
// Page IDs = cms_pages.slug (exact match)
// Section IDs = cms_content.section_key (exact match)
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

// Page IDs must match cms_pages.slug exactly
// Section IDs must match cms_content.section_key exactly
export const WEBSITE_PAGES: PageConfig[] = [
    {
        id: 'hero',
        label: 'Hero & Video',
        sections: [
            { id: 'hero', label: 'Hero', icon: '🎬', description: 'Background video, title, CTAs, feature cards' },
            { id: 'featuredVideo', label: 'Featured Video', icon: '▶', description: 'YouTube video "Beyond the ordinary"' },
        ]
    },
    {
        id: 'features',
        label: 'Why Choose Us',
        sections: [
            { id: 'features', label: 'Features', icon: '★', description: '4 USP cards with icons' },
        ]
    },
    {
        id: 'experiences',
        label: 'Experiences',
        sections: [
            { id: 'experiences', label: 'All Experiences', icon: '❄', description: 'Snowmobile, Northern Lights, Dog Sledding, Lodging' },
        ]
    },
    {
        id: 'about',
        label: 'About Us',
        sections: [
            { id: 'about', label: 'About', icon: '📖', description: 'Values, meet us, action images, timeline, CTA' },
            { id: 'ownerSection', label: 'Meet the Hosts', icon: '👥', description: 'Gustav & Julia presentation' },
            { id: 'why', label: 'Why Us', icon: '💎', description: 'Why choose Cold Experience' },
        ]
    },
    {
        id: 'testimonials',
        label: 'Testimonials',
        sections: [
            { id: 'testimonials', label: 'Testimonials', icon: '⭐', description: 'Guest reviews and ratings' },
        ]
    },
    {
        id: 'home',
        label: 'Home Extras',
        sections: [
            { id: 'instagram', label: 'Instagram', icon: '📸', description: 'Instagram feed section' },
            { id: 'corner', label: 'Home Corner', icon: '🏔️', description: 'Quick info section' },
        ]
    },
    {
        id: 'packages',
        label: 'Packages',
        sections: [
            { id: 'packages', label: 'All Packages', icon: '📦', description: 'Adventure packages with prices' },
        ]
    },
    {
        id: 'gallery',
        label: 'Gallery',
        sections: [
            { id: 'gallery', label: 'Gallery', icon: '🖼', description: 'Photo gallery and captions' },
        ]
    },
    {
        id: 'contact',
        label: 'Contact',
        sections: [
            { id: 'contact', label: 'Contact', icon: '✉', description: 'Contact form and info' },
            { id: 'faq', label: 'FAQ', icon: '❓', description: 'Frequently asked questions' },
        ]
    },
    {
        id: 'booking',
        label: 'Booking',
        sections: [
            { id: 'booking', label: 'Booking Form', icon: '📅', description: 'Main booking form' },
            { id: 'book', label: 'Book Section', icon: '📋', description: 'Booking box and CTA' },
            { id: 'form', label: 'Form Fields', icon: '📝', description: 'Form fields and validation' },
        ]
    },
    {
        id: 'detailPages',
        label: 'Detail Pages',
        sections: [
            { id: 'pages', label: 'Detail Pages', icon: '📄', description: 'Snowmobile, Husky, Northern Lights pages' },
        ]
    },
    {
        id: 'navigation',
        label: 'Navigation & UI',
        sections: [
            { id: 'header', label: 'Header', icon: '🔝', description: 'Navigation menu and logo' },
            { id: 'footer', label: 'Footer', icon: '📑', description: 'Footer with links and contact' },
            { id: 'common', label: 'Common', icon: '🔧', description: 'Common UI texts' },
            { id: 'shared', label: 'Shared', icon: '🔄', description: 'Shared section texts' },
        ]
    },
    {
        id: 'legal',
        label: 'Legal & Policies',
        sections: [
            { id: 'policies', label: 'Policies', icon: '📜', description: 'Privacy policy, terms, cookies' },
            { id: 'cookieBanner', label: 'Cookie Banner', icon: '🍪', description: 'Cookie banner texts' },
            { id: 'cookieSettings', label: 'Cookie Settings', icon: '⚙', description: 'Cookie settings panel' },
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
