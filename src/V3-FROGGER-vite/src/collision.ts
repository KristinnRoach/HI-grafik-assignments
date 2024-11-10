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
  private currentLogVelocity = new THREE.Vector3(0, 0, 0);

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

    for (const obj of collidables) {
      this.tempBox.setFromObject(obj);

      if (this.frogBox.intersectsBox(this.tempBox)) {
        console.log('Collision detected!');
        if (type === 'car') {
          this.handleCarCollision();
        } else if (type === 'log') {
          this.handleLogCollision(obj, deltaTime, frogger);
        }
        return true;
      }
    }

    return false;
  }

  checkRiver(deltaTime: number, frogger: THREE.Object3D) {
    if (this.isAnimatingDeath) return false;

    this.frogBox.setFromObject(frogger);
    if (this.frogBox.intersectsBox(this.riverBox)) {
      this.animateDeathEffect(500);
    }
  }

  private handleCarCollision() {
    console.log('Hit by car!');
    this.animateDeathEffect(500);
    this.gameState.updateLives(-1);
    this.resetFrog();
  }

  private handleLogCollision(
    log: THREE.Object3D,
    deltaTime: number,
    frogger: THREE.Object3D
  ) {
    if (this.gameState.currentLog === log) return; // if still on the same log, or not on a log return

    // If switching logs, remove old movement
    if (this.gameState.currentLog && this.gameState.currentLog !== log) {
      frogger.position.sub(this.currentLogVelocity);
      this.gameState.updateCurrentLog(log as THREE.Mesh);
    }
    // Apply new log's movement
    this.currentLogVelocity = log.userData.velocity
      .clone()
      .multiplyScalar(deltaTime);
    frogger.position.add(this.currentLogVelocity);
  }

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

// const logMovement = new THREE.Vector3(0.1, 0, 0);
// this.frogger.position.sub(this.currentLogVelocity);
// this.currentLogVelocity.set(0, 0, 0);

// if (this.gameState.currentLog) {
//   if (this.currentLogVelocity.length() === 0) {
//     this.currentLogVelocity = this.gameState.currentLog.userData.velocity
//       .clone()
//       .multiplyScalar(deltaTime);
//   }
//   this.frogger.position.add(this.currentLogVelocity);
// } else if (this.currentLogVelocity.length() > 0) {
//   // Only subtract and reset if we actually have a velocity to undo
//   this.frogger.position.sub(this.currentLogVelocity);
//   this.currentLogVelocity.set(0, 0, 0);
// }
