// dev-tuning.js
// Dev-only panel for tuning lighting in the browser. Remove the script tag in index.html before deploy.

import { lighting, effects } from './renderer.js';
import { game } from './game-state.js';

const panel = document.createElement('div');
panel.style.cssText =
  'position:fixed;top:60px;right:16px;padding:10px;display:grid;gap:4px 6px;' +
  'grid-template-columns:auto auto;align-items:center;font:12px monospace;' +
  'background:rgba(0,0,0,0.75);color:#9f9;border:1px solid #4a4;border-radius:6px;z-index:10;' +
  'max-height:calc(100vh - 80px);overflow-y:auto;';
document.body.appendChild(panel);

const readout = document.createElement('pre');
readout.style.cssText = 'grid-column:1/3;margin:4px 0 0;user-select:all;';

function addSlider(label, min, max, get, set) {
  const name = document.createElement('label');
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min, max, step: 0.01, value: get() });
  input.addEventListener('input', () => {
    set(parseFloat(input.value));
    updateReadout();
  });
  name.textContent = label;
  panel.append(name, input);
}

function addToggle(key) {
  const name = document.createElement('label');
  const input = document.createElement('input');
  Object.assign(input, { type: 'checkbox', checked: effects[key] });
  input.addEventListener('change', () => (effects[key] = input.checked));
  name.textContent = key;
  panel.append(name, input);
}

function addValue(key, min, max) {
  addSlider(key, min, max, () => lighting[key], (v) => (lighting[key] = v));
}

// One slider per component, so values map 1:1 to the code
function addVec3(key, min, max) {
  ['x', 'y', 'z'].forEach((c, i) =>
    addSlider(
      `${key}.${c}`,
      min,
      max,
      () => lighting[key][i],
      (v) => (lighting[key][i] = v)
    )
  );
}

function updateReadout() {
  readout.textContent = Object.entries(lighting)
    .map(([key, v]) =>
      Array.isArray(v)
        ? `${key}: [${v.map((n) => n.toFixed(2)).join(', ')}],`
        : `${key}: ${v.toFixed(2)},`
    )
    .join('\n');
}

addToggle('tween');
addToggle('densityColor');
addToggle('fog');
addVec3('cellColor', 0, 1);
addVec3('hotColor', 0, 1);
addValue('densityMax', 0.06, 1);
addVec3('lightDirection', -1, 1);
addValue('lightIntensity', 0, 3);
addVec3('skyColor', 0, 1);
addVec3('groundColor', 0, 1);
addValue('diffuseWrap', 0, 1);
addValue('specularStrength', 0, 1);
addValue('occlusionStrength', 0, 8);
addValue('occlusionDirect', 0, 1);
addValue('fogNear', 0, 100);
addValue('fogFar', 0, 150);
addSlider('cellScale', 0.1, 1, () => game.cellScale, (v) => (game.cellScale = v));
panel.append(readout);
updateReadout();
