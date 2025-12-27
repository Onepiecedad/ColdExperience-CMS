/**
 * Check Supabase Schema
 * 
 * This script checks the current state of Supabase tables
 * and helps diagnose schema issues.
 * 
 * Usage: node scripts/check-supabase.cjs
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

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     COLD EXPERIENCE CMS - SUPABASE SCHEMA CHECK               ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`📡 Supabase URL: ${SUPABASE_URL}\n`);

// Check tables
const tables = ['cms_pages', 'cms_content', 'cms_packages', 'cms_settings', 'cms_media'];

async function checkTable(tableName) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            const count = data.length;

            // Get full count
            const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Range': '0-0',
                    'Prefer': 'count=exact'
                }
            });

            const contentRange = countResponse.headers.get('content-range');
            const totalCount = contentRange ? contentRange.split('/')[1] : 'unknown';

            console.log(`   ✓ ${tableName}: ${totalCount} rows`);

            // Show sample data structure
            if (data.length > 0) {
                const columns = Object.keys(data[0]);
                console.log(`     Columns: ${columns.join(', ')}`);
            }

            return { exists: true, count: totalCount };
        } else {
            const errorText = await response.text();
            console.log(`   ✗ ${tableName}: ${response.status} - ${errorText.substring(0, 50)}...`);
            return { exists: false, error: errorText };
        }
    } catch (error) {
        console.log(`   ✗ ${tableName}: ${error.message}`);
        return { exists: false, error: error.message };
    }
}

async function main() {
    console.log('🔍 Checking tables...\n');

    const results = {};
    for (const table of tables) {
        results[table] = await checkTable(table);
    }

    console.log('\n════════════════════════════════════════════════════════════════\n');

    const missingTables = tables.filter(t => !results[t].exists);

    if (missingTables.length === 0) {
        console.log('✨ All tables exist!');
        console.log('\nNext step: Run `node scripts/sync-to-supabase.cjs` to sync content.\n');
    } else {
        console.log('⚠️  Some tables are missing or have issues!\n');
        console.log('To fix this:');
        console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select project: cold-experience-cms');
        console.log('3. Go to SQL Editor');
        console.log('4. Run the SQL from: scripts/supabase-schema.sql');
        console.log('\nAfter running the schema, try sync again with:');
        console.log('   node scripts/sync-to-supabase.cjs\n');
    }
}

main().catch(console.error);
