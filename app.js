const pet = document.querySelector('#pet');
const petImage = pet.querySelector('img');
const grass = document.querySelector('.grass');
const world = document.querySelector('.world');
const deathScreen = document.querySelector('#death-screen');
const deathCause = document.querySelector('#death-cause');
const restartButton = document.querySelector('#restart-button');
const cloudLayer = document.querySelector('#cloud-layer');
const cloudTemplate = document.querySelector('#cloud-template');
const settingsButton = document.querySelector('#settings-button');
const settingsMenu = document.querySelector('#settings-menu');
const volumeSlider = document.querySelector('#volume-slider');
const volumeControl = document.querySelector('.volume-control');
const saveCodeField = document.querySelector('#save-code');
const copySaveCodeButton = document.querySelector('#copy-save-code');
const importSaveCodeButton = document.querySelector('#import-save-code');
const resetGameButton = document.querySelector('#reset-game');
const saveCodeStatus = document.querySelector('#save-code-status');
const featurePanel = document.querySelector('.feature-panel');
const feedButton = document.querySelector('#feed-button');
const feedButtonLabel = document.querySelector('#feed-button-label');
const foodPicker = document.querySelector('#food-picker');
const foodEmptyHint = document.querySelector('#food-empty-hint');
const interactButton = document.querySelector('#interact-button');
const interactButtonLabel = document.querySelector('#interact-button-label');
const interactionPicker = document.querySelector('#interaction-picker');
const singingButton = document.querySelector('#singing-button');
const singingPicker = document.querySelector('#singing-picker');
const cancelSingingButton = document.querySelector('#cancel-singing-button');
const singingSongButton = document.querySelector('#singing-song-button');
const kimiNoKamisamaSongButton = document.querySelector('#kimi-no-kamisama-song-button');
const songInvitation = document.querySelector('#song-invitation');
const songInvitationActions = document.querySelector('#song-invitation-actions');
const songDeclineConfirmation = document.querySelector('#song-decline-confirmation');
const acceptSongInvitationButton = document.querySelector('#accept-song-invitation');
const declineSongInvitationButton = document.querySelector('#decline-song-invitation');
const backSongInvitationButton = document.querySelector('#back-song-invitation');
const confirmDeclineSongInvitationButton = document.querySelector('#confirm-decline-song-invitation');
const rpsButton = document.querySelector('#rps-button');
const rpsPicker = document.querySelector('#rps-picker');
const endRpsButton = document.querySelector('#end-rps-button');
const rpsResult = document.querySelector('#rps-result');
const rpsChoiceButtons = rpsPicker.querySelectorAll('[data-rps-choice]');
const ballButton = document.querySelector('#ball-button');
const ballGame = document.querySelector('#ball-game');
const ballCourt = document.querySelector('#ball-court');
const ballGameStatus = document.querySelector('#ball-game-status');
const closeBallGameButton = document.querySelector('#close-ball-game');
const ballComboValue = document.querySelector('#ball-combo-value');
const adventureButton = document.querySelector('#adventure-button');
const adventureMenu = document.querySelector('#adventure-menu');
const closeAdventureMenuButton = document.querySelector('#close-adventure-menu');
const catchGame = document.querySelector('#catch-game');
const catchField = document.querySelector('#catch-field');
const catchPenguin = document.querySelector('#catch-penguin');
const closeCatchGameButton = document.querySelector('#close-catch-game');
const catchApples = document.querySelector('#catch-apples');
const catchStones = document.querySelector('#catch-stones');
const miningGame = document.querySelector('#mining-game');
const miningField = document.querySelector('#mining-field');
const miningRocks = document.querySelector('#mining-rocks');
const miningPenguin = document.querySelector('#mining-penguin');
const miningPenguinImage = document.querySelector('#mining-penguin-image');
const miningPickStatus = document.querySelector('#mining-pick-status');
const miningPickRoll = document.querySelector('#mining-pick-roll');
const miningPickRollImage = document.querySelector('#mining-pick-roll-image');
const miningPickRollName = document.querySelector('#mining-pick-roll-name');
const miningResult = document.querySelector('#mining-result');
const closeMiningGameButton = document.querySelector('#close-mining-game');
const hideAndSeekButton = document.querySelector('#hide-and-seek-button');
const hideAndSeekGame = document.querySelector('#hide-and-seek-game');
const hideGameBoard = document.querySelector('#hide-game-board');
const hideGameIntro = document.querySelector('#hide-game-intro');
const hideGameSpots = document.querySelector('#hide-game-spots');
const hidePenguin = document.querySelector('#hide-penguin');
const hidePenguinHit = document.querySelector('#hide-penguin-hit');
const startHideGameButton = document.querySelector('#start-hide-game');
const closeHideGameButton = document.querySelector('#close-hide-game');
const hideGameTimer = document.querySelector('#hide-game-timer');
const hideGameResult = document.querySelector('#hide-game-result');
const hideGameBlackout = document.querySelector('#hide-game-blackout');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const hungerMeter = document.querySelector('.hunger');
const hungerFill = document.querySelector('.hunger-fill');
const healthMeter = document.querySelector('.health');
const healthFill = document.querySelector('.health-fill');
const healthValue = document.querySelector('#health-value');
const affectionMeter = document.querySelector('.affection');
const affectionFill = document.querySelector('.affection-fill');
const affectionValue = document.querySelector('#affection-value');
const hungerValue = document.querySelector('#hunger-value');
const affectionPopups = document.querySelector('#affection-popups');
let position = 42;
let walking = false;
let clickTimer;
let clickCount = 0;
let health = 100;
let hunger = 6;
let affection = 0;
let lastStatusUpdatedAt = Math.floor(Date.now() / 60000);
let lastAffectionCategory = '';
let consecutiveAffectionActions = 0;
let trustPromptUntil = 0;
const OFFLINE_AFFECTION_INTERVAL_MINUTES = 48 * 60;
let isDragging = false;
let isFalling = false;
let isDead = false;
let suppressNextClick = false;
let dragStartX = 0;
let dragStartY = 0;
let petStartLeft = 0;
let petStartTop = 0;
let isFeedingMode = false;
let isInteractionMode = false;
let isSingingMode = false;
let isRpsMode = false;
let isRpsResolving = false;
let isBallMode = false;
let isAdventureMenuOpen = false;
let isCatchMode = false;
let catchAnimationFrame;
let catchSpawnTimer;
let catchApplesCount = 0;
let catchStonesCount = 0;
const catchItems = new Set();
const catchGameState = { lastTime: 0, penguinX: .5 };
let catchControlPointerId = null;
let isMiningMode = false;
let miningPick = null;
let miningRunHadAttempt = false;
let miningRunFoundStone = false;
let miningPickTimer;
let miningRollInterval;
let miningResultTimer;
let miningHoldTimer;
let miningExitTimer;
const miningActionTimers = new Set();
let miningPointerId = null;
let miningTargetRock = null;
let miningPointerStartX = 0;
let miningPointerStartY = 0;
let isHideAndSeekMode = false;
let isHideAndSeekRunning = false;
let hideGameRevealTimer;
let hideGameCountdownTimer;
let hideGameTimeout;
let hideGameNextRoundTimer;
let ballCombo = 0;
const BALL_PLAYER_Y = .80;
let penguinWinStreak = 0;
let rpsResultResetTimer;
let rpsRoundId = 0;
let ballResetTimer;
const normalPetImageSource = petImage.getAttribute('src');
const singingPetImageSource = new URL('image/gugugaga-sing.png?v=20260803-13', document.baseURI).href;
const RPS_PENGUIN_IMAGES = {
  scissors: new URL('image/gugugaga-剪刀.png', document.baseURI).href,
  rock: new URL('image/gugugaga-石頭.png', document.baseURI).href,
  paper: new URL('image/gugugaga-布.png', document.baseURI).href,
};
const RPS_HAND_NAMES = { scissors: '剪刀', rock: '石頭', paper: '布' };
const RPS_LOSING_HAND = { scissors: 'paper', rock: 'scissors', paper: 'rock' };
const RPS_WINNING_HAND = { scissors: 'rock', rock: 'paper', paper: 'scissors' };
let activeFood = null;
let foodDragOffsetX = 0;
let foodDragOffsetY = 0;
let foodDragPointerId = null;
let foodPointerCaptureTarget = null;
let pendingFoodDrag = null;
let activeFoodEdibleAt = 0;
let foodFallFrame;
let foodGroundTimer;
let feedingJumpActive = false;
let foodCollectedDuringJump = false;
let missedFeedingJumps = 0;
let moralSoundHasPlayed = false;
let moralSoundPlaying = false;
let moralSoundPlaybackId = 0;
let stoneGreetingFood = null;
let stoneGreetingCompletedFood = null;
let stoneGreetingTimer;
let lastFeedingJumpAt = 0;
let feedingBehaviorTimer;
const feedingActionTimers = new Set();
let walkTimer;
let walkAnimationTimer;
let cloudUpdateTimer;
let dayNightTimer;
let healTimer;
let fallAnimationFrame;
let runtimeSuspended = document.hidden;
let runtimeResumeMode = null;
let modeTransitionInProgress = false;
let invitationResumeMode = null;
let isOpeningSongInvitation = false;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext;
let masterGainNode;
let audioContextPrimed = false;
let gameAudioActivated = false;
let genshinSoundPending = false;
let genshinSoundPlayed = false;
let lockedCloudCount = null;
const VOLUME_STORAGE_KEY = 'gugagame-web-volume';
const FOOD_STORAGE_KEY = 'gugagame-food-inventory';
const FOOD_STORAGE_VERSION_KEY = 'gugagame-food-inventory-version';
const FOOD_STORAGE_VERSION = 'catch-rewards-v1';
const FOOD_MAX_QUANTITY = 99;
const FOOD_TYPES = ['apple', 'stone'];
const SAVE_STORAGE_KEY = 'gugagame-save-state-v1';
const SONG_INVITATION_STORAGE_KEY = 'gugagame-kimi-no-kamisama-invitation-v1';
const SONG_INVITATION_AFFECTION = 70;
const AFFECTION_STORAGE_VERSION_KEY = 'gugagame-affection-version';
const AFFECTION_STORAGE_VERSION = 'trust-growth-v1';
const SAVE_CODE_PREFIX = 'GG1';
const SAVE_CODE_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const SAVE_CODE_CHECKSUM_MODULUS = 65_536;
const SAVE_CODE_MAX_INPUT_LENGTH = 128;
const SAVE_CODE_MAX_NORMALIZED_LENGTH = 64;
let foodInventoryNeedsMigration = false;
let storageWriteFailed = false;

function readSongInvitationState() {
  try {
    const state = window.localStorage.getItem(SONG_INVITATION_STORAGE_KEY);
    if (['unlocked-new', 'unlocked-seen', 'declined'].includes(state)) return state;
  } catch {}
  return 'pending';
}

let songInvitationState = readSongInvitationState();

function writeSongInvitationState(state) {
  songInvitationState = state;
  return writeStorageItem(SONG_INVITATION_STORAGE_KEY, state);
}

function writeStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    storageWriteFailed = true;
    console.warn(`[storage] 無法保存 ${key}`, error);
    return false;
  }
}

function readFoodInventory() {
  const defaults = { apple: 10, stone: 0 };
  try {
    if (window.localStorage.getItem(FOOD_STORAGE_VERSION_KEY) !== FOOD_STORAGE_VERSION) {
      foodInventoryNeedsMigration = true;
      return defaults;
    }
    const stored = JSON.parse(window.localStorage.getItem(FOOD_STORAGE_KEY) || 'null');
    if (!stored || typeof stored !== 'object') return defaults;
    return Object.fromEntries(FOOD_TYPES.map((type) => {
      const value = Number(stored[type]);
      return [type, Number.isFinite(value) ? Math.max(0, Math.min(FOOD_MAX_QUANTITY, Math.floor(value))) : 0];
    }));
  } catch {
    return defaults;
  }
}

let foodInventory = readFoodInventory();

function writeFoodInventory() {
  const inventorySaved = writeStorageItem(FOOD_STORAGE_KEY, JSON.stringify(foodInventory));
  const versionSaved = inventorySaved && writeStorageItem(FOOD_STORAGE_VERSION_KEY, FOOD_STORAGE_VERSION);
  if (versionSaved && inventorySaved) foodInventoryNeedsMigration = false;
  return versionSaved && inventorySaved;
}

function clampInteger(value, minimum, maximum) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : minimum;
}

function getSaveState() {
  return {
    apple: clampInteger(foodInventory.apple, 0, FOOD_MAX_QUANTITY),
    stone: clampInteger(foodInventory.stone, 0, FOOD_MAX_QUANTITY),
    health: clampInteger(health, 1, 100),
    hunger2: clampInteger(hunger * 2, 0, 20),
    affection: clampInteger(affection, 0, 100),
    lastUpdatedAt: Math.max(0, Math.floor(lastStatusUpdatedAt)),
  };
}

function saveGameState(touchTimestamp = true) {
  if (touchTimestamp) lastStatusUpdatedAt = Math.floor(Date.now() / 60000);
  return writeStorageItem(SAVE_STORAGE_KEY, JSON.stringify(getSaveState()));
}

function saveFoodInventory() {
  const inventorySaved = writeFoodInventory();
  const gameSaved = saveGameState();
  return inventorySaved && gameSaved;
}

function restoreGameState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SAVE_STORAGE_KEY) || 'null');
    if (!stored || typeof stored !== 'object') return;
    const needsAffectionMigration = window.localStorage.getItem(AFFECTION_STORAGE_VERSION_KEY) !== AFFECTION_STORAGE_VERSION;
    if (!foodInventoryNeedsMigration) {
      foodInventory.apple = clampInteger(stored.apple, 0, FOOD_MAX_QUANTITY);
      foodInventory.stone = clampInteger(stored.stone, 0, FOOD_MAX_QUANTITY);
    }
    health = clampInteger(stored.health, 1, 100);
    hunger = clampInteger(stored.hunger2, 0, 20) / 2;
    const now = Math.floor(Date.now() / 60000);
    lastStatusUpdatedAt = clampInteger(stored.lastUpdatedAt, 0, now);
    const elapsedMinutes = Math.max(0, now - lastStatusUpdatedAt);
    const missedPeriods = Math.floor(elapsedMinutes / OFFLINE_AFFECTION_INTERVAL_MINUTES);
    affection = needsAffectionMigration ? 0 : Math.max(0, clampInteger(stored.affection, 0, 100) - missedPeriods);
    if (needsAffectionMigration && foodInventory.apple === 0) foodInventory.apple = 1;
    lastStatusUpdatedAt = now;
    writeStorageItem(AFFECTION_STORAGE_VERSION_KEY, AFFECTION_STORAGE_VERSION);
  } catch {}
}

function encodeBase58(value) {
  if (value === 0n) return SAVE_CODE_ALPHABET[0];
  let encoded = '';
  while (value > 0n) {
    const remainder = Number(value % 58n);
    encoded = SAVE_CODE_ALPHABET[remainder] + encoded;
    value /= 58n;
  }
  return encoded;
}

function decodeBase58(value) {
  let decoded = 0n;
  for (const character of value) {
    const digit = SAVE_CODE_ALPHABET.indexOf(character);
    if (digit < 0) throw new Error('存檔碼含有不支援的字元。');
    decoded = decoded * 58n + BigInt(digit);
  }
  return decoded;
}

function saveChecksum(value) {
  let checksum = 0x811c;
  for (const character of value) {
    checksum ^= character.charCodeAt(0);
    checksum = Math.imul(checksum, 0x0101) >>> 0;
  }
  return checksum % SAVE_CODE_CHECKSUM_MODULUS;
}

function encodeSaveCode() {
  const state = getSaveState();
  let packed = BigInt(state.lastUpdatedAt);
  packed = packed * 100n + BigInt(state.apple);
  packed = packed * 100n + BigInt(state.stone);
  packed = packed * 101n + BigInt(state.health);
  packed = packed * 21n + BigInt(state.hunger2);
  packed = packed * 101n + BigInt(state.affection);
  const payload = encodeBase58(packed);
  return `${SAVE_CODE_PREFIX}-${payload}-${encodeBase58(BigInt(saveChecksum(payload))).padStart(3, SAVE_CODE_ALPHABET[0])}`;
}

function decodeSaveCode(code) {
  if (typeof code !== 'string' || code.length > SAVE_CODE_MAX_INPUT_LENGTH) {
    throw new Error('存檔碼過長。');
  }
  const normalized = code.trim().replace(/[\s-]+/g, '');
  if (normalized.length > SAVE_CODE_MAX_NORMALIZED_LENGTH) throw new Error('存檔碼過長。');
  if (!normalized.startsWith(SAVE_CODE_PREFIX)) throw new Error('這不是 GG1 存檔碼。');
  const raw = normalized.slice(SAVE_CODE_PREFIX.length);
  if (raw.length < 4) throw new Error('存檔碼不完整。');
  if ([...raw].some((character) => !SAVE_CODE_ALPHABET.includes(character))) {
    throw new Error('存檔碼含有不支援的字元。');
  }
  const payload = raw.slice(0, -3);
  const checksum = raw.slice(-3);
  if (Number(decodeBase58(checksum)) !== saveChecksum(payload)) throw new Error('存檔碼校驗失敗，請確認是否完整貼上。');
  let packed = decodeBase58(payload);
  const take = (base) => {
    const value = Number(packed % BigInt(base));
    packed /= BigInt(base);
    return value;
  };
  const affection = take(101);
  const hunger2 = take(21);
  const health = take(101);
  const stone = take(100);
  const apple = take(100);
  const lastUpdatedAt = Number(packed);
  const now = Math.floor(Date.now() / 60000);
  if (!Number.isSafeInteger(lastUpdatedAt) || lastUpdatedAt < 0 || lastUpdatedAt > now + 10) throw new Error('存檔時間無效。');
  return { apple, stone, health: Math.max(1, health), hunger2, affection, lastUpdatedAt };
}

function setSaveCodeStatus(message, isError = false) {
  saveCodeStatus.textContent = message;
  saveCodeStatus.classList.toggle('is-error', isError);
}

function renderSavedState() {
  renderHealth();
  renderHunger();
  renderAffection();
  updateFoodPicker();
  maybeShowSongInvitation();
}

restoreGameState();
writeFoodInventory();
saveGameState();

function updateFoodPicker() {
  let totalQuantity = 0;
  foodPicker.querySelectorAll('[data-food-type]').forEach((button) => {
    const type = button.dataset.foodType;
    const quantity = foodInventory[type] ?? 0;
    totalQuantity += quantity;
    const label = button.querySelector('.food-quantity');
    if (label) label.textContent = `×${quantity}`;
    button.disabled = quantity <= 0;
    button.setAttribute('aria-label', `${type === 'apple' ? '蘋果' : '石頭'}，剩餘 ${quantity} 個`);
  });
  foodEmptyHint.hidden = totalQuantity > 0;
}

function readSavedVolume() {
  try {
    const storedVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedVolume === null) return 1;
    const savedVolume = Number(storedVolume);
    if (Number.isFinite(savedVolume)) return Math.max(0, Math.min(1, savedVolume));
  } catch {}
  return 1;
}

let gameVolume = readSavedVolume();

function createSound(path) {
  const element = new Audio();
  element.preload = 'none';
  element.src = path;
  return {
    element,
    buffer: null,
    bufferPromise: null,
    playbackGeneration: 0,
    sources: new Set(),
  };
}

const hurtSound = createSound('audio/痾啊.wav');
const landingSound = createSound('audio/落地.wav');
const screamSound = createSound('audio/咿.wav');
const deathSound = createSound('audio/死亡音效.wav');
const deathNoteSound = createSound('audio/死亡筆記本.wav');
const moralSound = createSound('audio/做事要講良心.wav');
const genshinSound = createSound('audio/好想玩原神.wav');
const singingSound = createSound('audio/壱雫空.wav');
const kimiNoKamisamaSound = createSound('audio/想成為你的神.wav');
const penguinWinSound = createSound('audio/gugugaga.wav');
const singingSounds = new Set([singingSound, kimiNoKamisamaSound]);
const gameSounds = [hurtSound, landingSound, screamSound, deathSound, deathNoteSound, moralSound, genshinSound, singingSound, kimiNoKamisamaSound, penguinWinSound];
const SINGING_WAVEFORM_FPS = 20;
const SINGING_WAVEFORM = Uint8Array.of(42,44,54,56,58,62,60,60,63,68,69,69,86,80,72,66,68,70,70,70,70,72,69,43,4,59,62,65,63,59,53,70,71,68,57,16,70,100,89,85,92,82,87,100,77,85,86,82,85,100,83,89,84,66,77,99,95,93,89,76,85,100,79,92,80,73,90,100,100,89,88,86,92,91,74,88,77,74,97,99,98,92,84,87,100,91,87,91,84,81,100,88,93,86,87,85,99,84,88,87,70,80,100,99,97,85,81,85,99,81,92,85,80,83,100,98,95,91,85,94,97,78,89,77,72,94,98,100,88,80,69,97,89,88,83,76,74,100,97,100,87,81,88,100,79,91,76,72,86,100,100,95,84,76,92,97,83,92,82,79,98,99,99,93,79,83,95,93,80,87,83,89,99,99,97,84,73,81,92,95,77,89,87,85,96,99,95,95,84,83,98,87,83,95,87,92,83,90,84,100,100,100,89,86,91,96,78,89,99,74,93,78,76,87,96,84,92,98,68,89,82,81,86,78,76,96,94,87,96,99,90,91,81,75,91,83,90,100,77,83,100,87,86,89,82,78,83,82,87,97,90,92,100,73,88,82,82,84,83,82,90,96,80,87,99,71,92,85,72,85,75,75,98,94,80,93,98,80,99,76,77,81,81,84,98,83,80,99,85,88,89,85,83,84,84,88,98,83,84,99,81,90,86,81,85,98,96,96,93,79,100,98,96,94,79,81,82,80,80,90,86,84,82,86,77,90,76,74,95,91,79,92,82,83,99,81,82,90,82,84,100,80,88,84,84,82,81,76,74,91,72,88,92,70,83,84,81,89,99,76,85,82,78,87,99,78,88,86,80,83,74,91,85,79,69,82,89,83,90,86,86,89,85,85,87,84,85,95,93,85,96,92,90,89,88,80,84,68,42,71,54,52,60,62,63,60,39,47,58,15,62,65,68,73,69,65,69,69,66,67,67,65,93,90,75,91,73,70,92,70,76,90,76,75);
const SINGING_BEATS = [[.07,.34],[.61,.27],[1.26,.83],[1.57,.48],[1.83,.74],[2.28,.95],[3.04,.64],[3.47,1],[3.76,.8],[4.62,.52],[4.94,.8],[5.14,.53],[5.82,.73],[6.26,.62],[6.95,.56],[7.28,.84],[7.57,.61],[7.87,.74],[8.37,.58],[8.58,.7],[8.94,.7],[9.31,.55],[9.55,.66],[9.79,.65],[10.53,1],[10.85,.99],[11.26,.82],[11.45,.78],[11.99,.93],[12.43,.71],[12.73,1],[13.03,.92],[13.32,1],[13.9,1],[14.49,.94],[14.99,.62],[15.24,.75],[15.51,.76],[15.96,1],[16.42,.77],[16.82,.52],[17.13,.52],[17.59,.7],[17.89,.83],[18.32,.85],[18.55,.79],[19.06,.74],[19.49,.88],[19.76,.48],[19.95,.83],[20.52,.61],[21.11,1],[21.41,1]];
const SINGING_CHOREOGRAPHY = [[0,0],[1.26,-7],[2.28,5],[3.47,-3],[4.62,10],[5.82,1],[7.28,-11],[8.58,7],[10.53,0],[11.99,-13],[13.32,13],[14.99,3],[15.96,-8],[17.59,9],[19.06,-5],[20.52,5],[21.66,0]];
const KIMI_SINGING_CHOREOGRAPHY = [...SINGING_CHOREOGRAPHY, [23,-12],[24.4,10],[25.8,-14],[27.1,13],[28.4,-9],[29.7,15],[31,-15],[32.2,8],[33.4,-12],[34.6,14],[35.7,-8],[36.8,11],[37.8,-13],[38.8,8],[40.4,0]];
const KIMI_SINGING_TAIL_START = 21.66;
let singingAnimationFrame;
let activeSingingSound = null;
let singingPlaybackId = 0;
let isMandatoryFirstSong = false;
let singingCompletionTimer;

function setMandatoryFirstSong(enabled) {
  isMandatoryFirstSong = enabled;
  cancelSingingButton.disabled = enabled;
  singingSongButton.disabled = enabled;
  if (!enabled) kimiNoKamisamaSongButton.disabled = false;
  document.body.classList.toggle('mandatory-first-song', enabled);
  syncRuntimeIsolation();
}

function ensureAudioGraph() {
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (!masterGainNode) {
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = gameVolume;
    masterGainNode.connect(audioContext.destination);
  }
  return audioContext;
}

function setGameVolume(volume, persist = true) {
  gameVolume = Math.max(0, Math.min(1, volume));
  gameSounds.forEach((sound) => { sound.element.volume = gameVolume; });
  if (masterGainNode) masterGainNode.gain.value = gameVolume;
  volumeSlider.value = String(Math.round(gameVolume * 100));
  volumeSlider.setAttribute('aria-valuetext', `${Math.round(gameVolume * 100)}%`);
  volumeControl.classList.toggle('is-muted', gameVolume === 0);
  if (!persist) return;
  writeStorageItem(VOLUME_STORAGE_KEY, String(gameVolume));
}

volumeSlider.addEventListener('input', () => {
  setGameVolume(Number(volumeSlider.value) / 100);
});
setGameVolume(gameVolume, false);

copySaveCodeButton.addEventListener('click', async () => {
  storageWriteFailed = false;
  const stateSaved = saveGameState();
  const code = encodeSaveCode();
  saveCodeField.value = code;
  saveCodeField.focus();
  saveCodeField.select();
  try {
    await navigator.clipboard.writeText(code);
    setSaveCodeStatus(stateSaved ? '存檔碼已生成並複製。' : '存檔碼已複製，但瀏覽器拒絕保存本機進度。', !stateSaved);
  } catch {
    setSaveCodeStatus(stateSaved ? '存檔碼已生成，請自行複製備份。' : '存檔碼已生成，但瀏覽器拒絕保存本機進度。', !stateSaved);
  }
});

importSaveCodeButton.addEventListener('click', () => {
  try {
    const state = decodeSaveCode(saveCodeField.value);
    if (!window.confirm('匯入會覆蓋目前的背包、血量、飽食度與好感度，確定要繼續嗎？')) return;
    foodInventory.apple = state.apple;
    foodInventory.stone = state.stone;
    health = state.health;
    hunger = state.hunger2 / 2;
    affection = state.affection;
    lastStatusUpdatedAt = state.lastUpdatedAt;
    storageWriteFailed = false;
    foodInventoryNeedsMigration = false;
    const inventorySaved = writeFoodInventory();
    const stateSaved = saveGameState(false);
    renderSavedState();
    const persisted = inventorySaved && stateSaved && !storageWriteFailed;
    setSaveCodeStatus(
      persisted ? '已匯入存檔碼。' : '已套用存檔碼，但瀏覽器拒絕保存；重新載入後可能復原。',
      !persisted,
    );
  } catch (error) {
    setSaveCodeStatus(error.message || '無法讀取存檔碼。', true);
  }
});

const MAX_HEALTH = 100;
const MAX_HUNGER = 10;
const MAX_AFFECTION = 100;
const HEALTH_UNIT = 20;
const CATCH_BOMB_DAMAGE = 10;
const FALL_GRAVITY = 1900;
const SAFE_FALL_HEIGHT = 120;
const FALL_DAMAGE_HEIGHT_STEP = 100;
const MAX_FALL_DAMAGE = MAX_HEALTH;
const FULL_HUNGER_HEAL_INTERVAL = 3000;
const HEAL_AMOUNT = 10;
const HEAL_HUNGER_COST = 1;
const FEED_HUNGER_GAIN = .5;
const FEED_AFFECTION_GAIN = 2;
const STONE_HUNGER_GAIN = 1;
const STONE_AFFECTION_GAIN = 5;
const AFFECTION_LOSS_PER_10_DAMAGE = 10;
const DEATH_RED_FLASH_DELAY = 180;
const DEATH_SCREEN_DELAY = 500;
const CLOUD_TRAVEL_MS = 60_000;
const MULTI_CLICK_DELAY = 500;
const DEATH_NOTE_DURATION_MS = 3643;
const FEEDING_TICK_MS = 120;
const FEEDING_JUMP_COOLDOWN_MS = 800;
const MORAL_SOUND_INITIAL_JUMPS = 3;
const MORAL_SOUND_REPEAT_JUMPS = 2;
const FEEDING_REACH_PADDING = 22;
const FOOD_DRAG_START_DISTANCE = 7;
const FOOD_EAT_DELAY_MS = 1000;
const FOOD_FALL_GRAVITY = 1600;
const FOOD_GROUND_FADE_DELAY_MS = 300;
const FOOD_GROUND_FADE_DURATION_MS = 500;
const STONE_GROUND_LIFETIME_MS = 3000;
const STONE_GREETING_LOOK_MS = 240;
const MINING_HUNGER_COST = 1;
const MINING_MIN_HUNGER = MAX_HUNGER * .35;
const MINING_HOLD_MS = 550;
const MINING_PICKS = [
  { id: 'diamond', name: '鑽石鎬', chance: 1, image: 'image/gugugaga_鑽石.png', pickImage: 'image/鑽石鎬.png' },
  { id: 'iron', name: '鐵鎬', chance: .75, image: 'image/gugugaga＿鐵鎬.png', pickImage: 'image/鐵鎬.png' },
  { id: 'stone', name: '石鎬', chance: .5, image: 'image/gugugaga＿石鎬.png', pickImage: 'image/石鎬.png' },
  { id: 'wood', name: '木鎬', chance: .25, image: 'image/gugugaga_木鎬.png', pickImage: 'image/木鎬.webp' },
];
const USE_IOS_TOUCH_DRAG = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function getMinuteCloudCount(date = new Date()) {
  return date.getMinutes() % 10;
}

function isSettingsOpen() {
  return document.body.classList.contains('settings-open');
}

function getActiveRuntimeMode() {
  if (isSettingsOpen()) return 'settings';
  if (isFeedingMode) return 'feeding';
  if (isInteractionMode) return 'interaction';
  if (isSingingMode) return 'singing';
  if (isRpsMode) return 'rps';
  if (isBallMode) return 'ball';
  if (isAdventureMenuOpen) return 'adventure';
  if (isCatchMode) return 'catch';
  if (isMiningMode) return 'mining';
  if (isHideAndSeekMode) return 'hide';
  return 'main';
}

function syncRuntimeIsolation() {
  const overlayStates = new Map([
    [adventureMenu, isAdventureMenuOpen],
    [catchGame, isCatchMode],
    [miningGame, isMiningMode],
    [ballGame, isBallMode],
    [hideAndSeekGame, isHideAndSeekMode],
    [deathScreen, isDead && deathScreen.classList.contains('is-visible')],
  ]);
  const activeOverlay = [...overlayStates].find(([, active]) => active)?.[0] ?? null;
  const activeMode = getActiveRuntimeMode();
  const limitedMode = ['settings', 'feeding', 'interaction', 'singing', 'rps'].includes(activeMode);
  const settingsAvailable = !isDead && !isMandatoryFirstSong && !songInvitation.open;
  settingsButton.hidden = !settingsAvailable;
  settingsButton.disabled = !settingsAvailable;
  [...world.children].forEach((child) => {
    if (child === settingsButton) child.inert = !settingsAvailable;
    else if (activeOverlay) child.inert = child !== activeOverlay;
    else if (activeMode === 'settings') child.inert = child !== settingsButton && child !== settingsMenu;
    else if (limitedMode) {
      const isModeControl = child === featurePanel
        || child === affectionPopups
        || (activeMode === 'feeding' && child.classList.contains('feeding-item'))
        || (activeMode === 'rps' && child === rpsResult);
      child.inert = !isModeControl;
    }
    else if (overlayStates.has(child)) child.inert = !overlayStates.get(child);
    else child.inert = false;
  });
}

function focusRuntimeControl(control) {
  window.requestAnimationFrame(() => {
    if (!runtimeSuspended && control && !control.disabled && !control.closest('[inert]')) control.focus();
  });
}

function closeCompetingModes(targetMode, options = {}) {
  if (targetMode && runtimeSuspended) return false;
  if (targetMode && isMandatoryFirstSong && targetMode !== 'singing') return false;
  if (modeTransitionInProgress) return true;
  modeTransitionInProgress = true;
  try {
    if (targetMode !== 'settings' && isSettingsOpen()) setSettingsOpen(false, { coordinated: true });
    if (targetMode !== 'feeding' && isFeedingMode) setFeedingMode(false, { coordinated: true });
    if (targetMode !== 'interaction' && isInteractionMode) setInteractionMode(false, { coordinated: true });
    if (targetMode !== 'singing' && isSingingMode) setSingingMode(false, { coordinated: true, force: options.forceSinging });
    if (targetMode !== 'rps' && isRpsMode) setRpsMode(false, { coordinated: true });
    if (targetMode !== 'ball' && isBallMode) setBallMode(false, { coordinated: true });
    if (targetMode !== 'adventure' && isAdventureMenuOpen) setAdventureMenu(false, { coordinated: true });
    if (targetMode !== 'catch' && isCatchMode) setCatchMode(false, { coordinated: true });
    if (targetMode !== 'mining' && isMiningMode) {
      setMiningMode(false, { coordinated: true, awardRun: options.awardMining !== false });
    }
    if (targetMode !== 'hide' && isHideAndSeekMode) setHideAndSeekMode(false, { coordinated: true });
  } finally {
    modeTransitionInProgress = false;
  }
  if (targetMode && songInvitation.open && targetMode !== 'singing') return false;
  syncRuntimeIsolation();
  return true;
}

function resumeRuntimeMode(mode) {
  if (!mode || mode === 'main' || runtimeSuspended || songInvitation.open || isDead) return;
  if (mode === 'settings') setSettingsOpen(true);
  else if (mode === 'feeding') setFeedingMode(true);
  else if (mode === 'interaction') setInteractionMode(true);
  else if (mode === 'singing') setSingingMode(true);
  else if (mode === 'rps') setRpsMode(true);
  else if (mode === 'ball') setBallMode(true);
  else if (mode === 'adventure') setAdventureMenu(true);
  else if (mode === 'catch') setCatchMode(true);
  else if (mode === 'mining') setMiningMode(true);
  else if (mode === 'hide') setHideAndSeekMode(true);
}

function canPlayGenshinSound() {
  return walking && !isSettingsOpen() && !isFeedingMode && !isInteractionMode && !isSingingMode && !isRpsMode && !isRpsResolving && !isBallMode && !isAdventureMenuOpen && !isCatchMode && !isMiningMode && !isHideAndSeekMode && !isDead && !isDragging && !isFalling;
}

function stopGenshinOutsideMain() {
  stopSound(genshinSound);
  genshinSoundPending = false;
  lockedCloudCount = null;
}

function maybePlayGenshinSound(count) {
  if (count !== 9 || genshinSoundPlayed || genshinSoundPending || !canPlayGenshinSound()) return;
  if (gameAudioActivated) {
    genshinSoundPlayed = true;
    playGenshinSoundWithCloudLock(count);
  } else {
    genshinSoundPending = true;
  }
}

function renderClouds(count) {
  if (lockedCloudCount !== null && count !== lockedCloudCount) return;
  cloudLayer.replaceChildren();

  for (let index = 0; index < count; index += 1) {
    const cloud = cloudTemplate.content.firstElementChild.cloneNode(true);
    const top = 4 + Math.random() * 52;
    const width = 80 + Math.random() * 115;
    const phase = (index + .2 + Math.random() * .6) / count;
    cloud.style.top = `${top}%`;
    cloud.style.setProperty('--cloud-width', `${width}px`);
    cloud.style.animationDelay = `${-phase * CLOUD_TRAVEL_MS}ms`;
    cloudLayer.append(cloud);
  }

  if (count === 9) {
    maybePlayGenshinSound(count);
  } else {
    genshinSoundPending = false;
  }
}

function playGenshinSoundWithCloudLock(count = cloudLayer.childElementCount) {
  if (!canPlayGenshinSound()) {
    genshinSoundPending = false;
    return;
  }
  lockedCloudCount = count;
  playSound(genshinSound, () => {
    lockedCloudCount = null;
    updateCloudsFromClock();
  });
}

function updateCloudsFromClock() {
  const now = new Date();
  const count = getMinuteCloudCount(now);
  renderClouds(count);
}

function scheduleNextCloudUpdate() {
  window.clearTimeout(cloudUpdateTimer);
  cloudUpdateTimer = undefined;
  if (runtimeSuspended) return;
  const delay = CLOUD_TRAVEL_MS - (Date.now() % CLOUD_TRAVEL_MS);
  cloudUpdateTimer = window.setTimeout(() => {
    cloudUpdateTimer = undefined;
    updateCloudsFromClock();
    scheduleNextCloudUpdate();
  }, delay);
}

function setSettingsOpen(isOpen, options = {}) {
  if (isOpen === isSettingsOpen()) return true;
  if (isOpen && (isMandatoryFirstSong || runtimeSuspended || isDead)) return false;
  if (isOpen && !options.coordinated && !closeCompetingModes('settings')) return false;
  document.body.classList.toggle('settings-open', isOpen);
  if (isOpen) {
    stopGenshinOutsideMain();
  }
  if (isOpen && clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = undefined;
    clickCount = 0;
  }
  pet.disabled = isOpen;
  featurePanel.inert = isOpen;
  settingsButton.setAttribute('aria-expanded', String(isOpen));
  settingsButton.setAttribute('aria-label', isOpen ? '關閉設定' : '開啟設定');
  settingsMenu.setAttribute('aria-hidden', String(!isOpen));
  syncRuntimeIsolation();
  if (isOpen) focusRuntimeControl(volumeSlider);
  else if (!options.coordinated) focusRuntimeControl(settingsButton);
  return true;
}

function toggleSettings() {
  return setSettingsOpen(!isSettingsOpen());
}

settingsButton.addEventListener('click', toggleSettings);
document.addEventListener('click', (event) => {
  if (!isSettingsOpen()) return;
  if (settingsMenu.contains(event.target) || settingsButton.contains(event.target)) return;
  toggleSettings();
});

// Production feature: derive the scene from the browser's local time.
function updateDayNightFromBrowserTime() {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  document.body.classList.toggle('is-night', isNight);
  themeColorMeta.content = isNight ? '#263f76' : '#80d2ef';
}

function renderHunger() {
  const percentage = (hunger / MAX_HUNGER) * 100;
  hungerFill.style.width = `${percentage}%`;
  hungerValue.textContent = Number.isInteger(hunger) ? String(hunger) : hunger.toFixed(1);
  hungerMeter.setAttribute('aria-label', `飽食度：${percentage}%`);
}

function renderHealth() {
  const percentage = (health / MAX_HEALTH) * 100;
  healthFill.style.width = `${percentage}%`;
  healthValue.textContent = String(health);
  healthMeter.setAttribute('aria-label', `血量：${percentage}%`);
}

function renderAffection() {
  affectionFill.style.width = `${affection}%`;
  affectionValue.textContent = String(affection);
  affectionMeter.setAttribute('aria-label', `好感度：${affection}%`);
}

function showAffectionPopup(amount, isLoss = false) {
  const petRect = pet.getBoundingClientRect();
  const popup = document.createElement('p');
  popup.className = `affection-popup${isLoss ? ' is-loss' : ''}`;
  popup.textContent = typeof amount === 'string' ? amount : `好感 ${isLoss ? '-' : '+'}${amount}`;
  popup.style.left = `${petRect.left + petRect.width / 2}px`;
  popup.style.top = `${Math.max(18, petRect.top)}px`;
  affectionPopups.append(popup);
  requestAnimationFrame(() => popup.classList.add('is-visible'));
  window.setTimeout(() => popup.classList.add('is-fading'), 1750);
  window.setTimeout(() => popup.remove(), 2150);
}

function applyAffectionGain(baseAmount, category) {
  if (affection >= MAX_AFFECTION || baseAmount <= 0) return 0;
  if (category === lastAffectionCategory) consecutiveAffectionActions += 1;
  else {
    lastAffectionCategory = category;
    consecutiveAffectionActions = 1;
  }
  const amount = consecutiveAffectionActions > 3 ? Math.max(1, Math.round(baseAmount * .2)) : baseAmount;
  const gained = Math.min(amount, MAX_AFFECTION - affection);
  affection += gained;
  renderAffection();
  saveGameState();
  showAffectionPopup(gained);
  maybeShowSongInvitation();
  return gained;
}

function applyAffectionLoss(amount, showPopup = true) {
  const lost = Math.min(Math.max(0, amount), affection);
  if (!lost) return 0;
  affection -= lost;
  renderAffection();
  saveGameState();
  if (showPopup) showAffectionPopup(lost, true);
  return lost;
}

function affectionRequired(minimum = 1) {
  if (affection >= minimum) return false;
  if (Date.now() >= trustPromptUntil) {
    trustPromptUntil = Date.now() + 900;
    showAffectionPopup(affection === 0 ? '好感度不足，先去餵食吧！' : `需要好感度 ${minimum}`);
  }
  return true;
}

function renderKimiNoKamisamaUnlock() {
  const isUnlocked = songInvitationState === 'unlocked-new' || songInvitationState === 'unlocked-seen';
  kimiNoKamisamaSongButton.hidden = !isUnlocked;
  kimiNoKamisamaSongButton.classList.toggle('is-first-unlock', songInvitationState === 'unlocked-new');
}

function resetSongInvitation() {
  invitationResumeMode = null;
  writeSongInvitationState('pending');
  if (songInvitation.open) songInvitation.close();
  showSongInvitationChoice();
  renderKimiNoKamisamaUnlock();
}

function showSongInvitationChoice() {
  songInvitationActions.hidden = false;
  songDeclineConfirmation.hidden = true;
}

function maybeShowSongInvitation() {
  if (affection < SONG_INVITATION_AFFECTION || songInvitationState !== 'pending' || songInvitation.open || isDead || runtimeSuspended || isOpeningSongInvitation) return;
  isOpeningSongInvitation = true;
  invitationResumeMode = getActiveRuntimeMode();
  closeCompetingModes(null, { forceSinging: true, awardMining: true });
  showSongInvitationChoice();
  try {
    songInvitation.showModal();
    syncRuntimeIsolation();
  } catch (error) {
    console.warn('[invitation] 無法開啟歌曲邀請', error);
    resumeAfterSongInvitation();
  } finally {
    isOpeningSongInvitation = false;
  }
}

function resumeAfterSongInvitation() {
  const mode = invitationResumeMode;
  invitationResumeMode = null;
  resumeRuntimeMode(mode);
}

function openUnlockedSongScreen() {
  if (songInvitation.open) songInvitation.close();
  invitationResumeMode = null;
  closeCompetingModes('singing', { forceSinging: true, awardMining: true });
  setSingingMode(true);
  renderKimiNoKamisamaUnlock();
  window.requestAnimationFrame(() => kimiNoKamisamaSongButton.focus());
}

function resetMoralSoundSequence(stopPlayback = false) {
  moralSoundPlaybackId += 1;
  missedFeedingJumps = 0;
  moralSoundHasPlayed = false;
  moralSoundPlaying = false;
  if (stopPlayback) stopSound(moralSound);
}

function removeActiveFood() {
  cancelFoodFall();
  if (!activeFood) return;
  cancelStoneGreeting();
  stoneGreetingCompletedFood = null;
  activeFood.remove();
  activeFood = null;
  foodDragPointerId = null;
  activeFoodEdibleAt = 0;
  stopFeedingMovement();
}

function stopFeedingMovement() {
  const wasMovingForFood = pet.classList.contains('feeding-chasing')
    || pet.classList.contains('feeding-running-away');
  const currentPetLeft = wasMovingForFood ? pet.getBoundingClientRect().left : 0;
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
  if (wasMovingForFood) {
    pet.style.left = `${currentPetLeft}px`;
    position = (currentPetLeft / window.innerWidth) * 100;
  }
}

function cancelFoodFall() {
  if (foodFallFrame !== undefined) {
    window.cancelAnimationFrame(foodFallFrame);
    foodFallFrame = undefined;
  }
  if (foodGroundTimer !== undefined) {
    window.clearTimeout(foodGroundTimer);
    foodGroundTimer = undefined;
  }
  if (activeFood) activeFood.classList.remove('falling', 'landed');
}

function landFood(food) {
  if (activeFood !== food) return;
  foodFallFrame = undefined;
  // Food is only interactable while held above the grass. Once it lands, remove
  // it before the feeding loop can make the penguin chase it across the ground.
  removeActiveFood();
}

function startFoodFall() {
  if (!activeFood || foodDragPointerId !== null) return;
  cancelFoodFall();
  const food = activeFood;
  const startTop = food.getBoundingClientRect().top;
  const targetTop = grass.getBoundingClientRect().top - food.offsetHeight;
  if (startTop >= targetTop) {
    food.style.top = `${targetTop}px`;
    landFood(food);
    return;
  }

  let startedAt;
  food.classList.add('falling');
  const fallStep = (timestamp) => {
    if (activeFood !== food || foodDragPointerId !== null) return;
    if (startedAt === undefined) startedAt = timestamp;
    const elapsedSeconds = (timestamp - startedAt) / 1000;
    const nextTop = Math.min(targetTop, startTop + .5 * FOOD_FALL_GRAVITY * elapsedSeconds ** 2);
    food.style.top = `${nextTop}px`;
    if (nextTop < targetTop) {
      foodFallFrame = window.requestAnimationFrame(fallStep);
      return;
    }
    landFood(food);
  };
  foodFallFrame = window.requestAnimationFrame(fallStep);
}

function captureFoodPointer(element, pointerId) {
  try {
    element.setPointerCapture(pointerId);
    foodPointerCaptureTarget = element;
  } catch {
    foodPointerCaptureTarget = null;
  }
}

function releaseCapturedFoodPointer(pointerId) {
  if (!foodPointerCaptureTarget) return;
  try {
    if (foodPointerCaptureTarget.hasPointerCapture(pointerId)) {
      foodPointerCaptureTarget.releasePointerCapture(pointerId);
    }
  } catch {}
  foodPointerCaptureTarget = null;
}

function setFeedingMode(enabled, options = {}) {
  if (enabled === isFeedingMode) {
    if (enabled) startFeedingBehaviorLoop();
    return true;
  }
  if (enabled && (isSettingsOpen() || isDead || isDragging || isFalling)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('feeding')) return false;
  isFeedingMode = enabled;
  document.body.classList.toggle('feeding-mode', enabled);
  foodPicker.inert = !enabled;
  foodPicker.setAttribute('aria-hidden', String(!enabled));
  feedButton.setAttribute('aria-pressed', String(enabled));
  feedButton.setAttribute('aria-label', enabled ? '結束餵食模式' : '進入餵食模式');
  feedButtonLabel.textContent = enabled ? '結束餵食' : '餵食';

  if (enabled) {
    stopGenshinOutsideMain();
    if (clickTimer) {
      window.clearTimeout(clickTimer);
      clickTimer = undefined;
      clickCount = 0;
    }
    walking = false;
    pet.classList.remove('walking');
    unlockGameSounds();
    startFeedingBehaviorLoop();
    syncRuntimeIsolation();
    return true;
  }

  stopFeedingBehaviorLoop();
  feedingActionTimers.forEach((timer) => window.clearTimeout(timer));
  feedingActionTimers.clear();
  const activePointerId = pendingFoodDrag?.pointerId ?? foodDragPointerId;
  if (activePointerId !== null && activePointerId !== undefined) releaseCapturedFoodPointer(activePointerId);
  removeActiveFood();
  pendingFoodDrag = null;
  feedingJumpActive = false;
  foodCollectedDuringJump = false;
  resetMoralSoundSequence(true);
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
  syncRuntimeIsolation();
  return true;
}

function setInteractionMode(enabled, options = {}) {
  if (enabled === isInteractionMode) return true;
  if (enabled && affectionRequired()) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('interaction')) return false;
  isInteractionMode = enabled;
  document.body.classList.toggle('interaction-mode', enabled);
  interactionPicker.inert = !enabled;
  interactionPicker.setAttribute('aria-hidden', String(!enabled));
  interactButton.setAttribute('aria-pressed', String(enabled));
  interactButton.setAttribute('aria-label', enabled ? '結束互動選單' : '與企鵝互動');
  interactButtonLabel.textContent = enabled ? '取消互動' : '互動';
  if (enabled) stopGenshinOutsideMain();
  syncRuntimeIsolation();
  return true;
}

function setRpsMode(enabled, options = {}) {
  if (enabled === isRpsMode) return true;
  if (enabled && affectionRequired(10)) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('rps')) return false;
  isRpsMode = enabled;
  document.body.classList.toggle('rps-mode', enabled);
  rpsPicker.inert = !enabled;
  rpsPicker.setAttribute('aria-hidden', String(!enabled));
  rpsResult.setAttribute('aria-hidden', String(!enabled));
  if (enabled) {
    stopGenshinOutsideMain();
    setInteractionMode(false);
    walking = false;
    pet.classList.remove('walking');
    petImage.src = normalPetImageSource;
    petImage.alt = '企鵝';
    rpsResult.textContent = '選一個出拳吧';
    unlockGameSounds();
  } else {
    rpsRoundId += 1;
    setRpsPlaybackLock(false);
    window.clearTimeout(rpsResultResetTimer);
    rpsResultResetTimer = undefined;
    petImage.src = normalPetImageSource;
    petImage.alt = '企鵝';
    rpsResult.textContent = '選一個出拳吧';
  }
  syncRuntimeIsolation();
  if (!enabled && !options.coordinated) focusRuntimeControl(interactButton);
  return true;
}

function setRpsPlaybackLock(locked) {
  if (isRpsResolving === locked) return;
  isRpsResolving = locked;
  document.body.classList.toggle('rps-resolving', locked);
  rpsChoiceButtons.forEach((button) => { button.disabled = locked; });
}

function waitForAnimation(element, animationName, timeoutMs = 1600) {
  return new Promise((resolve) => {
    let timer;
    const finish = (event) => {
      if (event && (event.target !== element || event.animationName !== animationName)) return;
      element.removeEventListener('animationend', finish);
      element.removeEventListener('animationcancel', finish);
      window.clearTimeout(timer);
      resolve();
    };
    element.addEventListener('animationend', finish);
    element.addEventListener('animationcancel', finish);
    timer = window.setTimeout(() => finish(), timeoutMs);
  });
}

function playSoundAndWait(sound, timeoutMs = 6000) {
  return new Promise((resolve) => {
    let completed = false;
    const timer = window.setTimeout(complete, timeoutMs);
    function complete() {
      if (completed) return;
      completed = true;
      window.clearTimeout(timer);
      resolve();
    }
    try {
      playSound(sound, complete);
    } catch (error) {
      console.warn('[audio] 猜拳音效播放失敗', error);
      complete();
    }
  });
}

async function playRpsRound(userHand) {
  if (!isRpsMode || isRpsResolving || isDead) return;
  const roundId = ++rpsRoundId;
  window.clearTimeout(rpsResultResetTimer);
  rpsResultResetTimer = undefined;
  const isDraw = Math.random() < .2;
  const shouldUserWin = !isDraw && (penguinWinStreak >= 3 || Math.floor(Math.random() * 10) % 2 === 0);
  const penguinHand = isDraw ? userHand : (shouldUserWin ? RPS_LOSING_HAND[userHand] : RPS_WINNING_HAND[userHand]);
  const resultText = isDraw ? '平手！' : (shouldUserWin ? '你贏了！' : '企鵝贏了！');

  setRpsPlaybackLock(true);
  let animationClass = '';
  try {
    pet.classList.remove('rps-user-win', 'rps-penguin-win');
    petImage.src = RPS_PENGUIN_IMAGES[penguinHand];
    petImage.alt = `企鵝出了${RPS_HAND_NAMES[penguinHand]}`;
    rpsResult.innerHTML = `你出${RPS_HAND_NAMES[userHand]}，企鵝出${RPS_HAND_NAMES[penguinHand]}。${shouldUserWin ? '<strong class="rps-user-result">你贏了！</strong>' : resultText}`;
    rpsResultResetTimer = window.setTimeout(() => {
      rpsResult.textContent = '選一個出拳吧';
      petImage.src = normalPetImageSource;
      petImage.alt = '企鵝';
      rpsResultResetTimer = undefined;
    }, 2000);
    void pet.offsetWidth;

    if (isDraw) {
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    } else {
      animationClass = shouldUserWin ? 'rps-user-win' : 'rps-penguin-win';
      const animationName = shouldUserWin ? 'rps-disappointed-shake' : 'rps-victory-shake';
      pet.classList.add(animationClass);
      await Promise.all([
        waitForAnimation(pet, animationName),
        playSoundAndWait(shouldUserWin ? screamSound : penguinWinSound),
      ]);
    }
    if (roundId !== rpsRoundId || !isRpsMode || isDead || runtimeSuspended) return;
    if (isDraw || shouldUserWin) penguinWinStreak = 0;
    else penguinWinStreak += 1;
    if (!isDraw) applyAffectionGain(shouldUserWin ? 1 : 3, 'rps');
  } catch (error) {
    console.warn('[rps] 無法完成猜拳回合', error);
  } finally {
    if (animationClass) pet.classList.remove(animationClass);
    if (roundId === rpsRoundId) setRpsPlaybackLock(false);
  }
}

function stopSingingWaveAnimation() {
  if (singingAnimationFrame !== undefined) {
    window.cancelAnimationFrame(singingAnimationFrame);
    singingAnimationFrame = undefined;
  }
  document.body.classList.remove('singing-song-playing');
  petImage.style.removeProperty('--singing-lift');
  petImage.style.removeProperty('--singing-tilt');
  petImage.style.removeProperty('--singing-scale');
}

function startSingingWaveAnimation(getCurrentTime) {
  stopSingingWaveAnimation();
  document.body.classList.add('singing-song-playing');
  const startLeft = pet.getBoundingClientRect().left;
  let previousLeft = startLeft;

  const animate = () => {
    if (!isSingingMode) {
      stopSingingWaveAnimation();
      return;
    }
    const currentTime = Math.max(0, getCurrentTime());
    const sampleIndex = Math.min(SINGING_WAVEFORM.length - 1, Math.floor(currentTime * SINGING_WAVEFORM_FPS));
    const energy = SINGING_WAVEFORM[sampleIndex] / 100;
    let beatPulse = 0;
    SINGING_BEATS.forEach(([beatTime, strength]) => {
      const elapsedSinceBeat = currentTime - beatTime;
      if (elapsedSinceBeat < 0 || elapsedSinceBeat > .18) return;
      beatPulse = Math.max(beatPulse, strength * (1 - elapsedSinceBeat / .18) ** 2);
    });

    const isKimiTail = activeSingingSound === kimiNoKamisamaSound && currentTime >= KIMI_SINGING_TAIL_START;
    if (isKimiTail) {
      const tailBeatElapsed = (currentTime - KIMI_SINGING_TAIL_START) % .46;
      if (tailBeatElapsed < .2) beatPulse = Math.max(beatPulse, .92 * (1 - tailBeatElapsed / .2) ** 2);
    }

    const choreography = activeSingingSound === kimiNoKamisamaSound ? KIMI_SINGING_CHOREOGRAPHY : SINGING_CHOREOGRAPHY;
    let choreographyOffset = choreography[choreography.length - 1][1];
    for (let index = 1; index < choreography.length; index += 1) {
      const [nextTime, nextOffset] = choreography[index];
      if (currentTime > nextTime) continue;
      const [previousTime, previousOffset] = choreography[index - 1];
      const progress = Math.max(0, Math.min(1, (currentTime - previousTime) / (nextTime - previousTime)));
      const easedProgress = .5 - Math.cos(progress * Math.PI) / 2;
      choreographyOffset = previousOffset + (nextOffset - previousOffset) * easedProgress;
      break;
    }

    const maxLeft = window.innerWidth - pet.offsetWidth;
    const nextLeft = Math.max(0, Math.min(maxLeft, startLeft + choreographyOffset * window.innerWidth / 100));
    if (Math.abs(nextLeft - previousLeft) > .08) pet.classList.toggle('facing-left', nextLeft < previousLeft);
    pet.style.left = `${nextLeft}px`;
    previousLeft = nextLeft;
    position = (nextLeft / window.innerWidth) * 100;

    const beatDirection = Math.sin(currentTime * Math.PI * (isKimiTail ? 6.5 : 5));
    const movementBoost = isKimiTail ? 1.55 : 1;
    petImage.style.setProperty('--singing-lift', `${(-energy * .35 - beatPulse * 9 * movementBoost).toFixed(2)}px`);
    petImage.style.setProperty('--singing-tilt', `${(beatDirection * (.12 + beatPulse * 2.8) * movementBoost).toFixed(2)}deg`);
    petImage.style.setProperty('--singing-scale', (1 + energy * .002 + beatPulse * .13 * movementBoost).toFixed(3));
    singingAnimationFrame = window.requestAnimationFrame(animate);
  };

  animate();
}

function setSingingMode(enabled, options = {}) {
  if (enabled === isSingingMode) return true;
  if (!enabled && isMandatoryFirstSong && !options.force) return false;
  if (enabled && affectionRequired(30)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('singing')) return false;
  isSingingMode = enabled;
  document.body.classList.toggle('singing-mode', enabled);
  singingPicker.inert = !enabled;
  singingPicker.setAttribute('aria-hidden', String(!enabled));
  petImage.src = enabled ? singingPetImageSource : normalPetImageSource;
  petImage.alt = enabled ? '唱歌中的企鵝' : '企鵝';
  if (enabled) stopGenshinOutsideMain();
  if (!enabled) {
    singingPlaybackId += 1;
    window.clearTimeout(singingCompletionTimer);
    singingCompletionTimer = undefined;
    stopSound(singingSound);
    stopSound(kimiNoKamisamaSound);
    activeSingingSound = null;
    stopSingingWaveAnimation();
    if (isMandatoryFirstSong) kimiNoKamisamaSongButton.disabled = false;
  }
  syncRuntimeIsolation();
  if (!enabled && !options.coordinated) focusRuntimeControl(interactButton);
  return true;
}

function playSingingSong(sound = singingSound) {
  if (!isSingingMode || isDead) return;
  unlockGameSounds();
  singingPlaybackId += 1;
  const playbackId = singingPlaybackId;
  stopSound(singingSound);
  stopSound(kimiNoKamisamaSound);
  activeSingingSound = sound;
  let completed = false;
  const complete = () => {
    if (completed) return;
    completed = true;
    window.clearTimeout(singingCompletionTimer);
    singingCompletionTimer = undefined;
    if (playbackId !== singingPlaybackId) return;
    if (sound === kimiNoKamisamaSound && isMandatoryFirstSong) setMandatoryFirstSong(false);
    if (isSingingMode && !isDead) applyAffectionGain(3, 'singing');
  };
  singingCompletionTimer = window.setTimeout(complete, sound === kimiNoKamisamaSound ? 65_000 : 45_000);
  try {
    playSound(sound, complete);
  } catch (error) {
    console.warn('[audio] 無法播放歌曲', error);
    complete();
  }
}

function playKimiNoKamisamaSong() {
  if (isMandatoryFirstSong) kimiNoKamisamaSongButton.disabled = true;
  if (songInvitationState === 'unlocked-new') {
    writeSongInvitationState('unlocked-seen');
    renderKimiNoKamisamaUnlock();
  }
  playSingingSong(kimiNoKamisamaSound);
}

// A compact canvas game keeps the court responsive without adding another character system.
const ballPlay = {
  width: 0, height: 0, playerX: .5, penguinX: .5, penguinY: .5,
  penguinTargetX: .5, penguinTargetY: .5, penguinSpeed: 4, nextTacticAt: 0,
  ballX: .5, ballY: .64, velocityX: .22, velocityY: -.42,
  pausedUntil: 0, swingUntil: 0, frame: undefined, lastTime: 0,
};

function resizeBallCourt() {
  const rect = ballCourt.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  ballCourt.width = Math.max(1, Math.round(rect.width * ratio));
  ballCourt.height = Math.max(1, Math.round(rect.height * ratio));
  ballPlay.width = rect.width;
  ballPlay.height = rect.height;
  ballCourt.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
}

function ballCourtEdge(y) {
  // Keep the same side margin from top to bottom: a rectangle, not perspective.
  return ballPlay.width * .04;
}

function resetBallServe(direction = Math.random() < .5 ? -1 : 1) {
  ballPlay.ballX = ballPlay.width * .5;
  ballPlay.ballY = ballPlay.height * .62;
  ballPlay.velocityX = direction * (.16 + Math.random() * .08);
  ballPlay.velocityY = -.43;
  ballGameStatus.textContent = '接住球！';
}

function choosePenguinTactic(now) {
  const { width: w, height: h } = ballPlay;
  const minX = ballCourtEdge(h * .18) + 18;
  const maxX = w - minX;
  const minY = h * .12;
  const maxY = h * .40;
  const isIncoming = ballPlay.velocityY < 0 && ballPlay.ballY < h * .5;
  const chasesBall = isIncoming && Math.random() < .76;
  const targetX = chasesBall ? ballPlay.ballX + (Math.random() - .5) * w * .09 : minX + Math.random() * (maxX - minX);
  const targetY = chasesBall ? ballPlay.ballY + (Math.random() - .5) * h * .08 : minY + Math.random() * (maxY - minY);
  ballPlay.penguinTargetX = Math.max(minX, Math.min(maxX, targetX));
  ballPlay.penguinTargetY = Math.max(minY, Math.min(maxY, targetY));
  ballPlay.penguinSpeed = 2.8 + Math.random() * 3.4;
  ballPlay.nextTacticAt = now + 260 + Math.random() * 540;
}

function drawBallCourt() {
  const ctx = ballCourt.getContext('2d');
  const { width: w, height: h } = ballPlay;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  const topEdge = ballCourtEdge(0), bottomEdge = ballCourtEdge(h);
  ctx.fillStyle = '#71c981';
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(topEdge, 0); ctx.lineTo(w - topEdge, 0); ctx.lineTo(w - bottomEdge, h); ctx.lineTo(bottomEdge, h); ctx.closePath();
  ctx.fillStyle = '#8ddd91'; ctx.fill();
  ctx.strokeStyle = '#f8fff3'; ctx.lineWidth = Math.max(2, w * .005); ctx.lineJoin = 'round'; ctx.stroke();
  const netY = h * .48;
  const netInset = ballCourtEdge(netY);
  ctx.strokeStyle = '#f5fff5'; ctx.lineWidth = Math.max(3, w * .007);
  ctx.beginPath(); ctx.moveTo(netInset, netY); ctx.lineTo(w - netInset, netY); ctx.stroke();
  ctx.strokeStyle = '#e0f1d9aa'; ctx.lineWidth = 1;
  for (let x = netInset; x < w - netInset; x += Math.max(12, w * .035)) { ctx.beginPath(); ctx.moveTo(x, netY); ctx.lineTo(x, netY + h * .07); ctx.stroke(); }
  for (let y = netY + h * .018; y < netY + h * .07; y += Math.max(8, h * .018)) { ctx.beginPath(); ctx.moveTo(netInset, y); ctx.lineTo(w - netInset, y); ctx.stroke(); }

  const penguinSize = Math.min(w, h) * .095;
  ctx.save(); ctx.translate(ballPlay.penguinX, ballPlay.penguinY);
  // Reuse the scene's real penguin artwork so the mini-game stays in the same style.
  const penguinArtSize = penguinSize * 2.25;
  ctx.drawImage(petImage, -penguinArtSize / 2, -penguinArtSize * .62, penguinArtSize, penguinArtSize);
  const swing = Math.max(0, Math.min(1, (ballPlay.swingUntil - performance.now()) / 180));
  ctx.rotate((1 - swing) * .38 - .1);
  ctx.strokeStyle = '#9c5c40'; ctx.lineWidth = Math.max(3, penguinSize * .12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(penguinSize * .43, penguinSize * .12); ctx.lineTo(penguinSize * .83, -penguinSize * .22); ctx.stroke();
  ctx.restore();

  const playerY = h * BALL_PLAYER_Y, paddleW = Math.min(w * .25, h * .34), paddleH = Math.max(10, h * .026);
  ctx.fillStyle = '#ec765f';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(ballPlay.playerX - paddleW / 2, playerY - paddleH / 2, paddleW, paddleH, paddleH);
  } else {
    ctx.rect(ballPlay.playerX - paddleW / 2, playerY - paddleH / 2, paddleW, paddleH);
  }
  ctx.fill();
  const ballRadius = Math.max(11, w * .022);
  ctx.fillStyle = '#fff3d9'; ctx.beginPath(); ctx.ellipse(ballPlay.ballX, ballPlay.ballY, ballRadius, ballRadius, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e5a84b'; ctx.lineWidth = 2; ctx.stroke();
}

function ballGameFrame(now) {
  if (!isBallMode) return;
  const dt = Math.min(.035, Math.max(0, (now - ballPlay.lastTime) / 1000 || 0));
  ballPlay.lastTime = now;
  const { width: w, height: h } = ballPlay;
  if (now >= ballPlay.pausedUntil) {
    const ballIsApproachingPenguin = ballPlay.velocityY < 0 && ballPlay.ballY < h * .43;
    if (ballIsApproachingPenguin) {
      const minX = ballCourtEdge(h * .18) + 18;
      const minY = h * .12;
      const maxY = h * .40;
      ballPlay.penguinTargetX = Math.max(minX, Math.min(w - minX, ballPlay.ballX));
      ballPlay.penguinTargetY = Math.max(minY, Math.min(maxY, ballPlay.ballY));
      ballPlay.penguinSpeed = 8.5;
    } else if (now >= ballPlay.nextTacticAt) choosePenguinTactic(now);
    const movement = Math.min(1, dt * ballPlay.penguinSpeed);
    ballPlay.penguinX += (ballPlay.penguinTargetX - ballPlay.penguinX) * movement;
    ballPlay.penguinY += (ballPlay.penguinTargetY - ballPlay.penguinY) * movement;
    ballPlay.ballX += ballPlay.velocityX * w * dt;
    ballPlay.ballY += ballPlay.velocityY * h * dt;
    const edge = ballCourtEdge(ballPlay.ballY), radius = Math.max(11, w * .022);
    if (ballPlay.ballX - radius < edge || ballPlay.ballX + radius > w - edge) {
      ballPlay.ballX = Math.max(edge + radius, Math.min(w - edge - radius, ballPlay.ballX));
      ballPlay.velocityX *= -1;
    }
    const playerY = h * BALL_PLAYER_Y, paddleW = Math.min(w * .25, h * .34), paddleH = Math.max(10, h * .026);
    if (ballPlay.velocityY > 0 && ballPlay.ballY + radius >= playerY - paddleH / 2 && ballPlay.ballY - radius <= playerY + paddleH / 2 && Math.abs(ballPlay.ballX - ballPlay.playerX) < paddleW / 2 + radius) {
      ballPlay.ballY = playerY - paddleH / 2 - radius;
      ballPlay.velocityY = -Math.abs(ballPlay.velocityY) * 1.035;
      ballPlay.velocityX += ((ballPlay.ballX - ballPlay.playerX) / (paddleW / 2)) * .18;
      ballPlay.velocityX = Math.max(-.45, Math.min(.45, ballPlay.velocityX));
      ballCombo += 1;
      ballComboValue.textContent = String(ballCombo);
    }
    const penguinReach = Math.min(w * .14, h * .18);
    const penguinDistance = Math.hypot(ballPlay.ballX - ballPlay.penguinX, ballPlay.ballY - ballPlay.penguinY);
    const guaranteedReturn = ballPlay.ballY <= h * .18;
    if (ballPlay.velocityY < 0 && (penguinDistance < penguinReach || guaranteedReturn)) {
      ballPlay.ballY = ballPlay.penguinY + penguinReach;
      ballPlay.velocityY = Math.abs(ballPlay.velocityY) * (.98 + Math.random() * .15);
      ballPlay.velocityX = Math.max(-.48, Math.min(.48, (Math.random() - .5) * .72 + ((ballPlay.ballX - ballPlay.penguinX) / penguinReach) * .16));
      ballPlay.swingUntil = now + 180;
      ballGameStatus.textContent = '企鵝擊球！';
      choosePenguinTactic(now);
    }
    if (ballPlay.ballY > h + radius * 2) {
      if (ballCombo > 0) applyAffectionGain(Math.min(ballCombo, 5), 'ball');
      if (!isBallMode || runtimeSuspended || songInvitation.open) {
        ballPlay.frame = undefined;
        return;
      }
      ballCombo = 0;
      ballComboValue.textContent = '0';
      ballGameStatus.textContent = '漏接了，再來一次！';
      ballPlay.pausedUntil = now + 850;
      window.clearTimeout(ballResetTimer);
      ballResetTimer = window.setTimeout(() => {
        ballResetTimer = undefined;
        if (isBallMode && !runtimeSuspended && !songInvitation.open) resetBallServe();
      }, 850);
    }
  }
  drawBallCourt();
  if (isBallMode && !runtimeSuspended && !songInvitation.open) {
    ballPlay.frame = window.requestAnimationFrame(ballGameFrame);
  } else ballPlay.frame = undefined;
}

function setBallMode(enabled, options = {}) {
  if (enabled === isBallMode) return true;
  if (enabled && affectionRequired(10)) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('ball')) return false;
  isBallMode = enabled;
  document.body.classList.toggle('ball-mode', enabled);
  if (enabled) ballGame.removeAttribute('inert');
  else ballGame.setAttribute('inert', '');
  ballGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) {
    window.cancelAnimationFrame(ballPlay.frame);
    window.clearTimeout(ballResetTimer);
    ballPlay.frame = undefined;
    ballResetTimer = undefined;
    syncRuntimeIsolation();
    if (!options.coordinated) focusRuntimeControl(interactButton);
    return true;
  }
  window.cancelAnimationFrame(ballPlay.frame);
  window.clearTimeout(ballResetTimer);
  ballPlay.frame = undefined;
  ballResetTimer = undefined;
  walking = false; pet.classList.remove('walking');
  resizeBallCourt();
  ballPlay.playerX = ballPlay.width * .5; ballPlay.penguinX = ballPlay.width * .5; ballPlay.penguinY = ballPlay.height * .24; ballPlay.penguinTargetX = ballPlay.penguinX; ballPlay.penguinTargetY = ballPlay.penguinY; ballPlay.nextTacticAt = 0; ballPlay.pausedUntil = 0;
  stopGenshinOutsideMain();
  ballCombo = 0;
  ballComboValue.textContent = '0';
  resetBallServe(); ballPlay.lastTime = performance.now(); ballPlay.frame = window.requestAnimationFrame(ballGameFrame);
  syncRuntimeIsolation();
  focusRuntimeControl(closeBallGameButton);
  return true;
}

function moveBallPaddle(clientX) {
  const rect = ballCourt.getBoundingClientRect();
  ballPlay.playerX = Math.max(ballCourtEdge(ballPlay.height) + 12, Math.min(ballPlay.width - ballCourtEdge(ballPlay.height) - 12, clientX - rect.left));
}

ballCourt.addEventListener('pointerdown', (event) => { event.preventDefault(); moveBallPaddle(event.clientX); ballCourt.setPointerCapture?.(event.pointerId); });
ballCourt.addEventListener('pointermove', (event) => { if (isBallMode) { event.preventDefault(); moveBallPaddle(event.clientX); } });
window.addEventListener('resize', () => {
  if (isBallMode) { resizeBallCourt(); resetBallServe(); }
  if (isCatchMode) {
    const fieldRect = catchField.getBoundingClientRect();
    moveCatchPenguin(fieldRect.left + fieldRect.width * catchGameState.penguinX);
  }
});

function renderCatchScore() {
  catchApples.textContent = String(catchApplesCount);
  catchStones.textContent = String(catchStonesCount);
}

function moveCatchPenguin(clientX) {
  const fieldRect = catchField.getBoundingClientRect();
  const penguinWidth = catchPenguin.offsetWidth;
  const minCenter = penguinWidth / 2;
  const maxCenter = fieldRect.width - penguinWidth / 2;
  const centerX = Math.max(minCenter, Math.min(maxCenter, clientX - fieldRect.left));
  // The CSS translate keeps this value at the visual center of the penguin image.
  catchPenguin.style.left = `${centerX}px`;
  catchGameState.penguinX = centerX / fieldRect.width;
}

function spawnCatchItem() {
  if (!isCatchMode) return;
  const roll = Math.random();
  const type = roll < .7 ? 'apple' : (roll < .9 ? 'bomb' : 'stone');
  const item = document.createElement('div');
  item.className = `catch-item catch-item-${type}`;
  item.setAttribute('aria-hidden', 'true');
  if (type === 'bomb') {
    const bomb = document.createElement('span');
    bomb.className = 'bomb-art';
    bomb.setAttribute('aria-hidden', 'true');
    item.append(bomb);
  }
  else {
    const art = document.createElement('span');
    art.className = `food-art food-art-${type}`;
    item.append(art);
  }
  const size = 54;
  const state = { type, size, x: Math.random() * Math.max(1, catchField.clientWidth - size), y: -size, speed: 180 + Math.random() * 130, element: item };
  item.style.left = `${state.x}px`;
  item.style.top = `${state.y}px`;
  item.style.animation = 'none';
  catchField.append(item);
  catchItems.add(state);
}

function catchItemLanded(item, fieldRect, penguinRect) {
  const itemLeft = fieldRect.left + item.x;
  const itemTop = fieldRect.top + item.y;
  const overlaps = itemLeft + item.size > penguinRect.left + 12
    && itemLeft < penguinRect.right - 12
    && itemTop + item.size > penguinRect.top + 18
    && itemTop < penguinRect.bottom;
  if (!overlaps) return false;
  if (item.type === 'apple') catchApplesCount += 1;
  else if (item.type === 'stone') catchStonesCount += 1;
  else {
    showCatchExplosion(item);
    catchApplesCount = 0;
    catchStonesCount = 0;
    showHurtEffect(CATCH_BOMB_DAMAGE, '你的企鵝炸了', catchPenguin);
  }
  renderCatchScore();
  return true;
}

function showCatchExplosion(item) {
  const explosion = document.createElement('span');
  explosion.className = 'catch-explosion';
  explosion.setAttribute('aria-hidden', 'true');
  explosion.style.left = `${item.x + 27}px`;
  explosion.style.top = `${item.y + 27}px`;
  catchField.append(explosion);
  explosion.addEventListener('animationend', () => explosion.remove(), { once: true });
}

function settleCatchRewards() {
  if (catchApplesCount === 0 && catchStonesCount === 0) return;
  foodInventory.apple = Math.min(FOOD_MAX_QUANTITY, foodInventory.apple + catchApplesCount);
  foodInventory.stone = Math.min(FOOD_MAX_QUANTITY, foodInventory.stone + catchStonesCount);
  saveFoodInventory();
  updateFoodPicker();
}

function catchGameFrame(timestamp) {
  if (!isCatchMode || runtimeSuspended || songInvitation.open) {
    catchAnimationFrame = undefined;
    return;
  }
  const delta = Math.min(.04, Math.max(0, (timestamp - catchGameState.lastTime) / 1000 || 0));
  catchGameState.lastTime = timestamp;
  const groundTop = catchField.clientHeight * .8;
  const fieldRect = catchField.getBoundingClientRect();
  const penguinRect = catchPenguin.getBoundingClientRect();
  catchItems.forEach((item) => {
    item.y += item.speed * delta;
    item.element.style.top = `${item.y}px`;
    if (catchItemLanded(item, fieldRect, penguinRect) || item.y > groundTop) {
      item.element.remove();
      catchItems.delete(item);
    }
  });
  catchAnimationFrame = window.requestAnimationFrame(catchGameFrame);
}

function clearCatchItems() {
  catchItems.forEach((item) => item.element.remove());
  catchItems.clear();
}

function setCatchMode(enabled, options = {}) {
  if (enabled === isCatchMode) return true;
  if (enabled && affectionRequired()) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('catch')) return false;
  isCatchMode = enabled;
  document.body.classList.toggle('catch-mode', enabled);
  catchGame.inert = !enabled;
  catchGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) {
    window.cancelAnimationFrame(catchAnimationFrame);
    window.clearInterval(catchSpawnTimer);
    catchAnimationFrame = undefined;
    catchSpawnTimer = undefined;
    try {
      if (catchControlPointerId !== null && catchGame.hasPointerCapture?.(catchControlPointerId)) {
        catchGame.releasePointerCapture(catchControlPointerId);
      }
    } catch {}
    catchControlPointerId = null;
    clearCatchItems();
    syncRuntimeIsolation();
    return true;
  }
  stopGenshinOutsideMain();
  walking = false;
  pet.classList.remove('walking');
  catchApplesCount = 0; catchStonesCount = 0; renderCatchScore();
  catchPenguin.style.left = '50%';
  catchGameState.penguinX = .5;
  catchGameState.lastTime = performance.now();
  window.clearInterval(catchSpawnTimer);
  catchSpawnTimer = window.setInterval(spawnCatchItem, 650);
  spawnCatchItem();
  catchAnimationFrame = window.requestAnimationFrame(catchGameFrame);
  syncRuntimeIsolation();
  focusRuntimeControl(closeCatchGameButton);
  return true;
}

function setAdventureMenu(enabled, options = {}) {
  if (enabled === isAdventureMenuOpen) return true;
  if (enabled && affectionRequired()) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('adventure')) return false;
  isAdventureMenuOpen = enabled;
  document.body.classList.toggle('adventure-menu-open', enabled);
  adventureMenu.inert = !enabled;
  adventureMenu.setAttribute('aria-hidden', String(!enabled));
  if (enabled) {
    stopGenshinOutsideMain();
    walking = false;
    pet.classList.remove('walking');
  }
  syncRuntimeIsolation();
  if (enabled) focusRuntimeControl(closeAdventureMenuButton);
  else if (!options.coordinated) focusRuntimeControl(adventureButton);
  return true;
}

function clearMiningTimers() {
  window.clearTimeout(miningPickTimer); window.clearTimeout(miningResultTimer); window.clearTimeout(miningHoldTimer); window.clearTimeout(miningExitTimer); window.clearInterval(miningRollInterval);
  miningActionTimers.forEach((timer) => window.clearTimeout(timer));
  miningActionTimers.clear();
  miningPickTimer = miningResultTimer = miningHoldTimer = miningExitTimer = miningRollInterval = undefined;
  try {
    if (miningPointerId !== null && miningField.hasPointerCapture?.(miningPointerId)) {
      miningField.releasePointerCapture(miningPointerId);
    }
  } catch {}
  miningPointerId = null;
  miningTargetRock = null;
  miningPickRoll.classList.remove('is-visible', 'is-finished');
}

function miningIsTired() { return hunger < MINING_MIN_HUNGER; }

function showMiningResult(message, type = '') {
  window.clearTimeout(miningResultTimer);
  miningResult.replaceChildren(...message.split('\n').map((line) => {
    const resultLine = document.createElement('span');
    resultLine.className = 'mining-result-line';
    resultLine.textContent = line;
    return resultLine;
  }));
  miningResult.className = `mining-result is-visible ${type}`;
  miningResultTimer = window.setTimeout(() => { miningResult.className = 'mining-result'; }, 1800);
}

function showMiningTiredAndExit(delay = 0) {
  window.clearTimeout(miningExitTimer);
  miningExitTimer = window.setTimeout(() => {
    showMiningResult('你的企鵝累了，回去休息吧', 'is-tired');
    miningExitTimer = window.setTimeout(() => {
      miningExitTimer = undefined;
      setMiningMode(false);
    }, 1500);
  }, delay);
}

function renderMiningRocks() {
  const spots = [[19, 71, 74], [38, 47, 88], [61, 68, 76], [79, 40, 92], [88, 76, 67]];
  miningRocks.replaceChildren(...spots.map(([x, y, size], index) => {
    const rock = document.createElement('button');
    rock.type = 'button'; rock.className = 'mining-rock'; rock.dataset.rock = String(index);
    rock.style.setProperty('--rock-x', `${x}%`); rock.style.setProperty('--rock-y', `${y}%`); rock.style.setProperty('--rock-size', `${size}px`);
    rock.setAttribute('aria-label', '長按石頭挖掘');
    const stone = document.createElement('span'); stone.className = 'food-art food-art-stone'; stone.setAttribute('aria-hidden', 'true'); rock.append(stone);
    return rock;
  }));
}

function chooseMiningPick() {
  miningPick = null;
  miningPickStatus.textContent = '正在抽選鎬子…';
  miningPickRoll.classList.remove('is-finished');
  miningPickRoll.classList.add('is-visible');
  let tick = 0;
  miningRollInterval = window.setInterval(() => {
    const preview = MINING_PICKS[tick++ % MINING_PICKS.length];
    miningPickRollImage.src = preview.pickImage;
    miningPickRollImage.alt = preview.name;
    miningPickRollName.textContent = preview.name;
    miningPenguinImage.src = preview.image;
    miningPickStatus.textContent = `正在抽選：${preview.name}`;
  }, 135);
  miningPickTimer = window.setTimeout(() => {
    window.clearInterval(miningRollInterval);
    miningRollInterval = undefined;
    miningPick = MINING_PICKS[Math.floor(Math.random() * MINING_PICKS.length)];
    miningPenguinImage.src = miningPick.image;
    miningPickRollImage.src = miningPick.pickImage;
    miningPickRollImage.alt = miningPick.name;
    miningPickRollName.textContent = miningPick.name;
    miningPickStatus.textContent = `本次鎬子：${miningPick.name}（掉落率 ${miningPick.chance * 100}%）`;
    miningPickRoll.classList.add('is-finished');
    miningPickTimer = window.setTimeout(() => {
      miningPickTimer = undefined;
      miningPickRoll.classList.remove('is-visible', 'is-finished');
    }, 850);
  }, 1600);
}

function setMiningMode(enabled, options = {}) {
  if (enabled === isMiningMode) return true;
  if (enabled && affectionRequired()) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('mining')) return false;
  isMiningMode = enabled;
  document.body.classList.toggle('mining-mode', enabled);
  miningGame.inert = !enabled;
  miningGame.setAttribute('aria-hidden', String(!enabled));
  clearMiningTimers();
  if (!enabled) {
    if (miningRunHadAttempt && options.awardRun !== false) applyAffectionGain(miningRunFoundStone ? 3 : 1, 'mining');
    miningRunHadAttempt = false;
    miningRunFoundStone = false;
    syncRuntimeIsolation();
    return true;
  }
  stopGenshinOutsideMain();
  walking = false; pet.classList.remove('walking');
  miningPenguin.style.left = '13%'; miningPenguin.style.top = '72%';
  miningRunHadAttempt = false;
  miningRunFoundStone = false;
  miningResult.className = 'mining-result'; renderMiningRocks();
  if (miningIsTired()) {
    miningPickStatus.textContent = '飽食度不足';
    showMiningTiredAndExit();
    syncRuntimeIsolation();
    focusRuntimeControl(closeMiningGameButton);
    return true;
  }
  chooseMiningPick();
  syncRuntimeIsolation();
  focusRuntimeControl(closeMiningGameButton);
  return true;
}

function moveMiningPenguin(clientX, clientY) {
  const rect = miningField.getBoundingClientRect();
  const x = Math.max(6, Math.min(94, ((clientX - rect.left) / rect.width) * 100));
  const y = Math.max(12, Math.min(90, ((clientY - rect.top) / rect.height) * 100));
  const legal = [...miningRocks.children].every((rock) => {
    const rockRect = rock.getBoundingClientRect(); const dx = clientX - (rockRect.left + rockRect.width / 2); const dy = clientY - (rockRect.top + rockRect.height / 2);
    return Math.hypot(dx, dy) > Math.max(rockRect.width, 72) * .72;
  });
  if (!legal) return;
  miningPenguin.style.left = `${x}%`; miningPenguin.style.top = `${y}%`;
}

function mineRock(rock) {
  if (!isMiningMode || !miningPick || rock.classList.contains('is-breaking')) return;
  if (miningIsTired()) { showMiningTiredAndExit(); return; }
  rock.classList.add('is-breaking');
  miningRunHadAttempt = true;
  const gotStone = Math.random() < miningPick.chance;
  const actionTimer = window.setTimeout(() => {
    miningActionTimers.delete(actionTimer);
    if (!isMiningMode) return;
    rock.classList.remove('is-breaking');
    if (gotStone) {
      miningRunFoundStone = true;
      foodInventory.stone = Math.min(FOOD_MAX_QUANTITY, foodInventory.stone + 1); saveFoodInventory(); updateFoodPicker();
      hunger = Math.max(0, hunger - MINING_HUNGER_COST); renderHunger(); saveGameState();
      showMiningResult('挖到石頭了！', 'is-success');
      if (miningIsTired()) showMiningTiredAndExit(950);
    } else showMiningResult('鎬子太爛\n挖到滾木了', 'is-fail');
  }, 430);
  miningActionTimers.add(actionTimer);
}

catchGame.addEventListener('pointerdown', (event) => {
  if (!isCatchMode || event.target.closest('.catch-close')) return;
  event.preventDefault();
  catchControlPointerId = event.pointerId;
  catchGame.setPointerCapture?.(event.pointerId);
  moveCatchPenguin(event.clientX);
});
catchGame.addEventListener('pointermove', (event) => {
  if (!isCatchMode) return;
  const isMouseHover = event.pointerType === 'mouse' && event.buttons === 0;
  if (!isMouseHover && event.pointerId !== catchControlPointerId) return;
  event.preventDefault();
  moveCatchPenguin(event.clientX);
});
function endCatchControl(event) {
  if (event.pointerId !== catchControlPointerId) return;
  catchControlPointerId = null;
  if (catchGame.hasPointerCapture?.(event.pointerId)) catchGame.releasePointerCapture(event.pointerId);
}
catchGame.addEventListener('pointerup', endCatchControl);
catchGame.addEventListener('pointercancel', endCatchControl);
document.addEventListener('keydown', (event) => {
  if (!isCatchMode || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const current = catchPenguin.getBoundingClientRect().left + catchPenguin.offsetWidth / 2;
  moveCatchPenguin(current + (event.key === 'ArrowLeft' ? -48 : 48));
});

const HIDE_GAME_SPOTS = [
  [15, 28, 82, 'boulder'], [37, 21, 94, 'bush'], [65, 28, 90, 'boulder'],
  [84, 20, 80, 'boulder'], [23, 58, 94, 'bush'], [49, 53, 108, 'hut'],
  [77, 58, 92, 'boulder'], [12, 82, 84, 'boulder'], [63, 81, 96, 'bush'], [89, 79, 78, 'boulder'],
];
const HIDE_GAME_DURATION = 10_000;

function renderHideGameSpots() {
  hideGameSpots.replaceChildren(...HIDE_GAME_SPOTS.map(([x, y, size, type]) => {
    const spot = document.createElement('div');
    spot.className = `hide-spot ${type}`;
    spot.style.setProperty('--spot-x', `${x}%`);
    spot.style.setProperty('--spot-y', `${y}%`);
    spot.style.setProperty('--spot-size', `${size}px`);
    return spot;
  }));
}

function clearHideGameTimers() {
  window.clearTimeout(hideGameRevealTimer);
  window.clearTimeout(hideGameTimeout);
  window.clearTimeout(hideGameNextRoundTimer);
  window.clearInterval(hideGameCountdownTimer);
  hideGameRevealTimer = undefined;
  hideGameTimeout = undefined;
  hideGameNextRoundTimer = undefined;
  hideGameCountdownTimer = undefined;
}

function resetHideGameBoard() {
  clearHideGameTimers();
  isHideAndSeekRunning = false;
  hideGameIntro.hidden = false;
  startHideGameButton.textContent = '開始遊戲';
  hideGameTimer.textContent = '找到企鵝！';
  hideGameTimer.hidden = true;
  hideGameBlackout.setAttribute('aria-hidden', 'true');
  hideGameBlackout.classList.remove('is-covering');
  hidePenguin.disabled = true;
  hidePenguinHit.disabled = true;
  hidePenguinHit.classList.remove('is-visible');
  hidePenguin.classList.remove('is-visible', 'hide-penguin-victory', 'hide-penguin-shocked');
  hideGameResult.textContent = '';
  hideGameResult.classList.remove('is-visible', 'is-lost');
}

function setHideAndSeekMode(enabled, options = {}) {
  if (enabled === isHideAndSeekMode) return true;
  if (enabled && affectionRequired(30)) return;
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  if (enabled && !options.coordinated && !closeCompetingModes('hide')) return false;
  isHideAndSeekMode = enabled;
  document.body.classList.toggle('hide-and-seek-mode', enabled);
  if (enabled) hideAndSeekGame.removeAttribute('inert');
  else hideAndSeekGame.setAttribute('inert', '');
  hideAndSeekGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) {
    resetHideGameBoard();
    syncRuntimeIsolation();
    if (!options.coordinated) focusRuntimeControl(interactButton);
    return true;
  }
  stopGenshinOutsideMain();
  walking = false;
  pet.classList.remove('walking');
  unlockGameSounds();
  resetHideGameBoard();
  syncRuntimeIsolation();
  focusRuntimeControl(startHideGameButton);
  return true;
}

function beginHideAndSeekRound() {
  if (!isHideAndSeekMode || isHideAndSeekRunning || isDead) return;
  clearHideGameTimers();
  const [x, y, size] = HIDE_GAME_SPOTS[Math.floor(Math.random() * HIDE_GAME_SPOTS.length)];
  const hideDepth = .18 + Math.random() * .24;
  const sideOffset = (Math.random() - .5) * size * .24;
  hideGameBlackout.classList.add('is-covering');
  hideGameBlackout.setAttribute('aria-hidden', 'false');
  hideGameIntro.hidden = true;
  hideGameResult.textContent = '';
  hideGameResult.classList.remove('is-visible', 'is-lost');
  hidePenguin.style.left = `calc(${x}% + ${Math.round(sideOffset)}px)`;
  hidePenguin.style.top = `calc(${y}% - ${Math.round(size * hideDepth)}px)`;
  hidePenguinHit.style.left = hidePenguin.style.left;
  hidePenguinHit.style.top = hidePenguin.style.top;
  hidePenguin.disabled = true;
  hidePenguinHit.disabled = true;
  hidePenguinHit.classList.remove('is-visible');
  hidePenguin.classList.remove('is-visible', 'hide-penguin-victory', 'hide-penguin-shocked');
  hideGameTimer.textContent = '企鵝正在躲起來…';
  hideGameTimer.hidden = true;
  hideGameRevealTimer = window.setTimeout(() => {
    if (!isHideAndSeekMode || isDead) return;
    isHideAndSeekRunning = true;
    const deadline = Date.now() + HIDE_GAME_DURATION;
    hideGameBlackout.classList.remove('is-covering');
    hideGameBlackout.setAttribute('aria-hidden', 'true');
    hideGameTimer.hidden = false;
    hidePenguin.disabled = false;
    hidePenguin.classList.add('is-visible');
    hidePenguinHit.disabled = false;
    hidePenguinHit.classList.add('is-visible');
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      hideGameTimer.textContent = `剩下 ${remaining} 秒`;
    };
    updateTimer();
    hideGameCountdownTimer = window.setInterval(updateTimer, 250);
    hideGameTimeout = window.setTimeout(() => finishHideAndSeekRound(false), HIDE_GAME_DURATION);
  }, 3000);
}

function finishHideAndSeekRound(userWon) {
  if (!isHideAndSeekMode || !isHideAndSeekRunning) return;
  isHideAndSeekRunning = false;
  clearHideGameTimers();
  hidePenguin.disabled = true;
  hidePenguinHit.disabled = true;
  hidePenguinHit.classList.remove('is-visible');
  hidePenguin.classList.add('is-visible');
  hidePenguin.classList.remove('hide-penguin-victory', 'hide-penguin-shocked');
  void hidePenguin.offsetWidth;
  hidePenguin.classList.add(userWon ? 'hide-penguin-shocked' : 'hide-penguin-victory');
  hideGameTimer.textContent = userWon ? '你找到企鵝了！' : '時間到！';
  hideGameTimer.hidden = true;
  hideGameResult.textContent = userWon ? 'YOU WIN' : 'YOU LOST';
  hideGameResult.classList.toggle('is-lost', !userWon);
  hideGameResult.classList.add('is-visible');
  if (userWon) playSound(screamSound);
  else playSound(penguinWinSound);
  applyAffectionGain(userWon ? 3 : 1, 'hide-and-seek');
  if (!isHideAndSeekMode || songInvitation.open || runtimeSuspended) return;
  hideGameIntro.hidden = true;
  hideGameNextRoundTimer = window.setTimeout(() => {
    if (isHideAndSeekMode && !isDead) beginHideAndSeekRound();
  }, 2500);
}

renderHideGameSpots();

function moveFoodWithPointer(event) {
  if (pendingFoodDrag?.pointerId === event.pointerId) {
    const distance = Math.hypot(event.clientX - pendingFoodDrag.startX, event.clientY - pendingFoodDrag.startY);
    if (distance < FOOD_DRAG_START_DISTANCE) return;
    const drag = pendingFoodDrag;
    pendingFoodDrag = null;
    createDraggedFood(drag, event);
  }
  if (!activeFood || foodDragPointerId !== event.pointerId) return;
  const maxLeft = window.innerWidth - activeFood.offsetWidth;
  const maxTop = window.innerHeight - activeFood.offsetHeight;
  activeFood.style.left = `${Math.max(0, Math.min(maxLeft, event.clientX - foodDragOffsetX))}px`;
  activeFood.style.top = `${Math.max(0, Math.min(maxTop, event.clientY - foodDragOffsetY))}px`;
  syncStoneGreeting(activeFood);
}

function releaseFoodPointer(event) {
  if (pendingFoodDrag?.pointerId === event.pointerId) {
    pendingFoodDrag = null;
    releaseCapturedFoodPointer(event.pointerId);
    return;
  }
  if (foodDragPointerId !== event.pointerId) return;
  if (activeFood) activeFood.classList.remove('dragging');
  foodDragPointerId = null;
  releaseCapturedFoodPointer(event.pointerId);
  startFoodFall();
}

function beginExistingFoodDrag(item, pointerId, clientX, clientY, captureTarget = null) {
  if (!isFeedingMode || isSettingsOpen()) return;
  cancelFoodFall();
  unlockGameSounds();
  const rect = item.getBoundingClientRect();
  foodDragOffsetX = clientX - rect.left;
  foodDragOffsetY = clientY - rect.top;
  foodDragPointerId = pointerId;
  item.classList.add('dragging');
  if (captureTarget) captureFoodPointer(captureTarget, pointerId);
}

function createDraggedFood(drag, event) {
  if ((foodInventory[drag.type] ?? 0) <= 0) return;
  removeActiveFood();
  resetMoralSoundSequence(true);
  const item = document.createElement('button');
  item.type = 'button';
  item.className = `feeding-item feeding-item-${drag.type}`;
  item.dataset.foodType = drag.type;
  item.setAttribute('aria-label', drag.type === 'apple' ? '可拖曳的蘋果' : '可拖曳的石頭');
  const art = document.createElement('span');
  art.className = `food-art food-art-${drag.type}`;
  art.setAttribute('aria-hidden', 'true');
  item.append(art);
  world.append(item);
  activeFood = item;
  activeFoodEdibleAt = Date.now() + FOOD_EAT_DELAY_MS;
  foodDragPointerId = drag.pointerId;
  foodDragOffsetX = item.offsetWidth / 2;
  foodDragOffsetY = item.offsetHeight / 2;
  item.style.left = `${drag.sourceX - foodDragOffsetX}px`;
  item.style.top = `${drag.sourceY - foodDragOffsetY}px`;
  item.classList.add('dragging');
  moveFoodWithPointer(event);
  item.addEventListener('pointerdown', (event) => {
    if (USE_IOS_TOUCH_DRAG && event.pointerType === 'touch') return;
    event.preventDefault();
    beginExistingFoodDrag(item, event.pointerId, event.clientX, event.clientY, item);
  });
  item.addEventListener('touchstart', (event) => {
    if (!USE_IOS_TOUCH_DRAG) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    event.preventDefault();
    beginExistingFoodDrag(item, `touch-${touch.identifier}`, touch.clientX, touch.clientY);
  }, { passive: false });
}

function beginFoodDrag(type, source, pointerId, clientX, clientY) {
  if (!isFeedingMode || isSettingsOpen() || isDead || (foodInventory[type] ?? 0) <= 0) return;
  unlockGameSounds();
  const artRect = source.querySelector('.food-art').getBoundingClientRect();
  pendingFoodDrag = {
    type,
    pointerId,
    startX: clientX,
    startY: clientY,
    sourceX: artRect.left + artRect.width / 2,
    sourceY: artRect.top + artRect.height / 2
  };
}

function prepareFoodPointerDrag(type, event) {
  if (USE_IOS_TOUCH_DRAG && event.pointerType === 'touch') return;
  if (!isFeedingMode || isSettingsOpen() || isDead) return;
  event.preventDefault();
  captureFoodPointer(event.currentTarget, event.pointerId);
  beginFoodDrag(type, event.currentTarget, event.pointerId, event.clientX, event.clientY);
}

function prepareFoodTouchDrag(type, event) {
  if (!USE_IOS_TOUCH_DRAG || !isFeedingMode || isSettingsOpen() || isDead) return;
  const touch = event.changedTouches[0];
  if (!touch) return;
  event.preventDefault();
  beginFoodDrag(type, event.currentTarget, `touch-${touch.identifier}`, touch.clientX, touch.clientY);
}

function findTrackedTouch(event) {
  const pointerId = pendingFoodDrag?.pointerId ?? foodDragPointerId;
  if (typeof pointerId !== 'string' || !pointerId.startsWith('touch-')) return null;
  const identifier = Number(pointerId.slice(6));
  return Array.from(event.changedTouches).find((touch) => touch.identifier === identifier)
    ?? Array.from(event.touches).find((touch) => touch.identifier === identifier)
    ?? null;
}

function moveFoodWithTouch(event) {
  if (!USE_IOS_TOUCH_DRAG) return;
  const touch = findTrackedTouch(event);
  if (!touch) return;
  event.preventDefault();
  moveFoodWithPointer({
    pointerId: `touch-${touch.identifier}`,
    clientX: touch.clientX,
    clientY: touch.clientY
  });
}

function releaseFoodTouch(event) {
  if (!USE_IOS_TOUCH_DRAG) return;
  const touch = findTrackedTouch(event);
  if (!touch) return;
  event.preventDefault();
  releaseFoodPointer({ pointerId: `touch-${touch.identifier}` });
}

document.addEventListener('pointermove', moveFoodWithPointer);
document.addEventListener('pointerup', releaseFoodPointer);
document.addEventListener('pointercancel', releaseFoodPointer);
document.addEventListener('touchmove', moveFoodWithTouch, { passive: false });
document.addEventListener('touchend', releaseFoodTouch, { passive: false });
document.addEventListener('touchcancel', releaseFoodTouch, { passive: false });

function collectFood() {
  if (!activeFood) return false;
  const isStone = activeFood.dataset.foodType === 'stone';
  const foodType = activeFood.dataset.foodType;
  if ((foodInventory[foodType] ?? 0) <= 0) return false;
  foodInventory[foodType] -= 1;
  updateFoodPicker();
  foodCollectedDuringJump = feedingJumpActive;
  hunger = Math.min(MAX_HUNGER, hunger + (isStone ? STONE_HUNGER_GAIN : FEED_HUNGER_GAIN));
  applyAffectionGain(isStone ? STONE_AFFECTION_GAIN : FEED_AFFECTION_GAIN, 'feeding');
  renderHunger();
  removeActiveFood();
  resetMoralSoundSequence(true);
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
  saveFoodInventory();
  return true;
}

function tryCollectFood() {
  if (!activeFood || Date.now() < activeFoodEdibleAt || hunger >= MAX_HUNGER) return false;
  const foodRect = activeFood.getBoundingClientRect();
  const petRect = pet.getBoundingClientRect();
  const foodX = foodRect.left + foodRect.width / 2;
  const foodY = foodRect.top + foodRect.height / 2;
  const withinHorizontalReach = foodX >= petRect.left - FEEDING_REACH_PADDING && foodX <= petRect.right + FEEDING_REACH_PADDING;
  const withinVerticalReach = foodY >= petRect.top - FEEDING_REACH_PADDING && foodY <= petRect.bottom - 12;
  return withinHorizontalReach && withinVerticalReach ? collectFood() : false;
}

function isFoodAboveGrass(food = activeFood) {
  if (!food) return false;
  return food.getBoundingClientRect().bottom <= grass.getBoundingClientRect().top;
}

function cancelStoneGreeting() {
  if (stoneGreetingTimer !== undefined) {
    window.clearTimeout(stoneGreetingTimer);
    stoneGreetingTimer = undefined;
  }
  stoneGreetingFood = null;
  pet.classList.remove('stone-greeting');
}

function finishStoneGreeting(food) {
  if (stoneGreetingFood !== food) return;
  stoneGreetingFood = null;
  stoneGreetingCompletedFood = food;
  pet.classList.remove('stone-greeting');
}

function startStoneGreeting(food) {
  cancelStoneGreeting();
  if (activeFood !== food || !isFeedingMode || !isFoodAboveGrass(food)) return;
  const foodRect = food.getBoundingClientRect();
  const petRect = pet.getBoundingClientRect();
  const foodIsLeft = foodRect.left + foodRect.width / 2 < petRect.left + petRect.width / 2;
  stoneGreetingFood = food;
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
  pet.classList.toggle('facing-left', foodIsLeft);
  pet.classList.add('stone-greeting');
  stoneGreetingTimer = window.setTimeout(() => {
    stoneGreetingTimer = undefined;
    if (stoneGreetingFood !== food || activeFood !== food || !isFeedingMode) return;
    playScreamSound(() => finishStoneGreeting(food));
  }, STONE_GREETING_LOOK_MS);
}

function syncStoneGreeting(food) {
  if (food.dataset.foodType !== 'stone') return;
  if (!isFoodAboveGrass(food)) {
    if (stoneGreetingFood === food) cancelStoneGreeting();
    return;
  }
  if (stoneGreetingFood === food || stoneGreetingCompletedFood === food) return;
  startStoneGreeting(food);
}

function startFeedingJump() {
  const now = Date.now();
  if (feedingJumpActive || now - lastFeedingJumpAt < FEEDING_JUMP_COOLDOWN_MS) return;
  lastFeedingJumpAt = now;
  feedingJumpActive = true;
  foodCollectedDuringJump = false;
  jump();
  scheduleFeedingAction(tryCollectFood, 300);
  scheduleFeedingAction(() => {
    feedingJumpActive = false;
    if (!isFeedingMode || !activeFood || foodCollectedDuringJump || Date.now() < activeFoodEdibleAt) return;
    if (moralSoundPlaying) return;
    missedFeedingJumps += 1;
    const jumpsRequired = moralSoundHasPlayed ? MORAL_SOUND_REPEAT_JUMPS : MORAL_SOUND_INITIAL_JUMPS;
    if (missedFeedingJumps < jumpsRequired) return;
    missedFeedingJumps = 0;
    moralSoundHasPlayed = true;
    moralSoundPlaying = true;
    const playbackId = ++moralSoundPlaybackId;
    playSound(moralSound, () => {
      if (playbackId !== moralSoundPlaybackId) return;
      moralSoundPlaying = false;
      missedFeedingJumps = 0;
    });
  }, 640);
}

function scheduleFeedingAction(callback, delay) {
  const timer = window.setTimeout(() => {
    feedingActionTimers.delete(timer);
    callback();
  }, delay);
  feedingActionTimers.add(timer);
}

function runAwayFromFood() {
  if (!activeFood) return;
  const foodRect = activeFood.getBoundingClientRect();
  const petRect = pet.getBoundingClientRect();
  const foodIsLeft = foodRect.left + foodRect.width / 2 < petRect.left + petRect.width / 2;
  const targetLeft = foodIsLeft ? window.innerWidth - pet.offsetWidth - 8 : 8;
  pet.classList.remove('feeding-chasing');
  pet.classList.add('feeding-running-away', 'walking');
  pet.classList.toggle('facing-left', targetLeft < petRect.left);
  pet.style.left = `${targetLeft}px`;
  position = (targetLeft / window.innerWidth) * 100;
}

function updateFeedingBehavior() {
  if (!isFeedingMode || isSettingsOpen() || isDead || !activeFood) return;
  if (!isFoodAboveGrass()) {
    if (stoneGreetingFood === activeFood) cancelStoneGreeting();
    stopFeedingMovement();
    return;
  }
  if (stoneGreetingFood === activeFood) return;
  if (hunger >= MAX_HUNGER) {
    runAwayFromFood();
    return;
  }

  pet.classList.remove('feeding-running-away');
  if (feedingJumpActive) {
    tryCollectFood();
    return;
  }
  if (tryCollectFood()) return;

  const foodRect = activeFood.getBoundingClientRect();
  const petRect = pet.getBoundingClientRect();
  const foodX = foodRect.left + foodRect.width / 2;
  const petX = petRect.left + petRect.width / 2;
  const horizontalDistance = foodX - petX;
  const horizontalReach = petRect.width * .22;

  if (Math.abs(horizontalDistance) > horizontalReach) {
    const targetLeft = Math.max(0, Math.min(window.innerWidth - pet.offsetWidth, foodX - pet.offsetWidth / 2));
    pet.classList.add('feeding-chasing', 'walking');
    pet.classList.toggle('facing-left', horizontalDistance < 0);
    pet.style.left = `${targetLeft}px`;
    position = (targetLeft / window.innerWidth) * 100;
    return;
  }

  pet.classList.remove('walking');
  const foodY = foodRect.top + foodRect.height / 2;
  const standingReachY = petRect.top + petRect.height * .42;
  if (foodY < standingReachY) startFeedingJump();
}

function startFeedingBehaviorLoop() {
  if (feedingBehaviorTimer !== undefined || document.hidden) return;
  feedingBehaviorTimer = window.setInterval(updateFeedingBehavior, FEEDING_TICK_MS);
}

function stopFeedingBehaviorLoop() {
  if (feedingBehaviorTimer === undefined) return;
  window.clearInterval(feedingBehaviorTimer);
  feedingBehaviorTimer = undefined;
}

function movePenguin() {
  if (getActiveRuntimeMode() !== 'main' || songInvitation.open || isRpsResolving || isDead || isDragging || isFalling || pet.classList.contains('jumping') || pet.classList.contains('crazy-flying')) return;
  const maxPosition = Math.max(8, ((window.innerWidth - pet.offsetWidth) / window.innerWidth) * 100);
  const next = Math.round(4 + Math.random() * Math.max(0, maxPosition - 8));
  pet.classList.toggle('facing-left', next < position);
  position = next;
  walking = true;
  pet.classList.add('walking');
  pet.style.left = `${position}%`;
  maybePlayGenshinSound(getMinuteCloudCount());
  window.clearTimeout(walkAnimationTimer);
  walkAnimationTimer = window.setTimeout(() => {
    walkAnimationTimer = undefined;
    walking = false;
    pet.classList.remove('walking');
  }, 1250);
}

function scheduleWalk() {
  if (document.hidden || walkTimer !== undefined) return;
  walkTimer = window.setTimeout(() => {
    walkTimer = undefined;
    movePenguin();
    scheduleWalk();
  }, 1800 + Math.random() * 3600);
}

function stopScheduledWalk() {
  window.clearTimeout(walkTimer);
  window.clearTimeout(walkAnimationTimer);
  walkTimer = undefined;
  walkAnimationTimer = undefined;
  walking = false;
  pet.classList.remove('walking');
}

function jump() {
  if (isRpsMode || isRpsResolving || isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('jumping')) return;
  pet.classList.remove('walking');
  pet.classList.add('jumping');
  window.setTimeout(() => {
    if (isDead) return;
    pet.classList.remove('jumping');
    playLandingSound();
  }, 620);
}

function spin() {
  if (isRpsMode || isRpsResolving || isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('crazy-flying')) return;
  pet.classList.remove('walking');
  pet.classList.add('spinning');
  window.setTimeout(() => pet.classList.remove('spinning'), 720);
}

function crazyFly() {
  if (isRpsMode || isRpsResolving || isSettingsOpen() || isDead || isDragging || isFalling) return;
  walking = false;
  pet.classList.remove('walking', 'facing-left', 'jumping', 'spinning', 'crazy-flying');
  pet.style.setProperty('--crazy-x1', `${Math.round(-38 + Math.random() * 24)}vw`);
  pet.style.setProperty('--crazy-x2', `${Math.round(18 + Math.random() * 24)}vw`);
  pet.style.setProperty('--crazy-x3', `${Math.round(-30 + Math.random() * 60)}vw`);
  pet.style.setProperty('--crazy-duration', `${DEATH_NOTE_DURATION_MS}ms`);
  void pet.offsetWidth;
  pet.classList.add('crazy-flying');
  playSound(deathNoteSound);
  window.setTimeout(() => {
    pet.classList.remove('crazy-flying');
    pet.style.removeProperty('--crazy-x1');
    pet.style.removeProperty('--crazy-x2');
    pet.style.removeProperty('--crazy-x3');
    pet.style.removeProperty('--crazy-duration');
  }, DEATH_NOTE_DURATION_MS);
}

pet.addEventListener('click', (event) => {
  if (affection === 0 || isFeedingMode || isSingingMode || isRpsMode || isRpsResolving || isSettingsOpen() || isDead) return;
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  if (pet.classList.contains('jumping') || pet.classList.contains('spinning') || pet.classList.contains('crazy-flying')) return;
  clickCount = Math.max(clickCount + 1, event.detail);
  window.clearTimeout(clickTimer);
  if (clickCount >= 3) {
    clickTimer = undefined;
    clickCount = 0;
    crazyFly();
    return;
  }
  clickTimer = window.setTimeout(() => {
    clickTimer = undefined;
    const completedClicks = clickCount;
    clickCount = 0;
    if (completedClicks === 2) spin();
    else jump();
  }, MULTI_CLICK_DELAY);
});

function landingTop() {
  return grass.getBoundingClientRect().top - pet.offsetHeight + 8;
}

function loadSoundBuffer(sound) {
  if (!AudioContextClass) return Promise.resolve(null);
  ensureAudioGraph();
  if (!sound.bufferPromise) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = window.setTimeout(() => controller?.abort(), 15_000);
    sound.bufferPromise = fetch(sound.element.src, { cache: 'force-cache', signal: controller?.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((audioData) => audioContext.decodeAudioData(audioData))
      .then((buffer) => {
        sound.buffer = buffer;
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        window.clearTimeout(timeout);
        if (!sound.buffer) sound.bufferPromise = null;
      });
  }
  return sound.bufferPromise;
}

function startSoundBuffer(sound, onEnded, generation = sound.playbackGeneration) {
  if (generation !== sound.playbackGeneration || runtimeSuspended) return false;
  const source = audioContext.createBufferSource();
  const startedAt = audioContext.currentTime;
  let completed = false;
  let safetyTimer;
  source.buffer = sound.buffer;
  source.connect(masterGainNode);
  sound.sources.add(source);
  const complete = () => {
    if (completed) return;
    completed = true;
    window.clearTimeout(safetyTimer);
    sound.sources.delete(source);
    if (sound === activeSingingSound && sound.sources.size === 0) stopSingingWaveAnimation();
    if (generation === sound.playbackGeneration) onEnded?.();
  };
  source.addEventListener('ended', complete, { once: true });
  source.start();
  safetyTimer = window.setTimeout(complete, Math.max(3000, (sound.buffer.duration + 2) * 1000));
  if (sound === activeSingingSound) {
    startSingingWaveAnimation(() => audioContext.currentTime - startedAt);
  }
  return true;
}

function playSoundBuffer(sound, onEnded, generation = sound.playbackGeneration) {
  if (!audioContext || !sound.buffer) return false;
  if (audioContext.state !== 'running') {
    audioContext.resume()
      .then(() => {
        if (generation !== sound.playbackGeneration || runtimeSuspended) {
          if (runtimeSuspended && audioContext.state === 'running') audioContext.suspend().catch(() => {});
          return;
        }
        if (singingSounds.has(sound) && !isSingingMode) return;
        if (audioContext.state === 'running') startSoundBuffer(sound, onEnded, generation);
        else playSoundFallback(sound, onEnded, generation);
      })
      .catch(() => {
        if (generation === sound.playbackGeneration && !runtimeSuspended) {
          playSoundFallback(sound, onEnded, generation);
        }
      });
    return true;
  }
  try {
    startSoundBuffer(sound, onEnded, generation);
  } catch (error) {
    console.warn('[audio] WebAudio 播放失敗，改用媒體元素', error);
    playSoundFallback(sound, onEnded, generation);
  }
  return true;
}

function primeAudioContext() {
  if (!AudioContextClass) return;
  ensureAudioGraph();
  audioContext.resume().catch(() => {});
  if (audioContextPrimed) return;
  const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
  const silentSource = audioContext.createBufferSource();
  silentSource.buffer = silentBuffer;
  silentSource.connect(masterGainNode);
  silentSource.start(0);
  audioContextPrimed = true;
}

function unlockGameSounds() {
  if (gameAudioActivated) {
    if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
    return;
  }
  gameAudioActivated = true;
  primeAudioContext();
  if (genshinSoundPending && canPlayGenshinSound()) {
    genshinSoundPending = false;
    genshinSoundPlayed = true;
    window.setTimeout(() => playGenshinSoundWithCloudLock(), 0);
  } else if (genshinSoundPending) {
    genshinSoundPending = false;
  }
}

document.addEventListener('pointerdown', unlockGameSounds, { capture: true });
document.addEventListener('keydown', unlockGameSounds, { capture: true });

function playSoundFallback(sound, onEnded, generation = sound.playbackGeneration) {
  if (generation !== sound.playbackGeneration || runtimeSuspended) return;
  let completed = false;
  let safetyTimer;
  const complete = () => {
    if (completed) return;
    completed = true;
    window.clearTimeout(safetyTimer);
    sound.element.removeEventListener('ended', complete);
    sound.element.removeEventListener('error', complete);
    sound.element.removeEventListener('abort', complete);
    if (sound === activeSingingSound) stopSingingWaveAnimation();
    if (generation === sound.playbackGeneration) onEnded?.();
  };
  if (onEnded) {
    sound.element.addEventListener('ended', complete, { once: true });
    sound.element.addEventListener('error', complete, { once: true });
    sound.element.addEventListener('abort', complete, { once: true });
    safetyTimer = window.setTimeout(complete, singingSounds.has(sound) ? 65_000 : 8000);
  }
  try {
    sound.element.muted = false;
    sound.element.currentTime = 0;
    sound.element.play()
      .then(() => {
        if (generation !== sound.playbackGeneration || runtimeSuspended) {
          sound.element.pause();
          sound.element.currentTime = 0;
          return;
        }
        if (sound === activeSingingSound) startSingingWaveAnimation(() => sound.element.currentTime);
      })
      .catch((error) => {
        console.warn(`[audio] 無法播放 ${sound.element.src}`, error);
        complete();
      });
  } catch (error) {
    console.warn(`[audio] 無法啟動 ${sound.element.src}`, error);
    complete();
  }
}

function playSound(sound, onEnded) {
  const generation = ++sound.playbackGeneration;
  if (runtimeSuspended) return;
  if (playSoundBuffer(sound, onEnded, generation)) return;
  if (AudioContextClass) {
    loadSoundBuffer(sound).then((buffer) => {
      if (generation !== sound.playbackGeneration || runtimeSuspended) return;
      if (singingSounds.has(sound) && !isSingingMode) return;
      if (buffer) playSoundBuffer(sound, onEnded, generation);
      else playSoundFallback(sound, onEnded, generation);
    });
    return;
  }
  playSoundFallback(sound, onEnded, generation);
}

function playHurtSound() {
  playSound(hurtSound);
}

function playLandingSound() {
  playSound(landingSound);
}

function playDeathSound() {
  playSound(deathSound);
}

function playScreamSound(onEnded) {
  playSound(screamSound, onEnded);
}

function stopSound(sound) {
  sound.playbackGeneration += 1;
  sound.sources.forEach((source) => {
    try { source.stop(); } catch {}
  });
  sound.sources.clear();
  sound.element.pause();
  sound.element.currentTime = 0;
  if (sound === activeSingingSound) stopSingingWaveAnimation();
}

function triggerDeath(cause = '企鵝失去了所有血量') {
  if (isDead) return;
  if (isMandatoryFirstSong) {
    health = Math.max(1, health);
    renderHealth();
    saveGameState();
    return;
  }
  isDead = true;
  syncRuntimeIsolation();
  resetSongInvitation();
  stopGenshinOutsideMain();
  closeCompetingModes(null, { forceSinging: true, awardMining: false });
  setRpsPlaybackLock(false);
  window.cancelAnimationFrame(fallAnimationFrame);
  fallAnimationFrame = undefined;
  isDragging = false;
  isFalling = false;
  walking = false;
  suppressNextClick = true;
  if (clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = undefined;
  }
  clickCount = 0;
  pet.classList.remove('walking', 'facing-left', 'jumping', 'spinning', 'crazy-flying', 'dragging', 'falling', 'hurt');
  world.classList.add('is-dying');
  deathCause.textContent = cause;
  const syncScreamWithJumpscare = (event) => {
    if (event.animationName !== 'death-jumpscare') return;
    pet.removeEventListener('animationstart', syncScreamWithJumpscare);
    if (!isDead) return;
    playScreamSound();
    window.setTimeout(() => {
      if (!isDead) return;
      stopSound(screamSound);
      playDeathSound();
      deathScreen.classList.add('is-visible');
      deathScreen.setAttribute('aria-hidden', 'false');
      deathScreen.inert = false;
      syncRuntimeIsolation();
      restartButton.focus();
    }, DEATH_SCREEN_DELAY);
  };
  pet.addEventListener('animationstart', syncScreamWithJumpscare);
  window.setTimeout(() => {
    if (isDead) pet.classList.add('death-jumpscare');
  }, DEATH_RED_FLASH_DELAY);
}

function restartGame() {
  resetSongInvitation();
  closeCompetingModes(null, { forceSinging: true, awardMining: false });
  setRpsPlaybackLock(false);
  setMandatoryFirstSong(false);
  isDead = false;
  isDragging = false;
  isFalling = false;
  suppressNextClick = false;
  window.clearTimeout(clickTimer);
  clickTimer = undefined;
  clickCount = 0;
  lastAffectionCategory = '';
  consecutiveAffectionActions = 0;
  trustPromptUntil = 0;
  penguinWinStreak = 0;
  genshinSoundPending = false;
  genshinSoundPlayed = false;
  lockedCloudCount = null;
  runtimeResumeMode = null;
  health = MAX_HEALTH;
  hunger = 6;
  affection = 0;
  foodInventory.apple = 10;
  foodInventory.stone = 0;
  position = 42;
  stopSound(screamSound);
  stopSound(deathSound);
  stopSound(deathNoteSound);
  stopSound(moralSound);
  world.classList.remove('is-dying');
  deathScreen.classList.remove('is-visible');
  deathScreen.setAttribute('aria-hidden', 'true');
  deathScreen.inert = true;
  pet.classList.remove('death-jumpscare', 'hurt');
  pet.style.left = `${position}%`;
  pet.style.top = '';
  pet.style.bottom = '';
  renderHealth();
  renderHunger();
  renderAffection();
  updateFoodPicker();
  writeFoodInventory();
  saveGameState();
  syncRuntimeIsolation();
}

function showHurtEffect(damage, cause, visualTarget = pet) {
  if (isDead) return;
  health = Math.max(0, health - damage);
  applyAffectionLoss(Math.ceil(damage / 10) * AFFECTION_LOSS_PER_10_DAMAGE);
  renderHealth();
  saveGameState();
  if (health === 0) {
    triggerDeath(cause);
    return;
  }
  playHurtSound();
  visualTarget.classList.remove('hurt');
  void visualTarget.offsetWidth;
  visualTarget.classList.add('hurt');
  window.setTimeout(() => visualTarget.classList.remove('hurt'), 650);
}

function calculateFallDamage(fallDistance) {
  if (fallDistance < SAFE_FALL_HEIGHT) return 0;
  const damageLevels = Math.floor((fallDistance - SAFE_FALL_HEIGHT) / FALL_DAMAGE_HEIGHT_STEP) + 1;
  const damage = damageLevels * HEALTH_UNIT;
  return Math.min(MAX_FALL_DAMAGE, damage);
}

function finishFall(fallDistance) {
  if (isDead) return;
  fallAnimationFrame = undefined;
  pet.classList.remove('falling');
  isFalling = false;
  position = (pet.getBoundingClientRect().left / window.innerWidth) * 100;
  playLandingSound();
  const damage = calculateFallDamage(fallDistance);
  if (damage > 0) showHurtEffect(damage, '企鵝從太高的地方摔了下來');
}

function fallWithGravity(startTop, targetTop, fallDistance) {
  let fallStartedAt;
  const step = (timestamp) => {
    if (isDead) return;
    if (fallStartedAt === undefined) fallStartedAt = timestamp;
    const elapsedSeconds = (timestamp - fallStartedAt) / 1000;
    const fallenDistance = .5 * FALL_GRAVITY * elapsedSeconds ** 2;
    const nextTop = Math.min(targetTop, startTop + fallenDistance);
    pet.style.top = `${nextTop}px`;
    if (nextTop < targetTop) {
      fallAnimationFrame = window.requestAnimationFrame(step);
      return;
    }
    finishFall(fallDistance);
  };
  fallAnimationFrame = window.requestAnimationFrame(step);
}

function healFromFullHunger() {
  if (getActiveRuntimeMode() !== 'main' || songInvitation.open || isDead || hunger < MAX_HUNGER || health >= MAX_HEALTH) return;
  health = Math.min(MAX_HEALTH, health + HEAL_AMOUNT);
  hunger = Math.max(0, hunger - HEAL_HUNGER_COST);
  renderHealth();
  renderHunger();
  saveGameState();
}

pet.addEventListener('pointerdown', (event) => {
  if (affection === 0 || isFeedingMode || isSingingMode || isRpsMode || isRpsResolving || isHideAndSeekMode || isSettingsOpen() || isDead || isFalling || pet.classList.contains('jumping') || pet.classList.contains('spinning') || pet.classList.contains('crazy-flying')) return;
  unlockGameSounds();
  const rect = pet.getBoundingClientRect();
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  petStartLeft = rect.left;
  petStartTop = rect.top;
  pet.setPointerCapture(event.pointerId);
});

pet.addEventListener('pointermove', (event) => {
  if (isDead || !pet.hasPointerCapture(event.pointerId) || isFalling) return;
  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;
  if (!isDragging && Math.hypot(deltaX, deltaY) < 5) return;

  isDragging = true;
  suppressNextClick = true;
  pet.classList.remove('walking');
  pet.classList.add('dragging');
  pet.style.bottom = 'auto';
  pet.style.left = `${Math.max(0, Math.min(window.innerWidth - pet.offsetWidth, petStartLeft + deltaX))}px`;
  pet.style.top = `${Math.max(0, Math.min(landingTop(), petStartTop + deltaY))}px`;
});

function releasePenguin(event) {
  if (pet.hasPointerCapture(event.pointerId)) pet.releasePointerCapture(event.pointerId);
  if (isDead || !isDragging) return;

  isDragging = false;
  if (event.type === 'pointercancel') suppressNextClick = false;
  isFalling = true;
  pet.classList.remove('dragging');
  const startTop = pet.getBoundingClientRect().top;
  const targetTop = landingTop();
  const fallDistance = Math.max(0, targetTop - startTop);
  pet.classList.add('falling');
  fallWithGravity(startTop, targetTop, fallDistance);
}

pet.addEventListener('pointerup', releasePenguin);
pet.addEventListener('pointercancel', releasePenguin);
pet.addEventListener('contextmenu', event => event.preventDefault());
pet.addEventListener('dragstart', event => event.preventDefault());
pet.addEventListener('selectstart', event => event.preventDefault());

window.addEventListener('resize', () => {
  if (isDead || !pet.style.top || isDragging || isFalling) return;
  const rect = pet.getBoundingClientRect();
  pet.style.left = `${Math.max(0, Math.min(window.innerWidth - pet.offsetWidth, rect.left))}px`;
  pet.style.top = `${landingTop()}px`;
});

function startRuntimeTimers() {
  if (runtimeSuspended) return;
  if (dayNightTimer === undefined) dayNightTimer = window.setInterval(updateDayNightFromBrowserTime, 60_000);
  if (healTimer === undefined) healTimer = window.setInterval(healFromFullHunger, FULL_HUNGER_HEAL_INTERVAL);
  scheduleNextCloudUpdate();
  scheduleWalk();
}

function stopRuntimeTimers() {
  window.clearInterval(dayNightTimer);
  window.clearInterval(healTimer);
  window.clearTimeout(cloudUpdateTimer);
  dayNightTimer = undefined;
  healTimer = undefined;
  cloudUpdateTimer = undefined;
  stopFeedingBehaviorLoop();
  stopScheduledWalk();
}

function settleInterruptedPenguinDrag() {
  window.cancelAnimationFrame(fallAnimationFrame);
  fallAnimationFrame = undefined;
  if (!isDragging && !isFalling) return;
  isDragging = false;
  isFalling = false;
  suppressNextClick = false;
  pet.classList.remove('dragging', 'falling');
  pet.style.bottom = 'auto';
  pet.style.top = `${landingTop()}px`;
  position = (pet.getBoundingClientRect().left / window.innerWidth) * 100;
}

function suspendRuntime() {
  if (runtimeSuspended) return;
  runtimeResumeMode = getActiveRuntimeMode();
  if (runtimeResumeMode === 'catch') settleCatchRewards();
  runtimeSuspended = true;
  closeCompetingModes(null, { forceSinging: true, awardMining: false });
  setRpsPlaybackLock(false);
  stopRuntimeTimers();
  settleInterruptedPenguinDrag();
  gameSounds.forEach(stopSound);
  lockedCloudCount = null;
  genshinSoundPending = false;
  audioContext?.suspend().catch(() => {});
  saveGameState();
}

function resumeRuntime() {
  if (!runtimeSuspended || document.hidden) return;
  const mode = runtimeResumeMode;
  runtimeResumeMode = null;
  runtimeSuspended = false;
  updateDayNightFromBrowserTime();
  updateCloudsFromClock();
  startRuntimeTimers();
  resumeRuntimeMode(mode);
}

updateDayNightFromBrowserTime();
updateCloudsFromClock();
if (!runtimeSuspended) startRuntimeTimers();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) suspendRuntime();
  else resumeRuntime();
});
window.addEventListener('blur', suspendRuntime);
window.addEventListener('focus', resumeRuntime);
window.addEventListener('pagehide', suspendRuntime);
window.addEventListener('pageshow', resumeRuntime);

// Game feature controls.
function openAdventureMenu(event) {
  if (event?.cancelable) event.preventDefault();
  setAdventureMenu(true);
}
adventureButton.addEventListener('click', openAdventureMenu);
closeAdventureMenuButton.addEventListener('click', () => setAdventureMenu(false));
adventureMenu.querySelector('[data-adventure-game="catch"]').addEventListener('click', () => setCatchMode(true));
adventureMenu.querySelector('[data-adventure-game="mining"]').addEventListener('click', () => setMiningMode(true));
closeCatchGameButton.addEventListener('click', () => {
  settleCatchRewards();
  setCatchMode(false);
  setAdventureMenu(true);
});
closeMiningGameButton.addEventListener('click', () => {
  setMiningMode(false);
  if (songInvitation.open) {
    invitationResumeMode = 'adventure';
    return;
  }
  setAdventureMenu(true);
});

miningField.addEventListener('pointerdown', (event) => {
  if (!isMiningMode || event.target.closest('.mining-toolbar')) return;
  if (miningPointerId !== null) return;
  const rock = event.target.closest('.mining-rock');
  if (!rock) { moveMiningPenguin(event.clientX, event.clientY); return; }
  event.preventDefault();
  miningPointerId = event.pointerId; miningTargetRock = rock;
  miningPointerStartX = event.clientX; miningPointerStartY = event.clientY;
  miningField.setPointerCapture?.(event.pointerId);
  miningHoldTimer = window.setTimeout(() => {
    if (miningPointerId === event.pointerId && miningTargetRock === rock) mineRock(rock);
    miningHoldTimer = undefined;
  }, MINING_HOLD_MS);
});
miningField.addEventListener('pointermove', (event) => {
  if (event.pointerId !== miningPointerId || miningHoldTimer === undefined) return;
  if (Math.hypot(event.clientX - miningPointerStartX, event.clientY - miningPointerStartY) < 10) return;
  window.clearTimeout(miningHoldTimer); miningHoldTimer = undefined;
});
function endMiningPointer(event) {
  if (event.pointerId !== miningPointerId) return;
  window.clearTimeout(miningHoldTimer); miningHoldTimer = undefined; miningPointerId = null; miningTargetRock = null;
  if (miningField.hasPointerCapture?.(event.pointerId)) miningField.releasePointerCapture(event.pointerId);
}
miningField.addEventListener('pointerup', endMiningPointer);
miningField.addEventListener('pointercancel', endMiningPointer);
miningField.addEventListener('contextmenu', (event) => event.preventDefault());
miningField.addEventListener('selectstart', (event) => event.preventDefault());
miningField.addEventListener('dragstart', (event) => event.preventDefault());

feedButton.addEventListener('click', () => {
  if (isSettingsOpen() || isDead || isRpsResolving) return;
  setInteractionMode(false);
  setFeedingMode(!isFeedingMode);
});

interactButton.addEventListener('click', () => {
  if (isSettingsOpen() || isDead || isRpsResolving) return;
  setFeedingMode(false);
  setInteractionMode(!isInteractionMode);
});

singingButton.addEventListener('click', () => {
  setInteractionMode(false);
  setSingingMode(true);
});

rpsButton.addEventListener('click', () => setRpsMode(true));
hideAndSeekButton.addEventListener('click', () => setHideAndSeekMode(true));
function openBallGame(event) {
  if (event?.cancelable) event.preventDefault();
  setBallMode(true);
}
ballButton.addEventListener('click', openBallGame);
closeBallGameButton.addEventListener('click', () => setBallMode(false));
closeHideGameButton.addEventListener('click', () => setHideAndSeekMode(false));
startHideGameButton.addEventListener('click', beginHideAndSeekRound);
hidePenguin.addEventListener('click', () => finishHideAndSeekRound(true));
hidePenguinHit.addEventListener('click', () => finishHideAndSeekRound(true));
endRpsButton.addEventListener('click', () => {
  setRpsMode(false);
});
rpsChoiceButtons.forEach((button) => {
  button.addEventListener('click', () => playRpsRound(button.dataset.rpsChoice));
});

cancelSingingButton.addEventListener('click', () => {
  setSingingMode(false);
});

singingSongButton.addEventListener('click', () => playSingingSong(singingSound));
kimiNoKamisamaSongButton.addEventListener('click', playKimiNoKamisamaSong);
songInvitation.addEventListener('cancel', (event) => event.preventDefault());
songInvitation.addEventListener('close', syncRuntimeIsolation);
acceptSongInvitationButton.addEventListener('click', () => {
  writeSongInvitationState('unlocked-new');
  setMandatoryFirstSong(true);
  openUnlockedSongScreen();
});
declineSongInvitationButton.addEventListener('click', () => {
  songInvitationActions.hidden = true;
  songDeclineConfirmation.hidden = false;
  confirmDeclineSongInvitationButton.focus();
});
backSongInvitationButton.addEventListener('click', () => {
  showSongInvitationChoice();
  declineSongInvitationButton.focus();
});
confirmDeclineSongInvitationButton.addEventListener('click', () => {
  writeSongInvitationState('declined');
  songInvitation.close();
  resumeAfterSongInvitation();
});

foodPicker.querySelectorAll('[data-food-type]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => prepareFoodPointerDrag(button.dataset.foodType, event));
  button.addEventListener('touchstart', (event) => prepareFoodTouchDrag(button.dataset.foodType, event), { passive: false });
});
updateFoodPicker();

restartButton.addEventListener('click', restartGame);
resetGameButton.addEventListener('click', () => {
  if (!window.confirm('確定要重新開始嗎？目前的遊戲進度會被清除。')) return;
  restartGame();
  saveCodeField.value = '';
  setSaveCodeStatus('已重新開始。');
});

renderHealth();
renderHunger();
renderAffection();
renderKimiNoKamisamaUnlock();
window.setTimeout(maybeShowSongInvitation, 0);
