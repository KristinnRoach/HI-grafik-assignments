// gl-utils.js

import { getGL, getCanvas } from '../lib/init-gl2.js';
import { initShaders } from '../lib/initShaders.js';

export let gl, program;

const bgColor = [0.0, 0.0, 0.2, 1.0];

export const glPos = {
  aColor: null,
  aPosition: null,
  uModelView: null,
  uProjection: null,
};

export function setupWebGL() {
  const canvas = getCanvas();
  gl = getGL();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
  gl.enable(gl.DEPTH_TEST);
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
