/* TEST-ONLY SCP MODULE: rhythm timing regression tests. */
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../rhythm-core.js');

test('sanitizes persisted settings while preserving safe custom values', () => {
  assert.deepEqual(core.sanitizeSettings({
    scrollSpeed: 8.26,
    laneTilt: 150,
    laneWidth: '72',
    judgmentLine: null,
    inputOffsetMs: -999,
    visualOffsetMs: 31,
    ignored: 1,
  }), {
    scrollSpeed: 8.3,
    laneTilt: 100,
    laneWidth: 72,
    judgmentLine: 78,
    inputOffsetMs: -300,
    visualOffsetMs: 31,
  });
});

test('maps delayed DOM events onto the audible Web Audio output clock', () => {
  const contextTime = core.contextTimeAtPerformance({
    timestamp: 9_920,
    performanceNow: 10_000,
    timeOrigin: 1_700_000_000_000,
    contextCurrentTime: 20.2,
    outputTimestamp: { contextTime: 20, performanceTime: 10_000 },
  });
  assert.equal(contextTime, 19.92);

  const epochTime = core.contextTimeAtPerformance({
    timestamp: 1_700_000_009_920,
    performanceNow: 10_000,
    timeOrigin: 1_700_000_000_000,
    contextCurrentTime: 20.2,
    outputTimestamp: { contextTime: 20, performanceTime: 10_000 },
  });
  assert.equal(epochTime, 19.92);
});

test('fallback clock accounts for event queue delay and output latency', () => {
  assert.equal(core.contextTimeAtPerformance({
    timestamp: 9_950,
    performanceNow: 10_000,
    contextCurrentTime: 12,
    outputLatency: .03,
  }), 11.92);
});

test('projects a graph event onto the audible output performance timeline', () => {
  assert.equal(core.performanceTimeAtContext({
    contextTime: 20.2,
    performanceNow: 10_000,
    contextCurrentTime: 20.2,
    outputTimestamp: { contextTime: 20, performanceTime: 10_000 },
  }), 10_200);
  assert.equal(core.performanceTimeAtContext({
    contextTime: 12,
    performanceNow: 5_000,
    contextCurrentTime: 12,
    outputLatency: .03,
  }), 5_030);
});

test('visual and input offsets are independent', () => {
  const raw = core.rawChartTime(10, .25);
  assert.equal(raw, 9.75);
  assert.equal(core.visualChartTime(raw, 40), 9.79);
  assert.equal(core.judgmentChartTime(raw, 80), 9.67);
});

test('a delayed callback still judges from its event timestamp', () => {
  const eventContextTime = core.contextTimeAtPerformance({
    timestamp: 10_000,
    performanceNow: 10_080,
    contextCurrentTime: 5.08,
    outputTimestamp: { contextTime: 5.08, performanceTime: 10_080 },
  });
  const note = { index: 1, time: 5, status: 'pending', inputKind: 'direct', renderLane: 1, renderSize: .5 };
  const candidate = core.selectInputCandidate([note], 1, eventContextTime, 'direct');
  assert.equal(candidate.quality, 'perfect');
  assert.ok(Math.abs(candidate.delta) < 1e-9);
});

test('dense inputs target the closest note instead of a stale earlier note', () => {
  const notes = [
    { index: 1, time: 1, status: 'pending', inputKind: 'direct', renderLane: 1, renderSize: .5 },
    { index: 2, time: 1.2, status: 'pending', inputKind: 'direct', renderLane: 1, renderSize: .5 },
  ];
  const candidate = core.selectInputCandidate(notes, 1, 1.12, 'direct');
  assert.equal(candidate.note.index, 2);
  assert.equal(candidate.quality, 'great');
});

test('equal-distance notes resolve toward the earlier note deterministically', () => {
  const notes = [
    { index: 2, time: 1.2, status: 'pending', inputKind: 'direct', renderLane: 0, renderSize: .5 },
    { index: 1, time: 1, status: 'pending', inputKind: 'direct', renderLane: 0, renderSize: .5 },
  ];
  assert.equal(core.selectInputCandidate(notes, 0, 1.1, 'direct').note.index, 1);
});

test('a timestamp-valid queued input can replace a provisional miss', () => {
  const note = { index: 1, time: 4, status: 'miss', inputKind: 'direct', renderLane: 0, renderSize: .5 };
  const candidate = core.selectInputCandidate([note], 0, 4.03, 'direct');
  assert.equal(candidate.note, note);
  assert.equal(candidate.quality, 'perfect');
});

test('sustain recovery uses the five-frame Project Sekai contact window', () => {
  assert.equal(core.sustainQualityAt(2, 1.82, true), null);
  assert.equal(core.sustainQualityAt(2, 2, true), 'perfect');
  assert.equal(core.sustainQualityAt(2, 2.08, true), 'perfect');
  assert.equal(core.sustainQualityAt(2, 2.084, true), null);
  assert.equal(core.sustainQualityAt(2, 2, false), null);
});

test('judgment profiles match Project Sekai frame windows', () => {
  assert.equal(core.qualityForDelta(.041), 'perfect');
  assert.equal(core.qualityForDelta(.042), 'great');
  assert.equal(core.qualityForDelta(.084), 'good');
  assert.equal(core.qualityForDelta(.109), 'bad');
  assert.equal(core.qualityForDelta(.126), null);

  const critical = core.profileForNote({ archetype: 'CriticalTapNote' });
  assert.equal(core.qualityForDelta(.054, critical), 'perfect');
  assert.equal(core.qualityForDelta(.056, critical), 'great');

  const flick = core.profileForNote({ archetype: 'NormalFlickNote' });
  assert.equal(core.qualityForDelta(.13, flick), 'good');
  assert.equal(core.qualityForDelta(.14, flick), 'bad');
});

test('spatial judgment adds touch forgiveness outside the drawn note', () => {
  const note = { renderLane: 0, renderSize: .5 };
  assert.equal(core.laneMatches(note, 1.3), true);
  assert.equal(core.laneMatches(note, 1.4), false);
});

test('flicks require the requested horizontal direction when one is specified', () => {
  assert.equal(core.flickDirectionMatches({ direction: 1 }, 1), true);
  assert.equal(core.flickDirectionMatches({ direction: 1 }, -1), false);
  assert.equal(core.flickDirectionMatches({ direction: 0 }, -1), true);
});

test('flick gesture rejects slow drags and reports a fast direction', () => {
  assert.equal(core.analyzeFlickGesture([
    { x: 10, y: 20, performanceTime: 0 },
    { x: 50, y: 21, performanceTime: 500 },
  ]), null);
  const gesture = core.analyzeFlickGesture([
    { x: 10, y: 20, performanceTime: 1000 },
    { x: 42, y: 24, performanceTime: 1100 },
  ]);
  assert.equal(gesture.direction, 1);
  assert.ok(gesture.velocityPxPerSecond > 300);
});

test('miss commit grace does not widen the input judgment window', () => {
  assert.equal(core.shouldCommitMiss(1, 1.2, .075), false);
  assert.equal(core.shouldCommitMiss(1, 1.256, .075), true);
  const note = { index: 1, time: 1, status: 'pending', inputKind: 'direct', renderLane: 0, renderSize: .5 };
  assert.equal(core.selectInputCandidate([note], 0, 1.2, 'direct'), null);
});

test('stage geometry keeps drawing and pointer lane conversion inverse', () => {
  const geometry = core.stageGeometry(1200, 800, { laneTilt: 43, laneWidth: 118, judgmentLine: 79 });
  [-5, -2.5, 0, 3, 5.75].forEach((lane) => {
    const y = geometry.horizonY + (geometry.judgmentY - geometry.horizonY) * .63;
    assert.ok(Math.abs(core.xToLane(core.laneToX(lane, y, geometry), y, geometry) - lane) < 1e-9);
  });
});

test('scroll speed is continuous, monotonic, and preserves the old default feel', () => {
  assert.ok(core.approachTimeForSpeed(1) > core.approachTimeForSpeed(7));
  assert.ok(core.approachTimeForSpeed(7) > core.approachTimeForSpeed(15));
  assert.ok(Math.abs(core.approachTimeForSpeed(7) - 2) < 1e-9);
});

test('calibration targets the fourth beat and uses recent median samples', () => {
  assert.deepEqual(core.calibrationBeatTimes(10, .5, 4), [10, 10.5, 11, 11.5]);
  assert.equal(core.suggestInputOffset([60, 70, 250]), 70);
  assert.equal(core.suggestInputOffset([700]), null);
  assert.deepEqual(core.calibrationStats([38, 41, 45, 40]), {
    count: 4,
    suggestion: 41,
    standardDeviationMs: Math.sqrt(6.5),
    reliable: true,
  });
  assert.equal(core.calibrationStats([-80, 80, -90, 90]).reliable, false);
});
