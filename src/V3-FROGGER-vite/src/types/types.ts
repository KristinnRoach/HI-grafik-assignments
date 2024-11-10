// types.ts

export type LaneConfig = {
  z: number;
  direction: 'left' | 'right';
  speed: number;
};

export type CameraType = 'wide' | 'frog';

export type CollisionType = string; // 'death' | 'ride-on' | 'score' | 'powerup';

export * from './three-types';
