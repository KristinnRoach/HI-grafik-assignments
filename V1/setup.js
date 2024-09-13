// root/V1/setup.js

import { showError } from '../../lib/error.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';
import { initShaders } from '../../lib/initShaders.js';

export function initGL() {
  // /** @type {HTMLCanvasElement|null} */
  const canvas = getCanvas();
  // /** @type {WebGL2RenderingContext} */
  const gl = getGL();
  return { canvas, gl };
}

export function initProgram(gl) {
  try {
    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    const vPosLocation = gl.getAttribLocation(program, 'vPosition');
    if (vPosLocation < 0) {
      throw new Error('Failed to get attribute location for vPosition');
    }

    gl.enableVertexAttribArray(vPosLocation);

    return { program, vPosLocation };
  } catch (e) {
    showError(`Initialization error: ${e}`);
  }
}

export function initObjectBuffer(gl, obj, vertices) {
  if (!vertices) {
    vertices = [
      obj.x,
      obj.y,
      obj.x + obj.width,
      obj.y,
      obj.x,
      obj.y - obj.height,
      obj.x + obj.width,
      obj.y - obj.height,
    ];
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}

export function initBuffers(gl, gun, birds) {
  initObjectBuffer(gl, gun, [
    0,
    0,
    -gun.width / 2,
    -gun.height,
    gun.width / 2,
    -gun.height,
  ]);

  birds.forEach((bird) => initObjectBuffer(gl, bird));
}
