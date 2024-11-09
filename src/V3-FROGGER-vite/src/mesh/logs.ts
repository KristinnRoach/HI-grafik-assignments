// logs.ts
import { THREE } from '../types/types';
import type { LaneConfig, Object3D } from '../types/types';

const LANES: LaneConfig[] = [
  { z: -3, direction: 'left', speed: 1 },
  { z: -4, direction: 'right', speed: 1.5 },
  { z: -5, direction: 'left', speed: 2 },
];

export function createLogs(logsPerLane: number) {
  const logs: THREE.Object3D[] = [];

  LANES.forEach((lane) => {
    const rndOffset = Math.random() * 0.5;
    const spacing = 15 / logsPerLane + rndOffset; // Total width / logs per lane

    for (let i = 0; i < logsPerLane; i++) {
      const length = 1 + Math.random() * 2;
      const log = createLogMesh(length);
      const startX = lane.direction === 'left' ? 7 : -7;
      const offset = i * spacing * (lane.direction === 'left' ? -1 : 1);

      log.position.set(startX + offset, log.position.y, lane.z);

      // Store speed and direction for movement
      const speed = lane.direction === 'left' ? -lane.speed : lane.speed;
      let velocity: THREE.Vector3 = new THREE.Vector3(speed, 0, 0);
      log.userData = {
        lane: lane,
        velocity: velocity,
        speed: speed,
        length: length,
        collisionType: 'ride-on',
      };

      logs.push(log);
    }
  });

  return logs;
}

// function makeRidable(log: THREE.Mesh): IRidable {
//   const onRide = (passenger: THREE.Object3D) => {
//     passenger.position.add(log.userData.velocity);
//   };
//   const onCollision = (gameState: IGameState): CollisionType => {
//     return {
//       type: 'ride-on',
//     };
//   };

//   let ridable = {
//     obj: log,
//     onCollision: onCollision,
//     onRide: onRide,
//   };

//   return ridable;
// }

function createLogMesh(length: number): THREE.Mesh {
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, length),
    new THREE.MeshPhongMaterial({
      color: 'brown',
    })
  );
  log.position.y = 0;
  log.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  log.castShadow = false;
  log.receiveShadow = true;

  return log;
}

export function updateLogs(logs: Object3D[], deltaTime: number) {
  logs.forEach((log) => {
    const lane = log.userData.lane as LaneConfig;
    const speed = lane.direction === 'left' ? -lane.speed : lane.speed;
    log.position.x += deltaTime * speed;

    // Reset position when log goes off screen
    const bound = 7.5; // Half width + half log length
    if (lane.direction === 'left' && log.position.x < -bound) {
      log.position.x = bound;
    } else if (lane.direction === 'right' && log.position.x > bound) {
      log.position.x = -bound;
    }
  });
}
