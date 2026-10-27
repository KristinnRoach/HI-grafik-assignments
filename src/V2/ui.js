// ui.js
// HTML controls: syncing values to/from the DOM, input listeners, reset/restart.

import { game, setShape, updateHud, save } from './game-state.js';
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
