// ground.ts
import { THREE } from '../types/types';

export function createGround(): THREE.Group {
  const ground = new THREE.Group();

  // Base ground
  const groundMesh = new THREE.Mesh(
    new THREE.BoxGeometry(15, 1, 15),
    new THREE.MeshStandardMaterial({ color: 0xbbddaa })
  );
  ground.add(groundMesh);
  groundMesh.receiveShadow = true;

  // Create streets
  const lanePositions = [2, 3, 4]; // Z positions for streets
  lanePositions.forEach((zPos) => {
    const streetLane = createStreet();
    streetLane.position.set(0, 0.525, zPos);
    ground.add(streetLane);
    streetLane.receiveShadow = true;
  });

  // Create river
  lanePositions.forEach((zPos) => {
    const riverLane = createRiver();
    riverLane.position.set(0, 0.525, zPos - 7);
    ground.add(riverLane);
    riverLane.receiveShadow = true;
  });

  return ground;
}

function createStreet(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.05, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
  );
}

function createRiver(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.05, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0044dd })
  );
}

export function getRiverBoundingBox(): THREE.Box3 {
  // temp fix
  const width = 15; // Same as ground width
  const height = 0.05; // River height
  const laneDepth = 1.0; // Single lane depth
  const totalDepth = laneDepth * 3; // Three lanes

  // Calculate center position (using same logic as your river placement)
  const zCenter = 3 - 7; // Middle lane position (3) - 7

  // Create box that encompasses all three lanes
  const riverBox = new THREE.Box3(
    new THREE.Vector3(-width / 2, 0.525, zCenter - laneDepth), // Min point
    new THREE.Vector3(width / 2, 0.525 + height, zCenter + laneDepth) // Max point
  );

  return riverBox;
}
