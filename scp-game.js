const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const setupPanel = document.querySelector('#setup-panel');
const fileInput = document.querySelector('#scp-file');
const loadStatus = document.querySelector('#load-status');
const trackCard = document.querySelector('#track-card');
const trackCover = document.querySelector('#track-cover');
const playSettings = document.querySelector('#play-settings');
const startButton = document.querySelector('#start-game');
const speedSlider = document.querySelector('#speed-slider');
const speedOutput = document.querySelector('#speed-output');
const offsetSlider = document.querySelector('#offset-slider');
const offsetOutput = document.querySelector('#offset-output');
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

const KEY_LANES = new Map([
  ['s', -5], ['d', -3], ['f', -1], ['j', 1], ['k', 3], ['l', 5],
]);
const PERFECT_WINDOW = .055;
const GREAT_WINDOW = .105;
const GOOD_WINDOW = .18;
const LANE_MIN = -6;
const LANE_MAX = 6;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

class ChartAudioPlayer {
  constructor() {
    this.context = null;
    this.gain = null;
    this.buffer = null;
    this.source = null;
    this.position = 0;
    this.startedAt = 0;
    this.playing = false;
    this.playToken = 0;
    this.onended = null;
  }

  async load(bytes) {
    if (!AudioContextClass) throw new Error('這個瀏覽器不支援 Web Audio API。');
    if (!this.context) {
      this.context = new AudioContextClass();
      this.gain = this.context.createGain();
      const savedVolume = Number(localStorage.getItem('gugagame-web-volume'));
      this.gain.gain.value = Number.isFinite(savedVolume) ? Math.max(0, Math.min(1, savedVolume)) : 1;
      this.gain.connect(this.context.destination);
    }
    this.stop();
    const copy = bytes.slice().buffer;
    this.buffer = await this.context.decodeAudioData(copy);
    this.position = 0;
  }

  get currentTime() {
    if (!this.playing || !this.context) return this.position;
    return Math.max(0, Math.min(this.buffer?.duration || Infinity, this.context.currentTime - this.startedAt));
  }

  async play(from = this.position) {
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
      this.position = this.buffer.duration;
      this.playing = false;
      this.source = null;
      this.onended?.();
    }, { once: true });
    this.source = source;
    this.startedAt = this.context.currentTime - this.position;
    this.playing = true;
    source.start(0, this.position);
  }

  pause() {
    if (!this.playing) return;
    this.position = this.currentTime;
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
  connectors: [],
  simLines: [],
  timeScaleMaps: new Map(),
  running: false,
  paused: false,
  frame: 0,
  scoreWeight: 0,
  combo: 0,
  maxCombo: 0,
  life: 100,
  judged: 0,
  counts: { perfect: 0, great: 0, good: 0, miss: 0 },
  activePointers: new Map(),
  activeKeys: new Map(),
  hitEffects: [],
  lastJudgmentAt: 0,
  coverImage: null,
  coverUrl: null,
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
  game.scoreNotes = game.notes.filter((note) => note.isPlayable && Number.isFinite(note.time));
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
  startButton.disabled = true;
  trackCard.hidden = true;
  playSettings.hidden = true;
  setLoadStatus(`正在解開 ${file.name}…`, 'working');
  releaseCover();
  audioPlayer.stop();
  const parsed = await GugaScpParser.parseScp(file);
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
    image.onload = () => { game.coverImage = image; drawScene(currentChartTime()); };
    image.src = game.coverUrl;
  }
  document.querySelector('#track-level').textContent = `${level.metadata.engine?.title || 'Sonolus'} · Lv.${level.metadata.rating ?? '?'}`;
  document.querySelector('#track-title').textContent = level.metadata.title || level.metadata.name || '未命名關卡';
  document.querySelector('#track-credit').textContent = `${level.metadata.artists || '未知曲師'} · 譜面 ${level.metadata.author || '未知'}`;
  const unresolved = game.scoreNotes.filter((note) => note.renderLane === null).length;
  document.querySelector('#track-notes').textContent = `${game.scoreNotes.length.toLocaleString()} notes · ${level.bpmChanges.length} BPM 變化${unresolved ? ` · ${unresolved} 個 note 缺少位置` : ''}`;
  trackCard.hidden = false;
  playSettings.hidden = false;
  startButton.disabled = false;
  setLoadStatus(`載入完成，共 ${parsed.levels.length} 個關卡；將遊玩第一個關卡。`);
  drawScene(0);
}

function currentChartTime() {
  if (!game.level) return 0;
  return audioPlayer.currentTime - game.level.bgmOffset + Number(offsetSlider.value) / 1000;
}

function resetScore() {
  game.scoreWeight = 0;
  game.combo = 0;
  game.maxCombo = 0;
  game.life = 100;
  game.judged = 0;
  game.counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  game.activePointers.clear();
  game.activeKeys.clear();
  game.hitEffects = [];
  game.notes.forEach((note) => { note.status = note.isPlayable ? 'pending' : 'decorative'; });
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

function registerJudgment(note, quality) {
  if (note.status !== 'pending') return;
  note.status = quality;
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

function qualityFor(delta) {
  const absolute = Math.abs(delta);
  if (absolute <= PERFECT_WINDOW) return 'perfect';
  if (absolute <= GREAT_WINDOW) return 'great';
  if (absolute <= GOOD_WINDOW) return 'good';
  return null;
}

function laneMatches(note, lane) {
  if (!Number.isFinite(note.renderLane) || !Number.isFinite(note.renderSize)) return false;
  return lane >= note.renderLane - note.renderSize - .35 && lane <= note.renderLane + note.renderSize + .35;
}

function activeLanes() {
  return [...game.activePointers.values(), ...game.activeKeys.values()];
}

function judgeDirect(lane, releaseOnly = false) {
  const now = currentChartTime();
  let candidate = null;
  let candidateDelta = Infinity;
  game.scoreNotes.forEach((note) => {
    if (note.status !== 'pending' || note.inputKind !== 'direct' || !laneMatches(note, lane)) return;
    if (releaseOnly && !note.archetype.includes('Flick')) return;
    const delta = now - note.time;
    if (Math.abs(delta) <= GOOD_WINDOW && Math.abs(delta) < Math.abs(candidateDelta)) {
      candidate = note;
      candidateDelta = delta;
    }
  });
  if (candidate) registerJudgment(candidate, qualityFor(candidateDelta));
}

function updateJudgments(now) {
  const lanes = activeLanes();
  game.scoreNotes.forEach((note) => {
    if (note.status !== 'pending') return;
    const delta = now - note.time;
    if (note.inputKind === 'sustain' && Math.abs(delta) <= GOOD_WINDOW && lanes.some((lane) => laneMatches(note, lane))) {
      registerJudgment(note, qualityFor(delta));
      return;
    }
    if (delta > GOOD_WINDOW) registerJudgment(note, 'miss');
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
  drawScene(currentChartTime());
}

function fieldWidthAt(y) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const horizon = height * .12;
  const judgment = height * .86;
  const progress = clamp((y - horizon) / (judgment - horizon), 0, 1);
  return width * .28 + (Math.min(width * .94, 980) - width * .28) * progress;
}

function laneToX(lane, y) {
  return window.innerWidth / 2 + lane / 12 * fieldWidthAt(y);
}

function clientXToLane(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const fieldWidth = fieldWidthAt(window.innerHeight * .86);
  return clamp((x - window.innerWidth / 2) / fieldWidth * 12, LANE_MIN, LANE_MAX);
}

function approachTime() {
  return clamp(4.8 - Number(speedSlider.value) * .4, .8, 4.4);
}

function visualDelta(note, now) {
  return note.scaleMap.at(note.time) - note.scaleMap.at(now);
}

function deltaToY(delta) {
  const height = window.innerHeight;
  const horizon = height * .12;
  const judgment = height * .86;
  const progress = 1 - delta / approachTime();
  return horizon + Math.pow(Math.max(0, progress), 1.35) * (judgment - horizon);
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

function drawStage() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const horizon = height * .12;
  const judgment = height * .86;
  ctx.beginPath();
  ctx.moveTo(laneToX(-6, horizon), horizon);
  ctx.lineTo(laneToX(6, horizon), horizon);
  ctx.lineTo(laneToX(6, judgment), judgment);
  ctx.lineTo(laneToX(-6, judgment), judgment);
  ctx.closePath();
  ctx.fillStyle = '#16253db8';
  ctx.fill();
  for (let lane = -6; lane <= 6; lane += 2) {
    ctx.beginPath();
    ctx.moveTo(laneToX(lane, horizon), horizon);
    ctx.lineTo(laneToX(lane, judgment), judgment);
    ctx.strokeStyle = lane === 0 ? '#9be7ff55' : '#b5d5ed25';
    ctx.lineWidth = lane === 0 ? 2 : 1;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(laneToX(-6, judgment), judgment);
  ctx.lineTo(laneToX(6, judgment), judgment);
  ctx.strokeStyle = '#e7fbff';
  ctx.shadowColor = '#67e8f9';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const active = activeLanes();
  [...KEY_LANES.entries()].forEach(([key, lane]) => {
    const y = judgment + 18;
    const x = laneToX(lane, judgment);
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

function drawConnector(entry, now) {
  const { connector, start, end } = entry;
  if (end.time < now - .3) return;
  const startDelta = visualDelta(start, now);
  const endDelta = visualDelta(end, now);
  const lead = approachTime();
  if (startDelta > lead * 1.4 && endDelta > lead * 1.4) return;
  if (startDelta < -.4 && endDelta < -.4) return;
  const startY = clamp(deltaToY(startDelta), -window.innerHeight, window.innerHeight * 2);
  const endY = clamp(deltaToY(endDelta), -window.innerHeight, window.innerHeight * 2);
  const startLeft = laneToX(start.renderLane - start.renderSize, startY);
  const startRight = laneToX(start.renderLane + start.renderSize, startY);
  const endLeft = laneToX(end.renderLane - end.renderSize, endY);
  const endRight = laneToX(end.renderLane + end.renderSize, endY);
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

function drawSimLine(line, now) {
  const deltaA = visualDelta(line.a, now);
  const deltaB = visualDelta(line.b, now);
  if (Math.max(deltaA, deltaB) > approachTime() * 1.2 || Math.min(deltaA, deltaB) < -.25) return;
  const yA = deltaToY(deltaA);
  const yB = deltaToY(deltaB);
  ctx.beginPath();
  ctx.moveTo(laneToX(line.a.renderLane, yA), yA);
  ctx.lineTo(laneToX(line.b.renderLane, yB), yB);
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

function drawNote(note, now) {
  if (!shouldRenderNote(note) || (note.status !== 'pending' && note.status !== 'decorative')) return;
  const delta = visualDelta(note, now);
  if (delta > approachTime() * 1.18 || delta < -.25) return;
  const y = deltaToY(delta);
  const left = laneToX(note.renderLane - note.renderSize, y);
  const right = laneToX(note.renderLane + note.renderSize, y);
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

function drawHitEffects() {
  const now = performance.now();
  const judgmentY = window.innerHeight * .86;
  game.hitEffects = game.hitEffects.filter((effect) => now - effect.startedAt < 300);
  game.hitEffects.forEach((effect) => {
    const progress = (now - effect.startedAt) / 300;
    const x = laneToX(effect.lane, judgmentY);
    const radius = 18 + progress * 48;
    ctx.beginPath();
    ctx.arc(x, judgmentY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = effect.quality === 'perfect' ? `rgba(255,230,109,${1 - progress})` : `rgba(103,232,249,${1 - progress})`;
    ctx.lineWidth = 4 * (1 - progress);
    ctx.stroke();
  });
}

function drawScene(now) {
  drawBackground();
  drawStage();
  if (!game.level) return;
  game.connectors.forEach((connector) => drawConnector(connector, now));
  game.simLines.forEach((line) => drawSimLine(line, now));
  game.notes.forEach((note) => drawNote(note, now));
  drawHitEffects();
}

function gameLoop() {
  if (!game.running) return;
  const now = currentChartTime();
  if (!game.paused) updateJudgments(now);
  drawScene(now);
  game.frame = requestAnimationFrame(gameLoop);
}

async function startGame() {
  if (!game.level || !audioPlayer.buffer) return;
  cancelAnimationFrame(game.frame);
  resetScore();
  game.running = true;
  game.paused = false;
  setupPanel.hidden = true;
  resultPanel.hidden = true;
  gameHud.hidden = false;
  gameControls.hidden = false;
  pauseOverlay.hidden = true;
  pauseButton.textContent = '暫停';
  readyMessage.classList.remove('show');
  void readyMessage.offsetWidth;
  readyMessage.classList.add('show');
  await audioPlayer.play(0);
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
  drawScene(currentChartTime());
}

async function togglePause() {
  if (!game.running) return;
  if (game.paused) {
    await audioPlayer.play();
    game.paused = false;
    pauseOverlay.hidden = true;
    pauseButton.textContent = '暫停';
  } else {
    audioPlayer.pause();
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
  setupPanel.hidden = false;
  resultPanel.hidden = true;
  gameHud.hidden = true;
  gameControls.hidden = true;
  pauseOverlay.hidden = true;
  drawScene(0);
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
speedSlider.addEventListener('input', () => { speedOutput.value = speedSlider.value; drawScene(currentChartTime()); });
offsetSlider.addEventListener('input', () => { offsetOutput.value = `${offsetSlider.value} ms`; });
startButton.addEventListener('click', () => { startGame().catch((error) => setLoadStatus(error.message, 'error')); });
pauseButton.addEventListener('click', () => { togglePause().catch(console.error); });
exitButton.addEventListener('click', leaveGame);
retryButton.addEventListener('click', () => { startGame().catch(console.error); });
chooseChartButton.addEventListener('click', () => {
  resultPanel.hidden = true;
  setupPanel.hidden = false;
  drawScene(0);
});

canvas.addEventListener('pointerdown', (event) => {
  if (!game.running || game.paused) return;
  event.preventDefault();
  const lane = clientXToLane(event.clientX);
  game.activePointers.set(event.pointerId, lane);
  canvas.setPointerCapture?.(event.pointerId);
  judgeDirect(lane);
});
canvas.addEventListener('pointermove', (event) => {
  if (!game.activePointers.has(event.pointerId)) return;
  event.preventDefault();
  game.activePointers.set(event.pointerId, clientXToLane(event.clientX));
});
function releasePointer(event) {
  if (!game.activePointers.has(event.pointerId)) return;
  const lane = game.activePointers.get(event.pointerId);
  judgeDirect(lane, true);
  game.activePointers.delete(event.pointerId);
}
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('keydown', (event) => {
  const lane = KEY_LANES.get(event.key.toLowerCase());
  if (lane === undefined || event.repeat || !game.running || game.paused) return;
  event.preventDefault();
  game.activeKeys.set(event.key.toLowerCase(), lane);
  judgeDirect(lane);
});
window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  const lane = game.activeKeys.get(key);
  if (lane === undefined) return;
  judgeDirect(lane, true);
  game.activeKeys.delete(key);
});
window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.running && !game.paused) togglePause().catch(console.error);
});
audioPlayer.onended = finishGame;
resizeCanvas();
