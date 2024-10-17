/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Stigveldislíkan af fígúru.  Byggt á sýnidæmi úr kennslubók.
//     Í þessari útgáfu eru líkamshlutar hreyfðir með örvalyklum
//     og valið hvaða líkamshluta á að hreyfa með hnöppum.
//     Nú með teningum með mislitum hliðum
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////

import {
  vec3,
  vec4,
  flatten,
  mat4,
  perspective,
  rotateX,
  rotateY,
  rotateZ,
  translate,
  lookAt,
  mult,
} from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';

let canvas;
let gl;
let program;

let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;

let zDist = -25.0;

let projectionMatrix;
let modelViewMatrix;

let instanceMatrix;

let modelViewMatrixLoc;

const vertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0),
];

const vertexColors = [
  [0.0, 0.0, 0.0, 1.0], // black
  [1.0, 0.0, 0.0, 1.0], // red
  [1.0, 1.0, 0.0, 1.0], // yellow
  [0.0, 1.0, 0.0, 1.0], // green
  [0.0, 0.0, 1.0, 1.0], // blue
  [1.0, 0.0, 1.0, 1.0], // magenta
  [0.0, 1.0, 1.0, 1.0], // cyan
  [1.0, 1.0, 1.0, 1.0], // white
];

const torsoId = 0;
const headId = 1;
const head1Id = 1;
const head2Id = 10;
const leftUpperArmId = 2;
const leftLowerArmId = 3;
const rightUpperArmId = 4;
const rightLowerArmId = 5;
const leftUpperLegId = 6;
const leftLowerLegId = 7;
const rightUpperLegId = 8;
const rightLowerLegId = 9;

let currBodyPart = 0;

const torsoHeight = 5.0;
const torsoWidth = 1.0;
const upperArmHeight = 2.8;
const lowerArmHeight = 2.4;
const upperArmWidth = 0.4;
const lowerArmWidth = 0.3;
const upperLegWidth = 0.5;
const lowerLegWidth = 0.4;
const lowerLegHeight = 3.0;
const upperLegHeight = 3.0;
const headHeight = 1.3;
const headWidth = 0.8;

const lean = -18;

let theta = [40, 5, 125, 80, -130, 90, 60, -55, -30, -30, 0];

let stack = [];

let figure = [];

for (let i = 0; i < theta.length; i++)
  figure[i] = createNode(null, null, null, null);

let vBuffer;
let modelViewLoc;

let pointsArray = [];
let colorsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
  const result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

//--------------------------------------------

function createNode(transform, render, sibling, child) {
  const node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  };
  return node;
}

const torsoGap = 0.0;
let paused = false;
let baseSpeed = 0.1;
const slowmo = 0.01;

let time = 0;
let animationSpeed = slowmo; // ADD tracing effect to slowmo?

const bounceAmplitude = 0.6;
let bounceOffset;
let headBounce;

function initNodes(Id) {
  let m = mat4();
  switch (Id) {
    case torsoId:
      m = rotateY(theta[torsoId]);
      m = mult(m, translate(0.0, bounceOffset, 0.0));
      m = mult(m, rotateX(lean));
      figure[torsoId] = createNode(m, torso, null, headId);
      break;

    case headId:
    case head1Id:
    case head2Id:
      m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
      m = mult(m, translate(0.0, -0.35 * headHeight, 0.0));
      m = mult(m, translate(0.0, bounceOffset * 0.05, 0.0));
      m = mult(
        m,
        rotateX(theta[head1Id] * bounceOffset + 5 * (headBounce / 1.5))
      );

      m = mult(m, rotateY(theta[head2Id]));
      figure[headId] = createNode(m, head, leftUpperArmId, null);
      break;

    case leftUpperArmId:
      m = translate(-(torsoWidth + torsoGap), 0.9 * torsoHeight, 0.0);
      m = mult(m, translate(0.0, bounceOffset * 0.3, 0.0));
      m = mult(m, rotateX(theta[leftUpperArmId]));
      figure[leftUpperArmId] = createNode(
        m,
        leftUpperArm,
        rightUpperArmId,
        leftLowerArmId
      );
      break;

    case rightUpperArmId:
      m = translate(torsoWidth + torsoGap, 0.9 * torsoHeight, 0.0);
      m = mult(m, translate(0.0, bounceOffset * 0.3, 0.0));
      m = mult(m, rotateX(theta[rightUpperArmId]));
      figure[rightUpperArmId] = createNode(
        m,
        rightUpperArm,
        leftUpperLegId,
        rightLowerArmId
      );
      break;

    case leftUpperLegId:
      m = translate(-(torsoWidth + torsoGap), 0.1 * upperLegHeight, 0.0);
      m = mult(m, translate(0.0, bounceOffset * 0.7, 0.0));
      m = mult(m, rotateX(theta[leftUpperLegId] + 180));
      figure[leftUpperLegId] = createNode(
        m,
        leftUpperLeg,
        rightUpperLegId,
        leftLowerLegId
      );
      break;

    case rightUpperLegId:
      m = translate(torsoWidth + torsoGap, 0.1 * upperLegHeight, 0.0);
      m = mult(m, translate(0.0, bounceOffset * 0.7, 0.0));
      m = mult(m, rotateX(theta[rightUpperLegId] + 180));
      figure[rightUpperLegId] = createNode(
        m,
        rightUpperLeg,
        null,
        rightLowerLegId
      );
      break;

    case leftLowerArmId:
      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotateX(theta[leftLowerArmId]));
      figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
      break;

    case rightLowerArmId:
      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotateX(theta[rightLowerArmId]));
      figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
      break;

    case leftLowerLegId:
      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotateX(theta[leftLowerLegId]));
      figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
      break;

    case rightLowerLegId:
      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotateX(theta[rightLowerLegId]));
      figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
      break;
  }
}

function traverse(Id) {
  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * torsoHeight, 0.0)
  );

  instanceMatrix = mult(
    instanceMatrix,
    scale4(torsoWidth, torsoHeight, torsoWidth)
  );

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
  instanceMatrix = mult(
    instanceMatrix,
    scale4(headWidth, headHeight, headWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperArmWidth, upperArmHeight, upperArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperArmWidth, upperArmHeight, upperArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperLegWidth, upperLegHeight, upperLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperLegWidth, upperLegHeight, upperLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
  pointsArray.push(vertices[a]);
  pointsArray.push(vertices[b]);
  pointsArray.push(vertices[c]);
  pointsArray.push(vertices[d]);

  colorsArray.push(vertexColors[a]);
  colorsArray.push(vertexColors[a]);
  colorsArray.push(vertexColors[a]);
  colorsArray.push(vertexColors[a]);
}

function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = canvas.getContext('webgl2');
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  instanceMatrix = mat4();

  projectionMatrix = perspective(50.0, 1.0, 0.01, 100.0);
  modelViewMatrix = mat4();

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, 'modelViewMatrix'),
    false,
    flatten(modelViewMatrix)
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, 'projectionMatrix'),
    false,
    flatten(projectionMatrix)
  );

  modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');

  cube();

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  for (let i = 0; i < theta.length; i++) initNodes(i);

  //event listeners for mouse
  canvas.addEventListener('mousedown', function (e) {
    movement = true;
    origX = e.clientX;
    origY = e.clientY;
    e.preventDefault(); // Disable drag and drop
  });

  canvas.addEventListener('mouseup', function (e) {
    movement = false;
  });

  canvas.addEventListener('mousemove', function (e) {
    if (movement) {
      spinY = (spinY + (e.clientX - origX)) % 360;
      spinX = (spinX + (origY - e.clientY)) % 360;
      origX = e.clientX;
      origY = e.clientY;
    }
  });

  // Event listener for mousewheel
  window.addEventListener('mousewheel', function (e) {
    if (e.wheelDelta > 0.0) {
      zDist += 0.5;
    } else {
      zDist -= 0.5;
    }
  });

  render();
};

let audio = new Audio();
audio.src = '../../assets/audio/chariots-loop-1.wav';
audio.loop = true;
audio.volume = 0.3;
audio.pause();
// audio.preservesPitch = false;

function togglePause() {
  paused = !paused;
}

function toggleAudio() {
  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  } else {
    audio.play();
  }
}

document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case ' ': // space
      togglePause();
      break;
    case 'ArrowUp':
      animationSpeed = Math.min(animationSpeed + 0.01, 10);
      break;
    case 'ArrowDown':
      animationSpeed = Math.max(animationSpeed - 0.01, 0);
      break;
    case 'ArrowRight':
      animationSpeed = Math.min(animationSpeed + 0.1, 10);
      break;
    case 'ArrowLeft':
      animationSpeed = Math.max(animationSpeed - 0.1, 0);
      break;
    case 'r':
      animationSpeed = baseSpeed;
      break;
    case 's':
      animationSpeed = slowmo;
      break;
    case 'p':
      toggleAudio();
      break;
    case 'm':
      animationSpeed = slowmo;
      break;
  }
});

document.addEventListener('keyup', function (e) {
  if (e.key === 'm') {
    // Momentary slowmo
    animationSpeed = baseSpeed;
  }
});

const render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // staðsetja áhorfanda og meðhöndla músarhreyfingu
  let mv = lookAt(
    vec3(0.0, 0.0, zDist),
    vec3(0.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0)
  );

  mv = mult(mv, rotateY(245));
  mv = mult(mv, rotateX(spinX));
  mv = mult(mv, rotateY(spinY));

  if (!paused) {
    time += animationSpeed;

    // Animate upper limbs
    theta[leftUpperArmId] = 45 * Math.sin(time) + 190;
    theta[rightUpperArmId] = 45 * Math.sin(time + Math.PI) + 160;
    theta[leftUpperLegId] = 45 * Math.sin(time + Math.PI) + 25;
    theta[rightUpperLegId] = 45 * Math.sin(time) + 25;

    // Animate lower limbs
    theta[rightLowerArmId] = -45 * Math.sin(time) + 70;
    theta[leftLowerArmId] = -45 * Math.sin(time + Math.PI) + 70;
    theta[rightLowerLegId] = -30 * Math.sin(time) - 50;
    theta[leftLowerLegId] = -30 * Math.sin(time + Math.PI) - 50;

    // Animate head to look around
    theta[head2Id] = 30 * Math.cos(time * 0.1 + Math.PI);
    theta[head1Id] = 10 * Math.sin(time * 0.1) + Math.PI;

    headBounce = bounceAmplitude * Math.sin(time * 1.0);
    bounceOffset = bounceAmplitude * Math.abs(Math.sin(time * 1.0));

    for (let i = 0; i < theta.length; i++) initNodes(i);
  }

  modelViewMatrix = mv;
  traverse(torsoId);
  requestAnimFrame(render);

  // Audio
  if (animationSpeed === 0) {
    audio.pause();
  }

  audio.playbackRate = 0.5 + Math.abs(animationSpeed * (4.0 - 0.5));

  if (animationSpeed <= slowmo || animationSpeed >= 4) {
    audio.preservesPitch = false;
  } else {
    audio.preservesPitch = true;
  }
};

function lerp(a, b, t) {
  return a + t * (b - a);
}

function interpolateLogarithmic(t) {
  return Math.log10(t + 1);
}

function interpolateSmoothstep(t) {
  return t * t * (3 - 2 * t);
}

// // Event listener for keyboard
// window.addEventListener('keydown', function (e) {
//   switch (e.keyCode) {
//     case 38: // upp ör
//       theta[currBodyPart] =
//         theta[currBodyPart] < 180.0 ? theta[currBodyPart] + 5 : 180.0;
//       document.getElementById('currAngle').innerHTML = theta[currBodyPart];
//       initNodes(currBodyPart);
//       break;
//     case 40: // niður ör
//       theta[currBodyPart] =
//         theta[currBodyPart] > -180.0 ? theta[currBodyPart] - 5 : -180.0;
//       document.getElementById('currAngle').innerHTML = theta[currBodyPart];
//       initNodes(currBodyPart);
//       break;
//   }
// });

// document.getElementById('btnTorso').onclick = function () {
//   currBodyPart = torsoId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnHead2').onclick = function () {
//   currBodyPart = head2Id;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnHead1').onclick = function () {
//   currBodyPart = head1Id;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnLeftUpperArm').onclick = function () {
//   currBodyPart = leftUpperArmId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnLeftLowerArm').onclick = function () {
//   currBodyPart = leftLowerArmId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnRightUpperArm').onclick = function () {
//   currBodyPart = rightUpperArmId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnRightLowerArm').onclick = function () {
//   currBodyPart = rightLowerArmId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnLeftUpperLeg').onclick = function () {
//   currBodyPart = leftUpperLegId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnLeftLowerLeg').onclick = function () {
//   currBodyPart = leftLowerLegId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnRightUpperLeg').onclick = function () {
//   currBodyPart = rightUpperLegId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };

// document.getElementById('btnRightLowerLeg').onclick = function () {
//   currBodyPart = rightLowerLegId;
//   document.getElementById('currAngle').innerHTML = theta[currBodyPart];
// };
