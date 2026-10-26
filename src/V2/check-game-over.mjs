// Headless check of end conditions: node src/V2/check-game-over.mjs
import assert from 'node:assert';
import { game } from './game-state.js';
import { initGrid, updateGrid, endReason, poke } from './game-logic.js';

function run(pattern, limit = 500) {
  initGrid(pattern);
  for (let i = 0; i < limit; i++) {
    updateGrid();
    const reason = endReason();
    if (reason) return { reason, gen: game.generation };
  }
  return { reason: 'still alive', gen: game.generation };
}

for (const p of ['random', 'cross', 'line', 'dotted-line', 'block', 'glider', 'spaceship', 'pulsar'])
  console.log(p.padEnd(12), run(p));

game.rules = { birth: [], survival: [] };
assert.deepEqual(run('block'), { reason: 'DIED OUT', gen: 1 });
game.rules = { birth: [], survival: [...Array(27).keys()] };
assert.equal(run('block').reason, 'STABILISED');
game.rules = { birth: [1, 2, 3, 4, 5, 6, 7], survival: [1, 2, 3, 4, 5, 6, 7, 8] };
assert.equal(run('random').reason, 'OVERPOPULATED');
// poke: a ray down the z axis seeds the empty grid, then clears around the first live cell it hits
game.rules = { birth: [5, 7], survival: [2, 4, 7] };
initGrid('block');
game.currentGrid.forEach((p) => p.forEach((r) => r.fill(0)));
const ray = [[0, 0, 100], [0, 0, -1]];
game.seedDensity = 1;
assert.ok(poke(...ray));
assert.equal(game.activeCells, 27);
assert.ok(poke(...ray)); // hits the front face, back layer survives
assert.equal(game.activeCells, 9);
assert.equal(poke([0, 100, 0], [1, 0, 0]), false); // misses the grid
console.log('ok');
