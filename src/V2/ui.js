// ui.js
// HTML controls: syncing values to/from the DOM, input listeners, reset/restart.

import { game, setShape, updateHud, save, isTouch } from './game-state.js';
import { initGrid, patterns } from './game-logic.js';
import { setupGeometry } from './renderer.js';

export function setHtmlValues() {
  // document.getElementById('grid-scale').value = game.gridScale;
  // document.getElementById('cell-scale').value = game.cellScale;
  document.getElementById('fps').value = game.fps;
  document.getElementById('shapeSelect').value = game.shape;
  document.getElementById('patternSelect').value = game.pattern;
  document.getElementById('birth-1').value = game.rules.birth[0];
  document.getElementById('birth-2').value = game.rules.birth[1];
  document.getElementById('survival-1').value = game.rules.survival[0];
  document.getElementById('survival-2').value = game.rules.survival[1];
  document.getElementById('survival-3').value = game.rules.survival[2];
}

export function getHtmlValues() {
  return {
    fps: parseInt(document.getElementById('fps').value),
    pattern: document.getElementById('patternSelect').value,
    shape: document.getElementById('shapeSelect').value,
    birth: [
      parseInt(document.getElementById('birth-1').value),
      parseInt(document.getElementById('birth-2').value),
    ],
    survival: [
      parseInt(document.getElementById('survival-1').value),
      parseInt(document.getElementById('survival-2').value),
      parseInt(document.getElementById('survival-3').value),
    ],
  };
}

export function setupControls() {
  // Rebuild the whole rule list from its boxes on any edit, so empty boxes
  // drop out without shifting the others (NaN >= 0 is false).
  for (const rule of ['birth', 'survival']) {
    const inputs = document.querySelectorAll(`[id^="${rule}-"]`);
    for (const input of inputs) {
      input.addEventListener('input', function () {
        game.rules[rule] = [...inputs]
          .map((el) => parseInt(el.value))
          .filter((n) => n >= 0);
      });
    }
  }

  document.getElementById('fps').addEventListener('input', function (e) {
    const newFPS = parseInt(e.target.value);
    if (!isNaN(newFPS) && newFPS > 0) {
      game.fps = newFPS;
      save('fps');
    }
  });

  document
    .getElementById('patternSelect')
    .addEventListener('change', function (e) {
      // Load the pattern's default rules into the boxes, which resetGameState reads back
      applyPattern(e.target.value);
      save('pattern');
      setHtmlValues();
      resetGameState();
      restartGame();
    });

  document.getElementById('shapeSelect').addEventListener('change', function (e) {
    setShape(e.target.value);
    save('shape');
    setupGeometry();
  });

  document.querySelectorAll('.controls input[type=number]').forEach(addTouchScrub);

  // Touch devices have no arrow keys, R or space
  if (isTouch) {
    document.getElementById('how-to-play').innerHTML =
      'Keep the population under 100%: change the Birth and Survival rules to steer it.<br />' +
      'Drag the numbers up/down to adjust the rules.';
    document.getElementById('game-over-restart').textContent = 'Tap Restart to play again';
  }
}

// Touch: drag a number box up/down to step its value. Taps never focus it (no keyboard, no iOS
// focus-zoom); touch users only scrub.
// ponytail: untested on devices; tune SCRUB_PX on a phone
const SCRUB_PX = 20; // finger travel per step
function addTouchScrub(input) {
  let startY, startValue;
  // Cancelling touchstart stops iOS from synthesizing the click that focuses the input; pointer events still fire
  input.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  input.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    input.setPointerCapture(e.pointerId);
    startY = e.clientY;
    startValue = parseInt(input.value) || 0;
  });
  input.addEventListener('pointermove', (e) => {
    if (!input.hasPointerCapture(e.pointerId)) return;
    let value = startValue + Math.round((startY - e.clientY) / SCRUB_PX);
    if (input.min !== '') value = Math.max(value, Number(input.min));
    if (input.max !== '') value = Math.min(value, Number(input.max));
    if (String(value) === input.value) return;
    input.value = value;
    input.dispatchEvent(new Event('input')); // same path as typing, so rules/fps update and save
  });
}

// Sets the pattern and its default rules; unknown names (e.g. a stale saved value) fall back to random
export function applyPattern(name) {
  game.pattern = patterns[name] ? name : 'random';
  const { rules } = patterns[game.pattern];
  game.rules = { birth: [...rules.birth], survival: [...rules.survival] };
}

export function resetGameState() {
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('count-down').style.display = 'none';

  game.isOver = true;

  const { fps, pattern, shape, birth, survival } = getHtmlValues();
  game.pattern = pattern;
  game.shape = shape;
  game.rules.birth = birth;
  game.rules.survival = survival;

  game.nextGrid = [];
  game.currentGrid = [];
  game.activeCells = 0;
  setHtmlValues();

  setupGeometry();

  game.isOver = false;
}

export function restartGame() {
  document.getElementById('game-over').style.display = 'none';

  // isPaused is left alone: a restart keeps playing or stays paused
  game.isOver = false;

  initGrid(game.pattern);
  updateHud();
}
