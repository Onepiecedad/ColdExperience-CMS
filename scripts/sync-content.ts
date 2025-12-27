/**
 * Content Synchronization Script
 * 
 * This script extracts content from the ColdExperience website translation files
 * and populates the CMS database with real content.
 * 
 * Usage: npx ts-node scripts/sync-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TranslationContent {
    [key: string]: any;
}

interface CmsContentItem {
    page_id: string;
    content_key: string;
    content_type: 'text' | 'richtext' | 'html' | 'array';
    field_label: string;
    content_en?: string;
    content_sv?: string;
    content_de?: string;
    content_pl?: string;
    display_order: number;
}

interface CmsPackageItem {
    package_key: string;
    price_sek: number;
    price_eur?: number;
    featured: boolean;
    display_order: number;
    name_en: string;
    name_sv: string;
    duration_en: string;
    duration_sv: string;
    description_en: string;
    description_sv: string;
    highlights_en: string[];
    highlights_sv: string[];
}

// Base path to translation files
const LOCALES_PATH = path.join(__dirname, '../../ColdExperience/frontend/public/locales');

// Load translation file for a specific language
function loadTranslation(lang: string): TranslationContent {
    const translationPath = path.join(LOCALES_PATH, lang, 'translation.json');
    try {
        const content = fs.readFileSync(translationPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Failed to load ${lang} translation:`, error);
        return {};
    }
}

// Extract nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[key];
    }
    return typeof current === 'string' ? current : undefined;
}

// Generate SQL INSERT statements for cms_content
function generateContentSQL(translations: { en: TranslationContent; sv: TranslationContent }): string {
    const pages = [
        { slug: 'hero', displayName: 'Hero Section' },
        { slug: 'about', displayName: 'About Us' },
        { slug: 'experiences', displayName: 'Experiences' },
        { slug: 'features', displayName: 'Why Choose Us' },
        { slug: 'gallery', displayName: 'Gallery' },
        { slug: 'contact', displayName: 'Contact' },
        { slug: 'footer', displayName: 'Footer' },
    ];

    const contentMappings = [
        // Hero Section
        { page: 'hero', key: 'hero.title', path: 'hero.title', label: 'Main Title', type: 'text' },
        { page: 'hero', key: 'hero.magic', path: 'hero.magic', label: 'Title Highlight', type: 'text' },
        { page: 'hero', key: 'hero.subtitle', path: 'hero.subtitle', label: 'Subtitle', type: 'richtext' },
        { page: 'hero', key: 'hero.cta', path: 'hero.cta', label: 'Primary Button', type: 'text' },
        { page: 'hero', key: 'hero.explore', path: 'hero.explore', label: 'Secondary Button', type: 'text' },
        { page: 'hero', key: 'hero.feature1Title', path: 'hero.feature1Title', label: 'Feature 1 Title', type: 'text' },
        { page: 'hero', key: 'hero.feature1Desc', path: 'hero.feature1Desc', label: 'Feature 1 Description', type: 'text' },
        { page: 'hero', key: 'hero.feature2Title', path: 'hero.feature2Title', label: 'Feature 2 Title', type: 'text' },
        { page: 'hero', key: 'hero.feature2Desc', path: 'hero.feature2Desc', label: 'Feature 2 Description', type: 'text' },
        { page: 'hero', key: 'hero.feature3Title', path: 'hero.feature3Title', label: 'Feature 3 Title', type: 'text' },
        { page: 'hero', key: 'hero.feature3Desc', path: 'hero.feature3Desc', label: 'Feature 3 Description', type: 'text' },

        // About Section
        { page: 'about', key: 'about.title', path: 'about.title', label: 'Page Title', type: 'text' },
        { page: 'about', key: 'about.intro', path: 'about.intro', label: 'Introduction', type: 'richtext' },
        { page: 'about', key: 'about.valuesTitle', path: 'about.valuesTitle', label: 'Values Section Title', type: 'text' },
        { page: 'about', key: 'about.journeyTitle', path: 'about.journeyTitle', label: 'Journey Title', type: 'text' },

        // Features Section
        { page: 'features', key: 'features.title', path: 'features.title', label: 'Section Title', type: 'text' },
        { page: 'features', key: 'features.intro', path: 'features.intro', label: 'Introduction', type: 'richtext' },
        { page: 'features', key: 'features.feature1Title', path: 'features.feature1Title', label: 'Feature 1 Title', type: 'text' },
        { page: 'features', key: 'features.feature1Desc', path: 'features.feature1Desc', label: 'Feature 1 Description', type: 'richtext' },
        { page: 'features', key: 'features.feature2Title', path: 'features.feature2Title', label: 'Feature 2 Title', type: 'text' },
        { page: 'features', key: 'features.feature2Desc', path: 'features.feature2Desc', label: 'Feature 2 Description', type: 'richtext' },
        { page: 'features', key: 'features.feature3Title', path: 'features.feature3Title', label: 'Feature 3 Title', type: 'text' },
        { page: 'features', key: 'features.feature3Desc', path: 'features.feature3Desc', label: 'Feature 3 Description', type: 'richtext' },
        { page: 'features', key: 'features.feature4Title', path: 'features.feature4Title', label: 'Feature 4 Title', type: 'text' },
        { page: 'features', key: 'features.feature4Desc', path: 'features.feature4Desc', label: 'Feature 4 Description', type: 'richtext' },
        { page: 'features', key: 'features.outro', path: 'features.outro', label: 'Outro', type: 'richtext' },

        // Experiences Section
        { page: 'experiences', key: 'experiences.title', path: 'experiences.title', label: 'Section Title', type: 'text' },
        { page: 'experiences', key: 'experiences.titleHighlight', path: 'experiences.titleHighlight', label: 'Title Highlight', type: 'text' },
        { page: 'experiences', key: 'experiences.intro', path: 'experiences.intro', label: 'Introduction', type: 'richtext' },
        { page: 'experiences', key: 'experiences.snowmobileTitle', path: 'experiences.snowmobileTitle', label: 'Snowmobile Title', type: 'text' },
        { page: 'experiences', key: 'experiences.snowmobileDesc', path: 'experiences.snowmobileDesc', label: 'Snowmobile Description', type: 'richtext' },
        { page: 'experiences', key: 'experiences.northernLightsTitle', path: 'experiences.northernLightsTitle', label: 'Northern Lights Title', type: 'text' },
        { page: 'experiences', key: 'experiences.northernLightsDesc', path: 'experiences.northernLightsDesc', label: 'Northern Lights Description', type: 'richtext' },
        { page: 'experiences', key: 'experiences.dogSleddingTitle', path: 'experiences.dogSleddingTitle', label: 'Dog Sledding Title', type: 'text' },
        { page: 'experiences', key: 'experiences.dogSleddingDesc', path: 'experiences.dogSleddingDesc', label: 'Dog Sledding Description', type: 'richtext' },

        // Gallery Section
        { page: 'gallery', key: 'gallery.heroTitle', path: 'gallery.heroTitle', label: 'Hero Title', type: 'text' },
        { page: 'gallery', key: 'gallery.heroSubtitle', path: 'gallery.heroSubtitle', label: 'Hero Subtitle', type: 'richtext' },

        // Contact Section
        { page: 'contact', key: 'contact.hero.title1', path: 'contact.hero.title1', label: 'Hero Title 1', type: 'text' },
        { page: 'contact', key: 'contact.hero.title2', path: 'contact.hero.title2', label: 'Hero Title 2', type: 'text' },
        { page: 'contact', key: 'contact.hero.subtitle', path: 'contact.hero.subtitle', label: 'Hero Subtitle', type: 'richtext' },
        { page: 'contact', key: 'contact.info.phone.number', path: 'contact.info.phone.number', label: 'Phone Number', type: 'text' },
        { page: 'contact', key: 'contact.info.email.address', path: 'contact.info.email.address', label: 'Email Address', type: 'text' },

        // Footer Section
        { page: 'footer', key: 'footer.companyName', path: 'footer.companyName', label: 'Company Name', type: 'text' },
        { page: 'footer', key: 'footer.quote', path: 'footer.quote', label: 'Footer Quote', type: 'text' },
    ];

    const sqlStatements: string[] = [];

    contentMappings.forEach((mapping, index) => {
        const enValue = getNestedValue(translations.en, mapping.path) || '';
        const svValue = getNestedValue(translations.sv, mapping.path) || '';

        const escapedEnValue = enValue.replace(/'/g, "''");
        const escapedSvValue = svValue.replace(/'/g, "''");

        sqlStatements.push(`
INSERT INTO cms_content (page_id, content_key, content_type, field_label, content_en, content_sv, display_order)
SELECT p.id, '${mapping.key}', '${mapping.type}', '${mapping.label}', 
       '${escapedEnValue}', '${escapedSvValue}', ${index + 1}
FROM cms_pages p WHERE p.slug = '${mapping.page}'
ON CONFLICT (page_id, content_key) DO UPDATE SET
  content_en = EXCLUDED.content_en,
  content_sv = EXCLUDED.content_sv,
  field_label = EXCLUDED.field_label;`);
    });

    return sqlStatements.join('\n');
}

// Generate JSON data for direct import
function generateJSONData(translations: { en: TranslationContent; sv: TranslationContent }) {
    const output = {
        pages: [
            { slug: 'hero', name: 'Hero Section', description: 'Main landing section with video and CTAs', icon: 'home', display_order: 1 },
            { slug: 'about', name: 'About Us', description: 'Company story and team info', icon: 'users', display_order: 2 },
            { slug: 'experiences', name: 'Experiences', description: 'Adventure descriptions', icon: 'compass', display_order: 3 },
            { slug: 'features', name: 'Why Choose Us', description: 'Key selling points', icon: 'star', display_order: 4 },
            { slug: 'packages', name: 'Packages', description: 'Adventure packages', icon: 'package', display_order: 5 },
            { slug: 'gallery', name: 'Gallery', description: 'Photo gallery captions', icon: 'image', display_order: 6 },
            { slug: 'contact', name: 'Contact', description: 'Contact information and form', icon: 'mail', display_order: 7 },
            { slug: 'footer', name: 'Footer', description: 'Footer content and links', icon: 'layout', display_order: 8 },
        ],
        content: {
            hero: {
                title: { en: translations.en.hero?.title, sv: translations.sv.hero?.title },
                magic: { en: translations.en.hero?.magic, sv: translations.sv.hero?.magic },
                subtitle: { en: translations.en.hero?.subtitle, sv: translations.sv.hero?.subtitle },
                cta: { en: translations.en.hero?.cta, sv: translations.sv.hero?.cta },
                explore: { en: translations.en.hero?.explore, sv: translations.sv.hero?.explore },
                feature1Title: { en: translations.en.hero?.feature1Title, sv: translations.sv.hero?.feature1Title },
                feature1Desc: { en: translations.en.hero?.feature1Desc, sv: translations.sv.hero?.feature1Desc },
                feature2Title: { en: translations.en.hero?.feature2Title, sv: translations.sv.hero?.feature2Title },
                feature2Desc: { en: translations.en.hero?.feature2Desc, sv: translations.sv.hero?.feature2Desc },
                feature3Title: { en: translations.en.hero?.feature3Title, sv: translations.sv.hero?.feature3Title },
                feature3Desc: { en: translations.en.hero?.feature3Desc, sv: translations.sv.hero?.feature3Desc },
            },
            features: {
                title: { en: translations.en.features?.title, sv: translations.sv.features?.title },
                intro: { en: translations.en.features?.intro, sv: translations.sv.features?.intro },
                feature1Title: { en: translations.en.features?.feature1Title, sv: translations.sv.features?.feature1Title },
                feature1Desc: { en: translations.en.features?.feature1Desc, sv: translations.sv.features?.feature1Desc },
                feature2Title: { en: translations.en.features?.feature2Title, sv: translations.sv.features?.feature2Title },
                feature2Desc: { en: translations.en.features?.feature2Desc, sv: translations.sv.features?.feature2Desc },
                feature3Title: { en: translations.en.features?.feature3Title, sv: translations.sv.features?.feature3Title },
                feature3Desc: { en: translations.en.features?.feature3Desc, sv: translations.sv.features?.feature3Desc },
                feature4Title: { en: translations.en.features?.feature4Title, sv: translations.sv.features?.feature4Title },
                feature4Desc: { en: translations.en.features?.feature4Desc, sv: translations.sv.features?.feature4Desc },
            },
            about: {
                title: { en: translations.en.about?.title, sv: translations.sv.about?.title },
                intro: { en: translations.en.about?.intro, sv: translations.sv.about?.intro },
                valuesTitle: { en: translations.en.about?.valuesTitle, sv: translations.sv.about?.valuesTitle },
                journeyTitle: { en: translations.en.about?.journeyTitle, sv: translations.sv.about?.journeyTitle },
            },
            contact: {
                heroTitle1: { en: translations.en.contact?.hero?.title1, sv: translations.sv.contact?.hero?.title1 },
                heroTitle2: { en: translations.en.contact?.hero?.title2, sv: translations.sv.contact?.hero?.title2 },
                heroSubtitle: { en: translations.en.contact?.hero?.subtitle, sv: translations.sv.contact?.hero?.subtitle },
                phone: { en: translations.en.contact?.info?.phone?.number, sv: translations.sv.contact?.info?.phone?.number },
                email: { en: translations.en.contact?.info?.email?.address, sv: translations.sv.contact?.info?.email?.address },
            },
        },
        packages: [
            {
                key: 'complete',
                priceSEK: 24500,
                priceEUR: 2250,
                featured: true,
                displayOrder: 0,
                name: { en: '7-Day Complete Experience', sv: '7-dagars Komplett Upplevelse' },
                duration: { en: '7 days / 6 nights', sv: '7 dagar / 6 nätter' },
                description: {
                    en: translations.en.packages?.complete?.description || 'Ultimate Lapland adventure with wilderness overnight and all premium activities included.',
                    sv: translations.sv.packages?.family?.description || 'Det ultimata Lapplandsäventyret med övernattning i vildmarken och alla premiumaktiviteter inkluderade.'
                },
                highlights: {
                    en: translations.en.packages?.complete?.highlights || [],
                    sv: translations.sv.packages?.family?.highlights || []
                }
            },
            {
                key: 'adventure',
                priceSEK: 19000,
                priceEUR: 1750,
                featured: false,
                displayOrder: 1,
                name: { en: '5-Day Adventure', sv: '5-dagars Äventyr' },
                duration: { en: '5 days / 4 nights', sv: '5 dagar / 4 nätter' },
                description: {
                    en: translations.en.packages?.adventure?.description || 'Perfect introduction to Lapland\'s winter magic with all the essential experiences.',
                    sv: 'Perfekt introduktion till Lapplands vintermagi med alla väsentliga upplevelser.'
                },
                highlights: {
                    en: translations.en.packages?.adventure?.highlights || [],
                    sv: []
                }
            },
            {
                key: 'threeDay',
                priceSEK: 13500,
                priceEUR: 1250,
                featured: false,
                displayOrder: 2,
                name: { en: '3-Day Lapland Escape', sv: '3-dagars Lapplandsflykt' },
                duration: { en: '3 days / 2 nights', sv: '3 dagar / 2 nätter' },
                description: {
                    en: translations.en.packages?.threeDay?.description || 'Curated long weekend featuring our signature highlights.',
                    sv: 'Kurerad långhelg med våra signaturupplevelser.'
                },
                highlights: {
                    en: translations.en.packages?.threeDay?.highlights || [],
                    sv: []
                }
            },
            {
                key: 'taster',
                priceSEK: 3800,
                priceEUR: 350,
                featured: false,
                displayOrder: 3,
                name: { en: '1-Day Taster', sv: '1-dags Smakprov' },
                duration: { en: '1 day', sv: '1 dag' },
                description: {
                    en: translations.en.packages?.taster?.description || 'Perfect introduction to Lapland\'s winter magic.',
                    sv: 'Perfekt introduktion till Lapplands vintermagi.'
                },
                highlights: {
                    en: translations.en.packages?.taster?.highlights || [],
                    sv: []
                }
            }
        ],
        settings: {
            site_name: 'Cold Experience',
            default_language: 'en',
            contact_email: 'info@coldexperience.se',
            contact_phone: '+46 73 181 45 68',
            season_start: 'December',
            season_end: 'April'
        }
    };

    return output;
}

// Main execution
async function main() {
    console.log('🚀 Loading translation files...');

    const enTranslation = loadTranslation('en');
    const svTranslation = loadTranslation('sv');

    console.log('✅ Translations loaded');
    console.log(`   EN keys: ${Object.keys(enTranslation).length}`);
    console.log(`   SV keys: ${Object.keys(svTranslation).length}`);

    // Generate JSON output
    const jsonData = generateJSONData({ en: enTranslation, sv: svTranslation });

    // Save JSON output
    const outputPath = path.join(__dirname, '../cms-content-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
    console.log(`\n📄 JSON data saved to: ${outputPath}`);

    // Generate SQL output
    const sqlOutput = generateContentSQL({ en: enTranslation, sv: svTranslation });
    const sqlPath = path.join(__dirname, '../cms-seed-generated.sql');
    fs.writeFileSync(sqlPath, sqlOutput);
    console.log(`📄 SQL statements saved to: ${sqlPath}`);

    console.log('\n✨ Content sync complete!');
    console.log('\nNext steps:');
    console.log('1. Review the generated files');
    console.log('2. Run the SQL in Supabase SQL Editor, or');
    console.log('3. Import the JSON via the CMS dashboard');
}

main().catch(console.error);
