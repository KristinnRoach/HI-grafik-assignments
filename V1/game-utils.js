// root/V1/game-utils.js

// export function isOffScreen(obj) {
//   const xLeft = obj.x;
//   const xRight = obj.x + obj.width;
//   const yTop = obj.y;
//   const yBottom = obj.y - obj.height;

//   return xRight > 1 || xLeft < -1 || yTop > 1 || yBottom < -1;
// }

export function isOffScreen(obj) {
  const leftEdge = obj.x;
  const rightEdge = obj.x + obj.width;
  const topEdge = obj.y;
  const bottomEdge = obj.y - obj.height;

  const screenLeft = -1;
  const screenRight = 1;
  const screenTop = 1;
  const screenBottom = -1;

  const exitedLeft = rightEdge < screenLeft;
  const exitedRight = leftEdge > screenRight;
  const exitedTop = bottomEdge > screenTop;
  const exitedBottom = topEdge < screenBottom;

  return exitedLeft || exitedRight || exitedTop || exitedBottom;
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
  const speedFactor = Math.log(level + 1) / 75;
  bird.speed = (Math.random() * 0.5 + 0.5) * speedFactor + 0.001;
}
