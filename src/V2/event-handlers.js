// event-handlers.js
import * as camera from './camera.js';
import { updateHud, togglePause } from './game-state.js';
import { poke } from './game-logic.js';

export let isDragging = false;
const pointers = new Map(); // active pointer id -> { x, y }, so two fingers can pinch
let downX, downY;
let multiTouch = false; // gesture had a second finger at some point, so it's never a tap
let pinchDist = 0;

// Movement under this many px between down and up counts as a tap. Fingers wobble more than mice.
// ponytail: untested on devices, tune on a phone
const TAP_SLOP = { mouse: 4, pen: 6, touch: 10 };
const PINCH_ZOOM = 10; // camera.zoom units per px of pinch, wheel notches are ~100

let restart;

export function setupEventListeners(canvas, onRestart) {
  restart = onRestart;
  // Pointer events + capture, so a drag that leaves the canvas still tracks and releases.
  // Covers mouse, pen and touch; the canvas has touch-action: none so the page doesn't scroll instead
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointermove', handlePointerMove);
  // Fires after pointerup and on pointercancel, so all cleanup lives here
  canvas.addEventListener('lostpointercapture', handlePointerEnd);
  canvas.addEventListener('wheel', handleWheel);
  window.addEventListener('keydown', handleKeyDown);
}

const pinchDistance = () => {
  const [a, b] = pointers.values();
  return Math.hypot(a.x - b.x, a.y - b.y);
};

function handlePointerDown(event) {
  event.currentTarget.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
  // One pointer only becomes a drag past the tap slop (see handlePointerMove), so a tap doesn't stop the orbit
  isDragging = pointers.size > 1;
  if (pointers.size === 1) {
    multiTouch = false;
    downX = event.offsetX;
    downY = event.offsetY;
  } else {
    multiTouch = true;
    if (pointers.size === 2) pinchDist = pinchDistance();
  }
}

function handlePointerUp(event) {
  // Barely moved, single pointer: a tap, not an orbit drag
  const slop = TAP_SLOP[event.pointerType] ?? 4;
  if (!multiTouch && Math.hypot(event.offsetX - downX, event.offsetY - downY) < slop) pokeAt(event);
}

function handlePointerEnd(event) {
  pointers.delete(event.pointerId);
  isDragging = pointers.size > 0;
  // A third finger lifted: re-measure the remaining pair so the pinch doesn't jump
  if (pointers.size === 2) pinchDist = pinchDistance();
}

function pokeAt(event) {
  const canvas = event.target;
  const ndcX = (event.offsetX / canvas.clientWidth) * 2 - 1;
  const ndcY = 1 - (event.offsetY / canvas.clientHeight) * 2;
  const { origin, dir } = camera.screenRay(ndcX, ndcY);
  if (poke(origin, dir)) updateHud();
}

function handlePointerMove(event) {
  const last = pointers.get(event.pointerId);
  if (!last) return;
  const x = event.offsetX;
  const y = event.offsetY;
  pointers.set(event.pointerId, { x, y });

  if (pointers.size === 1) {
    if (!isDragging) {
      if (Math.hypot(x - downX, y - downY) < (TAP_SLOP[event.pointerType] ?? 4)) return;
      isDragging = true;
    }
    camera.rotate(x - last.x, y - last.y);
  } else if (pointers.size === 2) {
    // ponytail: additive zoom like the wheel; scale radius by the distance ratio if pinch feels uneven across zoom levels
    const dist = pinchDistance();
    camera.zoom((pinchDist - dist) * PINCH_ZOOM);
    pinchDist = dist;
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
    case 'c':
      camera.reset();
      break;
    case ' ':
      togglePause();
      event.preventDefault();
      break;
  }
}
