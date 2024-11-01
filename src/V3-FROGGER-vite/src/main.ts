import './css/styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import * as Cannon from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { createFrog } from './mesh/frog';
import { createGround, GROUND_Y } from './mesh/ground';
import { createPowerups } from './mesh/powerup';
import { GridSystem } from './utility/GridSystem';
import { getBottomY, setYPosBottom, setYPosTop } from './utility/position';

/* Constants */

const BASE_HEIGHT = 1 / 2; // GROUND_Y / 2;
const GRID_SIZE = 15;
const gridSystem = new GridSystem(GRID_SIZE);
gridSystem.setBaseHeight(BASE_HEIGHT);

/* SCENE SETUP */

export const scene = new THREE.Scene();

/* Cannon.js setup */

const world = new Cannon.World();
world.gravity.set(0, -9.82, 0);
const cannonDebugger = new CannonDebugger(scene, world, {
  color: 0x00ff00,
});

/* Helpers */
// const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0xffff00);
// scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/* wide angle camera */
const wideCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.add(wideCam);
wideCam.lookAt(0, 0, 0);
gridSystem.placeObject(wideCam, 7, -4);
wideCam.position.y = 3.5;

/* frog POV camera */
const frogCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Set the initial camera
let currentCam = wideCam;

const switchCam = () => {
  currentCam = currentCam == wideCam ? frogCam : wideCam;
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls only used for wide angle camera
const controls = new OrbitControls(wideCam, renderer.domElement);
controls.target.y = BASE_HEIGHT;
controls.update();

/* Resize */
window.addEventListener('resize', () => {
  frogCam.aspect = window.innerWidth / window.innerHeight;
  frogCam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* Create the ground */

// physics body
const groundMaterial = new Cannon.Material('groundMaterial');
const groundBody = new Cannon.Body({
  type: Cannon.Body.STATIC, // This makes it immovable
  mass: 0, // Mass of 0 makes it static
  material: groundMaterial,
  shape: new Cannon.Box(
    new Cannon.Vec3(GRID_SIZE / 2, BASE_HEIGHT / 2, GRID_SIZE / 2)
  ),
});
groundBody.position.y = -BASE_HEIGHT;
world.addBody(groundBody);

// mesh
const ground = createGround();
ground.position.set(0, -BASE_HEIGHT, 0);
scene.add(ground);

/* Create the frog and add the frog POV camera to its group object */
// const frogMaterial = new Cannon.Material('frogMaterial');
// const frogBody = new Cannon.Body({
//   type: Cannon.Body.DYNAMIC,
//   mass: 1,
//   material: frogMaterial,
//   shape: new Cannon.Box(new Cannon.Vec3(0.25, 0.25, 0.25)),
//   fixedRotation: true, // Prevent rotation
//   // angularFactor: new Cannon.Vec3(0, 1, 0), // Only rotate around Y axis
//   // collision damping
//   linearDamping: 0.4,
//   // angularDamping: 0.8,
// });
// world.addBody(frogBody);

const frogger = new THREE.Group();
const frogMesh = createFrog();
frogger.add(frogMesh);
frogger.add(frogCam);

scene.add(frogger);

// frogger.position.y = BASE_HEIGHT;
// frogCam.position.y = frogger.position.y + 0.5;
// frogCam.position.z = frogger.position.z + 2.5;
// frogCam.lookAt(frogger.position.x, frogger.position.y, frogger.position.z);

// Create contact material between ground and frog
// const groundFrogContact = new Cannon.ContactMaterial(
//   groundMaterial,
//   frogMaterial,
//   {
//     friction: 0.9, // High friction for better control
//     restitution: 0.2, // Low restitution to prevent bouncing
//     contactEquationStiffness: 1e8, // Higher stiffness for solid collisions
//     contactEquationRelaxation: 3, // Lower relaxation for stable collisions
//     frictionEquationStiffness: 1e8, // Higher friction stiffness
//     // frictionEquationRelaxation: 3, // TEST
//   }
// );
// world.addContactMaterial(groundFrogContact);

// Optional: Add collision event listeners to debug
// frogBody.addEventListener('collide', (e: any) => {
//   if (e.body === groundBody) {
//     const frogBottom = getBottomY(frogger);
//     const bbox = new THREE.Box3().setFromObject(ground);
//     const groundTop = bbox.max.y;
//     console.log(
//       'Collision with ground ',
//       frogBottom,
//       'ground',
//       groundTop
//       //{
//       // contactNormal: e.contact.ni,
//       // impactVelocity: e.contact.getImpactVelocityAlongNormal(),
//       //}
//     );
//   }
// });

/* Create powerups */
const powerups = createPowerups();

/* Set initial positions */

// gridSystem.placeObject(frogBody, 7, 0);
gridSystem.placeObject(frogger, 7, 0);
// setYPosBottom(frogger, BASE_HEIGHT);

/* UI info */
const scoreUI = document.querySelector('#scoreUI');
const timeUI = document.querySelector('#timeUI');
const livesUI = document.querySelector('#livesUI');

let score = 0;
let time = 480;
let lives = 4;

/* UI buttons */
const switchCamBtn = document.querySelector('#switchCam');
switchCamBtn?.addEventListener('click', switchCam);

/* Movement */

const groundMoveSpeed = 4;
const airMoveSpeed = 0;
const turnSpeed = 0.08;
const jumpForce = 2;
let isJumping = false;

const keysPressed: { [key: string]: boolean } = {}; // For multiple key presses

globalThis.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
  e.preventDefault();
});

globalThis.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
  e.preventDefault();
});

// Input → Visual Rotation (frogger) → Get Direction → Apply to Physics Velocity (frogBody) → Update Visual Position (frogger)
// → Check Position → Repeat

let frogGridPos = gridSystem.worldToGrid(
  frogger.position.x,
  frogger.position.z
);

// simplified by moving in steps along the grid
function updateMovement() {
  // Get rotation from the frogger mesh
  const direction = new THREE.Vector3();
  frogger.getWorldDirection(direction);
  const currentPos = frogGridPos;
  // Forward/Backward
  if (keysPressed['w'] || keysPressed['arrowup']) {
    const moveX = direction.x > 0 ? 1 : direction.x < 0 ? -1 : 0;
    const moveZ = direction.z < 0 ? 1 : direction.z > 0 ? -1 : 0;
    gridSystem.placeObject(frogger, currentPos.x + moveX, currentPos.z + moveZ);
  }
  if (keysPressed['s'] || keysPressed['arrowdown']) {
    gridSystem.placeObject(frogger, currentPos.x - 1, currentPos.z - 1);
  }

  // Rotation
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    frogger.rotation.y += Math.PI / 2;
  }
  if (keysPressed['d'] || keysPressed['arrowright']) {
    frogger.rotation.y -= Math.PI / 2;
  }

  // Jump
  if (keysPressed[' '] && !isJumping) {
    // frogBody.velocity.y = jumpForce;
    isJumping = true;
    console.log(isJumping);
  }
}

/* Animation loop */

function animate() {
  if (currentCam == wideCam) {
    controls.update();
  }
  // Update physics world
  world.fixedStep();

  updateMovement();
  // frogger.position.copy(frogBody.position);

  cannonDebugger.update();

  renderer.render(scene, currentCam);
}

renderer.setAnimationLoop(animate);

//----------------- OLD CODE -----------------
// checkPosition();
// frogger.quaternion.copy(frogBody.quaternion);

// function checkPosition() {
//   if (frogBody.position.y < -10) {
//     lives--;
//     livesUI!.textContent = `Lives: ${lives}`;
//     gridSystem.placeObject(frogBody, 7, 7);
//   } else if (frogBody.position.y <= BASE_HEIGHT) {
//     isJumping = false;
//   }
// }

// // Contact material to detect ground collision for jumping
// if (groundBody.material && frogBody.material) {
//   const groundContact = new Cannon.ContactMaterial(
//     groundBody.material,
//     frogBody.material,
//     {
//       friction: 0.9,
//       restitution: 0.2,
//     }
//   );
//   world.addContactMaterial(groundContact);
// }

// // Add contact event to check if frog can jump // NOT WORKING
// frogBody.addEventListener('collide', (event: any) => {
//   if (event.contact.bj === groundBody) {
//     isJumping = false;
//     console.log(isJumping);
//   }
// });

// function updateMovement() {
//   // const rotationQuaternion = frogBody.quaternion;
//   // const direction = new Cannon.Vec3(0, 0, 1);
//   // direction.scale(-1); // Flip forward direction if needed
//   // rotationQuaternion.vmult(direction, direction);

//   // Get rotation from the visual mesh (frogger) instead of physics body
//   const direction = new THREE.Vector3();
//   frogger.getWorldDirection(direction);

//   const moveSpeed = isJumping ? airMoveSpeed : groundMoveSpeed;
//   const velocity = new Cannon.Vec3(0, frogBody.velocity.y, 0);

//   // Forward/Backward
//   if (keysPressed['w'] || keysPressed['arrowup']) {
//     velocity.x -= direction.x * moveSpeed;
//     velocity.z -= direction.z * moveSpeed;
//   }
//   if (keysPressed['s'] || keysPressed['arrowdown']) {
//     velocity.x += direction.x * moveSpeed;
//     velocity.z += direction.z * moveSpeed;
//   }

//   // Apply horizontal velocity while preserving vertical velocity
//   frogBody.velocity.x = velocity.x;
//   frogBody.velocity.z = velocity.z;

//   // Add damping when on ground for better control
//   if (!isJumping) {
//     frogBody.velocity.x *= 0.9; // Ground friction
//     frogBody.velocity.z *= 0.9;
//   }

//   // Rotation - update both physics body and visual mesh
//   if (keysPressed['a'] || keysPressed['arrowleft']) {
//     frogger.rotation.y += turnSpeed;
//     // frogBody.quaternion.setFromEuler(0, frogger.rotation.y, 0);
//   }
//   if (keysPressed['d'] || keysPressed['arrowright']) {
//     frogger.rotation.y -= turnSpeed;
//     // frogBody.quaternion.setFromEuler(0, frogger.rotation.y, 0);
//   }

//   // Jump
//   if (keysPressed[' '] && !isJumping) {
//     frogBody.velocity.y = jumpForce;
//     // canJump = false;
//     isJumping = true;
//     console.log(isJumping);
//   }
// }
