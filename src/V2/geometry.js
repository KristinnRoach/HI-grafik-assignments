// geometry.js

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

// const randomAlpha = () => Math.random().toFixed(3) + 0.01;

// const randomRGBA = () => [
//   // create a more controlled semi-random color function
//   Math.random(),
//   Math.random(),
//   Math.random(),
//   randomAlpha(),
// ];

// const vertexColors = [
//   [0.0, 0.0, 0.0, randomAlpha()],
//   [1.0, 0.0, 0.0, randomAlpha()],
//   [1.0, 1.0, 0.0, randomAlpha()],
//   [0.0, 1.0, 0.0, randomAlpha()],
//   [0.0, 0.0, 1.0, randomAlpha()],
//   [1.0, 0.0, 1.0, randomAlpha()],
//   [0.0, 1.0, 1.0, randomAlpha()],
//   [1.0, 1.0, 1.0, randomAlpha()],
// ];

// const vertexColors = [
//   // ALL RED FOR TESTING
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
//   [0.7, 0.0, 0.0, 0.95],
// ];

// const vertexColors = [
//   [0.0, 0.0, 0.0, randomAlpha()],
//   [1.0, 0.0, 0.0, randomAlpha()],
//   [1.0, 1.0, 0.0, randomAlpha()],
//   [0.0, 1.0, 0.0, randomAlpha()],
//   [0.0, 0.0, 1.0, randomAlpha()],
//   [1.0, 0.0, 1.0, randomAlpha()],
//   [0.0, 1.0, 1.0, randomAlpha()],
//   [1.0, 1.0, 1.0, randomAlpha()],
// ];

// const vertexColors = [
//   [0.5, 0.5, 0.5, 1.0], // Gray
//   [0.6, 0.8, 1.0, 1.0], // Pastel Blue
//   [0.8, 0.2, 0.2, 1.0], // Matte Red
//   [1.0, 0.9, 0.7, 1.0], // Pale Yellow
//   [0.133, 0.545, 0.133, 1.0], // Forest Green
//   [0.5, 0.5, 0.5, 1.0], // Gray again for the sixth face
//   [0.6, 0.8, 1.0, 1.0], // Pastel Blue
//   [0.8, 0.2, 0.2, 1.0], // Matte Red
// ];
