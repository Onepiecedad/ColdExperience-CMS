/**
 * Test: Verify website can now fetch content from Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpbeqrwwcmetbjjqvzsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate what the website's getCmsContent does
async function simulateGetCmsContent(pageSlug) {
    // First get the page ID (by slug)
    const { data: pageData, error: pageError } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', pageSlug)
        .single();

    if (pageError || !pageData) {
        console.log(`❌ Page '${pageSlug}' not found`);
        return null;
    }

    console.log(`✅ Found page '${pageSlug}' with ID: ${pageData.id}`);

    // Get content for that page
    const { data: contentData, error: contentError } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_id', pageData.id)
        .order('display_order');

    if (contentError) {
        console.log(`❌ Error fetching content:`, contentError.message);
        return null;
    }

    console.log(`✅ Found ${contentData.length} content rows`);

    // Transform with normalized keys (simulating the new code)
    const content = {};
    contentData.forEach(item => {
        const originalKey = item.content_key;
        // Strip section prefix: 'hero.title' -> 'title'
        const prefix = item.section + '.';
        const strippedKey = originalKey.startsWith(prefix)
            ? originalKey.substring(prefix.length)
            : originalKey;

        const value = {
            en: item.content_en,
            sv: item.content_sv,
            de: item.content_de,
            pl: item.content_pl,
        };

        content[originalKey] = value;
        if (strippedKey !== originalKey) {
            content[strippedKey] = value;
        }
    });

    return content;
}

async function test() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING WEBSITE SUPABASE INTEGRATION');
    console.log('='.repeat(60) + '\n');

    // Test Hero section
    console.log('📄 Testing getCmsContent("hero")...\n');
    const heroContent = await simulateGetCmsContent('hero');

    if (heroContent) {
        console.log('\n📝 Hero Content Keys Available:');
        console.log('   Original keys:', Object.keys(heroContent).filter(k => k.includes('.')).slice(0, 5).join(', '));
        console.log('   Stripped keys:', Object.keys(heroContent).filter(k => !k.includes('.')).slice(0, 5).join(', '));

        // Test what Hero.js expects
        console.log('\n🔗 What Hero.js component expects:');
        const testKeys = ['title', 'subtitle', 'cta', 'explore', 'feature1Title'];
        for (const key of testKeys) {
            const found = heroContent[key];
            const status = found ? '✅' : '❌';
            const value = found?.en?.substring(0, 40) || 'NOT FOUND';
            console.log(`   ${status} ${key}: ${value}...`);
        }
    }

    // Test media URLs
    console.log('\n' + '-'.repeat(60));
    console.log('🖼️ Testing Media URLs...\n');

    const { data: media } = await supabase
        .from('cms_media')
        .select('filename, public_url')
        .limit(5);

    if (media) {
        for (const m of media) {
            const hasUrl = m.public_url ? '✅' : '❌';
            console.log(`   ${hasUrl} ${m.filename}: ${m.public_url?.substring(0, 50)}...`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(60) + '\n');
}

test().catch(console.error);
