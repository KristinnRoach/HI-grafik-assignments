// game-state.js

export const GRID_DIMENSIONS = [16, 16, 16];
const MAX_CELLS = GRID_DIMENSIONS[0] * GRID_DIMENSIONS[1] * GRID_DIMENSIONS[2];
const BEST_KEY = 'gol-best';

export const game = {
  currentGrid: [],
  nextGrid: [],

  activeCells: 0,
  outOfBoundsCells: 0,

  dimensions: GRID_DIMENSIONS,

  rules: {
    birth: [5, 7],
    survival: [2, 4, 7],
  },

  // Game-over tuning
  maxPopulation: Math.round(MAX_CELLS / 5),
  overpopGrace: 5, // generations allowed above maxPopulation before game over
  stableWindow: 6, // a grid repeating any of the last N grids counts as stabilised

  // Per-run counters, reset by initGrid
  generation: 0, // also the score
  overLimitFor: 0, // consecutive generations above maxPopulation
  recentStates: [], // keys of the last stableWindow grids
  isRepeating: false,

  best: loadBest(),

  boundariesKill: false,
  infiniteGrid: false,

  fps: 2, // speed
  lastUpdateTime: 0,

  // Cell size relative to grid spacing per shape, 1 = touching
  cellScaleCube: 0.9,
  cellScaleSphere: 0.9,
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

export function updateHud() {
  document.getElementById('generation').textContent = `Gen: ${game.generation}`;
  document.getElementById('best').textContent = `Best: ${game.best}`;
  const population = document.getElementById('cell-count');
  population.textContent = `Population: ${Math.round(
    (game.activeCells / game.maxPopulation) * 100
  )}%`;
  population.classList.toggle(
    'over-limit',
    game.activeCells > game.maxPopulation
  );

  const warning = document.getElementById('count-down');
  const warn = game.overLimitFor > 0 && !game.isOver;
  warning.style.display = warn ? 'block' : 'none';
  warning.textContent = `Overpopulated! Change the rules to thin it out: ${
    game.overpopGrace - game.overLimitFor
  }`;
}

export function gameOver(reason) {
  game.isOver = true;

  if (game.generation > game.best) {
    game.best = game.generation;
    saveBest();
  }

  document.getElementById('game-over-reason').textContent = reason;
  document.getElementById(
    'game-over-score'
  ).textContent = `Survived ${game.generation} generations`;
  document.getElementById('game-over').style.display = 'block';
  updateHud();
}

// localStorage can throw (private mode, blocked storage); the score just won't persist
function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem(BEST_KEY, game.best);
  } catch {}
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
