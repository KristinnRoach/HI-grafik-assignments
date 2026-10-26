// game-state.js

export const GRID_DIMENSIONS = [33, 33, 33];
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

  cellScale: 0.9, // cell size relative to grid spacing, 1 = touching
  pattern: 'random', // or random, glider, spaceship, etc.
  shape: 'cube', // cube or sphere

  isOver: false,
  isPaused: false,
};

export function setShape(shape) {
  if (shape !== 'cube' && shape !== 'sphere') {
    console.error(`Invalid shape: ${shape}. Must be 'cube' or 'sphere'.`);
    return;
  }
  game.shape = shape;
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
    countdownElement.innerText = countdownValue;
  }, 1000);
}

export function abortCountDown() {
  if (!timer) return;

  clearInterval(timer);
  timer = null;
  document.getElementById('count-down').style.display = 'none';
}

function interpolate(start, end, factor) {
  return start + (end - start) * factor;
}

export function gameOver(reason) {
  game.isOver = true;

  document.getElementById('game-over-reason').textContent = reason;
  document.getElementById('game-over').style.display = 'block';
}

export function toggleWrapping() {
  game.infiniteGrid = !game.infiniteGrid;
}

export function setGridDimensions(dimensions) {
  game.dimensions = dimensions;
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
