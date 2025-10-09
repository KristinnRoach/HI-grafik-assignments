import { vec2, add, scale, flatten } from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';

const canvas = getCanvas();
const gl = getGL();
const NumPoints = 5000;

let program;
let points;

let uTranslate;
let uColor;
let uZoom;
let uPointSize;

let isMouseDown = false;
let lastX = 0;
let lastY = 0;
let currentX = 0;
let currentY = 0;

let currentPointSize = 1;
let currentZoom = 1;
const zoomSpeed = 0.001;

window.onload = function init() {
  let vertices = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)];

  // Specify a starting point p
  let u = add(vertices[0], vertices[1]);
  let v = add(vertices[0], vertices[2]);
  let p = scale(0.25, add(u, v));
  points = [p];

  // Compute points
  for (let i = 0; points.length < NumPoints; ++i) {
    let j = Math.floor(Math.random() * 3);
    p = add(points[i], vertices[j]);
    p = scale(0.5, p);
    points.push(p);
  }

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 0.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // Load the points into the GPU
  let pBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate out shader variables with our points buffer
  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  uTranslate = gl.getUniformLocation(program, 'uTranslate');
  uColor = gl.getUniformLocation(program, 'uColor');
  uZoom = gl.getUniformLocation(program, 'uZoom');
  uPointSize = gl.getUniformLocation(program, 'uPointSize');

  gl.uniform1f(uZoom, currentZoom);
  gl.uniform1f(uPointSize, currentPointSize);

  setColor(0.0, 0.0, 0.0, 1.0); // init color

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, points.length);
}

function getGLCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((clientY - rect.top) / canvas.height) * 2 + 1;
  return { x, y };
}

function setColor(r, g, b, a) {
  gl.uniform4f(uColor, r, g, b, a);
}
function setTranslation(x, y) {
  gl.uniform2f(uTranslate, x, y);
}

function setPointSize(size) {
  currentPointSize = size;
  gl.uniform1f(uPointSize, size);
}

function setZoom(zoom) {
  currentZoom += zoom;
  setPointSize(Math.abs(currentZoom));
  gl.uniform1f(uZoom, currentZoom);
}

canvas.addEventListener('mousedown', function (e) {
  e.preventDefault();
  const coords = getGLCoords(e.clientX, e.clientY);
  lastX = coords.x;
  lastY = coords.y;
  isMouseDown = true;
});

canvas.addEventListener('mouseup', function (e) {
  e.preventDefault();
  isMouseDown = false;
});

canvas.addEventListener('mousemove', function (e) {
  e.preventDefault();
  if (isMouseDown) {
    const coords = getGLCoords(e.clientX, e.clientY);
    const dx = coords.x - lastX;
    const dy = coords.y - lastY;
    currentX += dx;
    currentY += dy;

    setTranslation(currentX, currentY);
    render();

    lastX = coords.x;
    lastY = coords.y;
  }
});

// Add zoom with mouse wheel
canvas.addEventListener('wheel', function (e) {
  e.preventDefault();
  const delta = e.deltaY * zoomSpeed * currentPointSize;
  setZoom(delta);
  render();
});

window.addEventListener('keydown', function (e) {
  console.log(e.code, ' ', e.key);

  if (e.code === 'Space') {
    e.preventDefault();
    setColor(Math.random(), Math.random(), Math.random(), 1.0);
    render();
  }

  if (e.code === 'KeyR' || e.key.toLowerCase() === 'r') {
    e.preventDefault();
    currentX = 0;
    currentY = 0;
    setTranslation(0.0, 0.0);
    currentRotation = 0.0;
    setRotation(0.0);
    currentZoom = 1.0;
    setZoom(0.0);
    setColor(0.0, 0.0, 0.0, 1.0);
    render();
    const coords = getGLCoords(e);
    lastX = coords.x;
    lastY = coords.y;
  }
});
