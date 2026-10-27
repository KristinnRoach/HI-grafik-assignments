// main.js

import { initGrid, updateGrid, endReason } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game, updateHud, gameOver } from './game-state.js';
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
    game.isPaused = !game.isPaused;
    updateHud();
  });

  initGrid(game.pattern);
  updateHud();
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
