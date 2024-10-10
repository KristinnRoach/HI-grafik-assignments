// game-state.js

import { initGrid, updateGrid } from './game-logic.js';
import { gameLoop, getHtmlValues, setHtmlValues, setFPS } from './main.js';

export const game = {
  currentGrid: [],
  nextGrid: [],
  activeCells: 0,
  gridScale: 8, // TODO: Implement grid scaling
  cellScale: 0.5,
  dimensions: [33, 33, 33],

  rules: {
    birth: [5, 7],
    survival: [2, 4, 7],
  },

  isPaused: false,
  wrapping: false,

  pattern: 'random', // glider

  fps: 12, // speed

  shape: 'cube', // or sphere

  boundariesKill: false,

  isOver: false,
};

function interpolate(start, end, factor) {
  return start + (end - start) * factor;
}

export function gameOver(reason) {
  console.log('game over', reason);

  if (reason === 'overPopulated') {
    // setFPS(16);
    game.rules.birth = [6, -1];
    game.rules.survival = [15, 20, 10];
    game.cellScale = interpolate(game.cellScale, 150.0, 0.0005); // ??
  }

  // game.rules.birth = [6, 9];
  // game.rules.survival = [6, 10, 15];

  // game.rules.birth = [0, 1];
  // game.rules.survival = [12, 12, 12];
  // game.cellScale = interpolate(game.cellScale, 100.0, 0.001);

  if (game.cellScale < 0.01 || game.cellScale > 100.0 || game.activeCells < 1) {
    resetGameState();
  }
}

export function resetGameState() {
  game.isPaused = true;
  game.isOver = true;

  game.cellScale = 0.5;

  const { fps, pattern, birth, survival } = getHtmlValues();
  // setFPS(fps);
  game.pattern = pattern;
  game.rules.birth = birth;
  game.rules.survival = survival;

  game.nextGrid = [];
  game.currentGrid = [];
  game.activeCells = 0;
  setHtmlValues();

  game.isOver = false;

  console.log('reset game state', game.rules);
}

export function restartGame() {
  game.isGameOver = false;
  game.isPaused = false;

  initGrid(game.pattern);

  console.log(game);
  gameLoop();
}

export function setStartPattern(pattern) {
  game.pattern = pattern;
}

export function togglePause() {
  game.isPaused = !game.isPaused;
}

export function toggleWrapping() {
  game.wrapping = !game.wrapping;
}

export function setGenInterval(interval) {
  game.genInterval = interval;
}

export function setGridDimensions(dimensions) {
  game.dimensions = dimensions;
}

export function setRule(value, rule) {
  switch (rule) {
    case 'birth-1':
      game.rules.birth[0] = value;
      break;
    case 'birth-2':
      game.rules.birth[1] = value;
      break;
    case 'survival-1':
      game.rules.survival[0] = value;
      break;
    case 'survival-2':
      game.rules.survival[1] = value;
      break;
    case 'survival-3':
      game.rules.survival[2] = value;
      break;
  }
}

export function setGridScale(scale) {
  game.gridScale = scale;
}

export function setCellScale(scale) {
  game.cellScale = scale;
}

export function clearGrid() {
  game.currentGrid = Array(game.dimensions[0])
    .fill(0)
    .map(() =>
      Array(game.dimensions[1])
        .fill(0)
        .map(() => Array(game.dimensions[2]).fill(0))
    );

  game.activeCells = 0;
}

export function randomizeGrid() {
  game.currentGrid = game.currentGrid.map((x) =>
    x.map((y) => y.map(() => (Math.random() < 0.5 ? 0 : 1)))
  );

  game.activeCells = game.currentGrid
    .flat(3)
    .filter((cell) => cell === 1).length;
}
