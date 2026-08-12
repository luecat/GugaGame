/* Regression checks for the GugaGame runtime without driving user interactions. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(ROOT, 'app-20260812-beta-sync1.js'), 'utf8');

test('GugaGame runtime selectors exist in the page', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const classes = new Set(
    [...html.matchAll(/\bclass="([^"]+)"/g)]
      .flatMap((match) => match[1].split(/\s+/).filter(Boolean)),
  );
  const selectors = [...source.matchAll(/document\.querySelector\('([#.][A-Za-z0-9_-]+)'\)/g)]
    .map((match) => match[1]);

  assert.ok(selectors.length > 80);
  selectors.forEach((selector) => {
    const collection = selector.startsWith('#') ? ids : classes;
    assert.equal(collection.has(selector.slice(1)), true, `missing ${selector}`);
  });
});

test('mobile launch controls use one activation path', () => {
  assert.doesNotMatch(source, /(?:ballButton|adventureButton)\.addEventListener\('(pointerdown|touchstart)'/);
  assert.match(source, /ballButton\.addEventListener\('click'/);
  assert.match(source, /adventureButton\.addEventListener\('click'/);
  assert.match(source, /if \(enabled === isBallMode\) return true;/);
});

test('save codes are bounded before BigInt decoding', () => {
  assert.match(html, /<textarea id="save-code"[^>]*maxlength="128"/);
  const lengthCheck = source.indexOf("code.length > SAVE_CODE_MAX_INPUT_LENGTH");
  const decodeCall = source.indexOf('decodeBase58(checksum)');
  assert.ok(lengthCheck >= 0 && lengthCheck < decodeCall);
});

test('async games have cancellation and timeout escape paths', () => {
  assert.match(source, /waitForAnimation\([^)]*timeoutMs = 1600/);
  assert.match(source, /playSoundAndWait\([^)]*timeoutMs = 6000/);
  assert.match(source, /finally \{[\s\S]*setRpsPlaybackLock\(false\);[\s\S]*\}/);
  assert.doesNotMatch(source, /document\.querySelectorAll\('button, input, select'\)/);
  assert.match(source, /window\.cancelAnimationFrame\(ballPlay\.frame\)/);
  assert.match(source, /window\.clearTimeout\(ballResetTimer\)/);
});

test('background suspension clears active loops and delayed audio', () => {
  assert.match(source, /document\.addEventListener\('visibilitychange'/);
  assert.match(source, /window\.addEventListener\('pagehide', suspendRuntime\)/);
  assert.match(source, /gameSounds\.forEach\(stopSound\)/);
  assert.match(source, /generation !== sound\.playbackGeneration \|\| runtimeSuspended/);
  assert.match(source, /getActiveRuntimeMode\(\) !== 'main' \|\| songInvitation\.open/);
});

test('beta page keeps test-only UI out of public navigation', () => {
  assert.doesNotMatch(html, /href="[^"]*scp-(?:game|parser)/i);
  assert.doesNotMatch(html, /src="[^"]*scp-(?:game|parser)/i);
});
