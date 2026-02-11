#!/usr/bin/env node
// ============================================================================
// APPLY SCHEMA PENDING - Patches schema.ts with pending entries
// Ticket 10.1: Auto-apply workflow
// ============================================================================

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check multiple locations for pending file
const PENDING_LOCATIONS = [
    join(__dirname, '../public/schema.pending.json'),
    join(process.env.HOME || '~', 'Downloads/schema.pending.json'),
];
const SCHEMA_PATH = join(__dirname, '../src/content/schema.ts');

// Block markers
const BLOCK_START = '// ═══════════════════════════════════════════════════════════════════════════';
const BLOCK_HEADER = '// AUTO-GENERATED SCHEMA ENTRIES';
const BLOCK_END = '// ═══════════════════════════════════════════════════════════════════════════';

// Helper: extract entries from a block of text into a Map
function extractEntriesFromBlock(blockContent, targetMap) {
    const entryRegex = /\{\s*key:\s*'([^']+)'[\s\S]*?\}\s*,?/g;
    let em;
    while ((em = entryRegex.exec(blockContent)) !== null) {
        const entryStr = em[0];
        const key = em[1];
        const type = entryStr.match(/type:\s*'([^']+)'/)?.[1] || 'text';
        const translatableRaw = entryStr.match(/translatable:\s*(true|false)/)?.[1] || 'true';
        const label = entryStr.match(/label:\s*'([^']*)'/)?.[1] || key;
        targetMap.set(
            key,
            `        { key: '${key}', type: '${type}', translatable: ${translatableRaw}, label: '${label}' },`
        );
    }
}

function findPendingFile() {
    for (const path of PENDING_LOCATIONS) {
        if (existsSync(path)) {
            return path;
        }
    }
    return null;
}

function main() {
    // 1. Find pending file
    const pendingPath = findPendingFile();
    if (!pendingPath) {
        console.log('❌ No pending file found in:');
        PENDING_LOCATIONS.forEach(p => console.log(`   - ${p}`));
        console.log('\n   Generate one from Schema Coverage → Used → Add Next Batch');
        process.exit(1);
    }

    console.log(`📁 Found pending file: ${pendingPath}`);

    // 2. Read pending file
    const pending = JSON.parse(readFileSync(pendingPath, 'utf-8'));
    if (!pending.entries || pending.entries.length === 0) {
        console.log('❌ No entries in pending file');
        process.exit(1);
    }

    console.log(`📦 Found ${pending.entries.length} pending entries (prefix: ${pending.prefix || 'none'})`);

    // 3. Read schema.ts
    let schemaContent = readFileSync(SCHEMA_PATH, 'utf-8');

    // 4. Find existing AUTO-GENERATED blocks (there should only be ONE, but we
    //    defensively handle duplicates including orphan blocks without full headers)
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern 1: Full decorated block (header + content + footer)
    const decoratedBlockRegex = new RegExp(
        `${escapeRegExp(BLOCK_START)}\n${escapeRegExp(BLOCK_HEADER)}[\\s\\S]*?${escapeRegExp(BLOCK_END)}\n?`,
        'g'
    );

    // Pattern 2: Orphan 'auto:generated' blocks (just the property without decoration)
    // Matches: 'auto:generated': [ ... ],
    const orphanBlockRegex = /    'auto:generated':\s*\[[\s\S]*?\],?\n?/g;

    // Extract existing entries from ALL blocks
    const existingMap = new Map(); // key -> normalized entry string

    // First pass: extract from decorated blocks
    const decoratedMatches = Array.from(schemaContent.matchAll(decoratedBlockRegex));
    for (const m of decoratedMatches) {
        extractEntriesFromBlock(m[0], existingMap);
    }

    // Remove decorated blocks first
    if (decoratedMatches.length > 0) {
        schemaContent = schemaContent.replace(decoratedBlockRegex, '');
    }

    // Now find any remaining orphan blocks
    const orphanMatches = Array.from(schemaContent.matchAll(orphanBlockRegex));
    for (const m of orphanMatches) {
        extractEntriesFromBlock(m[0], existingMap);
    }

    // Remove orphan blocks
    if (orphanMatches.length > 0) {
        schemaContent = schemaContent.replace(orphanBlockRegex, '');
    }

    // Clean up any trailing decorative separators left behind
    schemaContent = schemaContent.replace(/\n\s*\/\/ ═+\n\s*\n\s*\/\/ ═+\n/g, '\n');
    schemaContent = schemaContent.replace(/\n\n\n+/g, '\n\n');

    const totalBlocks = decoratedMatches.length + orphanMatches.length;
    if (totalBlocks > 0) {
        console.log(`📋 Found ${totalBlocks} AUTO-GENERATED block(s) with ${existingMap.size} unique entries`);
    }

    // 5. Merge entries (dedupe by key)
    const existingSet = new Set(existingMap.keys());
    const newEntries = pending.entries.filter(e => !existingSet.has(e.key));

    if (newEntries.length === 0) {
        console.log('✅ All entries already exist in schema. Nothing to add.');
        unlinkSync(pendingPath);
        console.log('🗑️  Deleted pending file');
        process.exit(0);
    }

    // 6. Build merged entry list (existing + new), then sort by key
    for (const e of newEntries) {
        existingMap.set(
            e.key,
            `        { key: '${e.key}', type: '${e.type}', translatable: ${e.translatable}, label: '${e.label}' },`
        );
    }

    const allEntries = Array.from(existingMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, entry]) => entry);

    const today = new Date().toISOString().split('T')[0];
    const newBlock = `${BLOCK_START}
${BLOCK_HEADER}
// Last updated: ${today}
// DO NOT EDIT MANUALLY - Use "Add Next Batch" in Schema Coverage
${BLOCK_START}

    'auto:generated': [
${allEntries.join('\n')}
    ],

${BLOCK_END}
`;

    // 7. Insert merged block (we already removed all existing blocks above)

    const insertPoint = schemaContent.lastIndexOf('};');
    if (insertPoint === -1) {
        console.log('❌ Could not find CONTENT_SCHEMA closing brace');
        process.exit(1);
    }

    schemaContent = schemaContent.slice(0, insertPoint) + '\n' + newBlock + schemaContent.slice(insertPoint);

    // 8. Write back
    writeFileSync(SCHEMA_PATH, schemaContent);
    console.log(`✅ Added ${newEntries.length} new keys to schema.ts`);

    // 9. Delete pending file
    unlinkSync(pendingPath);
    console.log('🗑️  Deleted pending file');

    // 10. List added keys
    console.log('\n📝 Keys added:');
    newEntries.forEach(e => console.log(`   - ${e.key}`));
}

main();
