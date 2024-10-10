// camera.js

import { lookAt } from '../lib/MV.js';

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

export function reset() {
  elevation = INIT_CAM.elevation;
  radius = INIT_CAM.radius;
  angle = INIT_CAM.angle;
  position = INIT_CAM.position;
  target = INIT_CAM.target;
  upVector = INIT_CAM.upVector;

  updatePosition();
}
