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

test('versioned beta runtime assets stay synchronized with their canonical copies', () => {
  assert.equal(read('app-20260812-beta-sync1.js'), read('app.js'));
  assert.equal(read('style-20260812-popup-context1.css'), read('style.css'));
  assert.equal(
    read('test-only/debug/debug-tools-20260812-affection1.js'),
    read('test-only/debug/debug-tools.js'),
  );
  assert.equal(
    read('test-only/debug/debug-tools-20260812-context1.css'),
    read('test-only/debug/debug-tools.css'),
  );
});

test('runtime selectors resolve and document ids are unique', () => {
  const contracts = [
    ['index.html', 'app-20260812-beta-sync1.js'],
    ['scp-game.html', 'scp-game.js'],
    ['scp-parser-demo.html', 'scp-parser-demo.js'],
  ];

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

test('beta home exposes only the test-marked SCP game entry', () => {
  const html = read('index.html');
  assert.match(html, /href=["']scp-game\.html["'][^>]*data-test-module=["']scp-rhythm["'][^>]*data-release-scope=["']beta-only["']/i);
  assert.equal((html.match(/href=["'][^"']*scp-game\.html/gi) ?? []).length, 1);
  assert.doesNotMatch(html, /href=["'][^"']*scp-parser/i);
  assert.doesNotMatch(html, /src=["'][^"']*scp-(?:game|parser)/i);
});

test('rhythm setup exposes calibration before chart selection and loads timing core first', () => {
  const html = read('scp-game.html');
  assert.ok(html.indexOf('id="latency-calibrator"') < html.indexOf('id="scp-file"'));
  assert.ok(html.indexOf('src="rhythm-core.js') < html.indexOf('src="scp-game.js'));
  [
    'speed-slider',
    'lane-tilt-slider',
    'lane-width-slider',
    'judgment-line-slider',
    'volume-slider',
    'input-offset-slider',
    'visual-offset-slider',
  ].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
  ['calibration-status', 'start-calibration', 'calibration-tap', 'apply-calibration']
    .forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
  assert.equal((html.match(/data-calibration-beat=/g) ?? []).length, 4);
});

test('flick confirmation preserves the contact lane and timestamp', () => {
  const source = read('scp-game.js');
  assert.match(source, /queueInputAt\(pointer\.pressedLane, 'flick', pointer\.pressedAt, gesture\.direction\)/);
  assert.match(source, /queueInputAt\(input\.lane, 'flick', input\.pressedAt\)/);
  assert.match(source, /event\.getCoalescedEvents\?\.\(\)/);
  assert.doesNotMatch(source, /queueInputAt\(pointer\.lane, 'flick', sample\.chartTime/);
});

test('rhythm feedback is synthesized locally and includes expanded hit effects', () => {
  const source = read('scp-game.js');
  assert.match(source, /function playHitSound\(note, quality\)/);
  assert.match(source, /context\.createOscillator\(\)/);
  assert.match(source, /createHitNoiseBuffer\(context\)/);
  assert.match(source, /globalCompositeOperation = 'lighter'/);
  assert.match(source, /effect\.critical/);
});

test('rhythm volume is isolated from the main game volume preference', () => {
  const rhythm = read('scp-game.js');
  const main = read('app.js');
  assert.match(main, /VOLUME_STORAGE_KEY = 'gugagame-web-volume'/);
  assert.match(rhythm, /RHYTHM_VOLUME_STORAGE_KEY = 'gugagame-rhythm-volume-v1'/);
  assert.doesNotMatch(rhythm, /localStorage\.(?:getItem|setItem)\('gugagame-web-volume'/);
});
