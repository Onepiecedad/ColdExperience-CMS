const fs = require('fs');

// Load the local CMS content data
const cmsData = JSON.parse(fs.readFileSync('./cms-content-data.json', 'utf8'));

// Also check for adventure content
let adventureData = {};
try {
    adventureData = JSON.parse(fs.readFileSync('./adventure-subpages-content-cms.json', 'utf8'));
} catch (e) {
    console.log('No adventure-subpages-content-cms.json found');
}

console.log('\n=== CMS CONTENT STRUCTURE ANALYSIS ===\n');

// Collect all page/section combinations
const sections = {};
const content = cmsData.content;

Object.entries(content).forEach(([pageId, pageData]) => {
    Object.entries(pageData).forEach(([sectionId, sectionData]) => {
        const key = `${pageId}/${sectionId}`;
        sections[key] = Object.keys(sectionData);
    });
});

console.log('All page/section combinations in cms-content-data.json:');
console.log('--------------------------------------------------------');
Object.entries(sections).sort().forEach(([key, fields]) => {
    console.log(`${key.padEnd(45)} ${fields.length} fields`);
});

// Current CONTENT_MAPPING from App.tsx (UPDATED)
const CONTENT_MAPPING = {
    'home:hero': { cmsPage: 'hero', cmsSection: 'hero' },
    'home:featured-video': { cmsPage: 'hero', cmsSection: 'featuredVideo' },
    'home:why-choose-us': { cmsPage: 'features', cmsSection: 'features' },
    'home:adventures': { cmsPage: 'experiences', cmsSection: 'experiences' },
    'home:hosts': { cmsPage: 'about', cmsSection: 'ownerSection' },
    'home:testimonials': { cmsPage: 'testimonials', cmsSection: 'testimonials' },
    'home:snowmobile': { cmsPage: 'detailPages', cmsSection: 'pages' },
    'home:northern-lights': { cmsPage: 'detailPages', cmsSection: 'pages' },
    'home:dog-sledding': { cmsPage: 'detailPages', cmsSection: 'pages' },
    'home:lodging': { cmsPage: 'detailPages', cmsSection: 'pages' },
    'about:hero': { cmsPage: 'about', cmsSection: 'about' },
    'about:story': { cmsPage: 'about', cmsSection: 'why' },
    'about:hosts': { cmsPage: 'about', cmsSection: 'ownerSection' },
    'about:values': { cmsPage: 'about', cmsSection: 'why' },
    'packages:hero': { cmsPage: 'packages', cmsSection: 'packages' },
    'packages:packages': { cmsPage: 'packages', cmsSection: 'packages' },
    'gallery:hero': { cmsPage: 'gallery', cmsSection: 'gallery' },
    'gallery:grid': { cmsPage: 'gallery', cmsSection: 'gallery' },
    'faq:hero': { cmsPage: 'contact', cmsSection: 'faq' },
    'faq:questions': { cmsPage: 'contact', cmsSection: 'faq' },
    'contact:hero': { cmsPage: 'contact', cmsSection: 'contact' },
    'contact:form': { cmsPage: 'contact', cmsSection: 'contact' },
    'contact:info': { cmsPage: 'contact', cmsSection: 'contact' },
    'booking:booking': { cmsPage: 'booking', cmsSection: 'booking' },
    'booking:book': { cmsPage: 'booking', cmsSection: 'book' },
    'booking:form': { cmsPage: 'booking', cmsSection: 'form' },
    'navigation:header': { cmsPage: 'navigation', cmsSection: 'header' },
    'navigation:footer': { cmsPage: 'navigation', cmsSection: 'footer' },
    'navigation:common': { cmsPage: 'navigation', cmsSection: 'common' },
    'navigation:shared': { cmsPage: 'navigation', cmsSection: 'shared' },
    'legal:policies': { cmsPage: 'legal', cmsSection: 'policies' },
    'legal:cookieBanner': { cmsPage: 'legal', cmsSection: 'cookieBanner' },
    'legal:cookieSettings': { cmsPage: 'legal', cmsSection: 'cookieSettings' },
};

// Which supabase sections are covered?
const coveredSections = new Set();
Object.values(CONTENT_MAPPING).forEach(m => {
    coveredSections.add(`${m.cmsPage}/${m.cmsSection}`);
});

console.log('\n\n=== COVERAGE ANALYSIS ===\n');

const covered = [];
const notCovered = [];

Object.entries(sections).forEach(([key, fields]) => {
    if (coveredSections.has(key)) {
        covered.push({ key, count: fields.length, fields });
    } else {
        notCovered.push({ key, count: fields.length, fields });
    }
});

console.log('✅ COVERED BY DASHBOARD (' + covered.length + ' sections):');
covered.forEach(({ key, count }) => {
    console.log(`   ${key.padEnd(45)} ${count} fields`);
});

console.log('\n❌ NOT IN DASHBOARD (' + notCovered.length + ' sections - NEEDS MAPPING):');
notCovered.forEach(({ key, count, fields }) => {
    console.log(`\n   ${key} (${count} fields)`);
    fields.forEach(f => console.log(`      - ${f}`));
});

// Calculate coverage
const coveredFields = covered.reduce((sum, c) => sum + c.count, 0);
let totalFields = Object.values(sections).reduce((sum, fields) => sum + fields.length, 0);

const coverage = ((coveredFields / totalFields) * 100).toFixed(1);

console.log(`\n\n📊 FIELD COVERAGE: ${coveredFields}/${totalFields} fields (${coverage}%)`);
console.log(`📊 SECTION COVERAGE: ${covered.length}/${Object.keys(sections).length} sections`);

// Generate suggested mappings for missing sections
if (notCovered.length > 0) {
    console.log('\n\n=== SUGGESTED NEW MAPPINGS ===\n');
    console.log('Add these to CONTENT_MAPPING in App.tsx:\n');

    notCovered.forEach(({ key }) => {
        const [pageId, sectionId] = key.split('/');
        // Suggest a UI mapping
        const uiPage = pageId === 'navigation' ? 'navigation' :
            pageId === 'legal' ? 'legal' :
                pageId === 'booking' ? 'booking' : pageId;
        const uiSection = sectionId;
        console.log(`'${uiPage}:${uiSection}': { cmsPage: '${pageId}', cmsSection: '${sectionId}' },`);
    });
}
