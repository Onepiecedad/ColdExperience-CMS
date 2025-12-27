/**
 * CMS Conversion Mapping Analysis
 * 
 * This script creates a detailed mapping between i18n keys and CMS fields.
 * 
 * Run: node scripts/analyze-cms-mapping.cjs
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../../ColdExperience/frontend/src/components');
const CMS_DATA_PATH = path.join(__dirname, '../cms-content-data.json');

// Load CMS data
const cmsData = JSON.parse(fs.readFileSync(CMS_DATA_PATH, 'utf-8'));

// Build a flat map of all CMS fields
function buildCmsFieldMap() {
    const fieldMap = new Map();

    // The actual structure is: content -> page -> section -> field
    const content = cmsData.content || {};

    for (const [pageName, pageData] of Object.entries(content)) {
        if (typeof pageData !== 'object') continue;

        for (const [sectionName, sectionData] of Object.entries(pageData)) {
            if (typeof sectionData !== 'object') continue;

            for (const [fieldKey, fieldValue] of Object.entries(sectionData)) {
                // Store with various possible i18n key formats
                const cmsPath = { page: pageName, section: sectionName, field: fieldKey };

                // Examples of how i18n keys might map:
                // "about.title" -> content.about.about.title
                // "contact.hero.title1" -> content.contact.contact.hero.title1
                // "gallery.heroTitle" -> content.gallery.gallery.heroTitle

                fieldMap.set(`${pageName}.${fieldKey}`, cmsPath);
                fieldMap.set(`${sectionName}.${fieldKey}`, cmsPath);
                fieldMap.set(fieldKey, cmsPath);

                // Handle nested keys like "hero.title1"
                if (fieldKey.includes('.')) {
                    const parts = fieldKey.split('.');
                    fieldMap.set(`${pageName}.${parts.join('.')}`, cmsPath);
                }
            }
        }
    }

    return fieldMap;
}

// Extract t() calls from a file
function extractI18nKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys = new Set();

    const regex = /\bt\s*\(\s*["'`]([^"'`]+)["'`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Skip dynamic keys like ${pkg.key}
        if (!match[1].includes('${')) {
            keys.add(match[1]);
        }
    }

    return Array.from(keys).sort();
}

// Find the best CMS match for an i18n key
function findCmsMatch(i18nKey, fieldMap) {
    // Direct match
    if (fieldMap.has(i18nKey)) {
        return { found: true, ...fieldMap.get(i18nKey), matchType: 'direct' };
    }

    // Try without prefix (e.g., "about.title" -> "title")
    const parts = i18nKey.split('.');
    const lastPart = parts[parts.length - 1];

    // Try various combinations
    const attempts = [
        i18nKey,
        parts.slice(1).join('.'),
        lastPart,
        parts.slice(0, 2).join('.'),
    ];

    for (const attempt of attempts) {
        if (fieldMap.has(attempt)) {
            return { found: true, ...fieldMap.get(attempt), matchType: 'partial', originalKey: i18nKey };
        }
    }

    return { found: false, i18nKey };
}

// Main analysis
function analyzeMapping() {
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  📊 CMS CONVERSION - DETAILED FIELD MAPPING                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    const fieldMap = buildCmsFieldMap();
    console.log(`📦 Total CMS fields indexed: ${fieldMap.size}\n`);

    // Components to analyze with their expected CMS sections
    const componentsConfig = [
        { file: 'About.js', expectedSections: ['about/about'] },
        { file: 'Gallery.js', expectedSections: ['gallery/gallery'] },
        { file: 'Packages.js', expectedSections: ['packages/packages'] },
        { file: 'Contact.js', expectedSections: ['contact/contact', 'contact/faq'] },
        { file: 'FaqSection.js', expectedSections: ['contact/faq', 'contact/contact'] },
        { file: 'BookExperience.js', expectedSections: ['booking/booking', 'booking/form'] },
        { file: 'Header.js', expectedSections: ['navigation/header'] },
        { file: 'Footer.js', expectedSections: ['navigation/footer'] },
        { file: 'HomeCorner.js', expectedSections: ['home/corner', 'hero/corner'] },
        { file: 'CookieBanner.js', expectedSections: ['legal/cookieBanner'] },
        { file: 'CookieSettingsModal.js', expectedSections: ['legal/cookieSettings'] },
    ];

    const conversionGuide = [];

    for (const config of componentsConfig) {
        const filePath = path.join(FRONTEND_DIR, config.file);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${config.file} - FILE NOT FOUND\n`);
            continue;
        }

        const i18nKeys = extractI18nKeys(filePath);

        if (i18nKeys.length === 0) {
            continue;
        }

        console.log(`┌${'─'.repeat(67)}┐`);
        console.log(`│ 📁 ${config.file.padEnd(62)}│`);
        console.log(`│ Expected CMS sections: ${config.expectedSections.join(', ').padEnd(42)}│`);
        console.log(`├${'─'.repeat(67)}┤`);

        const found = [];
        const notFound = [];
        const mappings = [];

        for (const key of i18nKeys) {
            const match = findCmsMatch(key, fieldMap);
            if (match.found) {
                found.push(key);
                mappings.push({
                    i18nKey: key,
                    cmsSection: `${match.page}/${match.section}`,
                    cmsField: match.field
                });
            } else {
                notFound.push(key);
            }
        }

        console.log(`│ Total keys: ${i18nKeys.length}, Found: ${found.length}, Missing: ${notFound.length}`.padEnd(68) + '│');
        console.log(`└${'─'.repeat(67)}┘`);

        // Group by CMS section
        const bySection = {};
        for (const m of mappings) {
            if (!bySection[m.cmsSection]) bySection[m.cmsSection] = [];
            bySection[m.cmsSection].push(m);
        }

        console.log('\n   🔄 CONVERSION MAPPINGS:\n');

        for (const [section, maps] of Object.entries(bySection)) {
            console.log(`   📦 ${section}:`);
            for (const m of maps.slice(0, 8)) {
                console.log(`      t("${m.i18nKey}") → c("${m.cmsField}")`);
            }
            if (maps.length > 8) {
                console.log(`      ... and ${maps.length - 8} more`);
            }
        }

        if (notFound.length > 0) {
            console.log('\n   ❌ KEYS NOT IN CMS (need to be added to Supabase):');
            for (const key of notFound.slice(0, 10)) {
                // Suggest where to add it
                const parts = key.split('.');
                const suggestedPage = parts[0];
                const suggestedField = parts.slice(1).join('.') || parts[0];
                console.log(`      ${key}`);
                console.log(`         └─ Add to: content.${suggestedPage}.${suggestedPage}.${suggestedField}`);
            }
            if (notFound.length > 10) {
                console.log(`      ... and ${notFound.length - 10} more`);
            }
        }

        // Generate the conversion code suggestion
        const primarySection = Object.keys(bySection)[0]?.split('/')[1] || config.expectedSections[0].split('/')[1];

        console.log('\n   💻 CONVERSION CODE:\n');
        console.log(`   // Add import at top:`);
        console.log(`   import { useCmsSection } from "../context/CmsContext";`);
        console.log(`\n   // In component:`);
        console.log(`   const { c } = useCmsSection('${primarySection}');`);
        console.log(`\n   // Replace t() calls:`);
        for (const m of mappings.slice(0, 5)) {
            console.log(`   // t("${m.i18nKey}") → c("${m.cmsField}", "${m.i18nKey}")`);
        }

        console.log('\n' + '─'.repeat(70) + '\n');

        conversionGuide.push({
            component: config.file,
            totalKeys: i18nKeys.length,
            found: found.length,
            notFound: notFound.length,
            cmsSection: primarySection,
            mappings: mappings,
            missingKeys: notFound
        });
    }

    // Summary table
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  📈 CONVERSION PRIORITY & READINESS                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log('   Component               | Total | Found | Missing | CMS Section');
    console.log('   ' + '─'.repeat(64));

    conversionGuide.sort((a, b) => b.found / b.totalKeys - a.found / a.totalKeys);

    for (const c of conversionGuide) {
        const pct = Math.round((c.found / c.totalKeys) * 100);
        const status = pct >= 80 ? '✅' : pct >= 50 ? '🟡' : '🔴';
        console.log(`   ${status} ${c.component.padEnd(20)} | ${String(c.totalKeys).padStart(5)} | ${String(c.found).padStart(5)} | ${String(c.notFound).padStart(7)} | ${c.cmsSection}`);
    }

    // Save conversion guide
    const guidePath = path.join(__dirname, 'cms-conversion-guide.json');
    fs.writeFileSync(guidePath, JSON.stringify(conversionGuide, null, 2));
    console.log(`\n📄 Conversion guide saved to: ${guidePath}\n`);

    return conversionGuide;
}

analyzeMapping();
