import * as THREE from 'three';

export function setYPosBottom(object: THREE.Object3D, bottomY: number): void {
  const bbox = new THREE.Box3().setFromObject(object);
  const height = bbox.max.y - bbox.min.y;
  object.position.y = bottomY + height / 2;
}

export function setYPosTop(object: THREE.Object3D, topY: number): void {
  const bbox = new THREE.Box3().setFromObject(object);
  const height = bbox.max.y - bbox.min.y;
  object.position.y = topY - height / 2;
}

export function getBottomY(object: THREE.Object3D): number {
  // Create a bounding box
  const bbox = new THREE.Box3().setFromObject(object);
  // Return the minimum y value (bottom of the object)
  return bbox.min.y;
}

export function getTopY(object: THREE.Object3D): number {
  // Create a bounding box
  const bbox = new THREE.Box3().setFromObject(object);
  // Return the maximum y value (top of the object)
  return bbox.max.y;
}
