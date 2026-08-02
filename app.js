const pet = document.querySelector('#pet');
const grass = document.querySelector('.grass');
const world = document.querySelector('.world');
const deathScreen = document.querySelector('#death-screen');
const deathCause = document.querySelector('#death-cause');
const restartButton = document.querySelector('#restart-button');
let position = 42;
let walking = false;
let clickTimer;
let health = 5;
let hunger = 3;
let affection = 40;
let isDragging = false;
let isFalling = false;
let isDead = false;
let suppressNextClick = false;
let dragStartX = 0;
let dragStartY = 0;
let petStartLeft = 0;
let petStartTop = 0;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext;

function createSound(path) {
  const element = new Audio(path);
  element.preload = 'auto';
  return { element, buffer: null, bufferPromise: null, unlocked: false, sources: new Set() };
}

const hurtSound = createSound('audio/痾啊.wav');
const landingSound = createSound('audio/落地.wav');
const screamSound = createSound('audio/咿.wav');
const deathSound = createSound('audio/死亡音效.wav');

const MAX_HEALTH = 5;
const MAX_HUNGER = 5;
const MAX_AFFECTION = 100;
const FALL_GRAVITY = 1900;
const SAFE_FALL_HEIGHT = 120;
const FALL_DAMAGE_HEIGHT_STEP = 100;
const MAX_FALL_DAMAGE = MAX_HEALTH;
const FULL_HUNGER_HEAL_INTERVAL = 3000;
const FEED_AFFECTION_GAIN = 12;
const AFFECTION_LOSS_PER_DAMAGE = 10;
const DEATH_SCREEN_DELAY = 500;

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

function movePenguin() {
  if (isDead || isDragging || isFalling || pet.classList.contains('jumping')) return;
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
  if (isDead || isDragging || isFalling || pet.classList.contains('jumping')) return;
  pet.classList.remove('walking');
  pet.classList.add('jumping');
  window.setTimeout(() => {
    if (isDead) return;
    pet.classList.remove('jumping');
    playLandingSound();
  }, 620);
}

function spin() {
  if (isDead || isDragging || isFalling) return;
  pet.classList.remove('walking');
  pet.classList.add('spinning');
  window.setTimeout(() => pet.classList.remove('spinning'), 720);
}

pet.addEventListener('click', () => {
  if (isDead) return;
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  if (pet.classList.contains('jumping') || pet.classList.contains('spinning')) return;
  if (clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = undefined;
    spin();
    return;
  }
  clickTimer = window.setTimeout(() => {
    clickTimer = undefined;
    jump();
  }, 250);
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

function playSoundBuffer(sound) {
  if (!audioContext || !sound.buffer) return false;
  const source = audioContext.createBufferSource();
  source.buffer = sound.buffer;
  source.connect(audioContext.destination);
  sound.sources.add(source);
  source.addEventListener('ended', () => sound.sources.delete(source), { once: true });
  source.start();
  return true;
}

function unlockSound(sound) {
  if (AudioContextClass) {
    if (!audioContext) audioContext = new AudioContextClass();
    audioContext.resume().catch(() => {});
    loadSoundBuffer(sound);
  }
  if (sound.unlocked) return;
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
    });
}

function unlockGameSounds() {
  unlockSound(hurtSound);
  unlockSound(landingSound);
  unlockSound(screamSound);
  unlockSound(deathSound);
}

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
  isDragging = false;
  isFalling = false;
  walking = false;
  suppressNextClick = true;
  if (clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = undefined;
  }
  pet.classList.remove('walking', 'facing-left', 'jumping', 'spinning', 'dragging', 'falling', 'hurt');
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
  pet.classList.add('death-jumpscare');
}

function restartGame() {
  isDead = false;
  isDragging = false;
  isFalling = false;
  suppressNextClick = false;
  health = MAX_HEALTH;
  hunger = 3;
  position = 42;
  stopSound(screamSound);
  stopSound(deathSound);
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
  const damage = Math.floor((fallDistance - SAFE_FALL_HEIGHT) / FALL_DAMAGE_HEIGHT_STEP) + 1;
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
  if (isDead || hunger < MAX_HUNGER || health >= MAX_HEALTH) return;
  health = Math.min(MAX_HEALTH, health + 1);
  renderHealth();
}

pet.addEventListener('pointerdown', (event) => {
  if (isDead || isFalling || pet.classList.contains('jumping') || pet.classList.contains('spinning')) return;
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
window.setInterval(updateDayNightFromBrowserTime, 60_000);
window.setInterval(healFromFullHunger, FULL_HUNGER_HEAL_INTERVAL);
scheduleWalk();

// Game feature controls.
(() => {
  const feedButton = document.querySelector('#feed-button');
  feedButton.addEventListener('click', () => {
    if (isDead) return;
    hunger = Math.min(MAX_HUNGER, hunger + 1);
    affection = Math.min(MAX_AFFECTION, affection + FEED_AFFECTION_GAIN);
    renderHunger();
    renderAffection();
  });
})();

// ===== DEBUG ONLY — isolated visual-preview control; not part of game behaviour. =====
(() => {
  const debugButton = document.querySelector('#debug-day-night');
  const debugHurtButton = document.querySelector('#debug-hurt');
  const debugFullHungerButton = document.querySelector('#debug-full-hunger');
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
    showHurtEffect(1);
  });
  debugFullHungerButton.addEventListener('click', () => {
    hunger = MAX_HUNGER;
    renderHunger();
    healFromFullHunger();
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
