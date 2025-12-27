/**
 * COMPLETE Content Synchronization Script
 * 
 * Extracts ALL content from the ColdExperience website translation files
 * and generates comprehensive JSON data for the CMS.
 * 
 * Features:
 * - Extracts ALL text content (not just selected fields)
 * - Supports all 4 languages: EN, SV, DE, PL
 * - Preserves full structure for editing
 * - Organizes content by logical sections
 * 
 * Usage: node scripts/sync-content-full.cjs
 */

const fs = require('fs');
const path = require('path');

// Base path to translation files
const LOCALES_PATH = path.join(__dirname, '../../ColdExperience/frontend/public/locales');
const LANGUAGES = ['en', 'sv', 'de', 'pl'];

// Load translation file for a specific language
function loadTranslation(lang) {
    const translationPath = path.join(LOCALES_PATH, lang, 'translation.json');
    try {
        const content = fs.readFileSync(translationPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Failed to load ${lang} translation:`, error.message);
        return {};
    }
}

// Flatten nested object to dot notation paths
function flattenObject(obj, prefix = '') {
    const result = {};

    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            continue;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

// Get value by dot notation path
function getByPath(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[key];
    }
    return current;
}

// Build multilingual content object
function buildMultilingualContent(translations, key) {
    const result = {};
    for (const lang of LANGUAGES) {
        const value = getByPath(translations[lang], key);
        if (value !== undefined) {
            result[lang] = value;
        }
    }
    return Object.keys(result).length > 0 ? result : null;
}

// Define CMS page structure with sections
const PAGE_DEFINITIONS = [
    {
        slug: 'hero',
        name: 'Hero Section',
        description: 'Main landing section with video, title and CTAs',
        icon: 'home',
        displayOrder: 1,
        sections: ['hero', 'featuredVideo']
    },
    {
        slug: 'features',
        name: 'Why Choose Us',
        description: 'Key selling points and features',
        icon: 'star',
        displayOrder: 2,
        sections: ['features']
    },
    {
        slug: 'experiences',
        name: 'Experiences',
        description: 'Adventure descriptions (snowmobile, husky, northern lights, lodging)',
        icon: 'compass',
        displayOrder: 3,
        sections: ['experiences']
    },
    {
        slug: 'about',
        name: 'About Us',
        description: 'Company story, team info, values and timeline',
        icon: 'users',
        displayOrder: 4,
        sections: ['about', 'ownerSection', 'why']
    },
    {
        slug: 'packages',
        name: 'Packages',
        description: 'Adventure packages and pricing',
        icon: 'package',
        displayOrder: 5,
        sections: ['packages']
    },
    {
        slug: 'gallery',
        name: 'Gallery',
        description: 'Photo gallery and image captions',
        icon: 'image',
        displayOrder: 6,
        sections: ['gallery']
    },
    {
        slug: 'contact',
        name: 'Contact',
        description: 'Contact information, form and FAQs',
        icon: 'mail',
        displayOrder: 7,
        sections: ['contact', 'faq']
    },
    {
        slug: 'booking',
        name: 'Booking',
        description: 'Booking form fields and messages',
        icon: 'calendar',
        displayOrder: 8,
        sections: ['booking', 'book', 'form']
    },
    {
        slug: 'detailPages',
        name: 'Detail Pages',
        description: 'Snowmobile Safari, Husky Ride, Northern Lights, Lodging pages',
        icon: 'file-text',
        displayOrder: 9,
        sections: ['pages']
    },
    {
        slug: 'navigation',
        name: 'Navigation & UI',
        description: 'Header, footer and common UI elements',
        icon: 'menu',
        displayOrder: 10,
        sections: ['header', 'footer', 'common', 'shared']
    },
    {
        slug: 'legal',
        name: 'Legal & Policies',
        description: 'Privacy policy, terms and cookies',
        icon: 'shield',
        displayOrder: 11,
        sections: ['policies', 'cookieBanner', 'cookieSettings']
    },
    {
        slug: 'testimonials',
        name: 'Testimonials',
        description: 'Guest reviews and ratings',
        icon: 'message-circle',
        displayOrder: 12,
        sections: ['testimonials']
    }
];

// Extract content for a specific section
function extractSectionContent(translations, sectionKey) {
    const content = {};
    const enSection = translations.en[sectionKey];

    if (!enSection) return null;

    const flatKeys = flattenObject(enSection);

    for (const flatKey in flatKeys) {
        const fullKey = `${sectionKey}.${flatKey}`;
        const multiLangValue = buildMultilingualContent(translations, fullKey);

        if (multiLangValue) {
            // Store with the flat key as identifier
            content[flatKey] = multiLangValue;
        }
    }

    return content;
}

// Generate complete CMS data
function generateFullCmsData(translations) {
    console.log('\n📦 Generating comprehensive CMS data...\n');

    const pages = PAGE_DEFINITIONS.map(pageDef => ({
        slug: pageDef.slug,
        name: pageDef.name,
        description: pageDef.description,
        icon: pageDef.icon,
        display_order: pageDef.displayOrder,
        sections: pageDef.sections
    }));

    const content = {};
    let totalFields = 0;

    for (const pageDef of PAGE_DEFINITIONS) {
        content[pageDef.slug] = {};

        for (const sectionKey of pageDef.sections) {
            const sectionContent = extractSectionContent(translations, sectionKey);
            if (sectionContent) {
                content[pageDef.slug][sectionKey] = sectionContent;
                const fieldCount = Object.keys(sectionContent).length;
                totalFields += fieldCount;
                console.log(`   ✓ ${pageDef.name} → ${sectionKey}: ${fieldCount} fields`);
            }
        }
    }

    // Extract packages with full details
    const packages = extractPackages(translations);

    console.log(`\n   📊 Total content fields: ${totalFields}`);
    console.log(`   📦 Packages: ${packages.length}`);

    return {
        meta: {
            generated_at: new Date().toISOString(),
            source: 'ColdExperience/frontend/public/locales',
            languages: LANGUAGES,
            version: '2.0',
            total_fields: totalFields
        },
        pages,
        content,
        packages,
        settings: {
            site_name: 'Cold Experience',
            default_language: 'en',
            available_languages: LANGUAGES,
            contact_email: 'info@coldexperience.se',
            contact_phone: '+46 73 181 45 68',
            season_start: 'December',
            season_end: 'April',
            location: 'Råstrand, Swedish Lapland',
            currency_primary: 'SEK',
            currency_secondary: 'EUR'
        }
    };
}

// Extract packages with pricing
function extractPackages(translations) {
    const packageDefs = [
        {
            key: 'complete',
            translationKey: 'packages.complete',
            priceSEK: 24500,
            priceEUR: 2250,
            featured: true,
            displayOrder: 0
        },
        {
            key: 'adventure',
            translationKey: 'packages.adventure',
            priceSEK: 19000,
            priceEUR: 1750,
            featured: false,
            displayOrder: 1
        },
        {
            key: 'threeDay',
            translationKey: 'packages.threeDay',
            priceSEK: 13500,
            priceEUR: 1250,
            featured: false,
            displayOrder: 2
        },
        {
            key: 'taster',
            translationKey: 'packages.taster',
            priceSEK: 3800,
            priceEUR: 350,
            featured: false,
            displayOrder: 3
        }
    ];

    return packageDefs.map(def => {
        const pkg = {
            key: def.key,
            priceSEK: def.priceSEK,
            priceEUR: def.priceEUR,
            featured: def.featured,
            displayOrder: def.displayOrder,
            name: buildMultilingualContent(translations, `${def.translationKey}.name`) || {
                en: def.key,
                sv: def.key,
                de: def.key,
                pl: def.key
            },
            duration: buildMultilingualContent(translations, `${def.translationKey}.duration`) || {},
            description: buildMultilingualContent(translations, `${def.translationKey}.description`) || {},
            highlights: buildMultilingualContent(translations, `${def.translationKey}.highlights`) || {}
        };

        // Also try to get detailed package info from pages.laplandHoliday
        const detailedKey = def.key === 'adventure' ? 'fiveDay' :
            def.key === 'complete' ? 'featured' :
                def.key === 'threeDay' ? 'threeDay' :
                    def.key === 'taster' ? 'oneDay' : null;

        if (detailedKey) {
            const detailedInfo = buildMultilingualContent(translations, `pages.laplandHoliday.${detailedKey}.package.includes`);
            if (detailedInfo) {
                pkg.includesDetailed = detailedInfo;
            }
        }

        return pkg;
    });
}

// Main execution
function main() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     COLD EXPERIENCE CMS - COMPLETE CONTENT SYNCHRONIZATION     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📂 Loading translation files...');

    const translations = {};
    for (const lang of LANGUAGES) {
        translations[lang] = loadTranslation(lang);
        const keyCount = Object.keys(translations[lang]).length;
        console.log(`   ✓ ${lang.toUpperCase()}: ${keyCount} top-level sections`);
    }

    // Generate comprehensive CMS data
    const cmsData = generateFullCmsData(translations);

    // Save JSON output
    const outputPath = path.join(__dirname, '../cms-content-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(cmsData, null, 2));

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('✨ SYNC COMPLETE!');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`\n📄 Output: cms-content-data.json`);
    console.log(`   • Languages: ${LANGUAGES.join(', ').toUpperCase()}`);
    console.log(`   • Pages: ${cmsData.pages.length}`);
    console.log(`   • Content sections: ${Object.keys(cmsData.content).length}`);
    console.log(`   • Packages: ${cmsData.packages.length}`);
    console.log(`   • Total fields: ${cmsData.meta.total_fields}`);

    console.log('\n📝 Sample content:');
    if (cmsData.content.hero?.hero?.title) {
        console.log(`   Hero title (EN): "${cmsData.content.hero.hero.title.en}"`);
        console.log(`   Hero title (SV): "${cmsData.content.hero.hero.title.sv}"`);
        console.log(`   Hero title (DE): "${cmsData.content.hero.hero.title.de}"`);
        console.log(`   Hero title (PL): "${cmsData.content.hero.hero.title.pl}"`);
    }

    console.log('\n🚀 Next steps:');
    console.log('   1. Restart the CMS dashboard (npm run dev)');
    console.log('   2. Open http://localhost:3001 to see all content');
    console.log('   3. Configure Supabase for permanent storage\n');
}

main();
