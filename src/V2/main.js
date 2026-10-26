// main.js

import { initGrid, updateGrid, endReason } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game, updateHud, gameOver } from './game-state.js';
import { initRenderer, render, effects } from './renderer.js';
import {
  setHtmlValues,
  setupControls,
  resetGameState,
  restartGame,
} from './ui.js';

function init() {
  setHtmlValues();
  setupControls();

  const canvas = initRenderer();
  setupEventListeners(canvas, () => {
    resetGameState();
    restartGame();
  });

  initGrid(game.pattern);
  requestAnimationFrame(gameLoop);
}

window.onload = init;

let lastTimestamp = 0;

function gameLoop(timestamp) {
  const msPerFrame = 1000 / game.fps;
  const elapsed = timestamp - lastTimestamp;
  const running = !game.isOver && !game.isPaused;

  // Simulation steps at game.fps
  if (elapsed >= msPerFrame) {
    lastTimestamp = timestamp - (elapsed % msPerFrame);
    if (running) {
      updateGrid();
      const reason = endReason();
      if (reason) gameOver(reason);
    }
    updateHud();
    if (!effects.tween) render();
  }

  // Tweened rendering runs every display frame, interpolating between steps
  if (effects.tween) {
    render(running ? (timestamp - lastTimestamp) / msPerFrame : 1);
  }

  requestAnimationFrame(gameLoop);
}
