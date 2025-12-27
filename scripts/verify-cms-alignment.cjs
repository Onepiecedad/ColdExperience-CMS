/**
 * Verify CMS Alignment Script
 * 
 * Checks if frontend useCmsSection calls match the sections in Supabase
 * and identifies any misalignments between Dashboard and Website.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Frontend component section usage (from our conversion)
const FRONTEND_SECTIONS = {
    'Hero.js': 'hero',
    'FeaturedVideo.js': 'featuredVideo',
    'Features.js': 'features',
    'Experiences.js': 'experiences',
    'OwnerSection.js': 'ownerSection',
    'InstagramFeed.js': 'instagram',
    'Testimonials.js': 'testimonials',
    'About.js': 'about',
    'Gallery.js': 'gallery',
    'HomeCorner.js': 'corner',
    'FaqSection.js': 'contact',
    'Footer.js': 'footer',
    'Contact.js': 'contact',
    'Packages.js': 'packages',
    'Header.js': 'header',
    'CookieBanner.js': 'cookieBanner',
    'CookieSettingsModal.js': 'cookieSettings',
};

async function verifyCmsAlignment() {
    console.log('🔍 Verifying CMS Alignment...\n');

    // 1. Get unique sections from Supabase
    const { data: dbSections, error } = await supabase
        .from('cms_content')
        .select('section')
        .order('section');

    if (error) {
        console.error('❌ Error fetching from Supabase:', error.message);
        return;
    }

    const uniqueDbSections = [...new Set(dbSections.map(r => r.section))];
    console.log('📦 Sections in Supabase:');
    uniqueDbSections.forEach(s => console.log(`   - ${s}`));

    // 2. Check which frontend sections exist in database
    console.log('\n🔗 Frontend → Supabase Mapping:');
    const frontendSections = [...new Set(Object.values(FRONTEND_SECTIONS))];

    const results = {
        matched: [],
        missing: [],
    };

    for (const section of frontendSections) {
        if (uniqueDbSections.includes(section)) {
            results.matched.push(section);
            console.log(`   ✅ ${section} - Found in Supabase`);
        } else {
            results.missing.push(section);
            console.log(`   ❌ ${section} - MISSING from Supabase`);
        }
    }

    // 3. Check which database sections are not used by frontend
    console.log('\n📊 Supabase sections not directly used by frontend:');
    const unusedDbSections = uniqueDbSections.filter(s => !frontendSections.includes(s));
    if (unusedDbSections.length === 0) {
        console.log('   All database sections are used!');
    } else {
        unusedDbSections.forEach(s => console.log(`   ⚠️  ${s}`));
    }

    // 4. Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   ✅ Matched: ${results.matched.length}/${frontendSections.length} frontend sections`);
    console.log(`   ❌ Missing: ${results.missing.length} sections`);

    if (results.missing.length > 0) {
        console.log('\n⚠️  SECTIONS THAT NEED TO BE ADDED TO SUPABASE:');
        results.missing.forEach(s => console.log(`   - ${s}`));
    } else {
        console.log('\n🎉 All frontend sections are properly mapped to Supabase!');
    }

    // 5. Sample content check for each section
    console.log('\n📝 Sample content per section:');
    for (const section of results.matched.slice(0, 5)) {
        const { data: sample } = await supabase
            .from('cms_content')
            .select('content_key, content_en')
            .eq('section', section)
            .limit(2);

        console.log(`   ${section}:`);
        sample?.forEach(s => console.log(`      - ${s.content_key}: "${(s.content_en || '').substring(0, 50)}..."`));
    }
}

verifyCmsAlignment().catch(console.error);
