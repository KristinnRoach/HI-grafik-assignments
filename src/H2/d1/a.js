'use strict';

var gl;
var points;
var vertices;
var p;
var NumPoints = 0;
var bufferId;
var vPosition;
var animationId;
var isAnimating = false;
var scaleFactor = 5;
var scaleDirection = 1;
const scaleMin = 0.1;
const scaleMax = 5.0;

window.onload = function init() {
  var canvas = document.getElementById('gl-canvas');

  // gl = WebGLUtils.setupWebGL(canvas);
  gl = canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL2 is not available');
  }

  // Initialize corners
  vertices = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)];

  // Initialize p - (endar alltaf í réttu formi, sama hvar upphafspunkturinn er)
  p = vec2(666, -999);

  // Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 0.0);

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);
  bufferId = gl.createBuffer();
  vPosition = gl.getAttribLocation(program, 'vPosition');

  // Add start, stop, reset buttons
  var container = document.createElement('div');
  container.id = 'button-container';
  container.classList.add('button-container');
  document.body.appendChild(container);

  var startButton = document.createElement('button');
  startButton.textContent = 'Start Animation';
  startButton.onclick = startAnimation;
  container.appendChild(startButton);

  var stopButton = document.createElement('button');
  stopButton.textContent = 'Stop Animation';
  stopButton.onclick = stopAnimation;
  container.appendChild(stopButton);

  var resetButton = document.createElement('button');
  resetButton.textContent = 'Reset';
  resetButton.onclick = reset;
  container.appendChild(resetButton);
};

function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    requestAnimationFrame(updateAndRender);
  }
}

function stopAnimation() {
  isAnimating = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}

function reset() {
  NumPoints = 0;
  scaleDirection = 1;
  scaleFactor = 10;
  points = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function updateAndRender() {
  if (!isAnimating) return;

  points = [p]; // Reset points with p

  // accellerate and decellerate
  switch (Math.floor(NumPoints / 1000)) {
    case 0:
      NumPoints += 50;
      break;
    case 1:
      NumPoints += 200;
      break;
    case 2:
      NumPoints += 300;
      break;
    case 3:
      NumPoints += 200;
      break;
    case 4:
      NumPoints += 100;
      break;
    default:
      // stop if NumPoints is over 100000
      break;
  }

  if (scaleFactor <= scaleMin) {
    scaleDirection = 1; // Start increasing
  } else if (scaleFactor >= scaleMax) {
    scaleDirection = 0; // Start decreasing
  }

  scaleFactor += scaleDirection === 1 ? 0.01 : -0.01;
  scaleFactor = Math.max(scaleMin, Math.min(scaleMax, scaleFactor));

  // Generate new points
  for (var i = 0; points.length < NumPoints; ++i) {
    var j = Math.floor(Math.random() * 3);
    p = add(points[i], scale(scaleFactor, vertices[j]));
    p = scale(0.5, p);
    points.push(p);
  }

  // Load the new data into the GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Render
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, points.length);

  // change p just for fun for next frame
  p = vec2(Math.random() * Math.random(), Math.random() * Math.random());

  // Schedule the next frame
  animationId = requestAnimationFrame(updateAndRender);
}
