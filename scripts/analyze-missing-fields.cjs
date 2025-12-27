/**
 * Analyze Missing Fields in CMS
 * Compares Supabase content with CMS schema definitions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 ANALYS AV CMS-FÄLT');
    console.log('═'.repeat(60) + '\n');

    // Get all pages
    const { data: pages, error: pageError } = await supabase
        .from('cms_pages')
        .select('*')
        .order('slug');

    if (pageError) {
        console.log('❌ Kunde inte hämta sidor:', pageError.message);
        return;
    }

    console.log(`📄 Hittade ${pages.length} sidor i Supabase\n`);

    // Analyze each page
    let totalFields = 0;
    let totalWithContent = 0;
    let emptyFields = [];

    for (const page of pages) {
        const { data: content, error } = await supabase
            .from('cms_content')
            .select('*')
            .eq('page_id', page.id)
            .order('section, content_key');

        if (error) {
            console.log(`❌ Error för ${page.slug}:`, error.message);
            continue;
        }

        // Group by section
        const sections = {};
        for (const item of content) {
            if (!sections[item.section]) {
                sections[item.section] = [];
            }
            sections[item.section].push(item);
        }

        console.log(`\n📁 ${page.slug.toUpperCase()} (${content.length} fält)`);
        console.log('-'.repeat(40));

        for (const [section, fields] of Object.entries(sections)) {
            const withContent = fields.filter(f => f.content_en || f.content_sv);
            const empty = fields.filter(f => !f.content_en && !f.content_sv);

            console.log(`   • ${section}: ${fields.length} fält (${withContent.length} med innehåll, ${empty.length} tomma)`);

            totalFields += fields.length;
            totalWithContent += withContent.length;

            // Track empty fields
            for (const f of empty) {
                emptyFields.push({
                    page: page.slug,
                    section: section,
                    key: f.content_key
                });
            }
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📈 SAMMANFATTNING');
    console.log('═'.repeat(60));
    console.log(`   Totalt antal fält: ${totalFields}`);
    console.log(`   Med innehåll: ${totalWithContent} (${Math.round(100 * totalWithContent / totalFields)}%)`);
    console.log(`   Tomma: ${emptyFields.length} (${Math.round(100 * emptyFields.length / totalFields)}%)`);

    // Show empty fields if not too many
    if (emptyFields.length > 0 && emptyFields.length <= 50) {
        console.log('\n⚠️ TOMMA FÄLT:');
        console.log('-'.repeat(40));
        for (const f of emptyFields.slice(0, 30)) {
            console.log(`   • ${f.page}/${f.section}: ${f.key}`);
        }
        if (emptyFields.length > 30) {
            console.log(`   ... och ${emptyFields.length - 30} till`);
        }
    }

    // Check for sections without schema
    console.log('\n' + '═'.repeat(60));
    console.log('🔍 SEKTIONER ATT KONTROLLERA');
    console.log('═'.repeat(60));

    const allSections = new Set();
    for (const page of pages) {
        const { data: content } = await supabase
            .from('cms_content')
            .select('section')
            .eq('page_id', page.id);

        for (const item of content || []) {
            allSections.add(`${page.slug}:${item.section}`);
        }
    }

    const sortedSections = Array.from(allSections).sort();
    console.log(`\nAlla ${sortedSections.length} unika sektioner i databasen:`);
    for (const s of sortedSections) {
        console.log(`   • ${s}`);
    }

    console.log('\n✅ Analys klar!\n');
}

analyze().catch(console.error);
