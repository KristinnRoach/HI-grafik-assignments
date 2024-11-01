import * as THREE from 'three';

// import { scene } from '../main';

/* Create the frog mesh and Group object */

export function createFrog(): THREE.Mesh {
  // const frogger = new THREE.Group();
  const frogMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  frogMesh.position.y = 0.25;
  return frogMesh;
}

// const loader = new FBXLoader();

// loader.load(
//   './Astronaut_Frog.fbx',
//   (object) => {
//     // Handle the loaded object
//     object.scale.setScalar(0.1);
//     scene.add(object);
//   },
//   (xhr) => {
//     // Optional: Handle loading progress
//     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
//   },
//   (error) => {
//     // Optional: Handle errors
//     console.error('An error occurred:', error);
//   }
// );

// /* Load the frog model */

// // Create an AnimationMixer
// let mixer;
// let frogModel;

// // Load the FBX model
// const loader = new FBXLoader();
// interface FBXLoaderProgressEvent extends ProgressEvent {
//   loaded: number;
//   total: number;
// }

// interface FBXLoaderErrorEvent extends ErrorEvent {
//   message: string;
// }

// loader.load(
//   './Astronaut_Frog.fbx',
//   function (fbx: THREE.Group) {
//     frogModel = fbx;

//     // FBX models are often very large, you might need to scale them down
//     frogModel.scale.setScalar(0.01);

//     // Check if the model has animations
//     if (fbx.animations && fbx.animations.length) {
//       console.log('Model has', fbx.animations.length, 'animations:');
//       fbx.animations.forEach((clip: THREE.AnimationClip, index: number) => {
//         console.log(`Animation ${index}: ${clip.name}`);
//         console.log('Duration:', clip.duration, 'seconds');
//         console.log('Tracks:', clip.tracks.length);

//         // Log what parts of the model can be animated
//         clip.tracks.forEach((track: THREE.KeyframeTrack) => {
//           console.log('Animated property:', track.name);
//         });
//       });

//       // Create an animation mixer
//       mixer = new THREE.AnimationMixer(frogModel);

//       // Play the first animation
//       const action = mixer.clipAction(fbx.animations[0]);
//       action.play();
//     } else {
//       console.log('Model has no animations');
//     }

//     // You can also inspect the skeleton
//     fbx.traverse((child: THREE.Object3D) => {
//       if ((child as THREE.Bone).isBone) {
//         console.log('Found bone:', child.name);
//       }
//     });

//     scene.add(frogModel);
//   },
//   // Progress callback
//   function (xhr: FBXLoaderProgressEvent) {
//     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
//   },
//   // Error callback
//   function (error: FBXLoaderErrorEvent) {
//     console.error('An error occurred loading the model:', error.message);
//   }
// );
