/**
 * Add Missing CMS Pages to Supabase
 * 
 * This script adds the pages that are missing from the database
 * so that all 699 content fields can be synced.
 * 
 * Usage: node scripts/add-missing-pages.cjs
 */

const fs = require('fs');
const path = require('path');

// Read .env.local for Supabase credentials
const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
    console.error('❌ Could not read .env.local file');
    process.exit(1);
}

// Parse environment variables
function parseEnv(content) {
    const env = {};
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            env[key] = value;
        }
    });
    return env;
}

const env = parseEnv(envContent);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Load the CMS content data to get all pages
const cmsDataPath = path.join(__dirname, '../cms-content-data.json');
let cmsData;
try {
    const content = fs.readFileSync(cmsDataPath, 'utf-8');
    cmsData = JSON.parse(content);
} catch (error) {
    console.error('❌ Could not read cms-content-data.json');
    process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     COLD EXPERIENCE CMS - ADD MISSING PAGES                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`📡 Supabase URL: ${SUPABASE_URL}\n`);

async function getExistingPages() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cms_pages?select=slug`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to get existing pages');
    }

    const pages = await response.json();
    return new Set(pages.map(p => p.slug));
}

async function addPage(page) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cms_pages`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            slug: page.slug,
            name: page.name,
            description: page.description,
            icon: page.icon,
            display_order: page.display_order
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add page ${page.slug}: ${errorText}`);
    }

    return response.json();
}

async function main() {
    console.log('🔍 Checking existing pages...');

    const existingPages = await getExistingPages();
    console.log(`   Found ${existingPages.size} existing pages\n`);

    const allPages = cmsData.pages;
    const missingPages = allPages.filter(p => !existingPages.has(p.slug));

    if (missingPages.length === 0) {
        console.log('✅ All pages already exist in the database!');
        return;
    }

    console.log(`📄 Adding ${missingPages.length} missing pages...\n`);

    for (const page of missingPages) {
        try {
            await addPage(page);
            console.log(`   ✓ Added: ${page.name} (${page.slug})`);
        } catch (error) {
            console.error(`   ✗ Failed: ${page.name} - ${error.message}`);
        }
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('✨ Done!');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('Next step: Click "Synka allt till Supabase" again in the CMS Dashboard\n');
}

main().catch(console.error);
