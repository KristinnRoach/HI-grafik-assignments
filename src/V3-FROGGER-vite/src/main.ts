// import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const scene = new THREE.Scene();

/* Helpers */
const gridHelper = new THREE.GridHelper(15, 15, 0xffff00);
scene.add(gridHelper);

/* wide angle camera */
const wideCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
wideCam.position.z = 4.5;
wideCam.position.y = 1.5;
wideCam.lookAt(0, 0.5, 0.5);

scene.add(wideCam);

/* frog POV camera */
const frogCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Set the initial camera
let currentCam = wideCam;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* Load the frog model */

// Create an AnimationMixer
let mixer;
let frogModel;

// Load the FBX model
const loader = new FBXLoader();
interface FBXLoaderProgressEvent extends ProgressEvent {
  loaded: number;
  total: number;
}

interface FBXLoaderErrorEvent extends ErrorEvent {
  message: string;
}

loader.load(
  './Astronaut_Frog.fbx',
  function (fbx: THREE.Group) {
    frogModel = fbx;

    // FBX models are often very large, you might need to scale them down
    frogModel.scale.setScalar(0.01);

    // Check if the model has animations
    if (fbx.animations && fbx.animations.length) {
      console.log('Model has', fbx.animations.length, 'animations:');
      fbx.animations.forEach((clip: THREE.AnimationClip, index: number) => {
        console.log(`Animation ${index}: ${clip.name}`);
        console.log('Duration:', clip.duration, 'seconds');
        console.log('Tracks:', clip.tracks.length);

        // Log what parts of the model can be animated
        clip.tracks.forEach((track: THREE.KeyframeTrack) => {
          console.log('Animated property:', track.name);
        });
      });

      // Create an animation mixer
      mixer = new THREE.AnimationMixer(frogModel);

      // Play the first animation
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();
    } else {
      console.log('Model has no animations');
    }

    // You can also inspect the skeleton
    fbx.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Bone).isBone) {
        console.log('Found bone:', child.name);
      }
    });

    scene.add(frogModel);
  },
  // Progress callback
  function (xhr: FBXLoaderProgressEvent) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  // Error callback
  function (error: FBXLoaderErrorEvent) {
    console.error('An error occurred loading the model:', error.message);
  }
);

const controls = new OrbitControls(wideCam, renderer.domElement);

/* Create the ground */
const ground = new THREE.Mesh(
  new THREE.BoxGeometry(15, 1, 15),
  new THREE.MeshBasicMaterial({ color: 0x223311 })
);
ground.position.y = -1;

scene.add(ground);

/* Create the frog and add the frog POV camera to its group object */
const frogger = new THREE.Group();
const frogBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
frogger.add(frogBody);
scene.add(frogger);

frogger.position.y = -0.25;

frogger.add(frogCam);
frogCam.position.y = 0.5;
frogCam.position.z = 2.5;
frogCam.lookAt(frogger.position.x, frogger.position.y, frogger.position.z);

let rotationY = 0;
const moveSpeed = 0.1;
const turnSpeed = 0.03;

/* UI */
const scoreUI = document.querySelector('#scoreUI');
let score = 0;

window.addEventListener('resize', () => {
  frogCam.aspect = window.innerWidth / window.innerHeight;
  frogCam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// For multiple key presses
const keysPressed: { [key: string]: boolean } = {};

globalThis.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
  e.preventDefault();
});

globalThis.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
  e.preventDefault();
});

function updateMovement() {
  // Get forward direction
  const direction = new THREE.Vector3();
  frogger.getWorldDirection(direction);

  // Forward/Backward
  if (keysPressed['w'] || keysPressed['arrowup']) {
    frogger.position.x -= direction.x * moveSpeed;
    frogger.position.z -= direction.z * moveSpeed;
  }
  if (keysPressed['s'] || keysPressed['arrowdown']) {
    frogger.position.x += direction.x * moveSpeed;
    frogger.position.z += direction.z * moveSpeed;
  }

  // Rotation
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    frogger.rotation.y += turnSpeed;
  }
  if (keysPressed['d'] || keysPressed['arrowright']) {
    frogger.rotation.y -= turnSpeed;
  }

  // Jump
  if (keysPressed[' ']) {
    frogger.position.y += 0.1;
  } else if (frogger.position.y > -0.25) {
    frogger.position.y -= 0.1; // Simple gravity
  }
}

function animate() {
  if (currentCam == wideCam) {
    controls.update();
  }
  updateMovement();
  renderer.render(scene, currentCam);
}

renderer.setAnimationLoop(animate);

// window.addEventListener('keydown', (e) => {
//   e.preventDefault();

//   switch (e.key) {
//     case 'ArrowUp':
//     case 'w':
//     case 'W':
//       e.preventDefault();
//       frogger.position.z -= 1;
//       break;
//     case 'ArrowDown':
//     case 's':
//     case 'S':
//       e.preventDefault();
//       frogger.position.z += 1;
//       break;
//     case 'ArrowLeft':
//     case 'a':
//     case 'A':
//       e.preventDefault();
//       frogger.position.x -= 1;
//       break;
//     case 'ArrowRight':
//     case 'd':
//     case 'D':
//       e.preventDefault();
//       frogger.position.x += 1;
//       break;
//     case ' ':
//       e.preventDefault();
//       frogger.position.y += 1;
//       break;
//   }
// });
