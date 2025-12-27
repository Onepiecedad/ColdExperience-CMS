/**
 * Extract Adventure Subpage Content to CMS
 * 
 * This script extracts the hardcoded content from adventure subpage JS files
 * and creates structured CMS content that can be edited in the dashboard.
 * 
 * Source files:
 * - Snowmobile-Safari.js
 * - Northern-Lights.js
 * - Husky-Ride.js
 * - Accommodation.js
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = '/Users/onepiecedad/Downloads/Coldexperience CMS/ColdExperience/frontend/src/pages/en';
const OUTPUT_FILE = '/Users/onepiecedad/Downloads/Coldexperience CMS/cold-experience-dashboard/adventure-subpages-content.json';

const ADVENTURE_FILES = [
    { file: 'Snowmobile-Safari.js', key: 'snowmobileSafari' },
    { file: 'Northern-Lights.js', key: 'northernLights' },
    { file: 'Husky-Ride.js', key: 'huskyRide' },
    { file: 'Accommodation.js', key: 'accommodation' },
];

function extractDefaultContent(fileContent) {
    // Find the defaultContent object using regex
    const match = fileContent.match(/const defaultContent = \{([\s\S]*?)\};\s*\nexport default/);

    if (!match) {
        console.log('Could not find defaultContent object');
        return null;
    }

    try {
        // Try to parse the object (this is tricky because it's JavaScript, not JSON)
        // We'll extract specific sections instead
        const content = {};

        // Extract meta section
        const metaMatch = fileContent.match(/meta:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
        if (metaMatch) {
            content.meta = extractObject(metaMatch[1]);
        }

        // Extract hero section
        const heroMatch = fileContent.match(/hero:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
        if (heroMatch) {
            content.hero = extractObject(heroMatch[1]);
        }

        // Extract intro section
        const introMatch = fileContent.match(/intro:\s*\{([^}]+(?:\[[^\]]*\][^}]*)*)\}/);
        if (introMatch) {
            content.intro = extractObject(introMatch[1]);
        }

        // Extract closing section
        const closingMatch = fileContent.match(/closing:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
        if (closingMatch) {
            content.closing = extractObject(closingMatch[1]);
        }

        // Extract media section
        const mediaMatch = fileContent.match(/media:\s*\{([^}]+)\}/);
        if (mediaMatch) {
            content.media = extractObject(mediaMatch[1]);
        }

        return content;
    } catch (err) {
        console.error('Error parsing content:', err);
        return null;
    }
}

function extractObject(str) {
    const result = {};

    // Extract simple string properties
    const stringProps = str.matchAll(/(\w+):\s*["']([^"']+)["']/g);
    for (const match of stringProps) {
        result[match[1]] = match[2];
    }

    // Extract array properties (like paragraphs)
    const arrayProps = str.matchAll(/(\w+):\s*\[([\s\S]*?)\]/g);
    for (const match of arrayProps) {
        const items = match[2].matchAll(/["']([^"']+)["']/g);
        result[match[1]] = [...items].map(m => m[1]);
    }

    // Extract nested object properties (like buttons)
    const nestedProps = str.matchAll(/(\w+):\s*\{([^}]+)\}/g);
    for (const match of nestedProps) {
        result[match[1]] = extractObject(match[2]);
    }

    return result;
}

function extractSimpleValues(fileContent, key) {
    // A simpler approach: just extract the readable text content
    const content = {
        key,
        texts: {}
    };

    // Extract hero title
    const heroTitleMatch = fileContent.match(/hero:\s*\{[^}]*title:\s*["']([^"']+)["']/);
    if (heroTitleMatch) content.texts.heroTitle = heroTitleMatch[1];

    // Extract hero description
    const heroDescMatch = fileContent.match(/hero:\s*\{[^}]*description:\s*["']([^"']+)["']/s);
    if (heroDescMatch) content.texts.heroDescription = heroDescMatch[1];

    // Extract intro heading
    const introHeadingMatch = fileContent.match(/intro:\s*\{[^}]*heading:\s*["']([^"']+)["']/);
    if (introHeadingMatch) content.texts.introHeading = introHeadingMatch[1];

    // Extract intro paragraphs
    const introParagraphsMatch = fileContent.match(/intro:\s*\{[^}]*paragraphs:\s*\[([\s\S]*?)\]/);
    if (introParagraphsMatch) {
        const paragraphs = [...introParagraphsMatch[1].matchAll(/["']([^"']+)["']/g)].map(m => m[1]);
        content.texts.introParagraphs = paragraphs;
    }

    // Extract closing title
    const closingTitleMatch = fileContent.match(/closing:\s*\{[^}]*title:\s*["']([^"']+)["']/);
    if (closingTitleMatch) content.texts.closingTitle = closingTitleMatch[1];

    // Extract closing description
    const closingDescMatch = fileContent.match(/closing:\s*\{[^}]*description:\s*["']([^"']+)["']/s);
    if (closingDescMatch) content.texts.closingDescription = closingDescMatch[1];

    // Extract primary button label
    const primaryBtnMatch = fileContent.match(/primaryButton:\s*\{[^}]*label:\s*["']([^"']+)["']/);
    if (primaryBtnMatch) content.texts.primaryButtonLabel = primaryBtnMatch[1];

    // Extract secondary button label
    const secondaryBtnMatch = fileContent.match(/secondaryButton:\s*\{[^}]*label:\s*["']([^"']+)["']/);
    if (secondaryBtnMatch) content.texts.secondaryButtonLabel = secondaryBtnMatch[1];

    // Extract video source
    const videoMatch = fileContent.match(/videoSrc:\s*["']([^"']+)["']/);
    if (videoMatch) content.media = { videoSrc: videoMatch[1] };

    // Extract poster
    const posterMatch = fileContent.match(/poster:\s*["']([^"']+)["']/);
    if (posterMatch) {
        content.media = content.media || {};
        content.media.poster = posterMatch[1];
    }

    // Extract introPoster
    const introPosterMatch = fileContent.match(/introPoster:\s*["']([^"']+)["']/);
    if (introPosterMatch) {
        content.media = content.media || {};
        content.media.introPoster = introPosterMatch[1];
    }

    // Extract features (the icon-title-description cards)
    const featuresMatch = fileContent.match(/features:\s*\[([\s\S]*?)\]/);
    if (featuresMatch) {
        const features = [];
        const featureBlocks = featuresMatch[1].matchAll(/\{([^}]+)\}/g);
        for (const block of featureBlocks) {
            const feature = {};
            const titleMatch = block[1].match(/title:\s*["']([^"']+)["']/);
            const descMatch = block[1].match(/description:\s*["']([^"']+)["']/);
            const iconMatch = block[1].match(/icon:\s*["']([^"']+)["']/);
            if (titleMatch) feature.title = titleMatch[1];
            if (descMatch) feature.description = descMatch[1];
            if (iconMatch) feature.icon = iconMatch[1];
            if (Object.keys(feature).length > 0) features.push(feature);
        }
        content.features = features;
    }

    // Extract sections (like "What the safari includes")
    const sectionsMatch = fileContent.match(/sections:\s*\[([\s\S]*?)\],\s*\n\s*dayProgram/);
    if (sectionsMatch) {
        const sections = [];
        const sectionBlocks = sectionsMatch[1].matchAll(/\{\s*id:\s*["']([^"']+)["'][^}]*title:\s*["']([^"']+)["'][^}]*items:\s*\[([\s\S]*?)\]/g);
        for (const block of sectionBlocks) {
            const items = [...block[3].matchAll(/["']([^"']+)["']/g)].map(m => m[1]);
            sections.push({
                id: block[1],
                title: block[2],
                items
            });
        }
        content.sections = sections;
    }

    // Extract day program
    const dayProgramMatch = fileContent.match(/dayProgram:\s*\{([^}]*title:\s*["']([^"']+)["'][^}]*steps:\s*\[([\s\S]*?)\])/);
    if (dayProgramMatch) {
        const steps = [];
        const stepBlocks = dayProgramMatch[3].matchAll(/\{([^}]+)\}/g);
        for (const block of stepBlocks) {
            const step = {};
            const titleMatch = block[1].match(/title:\s*["']([^"']+)["']/);
            const descMatch = block[1].match(/description:\s*["']([^"']+)["']/);
            if (titleMatch) step.title = titleMatch[1];
            if (descMatch) step.description = descMatch[1];
            if (Object.keys(step).length > 0) steps.push(step);
        }
        content.dayProgram = {
            title: dayProgramMatch[2],
            steps
        };
    }

    return content;
}

async function main() {
    console.log('📖 Extracting adventure subpage content...\n');

    const allContent = {};

    for (const { file, key } of ADVENTURE_FILES) {
        const filePath = path.join(PAGES_DIR, file);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${file}`);
            continue;
        }

        console.log(`📄 Processing: ${file}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const content = extractSimpleValues(fileContent, key);
        allContent[key] = content;

        console.log(`   ✅ Extracted: ${Object.keys(content.texts || {}).length} text fields`);
        console.log(`   ✅ Features: ${content.features?.length || 0}`);
        console.log(`   ✅ Sections: ${content.sections?.length || 0}`);
    }

    // Write output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allContent, null, 2));
    console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);

    // Print summary
    console.log('\n📊 Content Summary:\n');
    for (const [key, content] of Object.entries(allContent)) {
        console.log(`\n🏔️  ${key.toUpperCase()}`);
        console.log(`   Hero: "${content.texts?.heroTitle || 'N/A'}"`);
        console.log(`   Features: ${content.features?.length || 0}`);
        console.log(`   Day program steps: ${content.dayProgram?.steps?.length || 0}`);
        if (content.media) {
            console.log(`   Media: ${content.media.videoSrc || 'None'}`);
        }
    }

    // Generate CMS-ready structure
    console.log('\n\n📝 CMS-Ready Structure (for integration):');
    console.log('='.repeat(50));

    const cmsStructure = {};
    for (const [key, content] of Object.entries(allContent)) {
        cmsStructure[key] = {
            hero: {
                title: { en: content.texts?.heroTitle || '' },
                description: { en: content.texts?.heroDescription || '' },
                primaryButton: { en: content.texts?.primaryButtonLabel || '' },
                secondaryButton: { en: content.texts?.secondaryButtonLabel || '' },
            },
            intro: {
                heading: { en: content.texts?.introHeading || '' },
                paragraphs: content.texts?.introParagraphs?.map(p => ({ en: p })) || [],
            },
            closing: {
                title: { en: content.texts?.closingTitle || '' },
                description: { en: content.texts?.closingDescription || '' },
            },
            features: content.features?.map(f => ({
                title: { en: f.title },
                description: { en: f.description },
                icon: f.icon,
            })) || [],
            dayProgram: {
                title: { en: content.dayProgram?.title || '' },
                steps: content.dayProgram?.steps?.map(s => ({
                    title: { en: s.title },
                    description: { en: s.description },
                })) || [],
            },
            media: content.media || {},
        };
    }

    // Save CMS structure
    const cmsOutputFile = OUTPUT_FILE.replace('.json', '-cms.json');
    fs.writeFileSync(cmsOutputFile, JSON.stringify(cmsStructure, null, 2));
    console.log(`\n💾 CMS structure saved to: ${cmsOutputFile}`);
}

main().catch(console.error);
