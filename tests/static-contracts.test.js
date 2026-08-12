/* Regression guards for versioned runtime assets and test-only release boundaries. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function idsIn(html) {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
}

function queriedIds(source) {
  return [...source.matchAll(/querySelector\(\s*['"]#([^'"]+)['"]\s*\)/g)]
    .map((match) => match[1]);
}

test('runtime selectors resolve and document ids are unique', () => {
  const contracts = [['index.html', 'app.js']];

  contracts.forEach(([htmlPath, scriptPath]) => {
    const html = read(htmlPath);
    const ids = idsIn(html);
    const available = new Set(ids);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const missing = queriedIds(read(scriptPath)).filter((id) => !available.has(id));
    assert.deepEqual(duplicates, [], `${htmlPath} contains duplicate ids`);
    assert.deepEqual(missing, [], `${scriptPath} queries ids missing from ${htmlPath}`);
  });
});

test('public home page has no SCP parser or rhythm-game entry point', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /href=["'][^"']*scp-(?:game|parser)/i);
  assert.doesNotMatch(html, /src=["'][^"']*scp-(?:game|parser)/i);
  assert.doesNotMatch(html, /debug-tools/i);
});
