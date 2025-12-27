/**
 * Complete CMS Status Report
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function statusReport() {
    console.log('\n' + '═'.repeat(70));
    console.log('  📊 COLDEXPERIENCE CMS - COMPLETE STATUS REPORT');
    console.log('═'.repeat(70) + '\n');

    // 1. Pages
    const { data: pages } = await supabase
        .from('cms_pages')
        .select('*')
        .order('display_order');

    // 2. Content
    const { data: content } = await supabase
        .from('cms_content')
        .select('*');

    // 3. Media
    const { data: media } = await supabase
        .from('cms_media')
        .select('*');

    // === OVERVIEW ===
    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│  📋 OVERVIEW' + ' '.repeat(55) + '│');
    console.log('├' + '─'.repeat(68) + '┤');
    console.log(`│  Total Pages:              ${String(pages.length).padEnd(38)}│`);
    console.log(`│  Total Content Rows:       ${String(content.length).padEnd(38)}│`);
    console.log(`│  Total Media Files:        ${String(media.length).padEnd(38)}│`);
    console.log('└' + '─'.repeat(68) + '┘\n');

    // === PAGES STATUS ===
    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│  📄 PAGES & CONTENT' + ' '.repeat(48) + '│');
    console.log('├' + '─'.repeat(68) + '┤');

    for (const page of pages) {
        const pageContent = content.filter(c => c.page_id === page.id);
        const sections = [...new Set(pageContent.map(c => c.section))];
        const icon = pageContent.length > 0 ? '✅' : '⚠️';
        const line = `│  ${icon} ${page.name.padEnd(25)} │ ${String(pageContent.length).padStart(3)} rows │ ${sections.length} sections`;
        console.log(line.padEnd(69) + '│');
    }
    console.log('└' + '─'.repeat(68) + '┘\n');

    // === MEDIA STATUS ===
    const mediaWithSection = media.filter(m => m.page_id && m.section_id);
    const images = media.filter(m => m.filename.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    const videos = media.filter(m => m.filename.match(/\.(mp4|webm|mov)$/i));
    const withUrls = media.filter(m => m.public_url);

    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│  🖼️  MEDIA STATUS' + ' '.repeat(50) + '│');
    console.log('├' + '─'.repeat(68) + '┤');
    console.log(`│  📷 Images:                ${String(images.length).padEnd(38)}│`);
    console.log(`│  🎬 Videos:                ${String(videos.length).padEnd(38)}│`);
    console.log(`│  🔗 With Public URLs:      ${String(withUrls.length + '/' + media.length).padEnd(38)}│`);
    console.log(`│  📂 Assigned to Sections:  ${String(mediaWithSection.length + '/' + media.length).padEnd(38)}│`);
    console.log('└' + '─'.repeat(68) + '┘\n');

    // === MEDIA BY PAGE ===
    const mediaByPage = {};
    mediaWithSection.forEach(m => {
        mediaByPage[m.page_id] = (mediaByPage[m.page_id] || 0) + 1;
    });

    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│  📂 MEDIA DISTRIBUTION BY PAGE' + ' '.repeat(36) + '│');
    console.log('├' + '─'.repeat(68) + '┤');

    Object.keys(mediaByPage).sort().forEach(page => {
        const bar = '█'.repeat(Math.min(mediaByPage[page], 40));
        const line = `│  ${page.padEnd(15)} ${String(mediaByPage[page]).padStart(3)} │ ${bar}`;
        console.log(line.padEnd(69) + '│');
    });
    console.log('└' + '─'.repeat(68) + '┘\n');

    // === MISSING TRANSLATIONS ===
    const missingEn = content.filter(c => !c.content_en);
    const missingSv = content.filter(c => !c.content_sv);
    const missingDe = content.filter(c => !c.content_de);
    const missingPl = content.filter(c => !c.content_pl);

    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│  🌐 TRANSLATION STATUS' + ' '.repeat(45) + '│');
    console.log('├' + '─'.repeat(68) + '┤');
    console.log(`│  English (EN):  ${missingSv.length === 0 ? '✅ Complete' : '⚠️  ' + missingEn.length + ' missing'}`.padEnd(69) + '│');
    console.log(`│  Swedish (SV):  ${missingSv.length === 0 ? '✅ Complete' : '⚠️  ' + missingSv.length + ' missing'}`.padEnd(69) + '│');
    console.log(`│  German (DE):   ${missingDe.length === 0 ? '✅ Complete' : '⚠️  ' + missingDe.length + ' missing'}`.padEnd(69) + '│');
    console.log(`│  Polish (PL):   ${missingPl.length === 0 ? '✅ Complete' : '⚠️  ' + missingPl.length + ' missing'}`.padEnd(69) + '│');
    console.log('└' + '─'.repeat(68) + '┘\n');

    // === FINAL VERDICT ===
    const allMediaAssigned = mediaWithSection.length === media.length;
    const allPagesHaveContent = pages.every(p => content.some(c => c.page_id === p.id));
    const allMediaHasUrls = withUrls.length === media.length;

    console.log('═'.repeat(70));
    console.log('  📋 FINAL VERDICT');
    console.log('═'.repeat(70));
    console.log(`  ${allPagesHaveContent ? '✅' : '❌'} All pages have content`);
    console.log(`  ${allMediaAssigned ? '✅' : '❌'} All media assigned to sections`);
    console.log(`  ${allMediaHasUrls ? '✅' : '❌'} All media has public URLs`);
    console.log('═'.repeat(70));

    if (allPagesHaveContent && allMediaAssigned && allMediaHasUrls) {
        console.log('\n  🎉 CMS IS FULLY SYNCED AND READY!');
    } else {
        console.log('\n  ⚠️  Some items need attention.');
    }
    console.log('═'.repeat(70) + '\n');
}

statusReport().catch(console.error);
