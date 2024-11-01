import { GridSystem } from './utility/GridSystem';
import { IFrog } from './mesh/frog';

export class MovementController {
  private keysPressed: { [key: string]: boolean } = {};
  private currentGridPos: { x: number; z: number };
  private lastUpdateTime: number;

  private targetRotationY: number = 0;
  private rotationSpeed: number = 10;

  constructor(private frogger: IFrog, private gridSystem: GridSystem) {
    // Set initial grid position
    this.currentGridPos = gridSystem.worldToGrid(
      frogger.position.x,
      frogger.position.z
    );

    // Set initial rotation
    this.frogger.setInitialRotation();
    this.targetRotationY = this.frogger.rotation.y;

    this.lastUpdateTime = performance.now();
    this.targetRotationY = frogger.rotation.y;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key.toLowerCase()] = true;

      // Set target rotation when key is first pressed
      if ((e.key === 'a' || e.key === 'ArrowLeft') && !this.isRotating()) {
        this.targetRotationY += Math.PI / 2;
      }
      if ((e.key === 'd' || e.key === 'ArrowRight') && !this.isRotating()) {
        this.targetRotationY -= Math.PI / 2;
      }

      e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
      e.preventDefault();
    });
  }

  private isRotating(): boolean {
    return Math.abs(this.frogger.rotation.y - this.targetRotationY) > 0.01;
  }

  private updateRotation(deltaTime: number) {
    if (this.isRotating()) {
      // Lerp the current rotation towards the target
      const step = this.rotationSpeed * deltaTime;
      this.frogger.rotation.y +=
        (this.targetRotationY - this.frogger.rotation.y) * step;

      // Snap to target if very close to avoid floating point issues
      if (Math.abs(this.frogger.rotation.y - this.targetRotationY) < 0.01) {
        this.frogger.rotation.y = this.targetRotationY;
      }
    }
  }

  private getMovementDeltas(): { deltaX: number; deltaZ: number } {
    // Get the angle in radians, normalized to 0-2π
    let angle = this.frogger.rotation.y % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;

    // Round to nearest 90 degrees (π/2 radians)
    const snapAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);

    // Convert angle to grid deltas
    switch (snapAngle) {
      case 0: // Facing forward (-Z)
        return { deltaX: 0, deltaZ: 1 };
      case Math.PI / 2: // Facing left (-X)
        return { deltaX: -1, deltaZ: 0 };
      case Math.PI: // Facing backward (+Z)
        return { deltaX: 0, deltaZ: -1 };
      case (3 * Math.PI) / 2: // Facing right (+X)
        return { deltaX: 1, deltaZ: 0 };
      default:
        return { deltaX: 0, deltaZ: 0 };
    }
  }

  private moveForward() {
    // Get direction frog is facing and round to nearest grid direction
    const deltas = this.getMovementDeltas();

    // Move in the direction the frog is facing (negative Z is forward in the scene)
    const newPos = {
      x: this.currentGridPos.x + deltas.deltaX,
      z: this.currentGridPos.z + deltas.deltaZ,
    };

    this.gridSystem.placeObject(this.frogger, newPos.x, newPos.z);
    this.frogger.startJump();
    this.updateGridPosition();
  }

  private moveBackward() {
    const deltas = this.getMovementDeltas();
    const newPos = {
      x: this.currentGridPos.x - deltas.deltaX,
      z: this.currentGridPos.z - deltas.deltaZ,
    };

    this.gridSystem.placeObject(this.frogger, newPos.x, newPos.z);
    this.frogger.startJump();
    this.updateGridPosition();
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    // Update jumping animation
    this.frogger.update(deltaTime);

    this.updateRotation(deltaTime);

    // Only allow movement if not jumping
    if (!this.frogger.isJumping() && !this.isRotating()) {
      // Forward (Up arrow or W)
      if (this.keysPressed['w'] || this.keysPressed['arrowup']) {
        this.moveForward();
      }

      // Backward (Down arrow or S)
      if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
        this.moveBackward();
      }

      // Space bar jump (in place)
      if (this.keysPressed[' ']) {
        this.frogger.startJump();
      }
    }
  }

  private updateGridPosition() {
    this.currentGridPos = this.gridSystem.worldToGrid(
      this.frogger.position.x,
      this.frogger.position.z
    );
  }
}
