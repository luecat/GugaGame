/* TEST-ONLY SCP MODULE: deterministic rhythm timing and stage helpers. */
(function initRhythmCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GugaRhythmCore = api;
  if (root?.window && root.window !== root) root.window.GugaRhythmCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const FRAME_SECONDS = 1 / 60;
  const JUDGMENT_PROFILES = Object.freeze({
    normal: Object.freeze({
      perfectBefore: 2.5 * FRAME_SECONDS,
      perfectAfter: 2.5 * FRAME_SECONDS,
      greatBefore: 5 * FRAME_SECONDS,
      greatAfter: 5 * FRAME_SECONDS,
      goodBefore: 6.5 * FRAME_SECONDS,
      goodAfter: 6.5 * FRAME_SECONDS,
      badBefore: 7.5 * FRAME_SECONDS,
      badAfter: 7.5 * FRAME_SECONDS,
    }),
    critical: Object.freeze({
      perfectBefore: 3.3 * FRAME_SECONDS,
      perfectAfter: 3.3 * FRAME_SECONDS,
      greatBefore: 4.5 * FRAME_SECONDS,
      greatAfter: 4.5 * FRAME_SECONDS,
      goodBefore: 6.5 * FRAME_SECONDS,
      goodAfter: 6.5 * FRAME_SECONDS,
      badBefore: 7.5 * FRAME_SECONDS,
      badAfter: 7.5 * FRAME_SECONDS,
    }),
    flick: Object.freeze({
      perfectBefore: 2.5 * FRAME_SECONDS,
      perfectAfter: 2.5 * FRAME_SECONDS,
      greatBefore: 6.5 * FRAME_SECONDS,
      greatAfter: 7.5 * FRAME_SECONDS,
      goodBefore: 7 * FRAME_SECONDS,
      goodAfter: 8 * FRAME_SECONDS,
      badBefore: 7.5 * FRAME_SECONDS,
      badAfter: 8.5 * FRAME_SECONDS,
    }),
    flickCritical: Object.freeze({
      perfectBefore: 3.5 * FRAME_SECONDS,
      perfectAfter: 3.5 * FRAME_SECONDS,
      greatBefore: 6.5 * FRAME_SECONDS,
      greatAfter: 7.5 * FRAME_SECONDS,
      goodBefore: 7 * FRAME_SECONDS,
      goodAfter: 8 * FRAME_SECONDS,
      badBefore: 7.5 * FRAME_SECONDS,
      badAfter: 8.5 * FRAME_SECONDS,
    }),
  });
  const JUDGMENT_WINDOWS = Object.freeze({
    perfect: JUDGMENT_PROFILES.normal.perfectAfter,
    great: JUDGMENT_PROFILES.normal.greatAfter,
    good: JUDGMENT_PROFILES.normal.goodAfter,
    bad: JUDGMENT_PROFILES.normal.badAfter,
  });
  const SUSTAIN_WINDOW = 5 * FRAME_SECONDS;
  const DEFAULT_SETTINGS = Object.freeze({
    scrollSpeed: 7,
    laneTilt: 100,
    laneWidth: 100,
    judgmentLine: 78,
    inputOffsetMs: 0,
    visualOffsetMs: 0,
  });
  const SETTING_RULES = Object.freeze({
    scrollSpeed: { min: 1, max: 15, step: .1 },
    laneTilt: { min: 0, max: 100, step: 1 },
    laneWidth: { min: 55, max: 130, step: 1 },
    judgmentLine: { min: 68, max: 90, step: 1 },
    inputOffsetMs: { min: -300, max: 300, step: 1 },
    visualOffsetMs: { min: -200, max: 200, step: 1 },
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundToStep(value, min, step) {
    const precision = Math.max(0, (String(step).split('.')[1] || '').length);
    return Number((min + Math.round((value - min) / step) * step).toFixed(precision));
  }

  function sanitizeSettings(value) {
    const source = value && typeof value === 'object' ? value : {};
    return Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => {
      const rule = SETTING_RULES[key];
      const raw = source[key];
      const numeric = typeof raw === 'number' || (typeof raw === 'string' && raw.trim()) ? Number(raw) : NaN;
      const safe = Number.isFinite(numeric) ? numeric : fallback;
      return [key, roundToStep(clamp(safe, rule.min, rule.max), rule.min, rule.step)];
    }));
  }

  function normalizePerformanceTimestamp(timestamp, nowMs, timeOriginMs = 0) {
    const now = Number(nowMs);
    const candidate = Number(timestamp);
    if (!Number.isFinite(now)) return 0;
    if (!Number.isFinite(candidate) || candidate <= 0) return now;
    if (Math.abs(candidate - now) <= 60_000) return candidate;
    if (Number.isFinite(timeOriginMs) && timeOriginMs > 0) {
      const relative = candidate - timeOriginMs;
      if (Math.abs(relative - now) <= 60_000) return relative;
    }
    return now;
  }

  function contextTimeAtPerformance({
    timestamp,
    performanceNow,
    timeOrigin = 0,
    contextCurrentTime,
    outputTimestamp,
    outputLatency = 0,
    baseLatency = 0,
  }) {
    const eventPerformanceTime = normalizePerformanceTimestamp(timestamp, performanceNow, timeOrigin);
    const anchorContextTime = Number(outputTimestamp?.contextTime);
    const anchorPerformanceTime = Number(outputTimestamp?.performanceTime);
    if (Number.isFinite(anchorContextTime) && anchorContextTime >= 0
      && Number.isFinite(anchorPerformanceTime) && anchorPerformanceTime > 0
      && Math.abs(anchorPerformanceTime - performanceNow) <= 60_000) {
      return anchorContextTime + (eventPerformanceTime - anchorPerformanceTime) / 1000;
    }
    const latency = Math.max(0, Number(outputLatency) || 0) + Math.max(0, Number(baseLatency) || 0);
    return Number(contextCurrentTime || 0) - latency - (performanceNow - eventPerformanceTime) / 1000;
  }

  function performanceTimeAtContext({
    contextTime,
    performanceNow,
    contextCurrentTime,
    outputTimestamp,
    outputLatency = 0,
    baseLatency = 0,
  }) {
    const targetContextTime = Number(contextTime);
    const now = Number(performanceNow);
    const anchorContextTime = Number(outputTimestamp?.contextTime);
    const anchorPerformanceTime = Number(outputTimestamp?.performanceTime);
    if (Number.isFinite(targetContextTime) && Number.isFinite(now)
      && Number.isFinite(anchorContextTime) && anchorContextTime >= 0
      && Number.isFinite(anchorPerformanceTime) && anchorPerformanceTime > 0
      && Math.abs(anchorPerformanceTime - now) <= 60_000) {
      return anchorPerformanceTime + (targetContextTime - anchorContextTime) * 1000;
    }
    const latency = Math.max(0, Number(outputLatency) || 0) + Math.max(0, Number(baseLatency) || 0);
    return now + (targetContextTime - Number(contextCurrentTime || 0) + latency) * 1000;
  }

  function rawChartTime(playbackTime, bgmOffset = 0) {
    return Number(playbackTime || 0) - Number(bgmOffset || 0);
  }

  function visualChartTime(chartTime, visualOffsetMs = 0) {
    return Number(chartTime || 0) + Number(visualOffsetMs || 0) / 1000;
  }

  function judgmentChartTime(chartTime, inputOffsetMs = 0) {
    return Number(chartTime || 0) - Number(inputOffsetMs || 0) / 1000;
  }

  function profileForNote(note) {
    const archetype = String(note?.archetype || '');
    const critical = archetype.startsWith('Critical');
    if (archetype.includes('Flick')) return critical ? JUDGMENT_PROFILES.flickCritical : JUDGMENT_PROFILES.flick;
    return critical ? JUDGMENT_PROFILES.critical : JUDGMENT_PROFILES.normal;
  }

  function qualityForDelta(delta, profile = JUDGMENT_PROFILES.normal) {
    const side = delta < 0 ? 'Before' : 'After';
    const absolute = Math.abs(delta);
    if (absolute <= profile[`perfect${side}`]) return 'perfect';
    if (absolute <= profile[`great${side}`]) return 'great';
    if (absolute <= profile[`good${side}`]) return 'good';
    if (absolute <= profile[`bad${side}`]) return 'bad';
    return null;
  }

  function laneMatches(note, lane, forgiveness = .85) {
    if (!Number.isFinite(note?.renderLane) || !Number.isFinite(note?.renderSize) || !Number.isFinite(lane)) return false;
    return lane >= note.renderLane - note.renderSize - forgiveness
      && lane <= note.renderLane + note.renderSize + forgiveness;
  }

  function flickDirectionMatches(note, gestureDirection) {
    if (gestureDirection === null || gestureDirection === undefined) return true;
    const required = Math.sign(Number(note?.direction) || 0);
    return required === 0 || required === Math.sign(gestureDirection);
  }

  function analyzeFlickGesture(samples, {
    maxDurationMs = 180,
    minDistancePx = 24,
    minVelocityPxPerSecond = 180,
  } = {}) {
    if (!Array.isArray(samples) || samples.length < 2) return null;
    const start = samples[0];
    const end = samples[samples.length - 1];
    const elapsedMs = Number(end.performanceTime) - Number(start.performanceTime);
    const deltaX = Number(end.x) - Number(start.x);
    const deltaY = Number(end.y) - Number(start.y);
    if (![elapsedMs, deltaX, deltaY].every(Number.isFinite) || elapsedMs <= 0 || elapsedMs > maxDurationMs) return null;
    const distancePx = Math.hypot(deltaX, deltaY);
    const velocityPxPerSecond = distancePx / elapsedMs * 1000;
    if (distancePx < minDistancePx || velocityPxPerSecond < minVelocityPxPerSecond) return null;
    return {
      direction: Math.abs(deltaX) >= Math.abs(deltaY) * .5 ? Math.sign(deltaX) : 0,
      distancePx,
      elapsedMs,
      velocityPxPerSecond,
    };
  }

  function selectInputCandidate(notes, lane, chartTime, inputKind, gestureDirection = null) {
    let candidate = null;
    notes.forEach((note) => {
      if (!['pending', 'miss'].includes(note.status) || note.inputKind !== inputKind || !laneMatches(note, lane)) return;
      if (inputKind === 'flick' && !flickDirectionMatches(note, gestureDirection)) return;
      const delta = chartTime - note.time;
      const quality = qualityForDelta(delta, profileForNote(note));
      if (!quality) return;
      const distance = Math.abs(delta);
      const candidateDistance = candidate ? Math.abs(candidate.delta) : Infinity;
      const distancesTie = Math.abs(distance - candidateDistance) < 1e-9;
      if (!candidate || distance < candidateDistance - 1e-9
        || (distancesTie && (note.time < candidate.note.time
          || (note.time === candidate.note.time && note.index < candidate.note.index)))) {
        candidate = { note, delta, quality };
      }
    });
    return candidate;
  }

  function sustainQualityAt(noteTime, chartTime, isHeld) {
    if (!isHeld) return null;
    const delta = chartTime - noteTime;
    return delta >= 0 && delta <= SUSTAIN_WINDOW ? 'perfect' : null;
  }

  function shouldCommitMiss(noteTime, chartTime, queueGrace = .075, lateWindow = JUDGMENT_WINDOWS.bad) {
    return chartTime - noteTime > Math.max(0, lateWindow) + Math.max(0, queueGrace);
  }

  function approachTimeForSpeed(speed) {
    const normalized = clamp(Number(speed) || DEFAULT_SETTINGS.scrollSpeed, 1, 15);
    const decay = Math.pow(2 / 4.4, 1 / 6);
    return clamp(4.4 * Math.pow(decay, normalized - 1), .55, 4.4);
  }

  function stageGeometry(viewportWidth, viewportHeight, inputSettings = DEFAULT_SETTINGS) {
    const width = Math.max(1, Number(viewportWidth) || 1);
    const height = Math.max(1, Number(viewportHeight) || 1);
    const settings = sanitizeSettings(inputSettings);
    const nearBase = Math.min(width * (width < 700 ? .94 : .72), 1600);
    const nearWidth = clamp(nearBase * settings.laneWidth / 100, width * .25, width * 1.24);
    const convergence = settings.laneTilt / 100;
    const farBase = Math.min(nearBase, width * .08);
    const farWidth = (nearBase - (nearBase - farBase) * convergence) * settings.laneWidth / 100;
    const horizonY = height * (.035 + (1 - convergence) * .18);
    const judgmentY = height * settings.judgmentLine / 100;
    return { width, height, centerX: width / 2, horizonY, judgmentY, nearWidth, farWidth };
  }

  function fieldWidthAt(y, geometry) {
    const span = Math.max(1, geometry.judgmentY - geometry.horizonY);
    const progress = clamp((y - geometry.horizonY) / span, 0, 1);
    return geometry.farWidth + (geometry.nearWidth - geometry.farWidth) * progress;
  }

  function laneToX(lane, y, geometry) {
    return geometry.centerX + lane / 12 * fieldWidthAt(y, geometry);
  }

  function xToLane(x, y, geometry) {
    return clamp((x - geometry.centerX) / fieldWidthAt(y, geometry) * 12, -6, 6);
  }

  function calibrationBeatTimes(startContextTime, beatDuration = .5, beatCount = 4) {
    const count = Math.max(1, Math.floor(beatCount));
    return Array.from({ length: count }, (_, index) => startContextTime + index * beatDuration);
  }

  function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function suggestInputOffset(samples, maxAbsoluteMs = 500) {
    const valid = samples.map(Number).filter((sample) => Number.isFinite(sample) && Math.abs(sample) <= maxAbsoluteMs);
    if (!valid.length) return null;
    return clamp(Math.round(median(valid)), SETTING_RULES.inputOffsetMs.min, SETTING_RULES.inputOffsetMs.max);
  }

  function calibrationStats(samples, minSamples = 4, maxStandardDeviationMs = 30) {
    const valid = samples.map(Number).filter((sample) => Number.isFinite(sample) && Math.abs(sample) <= 500);
    if (!valid.length) return { count: 0, suggestion: null, standardDeviationMs: null, reliable: false };
    const mean = valid.reduce((total, sample) => total + sample, 0) / valid.length;
    const variance = valid.reduce((total, sample) => total + (sample - mean) ** 2, 0) / valid.length;
    const standardDeviationMs = Math.sqrt(variance);
    return {
      count: valid.length,
      suggestion: suggestInputOffset(valid),
      standardDeviationMs,
      reliable: valid.length >= minSamples && standardDeviationMs <= maxStandardDeviationMs,
    };
  }

  return Object.freeze({
    JUDGMENT_WINDOWS,
    JUDGMENT_PROFILES,
    SUSTAIN_WINDOW,
    DEFAULT_SETTINGS,
    SETTING_RULES,
    clamp,
    sanitizeSettings,
    normalizePerformanceTimestamp,
    contextTimeAtPerformance,
    performanceTimeAtContext,
    rawChartTime,
    visualChartTime,
    judgmentChartTime,
    qualityForDelta,
    profileForNote,
    laneMatches,
    flickDirectionMatches,
    analyzeFlickGesture,
    selectInputCandidate,
    sustainQualityAt,
    shouldCommitMiss,
    approachTimeForSpeed,
    stageGeometry,
    fieldWidthAt,
    laneToX,
    xToLane,
    calibrationBeatTimes,
    suggestInputOffset,
    calibrationStats,
  });
});
