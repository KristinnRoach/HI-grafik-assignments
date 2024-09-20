// src/V1/game-logic.js

import { getLevel, getStartBirdSpeed } from './game.js';

export function isOffScreen(obj) {
  const { x, y, width, height, x_direction, y_direction } = obj;

  if (x_direction === 'left' && x + width <= -1) {
    return true;
  }
  if (x_direction === 'right' && x >= 1) {
    return true;
  }
  if (y_direction === 'top' && y >= 1) {
    return true;
  }
  if (y_direction === 'bottom' && y - height <= -1) {
    return true;
  }
}

export function getBirdStartPos() {
  // get random boolean
  const fromLeft = Math.random() <= 0.5;
  const x = fromLeft ? -1 : 1;
  // get random number between 0.5 and 1.0
  const y = Math.min(Math.random(), 0.9);
  return { x, y };
}

export function resetBirdPos(bird) {
  setBirdSpeed(bird);

  const { x, y } = getBirdStartPos();
  bird.x = x;
  bird.y = y;
  bird.x_direction = x < 0 ? 'right' : 'left';
}

export function setBirdSpeed(bird) {
  const level = getLevel();
  const START_BIRD_SPEED = getStartBirdSpeed();

  const randomFactor = 0.0025 * Math.random();
  bird.speed = START_BIRD_SPEED + level * 0.001 + randomFactor;
}
