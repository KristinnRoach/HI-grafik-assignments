// dev-tuning.js
// Collapsible panel for tuning the look in the browser. Native <details>, so it starts collapsed with no toggle code.

import { lighting, effects, textureStyles, textureStyle, setTexture } from './renderer.js';
import { game } from './game-state.js';

const style = document.createElement('style');
style.textContent = `
  #dev-panel { position: fixed; top: 60px; right: 16px; z-index: 10; font: 12px monospace; color: #9f9; }
  #dev-panel > summary { list-style: none; cursor: pointer; text-align: right; opacity: 0.4; }
  #dev-panel > summary:hover, #dev-panel[open] > summary { opacity: 1; }
  #dev-panel .body { margin-top: 4px; padding: 8px 10px; min-width: fit-content; width: 300px; max-height: calc(100vh - 100px); overflow-y: auto;
    background: rgba(0, 0, 0, 0.75); border: 1px solid #4a4; border-radius: 6px; }
  #dev-panel details details { margin: 2px 0; }
  #dev-panel details details > summary { cursor: pointer; padding: 2px 0; }
  #dev-panel .grid { display: grid; grid-template-columns: 1fr auto; gap: 4px 6px; align-items: center; padding: 4px 0 6px 12px; }
  #dev-panel input { box-shadow: none; padding: 0; }
  #dev-panel input[type=range] { width: 110px; }
  #dev-panel pre { grid-column: 1 / 3; margin: 0; user-select: all; white-space: pre-wrap; }
`;
document.head.appendChild(style);

const panel = document.createElement('details');
panel.id = 'dev-panel';
panel.innerHTML = '<summary title="Tune the look">⚙ tune</summary><div class="body"></div>';
document.body.appendChild(panel);
const body = panel.querySelector('.body');

function addGroup(title) {
  const group = document.createElement('details');
  group.innerHTML = `<summary>${title}</summary><div class="grid"></div>`;
  body.append(group);
  return group.querySelector('.grid');
}

function addRow(parent, label, input, onInput) {
  const name = document.createElement('label');
  name.textContent = label;
  input.addEventListener('input', () => {
    onInput();
    updateReadout();
  });
  parent.append(name, input);
}

function addSlider(parent, label, min, max, get, set) {
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min, max, step: 0.01, value: get() });
  addRow(parent, label, input, () => set(parseFloat(input.value)));
}

function addValue(parent, key, min, max) {
  addSlider(parent, key, min, max, () => lighting[key], (v) => (lighting[key] = v));
}

// One slider per component, for vectors that aren't colours
function addVec3(parent, key, min, max) {
  ['x', 'y', 'z'].forEach((c, i) =>
    addSlider(parent, `${key}.${c}`, min, max, () => lighting[key][i], (v) => (lighting[key][i] = v))
  );
}

// ponytail: hex maps straight to 0..1 with no gamma step, so values stay 1:1 with the code,
// but swatches for the linear colours (sky/ground) look darker than they render
function addColor(parent, key) {
  const toHex = (v) => '#' + v.map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
  const input = document.createElement('input');
  Object.assign(input, { type: 'color', value: toHex(lighting[key]) });
  addRow(parent, key, input, () => {
    lighting[key] = [1, 3, 5].map((i) => parseInt(input.value.slice(i, i + 2), 16) / 255);
  });
}

function addToggle(parent, key) {
  const input = document.createElement('input');
  Object.assign(input, { type: 'checkbox', checked: effects[key] });
  addRow(parent, key, input, () => (effects[key] = input.checked));
}

const fx = addGroup('Effects');
['tween', 'densityColor', 'fog', 'jitter', 'texture'].forEach((key) => addToggle(fx, key));
addValue(fx, 'textureStrengthCube', 0, 1);
addValue(fx, 'textureStrengthSphere', 0, 1);
for (const shape of ['cube', 'sphere']) {
  const select = document.createElement('select');
  select.innerHTML = Object.keys(textureStyles).map((k) => `<option>${k}</option>`).join('');
  select.value = textureStyle[shape];
  const label = `textureStyle${shape[0].toUpperCase()}${shape.slice(1)}`;
  addRow(fx, label, select, () => setTexture(shape, select.value));
}

const color = addGroup('Color');
addColor(color, 'cellColor');
addColor(color, 'hotColor');
addValue(color, 'densityMax', 0.06, 1);
addValue(color, 'brightnessJitter', 0, 1);
addValue(color, 'colorJitter', 0, 1);

const light = addGroup('Light');
addVec3(light, 'lightDirection', -1, 1);
addValue(light, 'lightIntensity', 0, 3);
addColor(light, 'skyColor');
addColor(light, 'groundColor');
addValue(light, 'diffuseWrap', 0, 1);
addValue(light, 'specularStrength', 0, 1);

const depth = addGroup('Occlusion & fog');
addValue(depth, 'occlusionStrength', 0, 8);
addValue(depth, 'occlusionDirect', 0, 1);
addValue(depth, 'fogNear', 0, 100);
addValue(depth, 'fogFar', 0, 150);

const size = addGroup('Cell size');
addSlider(size, 'cellScaleCube', 0.1, 1, () => game.cellScaleCube, (v) => (game.cellScaleCube = v));
addSlider(size, 'cellScaleSphere', 0.1, 1, () => game.cellScaleSphere, (v) => (game.cellScaleSphere = v));
addValue(size, 'sizeJitterCube', 0, 1);
addValue(size, 'sizeJitterSphere', 0, 1);

// Paste over `lighting` in renderer.js to save new defaults
const readout = document.createElement('pre');
addGroup('Export lighting').append(readout);

function updateReadout() {
  readout.textContent = Object.entries(lighting)
    .map(([key, v]) =>
      Array.isArray(v)
        ? `${key}: [${v.map((n) => n.toFixed(2)).join(', ')}],`
        : `${key}: ${v.toFixed(2)},`
    )
    .join('\n');
}
updateReadout();
