/*
 * TEST-ONLY MODULE: debug tools controller.
 * Keep DOM queries and debug event handling here, outside the production game logic.
 */
(function registerDebugTools(global) {
  'use strict';

  const requiredSelectors = {
    dayNightButton: '#debug-day-night',
    hurtButton: '#debug-hurt',
    fullHungerButton: '#debug-full-hunger',
    cloudCountButton: '#debug-cloud-count',
    deathButton: '#debug-death',
    foodType: '#debug-food-type',
    foodAmount: '#debug-food-amount',
    foodApplyButton: '#debug-food-apply',
    foodClearButton: '#debug-food-clear',
  };

  function collectControls(root) {
    return Object.fromEntries(
      Object.entries(requiredSelectors).map(([name, selector]) => [name, root.querySelector(selector)]),
    );
  }

  function hasAllControls(controls) {
    return Object.values(controls).every(Boolean);
  }

  function init(api) {
    if (!api?.root) return false;

    const controls = collectControls(api.root);
    if (!hasAllControls(controls)) {
      console.warn('[debug-tools] Initialization skipped: required controls are missing.');
      return false;
    }

    let previewNight = api.isNight();
    controls.dayNightButton.addEventListener('click', () => {
      previewNight = !previewNight;
      api.setNightPreview(previewNight);
      controls.dayNightButton.textContent = previewNight ? '切換至白天預覽' : '切換至夜晚預覽';
    });
    controls.hurtButton.addEventListener('click', api.hurt);
    controls.fullHungerButton.addEventListener('click', api.fillHunger);
    controls.cloudCountButton.addEventListener('click', () => {
      const count = api.cycleCloudCount();
      controls.cloudCountButton.textContent = `改雲數量：${count}`;
    });
    controls.deathButton.addEventListener('click', api.kill);
    controls.foodApplyButton.addEventListener('click', () => {
      const amount = Number.parseInt(controls.foodAmount.value.trim(), 10);
      if (!Number.isInteger(amount) || amount === 0) return;
      api.adjustFood(controls.foodType.value, amount);
    });
    controls.foodClearButton.addEventListener('click', () => api.clearFood(controls.foodType.value));
    return true;
  }

  global.GugaDebugTools = Object.freeze({ init });
})(window);
