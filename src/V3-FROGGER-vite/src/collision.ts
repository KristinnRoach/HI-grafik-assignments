// collision.ts
import * as THREE from 'three';
import { GameState } from './gameState';
import { getRiverBoundingBox } from './mesh/ground';

export class CollisionSystem {
  private static instance: CollisionSystem;

  private frogBox = new THREE.Box3();
  private tempBox = new THREE.Box3();
  private riverBox = new THREE.Box3(); // getRiverBoundingBox();
  private isAnimatingDeath = false;
  private originalMaterials: THREE.Material[] = [];
  private gameState: GameState;

  constructor(private frog: THREE.Object3D) {
    this.gameState = GameState.getInstance();

    // Store original materials for reset
    this.frog.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.originalMaterials.push(child.material);
      }
    });

    this.riverBox = getRiverBoundingBox();
  }

  static getInstance(frog: THREE.Object3D): CollisionSystem {
    if (!CollisionSystem.instance) {
      CollisionSystem.instance = new CollisionSystem(frog);
    }
    return CollisionSystem.instance;
  }

  check(
    collidables: THREE.Object3D[],
    type: 'car' | 'log' | 'river',
    deltaTime: number,
    frogger: THREE.Object3D // temp fix
  ): boolean {
    if (this.isAnimatingDeath) return false;

    this.frogBox.setFromObject(this.frog);
    let isOnAnyLog = false;

    for (const obj of collidables) {
      this.tempBox.setFromObject(obj);

      if (this.frogBox.intersectsBox(this.tempBox)) {
        if (type === 'car') {
          this.handleCarCollision();
        } else if (type === 'log') {
          this.handleLogCollision(obj, deltaTime, frogger);
          isOnAnyLog = true;
        }
        return true;
      }
    }

    if (type === 'log' && !isOnAnyLog) {
      this.gameState.updateCurrentLog(null);
    }

    // Return whether we found any collisions
    return isOnAnyLog || type === 'car';
  }

  logRadius = 0.3; // move
  frogHeight = 0.25; // move

  private handleLogCollision(
    log: THREE.Object3D,
    deltaTime: number,
    frogger: THREE.Object3D
  ) {
    const logY = log.position.y;
    // Position frog on top of log
    frogger.position.y = logY + this.logRadius + this.frogHeight;

    //  update the current log reference if it's a new log
    if (this.gameState.currentLog !== log) {
      this.gameState.updateCurrentLog(log as THREE.Mesh);
    }
  }

  private handleCarCollision() {
    console.log('Hit by car!');
    this.animateDeathEffect(500);
    this.gameState.updateLives(-1);
  }

  checkRiver(deltaTime: number, frogger: THREE.Object3D) {
    if (this.isAnimatingDeath) return false;

    this.frogBox.setFromObject(frogger);

    // Check if frog is in river area
    if (this.frogBox.intersectsBox(this.riverBox)) {
      console.log('frogger intersects river box');
      // If we're not on a log while in the river, we're drowning
      if (!this.gameState.currentLog) {
        console.log('River collision detected - Drowning!');
        this.handleDrowning();
        return true;
      }
    }
  }

  private handleDrowning() {
    if (!this.isAnimatingDeath) {
      this.animateDeathEffect(500);
      this.gameState.updateLives(-1);
    }
  }

  // move frog animations to Frog class!
  private animateDeathEffect(duration: number) {
    if (this.isAnimatingDeath) return;

    this.isAnimatingDeath = true;

    // Change frog material to red
    const deathMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    this.frog.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = deathMaterial;
      }
    });

    // Scale up animation
    const originalScale = this.frog.scale.clone();
    const scaleUp = new THREE.Vector3(1.5, 1.5, 1.5);
    this.frog.scale.copy(scaleUp);

    // Reset after animation
    setTimeout(() => {
      // Reset position and rotation
      this.resetFrog(originalScale);

      this.isAnimatingDeath = false;
    }, duration);
  }

  private resetFrog(orgScale?: THREE.Vector3) {
    this.frog.position.set(0, 0.25, 7); // Reset to starting position
    this.frog.rotation.y = 0; // Face forward

    // Reset materials
    let materialIndex = 0;
    this.frog.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.originalMaterials[materialIndex++];
      }
    });

    // Reset scale
    this.frog.scale.copy(orgScale || new THREE.Vector3(1, 1, 1));
  }
}
