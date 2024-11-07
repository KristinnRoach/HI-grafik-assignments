import * as THREE from 'three';
import getLayer from './getLayer.js';
import getStarfield from '../lib/getStarfield.js';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.4, 850);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const camCtrls = new OrbitControls(camera, renderer.domElement);
camCtrls.enableDamping = true;
camCtrls.dampingFactor = 1;
camCtrls.enablePan = false;
camCtrls.enableZoom = true;
// camCtrls.maxPolarAngle = 0;
// camCtrls.minPolarAngle = Math.PI;
camCtrls.enableRotate = false;
camCtrls.maxDistance = 1000;
camCtrls.minDistance = 3;
camCtrls.listenToKeyEvents(window);
camCtrls.enableKeys = true;
camCtrls.keyPanSpeed = 30;
camCtrls.rotateSpeed = 30;

const gltfLoader = new GLTFLoader();

const astroGLB = await gltfLoader.loadAsync('../assets/spaceguy/Astronaut.glb');
const astronaut = astroGLB.scene;
astronaut.traverse((child) => {
  if (child.isMesh) {
    child.geometry.center();
    child.material.roughness = 0.5;
    child.material.metalness = 0.2;
  }
});
scene.add(astronaut);
console.log(astroGLB);

// const astroCtrls = new OrbitControls(astronaut, renderer.domElement);
// astroCtrls.enableDamping = true;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(5, 1, 3);
scene.add(sunLight);

// Sprites BG
const gradientBackground = getLayer({
  hue: 0.5,
  numSprites: 16,
  opacity: 0.08,
  radius: 30,
  size: 35,
  z: -25,
});
scene.add(gradientBackground);

const starfield = getStarfield({ numStars: 5000 });
scene.add(starfield);

// camera.lookAt(astronaut.position);

let movement = false;
let rotationSpeedX = 0.0005;
let rotationSpeedY = 0.0005;

function spinAstronaut(event) {
  if (!movement) return;
  const movementX =
    event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  rotationSpeedY = movementX * 0.0035; // Adjust multiplier for sensitivity

  const movementY =
    event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  rotationSpeedX = movementY * 0.0035; // Adjust multiplier for sensitivity
}

function getScreenCoords(obj, camera) {
  const vector = new THREE.Vector3();

  const canvas = renderer.domElement;
  const widthHalf = canvas.width / 2;
  const heightHalf = canvas.height / 2;

  // Get world position of object
  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);

  // Project the 3D position to 2D screen space
  vector.project(camera);

  // Convert to screen coordinates
  return {
    x: Math.round(vector.x * widthHalf + widthHalf),
    y: Math.round(-(vector.y * heightHalf) + heightHalf),
  };
}

document.addEventListener('mousedown', (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const guyScreenCoords = getScreenCoords(astronaut, camera);
  const guyX = guyScreenCoords.x;
  const guyY = guyScreenCoords.y;

  // Define click tolerance in pixels
  const tolerance = 40; // Adjust this value to make clicking more/less forgiving

  // Simple distance check
  const distance = Math.sqrt(
    Math.pow(mouseX - guyX, 2) + Math.pow(mouseY - guyY, 2)
  );

  if (distance < tolerance) {
    movement = true;
  }
});
document.addEventListener('mousemove', spinAstronaut);
document.addEventListener('mouseup', () => {
  movement = false;
});

let time = 0;
function animate() {
  astronaut.rotation.x -= rotationSpeedX;
  astronaut.rotation.y += rotationSpeedY;
  // camera.position.z = Math.sin(time) * 100;

  const delta = time;
  const poweredSin = Math.sin(delta) * Math.pow(Math.sin(delta), 10);
  camera.position.z = poweredSin * 100;

  renderer.render(scene, camera);
  camCtrls.update();
  time += 0.0015;

  requestAnimationFrame(animate);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

document.addEventListener(
  'keydown',
  (event) => {
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    ) {
      event.preventDefault();
    }
  },
  false
);

// let camRotateX = 0;
// let camRotateY = 0;
// camera.rotateX(camRotateX);
// camera.rotateY(camRotateY);
// camRotateX += 0.0005;
// camRotateY += 0.0005;

// camera.lookAt(astronaut.position);
