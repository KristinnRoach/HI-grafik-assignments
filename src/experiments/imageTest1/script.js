import { vec2, add, scale, flatten } from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';

// initShaders(gl, vertexShaderId, fragmentShaderId) returns a program object

const canvas = getCanvas();
const gl = getGL();
let program;

let aPos;
let aTexCoord;
let uImage;

function initBuffers() {
  const positions = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);

  const texCoords = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0];
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTexCoord);
}

function loadTexture(url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Put a single pixel in the texture so we can use it immediately
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );

  // Asynchronously load an image
  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = url;

  return texture;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function init() {
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  aPos = gl.getAttribLocation(program, 'aPos');
  aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
  uImage = gl.getUniformLocation(program, 'uImageTex');

  initBuffers();

  const texture = loadTexture('../../assets/img/boltiRight.png');
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uImage, 0);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  render();
}

window.onload = init;
