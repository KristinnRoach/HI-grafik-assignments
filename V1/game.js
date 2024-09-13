// root/V1/game.js

import { initGL, initProgram, initBuffers } from './setup.js';
import { resetBird, isOffScreen } from './game-utils.js';

const { canvas, gl } = initGL();
const { program, vPosLocation } = initProgram(gl);

let level = 1;

const game = {
  gun: null,
  birds: [],
  bullets: [],
  gameOver: false,
  lastShotTime: 0,
  shootCooldown: 50, // milliseconds

  score: 0,
  dashes: '',
  dashBuffer: null,
};

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
    // reset if off screen
    if (isOffScreen(bird)) {
      resetBird(bird, level);
    }
  });

  game.bullets = game.bullets.filter((b) => {
    b.y += b.speed;
    return b.y <= 1;
  });

  game.bullets.forEach((b) => {
    game.birds.forEach((bird) => {
      if (checkCollision(bird, b)) {
        handleCollision(b, bird);
      }
    });
  });

  updateBuffers();
}

function checkCollision(obj1, obj2) {
  return (
    obj1.x <= obj2.x + obj2.width &&
    obj1.x + obj1.width >= obj2.x &&
    obj1.y <= obj2.y + obj2.height &&
    obj1.y + obj1.height >= obj2.y
  );
}

function handleCollision(collidedBullet, collidedBird) {
  game.bullets = game.bullets.filter((b) => b !== collidedBullet);
  resetBird(collidedBird, level);
  game.score++;
  game.dashes += '|';
  updateScoreDisplay();

  if (game.score % 5 === 0) {
    level++;
    game.birds.forEach((bird) => resetBird(bird, level));
  }

  if (game.dashes.length >= 20) {
    endGame();
  }
}

function updateScoreDisplay() {
  document.getElementById(
    'score'
  ).textContent = `Score: ${game.score} ${game.dashes}`;
}

function endGame() {
  game.gameOver = true;
  console.log(`Game over! Final score: ${game.score}`);
  // display this message on the canvas or in a dialog
}

function createObject(x, y, width, height) {
  return {
    buffer: null, // set in initGameObjects
    x,
    y,
    width,
    height,
    speed: 0,
    direction: 'right',
  };
}

function createBullet() {
  const bullet = {
    x: game.gun.x,
    y: game.gun.y,
    width: 0.01,
    height: 0.01,
    speed: 0.01,
    buffer: gl.createBuffer(),
  };

  const bulletVertices = new Float32Array([
    bullet.x,
    bullet.y,
    bullet.x + bullet.width,
    bullet.y,
    bullet.x,
    bullet.y - bullet.height,
    bullet.x + bullet.width,
    bullet.y - bullet.height,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, bullet.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, bulletVertices, gl.DYNAMIC_DRAW);

  game.bullets.push(bullet);
}

function updateBuffers() {
  game.birds.forEach(updateObjectBuffer);
  game.bullets.forEach(updateObjectBuffer);
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

function render() {
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  game.birds.forEach((bird) => drawObject(bird, gl.TRIANGLE_STRIP, 4));
  game.bullets.forEach((b) => drawObject(b, gl.TRIANGLE_STRIP, 4));
  drawObject(game.gun, gl.TRIANGLES, 3);

  // Draw score dashes
  const dashHeight = 0.1;
  const dashSpacing = 0.03;
  for (let i = 0; i < game.dashes.length; i++) {
    drawDash(-0.95 + i * dashSpacing, dashHeight);
  }
}

let currentBuffer = null;

function drawObject(obj, mode, vertexCount) {
  if (currentBuffer !== obj.buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(vPosLocation, 2, gl.FLOAT, false, 0, 0);
    currentBuffer = obj.buffer;
  }
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

function gameLoop() {
  if (!game.gameOver) {
    updateGame();
    render();
    requestAnimationFrame(gameLoop);
  } else {
    console.log(`Game over! Score: ${game.score}`);
  }
}

function createBirds(nrOfBirds) {
  for (let i = 0; i < nrOfBirds; i++) {
    const bird = createObject(-1.0, 0.7, 0.1, 0.05);
    resetBird(bird, level);
    bird.buffer = gl.createBuffer();
    game.birds.push(bird);
  }
}

function init() {
  currentBuffer = null;
  game.gun = createObject(0.0, -0.9, 0.1, 0.1);
  game.gun.buffer = gl.createBuffer();
  createBirds(3);
  initBuffers(gl, game.gun, game.birds);
  updateScoreDisplay();
  gameLoop();
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

document.addEventListener('keydown', handleKeydown);
canvas.addEventListener('mousedown', shoot);

window.onload = init;
