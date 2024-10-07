// camera.js

import { lookAt } from '../lib/MV.js';

// TODO: Find out what/how/which to use  !!

export const NEAR_PLANE = 0.2;
export const FAR_PLANE = 900.0;
export const FIELD_OF_VIEW = 700.0;
export const INIT_CAMERA_RADIUS = 100.0;

export let elevation = 0;
export let radius = 100;
export let angle = 0;
export let position = [1, 0, 5];
export let target = [0, 0, 0];
export let upVector = [0, 1, 0];

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
