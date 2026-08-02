const pet = document.querySelector('#pet');
const grass = document.querySelector('.grass');
const world = document.querySelector('.world');
const deathScreen = document.querySelector('#death-screen');
const deathCause = document.querySelector('#death-cause');
const restartButton = document.querySelector('#restart-button');
const cloudLayer = document.querySelector('#cloud-layer');
const cloudTemplate = document.querySelector('#cloud-template');
const settingsButton = document.querySelector('#settings-button');
const settingsMenu = document.querySelector('#settings-menu');
const debugPanel = document.querySelector('.debug-panel');
const featurePanel = document.querySelector('.feature-panel');
const feedButton = document.querySelector('#feed-button');
const feedButtonLabel = document.querySelector('#feed-button-label');
const foodPicker = document.querySelector('#food-picker');
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
let lastFeedingJumpAt = 0;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext;
let audioContextPrimed = false;
let gameAudioActivated = false;
let genshinSoundPending = false;
let previousCloudCount = null;

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
const FEEDING_REACH_PADDING = 22;
const FOOD_DRAG_START_DISTANCE = 7;
const FOOD_EAT_DELAY_MS = 1000;
const FOOD_FALL_GRAVITY = 1600;
const FOOD_GROUND_FADE_DELAY_MS = 300;
const FOOD_GROUND_FADE_DURATION_MS = 500;
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

  if (count === 9 && previousCloudCount !== 9) {
    if (gameAudioActivated) playSound(genshinSound);
    else genshinSoundPending = true;
  } else if (count !== 9) {
    genshinSoundPending = false;
  }
  previousCloudCount = count;
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
  if (isOpen) setFeedingMode(false);
  if (isOpen && clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = undefined;
    clickCount = 0;
  }
  pet.disabled = isOpen;
  debugPanel.inert = isOpen;
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

function removeActiveFood() {
  cancelFoodFall();
  if (!activeFood) return;
  activeFood.remove();
  activeFood = null;
  foodDragPointerId = null;
  activeFoodEdibleAt = 0;
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
  foodGroundTimer = window.setTimeout(() => {
    if (activeFood === food && foodDragPointerId === null) removeActiveFood();
  }, FOOD_GROUND_FADE_DELAY_MS + FOOD_GROUND_FADE_DURATION_MS);
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
  missedFeedingJumps = 0;
  pet.classList.remove('feeding-chasing', 'feeding-running-away', 'walking');
  stopSound(moralSound);
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
  const maxTop = grass.getBoundingClientRect().top - activeFood.offsetHeight;
  activeFood.style.left = `${Math.max(0, Math.min(maxLeft, event.clientX - foodDragOffsetX))}px`;
  activeFood.style.top = `${Math.max(0, Math.min(maxTop, event.clientY - foodDragOffsetY))}px`;
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
  missedFeedingJumps = 0;
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
  missedFeedingJumps = 0;
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
    missedFeedingJumps += 1;
    if (missedFeedingJumps < 3) return;
    missedFeedingJumps = 0;
    playSound(moralSound);
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
  if (isFeedingMode || isSettingsOpen() || isDead || isDragging || isFalling || pet.classList.contains('jumping') || pet.classList.contains('crazy-flying')) return;
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
  if (isFeedingMode || isSettingsOpen() || isDead) return;
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
  if (!audioContext) audioContext = new AudioContextClass();
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

function startSoundBuffer(sound) {
  const source = audioContext.createBufferSource();
  source.buffer = sound.buffer;
  source.connect(audioContext.destination);
  sound.sources.add(source);
  source.addEventListener('ended', () => sound.sources.delete(source), { once: true });
  source.start();
}

function playSoundBuffer(sound) {
  if (!audioContext || !sound.buffer) return false;
  if (audioContext.state !== 'running') {
    audioContext.resume()
      .then(() => {
        if (audioContext.state === 'running') startSoundBuffer(sound);
        else playSoundFallback(sound);
      })
      .catch(() => playSoundFallback(sound));
    return true;
  }
  startSoundBuffer(sound);
  return true;
}

function primeAudioContext() {
  if (!AudioContextClass) return;
  if (!audioContext) audioContext = new AudioContextClass();
  audioContext.resume().catch(() => {});
  if (audioContextPrimed) return;
  const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
  const silentSource = audioContext.createBufferSource();
  silentSource.buffer = silentBuffer;
  silentSource.connect(audioContext.destination);
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
  if (genshinSoundPending) {
    genshinSoundPending = false;
    window.setTimeout(() => playSound(genshinSound), 0);
  }
}

document.addEventListener('pointerdown', unlockGameSounds, { capture: true });
document.addEventListener('touchstart', unlockGameSounds, { capture: true, passive: true });

function playSoundFallback(sound) {
  sound.element.muted = false;
  sound.element.currentTime = 0;
  sound.element.play().catch(() => {});
}

function playSound(sound) {
  if (playSoundBuffer(sound)) return;
  if (AudioContextClass) {
    loadSoundBuffer(sound).then((buffer) => {
      if (buffer) playSoundBuffer(sound);
      else playSoundFallback(sound);
    });
    return;
  }
  playSoundFallback(sound);
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

function playScreamSound() {
  if (!playSoundBuffer(screamSound)) playSoundFallback(screamSound);
}

function stopSound(sound) {
  sound.sources.forEach((source) => {
    try { source.stop(); } catch {}
  });
  sound.sources.clear();
  sound.element.pause();
  sound.element.currentTime = 0;
}

function triggerDeath(cause = '企鵝失去了所有血量') {
  if (isDead) return;
  isDead = true;
  setFeedingMode(false);
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
  if (isFeedingMode || isSettingsOpen() || isDead || isFalling || pet.classList.contains('jumping') || pet.classList.contains('spinning') || pet.classList.contains('crazy-flying')) return;
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
  setFeedingMode(!isFeedingMode);
});

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
