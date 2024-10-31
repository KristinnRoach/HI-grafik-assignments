import * as THREE from 'three';
// import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js';

const scene = new THREE.Scene();

/* Helpers */
const gridHelper = new THREE.GridHelper(15, 15, 0xffff00);
scene.add(gridHelper);

/* wide angle camera */
const wideCam = new THREE.PerspectiveCamera(
  75,
  // window.innerWidth / window.innerHeight,
  1,
  0.1,
  1000
);
wideCam.position.z = 4.5;
wideCam.position.y = 1.5;
wideCam.lookAt(0, 0.5, 0.5);

scene.add(wideCam);

const FIXED_SIZE = 1024;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(FIXED_SIZE, FIXED_SIZE);
document.body.appendChild(renderer.domElement);

/* Load the frog model */

// Create an AnimationMixer
let mixer;
let frogModel;

// Load the FBX model
const loader = new FBXLoader();
loader.load(
  '../assets/3D-models/Astronaut_Frog.fbx',
  function (fbx) {
    frogModel = fbx;

    // FBX models are often very large, you might need to scale them down
    frogModel.scale.setScalar(0.01);

    // Check if the model has animations
    if (fbx.animations && fbx.animations.length) {
      console.log('Model has', fbx.animations.length, 'animations:');
      fbx.animations.forEach((clip, index) => {
        console.log(`Animation ${index}: ${clip.name}`);
        console.log('Duration:', clip.duration, 'seconds');
        console.log('Tracks:', clip.tracks.length);

        // Log what parts of the model can be animated
        clip.tracks.forEach((track) => {
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
    fbx.traverse((child) => {
      if (child.isBone) {
        console.log('Found bone:', child.name);
      }
    });

    scene.add(frogModel);
  },
  // Progress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  // Error callback
  function (error) {
    console.error('An error occurred loading the model:', error);
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

/* Create the frog with a first person camera */
const frogger = new THREE.Group();
const frogBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
frogger.add(frogBody);
scene.add(frogger);
frogger.position.y = -0.25;

scene.add(frogger);

/* frog POV camera */
const frogCam = new THREE.PerspectiveCamera(
  75,
  FIXED_SIZE / FIXED_SIZE,
  0.1,
  1000
);

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

// window.addEventListener('resize', () => {
//   frogCam.aspect = window.innerWidth / window.innerHeight;
//   frogCam.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });

// For multiple key presses
const keysPressed = {};

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
  // if (currentCam == wideCam) {
  // controls.update();
  // }
  updateMovement();
  renderer.render(scene, wideCam);
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
