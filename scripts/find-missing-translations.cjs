/**
 * Find all fields missing translations
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissing() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 FINDING FIELDS WITH MISSING TRANSLATIONS');
    console.log('='.repeat(70) + '\n');

    const { data: allContent } = await supabase
        .from('cms_content')
        .select('section, content_key, content_en, content_sv, content_de, content_pl')
        .order('section')
        .order('content_key');

    const missingEN = [];
    const missingSV = [];
    const missingDE = [];
    const missingPL = [];

    allContent.forEach(row => {
        const key = `${row.section}.${row.content_key}`;
        if (!row.content_en || row.content_en.trim() === '') missingEN.push(key);
        if (!row.content_sv || row.content_sv.trim() === '') missingSV.push(key);
        if (!row.content_de || row.content_de.trim() === '') missingDE.push(key);
        if (!row.content_pl || row.content_pl.trim() === '') missingPL.push(key);
    });

    // Group by section for better readability
    const groupBySection = (arr) => {
        const grouped = {};
        arr.forEach(key => {
            const [section, ...rest] = key.split('.');
            if (!grouped[section]) grouped[section] = [];
            grouped[section].push(rest.join('.'));
        });
        return grouped;
    };

    console.log('❌ Missing ENGLISH (EN):', missingEN.length, 'fields');
    if (missingEN.length > 0) {
        const grouped = groupBySection(missingEN);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}:`);
            fields.forEach(f => console.log(`      - ${f}`));
        });
    }

    console.log('\n' + '-'.repeat(70));
    console.log('❌ Missing SWEDISH (SV):', missingSV.length, 'fields');
    if (missingSV.length > 0 && missingSV.length <= 30) {
        const grouped = groupBySection(missingSV);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}:`);
            fields.forEach(f => console.log(`      - ${f}`));
        });
    } else if (missingSV.length > 30) {
        const grouped = groupBySection(missingSV);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}: ${fields.length} fields missing`);
        });
    }

    console.log('\n' + '-'.repeat(70));
    console.log('❌ Missing GERMAN (DE):', missingDE.length, 'fields');
    if (missingDE.length > 0 && missingDE.length <= 30) {
        const grouped = groupBySection(missingDE);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}:`);
            fields.forEach(f => console.log(`      - ${f}`));
        });
    } else if (missingDE.length > 30) {
        const grouped = groupBySection(missingDE);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}: ${fields.length} fields missing`);
        });
    }

    console.log('\n' + '-'.repeat(70));
    console.log('❌ Missing POLISH (PL):', missingPL.length, 'fields');
    if (missingPL.length > 0 && missingPL.length <= 30) {
        const grouped = groupBySection(missingPL);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}:`);
            fields.forEach(f => console.log(`      - ${f}`));
        });
    } else if (missingPL.length > 30) {
        const grouped = groupBySection(missingPL);
        Object.entries(grouped).forEach(([section, fields]) => {
            console.log(`   📁 ${section}: ${fields.length} fields missing`);
        });
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total fields: ${allContent.length}`);
    console.log(`Missing EN: ${missingEN.length} (${(missingEN.length / allContent.length * 100).toFixed(1)}%)`);
    console.log(`Missing SV: ${missingSV.length} (${(missingSV.length / allContent.length * 100).toFixed(1)}%)`);
    console.log(`Missing DE: ${missingDE.length} (${(missingDE.length / allContent.length * 100).toFixed(1)}%)`);
    console.log(`Missing PL: ${missingPL.length} (${(missingPL.length / allContent.length * 100).toFixed(1)}%)`);

    const completeRows = allContent.filter(row =>
        row.content_en && row.content_sv && row.content_de && row.content_pl
    ).length;
    console.log(`\n✅ Fully translated: ${completeRows}/${allContent.length} (${(completeRows / allContent.length * 100).toFixed(1)}%)`);
    console.log('='.repeat(70) + '\n');
}

findMissing().catch(console.error);
