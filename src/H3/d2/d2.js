import { vec2, flatten } from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';

const canvas = getCanvas();
const gl = getGL();
let program;
let uTime;
let iniTime;
let vPosition;

window.onload = function init() {
  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  //  The vertices of a square, filling the whole canvas
  let vertices = [
    vec2(-1, -1),
    vec2(1, -1),
    vec2(1, 1),
    vec2(-1, -1),
    vec2(1, 1),
    vec2(-1, 1),
  ];

  // Load the data into the GPU
  let bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate shader variables with our data buffer
  vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  uTime = gl.getUniformLocation(program, 'uTime');

  iniTime = Date.now();

  //  Get canvas resolution and send to shaders
  const canvasRes = vec2(canvas.width, canvas.height);

  gl.uniform2fv(
    gl.getUniformLocation(program, 'uResolution'),
    flatten(canvasRes)
  );

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  let msek = Date.now() - iniTime;
  gl.uniform1f(uTime, msek);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(render);
}
