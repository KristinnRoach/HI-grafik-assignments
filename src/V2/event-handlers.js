// event-handlers.js
import * as camera from './camera.js';
import { game, restartGame } from './game-state.js';
import { setFPS } from './main.js';

export let isDragging = false;
export let lastMouseX, lastMouseY;

// TODO: Double click to reset camera position

export function setupEventListeners(canvas) {
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('dblclick', handleDoubleClick);
  window.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(event) {
  isDragging = true;
  lastMouseX = event.offsetX;
  lastMouseY = event.offsetY;
}

function handleDoubleClick(event) {
  camera.reset();
}

function handleMouseUp() {
  isDragging = false;
}

function handleMouseMove(event) {
  if (isDragging) {
    const dx = event.offsetX - lastMouseX;
    const dy = event.offsetY - lastMouseY;

    camera.rotate(dx, dy);

    lastMouseX = event.offsetX;
    lastMouseY = event.offsetY;
  }
}

function handleWheel(event) {
  event.preventDefault();
  camera.zoom(event.deltaY);
}

function handleKeyDown(event) {
  const KEY_STEP = 0.1;
  switch (event.key.toLowerCase()) {
    case 'a':
      camera.move('left', KEY_STEP);
      break;
    case 'd':
      camera.move('right', KEY_STEP);
      break;
    case 'w':
      camera.move('up', KEY_STEP);
      break;
    case 's':
      camera.move('down', KEY_STEP);
      break;
    // case 'arrowup':
    //   if (game.fps < 60) setFPS(game.fps + 1);
    //   break;
    // case 'arrowdown':
    //   if (game.fps > 1) setFPS(game.fps - 1);
    //   break;
    case 'r':
      restartGame();
      break;
    case ' ':
      game.isPaused = !game.isPaused;
      break;
  }
}
