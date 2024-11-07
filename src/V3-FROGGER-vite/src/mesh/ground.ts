import * as THREE from 'three';
import { gridSystem } from '../scene';

export const GROUND_X = 15;
export const GROUND_Y = 1;
export const GROUND_Z = 15;

const GRID_SIZE = gridSystem.getGridSize();

export function createGround(): THREE.Group {
  const textureLoader = new THREE.TextureLoader();

  // Base path matching your Vite config
  const basePath = '/hi-grafik-assignments/src/v3-frogger-vite';

  // Load all textures
  const diffuseMap = textureLoader.load(
    `${basePath}/tex/snow1/snow_02_diff_4k.jpg`,
    undefined,
    undefined,
    (error) => console.error('Error loading diffuse map:', error)
  );

  const roughnessMap = textureLoader.load(
    `${basePath}/tex/snow1/snow_02_rough_4k.jpg`,
    undefined,
    undefined,
    (error) => console.error('Error loading roughness map:', error)
  );

  const normalMap = textureLoader.load(
    `${basePath}/tex/snow1/snow_02_nor_gl_4k.jpg`,
    undefined,
    undefined,
    (error) => console.error('Error loading normal map:', error)
  );

  // Configure texture settings
  [diffuseMap, roughnessMap, normalMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
  });

  const ground = new THREE.Group();
  const groundMesh = new THREE.Mesh(
    new THREE.BoxGeometry(GROUND_X, GROUND_Y, GROUND_Z),
    new THREE.MeshStandardMaterial({
      // color: 0xcccccc, // Temporary color to see if mesh is visible
      map: diffuseMap,
      roughnessMap: roughnessMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1, 1),
    })
  );

  // create street
  const street = new THREE.Mesh(
    new THREE.BoxGeometry(GROUND_X, 0.1, 2.5),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
    })
  );
  street.position.y = 0.5;

  gridSystem.placeObject(street, Math.floor(GRID_SIZE / 2), 2);

  ground.receiveShadow = true;
  street.receiveShadow = true;

  ground.add(groundMesh);
  ground.add(street);
  return ground;
}

/*
import * as THREE from 'three';

export const GROUND_X = 15;
export const GROUND_Y = 1;
export const GROUND_Z = 15;

export function createGround(): THREE.Mesh {
  const textureLoader = new THREE.TextureLoader();

  // Load all textures
  const diffuseMap = textureLoader.load('public/tex/snow1/snow_02_diff_4k.jpg');
  const roughnessMap = textureLoader.load(
    'public/tex/snow1/snow_02_rough_4k.jpg'
  );
  const normalMap = textureLoader.load(
    'public/tex/snow1/snow_02_nor_gl_4k.jpg'
  ); // Use JPG/PNG version

  // Optional: Configure texture settings
  [diffuseMap, roughnessMap, normalMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Adjust tiling as needed
  });

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(GROUND_X, GROUND_Y, GROUND_Z),
    new THREE.MeshStandardMaterial({
      map: diffuseMap, // Color texture
      roughnessMap: roughnessMap, // Roughness
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1, 1),
    })
  );

  ground.receiveShadow = true;

  return ground;
}

// old color: 0x223311,

/* BELOW IS FOR TESTING - THROW AWAY LATER */
/*
// Optional: Function to create a procedural normal map if you don't want to use an image
export function createProceduralNormalMap(): THREE.Texture {
  const width = 512;
  const height = 512;

  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const stride = (i * width + j) * 4;

      // Create a simple bump pattern
      // Normal maps use RGB to encode XYZ normal direction
      // R = X direction (128 + offset is neutral)
      // G = Y direction (128 + offset is neutral)
      // B = Z direction (255 for full bump)
      // A = Alpha (255 for full opacity)

      const x = Math.sin(j * 0.1) * 20 + 128;
      const y = Math.cos(i * 0.1) * 20 + 128;
      const z = 255;

      data[stride] = x; // Red
      data[stride + 1] = y; // Green
      data[stride + 2] = z; // Blue
      data[stride + 3] = 255; // Alpha
    }
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;

  // Optional: Make the texture repeat
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);

  return texture;
}

// Usage example with procedural normal map:
export function createGroundWithProceduralNormal(): THREE.Mesh {
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(GROUND_X, GROUND_Y, GROUND_Z),
    new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2,
      normalMap: createProceduralNormalMap(),
      normalScale: new THREE.Vector2(1, 1),
    })
  );

  ground.receiveShadow = true;
  return ground;
}
*/
/*
  // Remove 'public/' from the paths // why?
  const diffuseMap = textureLoader.load('/tex/snow1/snow_02_diff_4k.jpg');
  const roughnessMap = textureLoader.load('/tex/snow1/snow_02_rough_4k.jpg');
  const normalMap = textureLoader.load('/tex/snow1/snow_02_nor_gl_4k.jpg');

  // Add error handling to check if textures are loading
  textureLoader.load(
    '/tex/snow1/snow_02_diff_4k.jpg',
    (texture) => {
      console.log('Texture loaded successfully');
    },
    undefined,
    (error) => {
      console.error('Error loading texture:', error);
    }
  );
  */
