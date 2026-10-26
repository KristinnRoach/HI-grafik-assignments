// game-logic.js

import { game, cellSpacing } from './game-state.js';

export function initGrid(pattern = 'random') {
  switch (pattern) {
    case 'random':
      initializeRandom();
      break;
    case 'cross':
      initializeCross();
      break;
    case 'block':
      initializeBlock();
      break;
    case 'glider':
      initializeGlider();
      break;
    case 'pulsar':
      initializePulsar();
      break;
    case 'spaceship':
      initializeSpaceship();
      break;
    case 'line':
      initializeLine();
      break;
    case 'dotted-line':
      initializeDottedLine();
      break;
    default:
      initializeRandom();
  }

  game.nextGrid = Array(game.dimensions[0])
    .fill()
    .map(() =>
      Array(game.dimensions[1])
        .fill()
        .map(() => Array(game.dimensions[2]).fill(0))
    );

  game.activeCells = game.currentGrid
    .flat(3)
    .filter((cell) => cell === 1).length;

  game.generation = 0;
  game.overLimitFor = 0;
  game.recentStates = [];
  game.isRepeating = false;
}

export function updateGrid() {
  if (game.isOver || game.isPaused) {
    return;
  }

  let newCellCount = 0;
  game.outOfBoundsCells = 0; // Reset out of bounds cells count

  const birth = game.rules.birth;
  const survive = game.rules.survival;

  const newGrid = (game.nextGrid = game.nextGrid.map((x) =>
    x.map((y) => y.fill(0))
  ));

  for (let x = 0; x < game.dimensions[0]; x++) {
    for (let y = 0; y < game.dimensions[1]; y++) {
      for (let z = 0; z < game.dimensions[2]; z++) {
        const n = countNeighbors(x, y, z);
        if (
          (game.currentGrid[x][y][z] && survive.includes(n)) ||
          (!game.currentGrid[x][y][z] && birth.includes(n))
          // && !xyzOutOfBounds(x, y, z))
        ) {
          newGrid[x][y][z] = 1;
          newCellCount++;
          // Check if the current cell is active and out of bounds
          if (xyzOutOfBounds(x, y, z)) {
            game.outOfBoundsCells++;
          }
        }
      }
    }
  }

  game.activeCells = newCellCount;

  [game.currentGrid, game.nextGrid] = [game.nextGrid, game.currentGrid];

  game.generation++;
  game.overLimitFor =
    game.activeCells > game.maxPopulation ? game.overLimitFor + 1 : 0;

  // ponytail: whole grid as a string key, fine at 16³; switch to a numeric hash for big grids
  const key = game.currentGrid.flat(2).join('');
  game.isRepeating = game.recentStates.includes(key);
  game.recentStates = [...game.recentStates, key].slice(-game.stableWindow);
}

// Why the run should end, or null to keep going. Checked after every generation.
// Add new end conditions here.
export function endReason() {
  if (game.activeCells === 0) return 'DIED OUT';
  if (game.overLimitFor >= game.overpopGrace) return 'OVERPOPULATED';
  if (game.isRepeating) return 'STABILISED';
  return null;
}

// Clear a 3×3×3 block around the first live cell a world-space ray hits,
// or seed one in empty space if it hits none. Returns false if nothing happened.
export function poke(origin, dir) {
  if (game.isOver) return false;
  const hit = pickCell(origin, dir);
  if (!hit) return false;

  const { cell, kill } = hit;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const [x, y, z] = [cell[0] + dx, cell[1] + dy, cell[2] + dz];
        if (xyzOutOfBounds(x, y, z)) continue;
        if (kill) game.currentGrid[x][y][z] = 0;
        else if (Math.random() < game.seedDensity) game.currentGrid[x][y][z] = 1;
      }
    }
  }
  game.activeCells = game.currentGrid.flat(2).reduce((a, b) => a + b, 0);
  return true;
}

// First live cell along the ray (kill), else the in-grid cell nearest the grid centre, else null.
// ponytail: fixed-step march (~800 samples per click), swap for a 3D DDA if it ever matters
function pickCell(origin, dir) {
  const spacing = cellSpacing();
  const center = game.dimensions.map((d) => (d - 1) / 2);
  const start = origin.map((v, i) => v / spacing + center[i]); // world -> grid units

  let nearest = null;
  let nearestDist = Infinity;
  for (let t = 0; t < 200; t += 0.25) {
    const [x, y, z] = start.map((v, i) => Math.round(v + dir[i] * t));
    if (xyzOutOfBounds(x, y, z)) continue;
    if (game.currentGrid[x][y][z]) return { cell: [x, y, z], kill: true };

    const dist = Math.hypot(x - center[0], y - center[1], z - center[2]);
    if (dist < nearestDist) [nearest, nearestDist] = [[x, y, z], dist];
  }
  return nearest && { cell: nearest, kill: false };
}

function countNeighbors(x, y, z) {
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;

        let nx = x + dx;
        let ny = y + dy;
        let nz = z + dz;

        if (game.infiniteGrid) {
          nx = (nx + game.dimensions[0]) % game.dimensions[0];
          ny = (ny + game.dimensions[1]) % game.dimensions[1];
          nz = (nz + game.dimensions[2]) % game.dimensions[2];
          count += game.currentGrid[nx][ny][nz];
        } else {
          if (xyzOutOfBounds(nx, ny, nz)) {
            if (game.boundariesKill) {
              count++; // Count boundary as a living neighbor
            }
          } else {
            count += game.currentGrid[nx][ny][nz];
          }
        }
      }
    }
  }

  return count;
}

function xyzOutOfBounds(x, y, z) {
  return (
    x < 0 ||
    x >= game.dimensions[0] ||
    y < 0 ||
    y >= game.dimensions[1] ||
    z < 0 ||
    z >= game.dimensions[2]
  );
}

/* Initializer patterns */

function initializeRandom() {
  game.currentGrid = Array(game.dimensions[0])
    .fill()
    .map(() =>
      Array(game.dimensions[1])
        .fill()
        .map(() =>
          Array(game.dimensions[2])
            .fill()
            .map(() => (Math.random() < 0.5 ? 1 : 0))
        )
    );
}

function initializeCross() {
  game.currentGrid = Array(game.dimensions[0])
    .fill()
    .map((_, x) =>
      Array(game.dimensions[1])
        .fill()
        .map((_, y) =>
          Array(game.dimensions[2])
            .fill()
            .map((_, z) => {
              const centerX = Math.floor(game.dimensions[0] / 2);
              const centerY = Math.floor(game.dimensions[1] / 2);
              const centerZ = Math.floor(game.dimensions[2] / 2);
              return x === centerX || y === centerY || z === centerZ ? 1 : 0;
            })
        )
    );
}

function initializeBlock() {
  const centerX = Math.floor(game.dimensions[0] / 2);
  const centerY = Math.floor(game.dimensions[1] / 2);
  const centerZ = Math.floor(game.dimensions[2] / 2);

  game.currentGrid = createEmptyGrid();

  for (let x = centerX - 1; x <= centerX + 1; x++) {
    for (let y = centerY - 1; y <= centerY + 1; y++) {
      for (let z = centerZ - 1; z <= centerZ + 1; z++) {
        game.currentGrid[x][y][z] = 1;
      }
    }
  }
}

function initializeGlider() {
  game.currentGrid = createEmptyGrid();

  const patterns = [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ];

  const startX = Math.floor(game.dimensions[0] / 4);
  const startY = Math.floor(game.dimensions[1] / 4);
  const startZ = Math.floor(game.dimensions[2] / 2);

  for (let x = 0; x < patterns.length; x++) {
    for (let y = 0; y < patterns[x].length; y++) {
      game.currentGrid[startX + x][startY + y][startZ] = patterns[x][y];
      game.currentGrid[startX + x][startY][startZ + y] = patterns[x][y];
    }
  }
}

function initializePulsar() {
  game.currentGrid = createEmptyGrid();

  const centerX = Math.floor(game.dimensions[0] / 2);
  const centerY = Math.floor(game.dimensions[1] / 2);
  const centerZ = Math.floor(game.dimensions[2] / 2);

  const offsets = [-6, -1, 1, 6];

  offsets.forEach((x) => {
    offsets.forEach((y) => {
      if (Math.abs(x) !== Math.abs(y)) {
        game.currentGrid[centerX + x][centerY + y][centerZ] = 1;
        game.currentGrid[centerX + x][centerY][centerZ + y] = 1;
        game.currentGrid[centerX][centerY + x][centerZ + y] = 1;
      }
    });
  });
}

function initializeSpaceship() {
  game.currentGrid = createEmptyGrid();

  const patterns = [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
  ];

  const startX = Math.floor(game.dimensions[0] / 4);
  const startY = Math.floor(game.dimensions[1] / 4);
  const startZ = Math.floor(game.dimensions[2] / 2);

  for (let x = 0; x < patterns.length; x++) {
    for (let y = 0; y < patterns[x].length; y++) {
      game.currentGrid[startX + x][startY + y][startZ] = patterns[x][y];
      game.currentGrid[startX + x][startY][startZ + y] = patterns[x][y];
    }
  }
}

function initializeLine() {
  game.currentGrid = createEmptyGrid();

  const centerX = Math.floor(game.dimensions[0] / 2);
  const centerY = Math.floor(game.dimensions[1] / 2);

  for (let z = 0; z < game.dimensions[2]; z++) {
    game.currentGrid[centerX][centerY][z] = 1;
  }
}

function initializeDottedLine() {
  game.currentGrid = createEmptyGrid();

  const centerX = Math.floor(game.dimensions[0] / 2);
  const centerY = Math.floor(game.dimensions[1] / 2);

  for (let z = 0; z < game.dimensions[2]; z += 2) {
    game.currentGrid[centerX][centerY][z] = 1;
  }
}

function createEmptyGrid() {
  return Array(game.dimensions[0])
    .fill()
    .map(() =>
      Array(game.dimensions[1])
        .fill()
        .map(() => Array(game.dimensions[2]).fill(0))
    );
}
