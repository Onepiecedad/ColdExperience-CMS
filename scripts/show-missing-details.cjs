/**
 * Show detailed missing fields for packages and why sections
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function showDetailedMissing() {
    console.log('\n' + '='.repeat(70));
    console.log('📦 DETAILED MISSING TRANSLATIONS: PACKAGES & WHY');
    console.log('='.repeat(70) + '\n');

    // Get packages section
    const { data: packagesContent } = await supabase
        .from('cms_content')
        .select('*')
        .eq('section', 'packages')
        .order('content_key');

    console.log('📦 PACKAGES SECTION (' + packagesContent.length + ' fields)\n');
    console.log('Key'.padEnd(40) + ' | EN | SV | DE | PL |');
    console.log('-'.repeat(70));

    packagesContent.forEach(row => {
        const en = row.content_en ? '✅' : '❌';
        const sv = row.content_sv ? '✅' : '❌';
        const de = row.content_de ? '✅' : '❌';
        const pl = row.content_pl ? '✅' : '❌';
        console.log(row.content_key.substring(0, 39).padEnd(40) + ` | ${en} | ${sv} | ${de} | ${pl} |`);
    });

    // Get why section
    const { data: whyContent } = await supabase
        .from('cms_content')
        .select('*')
        .eq('section', 'why')
        .order('content_key');

    console.log('\n' + '='.repeat(70));
    console.log('❓ WHY SECTION (' + whyContent.length + ' fields)\n');
    console.log('Key'.padEnd(40) + ' | EN | SV | DE | PL |');
    console.log('-'.repeat(70));

    whyContent.forEach(row => {
        const en = row.content_en ? '✅' : '❌';
        const sv = row.content_sv ? '✅' : '❌';
        const de = row.content_de ? '✅' : '❌';
        const pl = row.content_pl ? '✅' : '❌';
        console.log(row.content_key.substring(0, 39).padEnd(40) + ` | ${en} | ${sv} | ${de} | ${pl} |`);
    });

    console.log('\n' + '='.repeat(70) + '\n');
}

showDetailedMissing().catch(console.error);
