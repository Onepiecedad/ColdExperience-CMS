/**
 * Deep dive into Supabase structure to understand the data
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('\n🔍 DEEP DIVE: SUPABASE STRUCTURE\n');

    // Check all columns in cms_content
    console.log('📊 SAMPLE CMS_CONTENT ROWS:');
    console.log('-'.repeat(80));

    const { data: sample, error } = await supabase
        .from('cms_content')
        .select('*')
        .limit(10);

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    if (sample && sample.length > 0) {
        // Show column names
        console.log('Columns:', Object.keys(sample[0]).join(', '));
        console.log('');

        // Show first 10 rows
        for (const row of sample) {
            console.log(`page_id: ${row.page_id || row.pageId || 'N/A'}, section: ${row.section || 'N/A'}, content_key: ${row.content_key || row.contentKey || 'N/A'}`);
            if (row.content_en) {
                console.log(`  EN: ${row.content_en?.substring(0, 60)}...`);
            }
        }
    }

    // Get unique page_ids
    console.log('\n\n📄 UNIQUE PAGE_IDs in cms_content:');
    console.log('-'.repeat(50));

    const { data: allContent } = await supabase.from('cms_content').select('*');

    if (allContent) {
        const pageIds = [...new Set(allContent.map(c => c.page_id))];
        const sections = [...new Set(allContent.map(c => c.section))];

        console.log('Page IDs:', pageIds);
        console.log('Sections:', sections.slice(0, 20), sections.length > 20 ? '...' : '');

        // Count per page_id
        console.log('\n📈 ROWS PER PAGE_ID:');
        for (const pageId of pageIds) {
            const count = allContent.filter(c => c.page_id === pageId).length;
            console.log(`  ${String(pageId).padEnd(20)}: ${count} rows`);
        }

        // Show hero content specifically
        console.log('\n\n🎯 HERO CONTENT (looking for page_id containing "hero"):');
        const heroContent = allContent.filter(c =>
            (c.page_id && c.page_id.toLowerCase().includes('hero')) ||
            (c.section && c.section.toLowerCase().includes('hero'))
        );

        if (heroContent.length > 0) {
            for (const row of heroContent.slice(0, 10)) {
                console.log(`  [${row.page_id}/${row.section}] ${row.content_key}: ${row.content_en?.substring(0, 40)}...`);
            }
            console.log(`  Total hero-related rows: ${heroContent.length}`);
        } else {
            console.log('  No rows found with "hero" in page_id or section');

            // Try to find what structure is used
            console.log('\n  First 5 unique page_id/section combinations:');
            const combos = [...new Set(allContent.map(c => `${c.page_id}/${c.section}`))].slice(0, 10);
            combos.forEach(c => console.log(`    ${c}`));
        }
    }

    // Check media
    console.log('\n\n🖼️ MEDIA STRUCTURE:');
    console.log('-'.repeat(50));

    const { data: media } = await supabase.from('cms_media').select('*').limit(5);
    if (media && media.length > 0) {
        console.log('Columns:', Object.keys(media[0]).join(', '));
        for (const m of media) {
            console.log(`  ${m.filename}: URL=${m.url ? 'YES' : 'NO'}, page=${m.page_id}, section=${m.section_id}`);
        }
    }

    // Check pages table
    console.log('\n\n📄 CMS_PAGES TABLE:');
    console.log('-'.repeat(50));

    const { data: pages } = await supabase.from('cms_pages').select('*');
    if (pages) {
        for (const p of pages) {
            console.log(`  ID: ${p.id}, Slug: ${p.slug}, Name: ${p.name}`);
        }
    }

    console.log('\n');
}

check().catch(console.error);
