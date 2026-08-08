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
const affectionMeter = document.querySelector('.affection');
const affectionFill = document.querySelector('.affection-fill');
let position = 42;
let walking = false;
let clickTimer;
let clickCount = 0;
let health = 100;
let hunger = 6;
let affection = 40;
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
let miningPickTimer;
let miningRollInterval;
let miningResultTimer;
let miningHoldTimer;
let miningExitTimer;
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
let rpsDisabledControls = null;
let rpsResultResetTimer;
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
let walkTimer;
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

function readFoodInventory() {
  const defaults = Object.fromEntries(FOOD_TYPES.map((type) => [type, 0]));
  try {
    if (window.localStorage.getItem(FOOD_STORAGE_VERSION_KEY) !== FOOD_STORAGE_VERSION) {
      window.localStorage.setItem(FOOD_STORAGE_VERSION_KEY, FOOD_STORAGE_VERSION);
      window.localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(defaults));
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

function saveFoodInventory() {
  try {
    window.localStorage.setItem(FOOD_STORAGE_VERSION_KEY, FOOD_STORAGE_VERSION);
    window.localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foodInventory));
  } catch {}
}

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
  const element = new Audio(path);
  element.preload = 'auto';
  return { element, buffer: null, bufferPromise: null, unlocked: false, unlocking: false, sources: new Set() };
}

const hurtSound = createSound('audio/痾啊.wav');
const landingSound = createSound('audio/落地.wav');
const screamSound = createSound('audio/咿.wav');
const deathSound = createSound('audio/死亡音效.wav');
const deathNoteSound = createSound('audio/死亡筆記本.wav');
const moralSound = createSound('audio/做事要講良心.wav');
const genshinSound = createSound('audio/好想玩原神.wav');
const singingSound = createSound('audio/壱雫空.wav');
const penguinWinSound = createSound('audio/gugugaga.wav');
const gameSounds = [hurtSound, landingSound, screamSound, deathSound, deathNoteSound, moralSound, genshinSound, singingSound, penguinWinSound];
const SINGING_WAVEFORM_FPS = 20;
const SINGING_WAVEFORM = Uint8Array.of(42,44,54,56,58,62,60,60,63,68,69,69,86,80,72,66,68,70,70,70,70,72,69,43,4,59,62,65,63,59,53,70,71,68,57,16,70,100,89,85,92,82,87,100,77,85,86,82,85,100,83,89,84,66,77,99,95,93,89,76,85,100,79,92,80,73,90,100,100,89,88,86,92,91,74,88,77,74,97,99,98,92,84,87,100,91,87,91,84,81,100,88,93,86,87,85,99,84,88,87,70,80,100,99,97,85,81,85,99,81,92,85,80,83,100,98,95,91,85,94,97,78,89,77,72,94,98,100,88,80,69,97,89,88,83,76,74,100,97,100,87,81,88,100,79,91,76,72,86,100,100,95,84,76,92,97,83,92,82,79,98,99,99,93,79,83,95,93,80,87,83,89,99,99,97,84,73,81,92,95,77,89,87,85,96,99,95,95,84,83,98,87,83,95,87,92,83,90,84,100,100,100,89,86,91,96,78,89,99,74,93,78,76,87,96,84,92,98,68,89,82,81,86,78,76,96,94,87,96,99,90,91,81,75,91,83,90,100,77,83,100,87,86,89,82,78,83,82,87,97,90,92,100,73,88,82,82,84,83,82,90,96,80,87,99,71,92,85,72,85,75,75,98,94,80,93,98,80,99,76,77,81,81,84,98,83,80,99,85,88,89,85,83,84,84,88,98,83,84,99,81,90,86,81,85,98,96,96,93,79,100,98,96,94,79,81,82,80,80,90,86,84,82,86,77,90,76,74,95,91,79,92,82,83,99,81,82,90,82,84,100,80,88,84,84,82,81,76,74,91,72,88,92,70,83,84,81,89,99,76,85,82,78,87,99,78,88,86,80,83,74,91,85,79,69,82,89,83,90,86,86,89,85,85,87,84,85,95,93,85,96,92,90,89,88,80,84,68,42,71,54,52,60,62,63,60,39,47,58,15,62,65,68,73,69,65,69,69,66,67,67,65,93,90,75,91,73,70,92,70,76,90,76,75);
const SINGING_BEATS = [[.07,.34],[.61,.27],[1.26,.83],[1.57,.48],[1.83,.74],[2.28,.95],[3.04,.64],[3.47,1],[3.76,.8],[4.62,.52],[4.94,.8],[5.14,.53],[5.82,.73],[6.26,.62],[6.95,.56],[7.28,.84],[7.57,.61],[7.87,.74],[8.37,.58],[8.58,.7],[8.94,.7],[9.31,.55],[9.55,.66],[9.79,.65],[10.53,1],[10.85,.99],[11.26,.82],[11.45,.78],[11.99,.93],[12.43,.71],[12.73,1],[13.03,.92],[13.32,1],[13.9,1],[14.49,.94],[14.99,.62],[15.24,.75],[15.51,.76],[15.96,1],[16.42,.77],[16.82,.52],[17.13,.52],[17.59,.7],[17.89,.83],[18.32,.85],[18.55,.79],[19.06,.74],[19.49,.88],[19.76,.48],[19.95,.83],[20.52,.61],[21.11,1],[21.41,1]];
const SINGING_CHOREOGRAPHY = [[0,0],[1.26,-7],[2.28,5],[3.47,-3],[4.62,10],[5.82,1],[7.28,-11],[8.58,7],[10.53,0],[11.99,-13],[13.32,13],[14.99,3],[15.96,-8],[17.59,9],[19.06,-5],[20.52,5],[21.66,0]];
let singingAnimationFrame;

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
  try { window.localStorage.setItem(VOLUME_STORAGE_KEY, String(gameVolume)); } catch {}
}

volumeSlider.addEventListener('input', () => {
  setGameVolume(Number(volumeSlider.value) / 100);
});
setGameVolume(gameVolume, false);

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
const FEED_AFFECTION_GAIN = 3;
const STONE_HUNGER_GAIN = 1;
const STONE_AFFECTION_GAIN = 10;
const AFFECTION_LOSS_PER_DAMAGE = 1;
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
  const delay = CLOUD_TRAVEL_MS - (Date.now() % CLOUD_TRAVEL_MS);
  window.setTimeout(() => {
    updateCloudsFromClock();
    scheduleNextCloudUpdate();
  }, delay);
}

function toggleSettings() {
  const isOpen = document.body.classList.toggle('settings-open');
  if (isOpen) {
    stopGenshinOutsideMain();
    setFeedingMode(false);
    setInteractionMode(false);
    setSingingMode(false);
    setRpsMode(false);
    setBallMode(false);
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
  hungerMeter.setAttribute('aria-label', `飽食度：${percentage}%`);
}

function renderHealth() {
  const percentage = (health / MAX_HEALTH) * 100;
  healthFill.style.width = `${percentage}%`;
  healthMeter.setAttribute('aria-label', `血量：${percentage}%`);
}

function renderAffection() {
  affectionFill.style.width = `${affection}%`;
  affectionMeter.setAttribute('aria-label', `好感度：${affection}%`);
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

function setFeedingMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isDragging || isFalling)) return;
  if (enabled) setBallMode(false);
  if (enabled) setInteractionMode(false);
  if (enabled) setSingingMode(false);
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
    return;
  }

  stopFeedingBehaviorLoop();
  removeActiveFood();
  pendingFoodDrag = null;
  feedingJumpActive = false;
  foodCollectedDuringJump = false;
  resetMoralSoundSequence(true);
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
}

function setInteractionMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isFeedingMode || isRpsMode || isRpsResolving || isBallMode || isHideAndSeekMode)) return;
  if (enabled) setSingingMode(false);
  isInteractionMode = enabled;
  document.body.classList.toggle('interaction-mode', enabled);
  interactionPicker.inert = !enabled;
  interactionPicker.setAttribute('aria-hidden', String(!enabled));
  interactButton.setAttribute('aria-pressed', String(enabled));
  interactButton.setAttribute('aria-label', enabled ? '結束互動選單' : '與企鵝互動');
  interactButtonLabel.textContent = enabled ? '取消互動' : '互動';
  if (enabled) stopGenshinOutsideMain();
}

function setRpsMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isFeedingMode || isSingingMode || isRpsResolving || isBallMode || isHideAndSeekMode)) return;
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
    window.clearTimeout(rpsResultResetTimer);
    rpsResultResetTimer = undefined;
    petImage.src = normalPetImageSource;
    petImage.alt = '企鵝';
    rpsResult.textContent = '選一個出拳吧';
  }
}

function setRpsPlaybackLock(locked) {
  isRpsResolving = locked;
  document.body.classList.toggle('rps-resolving', locked);
  if (locked) {
    rpsDisabledControls = new Map();
    document.querySelectorAll('button, input, select').forEach((control) => {
      rpsDisabledControls.set(control, control.disabled);
      control.disabled = true;
    });
    return;
  }
  rpsDisabledControls?.forEach((wasDisabled, control) => { control.disabled = wasDisabled; });
  rpsDisabledControls = null;
}

function waitForAnimation(element, animationName) {
  return new Promise((resolve) => {
    const finish = (event) => {
      if (event && (event.target !== element || event.animationName !== animationName)) return;
      element.removeEventListener('animationend', finish);
      resolve();
    };
    element.addEventListener('animationend', finish);
  });
}

function playSoundAndWait(sound) {
  return new Promise((resolve) => playSound(sound, resolve));
}

async function playRpsRound(userHand) {
  if (!isRpsMode || isRpsResolving || isDead) return;
  window.clearTimeout(rpsResultResetTimer);
  rpsResultResetTimer = undefined;
  const shouldUserWin = penguinWinStreak >= 3 || Math.floor(Math.random() * 10) % 2 === 0;
  const penguinHand = shouldUserWin ? RPS_LOSING_HAND[userHand] : RPS_WINNING_HAND[userHand];
  const resultText = shouldUserWin ? '你贏了！' : '企鵝贏了！';

  setRpsPlaybackLock(true);
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

  const animationClass = shouldUserWin ? 'rps-user-win' : 'rps-penguin-win';
  const animationName = shouldUserWin ? 'rps-disappointed-shake' : 'rps-victory-shake';
  pet.classList.add(animationClass);
  await Promise.all([
    waitForAnimation(pet, animationName),
    playSoundAndWait(shouldUserWin ? screamSound : penguinWinSound),
  ]);
  pet.classList.remove(animationClass);
  if (shouldUserWin) penguinWinStreak = 0;
  else penguinWinStreak += 1;
  setRpsPlaybackLock(false);
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

    let choreographyOffset = SINGING_CHOREOGRAPHY[SINGING_CHOREOGRAPHY.length - 1][1];
    for (let index = 1; index < SINGING_CHOREOGRAPHY.length; index += 1) {
      const [nextTime, nextOffset] = SINGING_CHOREOGRAPHY[index];
      if (currentTime > nextTime) continue;
      const [previousTime, previousOffset] = SINGING_CHOREOGRAPHY[index - 1];
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

    const beatDirection = Math.sin(currentTime * Math.PI * 5);
    petImage.style.setProperty('--singing-lift', `${(-energy * .35 - beatPulse * 9).toFixed(2)}px`);
    petImage.style.setProperty('--singing-tilt', `${(beatDirection * (.12 + beatPulse * 2.8)).toFixed(2)}deg`);
    petImage.style.setProperty('--singing-scale', (1 + energy * .002 + beatPulse * .13).toFixed(3));
    singingAnimationFrame = window.requestAnimationFrame(animate);
  };

  animate();
}

function setSingingMode(enabled) {
  isSingingMode = enabled;
  document.body.classList.toggle('singing-mode', enabled);
  singingPicker.inert = !enabled;
  singingPicker.setAttribute('aria-hidden', String(!enabled));
  petImage.src = enabled ? singingPetImageSource : normalPetImageSource;
  petImage.alt = enabled ? '唱歌中的企鵝' : '企鵝';
  if (enabled) stopGenshinOutsideMain();
  if (!enabled) {
    stopSound(singingSound);
    stopSingingWaveAnimation();
  }
}

function playSingingSong() {
  if (!isSingingMode || isDead) return;
  unlockGameSounds();
  stopSound(singingSound);
  playSound(singingSound);
}

// A compact canvas game keeps the court responsive without adding another character system.
const ballPlay = {
  width: 0, height: 0, playerX: .5, penguinX: .5,
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

  const penguinY = h * .18, penguinSize = Math.min(w, h) * .095;
  ctx.save(); ctx.translate(ballPlay.penguinX, penguinY);
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
    const penguinTarget = Math.max(ballCourtEdge(h * .18) + 18, Math.min(w - ballCourtEdge(h * .18) - 18, ballPlay.ballX));
    ballPlay.penguinX += (penguinTarget - ballPlay.penguinX) * Math.min(1, dt * 4.5);
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
    const penguinY = h * .18, penguinReach = Math.min(w * .14, h * .18);
    if (ballPlay.velocityY < 0 && ballPlay.ballY <= penguinY + penguinReach && ballPlay.ballY >= penguinY - penguinReach && Math.abs(ballPlay.ballX - ballPlay.penguinX) < penguinReach) {
      ballPlay.ballY = penguinY + penguinReach;
      ballPlay.velocityY = Math.abs(ballPlay.velocityY) * 1.025;
      ballPlay.velocityX += ((ballPlay.ballX - ballPlay.penguinX) / penguinReach) * .12;
      ballPlay.swingUntil = now + 180;
      ballGameStatus.textContent = '企鵝擊球！';
    }
    if (ballPlay.ballY > h + radius * 2) {
      ballCombo = 0;
      ballComboValue.textContent = '0';
      ballGameStatus.textContent = '漏接了，再來一次！';
      ballPlay.pausedUntil = now + 850;
      window.setTimeout(() => { if (isBallMode) resetBallServe(); }, 850);
    }
  }
  drawBallCourt();
  ballPlay.frame = window.requestAnimationFrame(ballGameFrame);
}

function setBallMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isFeedingMode || isRpsResolving || isHideAndSeekMode)) return;
  isBallMode = enabled;
  document.body.classList.toggle('ball-mode', enabled);
  if (enabled) ballGame.removeAttribute('inert');
  else ballGame.setAttribute('inert', '');
  ballGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) { window.cancelAnimationFrame(ballPlay.frame); ballPlay.frame = undefined; return; }
  setInteractionMode(false); setSingingMode(false); setRpsMode(false);
  walking = false; pet.classList.remove('walking');
  resizeBallCourt();
  ballPlay.playerX = ballPlay.width * .5; ballPlay.penguinX = ballPlay.width * .5; ballPlay.pausedUntil = 0;
  stopGenshinOutsideMain();
  ballCombo = 0;
  ballComboValue.textContent = '0';
  resetBallServe(); ballPlay.lastTime = performance.now(); ballPlay.frame = window.requestAnimationFrame(ballGameFrame);
}

function moveBallPaddle(clientX) {
  const rect = ballCourt.getBoundingClientRect();
  ballPlay.playerX = Math.max(ballCourtEdge(ballPlay.height) + 12, Math.min(ballPlay.width - ballCourtEdge(ballPlay.height) - 12, clientX - rect.left));
}

ballCourt.addEventListener('pointerdown', (event) => { event.preventDefault(); moveBallPaddle(event.clientX); ballCourt.setPointerCapture?.(event.pointerId); });
ballCourt.addEventListener('pointermove', (event) => { if (isBallMode) { event.preventDefault(); moveBallPaddle(event.clientX); } });
window.addEventListener('resize', () => { if (isBallMode) { resizeBallCourt(); resetBallServe(); } });

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
  const state = { type, x: Math.random() * Math.max(1, catchField.clientWidth - size), y: -size, speed: 180 + Math.random() * 130, element: item };
  item.style.left = `${state.x}px`;
  item.style.top = `${state.y}px`;
  item.style.animation = 'none';
  catchField.append(item);
  catchItems.add(state);
}

function catchItemLanded(item) {
  const penguinRect = catchPenguin.getBoundingClientRect();
  const itemRect = item.element.getBoundingClientRect();
  const overlaps = itemRect.right > penguinRect.left + 12 && itemRect.left < penguinRect.right - 12 && itemRect.bottom > penguinRect.top + 18 && itemRect.top < penguinRect.bottom;
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
  if (!isCatchMode) return;
  const delta = Math.min(.04, Math.max(0, (timestamp - catchGameState.lastTime) / 1000 || 0));
  catchGameState.lastTime = timestamp;
  const groundTop = catchField.clientHeight * .8;
  catchItems.forEach((item) => {
    item.y += item.speed * delta;
    item.element.style.top = `${item.y}px`;
    if (catchItemLanded(item) || item.y > groundTop) {
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

function setCatchMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  isCatchMode = enabled;
  document.body.classList.toggle('catch-mode', enabled);
  catchGame.inert = !enabled;
  catchGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) {
    window.cancelAnimationFrame(catchAnimationFrame);
    window.clearInterval(catchSpawnTimer);
    clearCatchItems();
    return;
  }
  stopGenshinOutsideMain();
  isAdventureMenuOpen = false;
  document.body.classList.remove('adventure-menu-open');
  adventureMenu.inert = true;
  setFeedingMode(false); setInteractionMode(false); setSingingMode(false); setRpsMode(false); setBallMode(false); setHideAndSeekMode(false);
  walking = false;
  pet.classList.remove('walking');
  catchApplesCount = 0; catchStonesCount = 0; renderCatchScore();
  catchPenguin.style.left = '50%';
  catchGameState.lastTime = performance.now();
  window.clearInterval(catchSpawnTimer);
  catchSpawnTimer = window.setInterval(spawnCatchItem, 650);
  spawnCatchItem();
  catchAnimationFrame = window.requestAnimationFrame(catchGameFrame);
}

function setAdventureMenu(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  isAdventureMenuOpen = enabled;
  document.body.classList.toggle('adventure-menu-open', enabled);
  adventureMenu.inert = !enabled;
  adventureMenu.setAttribute('aria-hidden', String(!enabled));
  if (enabled) {
    stopGenshinOutsideMain();
    setFeedingMode(false); setInteractionMode(false); setSingingMode(false); setRpsMode(false); setBallMode(false); setHideAndSeekMode(false);
    walking = false;
    pet.classList.remove('walking');
  }
}

function clearMiningTimers() {
  window.clearTimeout(miningPickTimer); window.clearTimeout(miningResultTimer); window.clearTimeout(miningHoldTimer); window.clearTimeout(miningExitTimer); window.clearInterval(miningRollInterval);
  miningPickTimer = miningResultTimer = miningHoldTimer = miningExitTimer = miningRollInterval = undefined;
  miningPickRoll.classList.remove('is-visible', 'is-finished');
}

function miningIsTired() { return hunger < MINING_MIN_HUNGER; }

function showMiningResult(message, type = '') {
  window.clearTimeout(miningResultTimer);
  miningResult.textContent = message;
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

function setMiningMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  isMiningMode = enabled;
  document.body.classList.toggle('mining-mode', enabled);
  miningGame.inert = !enabled;
  miningGame.setAttribute('aria-hidden', String(!enabled));
  clearMiningTimers();
  if (!enabled) return;
  stopGenshinOutsideMain();
  isAdventureMenuOpen = false; document.body.classList.remove('adventure-menu-open'); adventureMenu.inert = true;
  setFeedingMode(false); setInteractionMode(false); setSingingMode(false); setRpsMode(false); setBallMode(false); setCatchMode(false);
  walking = false; pet.classList.remove('walking');
  miningPenguin.style.left = '13%'; miningPenguin.style.top = '72%';
  miningResult.className = 'mining-result'; renderMiningRocks();
  if (miningIsTired()) {
    miningPickStatus.textContent = '飽食度不足';
    showMiningTiredAndExit();
    return;
  }
  chooseMiningPick();
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
  if (!isMiningMode || !miningPick) return;
  if (miningIsTired()) { showMiningTiredAndExit(); return; }
  rock.classList.add('is-breaking');
  const gotStone = Math.random() < miningPick.chance;
  window.setTimeout(() => {
    if (!isMiningMode) return;
    rock.classList.remove('is-breaking');
    if (gotStone) {
      foodInventory.stone = Math.min(FOOD_MAX_QUANTITY, foodInventory.stone + 1); saveFoodInventory(); updateFoodPicker();
      hunger = Math.max(0, hunger - MINING_HUNGER_COST); renderHunger();
      showMiningResult('挖到石頭了！', 'is-success');
      if (miningIsTired()) showMiningTiredAndExit(950);
    } else showMiningResult('鎬子太爛\n挖到滾木了', 'is-fail');
  }, 430);
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

function setHideAndSeekMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isRpsResolving)) return;
  isHideAndSeekMode = enabled;
  document.body.classList.toggle('hide-and-seek-mode', enabled);
  if (enabled) hideAndSeekGame.removeAttribute('inert');
  else hideAndSeekGame.setAttribute('inert', '');
  hideAndSeekGame.setAttribute('aria-hidden', String(!enabled));
  if (!enabled) {
    resetHideGameBoard();
    return;
  }
  stopGenshinOutsideMain();
  setInteractionMode(false);
  setFeedingMode(false);
  setSingingMode(false);
  setRpsMode(false);
  setBallMode(false);
  setCatchMode(false);
  setAdventureMenu(false);
  walking = false;
  pet.classList.remove('walking');
  unlockGameSounds();
  resetHideGameBoard();
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
  saveFoodInventory();
  updateFoodPicker();
  foodCollectedDuringJump = feedingJumpActive;
  hunger = Math.min(MAX_HUNGER, hunger + (isStone ? STONE_HUNGER_GAIN : FEED_HUNGER_GAIN));
  affection = Math.min(MAX_AFFECTION, affection + (isStone ? STONE_AFFECTION_GAIN : FEED_AFFECTION_GAIN));
  renderHunger();
  renderAffection();
  removeActiveFood();
  resetMoralSoundSequence(true);
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
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
  window.setTimeout(tryCollectFood, 300);
  window.setTimeout(() => {
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
  if (isFeedingMode || isSingingMode || isRpsMode || isRpsResolving || isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('jumping') || pet.classList.contains('crazy-flying')) return;
  const maxPosition = Math.max(8, ((window.innerWidth - pet.offsetWidth) / window.innerWidth) * 100);
  const next = Math.round(4 + Math.random() * Math.max(0, maxPosition - 8));
  pet.classList.toggle('facing-left', next < position);
  position = next;
  walking = true;
  pet.classList.add('walking');
  pet.style.left = `${position}%`;
  maybePlayGenshinSound(getMinuteCloudCount());
  window.setTimeout(() => { walking = false; pet.classList.remove('walking'); }, 1250);
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
  if (walkTimer === undefined) return;
  window.clearTimeout(walkTimer);
  walkTimer = undefined;
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
  if (isFeedingMode || isSingingMode || isRpsMode || isRpsResolving || isSettingsOpen() || isDead) return;
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
    sound.bufferPromise = fetch(sound.element.src, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((audioData) => audioContext.decodeAudioData(audioData))
      .then((buffer) => {
        sound.buffer = buffer;
        return buffer;
      })
      .catch(() => null);
  }
  return sound.bufferPromise;
}

function startSoundBuffer(sound, onEnded) {
  const source = audioContext.createBufferSource();
  const startedAt = audioContext.currentTime;
  source.buffer = sound.buffer;
  source.connect(masterGainNode);
  sound.sources.add(source);
  source.addEventListener('ended', () => {
    sound.sources.delete(source);
    if (sound === singingSound && sound.sources.size === 0) stopSingingWaveAnimation();
    onEnded?.();
  }, { once: true });
  source.start();
  if (sound === singingSound) {
    startSingingWaveAnimation(() => audioContext.currentTime - startedAt);
  }
}

function playSoundBuffer(sound, onEnded) {
  if (!audioContext || !sound.buffer) return false;
  if (audioContext.state !== 'running') {
    audioContext.resume()
      .then(() => {
        if (sound === singingSound && !isSingingMode) return;
        if (audioContext.state === 'running') startSoundBuffer(sound, onEnded);
        else playSoundFallback(sound, onEnded);
      })
      .catch(() => playSoundFallback(sound, onEnded));
    return true;
  }
  startSoundBuffer(sound, onEnded);
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

function unlockSound(sound) {
  if (AudioContextClass) {
    primeAudioContext();
    loadSoundBuffer(sound);
  }
  if (sound.unlocked || sound.unlocking) return;
  sound.unlocking = true;
  sound.element.muted = true;
  sound.element.play()
    .then(() => {
      sound.element.pause();
      sound.element.currentTime = 0;
      sound.element.muted = false;
      sound.unlocked = true;
    })
    .catch(() => {
      sound.element.muted = false;
    })
    .finally(() => { sound.unlocking = false; });
}

function unlockGameSounds() {
  if (gameAudioActivated) {
    if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
    return;
  }
  gameAudioActivated = true;
  unlockSound(hurtSound);
  unlockSound(landingSound);
  unlockSound(screamSound);
  unlockSound(deathSound);
  unlockSound(deathNoteSound);
  unlockSound(moralSound);
  unlockSound(genshinSound);
  unlockSound(singingSound);
  unlockSound(penguinWinSound);
  if (genshinSoundPending && canPlayGenshinSound()) {
    genshinSoundPending = false;
    genshinSoundPlayed = true;
    window.setTimeout(() => playGenshinSoundWithCloudLock(), 0);
  } else if (genshinSoundPending) {
    genshinSoundPending = false;
  }
}

document.addEventListener('pointerdown', unlockGameSounds, { capture: true });
document.addEventListener('touchstart', unlockGameSounds, { capture: true, passive: true });

function playSoundFallback(sound, onEnded) {
  let completed = false;
  const complete = () => {
    if (completed) return;
    completed = true;
    sound.element.removeEventListener('ended', complete);
    if (sound === singingSound) stopSingingWaveAnimation();
    onEnded?.();
  };
  if (onEnded) sound.element.addEventListener('ended', complete, { once: true });
  sound.element.muted = false;
  sound.element.currentTime = 0;
  sound.element.play()
    .then(() => {
      if (sound === singingSound) startSingingWaveAnimation(() => sound.element.currentTime);
    })
    .catch(complete);
}

function playSound(sound, onEnded) {
  if (playSoundBuffer(sound, onEnded)) return;
  if (AudioContextClass) {
    loadSoundBuffer(sound).then((buffer) => {
      if (sound === singingSound && !isSingingMode) return;
      if (buffer) playSoundBuffer(sound, onEnded);
      else playSoundFallback(sound, onEnded);
    });
    return;
  }
  playSoundFallback(sound, onEnded);
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
  if (!playSoundBuffer(screamSound, onEnded)) playSoundFallback(screamSound, onEnded);
}

function stopSound(sound) {
  sound.sources.forEach((source) => {
    try { source.stop(); } catch {}
  });
  sound.sources.clear();
  sound.element.pause();
  sound.element.currentTime = 0;
  if (sound === singingSound) stopSingingWaveAnimation();
}

function triggerDeath(cause = '企鵝失去了所有血量') {
  if (isDead) return;
  isDead = true;
  stopGenshinOutsideMain();
  setCatchMode(false);
  setHideAndSeekMode(false);
  setFeedingMode(false);
  setSingingMode(false);
  setRpsMode(false);
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
      restartButton.focus();
    }, DEATH_SCREEN_DELAY);
  };
  pet.addEventListener('animationstart', syncScreamWithJumpscare);
  window.setTimeout(() => {
    if (isDead) pet.classList.add('death-jumpscare');
  }, DEATH_RED_FLASH_DELAY);
}

function restartGame() {
  setHideAndSeekMode(false);
  setFeedingMode(false);
  setSingingMode(false);
  isDead = false;
  isDragging = false;
  isFalling = false;
  suppressNextClick = false;
  clickCount = 0;
  health = MAX_HEALTH;
  hunger = 6;
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
}

function showHurtEffect(damage, cause, visualTarget = pet) {
  if (isDead) return;
  health = Math.max(0, health - damage);
  affection = Math.max(0, affection - damage * AFFECTION_LOSS_PER_DAMAGE);
  renderHealth();
  renderAffection();
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
      window.requestAnimationFrame(step);
      return;
    }
    finishFall(fallDistance);
  };
  window.requestAnimationFrame(step);
}

function healFromFullHunger() {
  if (isFeedingMode || isSettingsOpen() || isDead || hunger < MAX_HUNGER || health >= MAX_HEALTH) return;
  health = Math.min(MAX_HEALTH, health + HEAL_AMOUNT);
  hunger = Math.max(0, hunger - HEAL_HUNGER_COST);
  renderHealth();
  renderHunger();
}

pet.addEventListener('pointerdown', (event) => {
  if (isFeedingMode || isSingingMode || isRpsMode || isRpsResolving || isHideAndSeekMode || isSettingsOpen() || isDead || isFalling || pet.classList.contains('jumping') || pet.classList.contains('spinning') || pet.classList.contains('crazy-flying')) return;
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

updateDayNightFromBrowserTime();
updateCloudsFromClock();
window.setInterval(updateDayNightFromBrowserTime, 60_000);
scheduleNextCloudUpdate();
window.setInterval(healFromFullHunger, FULL_HUNGER_HEAL_INTERVAL);
scheduleWalk();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopFeedingBehaviorLoop();
    stopScheduledWalk();
    return;
  }
  updateDayNightFromBrowserTime();
  if (isFeedingMode) startFeedingBehaviorLoop();
  scheduleWalk();
});

// Game feature controls.
function openAdventureMenu(event) {
  if (event?.cancelable) event.preventDefault();
  setAdventureMenu(true);
}
adventureButton.addEventListener('click', openAdventureMenu);
// Start on press so mobile browsers do not lose the click when the menu layer opens.
adventureButton.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse') openAdventureMenu(event);
});
adventureButton.addEventListener('touchstart', openAdventureMenu, { passive: false });
closeAdventureMenuButton.addEventListener('click', () => setAdventureMenu(false));
adventureMenu.querySelector('[data-adventure-game="catch"]').addEventListener('click', () => setCatchMode(true));
adventureMenu.querySelector('[data-adventure-game="mining"]').addEventListener('click', () => setMiningMode(true));
closeCatchGameButton.addEventListener('click', () => {
  settleCatchRewards();
  setCatchMode(false);
  setAdventureMenu(true);
});
closeMiningGameButton.addEventListener('click', () => { setMiningMode(false); setAdventureMenu(true); });

miningField.addEventListener('pointerdown', (event) => {
  if (!isMiningMode || event.target.closest('.mining-toolbar')) return;
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
// Start on press: mobile Safari may lose the release event when the menu closes.
ballButton.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse') openBallGame(event);
});
ballButton.addEventListener('touchstart', openBallGame, { passive: false });
closeBallGameButton.addEventListener('click', () => setBallMode(false));
closeHideGameButton.addEventListener('click', () => setHideAndSeekMode(false));
startHideGameButton.addEventListener('click', beginHideAndSeekRound);
hidePenguin.addEventListener('click', () => finishHideAndSeekRound(true));
hidePenguinHit.addEventListener('click', () => finishHideAndSeekRound(true));
endRpsButton.addEventListener('click', () => {
  if (!isRpsResolving) setRpsMode(false);
});
rpsChoiceButtons.forEach((button) => {
  button.addEventListener('click', () => playRpsRound(button.dataset.rpsChoice));
});

cancelSingingButton.addEventListener('click', () => {
  setSingingMode(false);
});

singingSongButton.addEventListener('click', playSingingSong);

foodPicker.querySelectorAll('[data-food-type]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => prepareFoodPointerDrag(button.dataset.foodType, event));
  button.addEventListener('touchstart', (event) => prepareFoodTouchDrag(button.dataset.foodType, event), { passive: false });
});
updateFoodPicker();

restartButton.addEventListener('click', restartGame);

renderHealth();
renderHunger();
renderAffection();
