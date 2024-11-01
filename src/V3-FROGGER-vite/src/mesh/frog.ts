import * as THREE from 'three';

// Make the interface exported so we can use it for type checking
export interface IFrog extends THREE.Group {
  update(deltaTime: number): void;
  startJump(): void;
  isJumping(): boolean;
  setInitialRotation(): void;
}

export class Frog extends THREE.Group implements IFrog {
  private state = {
    isJumping: false,
    jumpProgress: 0,
    jumpHeight: 1,
    initialY: 0.25,
    jumpDuration: 500,
  };

  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private legs: THREE.Mesh[];

  constructor() {
    super();

    // Colors
    const bodyColor = 0x2ecc71;
    const eyeColor = 0xf1c40f;

    // Body
    this.body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.7),
      // new THREE.MeshBasicMaterial({ color: bodyColor })
      new THREE.MeshPhongMaterial({ color: bodyColor }) // prófa StandardMaterial
    );

    // Head
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.25, 0.3),
      new THREE.MeshPhongMaterial({ color: bodyColor })
    );
    this.head.position.z = -0.4;
    this.head.position.y = 0.05;

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: eyeColor });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.2, 0.15, -0.4);
    leftEye.scale.set(0.4, 0.4, 0.4);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.2, 0.15, -0.4);
    rightEye.scale.set(0.4, 0.4, 0.4);

    // Legs
    this.legs = [];
    const legMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });

    // Back legs
    const backLegGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.3);
    const backLeftLeg = new THREE.Mesh(backLegGeometry, legMaterial);
    backLeftLeg.position.set(0.25, -0.15, 0.2);
    this.legs.push(backLeftLeg);

    const backRightLeg = new THREE.Mesh(backLegGeometry, legMaterial);
    backRightLeg.position.set(-0.25, -0.15, 0.2);
    this.legs.push(backRightLeg);

    // Front legs
    const frontLegGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.2);
    const frontLeftLeg = new THREE.Mesh(frontLegGeometry, legMaterial);
    frontLeftLeg.position.set(0.2, -0.15, -0.2);
    this.legs.push(frontLeftLeg);

    const frontRightLeg = new THREE.Mesh(frontLegGeometry, legMaterial);
    frontRightLeg.position.set(-0.2, -0.15, -0.2);
    this.legs.push(frontRightLeg);

    // Add all parts to group
    this.add(this.body);
    this.add(this.head);
    this.add(leftEye);
    this.add(rightEye);
    this.legs.forEach((leg) => this.add(leg));

    // Set initial position
    this.position.y = this.state.initialY;
    this.setInitialRotation();
  }

  startJump() {
    if (!this.state.isJumping) {
      this.state.isJumping = true;
      this.state.jumpProgress = 0;
      this.squash();
    }
  }

  private squash() {
    this.body.scale.y = 0.7;
    this.body.scale.x = 1.2;
    this.body.scale.z = 1.2;

    this.legs.forEach((leg) => {
      leg.position.y *= 0.7;
      if (leg.position.x > 0) {
        leg.position.x += 0.1;
      } else {
        leg.position.x -= 0.1;
      }
    });
  }

  private stretch() {
    this.body.scale.y = 1.2;
    this.body.scale.x = 0.8;
    this.body.scale.z = 0.8;

    this.legs.forEach((leg) => {
      leg.position.y -= 0.1;
      if (leg.position.x > 0) {
        leg.position.x -= 0.05;
      } else {
        leg.position.x += 0.05;
      }
    });
  }

  private resetShape() {
    this.body.scale.set(1, 1, 1);
    this.legs.forEach((leg) => {
      leg.position.y = -0.15;
      if (leg.position.x > 0) {
        leg.position.x = leg.position.z > 0 ? 0.25 : 0.2;
      } else {
        leg.position.x = leg.position.z > 0 ? -0.25 : -0.2;
      }
    });
  }

  update(deltaTime: number) {
    if (this.state.isJumping) {
      this.state.jumpProgress += (deltaTime * 1000) / this.state.jumpDuration;

      if (this.state.jumpProgress >= 1) {
        this.state.isJumping = false;
        this.state.jumpProgress = 0;
        this.position.y = this.state.initialY;
        this.resetShape();
      } else {
        const jumpPhase = Math.sin(this.state.jumpProgress * Math.PI);
        this.position.y =
          this.state.initialY + jumpPhase * this.state.jumpHeight;

        if (this.state.jumpProgress < 0.5) {
          this.stretch();
        } else {
          this.squash();
        }
      }
    }
  }

  isJumping(): boolean {
    return this.state.isJumping;
  }

  // Rotate to face -Z (upward in the scene)
  setInitialRotation() {
    this.rotation.y = 0;
  }
}

export function createFrog(): IFrog {
  return new Frog();
}
