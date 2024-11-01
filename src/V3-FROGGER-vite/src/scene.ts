import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as Cannon from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { GridSystem } from './utility/GridSystem';

// Constants
const BASE_HEIGHT = 1 / 2;
const GRID_SIZE = 15;

// Initialize core scene objects
export const scene = new THREE.Scene();
export const world = new Cannon.World();
export const gridSystem = new GridSystem(GRID_SIZE);

// Initialize cameras
export const wideCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.2,
  1000
);

export const frogCam = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Initialize renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });

// Setup function
export function initializeScene() {
  // Set up physics world
  world.gravity.set(0, -9.82, 0);
  const cannonDebugger = new CannonDebugger(scene, world, {
    color: 0x00ff00,
  });

  // Set up grid system
  gridSystem.setBaseHeight(BASE_HEIGHT);

  // Add helpers
  const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0xffff00);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Set up wide camera
  scene.add(wideCam);
  wideCam.lookAt(0, 0, 0);
  gridSystem.placeObject(wideCam, 7, -4);
  wideCam.position.y = 3.5;

  // Set up renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Set up orbit controls
  const controls = new OrbitControls(wideCam, renderer.domElement);
  controls.target.y = BASE_HEIGHT;
  controls.update();

  return {
    scene,
    world,
    gridSystem,
    wideCam,
    frogCam,
    renderer,
    controls,
    cannonDebugger,
    BASE_HEIGHT,
    GRID_SIZE,
  };
}

// Window resize handler
export function handleResize() {
  wideCam.aspect = window.innerWidth / window.innerHeight;
  frogCam.aspect = window.innerWidth / window.innerHeight;
  wideCam.updateProjectionMatrix();
  frogCam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize resize listener
window.addEventListener('resize', handleResize);
