// ============================================================================
// CONTENT SCHEMA - Whitelist of valid i18n keys and media keys
// ============================================================================
// Ticket 6: Publish per page with schema guardrails
// Only keys defined here may be published. Unknown keys are blocked and logged.
//
// Content keys are mapped from cms_content.field_key values
// Type mappings based on content_type column + heuristics:
//   - content_type: 'array' → skipped (complex types)
//   - key contains 'url', 'youtube', 'video', 'link' → 'url'
//   - key contains 'description', 'paragraph', 'body', 'Desc' → 'textarea'
//   - default → 'text'
// ============================================================================

import type { Language } from '../types';

// Field types for content schema
export type ContentFieldType = 'text' | 'textarea' | 'richtext' | 'url' | 'media';

// Schema definition for a content field
export interface ContentFieldSchema {
    key: string;           // Canonical key (matches cms_content.field_key)
    type: ContentFieldType;
    translatable: boolean; // true for text, false for media/urls
    label: string;         // Human-friendly label
    hint?: string;         // Optional helper text
    thumbnailSrc?: string; // Optional image thumbnail shown next to text field (e.g. gallery captions)
}

// Schema sections matching the page:section format used in contentMap.ts
export type SchemaSection = `${string}:${string}`;

// ============================================================================
// MVP CONTENT SCHEMA - Based on actual cms_content keys
// ============================================================================
// Priority: Header → Hero → Packages → Footer → Featured Video
// Page IDs:
//   - Navigation: 12c0db3f-27d9-4bc8-be6d-1e7ee5301960 (header, footer, common, shared)
//   - Home: 859f1b94-1601-4a55-920b-92a19610834c (hero, featuredVideo)
//   - Packages: 6a5942c7-5aa0-45c0-bdc0-65a39eef7d1c (packages)
// ============================================================================

export const CONTENT_SCHEMA: Record<SchemaSection, ContentFieldSchema[]> = {
    // ─────────────────────────────────────────────────────────────────────────
    // NAVIGATION & UI PAGE (12c0db3f-27d9-4bc8-be6d-1e7ee5301960)
    // ─────────────────────────────────────────────────────────────────────────
    'navigation:header': [
        { key: 'header.bookAdventure', type: 'text', translatable: true, label: 'Book Adventure Button' },
        { key: 'header.chooseLanguage', type: 'text', translatable: true, label: 'Choose Language Label' },
        { key: 'header.languageNames.de', type: 'text', translatable: false, label: 'German Language Name' },
        { key: 'header.languageNames.en', type: 'text', translatable: false, label: 'English Language Name' },
        { key: 'header.languageNames.pl', type: 'text', translatable: false, label: 'Polish Language Name' },
        { key: 'header.languageNames.sv', type: 'text', translatable: false, label: 'Swedish Language Name' },
        { key: 'header.nav.about', type: 'text', translatable: true, label: 'Nav: About' },
        { key: 'header.nav.adventures', type: 'text', translatable: true, label: 'Nav: Adventures' },
        { key: 'header.nav.contact', type: 'text', translatable: true, label: 'Nav: Contact' },
        { key: 'header.nav.faq', type: 'text', translatable: true, label: 'Nav: FAQ' },
        { key: 'header.nav.gallery', type: 'text', translatable: true, label: 'Nav: Gallery' },
        { key: 'header.nav.home', type: 'text', translatable: true, label: 'Nav: Home' },
        { key: 'header.nav.packages', type: 'text', translatable: true, label: 'Nav: Packages' },
    ],

    'navigation:footer': [
        { key: 'footer.companyName', type: 'text', translatable: false, label: 'Company Name' },
        { key: 'footer.companyDescription', type: 'textarea', translatable: true, label: 'Company Description' },
        { key: 'footer.quote', type: 'textarea', translatable: true, label: 'Footer Quote' },
        { key: 'footer.rights', type: 'text', translatable: true, label: 'Rights Text' },
        { key: 'footer.contact.title', type: 'text', translatable: true, label: 'Contact Section Title' },
        { key: 'footer.contact.email', type: 'text', translatable: false, label: 'Contact Email' },
        { key: 'footer.contact.phone', type: 'text', translatable: false, label: 'Contact Phone' },
        { key: 'footer.contact.addressLine1', type: 'text', translatable: false, label: 'Address Line 1' },
        { key: 'footer.contact.addressLine2', type: 'text', translatable: false, label: 'Address Line 2' },
        { key: 'footer.quickLinks.title', type: 'text', translatable: true, label: 'Quick Links Title' },
        { key: 'footer.quickLinks.home', type: 'text', translatable: true, label: 'Quick Links: Home' },
        { key: 'footer.quickLinks.about', type: 'text', translatable: true, label: 'Quick Links: About' },
        { key: 'footer.quickLinks.packages', type: 'text', translatable: true, label: 'Quick Links: Packages' },
        { key: 'footer.quickLinks.gallery', type: 'text', translatable: true, label: 'Quick Links: Gallery' },
        { key: 'footer.quickLinks.contact', type: 'text', translatable: true, label: 'Quick Links: Contact' },
        { key: 'footer.experiences.title', type: 'text', translatable: true, label: 'Experiences Title' },
        { key: 'footer.experiences.dogSledding', type: 'text', translatable: true, label: 'Experience: Dog Sledding' },
        { key: 'footer.experiences.snowmobile', type: 'text', translatable: true, label: 'Experience: Snowmobile' },
        { key: 'footer.experiences.northernLights', type: 'text', translatable: true, label: 'Experience: Northern Lights' },
        { key: 'footer.experiences.iceFishing', type: 'text', translatable: true, label: 'Experience: Ice Fishing' },
        { key: 'footer.experiences.saunaHotTub', type: 'text', translatable: true, label: 'Experience: Sauna & Hot Tub' },
        { key: 'footer.experiences.localCuisine', type: 'text', translatable: true, label: 'Experience: Local Cuisine' },
        { key: 'footer.season.title', type: 'text', translatable: true, label: 'Season Title' },
        { key: 'footer.season.dates', type: 'text', translatable: true, label: 'Season Dates' },
        { key: 'footer.season.cta', type: 'text', translatable: true, label: 'Season CTA' },
        { key: 'footer.cookiePolicy', type: 'text', translatable: true, label: 'Cookie Policy Link' },
        { key: 'footer.cookieSettings', type: 'text', translatable: true, label: 'Cookie Settings Link' },
        { key: 'footer.privacyPolicy', type: 'text', translatable: true, label: 'Privacy Policy Link' },
        { key: 'footer.termsOfService', type: 'text', translatable: true, label: 'Terms of Service Link' },
    ],

    'navigation:common': [
        { key: 'common.cancel', type: 'text', translatable: true, label: 'Cancel Button' },
        { key: 'common.error', type: 'text', translatable: true, label: 'Error Message' },
        { key: 'common.loading', type: 'text', translatable: true, label: 'Loading Text' },
        { key: 'common.save', type: 'text', translatable: true, label: 'Save Button' },
        { key: 'common.success', type: 'text', translatable: true, label: 'Success Message' },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // HERO PAGE (page_slug: hero)
    // ─────────────────────────────────────────────────────────────────────────
    'hero:hero': [
        { key: 'hero.title', type: 'text', translatable: true, label: 'Hero Title' },
        { key: 'hero.subtitle', type: 'textarea', translatable: true, label: 'Hero Subtitle' },
        { key: 'hero.cta', type: 'text', translatable: true, label: 'CTA Button' },
        { key: 'hero.explore', type: 'text', translatable: true, label: 'Explore Button' },
        { key: 'hero.magic', type: 'text', translatable: true, label: 'Magic Text' },
        { key: 'hero.feature1Title', type: 'text', translatable: true, label: 'Feature 1 Title' },
        { key: 'hero.feature1Desc', type: 'textarea', translatable: true, label: 'Feature 1 Description' },
        { key: 'hero.feature2Title', type: 'text', translatable: true, label: 'Feature 2 Title' },
        { key: 'hero.feature2Desc', type: 'textarea', translatable: true, label: 'Feature 2 Description' },
        { key: 'hero.feature3Title', type: 'text', translatable: true, label: 'Feature 3 Title' },
        { key: 'hero.feature3Desc', type: 'textarea', translatable: true, label: 'Feature 3 Description' },
        // Media
        { key: 'hero.backgroundVideoUrl', type: 'url', translatable: false, label: 'Hero Background Video' },
        { key: 'hero.posterImageUrl', type: 'url', translatable: false, label: 'Hero Poster Image' },
        { key: 'features.feature1VideoUrl', type: 'url', translatable: false, label: 'Feature 1 Video' },
        { key: 'features.feature2VideoUrl', type: 'url', translatable: false, label: 'Feature 2 Video' },
        { key: 'features.feature3VideoUrl', type: 'url', translatable: false, label: 'Feature 3 Video' },
        { key: 'features.feature4VideoUrl', type: 'url', translatable: false, label: 'Feature 4 Video' },
        { key: 'ownerSection.ownerImageUrl', type: 'url', translatable: false, label: 'Owner Photo' },
    ],

    'hero:featuredVideo': [
        { key: 'featuredVideo.title', type: 'text', translatable: true, label: 'Section Title' },
        { key: 'featuredVideo.description', type: 'textarea', translatable: true, label: 'Section Description' },
        { key: 'featuredVideo.youtubeUrl', type: 'url', translatable: false, label: 'YouTube URL' },
        { key: 'featuredVideo.posterUrl', type: 'url', translatable: false, label: 'YouTube Poster Image' },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // PACKAGES PAGE (6a5942c7-5aa0-45c0-bdc0-65a39eef7d1c)
    // Sections: packages (hero) | packagesIntro | package7day–1day (PackageEditor)
    //           | packagesCta
    // ─────────────────────────────────────────────────────────────────────────

    // Hero — title, subtitle, and CTA buttons visible in the hero video section
    // Keys MUST match pages.laplandHoliday.hero.* (what LaplandHolidayPackages.js reads)
    'packages:packages': [
        { key: 'pages.laplandHoliday.hero.title', type: 'text', translatable: true, label: 'Hero Title' },
        { key: 'pages.laplandHoliday.hero.subtitle', type: 'textarea', translatable: true, label: 'Hero Subtitle' },
        { key: 'pages.laplandHoliday.hero.primaryCta', type: 'text', translatable: true, label: 'Hero Primary Button' },
        { key: 'pages.laplandHoliday.hero.secondaryCta', type: 'text', translatable: true, label: 'Hero Secondary Button' },
        { key: 'pages.laplandHoliday.hero.media.videoSrc', type: 'text', translatable: false, label: 'Hero Background Video' },
        { key: 'pages.laplandHoliday.hero.media.poster', type: 'text', translatable: false, label: 'Hero Poster Image' },
    ],

    // Intro — two paragraphs + four activity feature cards
    // Keys MUST match pages.laplandHoliday.intro.* (what LaplandHolidayPackages.js reads)
    'packages:packagesIntro': [
        { key: 'pages.laplandHoliday.intro.paragraphs.0', type: 'textarea', translatable: true, label: 'Intro Paragraph 1' },
        { key: 'pages.laplandHoliday.intro.paragraphs.1', type: 'textarea', translatable: true, label: 'Intro Paragraph 2' },
        { key: 'pages.laplandHoliday.intro.features.0.title', type: 'text', translatable: true, label: 'Feature 1: Title' },
        { key: 'pages.laplandHoliday.intro.features.0.description', type: 'text', translatable: true, label: 'Feature 1: Description' },
        { key: 'pages.laplandHoliday.intro.features.1.title', type: 'text', translatable: true, label: 'Feature 2: Title' },
        { key: 'pages.laplandHoliday.intro.features.1.description', type: 'text', translatable: true, label: 'Feature 2: Description' },
        { key: 'pages.laplandHoliday.intro.features.2.title', type: 'text', translatable: true, label: 'Feature 3: Title' },
        { key: 'pages.laplandHoliday.intro.features.2.description', type: 'text', translatable: true, label: 'Feature 3: Description' },
        { key: 'pages.laplandHoliday.intro.features.3.title', type: 'text', translatable: true, label: 'Feature 4: Title' },
        { key: 'pages.laplandHoliday.intro.features.3.description', type: 'text', translatable: true, label: 'Feature 4: Description' },
        { key: 'pages.laplandHoliday.intro.media.videoSrc', type: 'text', translatable: false, label: 'Intro Video' },
        { key: 'pages.laplandHoliday.intro.media.poster', type: 'text', translatable: false, label: 'Intro Poster Image' },
    ],

    // ── 7-Day Package (featured) ──────────────────────────────────────────
    'packages:package7day': [
        { key: 'pages.laplandHoliday.featured.title', type: 'text', translatable: true, label: 'Section Title' },
        { key: 'pages.laplandHoliday.featured.subtitle', type: 'text', translatable: true, label: 'Section Subtitle' },
        { key: 'pages.laplandHoliday.featured.badge', type: 'text', translatable: true, label: 'Badge Text' },
        { key: 'pages.laplandHoliday.featured.package.name', type: 'text', translatable: true, label: 'Package Name' },
        { key: 'pages.laplandHoliday.featured.package.duration', type: 'text', translatable: true, label: 'Duration' },
        { key: 'pages.laplandHoliday.featured.package.price', type: 'text', translatable: true, label: 'Price' },
        { key: 'pages.laplandHoliday.featured.package.perPerson', type: 'text', translatable: true, label: 'Per Person Label' },
        { key: 'pages.laplandHoliday.featured.package.description', type: 'textarea', translatable: true, label: 'Description' },
        { key: 'pages.laplandHoliday.featured.package.primaryCta', type: 'text', translatable: true, label: 'Primary Button' },
        { key: 'pages.laplandHoliday.featured.package.secondaryCta', type: 'text', translatable: true, label: 'Secondary Button' },
        { key: 'pages.laplandHoliday.featured.package.includesTitle', type: 'text', translatable: true, label: 'Includes Title' },
        { key: 'pages.laplandHoliday.featured.package.includes.0', type: 'text', translatable: true, label: 'Includes 1' },
        { key: 'pages.laplandHoliday.featured.package.includes.1', type: 'text', translatable: true, label: 'Includes 2' },
        { key: 'pages.laplandHoliday.featured.package.includes.2', type: 'text', translatable: true, label: 'Includes 3' },
        { key: 'pages.laplandHoliday.featured.package.includes.3', type: 'text', translatable: true, label: 'Includes 4' },
        { key: 'pages.laplandHoliday.featured.package.includes.4', type: 'text', translatable: true, label: 'Includes 5' },
        { key: 'pages.laplandHoliday.featured.package.includes.5', type: 'text', translatable: true, label: 'Includes 6' },
        { key: 'pages.laplandHoliday.featured.package.includes.6', type: 'text', translatable: true, label: 'Includes 7' },
        { key: 'pages.laplandHoliday.featured.package.includes.7', type: 'text', translatable: true, label: 'Includes 8' },
        { key: 'pages.laplandHoliday.featured.package.includes.8', type: 'text', translatable: true, label: 'Includes 9' },
        { key: 'pages.laplandHoliday.featured.package.includes.9', type: 'text', translatable: true, label: 'Includes 10' },
        { key: 'pages.laplandHoliday.featured.galleryCaptions.0', type: 'text', translatable: true, label: 'Gallery Caption 1' },
        { key: 'pages.laplandHoliday.featured.galleryCaptions.1', type: 'text', translatable: true, label: 'Gallery Caption 2' },
        { key: 'pages.laplandHoliday.featured.galleryCaptions.2', type: 'text', translatable: true, label: 'Gallery Caption 3' },
        { key: 'pages.laplandHoliday.featured.media.galleryVideo0', type: 'text', translatable: false, label: 'Gallery Video 1' },
        { key: 'pages.laplandHoliday.featured.media.galleryVideo1', type: 'text', translatable: false, label: 'Gallery Video 2' },
        { key: 'pages.laplandHoliday.featured.media.galleryVideo2', type: 'text', translatable: false, label: 'Gallery Video 3' },
    ],

    // ── 5-Day Package ────────────────────────────────────────────────────
    'packages:package5day': [
        { key: 'pages.laplandHoliday.fiveDay.title', type: 'text', translatable: true, label: 'Section Title' },
        { key: 'pages.laplandHoliday.fiveDay.subtitle', type: 'text', translatable: true, label: 'Section Subtitle' },
        { key: 'pages.laplandHoliday.fiveDay.package.name', type: 'text', translatable: true, label: 'Package Name' },
        { key: 'pages.laplandHoliday.fiveDay.package.duration', type: 'text', translatable: true, label: 'Duration' },
        { key: 'pages.laplandHoliday.fiveDay.package.price', type: 'text', translatable: true, label: 'Price' },
        { key: 'pages.laplandHoliday.fiveDay.package.perPerson', type: 'text', translatable: true, label: 'Per Person Label' },
        { key: 'pages.laplandHoliday.fiveDay.package.description', type: 'textarea', translatable: true, label: 'Description' },
        { key: 'pages.laplandHoliday.fiveDay.package.primaryCta', type: 'text', translatable: true, label: 'Primary Button' },
        { key: 'pages.laplandHoliday.fiveDay.package.secondaryCta', type: 'text', translatable: true, label: 'Secondary Button' },
        { key: 'pages.laplandHoliday.fiveDay.package.includesTitle', type: 'text', translatable: true, label: 'Includes Title' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.0', type: 'text', translatable: true, label: 'Includes 1' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.1', type: 'text', translatable: true, label: 'Includes 2' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.2', type: 'text', translatable: true, label: 'Includes 3' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.3', type: 'text', translatable: true, label: 'Includes 4' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.4', type: 'text', translatable: true, label: 'Includes 5' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.5', type: 'text', translatable: true, label: 'Includes 6' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.6', type: 'text', translatable: true, label: 'Includes 7' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.7', type: 'text', translatable: true, label: 'Includes 8' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes.8', type: 'text', translatable: true, label: 'Includes 9' },
    ],

    // ── 3-Day Package ────────────────────────────────────────────────────
    'packages:package3day': [
        { key: 'pages.laplandHoliday.threeDay.title', type: 'text', translatable: true, label: 'Section Title' },
        { key: 'pages.laplandHoliday.threeDay.subtitle', type: 'text', translatable: true, label: 'Section Subtitle' },
        { key: 'pages.laplandHoliday.threeDay.package.name', type: 'text', translatable: true, label: 'Package Name' },
        { key: 'pages.laplandHoliday.threeDay.package.duration', type: 'text', translatable: true, label: 'Duration' },
        { key: 'pages.laplandHoliday.threeDay.package.price', type: 'text', translatable: true, label: 'Price' },
        { key: 'pages.laplandHoliday.threeDay.package.perPerson', type: 'text', translatable: true, label: 'Per Person Label' },
        { key: 'pages.laplandHoliday.threeDay.package.description', type: 'textarea', translatable: true, label: 'Description' },
        { key: 'pages.laplandHoliday.threeDay.package.primaryCta', type: 'text', translatable: true, label: 'Primary Button' },
        { key: 'pages.laplandHoliday.threeDay.package.secondaryCta', type: 'text', translatable: true, label: 'Secondary Button' },
        { key: 'pages.laplandHoliday.threeDay.package.includesTitle', type: 'text', translatable: true, label: 'Includes Title' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.0', type: 'text', translatable: true, label: 'Includes 1' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.1', type: 'text', translatable: true, label: 'Includes 2' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.2', type: 'text', translatable: true, label: 'Includes 3' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.3', type: 'text', translatable: true, label: 'Includes 4' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.4', type: 'text', translatable: true, label: 'Includes 5' },
        { key: 'pages.laplandHoliday.threeDay.package.includes.5', type: 'text', translatable: true, label: 'Includes 6' },
        { key: 'pages.laplandHoliday.threeDay.package.itineraryTitle', type: 'text', translatable: true, label: 'Itinerary Title' },
        { key: 'pages.laplandHoliday.threeDay.package.itinerary.0', type: 'text', translatable: true, label: 'Day 1' },
        { key: 'pages.laplandHoliday.threeDay.package.itinerary.1', type: 'text', translatable: true, label: 'Day 2' },
        { key: 'pages.laplandHoliday.threeDay.package.itinerary.2', type: 'text', translatable: true, label: 'Day 3' },
        { key: 'pages.laplandHoliday.threeDay.package.addOnsTitle', type: 'text', translatable: true, label: 'Add-ons Title' },
        { key: 'pages.laplandHoliday.threeDay.package.addOns.0', type: 'text', translatable: true, label: 'Add-on 1' },
        { key: 'pages.laplandHoliday.threeDay.package.addOns.1', type: 'text', translatable: true, label: 'Add-on 2' },
        { key: 'pages.laplandHoliday.threeDay.package.addOns.2', type: 'text', translatable: true, label: 'Add-on 3' },
        { key: 'pages.laplandHoliday.threeDay.package.cancellationPolicy', type: 'text', translatable: true, label: 'Cancellation Policy' },
    ],

    // ── 1-Day Package ────────────────────────────────────────────────────
    'packages:package1day': [
        { key: 'pages.laplandHoliday.oneDay.title', type: 'text', translatable: true, label: 'Section Title' },
        { key: 'pages.laplandHoliday.oneDay.subtitle', type: 'text', translatable: true, label: 'Section Subtitle' },
        { key: 'pages.laplandHoliday.oneDay.package.name', type: 'text', translatable: true, label: 'Package Name' },
        { key: 'pages.laplandHoliday.oneDay.package.duration', type: 'text', translatable: true, label: 'Duration' },
        { key: 'pages.laplandHoliday.oneDay.package.price', type: 'text', translatable: true, label: 'Price' },
        { key: 'pages.laplandHoliday.oneDay.package.perPerson', type: 'text', translatable: true, label: 'Per Person Label' },
        { key: 'pages.laplandHoliday.oneDay.package.description', type: 'textarea', translatable: true, label: 'Description' },
        { key: 'pages.laplandHoliday.oneDay.package.primaryCta', type: 'text', translatable: true, label: 'Primary Button' },
        { key: 'pages.laplandHoliday.oneDay.package.secondaryCta', type: 'text', translatable: true, label: 'Secondary Button' },
        { key: 'pages.laplandHoliday.oneDay.package.includesTitle', type: 'text', translatable: true, label: 'Includes Title' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.0', type: 'text', translatable: true, label: 'Includes 1' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.1', type: 'text', translatable: true, label: 'Includes 2' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.2', type: 'text', translatable: true, label: 'Includes 3' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.3', type: 'text', translatable: true, label: 'Includes 4' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.4', type: 'text', translatable: true, label: 'Includes 5' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.5', type: 'text', translatable: true, label: 'Includes 6' },
        { key: 'pages.laplandHoliday.oneDay.package.includes.6', type: 'text', translatable: true, label: 'Includes 7' },
    ],

    // CTA — bottom call-to-action section
    'packages:packagesCta': [
        { key: 'pages.laplandHoliday.cta.title', type: 'text', translatable: true, label: 'CTA Title' },
        { key: 'pages.laplandHoliday.cta.subtitle', type: 'textarea', translatable: true, label: 'CTA Subtitle' },
        { key: 'pages.laplandHoliday.cta.primaryCta', type: 'text', translatable: true, label: 'CTA Primary Button' },
        { key: 'pages.laplandHoliday.cta.secondaryCta', type: 'text', translatable: true, label: 'CTA Secondary Button' },
        { key: 'pages.laplandHoliday.cta.outlineCta', type: 'text', translatable: true, label: 'CTA Outline Button' },
        // Media
        { key: 'packages.hero.videoSrc', type: 'url', translatable: false, label: 'Hero Video' },
        { key: 'packages.hero.poster', type: 'url', translatable: false, label: 'Hero Poster' },
        { key: 'packages.cta.backgroundImage', type: 'url', translatable: false, label: 'CTA Background Image' },
    ],

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-GENERATED SCHEMA ENTRIES
    // Last updated: 2026-02-03
    // DO NOT EDIT MANUALLY - Use "Add Next Batch" in Schema Coverage

    // ═══════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-GENERATED SCHEMA ENTRIES
    // Last updated: 2026-02-03
    // DO NOT EDIT MANUALLY - Use "Add Next Batch" in Schema Coverage
    // ═══════════════════════════════════════════════════════════════════════════

    'about:aboutHero': [
        { key: 'about.hero.video', type: 'url', translatable: false, label: 'About Hero: Background Video' },
        { key: 'about.hero.poster', type: 'url', translatable: false, label: 'About Hero: Video Poster' },
        { key: 'about.title', type: 'text', translatable: true, label: 'About: Title' },
        { key: 'about.intro', type: 'textarea', translatable: true, label: 'About: Intro' },
        { key: 'about.about.gallery', type: 'text', translatable: true, label: 'About: Gallery' },
        { key: 'about.meta.title', type: 'text', translatable: true, label: 'About: Meta Title' },
        { key: 'about.meta.description', type: 'textarea', translatable: true, label: 'About: Meta Description' },
    ],

    'about:values': [
        { key: 'about.valuesTitle', type: 'text', translatable: true, label: 'About: Values Title' },
        { key: 'about.values.authentic.title', type: 'text', translatable: true, label: 'About Values: Authentic Title' },
        { key: 'about.values.authentic.description', type: 'textarea', translatable: true, label: 'About Values: Authentic Description' },
        { key: 'about.values.authentic.image', type: 'url', translatable: false, label: 'About Values: Authentic Background Image' },
        { key: 'about.values.family.title', type: 'text', translatable: true, label: 'About Values: Family Title' },
        { key: 'about.values.family.description', type: 'textarea', translatable: true, label: 'About Values: Family Description' },
        { key: 'about.values.family.image', type: 'url', translatable: false, label: 'About Values: Family Background Image' },
        { key: 'about.values.groups.title', type: 'text', translatable: true, label: 'About Values: Groups Title' },
        { key: 'about.values.groups.description', type: 'textarea', translatable: true, label: 'About Values: Groups Description' },
        { key: 'about.values.groups.image', type: 'url', translatable: false, label: 'About Values: Groups Background Image' },
        { key: 'about.values.memories.title', type: 'text', translatable: true, label: 'About Values: Memories Title' },
        { key: 'about.values.memories.description', type: 'textarea', translatable: true, label: 'About Values: Memories Description' },
        { key: 'about.values.memories.image', type: 'url', translatable: false, label: 'About Values: Memories Background Image' },
    ],

    'about:meetUs': [
        { key: 'about.meetUs.title', type: 'text', translatable: true, label: 'About Meet Us: Title' },
        { key: 'about.meetUs.description', type: 'textarea', translatable: true, label: 'About Meet Us: Description' },
        { key: 'about.meetUs.experience', type: 'text', translatable: true, label: 'About Meet Us: Experience' },
        { key: 'about.meetUs.guides', type: 'text', translatable: true, label: 'About Meet Us: Guides' },
        { key: 'about.meetUs.guidesDesc', type: 'textarea', translatable: true, label: 'About Meet Us: Guides Description' },
        { key: 'about.meetUs.family', type: 'text', translatable: true, label: 'About Meet Us: Family' },
        { key: 'about.meetUs.familyDesc', type: 'textarea', translatable: true, label: 'About Meet Us: Family Description' },
        { key: 'about.actionImages.snowmobile', type: 'url', translatable: false, label: 'Action Image: Snowmobile' },
        { key: 'about.actionImages.lodge', type: 'url', translatable: false, label: 'Action Image: Lodge' },
        { key: 'about.actionImages.landscape', type: 'url', translatable: false, label: 'Action Image: Landscape' },
        { key: 'ownerSection.ownerImageUrl', type: 'url', translatable: false, label: 'Owner Photo URL' },
    ],

    'about:journey': [
        { key: 'about.journeyTitle', type: 'text', translatable: true, label: 'About: Journey Title' },
        { key: 'about.timeline.childhood.title', type: 'text', translatable: true, label: 'About Timeline: Childhood Title' },
        { key: 'about.timeline.childhood.description', type: 'textarea', translatable: true, label: 'About Timeline: Childhood Description' },
        { key: 'about.timeline.childhood.image', type: 'url', translatable: false, label: 'About Timeline: Childhood Image' },
        { key: 'about.timeline.culinary.title', type: 'text', translatable: true, label: 'About Timeline: Culinary Title' },
        { key: 'about.timeline.culinary.description', type: 'textarea', translatable: true, label: 'About Timeline: Culinary Description' },
        { key: 'about.timeline.culinary.image', type: 'url', translatable: false, label: 'About Timeline: Culinary Image' },
        { key: 'about.timeline.love.title', type: 'text', translatable: true, label: 'About Timeline: Love Title' },
        { key: 'about.timeline.love.description', type: 'textarea', translatable: true, label: 'About Timeline: Love Description' },
        { key: 'about.timeline.love.image', type: 'url', translatable: false, label: 'About Timeline: Love Image' },
        { key: 'about.timeline.family.title', type: 'text', translatable: true, label: 'About Timeline: Family Title' },
        { key: 'about.timeline.family.description', type: 'textarea', translatable: true, label: 'About Timeline: Family Description' },
        { key: 'about.timeline.family.image', type: 'url', translatable: false, label: 'About Timeline: Family Image' },
        { key: 'about.timeline.coldExperience.title', type: 'text', translatable: true, label: 'About Timeline: Cold Experience Title' },
        { key: 'about.timeline.coldExperience.description', type: 'textarea', translatable: true, label: 'About Timeline: Cold Experience Description' },
        { key: 'about.timeline.coldExperience.image', type: 'url', translatable: false, label: 'About Timeline: Cold Experience Image' },
    ],

    'about:cta': [
        { key: 'about.cta.backgroundImage', type: 'url', translatable: false, label: 'About CTA: Background Image' },
        { key: 'about.cta.title', type: 'text', translatable: true, label: 'About CTA: Title' },
        { key: 'about.cta.description', type: 'textarea', translatable: true, label: 'About CTA: Description' },
        { key: 'about.cta.packages', type: 'text', translatable: true, label: 'About CTA: Packages' },
        { key: 'about.cta.gallery', type: 'text', translatable: true, label: 'About CTA: Gallery' },
        { key: 'about.cta.contact', type: 'text', translatable: true, label: 'About CTA: Contact' },
    ],
    // ─────────────────────────────────────────────────────────────────────────
    // BOOKING PAGE — split from former monolithic book:hero catch-all
    // ─────────────────────────────────────────────────────────────────────────

    // Book page hero section — titles, CTAs, feature cards
    // ── Booking: Hero ─────────────────────────────────────────────────────
    'booking:bookingHero': [
        { key: 'book.hero.title1', type: 'text', translatable: true, label: 'Title (white)' },
        { key: 'book.hero.title2', type: 'text', translatable: true, label: 'Title (accent)' },
        { key: 'book.hero.subtitle', type: 'textarea', translatable: true, label: 'Subtitle' },
        // Media
        { key: 'booking.hero.videoSrc', type: 'url', translatable: false, label: 'Background Video' },
        { key: 'booking.hero.poster', type: 'url', translatable: false, label: 'Poster Image' },
    ],

    // ── Booking: Form ────────────────────────────────────────────────────
    'booking:booking': [
        // Form title
        { key: 'booking.formTitle', type: 'text', translatable: true, label: 'Form Title' },
        // Number of guests
        { key: 'form.numAdultsLabel', type: 'text', translatable: true, label: 'Number of Adults Label' },
        { key: 'form.numAdultsPlaceholder', type: 'text', translatable: true, label: 'Number of Adults Placeholder' },
        { key: 'form.numAdultsHelp', type: 'text', translatable: true, label: 'Number of Adults Help' },
        { key: 'form.numChildrenLabel', type: 'text', translatable: true, label: 'Number of Children Label' },
        { key: 'form.numChildrenPlaceholder', type: 'text', translatable: true, label: 'Number of Children Placeholder' },
        { key: 'form.numChildrenHelp', type: 'text', translatable: true, label: 'Number of Children Help' },
        { key: 'booking.childrenAgesLabel', type: 'text', translatable: true, label: 'Children Ages Label' },
        { key: 'booking.childrenAgesPlaceholder', type: 'text', translatable: true, label: 'Children Ages Placeholder' },
        // Package
        { key: 'form.packageLabel', type: 'text', translatable: true, label: 'Package Label' },
        { key: 'form.packagePlaceholder', type: 'text', translatable: true, label: 'Package Placeholder' },
        { key: 'form.packageHelp', type: 'text', translatable: true, label: 'Package Help' },
        // Date
        { key: 'form.dateLabel', type: 'text', translatable: true, label: 'Date Label' },
        { key: 'form.dateHelp', type: 'text', translatable: true, label: 'Date Help' },
        { key: 'booking.selectedDateText', type: 'text', translatable: true, label: 'Selected Date Text' },
        // Contact fields
        { key: 'form.nameLabel', type: 'text', translatable: true, label: 'Name Label' },
        { key: 'form.namePlaceholder', type: 'text', translatable: true, label: 'Name Placeholder' },
        { key: 'form.emailLabel', type: 'text', translatable: false, label: 'Email Label' },
        { key: 'form.emailPlaceholder', type: 'text', translatable: false, label: 'Email Placeholder' },
        { key: 'form.phoneLabel', type: 'text', translatable: false, label: 'Phone Label' },
        { key: 'form.phonePlaceholder', type: 'text', translatable: false, label: 'Phone Placeholder' },
        { key: 'form.phoneHelp', type: 'text', translatable: false, label: 'Phone Help' },
        // Message
        { key: 'form.messageLabel', type: 'text', translatable: true, label: 'Message Label' },
        { key: 'form.messagePlaceholder', type: 'text', translatable: true, label: 'Message Placeholder' },
        { key: 'form.messageHelp', type: 'text', translatable: true, label: 'Message Help' },
        // Consent & Submit
        { key: 'booking.consentLabel', type: 'text', translatable: true, label: 'Consent Label' },
        { key: 'booking.submitButton', type: 'text', translatable: true, label: 'Submit Button' },
        { key: 'booking.submitButtonLoading', type: 'text', translatable: true, label: 'Submit Button (Loading)' },
        // Contact info sidebar
        { key: 'booking.summaryTitle', type: 'text', translatable: true, label: 'Summary Title' },
    ],

    // ── Contact: Hero ──────────────────────────────────────────────────────
    'contact:contactHero': [
        { key: 'contact.hero.title1', type: 'text', translatable: true, label: 'Title (white)' },
        { key: 'contact.hero.title2', type: 'text', translatable: true, label: 'Title (accent)' },
        { key: 'contact.hero.subtitle', type: 'textarea', translatable: true, label: 'Subtitle' },
        // Media
        { key: 'contact.hero.videoSrc', type: 'url', translatable: false, label: 'Background Video' },
        { key: 'contact.hero.poster', type: 'url', translatable: false, label: 'Poster Image' },
    ],

    // ── Contact: Form & Info ─────────────────────────────────────────────
    'contact:contact': [
        // Form
        { key: 'contact.form.title', type: 'text', translatable: true, label: 'Form: Title' },
        { key: 'contact.form.subtitle', type: 'textarea', translatable: true, label: 'Form: Subtitle' },
        { key: 'contact.form.nameLabel', type: 'text', translatable: true, label: 'Form: Name Label' },
        { key: 'contact.form.namePlaceholder', type: 'text', translatable: true, label: 'Form: Name Placeholder' },
        { key: 'contact.form.emailLabel', type: 'text', translatable: true, label: 'Form: Email Label' },
        { key: 'contact.form.emailPlaceholder', type: 'text', translatable: true, label: 'Form: Email Placeholder' },
        { key: 'contact.form.phoneLabel', type: 'text', translatable: true, label: 'Form: Phone Label' },
        { key: 'contact.form.phonePlaceholder', type: 'text', translatable: true, label: 'Form: Phone Placeholder' },
        { key: 'contact.form.subjectLabel', type: 'text', translatable: true, label: 'Form: Subject Label' },
        { key: 'contact.form.subjectOptions.select', type: 'text', translatable: true, label: 'Form: Subject — Select' },
        { key: 'contact.form.subjectOptions.booking', type: 'text', translatable: true, label: 'Form: Subject — Booking' },
        { key: 'contact.form.subjectOptions.sevenDay', type: 'text', translatable: true, label: 'Form: Subject — 7 Day' },
        { key: 'contact.form.subjectOptions.fiveDay', type: 'text', translatable: true, label: 'Form: Subject — 5 Day' },
        { key: 'contact.form.subjectOptions.oneDay', type: 'text', translatable: true, label: 'Form: Subject — 1 Day' },
        { key: 'contact.form.subjectOptions.custom', type: 'text', translatable: true, label: 'Form: Subject — Custom' },
        { key: 'contact.form.subjectOptions.general', type: 'text', translatable: true, label: 'Form: Subject — General' },
        { key: 'contact.form.messageLabel', type: 'text', translatable: true, label: 'Form: Message Label' },
        { key: 'contact.form.messagePlaceholder', type: 'textarea', translatable: true, label: 'Form: Message Placeholder' },
        { key: 'contact.form.contactByPhone', type: 'text', translatable: true, label: 'Form: Contact by Phone' },
        { key: 'contact.form.sendButton', type: 'text', translatable: true, label: 'Form: Send Button' },
        // Contact info
        { key: 'contact.findusTitle', type: 'text', translatable: true, label: 'Info: Find Us Title' },
        { key: 'contact.openMaps', type: 'text', translatable: true, label: 'Info: Open Maps' },
        { key: 'contact.info.location.title', type: 'text', translatable: true, label: 'Info: Location Title' },
        { key: 'contact.info.location.line1', type: 'text', translatable: true, label: 'Info: Location Line 1' },
        { key: 'contact.info.location.line2', type: 'text', translatable: true, label: 'Info: Location Line 2' },
        { key: 'contact.info.phone.title', type: 'text', translatable: true, label: 'Info: Phone Title' },
        { key: 'contact.info.phone.number', type: 'text', translatable: false, label: 'Info: Phone Number' },
        { key: 'contact.info.phone.note', type: 'text', translatable: true, label: 'Info: Phone Note' },
        { key: 'contact.info.email.title', type: 'text', translatable: true, label: 'Info: Email Title' },
        { key: 'contact.info.email.address', type: 'text', translatable: false, label: 'Info: Email Address' },
        { key: 'contact.info.email.note', type: 'text', translatable: true, label: 'Info: Email Note' },
        { key: 'contact.info.season.title', type: 'text', translatable: true, label: 'Info: Season Title' },
        { key: 'contact.info.season.dates', type: 'text', translatable: true, label: 'Info: Season Dates' },
        { key: 'contact.info.season.cta', type: 'text', translatable: true, label: 'Info: Season CTA' },
        // Social
        { key: 'contact.social.title', type: 'text', translatable: true, label: 'Social: Title' },
        { key: 'contact.social.subtitle', type: 'text', translatable: true, label: 'Social: Subtitle' },
        // FAQ links
        { key: 'contact.faqs', type: 'text', translatable: true, label: 'FAQ Link' },
        { key: 'contact.faqEmailPrompt', type: 'text', translatable: true, label: 'FAQ Email Prompt' },
        { key: 'contact.faqEmailButton', type: 'text', translatable: true, label: 'FAQ Email Button' },
        // CTA
        { key: 'contact.ctaTitle', type: 'text', translatable: true, label: 'CTA Title' },
        { key: 'contact.ctaSubtitle', type: 'textarea', translatable: true, label: 'CTA Subtitle' },
        { key: 'contact.callNow', type: 'text', translatable: true, label: 'CTA: Call Button' },
        { key: 'contact.sendEmail', type: 'text', translatable: true, label: 'CTA: Email Button' },
    ],

    // ── FAQ: Hero ─────────────────────────────────────────────────────────
    'contact:faqHero': [
        { key: 'faq.hero.title1', type: 'text', translatable: true, label: 'Title (white)' },
        { key: 'faq.hero.title2', type: 'text', translatable: true, label: 'Title (accent)' },
        { key: 'faq.hero.subtitle', type: 'textarea', translatable: true, label: 'Subtitle' },
        // Media
        { key: 'faq.hero.videoSrc', type: 'url', translatable: false, label: 'Background Video' },
        { key: 'faq.hero.poster', type: 'url', translatable: false, label: 'Poster Image' },
    ],

    // ── FAQ: Questions & CTA ─────────────────────────────────────────────
    'contact:faq': [
        // Section title ("Common Questions")
        { key: 'contact.faqTitle1', type: 'text', translatable: true, label: 'Section Title (white)' },
        { key: 'contact.faqTitle2', type: 'text', translatable: true, label: 'Section Title (accent)' },
        { key: 'contact.faqSubtitle', type: 'textarea', translatable: true, label: 'Section Subtitle' },
        // Questions 1–10
        { key: 'faq.faq.item1.question', type: 'text', translatable: true, label: '01 Question' },
        { key: 'faq.faq.item1.answer', type: 'textarea', translatable: true, label: '01 Answer' },
        { key: 'faq.faq.item2.question', type: 'text', translatable: true, label: '02 Question' },
        { key: 'faq.faq.item2.answer', type: 'textarea', translatable: true, label: '02 Answer' },
        { key: 'faq.faq.item3.question', type: 'text', translatable: true, label: '03 Question' },
        { key: 'faq.faq.item3.answer', type: 'textarea', translatable: true, label: '03 Answer' },
        { key: 'faq.faq.item4.question', type: 'text', translatable: true, label: '04 Question' },
        { key: 'faq.faq.item4.answer', type: 'textarea', translatable: true, label: '04 Answer' },
        { key: 'faq.faq.item5.question', type: 'text', translatable: true, label: '05 Question' },
        { key: 'faq.faq.item5.answer', type: 'textarea', translatable: true, label: '05 Answer' },
        { key: 'faq.faq.item6.question', type: 'text', translatable: true, label: '06 Question' },
        { key: 'faq.faq.item6.answer', type: 'textarea', translatable: true, label: '06 Answer' },
        { key: 'faq.faq.item7.question', type: 'text', translatable: true, label: '07 Question' },
        { key: 'faq.faq.item7.answer', type: 'textarea', translatable: true, label: '07 Answer' },
        { key: 'faq.faq.item8.question', type: 'text', translatable: true, label: '08 Question' },
        { key: 'faq.faq.item8.answer', type: 'textarea', translatable: true, label: '08 Answer' },
        { key: 'faq.faq.item9.question', type: 'text', translatable: true, label: '09 Question' },
        { key: 'faq.faq.item9.answer', type: 'textarea', translatable: true, label: '09 Answer' },
        { key: 'faq.faq.item10.question', type: 'text', translatable: true, label: '10 Question' },
        { key: 'faq.faq.item10.answer', type: 'textarea', translatable: true, label: '10 Answer' },
        // CTA ("Ready to book your adventure?")
        { key: 'contact.ctaTitle', type: 'text', translatable: true, label: 'CTA Title' },
        { key: 'contact.ctaSubtitle', type: 'textarea', translatable: true, label: 'CTA Subtitle' },
        { key: 'contact.callNow', type: 'text', translatable: true, label: 'CTA: Call Button' },
        { key: 'contact.sendEmail', type: 'text', translatable: true, label: 'CTA: Email Button' },
        // Media
        { key: 'faq.clothesImage', type: 'url', translatable: false, label: 'Clothes Packing Image' },
    ],

    // ── Gallery: Hero ────────────────────────────────────────────────────
    'gallery:hero': [
        { key: 'gallery.heroTitlePrimary', type: 'text', translatable: true, label: 'Hero Title (white part)' },
        { key: 'gallery.heroTitleAccent', type: 'text', translatable: true, label: 'Hero Title (accent part)' },
        { key: 'gallery.heroSubtitle', type: 'textarea', translatable: true, label: 'Hero Subtitle' },
        { key: 'gallery.heroButton1', type: 'text', translatable: true, label: 'Hero Button 1' },
        { key: 'gallery.heroButton2', type: 'text', translatable: true, label: 'Hero Button 2' },
        { key: 'gallery.hero.videoSrc', type: 'url', translatable: false, label: 'Hero Background Video' },
        { key: 'gallery.hero.poster', type: 'url', translatable: false, label: 'Hero Poster Image' },
    ],

    // ── Gallery: Images (captions — ordered matching website gallery) ────
    'gallery:images': [
        { key: 'gallery.images.winterLandscape', type: 'text', translatable: true, label: 'Northern lights over Lapland', thumbnailSrc: '/images/Nya_bilder/IMG_6698.webp' },
        { key: 'gallery.images.snowmobileAdventure', type: 'text', translatable: true, label: 'Snowmobile guide on frozen lake', thumbnailSrc: '/images/Nya_bilder/IMG_4108.webp' },
        { key: 'gallery.images.dogSledding', type: 'text', translatable: true, label: 'Cabins in winter night', thumbnailSrc: '/images/Nya_bilder/IMG_3493.webp' },
        { key: 'gallery.images.snowmobile1', type: 'text', translatable: true, label: 'Log cabin in winter forest', thumbnailSrc: '/images/Nya_bilder/IMG_0542.webp' },
        { key: 'gallery.images.snowmobile2', type: 'text', translatable: true, label: 'Moonlit pines', thumbnailSrc: '/images/Nya_bilder/IMG_0575.webp' },
        { key: 'gallery.images.snowmobile3', type: 'text', translatable: true, label: 'Aurora above snowmobile base', thumbnailSrc: '/images/Nya_bilder/IMG_4527.webp' },
        { key: 'gallery.images.landscape1', type: 'text', translatable: true, label: 'Lapland winter forest', thumbnailSrc: '/images/Nya_bilder/IMG_0451.webp' },
        { key: 'gallery.images.landscape2', type: 'text', translatable: true, label: 'Snowmobile team ready', thumbnailSrc: '/images/Nya_bilder/IMG_1687.webp' },
        { key: 'gallery.images.landscape3', type: 'text', translatable: true, label: 'Sunset selfie on trail', thumbnailSrc: '/images/Nya_bilder/coldexperience_born.webp' },
        { key: 'gallery.images.landscape4', type: 'text', translatable: true, label: 'Hot tub beneath northern lights', thumbnailSrc: '/images/Nya_bilder/IMG_6181.webp' },
        { key: 'gallery.images.activity1', type: 'text', translatable: true, label: 'Snowmobile at frozen lake', thumbnailSrc: '/images/Nya_bilder/IMG_1547.webp' },
        { key: 'gallery.images.family1', type: 'text', translatable: true, label: 'Trail view from handlebars', thumbnailSrc: '/images/Nya_bilder/IMG_2425.webp' },
        { key: 'gallery.images.memories1', type: 'text', translatable: true, label: 'Sunrise over homestead', thumbnailSrc: '/images/Nya_bilder/IMG_4436.webp' },
        { key: 'gallery.images.authentic1', type: 'text', translatable: true, label: 'Guests celebrating on summit', thumbnailSrc: '/images/Nya_bilder/IMG_7834.webp' },
        { key: 'gallery.images.scenic1', type: 'text', translatable: true, label: 'Outdoor hot tub', thumbnailSrc: '/images/Nya_bilder/IMG_1634.webp' },
        { key: 'gallery.images.scenic2', type: 'text', translatable: true, label: 'Aurora above lakeside cabin', thumbnailSrc: '/images/Nya_bilder/IMG_3700.webp' },
        { key: 'gallery.images.scenic3', type: 'text', translatable: true, label: 'Campfire outside timber hut', thumbnailSrc: '/images/Nya_bilder/IMG_4545.webp' },
        { key: 'gallery.images.scenic4', type: 'text', translatable: true, label: 'Hosts grilling inside kota', thumbnailSrc: '/images/Nya_bilder/IMG_5562.webp' },
        { key: 'gallery.images.winter1', type: 'text', translatable: true, label: 'Winter sunrise over cabin', thumbnailSrc: '/images/Nya_bilder/IMG_3838.webp' },
        { key: 'gallery.images.winter2', type: 'text', translatable: true, label: 'Aurora dancing across polar sky', thumbnailSrc: '/images/Nya_bilder/IMG_3860.webp' },
        { key: 'gallery.images.adventure1', type: 'text', translatable: true, label: 'Family by wilderness shelter', thumbnailSrc: '/images/Nya_bilder/IMG_2963.webp' },
        { key: 'gallery.images.familyGathering', type: 'text', translatable: true, label: 'Family joy on winter trail', thumbnailSrc: '/images/Nya_bilder/family_1.webp' },
        { key: 'gallery.images.familyJoy', type: 'text', translatable: true, label: 'Laughter in Lapland snow', thumbnailSrc: '/images/Nya_bilder/family_2.webp' },
        { key: 'gallery.images.moonlitCabin', type: 'text', translatable: true, label: 'Moonlit cabin in deep winter', thumbnailSrc: '/images/Nya_bilder/IMG_0554 (1).webp' },
        { key: 'gallery.images.fireplaceFeast', type: 'text', translatable: true, label: 'Lapland flavours over open fire', thumbnailSrc: '/images/Nya_bilder/IMG_1579.webp' },
        { key: 'gallery.images.auroraDance', type: 'text', translatable: true, label: 'Aurora dancing across polar sky', thumbnailSrc: '/images/Nya_bilder/IMG_1904.webp' },
        { key: 'gallery.images.firesideShelter', type: 'text', translatable: true, label: 'Firelit cabin in snowy forest', thumbnailSrc: '/images/Nya_bilder/IMG_4082.webp' },
        { key: 'gallery.images.starCamp', type: 'text', translatable: true, label: 'Starlit night at mountain shelter', thumbnailSrc: '/images/Nya_bilder/IMG_4596 (1).webp' },
        { key: 'gallery.images.campfireCooking', type: 'text', translatable: true, label: 'Campfire cooking', thumbnailSrc: '/images/Nya_bilder/julias_matresa.webp' },
        { key: 'gallery.images.auroraPines', type: 'text', translatable: true, label: 'Northern lights above pine forest', thumbnailSrc: '/images/Nya_bilder/IMG_6702.webp' },
        { key: 'gallery.images.firesideLake', type: 'text', translatable: true, label: 'Snowmobile camp by frozen lake', thumbnailSrc: '/images/Nya_bilder/IMG_7476 (1).webp' },
        // ── Image sources (editable media) ──
        { key: 'gallery.image.aurora-lapland', type: 'url', translatable: false, label: 'Image: Northern lights over Lapland', thumbnailSrc: '/images/Nya_bilder/IMG_6698.webp' },
        { key: 'gallery.image.snowmobile-guide', type: 'url', translatable: false, label: 'Image: Snowmobile guide', thumbnailSrc: '/images/Nya_bilder/IMG_4108.webp' },
        { key: 'gallery.image.cabin-night', type: 'url', translatable: false, label: 'Image: Cabins in winter night', thumbnailSrc: '/images/Nya_bilder/IMG_3493.webp' },
        { key: 'gallery.image.forest-cabin', type: 'url', translatable: false, label: 'Image: Log cabin', thumbnailSrc: '/images/Nya_bilder/IMG_0542.webp' },
        { key: 'gallery.image.moonlit-pines', type: 'url', translatable: false, label: 'Image: Moonlit pines', thumbnailSrc: '/images/Nya_bilder/IMG_0575.webp' },
        { key: 'gallery.image.aurora-base', type: 'url', translatable: false, label: 'Image: Aurora snowmobile base', thumbnailSrc: '/images/Nya_bilder/IMG_4527.webp' },
        { key: 'gallery.image.winter-forest', type: 'url', translatable: false, label: 'Image: Lapland winter forest', thumbnailSrc: '/images/Nya_bilder/IMG_0451.webp' },
        { key: 'gallery.image.team-ready', type: 'url', translatable: false, label: 'Image: Snowmobile team', thumbnailSrc: '/images/Nya_bilder/IMG_1687.webp' },
        { key: 'gallery.image.trail-selfie', type: 'url', translatable: false, label: 'Image: Trail selfie', thumbnailSrc: '/images/Nya_bilder/coldexperience_born.webp' },
        { key: 'gallery.image.aurora-tub', type: 'url', translatable: false, label: 'Image: Hot tub', thumbnailSrc: '/images/Nya_bilder/IMG_6181.webp' },
        { key: 'gallery.image.frozen-lake-stop', type: 'url', translatable: false, label: 'Image: Frozen lake', thumbnailSrc: '/images/Nya_bilder/IMG_1547.webp' },
        { key: 'gallery.image.handlebar-view', type: 'url', translatable: false, label: 'Image: Handlebar view', thumbnailSrc: '/images/Nya_bilder/IMG_2425.webp' },
        { key: 'gallery.image.sunrise-homestead', type: 'url', translatable: false, label: 'Image: Sunrise homestead', thumbnailSrc: '/images/Nya_bilder/IMG_4436.webp' },
        { key: 'gallery.image.summit-celebration', type: 'url', translatable: false, label: 'Image: Summit celebration', thumbnailSrc: '/images/Nya_bilder/IMG_7834.webp' },
        { key: 'gallery.image.outdoor-hot-tub', type: 'url', translatable: false, label: 'Image: Outdoor hot tub', thumbnailSrc: '/images/Nya_bilder/IMG_1634.webp' },
        { key: 'gallery.image.lakeside-aurora', type: 'url', translatable: false, label: 'Image: Lakeside aurora', thumbnailSrc: '/images/Nya_bilder/IMG_3700.webp' },
        { key: 'gallery.image.campfire-hut', type: 'url', translatable: false, label: 'Image: Campfire hut', thumbnailSrc: '/images/Nya_bilder/IMG_4545.webp' },
        { key: 'gallery.image.hosts-grilling', type: 'url', translatable: false, label: 'Image: Hosts grilling', thumbnailSrc: '/images/Nya_bilder/IMG_5562.webp' },
        { key: 'gallery.image.winter-cabin-sunrise', type: 'url', translatable: false, label: 'Image: Winter cabin sunrise', thumbnailSrc: '/images/Nya_bilder/IMG_3838.webp' },
        { key: 'gallery.image.evening-campfire', type: 'url', translatable: false, label: 'Image: Evening campfire', thumbnailSrc: '/images/Nya_bilder/IMG_3860.webp' },
        { key: 'gallery.image.family-winter-sun', type: 'url', translatable: false, label: 'Image: Family winter sun', thumbnailSrc: '/images/Nya_bilder/IMG_2963.webp' },
        { key: 'gallery.image.family-trail-moment', type: 'url', translatable: false, label: 'Image: Family trail moment', thumbnailSrc: '/images/Nya_bilder/family_1.webp' },
        { key: 'gallery.image.family-snow-laughter', type: 'url', translatable: false, label: 'Image: Family snow laughter', thumbnailSrc: '/images/Nya_bilder/family_2.webp' },
        { key: 'gallery.image.moonlit-cabin', type: 'url', translatable: false, label: 'Image: Moonlit cabin', thumbnailSrc: '/images/Nya_bilder/IMG_0554 (1).webp' },
        { key: 'gallery.image.fireplace-feast', type: 'url', translatable: false, label: 'Image: Fireplace feast', thumbnailSrc: '/images/Nya_bilder/IMG_1579.webp' },
        { key: 'gallery.image.aurora-dance', type: 'url', translatable: false, label: 'Image: Aurora dance', thumbnailSrc: '/images/Nya_bilder/IMG_1904.webp' },
        { key: 'gallery.image.fireside-shelter', type: 'url', translatable: false, label: 'Image: Fireside shelter', thumbnailSrc: '/images/Nya_bilder/IMG_4082.webp' },
        { key: 'gallery.image.star-camp', type: 'url', translatable: false, label: 'Image: Star camp', thumbnailSrc: '/images/Nya_bilder/IMG_4596 (1).webp' },
        { key: 'gallery.image.campfire-cooking', type: 'url', translatable: false, label: 'Image: Campfire cooking', thumbnailSrc: '/images/Nya_bilder/julias_matresa.webp' },
        { key: 'gallery.image.aurora-pines', type: 'url', translatable: false, label: 'Image: Aurora pines', thumbnailSrc: '/images/Nya_bilder/IMG_6702.webp' },
        { key: 'gallery.image.fireside-lake', type: 'url', translatable: false, label: 'Image: Fireside lake', thumbnailSrc: '/images/Nya_bilder/IMG_7476 (1).webp' },
    ],

    // ── Gallery: Categories & UI ─────────────────────────────────────────
    'gallery:categories': [
        { key: 'gallery.categories.all', type: 'text', translatable: true, label: 'Category: All' },
        { key: 'gallery.categories.featured', type: 'text', translatable: true, label: 'Category: Featured' },
        { key: 'gallery.categories.snowmobile', type: 'text', translatable: true, label: 'Category: Snowmobile' },
        { key: 'gallery.categories.dogSledding', type: 'text', translatable: true, label: 'Category: Dog Sledding' },
        { key: 'gallery.categories.landscapes', type: 'text', translatable: true, label: 'Category: Landscapes' },
        { key: 'gallery.categories.activities', type: 'text', translatable: true, label: 'Category: Activities' },
        { key: 'gallery.closeModal', type: 'text', translatable: true, label: 'Close Modal Label' },
        { key: 'gallery.nextImage', type: 'text', translatable: true, label: 'Next Image Label' },
        { key: 'gallery.prevImage', type: 'text', translatable: true, label: 'Previous Image Label' },
        { key: 'gallery.noImages', type: 'text', translatable: true, label: 'No Images Message' },
        { key: 'gallery.sections.food', type: 'text', translatable: true, label: 'Section: Food' },
        { key: 'gallery.sections.husky', type: 'text', translatable: true, label: 'Section: Husky' },
        { key: 'gallery.sections.nature', type: 'text', translatable: true, label: 'Section: Nature' },
        { key: 'gallery.sections.northernLights', type: 'text', translatable: true, label: 'Section: Northern Lights' },
        { key: 'gallery.sections.winter', type: 'text', translatable: true, label: 'Section: Winter' },
        { key: 'gallery.meta.title', type: 'text', translatable: true, label: 'SEO: Meta Title' },
        { key: 'gallery.meta.description', type: 'textarea', translatable: true, label: 'SEO: Meta Description' },
    ],

    // ── Gallery: CTA ─────────────────────────────────────────────────────
    'gallery:cta': [
        { key: 'gallery.cta.title', type: 'text', translatable: true, label: 'CTA Title' },
        { key: 'gallery.cta.button', type: 'text', translatable: true, label: 'CTA Button' },
    ],

    // home:hero REMOVED — home.hero.* keys are unused duplicates of hero.* in hero:hero
    // Canonical hero keys live in hero:hero (hero.title, hero.subtitle, hero.magic, hero.cta, hero.explore)

    // Home page "Corner" sections — adventure previews (homeCorner.* only, corner.* legacy removed)
    // Legacy corner.* keys suppressed — website only uses homeCorner.* (verified in Home.js)
    'home:homeCorner': [
        { key: 'homeCorner.adventuresTitle', type: 'text', translatable: true, label: 'Home Corner: Adventures Title' },
        { key: 'homeCorner.bookNow', type: 'text', translatable: true, label: 'Home Corner: Book Now' },
        { key: 'homeCorner.contactUs', type: 'text', translatable: true, label: 'Home Corner: Contact Us' },
        { key: 'homeCorner.huskyBody', type: 'text', translatable: true, label: 'Home Corner: Husky Body' },
        { key: 'homeCorner.huskyTitle', type: 'text', translatable: true, label: 'Home Corner: Husky Title' },
        { key: 'homeCorner.learnMore', type: 'text', translatable: true, label: 'Home Corner: Learn More' },
        { key: 'homeCorner.learnMoreHusky', type: 'text', translatable: true, label: 'Home Corner: Learn More Husky' },
        { key: 'homeCorner.learnMoreNorthernLights', type: 'text', translatable: true, label: 'Home Corner: Learn More Northern Lights' },
        { key: 'homeCorner.learnMoreSnowmobile', type: 'text', translatable: true, label: 'Home Corner: Learn More Snowmobile' },
        { key: 'homeCorner.nlightsBody', type: 'text', translatable: true, label: 'Home Corner: Nlights Body' },
        { key: 'homeCorner.nlightsTitle', type: 'text', translatable: true, label: 'Home Corner: Nlights Title' },
        { key: 'homeCorner.planBody', type: 'text', translatable: true, label: 'Home Corner: Plan Body' },
        { key: 'homeCorner.planTitle', type: 'text', translatable: true, label: 'Home Corner: Plan Title' },
        { key: 'homeCorner.snowmobileBody', type: 'text', translatable: true, label: 'Home Corner: Snowmobile Body' },
        { key: 'homeCorner.snowmobileTitle', type: 'text', translatable: true, label: 'Home Corner: Snowmobile Title' },
        { key: 'homeCorner.viewPackages', type: 'text', translatable: true, label: 'Home Corner: View Packages' },
        { key: 'homeCorner.whoBody', type: 'text', translatable: true, label: 'Home Corner: Who Body' },
        { key: 'homeCorner.whoTitle', type: 'text', translatable: true, label: 'Home Corner: Who Title' },
        { key: 'homeCorner.whyHosp', type: 'text', translatable: true, label: 'Home Corner: Why Hosp' },
        { key: 'homeCorner.whyLocal', type: 'text', translatable: true, label: 'Home Corner: Why Local' },
        { key: 'homeCorner.whySmall', type: 'text', translatable: true, label: 'Home Corner: Why Small' },
        { key: 'homeCorner.whyTitle', type: 'text', translatable: true, label: 'Home Corner: Why Title' },
    ],

    // Experience cards — dog sledding, snowmobile, northern lights, lodging
    'home:experiences': [
        // Section header
        { key: 'experiences.title', type: 'text', translatable: true, label: 'Experiences: Full Title', hint: 'e.g. Magical Winter Adventures' },
        { key: 'experiences.intro', type: 'text', translatable: true, label: 'Experiences: Intro' },
        // Snowmobile
        { key: 'experiences.snowmobileTitle', type: 'text', translatable: true, label: 'Experiences: Snowmobile Title' },
        { key: 'experiences.snowmobileDesc', type: 'textarea', translatable: true, label: 'Experiences: Snowmobile Description' },
        { key: 'experiences.snowmobileFeature1', type: 'text', translatable: true, label: 'Experiences: Snowmobile Feature 1' },
        { key: 'experiences.snowmobileFeature2', type: 'text', translatable: true, label: 'Experiences: Snowmobile Feature 2' },
        { key: 'experiences.snowmobileFeature3', type: 'text', translatable: true, label: 'Experiences: Snowmobile Feature 3' },
        { key: 'experiences.snowmobileFeature4', type: 'text', translatable: true, label: 'Experiences: Snowmobile Feature 4' },
        { key: 'experiences.learnMoreSnowmobile', type: 'text', translatable: true, label: 'Experiences: Learn More Snowmobile' },
        // Northern Lights
        { key: 'experiences.northernLightsTitle', type: 'text', translatable: true, label: 'Experiences: Northern Lights Title' },
        { key: 'experiences.northernLightsDesc', type: 'textarea', translatable: true, label: 'Experiences: Northern Lights Description' },
        { key: 'experiences.northernLightsFeature1', type: 'text', translatable: true, label: 'Experiences: Northern Lights Feature 1' },
        { key: 'experiences.northernLightsFeature2', type: 'text', translatable: true, label: 'Experiences: Northern Lights Feature 2' },
        { key: 'experiences.northernLightsFeature3', type: 'text', translatable: true, label: 'Experiences: Northern Lights Feature 3' },
        { key: 'experiences.northernLightsFeature4', type: 'text', translatable: true, label: 'Experiences: Northern Lights Feature 4' },
        { key: 'experiences.learnMoreNorthernLights', type: 'text', translatable: true, label: 'Experiences: Learn More Northern Lights' },
        // Dog Sledding
        { key: 'experiences.dogSleddingTitle', type: 'text', translatable: true, label: 'Experiences: Dog Sledding Title' },
        { key: 'experiences.dogSleddingDesc', type: 'textarea', translatable: true, label: 'Experiences: Dog Sledding Description' },
        { key: 'experiences.dogSleddingFeature1', type: 'text', translatable: true, label: 'Experiences: Dog Sledding Feature 1' },
        { key: 'experiences.dogSleddingFeature2', type: 'text', translatable: true, label: 'Experiences: Dog Sledding Feature 2' },
        { key: 'experiences.dogSleddingFeature3', type: 'text', translatable: true, label: 'Experiences: Dog Sledding Feature 3' },
        { key: 'experiences.dogSleddingFeature4', type: 'text', translatable: true, label: 'Experiences: Dog Sledding Feature 4' },
        { key: 'experiences.learnMoreDogSledding', type: 'text', translatable: true, label: 'Experiences: Learn More Dog Sledding' },
        // Lodging
        { key: 'experiences.lodgingTitle', type: 'text', translatable: true, label: 'Experiences: Lodging Title' },
        { key: 'experiences.lodgingDesc', type: 'textarea', translatable: true, label: 'Experiences: Lodging Description' },
        { key: 'experiences.lodgingFeature1', type: 'text', translatable: true, label: 'Experiences: Lodging Feature 1' },
        { key: 'experiences.lodgingFeature2', type: 'text', translatable: true, label: 'Experiences: Lodging Feature 2' },
        { key: 'experiences.lodgingFeature3', type: 'text', translatable: true, label: 'Experiences: Lodging Feature 3' },
        { key: 'experiences.lodgingFeature4', type: 'text', translatable: true, label: 'Experiences: Lodging Feature 4' },
        { key: 'experiences.lodgingAlt', type: 'text', translatable: true, label: 'Experiences: Lodging Alt' },
        { key: 'experiences.learnMoreLodging', type: 'text', translatable: true, label: 'Experiences: Learn More Lodging' },
        // Shared
        { key: 'experiences.learnMore', type: 'text', translatable: true, label: 'Experiences: Learn More' },
        // CTA
        { key: 'experiences.ctaTitle', type: 'text', translatable: true, label: 'Experiences: CTA Title' },
        { key: 'experiences.ctaDesc', type: 'textarea', translatable: true, label: 'Experiences: CTA Description' },
        { key: 'experiences.ctaBook', type: 'text', translatable: true, label: 'Experiences: CTA Book' },
        // Media
        { key: 'experiences.snowmobile.videoSrc', type: 'url', translatable: false, label: 'Snowmobile Video' },
        { key: 'experiences.snowmobile.poster', type: 'url', translatable: false, label: 'Snowmobile Poster' },
        { key: 'experiences.northernLights.videoSrc', type: 'url', translatable: false, label: 'Northern Lights Video' },
        { key: 'experiences.northernLights.poster', type: 'url', translatable: false, label: 'Northern Lights Poster' },
        { key: 'experiences.dogSledding.videoSrc', type: 'url', translatable: false, label: 'Dog Sledding Video' },
        { key: 'experiences.dogSledding.poster', type: 'url', translatable: false, label: 'Dog Sledding Poster' },
        { key: 'experiences.lodging.videoSrc', type: 'url', translatable: false, label: 'Lodging Video' },
        { key: 'experiences.lodging.poster', type: 'url', translatable: false, label: 'Lodging Poster' },
    ],

    // Meet the Hosts — owner bios, values, lifestyle
    'home:ownerSection': [
        { key: 'ownerSection.authenticExperienceText', type: 'text', translatable: true, label: 'Owner Section: Authentic Experience Text' },
        { key: 'ownerSection.authenticExperienceTitle', type: 'text', translatable: true, label: 'Owner Section: Authentic Experience Title' },
        { key: 'ownerSection.bio', type: 'text', translatable: true, label: 'Owner Section: Bio' },
        { key: 'ownerSection.familyBusinessText', type: 'text', translatable: true, label: 'Owner Section: Family Business Text' },
        { key: 'ownerSection.familyBusinessTitle', type: 'text', translatable: true, label: 'Owner Section: Family Business Title' },
        { key: 'ownerSection.gustavBio', type: 'text', translatable: true, label: 'Owner Section: Gustav Bio' },
        { key: 'ownerSection.gustavTitle', type: 'text', translatable: true, label: 'Owner Section: Gustav Title' },
        { key: 'ownerSection.intro', type: 'text', translatable: true, label: 'Owner Section: Intro' },
        { key: 'ownerSection.juliaBio', type: 'text', translatable: true, label: 'Owner Section: Julia Bio' },
        { key: 'ownerSection.juliaTitle', type: 'text', translatable: true, label: 'Owner Section: Julia Title' },
        { key: 'ownerSection.lifestyleQuote', type: 'text', translatable: true, label: 'Owner Section: Lifestyle Quote' },
        { key: 'ownerSection.lifestyleTitle', type: 'text', translatable: true, label: 'Owner Section: Lifestyle Title' },
        { key: 'ownerSection.localExpertiseText', type: 'text', translatable: true, label: 'Owner Section: Local Expertise Text' },
        { key: 'ownerSection.localExpertiseTitle', type: 'text', translatable: true, label: 'Owner Section: Local Expertise Title' },
        { key: 'ownerSection.names', type: 'text', translatable: true, label: 'Owner Section: Names' },
        { key: 'ownerSection.title1', type: 'text', translatable: true, label: 'Owner Section: Title 1' },
        { key: 'ownerSection.title2', type: 'text', translatable: true, label: 'Owner Section: Title 2' },
        { key: 'ownerSection.whyText', type: 'text', translatable: true, label: 'Owner Section: Why Text' },
        { key: 'ownerSection.whyTitle', type: 'text', translatable: true, label: 'Owner Section: Why Title' },
        { key: 'ownerSection.ownerImageUrl', type: 'url', translatable: false, label: 'Owner Section: Owner Image Url' },
    ],

    // Feature highlight cards with videos
    'home:features': [
        // Section header
        { key: 'features.title', type: 'text', translatable: true, label: 'Features: Title' },
        { key: 'features.intro', type: 'text', translatable: true, label: 'Features: Intro' },
        { key: 'features.outro', type: 'text', translatable: true, label: 'Features: Outro' },
        // Feature cards (title + description pairs)
        { key: 'features.feature1Title', type: 'text', translatable: true, label: 'Features: Feature 1 Title' },
        { key: 'features.feature1Desc', type: 'textarea', translatable: true, label: 'Features: Feature 1 Description' },
        { key: 'features.feature2Title', type: 'text', translatable: true, label: 'Features: Feature 2 Title' },
        { key: 'features.feature2Desc', type: 'textarea', translatable: true, label: 'Features: Feature 2 Description' },
        { key: 'features.feature3Title', type: 'text', translatable: true, label: 'Features: Feature 3 Title' },
        { key: 'features.feature3Desc', type: 'textarea', translatable: true, label: 'Features: Feature 3 Description' },
        { key: 'features.feature4Title', type: 'text', translatable: true, label: 'Features: Feature 4 Title' },
        { key: 'features.feature4Desc', type: 'textarea', translatable: true, label: 'Features: Feature 4 Description' },
        // Media
        { key: 'features.feature1VideoUrl', type: 'url', translatable: false, label: 'Features: Feature 1 Video Url' },
        { key: 'features.feature2VideoUrl', type: 'url', translatable: false, label: 'Features: Feature 2 Video Url' },
        { key: 'features.feature3VideoUrl', type: 'url', translatable: false, label: 'Features: Feature 3 Video Url' },
        { key: 'features.feature4VideoUrl', type: 'url', translatable: false, label: 'Features: Feature 4 Video Url' },
    ],

    // Instagram feed section
    'home:instagram': [
        { key: 'instagram.error', type: 'text', translatable: true, label: 'Instagram: Error' },
        { key: 'instagram.follow', type: 'text', translatable: true, label: 'Instagram: Follow' },
        { key: 'instagram.followButton', type: 'text', translatable: true, label: 'Instagram: Follow Button' },
        { key: 'instagram.loading', type: 'text', translatable: true, label: 'Instagram: Loading' },
        { key: 'instagram.subtitle', type: 'text', translatable: true, label: 'Instagram: Subtitle' },
        { key: 'instagram.title', type: 'text', translatable: true, label: 'Instagram: Title' },
        { key: 'instagram.titleHighlight', type: 'text', translatable: true, label: 'Instagram: Title Highlight' },
        { key: 'instagram.viewMore', type: 'text', translatable: true, label: 'Instagram: View More' },
        { key: 'instagram.viewOnInstagram', type: 'text', translatable: true, label: 'Instagram: View On Instagram' },
    ],

    // Testimonials section
    'home:testimonials': [
        { key: 'testimonials.intro', type: 'text', translatable: true, label: 'Testimonials: Intro' },
        { key: 'testimonials.title', type: 'text', translatable: true, label: 'Testimonials: Title' },
        { key: 'testimonials.titleHighlight', type: 'text', translatable: true, label: 'Testimonials: Title Highlight' },
    ],

    // Why Choose Us section — USP values
    'home:why': [
        { key: 'why.authenticExperienceText', type: 'text', translatable: true, label: 'Why: Authentic Experience Text' },
        { key: 'why.authenticExperienceTitle', type: 'text', translatable: true, label: 'Why: Authentic Experience Title' },
        { key: 'why.familyBusinessText', type: 'text', translatable: true, label: 'Why: Family Business Text' },
        { key: 'why.familyBusinessTitle', type: 'text', translatable: true, label: 'Why: Family Business Title' },
        { key: 'why.localExpertiseText', type: 'text', translatable: true, label: 'Why: Local Expertise Text' },
        { key: 'why.localExpertiseTitle', type: 'text', translatable: true, label: 'Why: Local Expertise Title' },
        { key: 'why.whyText', type: 'text', translatable: true, label: 'Why: Why Text' },
        { key: 'why.whyTitle', type: 'text', translatable: true, label: 'Why: Why Title' },
    ],

    // Detail page: Husky Ride / Dog Sledding
    'home:dogsledding': [
        { key: 'pages.huskyRide.closing.description', type: 'textarea', translatable: true, label: 'Husky Ride: Closing Description' },
        { key: 'pages.huskyRide.closing.primaryButton.label', type: 'text', translatable: true, label: 'Husky Ride: Closing Primary Button' },
        { key: 'pages.huskyRide.closing.ratingText', type: 'text', translatable: true, label: 'Husky Ride: Closing Rating Text' },
        { key: 'pages.huskyRide.closing.secondaryButton.label', type: 'text', translatable: true, label: 'Husky Ride: Closing Secondary Button' },
        { key: 'pages.huskyRide.closing.title', type: 'text', translatable: true, label: 'Husky Ride: Closing Title' },
        { key: 'pages.huskyRide.dayProgram.steps', type: 'text', translatable: true, label: 'Husky Ride: Day Program Steps' },
        { key: 'pages.huskyRide.dayProgram.title', type: 'text', translatable: true, label: 'Husky Ride: Day Program Title' },
        { key: 'pages.huskyRide.features', type: 'text', translatable: true, label: 'Husky Ride: Features' },
        { key: 'pages.huskyRide.hero.description', type: 'textarea', translatable: true, label: 'Husky Ride: Hero Description' },
        { key: 'pages.huskyRide.hero.primaryButton.label', type: 'text', translatable: true, label: 'Husky Ride: Hero Primary Button' },
        { key: 'pages.huskyRide.hero.secondaryButton.label', type: 'text', translatable: true, label: 'Husky Ride: Hero Secondary Button' },
        { key: 'pages.huskyRide.hero.title', type: 'text', translatable: true, label: 'Husky Ride: Hero Title' },
        { key: 'pages.huskyRide.intro.heading', type: 'textarea', translatable: true, label: 'Husky Ride: Intro Heading' },
        { key: 'pages.huskyRide.intro.paragraphs', type: 'textarea', translatable: true, label: 'Husky Ride: Intro Paragraphs' },
        { key: 'pages.huskyRide.media.introPoster', type: 'textarea', translatable: true, label: 'Husky Ride: Media Intro Poster' },
        { key: 'pages.huskyRide.media.introVideo', type: 'text', translatable: true, label: 'Husky Ride: Media Intro Video' },
        { key: 'pages.huskyRide.media.poster', type: 'text', translatable: true, label: 'Husky Ride: Media Poster' },
        { key: 'pages.huskyRide.media.videoSrc', type: 'text', translatable: true, label: 'Husky Ride: Media Video Source' },
        { key: 'pages.huskyRide.meta.description', type: 'textarea', translatable: true, label: 'Husky Ride: SEO Description' },
        { key: 'pages.huskyRide.meta.jsonLd.@context', type: 'textarea', translatable: true, label: 'Husky Ride: SEO JSON-LD @context' },
        { key: 'pages.huskyRide.meta.jsonLd.@type', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD @type' },
        { key: 'pages.huskyRide.meta.jsonLd.description', type: 'textarea', translatable: true, label: 'Husky Ride: SEO JSON-LD Description' },
        { key: 'pages.huskyRide.meta.jsonLd.image', type: 'url', translatable: true, label: 'Husky Ride: SEO JSON-LD Image' },
        { key: 'pages.huskyRide.meta.jsonLd.location.@type', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD Location @type' },
        { key: 'pages.huskyRide.meta.jsonLd.location.name', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD Location Name' },
        { key: 'pages.huskyRide.meta.jsonLd.name', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD Name' },
        { key: 'pages.huskyRide.meta.jsonLd.provider.@type', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD Provider @type' },
        { key: 'pages.huskyRide.meta.jsonLd.provider.name', type: 'text', translatable: true, label: 'Husky Ride: SEO JSON-LD Provider Name' },
        { key: 'pages.huskyRide.meta.jsonLd.url', type: 'url', translatable: false, label: 'Husky Ride: SEO JSON-LD URL' },
        { key: 'pages.huskyRide.meta.keywords', type: 'text', translatable: true, label: 'Husky Ride: SEO Keywords' },
        { key: 'pages.huskyRide.meta.ogDescription', type: 'textarea', translatable: true, label: 'Husky Ride: SEO OG Description' },
        { key: 'pages.huskyRide.meta.ogImage', type: 'text', translatable: true, label: 'Husky Ride: SEO OG Image' },
        { key: 'pages.huskyRide.meta.ogTitle', type: 'text', translatable: true, label: 'Husky Ride: SEO OG Title' },
        { key: 'pages.huskyRide.meta.siteUrl', type: 'text', translatable: true, label: 'Husky Ride: SEO Site Url' },
        { key: 'pages.huskyRide.meta.title', type: 'text', translatable: true, label: 'Husky Ride: SEO Title' },
    ],

    // Detail page: Snowmobile Safari
    'home:snowmobile': [
        { key: 'pages.snowmobileSafari.closing.description', type: 'textarea', translatable: true, label: 'Snowmobile Safari: Closing Description' },
        { key: 'pages.snowmobileSafari.closing.primaryButton.label', type: 'text', translatable: true, label: 'Snowmobile Safari: Closing Primary Button' },
        { key: 'pages.snowmobileSafari.closing.ratingText', type: 'text', translatable: true, label: 'Snowmobile Safari: Closing Rating Text' },
        { key: 'pages.snowmobileSafari.closing.secondaryButton.label', type: 'text', translatable: true, label: 'Snowmobile Safari: Closing Secondary Button' },
        { key: 'pages.snowmobileSafari.closing.title', type: 'text', translatable: true, label: 'Snowmobile Safari: Closing Title' },
        { key: 'pages.snowmobileSafari.dayProgram.steps', type: 'text', translatable: true, label: 'Snowmobile Safari: Day Program Steps' },
        { key: 'pages.snowmobileSafari.dayProgram.title', type: 'text', translatable: true, label: 'Snowmobile Safari: Day Program Title' },
        { key: 'pages.snowmobileSafari.features', type: 'text', translatable: true, label: 'Snowmobile Safari: Features' },
        { key: 'pages.snowmobileSafari.hero.description', type: 'textarea', translatable: true, label: 'Snowmobile Safari: Hero Description' },
        { key: 'pages.snowmobileSafari.hero.primaryButton.label', type: 'text', translatable: true, label: 'Snowmobile Safari: Hero Primary Button' },
        { key: 'pages.snowmobileSafari.hero.secondaryButton.label', type: 'text', translatable: true, label: 'Snowmobile Safari: Hero Secondary Button' },
        { key: 'pages.snowmobileSafari.hero.title', type: 'text', translatable: true, label: 'Snowmobile Safari: Hero Title' },
        { key: 'pages.snowmobileSafari.intro.heading', type: 'textarea', translatable: true, label: 'Snowmobile Safari: Intro Heading' },
        { key: 'pages.snowmobileSafari.intro.paragraphs', type: 'textarea', translatable: true, label: 'Snowmobile Safari: Intro Paragraphs' },
        { key: 'pages.snowmobileSafari.media.introPoster', type: 'textarea', translatable: true, label: 'Snowmobile Safari: Media Intro Poster' },
        { key: 'pages.snowmobileSafari.media.introVideo', type: 'text', translatable: true, label: 'Snowmobile Safari: Media Intro Video' },
        { key: 'pages.snowmobileSafari.media.poster', type: 'text', translatable: true, label: 'Snowmobile Safari: Media Poster' },
        { key: 'pages.snowmobileSafari.media.videoSrc', type: 'text', translatable: true, label: 'Snowmobile Safari: Media Video Source' },
        { key: 'pages.snowmobileSafari.meta.description', type: 'textarea', translatable: true, label: 'Snowmobile Safari: SEO Description' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.@context', type: 'textarea', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD @context' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.@type', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD @type' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.description', type: 'textarea', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Description' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.image', type: 'url', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Image' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.location.@type', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Location @type' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.location.name', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Location Name' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.name', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Name' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.provider.@type', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Provider @type' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.provider.name', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO JSON-LD Provider Name' },
        { key: 'pages.snowmobileSafari.meta.jsonLd.url', type: 'url', translatable: false, label: 'Snowmobile Safari: SEO JSON-LD URL' },
        { key: 'pages.snowmobileSafari.meta.keywords', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO Keywords' },
        { key: 'pages.snowmobileSafari.meta.ogDescription', type: 'textarea', translatable: true, label: 'Snowmobile Safari: SEO OG Description' },
        { key: 'pages.snowmobileSafari.meta.ogImage', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO OG Image' },
        { key: 'pages.snowmobileSafari.meta.ogTitle', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO OG Title' },
        { key: 'pages.snowmobileSafari.meta.siteUrl', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO Site Url' },
        { key: 'pages.snowmobileSafari.meta.title', type: 'text', translatable: true, label: 'Snowmobile Safari: SEO Title' },
    ],

    // Detail page: Northern Lights
    'home:northernlights': [
        { key: 'pages.northernLights.closing.description', type: 'textarea', translatable: true, label: 'Northern Lights: Closing Description' },
        { key: 'pages.northernLights.closing.primaryButton.label', type: 'text', translatable: true, label: 'Northern Lights: Closing Primary Button' },
        { key: 'pages.northernLights.closing.ratingText', type: 'text', translatable: true, label: 'Northern Lights: Closing Rating Text' },
        { key: 'pages.northernLights.closing.secondaryButton.label', type: 'text', translatable: true, label: 'Northern Lights: Closing Secondary Button' },
        { key: 'pages.northernLights.closing.title', type: 'text', translatable: true, label: 'Northern Lights: Closing Title' },
        { key: 'pages.northernLights.dayProgram.steps', type: 'text', translatable: true, label: 'Northern Lights: Day Program Steps' },
        { key: 'pages.northernLights.dayProgram.title', type: 'text', translatable: true, label: 'Northern Lights: Day Program Title' },
        { key: 'pages.northernLights.features', type: 'text', translatable: true, label: 'Northern Lights: Features' },
        { key: 'pages.northernLights.hero.description', type: 'textarea', translatable: true, label: 'Northern Lights: Hero Description' },
        { key: 'pages.northernLights.hero.primaryButton.label', type: 'text', translatable: true, label: 'Northern Lights: Hero Primary Button' },
        { key: 'pages.northernLights.hero.secondaryButton.label', type: 'text', translatable: true, label: 'Northern Lights: Hero Secondary Button' },
        { key: 'pages.northernLights.hero.title', type: 'text', translatable: true, label: 'Northern Lights: Hero Title' },
        { key: 'pages.northernLights.intro.heading', type: 'textarea', translatable: true, label: 'Northern Lights: Intro Heading' },
        { key: 'pages.northernLights.intro.paragraphs', type: 'textarea', translatable: true, label: 'Northern Lights: Intro Paragraphs' },
        { key: 'pages.northernLights.media.introPoster', type: 'textarea', translatable: true, label: 'Northern Lights: Media Intro Poster' },
        { key: 'pages.northernLights.media.introVideo', type: 'text', translatable: true, label: 'Northern Lights: Media Intro Video' },
        { key: 'pages.northernLights.media.poster', type: 'text', translatable: true, label: 'Northern Lights: Media Poster' },
        { key: 'pages.northernLights.media.videoSrc', type: 'text', translatable: true, label: 'Northern Lights: Media Video Source' },
        { key: 'pages.northernLights.meta.description', type: 'textarea', translatable: true, label: 'Northern Lights: SEO Description' },
        { key: 'pages.northernLights.meta.jsonLd.@context', type: 'textarea', translatable: true, label: 'Northern Lights: SEO JSON-LD @context' },
        { key: 'pages.northernLights.meta.jsonLd.@type', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD @type' },
        { key: 'pages.northernLights.meta.jsonLd.description', type: 'textarea', translatable: true, label: 'Northern Lights: SEO JSON-LD Description' },
        { key: 'pages.northernLights.meta.jsonLd.image', type: 'url', translatable: true, label: 'Northern Lights: SEO JSON-LD Image' },
        { key: 'pages.northernLights.meta.jsonLd.location.@type', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD Location @type' },
        { key: 'pages.northernLights.meta.jsonLd.location.name', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD Location Name' },
        { key: 'pages.northernLights.meta.jsonLd.name', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD Name' },
        { key: 'pages.northernLights.meta.jsonLd.provider.@type', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD Provider @type' },
        { key: 'pages.northernLights.meta.jsonLd.provider.name', type: 'text', translatable: true, label: 'Northern Lights: SEO JSON-LD Provider Name' },
        { key: 'pages.northernLights.meta.jsonLd.url', type: 'url', translatable: false, label: 'Northern Lights: SEO JSON-LD URL' },
        { key: 'pages.northernLights.meta.keywords', type: 'text', translatable: true, label: 'Northern Lights: SEO Keywords' },
        { key: 'pages.northernLights.meta.ogDescription', type: 'textarea', translatable: true, label: 'Northern Lights: SEO OG Description' },
        { key: 'pages.northernLights.meta.ogImage', type: 'text', translatable: true, label: 'Northern Lights: SEO OG Image' },
        { key: 'pages.northernLights.meta.ogTitle', type: 'text', translatable: true, label: 'Northern Lights: SEO OG Title' },
        { key: 'pages.northernLights.meta.siteUrl', type: 'text', translatable: true, label: 'Northern Lights: SEO Site Url' },
        { key: 'pages.northernLights.meta.title', type: 'text', translatable: true, label: 'Northern Lights: SEO Title' },
    ],

    // Detail page: Lodging / Accommodation
    'home:lodging': [
        { key: 'pages.lodging.closing.description', type: 'textarea', translatable: true, label: 'Lodging: Closing Description' },
        { key: 'pages.lodging.closing.primaryButton.label', type: 'text', translatable: true, label: 'Lodging: Closing Primary Button' },
        { key: 'pages.lodging.closing.ratingText', type: 'text', translatable: true, label: 'Lodging: Closing Rating Text' },
        { key: 'pages.lodging.closing.secondaryButton.label', type: 'text', translatable: true, label: 'Lodging: Closing Secondary Button' },
        { key: 'pages.lodging.closing.title', type: 'text', translatable: true, label: 'Lodging: Closing Title' },
        { key: 'pages.lodging.dayProgram.steps', type: 'text', translatable: true, label: 'Lodging: Day Program Steps' },
        { key: 'pages.lodging.dayProgram.title', type: 'text', translatable: true, label: 'Lodging: Day Program Title' },
        { key: 'pages.lodging.features', type: 'text', translatable: true, label: 'Lodging: Features' },
        { key: 'pages.lodging.hero.description', type: 'textarea', translatable: true, label: 'Lodging: Hero Description' },
        { key: 'pages.lodging.hero.primaryButton.label', type: 'text', translatable: true, label: 'Lodging: Hero Primary Button' },
        { key: 'pages.lodging.hero.secondaryButton.label', type: 'text', translatable: true, label: 'Lodging: Hero Secondary Button' },
        { key: 'pages.lodging.hero.title', type: 'text', translatable: true, label: 'Lodging: Hero Title' },
        { key: 'pages.lodging.intro.heading', type: 'textarea', translatable: true, label: 'Lodging: Intro Heading' },
        { key: 'pages.lodging.intro.paragraphs', type: 'textarea', translatable: true, label: 'Lodging: Intro Paragraphs' },
        { key: 'pages.lodging.media.introPoster', type: 'textarea', translatable: true, label: 'Lodging: Media Intro Poster' },
        { key: 'pages.lodging.media.introVideo', type: 'text', translatable: true, label: 'Lodging: Media Intro Video' },
        { key: 'pages.lodging.media.poster', type: 'text', translatable: true, label: 'Lodging: Media Poster' },
        { key: 'pages.lodging.media.videoSrc', type: 'text', translatable: true, label: 'Lodging: Media Video Source' },
        { key: 'pages.lodging.meta.canonicalPath', type: 'text', translatable: true, label: 'Lodging: SEO Canonical Path' },
        { key: 'pages.lodging.meta.description', type: 'textarea', translatable: true, label: 'Lodging: SEO Description' },
        { key: 'pages.lodging.meta.jsonLd.@context', type: 'textarea', translatable: true, label: 'Lodging: SEO JSON-LD @context' },
        { key: 'pages.lodging.meta.jsonLd.@type', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD @type' },
        { key: 'pages.lodging.meta.jsonLd.address.@type', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address @type' },
        { key: 'pages.lodging.meta.jsonLd.address.addressCountry', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address Address Country' },
        { key: 'pages.lodging.meta.jsonLd.address.addressLocality', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address Address Locality' },
        { key: 'pages.lodging.meta.jsonLd.address.addressRegion', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address Address Region' },
        { key: 'pages.lodging.meta.jsonLd.address.postalCode', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address Postal Code' },
        { key: 'pages.lodging.meta.jsonLd.address.streetAddress', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Address Street Address' },
        { key: 'pages.lodging.meta.jsonLd.amenityFeature', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Amenity Feature' },
        { key: 'pages.lodging.meta.jsonLd.description', type: 'textarea', translatable: true, label: 'Lodging: SEO JSON-LD Description' },
        { key: 'pages.lodging.meta.jsonLd.image', type: 'url', translatable: true, label: 'Lodging: SEO JSON-LD Image' },
        { key: 'pages.lodging.meta.jsonLd.name', type: 'text', translatable: true, label: 'Lodging: SEO JSON-LD Name' },
        { key: 'pages.lodging.meta.jsonLd.telephone', type: 'text', translatable: false, label: 'Lodging: SEO JSON-LD Telephone' },
        { key: 'pages.lodging.meta.keywords', type: 'text', translatable: true, label: 'Lodging: SEO Keywords' },
        { key: 'pages.lodging.meta.ogDescription', type: 'textarea', translatable: true, label: 'Lodging: SEO OG Description' },
        { key: 'pages.lodging.meta.ogImage', type: 'text', translatable: true, label: 'Lodging: SEO OG Image' },
        { key: 'pages.lodging.meta.ogTitle', type: 'text', translatable: true, label: 'Lodging: SEO OG Title' },
        { key: 'pages.lodging.meta.siteUrl', type: 'text', translatable: true, label: 'Lodging: SEO Site Url' },
        { key: 'pages.lodging.meta.title', type: 'text', translatable: true, label: 'Lodging: SEO Title' },
    ],

    // Detail page: Lapland Holiday packages
    'home:laplandHoliday': [
        { key: 'pages.laplandHoliday.cta.outlineCta', type: 'text', translatable: true, label: 'Lapland Holiday: CTA Outline Cta' },
        { key: 'pages.laplandHoliday.cta.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: CTA Primary Cta' },
        { key: 'pages.laplandHoliday.cta.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: CTA Secondary Cta' },
        { key: 'pages.laplandHoliday.cta.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: CTA Subtitle' },
        { key: 'pages.laplandHoliday.cta.title', type: 'text', translatable: true, label: 'Lapland Holiday: CTA Title' },
        { key: 'pages.laplandHoliday.featured.badge', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Badge' },
        { key: 'pages.laplandHoliday.featured.galleryCaptions', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Gallery Captions' },
        { key: 'pages.laplandHoliday.featured.package.description', type: 'textarea', translatable: true, label: 'Lapland Holiday: Featured Package Description' },
        { key: 'pages.laplandHoliday.featured.package.duration', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Duration' },
        { key: 'pages.laplandHoliday.featured.package.includes', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Includes' },
        { key: 'pages.laplandHoliday.featured.package.includesTitle', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Includes Title' },
        { key: 'pages.laplandHoliday.featured.package.name', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Name' },
        { key: 'pages.laplandHoliday.featured.package.perPerson', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Per Person' },
        { key: 'pages.laplandHoliday.featured.package.price', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Price' },
        { key: 'pages.laplandHoliday.featured.package.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Primary Cta' },
        { key: 'pages.laplandHoliday.featured.package.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Package Secondary Cta' },
        { key: 'pages.laplandHoliday.featured.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: Featured Subtitle' },
        { key: 'pages.laplandHoliday.featured.title', type: 'text', translatable: true, label: 'Lapland Holiday: Featured Title' },
        { key: 'pages.laplandHoliday.fiveDay.package.description', type: 'textarea', translatable: true, label: 'Lapland Holiday: Five Day Package Description' },
        { key: 'pages.laplandHoliday.fiveDay.package.duration', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Duration' },
        { key: 'pages.laplandHoliday.fiveDay.package.includes', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Includes' },
        { key: 'pages.laplandHoliday.fiveDay.package.includesTitle', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Includes Title' },
        { key: 'pages.laplandHoliday.fiveDay.package.name', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Name' },
        { key: 'pages.laplandHoliday.fiveDay.package.perPerson', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Per Person' },
        { key: 'pages.laplandHoliday.fiveDay.package.price', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Price' },
        { key: 'pages.laplandHoliday.fiveDay.package.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Primary Cta' },
        { key: 'pages.laplandHoliday.fiveDay.package.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Package Secondary Cta' },
        { key: 'pages.laplandHoliday.fiveDay.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: Five Day Subtitle' },
        { key: 'pages.laplandHoliday.fiveDay.title', type: 'text', translatable: true, label: 'Lapland Holiday: Five Day Title' },
        { key: 'pages.laplandHoliday.hero.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Hero Primary Cta' },
        { key: 'pages.laplandHoliday.hero.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Hero Secondary Cta' },
        { key: 'pages.laplandHoliday.hero.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: Hero Subtitle' },
        { key: 'pages.laplandHoliday.hero.title', type: 'text', translatable: true, label: 'Lapland Holiday: Hero Title' },
        { key: 'pages.laplandHoliday.intro.features', type: 'textarea', translatable: true, label: 'Lapland Holiday: Intro Features' },
        { key: 'pages.laplandHoliday.intro.paragraphs', type: 'textarea', translatable: true, label: 'Lapland Holiday: Intro Paragraphs' },
        { key: 'pages.laplandHoliday.metaDescription', type: 'textarea', translatable: true, label: 'Lapland Holiday: SEO Description' },
        { key: 'pages.laplandHoliday.metaTitle', type: 'text', translatable: true, label: 'Lapland Holiday: SEO Title' },
        { key: 'pages.laplandHoliday.oneDay.package.description', type: 'textarea', translatable: true, label: 'Lapland Holiday: One Day Package Description' },
        { key: 'pages.laplandHoliday.oneDay.package.duration', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Duration' },
        { key: 'pages.laplandHoliday.oneDay.package.includes', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Includes' },
        { key: 'pages.laplandHoliday.oneDay.package.includesTitle', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Includes Title' },
        { key: 'pages.laplandHoliday.oneDay.package.name', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Name' },
        { key: 'pages.laplandHoliday.oneDay.package.perPerson', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Per Person' },
        { key: 'pages.laplandHoliday.oneDay.package.price', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Price' },
        { key: 'pages.laplandHoliday.oneDay.package.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Primary Cta' },
        { key: 'pages.laplandHoliday.oneDay.package.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Package Secondary Cta' },
        { key: 'pages.laplandHoliday.oneDay.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: One Day Subtitle' },
        { key: 'pages.laplandHoliday.oneDay.title', type: 'text', translatable: true, label: 'Lapland Holiday: One Day Title' },
        { key: 'pages.laplandHoliday.threeDay.package.addOns', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Add Ons' },
        { key: 'pages.laplandHoliday.threeDay.package.addOnsTitle', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Add Ons Title' },
        { key: 'pages.laplandHoliday.threeDay.package.cancellationPolicy', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Cancellation Policy' },
        { key: 'pages.laplandHoliday.threeDay.package.description', type: 'textarea', translatable: true, label: 'Lapland Holiday: Three Day Package Description' },
        { key: 'pages.laplandHoliday.threeDay.package.duration', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Duration' },
        { key: 'pages.laplandHoliday.threeDay.package.includes', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Includes' },
        { key: 'pages.laplandHoliday.threeDay.package.includesTitle', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Includes Title' },
        { key: 'pages.laplandHoliday.threeDay.package.itinerary', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Itinerary' },
        { key: 'pages.laplandHoliday.threeDay.package.itineraryTitle', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Itinerary Title' },
        { key: 'pages.laplandHoliday.threeDay.package.name', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Name' },
        { key: 'pages.laplandHoliday.threeDay.package.perPerson', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Per Person' },
        { key: 'pages.laplandHoliday.threeDay.package.price', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Price' },
        { key: 'pages.laplandHoliday.threeDay.package.primaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Primary Cta' },
        { key: 'pages.laplandHoliday.threeDay.package.secondaryCta', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Package Secondary Cta' },
        { key: 'pages.laplandHoliday.threeDay.subtitle', type: 'textarea', translatable: true, label: 'Lapland Holiday: Three Day Subtitle' },
        { key: 'pages.laplandHoliday.threeDay.title', type: 'text', translatable: true, label: 'Lapland Holiday: Three Day Title' },
    ],

    // Cookie banner + cookie settings
    'navigation:cookies': [
        { key: 'cookieBanner.acceptAll', type: 'text', translatable: true, label: 'Cookie Banner: Accept All' },
        { key: 'cookieBanner.acceptNecessary', type: 'text', translatable: true, label: 'Cookie Banner: Accept Necessary' },
        { key: 'cookieBanner.customize', type: 'text', translatable: true, label: 'Cookie Banner: Customize' },
        { key: 'cookieBanner.description', type: 'textarea', translatable: true, label: 'Cookie Banner: Description' },
        { key: 'cookieBanner.policyLink', type: 'text', translatable: true, label: 'Cookie Banner: Policy Link' },
        { key: 'cookieBanner.title', type: 'text', translatable: true, label: 'Cookie Banner: Title' },
        { key: 'cookieSettings.cancel', type: 'text', translatable: true, label: 'Cookie Settings: Cancel' },
        { key: 'cookieSettings.categories.analytics.description', type: 'textarea', translatable: true, label: 'Cookie Settings: Analytics Description' },
        { key: 'cookieSettings.categories.analytics.title', type: 'text', translatable: true, label: 'Cookie Settings: Analytics Title' },
        { key: 'cookieSettings.categories.marketing.description', type: 'textarea', translatable: true, label: 'Cookie Settings: Marketing Description' },
        { key: 'cookieSettings.categories.marketing.title', type: 'text', translatable: true, label: 'Cookie Settings: Marketing Title' },
        { key: 'cookieSettings.categories.necessary.description', type: 'textarea', translatable: true, label: 'Cookie Settings: Necessary Description' },
        { key: 'cookieSettings.categories.necessary.title', type: 'text', translatable: true, label: 'Cookie Settings: Necessary Title' },
        { key: 'cookieSettings.close', type: 'text', translatable: true, label: 'Cookie Settings: Close' },
        { key: 'cookieSettings.description', type: 'textarea', translatable: true, label: 'Cookie Settings: Description' },
        { key: 'cookieSettings.save', type: 'text', translatable: true, label: 'Cookie Settings: Save' },
        { key: 'cookieSettings.status.disabled', type: 'text', translatable: true, label: 'Cookie Settings: Status Disabled' },
        { key: 'cookieSettings.status.enabled', type: 'text', translatable: true, label: 'Cookie Settings: Status Enabled' },
        { key: 'cookieSettings.title', type: 'text', translatable: true, label: 'Cookie Settings: Title' },
    ],

    // Legacy navigation keys (main.*, links.*)
    'navigation:legacy': [
        { key: 'links.contact_title', type: 'text', translatable: true, label: 'Links: Contact Title (Legacy)' },
        { key: 'links.quick_links_title', type: 'text', translatable: true, label: 'Links: Quick Links Title (Legacy)' },
        { key: 'main.copyright', type: 'text', translatable: true, label: 'Main: Copyright (Legacy)' },
        { key: 'main.description', type: 'textarea', translatable: true, label: 'Main: Description (Legacy)' },
        { key: 'main.nav_about', type: 'text', translatable: true, label: 'Main: Nav About (Legacy)' },
        { key: 'main.nav_book', type: 'text', translatable: true, label: 'Main: Nav Book (Legacy)' },
        { key: 'main.nav_contact', type: 'text', translatable: true, label: 'Main: Nav Contact (Legacy)' },
        { key: 'main.nav_gallery', type: 'text', translatable: true, label: 'Main: Nav Gallery (Legacy)' },
        { key: 'main.nav_home', type: 'text', translatable: true, label: 'Main: Nav Home (Legacy)' },
        { key: 'main.nav_packages', type: 'text', translatable: true, label: 'Main: Nav Packages (Legacy)' },
        { key: 'main.tagline', type: 'text', translatable: true, label: 'Main: Tagline (Legacy)' },
    ],

    // Legal pages — cookies, privacy, terms policies
    'navigation:policies': [
        { key: 'policies.cookies.categoryLabel', type: 'text', translatable: true, label: 'Cookies Policy: Category Label' },
        { key: 'policies.cookies.contact.description', type: 'textarea', translatable: true, label: 'Cookies Policy: Contact Description' },
        { key: 'policies.cookies.contact.email', type: 'text', translatable: false, label: 'Cookies Policy: Contact Email' },
        { key: 'policies.cookies.contact.label', type: 'text', translatable: true, label: 'Cookies Policy: Contact' },
        { key: 'policies.cookies.contact.title', type: 'text', translatable: true, label: 'Cookies Policy: Contact Title' },
        { key: 'policies.cookies.intro', type: 'text', translatable: true, label: 'Cookies Policy: Intro' },
        { key: 'policies.cookies.lastUpdated', type: 'text', translatable: true, label: 'Cookies Policy: Last Updated' },
        { key: 'policies.cookies.sections', type: 'text', translatable: true, label: 'Cookies Policy: Sections' },
        { key: 'policies.cookies.title', type: 'text', translatable: true, label: 'Cookies Policy: Title' },
        { key: 'policies.privacy.categoryLabel', type: 'text', translatable: true, label: 'Privacy Policy: Category Label' },
        { key: 'policies.privacy.contact.description', type: 'textarea', translatable: true, label: 'Privacy Policy: Contact Description' },
        { key: 'policies.privacy.contact.email', type: 'text', translatable: false, label: 'Privacy Policy: Contact Email' },
        { key: 'policies.privacy.contact.label', type: 'text', translatable: true, label: 'Privacy Policy: Contact' },
        { key: 'policies.privacy.contact.title', type: 'text', translatable: true, label: 'Privacy Policy: Contact Title' },
        { key: 'policies.privacy.intro', type: 'text', translatable: true, label: 'Privacy Policy: Intro' },
        { key: 'policies.privacy.lastUpdated', type: 'text', translatable: true, label: 'Privacy Policy: Last Updated' },
        { key: 'policies.privacy.sections', type: 'text', translatable: true, label: 'Privacy Policy: Sections' },
        { key: 'policies.privacy.title', type: 'text', translatable: true, label: 'Privacy Policy: Title' },
        { key: 'policies.terms.categoryLabel', type: 'text', translatable: true, label: 'Terms Policy: Category Label' },
        { key: 'policies.terms.contact.description', type: 'textarea', translatable: true, label: 'Terms Policy: Contact Description' },
        { key: 'policies.terms.contact.email', type: 'text', translatable: false, label: 'Terms Policy: Contact Email' },
        { key: 'policies.terms.contact.label', type: 'text', translatable: true, label: 'Terms Policy: Contact' },
        { key: 'policies.terms.contact.title', type: 'text', translatable: true, label: 'Terms Policy: Contact Title' },
        { key: 'policies.terms.intro', type: 'text', translatable: true, label: 'Terms Policy: Intro' },
        { key: 'policies.terms.lastUpdated', type: 'text', translatable: true, label: 'Terms Policy: Last Updated' },
        { key: 'policies.terms.sections', type: 'text', translatable: true, label: 'Terms Policy: Sections' },
        { key: 'policies.terms.title', type: 'text', translatable: true, label: 'Terms Policy: Title' },
    ],

    // SEO metadata for all pages
    'navigation:seo': [
        { key: 'seo.about.description', type: 'textarea', translatable: true, label: 'SEO About: Description' },
        { key: 'seo.about.jsonLd.@context', type: 'textarea', translatable: true, label: 'SEO About: JSON-LD @context' },
        { key: 'seo.about.jsonLd.@type', type: 'text', translatable: true, label: 'SEO About: JSON-LD @type' },
        { key: 'seo.about.jsonLd.logo', type: 'text', translatable: true, label: 'SEO About: JSON-LD Logo' },
        { key: 'seo.about.jsonLd.name', type: 'text', translatable: true, label: 'SEO About: JSON-LD Name' },
        { key: 'seo.about.jsonLd.sameAs', type: 'text', translatable: true, label: 'SEO About: JSON-LD Same As' },
        { key: 'seo.about.jsonLd.url', type: 'url', translatable: false, label: 'SEO About: JSON-LD URL' },
        { key: 'seo.about.keywords', type: 'text', translatable: true, label: 'SEO About: Keywords' },
        { key: 'seo.about.ogDescription', type: 'textarea', translatable: true, label: 'SEO About: OG Description' },
        { key: 'seo.about.ogImage', type: 'text', translatable: true, label: 'SEO About: OG Image' },
        { key: 'seo.about.ogTitle', type: 'text', translatable: true, label: 'SEO About: OG Title' },
        { key: 'seo.about.title', type: 'text', translatable: true, label: 'SEO About: Title' },
        { key: 'seo.about.twitterImage', type: 'text', translatable: true, label: 'SEO About: Twitter Image' },
        { key: 'seo.book.description', type: 'textarea', translatable: true, label: 'SEO Book: Description' },
        { key: 'seo.book.keywords', type: 'text', translatable: true, label: 'SEO Book: Keywords' },
        { key: 'seo.book.ogDescription', type: 'textarea', translatable: true, label: 'SEO Book: OG Description' },
        { key: 'seo.book.ogImage', type: 'text', translatable: true, label: 'SEO Book: OG Image' },
        { key: 'seo.book.ogTitle', type: 'text', translatable: true, label: 'SEO Book: OG Title' },
        { key: 'seo.book.title', type: 'text', translatable: true, label: 'SEO Book: Title' },
        { key: 'seo.book.twitterImage', type: 'text', translatable: true, label: 'SEO Book: Twitter Image' },
        { key: 'seo.contact.description', type: 'textarea', translatable: true, label: 'SEO Contact: Description' },
        { key: 'seo.contact.jsonLd.@context', type: 'textarea', translatable: true, label: 'SEO Contact: JSON-LD @context' },
        { key: 'seo.contact.jsonLd.@type', type: 'text', translatable: true, label: 'SEO Contact: JSON-LD @type' },
        { key: 'seo.contact.jsonLd.contactPoint.@type', type: 'text', translatable: true, label: 'SEO Contact: JSON-LD Contact Point @type' },
        { key: 'seo.contact.jsonLd.contactPoint.areaServed', type: 'text', translatable: true, label: 'SEO Contact: JSON-LD Contact Point Area Served' },
        { key: 'seo.contact.jsonLd.contactPoint.availableLanguage', type: 'text', translatable: true, label: 'SEO Contact: JSON-LD Contact Point Available Language' },
        { key: 'seo.contact.jsonLd.contactPoint.contactType', type: 'text', translatable: true, label: 'SEO Contact: JSON-LD Contact Point Contact Type' },
        { key: 'seo.contact.jsonLd.contactPoint.telephone', type: 'text', translatable: false, label: 'SEO Contact: JSON-LD Contact Point Telephone' },
        { key: 'seo.contact.jsonLd.url', type: 'url', translatable: false, label: 'SEO Contact: JSON-LD URL' },
        { key: 'seo.contact.keywords', type: 'text', translatable: true, label: 'SEO Contact: Keywords' },
        { key: 'seo.contact.ogDescription', type: 'textarea', translatable: true, label: 'SEO Contact: OG Description' },
        { key: 'seo.contact.ogImage', type: 'text', translatable: true, label: 'SEO Contact: OG Image' },
        { key: 'seo.contact.ogTitle', type: 'text', translatable: true, label: 'SEO Contact: OG Title' },
        { key: 'seo.contact.title', type: 'text', translatable: true, label: 'SEO Contact: Title' },
        { key: 'seo.contact.twitterImage', type: 'text', translatable: true, label: 'SEO Contact: Twitter Image' },
        { key: 'seo.gallery.description', type: 'textarea', translatable: true, label: 'SEO Gallery: Description' },
        { key: 'seo.gallery.keywords', type: 'text', translatable: true, label: 'SEO Gallery: Keywords' },
        { key: 'seo.gallery.ogDescription', type: 'textarea', translatable: true, label: 'SEO Gallery: OG Description' },
        { key: 'seo.gallery.ogImage', type: 'text', translatable: true, label: 'SEO Gallery: OG Image' },
        { key: 'seo.gallery.ogTitle', type: 'text', translatable: true, label: 'SEO Gallery: OG Title' },
        { key: 'seo.gallery.title', type: 'text', translatable: true, label: 'SEO Gallery: Title' },
        { key: 'seo.gallery.twitterImage', type: 'text', translatable: true, label: 'SEO Gallery: Twitter Image' },
        { key: 'seo.home.description', type: 'textarea', translatable: true, label: 'SEO Home: Description' },
        { key: 'seo.home.jsonLd.@context', type: 'textarea', translatable: true, label: 'SEO Home: JSON-LD @context' },
        { key: 'seo.home.jsonLd.@type', type: 'text', translatable: true, label: 'SEO Home: JSON-LD @type' },
        { key: 'seo.home.jsonLd.description', type: 'textarea', translatable: true, label: 'SEO Home: JSON-LD Description' },
        { key: 'seo.home.jsonLd.inLanguage', type: 'text', translatable: true, label: 'SEO Home: JSON-LD In Language' },
        { key: 'seo.home.jsonLd.isPartOf.@type', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Is Part Of @type' },
        { key: 'seo.home.jsonLd.isPartOf.name', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Is Part Of Name' },
        { key: 'seo.home.jsonLd.isPartOf.url', type: 'url', translatable: false, label: 'SEO Home: JSON-LD Is Part Of URL' },
        { key: 'seo.home.jsonLd.name', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Name' },
        { key: 'seo.home.jsonLd.potentialAction.@type', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Potential Action @type' },
        { key: 'seo.home.jsonLd.potentialAction.name', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Potential Action Name' },
        { key: 'seo.home.jsonLd.potentialAction.target', type: 'text', translatable: true, label: 'SEO Home: JSON-LD Potential Action Target' },
        { key: 'seo.home.jsonLd.url', type: 'url', translatable: false, label: 'SEO Home: JSON-LD URL' },
        { key: 'seo.home.keywords', type: 'text', translatable: true, label: 'SEO Home: Keywords' },
        { key: 'seo.home.ogDescription', type: 'textarea', translatable: true, label: 'SEO Home: OG Description' },
        { key: 'seo.home.ogImage', type: 'text', translatable: true, label: 'SEO Home: OG Image' },
        { key: 'seo.home.ogTitle', type: 'text', translatable: true, label: 'SEO Home: OG Title' },
        { key: 'seo.home.title', type: 'text', translatable: true, label: 'SEO Home: Title' },
        { key: 'seo.home.twitterImage', type: 'text', translatable: true, label: 'SEO Home: Twitter Image' },
        { key: 'seo.packages.description', type: 'textarea', translatable: true, label: 'SEO Packages: Description' },
        { key: 'seo.packages.jsonLd.@context', type: 'textarea', translatable: true, label: 'SEO Packages: JSON-LD @context' },
        { key: 'seo.packages.jsonLd.@type', type: 'text', translatable: true, label: 'SEO Packages: JSON-LD @type' },
        { key: 'seo.packages.jsonLd.name', type: 'text', translatable: true, label: 'SEO Packages: JSON-LD Name' },
        { key: 'seo.packages.jsonLd.url', type: 'url', translatable: false, label: 'SEO Packages: JSON-LD URL' },
        { key: 'seo.packages.keywords', type: 'text', translatable: true, label: 'SEO Packages: Keywords' },
        { key: 'seo.packages.ogDescription', type: 'textarea', translatable: true, label: 'SEO Packages: OG Description' },
        { key: 'seo.packages.ogImage', type: 'text', translatable: true, label: 'SEO Packages: OG Image' },
        { key: 'seo.packages.ogTitle', type: 'text', translatable: true, label: 'SEO Packages: OG Title' },
        { key: 'seo.packages.title', type: 'text', translatable: true, label: 'SEO Packages: Title' },
        { key: 'seo.packages.twitterImage', type: 'text', translatable: true, label: 'SEO Packages: Twitter Image' },
    ],

    // Shared detail page elements (closing CTA, day program)
    'navigation:shared': [
        { key: 'shared.closing.description', type: 'textarea', translatable: true, label: 'Shared: Closing Description' },
        { key: 'shared.closing.primaryButton.label', type: 'text', translatable: true, label: 'Shared: Closing Primary Button' },
        { key: 'shared.closing.primaryButton.target', type: 'text', translatable: true, label: 'Shared: Closing Primary Button Target' },
        { key: 'shared.closing.ratingText', type: 'text', translatable: true, label: 'Shared: Closing Rating Text' },
        { key: 'shared.closing.secondaryButton.label', type: 'text', translatable: true, label: 'Shared: Closing Secondary Button' },
        { key: 'shared.closing.secondaryButton.target', type: 'text', translatable: true, label: 'Shared: Closing Secondary Button Target' },
        { key: 'shared.closing.title', type: 'text', translatable: true, label: 'Shared: Closing Title' },
        { key: 'shared.dayProgram.title', type: 'text', translatable: true, label: 'Shared: Day Program Title' },
        { key: 'shared.sectionsHeading', type: 'text', translatable: true, label: 'Shared: Sections Heading' },
    ],


    // ═══════════════════════════════════════════════════════════════════════════
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a content key is valid for a given section.
 * Falls back to searching ALL sections if the specified section doesn't match,
 * because experience page keys are stored under 'auto:generated' but the
 * publish flow constructs section keys like 'home:huskyRide'.
 */
export function isValidKey(sectionKey: SchemaSection, contentKey: string): boolean {
    // Try exact section match first
    const fields = CONTENT_SCHEMA[sectionKey];
    if (fields && fields.some(f => f.key === contentKey)) return true;

    // Fallback: search all sections
    for (const section of Object.values(CONTENT_SCHEMA)) {
        if (section.some(f => f.key === contentKey)) return true;
    }
    return false;
}

/**
 * Get all fields for a section
 */
export function getFieldsForSection(sectionKey: SchemaSection): ContentFieldSchema[] {
    return CONTENT_SCHEMA[sectionKey] || [];
}

/**
 * Get field schema by key.
 * Falls back to searching ALL sections (same reason as isValidKey).
 */
export function getFieldSchema(sectionKey: SchemaSection, contentKey: string): ContentFieldSchema | undefined {
    // Try exact section match first
    const fields = CONTENT_SCHEMA[sectionKey];
    if (fields) {
        const found = fields.find(f => f.key === contentKey);
        if (found) return found;
    }

    // Fallback: search all sections
    for (const section of Object.values(CONTENT_SCHEMA)) {
        const found = section.find(f => f.key === contentKey);
        if (found) return found;
    }
    return undefined;
}

/**
 * Get all translatable fields for a section
 */
export function getTranslatableFields(sectionKey: SchemaSection): ContentFieldSchema[] {
    const fields = CONTENT_SCHEMA[sectionKey];
    if (!fields) return [];
    return fields.filter(f => f.translatable);
}

/**
 * Check if a section exists in the schema
 */
export function isSectionInSchema(sectionKey: SchemaSection): boolean {
    return sectionKey in CONTENT_SCHEMA;
}

/**
 * Get all section keys defined in schema
 */
export function getAllSchemaSections(): SchemaSection[] {
    return Object.keys(CONTENT_SCHEMA) as SchemaSection[];
}

/**
 * Get all unique content keys defined across all schema sections
 * Used by Schema Coverage dashboard to determine allowed keys
 */
export function getAllSchemaKeys(): string[] {
    const keys = new Set<string>();
    Object.values(CONTENT_SCHEMA).forEach(fields => {
        fields.forEach(f => keys.add(f.key));
    });
    return Array.from(keys).sort();
}

/**
 * Languages supported by the CMS
 */
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'sv', 'de', 'pl'];

/**
 * Check which languages are missing for a field
 * Returns languages that have no draft or published value
 */
export function getMissingLanguages(
    existingLanguages: Language[],
    targetLanguages: Language[] = SUPPORTED_LANGUAGES
): Language[] {
    return targetLanguages.filter(lang => !existingLanguages.includes(lang));
}
