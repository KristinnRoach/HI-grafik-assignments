// camera.js

import { lookAt, add, subtract, scale, cross, normalize } from '../lib/MV.js';

export const NEAR_PLANE = 0.5;
export const FAR_PLANE = 700.0;
export const FIELD_OF_VIEW = 50.0;

const INIT_CAM = {
  elevation: 0.515, // Math.PI / 4, // 45 degrees
  radius: 45, // 75,
  angle: -0.666, // -Math.PI / 4, // -45 degrees
  position: [0, 0, 0], // init position doesn't matter
  target: [0, 0, 0], // [0, 1, 0],
  upVector: [0, 1, 0],
};

export let elevation = INIT_CAM.elevation;
export let radius = INIT_CAM.radius;
export let angle = INIT_CAM.angle;
export let position = INIT_CAM.position;
export let target = INIT_CAM.target;
export let upVector = INIT_CAM.upVector;

// Auto-orbit, tuned from dev-tuning.js. A drag flings the camera, then it eases back to the orbit speed
export const orbit = { on: true, speed: 0.1, reverse: false, settle: 1.5, maxSpin: 14 };
let spin = 0; // current orbit velocity, rad/s
let dragged = 0; // angle dragged since the last tick

export function updatePosition() {
  const theta = angle;
  const phi = elevation;
  position[0] = radius * Math.cos(phi) * Math.sin(theta);
  position[1] = radius * Math.sin(phi);
  position[2] = radius * Math.cos(phi) * Math.cos(theta);
}

export function getViewMatrix() {
  return lookAt(position, target, upVector);
}

export function rotate(dx, dy) {
  angle += dx * 0.01;
  dragged += dx * 0.01;
  elevation = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, elevation - dy * 0.01)
  );
  updatePosition();
}

export function zoom(delta) {
  radius = Math.max(1, Math.min(100, radius + delta * 0.01));
  updatePosition();
}

export function move(direction, step) {
  switch (direction) {
    case 'left':
      angle -= step;
      break;
    case 'right':
      angle += step;
      break;
    case 'up':
      elevation = Math.min(elevation + step, Math.PI / 2);
      break;
    case 'down':
      elevation = Math.max(elevation - step, -Math.PI / 2);
      break;
  }
  updatePosition();
}

export function tick(dt, dragging) {
  if (dt <= 0) return;
  if (dragging) {
    // Smoothed, since mousemove events and frames don't line up one to one
    spin += (dragged / dt - spin) * 0.5;
    spin = Math.max(-orbit.maxSpin, Math.min(orbit.maxSpin, spin));
  } else {
    const target = orbit.on ? orbit.speed * (orbit.reverse ? -1 : 1) : 0;
    spin += (target - spin) * (1 - Math.exp(-orbit.settle * dt));
    angle += spin * dt;
    updatePosition();
  }
  dragged = 0;
}

export function reset() {
  spin = 0;
  elevation = INIT_CAM.elevation;
  radius = INIT_CAM.radius;
  angle = INIT_CAM.angle;
  position = INIT_CAM.position;
  target = INIT_CAM.target;
  upVector = INIT_CAM.upVector;

  updatePosition();
}

// World-space ray from the camera through a screen point, ndc in -1..1.
// Assumes the square projection set up in renderer.js (aspect 1).
export function screenRay(ndcX, ndcY) {
  const forward = normalize(subtract(target, position));
  const right = normalize(cross(forward, upVector));
  const up = cross(right, forward);
  const t = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
  const dir = normalize(
    add(forward, add(scale(ndcX * t, right), scale(ndcY * t, up)))
  );
  return { origin: [...position], dir: [...dir] };
}
