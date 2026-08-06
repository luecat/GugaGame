#!/usr/bin/env node
/* TEST-ONLY SCP MODULE: command-line parser entry point. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseScp, serializeScp } = require('../scp-parser.js');

function usage() {
  console.error('用法：node scripts/parse-scp.js <譜面.scp> [--json]');
}

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const input = args.find((argument) => !argument.startsWith('--'));
  if (!input) {
    usage();
    process.exitCode = 2;
    return;
  }

  const inputPath = path.resolve(input);
  const parsed = await parseScp(fs.readFileSync(inputPath));
  if (jsonMode) {
    process.stdout.write(`${serializeScp(parsed)}\n`);
    return;
  }

  const summary = {
    file: inputPath,
    archive: {
      entries: parsed.archive.entryCount,
      compressedBytes: parsed.archive.compressedBytes,
      inflatedBytes: parsed.archive.inflatedBytes,
    },
    levels: parsed.levels.map((level) => ({
      title: level.metadata.title,
      artists: level.metadata.artists,
      author: level.metadata.author,
      rating: level.metadata.rating,
      engine: level.metadata.engine,
      entities: level.entities.length,
      notes: level.notes.length,
      inputEntities: level.inputEntities.length,
      playableNotes: level.playableNotes.length,
      connectors: level.connectors.length,
      simLines: level.simLines.length,
      guides: level.guides.length,
      bpmChanges: level.bpmChanges.length,
      timeScaleGroups: level.timeScaleGroups.length,
      timeScaleChanges: level.timeScaleChanges.length,
      noteArchetypeCounts: level.noteArchetypeCounts,
      duplicateEntityNames: level.references.duplicateNames.length,
      unresolvedReferences: level.references.unresolved.length,
      warnings: level.warnings,
    })),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`${error.code ? `${error.code}: ` : ''}${error.message}`);
  process.exitCode = 1;
});
