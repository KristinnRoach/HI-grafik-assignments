// src/V1/game-utils.js

export function isOffScreen(obj, side) {
  switch (side) {
    case 'left':
      return obj.x + obj.width < -1;
    case 'right':
      return obj.x > 1;
    case 'top':
      return obj.y > 1;
    case 'bottom':
      return obj.y - obj.height < -1 && obj.x > -1 && obj.x < 1;
  }
}

export function getBirdStartPos(level) {
  // get random boolean
  const fromLeft = Math.random() <= 0.5;
  const x = fromLeft ? -1 : 1;
  // get random number between 0.5 and 1.0
  const y = Math.min(Math.random(), 0.9);
  return { x, y };
}

export function resetBird(bird, level) {
  const { x, y } = getBirdStartPos(level);
  bird.x = x;
  bird.y = y;
  bird.direction = x < 0 ? 'right' : 'left';
  const speedFactor = (level * 0.01) / level;
  bird.speed = (Math.random() * 0.1 + 0.5) * speedFactor;
}