// game-logic.js

import { countDown, abortCountDown, game, gameOver } from './game-state.js';

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

  console.log('out of bounds cells', game.outOfBoundsCells);

  game.activeCells = newCellCount;

  [game.currentGrid, game.nextGrid] = [game.nextGrid, game.currentGrid];
}

// if (newCellCount > 4492) {
//   game.isPaused = true;
// }

// if (newCellCount >= game.maxCells / 5 && !game.isPaused) {
//   countDown();
// }

// if (game.isCountDown && newCellCount < game.maxCells / 5) {
//   abortCountDown();
// }

function countNeighbors(x, y, z) {
  let count = 0;
  let outOfBoundsSet = new Set();

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

function isGridStabilized(grid1, grid2) {
  // TEMP make if same over x iterations
  return grid1 == grid2;
}

function outOfBounds(value, axis) {
  return value < 0 || value >= game.dimensions[axis];
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

// if (game.wrapping) {
//   nx = (nx + game.dimensions[0]) % game.dimensions[0];
//   ny = (ny + game.dimensions[1]) % game.dimensions[1];
//   nz = (nz + game.dimensions[2]) % game.dimensions[2];
// }

// if (outOfBounds(nx, ny, nz)) {
//   // if (boundariesKill) {
//   //   count++;
//   // }
//   continue;
// }
