/**
 * WEBSITE MEDIA ANALYZER
 * Analyzes the Cold Experience website source code to find all media files
 * used in each component/section. This creates the ground truth mapping.
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../../ColdExperience/frontend/src/components');
const pagesDir = path.join(__dirname, '../../ColdExperience/frontend/src/pages');

// Regex patterns to find media references
const patterns = {
    videoSrc: /videoSrc[=:]\s*["'`]([^"'`]+)["'`]/gi,
    src: /src[=:]\s*["'`](\/[^"'`]+\.(mp4|webm|jpg|jpeg|png|webp|gif|mov))["'`]/gi,
    backgroundImage: /backgroundImage[=:]\s*["'`]url\(([^)]+)\)["'`]/gi,
    imagePath: /["'`](\/images\/[^"'`]+|\/optimized_videos\/[^"'`]+|\/nya_filmer\/[^"'`]+)["'`]/gi,
};

function findMediaInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const media = new Set();

    // Find all media references
    for (const [name, pattern] of Object.entries(patterns)) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(content)) !== null) {
            const mediaPath = match[1] || match[0];
            if (mediaPath && !mediaPath.includes('${') && !mediaPath.startsWith('data:')) {
                media.add(mediaPath.replace(/['"]/g, ''));
            }
        }
    }

    return Array.from(media);
}

function analyzeDirectory(dir, results = {}) {
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            analyzeDirectory(filePath, results);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
            const media = findMediaInFile(filePath);
            if (media.length > 0) {
                const componentName = path.basename(file, path.extname(file));
                results[componentName] = {
                    file: filePath.replace(path.join(__dirname, '../..'), ''),
                    media: media
                };
            }
        }
    }

    return results;
}

console.log('='.repeat(70));
console.log('COLD EXPERIENCE WEBSITE - MEDIA ANALYSIS');
console.log('='.repeat(70));
console.log('');

// Analyze components
console.log('📂 ANALYZING COMPONENTS...');
console.log('-'.repeat(70));
const componentMedia = analyzeDirectory(componentsDir);

for (const [component, data] of Object.entries(componentMedia).sort()) {
    console.log(`\n🔹 ${component}`);
    console.log(`   File: ${data.file}`);
    console.log(`   Media (${data.media.length}):`);
    data.media.forEach(m => console.log(`      - ${m}`));
}

// Create summary mapping for CMS
console.log('\n');
console.log('='.repeat(70));
console.log('CMS SECTION MAPPING (for App.tsx MEDIA_SECTION_MAPPING)');
console.log('='.repeat(70));
console.log('');

const sectionMapping = {
    'Hero': { pageId: 'hero', sectionId: 'hero', media: componentMedia['Hero']?.media || [] },
    'Features': { pageId: 'features', sectionId: 'features', media: componentMedia['Features']?.media || [] },
    'Experiences': { pageId: 'experiences', sectionId: 'experiences', media: componentMedia['Experiences']?.media || [] },
    'Testimonials': { pageId: 'testimonials', sectionId: 'testimonials', media: componentMedia['Testimonials']?.media || [] },
    'OwnerSection': { pageId: 'about', sectionId: 'ownerSection', media: componentMedia['OwnerSection']?.media || [] },
    'Gallery': { pageId: 'gallery', sectionId: 'gallery', media: componentMedia['Gallery']?.media || [] },
    'About': { pageId: 'about', sectionId: 'about', media: componentMedia['About']?.media || [] },
    'Contact': { pageId: 'contact', sectionId: 'contact', media: componentMedia['Contact']?.media || [] },
    'FaqSection': { pageId: 'faq', sectionId: 'questions', media: componentMedia['FaqSection']?.media || [] },
    'Packages': { pageId: 'packages', sectionId: 'packages', media: componentMedia['Packages']?.media || [] },
    'FeaturedVideo': { pageId: 'hero', sectionId: 'featuredVideo', media: componentMedia['FeaturedVideo']?.media || [] },
};

for (const [section, data] of Object.entries(sectionMapping)) {
    if (data.media.length > 0) {
        console.log(`${section}:`);
        console.log(`  page_id: "${data.pageId}", section_id: "${data.sectionId}"`);
        console.log(`  Media files (${data.media.length}):`);
        data.media.forEach(m => console.log(`    - ${m}`));
        console.log('');
    }
}

// Output as JSON for further processing
const outputPath = path.join(__dirname, 'website-media-inventory.json');
fs.writeFileSync(outputPath, JSON.stringify({
    analyzed: new Date().toISOString(),
    components: componentMedia,
    sectionMapping: sectionMapping
}, null, 2));

console.log('');
console.log('='.repeat(70));
console.log(`✅ Full inventory saved to: ${outputPath}`);
console.log('='.repeat(70));
