// main.ts
import './css/styles.css';
import { THREE } from './types/types';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGround } from './mesh/ground';
import { createCars, updateCars } from './mesh/cars';
import { createLogs, updateLogs } from './mesh/logs';
import { createFrog, Frog } from './mesh/Frog';
import { GameState } from './gameState';
import { CollisionSystem } from './collision';

class Game {
  private readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly wideCam: THREE.PerspectiveCamera;
  private readonly frogCam: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly clock = new THREE.Clock();
  private readonly stats = new Stats();
  private readonly collisionSystem: CollisionSystem;
  private readonly gameState: GameState;

  private currentCam: THREE.PerspectiveCamera;
  private _frogger: Frog;
  private cars: THREE.Object3D[] = [];
  private logs: THREE.Object3D[] = [];
  private lastKeyPress = 0;
  private readonly KEY_DEBOUNCE = 100;

  constructor() {
    // make Singleton ?
    // Initialize core Three.js components
    this.renderer = this.setupRenderer();
    this.wideCam = this.setupWideCamera();
    this.frogCam = this.setupFrogCamera();
    this.currentCam = this.wideCam;
    this.controls = this.initOrbitControls();
    this.controls.update(); // Initial update

    // Set up game state
    this.gameState = GameState.getInstance();

    // Initialize game objects
    this._frogger = createFrog();
    this.setupScene();
    this.collisionSystem = CollisionSystem.getInstance(this._frogger);
    this.setupEventListeners();
    this.setupInputHandling();

    // Start game loop
    this.renderer.setAnimationLoop(() => this.update());
  }

  get frogger() {
    return this._frogger;
  }

  private setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(this.stats.dom);
    return renderer;
  }

  private setupInputHandling() {
    document.addEventListener('keydown', (event) => {
      // Debounce check
      const now = performance.now();
      if (now - this.lastKeyPress < this.KEY_DEBOUNCE) return;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          direction = 'up';
          break;
        case 'ArrowDown':
          event.preventDefault();
          direction = 'down';
          break;
        case 'ArrowLeft':
          event.preventDefault();
          direction = 'left';
          break;
        case 'ArrowRight':
          event.preventDefault();
          direction = 'right';
          break;
      }

      if (direction) {
        if (this._frogger.handleMovement(direction)) {
          this.lastKeyPress = now;
        }
      }
    });
  }

  private initOrbitControls() {
    const controls = new OrbitControls(this.wideCam, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    return controls;
  }

  private setupWideCamera() {
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.5,
      800
    );
    camera.position.set(0, 7, 14);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  private setupFrogCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    camera.position.set(0, 1.5, 5);
    return camera;
  }

  private setupScene() {
    // Lights
    const lights = [
      new THREE.DirectionalLight(0xffffff, 1.3),
      new THREE.AmbientLight(0x404040, 0.2),
      new THREE.HemisphereLight(0xffffff, 0x080820, 0.3),
    ];
    lights[0].castShadow = true; // Enable shadow casting // MAKE THIS THE SUN ?
    // lights[2].castShadow = true;
    lights[0].position.set(4, 5, 8);

    lights.forEach((light) => this.scene.add(light));

    // Ground
    const ground = createGround();
    ground.position.y = -0.5;
    this.scene.add(ground);

    // Frog
    this._frogger.add(this.frogCam);
    this.scene.add(this._frogger);

    // Cars
    this.cars = createCars(1);
    this.cars.forEach((car) => this.scene.add(car));

    // Logs
    this.logs = createLogs(3);
    this.logs.forEach((log) => this.scene.add(log));

    // Debug helpers
    // const gridHelper = new THREE.GridHelper(15, 15, 0xffff00);
    // gridHelper.position.y = 0.01;
    // this.scene.add(gridHelper);

    // const axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(axesHelper);
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.wideCam.aspect = width / height;
      this.frogCam.aspect = width / height;
      this.wideCam.updateProjectionMatrix();
      this.frogCam.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    // Handle camera switch button
    const switchCamBtn = document.querySelector('#switchCam');
    const pauseBtn = document.querySelector('#pause');
    const playBtn = document.querySelector('#play');
    const resetBtn = document.querySelector('#reset');

    if (switchCamBtn && pauseBtn && playBtn && resetBtn) {
      switchCamBtn.addEventListener('click', () => {
        const newCam = this.gameState.toggleCamera();
        this.currentCam = newCam === 'wide' ? this.wideCam : this.frogCam;

        // Manually update the OrbitControls to work with the new camera
        if (newCam === 'wide') {
          this.controls.object = this.wideCam;
          this.controls.enabled = true;
        } else {
          this.controls.enabled = false; // Disable controls for frog cam
        }

        // Update camera projections
        this.currentCam.updateProjectionMatrix();
        console.log('Camera switched to:', newCam); // Debug log
      });

      pauseBtn.addEventListener('click', () => {
        this.renderer.setAnimationLoop(null);
      });

      playBtn.addEventListener('click', () => {
        this.renderer.setAnimationLoop(() => this.update());
      });

      resetBtn.addEventListener('click', () => {
        this.gameState.reset();
      });
    }
  }

  checkIsOnGroundXZ(obj: THREE.Object3D): boolean {
    return (
      obj.position.x < 7.5 &&
      obj.position.x > -7.5 &&
      obj.position.z < 7.5 &&
      obj.position.z > -7.5
    );
  }

  private update() {
    const deltaTime = this.clock.getDelta();

    if (!this.checkIsOnGroundXZ(this._frogger)) {
      this.gameState.updateLives(-1);
      this.gameState.updateCurrentLog(null);
    }

    this.collisionSystem.check(this.cars, 'car', deltaTime, this._frogger);
    this.collisionSystem.check(this.logs, 'log', deltaTime, this._frogger);
    this.collisionSystem.checkRiver(deltaTime, this._frogger);

    this._frogger.update(deltaTime);
    updateCars(this.cars, deltaTime);
    updateLogs(this.logs, deltaTime);

    this.controls.update();

    this.renderer.render(this.scene, this.currentCam);
    this.stats.update();
  }
}

// Start game
new Game();

//export const GAME = new Game(); // temp fix, change to singleton
