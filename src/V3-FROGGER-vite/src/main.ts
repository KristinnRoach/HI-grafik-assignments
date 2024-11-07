import './css/styles.css';
import {
  scene,
  //   world,
  gridSystem,
  wideCam,
  frogCam,
  renderer,
  initializeScene,
} from './scene';
import { createFrog, IFrog } from './mesh/frog';
import { createGround } from './mesh/ground';
// import { createPowerups } from './mesh/powerup';
import { loadCar } from './mesh/cars';
import { MovementController } from './controls';
import { gameState } from './gameState';

// Initialize scene and get references
const sceneSetup = initializeScene();

// Create game objects
const ground = createGround();
ground.position.set(0, -sceneSetup.BASE_HEIGHT, 0);
scene.add(ground);

// Create frog and attach camera
const frogger: IFrog = createFrog();
frogger.add(frogCam);
scene.add(frogger);

// Set up frog camera
frogCam.position.y = 0.5;
frogCam.position.z = 2.5;
frogCam.lookAt(frogger.position);

// Create powerups
// createPowerups();

// create cars
// const pickup = createPickup();
// scene.add(pickup);
// pickup.position.set(0, 2, 0);
const car = loadCar();
console.log(car);

// Set initial positions
gridSystem.placeObject(frogger, 7, 0);

// Initialize movement controller
const movementController = new MovementController(frogger, gridSystem);

// UI button setup
const switchCamBtn = document.querySelector('#switchCam');
switchCamBtn?.addEventListener('click', () => {
  const newCam = gameState.toggleCamera();
  currentCam = newCam === 'wide' ? wideCam : frogCam;
});

// Animation loop
let currentCam = wideCam;

function animate() {
  // Update controls based on current camera
  if (gameState.getCurrentCam() === 'wide') {
    sceneSetup.controls.update();
  }

  // Update movement
  movementController.update();

  // Render scene
  renderer.render(scene, currentCam);
}

renderer.setAnimationLoop(animate);
