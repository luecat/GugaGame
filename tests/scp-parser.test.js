/* TEST-ONLY SCP MODULE: parser regression tests. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const fflate = require('../vendor/fflate-0.8.3.js');
const { parseScp, serializeScp, ScpParseError } = require('../scp-parser.js');

const encoder = new TextEncoder();
const LEVEL_HASH = '1111111111111111111111111111111111111111';
const ENGINE_HASH = '2222222222222222222222222222222222222222';

function jsonBytes(value) {
  return encoder.encode(JSON.stringify(value));
}

function gzipJson(value) {
  return fflate.gzipSync(jsonBytes(value), { mtime: 0 });
}

function makeScp() {
  const levelData = {
    bgmOffset: 0.25,
    entities: [
      { archetype: '#BPM_CHANGE', data: [{ name: '#BEAT', value: 0 }, { name: '#BPM', value: 120 }] },
      { archetype: '#BPM_CHANGE', data: [{ name: '#BEAT', value: 4 }, { name: '#BPM', value: 240 }] },
      { archetype: 'NormalTapNote', data: [{ name: '#BEAT', value: 2 }, { name: 'lane', value: -1 }, { name: 'size', value: 2 }] },
      { archetype: 'HiddenSlideStartNote', name: 'start', data: [{ name: '#BEAT', value: 3 }, { name: 'lane', value: 1 }, { name: 'size', value: 1 }] },
      { archetype: 'NormalTraceSlideEndNote', name: 'end', data: [{ name: '#BEAT', value: 5 }, { name: 'slide', ref: 'connector' }] },
      { archetype: 'NormalSlideConnector', name: 'connector', data: [{ name: 'start', ref: 'start' }, { name: 'end', ref: 'end' }] },
      { archetype: 'CustomInput', data: [{ name: '#BEAT', value: 6 }] },
    ],
  };
  const engineData = {
    archetypes: [
      { name: 'NormalTapNote', hasInput: true, imports: [] },
      { name: 'HiddenSlideStartNote', hasInput: false, imports: [] },
      { name: 'NormalTraceSlideEndNote', hasInput: true, imports: [] },
      { name: 'NormalSlideConnector', hasInput: false, imports: [] },
      { name: 'CustomInput', hasInput: true, imports: [] },
    ],
  };
  const detail = {
    item: {
      name: 'fixture', version: 1, rating: 10, title: 'Fixture', artists: 'Test', author: 'Codex',
      engine: { name: 'fixture-engine', version: 1, title: 'Fixture Engine', playData: { hash: ENGINE_HASH } },
      data: { hash: LEVEL_HASH },
      bgm: { hash: '3333333333333333333333333333333333333333' },
    },
    description: 'Parser fixture',
  };
  return fflate.zipSync({
    'sonolus/package': jsonBytes({ shouldUpdate: false }),
    'sonolus/info': jsonBytes({ title: 'Fixture SCP' }),
    'sonolus/levels/fixture': jsonBytes(detail),
    [`sonolus/repository/${LEVEL_HASH}`]: gzipJson(levelData),
    [`sonolus/repository/${ENGINE_HASH}`]: gzipJson(engineData),
  }, { level: 6 });
}

test('parses every note while distinguishing playable notes', async () => {
  const parsed = await parseScp(makeScp());
  const level = parsed.levels[0];

  assert.equal(parsed.format, 'sonolus-collection-package');
  assert.equal(level.entities.length, 7);
  assert.equal(level.notes.length, 4);
  assert.equal(level.inputEntities.length, 3);
  assert.equal(level.playableNotes.length, 3);
  assert.deepEqual(level.notes.map((note) => note.archetype), [
    'NormalTapNote', 'HiddenSlideStartNote', 'NormalTraceSlideEndNote', 'CustomInput',
  ]);
  assert.equal(level.connectors.length, 1);
  assert.equal(level.assets.bgm.hash, '3333333333333333333333333333333333333333');
  assert.equal(level.references.unresolved.length, 0);
  assert.equal(level.references.duplicateNames.length, 0);
  assert.equal(JSON.parse(serializeScp(parsed)).levels[0].notes.length, 4);
});

test('converts beats across BPM changes without applying bgmOffset', async () => {
  const parsed = await parseScp(makeScp());
  const level = parsed.levels[0];
  const tap = level.notes.find((note) => note.archetype === 'NormalTapNote');
  const slideEnd = level.notes.find((note) => note.archetype === 'NormalTraceSlideEndNote');

  assert.equal(level.bgmOffset, 0.25);
  assert.equal(tap.time, 1);
  assert.equal(slideEnd.time, 2.25);
});

test('rejects input that is not a ZIP archive', async () => {
  await assert.rejects(
    parseScp(encoder.encode('not an scp')),
    (error) => error instanceof ScpParseError && error.code === 'INVALID_ZIP',
  );
});

test('registers the parser on window when globalThis is a separate object', () => {
  const window = { fflate };
  const context = vm.createContext({ window, TextDecoder, TextEncoder });
  const source = fs.readFileSync(require.resolve('../scp-parser.js'), 'utf8');

  vm.runInContext(source, context);

  assert.equal(typeof window.GugaScpParser?.parseScp, 'function');
  assert.equal(context.GugaScpParser, window.GugaScpParser);
});
