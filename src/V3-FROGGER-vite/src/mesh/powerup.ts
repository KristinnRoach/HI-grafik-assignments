import * as THREE from 'three';
import { scene } from '../main';

import { GridSystem } from '../utility/GridSystem';

const gridSystem = new GridSystem(15);

export const powerupRadius = 1;
let powerupScale = 0.1;

function createPowerup(): THREE.Mesh {
  const powerup = new THREE.Mesh(
    new THREE.TorusGeometry(powerupRadius - 0.4, 0.4, 16, 50),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  powerup.position.y = powerupRadius * powerupScale;
  scene.add(powerup);
  const rGridPos = gridSystem.getRandomGridPosition();
  powerup.scale.setScalar(0.1);

  gridSystem.placeObject(powerup, rGridPos.x, rGridPos.z);

  return powerup;
}

export function createPowerups(): THREE.Mesh[] {
  const powerups = [];
  for (let i = 0; i < 10; i++) {
    const powerup = createPowerup();
    powerup.name = 'powerup' + i + 1;
    powerups.push(powerup);
  }

  return powerups;
}