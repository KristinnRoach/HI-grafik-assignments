// root/lib/init-gl2.js

/** @type {HTMLCanvasElement|null} */
const canvas = document.getElementById('gl-canvas');

/** @type {WebGL2RenderingContext} */
const gl = canvas.getContext('webgl2');

function initCanvas() {
  if (!canvas) throw new Error('Could not find HTML canvas element');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function initViewPort() {
  if (!gl) throw new Error('Could not init gl viewport');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

initCanvas();
initViewPort();

export function getGL() {
  if (!gl) {
    throw new Error('Could not get WebGL2 context: ', gl);
  }
  return gl;
}

export function getCanvas() {
  if (!canvas) {
    throw new Error('Could not find HTML canvas element');
  }
  return canvas;
}
