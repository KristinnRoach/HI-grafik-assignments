// game-state.js

import { initGrid, updateGrid } from './game-logic.js';

export const game = {
  currentGrid: [],
  nextGrid: [],
  activeCells: 0,
  gridScale: 8,
  cellScale: 0.5,
  dimensions: [33, 33, 33],

  rules: {
    birth: [5, 7],
    survival: [2, 4, 7],
  },

  isPaused: false,
  wrapping: false,

  pattern: 'glider',

  fps: 18, // speed
};

export function restartGame() {
  game.isPaused = true;
  game.nextGrid = [];
  game.currentGrid = [];
  game.activeCells = 0;

  initGrid(game.pattern);

  console.log('rules', game.rules.birth, game.rules.survival);
  console.log('fps', game.fps);
  console.log('pattern', game.pattern);

  // updateGameState();
  game.isPaused = false;
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
