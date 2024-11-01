import * as THREE from 'three';

export const GROUND_X = 15;
export const GROUND_Y = 1;
export const GROUND_Z = 15;

export function createGround(): THREE.Mesh {
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(15, 1, 15),
    new THREE.MeshBasicMaterial({ color: 0x223311 })
  );

  return ground;
}
