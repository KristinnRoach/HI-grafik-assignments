// main.js

import { initGrid, updateGrid, endReason } from './game-logic.js';
import { setupEventListeners, isDragging } from './event-handlers.js';
import * as camera from './camera.js';
import { game, updateHud, gameOver, togglePause } from './game-state.js';
import { initRenderer, render, effects } from './renderer.js';
import {
  applyPattern,
  setHtmlValues,
  setupControls,
  resetGameState,
  restartGame,
} from './ui.js';

function init() {
  applyPattern(game.pattern); // the saved pattern needs its rules before they fill the boxes
  setHtmlValues();
  setupControls();

  const canvas = initRenderer();
  const restart = () => {
    resetGameState();
    restartGame();
  };
  setupEventListeners(canvas, restart);
  // Blur so a later space press doesn't also click the focused button
  document.getElementById('restart').addEventListener('click', (e) => {
    e.currentTarget.blur();
    restart();
  });
  document.getElementById('play-pause').addEventListener('click', (e) => {
    e.currentTarget.blur();
    togglePause();
  });

  initGrid(game.pattern);
  updateHud();
  requestAnimationFrame(gameLoop);
}

window.onload = init;

let lastTimestamp = 0;
let lastFrame = 0;

function gameLoop(timestamp) {
  const msPerFrame = 1000 / game.fps;
  const elapsed = timestamp - lastTimestamp;
  const running = !game.isOver && !game.isPaused;

  // Simulation steps at game.fps
  if (elapsed >= msPerFrame) {
    lastTimestamp = timestamp - (elapsed % msPerFrame);
    if (running) {
      updateGrid();
      game.tweenStart = lastTimestamp;
      const reason = endReason();
      if (reason) gameOver(reason);
    }
    updateHud();
  }

  // Auto-orbit and drag momentum. Clamp dt so a backgrounded tab doesn't jump
  const dt = Math.min(timestamp - lastFrame, 100) / 1000;
  lastFrame = timestamp;
  camera.tick(dt, isDragging);

  // Render every display frame so the orbit is smooth; tween interpolates between steps and after clicks
  render(effects.tween ? (timestamp - game.tweenStart) / msPerFrame : 1);

  requestAnimationFrame(gameLoop);
}
