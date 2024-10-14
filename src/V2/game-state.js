// game-state.js

import { initGrid, updateGrid } from './game-logic.js';
import {
  gameLoop,
  initGeoBuffers,
  getHtmlValues,
  setHtmlValues,
  setFPS,
  initGeometry,
} from './main.js';

export const GRID_DIMENSIONS = [75, 75, 75]; // [33, 33, 33];
export const INIT_COUNT_DOWN = 5;

export const game = {
  currentGrid: [],
  nextGrid: [],

  activeCells: 0,
  outOfBoundsCells: 0,

  dimensions: GRID_DIMENSIONS,
  maxCells: GRID_DIMENSIONS[0] * GRID_DIMENSIONS[1] * GRID_DIMENSIONS[2],

  rules: {
    birth: [5, 7],
    survival: [2, 4, 7],
  },

  boundariesKill: false,
  infiniteGrid: false,
  stabilized: false,
  overpopulated: false,
  underpopulated: false,

  isCountDown: false,

  fps: 12, // speed
  // possibly useful
  generation: 0,
  lastUpdateTime: 0,

  cellScale: 0.5,
  cellSpacing: 1.0,
  pattern: 'random', // or random, glider, spaceship, etc.
  shape: 'sphere', // cube or sphere

  isOver: false,
  isPaused: false,
};

export function setCellSpacing(spacing) {
  game.cellSpacing = spacing;
}

export function setShape(shape) {
  if (shape !== 'cube' && shape !== 'sphere') {
    console.error(`Invalid shape: ${shape}. Must be 'cube' or 'sphere'.`);
    return;
  }
  console.log(`Setting shape for next game to: ${shape}`);
  game.shape = shape;

  // Re-initialize geometry buffers // JUST TEST
  initGeometry(shape);
  initGeoBuffers(shape);
}

export function updateCellCountDisplay() {
  const cellCountElement = document.getElementById('cell-count');
  cellCountElement.textContent = `Count: ${game.activeCells}`;
}

let timer;
let countdownValue;

export function countDown() {
  if (timer) return; // Prevent multiple timers

  game.isCountDown = true;

  const countdownElement = document.getElementById('count-down');
  countdownElement.style.display = 'block';

  countdownValue = INIT_COUNT_DOWN;
  countdownElement.innerText = countdownValue;

  timer = setInterval(() => {
    countdownValue--;

    if (countdownValue <= 0) {
      clearInterval(timer);
      timer = null;
      gameOver('OVERPOPULATED');
      return;
    }
    console.log(countdownValue);
    countdownElement.innerText = countdownValue;
  }, 1000);
}

export function abortCountDown() {
  if (!timer) return;

  console.log('aborting count down');
  clearInterval(timer);
  timer = null;
  document.getElementById('count-down').style.display = 'none';
}

function interpolate(start, end, factor) {
  return start + (end - start) * factor;
}

export function gameOver(reason) {
  game.isOver = true;

  console.log('game over', reason);
  document.getElementById('game-over-reason').textContent = reason;
  document.getElementById('game-over').style.display = 'block';
}

export function resetGameState() {
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('count-down').style.display = 'none';

  game.isPaused = true;
  game.isOver = true;

  const { fps, pattern, shape, birth, survival } = getHtmlValues();
  // setFPS(fps);
  game.pattern = pattern;
  game.shape = shape;
  game.rules.birth = birth;
  game.rules.survival = survival;

  game.nextGrid = [];
  game.currentGrid = [];
  game.activeCells = 0;
  setHtmlValues();

  initGeometry(game.shape);
  initGeoBuffers(game.shape);

  game.isOver = false;
}

export function restartGame() {
  document.getElementById('game-over').style.display = 'none';

  game.isGameOver = false;
  game.isPaused = false;

  initGrid(game.pattern);
  updateCellCountDisplay();

  gameLoop();
}

export function setStartPattern(pattern) {
  game.pattern = pattern;
}

export function togglePause() {
  game.isPaused = !game.isPaused;
}

export function toggleWrapping() {
  game.infiniteGrid = !game.infiniteGrid;
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
