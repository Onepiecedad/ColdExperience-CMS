#!/usr/bin/env node
// ============================================================================
// NORMALIZE SCHEMA AUTOGEN - Ensures only ONE AUTO-GENERATED block exists
// - Collects entries from all existing AUTO-GENERATED blocks
// - Rewrites schema.ts with a single merged + sorted block
// ============================================================================

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMA_PATH = join(__dirname, '../src/content/schema.ts');

const BLOCK_START = '// ═══════════════════════════════════════════════════════════════════════════';
const BLOCK_HEADER = '// AUTO-GENERATED SCHEMA ENTRIES';
const BLOCK_END = '// ═══════════════════════════════════════════════════════════════════════════';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const autoGenBlockRegex = new RegExp(
  `${escapeRegExp(BLOCK_START)}\n${escapeRegExp(BLOCK_HEADER)}[\\s\\S]*?${escapeRegExp(BLOCK_END)}\n`,
  'g'
);

function main() {
  let schemaContent = readFileSync(SCHEMA_PATH, 'utf-8');
  const blocks = Array.from(schemaContent.matchAll(autoGenBlockRegex)).map(m => m[0]);

  if (blocks.length === 0) {
    console.log('ℹ️  No AUTO-GENERATED blocks found. Nothing to normalize.');
    return;
  }

  const entryMap = new Map(); // key -> entry line
  for (const block of blocks) {
    const entryRegex = /\{\s*key:\s*'([^']+)'[\s\S]*?\}/g;
    let em;
    while ((em = entryRegex.exec(block)) !== null) {
      const entryStr = em[0];
      const key = em[1];
      const type = entryStr.match(/type:\s*'([^']+)'/)?.[1] || 'text';
      const translatableRaw = entryStr.match(/translatable:\s*(true|false)/)?.[1] || 'true';
      const label = entryStr.match(/label:\s*'([^']*)'/)?.[1] || key;

      entryMap.set(
        key,
        `        { key: '${key}', type: '${type}', translatable: ${translatableRaw}, label: '${label}' },`
      );
    }
  }

  const allEntries = Array.from(entryMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, line]) => line);

  const today = new Date().toISOString().split('T')[0];
  const newBlock = `${BLOCK_START}\n${BLOCK_HEADER}\n// Last updated: ${today}\n// DO NOT EDIT MANUALLY - Use "Add Next Batch" in Schema Coverage\n${BLOCK_START}\n\n    'auto:generated': [\n${allEntries.join('\n')}\n    ],\n\n${BLOCK_END}\n`;

  // Remove all existing blocks
  schemaContent = schemaContent.replace(autoGenBlockRegex, '');

  // Insert once before closing brace
  const insertPoint = schemaContent.lastIndexOf('};');
  if (insertPoint === -1) {
    console.error('❌ Could not find CONTENT_SCHEMA closing brace (};)');
    process.exit(1);
  }

  schemaContent = schemaContent.slice(0, insertPoint) + '\n' + newBlock + schemaContent.slice(insertPoint);

  writeFileSync(SCHEMA_PATH, schemaContent);

  console.log(`✅ Normalized AUTO-GENERATED blocks: ${blocks.length} → 1`);
  console.log(`✅ Entries merged: ${entryMap.size}`);
}

main();
