// frog.ts
import { THREE } from '../types/types';

export class Frog extends THREE.Group {
  private readonly MOVE_UNIT = 1.0;
  private readonly BOUNDARY = 7;

  private readonly bodyColor = 0x2ecc71;
  private readonly eyeColor = 0xf1c40f;
  private readonly jumpHeight = 0.5;
  private readonly jumpDuration = 200;
  private readonly restingY = 0.25;

  private jumping = false;
  private jumpProgress = 0;
  private startPos = new THREE.Vector3();
  private targetPos = new THREE.Vector3();

  private readonly modelGroup: THREE.Group;

  private readonly body: THREE.Mesh;
  private readonly head: THREE.Mesh;
  private readonly legs: THREE.Mesh[];

  constructor() {
    super();

    // Group for all body parts
    this.modelGroup = new THREE.Group();
    this.add(this.modelGroup);

    // Create body parts with shared materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: this.bodyColor });
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: this.eyeColor });

    // Main body
    this.body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.7),
      bodyMaterial
    );
    this.modelGroup.add(this.body);

    // Head
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.25, 0.3),
      bodyMaterial
    );
    this.head.position.set(0, 0.05, -0.4);
    this.modelGroup.add(this.head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const createEye = (x: number) => {
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.set(x, 0.15, -0.4);
      eye.scale.set(0.4, 0.4, 0.4);
      return eye;
    };
    this.modelGroup.add(createEye(0.2), createEye(-0.2));

    // Legs
    this.legs = this.createLegs(bodyMaterial);
    this.legs.forEach((leg) => this.modelGroup.add(leg));

    // Initial position
    this.position.set(0, this.restingY, 7); // Reset to starting position
    this.rotation.y = 0; // Face forward (-Z)
  }

  // input handling logic
  handleMovement(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    if (this.jumping) return false;

    let newX = this.position.x;
    let newZ = this.position.z;

    switch (direction) {
      case 'up':
        newZ -= this.MOVE_UNIT;
        this.rotation.y = 0;
        break;
      case 'down':
        newZ += this.MOVE_UNIT;
        this.rotation.y = Math.PI;
        break;
      case 'left':
        newX -= this.MOVE_UNIT;
        this.rotation.y = Math.PI / 2;
        break;
      case 'right':
        newX += this.MOVE_UNIT;
        this.rotation.y = -Math.PI / 2;
        break;
    }

    if (this.isValidPosition(newX, newZ)) {
      this.setJumpTarget(newX, newZ);
      this.startJump();
      return true;
    }

    return false;
  }

  private isValidPosition(x: number, z: number): boolean {
    return Math.abs(x) <= this.BOUNDARY && Math.abs(z) <= this.BOUNDARY;
  }

  private createLegs(material: THREE.Material): THREE.Mesh[] {
    const createLegPair = (
      geometry: THREE.BoxGeometry,
      x: number,
      z: number
    ): THREE.Mesh[] => {
      return [-x, x].map((xPos) => {
        const leg = new THREE.Mesh(geometry, material);
        leg.position.set(xPos, -0.15, z);
        return leg;
      });
    };

    return [
      // Back legs
      ...createLegPair(new THREE.BoxGeometry(0.15, 0.2, 0.3), 0.25, 0.2),
      // Front legs
      ...createLegPair(new THREE.BoxGeometry(0.1, 0.15, 0.2), 0.2, -0.2),
    ];
  }

  startJump(): void {
    if (!this.jumping) {
      this.jumping = true;
      this.jumpProgress = 0;
      this.startPos.copy(this.position);
      this.squash();
    }
  }

  setJumpTarget(x: number, z: number): void {
    this.targetPos.set(x, this.restingY, z);
  }

  isJumping(): boolean {
    return this.jumping;
  }

  isAnimatingLevelUp = false;
  animateVictory(): void {
    this.isAnimatingLevelUp = true;
  }

  update(deltaTime: number): void {
    if (!this.jumping) return;
    if (this.isAnimatingLevelUp) {
      this.updateWinningAnimation(deltaTime);
    }
    this.jumpProgress += (deltaTime * 1000) / this.jumpDuration;
    if (this.jumpProgress >= 1) {
      this.completeJump();
    } else {
      this.updateJumpAnimation();
    }
  }

  updateWinningAnimation(deltaTime: number): void {
    // slow mo jump back to starting position
    this.jumpProgress += (deltaTime * 1000) / this.jumpDuration / 2;
    if (this.jumpProgress >= 1) {
      this.isAnimatingLevelUp = false;
      this.resetFrog();
    } else {
      this.updateJumpAnimation();
    }
  }

  private completeJump(): void {
    this.jumping = false;
    this.position.copy(this.targetPos);
    this.position.y = this.restingY;
    this.resetShape();
  }

  private updateJumpAnimation(): void {
    // Calculate target position
    const targetPosition = new THREE.Vector3();
    targetPosition.lerpVectors(
      this.startPos,
      this.targetPos,
      this.jumpProgress
    );

    // Jump arc - only modify Y during jump
    const jumpPhase = Math.sin(this.jumpProgress * Math.PI);
    targetPosition.y = this.restingY + jumpPhase * this.jumpHeight;

    // Update position in one operation
    this.position.copy(targetPosition);

    // Animation
    if (this.jumpProgress < 0.5) {
      this.stretch();
    } else {
      this.squash();
    }
  }

  private squash(): void {
    this.modelGroup.scale.set(1.2, 0.7, 1.2);
  }

  private stretch(): void {
    this.modelGroup.scale.set(0.8, 1.2, 0.8);
  }

  private resetShape(): void {
    this.modelGroup.scale.set(1, 1, 1);
  }

  resetFrog(): void {
    this.position.set(0, this.restingY, 7); // Reset to starting position
    this.rotation.y = 0; // Face forward
    this.modelGroup.scale.set(1, 1, 1);
    this.jumping = false;

    // reset materials
    let materialIndex = 0;
    this.modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.body.material;
      }
    });
  }
}

export function createFrog() {
  return new Frog();
}

/* old animation, ignore below */

// private squash(): void {
//   this.body.scale.set(1.2, 0.7, 1.2);
//   this.legs.forEach((leg) => {
//     leg.position.y *= 0.45;
//     leg.position.x *= 1.2;
//   });
// }

// private stretch(): void {
//   this.body.scale.set(0.8, 1.2, 0.8);
//   this.legs.forEach((leg) => {
//     leg.position.y *= 0.8;
//     leg.position.x *= 0.8;
//   });
// }

// private resetShape(): void {
//   this.body.scale.set(1, 1, 1);
//   this.legs.forEach((leg, i) => {
//     const isBack = i < 2;
//     const isLeft = i % 2 === 0;
//     leg.position.y = -0.15;
//     leg.position.x = isLeft ? (isBack ? 0.25 : 0.2) : isBack ? -0.25 : -0.2;
//   });
// }

/* end of old animation */
