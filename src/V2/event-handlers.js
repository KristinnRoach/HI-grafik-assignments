// event-handlers.js
import * as camera from './camera.js';
import { game, restartGame, resetGameState } from './game-state.js';

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

function handleArrowKeys(event) {
  // Get all input elements
  const inputs = document.querySelectorAll('input');

  // Find the index of the currently focused element
  const currentIndex = Array.from(inputs).indexOf(document.activeElement);

  let nextIndex;

  switch (event.key.toLowerCase()) {
    case 'arrowleft':
      nextIndex = currentIndex > 0 ? currentIndex - 1 : inputs.length - 1;
      break;

    case 'arrowright':
      nextIndex = currentIndex < inputs.length - 1 ? currentIndex + 1 : 0;
      break;
  }

  inputs[nextIndex].focus();
}

function handleKeyDown(event) {
  // Check if the pressed key is an arrow key
  if ([37, 39].indexOf(event.keyCode) > -1) {
    event.preventDefault();
    handleArrowKeys(event);
    return;
  }

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
    case 'r':
      resetGameState();
      restartGame();
      break;
    case ' ':
      game.isPaused = !game.isPaused;
      break;
  }
}
