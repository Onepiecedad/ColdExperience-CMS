#!/usr/bin/env node
/**
 * T10: Sync JSON Fallback → Supabase
 *
 * Reads cms-content-data.json and upserts pages, content, and packages
 * into the Supabase CMS tables.
 *
 * Usage:
 *   node scripts/sync-json-to-supabase.mjs [--dry-run]
 *
 * Requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load env ──────────────────────────────────────────────────────────
function loadEnv() {
    const envPath = resolve(ROOT, '.env');
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const match = line.match(/^(\w+)=(.+)$/);
        if (match) process.env[match[1]] = match[2].trim();
    }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Load JSON ─────────────────────────────────────────────────────────
const jsonPath = resolve(ROOT, 'cms-content-data.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

const stats = { pages: 0, content: 0, packages: 0, errors: 0 };

// ── Sync helpers ──────────────────────────────────────────────────────

function stringifyValue(val) {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return JSON.stringify(val);
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

async function syncPages() {
    console.log('\n📄 Syncing pages...');
    for (const page of data.pages) {
        const row = {
            slug: page.slug,
            name: page.name,
            description: page.description || null,
            icon: page.icon || null,
            display_order: page.display_order ?? 0,
        };

        if (DRY_RUN) {
            console.log(`  [DRY] Would upsert page: ${page.slug}`);
            stats.pages++;
            continue;
        }

        const { error } = await supabase
            .from('cms_pages')
            .upsert(row, { onConflict: 'slug' });

        if (error) {
            console.error(`  ❌ Page "${page.slug}": ${error.message}`);
            stats.errors++;
        } else {
            console.log(`  ✅ ${page.slug}`);
            stats.pages++;
        }
    }
}

async function syncContent() {
    console.log('\n📝 Syncing content...');
    let order = 0;

    for (const [pageSlug, sections] of Object.entries(data.content)) {
        for (const [section, fields] of Object.entries(sections)) {
            for (const [fieldKey, langValues] of Object.entries(fields)) {
                const contentKey = `${section}.${fieldKey}`;
                const row = {
                    page_id: pageSlug,
                    section: section,
                    content_key: contentKey,
                    content_type: 'text',
                    content_en: stringifyValue(langValues?.en),
                    content_sv: stringifyValue(langValues?.sv),
                    content_de: stringifyValue(langValues?.de),
                    content_pl: stringifyValue(langValues?.pl),
                    field_label: fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()),
                    display_order: order++,
                };

                if (DRY_RUN) {
                    stats.content++;
                    continue;
                }

                const { error } = await supabase
                    .from('cms_content')
                    .upsert(row, { onConflict: 'page_id,content_key' });

                if (error) {
                    console.error(`  ❌ ${pageSlug}/${contentKey}: ${error.message}`);
                    stats.errors++;
                } else {
                    stats.content++;
                }
            }
        }
    }
    console.log(`  ✅ ${stats.content} content entries processed`);
}

async function syncPackages() {
    if (!data.packages?.length) {
        console.log('\n📦 No packages to sync.');
        return;
    }

    console.log('\n📦 Syncing packages...');
    for (const pkg of data.packages) {
        const row = {
            package_key: pkg.key,
            price_sek: pkg.priceSEK ?? 0,
            price_eur: pkg.priceEUR ?? null,
            featured: pkg.featured ?? false,
            display_order: pkg.displayOrder ?? 0,
            active: true,
            name_en: stringifyValue(pkg.name?.en),
            name_sv: stringifyValue(pkg.name?.sv),
            name_de: stringifyValue(pkg.name?.de),
            name_pl: stringifyValue(pkg.name?.pl),
            duration_en: stringifyValue(pkg.duration?.en),
            duration_sv: stringifyValue(pkg.duration?.sv),
            duration_de: stringifyValue(pkg.duration?.de),
            duration_pl: stringifyValue(pkg.duration?.pl),
            description_en: stringifyValue(pkg.description?.en),
            description_sv: stringifyValue(pkg.description?.sv),
            description_de: stringifyValue(pkg.description?.de),
            description_pl: stringifyValue(pkg.description?.pl),
            highlights_en: pkg.highlights?.en || [],
            highlights_sv: pkg.highlights?.sv || [],
            highlights_de: pkg.highlights?.de || [],
            highlights_pl: pkg.highlights?.pl || [],
        };

        if (DRY_RUN) {
            console.log(`  [DRY] Would upsert package: ${pkg.key}`);
            stats.packages++;
            continue;
        }

        const { error } = await supabase
            .from('cms_packages')
            .upsert(row, { onConflict: 'package_key' });

        if (error) {
            console.error(`  ❌ Package "${pkg.key}": ${error.message}`);
            stats.errors++;
        } else {
            console.log(`  ✅ ${pkg.key}`);
            stats.packages++;
        }
    }
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
    console.log('🔄 JSON → Supabase Sync');
    console.log(`   Source: ${jsonPath}`);
    console.log(`   Target: ${SUPABASE_URL}`);
    if (DRY_RUN) console.log('   ⚠️  DRY RUN — no changes will be made\n');

    await syncPages();
    await syncContent();
    await syncPackages();

    console.log('\n═══════════════════════════════════════');
    console.log(`📊 Summary${DRY_RUN ? ' (DRY RUN)' : ''}:`);
    console.log(`   Pages:    ${stats.pages}`);
    console.log(`   Content:  ${stats.content}`);
    console.log(`   Packages: ${stats.packages}`);
    console.log(`   Errors:   ${stats.errors}`);
    console.log('═══════════════════════════════════════\n');

    if (stats.errors > 0) process.exit(1);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
