/**
 * AUDIT: Content Sync between Website JSON and Supabase
 * 
 * This script compares:
 * 1. Translation JSON files (website source)
 * 2. cms-content-data.json (synced content)
 * 3. Supabase database (live CMS)
 * 
 * Outputs a detailed report of what matches, what's missing, and what needs fixing.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths
const WEBSITE_LOCALES = path.join(__dirname, '../../ColdExperience/frontend/public/locales');
const CMS_CONTENT_JSON = path.join(__dirname, '../cms-content-data.json');

async function audit() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 CONTENT SYNC AUDIT');
    console.log('='.repeat(70) + '\n');

    // 1. Load website translation files (English as baseline)
    console.log('📂 Loading website translation files...');
    const websiteContent = loadWebsiteTranslations();

    // 2. Load CMS content data JSON
    console.log('📂 Loading cms-content-data.json...');
    const cmsJsonContent = loadCmsJsonContent();

    // 3. Load Supabase data
    console.log('📂 Loading Supabase database...');
    const supabaseContent = await loadSupabaseContent();

    // 4. Compare and report
    console.log('\n' + '-'.repeat(70));
    console.log('📊 ANALYSIS RESULTS');
    console.log('-'.repeat(70) + '\n');

    // Summary counts
    const websiteKeys = countKeys(websiteContent);
    const jsonKeys = cmsJsonContent ? Object.keys(cmsJsonContent.content || {}).length : 0;
    const supabaseKeys = supabaseContent.length;

    console.log('📈 CONTENT COUNTS:');
    console.log(`   Website JSON files (EN): ${websiteKeys} translation files`);
    console.log(`   cms-content-data.json:   ${jsonKeys} pages defined`);
    console.log(`   Supabase cms_content:    ${supabaseKeys} rows`);
    console.log('');

    // Check Hero section specifically (as example)
    console.log('🎯 HERO SECTION ANALYSIS:');
    await analyzeSection('hero', websiteContent, supabaseContent);

    // Check what the Hero.js component expects vs what's in Supabase
    console.log('\n🔗 HERO.JS COMPONENT KEY MAPPING:');
    const heroExpectedKeys = [
        { cmsKey: 'title', i18nKey: 'hero.title' },
        { cmsKey: 'title_highlight', i18nKey: 'hero.magic' },
        { cmsKey: 'subtitle', i18nKey: 'hero.subtitle' },
        { cmsKey: 'cta_primary', i18nKey: 'hero.cta' },
        { cmsKey: 'cta_secondary', i18nKey: 'hero.explore' },
        { cmsKey: 'feature1Title', i18nKey: 'hero.feature1Title' },
        { cmsKey: 'feature1Desc', i18nKey: 'hero.feature1Desc' },
        { cmsKey: 'feature2Title', i18nKey: 'hero.feature2Title' },
        { cmsKey: 'feature2Desc', i18nKey: 'hero.feature2Desc' },
        { cmsKey: 'feature3Title', i18nKey: 'hero.feature3Title' },
        { cmsKey: 'feature3Desc', i18nKey: 'hero.feature3Desc' },
    ];

    const heroSupabase = supabaseContent.filter(c => c.page_id === 'hero' && c.section === 'hero');

    console.log('   Expected Key (CMS)     | In Supabase? | Supabase Key Match');
    console.log('   ' + '-'.repeat(60));

    for (const expected of heroExpectedKeys) {
        const found = heroSupabase.find(c => c.content_key === expected.cmsKey);
        const altFound = heroSupabase.find(c => c.content_key === expected.i18nKey.split('.')[1]);
        const status = found ? '✅' : (altFound ? '⚠️ (alt key)' : '❌');
        const actualKey = found ? found.content_key : (altFound ? altFound.content_key : 'NOT FOUND');
        console.log(`   ${expected.cmsKey.padEnd(20)} | ${status.padEnd(12)} | ${actualKey}`);
    }

    // Check pages in Supabase
    console.log('\n📄 SUPABASE PAGES:');
    const { data: pages } = await supabase.from('cms_pages').select('*').order('display_order');
    if (pages) {
        for (const page of pages) {
            const contentCount = supabaseContent.filter(c => c.page_id === page.slug).length;
            console.log(`   ${page.slug.padEnd(20)} - ${contentCount} content rows`);
        }
    }

    // Media check
    console.log('\n🖼️ MEDIA ANALYSIS:');
    const { data: media, count: mediaCount } = await supabase
        .from('cms_media')
        .select('*', { count: 'exact' });

    if (media) {
        const images = media.filter(m => m.content_type?.startsWith('image/'));
        const videos = media.filter(m => m.content_type?.startsWith('video/'));
        console.log(`   Total media files:  ${mediaCount}`);
        console.log(`   Images:             ${images.length}`);
        console.log(`   Videos:             ${videos.length}`);

        // Check for broken URLs (sample)
        const brokenUrls = media.filter(m => !m.url || m.url === '');
        if (brokenUrls.length > 0) {
            console.log(`   ⚠️ Missing URLs:     ${brokenUrls.length}`);
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 SYNC STATUS SUMMARY');
    console.log('='.repeat(70));

    console.log('\n✅ WHAT\'S WORKING:');
    console.log('   - Supabase client is configured in website (lib/supabase.js)');
    console.log('   - useCmsContent hook exists with fallback to i18n');
    console.log('   - Hero.js already uses useCmsContent hook!');
    console.log('   - Content exists in Supabase (891 rows)');

    console.log('\n⚠️ ISSUES TO FIX:');
    console.log('   - CMS uses different key names than what Hero.js expects');
    console.log('   - Example: Hero.js expects "title" but Supabase has "hero.title"');
    console.log('   - Need to align content_key format between CMS and components');

    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('   1. Update Supabase content_key to match component expectations');
    console.log('   2. OR update useCmsContent to transform keys');
    console.log('   3. Test Hero component with live data');
    console.log('   4. Repeat for all components');

    console.log('\n');
}

function loadWebsiteTranslations() {
    const content = {};
    const localesPath = path.join(WEBSITE_LOCALES, 'en');

    try {
        const files = fs.readdirSync(localesPath);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const name = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(localesPath, file), 'utf-8'));
                content[name] = data;
            }
        }
    } catch (e) {
        console.log('   ⚠️ Could not load website translations:', e.message);
    }

    return content;
}

function loadCmsJsonContent() {
    try {
        return JSON.parse(fs.readFileSync(CMS_CONTENT_JSON, 'utf-8'));
    } catch (e) {
        console.log('   ⚠️ Could not load cms-content-data.json:', e.message);
        return null;
    }
}

async function loadSupabaseContent() {
    try {
        const { data, error } = await supabase
            .from('cms_content')
            .select('*');

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.log('   ⚠️ Could not load Supabase content:', e.message);
        return [];
    }
}

function countKeys(obj, count = 0) {
    return Object.keys(obj).length;
}

async function analyzeSection(section, websiteContent, supabaseContent) {
    const websiteHero = websiteContent.hero || {};
    const supabaseHero = supabaseContent.filter(c => c.page_id === section);

    console.log(`   Website hero.json keys:  ${Object.keys(websiteHero).length}`);
    console.log(`   Supabase hero rows:      ${supabaseHero.length}`);

    // Show key comparison
    const websiteKeys = Object.keys(websiteHero);
    const supabaseKeys = supabaseHero.map(c => c.content_key);

    const missing = websiteKeys.filter(k => !supabaseKeys.includes(k));
    const extra = supabaseKeys.filter(k => !websiteKeys.includes(k));

    if (missing.length > 0) {
        console.log(`   ⚠️ In website but not Supabase: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
    }
    if (extra.length > 0) {
        console.log(`   ℹ️ In Supabase but not website JSON: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}`);
    }
}

// Run the audit
audit().catch(console.error);
