const vsSource = `#version 300 es
in vec2 aPosition;
uniform vec2 uTranslation;
uniform vec2 uScale;

void main() {
    vec2 position = aPosition * uScale + uTranslation;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const fsSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 fragColor;

void main() {
    fragColor = vec4(uColor, 1.0);
}`;

let gl;
let program;
let positionBuffer;
let positionAttributeLocation;
let translationUniformLocation;
let scaleUniformLocation;
let colorUniformLocation;

let gunPosition = 0;
let birdPosition = -1;
let bulletPositions = [];

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;

let keysPressed = {};

function initGL() {
  const canvas = document.getElementById('glCanvas');
  gl = canvas.getContext('webgl2');

  if (!gl) {
    alert('Unable to initialize WebGL2. Your browser may not support it.');
    return;
  }

  program = createShaderProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [-0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
  translationUniformLocation = gl.getUniformLocation(program, 'uTranslation');
  scaleUniformLocation = gl.getUniformLocation(program, 'uScale');
  colorUniformLocation = gl.getUniformLocation(program, 'uColor');

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}

function createShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(program)
    );
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function drawShape(translation, scale, color) {
  gl.uniform2fv(translationUniformLocation, translation);
  gl.uniform2fv(scaleUniformLocation, scale);
  gl.uniform3fv(colorUniformLocation, color);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw gun
  drawShape([gunPosition, -0.9], [0.05, 0.05], [0.0, 1.0, 0.0]);

  // Draw bird
  drawShape([birdPosition, 0.9], [0.05, 0.05], [1.0, 0.0, 0.0]);

  // Draw bullets
  for (let bullet of bulletPositions) {
    drawShape([bullet.x, bullet.y], [0.02, 0.02], [1.0, 1.0, 0.0]);
  }
}

function update() {
  // Move gun
  if (keysPressed[KEY_LEFT]) {
    gunPosition = Math.max(-0.95, gunPosition - 0.02);
  }
  if (keysPressed[KEY_RIGHT]) {
    gunPosition = Math.min(0.95, gunPosition + 0.02);
  }

  // Move bird
  birdPosition += 0.01;
  if (birdPosition > 1) birdPosition = -1;

  // Move bullets
  bulletPositions = bulletPositions.filter((bullet) => {
    bullet.y += 0.02;
    if (bullet.y > 1) {
      return false; // Remove bullet if it's off-screen
    }
    // Check collision
    if (
      Math.abs(bullet.x - birdPosition) < 0.05 &&
      Math.abs(bullet.y - 0.9) < 0.05
    ) {
      console.log('You hit the bird!');
      birdPosition = -1; // Reset bird position
      return false; // Remove bullet
    }
    return true;
  });

  render();
  requestAnimationFrame(update);
}

function handleKeyDown(event) {
  keysPressed[event.keyCode] = true;
  if (event.keyCode === KEY_SPACE) {
    shootBullet();
  }
}

function handleKeyUp(event) {
  keysPressed[event.keyCode] = false;
}

function shootBullet() {
  bulletPositions.push({ x: gunPosition, y: -0.9 });
}

window.onload = function () {
  initGL();
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  update();
};
