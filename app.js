const pet = document.querySelector('#pet');
let position = 42;
let walking = false;
let clickTimer;
let hunger = 3;
let affection = 2;

// Production feature: derive the scene from the browser's local time.
function updateDayNightFromBrowserTime() {
  const hour = new Date().getHours();
  document.body.classList.toggle('is-night', hour < 6 || hour >= 18);
}

function renderHunger() {
  document.querySelectorAll('[data-hunger-icon]').forEach((icon, index) => {
    icon.classList.toggle('is-empty', index >= hunger);
  });
}

function renderAffection() {
  document.querySelectorAll('[data-affection-icon]').forEach((icon, index) => {
    icon.classList.toggle('is-empty', index >= affection);
  });
}

function movePenguin() {
  if (pet.classList.contains('jumping')) return;
  const next = Math.round(8 + Math.random() * 72);
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
  if (pet.classList.contains('jumping')) return;
  pet.classList.remove('walking');
  pet.classList.add('jumping');
  window.setTimeout(() => pet.classList.remove('jumping'), 620);
}

function spin() {
  pet.classList.remove('walking');
  pet.classList.add('spinning');
  window.setTimeout(() => pet.classList.remove('spinning'), 720);
}

pet.addEventListener('click', () => {
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

updateDayNightFromBrowserTime();
window.setInterval(updateDayNightFromBrowserTime, 60_000);
scheduleWalk();

// Game feature controls.
(() => {
  const feedButton = document.querySelector('#feed-button');
  feedButton.addEventListener('click', () => {
    hunger = Math.min(5, hunger + 1);
    affection = Math.min(5, affection + 1);
    renderHunger();
    renderAffection();
  });
})();

// ===== DEBUG ONLY — isolated visual-preview control; not part of game behaviour. =====
(() => {
  const debugButton = document.querySelector('#debug-day-night');
  let previewNight = document.body.classList.contains('is-night');
  debugButton.addEventListener('click', () => {
    previewNight = !previewNight;
    document.body.classList.toggle('debug-force-night', previewNight);
    document.body.classList.toggle('debug-force-day', !previewNight);
    debugButton.textContent = previewNight ? '切換至白天預覽' : '切換至夜晚預覽';
  });
})();

renderHunger();
renderAffection();
