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
const interactButton = document.querySelector('#interact-button');
const interactButtonLabel = document.querySelector('#interact-button-label');
const interactionPicker = document.querySelector('#interaction-picker');
const singingButton = document.querySelector('#singing-button');
const singingPicker = document.querySelector('#singing-picker');
const cancelSingingButton = document.querySelector('#cancel-singing-button');
const singingSongButton = document.querySelector('#singing-song-button');
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
const normalPetImageSource = petImage.getAttribute('src');
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
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext;
let masterGainNode;
let audioContextPrimed = false;
let gameAudioActivated = false;
let genshinSoundPending = false;
let genshinSoundPlayed = false;
let lockedCloudCount = null;
const VOLUME_STORAGE_KEY = 'gugagame-web-volume';

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
const gameSounds = [hurtSound, landingSound, screamSound, deathSound, deathNoteSound, moralSound, genshinSound, singingSound];
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
const USE_IOS_TOUCH_DRAG = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let debugCloudCount = null;

function getMinuteCloudCount(date = new Date()) {
  return date.getMinutes() % 10;
}

function isSettingsOpen() {
  return document.body.classList.contains('settings-open');
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

  if (count === 9 && !genshinSoundPlayed && !genshinSoundPending) {
    if (gameAudioActivated) {
      genshinSoundPlayed = true;
      playGenshinSoundWithCloudLock(count);
    } else {
      genshinSoundPending = true;
    }
  } else if (count !== 9) {
    genshinSoundPending = false;
  }
}

function playGenshinSoundWithCloudLock(count = cloudLayer.childElementCount) {
  lockedCloudCount = count;
  playSound(genshinSound, () => {
    lockedCloudCount = null;
    updateCloudsFromClock();
  });
}

function updateCloudsFromClock() {
  const now = new Date();
  const count = debugCloudCount ?? getMinuteCloudCount(now);
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
    setFeedingMode(false);
    setInteractionMode(false);
    setSingingMode(false);
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
  document.querySelector('meta[name="theme-color"]').content = isNight ? '#263f76' : '#80d2ef';
}

function renderHunger() {
  const meter = document.querySelector('.hunger');
  const fill = document.querySelector('.hunger-fill');
  const percentage = (hunger / MAX_HUNGER) * 100;
  fill.style.width = `${percentage}%`;
  meter.setAttribute('aria-label', `飽食度：${percentage}%`);
}

function renderHealth() {
  const meter = document.querySelector('.health');
  const fill = document.querySelector('.health-fill');
  const percentage = (health / MAX_HEALTH) * 100;
  fill.style.width = `${percentage}%`;
  meter.setAttribute('aria-label', `血量：${percentage}%`);
}

function renderAffection() {
  const meter = document.querySelector('.affection');
  const fill = document.querySelector('.affection-fill');
  fill.style.width = `${affection}%`;
  meter.setAttribute('aria-label', `好感度：${affection}%`);
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
  food.classList.remove('falling');
  food.classList.add('landed');
  const lifetime = food.dataset.foodType === 'stone'
    ? STONE_GROUND_LIFETIME_MS
    : FOOD_GROUND_FADE_DELAY_MS + FOOD_GROUND_FADE_DURATION_MS;
  foodGroundTimer = window.setTimeout(() => {
    if (activeFood === food && foodDragPointerId === null) removeActiveFood();
  }, lifetime);
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
    if (clickTimer) {
      window.clearTimeout(clickTimer);
      clickTimer = undefined;
      clickCount = 0;
    }
    walking = false;
    pet.classList.remove('walking');
    unlockGameSounds();
    return;
  }

  removeActiveFood();
  pendingFoodDrag = null;
  feedingJumpActive = false;
  foodCollectedDuringJump = false;
  resetMoralSoundSequence(true);
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
}

function setInteractionMode(enabled) {
  if (enabled && (isSettingsOpen() || isDead || isFeedingMode)) return;
  if (enabled) setSingingMode(false);
  isInteractionMode = enabled;
  document.body.classList.toggle('interaction-mode', enabled);
  interactionPicker.inert = !enabled;
  interactionPicker.setAttribute('aria-hidden', String(!enabled));
  interactButton.setAttribute('aria-pressed', String(enabled));
  interactButton.setAttribute('aria-label', enabled ? '結束互動選單' : '與企鵝互動');
  interactButtonLabel.textContent = enabled ? '取消互動' : '互動';
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
  petImage.src = enabled ? 'assets/gugugaga-sing.png' : normalPetImageSource;
  petImage.alt = enabled ? '唱歌中的企鵝' : '企鵝';
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
  if (!isFeedingMode || isSettingsOpen() || isDead) return;
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

function movePenguin() {
  if (isFeedingMode || isSingingMode || isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('jumping') || pet.classList.contains('crazy-flying')) return;
  const maxPosition = Math.max(8, ((window.innerWidth - pet.offsetWidth) / window.innerWidth) * 100);
  const next = Math.round(4 + Math.random() * Math.max(0, maxPosition - 8));
  pet.classList.toggle('facing-left', next < position);
  position = next;
  walking = true;
  pet.classList.add('walking');
  pet.style.left = `${position}%`;
  window.setTimeout(() => { walking = false; pet.classList.remove('walking'); }, 1250);
}

function scheduleWalk() {
  window.setTimeout(() => {
    movePenguin();
    scheduleWalk();
  }, 1800 + Math.random() * 3600);
}

function jump() {
  if (isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('jumping')) return;
  pet.classList.remove('walking');
  pet.classList.add('jumping');
  window.setTimeout(() => {
    if (isDead) return;
    pet.classList.remove('jumping');
    playLandingSound();
  }, 620);
}

function spin() {
  if (isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('crazy-flying')) return;
  pet.classList.remove('walking');
  pet.classList.add('spinning');
  window.setTimeout(() => pet.classList.remove('spinning'), 720);
}

function crazyFly() {
  if (isSettingsOpen() || isDead || isDragging || isFalling) return;
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
  if (isFeedingMode || isSingingMode || isSettingsOpen() || isDead) return;
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
  gameAudioActivated = true;
  unlockSound(hurtSound);
  unlockSound(landingSound);
  unlockSound(screamSound);
  unlockSound(deathSound);
  unlockSound(deathNoteSound);
  unlockSound(moralSound);
  unlockSound(genshinSound);
  unlockSound(singingSound);
  if (genshinSoundPending) {
    genshinSoundPending = false;
    genshinSoundPlayed = true;
    window.setTimeout(() => playGenshinSoundWithCloudLock(), 0);
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
  setFeedingMode(false);
  setSingingMode(false);
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

function showHurtEffect(damage, cause) {
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
  pet.classList.remove('hurt');
  void pet.offsetWidth;
  pet.classList.add('hurt');
  window.setTimeout(() => pet.classList.remove('hurt'), 650);
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
  if (isFeedingMode || isSingingMode || isSettingsOpen() || isDead || isFalling || pet.classList.contains('jumping') || pet.classList.contains('spinning') || pet.classList.contains('crazy-flying')) return;
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
window.setInterval(updateFeedingBehavior, FEEDING_TICK_MS);
scheduleWalk();

// Game feature controls.
feedButton.addEventListener('click', () => {
  if (isSettingsOpen() || isDead) return;
  setInteractionMode(false);
  setFeedingMode(!isFeedingMode);
});

interactButton.addEventListener('click', () => {
  if (isSettingsOpen() || isDead) return;
  setFeedingMode(false);
  setInteractionMode(!isInteractionMode);
});

singingButton.addEventListener('click', () => {
  setInteractionMode(false);
  setSingingMode(true);
});

cancelSingingButton.addEventListener('click', () => {
  setSingingMode(false);
});

singingSongButton.addEventListener('click', playSingingSong);

foodPicker.querySelectorAll('[data-food-type]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => prepareFoodPointerDrag(button.dataset.foodType, event));
  button.addEventListener('touchstart', (event) => prepareFoodTouchDrag(button.dataset.foodType, event), { passive: false });
});

// ===== DEBUG ONLY — isolated visual-preview control; not part of game behaviour. =====
(() => {
  const debugButton = document.querySelector('#debug-day-night');
  const debugHurtButton = document.querySelector('#debug-hurt');
  const debugFullHungerButton = document.querySelector('#debug-full-hunger');
  const debugCloudCountButton = document.querySelector('#debug-cloud-count');
  const debugDeathButton = document.querySelector('#debug-death');
  let previewNight = document.body.classList.contains('is-night');
  debugButton.addEventListener('click', () => {
    previewNight = !previewNight;
    document.body.classList.toggle('debug-force-night', previewNight);
    document.body.classList.toggle('debug-force-day', !previewNight);
    debugButton.textContent = previewNight ? '切換至白天預覽' : '切換至夜晚預覽';
  });
  debugHurtButton.addEventListener('click', () => {
    unlockGameSounds();
    showHurtEffect(HEALTH_UNIT);
  });
  debugFullHungerButton.addEventListener('click', () => {
    hunger = MAX_HUNGER;
    renderHunger();
    healFromFullHunger();
  });
  debugCloudCountButton.addEventListener('click', () => {
    const currentCount = debugCloudCount ?? cloudLayer.childElementCount;
    debugCloudCount = (currentCount + 1) % 10;
    renderClouds(debugCloudCount);
    debugCloudCountButton.textContent = `改雲數量：${debugCloudCount}`;
  });
  debugDeathButton.addEventListener('click', () => {
    unlockGameSounds();
    health = 0;
    renderHealth();
    triggerDeath('調試專區觸發了死亡');
  });
})();

restartButton.addEventListener('click', restartGame);

renderHealth();
renderHunger();
renderAffection();
