/**
 * Full CMS Audit: Check all pages, sections, content, and media
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullAudit() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FULL CMS AUDIT - PAGES, SECTIONS, CONTENT & MEDIA');
    console.log('='.repeat(70) + '\n');

    // 1. Get all pages
    const { data: pages, error: pagesError } = await supabase
        .from('cms_pages')
        .select('*')
        .order('display_order');

    if (pagesError) {
        console.error('❌ Error fetching pages:', pagesError.message);
        return;
    }

    console.log(`📄 TOTAL PAGES: ${pages.length}\n`);

    // 2. Get all content
    const { data: allContent } = await supabase
        .from('cms_content')
        .select('*');

    // 3. Get all media
    const { data: allMedia } = await supabase
        .from('cms_media')
        .select('*');

    // 4. Get section-media assignments
    const { data: sectionMedia } = await supabase
        .from('section_media')
        .select('*');

    console.log('-'.repeat(70));
    console.log('📊 OVERVIEW');
    console.log('-'.repeat(70));
    console.log(`   Total Pages:          ${pages.length}`);
    console.log(`   Total Content Rows:   ${allContent?.length || 0}`);
    console.log(`   Total Media Files:    ${allMedia?.length || 0}`);
    console.log(`   Section-Media Links:  ${sectionMedia?.length || 0}`);
    console.log('');

    // Count media by type
    const images = allMedia?.filter(m => m.media_type === 'image') || [];
    const videos = allMedia?.filter(m => m.media_type === 'video') || [];
    console.log(`   📷 Images: ${images.length}`);
    console.log(`   🎬 Videos: ${videos.length}`);

    // Count media with URLs
    const mediaWithUrls = allMedia?.filter(m => m.public_url) || [];
    console.log(`   🔗 Media with URLs: ${mediaWithUrls.length}/${allMedia?.length || 0}`);
    console.log('');

    // 5. Audit each page
    console.log('='.repeat(70));
    console.log('📄 PAGE-BY-PAGE AUDIT');
    console.log('='.repeat(70) + '\n');

    const summary = {
        pagesWithContent: 0,
        pagesWithoutContent: 0,
        sectionsWithMedia: 0,
        sectionsWithoutMedia: 0,
        issues: []
    };

    for (const page of pages) {
        const pageContent = allContent?.filter(c => c.page_id === page.id) || [];
        const sections = [...new Set(pageContent.map(c => c.section))];

        // Get media for this page's sections
        const pageMediaLinks = sectionMedia?.filter(sm =>
            sm.page_slug === page.slug || sections.includes(sm.section_name)
        ) || [];

        const hasContent = pageContent.length > 0;
        const hasMedia = pageMediaLinks.length > 0;

        const statusIcon = hasContent ? '✅' : '⚠️';
        const mediaIcon = hasMedia ? '🖼️' : '📭';

        console.log(`${statusIcon} ${page.name} (/${page.slug})`);
        console.log(`   📝 Content: ${pageContent.length} rows | Sections: ${sections.length}`);
        console.log(`   ${mediaIcon} Media assignments: ${pageMediaLinks.length}`);

        if (sections.length > 0) {
            console.log(`   📂 Sections: ${sections.join(', ')}`);
        }

        if (!hasContent) {
            summary.pagesWithoutContent++;
            summary.issues.push(`Page '${page.name}' has no content`);
        } else {
            summary.pagesWithContent++;
        }

        // Check for missing translations
        const contentWithMissingTranslations = pageContent.filter(c =>
            !c.content_en || !c.content_sv
        );
        if (contentWithMissingTranslations.length > 0) {
            console.log(`   ⚠️  Missing translations: ${contentWithMissingTranslations.length} rows`);
        }

        console.log('');
    }

    // 6. Media assignment audit
    console.log('='.repeat(70));
    console.log('🖼️ MEDIA ASSIGNMENT AUDIT');
    console.log('='.repeat(70) + '\n');

    // Group section_media by section
    const mediaBySection = {};
    sectionMedia?.forEach(sm => {
        const key = `${sm.page_slug}/${sm.section_name}`;
        if (!mediaBySection[key]) {
            mediaBySection[key] = [];
        }
        mediaBySection[key].push(sm);
    });

    console.log('Sections with assigned media:\n');
    Object.keys(mediaBySection).sort().forEach(key => {
        const count = mediaBySection[key].length;
        console.log(`   ✅ ${key}: ${count} media file(s)`);
        summary.sectionsWithMedia++;
    });

    // 7. Check for orphaned media (not assigned to any section)
    const assignedMediaIds = new Set(sectionMedia?.map(sm => sm.media_id) || []);
    const orphanedMedia = allMedia?.filter(m => !assignedMediaIds.has(m.id)) || [];

    console.log('\n' + '-'.repeat(70));
    console.log('📦 ORPHANED MEDIA (not assigned to any section):');
    console.log('-'.repeat(70));

    if (orphanedMedia.length === 0) {
        console.log('   ✅ All media files are assigned to sections!');
    } else {
        console.log(`   ⚠️  ${orphanedMedia.length} media files not assigned:\n`);
        orphanedMedia.slice(0, 20).forEach(m => {
            const type = m.media_type === 'video' ? '🎬' : '📷';
            console.log(`   ${type} ${m.filename}`);
        });
        if (orphanedMedia.length > 20) {
            console.log(`   ... and ${orphanedMedia.length - 20} more`);
        }
    }

    // 8. Check for media without URLs
    const mediaWithoutUrls = allMedia?.filter(m => !m.public_url) || [];

    console.log('\n' + '-'.repeat(70));
    console.log('🔗 MEDIA URL STATUS:');
    console.log('-'.repeat(70));

    if (mediaWithoutUrls.length === 0) {
        console.log('   ✅ All media files have public URLs!');
    } else {
        console.log(`   ⚠️  ${mediaWithoutUrls.length} media files missing URLs:\n`);
        mediaWithoutUrls.slice(0, 10).forEach(m => {
            console.log(`   ❌ ${m.filename}`);
        });
    }

    // 9. Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL SUMMARY');
    console.log('='.repeat(70) + '\n');

    console.log(`   ✅ Pages with content:     ${summary.pagesWithContent}/${pages.length}`);
    console.log(`   ⚠️  Pages without content:  ${summary.pagesWithoutContent}/${pages.length}`);
    console.log(`   🖼️ Sections with media:    ${summary.sectionsWithMedia}`);
    console.log(`   📦 Orphaned media files:   ${orphanedMedia.length}`);
    console.log(`   🔗 Media without URLs:     ${mediaWithoutUrls.length}`);

    if (summary.issues.length > 0) {
        console.log('\n   ⚠️  ISSUES FOUND:');
        summary.issues.forEach(issue => {
            console.log(`      - ${issue}`);
        });
    }

    // Overall status
    const allGood = summary.pagesWithoutContent === 0 &&
        orphanedMedia.length === 0 &&
        mediaWithoutUrls.length === 0;

    console.log('\n' + '='.repeat(70));
    if (allGood) {
        console.log('🎉 ALL CHECKS PASSED! CMS is fully synced and ready.');
    } else {
        console.log('⚠️  Some items need attention. See details above.');
    }
    console.log('='.repeat(70) + '\n');
}

fullAudit().catch(console.error);
