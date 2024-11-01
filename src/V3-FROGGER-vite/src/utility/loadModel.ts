// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// import { scene } from '../main';

// // const loader = new FBXLoader();

// // loader.load(
// //   './Astronaut_Frog.fbx',
// //   function (fbx: THREE.Group) {
// //     const frogModel = fbx;

// //     // FBX models are often very large, you might need to scale them down
// //     frogModel.scale.setScalar(0.01);

// //       // Create an animation mixer
// //       const mixer = new THREE.AnimationMixer(frogModel);
// //     }

// //     scene.add(frogModel);
// //   },
// //   function (xhr) {
// //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
// //   },
// //   function (error) {
// //     console.error(error);
// //   }
// // );

// export function loadGLTF(path: string) {
//   const loader = new GLTFLoader();
//   const dracoLoader = new DRACOLoader();
//   dracoLoader.setDecoderPath('public/models/draco-gltf/');
//   loader.setDRACOLoader(dracoLoader);

//   // Load a glTF resource
//   loader.load(
//     // resource URL
//     path,
//     // called when the resource is loaded
//     (gltf) => {
//       const bbox = new THREE.Box3().setFromObject(gltf.scene);

//       const motorcycle = gltf.scene;

//       scene.add(gltf.scene);
//     },
//     // called while loading is progressing
//     undefined,
//     // called when loading has errors
//     (err: any) => {
//       console.error(err.message);
//     }
//   );
// }
