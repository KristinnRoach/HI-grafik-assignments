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
  createIndexBuffer,
  setupShaders,
  bindBuffer,
  bindTexture,
  gl,
  glLoc,
  program,
  getAllGlLocations,
  checkGLError,
} from './gl-utils.js';
import { createGeometry } from './geometry.js';
import { initGrid, updateGrid } from './game-logic.js';
import { setupEventListeners } from './event-handlers.js';
import { game, setShape, updateCellCountDisplay } from './game-state.js';

export let geometry;
export let geometryBuffers;
export let instanceBuffer;
export let texture;

export function initGeometry() {
  geometry = createGeometry(game.shape, {
    size: 1,
    color: [0.34, 0.8, 0.1, 1.0],
  });
}

export function initGeoBuffers() {
  try {
    geometryBuffers = {
      vertPos: createBuffer(
        new Float32Array(flatten(geometry.vertices)), // data
        glLoc.aVertPos, // attribute to bind to
        3 // size
      ),
      texPos: createBuffer(
        new Float32Array(flatten(geometry.uvs)),
        glLoc.aTexPos,
        2
      ),
      color: createBuffer(
        new Float32Array(flatten(geometry.colors)),
        glLoc.aColor,
        4
      ),
      normal: createBuffer(
        new Float32Array(flatten(geometry.normals)),
        glLoc.aNormal,
        3
      ),
      index: createIndexBuffer(new Uint16Array(geometry.indices)),
      numIndices: geometry.numIndices,
    };
    console.log('Geometry buffers created:', geometryBuffers);
  } catch (error) {
    console.error('Error in setGeoBuffers:', error);
  }
}

// window.onload = function init() {
export function init() {
  setHtmlValues();
  setupWebGL();
  setupShaders();

  if (!gl) {
    console.error('WebGL context is not available');
    return;
  }

  // Get attribute and uniform locations
  getAllGlLocations();

  // Create geometry and buffers
  initGeometry(game.shape);
  initGeoBuffers(game.shape);

  // Set up texture
  gl.uniform2fv(glLoc.uResolution, [gl.canvas.width, gl.canvas.height]);
  glLoc.uSampler = gl.getUniformLocation(program, 'uSampler');

  setupTex();

  // Set up instance buffer
  const initialInstanceData = new Float32Array(
    game.dimensions[0] * game.dimensions[1] * game.dimensions[2] * 3
  );

  instanceBuffer = createInstancedBuffer(
    initialInstanceData,
    glLoc.aVertOffset,
    3
  );

  // Set up projection matrix
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

// window.onload = init;

const image = new Image();
image.src = '/src/V2/tex1.png';

image.onload = function () {
  console.log('Image loaded');
  init();
};

function setupTex() {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Generate mipmaps (optional)
  // gl.generateMipmap(gl.TEXTURE_2D);

  // Bind the texture to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the sampler to use texture unit 0
  gl.uniform1i(glLoc.uSampler, 0);

  // Test texture mapping // create separate function for this
  const texMatrix = mat3();
  texMatrix[0][0] = 1.0; // Scale X
  texMatrix[1][1] = 1.0; // Scale Y
  gl.uniformMatrix3fv(
    gl.getUniformLocation(program, 'uTexMatrix'),
    false,
    flatten(texMatrix)
  );
}

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

function updateInstanceData() {
  const instanceData = [];
  let instanceCount = 0;
  const gridCenter = game.dimensions.map((d) => (d - 1) / 2);
  const baseScale = 20 / Math.max(...game.dimensions);
  const spacedScale = baseScale * game.cellSpacing;

  for (let x = 0; x < game.dimensions[0]; x++) {
    for (let y = 0; y < game.dimensions[1]; y++) {
      for (let z = 0; z < game.dimensions[2]; z++) {
        if (game.currentGrid && game.currentGrid[x][y][z] === 1) {
          instanceData.push(
            (x - gridCenter[0]) * spacedScale,
            (y - gridCenter[1]) * spacedScale,
            (z - gridCenter[2]) * spacedScale
          );
          instanceCount++;
        }
      }
    }
  }

  return { instanceData, instanceCount, baseScale };
}

function updateInstanceBuffer(instanceData) {
  // Update instance buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(instanceData),
    gl.DYNAMIC_DRAW
  );
  gl.vertexAttribPointer(glLoc.aVertOffset, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(glLoc.aVertOffset);
  gl.vertexAttribDivisor(glLoc.aVertOffset, 1);
}

export function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  cam.updatePosition();
  let viewMatrix = cam.getViewMatrix();

  const { instanceData, instanceCount, baseScale } = updateInstanceData();

  // console.log('Number of instances:', instanceCount);
  // console.log('Instance data length:', instanceData.length);
  // console.log('Number of indices:', geometryBuffers.numIndices);
  // console.log('Vertex buffer length:', geometry.vertices.length);

  updateInstanceBuffer(instanceData);

  // Update and bind buffers
  bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.vertPos, glLoc.aVertPos, 3);
  bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.color, glLoc.aColor, 4);
  bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.normal, glLoc.aNormal, 3);
  bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.texPos, glLoc.aTexPos, 2);

  // Set uniforms
  gl.uniform1f(glLoc.uCellScale, baseScale);
  gl.uniformMatrix4fv(glLoc.uViewMatrix, false, flatten(viewMatrix));

  setUpLighting();

  const normalMatrix = mat3(transpose(inverse(viewMatrix)));
  gl.uniformMatrix3fv(glLoc.uNormalMatrix, false, flatten(normalMatrix));

  // Bind texture
  bindTexture(texture);

  checkGLError('Before draw call');

  // Draw instanced geometries
  gl.drawElementsInstanced(
    gl.TRIANGLES,
    geometryBuffers.numIndices,
    gl.UNSIGNED_SHORT,
    0,
    instanceCount
  );

  checkGLError('After draw call');
}

//   // Update instance buffer
//   gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
//   gl.bufferData(
//     gl.ARRAY_BUFFER,
//     new Float32Array(instanceData),
//     gl.DYNAMIC_DRAW
//   );
//   gl.vertexAttribPointer(glLoc.aOffset, 3, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(glLoc.aOffset);
//   gl.vertexAttribDivisor(glLoc.aOffset, 1);

//   // Update instance buffer
//   const instanceDataArray = new Float32Array(instanceData);
//   gl.bufferData(gl.ARRAY_BUFFER, instanceDataArray, gl.DYNAMIC_DRAW);
//   console.log(
//     'Instance buffer updated with',
//     instanceDataArray.length,
//     'floats'
//   );

//   // Set cell scale uniform
//   gl.uniform1f(glLoc.uCellScale, baseScale);

//   // Set view matrix
//   gl.uniformMatrix4fv(glLoc.uViewMatrix, false, flatten(viewMatrix));

//   setUpLighting();

//   // Set normal matrix
//   const normalMatrix = mat3(transpose(inverse(viewMatrix)));
//   gl.uniformMatrix3fv(glLoc.uNormalMatrix, false, flatten(normalMatrix));

//   // Bind UV buffer
//   gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.texPos);
//   gl.vertexAttribPointer(glLoc.aTexPos, 2, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(glLoc.aTexPos);

//   console.log('aTexPos location:', glLoc.aTexPos);
//   // Bind the texture before drawing
//   gl.activeTexture(gl.TEXTURE0);
//   gl.bindTexture(gl.TEXTURE_2D, texture);

//   // Bind index buffer
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.index);

//   // Update instance buffer
//   gl.bufferData(
//     gl.ARRAY_BUFFER,
//     new Float32Array(instanceData),
//     gl.DYNAMIC_DRAW
//   );

//   // // Draw geometries (non-instanced)
//   // const limitedInstanceCount = Math.min(instanceCount, 5);
//   // gl.drawElementsInstanced(
//   //   gl.TRIANGLES,
//   //   geometryBuffers.numIndices,
//   //   gl.UNSIGNED_SHORT,
//   //   0,
//   //   limitedInstanceCount
//   // );

//   // Draw instanced geometries
//   gl.drawElementsInstanced(
//     gl.TRIANGLES,
//     geometryBuffers.numIndices,
//     gl.UNSIGNED_SHORT,
//     0,
//     instanceCount
//   );
// }

function setUpLighting() {
  if (game.shape === 'sphere') {
    // keep separate light direction for cubes versus spheres // otherwise, adjust normals?
    gl.uniform3fv(glLoc.uLightDirection, flatten(normalize([5.0, -0.9, 1.0])));
  } else {
    gl.uniform3fv(
      glLoc.uLightDirection,
      flatten(normalize([-0.01, -0.5, 0.05]))
    );
  }
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
  if (e.target.value === 'Cubes') {
    setShape('cube');
  } else if (e.target.value === 'Spheres') {
    setShape('sphere');
  }
});
