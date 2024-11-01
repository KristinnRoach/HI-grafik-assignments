import * as THREE from 'three';
import * as Cannon from 'cannon-es';

export class GridSystem {
  private gridSize: number;
  private cellSize: number;
  private offset: number;
  private baseHeight: number; // Y axis is not part of grid system

  constructor(gridSize: number = 15) {
    this.gridSize = gridSize;
    this.offset = gridSize / 2; // Offset to center the grid (since Three.js uses center origin)
    this.cellSize = 1; // Default grid-cell size is 1 unit
    this.baseHeight = 0; // Default base height is 0
  }

  // Convert grid coordinates to world coordinates
  gridToWorld(gridX: number, gridZ: number): { x: number; z: number } {
    // THREE.Vector3 {
    // Convert from grid coordinates to world coordinates
    const worldX = (gridX - this.offset + 0.5) * this.cellSize;
    const worldZ = (-gridZ + this.offset - 0.5) * this.cellSize;
    return { x: worldX, z: worldZ }; // new THREE.Vector3(worldX, this.baseHeight, worldZ);
  }

  // Convert world coordinates to grid coordinates
  worldToGrid(worldX: number, worldZ: number): { x: number; z: number } {
    // Convert from world coordinates to grid coordinates
    const gridX = Math.floor(worldX + this.offset);
    const gridZ = Math.floor(-worldZ + this.offset);
    return { x: gridX, z: gridZ };
  }

  // Place an object at a specific grid position
  placeObject(
    object: THREE.Object3D | Cannon.Body,
    gridX: number,
    gridZ: number
  ) {
    const worldPos = this.gridToWorld(gridX, gridZ);
    object.position.x = worldPos.x;
    object.position.z = worldPos.z;
  }

  // The Y position for object on ground
  getObjectInitYPos(objheight: number): number {
    return this.baseHeight + objheight / 2;
  }

  // Get random grid position
  getRandomGridPosition(): { x: number; z: number } {
    return {
      x: Math.floor(Math.random() * this.gridSize),
      z: Math.floor(Math.random() * this.gridSize),
    };
  }

  getRandomHeight(max: number, min: number = this.baseHeight): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Check if grid position is within bounds
  isValidGridPosition(gridX: number, gridZ: number): boolean {
    return (
      gridX >= 0 && gridX < this.gridSize && gridZ >= 0 && gridZ < this.gridSize
    );
  }

  // Get the size of the grid
  getGridSize(): number {
    return this.gridSize;
  }

  // Get the center point of a specific grid cell
  getCellCenter(gridX: number, gridZ: number): { x: number; z: number } {
    return this.gridToWorld(gridX, gridZ);
  }

  // Set the base height for all objects
  setBaseHeight(height: number) {
    this.baseHeight = height;
  }

  // Get the current base height
  getBaseHeight(): number {
    return this.baseHeight;
  }

  getGridCenter(): { x: number; z: number } {
    return { x: this.offset, z: this.offset };
  }
}

// // Example usage:
// function initializeGame() {
//   const gridSystem = new GridSystem(15); // 15x15 grid

//   // Modified createPowerup to use grid coordinates
//   function createPowerup(gridX: number, gridZ: number): THREE.Mesh {
//     const powerup = new THREE.Mesh(
//       new THREE.TorusGeometry(1, 0.4, 16, 50),
//       new THREE.MeshBasicMaterial({ color: 0xffff00 })
//     );

//     powerup.scale.setScalar(0.1);
//     gridSystem.placeObject(powerup, gridX, gridZ, 0);

//     return powerup;
//   }

//   // Modified createPowerups to use grid system
//   function createPowerups(): THREE.Mesh[] {
//     const powerups = [];
//     for (let i = 0; i < 10; i++) {
//       const randomPos = gridSystem.getRandomGridPosition();
//       const powerup = createPowerup(randomPos.x, randomPos.z);
//       powerup.name = 'powerup' + (i + 1);
//       powerups.push(powerup);
//     }
//     return powerups;
//   }

//   // Example of placing the frog at a specific grid position
//   const frogger = createFrog();
//   gridSystem.placeObject(frogger, 7, 7, -0.25); // Place frog in middle-ish of grid
// }
