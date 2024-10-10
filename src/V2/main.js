// main.js

import {
  perspective,
  flatten,
  mult,
  scalem,
  transpose,
  mat3,
  inverse,
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
  gl,
  glPos,
  program,
} from './gl-utils.js';
import { createGeometry } from './geometry.js';
import { initGrid, updateGrid } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game } from './game-state.js';

export let geometryBuffers;
export let instanceBuffer;

// window.onload = function init() {
export function init() {
  setHtmlValues();

  setupWebGL();

  const geometry = createGeometry(game.shape, {
    size: 1,
    color: [0.34, 0.8, 0.1, 1.0],
  });

  setupShaders();

  glPos.aColor = gl.getAttribLocation(program, 'aColor');
  glPos.aPosition = gl.getAttribLocation(program, 'aPosition');

  glPos.aOffset = gl.getAttribLocation(program, 'aOffset');

  glPos.uProjection = gl.getUniformLocation(program, 'uProjection');
  glPos.uLightDirection = gl.getUniformLocation(program, 'uLightDirection');

  glPos.aNormal = gl.getAttribLocation(program, 'aNormal');
  glPos.uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');

  glPos.uViewMatrix = gl.getUniformLocation(program, 'uViewMatrix');
  glPos.uCellScale = gl.getUniformLocation(program, 'uCellScale');

  geometryBuffers = {
    vertices: createBuffer(
      new Float32Array(flatten(geometry.vertices)),
      glPos.aPosition,
      3
    ),
    colors: createBuffer(
      new Float32Array(flatten(geometry.colors)),
      glPos.aColor,
      4
    ),
    normals: createBuffer(
      new Float32Array(flatten(geometry.normals)),
      glPos.aNormal,
      3
    ),
    indices: gl.createBuffer(),
    numIndices: geometry.numIndices, // Add this line
  };

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

  const initialInstanceData = new Float32Array(
    game.dimensions[0] * game.dimensions[1] * game.dimensions[2] * 3
  );

  instanceBuffer = createInstancedBuffer(initialInstanceData, glPos.aOffset, 3);

  // createBuffer(new Float32Array(flatten(colors)), glPos.aColor, 4);
  // createBuffer(new Float32Array(flatten(points)), glPos.aPosition, 3);
  // normalBuffer = createBuffer(
  //   new Float32Array(flatten(normals)),
  //   glPos.aNormal,
  //   3
  // );

  const aspect = 1; // gl.canvas.width / gl.canvas.height;
  const projectionMatrix = perspective(
    cam.FIELD_OF_VIEW,
    aspect,
    cam.NEAR_PLANE,
    cam.FAR_PLANE
  );
  gl.uniformMatrix4fv(glPos.uProjection, false, flatten(projectionMatrix));

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

    if (true) {
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

  for (let x = 0; x < game.dimensions[0]; x++) {
    for (let y = 0; y < game.dimensions[1]; y++) {
      for (let z = 0; z < game.dimensions[2]; z++) {
        if (!game.currentGrid || game.currentGrid.length === 0) {
          continue;
        }
        if (game.currentGrid[x][y][z] === 1) {
          // instanceData.push(
          //   x - game.dimensions[0] / 2 + 0.5 * game.cellScale,
          //   y - game.dimensions[1] / 2 + 0.5 * game.cellScale,
          //   z - game.dimensions[2] / 2 + 0.5 * game.cellScale
          // );
          instanceData.push(
            (x - gridCenter[0]) * game.cellScale,
            (y - gridCenter[1]) * game.cellScale,
            (z - gridCenter[2]) * game.cellScale
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
  gl.uniform1f(glPos.uCellScale, game.cellScale);

  // Set view matrix
  gl.uniformMatrix4fv(glPos.uViewMatrix, false, flatten(viewMatrix));

  // Bind normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.normals);
  gl.vertexAttribPointer(glPos.aNormal, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(glPos.aNormal);

  // Set light direction uniform
  if (game.shape === 'sphere') {
    // need to adjust normals or keep separate light direction for cubes n spheres
    gl.uniform3fv(glPos.uLightDirection, flatten(normalize([5.0, -0.9, 1.0])));
  } else {
    gl.uniform3fv(
      glPos.uLightDirection,
      flatten(normalize([-0.01, -0.5, 0.05]))
    );
  }

  // Set normal matrix
  const normalMatrix = mat3(transpose(inverse(viewMatrix)));
  gl.uniformMatrix3fv(glPos.uNormalMatrix, false, flatten(normalMatrix));

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

// // Draw instanced cubes
// gl.drawArraysInstanced(gl.TRIANGLES, 0, NUM_VERTICES, instanceCount);

// function transformLightDirection(lightDir, viewMatrix) {
//   // Convert light direction to vec4 for matrix multiplication
//   const lightDirVec4 = vec4(lightDir[0], lightDir[1], lightDir[2], 0.0);

//   // Transform light direction to view space
//   const inverseViewMatrix = inverse(viewMatrix);
//   const transformedLightDir = normalize(
//     vec3(mult(inverseViewMatrix, lightDirVec4))
//   );

//   return transformedLightDir;
// }

export function setHtmlValues() {
  // document.getElementById('grid-scale').value = game.gridScale;
  // document.getElementById('cell-scale').value = game.cellScale;
  document.getElementById('fps').value = game.fps;
  document.getElementById('patternSelect').value = game.pattern;
  document.getElementById('birth-1').value = game.rules.birth[0];
  document.getElementById('birth-2').value = game.rules.birth[1];
  document.getElementById('survival-1').value = game.rules.survival[0];
  document.getElementById('survival-2').value = game.rules.survival[1];
  document.getElementById('survival-3').value = game.rules.survival[2];
}

export function getHtmlValues() {
  return {
    fps: parseInt(document.getElementById('fps').value) || 16,
    pattern: document.getElementById('patternSelect').value,
    birth: [
      parseInt(document.getElementById('birth-1').value) || 4,
      parseInt(document.getElementById('birth-2').value) || 5,
    ],
    survival: [
      parseInt(document.getElementById('survival-1').value) || 2,
      parseInt(document.getElementById('survival-2').value) || 4,
      parseInt(document.getElementById('survival-3').value) || 7,
    ],
  };
}

// document.getElementById('grid-scale').addEventListener('input', function (e) {
//   if (parseInt(e.target.value) > 0.0 && !isNaN(e.target.value)) {
//     game.gridScale = parseFloat(e.target.value);
//   }
// });

// document.getElementById('cell-scale').addEventListener('input', function (e) {
//   if (parseInt(e.target.value) > 0.0 && !isNaN(e.target.value)) {
//     game.cellScale = parseFloat(e.target.value);
//   }
// });

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

// from render function
// Define world-space light direction
//const worldLightDir = normalize([1.0, 0.0, 0.0]);

// Transform light direction to view space
// const viewSpaceLightDir = transformLightDirection(worldLightDir, viewMatrix);

// console.log('View space light direction:', viewSpaceLightDir);

// console.log('Cell size:', game.cellScale * cellSpacing);
// console.log('Instance count:', instanceCount);

// console.log('View Matrix:', viewMatrix);
// console.log('Model View Matrix:', modelViewMatrix);
