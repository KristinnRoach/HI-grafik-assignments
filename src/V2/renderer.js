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

export function initRenderer() {
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
