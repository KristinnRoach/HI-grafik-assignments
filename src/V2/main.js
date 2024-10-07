// main.js

import { perspective, flatten, mult, scalem } from '../lib/MV.js';

import * as cam from './camera.js';

import {
  setupWebGL,
  createBuffer,
  createInstancedBuffer,
  setupShaders,
  gl,
  glPos,
  program,
} from './gl-utils.js';
import { createCubeGeometry, points, colors } from './geometry.js';
import { initGrid, updateGrid } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game } from './game-state.js';

const NUM_VERTICES = 36; // check this

export let cubeBuffer;
export let instanceBuffer;

window.onload = function init() {
  setupWebGL();
  createCubeGeometry();
  setupShaders();
  initHtmlValues();

  glPos.aColor = gl.getAttribLocation(program, 'aColor');
  glPos.aPosition = gl.getAttribLocation(program, 'aPosition');

  glPos.aOffset = gl.getAttribLocation(program, 'aOffset');

  glPos.uModelView = gl.getUniformLocation(program, 'uModelView');
  glPos.uProjection = gl.getUniformLocation(program, 'uProjection');

  createBuffer(new Float32Array(flatten(colors)), glPos.aColor, 4);
  createBuffer(new Float32Array(flatten(points)), glPos.aPosition, 3);

  const initialInstanceData = new Float32Array(
    game.dimensions[0] * game.dimensions[1] * game.dimensions[2] * 3
  );

  instanceBuffer = createInstancedBuffer(initialInstanceData, glPos.aOffset, 3);

  const aspect = gl.canvas.width / gl.canvas.height;
  const projectionMatrix = perspective(
    cam.FIELD_OF_VIEW,
    aspect,
    cam.NEAR_PLANE,
    cam.FAR_PLANE
  );
  gl.uniformMatrix4fv(glPos.uProjection, false, flatten(projectionMatrix));

  setupEventListeners(gl.canvas);
  initGrid(game.pattern);
  cam.updatePosition(); // init camera

  console.log('rules', game.rules.birth, game.rules.survival);

  gameLoop();
};

let lastTimestamp = 0;
let msPerFrame = 1000 / game.fps;

export const setFPS = (fps) => {
  game.fps = fps;
  msPerFrame = 1000 / game.fps;
};

function gameLoop(timestamp) {
  const elapsed = timestamp - lastTimestamp;

  if (elapsed >= msPerFrame) {
    lastTimestamp = timestamp - (elapsed % msPerFrame);

    if (!game.isPaused) {
      updateGrid();
    }
    render();
  }

  requestAnimationFrame(gameLoop);
}

export function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  cam.updatePosition();
  const viewMatrix = cam.getViewMatrix();

  const maxDimension = Math.max(...game.dimensions);
  const cellSpacing = (4 * game.gridScale) / maxDimension;

  const instanceData = [];
  let instanceCount = 0;

  for (let x = 0; x < game.dimensions[0]; x++) {
    for (let y = 0; y < game.dimensions[1]; y++) {
      for (let z = 0; z < game.dimensions[2]; z++) {
        if (game.currentGrid[x][y][z] === 1) {
          instanceData.push(
            (x - game.dimensions[0] / 2 + 0.5) * cellSpacing,
            (y - game.dimensions[1] / 2 + 0.5) * cellSpacing,
            (z - game.dimensions[2] / 2 + 0.5) * cellSpacing
          );
          instanceCount++;
        }
      }
    }
  }

  // Update instance buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(instanceData),
    gl.DYNAMIC_DRAW
  );

  // Set modelView matrix
  const modelViewMatrix = mult(
    viewMatrix,
    scalem(
      game.cellScale * cellSpacing,
      game.cellScale * cellSpacing,
      game.cellScale * cellSpacing
    )
  );

  gl.uniformMatrix4fv(glPos.uModelView, false, flatten(modelViewMatrix));

  // Draw instanced cubes
  gl.drawArraysInstanced(gl.TRIANGLES, 0, NUM_VERTICES, instanceCount);
}

function initHtmlValues() {
  document.getElementById('grid-scale').value = game.gridScale;
  // document.getElementById('cell-scale').value = game.cellScale;
  document.getElementById('fps').value = game.fps;
  document.getElementById('patternSelect').value = game.pattern;
  document.getElementById('birth-1').value = game.rules.birth[0];
  document.getElementById('birth-2').value = game.rules.birth[1];
  document.getElementById('survival-1').value = game.rules.survival[0];
  document.getElementById('survival-2').value = game.rules.survival[1];
  document.getElementById('survival-3').value = game.rules.survival[2];
}

document.getElementById('grid-scale').addEventListener('input', function (e) {
  if (parseInt(e.target.value) > 0.0 && !isNaN(e.target.value)) {
    game.gridScale = parseFloat(e.target.value);
  }
});

// document.getElementById('cell-scale').addEventListener('input', function (e) {
//   if (parseInt(e.target.value) > 0.0 && !isNaN(e.target.value)) {
//     game.cellScale = parseFloat(e.target.value);
//   }
// });

document.getElementById('birth-1').addEventListener('input', function (e) {
  if (parseInt(e.target.value) >= 0 && !isNaN(e.target.value)) {
    game.rules.birth[0] = parseInt(e.target.value);
  } else {
    game.rules.birth = game.rules.birth.slice(1);
  }
});

document.getElementById('birth-2').addEventListener('input', function (e) {
  if (parseInt(e.target.value) >= 0 && !isNaN(e.target.value)) {
    game.rules.birth[1] = parseInt(e.target.value);
  } else {
    game.rules.birth = game.rules.birth.slice(0, 1);
  }
});

document.getElementById('survival-1').addEventListener('input', function (e) {
  game.rules.survival[0] = parseInt(e.target.value);
});

document.getElementById('survival-2').addEventListener('input', function (e) {
  game.rules.survival[1] = parseInt(e.target.value);
});

document.getElementById('survival-3').addEventListener('input', function (e) {
  game.rules.survival[2] = parseInt(e.target.value);
});

document.getElementById('fps').addEventListener('input', function (e) {
  setFPS(parseFloat(e.target.value));
  console.log(game.fps);
});

document
  .getElementById('patternSelect')
  .addEventListener('change', function (e) {
    game.pattern = e.target.value;
    console.log(game.pattern);
  });
