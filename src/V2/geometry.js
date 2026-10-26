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
  const { size = 1, color = [0.34, 0.8, 0.1, 1.0] } = options;
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
  const colorArray = [];
  const indexArray = [];
  const uvArray = [];

  faces.forEach((face, faceIndex) => {
    const [a, b, c, d] = face;
    [a, b, c, a, c, d].forEach((vertexIndex, i) => {
      vertexArray.push(...vertices[vertexIndex]);
      normalArray.push(...normals[faceIndex]);
      colorArray.push(...color);
      uvArray.push(...triUvs[i]);
    });
  });

  for (let i = 0; i < 36; i++) {
    indexArray.push(i);
  }

  return {
    vertices: new Float32Array(vertexArray),
    normals: new Float32Array(normalArray),
    colors: new Float32Array(colorArray),
    uvs: new Float32Array(uvArray),
    indices: new Uint16Array(indexArray),
    numIndices: indexArray.length,
  };
}

function createSphereGeometry(options = {}) {
  const {
    radius = 1,
    latitudeBands = 30,
    longitudeBands = 30,
    color = [0.34, 0.8, 0.1, 1.0],
  } = options;

  const vertexArray = [];
  const normalArray = [];
  const colorArray = [];
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
      colorArray.push(...color);
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
    colors: new Float32Array(colorArray),
    uvs: new Float32Array(uvArray),
    indices: new Uint16Array(indexArray),
    numIndices: indexArray.length,
  };
}

/*

export let points = [];
export let colors = [];
export let normals = [];

const cubeNormals = [
  // Front face
  0.0, 0.0, 1.0,
  // Back face
  0.0, 0.0, -1.0,
  // Top face
  0.0, 1.0, 0.0,
  // Bottom face
  0.0, -1.0, 0.0,
  // Right face
  1.0, 0.0, 0.0,
  // Left face
  -1.0, 0.0, 0.0,
];

export function createCubeGeometry() {
  const vertices = [
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5],
  ];

  // const vertexColors = Array(8).fill([0.34, 0.8, 0.1, 1.0]);

  const vertexColors = [
    // green with tiny variations
    [0.0, 0.8, 0.0, 1.0],
    [0.3, 0.7, 0.1, 1.0],
    [0.2, 0.6, 0.2, 1.0],
    [0.0, 0.8, 0.0, 1.0],
    [0.1, 0.5, 0.3, 1.0],
    [0.3, 0.7, 0.1, 1.0],
    [0.2, 0.6, 0.2, 1.0],
    [0.1, 0.5, 0.3, 1.0],
  ];

  const faces = [
    [1, 0, 3, 2],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [6, 5, 1, 2],
    [4, 5, 6, 7],
    [5, 4, 0, 1],
  ];

  faces.forEach((face, faceIndex) => {
    const [a, b, c, d] = face;
    const indices = [a, b, c, a, c, d];
    indices.forEach((i) => {
      points.push(vertices[i]);
      colors.push(vertexColors[a]);

      normals.push(
        ...cubeNormals.slice(faceIndex * 3, faceIndex * 3 + 3),
        ...cubeNormals.slice(faceIndex * 3, faceIndex * 3 + 3),
        ...cubeNormals.slice(faceIndex * 3, faceIndex * 3 + 3)
      );
    });
  });

  console.log('Number of vertices:', points.length);
  console.log('Number of colors:', colors.length);
  console.log('Number of normals:', cubeNormals.length / 3);
}

function createSphere(radius = 1, latitudeBands = 30, longitudeBands = 30) {
  const vertices = [];
  const normals = [];
  const indices = [];
  const texCoords = [];

  // Generate vertices, normals, and texture coordinates
  for (let lat = 0; lat <= latitudeBands; lat++) {
    // Calculate the angle for this latitude (0 to π)

    const theta = (lat * Math.PI) / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let long = 0; long <= longitudeBands; long++) {
      // Calculate the angle for this longitude (0 to 2π)
      const phi = (long * 2 * Math.PI) / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Calculate the x, y, z coordinates of the vertex
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      // Calculate texture coordinates
      const u = 1 - long / longitudeBands;
      const v = 1 - lat / latitudeBands;

      // Add the vertex position (scaled by radius)
      vertices.push(radius * x, radius * y, radius * z);
      // Add the normal (same as position for a unit sphere, normalized)
      normals.push(x, y, z);
      // Add the texture coordinate
      texCoords.push(u, v);
    }
  }

  // Generate indices for triangles
  for (let lat = 0; lat < latitudeBands; lat++) {
    for (let long = 0; long < longitudeBands; long++) {
      // Calculate the indices of the four vertices that form a quad

      const first = lat * (longitudeBands + 1) + long;
      const second = first + longitudeBands + 1;

      // Create two triangles for each quad
      indices.push(first, second, first + 1); // Triangle 1
      indices.push(second, second + 1, first + 1); // Triangle 2
    }
  }

  // Return the generated geometry data as typed arrays
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    texCoords: new Float32Array(texCoords),
  };
}
*/
