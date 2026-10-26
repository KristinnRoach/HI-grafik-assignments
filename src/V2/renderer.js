// renderer.js

import { perspective, flatten, normalize } from '../lib/MV.js';

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
import { game } from './game-state.js';

let geometryBuffers;
let instanceBuffer;
let stateBuffer;

// Visual effect toggles, flipped by dev-tuning.js
export const effects = {
  tween: true, // render every frame, grow/shrink cells between generations
  densityColor: true,
  fog: true,
  jitter: true, // per-cell random size, brightness and color
};

// Tweakable at runtime by dev-tuning.js
export const lighting = {
  cellColor: [0.3, 0.8, 0.4], // sRGB
  hotColor: [0.2, 0.4, 0.3], // sRGB, crowded cells
  densityMax: 0.7, // neighbour fraction that reads fully hot
  
  lightDirection: [0.8, -0.5, 0.8], // world space, towards the light
  lightIntensity: 1,
  skyColor: [0.5, 0.5, 0.5], // linear
  groundColor: [0.3, 0.3, 0.2], // linear
  diffuseWrap: 0.95,
  specularStrength: 0.25,

  occlusionStrength: 2,
  occlusionDirect: 0.15, // how much occlusion also dims direct light
  fogNear: 25, // view-space depth where fog starts
  fogFar: 72, // fully faded
  // Max relative size offset per cell, per shape (spheres tolerate more than cubes)
  sizeJitterCube: 0,
  sizeJitterSphere: 0.2,
  brightnessJitter: 0.2, // max relative brightness offset per cell
  colorJitter: 0.2, // max relative per-channel offset per cell
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

export function initRenderer() {
  setupWebGL();
  setupShaders();
  getAllGlLocations();

  setupGeometry();
  // Filled every frame in render()
  instanceBuffer = createInstancedBuffer(new Float32Array(), glLoc.aInstance, 4);
  stateBuffer = createInstancedBuffer(new Float32Array(), glLoc.aState, 1);

  const aspect = 1; // gl.canvas.width / gl.canvas.height;
  const projectionMatrix = perspective(
    cam.FIELD_OF_VIEW,
    aspect,
    cam.NEAR_PLANE,
    cam.FAR_PLANE
  );
  gl.uniformMatrix4fv(glLoc.uProjection, false, flatten(projectionMatrix));

  return gl.canvas;
}

export function setupGeometry() {
  try {
    if (geometryBuffers) {
      for (const buffer of Object.values(geometryBuffers)) {
        if (buffer instanceof WebGLBuffer) gl.deleteBuffer(buffer);
      }
    }

    const geometry = createGeometry(game.shape, { size: 1 });

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
  } catch (error) {
    console.error('Error in setupGeometry:', error);
  }
}

// tween: 0..1 progress from the previous generation to the current one
export function render(tween = 1) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  cam.updatePosition();
  let viewMatrix = cam.getViewMatrix();

  const instanceData = [];
  const stateData = [];
  let instanceCount = 0;

  // updateGrid swaps buffers, so nextGrid holds the previous generation
  const grid = game.currentGrid;
  const prevGrid = effects.tween ? game.nextGrid : grid;

  const gridCenter = game.dimensions.map((d) => (d - 1) / 2);
  const baseScale = 20 / Math.max(...game.dimensions);

  if (grid?.length) {
    for (let x = 0; x < game.dimensions[0]; x++) {
      for (let y = 0; y < game.dimensions[1]; y++) {
        for (let z = 0; z < game.dimensions[2]; z++) {
          const alive = grid[x][y][z] === 1;
          const wasAlive = (prevGrid?.[x]?.[y]?.[z] ?? 0) === 1;
          if (!alive && !wasAlive) continue;

          instanceData.push(
            (x - gridCenter[0]) * baseScale,
            (y - gridCenter[1]) * baseScale,
            (z - gridCenter[2]) * baseScale,
            neighborFraction(alive ? grid : prevGrid, x, y, z)
          );
          stateData.push(alive === wasAlive ? 0 : alive ? 1 : -1);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stateData), gl.DYNAMIC_DRAW);
  gl.uniform1f(glLoc.uTween, Math.min(tween, 1));

  // Cell size relative to grid spacing (1 = neighbours touch)
  const cellScale = game.shape === 'sphere' ? game.cellScaleSphere : game.cellScaleCube;
  gl.uniform1f(glLoc.uCellScale, baseScale * cellScale);

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
  gl.uniform3fv(glLoc.uHotColor, lighting.hotColor);
  gl.uniform1f(glLoc.uDensity, effects.densityColor ? 1 : 0);
  gl.uniform1f(glLoc.uDensityMax, lighting.densityMax);
  gl.uniform1f(glLoc.uFog, effects.fog ? 1 : 0);
  gl.uniform1f(glLoc.uFogNear, lighting.fogNear);
  gl.uniform1f(glLoc.uFogFar, lighting.fogFar);
  const sizeJitter =
    game.shape === 'sphere' ? lighting.sizeJitterSphere : lighting.sizeJitterCube;
  gl.uniform1f(glLoc.uSizeJitter, effects.jitter ? sizeJitter : 0);
  gl.uniform1f(glLoc.uBrightnessJitter, effects.jitter ? lighting.brightnessJitter : 0);
  gl.uniform1f(glLoc.uColorJitter, effects.jitter ? lighting.colorJitter : 0);

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
