// event-handlers.js
import * as camera from './camera.js';
import { updateHud, togglePause } from './game-state.js';
import { poke } from './game-logic.js';

export let isDragging = false;
export let lastMouseX, lastMouseY;
let downX, downY;

// TODO: Double click to reset camera position

let restart;

export function setupEventListeners(canvas, onRestart) {
  restart = onRestart;
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('dblclick', handleDoubleClick);
  window.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(event) {
  isDragging = true;
  lastMouseX = downX = event.offsetX;
  lastMouseY = downY = event.offsetY;
}

function handleDoubleClick(event) {
  camera.reset();
}

function handleMouseUp(event) {
  isDragging = false;
  // Barely moved: a click, not an orbit drag
  if (Math.hypot(event.offsetX - downX, event.offsetY - downY) < 4) pokeAt(event);
}

function pokeAt(event) {
  const canvas = event.target;
  const ndcX = (event.offsetX / canvas.clientWidth) * 2 - 1;
  const ndcY = 1 - (event.offsetY / canvas.clientHeight) * 2;
  const { origin, dir } = camera.screenRay(ndcX, ndcY);
  if (poke(origin, dir)) updateHud();
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
  // Get all focusable controls, in document order
  const inputs = document.querySelectorAll('.controls :is(input, select, button)');

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

  // Up/down on a focused select: step to the next option (wrapping) and apply it
  const select = document.activeElement;
  if (select instanceof HTMLSelectElement && select.id === 'shapeSelect' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const count = select.options.length;
    select.selectedIndex = (select.selectedIndex + step + count) % count;
    select.dispatchEvent(new Event('change'));
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
      restart();
      break;
    case ' ':
      togglePause();
      event.preventDefault();
      break;
  }
}
