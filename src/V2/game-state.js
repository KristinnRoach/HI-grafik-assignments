// game-state.js

import { initializeGameState } from './game-logic.js';

export const game = {
  currentGrid: [],
  nextGrid: [],
  activeCells: 0,
  gridScale: 10.0,
  cellScale: 0.4,
  dimensions: [33, 33, 33],

  rules: {
    birth: [6],
    survival: [5, 6, 7],
  },

  genInterval: 300, // ms
  isPaused: false,
  wrapping: false,

  startPattern: 'random',
};

export function restartGame() {
  clearGrid();
  initializeGameState(game.startPattern);
}

export function setStartPattern(pattern) {
  game.startPattern = pattern;
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
    case 'birth':
      game.rules.birth = value;
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
