/**
 * Quick check of all Supabase content
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUPABASE CONTENT VERIFICATION');
    console.log('='.repeat(60) + '\n');

    // Count total content
    const { count: totalContent } = await supabase
        .from('cms_content')
        .select('*', { count: 'exact', head: true });
    console.log('📝 Total content rows:', totalContent);

    // Count by section
    const { data: sections } = await supabase.from('cms_content').select('section');
    const sectionCounts = {};
    sections.forEach(s => sectionCounts[s.section] = (sectionCounts[s.section] || 0) + 1);
    console.log('\n📁 Content by section:');
    Object.entries(sectionCounts).sort((a, b) => b[1] - a[1]).forEach(([s, c]) =>
        console.log(`   ${s}: ${c} fields`)
    );

    // Check pages
    const { data: pages, error: pageErr } = await supabase.from('cms_pages').select('slug, title');
    console.log('\n📄 Pages in database:', pages ? pages.length : 'Error');
    if (pages) {
        pages.forEach(p => console.log(`   - ${p.slug} (${p.title})`));
    }

    // Check media
    const { count: mediaCount } = await supabase
        .from('cms_media')
        .select('*', { count: 'exact', head: true });
    console.log('\n🖼️  Total media files:', mediaCount);

    // Language coverage
    console.log('\n🌍 Language coverage:');
    const { data: allContent } = await supabase
        .from('cms_content')
        .select('content_key, content_en, content_sv, content_de, content_pl');

    let complete = 0, missingEn = 0, missingSv = 0, missingDe = 0, missingPl = 0;
    allContent.forEach(row => {
        if (!row.content_en) missingEn++;
        if (!row.content_sv) missingSv++;
        if (!row.content_de) missingDe++;
        if (!row.content_pl) missingPl++;
        if (row.content_en && row.content_sv && row.content_de && row.content_pl) complete++;
    });

    console.log(`   ✅ Complete (all 4 languages): ${complete}/${allContent.length}`);
    console.log(`   ❓ Missing EN: ${missingEn}`);
    console.log(`   ❓ Missing SV: ${missingSv}`);
    console.log(`   ❓ Missing DE: ${missingDe}`);
    console.log(`   ❓ Missing PL: ${missingPl}`);

    // Check packages
    const { data: packages } = await supabase.from('cms_packages').select('*');
    console.log('\n📦 Packages:', packages ? packages.length : 0);
    if (packages) {
        packages.forEach(p => console.log(`   - ${p.name_en || p.name || 'Unnamed'}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(60) + '\n');
}

check().catch(console.error);
