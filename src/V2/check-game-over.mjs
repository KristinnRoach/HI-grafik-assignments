// Headless check of end conditions: node src/V2/check-game-over.mjs
import assert from 'node:assert';
import { game } from './game-state.js';
import { initGrid, updateGrid, endReason } from './game-logic.js';

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
console.log('ok');
