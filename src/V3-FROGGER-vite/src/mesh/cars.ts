// cars.ts
import { getRandomThreeColor } from '../utility/color-utils';
import { THREE } from '../types/types';
import type { LaneConfig, Object3D, Mesh } from '../types/types';

const LANES: LaneConfig[] = [
  { z: 4, direction: 'left', speed: 2.5 },
  { z: 3, direction: 'right', speed: 3 },
  { z: 2, direction: 'left', speed: 3.5 },
];

export function createCars(carsPerLane: number): Mesh[] {
  const cars: Mesh[] = [];

  LANES.forEach((lane) => {
    const rndOffset = Math.random() * 0.3;
    const spacing = 15 / carsPerLane + rndOffset; // Total width / cars per lane
    const direction = lane.direction === 'left' ? -1 : 1;

    for (let i = 0; i < carsPerLane; i++) {
      const car = createBasicCar();
      let speed = lane.speed - rndOffset * 2; // Randomize speed a bit
      const startX = direction * 7;
      const offset = i * spacing * direction;

      car.position.set(startX + offset, car.position.y, lane.z);

      // Store lane info for movement
      car.userData.lane = lane;
      car.userData.speed = speed;
      car.userData.direction = direction;
      car.userData.collisionType = 'death';
      car.userData.velocity = new THREE.Vector3(speed * direction, 0, 0);

      cars.push(car);
    }
  });

  return cars;
}

function createBasicCar(): THREE.Mesh {
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.7, 0.8),
    new THREE.MeshPhongMaterial({
      color: getRandomThreeColor(),
    })
  );
  car.position.y = 0.35; // Half height
  car.castShadow = true;
  car.receiveShadow = true;
  return car;
}

export function updateCars(cars: Object3D[], deltaTime: number) {
  cars.forEach((car) => {
    const lane = car.userData.lane as LaneConfig;
    const speed = lane.direction === 'left' ? -lane.speed : lane.speed;
    car.position.x += deltaTime * speed;

    // Reset position when car goes off screen
    const bound = 8; //
    if (lane.direction === 'left' && car.position.x < -bound) {
      car.position.x = bound;
    } else if (lane.direction === 'right' && car.position.x > bound) {
      car.position.x = -bound;
    }
  });
}
