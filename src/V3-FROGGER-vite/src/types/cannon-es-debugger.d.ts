declare module 'cannon-es-debugger' {
  import * as THREE from 'three';
  import * as CANNON from 'cannon-es';

  type DebugOptions = {
    color?: string | number | Color;
    scale?: number;
    onInit?: (body: Body, mesh: Mesh, shape: Shape) => void;
    onUpdate?: (body: Body, mesh: Mesh, shape: Shape) => void;
  };

  export default class CannonDebugger {
    constructor(
      scene: THREE.Scene,
      world: CANNON.World,
      options?: DebugOptions
    ): void;

    update(): void;
  }
}
