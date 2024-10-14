// gl-utils.js

import { getGL, getCanvas } from '../lib/init-gl2.js';
import { initShaders } from '../lib/initShaders.js';

export let gl, program;

const bgColor = [0.0, 0.0, 0.0, 0.5];

export const glLoc = {
  aColor: null,
  aVertPos: null,
  aVertOffset: null,
  aTexPos: null,
  aNormal: null,

  uNormalMatrix: null,
  uModelView: null,
  uProjection: null,
  uLightDirection: null,
  uViewMatrix: null,
  uCellScale: null,
  uCellSpacing: null,
  uResolution: null,
  uSampler: null,
};

export function getAllGlLocations() {
  glLoc.aColor = gl.getAttribLocation(program, 'aColor');
  glLoc.aVertPos = gl.getAttribLocation(program, 'aVertPos');
  glLoc.aTexPos = gl.getAttribLocation(program, 'aTexPos');
  glLoc.aNormal = gl.getAttribLocation(program, 'aNormal');
  glLoc.aVertOffset = gl.getAttribLocation(program, 'aVertOffset');

  glLoc.uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');
  glLoc.uModelView = gl.getUniformLocation(program, 'uModelView');
  glLoc.uProjection = gl.getUniformLocation(program, 'uProjection');
  glLoc.uLightDirection = gl.getUniformLocation(program, 'uLightDirection');
  glLoc.uViewMatrix = gl.getUniformLocation(program, 'uViewMatrix');
  glLoc.uCellScale = gl.getUniformLocation(program, 'uCellScale');
  glLoc.uCellSpacing = gl.getUniformLocation(program, 'uCellSpacing');
  glLoc.uResolution = gl.getUniformLocation(program, 'uResolution');
  glLoc.uSampler = gl.getUniformLocation(program, 'uSampler');
}

export function setupWebGL() {
  const canvas = getCanvas();
  gl = getGL();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
}

export function setupShaders() {
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);
}

export function createBuffer(data, attribute, size, usage = gl.STATIC_DRAW) {
  const buffer = gl.createBuffer();
  gl.enableVertexAttribArray(attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  return buffer;
}

export function createIndexBuffer(data, usage = gl.STATIC_DRAW) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
  return buffer;
}

export function createInstancedBuffer(
  data,
  attribute,
  size,
  usage = gl.DYNAMIC_DRAW
) {
  const buffer = gl.createBuffer();
  gl.enableVertexAttribArray(attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(attribute, 1);
  return buffer;
}

export function bindBuffer(target, buffer, attribute, size) {
  gl.bindBuffer(target, buffer);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
}

export function createTexture(image) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

export function bindTexture(texture, unit = 0) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  return unit;
}

export function checkGLError(label) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`GL error after ${label}: ${error}`);
  }
}
