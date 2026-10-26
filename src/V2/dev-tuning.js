// dev-tuning.js
// Dev-only panel for tuning lighting in the browser. Remove the script tag in index.html before deploy.

import { lighting } from './main.js';

const panel = document.createElement('div');
panel.style.cssText =
  'position:fixed;top:60px;right:16px;padding:10px;display:grid;gap:6px;' +
  'grid-template-columns:auto auto;align-items:center;font:12px monospace;' +
  'background:rgba(0,0,0,0.75);color:#9f9;border:1px solid #4a4;border-radius:6px;z-index:10;';
document.body.appendChild(panel);

const readout = document.createElement('pre');
readout.style.cssText = 'grid-column:1/3;margin:4px 0 0;user-select:all;';

function addSlider(label, min, max, step, get, set) {
  const name = document.createElement('label');
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min, max, step, value: get() });
  input.addEventListener('input', () => {
    set(parseFloat(input.value));
    updateReadout();
  });
  name.textContent = label;
  panel.append(name, input);
}

// One slider per RGB channel, so values map 1:1 to the shader constants
function addColorSliders(key) {
  ['r', 'g', 'b'].forEach((channel, i) =>
    addSlider(
      `${key}.${channel}`,
      0,
      1,
      0.01,
      () => lighting[key][i],
      (v) => (lighting[key][i] = v)
    )
  );
}

const fmt = (c) => `vec3(${c.map((v) => v.toFixed(2)).join(', ')})`;

function updateReadout() {
  readout.textContent =
    `skyColor:    ${fmt(lighting.skyColor)}\n` +
    `groundColor: ${fmt(lighting.groundColor)}\n` +
    `diffuseWrap: ${lighting.diffuseWrap.toFixed(2)}`;
}

addColorSliders('skyColor');
addColorSliders('groundColor');
addSlider(
  'diffuseWrap',
  0,
  1,
  0.01,
  () => lighting.diffuseWrap,
  (v) => (lighting.diffuseWrap = v)
);
panel.append(readout);
updateReadout();
