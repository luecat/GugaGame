/* TEST-ONLY SCP MODULE: rhythm-game controller. */
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const setupPanel = document.querySelector('#setup-panel');
const fileInput = document.querySelector('#scp-file');
const loadStatus = document.querySelector('#load-status');
const trackCard = document.querySelector('#track-card');
const trackCover = document.querySelector('#track-cover');
const startButton = document.querySelector('#start-game');
const speedSlider = document.querySelector('#speed-slider');
const speedOutput = document.querySelector('#speed-output');
const laneTiltSlider = document.querySelector('#lane-tilt-slider');
const laneTiltOutput = document.querySelector('#lane-tilt-output');
const laneWidthSlider = document.querySelector('#lane-width-slider');
const laneWidthOutput = document.querySelector('#lane-width-output');
const judgmentLineSlider = document.querySelector('#judgment-line-slider');
const judgmentLineOutput = document.querySelector('#judgment-line-output');
const volumeSlider = document.querySelector('#volume-slider');
const volumeOutput = document.querySelector('#volume-output');
const inputOffsetSlider = document.querySelector('#input-offset-slider');
const inputOffsetOutput = document.querySelector('#input-offset-output');
const visualOffsetSlider = document.querySelector('#visual-offset-slider');
const visualOffsetOutput = document.querySelector('#visual-offset-output');
const resetSettingsButton = document.querySelector('#reset-settings');
const calibrationBeats = [...document.querySelectorAll('[data-calibration-beat]')];
const calibrationStatus = document.querySelector('#calibration-status');
const startCalibrationButton = document.querySelector('#start-calibration');
const calibrationTapButton = document.querySelector('#calibration-tap');
const applyCalibrationButton = document.querySelector('#apply-calibration');
const gameHud = document.querySelector('#game-hud');
const gameControls = document.querySelector('#game-controls');
const pauseButton = document.querySelector('#pause-game');
const exitButton = document.querySelector('#exit-game');
const pauseOverlay = document.querySelector('#pause-overlay');
const judgmentLabel = document.querySelector('#judgment');
const readyMessage = document.querySelector('#ready-message');
const resultPanel = document.querySelector('#result-panel');
const retryButton = document.querySelector('#retry-game');
const chooseChartButton = document.querySelector('#choose-chart');
const scoreValue = document.querySelector('#score-value');
const comboValue = document.querySelector('#combo-value');
const lifeValue = document.querySelector('#life-value');
const scpParser = window.GugaScpParser;
const rhythmCore = window.GugaRhythmCore;

const KEY_LANES = new Map([
  ['s', -5], ['d', -3], ['f', -1], ['j', 1], ['k', 3], ['l', 5],
]);
const MISS_COMMIT_GRACE = .1;
const INPUT_SETTLE_GRACE = .5;
const LANE_MIN = -6;
const LANE_MAX = 6;
const FLICK_DISTANCE_PX = 24;
const FLICK_WINDOW_MS = 180;
const FLICK_MIN_VELOCITY = 180;
const CALIBRATION_ROUNDS = 8;
const SETTINGS_STORAGE_KEY = 'gugagame-rhythm-settings-v1';
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

function loadVolumeSetting() {
  try {
    const stored = localStorage.getItem('gugagame-web-volume');
    const value = stored === null ? 1 : Number(stored);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
  } catch {
    return 1;
  }
}

let volumeSetting = loadVolumeSetting();

class ChartAudioPlayer {
  constructor() {
    this.context = null;
    this.gain = null;
    this.buffer = null;
    this.source = null;
    this.position = 0;
    this.startedAt = 0;
    this.sourceStartAt = 0;
    this.freezeBeforeStart = false;
    this.playing = false;
    this.playToken = 0;
    this.onended = null;
  }

  ensureContext() {
    if (!AudioContextClass) throw new Error('這個瀏覽器不支援 Web Audio API。');
    if (!this.context) {
      this.context = new AudioContextClass();
      this.gain = this.context.createGain();
      this.gain.gain.value = volumeSetting;
      this.gain.connect(this.context.destination);
    }
    return this.context;
  }

  async load(bytes) {
    const context = this.ensureContext();
    this.stop();
    const copy = bytes.slice().buffer;
    this.buffer = await context.decodeAudioData(copy);
    this.position = 0;
  }

  contextTimeAt(timestamp = performance.now()) {
    if (!this.context || !rhythmCore) return this.context?.currentTime || 0;
    let outputTimestamp = null;
    try { outputTimestamp = this.context.getOutputTimestamp?.() || null; } catch {}
    const performanceNow = performance.now();
    return rhythmCore.contextTimeAtPerformance({
      timestamp,
      performanceNow,
      timeOrigin: performance.timeOrigin,
      contextCurrentTime: this.context.currentTime,
      outputTimestamp,
      outputLatency: this.context.outputLatency,
      baseLatency: this.context.baseLatency,
    });
  }

  playbackTimeAt(timestamp = performance.now()) {
    if (!this.playing || !this.context) return this.position;
    const outputContextTime = this.contextTimeAt(timestamp);
    if (this.freezeBeforeStart && outputContextTime <= this.sourceStartAt) return this.position;
    return Math.min(this.buffer?.duration || Infinity, this.position + outputContextTime - this.sourceStartAt);
  }

  get currentTime() {
    return this.playbackTimeAt(performance.now());
  }

  async play(from = this.position, leadIn = .04, freezeBeforeStart = false) {
    if (!this.buffer) throw new Error('音源尚未完成解碼。');
    this.stopSource();
    await this.context.resume();
    this.position = Math.max(0, Math.min(from, Math.max(0, this.buffer.duration - .001)));
    const token = ++this.playToken;
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.gain);
    source.addEventListener('ended', () => {
      if (token !== this.playToken || !this.playing) return;
      const audibleEndAt = this.performanceTimeAt(this.startedAt + this.buffer.duration);
      this.position = this.buffer.duration;
      this.playing = false;
      this.source = null;
      try { source.disconnect(); } catch {}
      this.onended?.(audibleEndAt);
    }, { once: true });
    this.source = source;
    const startContextTime = this.context.currentTime + Math.max(0, leadIn);
    this.sourceStartAt = startContextTime;
    this.freezeBeforeStart = freezeBeforeStart;
    this.startedAt = startContextTime - this.position;
    this.playing = true;
    source.start(startContextTime, this.position);
  }

  performanceTimeAt(contextTime) {
    if (!this.context || !rhythmCore) return performance.now();
    let outputTimestamp = null;
    try { outputTimestamp = this.context.getOutputTimestamp?.() || null; } catch {}
    return rhythmCore.performanceTimeAtContext({
      contextTime,
      performanceNow: performance.now(),
      contextCurrentTime: this.context.currentTime,
      outputTimestamp,
      outputLatency: this.context.outputLatency,
      baseLatency: this.context.baseLatency,
    });
  }

  pause() {
    if (!this.playing) return;
    this.position = Math.max(0, this.currentTime);
    this.playing = false;
    this.stopSource();
  }

  stopSource() {
    if (!this.source) return;
    this.playToken += 1;
    try { this.source.stop(); } catch {}
    this.source.disconnect();
    this.source = null;
  }

  stop() {
    this.playing = false;
    this.stopSource();
    this.position = 0;
  }
}

const audioPlayer = new ChartAudioPlayer();
const game = {
  parsed: null,
  level: null,
  entityByName: new Map(),
  notes: [],
  scoreNotes: [],
  unresolvedPlayableNotes: 0,
  connectors: [],
  simLines: [],
  timeScaleMaps: new Map(),
  running: false,
  paused: false,
  frame: 0,
  audioEndedAt: null,
  audioEndChartTime: 0,
  scoreWeight: 0,
  combo: 0,
  maxCombo: 0,
  life: 100,
  judged: 0,
  counts: { perfect: 0, great: 0, good: 0, miss: 0 },
  activePointers: new Map(),
  activeKeys: new Map(),
  inputQueue: [],
  inputSequence: 0,
  holdSegments: [],
  openHolds: new Map(),
  hitEffects: [],
  lastJudgmentAt: 0,
  tailPausedAt: null,
  coverImage: null,
  coverUrl: null,
};
let settings = rhythmCore?.sanitizeSettings() || {
  scrollSpeed: 7,
  laneTilt: 100,
  laneWidth: 100,
  judgmentLine: 86,
  inputOffsetMs: 0,
  visualOffsetMs: 0,
};
const calibration = {
  running: false,
  frame: 0,
  beatTimes: [],
  oscillators: [],
  samples: [],
  suggestion: null,
  lastInputAt: -Infinity,
  suppressClickUntil: -Infinity,
};

function setLoadStatus(message, state = '') {
  loadStatus.textContent = message;
  loadStatus.classList.toggle('is-error', state === 'error');
  loadStatus.classList.toggle('is-working', state === 'working');
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadSettings() {
  if (!rhythmCore) return settings;
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return rhythmCore.sanitizeSettings(stored ? JSON.parse(stored) : null);
  } catch {
    return rhythmCore.sanitizeSettings();
  }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch {}
}

function signedMilliseconds(value) {
  const numeric = Number(value) || 0;
  return `${numeric > 0 ? '+' : ''}${numeric} ms`;
}

function syncVolumeControl() {
  const percent = Math.round(volumeSetting * 100);
  volumeSlider.value = percent;
  volumeOutput.value = `${percent}%`;
}

function updateVolume(value, persist = false) {
  volumeSetting = clamp(Number(value) / 100, 0, 1);
  syncVolumeControl();
  if (audioPlayer.gain && audioPlayer.context) {
    audioPlayer.gain.gain.setValueAtTime(volumeSetting, audioPlayer.context.currentTime);
  }
  if (persist) {
    try { localStorage.setItem('gugagame-web-volume', String(volumeSetting)); } catch {}
  }
  if (calibration.running && volumeSetting <= 0) {
    stopCalibration();
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = '音量已設為 0%，這次延遲測試已取消。請調高音量後重新開始。';
  }
}

const settingControls = {
  scrollSpeed: { input: speedSlider, output: speedOutput, format: (value) => Number(value).toFixed(1) },
  laneTilt: { input: laneTiltSlider, output: laneTiltOutput, format: (value) => `${value}%` },
  laneWidth: { input: laneWidthSlider, output: laneWidthOutput, format: (value) => `${value}%` },
  judgmentLine: { input: judgmentLineSlider, output: judgmentLineOutput, format: (value) => `${value}%` },
  inputOffsetMs: { input: inputOffsetSlider, output: inputOffsetOutput, format: signedMilliseconds },
  visualOffsetMs: { input: visualOffsetSlider, output: visualOffsetOutput, format: signedMilliseconds },
};

function syncSettingControls() {
  Object.entries(settingControls).forEach(([key, control]) => {
    control.input.value = settings[key];
    control.output.value = control.format(settings[key]);
  });
}

function updateSetting(key, value, persist = false) {
  settings = rhythmCore.sanitizeSettings({ ...settings, [key]: value });
  syncSettingControls();
  if (persist) saveSettings();
  drawScene(game.running ? currentVisualChartTime() : 0);
}

function easeProgress(progress, ease) {
  const value = clamp(progress, 0, 1);
  if (ease === 1) return 1 - Math.cos(value * Math.PI / 2);
  if (ease === 2) return Math.sin(value * Math.PI / 2);
  return value;
}

function resolveGeometry(entity, seen = new Set()) {
  if (!entity || seen.has(entity.index)) return null;
  if (Number.isFinite(entity.lane) && Number.isFinite(entity.size)) {
    return { lane: entity.lane, size: Math.max(.25, entity.size) };
  }
  seen.add(entity.index);
  const attachRef = first(entity.refs.attach);
  const attached = attachRef ? game.entityByName.get(attachRef) : null;
  if (!attached) return null;
  if (!attached.archetype.endsWith('Connector')) return resolveGeometry(attached, seen);

  const start = game.entityByName.get(first(attached.refs.start));
  const end = game.entityByName.get(first(attached.refs.end));
  const startGeometry = resolveGeometry(start, new Set(seen));
  const endGeometry = resolveGeometry(end, new Set(seen));
  if (!startGeometry || !endGeometry || !Number.isFinite(start?.beat) || !Number.isFinite(end?.beat)) return null;
  const duration = end.beat - start.beat;
  const progress = duration ? (entity.beat - start.beat) / duration : 0;
  const eased = easeProgress(progress, first(attached.values.ease));
  return {
    lane: startGeometry.lane + (endGeometry.lane - startGeometry.lane) * eased,
    size: startGeometry.size + (endGeometry.size - startGeometry.size) * eased,
  };
}

function buildScaleMap(changes) {
  const collapsed = [];
  changes
    .filter((change) => Number.isFinite(change.time) && Number.isFinite(change.scale))
    .sort((a, b) => a.time - b.time || a.index - b.index)
    .forEach((change) => {
      if (collapsed.at(-1)?.time === change.time) collapsed[collapsed.length - 1] = change;
      else collapsed.push(change);
    });
  if (!collapsed.length) collapsed.push({ time: 0, scale: 1, index: -1 });
  if (!collapsed.some((change) => change.time === 0)) collapsed.push({ ...collapsed[0], time: 0, index: -1 });
  collapsed.sort((a, b) => a.time - b.time || a.index - b.index);
  const zeroIndex = collapsed.findIndex((change) => change.time === 0);
  collapsed[zeroIndex].scaled = 0;
  for (let index = zeroIndex + 1; index < collapsed.length; index += 1) {
    const previous = collapsed[index - 1];
    const current = collapsed[index];
    current.scaled = previous.scaled + (current.time - previous.time) * previous.scale;
  }
  for (let index = zeroIndex - 1; index >= 0; index -= 1) {
    const current = collapsed[index];
    const next = collapsed[index + 1];
    current.scaled = next.scaled - (next.time - current.time) * current.scale;
  }
  return {
    changes: collapsed,
    at(time) {
      let low = 0;
      let high = collapsed.length - 1;
      while (low <= high) {
        const middle = (low + high) >> 1;
        if (collapsed[middle].time <= time) low = middle + 1;
        else high = middle - 1;
      }
      const change = collapsed[Math.max(0, high)];
      return change.scaled + (time - change.time) * change.scale;
    },
  };
}

function buildTimeScaleMaps() {
  game.timeScaleMaps.clear();
  game.level.timeScaleGroups.forEach((group) => {
    const changes = [];
    let ref = first(group.refs.first);
    const length = Math.max(0, Number(first(group.values.length)) || 0);
    for (let index = 0; index < length && ref; index += 1) {
      const entity = game.entityByName.get(ref);
      if (!entity) break;
      changes.push({ index: entity.index, time: entity.time, scale: Number(first(entity.values.timeScale)) });
      ref = first(entity.refs.next);
    }
    game.timeScaleMaps.set(group.name, buildScaleMap(changes));
  });
  game.timeScaleMaps.set('default', buildScaleMap([{ index: 0, time: 0, scale: 1 }]));
}

function scaleMapFor(entity) {
  return game.timeScaleMaps.get(first(entity.refs.timeScaleGroup)) || game.timeScaleMaps.get('default');
}

function classifyInput(entity) {
  const type = entity.archetype;
  if (type.includes('Flick')) return 'flick';
  if (type.includes('Trace') || type.includes('SlideTick') || type.includes('Attached') || type.includes('Ignored')) return 'sustain';
  if (type.includes('SlideEnd')) return 'sustain';
  return 'direct';
}

function prepareLevel(level) {
  game.level = level;
  game.entityByName = new Map(level.entities.filter((entity) => entity.name).map((entity) => [entity.name, entity]));
  buildTimeScaleMaps();
  game.notes = level.notes.map((entity) => {
    const geometry = resolveGeometry(entity);
    return {
      ...entity,
      renderLane: geometry?.lane ?? null,
      renderSize: geometry?.size ?? null,
      inputKind: classifyInput(entity),
      status: entity.isPlayable ? 'pending' : 'decorative',
      scaleMap: scaleMapFor(entity),
    };
  }).sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity) || a.index - b.index);
  const noteByIndex = new Map(game.notes.map((note) => [note.index, note]));
  const playableNotes = game.notes.filter((note) => note.isPlayable && Number.isFinite(note.time));
  game.unresolvedPlayableNotes = playableNotes.filter((note) => !Number.isFinite(note.renderLane) || !Number.isFinite(note.renderSize)).length;
  game.scoreNotes = playableNotes.filter((note) => Number.isFinite(note.renderLane) && Number.isFinite(note.renderSize));
  game.connectors = level.connectors.map((connector) => {
    const startEntity = game.entityByName.get(first(connector.refs.start));
    const endEntity = game.entityByName.get(first(connector.refs.end));
    return { connector, start: noteByIndex.get(startEntity?.index), end: noteByIndex.get(endEntity?.index) };
  }).filter(({ start, end }) => start && end && start.renderLane !== null && end.renderLane !== null);
  game.simLines = level.simLines.map((line) => {
    const a = game.entityByName.get(first(line.refs.a));
    const b = game.entityByName.get(first(line.refs.b));
    return { a: noteByIndex.get(a?.index), b: noteByIndex.get(b?.index) };
  }).filter(({ a, b }) => a && b);
}

function sniffImageMime(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
  return 'application/octet-stream';
}

function releaseCover() {
  if (game.coverUrl) URL.revokeObjectURL(game.coverUrl);
  game.coverUrl = null;
  game.coverImage = null;
  trackCover.removeAttribute('src');
}

async function loadScp(file) {
  stopCalibration();
  startButton.disabled = true;
  trackCard.hidden = true;
  setLoadStatus(`正在解開 ${file.name}…`, 'working');
  releaseCover();
  audioPlayer.stop();
  if (!scpParser) throw new Error('SCP 解析器載入失敗，請重新整理頁面後再試。');
  const parsed = await scpParser.parseScp(file);
  const level = parsed.levels[0];
  if (!level.assets.bgm) throw new Error('這個關卡沒有 BGM resource。');
  const bgmBytes = parsed.getRepositoryResource(level.assets.bgm.hash);
  if (!bgmBytes) throw new Error('SCP 缺少關卡 BGM 檔案。');

  prepareLevel(level);
  setLoadStatus('正在解碼音樂…', 'working');
  await audioPlayer.load(bgmBytes);
  game.parsed = parsed;

  const coverBytes = level.assets.cover ? parsed.getRepositoryResource(level.assets.cover.hash) : null;
  if (coverBytes) {
    game.coverUrl = URL.createObjectURL(new Blob([coverBytes], { type: sniffImageMime(coverBytes) }));
    trackCover.src = game.coverUrl;
    const image = new Image();
    image.onload = () => { game.coverImage = image; drawScene(game.running ? currentVisualChartTime() : 0); };
    image.src = game.coverUrl;
  }
  document.querySelector('#track-level').textContent = `${level.metadata.engine?.title || 'Sonolus'} · Lv.${level.metadata.rating ?? '?'}`;
  document.querySelector('#track-title').textContent = level.metadata.title || level.metadata.name || '未命名關卡';
  document.querySelector('#track-credit').textContent = `${level.metadata.artists || '未知曲師'} · 譜面 ${level.metadata.author || '未知'}`;
  document.querySelector('#track-notes').textContent = `${game.scoreNotes.length.toLocaleString()} 可判定 notes · ${level.bpmChanges.length} BPM 變化${game.unresolvedPlayableNotes ? ` · 已排除 ${game.unresolvedPlayableNotes} 個缺少位置的 note` : ''}`;
  trackCard.hidden = false;
  startButton.disabled = false;
  setLoadStatus(`載入完成，共 ${parsed.levels.length} 個關卡；將遊玩第一個關卡。`);
  drawScene(0);
}

function rawChartTimeAt(timestamp = performance.now()) {
  if (!game.level) return 0;
  if (game.audioEndedAt !== null) {
    const normalized = rhythmCore.normalizePerformanceTimestamp(timestamp, performance.now(), performance.timeOrigin);
    const effectiveTimestamp = game.paused && game.tailPausedAt !== null ? game.tailPausedAt : normalized;
    return game.audioEndChartTime + (effectiveTimestamp - game.audioEndedAt) / 1000;
  }
  return rhythmCore.rawChartTime(audioPlayer.playbackTimeAt(timestamp), game.level.bgmOffset);
}

function currentVisualChartTime(timestamp = performance.now()) {
  return rhythmCore.visualChartTime(rawChartTimeAt(timestamp), settings.visualOffsetMs);
}

function currentJudgmentChartTime(timestamp = performance.now()) {
  return rhythmCore.judgmentChartTime(rawChartTimeAt(timestamp), settings.inputOffsetMs);
}

function resetScore() {
  game.scoreWeight = 0;
  game.combo = 0;
  game.maxCombo = 0;
  game.life = 100;
  game.judged = 0;
  game.audioEndedAt = null;
  game.audioEndChartTime = 0;
  game.tailPausedAt = null;
  game.counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  game.activePointers.clear();
  game.activeKeys.clear();
  game.inputQueue = [];
  game.inputSequence = 0;
  game.holdSegments = [];
  game.openHolds.clear();
  game.hitEffects = [];
  game.notes.forEach((note) => {
    note.status = note.isPlayable ? 'pending' : 'decorative';
    note.holdOwner = null;
  });
  updateHud();
}

function normalizedScore() {
  if (!game.scoreNotes.length) return 0;
  return Math.round(game.scoreWeight / (game.scoreNotes.length * 1000) * 1_000_000);
}

function updateHud() {
  scoreValue.textContent = String(normalizedScore()).padStart(7, '0');
  comboValue.textContent = String(game.combo);
  lifeValue.textContent = String(game.life);
}

function showJudgment(quality) {
  const now = performance.now();
  if (quality !== 'miss' && now - game.lastJudgmentAt < 70) return;
  game.lastJudgmentAt = now;
  judgmentLabel.className = `judgment ${quality}`;
  judgmentLabel.textContent = quality.toUpperCase();
  void judgmentLabel.offsetWidth;
  judgmentLabel.classList.add('show');
}

function recomputeScoreState() {
  let combo = 0;
  let maxCombo = 0;
  let life = 100;
  let scoreWeight = 0;
  let judged = 0;
  const counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  game.scoreNotes.forEach((note) => {
    const quality = note.status;
    if (!Object.prototype.hasOwnProperty.call(counts, quality)) return;
    counts[quality] += 1;
    judged += 1;
    if (quality === 'miss') {
      combo = 0;
      life = Math.max(0, life - 2);
      return;
    }
    scoreWeight += quality === 'perfect' ? 1000 : quality === 'great' ? 700 : 400;
    combo += 1;
    maxCombo = Math.max(maxCombo, combo);
    life = Math.min(100, life + (quality === 'perfect' ? .08 : .03));
  });
  Object.assign(game, { combo, maxCombo, life, scoreWeight, judged, counts });
}

function registerJudgment(note, quality) {
  const replacingMiss = note.status === 'miss' && quality !== 'miss';
  if (note.status !== 'pending' && !replacingMiss) return;
  note.status = quality;
  if (replacingMiss) {
    recomputeScoreState();
    game.hitEffects.push({ lane: note.renderLane, size: note.renderSize, startedAt: performance.now(), quality });
    showJudgment(quality);
    updateHud();
    return;
  }
  game.counts[quality] += 1;
  game.judged += 1;
  if (quality === 'miss') {
    game.combo = 0;
    game.life = Math.max(0, game.life - 2);
  } else {
    const weight = quality === 'perfect' ? 1000 : quality === 'great' ? 700 : 400;
    game.scoreWeight += weight;
    game.combo += 1;
    game.maxCombo = Math.max(game.maxCombo, game.combo);
    game.life = Math.min(100, game.life + (quality === 'perfect' ? .08 : .03));
    game.hitEffects.push({ lane: note.renderLane, size: note.renderSize, startedAt: performance.now(), quality });
  }
  showJudgment(quality);
  updateHud();
}

function laneMatches(note, lane) {
  return rhythmCore.laneMatches(note, lane);
}

function activeLanes() {
  return [
    ...[...game.activePointers.values()].map((pointer) => pointer.lane),
    ...[...game.activeKeys.values()].map((key) => key.lane),
  ];
}

function judgeInputAt(lane, inputKind, now, gestureDirection = null) {
  const candidate = rhythmCore.selectInputCandidate(game.scoreNotes, lane, now, inputKind, gestureDirection);
  if (!candidate) return false;
  registerJudgment(candidate.note, candidate.quality);
  return true;
}

function queueInputAt(lane, inputKind, chartTime, gestureDirection = null) {
  game.inputQueue.push({ lane, inputKind, chartTime, gestureDirection, sequence: game.inputSequence++ });
}

function processInputQueue() {
  const queue = game.inputQueue.splice(0).sort((a, b) => a.chartTime - b.chartTime || a.sequence - b.sequence);
  queue.forEach((input) => judgeInputAt(input.lane, input.inputKind, input.chartTime, input.gestureDirection));
}

function closeHold(owner, chartTime) {
  const hold = game.openHolds.get(owner);
  if (!hold) return;
  const segment = { ...hold, end: Math.max(hold.start, chartTime) };
  let low = 0;
  let high = game.holdSegments.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (game.holdSegments[middle].end <= segment.end) low = middle + 1;
    else high = middle;
  }
  game.holdSegments.splice(low, 0, segment);
  game.openHolds.delete(owner);
  resolveSustainRange(segment.lane, segment.start, segment.end, owner);
  correctSustainsAfterRelease(owner, segment.end, currentJudgmentChartTime());
}

function beginHold(owner, lane, chartTime) {
  closeHold(owner, chartTime);
  game.openHolds.set(owner, { owner, lane, start: chartTime });
  resolveSustainRange(lane, chartTime, currentJudgmentChartTime(), owner);
}

function moveHold(owner, lane, chartTime) {
  const hold = game.openHolds.get(owner);
  if (!hold) return;
  if (Math.abs(hold.lane - lane) < .08) return;
  closeHold(owner, chartTime);
  game.openHolds.set(owner, { owner, lane, start: chartTime });
  resolveSustainRange(lane, chartTime, currentJudgmentChartTime(), owner);
}

function endHold(owner, chartTime) {
  closeHold(owner, chartTime);
}

function closeAllHolds(chartTime) {
  [...game.openHolds.keys()].forEach((owner) => closeHold(owner, chartTime));
}

function firstNoteAtOrAfter(chartTime) {
  let low = 0;
  let high = game.scoreNotes.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (game.scoreNotes[middle].time < chartTime) low = middle + 1;
    else high = middle;
  }
  return low;
}

function resolveSustainRange(lane, start, end, owner) {
  if (end < start) return;
  for (let index = firstNoteAtOrAfter(start); index < game.scoreNotes.length; index += 1) {
    const note = game.scoreNotes[index];
    if (note.time > end) break;
    if (note.inputKind === 'sustain' && ['pending', 'miss'].includes(note.status) && laneMatches(note, lane)) {
      note.holdOwner = owner;
      registerJudgment(note, 'perfect');
    }
  }
}

function holdAt(note, chartTime) {
  const matches = (hold) => hold.start <= chartTime
    && (hold.end === undefined || hold.end >= chartTime)
    && laneMatches(note, hold.lane);
  const open = [...game.openHolds.values()].find(matches);
  if (open) return open;
  let low = 0;
  let high = game.holdSegments.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (game.holdSegments[middle].end < chartTime) low = middle + 1;
    else high = middle;
  }
  for (let index = low; index < game.holdSegments.length; index += 1) {
    if (matches(game.holdSegments[index])) return game.holdSegments[index];
  }
  return null;
}

function correctSustainsAfterRelease(owner, releasedAt, now) {
  let changed = false;
  for (let index = firstNoteAtOrAfter(releasedAt); index < game.scoreNotes.length; index += 1) {
    const note = game.scoreNotes[index];
    if (note.time > now) break;
    if (note.inputKind !== 'sustain' || note.holdOwner !== owner || note.time <= releasedAt) continue;
    const replacement = holdAt(note, note.time);
    if (replacement) {
      note.holdOwner = replacement.owner;
      continue;
    }
    note.holdOwner = null;
    note.status = rhythmCore.shouldCommitMiss(note.time, now, MISS_COMMIT_GRACE) ? 'miss' : 'pending';
    changed = true;
  }
  if (changed) {
    recomputeScoreState();
    updateHud();
  }
}

function updateJudgments(now) {
  game.scoreNotes.forEach((note) => {
    if (note.inputKind === 'sustain' && note.status === 'pending') {
      const hold = now >= note.time ? holdAt(note, note.time) : null;
      if (hold && rhythmCore.sustainQualityAt(note.time, now, true)) {
        note.holdOwner = hold.owner;
        registerJudgment(note, 'perfect');
      } else if (rhythmCore.shouldCommitMiss(note.time, now, MISS_COMMIT_GRACE)) {
        registerJudgment(note, 'miss');
      }
      return;
    }
    if (note.status === 'pending' && rhythmCore.shouldCommitMiss(note.time, now, MISS_COMMIT_GRACE)) {
      registerJudgment(note, 'miss');
    }
  });
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (!rhythmCore) {
    drawBackground();
    return;
  }
  drawScene(game.running ? currentVisualChartTime() : 0);
}

function currentStageGeometry(width = window.innerWidth, height = window.innerHeight) {
  return rhythmCore.stageGeometry(width, height, settings);
}

function laneToX(lane, y, geometry) {
  return rhythmCore.laneToX(lane, y, geometry);
}

function clientXToLane(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const geometry = currentStageGeometry(rect.width, rect.height);
  return clamp(rhythmCore.xToLane(x, geometry.judgmentY, geometry), LANE_MIN, LANE_MAX);
}

function approachTime() {
  return rhythmCore.approachTimeForSpeed(settings.scrollSpeed);
}

function visualDelta(note, now) {
  return note.scaleMap.at(note.time) - note.scaleMap.at(now);
}

function deltaToY(delta, geometry) {
  const progress = 1 - delta / approachTime();
  return geometry.horizonY + Math.pow(Math.max(0, progress), 1.35) * (geometry.judgmentY - geometry.horizonY);
}

function drawBackground() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);
  if (game.coverImage) {
    const image = game.coverImage;
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    ctx.save();
    ctx.globalAlpha = .28;
    ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    ctx.restore();
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#07101ad9');
  gradient.addColorStop(.55, '#101b2ed9');
  gradient.addColorStop(1, '#08101cf7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawStage(geometry) {
  const horizon = geometry.horizonY;
  const judgment = geometry.judgmentY;
  ctx.beginPath();
  ctx.moveTo(laneToX(-6, horizon, geometry), horizon);
  ctx.lineTo(laneToX(6, horizon, geometry), horizon);
  ctx.lineTo(laneToX(6, judgment, geometry), judgment);
  ctx.lineTo(laneToX(-6, judgment, geometry), judgment);
  ctx.closePath();
  ctx.fillStyle = '#16253db8';
  ctx.fill();
  for (let lane = -6; lane <= 6; lane += 2) {
    ctx.beginPath();
    ctx.moveTo(laneToX(lane, horizon, geometry), horizon);
    ctx.lineTo(laneToX(lane, judgment, geometry), judgment);
    ctx.strokeStyle = lane === 0 ? '#9be7ff55' : '#b5d5ed25';
    ctx.lineWidth = lane === 0 ? 2 : 1;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(laneToX(-6, judgment, geometry), judgment);
  ctx.lineTo(laneToX(6, judgment, geometry), judgment);
  ctx.strokeStyle = '#e7fbff';
  ctx.shadowColor = '#67e8f9';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const active = activeLanes();
  [...KEY_LANES.entries()].forEach(([key, lane]) => {
    const y = Math.min(judgment + 18, geometry.height - 36);
    const x = laneToX(lane, judgment, geometry);
    ctx.fillStyle = active.includes(lane) ? '#67e8f9' : '#ffffff32';
    ctx.beginPath();
    ctx.roundRect?.(x - 22, y, 44, 30, 8);
    if (typeof ctx.roundRect !== 'function') ctx.rect(x - 22, y, 44, 30);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(key.toUpperCase(), x, y + 20);
  });
}

function drawConnector(entry, now, geometry) {
  const { connector, start, end } = entry;
  if (end.time < now - .3) return;
  const startDelta = visualDelta(start, now);
  const endDelta = visualDelta(end, now);
  const lead = approachTime();
  if (startDelta > lead * 1.4 && endDelta > lead * 1.4) return;
  if (startDelta < -.4 && endDelta < -.4) return;
  const startY = clamp(deltaToY(startDelta, geometry), -window.innerHeight, window.innerHeight * 2);
  const endY = clamp(deltaToY(endDelta, geometry), -window.innerHeight, window.innerHeight * 2);
  const startLeft = laneToX(start.renderLane - start.renderSize, startY, geometry);
  const startRight = laneToX(start.renderLane + start.renderSize, startY, geometry);
  const endLeft = laneToX(end.renderLane - end.renderSize, endY, geometry);
  const endRight = laneToX(end.renderLane + end.renderSize, endY, geometry);
  const critical = connector.archetype.startsWith('Critical');
  ctx.beginPath();
  ctx.moveTo(startLeft, startY);
  ctx.lineTo(startRight, startY);
  ctx.lineTo(endRight, endY);
  ctx.lineTo(endLeft, endY);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, startY, 0, endY);
  gradient.addColorStop(0, critical ? '#ffe66d72' : '#56e39f60');
  gradient.addColorStop(1, critical ? '#ffbb3472' : '#2bd9c360');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = critical ? '#ffe66db8' : '#69f0b4a0';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawSimLine(line, now, geometry) {
  const deltaA = visualDelta(line.a, now);
  const deltaB = visualDelta(line.b, now);
  if (Math.max(deltaA, deltaB) > approachTime() * 1.2 || Math.min(deltaA, deltaB) < -.25) return;
  const yA = deltaToY(deltaA, geometry);
  const yB = deltaToY(deltaB, geometry);
  ctx.beginPath();
  ctx.moveTo(laneToX(line.a.renderLane, yA, geometry), yA);
  ctx.lineTo(laneToX(line.b.renderLane, yB, geometry), yB);
  ctx.strokeStyle = '#e8f5ff65';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function noteColor(note) {
  if (note.archetype.startsWith('Critical')) return '#ffe66d';
  if (note.archetype.includes('Flick')) return '#ff76ad';
  if (note.archetype.includes('Trace')) return '#67e8f9';
  if (note.archetype.includes('Slide')) return '#67e89a';
  return '#7cc9ff';
}

function shouldRenderNote(note) {
  return note.renderLane !== null
    && !note.archetype.startsWith('Hidden')
    && !note.archetype.startsWith('Ignored')
    && !note.archetype.includes('AttachedSlideTick');
}

function drawNote(note, now, geometry) {
  if (!shouldRenderNote(note) || (note.status !== 'pending' && note.status !== 'decorative')) return;
  const delta = visualDelta(note, now);
  if (delta > approachTime() * 1.18 || delta < -.25) return;
  const y = deltaToY(delta, geometry);
  const left = laneToX(note.renderLane - note.renderSize, y, geometry);
  const right = laneToX(note.renderLane + note.renderSize, y, geometry);
  const height = note.archetype.includes('Trace') ? 8 : note.archetype.includes('SlideTick') ? 7 : 13;
  ctx.save();
  ctx.shadowColor = noteColor(note);
  ctx.shadowBlur = 13;
  ctx.fillStyle = noteColor(note);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(left, y - height / 2, Math.max(4, right - left), height, 5);
  else ctx.rect(left, y - height / 2, Math.max(4, right - left), height);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffffd8';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (note.archetype.includes('Flick')) {
    const direction = note.direction || 0;
    const center = (left + right) / 2;
    ctx.beginPath();
    ctx.moveTo(center - 9 + direction * 3, y - 12);
    ctx.lineTo(center + direction * 8, y - 20);
    ctx.lineTo(center + 9 + direction * 3, y - 12);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
}

function drawHitEffects(geometry) {
  const now = performance.now();
  const judgmentY = geometry.judgmentY;
  game.hitEffects = game.hitEffects.filter((effect) => now - effect.startedAt < 300);
  game.hitEffects.forEach((effect) => {
    const progress = (now - effect.startedAt) / 300;
    const x = laneToX(effect.lane, judgmentY, geometry);
    const radius = 18 + progress * 48;
    ctx.beginPath();
    ctx.arc(x, judgmentY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = effect.quality === 'perfect' ? `rgba(255,230,109,${1 - progress})` : `rgba(103,232,249,${1 - progress})`;
    ctx.lineWidth = 4 * (1 - progress);
    ctx.stroke();
  });
}

function drawScene(now) {
  const geometry = currentStageGeometry();
  drawBackground();
  drawStage(geometry);
  if (!game.level) return;
  game.connectors.forEach((connector) => drawConnector(connector, now, geometry));
  game.simLines.forEach((line) => drawSimLine(line, now, geometry));
  game.notes.forEach((note) => drawNote(note, now, geometry));
  drawHitEffects(geometry);
}

function gameLoop(frameTimestamp = performance.now()) {
  if (!game.running) return;
  const judgmentNow = currentJudgmentChartTime(frameTimestamp);
  const visualNow = currentVisualChartTime(frameTimestamp);
  if (!game.paused) {
    processInputQueue();
    updateJudgments(judgmentNow);
  }
  drawScene(visualNow);
  const lastNoteTime = game.scoreNotes.at(-1)?.time ?? -Infinity;
  const inputSettled = judgmentNow >= lastNoteTime + rhythmCore.JUDGMENT_WINDOWS.good + INPUT_SETTLE_GRACE;
  const audioSettled = game.audioEndedAt !== null
    && frameTimestamp >= game.audioEndedAt + INPUT_SETTLE_GRACE * 1000;
  const controlsSettled = game.inputQueue.length === 0
    && game.activePointers.size === 0
    && game.activeKeys.size === 0
    && game.openHolds.size === 0;
  if (!game.paused && audioSettled && inputSettled && controlsSettled
    && game.scoreNotes.every((note) => note.status !== 'pending')) {
    finishGame();
    return;
  }
  game.frame = requestAnimationFrame(gameLoop);
}

async function startGame() {
  if (!game.level || !audioPlayer.buffer) return;
  stopCalibration();
  cancelAnimationFrame(game.frame);
  resetScore();
  game.running = false;
  game.paused = false;
  try {
    await audioPlayer.play(0, .75);
  } catch (error) {
    setupPanel.hidden = false;
    resultPanel.hidden = true;
    gameHud.hidden = true;
    gameControls.hidden = true;
    setLoadStatus(error.message, 'error');
    throw error;
  }
  setupPanel.hidden = true;
  resultPanel.hidden = true;
  gameHud.hidden = false;
  gameControls.hidden = false;
  pauseOverlay.hidden = true;
  pauseButton.textContent = '暫停';
  readyMessage.classList.remove('show');
  void readyMessage.offsetWidth;
  readyMessage.classList.add('show');
  game.running = true;
  game.frame = requestAnimationFrame(gameLoop);
}

function resultRank(accuracy) {
  if (game.counts.miss === 0 && accuracy >= .99) return 'SS';
  if (accuracy >= .95) return 'S';
  if (accuracy >= .88) return 'A';
  if (accuracy >= .75) return 'B';
  return 'C';
}

function finishGame() {
  if (!game.running) return;
  const finalVisualTime = currentVisualChartTime();
  game.running = false;
  game.paused = false;
  cancelAnimationFrame(game.frame);
  audioPlayer.stop();
  game.activePointers.clear();
  game.activeKeys.clear();
  game.scoreNotes.forEach((note) => { if (note.status === 'pending') registerJudgment(note, 'miss'); });
  gameHud.hidden = true;
  gameControls.hidden = true;
  pauseOverlay.hidden = true;
  const accuracy = game.scoreNotes.length ? game.scoreWeight / (game.scoreNotes.length * 1000) : 0;
  document.querySelector('#result-title').textContent = game.level.metadata.title || '遊戲結束';
  document.querySelector('#result-rank').textContent = resultRank(accuracy);
  document.querySelector('#result-score').textContent = normalizedScore().toLocaleString();
  document.querySelector('#result-combo').textContent = game.maxCombo.toLocaleString();
  document.querySelector('#result-accuracy').textContent = `${(accuracy * 100).toFixed(2)}%`;
  document.querySelector('#result-perfect').textContent = game.counts.perfect.toLocaleString();
  document.querySelector('#result-great').textContent = game.counts.great.toLocaleString();
  document.querySelector('#result-good').textContent = game.counts.good.toLocaleString();
  document.querySelector('#result-miss').textContent = game.counts.miss.toLocaleString();
  resultPanel.hidden = false;
  drawScene(finalVisualTime);
}

function handleAudioEnded(audibleEndAt = performance.now()) {
  if (!game.running || !game.level || !audioPlayer.buffer) return;
  game.audioEndedAt = rhythmCore.normalizePerformanceTimestamp(audibleEndAt, performance.now(), performance.timeOrigin);
  game.audioEndChartTime = rhythmCore.rawChartTime(audioPlayer.buffer.duration, game.level.bgmOffset);
}

async function togglePause() {
  if (!game.running) return;
  if (game.paused) {
    if (game.tailPausedAt !== null && game.audioEndedAt !== null) {
      game.audioEndedAt += performance.now() - game.tailPausedAt;
      game.tailPausedAt = null;
    } else {
      await audioPlayer.play(audioPlayer.position, .04, true);
    }
    game.paused = false;
    pauseOverlay.hidden = true;
    pauseButton.textContent = '暫停';
  } else {
    const pauseTimestamp = performance.now();
    processInputQueue();
    closeAllHolds(currentJudgmentChartTime(pauseTimestamp));
    game.activePointers.clear();
    game.activeKeys.clear();
    game.inputQueue = [];
    if (game.audioEndedAt !== null) game.tailPausedAt = pauseTimestamp;
    else audioPlayer.pause();
    game.paused = true;
    pauseOverlay.hidden = false;
    pauseButton.textContent = '繼續';
  }
}

function leaveGame() {
  game.running = false;
  game.paused = false;
  cancelAnimationFrame(game.frame);
  audioPlayer.stop();
  game.activePointers.clear();
  game.activeKeys.clear();
  game.inputQueue = [];
  game.openHolds.clear();
  game.audioEndedAt = null;
  game.tailPausedAt = null;
  setupPanel.hidden = false;
  resultPanel.hidden = true;
  gameHud.hidden = true;
  gameControls.hidden = true;
  pauseOverlay.hidden = true;
  drawScene(0);
}

function resetCalibrationBeatClasses() {
  calibrationBeats.forEach((beat) => {
    beat.classList.remove('is-past', 'is-current', 'is-target');
    beat.removeAttribute('aria-current');
  });
}

function stopCalibration(resetProgress = true) {
  calibration.running = false;
  cancelAnimationFrame(calibration.frame);
  calibration.frame = 0;
  calibration.oscillators.forEach((oscillator) => {
    try { oscillator.stop(); } catch {}
    try { oscillator.disconnect(); } catch {}
  });
  calibration.oscillators = [];
  startCalibrationButton.disabled = false;
  startCalibrationButton.textContent = calibration.samples.length ? '重新測試' : '開始八輪測試';
  calibrationTapButton.disabled = true;
  volumeSlider.disabled = !rhythmCore;
  resetSettingsButton.disabled = !rhythmCore;
  if (resetProgress) resetCalibrationBeatClasses();
}

function scheduleCalibrationClick(context, at) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, at);
  gain.gain.setValueAtTime(.0001, at);
  gain.gain.exponentialRampToValueAtTime(.3, at + .004);
  gain.gain.exponentialRampToValueAtTime(.0001, at + .065);
  oscillator.connect(gain);
  gain.connect(audioPlayer.gain);
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect();
    gain.disconnect();
  }, { once: true });
  oscillator.start(at);
  oscillator.stop(at + .07);
  calibration.oscillators.push(oscillator);
}

function beginCalibrationRound(context, lead) {
  cancelAnimationFrame(calibration.frame);
  resetCalibrationBeatClasses();
  calibration.beatTimes = rhythmCore.calibrationBeatTimes(context.currentTime + lead, .5, 4);
  calibration.beatTimes.slice(0, 3).forEach((time) => scheduleCalibrationClick(context, time));
  calibration.running = true;
  startCalibrationButton.disabled = true;
  calibrationTapButton.disabled = false;
  volumeSlider.disabled = true;
  resetSettingsButton.disabled = true;
  calibrationStatus.className = 'calibration-status';
  calibrationStatus.textContent = `第 ${calibration.samples.length + 1} / ${CALIBRATION_ROUNDS} 輪：聽前三拍，預測第四拍並按下。`;
  calibrationTapButton.focus({ preventScroll: true });
  calibration.frame = requestAnimationFrame(updateCalibrationProgress);
}

function updateCalibrationProgress(frameTimestamp) {
  if (!calibration.running) return;
  const contextTime = audioPlayer.contextTimeAt(frameTimestamp);
  const [firstBeat, , , targetBeat] = calibration.beatTimes;
  const beatDuration = calibration.beatTimes[1] - firstBeat;
  const currentBeat = Math.floor((contextTime - firstBeat) / beatDuration);
  calibrationBeats.forEach((beat, index) => {
    beat.classList.toggle('is-past', index < currentBeat);
    beat.classList.toggle('is-current', index === currentBeat && index < 3);
    beat.classList.toggle('is-target', index === 3 && contextTime >= targetBeat - .06);
    if ((index === currentBeat && index < 3) || (index === 3 && contextTime >= targetBeat - .06)) {
      beat.setAttribute('aria-current', 'step');
    } else {
      beat.removeAttribute('aria-current');
    }
  });
  if (contextTime > targetBeat + .5) {
    stopCalibration(false);
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = '沒有收到第四拍輸入，請再測一次。';
    return;
  }
  calibration.frame = requestAnimationFrame(updateCalibrationProgress);
}

async function startCalibration() {
  if (game.running || calibration.running || !rhythmCore) return;
  stopCalibration();
  calibration.samples = [];
  calibration.suggestion = null;
  calibration.lastInputAt = -Infinity;
  calibration.suppressClickUntil = -Infinity;
  applyCalibrationButton.disabled = true;
  calibrationStatus.className = 'calibration-status';
  calibrationStatus.textContent = '正在準備八輪測試。';
  startCalibrationButton.disabled = true;
  try {
    const context = audioPlayer.ensureContext();
    if (volumeSetting <= 0) throw new Error('目前音量是 0%；請先調高音量再開始延遲測試。');
    await context.resume();
    const lead = Math.max(.3, (Number(context.outputLatency) || Number(context.baseLatency) || 0) * 2);
    beginCalibrationRound(context, lead);
  } catch (error) {
    stopCalibration();
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = error.message;
  }
}

function captureCalibrationInput(event) {
  if (!calibration.running || event.repeat) return false;
  const eventAt = rhythmCore.normalizePerformanceTimestamp(event.timeStamp, performance.now(), performance.timeOrigin);
  if (eventAt - calibration.lastInputAt < 150) return true;
  calibration.lastInputAt = eventAt;
  const targetTime = calibration.beatTimes[3];
  const inputTime = audioPlayer.contextTimeAt(event.timeStamp);
  if (inputTime < targetTime - .35) {
    calibrationStatus.textContent = '還沒到第四拍；請跟著前三拍繼續數。';
    return true;
  }
  const sample = Math.round((inputTime - targetTime) * 1000);
  if (Math.abs(sample) > 500) {
    stopCalibration(false);
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = '這次輸入離第四拍太遠，結果未套用。請再測一次。';
    return true;
  }
  calibration.samples.push(sample);
  calibrationBeats[3].classList.add('is-target');
  if (calibration.samples.length < CALIBRATION_ROUNDS) {
    beginCalibrationRound(audioPlayer.context, .65);
    return true;
  }
  const stats = rhythmCore.calibrationStats(calibration.samples, CALIBRATION_ROUNDS, 30);
  stopCalibration(false);
  calibration.suggestion = stats.reliable ? stats.suggestion : null;
  applyCalibrationButton.disabled = !stats.reliable;
  if (stats.reliable) {
    calibrationStatus.className = 'calibration-status is-result';
    calibrationStatus.textContent = `建議 ${signedMilliseconds(stats.suggestion)}；八輪離散度 ${stats.standardDeviationMs.toFixed(1)} ms。確認後再套用。`;
  } else {
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = `八輪離散度 ${stats.standardDeviationMs.toFixed(1)} ms，結果不夠一致，未產生建議值。請重新測試。`;
  }
  return true;
}

fileInput.addEventListener('change', async () => {
  const [file] = fileInput.files;
  if (!file) return;
  try {
    await loadScp(file);
  } catch (error) {
    console.error(error);
    setLoadStatus(`${error.code ? `${error.code}：` : ''}${error.message}`, 'error');
  }
});
Object.entries(settingControls).forEach(([key, control]) => {
  control.input.addEventListener('input', () => updateSetting(key, control.input.value));
  control.input.addEventListener('change', saveSettings);
});
volumeSlider.addEventListener('input', () => updateVolume(volumeSlider.value));
volumeSlider.addEventListener('change', () => updateVolume(volumeSlider.value, true));
resetSettingsButton.addEventListener('click', () => {
  settings = rhythmCore.sanitizeSettings();
  saveSettings();
  updateVolume(100, true);
  syncSettingControls();
  drawScene(game.running ? currentVisualChartTime() : 0);
});
startCalibrationButton.addEventListener('click', () => { startCalibration().catch(console.error); });
applyCalibrationButton.addEventListener('click', () => {
  if (calibration.suggestion === null) return;
  updateSetting('inputOffsetMs', calibration.suggestion, true);
  applyCalibrationButton.disabled = true;
  calibrationStatus.className = 'calibration-status is-result';
  calibrationStatus.textContent = `已套用 ${signedMilliseconds(calibration.suggestion)}。可隨時手動微調輸入延遲補償。`;
});
calibrationTapButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  calibration.suppressClickUntil = performance.now() + 750;
  captureCalibrationInput(event);
});
calibrationTapButton.addEventListener('click', (event) => {
  if (performance.now() < calibration.suppressClickUntil) return;
  captureCalibrationInput(event);
});
startButton.addEventListener('click', () => { startGame().catch((error) => setLoadStatus(error.message, 'error')); });
pauseButton.addEventListener('click', () => { togglePause().catch(console.error); });
exitButton.addEventListener('click', leaveGame);
retryButton.addEventListener('click', () => { startGame().catch(console.error); });
chooseChartButton.addEventListener('click', () => {
  resultPanel.hidden = true;
  setupPanel.hidden = false;
  drawScene(0);
});

function updatePointerState(pointer, event) {
  const performanceTime = rhythmCore.normalizePerformanceTimestamp(event.timeStamp, performance.now(), performance.timeOrigin);
  const chartTime = currentJudgmentChartTime(event.timeStamp);
  const lane = clientXToLane(event.clientX);
  moveHold(pointer.owner, lane, chartTime);
  pointer.lane = lane;
  pointer.samples.push({ x: event.clientX, y: event.clientY, performanceTime, chartTime });
  pointer.samples = pointer.samples.filter((sample) => performanceTime - sample.performanceTime <= FLICK_WINDOW_MS);
  return pointer.samples.at(-1);
}

function tryPointerFlick(pointer, sample) {
  if (pointer.flicked || pointer.samples.length < 2) return false;
  const gesture = rhythmCore.analyzeFlickGesture(pointer.samples, {
    maxDurationMs: FLICK_WINDOW_MS,
    minDistancePx: FLICK_DISTANCE_PX,
    minVelocityPxPerSecond: FLICK_MIN_VELOCITY,
  });
  if (!gesture) return false;
  queueInputAt(pointer.lane, 'flick', sample.chartTime, gesture.direction);
  pointer.flicked = true;
  return true;
}

canvas.addEventListener('pointerdown', (event) => {
  if (!game.running || game.paused) return;
  event.preventDefault();
  const lane = clientXToLane(event.clientX);
  const chartTime = currentJudgmentChartTime(event.timeStamp);
  const performanceTime = rhythmCore.normalizePerformanceTimestamp(event.timeStamp, performance.now(), performance.timeOrigin);
  const owner = `pointer:${event.pointerId}`;
  const pointer = {
    owner,
    lane,
    samples: [{ x: event.clientX, y: event.clientY, performanceTime, chartTime }],
    flicked: false,
  };
  game.activePointers.set(event.pointerId, pointer);
  beginHold(owner, lane, chartTime);
  canvas.setPointerCapture?.(event.pointerId);
  queueInputAt(lane, 'direct', chartTime);
});
canvas.addEventListener('pointermove', (event) => {
  const pointer = game.activePointers.get(event.pointerId);
  if (!pointer || game.paused) return;
  event.preventDefault();
  tryPointerFlick(pointer, updatePointerState(pointer, event));
});
function releasePointer(event) {
  const pointer = game.activePointers.get(event.pointerId);
  if (!pointer) return;
  if (!game.paused) {
    const sample = updatePointerState(pointer, event);
    tryPointerFlick(pointer, sample);
    endHold(pointer.owner, sample.chartTime);
  }
  game.activePointers.delete(event.pointerId);
}
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', (event) => {
  const pointer = game.activePointers.get(event.pointerId);
  if (pointer && !game.paused) endHold(pointer.owner, currentJudgmentChartTime(event.timeStamp));
  game.activePointers.delete(event.pointerId);
});
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('keydown', (event) => {
  if (calibration.running && (event.code === 'Space' || event.code === 'Enter')) {
    const interactive = event.target instanceof Element
      ? event.target.closest('button, input, select, textarea, a, [contenteditable="true"]')
      : null;
    if (interactive && interactive !== calibrationTapButton) return;
    event.preventDefault();
    captureCalibrationInput(event);
    return;
  }
  const lane = KEY_LANES.get(event.key.toLowerCase());
  if (lane === undefined || event.repeat || !game.running || game.paused) return;
  event.preventDefault();
  const key = event.key.toLowerCase();
  const chartTime = currentJudgmentChartTime(event.timeStamp);
  const owner = `key:${key}`;
  game.activeKeys.set(key, { lane, pressedAt: chartTime, owner });
  beginHold(owner, lane, chartTime);
  queueInputAt(lane, 'direct', chartTime);
});
window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  const input = game.activeKeys.get(key);
  if (!input) return;
  const chartTime = currentJudgmentChartTime(event.timeStamp);
  endHold(input.owner, chartTime);
  if (game.running && !game.paused && chartTime - input.pressedAt <= .3) {
    queueInputAt(input.lane, 'flick', chartTime);
  }
  game.activeKeys.delete(key);
});
window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && calibration.running) {
    stopCalibration();
    calibrationStatus.className = 'calibration-status is-error';
    calibrationStatus.textContent = '頁面進入背景，這次延遲測試已取消，請重新開始。';
  }
  if (document.hidden && game.running && !game.paused) togglePause().catch(console.error);
});
window.addEventListener('pagehide', () => stopCalibration());
audioPlayer.onended = handleAudioEnded;
if (!rhythmCore) {
  fileInput.disabled = true;
  startCalibrationButton.disabled = true;
  resetSettingsButton.disabled = true;
  Object.values(settingControls).forEach((control) => { control.input.disabled = true; });
  setLoadStatus('音遊核心載入失敗，請重新整理頁面後再試。', 'error');
} else {
  settings = loadSettings();
  syncSettingControls();
  if (!scpParser) {
    fileInput.disabled = true;
    setLoadStatus('SCP 解析器載入失敗；校正與遊玩設定仍可使用。', 'error');
  }
}
syncVolumeControl();
resizeCanvas();
