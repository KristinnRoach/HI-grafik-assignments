// ground.ts
import { THREE } from '../types/types';

export const GRID_SIZE = 15;

const groundColor = new THREE.Color(0xbbddaa);
const streetColor = new THREE.Color(0xaaaaaa);
const riverColor = new THREE.Color(0x0044dd);

let riverBoundingBox: THREE.Box3;

export function getRiverBoundingBox(): THREE.Box3 {
  return riverBoundingBox;
}

export function createGround(): THREE.Group {
  const ground = new THREE.Group();

  // create ground
  const groundPositions = [-8, -7, -6, -2, -1, 0, 1, 5, 6, 7]; // Z positions for streets
  groundPositions.forEach((zPos) => {
    const groundRow = createGroundRow(groundColor);
    groundRow.position.set(0, 0, zPos);
    ground.add(groundRow);
    groundRow.receiveShadow = true;
  });

  // Create streets
  const lanePositions = [2, 3, 4]; // Z positions for streets
  lanePositions.forEach((zPos) => {
    const streetLane = createGroundRow(streetColor);
    streetLane.position.set(0, 0, zPos);
    ground.add(streetLane);
    streetLane.receiveShadow = true;
  });

  // Create river
  lanePositions.forEach((zPos) => {
    const riverLane = createGroundRow(riverColor);
    riverLane.position.set(0, 0, zPos - 7);
    ground.add(riverLane);
    riverLane.receiveShadow = true;
  });

  // Calculate river bounding box including all lanes
  const minZ = Math.min(...lanePositions.map((z) => z - 7));
  const maxZ = Math.max(...lanePositions.map((z) => z - 7));

  riverBoundingBox = new THREE.Box3(
    new THREE.Vector3(-GRID_SIZE / 2, -0.1, minZ + 0.5), // min point
    new THREE.Vector3(GRID_SIZE / 2, 0.05, maxZ - 0.5) // max point
  );

  ground.position.y = -0.5;

  return ground;
}

function createGroundRow(color: THREE.Color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(GRID_SIZE, 1, 1),
    new THREE.MeshStandardMaterial({ color: color })
  );
}
