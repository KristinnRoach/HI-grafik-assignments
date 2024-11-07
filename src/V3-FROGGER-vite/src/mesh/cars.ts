import * as THREE from 'three';
// import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
// import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// const loader = new PLYLoader();
// const objLoader = new OBJLoader();

export async function loadCar(): Promise<THREE.Group> {
  const gltfLoader = new GLTFLoader();

  const glb = await gltfLoader.loadAsync(
    '/hi-grafik-assignments/src/v3-frogger-vite/public/toon2/toon_car.glb'
  );

  console.log(glb);

  const car = glb.scene;
  // car.traverse((child) => {
  // console.log(child.isObject3D);
  // if (child.isMesh) {
  //   child.geometry.center();
  //   child.material.roughness = 0.5;
  //   child.material.metalness = 0.2;
  // }
  // });
  // scene.add(car);
  //   console.log(glb);

  return car;
}

// export function createPickup(): THREE.Mesh {
//   const pickup = new THREE.Mesh();
//   objLoader.load(
//     'public/models/cars/pickup_big.obj',
//     (object) => {
//       pickup.add(object);
//     },
//     (xhr) => {
//       //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
//     },
//     (error) => {
//       console.log(error);
//     }
//   );

//   return pickup;
// }
