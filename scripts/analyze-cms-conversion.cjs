/**
 * CMS Conversion Analysis Script
 * 
 * This script analyzes which i18n keys are used in each component
 * and maps them to the corresponding CMS fields in Supabase.
 * 
 * Run: node scripts/analyze-cms-conversion.cjs
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../../ColdExperience/frontend/src/components');
const CMS_DATA_PATH = path.join(__dirname, '../cms-content-data.json');

// Components that need CMS conversion
const COMPONENTS_TO_ANALYZE = [
    'About.js',
    'Gallery.js',
    'Packages.js',
    'Contact.js',
    'FaqSection.js',
    'BookExperience.js',
    'Header.js',
    'Footer.js',
    'HomeCorner.js',
    'CookieBanner.js',
    'CookieSettingsModal.js'
];

// Components already using CMS
const CMS_ENABLED_COMPONENTS = [
    'Hero.js',
    'Features.js',
    'FeaturedVideo.js',
    'Experiences.js',
    'OwnerSection.js',
    'InstagramFeed.js',
    'Testimonials.js'
];

// Extract t() calls from a file
function extractI18nKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys = new Set();

    // Match t("key"), t('key'), t(`key`)
    const regex = /\bt\s*\(\s*["'`]([^"'`]+)["'`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
    }

    return Array.from(keys).sort();
}

// Check if component uses useCmsSection
function usesCms(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('useCmsSection');
}

// Load CMS data and check if keys exist
function loadCmsData() {
    try {
        const data = JSON.parse(fs.readFileSync(CMS_DATA_PATH, 'utf-8'));
        return data;
    } catch (e) {
        console.error('Could not load CMS data:', e.message);
        return null;
    }
}

// Find CMS field for an i18n key
function findCmsField(cmsData, i18nKey) {
    if (!cmsData) return { found: false };

    // Convert i18n key to possible CMS paths
    // e.g., "about.title" could be in about/about.title or hero/about.title
    const parts = i18nKey.split('.');
    const page = parts[0];
    const fieldKey = parts.slice(1).join('.');

    // Check various possible locations
    const possiblePaths = [
        { page, section: page, key: fieldKey },
        { page, section: parts[1], key: parts.slice(2).join('.') },
        { page: 'hero', section: page, key: fieldKey },
    ];

    for (const p of possiblePaths) {
        if (cmsData[p.page]?.[p.section]?.[p.key || i18nKey]) {
            return {
                found: true,
                cmsPage: p.page,
                cmsSection: p.section,
                cmsKey: p.key || i18nKey
            };
        }
        // Try full key in section
        if (cmsData[p.page]?.[p.section]?.[i18nKey]) {
            return {
                found: true,
                cmsPage: p.page,
                cmsSection: p.section,
                cmsKey: i18nKey
            };
        }
    }

    // Deep search
    for (const [pageName, pageData] of Object.entries(cmsData)) {
        if (typeof pageData !== 'object') continue;
        for (const [sectionName, sectionData] of Object.entries(pageData)) {
            if (typeof sectionData !== 'object') continue;
            // Check if the full i18n key exists
            if (sectionData[i18nKey]) {
                return {
                    found: true,
                    cmsPage: pageName,
                    cmsSection: sectionName,
                    cmsKey: i18nKey
                };
            }
            // Check if the field part exists
            if (sectionData[fieldKey]) {
                return {
                    found: true,
                    cmsPage: pageName,
                    cmsSection: sectionName,
                    cmsKey: fieldKey
                };
            }
        }
    }

    return { found: false };
}

// Group keys by CMS section
function groupKeysBySection(keys, cmsData) {
    const groups = {};
    const notFound = [];

    for (const key of keys) {
        const result = findCmsField(cmsData, key);
        if (result.found) {
            const groupKey = `${result.cmsPage}/${result.cmsSection}`;
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push({ i18nKey: key, cmsKey: result.cmsKey });
        } else {
            notFound.push(key);
        }
    }

    return { groups, notFound };
}

// Main analysis
function analyzeComponents() {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  📊 CMS CONVERSION ANALYSIS');
    console.log('  Analyzing which i18n keys need to be converted to CMS');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    const cmsData = loadCmsData();

    let totalKeys = 0;
    let totalFound = 0;
    let totalNotFound = 0;

    const report = {
        components: [],
        summary: {}
    };

    console.log('✅ COMPONENTS ALREADY USING CMS:\n');
    for (const comp of CMS_ENABLED_COMPONENTS) {
        const filePath = path.join(FRONTEND_DIR, comp);
        if (fs.existsSync(filePath)) {
            console.log(`   ✓ ${comp}`);
        }
    }
    console.log('\n');

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  ❌ COMPONENTS NEEDING CMS CONVERSION');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    for (const comp of COMPONENTS_TO_ANALYZE) {
        const filePath = path.join(FRONTEND_DIR, comp);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${comp} - FILE NOT FOUND\n`);
            continue;
        }

        const hasCms = usesCms(filePath);
        const i18nKeys = extractI18nKeys(filePath);

        if (hasCms && i18nKeys.length === 0) {
            console.log(`✅ ${comp} - Already fully converted to CMS\n`);
            continue;
        }

        const { groups, notFound } = groupKeysBySection(i18nKeys, cmsData);

        totalKeys += i18nKeys.length;
        totalFound += i18nKeys.length - notFound.length;
        totalNotFound += notFound.length;

        console.log(`┌─────────────────────────────────────────────────────────────────┐`);
        console.log(`│ 📁 ${comp.padEnd(58)}│`);
        console.log(`├─────────────────────────────────────────────────────────────────┤`);
        console.log(`│ Total i18n keys: ${String(i18nKeys.length).padEnd(45)}│`);
        console.log(`│ Found in CMS: ${String(i18nKeys.length - notFound.length).padEnd(48)}│`);
        console.log(`│ Missing from CMS: ${String(notFound.length).padEnd(44)}│`);
        console.log(`└─────────────────────────────────────────────────────────────────┘`);

        // Show CMS sections needed
        console.log(`\n   📦 CMS Sections to use:\n`);
        for (const [section, keys] of Object.entries(groups)) {
            console.log(`      → ${section} (${keys.length} keys)`);
        }

        // Show keys per section for conversion reference
        console.log(`\n   🔑 Keys per section:\n`);
        for (const [section, keys] of Object.entries(groups)) {
            console.log(`      ${section}:`);
            for (const { i18nKey, cmsKey } of keys.slice(0, 5)) {
                const arrow = i18nKey !== cmsKey ? ` → ${cmsKey}` : '';
                console.log(`         t("${i18nKey}")${arrow}`);
            }
            if (keys.length > 5) {
                console.log(`         ... and ${keys.length - 5} more`);
            }
        }

        // Show missing keys
        if (notFound.length > 0) {
            console.log(`\n   ⚠️  Keys NOT in CMS (need to be added):\n`);
            for (const key of notFound.slice(0, 10)) {
                console.log(`         ❌ t("${key}")`);
            }
            if (notFound.length > 10) {
                console.log(`         ... and ${notFound.length - 10} more`);
            }
        }

        // Suggested useCmsSection call
        const sections = Object.keys(groups);
        if (sections.length > 0) {
            const primarySection = sections[0].split('/')[1];
            console.log(`\n   💡 Suggested implementation:\n`);
            console.log(`      const { c } = useCmsSection('${primarySection}');`);
            console.log(`      // Replace t("key") with c("key", "key")`);
        }

        console.log('\n');

        report.components.push({
            name: comp,
            totalKeys: i18nKeys.length,
            foundInCms: i18nKeys.length - notFound.length,
            missing: notFound.length,
            sections: Object.keys(groups),
            notFoundKeys: notFound
        });
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  📈 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    console.log(`   Total i18n keys to convert: ${totalKeys}`);
    console.log(`   ✅ Already in CMS:          ${totalFound} (${Math.round(totalFound / totalKeys * 100)}%)`);
    console.log(`   ❌ Missing from CMS:        ${totalNotFound} (${Math.round(totalNotFound / totalKeys * 100)}%)`);

    console.log(`\n   📋 Priority order for conversion:\n`);

    const sorted = report.components
        .filter(c => c.totalKeys > 0)
        .sort((a, b) => {
            // Prioritize components with most keys already in CMS
            const aScore = (a.foundInCms / a.totalKeys) * 100;
            const bScore = (b.foundInCms / b.totalKeys) * 100;
            return bScore - aScore;
        });

    sorted.forEach((comp, i) => {
        const coverage = Math.round((comp.foundInCms / comp.totalKeys) * 100);
        const bar = '█'.repeat(Math.round(coverage / 10)) + '░'.repeat(10 - Math.round(coverage / 10));
        console.log(`   ${i + 1}. ${comp.name.padEnd(25)} [${bar}] ${coverage}% ready`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════════\n');

    // Save detailed report
    const reportPath = path.join(__dirname, 'cms-conversion-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

    return report;
}

// Run the analysis
analyzeComponents();
