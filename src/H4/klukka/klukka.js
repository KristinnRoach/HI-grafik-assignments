import {
  mult,
  rotateX,
  rotateY,
  rotateZ,
  translate,
  scalem,
  mat4,
  vec3,
  flatten,
} from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';

const canvas = getCanvas();
const gl = getGL();
let program;

let numVertices = 36;

let points = [];
let colors = [];

let movement = false;
let spinX = 0;
let spinY = 0;
let orgX;
let orgY;

let aColor;
let aPosition;

let uMatRotation;
let uRandomV4;

let hours, minutes, seconds;
let speed = 100; // 1 = real-time
let isPaused = false;

let scale = 1;

let colorBuffer = gl.createBuffer();
let randomColor = false;

window.onload = function init() {
  colorCube();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  aColor = gl.getAttribLocation(program, 'aColor');
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  uMatRotation = gl.getUniformLocation(program, 'uMatRotation');
  uRandomV4 = gl.getUniformLocation(program, 'uRandomV4');

  gl.uniform4fv(uRandomV4, [1.0, 1.0, 1.0, 1.0]);

  //event listeners for mouse
  canvas.addEventListener('mousedown', function (e) {
    movement = true;
    orgX = e.offsetX;
    orgY = e.offsetY;
    e.preventDefault(); // Disable drag and drop
  });

  canvas.addEventListener('mouseup', function (e) {
    movement = false;
  });

  canvas.addEventListener('mousemove', function (e) {
    if (movement) {
      spinY = (spinY + (orgX - e.offsetX)) % 360;
      spinX = (spinX + (orgY - e.offsetY)) % 360;
      orgX = e.offsetX;
      orgY = e.offsetY;
    }
  });

  canvas.addEventListener('dblclick', function (e) {
    spinX = 0;
    spinY = 0;
    scale = 1;
    resetColor();
    if (!isPaused) speed = 100;
  });

  canvas.addEventListener('wheel', function (e) {
    if (e.deltaY < 0 && speed < 10000) {
      speed *= 1.5;
    } else if (e.deltaY > 0 && speed > 1) {
      speed /= 1.5;
    }
  });

  window.addEventListener('keydown', function (e) {
    switch (e.code) {
      case 'ArrowUp':
        speed = Math.min(speed * 1.25, 10000);
        break;

      case 'ArrowDown':
        speed = Math.max(speed / 1.25, 1);
        break;

      case 'ArrowRight':
        scale = Math.min(scale * 1.1, 3);
        break;

      case 'ArrowLeft':
        scale = Math.max(scale / 1.1, 0.1);
        break;

      case 'Space':
        isPaused = !isPaused;
        break;

      case 'KeyC':
        randomizeColor();
        break;

      case 'KeyR':
        speed = 100;
        scale = 1;
        spinX = 0;
        spinY = 0;
        totalSeconds = 0;
        isPaused = false;
        resetColor();
        break;
    }
  });

  render();
};

function randomizeColor() {
  randomColor = true;
  colors = [];
  colorCube();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  randomizeUniform();
}

function randomizeUniform() {
  let randIndx = Math.floor(Math.random() * 5);
  gl.uniform4fv(uRandomV4, [
    randIndx === 0 ? 1.0 : Math.random(),
    randIndx === 1 ? 1.0 : Math.random(),
    randIndx === 2 ? 1.0 : Math.random(),
    randIndx === 3 ? 1.0 : Math.random() + 0.7,
  ]);
}

function resetColor() {
  gl.uniform4fv(uRandomV4, [1.0, 1.0, 1.0, 1.0]);
}

function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
  let vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
  ];

  let vertexColors = [
    [0.0, 0.0, 0.0, 1.0], // black
    [1.0, 0.0, 0.0, 1.0], // red
    [1.0, 1.0, 0.0, 1.0], // yellow
    [0.0, 1.0, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [0.0, 1.0, 1.0, 1.0], // cyan
    [1.0, 1.0, 1.0, 1.0], // white
  ];

  let indices = [a, b, c, a, c, d];

  if (randomColor) a = Math.floor(Math.random() * 5 + 1);

  for (var i = 0; i < indices.length; ++i) {
    points.push(vertices[indices[i]]);
    colors.push(vertexColors[a]);
  }
}

let lastTime = Date.now();
let currentSpeed = speed;
let totalSeconds = 0;

const handLength = 0.333;
const handWidth = handLength / 10;
const thicccnezz = handWidth / 3;

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  if (!isPaused) {
    currentSpeed += (speed - currentSpeed) * 0.1;

    const elapsedSeconds = deltaTime * currentSpeed;
    totalSeconds += elapsedSeconds;

    hours = Math.floor(totalSeconds / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
    seconds = Math.floor(totalSeconds % 60);
  }

  const hourAngle = -360 * (hours / 12 + minutes / 720 + seconds / 43200);
  const minuteAngle = -360 * (minutes / 60 + seconds / 3600);
  const secondAngle = -360 * (seconds / 60);

  let mv = mat4();
  mv = mult(mv, rotateX(spinX));
  mv = mult(mv, rotateY(spinY));
  mv = mult(mv, scalem(scale, scale, scale));

  // klukkutímar
  let mvHours = mult(mv, rotateZ(hourAngle));
  mvHours = mult(mvHours, translate(0, handLength / 2, 0));
  mvHours = mult(mvHours, scalem(handWidth, handLength, thicccnezz));
  gl.uniformMatrix4fv(uMatRotation, false, flatten(mvHours));
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);

  // mínútur
  let mvMin = mult(mv, rotateZ(hourAngle));
  mvMin = mult(mvMin, translate(0, handLength, 0));
  mvMin = mult(mvMin, rotateZ(minuteAngle - hourAngle));
  mvMin = mult(mvMin, translate(0, handLength / 2, 0));
  mvMin = mult(mvMin, scalem(handWidth / 2, handLength, thicccnezz));

  gl.uniformMatrix4fv(uMatRotation, false, flatten(mvMin));
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);

  // sekúndur
  let mvSec = mult(mv, rotateZ(hourAngle));
  mvSec = mult(mvSec, translate(0, handLength, 0));
  mvSec = mult(mvSec, rotateZ(minuteAngle - hourAngle));
  mvSec = mult(mvSec, translate(0, handLength, 0));
  mvSec = mult(mvSec, rotateZ(secondAngle - minuteAngle));
  mvSec = mult(mvSec, translate(0, handLength / 2, 0));
  mvSec = mult(mvSec, scalem(handWidth / 3, handLength, thicccnezz));
  gl.uniformMatrix4fv(uMatRotation, false, flatten(mvSec));
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);

  requestAnimationFrame(render);
}
