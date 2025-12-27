/**
 * Content Synchronization Script
 * 
 * This script extracts content from the ColdExperience website translation files
 * and generates JSON data for import into the CMS database.
 * 
 * Usage: node scripts/sync-content.js
 */

const fs = require('fs');
const path = require('path');

// Base path to translation files
const LOCALES_PATH = path.join(__dirname, '../../ColdExperience/frontend/public/locales');

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

// Extract nested value from object using dot notation
function getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[key];
    }
    return typeof current === 'string' ? current :
        Array.isArray(current) ? current : undefined;
}

// Generate JSON data for direct import
function generateJSONData(translations) {
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
                title: { en: getNestedValue(translations.en, 'hero.title'), sv: getNestedValue(translations.sv, 'hero.title') },
                magic: { en: getNestedValue(translations.en, 'hero.magic'), sv: getNestedValue(translations.sv, 'hero.magic') },
                subtitle: { en: getNestedValue(translations.en, 'hero.subtitle'), sv: getNestedValue(translations.sv, 'hero.subtitle') },
                cta: { en: getNestedValue(translations.en, 'hero.cta'), sv: getNestedValue(translations.sv, 'hero.cta') },
                explore: { en: getNestedValue(translations.en, 'hero.explore'), sv: getNestedValue(translations.sv, 'hero.explore') },
                feature1Title: { en: getNestedValue(translations.en, 'hero.feature1Title'), sv: getNestedValue(translations.sv, 'hero.feature1Title') },
                feature1Desc: { en: getNestedValue(translations.en, 'hero.feature1Desc'), sv: getNestedValue(translations.sv, 'hero.feature1Desc') },
                feature2Title: { en: getNestedValue(translations.en, 'hero.feature2Title'), sv: getNestedValue(translations.sv, 'hero.feature2Title') },
                feature2Desc: { en: getNestedValue(translations.en, 'hero.feature2Desc'), sv: getNestedValue(translations.sv, 'hero.feature2Desc') },
                feature3Title: { en: getNestedValue(translations.en, 'hero.feature3Title'), sv: getNestedValue(translations.sv, 'hero.feature3Title') },
                feature3Desc: { en: getNestedValue(translations.en, 'hero.feature3Desc'), sv: getNestedValue(translations.sv, 'hero.feature3Desc') },
            },
            features: {
                title: { en: getNestedValue(translations.en, 'features.title'), sv: getNestedValue(translations.sv, 'features.title') },
                intro: { en: getNestedValue(translations.en, 'features.intro'), sv: getNestedValue(translations.sv, 'features.intro') },
                feature1Title: { en: getNestedValue(translations.en, 'features.feature1Title'), sv: getNestedValue(translations.sv, 'features.feature1Title') },
                feature1Desc: { en: getNestedValue(translations.en, 'features.feature1Desc'), sv: getNestedValue(translations.sv, 'features.feature1Desc') },
                feature2Title: { en: getNestedValue(translations.en, 'features.feature2Title'), sv: getNestedValue(translations.sv, 'features.feature2Title') },
                feature2Desc: { en: getNestedValue(translations.en, 'features.feature2Desc'), sv: getNestedValue(translations.sv, 'features.feature2Desc') },
                feature3Title: { en: getNestedValue(translations.en, 'features.feature3Title'), sv: getNestedValue(translations.sv, 'features.feature3Title') },
                feature3Desc: { en: getNestedValue(translations.en, 'features.feature3Desc'), sv: getNestedValue(translations.sv, 'features.feature3Desc') },
                feature4Title: { en: getNestedValue(translations.en, 'features.feature4Title'), sv: getNestedValue(translations.sv, 'features.feature4Title') },
                feature4Desc: { en: getNestedValue(translations.en, 'features.feature4Desc'), sv: getNestedValue(translations.sv, 'features.feature4Desc') },
                outro: { en: getNestedValue(translations.en, 'features.outro'), sv: getNestedValue(translations.sv, 'features.outro') },
            },
            experiences: {
                title: { en: getNestedValue(translations.en, 'experiences.title'), sv: getNestedValue(translations.sv, 'experiences.title') },
                titleHighlight: { en: getNestedValue(translations.en, 'experiences.titleHighlight'), sv: getNestedValue(translations.sv, 'experiences.titleHighlight') },
                intro: { en: getNestedValue(translations.en, 'experiences.intro'), sv: getNestedValue(translations.sv, 'experiences.intro') },
                snowmobileTitle: { en: getNestedValue(translations.en, 'experiences.snowmobileTitle'), sv: getNestedValue(translations.sv, 'experiences.snowmobileTitle') },
                snowmobileDesc: { en: getNestedValue(translations.en, 'experiences.snowmobileDesc'), sv: getNestedValue(translations.sv, 'experiences.snowmobileDesc') },
                northernLightsTitle: { en: getNestedValue(translations.en, 'experiences.northernLightsTitle'), sv: getNestedValue(translations.sv, 'experiences.northernLightsTitle') },
                northernLightsDesc: { en: getNestedValue(translations.en, 'experiences.northernLightsDesc'), sv: getNestedValue(translations.sv, 'experiences.northernLightsDesc') },
                dogSleddingTitle: { en: getNestedValue(translations.en, 'experiences.dogSleddingTitle'), sv: getNestedValue(translations.sv, 'experiences.dogSleddingTitle') },
                dogSleddingDesc: { en: getNestedValue(translations.en, 'experiences.dogSleddingDesc'), sv: getNestedValue(translations.sv, 'experiences.dogSleddingDesc') },
                lodgingTitle: { en: getNestedValue(translations.en, 'experiences.lodgingTitle'), sv: getNestedValue(translations.sv, 'experiences.lodgingTitle') },
                lodgingDesc: { en: getNestedValue(translations.en, 'experiences.lodgingDesc'), sv: getNestedValue(translations.sv, 'experiences.lodgingDesc') },
            },
            about: {
                title: { en: getNestedValue(translations.en, 'about.title'), sv: getNestedValue(translations.sv, 'about.title') },
                intro: { en: getNestedValue(translations.en, 'about.intro'), sv: getNestedValue(translations.sv, 'about.intro') },
                valuesTitle: { en: getNestedValue(translations.en, 'about.valuesTitle'), sv: getNestedValue(translations.sv, 'about.valuesTitle') },
                journeyTitle: { en: getNestedValue(translations.en, 'about.journeyTitle'), sv: getNestedValue(translations.sv, 'about.journeyTitle') },
            },
            ownerSection: {
                title1: { en: getNestedValue(translations.en, 'ownerSection.title1'), sv: getNestedValue(translations.sv, 'ownerSection.title1') },
                title2: { en: getNestedValue(translations.en, 'ownerSection.title2'), sv: getNestedValue(translations.sv, 'ownerSection.title2') },
                intro: { en: getNestedValue(translations.en, 'ownerSection.intro'), sv: getNestedValue(translations.sv, 'ownerSection.intro') },
                names: { en: getNestedValue(translations.en, 'ownerSection.names'), sv: getNestedValue(translations.sv, 'ownerSection.names') },
                bio: { en: getNestedValue(translations.en, 'ownerSection.bio'), sv: getNestedValue(translations.sv, 'ownerSection.bio') },
            },
            contact: {
                heroTitle1: { en: getNestedValue(translations.en, 'contact.hero.title1'), sv: getNestedValue(translations.sv, 'contact.hero.title1') },
                heroTitle2: { en: getNestedValue(translations.en, 'contact.hero.title2'), sv: getNestedValue(translations.sv, 'contact.hero.title2') },
                heroSubtitle: { en: getNestedValue(translations.en, 'contact.hero.subtitle'), sv: getNestedValue(translations.sv, 'contact.hero.subtitle') },
                phone: { en: getNestedValue(translations.en, 'contact.info.phone.number'), sv: getNestedValue(translations.sv, 'contact.info.phone.number') },
                email: { en: getNestedValue(translations.en, 'contact.info.email.address'), sv: getNestedValue(translations.sv, 'contact.info.email.address') },
                location: { en: getNestedValue(translations.en, 'contact.info.location.line1'), sv: getNestedValue(translations.sv, 'contact.info.location.line1') },
            },
            gallery: {
                heroTitle: { en: getNestedValue(translations.en, 'gallery.heroTitle'), sv: getNestedValue(translations.sv, 'gallery.heroTitle') },
                heroSubtitle: { en: getNestedValue(translations.en, 'gallery.heroSubtitle'), sv: getNestedValue(translations.sv, 'gallery.heroSubtitle') },
            },
            footer: {
                companyName: { en: getNestedValue(translations.en, 'footer.companyName'), sv: getNestedValue(translations.sv, 'footer.companyName') },
                quote: { en: getNestedValue(translations.en, 'footer.quote'), sv: getNestedValue(translations.sv, 'footer.quote') },
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
                    en: 'Ultimate Lapland adventure with wilderness overnight and all premium activities included.',
                    sv: 'Det ultimata Lapplandsäventyret med övernattning i vildmarken och alla premiumaktiviteter inkluderade.'
                },
                highlights: {
                    en: getNestedValue(translations.en, 'packages.complete.highlights') || [
                        'All experiences from the adventure package',
                        'Extra nights in Lapland wilderness',
                        'Premium meals and local delicacies',
                        'Extended northern lights hunts',
                        'Exclusive husky adventure',
                        'Personal activities and excursions'
                    ],
                    sv: getNestedValue(translations.sv, 'packages.family.highlights') || [
                        'Alla upplevelser från äventyrspaketet',
                        'Extra nätter i Lapplands vildmark',
                        'Premium-måltider och lokala delikatesser',
                        'Utökade norrskensjakter',
                        'Exklusivt hundspannsäventyr'
                    ]
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
                    en: 'Perfect introduction to Lapland\'s winter magic with all the essential experiences.',
                    sv: 'Perfekt introduktion till Lapplands vintermagi med alla väsentliga upplevelser.'
                },
                highlights: {
                    en: getNestedValue(translations.en, 'packages.adventure.highlights') || [
                        'Bus transfer to/from Skellefteå, Luleå or Lycksele airport',
                        'Accommodation & all meals included',
                        'Snowmobile safari with equipment',
                        'Northern lights hunt',
                        'Husky sledding day',
                        'Wood-fired sauna & hot tub'
                    ],
                    sv: [
                        'Busstransfer till/från Skellefteå, Luleå eller Lycksele flygplats',
                        'Boende & alla måltider ingår',
                        'Skotersafari med utrustning',
                        'Norrskensjakt',
                        'Hundspannsdag',
                        'Vedeldad bastu & badtunna'
                    ]
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
                    en: 'Curated long weekend featuring our signature highlights with Gustav and Julia.',
                    sv: 'Kurerad långhelg med våra signaturupplevelser med Gustav och Julia.'
                },
                highlights: {
                    en: getNestedValue(translations.en, 'packages.threeDay.highlights') || [
                        'Airport transfer from Skellefteå, Luleå or Lycksele',
                        'Two nights in the Råstrand schoolhouse',
                        'Guided snowmobile safari',
                        'Evening northern lights hunt',
                        'Husky sledding experience',
                        'Wood-fired sauna and outdoor hot tub'
                    ],
                    sv: [
                        'Flygplatstransfer från Skellefteå, Luleå eller Lycksele',
                        'Två nätter i Råstrand-skolhuset',
                        'Guidad skotersafari',
                        'Kvällens norrskensjakt',
                        'Hundspannsupplevelse',
                        'Vedeldad bastu och utomhusbadtunna'
                    ]
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
                    en: 'Perfect introduction to Lapland\'s winter magic.',
                    sv: 'Perfekt introduktion till Lapplands vintermagi.'
                },
                highlights: {
                    en: getNestedValue(translations.en, 'packages.taster.highlights') || [
                        'Guided snowmobile safari',
                        'Traditional lunch included',
                        'Northern lights hunt (if possible)',
                        'Local guide and safety equipment'
                    ],
                    sv: [
                        'Guidad skotersafari',
                        'Traditionell lunch ingår',
                        'Norrskensjakt (om möjligt)',
                        'Lokal guide och säkerhetsutrustning'
                    ]
                }
            }
        ],
        settings: {
            site_name: 'Cold Experience',
            default_language: 'en',
            contact_email: 'info@coldexperience.se',
            contact_phone: '+46 73 181 45 68',
            season_start: 'December',
            season_end: 'April',
            location: 'Råstrand, Swedish Lapland'
        },
        meta: {
            generated_at: new Date().toISOString(),
            source: 'ColdExperience/frontend/public/locales',
            languages: ['en', 'sv']
        }
    };

    return output;
}

// Main execution
function main() {
    console.log('🚀 Cold Experience CMS Content Sync');
    console.log('=====================================\n');

    console.log('📂 Loading translation files...');

    const enTranslation = loadTranslation('en');
    const svTranslation = loadTranslation('sv');

    console.log('✅ Translations loaded');
    console.log(`   EN sections: ${Object.keys(enTranslation).length}`);
    console.log(`   SV sections: ${Object.keys(svTranslation).length}`);

    // Generate JSON output
    const jsonData = generateJSONData({ en: enTranslation, sv: svTranslation });

    // Save JSON output
    const outputPath = path.join(__dirname, '../cms-content-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
    console.log(`\n📄 Content data saved to: cms-content-data.json`);

    // Display summary
    console.log('\n📊 Content Summary:');
    console.log(`   Pages: ${jsonData.pages.length}`);
    console.log(`   Content sections: ${Object.keys(jsonData.content).length}`);
    console.log(`   Packages: ${jsonData.packages.length}`);
    console.log(`   Settings: ${Object.keys(jsonData.settings).length}`);

    console.log('\n✨ Content sync complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. The CMS dashboard will automatically load this data');
    console.log('   2. Or run the Supabase seed.sql to populate the database');

    // Show sample content
    console.log('\n📝 Sample content:');
    console.log(`   Hero title (EN): "${jsonData.content.hero.title.en}"`);
    console.log(`   Hero title (SV): "${jsonData.content.hero.title.sv}"`);
    console.log(`   Hero magic (EN): "${jsonData.content.hero.magic.en}"`);
    console.log(`   Featured package: ${jsonData.packages[0].name.en} - ${jsonData.packages[0].priceSEK} SEK`);
}

main();
