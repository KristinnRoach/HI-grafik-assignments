// gl-utils.js

import { getGL, getCanvas } from '../lib/init-gl2.js';
import { initShaders } from '../lib/initShaders.js';

export let gl, program;

const bgColor = [0.0, 0.0, 0.0, 0.5];

export const glPos = {
  aColor: null,
  aPosition: null,
  aNormal: null,
  uNormalMatrix: null,
  uModelView: null,
  uProjection: null,
  uLightDirection: null,
  uViewMatrix: null,
  uCellScale: null,
  uCellSpacing: null,
};

export function setupWebGL() {
  const canvas = getCanvas();
  gl = getGL();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.frontFace(gl.CCW);
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK);
}

export function createBuffer(data, attribute, size, usage = gl.STATIC_DRAW) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
  return buffer;
}

export function createInstancedBuffer(
  data,
  attribute,
  size,
  usage = gl.DYNAMIC_DRAW
) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribDivisor(attribute, 1);
  return buffer;
}

export function setupShaders() {
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);
}
