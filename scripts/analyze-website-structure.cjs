/**
 * Website Structure Analyzer
 * Analyzes the actual React components to understand what content each section needs
 */

const fs = require('fs');
const path = require('path');

const componentsDir = '/Users/onepiecedad/Downloads/Coldexperience CMS/ColdExperience/frontend/src/components';
const pagesDir = '/Users/onepiecedad/Downloads/Coldexperience CMS/ColdExperience/frontend/src/pages';

// Patterns to detect content types
const patterns = {
    youtubeUrl: /youtube\.com\/embed|YOUTUBE.*URL/gi,
    useTranslation: /useTranslation|t\(["']([^"']+)["']\)/g,
    useCmsContent: /useCmsContent|getCmsContent/g,
    imageTag: /<img[^>]+src=["']([^"']+)["']/gi,
    videoTag: /<video[^>]+src=["']([^"']+)["']/gi,
    localVideo: /\.(mp4|webm|mov)/gi,
    hardcodedUrl: /https?:\/\/[^\s"']+/gi,
};

// Home page components in order
const homePageSections = [
    { name: 'Hero', file: 'Hero.js' },
    { name: 'FeaturedVideo', file: 'FeaturedVideo.js' },
    { name: 'Features', file: 'Features.js' },
    { name: 'InstagramFeed', file: 'InstagramFeed.js' },
    { name: 'Experiences', file: 'Experiences.js' },
    { name: 'OwnerSection', file: 'OwnerSection.js' },
];

function analyzeComponent(filePath, componentName) {
    if (!fs.existsSync(filePath)) {
        return { name: componentName, error: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const analysis = {
        name: componentName,
        file: path.basename(filePath),
        contentSources: {
            usesTranslation: /useTranslation/.test(content),
            usesCmsContext: /useCmsContent|getCmsContent|CmsContext/.test(content),
        },
        mediaTypes: {
            hasYouTubeEmbed: /youtube\.com\/embed/.test(content),
            hasLocalVideo: /\.(mp4|webm|mov)["']/.test(content),
            hasImages: /<img/.test(content),
            hasBackgroundVideo: /video.*background|backgroundVideo/i.test(content),
        },
        translationKeys: [],
        hardcodedUrls: [],
        issues: [],
    };

    // Extract translation keys
    const tMatches = content.matchAll(/t\(["']([^"']+)["']\)/g);
    for (const match of tMatches) {
        if (!analysis.translationKeys.includes(match[1])) {
            analysis.translationKeys.push(match[1]);
        }
    }

    // Extract hardcoded URLs
    const urlMatches = content.matchAll(/["'](https?:\/\/[^"'\s]+)["']/g);
    for (const match of urlMatches) {
        const url = match[1];
        if (!url.includes('localhost') && !analysis.hardcodedUrls.includes(url)) {
            analysis.hardcodedUrls.push(url);
        }
    }

    // Identify issues
    if (analysis.mediaTypes.hasYouTubeEmbed && !analysis.contentSources.usesCmsContext) {
        analysis.issues.push('YouTube URL is hardcoded, not from CMS');
    }
    if (analysis.contentSources.usesTranslation && !analysis.contentSources.usesCmsContext) {
        analysis.issues.push('Uses i18n translations, not CMS content');
    }

    return analysis;
}

async function analyzeAllSections() {
    console.log('\n' + '═'.repeat(80));
    console.log('  📊 WEBSITE STRUCTURE ANALYSIS');
    console.log('  Analyzing what each component actually needs for CMS');
    console.log('═'.repeat(80) + '\n');

    // Analyze Home Page
    console.log('┌' + '─'.repeat(78) + '┐');
    console.log('│  📄 HOME PAGE (/)' + ' '.repeat(60) + '│');
    console.log('└' + '─'.repeat(78) + '┘\n');

    const homeAnalysis = [];

    for (let i = 0; i < homePageSections.length; i++) {
        const section = homePageSections[i];
        const filePath = path.join(componentsDir, section.file);
        const analysis = analyzeComponent(filePath, section.name);
        homeAnalysis.push(analysis);

        console.log(`\n${i + 1}. ${section.name}`);
        console.log('─'.repeat(50));

        // Content Source
        const source = analysis.contentSources.usesCmsContext ? 'CMS' :
            analysis.contentSources.usesTranslation ? 'i18n translations' :
                'Unknown';
        console.log(`   Content Source: ${source}`);

        // Media types
        const mediaTypes = [];
        if (analysis.mediaTypes.hasYouTubeEmbed) mediaTypes.push('YouTube');
        if (analysis.mediaTypes.hasLocalVideo) mediaTypes.push('Local Video');
        if (analysis.mediaTypes.hasImages) mediaTypes.push('Images');
        if (analysis.mediaTypes.hasBackgroundVideo) mediaTypes.push('Background Video');
        console.log(`   Media Types: ${mediaTypes.length > 0 ? mediaTypes.join(', ') : 'None'}`);

        // Translation keys (sample)
        if (analysis.translationKeys.length > 0) {
            console.log(`   Translation Keys (${analysis.translationKeys.length}):`);
            analysis.translationKeys.slice(0, 5).forEach(key => {
                console.log(`      • ${key}`);
            });
            if (analysis.translationKeys.length > 5) {
                console.log(`      ... and ${analysis.translationKeys.length - 5} more`);
            }
        }

        // Hardcoded URLs
        if (analysis.hardcodedUrls.length > 0) {
            console.log(`   Hardcoded URLs:`);
            analysis.hardcodedUrls.slice(0, 3).forEach(url => {
                console.log(`      ⚠️  ${url.substring(0, 60)}...`);
            });
        }

        // Issues
        if (analysis.issues.length > 0) {
            console.log(`   🔴 Issues:`);
            analysis.issues.forEach(issue => {
                console.log(`      ❌ ${issue}`);
            });
        }
    }

    // Summary
    console.log('\n\n' + '═'.repeat(80));
    console.log('  📋 SUMMARY & RECOMMENDATIONS');
    console.log('═'.repeat(80) + '\n');

    const usingCms = homeAnalysis.filter(a => a.contentSources.usesCmsContext);
    const usingI18n = homeAnalysis.filter(a => !a.contentSources.usesCmsContext && a.contentSources.usesTranslation);
    const withIssues = homeAnalysis.filter(a => a.issues.length > 0);

    console.log(`   Components using CMS:           ${usingCms.length}/${homeAnalysis.length}`);
    console.log(`   Components using i18n only:     ${usingI18n.length}/${homeAnalysis.length}`);
    console.log(`   Components with issues:         ${withIssues.length}/${homeAnalysis.length}`);

    if (usingI18n.length > 0) {
        console.log('\n   ⚠️  Components that need CMS integration:');
        usingI18n.forEach(a => {
            console.log(`      • ${a.name} - currently uses i18n translations`);
        });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('  🔧 WHAT NEEDS TO BE DONE:');
    console.log('═'.repeat(80));
    console.log(`
   1. WEBSITE COMPONENTS need to be updated to use CMS (useCmsContent hook)
      instead of hardcoded i18n translations
   
   2. CMS DATABASE needs to store the correct field types for each section:
      - FeaturedVideo: needs youtubeUrl field, not local videos
      - Hero: needs proper media fields
      - etc.
   
   3. CMS DASHBOARD needs to show the correct editor for each field type:
      - URL input for YouTube links
      - Media picker for images/videos
      - Text editor for text content
`);
    console.log('═'.repeat(80) + '\n');

    // Return structured data for further processing
    return { homePage: homeAnalysis };
}

analyzeAllSections().catch(console.error);
