// types.ts
// import * as THREE from 'three';

// export type FrogType = THREE.Object3D & {
//   isJumping: () => boolean;
//   startJump: () => void;
//   setJumpTarget: (x: number, z: number) => void;
//   update: (deltaTime: number) => void;
//   handleCollision: (type: CollisionType) => void;
//   handleMovement(direction: 'up' | 'down' | 'left' | 'right'): boolean;
//   collisionType: CollisionType;
// };

export type LaneConfig = {
  z: number;
  direction: 'left' | 'right';
  speed: number;
};

export type GameConfig = {
  moveUnit?: number; // Optional with defaults in implementation
  boundary?: number;
  initialLives?: number;
  initialTime?: number;
};

export type CameraType = 'wide' | 'frog';

export type CollisionType = string; // 'death' | 'ride-on' | 'score' | 'powerup';

export * from './three-types';

// {
//   type: 'death' | 'ride-on' | 'score' | 'powerup';
//   points?: number;
//   sound?: string;
//   visualEffect?: string;
//   duration?: number;
// };

// export type GameObject = THREE.Object3D & {
//   addToScene?: (scene: THREE.Scene) => void;
//   removeFromScene?: (scene: THREE.Scene) => void;
// };

// export type SceneObject = GameObject & {
//   addToScene: (scene: Scene) => void;
//   removeFromScene: (scene: Scene) => void;
// }

// export interface IMovable {
//   obj: THREE.Object3D;
//   update?: (deltaTime: number) => void;
//   reset?: () => void;
// }

// export interface IRidable extends ICollidable {
//   onRide: (passenger: THREE.Object3D) => void;
// }

// export interface Collidable {
//   mesh: THREE.Object3D;
//   onCollision?: () => void;
// }

// export interface ICollidable {
//   collisionType: string;
//   obj?: THREE.Object3D;
//   velocity?: THREE.Vector3;
//   onCollision?: (type: CollisionType, gameState: GameState) => CollisionType;
// }

// export interface IFrog extends THREE.Object3D {
//   isJumping(): boolean;
//   setJumpTarget(x: number, z: number): void;
//   startJump(): void;
//   update(deltaTime: number): void;
// }

// export type Frog = {
//   position: { x: number; z: number };
//   isJumping: () => boolean;
//   setJumpTarget: (x: number, z: number) => void;
//   startJump: () => void;
//   rotation: { y: number };
// } & IFrog;

// export type Direction = 'up' | 'down' | 'left' | 'right';
// export type GridPosition = Readonly<{ x: number; z: number }>;

// export interface GameEvents {
//   move: (direction: Direction) => void;
//   jump: (from: GridPosition, to: GridPosition) => void;
//   death: (cause: 'water' | 'car') => void;
//   positionUpdate: (position: GridPosition) => void;
// }

// export interface IGameState {
//   readonly score: number;
//   readonly time: number;
//   readonly lives: number;
//   readonly currentCam: 'wide' | 'frog';
//   readonly isGameOver: boolean;
//   readonly isOnLog: boolean;
//   readonly currentLogMovement: THREE.Vector3;

//   updateScore(delta: number): void;
//   updateTime(delta: number): void;
//   updateLives(delta: number): void;
//   toggleCamera(): 'wide' | 'frog';
//   gameOver(): void;
//   reset(): void;
// }
