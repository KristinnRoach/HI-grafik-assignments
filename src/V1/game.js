// IMPORTS AND CONSTANTS

import { getGL, getCanvas } from '../lib/init-gl2.js';
import { resetBird, isOffScreen } from './game-utils.js';
import { initShaders } from '../lib/initShaders.js';

// GLOBAL VARIABLES

const MAX_BULLETS = 20;
const WIN_SCORE = 5;

let bulletPositionsUniform;
let activeBulletsUniform;
let isBulletUniform = false;

const gunWidth = 0.2;
const gunHeight = 0.2;

const bulletWidth = 0.02;
const bulletHeight = 0.03;

const birdWidth = 0.15;
const birdHeight = 0.05;

/** @type {HTMLCanvasElement|null} */
const canvas = getCanvas();
/** @type {WebGL2RenderingContext} */
const gl = getGL();
/** @type {WebGLProgram|null} */
let program;
/** @type {WebGLAttribLocation|null} */
let vPosLocation;

let level = 1;

const game = {
  gun: null,
  birds: [],
  bullets: [],
  gameOver: false,
  lastShotTime: 0,
  shootCooldown: 50, // milliseconds
  score: 0,
  bulletBuffer: null,
};

// INITIALIZATION

function initProgram(gl) {
  try {
    const shaderProgram = initShaders(gl, 'vertex-shader', 'fragment-shader');
    if (!shaderProgram || !(shaderProgram instanceof WebGLProgram)) {
      throw new Error('initShaders did not return a valid WebGLProgram');
    }
    program = shaderProgram;
    gl.useProgram(program);

    vPosLocation = gl.getAttribLocation(program, 'vPosition');
    if (vPosLocation < 0) {
      throw new Error('Failed to get attribute location for vPosition');
    }

    gl.enableVertexAttribArray(vPosLocation);

    bulletPositionsUniform = gl.getUniformLocation(
      program,
      'u_bullet_positions'
    );
    activeBulletsUniform = gl.getUniformLocation(program, 'u_active_bullets');
    isBulletUniform = gl.getUniformLocation(program, 'u_is_bullet');
  } catch (e) {
    throw new Error(`Initialization error: ${e}`);
  }
}

function init() {
  initProgram(gl);

  game.gun = {
    x: 0.0,
    y: -1 + gunHeight,
    width: gunWidth,
    height: gunHeight,
    buffer: gl.createBuffer(),
    radius: Math.max(gunWidth, gunHeight) / 2,
  };
  createBirds(3);
  initBuffers(gl, game.gun, game.birds);
  gameLoop();
}

window.onload = init;

function initObjectBuffer(gl, obj, vertices) {
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

function initBuffers(gl, gun, birds) {
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

// GAME LOGIC

function createObject(x, y, width, height, createBuffer) {
  return {
    buffer: createBuffer ? gl.createBuffer() : null,
    x,
    y,
    width,
    height,
    speed: 0,
    direction: 'right',
    radius: Math.max(width, height) / 2,
  };
}

function createBirds(nrOfBirds) {
  for (let i = 0; i < nrOfBirds; i++) {
    const bird = createObject(-1.0, 0.7, birdWidth, birdHeight, true);
    resetBird(bird, level);
    game.birds.push(bird);
  }
}

function createBullet() {
  if (game.bullets.length < MAX_BULLETS) {
    const bullet = {
      x: game.gun.x,
      y: game.gun.y,
      width: bulletWidth,
      height: bulletHeight,
      speed: 0.01 * level,
      radius: Math.max(bulletWidth, bulletHeight) / 2,
    };
    game.bullets.push(bullet);
  }
}

function updateGame() {
  game.birds.forEach((bird) => {
    // move bird
    switch (bird.direction) {
      case 'right':
        bird.x += bird.speed;
        break;
      case 'left':
        bird.x -= bird.speed;
        break;
    }

    bird.y -= level * (bird.speed / 2);
    // reset if off screen
    const sideToCheck = bird.direction === 'right' ? 'right' : 'left';
    if (isOffScreen(bird, sideToCheck)) {
      resetBird(bird, level);
    }

    // switch direction randomly
    if (Math.random() < 0.01) {
      switchDirection(bird);
    }

    // check for collision with gun
    if (checkGunCollision(game.gun, bird)) {
      endGame();
    }
  });

  game.bullets = game.bullets.filter((b) => {
    b.y += b.speed;
    return b.y <= 1;
  });

  game.bullets.forEach((b) => {
    game.birds.forEach((bird) => {
      if (isBirdShot(bird, b)) {
        handleCollision(b, bird);
      }
    });
  });

  updateBulletUniforms();
  updateBuffers();
}

function switchDirection(bird) {
  bird.direction = bird.direction === 'right' ? 'left' : 'right';
}

function isBirdShot(obj1, obj2) {
  return (
    obj1.x <= obj2.x + obj2.width &&
    obj1.x + obj1.width >= obj2.x &&
    obj1.y <= obj2.y + obj2.height &&
    obj1.y + obj1.height >= obj2.y
  );
}

// update if shapes change !!
function checkGunCollision(triangle, rectangle) {
  const trianglePoints = [
    { x: triangle.x, y: triangle.y },
    { x: triangle.x - triangle.width / 2, y: triangle.y - triangle.height },
    { x: triangle.x + triangle.width / 2, y: triangle.y - triangle.height },
  ];

  const rectanglePoints = [
    { x: rectangle.x, y: rectangle.y },
    { x: rectangle.x + rectangle.width, y: rectangle.y },
    { x: rectangle.x, y: rectangle.y + rectangle.height },
    { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
  ];

  for (let point of rectanglePoints) {
    if (pointInTriangle(point, ...trianglePoints)) {
      return true;
    }
  }

  for (let point of trianglePoints) {
    if (pointInRectangle(point, rectangle)) {
      return true;
    }
  }

  return false;
}

// check if a point is inside a triangle
function pointInTriangle(p, a, b, c) {
  const areaABC = Math.abs(
    (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
  );
  const areaPBC = Math.abs(
    (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y)
  );
  const areaPCA = Math.abs(
    (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y)
  );
  const areaPAB = Math.abs(
    (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y)
  );

  return Math.abs(areaABC - (areaPBC + areaPCA + areaPAB)) < 0.00001;
}

// check if a point is inside a rectangle
function pointInRectangle(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// checks for collission using circles
function checkCircleCollision(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < obj1.radius + obj2.radius;
}

function handleCollision(collidedBullet, collidedBird) {
  game.bullets = game.bullets.filter((b) => b !== collidedBullet);
  game.score++;
  resetBird(collidedBird, level);
  console.log(`Score: ${game.score}`);

  if (game.score % 5 === 0) {
    level++;
    game.birds.forEach((bird) => resetBird(bird, level));
  }

  if (game.score >= WIN_SCORE) {
    endGame();
  }
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') {
    game.gun.x = Math.max(game.gun.x - 0.1, -1);
  } else if (key === 'arrowright' || key === 'd') {
    game.gun.x = Math.min(game.gun.x + 0.1, 1);
  } else if (key === ' ' || key === 'arrowup' || key === 'w') {
    shoot();
  }
}

function shoot() {
  const currentTime = Date.now();
  if (currentTime - game.lastShotTime < game.shootCooldown) return;
  createBullet();
  game.lastShotTime = currentTime;
}

// RENDERING STUFF

function updateBuffers() {
  game.birds.forEach(updateObjectBuffer);
  updateGunBuffer();
}

function updateObjectBuffer(obj) {
  const vertices = new Float32Array([
    obj.x,
    obj.y,
    obj.x + obj.width,
    obj.y,
    obj.x,
    obj.y - obj.height,
    obj.x + obj.width,
    obj.y - obj.height,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
}

function updateGunBuffer() {
  const gunVertices = new Float32Array([
    game.gun.x,
    game.gun.y,
    game.gun.x - game.gun.width / 2,
    game.gun.y - game.gun.height,
    game.gun.x + game.gun.width / 2,
    game.gun.y - game.gun.height,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, game.gun.buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, gunVertices);
}

function updateBulletUniforms() {
  const bulletPositions = new Float32Array(MAX_BULLETS * 2);
  let activeBullets = 0;

  game.bullets.forEach((bullet, index) => {
    if (index < MAX_BULLETS) {
      bulletPositions[index * 2] = bullet.x;
      bulletPositions[index * 2 + 1] = bullet.y;
      activeBullets++;
    }
  });

  gl.uniform2fv(bulletPositionsUniform, bulletPositions);
  gl.uniform1i(activeBulletsUniform, activeBullets);
}

function render() {
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  game.birds.forEach((bird) => drawObject(bird, gl.TRIANGLE_STRIP, 4));

  if (game.bullets.length > 0) {
    // set isBulletUniform to true
    gl.uniform1i(isBulletUniform, 1);
    updateBulletUniforms();

    // bullet vertex data
    const bulletVertices = new Float32Array([
      0,
      0,
      game.bullets[0].width,
      0,
      0,
      -game.bullets[0].height,
      game.bullets[0].width,
      -game.bullets[0].height,
    ]);

    if (!game.bulletBuffer) {
      game.bulletBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, game.bulletBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bulletVertices, gl.STATIC_DRAW);

    // attribute for the bullet vertices
    gl.vertexAttribPointer(vPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosLocation);

    // draw all bullets in one instanced draw call
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, game.bullets.length);

    // set isBulletUniform back to false
    gl.uniform1i(isBulletUniform, 0);
  }

  drawObject(game.gun, gl.TRIANGLES, 3);

  // Draw dashes
  const dashHeight = 0.1;
  const dashSpacing = 0.03;
  for (let i = 0; i < game.score; i++) {
    drawDash(-0.95 + i * dashSpacing, dashHeight);
  }
}

function drawObject(obj, mode, vertexCount) {
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
  gl.vertexAttribPointer(vPosLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(mode, 0, vertexCount);
}

function drawDash(x, height) {
  const dashWidth = 0.01;
  const padding = 0.01;
  const vertices = new Float32Array([
    x,
    1 - padding,
    x + dashWidth,
    1 - padding,
    x,
    1 - height,
    x + dashWidth,
    1 - height,
  ]);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(vPosLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// GAME LOOP

function gameLoop() {
  if (!game.gameOver) {
    updateGame();
    render();
    requestAnimationFrame(gameLoop);
  } else {
    console.log(`Game over! Score: ${game.score}`);
  }
}

function endGame() {
  game.gameOver = true;
  console.log(`Game over! Final score: ${game.score}`);
  createResetButton();
}

function resetGame() {
  game.score = 0;
  level = 1;
  game.birds.forEach((bird) => resetBird(bird, level));
  game.bullets = [];
  game.gameOver = false;
  document.body.removeChild(document.querySelector('button'));
  gameLoop();
}

function createResetButton() {
  const button = document.createElement('button');
  button.textContent = 'Reset';
  button.addEventListener('click', resetGame);
  document.body.appendChild(button);
}

// UTILITY

function resizeCanvas() {
  const canvas = document.getElementById('gl-canvas');
  const size = Math.min(1400, Math.min(window.innerWidth, window.innerHeight));
  canvas.width = size;
  canvas.height = size;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// EVENT LISTENERS

document.addEventListener('keydown', handleKeydown);
canvas.addEventListener('mousedown', shoot);

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
