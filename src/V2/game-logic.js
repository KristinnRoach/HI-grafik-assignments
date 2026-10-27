// game-logic.js

import { game, cellSpacing } from './game-state.js';

export function initGrid(pattern = 'random') {
  const { offsets, anchor = center } = patterns[pattern] ?? patterns.random;
  game.currentGrid = createEmptyGrid();
  stamp(offsets(), anchor());
  game.nextGrid = createEmptyGrid();

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
// or stamp the selected pattern in empty space if it hits none. Returns false if nothing happened.
export function poke(origin, dir) {
  if (game.isOver) return false;
  const hit = pickCell(origin, dir);
  if (!hit) return false;

  // Paused: previous grid = current one, so the renderer only tweens the clicked cells.
  // ponytail: running clicks ride the step's tween; per-cell start times would need a shader attribute
  if (game.isPaused) {
    game.nextGrid = structuredClone(game.currentGrid);
    game.tweenStart = performance.now();
  }

  if (hit.kill) {
    stamp(cube(1), hit.cell, 0);
  } else {
    const pattern = patterns[game.pattern] ?? patterns.random;
    const offsets = (pattern.clickOffsets ?? pattern.offsets)().filter((o) =>
      o.every((v) => Math.abs(v) <= game.seedRadius)
    );
    stamp(offsets, hit.cell);
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

/* Patterns: cell offsets around an anchor, stamped for the starting grid and on click */

// rules load when the pattern is picked (headless search: lowest-density rules that last 25+ gens)
// anchor defaults to the grid centre; clickOffsets, if set, replaces offsets on click
export const patterns = {
  random: {
    rules: { birth: [5, 7], survival: [2, 4, 6] },
    offsets: () => cube(span()).filter(() => Math.random() < 0.5),
    clickOffsets: () => cube(1).filter(() => Math.random() < game.seedDensity),
  },
  cross: {
    rules: { birth: [4, 8], survival: [7, 8, 9] },
    offsets: () => cube(span()).filter(([x, y, z]) => x === 0 || y === 0 || z === 0),
  },
  line: {
    rules: { birth: [1, 7], survival: [0, 1, 8] },
    offsets: () => steps(1).map((z) => [0, 0, z]),
  },
  'dotted-line': {
    rules: { birth: [1, 5], survival: [0, 1, 2] },
    offsets: () => steps(2).map((z) => [0, 0, z]),
  },
  block: {
    rules: { birth: [5, 6], survival: [2, 6, 7] },
    offsets: () => cube(1),
  },
  glider: {
    rules: { birth: [4, 8], survival: [1, 6, 8] },
    anchor: quarter,
    offsets: () =>
      twoPlanes([
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1],
      ]),
  },
  spaceship: {
    rules: { birth: [5, 6], survival: [1, 3, 8] },
    anchor: quarter,
    offsets: () =>
      twoPlanes([
        [0, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
      ]),
  },
  pulsar: {
    rules: { birth: [4, 8], survival: [2, 6, 8] },
    offsets: () => {
      const arms = [-6, -1, 1, 6];
      return arms.flatMap((a) =>
        arms
          .filter((b) => Math.abs(a) !== Math.abs(b))
          .flatMap((b) => [
            [a, b, 0],
            [a, 0, b],
            [0, a, b],
          ])
      );
    },
  },
};

// Set every in-bounds cell at anchor + offset to value
function stamp(offsets, [ax, ay, az], value = 1) {
  for (const [dx, dy, dz] of offsets) {
    const [x, y, z] = [ax + dx, ay + dy, az + dz];
    if (!xyzOutOfBounds(x, y, z)) game.currentGrid[x][y][z] = value;
  }
}

function center() {
  return game.dimensions.map((d) => Math.floor(d / 2));
}

// Glider and spaceship start a quarter in on x and y, so they have room to travel
function quarter() {
  return game.dimensions.map((d, i) => Math.floor(i === 2 ? d / 2 : d / 4));
}

// Big enough to reach across the grid from any anchor
function span() {
  return Math.max(...game.dimensions);
}

// Offsets from -span to span in the given step, for lines through the anchor
function steps(step) {
  const offsets = [];
  for (let i = -span(); i <= span(); i += step) offsets.push(i);
  return offsets;
}

// Every offset in a cube of radius r
function cube(r) {
  const offsets = [];
  for (let x = -r; x <= r; x++)
    for (let y = -r; y <= r; y++)
      for (let z = -r; z <= r; z++) offsets.push([x, y, z]);
  return offsets;
}

// A 2D pattern drawn in two perpendicular planes that share the anchor's first row
function twoPlanes(rows) {
  return rows.flatMap((row, x) =>
    row.flatMap((on, y) => (on ? [[x, y, 0], [x, 0, y]] : []))
  );
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
