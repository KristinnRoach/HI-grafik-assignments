// main.js

import {
  perspective,
  flatten,
  mult,
  scalem,
  vec3,
  vec4,
  normalize,
} from '../lib/MV.js';

import * as cam from './camera.js';

import {
  setupWebGL,
  createBuffer,
  createInstancedBuffer,
  setupShaders,
  createIndexBuffer,
  getAllGlLocations,
  gl,
  glLoc,
} from './gl-utils.js';
import { createGeometry } from './geometry.js';
import { initGrid, updateGrid } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game, setShape, updateCellCountDisplay } from './game-state.js';

export let geometry;
export let geometryBuffers;
export let instanceBuffer;

// Tweakable at runtime by dev-tuning.js
export const lighting = {
  cellColor: [0.3, 0.8, 0.4], // sRGB
  lightDirection: [0.8, -0.5, 0.8], // world space, towards the light
  lightIntensity: 1,
  skyColor: [0.5, 0.5, 0.5], // linear
  groundColor: [0.3, 0.3, 0.2], // linear
  diffuseWrap: 0.95,
  specularStrength: 0.25,
  occlusionStrength: 2,
  occlusionDirect: 0.15, // how much occlusion also dims direct light
};

// Fraction of the 26 surrounding cells that are alive, used as cheap ambient occlusion
function neighborFraction(grid, x, y, z) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        count += grid[x + dx]?.[y + dy]?.[z + dz] ?? 0;
      }
    }
  }
  return (count - 1) / 26; // minus the cell itself
}

export function setupGeometry() {
  try {
    if (geometryBuffers) {
      for (const buffer of Object.values(geometryBuffers)) {
        if (buffer instanceof WebGLBuffer) gl.deleteBuffer(buffer);
      }
    }

    geometry = createGeometry(game.shape, { size: 1 });

    console.log('Geometry created:', geometry);

    geometryBuffers = {
      vertices: createBuffer(
        new Float32Array(flatten(geometry.vertices)),
        glLoc.aPosition,
        3
      ),
      uvs: createBuffer(
        new Float32Array(flatten(geometry.uvs)),
        glLoc.aTexCoord,
        2
      ),
      normals: createBuffer(
        new Float32Array(flatten(geometry.normals)),
        glLoc.aNormal,
        3
      ),
      indices: createIndexBuffer(geometry.indices),
      numIndices: geometry.numIndices,
    };

    console.log('Geometry buffers created:', geometryBuffers);

    console.log('Shape set to: ', game.shape);
  } catch (error) {
    console.error('Error in setShape:', error);
  }
}

// window.onload = function init() {
export function init() {
  setHtmlValues();
  setupWebGL();
  setupShaders();

  getAllGlLocations();

  setupGeometry();
  // Filled every frame in render()
  instanceBuffer = createInstancedBuffer(new Float32Array(), glLoc.aInstance, 4);

  const aspect = 1; // gl.canvas.width / gl.canvas.height;
  const projectionMatrix = perspective(
    cam.FIELD_OF_VIEW,
    aspect,
    cam.NEAR_PLANE,
    cam.FAR_PLANE
  );
  gl.uniformMatrix4fv(glLoc.uProjection, false, flatten(projectionMatrix));

  setupEventListeners(gl.canvas);
  initGrid(game.pattern);
  // cam.updatePosition(); // init camera

  gameLoop();
}

window.onload = init;

let lastTimestamp = 0;
let msPerFrame = 1000 / game.fps;

export function setFPS(fps) {
  game.fps = fps;
  msPerFrame = 1000 / game.fps;
  console.log('fps', game.fps, msPerFrame);
  document.getElementById('fps').value = fps;
  console.log('fps', document.getElementById('fps').value);

  // document.getElementById('fps').value = fps;
}

export function gameLoop(timestamp) {
  const elapsed = timestamp - lastTimestamp;

  if (elapsed >= msPerFrame) {
    lastTimestamp = timestamp - (elapsed % msPerFrame);
    updateCellCountDisplay();

    if (!game.isOver && !game.isPaused) {
      updateGrid();
    }
    render();
  }

  if (true) {
    requestAnimationFrame(gameLoop);
  }
}

export function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  cam.updatePosition();
  let viewMatrix = cam.getViewMatrix();

  const instanceData = [];
  let instanceCount = 0;

  const gridCenter = game.dimensions.map((d) => (d - 1) / 2);
  const baseScale = 20 / Math.max(...game.dimensions);

  for (let x = 0; x < game.dimensions[0]; x++) {
    for (let y = 0; y < game.dimensions[1]; y++) {
      for (let z = 0; z < game.dimensions[2]; z++) {
        if (!game.currentGrid || game.currentGrid.length === 0) {
          continue;
        }
        if (game.currentGrid[x][y][z] === 1) {
          instanceData.push(
            (x - gridCenter[0]) * baseScale,
            (y - gridCenter[1]) * baseScale,
            (z - gridCenter[2]) * baseScale,
            neighborFraction(game.currentGrid, x, y, z)
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

  // Set cell scale uniform
  gl.uniform1f(glLoc.uCellScale, baseScale);

  // Set view matrix
  gl.uniformMatrix4fv(glLoc.uViewMatrix, false, flatten(viewMatrix));

  gl.uniform3fv(glLoc.uLightDirection, flatten(normalize([...lighting.lightDirection])));
  gl.uniform3fv(glLoc.uCellColor, lighting.cellColor);
  gl.uniform1f(glLoc.uLightIntensity, lighting.lightIntensity);
  gl.uniform3fv(glLoc.uSkyColor, lighting.skyColor);
  gl.uniform3fv(glLoc.uGroundColor, lighting.groundColor);
  gl.uniform1f(glLoc.uDiffuseWrap, lighting.diffuseWrap);
  gl.uniform1f(glLoc.uSpecularStrength, lighting.specularStrength);
  gl.uniform1f(glLoc.uOcclusionStrength, lighting.occlusionStrength);
  gl.uniform1f(glLoc.uOcclusionDirect, lighting.occlusionDirect);

  // Bind index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.indices);

  // Draw instanced geometries
  gl.drawElementsInstanced(
    gl.TRIANGLES,
    geometryBuffers.numIndices,
    gl.UNSIGNED_SHORT,
    0,
    instanceCount
  );
}

export function setHtmlValues() {
  document.getElementById('max-cells').textContent = `Max: ${Math.round(
    (game.maxCells / 5 / 10) * 10
  )}`;
  // document.getElementById('count-down').textContent = `${game.countDown}`;
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

document.getElementById('birth-1').addEventListener('input', function (e) {
  if (isNaN(e.target.value)) {
    game.rules.birth[0] = -1;
  } else if (parseInt(e.target.value) >= 0) {
    game.rules.birth[0] = parseInt(e.target.value);
  } else {
    game.rules.birth = game.rules.birth.slice(1);
  }
});

document.getElementById('birth-2').addEventListener('input', function (e) {
  if (isNaN(e.target.value)) {
    game.rules.birth[0] = -1;
  } else if (parseInt(e.target.value) >= 0) {
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
  const newFPS = parseInt(e.target.value);
  if (!isNaN(newFPS) && newFPS > 0) {
    setFPS(newFPS);
  }
});

document
  .getElementById('patternSelect')
  .addEventListener('change', function (e) {
    game.pattern = e.target.value;
  });

document.getElementById('shapeSelect').addEventListener('change', function (e) {
  setShape(e.target.value);
  setupGeometry();
});
