// geometry.js

export function createGeometry(shape = 'cube', options = {}) {
  switch (shape.toLowerCase()) {
    case 'sphere':
      return createSphereGeometry(options);
    case 'cube':
    default:
      return createCubeGeometry(options);
  }
}

function createCubeGeometry(options = {}) {
  const { size = 1 } = options;
  const halfSize = size / 2;

  const vertices = [
    [-halfSize, -halfSize, halfSize],
    [-halfSize, halfSize, halfSize],
    [halfSize, halfSize, halfSize],
    [halfSize, -halfSize, halfSize],
    [-halfSize, -halfSize, -halfSize],
    [-halfSize, halfSize, -halfSize],
    [halfSize, halfSize, -halfSize],
    [halfSize, -halfSize, -halfSize],
  ];

  // Same order as faces below
  const normals = [
    [0, 0, 1], // Front
    [1, 0, 0], // Right
    [0, -1, 0], // Bottom
    [0, 1, 0], // Top
    [0, 0, -1], // Back
    [-1, 0, 0], // Left
  ];

  const faces = [
    [1, 0, 3, 2], // Front
    [2, 3, 7, 6], // Right
    [3, 0, 4, 7], // Bottom
    [6, 5, 1, 2], // Top
    [4, 5, 6, 7], // Back
    [5, 4, 0, 1], // Left
  ];

  // Quad corners a, b, c, d -> top-left, bottom-left, bottom-right, top-right
  const uvs = { a: [0, 1], b: [0, 0], c: [1, 0], d: [1, 1] };
  const triUvs = [uvs.a, uvs.b, uvs.c, uvs.a, uvs.c, uvs.d];

  const vertexArray = [];
  const normalArray = [];
  const indexArray = [];
  const uvArray = [];

  faces.forEach((face, faceIndex) => {
    const [a, b, c, d] = face;
    [a, b, c, a, c, d].forEach((vertexIndex, i) => {
      vertexArray.push(...vertices[vertexIndex]);
      normalArray.push(...normals[faceIndex]);
      uvArray.push(...triUvs[i]);
    });
  });

  for (let i = 0; i < 36; i++) {
    indexArray.push(i);
  }

  return {
    vertices: new Float32Array(vertexArray),
    normals: new Float32Array(normalArray),
    uvs: new Float32Array(uvArray),
    indices: new Uint16Array(indexArray),
    numIndices: indexArray.length,
  };
}

function createSphereGeometry(options = {}) {
  const {
    radius = (options.size ?? 1) / 2, // same diameter as the cube's edge
    latitudeBands = 30,
    longitudeBands = 30,
  } = options;

  const vertexArray = [];
  const normalArray = [];
  const indexArray = [];
  const uvArray = [];

  for (let lat = 0; lat <= latitudeBands; lat++) {
    const theta = (lat * Math.PI) / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let long = 0; long <= longitudeBands; long++) {
      const phi = (long * 2 * Math.PI) / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      vertexArray.push(radius * x, radius * y, radius * z);
      normalArray.push(x, y, z);
      uvArray.push(1 - long / longitudeBands, 1 - lat / latitudeBands);
    }
  }

  for (let lat = 0; lat < latitudeBands; lat++) {
    for (let long = 0; long < longitudeBands; long++) {
      const first = lat * (longitudeBands + 1) + long;
      const second = first + longitudeBands + 1;
      indexArray.push(first, first + 1, second, second, first + 1, second + 1);
    }
  }

  return {
    vertices: new Float32Array(vertexArray),
    normals: new Float32Array(normalArray),
    uvs: new Float32Array(uvArray),
    indices: new Uint16Array(indexArray),
    numIndices: indexArray.length,
  };
}
